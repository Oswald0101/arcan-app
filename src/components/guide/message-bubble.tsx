'use client'

// src/components/guide/message-bubble.tsx
// Refonte Ultra-Premium : Bulles de chat premium avec relief, glows et ambiance mystique

import type { ChatMessage } from '@/hooks/use-guide-chat'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMember = message.senderType === 'member'

  return (
    <div className={`flex items-end gap-4 ${isMember ? 'justify-end' : 'justify-start'}`}>

      {/* Avatar guide — ultra-premium */}
      {!isMember && (
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm select-none mb-1 font-medium group"
          style={{
            background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.18) 0%, hsl(38 52% 58% / 0.08) 100%)',
            border: '1.5px solid hsl(38 52% 58% / 0.30)',
            color: 'hsl(38 65% 72%)',
            boxShadow: '0 0 24px hsl(38 52% 58% / 0.15), inset 0 1px 0 hsl(38 100% 90% / 0.08)',
          }}
        >
          ◎
        </div>
      )}

      {/* Bulle — relief profond et glows */}
      <div
        className="max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed font-medium animate-fade-up"
        style={
          isMember
            ? {
                /* Bulle utilisateur — or subtil */
                background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.16) 0%, hsl(38 52% 58% / 0.08) 100%)',
                border: '1.5px solid hsl(38 52% 58% / 0.32)',
                color: 'hsl(38 22% 94%)',
                borderBottomRightRadius: '8px',
                boxShadow: '0 4px 16px hsl(38 52% 58% / 0.12), inset 0 1px 0 hsl(38 100% 90% / 0.10)',
              }
            : {
                /* Bulle guide — surface élevée avec glow violet */
                background: 'linear-gradient(135deg, hsl(248 32% 12%) 0%, hsl(250 30% 10%) 100%)',
                border: '1.5px solid hsl(38 35% 25% / 0.20)',
                color: 'hsl(38 14% 94%)',
                borderBottomLeftRadius: '8px',
                boxShadow: 'inset 0 1px 0 hsl(248 100% 100% / 0.06), 0 4px 16px hsl(246 40% 2% / 0.40), 0 0 32px hsl(265 60% 50% / 0.06)',
              }
        }
      >
        {message.isStreaming && !message.content ? (
          <span style={{ color: 'hsl(248 10% 52%)', fontWeight: 500 }}>…</span>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
    </div>
  )
}
