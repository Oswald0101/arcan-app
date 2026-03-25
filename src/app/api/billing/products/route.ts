// src/app/api/billing/products/route.ts
// GET /api/billing/products — catalogue des produits one-shot

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveProducts, getUserPurchases } from '@/lib/supabase/queries/billing'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const type = request.nextUrl.searchParams.get('type') ?? undefined

  const [products, purchases] = await Promise.all([
    getActiveProducts(type),
    user ? getUserPurchases(user.id) : Promise.resolve([]),
  ])

  const ownedIds = new Set(purchases.map((p: any) => p.productId))

  return NextResponse.json({
    products: products.map((p: any) => ({
      ...p,
      alreadyOwned: ownedIds.has(p.id),
    })),
  })
}
