// src/app/api/cercles/[circleId]/members/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCircleMembers, getMembership } from '@/lib/supabase/queries/paths'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circleId: string }> },
) {
  const { circleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Vérifier membership
  const membership = await getMembership(circleId, user.id)
  if (!membership || membership.status !== 'active') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const result = await getCircleMembers(circleId, { page, limit: 30 })

  return NextResponse.json(result)
}
