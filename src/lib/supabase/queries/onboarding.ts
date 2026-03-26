// src/lib/supabase/queries/onboarding.ts
// Toutes les requêtes Prisma pour le module onboarding

import { prisma } from '@/lib/prisma'
import type { SensitivityScores } from '@/lib/onboarding/scoring'

// ============================================================
// SESSION D'ONBOARDING
// ============================================================

export async function getActiveSession(userId: string) {
  return prisma.onboardingSession.findFirst({
    where: {
      userId,
      status: { in: ['started', 'in_progress'] },
    },
    include: {
      answers: true,
    },
    orderBy: { startedAt: 'desc' },
  })
}

export async function createSession(userId: string) {
  // Garantir que le user existe dans Prisma (le trigger Supabase peut être en retard)
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  })

  await prisma.onboardingSession.updateMany({
    where: { userId, status: { in: ['started', 'in_progress'] } },
    data: { status: 'abandoned' },
  })

  return prisma.onboardingSession.create({
    data: { userId, status: 'started', currentBloc: 1 },
  })
}

export async function updateSessionBloc(sessionId: string, bloc: number) {
  return prisma.onboardingSession.update({
    where: { id: sessionId },
    data: {
      currentBloc: bloc,
      status: 'in_progress',
    },
  })
}

export async function completeSession(sessionId: string, snapshot: object) {
  return prisma.onboardingSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      generatedProfileSnapshot: snapshot,
    },
  })
}

// ============================================================
// RÉPONSES
// ============================================================

export async function saveAnswer(params: {
  sessionId: string
  userId: string
  blocNumber: number
  questionKey: string
  questionType: string
  answerText?: string | null
  answerChoice?: string | null
  answerChoices?: string[]
  answerScale?: number | null
}) {
  return prisma.onboardingAnswer.upsert({
    where: {
      sessionId_questionKey: {
        sessionId: params.sessionId,
        questionKey: params.questionKey,
      },
    },
    create: {
      sessionId: params.sessionId,
      userId: params.userId,
      blocNumber: params.blocNumber,
      questionKey: params.questionKey,
      questionType: params.questionType as any,
      answerText: params.answerText,
      answerChoice: params.answerChoice,
      answerChoices: params.answerChoices ?? [],
      answerScale: params.answerScale,
    },
    update: {
      answerText: params.answerText,
      answerChoice: params.answerChoice,
      answerChoices: params.answerChoices ?? [],
      answerScale: params.answerScale,
    },
  })
}

export async function getSessionAnswers(sessionId: string) {
  return prisma.onboardingAnswer.findMany({
    where: { sessionId },
    orderBy: [{ blocNumber: 'asc' }, { createdAt: 'asc' }],
  })
}

// ============================================================
// PROFIL DE SENSIBILITÉ
// ============================================================

export async function upsertSensitivityProfile(
  userId: string,
  sessionId: string,
  scores: SensitivityScores,
  keywords: string[],
  symbolicAffinities: string[],
  summary: string,
) {
  return prisma.userSensitivityProfile.upsert({
    where: { userId },
    create: {
      userId,
      sessionId,
      needForStructure: scores.need_for_structure,
      needForMeaning: scores.need_for_meaning,
      spiritualAffinity: scores.spiritual_affinity,
      symbolicAffinity: scores.symbolic_affinity,
      rationalAffinity: scores.rational_affinity,
      communityDesire: scores.community_desire,
      confrontationPref: scores.confrontation_preference,
      softnessPref: scores.softness_preference,
      commitmentLevel: scores.commitment_level,
      emotionalStability: scores.emotional_stability,
      creationDesire: scores.creation_desire,
      extractedKeywords: keywords,
      symbolicAffinities,
      generatedSummary: summary,
    },
    update: {
      sessionId,
      needForStructure: scores.need_for_structure,
      needForMeaning: scores.need_for_meaning,
      spiritualAffinity: scores.spiritual_affinity,
      symbolicAffinity: scores.symbolic_affinity,
      rationalAffinity: scores.rational_affinity,
      communityDesire: scores.community_desire,
      confrontationPref: scores.confrontation_preference,
      softnessPref: scores.softness_preference,
      commitmentLevel: scores.commitment_level,
      emotionalStability: scores.emotional_stability,
      creationDesire: scores.creation_desire,
      extractedKeywords: keywords,
      symbolicAffinities,
      generatedSummary: summary,
      updatedAt: new Date(),
    },
  })
}

// ============================================================
// CRÉATION DE LA VOIE + CIRCLE
// ============================================================

export async function createPathWithCircle(params: {
  founderUserId: string
  canonicalType: string
  customTypeLabel?: string
  name: string
  slug: string
  shortDescription: string
  language: string
  manifestoText: string
  principles: string[]
}) {
  return prisma.$transaction(async (tx) => {
    // Créer la Voie
    const path = await tx.path.create({
      data: {
        founderUserId: params.founderUserId,
        canonicalType: params.canonicalType as any,
        customTypeLabel: params.customTypeLabel,
        name: params.name,
        slug: params.slug,
        shortDescription: params.shortDescription,
        language: params.language as any,
        status: 'active',
        visibility: 'private', // privée par défaut à la création
        admissionMode: 'open',
        currentVersion: 1,
      },
    })

    // Créer la version initiale de la Voie
    await tx.pathVersion.create({
      data: {
        pathId: path.id,
        versionNumber: 1,
        manifestoText: params.manifestoText,
        principles: params.principles,
        evolutionNotes: 'Version initiale — créée lors de l\'onboarding',
        createdByUserId: params.founderUserId,
      },
    })

    // Créer le Cercle associé
    const circle = await tx.circle.create({
      data: {
        pathId: path.id,
        founderUserId: params.founderUserId,
        memberCount: 1,
      },
    })

    // Ajouter le fondateur comme membre du cercle
    await tx.circleMembership.create({
      data: {
        circleId: circle.id,
        userId: params.founderUserId,
        role: 'founder',
        status: 'active',
      },
    })

    // Progression voie initiale
    await tx.userPathProgress.create({
      data: {
        userId: params.founderUserId,
        pathId: path.id,
        rankXp: 0,
        joinedAt: new Date(),
      },
    })

    return { path, circle }
  })
}

// Génère un slug unique depuis le nom de la voie
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

  let slug = base
  let attempt = 0

  while (true) {
    const existing = await prisma.path.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

// ============================================================
// CRÉATION DU GUIDE
// ============================================================

export async function createGuide(params: {
  ownerUserId: string
  pathId: string
  name: string
  memberName?: string
  tone: string
  addressMode: string
  firmnessLevel: number
  warmthLevel: number
  personalityPrompt: string
}) {
  return prisma.$transaction(async (tx) => {
    const guide = await tx.guide.create({
      data: {
        ownerUserId: params.ownerUserId,
        pathId: params.pathId,
        canonicalType: 'guide',
        name: params.name,
        memberName: params.memberName,
        tone: params.tone as any,
        addressMode: params.addressMode as any,
        firmnessLevel: params.firmnessLevel,
        warmthLevel: params.warmthLevel,
        personalityPrompt: params.personalityPrompt,
        currentVersion: 1,
      },
    })

    // Version initiale du guide
    await tx.guideVersion.create({
      data: {
        guideId: guide.id,
        versionNumber: 1,
        tone: params.tone as any,
        firmnessLevel: params.firmnessLevel,
        warmthLevel: params.warmthLevel,
        personalityPrompt: params.personalityPrompt,
        changeSummary: 'Version initiale — créée lors de l\'onboarding',
      },
    })

    return guide
  })
}

// ============================================================
// CRÉATION DU MANIFESTE ET DES PRINCIPES
// ============================================================

export async function createManifestoAndPrinciples(params: {
  pathId: string
  userId: string
  manifestoText: string
  principles: string[]
}) {
  return prisma.$transaction(async (tx) => {
    const manifesto = await tx.manifesto.create({
      data: {
        pathId: params.pathId,
        userId: params.userId,
        content: params.manifestoText,
        versionNumber: 1,
        isCurrent: true,
      },
    })

    const principleRecords = await Promise.all(
      params.principles.map((content, idx) =>
        tx.principle.create({
          data: {
            pathId: params.pathId,
            userId: params.userId,
            content,
            orderIndex: idx,
            isActive: true,
          },
        }),
      ),
    )

    return { manifesto, principles: principleRecords }
  })
}

// ============================================================
// CRÉATION DU CODEX INITIAL
// ============================================================

export async function createInitialCodex(params: {
  userId: string
  pathId: string
  codexContent: string
  manifestoText: string
  principles: string[]
}) {
  return prisma.$transaction(async (tx) => {
    // Codex personnel
    const codex = await tx.codex.create({
      data: {
        codexType: 'personal',
        ownerUserId: params.userId,
        title: 'Mon Codex',
        status: 'published',
        currentVersion: 1,
        isExportable: true,
      },
    })

    // Version initiale du Codex
    await tx.codexVersion.create({
      data: {
        codexId: codex.id,
        versionNumber: 1,
        title: 'Version initiale',
        summary: 'Codex créé lors de l\'onboarding',
        content: {
          raw_markdown: params.codexContent,
          sections: [
            { title: 'Ma Voie', order: 0 },
            { title: 'Manifeste', order: 1 },
            { title: 'Mes Principes', order: 2 },
            { title: 'Mon Engagement', order: 3 },
          ],
        },
        createdByType: 'system',
        createdByUserId: params.userId,
      },
    })

    return codex
  })
}

// ============================================================
// FINALISATION ONBOARDING
// ============================================================

export async function finalizeOnboarding(userId: string) {
  return prisma.$transaction(async (tx) => {
    // Marquer le profil comme onboarding complété (upsert = sécurisé si pas encore créé)
    await tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        username: userId.slice(0, 20),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      update: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Activer le compte (était pending par défaut)
    await tx.user.update({
      where: { id: userId },
      data: { accountStatus: 'active' },
    })

    // Créer la progression membre initiale si elle n'existe pas
    await tx.userMemberProgress.upsert({
      where: { userId },
      create: { userId, currentXp: 0, streakDays: 0 },
      update: {},
    })
  })
}
