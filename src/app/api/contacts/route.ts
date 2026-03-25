// src/app/api/contacts/route.ts
// GET /api/contacts — contacts + demandes en attente

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getContacts,
  getPendingRequestsReceived,
  getPendingRequestsSent,
  getBlockedUsers,
} from '@/lib/supabase/queries/social'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [contacts, receivedRequests, sentRequests, blockedUsers] = await Promise.all([
    getContacts(user.id),
    getPendingRequestsReceived(user.id),
    getPendingRequestsSent(user.id),
    getBlockedUsers(user.id),
  ])

  return NextResponse.json({
    contacts,
    pendingReceived: receivedRequests,
    pendingSent: sentRequests,
    blockedUsers,
  })
}
