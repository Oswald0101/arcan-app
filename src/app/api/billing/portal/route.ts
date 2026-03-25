// src/app/api/billing/portal/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Schema: providerCustomerId (pas stripeCustomerId)
  const sub = await prisma.userSubscription.findFirst({
    where: { userId: user.id, providerCustomerId: { not: null } },
    select: { providerCustomerId: true },
  })
  if (!sub?.providerCustomerId) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.providerCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnement`,
  })

  return NextResponse.json({ url: portalSession.url })
}
