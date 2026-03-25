// src/lib/supabase/queries/progression.ts
// Requêtes Prisma pour progression, pratiques, épreuves, badges

import { prisma } from '@/lib/prisma'

// ============================================================
// NIVEAUX MEMBRE
// ============================================================

export async function getMemberLevels() {
  return prisma.memberLevel.findMany({
    orderBy: { levelNumber: 'asc' },
  })
}

export async function getUserMemberProgress(userId: string) {
  return prisma.userMemberProgress.findUnique({
    where: { userId },
    include: { currentLevel: true },
  })
}

// ============================================================
// RANGS DE VOIE
// ============================================================

export async function getPathRanks(pathId: string) {
  return prisma.pathRank.findMany({
    where: { pathId },
    orderBy: { rankOrder: 'asc' },
  })
}

export async function getUserPathProgress(userId: string, pathId: string) {
  return prisma.userPathProgress.findUnique({
    where: { userId_pathId: { userId, pathId } },
    include: { currentRank: true },
  })
}

// ============================================================
// PRATIQUES
// ============================================================

export async function getPractices(pathId?: string) {
  return prisma.practice.findMany({
    where: {
      isActive: true,
      OR: [
        { pathId: pathId ?? undefined },
        { pathId: null }, // pratiques globales
      ],
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getUserPracticeLogs(userId: string, params?: {
  limit?: number
  since?: Date
}) {
  return prisma.userPracticeLog.findMany({
    where: {
      userId,
      ...(params?.since ? { loggedAt: { gte: params.since } } : {}),
    },
    orderBy: { loggedAt: 'desc' },
    take: params?.limit ?? 30,
    include: { practice: true },
  })
}

// Vérifier si une pratique a été faite aujourd'hui
export async function hasDonePracticeToday(userId: string, practiceId: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.userPracticeLog.count({
    where: {
      userId,
      practiceId,
      status: 'completed',
      loggedAt: { gte: today },
    },
  })
  return count > 0
}

// ============================================================
// ÉPREUVES
// ============================================================

export async function getChallenges(pathId?: string) {
  return prisma.challenge.findMany({
    where: {
      isActive: true,
      OR: [
        { pathId: pathId ?? undefined },
        { pathId: null },
      ],
    },
    orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function getUserChallengeLogs(userId: string, params?: {
  status?: string
  limit?: number
}) {
  return prisma.userChallengeLog.findMany({
    where: {
      userId,
      ...(params?.status ? { status: params.status as any } : {}),
    },
    orderBy: { startedAt: 'desc' },
    take: params?.limit ?? 20,
    include: { challenge: true },
  })
}

export async function getActiveChallengeLog(userId: string, challengeId: string) {
  return prisma.userChallengeLog.findFirst({
    where: { userId, challengeId, status: 'in_progress' },
  })
}

// ============================================================
// BADGES
// ============================================================

export async function getAllBadges() {
  return prisma.badge.findMany({ orderBy: { key: 'asc' } })
}

export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  })
}

export async function hasBadge(userId: string, badgeKey: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { key: badgeKey } })
  if (!badge) return false
  const count = await prisma.userBadge.count({
    where: { userId, badgeId: badge.id },
  })
  return count > 0
}
