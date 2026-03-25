// src/app/api/messages/route.ts
// GET /api/messages — liste des conversations

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserConversations } from '@/lib/supabase/queries/social'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const conversations = await getUserConversations(user.id)
  return NextResponse.json({ conversations })
}
