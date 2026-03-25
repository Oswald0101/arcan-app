// src/app/api/paths/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPathBySlug } from '@/lib/supabase/queries/paths'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const path = await getPathBySlug(slug, user?.id)
  if (!path) return NextResponse.json({ error: 'Voie introuvable' }, { status: 404 })

  // Masquer le contenu si voie privée et non-membre
  const isMember = path.userMembership?.status === 'active'
  const isFounder = path.founderUserId === user?.id
  const isPrivate = path.visibility === 'private'

  if (isPrivate && !isMember && !isFounder) {
    return NextResponse.json({
      id: path.id,
      slug: path.slug,
      name: path.name,
      canonicalType: path.canonicalType,
      customTypeLabel: path.customTypeLabel,
      visibility: path.visibility,
      admissionMode: path.admissionMode,
      memberCount: path.memberCount,
      userMembership: path.userMembership,
      isLocked: true,
    })
  }

  return NextResponse.json(path)
}
