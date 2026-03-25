// src/lib/progression/service.ts
// Moteur de progression — XP, niveaux, rangs, badges
// C'est ici que tout converge après une complétion

import { prisma } from '@/lib/prisma'
import type { ProgressionUpdate, MemberLevel, PathRank, Badge } from '@/types/paths'

// ============================================================
// POINT D'ENTRÉE PRINCIPAL
// Appelé après chaque log de pratique ou d'épreuve
// ============================================================

export async function processProgressionUpdate(params: {
  userId: string
  pathId?: string
  xpEarned: number
}): Promise<ProgressionUpdate> {
  const { userId, pathId, xpEarned } = params

  const result: ProgressionUpdate = {
    xpEarned,
    newPlatformXp: 0,
    leveledUp: false,
    newLevel: null,
    rankedUp: false,
    newRank: null,
    badgesEarned: [],
  }

  // Mise à jour en transaction
  await prisma.$transaction(async (tx) => {
    // 1. Mise à jour XP plateforme
    const progress = await tx.userMemberProgress.upsert({
      where: { userId },
      create: { userId, currentXp: xpEarned },
      update: { currentXp: { increment: xpEarned }, updatedAt: new Date() },
      include: { currentLevel: true },
    })

    result.newPlatformXp = progress.currentXp

    // 2. Vérifier montée de niveau
    const nextLevel = await tx.memberLevel.findFirst({
      where: { requiredXp: { lte: progress.currentXp } },
      orderBy: { levelNumber: 'desc' },
    })

    if (nextLevel && (!progress.currentLevel || nextLevel.levelNumber > progress.currentLevel.levelNumber)) {
      await tx.userMemberProgress.update({
        where: { userId },
        data: { currentLevelId: nextLevel.id },
      })
      await tx.profile.update({
        where: { userId },
        data: { currentLevel: nextLevel.levelNumber, currentXp: progress.currentXp },
      })
      result.leveledUp = true
      result.newLevel = nextLevel as MemberLevel

      // Badge de niveau
      const levelBadge = await tx.badge.findUnique({
        where: { key: `level_${nextLevel.levelNumber}` },
      })
      if (levelBadge) {
        const existing = await tx.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: levelBadge.id } },
        })
        if (!existing) {
          await tx.userBadge.create({ data: { userId, badgeId: levelBadge.id } })
          result.badgesEarned.push(levelBadge as Badge)
        }
      }
    }

    // 3. Mise à jour progression de voie si applicable
    if (pathId) {
      const pathProgress = await tx.userPathProgress.upsert({
        where: { userId_pathId: { userId, pathId } },
        create: { userId, pathId, rankXp: xpEarned, lastProgressAt: new Date() },
        update: {
          rankXp: { increment: xpEarned },
          lastProgressAt: new Date(),
          updatedAt: new Date(),
        },
        include: { currentRank: true },
      })

      // 4. Vérifier montée de rang
      const nextRank = await tx.pathRank.findFirst({
        where: {
          pathId,
          requiredXp: { lte: pathProgress.rankXp },
        },
        orderBy: { rankOrder: 'desc' },
      })

      if (nextRank && (!pathProgress.currentRank || nextRank.rankOrder > pathProgress.currentRank.rankOrder)) {
        await tx.userPathProgress.update({
          where: { userId_pathId: { userId, pathId } },
          data: { currentRankId: nextRank.id },
        })
        result.rankedUp = true
        result.newRank = nextRank as PathRank

        // Badge de rang si défini
        if (nextRank.badgeUrl) {
          const rankBadge = await tx.badge.findFirst({
            where: { key: `rank_${nextRank.rankOrder}_${pathId.slice(0, 8)}` },
          })
          if (rankBadge) {
            const existing = await tx.userBadge.findUnique({
              where: { userId_badgeId: { userId, badgeId: rankBadge.id } },
            })
            if (!existing) {
              await tx.userBadge.create({ data: { userId, badgeId: rankBadge.id } })
              result.badgesEarned.push(rankBadge as Badge)
            }
          }
        }
      }
    }
  })

  return result
}

// ============================================================
// MISE À JOUR DU STREAK
// ============================================================

export async function updateStreak(userId: string): Promise<void> {
  const progress = await prisma.userMemberProgress.findUnique({
    where: { userId },
    select: { lastActivityAt: true, streakDays: true, longestStreak: true },
  })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!progress) {
    await prisma.userMemberProgress.upsert({
      where: { userId },
      create: { userId, streakDays: 1, lastActivityAt: now, totalDaysActive: 1 },
      update: {},
    })
    return
  }

  const lastActivity = progress.lastActivityAt
  if (!lastActivity) {
    await prisma.userMemberProgress.update({
      where: { userId },
      data: { streakDays: 1, lastActivityAt: now, totalDaysActive: { increment: 1 } },
    })
    return
  }

  const lastDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / 86400000)

  if (diffDays === 0) return // Déjà actif aujourd'hui
  if (diffDays === 1) {
    // Jour consécutif
    const newStreak = progress.streakDays + 1
    await prisma.userMemberProgress.update({
      where: { userId },
      data: {
        streakDays: newStreak,
        longestStreak: Math.max(newStreak, progress.longestStreak),
        lastActivityAt: now,
        totalDaysActive: { increment: 1 },
      },
    })
  } else {
    // Streak cassé
    await prisma.userMemberProgress.update({
      where: { userId },
      data: { streakDays: 1, lastActivityAt: now, totalDaysActive: { increment: 1 } },
    })
  }
}

// ============================================================
// CHECK BADGES AUTOMATIQUES (appelé périodiquement)
// ============================================================

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const earned: Badge[] = []

  const [progress, practiceCount, challengeCount, existingBadges] = await Promise.all([
    prisma.userMemberProgress.findUnique({ where: { userId } }),
    prisma.userPracticeLog.count({ where: { userId, status: 'completed' } }),
    prisma.userChallengeLog.count({ where: { userId, status: 'completed' } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ])

  const ownedBadgeIds = new Set(existingBadges.map((b: { badgeId: string }) => b.badgeId))

  // Règles de badge automatiques
  const checks: { key: string; condition: boolean }[] = [
    { key: 'practice_7',  condition: practiceCount >= 7 },
    { key: 'practice_30', condition: practiceCount >= 30 },
    { key: 'practice_100', condition: practiceCount >= 100 },
    { key: 'streak_7',   condition: (progress?.streakDays ?? 0) >= 7 },
    { key: 'streak_30',  condition: (progress?.streakDays ?? 0) >= 30 },
    { key: 'streak_100', condition: (progress?.streakDays ?? 0) >= 100 },
    { key: 'first_challenge', condition: challengeCount >= 1 },
    { key: 'challenge_10',    condition: challengeCount >= 10 },
  ]

  for (const check of checks) {
    if (!check.condition) continue

    const badge = await prisma.badge.findUnique({ where: { key: check.key } })
    if (!badge || ownedBadgeIds.has(badge.id)) continue

    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
    earned.push(badge as Badge)
  }

  return earned
}
