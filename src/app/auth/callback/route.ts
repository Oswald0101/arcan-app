// src/app/auth/callback/route.ts
// Échange le code Supabase, garantit le profil, redirige

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/accueil'
  const inviteCode = searchParams.get('invite')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const supabase = await createClient()
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`)
  }

  const userId = data.user.id

  // UNE seule passe Prisma en parallèle — évite la saturation du pool sur cold start
  // .catch(() => null/0) : si timeout, on redirige vers onboarding plutôt que crasher
  const [profile, consentCount] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: { onboardingCompleted: true },
    }).catch(() => null),
    prisma.legalConsent.count({
      where: { userId, consentType: { in: ['terms', 'privacy', 'age_18'] } },
    }).catch(() => 0),
  ])

  // OAuth sans consentements → consent page
  if (consentCount < 3) {
    const url = new URL(`${origin}/auth/consent`)
    if (inviteCode) url.searchParams.set('invite', inviteCode)
    return NextResponse.redirect(url.toString())
  }

  // Onboarding non complété
  if (!profile?.onboardingCompleted) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  const destination = inviteCode
    ? `${origin}${next}?invite=${inviteCode}`
    : `${origin}${next}`

  return NextResponse.redirect(destination)
}
