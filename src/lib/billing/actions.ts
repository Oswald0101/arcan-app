// src/lib/billing/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserBillingSummary } from '@/lib/supabase/queries/billing'
import { generateInviteCode } from './referral'
import { z } from 'zod'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export async function checkoutSubscriptionAction(input: {
  planKey: 'premium' | 'founder'
  billingPeriod?: 'monthly' | 'yearly'
}): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription',
        planKey: input.planKey,
        billingPeriod: input.billingPeriod ?? 'monthly',
      }),
    })
    const data = await res.json()
    if (!data.url) return { success: false, error: 'Erreur Stripe' }
    return { success: true, data: { url: data.url } }
  } catch {
    return { success: false, error: 'Erreur de connexion' }
  }
}

export async function checkoutProductAction(productId: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'product', productId }),
    })
    const data = await res.json()
    if (!data.url) return { success: false, error: data.error ?? 'Erreur Stripe' }
    return { success: true, data: { url: data.url } }
  } catch {
    return { success: false, error: 'Erreur de connexion' }
  }
}

export async function openBillingPortalAction(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/portal`, { method: 'POST' })
    const data = await res.json()
    if (!data.url) return { success: false, error: 'Erreur portail' }
    return { success: true, data: { url: data.url } }
  } catch {
    return { success: false, error: 'Erreur de connexion' }
  }
}

export async function getBillingSummaryAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getUserBillingSummary(user.id)
}

export async function generateInviteAction(): Promise<ActionResult<{ code: string; url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  try {
    const code = await generateInviteCode(user.id)
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?invite=${code}`
    return { success: true, data: { code, url } }
  } catch (err: any) {
    return {
      success: false,
      error: err.message === 'INVITE_LIMIT_REACHED'
        ? 'Limite d\'invitations atteinte (10 max)'
        : 'Erreur lors de la génération',
    }
  }
}
