'use client'

import { useEffect, useRef } from 'react'
import { useGuideChat } from '@/hooks/use-guide-chat'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'

interface ChatWindowProps {
  guideName: string
  guideType: string
  conversationId?: string
}

export function ChatWindow({ guideName, guideType, conversationId }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, loadConversation, clearError } =
    useGuideChat(conversationId)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) loadConversation(conversationId)
  }, [conversationId, loadConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full flex-col">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {/* État vide */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-16 animate-fade-in">
            <div
              className="text-4xl select-none animate-float"
              style={{ color: 'hsl(38 52% 58% / 0.4)' }}
            >
              ◎
            </div>
            <div className="space-y-1.5">
              <p className="font-serif text-xl font-medium" style={{ color: 'hsl(38 22% 85%)' }}>
                {guideName}
              </p>
              <p className="text-sm" style={{ color: 'hsl(248 8% 45%)' }}>
                {guideType}
              </p>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'hsl(248 8% 40%)' }}>
              Commence quand tu veux. Ton Guide est présent.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
          >
            <MessageBubble message={msg} />
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.senderType === 'member' && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{
                background: 'hsl(38 52% 58% / 0.08)',
                border: '1px solid hsl(38 52% 58% / 0.18)',
                color: 'hsl(38 52% 60%)',
              }}
            >
              ◎
            </div>
            <div
              className="flex gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
              style={{
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 rounded-full animate-bounce"
                  style={{
                    background: 'hsl(248 8% 45%)',
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="mx-4 mb-2 flex items-center justify-between rounded-xl px-3 py-2 text-sm"
          style={{
            background: 'hsl(0 70% 45% / 0.1)',
            border: '1px solid hsl(0 70% 45% / 0.2)',
            color: 'hsl(0 70% 65%)',
          }}
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid hsl(var(--border))' }}
      >
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder={`Message à ${guideName}…`}
        />
      </div>
    </div>
  )
}
