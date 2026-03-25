// src/components/social/direct-chat-window.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useDirectChat } from '@/hooks/use-direct-chat'

interface DirectChatWindowProps {
  conversationId: string
  currentUserId: string
  otherUsername: string
}

export function DirectChatWindow({
  conversationId,
  currentUserId,
  otherUsername,
}: DirectChatWindowProps) {
  const { messages, isLoading, isSending, error, sendMessage } = useDirectChat(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = inputRef.current
    if (!input?.value.trim()) return
    const content = input.value.trim()
    input.value = ''
    input.style.height = 'auto'
    await sendMessage(content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  function adjustHeight(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">Chargement…</p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderUserId === currentUserId || msg.senderUserId === 'me'
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-foreground text-background rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`mt-1 text-right text-[10px] ${isOwn ? 'text-background/50' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                  {isOwn && msg.isRead && ' · Lu'}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Erreur */}
      {error && (
        <p className="mx-4 mb-1 text-xs text-destructive">{error}</p>
      )}

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            onChange={adjustHeight}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            placeholder={`Message à @${otherUsername}…`}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-[120px]"
          />
          <button
            type="submit"
            disabled={isSending}
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-foreground text-background disabled:opacity-30 hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
              <path d="M2 8l12-6-6 12V8H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
