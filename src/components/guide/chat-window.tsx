'use client'

// src/components/guide/chat-window.tsx
// Refonte : Interface conversationnelle premium, mobile-first

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
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) loadConversation(conversationId)
  }, [conversationId, loadConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full flex-col" style={{ background: 'hsl(var(--background))' }}>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >

        {/* État vide — plus immersif */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-16 animate-fade-in">
            <div
              className="text-5xl select-none animate-float"
              style={{ color: 'hsl(38 52% 58% / 0.35)' }}
            >
              ◎
            </div>
            <div className="space-y-2">
              <p className="font-serif text-2xl font-medium" style={{ color: 'hsl(38 22% 88%)' }}>
                {guideName}
              </p>
              <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 50%)' }}>
                {guideType}
              </p>
            </div>
            <p className="text-base max-w-xs leading-relaxed" style={{ color: 'hsl(248 10% 45%)' }}>
              Commence quand tu veux. Ton Guide est présent pour t'accompagner.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
          >
            <MessageBubble message={msg} />
          </div>
        ))}

        {/* Typing indicator — plus visible */}
        {isLoading && messages[messages.length - 1]?.senderType === 'member' && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-medium"
              style={{
                background: 'hsl(38 52% 58% / 0.10)',
                border: '1px solid hsl(38 52% 58% / 0.20)',
                color: 'hsl(38 52% 65%)',
              }}
            >
              ◎
            </div>
            <div
              className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2 w-2 rounded-full animate-bounce"
                  style={{
                    background: 'hsl(38 52% 58%)',
                    animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '8px' }} />
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="mx-4 mb-3 flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium animate-fade-up"
          style={{
            background: 'hsl(0 70% 45% / 0.12)',
            border: '1px solid hsl(0 70% 45% / 0.25)',
            color: 'hsl(0 70% 68%)',
          }}
        >
          <span>⚠ {error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input — zones de frappe augmentées */}
      <div
        className="px-4 py-4"
        style={{
          borderTop: '1px solid hsl(248 22% 14%)',
          background: 'hsl(var(--background))',
        }}
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
