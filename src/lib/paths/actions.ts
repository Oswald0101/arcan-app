// src/lib/paths/actions.ts
// Server Actions pour pratiques, épreuves, membership

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  requestJoinPath,
  handleMembershipRequest,
  leavePath,
} from '@/lib/supabase/queries/paths'
import {
  hasDonePracticeToday,
  getActiveChallengeLog,
} from '@/lib/supabase/queries/progression'
import {
  processProgressionUpdate,
  updateStreak,
  checkAndAwardBadges,
} from '@/lib/progression/service'
import { validatePractice } from '@/lib/progression/validation'
import type { ProgressionUpdate } from '@/types/paths'
import { z } from 'zod'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// MEMBERSHIP
// ============================================================

export async function joinPathAction(pathId: string): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const result = await requestJoinPath(user.id, pathId)
    revalidatePath('/cercles')
    revalidatePath(`/cercles/${pathId}`)
    return { success: true, data: { status: result.membership.status } }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur lors de la demande' }
  }
}

export async function leavePathAction(pathId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await leavePath(user.id, pathId)
    revalidatePath('/cercles')
    revalidatePath(`/cercles/${pathId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur lors du départ' }
  }
}

export async function handleMembershipAction(params: {
  membershipId: string
  action: 'approve' | 'reject'
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    await handleMembershipRequest({
      membershipId: params.membershipId,
      founderUserId: user.id,
      action: params.action,
    })
    revalidatePath('/fondateur/adhesions')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Erreur' }
  }
}

// ============================================================
// PRATIQUES
// ============================================================

const CompletePracticeSchema = z.object({
  practiceId:    z.string().uuid(),
  pathId:        z.string().uuid().optional(),
  // Temps réellement passé sur la pratique (fourni par le client via timer)
  elapsedSeconds: z.number().int().min(0).default(0),
  // Réponse / retour personnel du membre
  responseText:  z.string().max(2000).optional().nullable(),
})

export type CompletePracticeInput = z.infer<typeof CompletePracticeSchema>

export async function completePracticeAction(
  input: CompletePracticeInput,
): Promise<ActionResult<ProgressionUpdate & { guideQuestion?: string; score: number; flags: string[] }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const parsed = CompletePracticeSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  const { practiceId, pathId, elapsedSeconds, responseText } = parsed.data

  // Vérifier que la pratique existe
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId, isActive: true },
  })
  if (!practice) return { success: false, error: 'Pratique introuvable' }

  // Vérifier que la pratique quotidienne n'a pas déjà été faite
  if (practice.frequency === 'daily') {
    const alreadyDone = await hasDonePracticeToday(user.id, practiceId)
    if (alreadyDone) {
      return { success: false, error: 'Tu as déjà complété cette pratique aujourd\'hui' }
    }
  }

  // ── Contexte anti-triche ───────────────────────────────────
  const now = new Date()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const startOfDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [recentCount2h, todayCount, memberProgress, previousLogs] = await Promise.all([
    // Combien de pratiques validées dans les 2 dernières heures
    prisma.practiceValidation.count({
      where: { userId: user.id, createdAt: { gte: twoHoursAgo } },
    }),
    // Combien de pratiques validées aujourd'hui
    prisma.practiceValidation.count({
      where: { userId: user.id, createdAt: { gte: startOfDay } },
    }),
    // Streak actuel
    prisma.userMemberProgress.findUnique({
      where: { userId: user.id },
      select: { streakDays: true },
    }),
    // 5 dernières réponses pour cette pratique (détection répétition)
    prisma.practiceValidation.findMany({
      where: { userId: user.id, practiceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { responseText: true },
    }),
  ])

  const previousResponses = previousLogs
    .map(l => l.responseText)
    .filter((r): r is string => r !== null && r !== undefined && r.length > 0)

  // ── Calcul du score ────────────────────────────────────────
  const validation = validatePractice(
    {
      practiceId,
      userId: user.id,
      elapsedSeconds,
      responseText: responseText ?? undefined,
      previousResponses,
      recentCount2h,
      todayCount,
      streakDays: memberProgress?.streakDays ?? 0,
    },
    {
      xpReward: practice.xpReward,
      validationType: practice.validationType,
      minDurationSeconds: practice.minDurationSeconds,
    },
  )

  // ── Enregistrer la trace de validation ────────────────────
  await prisma.practiceValidation.create({
    data: {
      userId:        user.id,
      practiceId,
      elapsedSeconds,
      responseText:  responseText ?? null,
      score:         validation.score,
      xpAwarded:     validation.xpAwarded,
      flags:         validation.flags,
    },
  })

  // ── Log de pratique (toujours enregistré, même XP = 0) ────
  await prisma.userPracticeLog.create({
    data: {
      userId: user.id,
      practiceId,
      status: 'completed',
      note: responseText ?? null,
      xpEarned: validation.xpAwarded,
    },
  })

  // Mise à jour practicesCompleted dans user_path_progress
  if (pathId) {
    await prisma.userPathProgress.upsert({
      where: { userId_pathId: { userId: user.id, pathId } },
      create: { userId: user.id, pathId, practicesCompleted: 1, rankXp: 0 },
      update: { practicesCompleted: { increment: 1 } },
    })
  }

  // Mettre à jour le total dans user_member_progress
  await prisma.userMemberProgress.upsert({
    where: { userId: user.id },
    create: { userId: user.id, totalPracticesCompleted: 1 },
    update: { totalPracticesCompleted: { increment: 1 } },
  })

  // Streak — mis à jour même si l'XP est nulle (présence réelle)
  await updateStreak(user.id)

  // XP — seulement si validation.xpAwarded > 0
  const progressUpdate = await processProgressionUpdate({
    userId: user.id,
    pathId,
    xpEarned: validation.xpAwarded,
  })

  const newBadges = await checkAndAwardBadges(user.id)
  progressUpdate.badgesEarned.push(...newBadges)

  revalidatePath('/accueil')
  revalidatePath('/progression')

  return {
    success: true,
    data: {
      ...progressUpdate,
      guideQuestion: validation.guideQuestion,
      score: validation.score,
      flags: validation.flags,
    },
  }
}

// ============================================================
// ÉPREUVES
// ============================================================

export async function startChallengeAction(params: {
  challengeId: string
  pathId?: string
}): Promise<ActionResult<{ logId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const challenge = await prisma.challenge.findUnique({
    where: { id: params.challengeId, isActive: true },
  })
  if (!challenge) return { success: false, error: 'Épreuve introuvable' }

  // Vérifier qu'il n'y a pas déjà une épreuve en cours
  const existing = await getActiveChallengeLog(user.id, params.challengeId)
  if (existing) {
    return { success: false, error: 'Tu as déjà cette épreuve en cours' }
  }

  const log = await prisma.userChallengeLog.create({
    data: {
      userId: user.id,
      challengeId: params.challengeId,
      status: 'in_progress',
    },
  })

  revalidatePath('/progression')
  return { success: true, data: { logId: log.id } }
}

export async function completeChallengeAction(params: {
  logId: string
  pathId?: string
  note?: string
}): Promise<ActionResult<ProgressionUpdate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const log = await prisma.userChallengeLog.findFirst({
    where: { id: params.logId, userId: user.id, status: 'in_progress' },
    include: { challenge: true },
  })

  if (!log) return { success: false, error: 'Épreuve introuvable ou déjà terminée' }

  // Compléter l'épreuve
  await prisma.userChallengeLog.update({
    where: { id: params.logId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      note: params.note ?? null,
      xpEarned: log.challenge.xpReward,
    },
  })

  // Mise à jour challengesCompleted
  if (params.pathId) {
    await prisma.userPathProgress.upsert({
      where: { userId_pathId: { userId: user.id, pathId: params.pathId } },
      create: { userId: user.id, pathId: params.pathId, challengesCompleted: 1, rankXp: 0 },
      update: { challengesCompleted: { increment: 1 } },
    })
  }

  await prisma.userMemberProgress.upsert({
    where: { userId: user.id },
    create: { userId: user.id, totalChallengesCompleted: 1 },
    update: { totalChallengesCompleted: { increment: 1 } },
  })

  await updateStreak(user.id)

  const progressUpdate = await processProgressionUpdate({
    userId: user.id,
    pathId: params.pathId,
    xpEarned: log.challenge.xpReward,
  })

  const newBadges = await checkAndAwardBadges(user.id)
  progressUpdate.badgesEarned.push(...newBadges)

  revalidatePath('/accueil')
  revalidatePath('/progression')

  return { success: true, data: progressUpdate }
}
