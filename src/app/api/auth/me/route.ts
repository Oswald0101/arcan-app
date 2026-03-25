// src/app/api/auth/me/route.ts
// Retourne le profil de l'utilisateur connecté

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId, getUserPreferences } from '@/lib/supabase/queries/users'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const [profile, preferences, memberProgress] = await Promise.all([
    getProfileByUserId(user.id),
    getUserPreferences(user.id),
    prisma.userMemberProgress.findUnique({
      where: { userId: user.id },
      include: { currentLevel: true },
    }),
  ])

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    preferences,
    memberProgress,
  })
}
