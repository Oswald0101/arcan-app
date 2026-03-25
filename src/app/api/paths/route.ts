// src/app/api/paths/route.ts
// GET /api/paths — exploration des voies publiques

import { NextRequest, NextResponse } from 'next/server'
import { getPublicPaths } from '@/lib/supabase/queries/paths'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const result = await getPublicPaths({
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 20),
    language: searchParams.get('language') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    canonicalType: searchParams.get('type') ?? undefined,
  })

  return NextResponse.json(result)
}
