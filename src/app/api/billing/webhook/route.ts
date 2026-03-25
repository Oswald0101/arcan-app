// src/app/api/billing/webhook/route.ts
// Webhook Stripe — schema: providerSubscriptionId, providerCustomerId, providerPaymentId

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, constructStripeEvent, HANDLED_EVENTS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import {
  applySubscriptionEntitlements,
  revokeAllSubscriptionEntitlements,
  applyPurchaseEntitlements,
} from '@/lib/billing/entitlements'
import { activateReferral } from '@/lib/billing/referral'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = constructStripeEvent(body, signature)
  } catch (err: any) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (!HANDLED_EVENTS.includes(event.type as any)) {
    return NextResponse.json({ received: true })
  }

  try {
    await handleStripeEvent(event)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`[Webhook] Erreur ${event.type}:`, err)
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 })
  }
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await syncSubscription(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        await syncSubscription(sub)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await prisma.userSubscription.updateMany({
          where: { providerSubscriptionId: invoice.subscription as string },
          data: { status: 'past_due' },
        })
      }
      break
    }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId
  if (!userId) return

  if (session.mode === 'subscription') {
    // customer.subscription.created va suivre — on stocke juste le customerId
    if (session.customer) {
      await prisma.userSubscription.updateMany({
        where: { userId },
        data: { providerCustomerId: session.customer as string },
      })
    }
  } else if (session.mode === 'payment') {
    const productId = session.metadata?.productId
    if (!productId) return

    const product = await prisma.product.findFirst({ where: { id: productId } })
    if (!product) return

    const paymentIntentId = session.payment_intent as string

    // findFirst + create/update car providerPaymentId n'est pas @unique
    const existing = await prisma.purchase.findFirst({
      where: { providerPaymentId: paymentIntentId, userId },
    })

    let purchase
    if (existing) {
      purchase = await prisma.purchase.update({
        where: { id: existing.id },
        data: { status: 'completed', purchasedAt: new Date() },
      })
    } else {
      purchase = await prisma.purchase.create({
        data: {
          userId,
          productId,
          providerPaymentId: paymentIntentId,
          provider: 'stripe',
          status: 'completed',
          amountPaid: product.priceAmount,
          purchasedAt: new Date(),
        },
      })
    }

    await applyPurchaseEntitlements({
      userId,
      purchaseId: purchase.id,
      productKey: product.productKey,
      productType: product.productType,
    })

    await tryActivateReferral(userId)
  }
}

async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const priceId = sub.items.data[0]?.price.id
  if (!priceId) return

  const plan = await prisma.subscriptionPlan.findFirst({ where: { stripePriceId: priceId } })
  if (!plan) {
    console.error(`[Webhook] Aucun plan pour priceId: ${priceId}`)
    return
  }

  const existingRecord = await prisma.userSubscription.findFirst({
    where: { providerCustomerId: customerId },
    select: { userId: true },
  })
  const userId = existingRecord?.userId ?? (sub.metadata?.userId as string | undefined)
  if (!userId) return

  const statusMap: Record<string, string> = {
    active: 'active', trialing: 'trialing', past_due: 'past_due',
    canceled: 'canceled', unpaid: 'past_due',
    incomplete: 'past_due', incomplete_expired: 'expired', paused: 'expired',
  }
  const internalStatus = statusMap[sub.status] ?? 'expired'
  const periodEnd = new Date(sub.current_period_end * 1000)

  // findFirst + update/create car providerSubscriptionId n'est pas @unique
  const existingSub = await prisma.userSubscription.findFirst({
    where: { providerSubscriptionId: sub.id },
  })

  let subscription
  if (existingSub) {
    subscription = await prisma.userSubscription.update({
      where: { id: existingSub.id },
      data: {
        planId: plan.id,
        status: internalStatus as any,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        providerCustomerId: customerId,
        updatedAt: new Date(),
      },
    })
  } else {
    subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: internalStatus as any,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        providerSubscriptionId: sub.id,
        providerCustomerId: customerId,
        provider: 'stripe',
      },
    })
  }

  if (['active', 'trialing'].includes(internalStatus)) {
    await applySubscriptionEntitlements({
      userId,
      subscriptionId: subscription.id,
      planKey: plan.planKey as any,
      activeUntil: periodEnd,
    })
    if (plan.planKey !== 'free') await tryActivateReferral(userId)
  } else if (['canceled', 'expired'].includes(internalStatus)) {
    await revokeAllSubscriptionEntitlements({
      userId,
      subscriptionId: subscription.id,
      planKey: plan.planKey as any,
    })
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const dbSub = await prisma.userSubscription.findFirst({
    where: { providerSubscriptionId: sub.id },
    include: { plan: true },
  })
  if (!dbSub) return

  await prisma.userSubscription.update({
    where: { id: dbSub.id },
    data: { status: 'canceled', updatedAt: new Date() },
  })
  await revokeAllSubscriptionEntitlements({
    userId: dbSub.userId,
    subscriptionId: dbSub.id,
    planKey: dbSub.plan.planKey as any,
  })
}

async function tryActivateReferral(userId: string): Promise<void> {
  try { await activateReferral(userId) } catch {}
}
