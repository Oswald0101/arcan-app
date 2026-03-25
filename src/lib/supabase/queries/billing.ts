// src/lib/supabase/queries/billing.ts
// Requêtes Prisma pour le module billing — aligné sur schema.prisma réel

import { prisma } from '@/lib/prisma'
import type { PlanKey } from '@/types/billing'

// ============================================================
// PLANS
// ============================================================

export async function getActivePlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getPlanByKey(planKey: string) {
  return prisma.subscriptionPlan.findFirst({
    where: { planKey },
  })
}

// ============================================================
// ABONNEMENT ACTIF
// ============================================================

export async function getActiveSubscription(userId: string) {
  return prisma.userSubscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] },
    },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
}

// ============================================================
// PRODUITS
// ============================================================

export async function getActiveProducts(type?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(type ? { productType: type as any } : {}),
    },
    orderBy: [{ productType: 'asc' }, { priceAmount: 'asc' }],
  })
}

export async function getProductById(productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, isActive: true },
  })
}

// ============================================================
// ACHATS
// ============================================================

export async function getUserPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { userId, status: 'completed' },
    include: { product: true },
    orderBy: { purchasedAt: 'desc' },
  })
}

export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.purchase.count({
    where: { userId, productId, status: 'completed' },
  })
  return count > 0
}

// ============================================================
// ENTITLEMENTS
// Schema réel: entitlementType, entitlementKey, sourceType, sourceId, activeUntil
// ============================================================

export async function getActiveEntitlements(userId: string): Promise<string[]> {
  const items = await prisma.userEntitlement.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { activeUntil: null },
        { activeUntil: { gt: new Date() } },
      ],
    },
    select: { entitlementKey: true },
  })
  return items.map((e: any) => e.entitlementKey)
}

export async function hasEntitlement(userId: string, key: string): Promise<boolean> {
  const count = await prisma.userEntitlement.count({
    where: {
      userId,
      entitlementKey: key,
      isActive: true,
      OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
    },
  })
  return count > 0
}

export async function grantEntitlement(params: {
  userId: string
  entitlementKey: string
  entitlementType: string
  sourceType: string
  sourceId?: string | null
  activeUntil?: Date | null
}) {
  // Upsert basé sur userId + entitlementKey
  const existing = await prisma.userEntitlement.findFirst({
    where: { userId: params.userId, entitlementKey: params.entitlementKey, isActive: true },
  })

  if (existing) {
    return prisma.userEntitlement.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        sourceType: params.sourceType as any,
        sourceId: params.sourceId ?? undefined,
        activeUntil: params.activeUntil ?? null,
      },
    })
  }

  return prisma.userEntitlement.create({
    data: {
      userId: params.userId,
      entitlementKey: params.entitlementKey,
      entitlementType: params.entitlementType,
      sourceType: params.sourceType as any,
      sourceId: params.sourceId ?? undefined,
      isActive: true,
      activeUntil: params.activeUntil ?? null,
    },
  })
}

export async function revokeSubscriptionEntitlements(userId: string, subscriptionId: string) {
  return prisma.userEntitlement.updateMany({
    where: { userId, sourceId: subscriptionId, sourceType: 'subscription' },
    data: { isActive: false },
  })
}

// ============================================================
// RÉSUMÉ BILLING
// ============================================================

export async function getUserBillingSummary(userId: string) {
  const [sub, entitlementKeys, purchases] = await Promise.all([
    getActiveSubscription(userId),
    getActiveEntitlements(userId),
    prisma.purchase.findMany({
      where: { userId, status: 'completed' },
      select: { product: { select: { productKey: true } } },
    }),
  ])

  const planKey = (sub?.plan?.planKey ?? 'free') as PlanKey

  return {
    planKey,
    subStatus: sub?.status ?? null,
    periodEnd: sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    entitlements: entitlementKeys,
    purchasedProductKeys: purchases.map((p: any) => p.product.productKey),
  }
}
