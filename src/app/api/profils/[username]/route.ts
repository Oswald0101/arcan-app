// src/app/api/profils/[username]/route.ts
// GET /api/profils/:username — lecture d'un profil public

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPublicProfile } from '@/lib/supabase/queries/profiles'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await getPublicProfile(username, user?.id)

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json({ profile })
}
