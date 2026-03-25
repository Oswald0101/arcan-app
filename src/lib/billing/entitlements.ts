// src/lib/billing/entitlements.ts
// Attribution des entitlements — aligné sur schema.prisma réel

import { prisma } from '@/lib/prisma'
import { grantEntitlement, revokeSubscriptionEntitlements } from '@/lib/supabase/queries/billing'
import { PLAN_ENTITLEMENTS, type PlanKey } from '@/types/billing'

export async function applySubscriptionEntitlements(params: {
  userId: string
  subscriptionId: string
  planKey: PlanKey
  activeUntil: Date
}): Promise<void> {
  const keys = PLAN_ENTITLEMENTS[params.planKey] ?? []

  // Révoquer les entitlements de l'ancien plan si changement
  const existing = await prisma.userEntitlement.findMany({
    where: { userId: params.userId, sourceType: 'subscription', isActive: true },
    select: { entitlementKey: true },
  })
  const newKeySet = new Set(keys)
  const toRevoke = existing
    .filter((e: any) => !newKeySet.has(e.entitlementKey))
    .map((e: any) => e.entitlementKey)

  if (toRevoke.length > 0) {
    await prisma.userEntitlement.updateMany({
      where: { userId: params.userId, entitlementKey: { in: toRevoke }, sourceType: 'subscription' },
      data: { isActive: false },
    })
  }

  for (const key of keys) {
    await grantEntitlement({
      userId: params.userId,
      entitlementKey: key,
      entitlementType: 'feature',
      sourceType: 'subscription',
      sourceId: params.subscriptionId,
      activeUntil: params.activeUntil,
    })
  }

  if (params.planKey === 'founder') {
    await prisma.user.update({
      where: { id: params.userId },
      data: { role: 'founder', updatedAt: new Date() },
    })
  }
}

export async function revokeAllSubscriptionEntitlements(params: {
  userId: string
  subscriptionId: string
  planKey: PlanKey
}): Promise<void> {
  await revokeSubscriptionEntitlements(params.userId, params.subscriptionId)

  if (params.planKey === 'founder') {
    await prisma.user.update({
      where: { id: params.userId },
      data: { role: 'member', updatedAt: new Date() },
    })
  }
}

export async function applyPurchaseEntitlements(params: {
  userId: string
  purchaseId: string
  productKey: string
  productType: string
}): Promise<void> {
  await grantEntitlement({
    userId: params.userId,
    entitlementKey: `product_${params.productKey}`,
    entitlementType: 'product',
    sourceType: 'purchase',
    sourceId: params.purchaseId,
    activeUntil: null,
  })

  if (params.productType === 'codex_export') {
    await grantEntitlement({
      userId: params.userId,
      entitlementKey: 'codex_export_pdf',
      entitlementType: 'feature',
      sourceType: 'purchase',
      sourceId: params.purchaseId,
      activeUntil: null,
    })
  }
}

export async function grantPremiumDays(params: {
  userId: string
  days: number
  sourceId: string
  source: 'referral' | 'admin_grant'
}): Promise<void> {
  const activeUntil = new Date(Date.now() + params.days * 86400000)
  const keys = PLAN_ENTITLEMENTS['premium']

  for (const key of keys) {
    await grantEntitlement({
      userId: params.userId,
      entitlementKey: key,
      entitlementType: 'feature',
      sourceType: params.source,
      sourceId: params.sourceId,
      activeUntil,
    })
  }
}
