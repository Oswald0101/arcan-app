// src/lib/ai/context/index.ts
// Récupération du contexte complet avant chaque réponse du guide
// Une seule requête DB structurée, pas de N+1

import { prisma } from '@/lib/prisma'
import { loadActiveMemory } from '@/lib/ai/memory'
import { fetchRelevantKnowledge } from '@/lib/ai/knowledge'
import type { GuideContext } from '@/types/guide'

export async function buildGuideContext(
  userId: string,
  guideId: string,
  conversationId: string,
  historyLimit = 20,
): Promise<GuideContext> {
  // Extrait un snippet de la conversation pour le retrieval de knowledge
  // (les 2 derniers messages — 0 token IA, juste du texte)
  // On le fait avant le Promise.all car on en a besoin pour le fetch knowledge
  const recentSnippet = await prisma.guideMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 2,
    select: { content: true },
  }).then(msgs => msgs.map(m => m.content).join(' '))

  // Tout en parallèle — pas de waterfall
  const [guide, profile, path, sensitivity, memberProgress, recentMessages, memory] =
    await Promise.all([
      // Guide complet
      prisma.guide.findUnique({
        where: { id: guideId },
        select: {
          id: true,
          ownerUserId: true,
          pathId: true,
          canonicalType: true,
          customTypeLabel: true,
          name: true,
          memberName: true,
          tone: true,
          addressMode: true,
          firmnessLevel: true,
          warmthLevel: true,
          symbolicIdentity: true,
          avatarAssetUrl: true,
          personalityPrompt: true,
          memorySummary: true,
          currentVersion: true,
        },
      }),

      // Profil du membre
      prisma.profile.findUnique({
        where: { userId },
        select: {
          displayName: true,
          username: true,
          language: true,
          currentLevel: true,
          currentXp: true,
        },
      }),

      // Voie + manifeste + principes
      prisma.path.findFirst({
        where: { founderUserId: userId, status: 'active' },
        select: {
          id: true,
          name: true,
          canonicalType: true,
          customTypeLabel: true,
          manifestos: {
            where: { isCurrent: true },
            select: { content: true },
            take: 1,
          },
          principles: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
            select: { content: true },
            take: 10,
          },
        },
      }),

      // Profil de sensibilité
      prisma.userSensitivityProfile.findUnique({
        where: { userId },
        select: {
          needForStructure: true,
          needForMeaning: true,
          spiritualAffinity: true,
          symbolicAffinity: true,
          rationalAffinity: true,
          communityDesire: true,
          confrontationPref: true,
          softnessPref: true,
          commitmentLevel: true,
          emotionalStability: true,
          creationDesire: true,
        },
      }),

      // Progression membre
      prisma.userMemberProgress.findUnique({
        where: { userId },
        select: { currentXp: true, streakDays: true },
      }),

      // Historique récent de la conversation
      prisma.guideMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: historyLimit,
        select: { senderType: true, content: true, createdAt: true },
      }),

      // Mémoire personnelle active
      loadActiveMemory(userId, guideId),
    ])

  if (!guide) throw new Error(`Guide introuvable : ${guideId}`)

  // Mapper les données dans le format GuideContext
  const pathIdResolved = path?.id ?? null

  // Construire les sensitivityScores d'abord (nécessaire pour le retrieval)
  const sensitivityScoresEarly: Record<string, number> = {
    need_for_structure: Number(sensitivity?.needForStructure ?? 0.5),
    need_for_meaning: Number(sensitivity?.needForMeaning ?? 0.5),
    spiritual_affinity: Number(sensitivity?.spiritualAffinity ?? 0.5),
    symbolic_affinity: Number(sensitivity?.symbolicAffinity ?? 0.5),
    rational_affinity: Number(sensitivity?.rationalAffinity ?? 0.5),
    community_desire: Number(sensitivity?.communityDesire ?? 0.5),
    confrontation_preference: Number(sensitivity?.confrontationPref ?? 0.5),
    softness_preference: Number(sensitivity?.softnessPref ?? 0.5),
    commitment_level: Number(sensitivity?.commitmentLevel ?? 0.5),
    emotional_stability: Number(sensitivity?.emotionalStability ?? 0.5),
    creation_desire: Number(sensitivity?.creationDesire ?? 0.5),
  }

  // Retrieval de la base de connaissances (fire — résultat immédiat car en parallèle)
  const knowledgeEntries = await fetchRelevantKnowledge(
    pathIdResolved,
    sensitivityScoresEarly,
    recentSnippet,
  )

  const memberName =
    guide.memberName ||
    profile?.displayName ||
    profile?.username ||
    'toi'

  const pathName = path?.name ?? 'Ta Voie'
  const pathType = path?.customTypeLabel ?? path?.canonicalType ?? 'voie'
  const manifestoText = path?.manifestos?.[0]?.content ?? null
  const principles = path?.principles?.map((p: { content: string }) => p.content) ?? []

  const sensitivityScores = sensitivityScoresEarly

  // Mapper l'historique vers le format messages IA
  const messageHistory = recentMessages
    .filter((m: { senderType: string; content: string }) => m.senderType !== 'system')
    .map((m: { senderType: string; content: string }) => ({
      role: (m.senderType === 'member' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }))

  return {
    guide: guide as any,
    memberName,
    pathName,
    pathType,
    pathId: pathIdResolved,
    manifestoText,
    principles,
    sensitivityScores,
    platformLevel: profile?.currentLevel ?? 1,
    platformXp: profile?.currentXp ?? 0,
    streakDays: memberProgress?.streakDays ?? 0,
    activeMemoryItems: memory.map((m: any) => ({ ...m, importanceScore: Number(m.importanceScore) })),
    recentMessages: messageHistory,
    knowledgeEntries,
  }
}
