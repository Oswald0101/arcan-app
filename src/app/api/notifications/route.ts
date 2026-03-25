// src/app/api/notifications/route.ts
// Schema: isRead (bool), pas de channel/status/actionUrl

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, getUnreadCount, markAllAsRead } from '@/lib/notifications/service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, { limit: 30 }),
    getUnreadCount(user.id),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await markAllAsRead(user.id)
  return NextResponse.json({ success: true })
}
