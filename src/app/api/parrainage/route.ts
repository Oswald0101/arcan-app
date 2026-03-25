// src/app/api/parrainage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInviteCode, getUserInvites, getUserReferralStats } from '@/lib/billing/referral'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [stats, invites] = await Promise.all([
    getUserReferralStats(user.id),
    getUserInvites(user.id),
  ])
  return NextResponse.json({ stats, invites })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const code = await generateInviteCode(user.id)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?invite=${code}`
    return NextResponse.json({ code, inviteUrl })
  } catch (err: any) {
    if (err.message === 'INVITE_LIMIT_REACHED') {
      return NextResponse.json({ error: 'Limite d\'invitations atteinte (10 max)' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
