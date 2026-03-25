// src/lib/supabase/queries/users.ts
// Requêtes Prisma pour users et profiles — jamais de requêtes dans les composants

import { prisma } from '@/lib/prisma'
import type { Profile, UserPreference } from '@/types'

// ---- Lecture ----

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, preferences: true },
  })
}

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
  })
}

export async function getProfileByUsername(username: string) {
  return prisma.profile.findUnique({
    where: { username },
    include: {
      user: { select: { role: true, accountStatus: true } },
    },
  })
}

// Profil complet pour affichage public
export async function getPublicProfile(username: string) {
  return prisma.profile.findFirst({
    where: { username, isPublic: true },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      country: true,
      city: true,
      showLocation: true,
      showPath: true,
      showGuide: true,
      showLevel: true,
      verificationStatus: true,
      currentLevel: true,
      currentXp: true,
      language: true,
      createdAt: true,
      user: { select: { role: true } },
    },
  })
}

// ---- Création / mise à jour ----

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile,
    | 'displayName'
    | 'bio'
    | 'avatarUrl'
    | 'avatarType'
    | 'country'
    | 'city'
    | 'language'
    | 'isPublic'
    | 'showLocation'
    | 'showPath'
    | 'showGuide'
    | 'showLevel'
  >>,
) {
  return prisma.profile.upsert({
    where: { userId },
    update: { ...data, updatedAt: new Date() },
    create: { userId, username: `user_${userId.slice(0, 8)}`, language: 'fr', ...data },
  })
}

export async function updateUsername(userId: string, username: string) {
  // Vérifier disponibilité
  const existing = await prisma.profile.findUnique({ where: { username } })
  if (existing && existing.userId !== userId) {
    throw new Error('USERNAME_TAKEN')
  }

  // upsert : crée le profil si le trigger n'a pas encore eu le temps de le faire
  return prisma.profile.upsert({
    where: { userId },
    update: { username, updatedAt: new Date() },
    create: {
      userId,
      username,
      language: 'fr',
    },
  })
}

export async function markOnboardingComplete(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    update: {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    },
    create: {
      userId,
      username: `user_${userId.slice(0, 8)}`,
      language: 'fr',
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  })
}

// ---- Préférences ----

export async function getUserPreferences(userId: string) {
  return prisma.userPreference.findUnique({ where: { userId } })
}

export async function updateUserPreferences(
  userId: string,
  data: Partial<Pick<UserPreference,
    | 'language'
    | 'themeMode'
    | 'soundEnabled'
    | 'hapticsEnabled'
    | 'notificationLevel'
    | 'guideAddressMode'
  >>,
) {
  return prisma.userPreference.update({
    where: { userId },
    data: { ...data, updatedAt: new Date() },
  })
}

// ---- Vérification username ----

export async function isUsernameTaken(username: string, excludeUserId?: string) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: { userId: true },
  })
  if (!profile) return false
  if (excludeUserId && profile.userId === excludeUserId) return false
  return true
}

// ---- Admin queries ----

export async function getUsersForAdmin(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const { page = 1, limit = 20, search, status } = params
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { accountStatus: status as any } : {}),
    ...(search
      ? {
          profile: {
            OR: [
              { username: { contains: search, mode: 'insensitive' as const } },
              { displayName: { contains: search, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        profile: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            verificationStatus: true,
            currentLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return { users, total, pages: Math.ceil(total / limit) }
}

// ---- Soft delete ----

export async function softDeleteUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: 'deleted',
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

// ---- Update last login ----

export async function updateLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date(), updatedAt: new Date() },
  })
}
