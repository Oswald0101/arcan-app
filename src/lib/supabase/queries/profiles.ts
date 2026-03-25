// src/lib/supabase/queries/profiles.ts
// Lecture des profils avec respect strict de la visibilité

import { prisma } from '@/lib/prisma'
import type { PublicProfile } from '@/types/social'

// ============================================================
// VÉRIFICATIONS DE BLOCAGE (helpers internes)
// ============================================================

async function getBlockStatus(viewerUserId: string, targetUserId: string) {
  const [blocked, blockedBy] = await Promise.all([
    prisma.block.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: viewerUserId, blockedUserId: targetUserId } },
    }),
    prisma.block.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: targetUserId, blockedUserId: viewerUserId } },
    }),
  ])
  return { isBlocked: Boolean(blocked), isBlockedBy: Boolean(blockedBy) }
}

async function getContactStatus(
  viewerUserId: string,
  targetUserId: string,
): Promise<'contact' | 'pending' | 'received' | null> {
  // Contact établi ?
  const [id1, id2] = [viewerUserId, targetUserId].sort()
  const contact = await prisma.contact.findUnique({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
  })
  if (contact) return 'contact'

  // Demande en attente envoyée ?
  const sent = await prisma.contactRequest.findFirst({
    where: { senderUserId: viewerUserId, receiverUserId: targetUserId, status: 'pending' },
  })
  if (sent) return 'pending'

  // Demande reçue ?
  const received = await prisma.contactRequest.findFirst({
    where: { senderUserId: targetUserId, receiverUserId: viewerUserId, status: 'pending' },
  })
  if (received) return 'received'

  return null
}

// ============================================================
// LECTURE D'UN PROFIL PUBLIC
// ============================================================

export async function getPublicProfile(
  username: string,
  viewerUserId?: string,
): Promise<PublicProfile | null> {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      id: true,
      userId: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      verificationStatus: true,
      currentLevel: true,
      language: true,
      isPublic: true,
      showLocation: true,
      showPath: true,
      showGuide: true,
      showLevel: true,
      country: true,
      city: true,
      createdAt: true,
      user: { select: { role: true, accountStatus: true } },
    },
  })

  if (!profile) return null
  if (profile.user.accountStatus !== 'active') return null

  // Blocage mutuel — renvoie un profil minimal si bloqué
  let blockStatus = { isBlocked: false, isBlockedBy: false }
  let contactStatus: any = null

  if (viewerUserId && viewerUserId !== profile.userId) {
    blockStatus = await getBlockStatus(viewerUserId, profile.userId)

    // Si bloqué par la cible : profil non accessible
    if (blockStatus.isBlockedBy) return null

    contactStatus = await getContactStatus(viewerUserId, profile.userId)
  }

  // Profil privé : accessible seulement si contact ou soi-même
  if (!profile.isPublic && viewerUserId !== profile.userId && contactStatus !== 'contact') {
    // Renvoie un profil minimal (nom + avatar seulement)
    return {
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      bio: null,
      avatarUrl: profile.avatarUrl,
      verificationStatus: profile.verificationStatus,
      currentLevel: profile.showLevel ? profile.currentLevel : 0,
      language: profile.language,
      createdAt: profile.createdAt,
      isBlocked: blockStatus.isBlocked,
      isBlockedBy: false,
      contactStatus,
    }
  }

  // Données conditionnelles selon les paramètres de visibilité
  let pathInfo: { pathName?: string; pathType?: string } = {}
  let guideInfo: { guideName?: string; guideType?: string } = {}

  if (profile.showPath) {
    const path = await prisma.path.findFirst({
      where: { founderUserId: profile.userId, status: 'active' },
      select: { name: true, canonicalType: true, customTypeLabel: true },
    })
    if (path) {
      pathInfo = {
        pathName: path.name,
        pathType: path.customTypeLabel ?? path.canonicalType,
      }
    }
  }

  if (profile.showGuide) {
    const guide = await prisma.guide.findFirst({
      where: { ownerUserId: profile.userId },
      select: { name: true, canonicalType: true, customTypeLabel: true },
    })
    if (guide) {
      guideInfo = {
        guideName: guide.name,
        guideType: guide.customTypeLabel ?? guide.canonicalType,
      }
    }
  }

  return {
    id: profile.id,
    userId: profile.userId,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    verificationStatus: profile.verificationStatus,
    currentLevel: profile.showLevel ? profile.currentLevel : 0,
    language: profile.language,
    createdAt: profile.createdAt,
    country: profile.showLocation ? profile.country : null,
    city: profile.showLocation ? profile.city : null,
    ...pathInfo,
    ...guideInfo,
    isBlocked: blockStatus.isBlocked,
    isBlockedBy: false,
    contactStatus,
  }
}

// Profil par userId (usage interne)
export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      verificationStatus: true,
      currentLevel: true,
    },
  })
}

// Recherche de membres (profils publics uniquement)
export async function searchProfiles(params: {
  query: string
  viewerUserId: string
  limit?: number
}) {
  const { query, viewerUserId, limit = 10 } = params

  // Récupérer les IDs bloqués pour les exclure
  const [blockedIds, blockedByIds] = await Promise.all([
    prisma.block.findMany({
      where: { blockerUserId: viewerUserId },
      select: { blockedUserId: true },
    }),
    prisma.block.findMany({
      where: { blockedUserId: viewerUserId },
      select: { blockerUserId: true },
    }),
  ])

  const excludedIds = new Set([
    viewerUserId,
    ...blockedIds.map((b: { blockedUserId: string }) => b.blockedUserId),
    ...blockedByIds.map((b: { blockerUserId: string }) => b.blockerUserId),
  ])

  const profiles = await prisma.profile.findMany({
    where: {
      isPublic: true,
      userId: { notIn: Array.from(excludedIds) },
      user: { accountStatus: 'active' },
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      userId: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      verificationStatus: true,
      currentLevel: true,
    },
  })

  return profiles
}
