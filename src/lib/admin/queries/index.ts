// src/lib/admin/queries/index.ts
// Toutes les requêtes Prisma pour le dashboard admin

import { prisma } from '@/lib/prisma'
import type { DashboardStats, AdminMemberView, AdminPathView, AdminReportView } from '@/types/admin'

// ============================================================
// DASHBOARD — Stats globales
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

  const [
    totalMembers,
    newMembers,
    totalPaths,
    totalCircles,
    activeSubscriptions,
    recentPurchases,
    openReports,
    pendingVerifications,
    pendingMemberships,
    recentInvites,
  ] = await Promise.all([
    prisma.user.count({ where: { accountStatus: { in: ['active', 'pending'] } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.path.count({ where: { status: 'active' } }),
    prisma.circle.count(),
    prisma.userSubscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.purchase.count({ where: { purchasedAt: { gte: sevenDaysAgo }, status: 'completed' } }),
    prisma.report.count({ where: { status: { in: ['pending', 'under_review'] } } }),
    prisma.verificationRequest.count({ where: { status: 'pending' } }),
    prisma.circleMembership.count({ where: { status: 'pending' } }),
    prisma.invite.count({ where: { status: 'accepted', acceptedAt: { gte: sevenDaysAgo } } }),
  ])

  return {
    totalMembers,
    newMembersLast7Days: newMembers,
    totalPaths,
    totalCircles,
    activeSubscriptions,
    recentPurchases,
    openReports,
    pendingVerifications,
    pendingMemberships,
    recentInviteActivations: recentInvites,
  }
}

// ============================================================
// MEMBRES
// ============================================================

export async function getAdminMembers(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}) {
  const { page = 1, limit = 25, search, status, role } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.accountStatus = status
  if (role) where.role = role
  if (search) {
    where.OR = [
      { profile: { username: { contains: search, mode: 'insensitive' } } },
      { profile: { displayName: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            verificationStatus: true,
            currentLevel: true,
            onboardingCompleted: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return { users, total, pages: Math.ceil(total / limit) }
}

export async function getAdminMemberDetail(userId: string): Promise<AdminMemberView | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      subscriptions: {
        where: { status: { in: ['active', 'trialing'] } },
        include: { plan: { select: { planKey: true } } },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user || !user.profile) return null

  // Email depuis auth.users via Supabase — récupéré à part
  const [path, openReports, moderationActions] = await Promise.all([
    prisma.path.findFirst({
      where: { founderUserId: userId },
      select: { name: true },
    }),
    prisma.report.count({ where: { targetId: userId, status: { in: ['pending', 'under_review'] } } }),
    prisma.moderationAction.count({ where: { targetId: userId } }),
  ])

  const sub = user.subscriptions[0]

  return {
    id: user.profile.id,
    userId: user.id,
    username: user.profile.username,
    displayName: user.profile.displayName,
    avatarUrl: user.profile.avatarUrl,
    email: '', // Chargé séparément via Supabase Admin API si nécessaire
    role: user.role,
    accountStatus: user.accountStatus,
    verificationStatus: user.profile.verificationStatus,
    currentLevel: user.profile.currentLevel,
    onboardingCompleted: user.profile.onboardingCompleted,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    activeSubscription: sub
      ? { planKey: sub.plan.planKey, currentPeriodEnd: sub.currentPeriodEnd }
      : null,
    pathName: path?.name ?? null,
    openReportsCount: openReports,
    moderationActionsCount: moderationActions,
  }
}

// ============================================================
// VOIES
// ============================================================

export async function getAdminPaths(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
  visibility?: string
}) {
  const { page = 1, limit = 25, search, status, visibility } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status
  if (visibility) where.visibility = visibility
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [paths, total] = await Promise.all([
    prisma.path.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        founder: {
          include: { profile: { select: { username: true } } },
        },
        manifestos: {
          where: { isCurrent: true },
          select: { content: true },
          take: 1,
        },
      },
    }),
    prisma.path.count({ where }),
  ])

  const pathsWithReports = await Promise.all(
    paths.map(async (p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      canonicalType: p.canonicalType,
      customTypeLabel: p.customTypeLabel,
      visibility: p.visibility,
      status: p.status,
      admissionMode: p.admissionMode,
      memberCount: p.memberCount,
      founderUsername: p.founder?.profile?.username ?? '—',
      language: p.language,
      createdAt: p.createdAt,
      manifestoPreview: p.manifestos[0]?.content?.slice(0, 100) ?? null,
      openReportsCount: await prisma.report.count({
        where: { targetId: p.id, status: { in: ['pending', 'under_review'] } },
      }),
    })),
  )

  return { paths: pathsWithReports, total, pages: Math.ceil(total / limit) }
}

// ============================================================
// SIGNALEMENTS
// ============================================================

export async function getAdminReports(params: {
  page?: number
  limit?: number
  status?: string
  targetType?: string
}) {
  const { page = 1, limit = 25, status, targetType } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status
  else where.status = { in: ['pending', 'under_review'] } // Par défaut : non résolus
  if (targetType) where.targetType = targetType

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        reporter: {
          include: { profile: { select: { username: true } } },
        },
      },
    }),
    prisma.report.count({ where }),
  ])

  // Enrichir avec les infos de la cible
  const enriched = await Promise.all(
    reports.map(async (r: any) => {
      let targetInfo: Record<string, string | undefined> = {}

      if (r.targetType === 'user') {
        const profile = await prisma.profile.findUnique({
          where: { userId: r.targetId },
          select: { username: true },
        })
        targetInfo = { username: profile?.username }
      } else if (r.targetType === 'path') {
        const path = await prisma.path.findUnique({
          where: { id: r.targetId },
          select: { name: true },
        })
        targetInfo = { pathName: path?.name }
      }

      return {
        id: r.id,
        reporterUserId: r.reporterUserId,
        reporterUsername: r.reporter?.profile?.username ?? '—',
        targetType: r.targetType,
        targetId: r.targetId,
        reasonKey: r.reasonKey,
        detailsText: r.detailsText,
        status: r.status,
        assignedTo: r.assignedTo,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
        targetInfo,
      }
    }),
  )

  return { reports: enriched, total, pages: Math.ceil(total / limit) }
}

// ============================================================
// VÉRIFICATION
// ============================================================

export async function getPendingVerifications(params: { page?: number; limit?: number }) {
  const { page = 1, limit = 25 } = params
  const skip = (page - 1) * limit

  return prisma.verificationRequest.findMany({
    where: { status: { in: ['pending', 'more_info_needed'] } },
    skip,
    take: limit,
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        include: { profile: { select: { username: true, displayName: true, avatarUrl: true } } },
      },
    },
  })
}

// ============================================================
// BUSINESS
// ============================================================

export async function getAdminBusinessOverview() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const [activeSubsByPlan, recentPurchases, recentInvites] = await Promise.all([
    prisma.userSubscription.groupBy({
      by: ['planId'],
      where: { status: { in: ['active', 'trialing'] } },
      _count: { _all: true },
    }),
    prisma.purchase.findMany({
      where: { status: 'completed', purchasedAt: { gte: thirtyDaysAgo } },
      orderBy: { purchasedAt: 'desc' },
      take: 20,
      include: {
        user: { include: { profile: { select: { username: true } } } },
        product: { select: { title: true, productType: true, priceAmount: true } },
      },
    }),
    prisma.invite.findMany({
      where: { status: 'accepted', acceptedAt: { gte: thirtyDaysAgo } },
      orderBy: { acceptedAt: 'desc' },
      take: 20,
      include: {
        inviter: { include: { profile: { select: { username: true } } } },
      },
    }),
  ])

  return { activeSubsByPlan, recentPurchases, recentInvites }
}

// ============================================================
// AUDIT LOGS
// ============================================================

export async function getAuditLogs(params: { page?: number; limit?: number; actionKey?: string }) {
  const { page = 1, limit = 50, actionKey } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (actionKey) where.actionKey = { contains: actionKey }

  return prisma.auditLog.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { include: { profile: { select: { username: true } } } },
    },
  })
}
