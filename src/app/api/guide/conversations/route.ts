// src/app/api/guide/conversations/route.ts
// GET : liste des conversations + GET conversation avec messages

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserConversations,
  getConversationWithMessages,
  getGuideForUser,
} from '@/lib/supabase/queries/guide'

// GET /api/guide/conversations — liste des conversations
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const conversationId = request.nextUrl.searchParams.get('id')
  const guide = await getGuideForUser(user.id)
  if (!guide) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

  // GET avec id = conversation spécifique avec ses messages
  if (conversationId) {
    const data = await getConversationWithMessages(conversationId, user.id)
    if (!data) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })
    return NextResponse.json(data)
  }

  // GET sans id = liste des conversations
  const conversations = await getUserConversations(user.id, guide.id)
  return NextResponse.json({ conversations })
}
