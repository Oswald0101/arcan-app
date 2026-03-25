// src/app/api/guide/chat/route.ts
// POST /api/guide/chat — endpoint principal du chat guide

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGuideForUser } from '@/lib/supabase/queries/guide'
import { processGuideMessage } from '@/lib/guide/service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().nullable().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Requête invalide', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { message, conversationId } = parsed.data

  // Récupérer le guide du membre
  const guide = await getGuideForUser(user.id)
  if (!guide) {
    return NextResponse.json(
      { error: 'Aucun guide trouvé. Complète l\'onboarding.' },
      { status: 404 },
    )
  }

  // Récupérer la langue du membre
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { language: true },
  })
  const language = profile?.language ?? 'fr'

  try {
    const result = await processGuideMessage(
      user.id,
      guide.id,
      { message, conversationId: conversationId ?? null },
      language,
    )

    return NextResponse.json(result)
  } catch (err) {
    console.error('[Guide chat error]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 },
    )
  }
}
