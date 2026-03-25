// src/lib/supabase/queries/accueil.ts
// Charge toutes les données du dashboard accueil en une passe parallèle

import { prisma } from '@/lib/prisma'

export async function getAccueilData(userId: string) {
  const [
    profile,
    memberProgress,
    guide,
    activePath,
    pathProgress,
    recentPractices,
    activeChallenges,
    recentBadges,
    billingSummary,
    pendingContactRequests,
  ] = await Promise.all([
    // Profil complet
    prisma.profile.findUnique({
      where: { userId },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        currentLevel: true,
        currentXp: true,
      },
    }),

    // Progression membre
    prisma.userMemberProgress.findUnique({
      where: { userId },
      include: { currentLevel: true },
    }),

    // Guide actif
    prisma.guide.findFirst({
      where: { ownerUserId: userId },
      select: { id: true, name: true, canonicalType: true, customTypeLabel: true },
    }),

    // Voie principale (fondée)
    prisma.path.findFirst({
      where: { founderUserId: userId, status: 'active' },
      select: { id: true, slug: true, name: true, memberCount: true },
    }),

    // Progression dans la voie
    prisma.userPathProgress.findFirst({
      where: { userId },
      include: { currentRank: true, path: { select: { name: true } } },
    }),

    // Pratiques récentes (7j)
    prisma.userPracticeLog.findMany({
      where: {
        userId,
        status: 'completed',
        loggedAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
      include: { practice: { select: { title: true } } },
      orderBy: { loggedAt: 'desc' },
      take: 5,
    }),

    // Épreuves en cours
    prisma.userChallengeLog.findMany({
      where: { userId, status: 'in_progress' },
      include: { challenge: { select: { title: true, difficulty: true, xpReward: true } } },
      take: 3,
    }),

    // Badges récents
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 3,
    }),

    // Plan actif
    prisma.userSubscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
      include: { plan: { select: { planKey: true, title: true } } },
    }),

    // Demandes de contact en attente
    prisma.contactRequest.count({
      where: { receiverUserId: userId, status: 'pending' },
    }),
  ])

  // Pratiques disponibles aujourd'hui non encore faites
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const doneTodayIds = new Set(
    (
      await prisma.userPracticeLog.findMany({
        where: { userId, status: 'completed', loggedAt: { gte: todayStart } },
        select: { practiceId: true },
      })
    ).map((l: any) => l.practiceId),
  )

  const todayPractices = await prisma.practice.findMany({
    where: {
      isActive: true,
      frequency: 'daily',
      OR: [
        { pathId: activePath?.id ?? 'none' },
        { pathId: null },
      ],
    },
    take: 4,
  })

  return {
    profile,
    memberProgress,
    guide,
    activePath,
    pathProgress,
    recentPractices,
    activeChallenges,
    recentBadges,
    planKey: billingSummary?.plan?.planKey ?? 'free',
    pendingContactRequests,
    todayPractices: todayPractices.map((p: any) => ({
      ...p,
      doneToday: doneTodayIds.has(p.id),
    })),
    streakDays: memberProgress?.streakDays ?? 0,
  }
}
