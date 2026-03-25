// src/app/api/guide/memory/route.ts
// GET : mémoire active / DELETE : désactiver un item

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadActiveMemory } from '@/lib/ai/memory'
import { getGuideForUser } from '@/lib/supabase/queries/guide'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guide = await getGuideForUser(user.id)
  if (!guide) return NextResponse.json({ memoryItems: [] })

  const items = await loadActiveMemory(user.id, guide.id)
  return NextResponse.json({ memoryItems: items })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { itemId } = await request.json()
  if (!itemId) return NextResponse.json({ error: 'itemId requis' }, { status: 400 })

  // Vérifier que l'item appartient bien à cet utilisateur
  const item = await prisma.guideMemoryItem.findFirst({
    where: { id: itemId, userId: user.id },
  })
  if (!item) return NextResponse.json({ error: 'Item introuvable' }, { status: 404 })

  await prisma.guideMemoryItem.update({
    where: { id: itemId },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
