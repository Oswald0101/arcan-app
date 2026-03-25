// src/lib/stripe/index.ts

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export function getCheckoutSuccessUrl(type: 'subscription' | 'product', id?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL!
  if (type === 'subscription') return `${base}/abonnement?success=1`
  return `${base}/boutique?success=1&product=${id ?? ''}`
}

export function getCheckoutCancelUrl(type: 'subscription' | 'product'): string {
  const base = process.env.NEXT_PUBLIC_APP_URL!
  return type === 'subscription' ? `${base}/abonnement?cancelled=1` : `${base}/boutique?cancelled=1`
}

// Schema: providerCustomerId (pas stripeCustomerId)
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  displayName?: string | null,
): Promise<string> {
  const { prisma } = await import('@/lib/prisma')

  const sub = await prisma.userSubscription.findFirst({
    where: { userId, providerCustomerId: { not: null } },
    select: { providerCustomerId: true },
  })
  if (sub?.providerCustomerId) return sub.providerCustomerId

  const customer = await stripe.customers.create({
    email,
    name: displayName ?? undefined,
    metadata: { userId },
  })
  return customer.id
}

export function constructStripeEvent(body: Buffer | string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
}

export const HANDLED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payment_intent.succeeded',
] as const

export type HandledStripeEvent = typeof HANDLED_EVENTS[number]
