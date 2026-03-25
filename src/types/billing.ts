// src/types/billing.ts — aligné sur schema.prisma réel

export type PlanKey = 'free' | 'premium' | 'founder'
// Schema SubscriptionStatus: trialing, active, past_due, canceled, expired
export type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
export type PurchaseStatus = 'pending' | 'completed' | 'refunded' | 'failed'
export type ProductType = 'avatar' | 'theme' | 'guide_skin' | 'pack' | 'codex_export' | 'codex_edition' | 'other'
// Schema EntitlementSource: subscription, purchase, referral, admin_grant
export type EntitlementSource = 'subscription' | 'purchase' | 'referral' | 'admin_grant'
// Schema InviteStatus: pending, accepted, expired, cancelled
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

// SubscriptionPlan réel: planKey, title, billingPeriod, priceAmount, stripePriceId
export interface SubscriptionPlan {
  id: string
  planKey: PlanKey
  title: string
  description: string | null
  billingPeriod: 'monthly' | 'yearly' | 'lifetime' | 'one_time'
  priceAmount: number
  currency: string
  stripePriceId: string | null
  features: string[]
  isActive: boolean
}

// UserSubscription réel: providerSubscriptionId, providerCustomerId
export interface UserSubscription {
  id: string
  userId: string
  planId: string
  provider: string
  providerSubscriptionId: string | null
  providerCustomerId: string | null
  status: SubStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  plan: SubscriptionPlan
}

export interface Product {
  id: string
  productKey: string
  productType: ProductType
  title: string
  description: string | null
  priceAmount: number
  currency: string
  stripePriceId: string | null
  isActive: boolean
  payload: Record<string, unknown>
}

export interface Purchase {
  id: string
  userId: string
  productId: string
  providerPaymentId: string | null
  status: PurchaseStatus
  amountPaid: number
  purchasedAt: Date
  product: Product
}

// UserEntitlement réel: entitlementType, entitlementKey, sourceType, sourceId, activeUntil
export interface UserEntitlement {
  id: string
  userId: string
  entitlementType: string
  entitlementKey: string
  sourceType: EntitlementSource
  sourceId: string | null
  activeUntil: Date | null
  isActive: boolean
  createdAt: Date
}

// Invite réel: inviteCode (pas code), invitedEmail, acceptedAt
export interface Invite {
  id: string
  inviterUserId: string
  inviteCode: string
  invitedEmail: string | null
  status: InviteStatus
  acceptedUserId: string | null
  acceptedAt: Date | null
  expiresAt: Date
  createdAt: Date
}

export interface ReferralReward {
  id: string
  inviteId: string
  inviterUserId: string
  inviteeUserId: string
  rewardType: string
  rewardValue: number | null
  isGranted: boolean
  grantedAt: Date | null
  createdAt: Date
}

export interface UserBillingSummary {
  planKey: PlanKey
  subStatus: SubStatus | null
  periodEnd: Date | null
  cancelAtPeriodEnd: boolean
  entitlements: string[]
  purchasedProductKeys: string[]
}

// Features par plan
export const PLAN_ENTITLEMENTS: Record<PlanKey, string[]> = {
  free: ['guide_basic', 'path_create_1', 'codex_basic'],
  premium: [
    'guide_basic', 'guide_premium', 'path_create_unlimited',
    'codex_basic', 'codex_export_pdf', 'social_full', 'progression_full',
  ],
  founder: [
    'guide_basic', 'guide_premium', 'path_create_unlimited', 'circle_founder',
    'codex_basic', 'codex_export_pdf', 'codex_edition_full',
    'social_full', 'progression_full', 'founder_badge', 'analytics_basic',
  ],
}
