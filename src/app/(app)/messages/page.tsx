// src/app/messages/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserConversations } from '@/lib/supabase/queries/social'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages — Voie' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const conversations = await getUserConversations(user.id)

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
      <h1 className="text-xl font-medium">Messages</h1>

      {conversations.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-muted-foreground text-sm">Aucun message pour l&apos;instant.</p>
          <p className="text-xs text-muted-foreground">
            Pour envoyer un message, rends-toi sur le profil d&apos;un contact.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv: any) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/40"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-sm font-medium overflow-hidden">
                {conv.otherProfile?.avatarUrl ? (
                  <img src={conv.otherProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (conv.otherProfile?.displayName ?? conv.otherProfile?.username ?? '?').slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {conv.otherProfile?.displayName ?? `@${conv.otherProfile?.username}`}
                  </p>
                  {conv.lastMessageAt && (
                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(new Date(conv.lastMessageAt))}
                    </p>
                  )}
                </div>
                {conv.lastMessagePreview && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessagePreview}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 86400000) return date.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return date.toLocaleDateString('fr', { weekday: 'short' })
  return date.toLocaleDateString('fr', { day: 'numeric', month: 'short' })
}
