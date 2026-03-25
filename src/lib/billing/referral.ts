// src/lib/billing/referral.ts
// Logique de parrainage — aligné sur schema.prisma réel
// Schema: inviteCode, invitedEmail, acceptedAt, InviteStatus: pending/accepted/expired/cancelled

import { prisma } from '@/lib/prisma'
import { grantPremiumDays } from './entitlements'

const INVITE_EXPIRY_DAYS = 30
const MAX_ACTIVE_INVITES = 10

const REFERRAL_REWARD = {
  inviter: { days: 30 },
  invitee: { days: 14 },
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function generateInviteCode(inviterUserId: string): Promise<string> {
  const activeCount = await prisma.invite.count({
    where: {
      inviterUserId,
      status: 'pending',
      expiresAt: { gt: new Date() },
    },
  })
  if (activeCount >= MAX_ACTIVE_INVITES) throw new Error('INVITE_LIMIT_REACHED')

  // Générer un code unique
  let code = generateCode()
  let attempt = 0
  while (attempt < 10) {
    const exists = await prisma.invite.findFirst({ where: { inviteCode: code } })
    if (!exists) break
    code = generateCode()
    attempt++
  }

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000)
  await prisma.invite.create({
    data: { inviterUserId, inviteCode: code, expiresAt, status: 'pending' },
  })

  return code
}

export async function useInviteCode(code: string, newUserId: string): Promise<void> {
  const invite = await prisma.invite.findFirst({
    where: {
      inviteCode: code.toUpperCase(),
      status: 'pending',
      expiresAt: { gt: new Date() },
      acceptedUserId: null,
    },
  })
  if (!invite || invite.inviterUserId === newUserId) return

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      status: 'accepted',
      acceptedUserId: newUserId,
      acceptedAt: new Date(),
    },
  })
}

export async function activateReferral(userId: string): Promise<void> {
  const invite = await prisma.invite.findFirst({
    where: { acceptedUserId: userId, status: 'accepted' },
  })
  if (!invite) return

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { onboardingCompleted: true },
  })
  if (!profile?.onboardingCompleted) return

  const hasPaidActivity = await checkHasPaidActivity(userId)
  if (!hasPaidActivity) return

  // Créer les récompenses
  const reward = await prisma.referralReward.create({
    data: {
      inviteId: invite.id,
      inviterUserId: invite.inviterUserId,
      inviteeUserId: userId,
      rewardType: 'premium_days',
      rewardValue: REFERRAL_REWARD.inviter.days,
      isGranted: false,
    },
  })

  // Appliquer les récompenses
  await Promise.all([
    grantPremiumDays({
      userId: invite.inviterUserId,
      days: REFERRAL_REWARD.inviter.days,
      sourceId: reward.id,
      source: 'referral',
    }),
    grantPremiumDays({
      userId,
      days: REFERRAL_REWARD.invitee.days,
      sourceId: reward.id,
      source: 'referral',
    }),
  ])

  await prisma.referralReward.update({
    where: { id: reward.id },
    data: { isGranted: true, grantedAt: new Date() },
  })
}

async function checkHasPaidActivity(userId: string): Promise<boolean> {
  const [sub, purchase] = await Promise.all([
    prisma.userSubscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
      include: { plan: { select: { planKey: true } } },
    }),
    prisma.purchase.findFirst({ where: { userId, status: 'completed' } }),
  ])
  const isFreePlan = sub?.plan?.planKey === 'free'
  return Boolean((sub && !isFreePlan) || purchase)
}

export async function getUserInvites(userId: string) {
  return prisma.invite.findMany({
    where: { inviterUserId: userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function getUserReferralStats(userId: string) {
  const [invitesSent, invitesActivated, rewardsEarned] = await Promise.all([
    prisma.invite.count({ where: { inviterUserId: userId } }),
    prisma.invite.count({ where: { inviterUserId: userId, status: 'accepted' } }),
    prisma.referralReward.count({ where: { inviterUserId: userId, isGranted: true } }),
  ])
  return { invitesSent, invitesActivated, rewardsEarned }
}
