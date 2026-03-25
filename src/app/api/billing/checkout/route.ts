// src/app/api/billing/checkout/route.ts
// Schema: providerSubscriptionId, providerCustomerId, stripePriceId (sur SubscriptionPlan)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, getCheckoutSuccessUrl, getCheckoutCancelUrl } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CheckoutSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('subscription'),
    planKey: z.enum(['premium', 'founder']),
  }),
  z.object({
    type: z.literal('product'),
    productId: z.string().uuid(),
  }),
])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 422 })

  // Récupérer le providerCustomerId existant
  const existingSub = await prisma.userSubscription.findFirst({
    where: { userId: user.id, providerCustomerId: { not: null } },
    select: { providerCustomerId: true },
  })

  let customerId = existingSub?.providerCustomerId

  if (!customerId) {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { displayName: true, username: true },
    })
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.displayName ?? profile?.username ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
  }

  try {
    if (parsed.data.type === 'subscription') {
      // SubscriptionPlan a un stripePriceId unique par ligne (monthly ou yearly séparé)
      const plans = await prisma.subscriptionPlan.findMany({
        where: { planKey: parsed.data.planKey, isActive: true, stripePriceId: { not: null } },
        orderBy: { billingPeriod: 'asc' },
      })
      if (!plans.length) return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })

      // Utiliser le premier plan trouvé (monthly par défaut)
      const plan = plans[0]
      if (!plan.stripePriceId) return NextResponse.json({ error: 'Prix non configuré' }, { status: 422 })

      // Vérifier abonnement actif existant
      const activeSub = await prisma.userSubscription.findFirst({
        where: { userId: user.id, status: { in: ['active', 'trialing'] }, providerSubscriptionId: { not: null } },
      })
      if (activeSub?.providerCustomerId) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: activeSub.providerCustomerId!,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnement`,
        })
        return NextResponse.json({ url: portalSession.url })
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: getCheckoutSuccessUrl('subscription'),
        cancel_url: getCheckoutCancelUrl('subscription'),
        metadata: { userId: user.id, planKey: parsed.data.planKey },
        subscription_data: { metadata: { userId: user.id } },
        allow_promotion_codes: true,
      })
      return NextResponse.json({ url: session.url, sessionId: session.id })

    } else {
      const product = await prisma.product.findFirst({
        where: { id: parsed.data.productId, isActive: true },
      })
      if (!product) return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
      if (!product.stripePriceId) return NextResponse.json({ error: 'Prix non configuré' }, { status: 422 })

      const alreadyBought = await prisma.purchase.count({
        where: { userId: user.id, productId: product.id, status: 'completed' },
      })
      if (alreadyBought > 0) return NextResponse.json({ error: 'Produit déjà acheté' }, { status: 409 })

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: product.stripePriceId, quantity: 1 }],
        success_url: getCheckoutSuccessUrl('product', product.id),
        cancel_url: getCheckoutCancelUrl('product'),
        metadata: { userId: user.id, productId: product.id },
      })
      return NextResponse.json({ url: session.url, sessionId: session.id })
    }
  } catch (err: any) {
    console.error('[Checkout] Stripe error:', err.message)
    return NextResponse.json({ error: 'Erreur de paiement' }, { status: 500 })
  }
}
