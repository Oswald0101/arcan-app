// src/app/api/billing/plans/route.ts
// GET /api/billing/plans — liste des plans avec indication du plan actif

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActivePlans, getActiveSubscription } from '@/lib/supabase/queries/billing'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [plans, activeSub] = await Promise.all([
    getActivePlans(),
    user ? getActiveSubscription(user.id) : Promise.resolve(null),
  ])

  return NextResponse.json({
    plans,
    activePlanKey: activeSub?.plan?.planKey ?? 'free',
    activeSubStatus: activeSub?.status ?? null,
    periodEnd: activeSub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: activeSub?.cancelAtPeriodEnd ?? false,
  })
}
