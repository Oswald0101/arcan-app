// src/app/api/progression/route.ts
// GET /api/progression — progression complète du membre

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserMemberProgress,
  getUserChallengeLogs,
  getUserBadges,
} from '@/lib/supabase/queries/progression'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [memberProgress, activeChallenges, badges, pathProgresses] = await Promise.all([
    getUserMemberProgress(user.id),
    getUserChallengeLogs(user.id, { status: 'in_progress', limit: 10 }),
    getUserBadges(user.id),
    prisma.userPathProgress.findMany({
      where: { userId: user.id },
      include: { currentRank: true, path: { select: { name: true, slug: true } } },
    }),
  ])

  return NextResponse.json({
    memberProgress,
    activeChallenges,
    badges,
    pathProgresses,
  })
}
