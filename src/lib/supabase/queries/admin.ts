// src/lib/supabase/queries/admin.ts
// Requêtes Prisma pour le dashboard admin

import { prisma } from '@/lib/prisma'
import type { DashboardStats, AdminMemberView, AdminPathView, AdminReportView } from '@/types/admin'

// ============================================================
// STATS GLOBALES
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now.getTime() - 7 * 86400000)

  const [
    totalMembers,
    newMembersToday,
    newMembersThisWeek,
    totalPaths,
    totalCircles,
    activeSubscriptions,
    openReports,
    pendingVerifications,
    recentPurchasesCount,
    pendingInvites,
  ] = await Promise.all([
    prisma.user.count({ where: { accountStatus: 'active' } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.path.count({ where: { status: 'active' } }),
    prisma.circle.count(),
    prisma.userSubscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.report.count({ where: { status: { in: ['pending', 'under_review'] } } }),
    prisma.verificationRequest.count({ where: { status: 'pending' } }),
    prisma.purchase.count({ where: { purchasedAt: { gte: weekStart }, status: 'completed' } }),
    prisma.invite.count({ where: { status: 'pending' } }),
  ])

  return {
    totalMembers,
    newMembersToday,
    newMembersThisWeek,
    totalPaths,
    totalCircles,
    activeSubscriptions,
    openReports,
    pendingVerifications,
    recentPurchasesCount,
    pendingInvites,
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

  const where = {
    ...(status ? { accountStatus: status as any } : {}),
    ...(role ? { role: role as any } : {}),
    ...(search
      ? {
          OR: [
            { profile: { username: { contains: search, mode: 'insensitive' as const } } },
            { profile: { displayName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
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
        subscriptions: {
          where: { status: { in: ['active', 'trialing'] } },
          select: { status: true, plan: { select: { planKey: true } } },
          take: 1,
        },
        _count: { select: { reports: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    members: users.map((u: any) => ({
      id: u.id,
      role: u.role,
      accountStatus: u.accountStatus,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      profile: u.profile,
      subscriptionStatus: u.subscriptions[0]
        ? `${u.subscriptions[0].plan.planKey} (${u.subscriptions[0].status})`
        : null,
      reportsCount: u._count.reports,
    })) as AdminMemberView[],
    total,
    pages: Math.ceil(total / limit),
  }
}

export async function getAdminMemberById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      preferences: true,
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      purchases: {
        include: { product: true },
        orderBy: { purchasedAt: 'desc' },
        take: 5,
      },
      adminRoles: {
        where: { isActive: true },
        include: { adminRole: true },
      },
      _count: { select: { reports: true, blocksReceived: true } },
    },
  })
}

// ============================================================
// VOIES
// ============================================================

export async function getAdminPaths(params: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) {
  const { page = 1, limit = 25, search, status } = params
  const skip = (page - 1) * limit

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [paths, total] = await Promise.all([
    prisma.path.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        founder: {
          include: {
            profile: { select: { username: true } },
          },
        },
      },
    }),
    prisma.path.count({ where }),
  ])

  return {
    paths: paths.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      canonicalType: p.canonicalType,
      status: p.status,
      visibility: p.visibility,
      memberCount: p.memberCount,
      createdAt: p.createdAt,
      founderUsername: p.founder?.profile?.username ?? null,
    })) as AdminPathView[],
    total,
    pages: Math.ceil(total / limit),
  }
}

export async function getAdminPathById(pathId: string) {
  return prisma.path.findUnique({
    where: { id: pathId },
    include: {
      founder: {
        include: { profile: { select: { username: true, displayName: true } } },
      },
      manifestos: { where: { isCurrent: true }, take: 1 },
      principles: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
      circle: { include: { _count: { select: { memberships: true } } } },
    },
  })
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

  const where = {
    ...(status ? { status: status as any } : {}),
    ...(targetType ? { targetType: targetType as any } : {}),
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      include: {
        reporter: {
          include: { profile: { select: { username: true } } },
        },
        assignedModerator: {
          include: { profile: { select: { username: true } } },
        },
      },
    }),
    prisma.report.count({ where }),
  ])

  return {
    reports: reports.map((r: any) => ({
      id: r.id,
      reporterUsername: r.reporter?.profile?.username ?? null,
      targetType: r.targetType,
      targetId: r.targetId,
      reasonKey: r.reasonKey,
      detailsText: r.detailsText,
      status: r.status,
      assignedTo: r.assignedModerator?.profile?.username ?? null,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    })) as AdminReportView[],
    total,
    pages: Math.ceil(total / limit),
  }
}

// ============================================================
// VÉRIFICATION
// ============================================================

export async function getVerificationRequests(params: {
  status?: string
  page?: number
  limit?: number
}) {
  const { status = 'pending', page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  return prisma.verificationRequest.findMany({
    where: { status: status as any },
    skip,
    take: limit,
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        include: {
          profile: {
            select: {
              username: true, displayName: true, avatarUrl: true,
              verificationStatus: true, currentLevel: true,
            },
          },
        },
      },
    },
  })
}

// ============================================================
// BUSINESS
// ============================================================

export async function getBusinessOverview() {
  const weekStart = new Date(Date.now() - 7 * 86400000)

  const [subscriptionsByPlan, recentPurchases, recentInvites] = await Promise.all([
    prisma.userSubscription.groupBy({
      by: ['planId'],
      where: { status: { in: ['active', 'trialing'] } },
      _count: true,
    }),
    prisma.purchase.findMany({
      where: { purchasedAt: { gte: weekStart }, status: 'completed' },
      include: {
        product: { select: { title: true, productType: true, priceAmount: true } },
        user: { include: { profile: { select: { username: true } } } },
      },
      orderBy: { purchasedAt: 'desc' },
      take: 20,
    }),
    prisma.invite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        inviter: { include: { profile: { select: { username: true } } } },
        acceptedUser: { include: { profile: { select: { username: true } } } },
      },
    }),
  ])

  return { subscriptionsByPlan, recentPurchases, recentInvites }
}
