// src/lib/supabase/queries/paths.ts
// Requêtes Prisma pour voies, cercles, memberships

import { prisma } from '@/lib/prisma'
import type { PathView } from '@/types/paths'

// ============================================================
// VOIES — Lecture
// ============================================================

export async function getPathBySlug(slug: string, currentUserId?: string) {
  const path = await prisma.path.findUnique({
    where: { slug, status: 'active' },
    include: {
      manifestos: {
        where: { isCurrent: true },
        select: { content: true },
        take: 1,
      },
      principles: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
        select: { content: true },
      },
      guides: {
        select: { id: true, name: true },
        take: 1,
      },
      circle: {
        select: {
          id: true,
          memberCount: true,
          name: true,
        },
      },
    },
  })

  if (!path) return null

  // Membership de l'utilisateur courant si connecté
  let userMembership = null
  if (currentUserId && path.circle) {
    userMembership = await prisma.circleMembership.findUnique({
      where: {
        circleId_userId: {
          circleId: path.circle.id,
          userId: currentUserId,
        },
      },
    })
  }

  return {
    ...path,
    currentManifesto: path.manifestos[0]?.content ?? null,
    currentPrinciples: path.principles.map((p: { content: string }) => p.content),
    guideId: path.guides[0]?.id ?? null,
    guideName: path.guides[0]?.name ?? null,
    userMembership,
    circle: path.circle ?? null,
  }
}

export async function getPathById(pathId: string, currentUserId?: string) {
  const path = await prisma.path.findUnique({
    where: { id: pathId, status: 'active' },
    include: {
      manifestos: { where: { isCurrent: true }, select: { content: true }, take: 1 },
      principles: { where: { isActive: true }, orderBy: { orderIndex: 'asc' }, select: { content: true } },
      guides: { select: { id: true, name: true }, take: 1 },
      circle: { select: { id: true, memberCount: true, name: true } },
    },
  })
  if (!path) return null

  let userMembership = null
  if (currentUserId && path.circle) {
    userMembership = await prisma.circleMembership.findUnique({
      where: { circleId_userId: { circleId: path.circle.id, userId: currentUserId } },
    })
  }

  return {
    ...path,
    currentManifesto: path.manifestos[0]?.content ?? null,
    currentPrinciples: path.principles.map((p: { content: string }) => p.content),
    guideId: path.guides[0]?.id ?? null,
    guideName: path.guides[0]?.name ?? null,
    userMembership,
    circle: path.circle ?? null,
  }
}

// Exploration des voies publiques
export async function getPublicPaths(params: {
  page?: number
  limit?: number
  language?: string
  search?: string
  canonicalType?: string
}) {
  const { page = 1, limit = 20, language, search, canonicalType } = params
  const skip = (page - 1) * limit

  const where = {
    status: 'active' as const,
    visibility: 'public' as const,
    ...(language ? { language } : {}),
    ...(canonicalType ? { canonicalType: canonicalType as any } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { shortDescription: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [paths, total] = await Promise.all([
    prisma.path.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ memberCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        canonicalType: true,
        customTypeLabel: true,
        shortDescription: true,
        memberCount: true,
        language: true,
        admissionMode: true,
        createdAt: true,
        manifestos: {
          where: { isCurrent: true },
          select: { content: true },
          take: 1,
        },
      },
    }),
    prisma.path.count({ where }),
  ])

  return {
    paths: paths.map((p: any) => ({
      ...p,
      manifestoPreview: p.manifestos[0]?.content?.slice(0, 150) ?? null,
    })),
    total,
    pages: Math.ceil(total / limit),
  }
}

// Voies d'un fondateur
export async function getPathsByFounder(founderUserId: string) {
  return prisma.path.findMany({
    where: { founderUserId, status: 'active' },
    orderBy: { createdAt: 'desc' },
    include: {
      circle: { select: { id: true, memberCount: true } },
    },
  })
}

// Voies rejointes par un membre
export async function getJoinedPaths(userId: string) {
  const memberships = await prisma.circleMembership.findMany({
    where: { userId, status: 'active' },
    include: {
      circle: {
        include: {
          path: {
            select: {
              id: true, slug: true, name: true,
              canonicalType: true, customTypeLabel: true,
              shortDescription: true, memberCount: true,
            },
          },
        },
      },
    },
  })

  return memberships.map((m: any) => ({
    membership: m,
    path: m.circle.path,
  }))
}

// Historique des versions d'une voie
export async function getPathVersions(pathId: string) {
  return prisma.pathVersion.findMany({
    where: { pathId },
    orderBy: { versionNumber: 'desc' },
    select: {
      id: true,
      versionNumber: true,
      evolutionNotes: true,
      manifestoText: true,
      principles: true,
      createdAt: true,
    },
  })
}

// ============================================================
// VOIES — Écriture
// ============================================================

export async function updatePathVisibility(
  pathId: string,
  founderUserId: string,
  visibility: 'public' | 'unlisted' | 'private',
) {
  return prisma.path.update({
    where: { id: pathId, founderUserId },
    data: { visibility, updatedAt: new Date() },
  })
}

export async function createPathVersion(params: {
  pathId: string
  founderUserId: string
  manifestoText?: string
  principles?: string[]
  evolutionNotes?: string
}) {
  return prisma.$transaction(async (tx) => {
    const path = await tx.path.findUnique({
      where: { id: params.pathId, founderUserId: params.founderUserId },
      select: { currentVersion: true },
    })
    if (!path) throw new Error('Voie introuvable')

    const newVersion = path.currentVersion + 1

    const version = await tx.pathVersion.create({
      data: {
        pathId: params.pathId,
        versionNumber: newVersion,
        manifestoText: params.manifestoText,
        principles: params.principles ?? [],
        evolutionNotes: params.evolutionNotes,
        createdByUserId: params.founderUserId,
      },
    })

    await tx.path.update({
      where: { id: params.pathId },
      data: { currentVersion: newVersion, updatedAt: new Date() },
    })

    return version
  })
}

// ============================================================
// CERCLES — Lecture
// ============================================================

export async function getCircleMembers(circleId: string, params: {
  page?: number
  limit?: number
  status?: string
}) {
  const { page = 1, limit = 30, status = 'active' } = params
  const skip = (page - 1) * limit

  const [members, total] = await Promise.all([
    prisma.circleMembership.findMany({
      where: { circleId, status: status as any },
      skip,
      take: limit,
      orderBy: { joinedAt: 'asc' },
      include: {
        user: {
          include: {
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
                currentLevel: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    }),
    prisma.circleMembership.count({ where: { circleId, status: status as any } }),
  ])

  return { members, total, pages: Math.ceil(total / limit) }
}

export async function getMembership(circleId: string, userId: string) {
  return prisma.circleMembership.findUnique({
    where: { circleId_userId: { circleId, userId } },
  })
}

// ============================================================
// CERCLES — Membership
// ============================================================

export async function requestJoinPath(userId: string, pathId: string) {
  return prisma.$transaction(async (tx) => {
    const path = await tx.path.findUnique({
      where: { id: pathId, status: 'active' },
      include: { circle: true },
    })

    if (!path || !path.circle) throw new Error('Voie introuvable')
    if (path.visibility === 'private') throw new Error('Cette voie est privée')

    const existing = await tx.circleMembership.findUnique({
      where: { circleId_userId: { circleId: path.circle.id, userId } },
    })

    if (existing) {
      if (existing.status === 'active') throw new Error('Déjà membre de ce cercle')
      if (existing.status === 'pending') throw new Error('Demande déjà en cours')
      if (existing.status === 'banned') throw new Error('Accès refusé')
    }

    const status = path.admissionMode === 'open' ? 'active' : 'pending'

    const membership = existing
      ? await tx.circleMembership.update({
          where: { id: existing.id },
          data: { status, role: 'member' },
        })
      : await tx.circleMembership.create({
          data: { circleId: path.circle.id, userId, role: 'member', status },
        })

    // Mise à jour du compteur si admission directe
    if (status === 'active') {
      await tx.circle.update({
        where: { id: path.circle.id },
        data: { memberCount: { increment: 1 } },
      })
      await tx.path.update({
        where: { id: pathId },
        data: { memberCount: { increment: 1 } },
      })

      // Créer la progression de voie
      await tx.userPathProgress.upsert({
        where: { userId_pathId: { userId, pathId } },
        create: { userId, pathId, rankXp: 0 },
        update: {},
      })
    }

    return { membership, admissionMode: path.admissionMode }
  })
}

export async function handleMembershipRequest(params: {
  membershipId: string
  founderUserId: string
  action: 'approve' | 'reject'
}) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.circleMembership.findUnique({
      where: { id: params.membershipId },
      include: { circle: { include: { path: true } } },
    })

    if (!membership) throw new Error('Demande introuvable')
    if (membership.circle.path.founderUserId !== params.founderUserId) {
      throw new Error('Non autorisé')
    }
    if (membership.status !== 'pending') throw new Error('Demande non en attente')

    if (params.action === 'approve') {
      await tx.circleMembership.update({
        where: { id: membership.id },
        data: { status: 'active', approvedByUserId: params.founderUserId },
      })
      await tx.circle.update({
        where: { id: membership.circleId },
        data: { memberCount: { increment: 1 } },
      })
      await tx.path.update({
        where: { id: membership.circle.pathId },
        data: { memberCount: { increment: 1 } },
      })
      await tx.userPathProgress.upsert({
        where: { userId_pathId: { userId: membership.userId, pathId: membership.circle.pathId } },
        create: { userId: membership.userId, pathId: membership.circle.pathId, rankXp: 0 },
        update: {},
      })
    } else {
      await tx.circleMembership.update({
        where: { id: membership.id },
        data: { status: 'left' },
      })
    }

    return membership
  })
}

export async function leavePath(userId: string, pathId: string) {
  return prisma.$transaction(async (tx) => {
    const path = await tx.path.findUnique({
      where: { id: pathId },
      include: { circle: true },
    })
    if (!path?.circle) throw new Error('Voie introuvable')

    const membership = await tx.circleMembership.findUnique({
      where: { circleId_userId: { circleId: path.circle.id, userId } },
    })

    if (!membership || membership.status !== 'active') {
      throw new Error('Pas membre de ce cercle')
    }
    if (membership.role === 'founder') {
      throw new Error('Le fondateur ne peut pas quitter sa propre voie')
    }

    await tx.circleMembership.update({
      where: { id: membership.id },
      data: { status: 'left' },
    })

    await tx.circle.update({
      where: { id: path.circle.id },
      data: { memberCount: { decrement: 1 } },
    })
    await tx.path.update({
      where: { id: pathId },
      data: { memberCount: { decrement: 1 } },
    })

    return membership
  })
}
