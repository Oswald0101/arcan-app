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
    <div
      className="flex h-full flex-col bg-immersive-chat"
      style={{ position: 'relative' }}
    >
      {/* Halo décoratif fond chat */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(265 55% 12% / 0.35) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Zone messages */}
      <div
        ref={messagesContainerRef}
        className="relative flex-1 overflow-y-auto px-4 py-6 space-y-5"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', zIndex: 1 }}
      >
        {/* État vide immersif */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-16 animate-fade-in">
            {/* Orbe animée */}
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <div style={{
                position: 'absolute', inset: -20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsl(38 54% 62% / 0.15) 0%, transparent 70%)',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }} />
              <div
                className="animate-float"
                style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, hsl(38 54% 62% / 0.20), hsl(265 55% 30% / 0.12))',
                  border: '1px solid hsl(38 54% 62% / 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', color: 'hsl(38 60% 68%)',
                  boxShadow: '0 0 30px hsl(38 54% 62% / 0.15)',
                }}
              >
                ◎
              </div>
            </div>

            <div className="space-y-2">
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '26px', fontWeight: 300,
                  color: 'hsl(38 14% 90%)',
                }}
              >
                {guideName}
              </p>
              <p className="text-sm" style={{ color: 'hsl(248 10% 48%)' }}>
                {guideType}
              </p>
            </div>

            <div className="sep-diamond" style={{ width: '60%' }}>◆</div>

            <p
              className="text-base max-w-xs leading-relaxed"
              style={{ color: 'hsl(248 10% 46%)' }}
            >
              Commence quand tu veux.{'\n'}Ton Guide est présent.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 35, 180)}ms` }}
          >
            <MessageBubble message={msg} />
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.senderType === 'member' && (
          <div className="flex items-end gap-2.5 animate-fade-in">
            <div style={{
              width: 30, height: 30, flexShrink: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, hsl(38 54% 62% / 0.18), hsl(265 55% 30% / 0.10))',
              border: '1px solid hsl(38 54% 62% / 0.22)',
              color: 'hsl(38 60% 68%)',
              fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              ◎
            </div>
            <div className="bubble-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '4px' }} />
      </div>

      {/* Erreur */}
      {error && (
        <div
          className="relative mx-4 mb-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm animate-fade-up"
          style={{
            background: 'hsl(0 70% 45% / 0.10)',
            border: '1px solid hsl(0 70% 45% / 0.22)',
            color: 'hsl(0 70% 68%)',
            zIndex: 2,
          }}
        >
          <span>⚠ {error}</span>
          <button onClick={clearError} className="ml-2 text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Barre input flottante */}
      <div
        style={{
          position: 'relative',
          padding: '12px 16px 16px',
          background: 'hsl(248 35% 5% / 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid hsl(248 22% 14%)',
          zIndex: 2,
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
