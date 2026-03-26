// src/components/guide/chat-window.tsx
// Refonte Ultra-Premium : Interface conversationnelle mystique immersive, glows, relief profond

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
      className="flex h-full flex-col relative"
      style={{
        background: 'linear-gradient(135deg, hsl(246 40% 3%) 0%, hsl(250 40% 5%) 100%)',
      }}
    >
      {/* Fond ambiant animé */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 80% at 50% 0%, hsl(265 60% 15% / 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'ambient 15s ease-in-out infinite',
        }}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-6 space-y-6 relative z-10"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >

        {/* État vide — immersif et mystique */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20 animate-fade-in">
            {/* Symbole guide avec glow */}
            <div
              className="text-6xl select-none animate-float"
              style={{
                color: 'hsl(38 52% 58%)',
                textShadow: '0 0 40px hsl(38 52% 58% / 0.40)',
                filter: 'drop-shadow(0 0 20px hsl(38 52% 58% / 0.30))',
              }}
            >
              ◎
            </div>
            <div className="space-y-3">
              <p 
                className="font-serif text-3xl font-medium"
                style={{
                  color: 'hsl(38 14% 95%)',
                  textShadow: '0 2px 8px hsl(246 40% 2% / 0.40)',
                }}
              >
                {guideName}
              </p>
              <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
                {guideType}
              </p>
            </div>
            <p className="text-base max-w-xs leading-relaxed font-medium" style={{ color: 'hsl(248 10% 48%)' }}>
              Commence quand tu veux. Ton Guide est présent pour t'accompagner.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 50, 250)}ms` }}
          >
            <MessageBubble message={msg} />
          </div>
        ))}

        {/* Typing indicator — ultra-premium */}
        {isLoading && messages[messages.length - 1]?.senderType === 'member' && (
          <div className="flex items-center gap-4 animate-fade-in">
            {/* Avatar guide */}
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-medium"
              style={{
                background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.18) 0%, hsl(38 52% 58% / 0.08) 100%)',
                border: '1.5px solid hsl(38 52% 58% / 0.30)',
                color: 'hsl(38 65% 72%)',
                boxShadow: '0 0 24px hsl(38 52% 58% / 0.15)',
              }}
            >
              ◎
            </div>
            {/* Typing dots avec glow */}
            <div
              className="flex gap-2 px-5 py-3.5 rounded-2xl rounded-tl-sm"
              style={{
                background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
                border: '1.5px solid hsl(38 35% 25% / 0.20)',
                boxShadow: '0 0 32px hsl(38 52% 58% / 0.08), inset 0 1px 0 hsl(248 100% 100% / 0.05)',
              }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2.5 w-2.5 rounded-full animate-bounce"
                  style={{
                    background: 'linear-gradient(to bottom, hsl(38 52% 58%), hsl(38 45% 48%))',
                    animationDelay: `${delay}ms`,
                    boxShadow: '0 0 8px hsl(38 52% 58% / 0.40)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '12px' }} />
      </div>

      {/* Erreur — ultra-visible */}
      {error && (
        <div
          className="mx-5 mb-4 flex items-center justify-between rounded-lg px-5 py-3.5 text-sm font-medium animate-fade-up relative z-10"
          style={{
            background: 'linear-gradient(135deg, hsl(0 70% 45% / 0.15) 0%, hsl(0 65% 40% / 0.08) 100%)',
            border: '1.5px solid hsl(0 70% 50% / 0.30)',
            color: 'hsl(0 70% 72%)',
            boxShadow: '0 0 24px hsl(0 70% 45% / 0.10)',
          }}
        >
          <span>⚠ {error}</span>
          <button
            onClick={clearError}
            className="ml-3 text-xs opacity-70 hover:opacity-100 transition-opacity font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input — zones de frappe 48px minimum */}
      <div
        className="px-5 py-5 relative z-10"
        style={{
          borderTop: '1.5px solid hsl(38 35% 25% / 0.15)',
          background: 'linear-gradient(to bottom, transparent, hsl(246 40% 2% / 0.30))',
          backdropFilter: 'blur(8px)',
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
