// src/app/messages/[conversationId]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConversationMessages } from '@/lib/supabase/queries/social'
import { getUserConversations } from '@/lib/supabase/queries/social'
import { DirectChatWindow } from '@/components/social/direct-chat-window'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ conversationId: string }>
}

export const metadata: Metadata = { title: 'Message — Voie' }

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Récupérer la conversation et vérifier que l'utilisateur en est participant
  const conversations = await getUserConversations(user.id)
  const conv = conversations.find((c: any) => c.id === conversationId)
  if (!conv) notFound()

  const otherUsername = conv.otherProfile?.username ?? 'membre'

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground">
          ←
        </Link>
        <Link href={`/profils/${otherUsername}`} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium overflow-hidden flex-shrink-0">
            {conv.otherProfile?.avatarUrl ? (
              <img src={conv.otherProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (conv.otherProfile?.displayName ?? otherUsername).slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{conv.otherProfile?.displayName ?? `@${otherUsername}`}</p>
            <p className="text-xs text-muted-foreground">@{otherUsername}</p>
          </div>
        </Link>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <DirectChatWindow
          conversationId={conversationId}
          currentUserId={user.id}
          otherUsername={otherUsername}
        />
      </div>
    </div>
  )
}
