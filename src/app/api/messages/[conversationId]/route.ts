// src/app/api/messages/[conversationId]/route.ts
// GET : messages d'une conversation

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversationMessages, markMessagesAsRead } from '@/lib/supabase/queries/social'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const messages = await getConversationMessages(conversationId, user.id, { limit: 50 })

    // Marquer les messages comme lus silencieusement
    markMessagesAsRead(conversationId, user.id).catch(() => {})

    return NextResponse.json({ messages })
  } catch (err: any) {
    if (err.message === 'CONVERSATION_NOT_FOUND') {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
