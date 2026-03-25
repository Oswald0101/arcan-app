// src/app/api/admin/stats/route.ts
// GET /api/admin/stats — stats du dashboard (pour refresh côté client si besoin)

import { NextResponse } from 'next/server'
import { getAdminContext } from '@/lib/admin/permissions'
import { getDashboardStats } from '@/lib/admin/queries'

export async function GET() {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const stats = await getDashboardStats()
  return NextResponse.json({ stats })
}
