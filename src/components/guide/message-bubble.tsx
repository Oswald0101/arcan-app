'use client'

// src/components/guide/message-bubble.tsx
// Refonte : Bulles de chat premium, lisibilité mobile

import type { ChatMessage } from '@/hooks/use-guide-chat'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMember = message.senderType === 'member'

  return (
    <div className={`flex items-end gap-3 ${isMember ? 'justify-end' : 'justify-start'}`}>

      {/* Avatar guide */}
      {!isMember && (
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm select-none mb-1 font-medium"
          style={{
            background: 'hsl(38 52% 58% / 0.12)',
            border: '1px solid hsl(38 52% 58% / 0.22)',
            color: 'hsl(38 52% 65%)',
            boxShadow: '0 0 12px hsl(38 52% 58% / 0.08)',
          }}
        >
          ◎
        </div>
      )}

      {/* Bulle — zones de frappe et lisibilité augmentées */}
      <div
        className="max-w-[82%] rounded-2xl px-4 py-3.5 text-base leading-relaxed"
        style={
          isMember
            ? {
                background: 'hsl(38 52% 58% / 0.14)',
                border: '1px solid hsl(38 52% 58% / 0.24)',
                color: 'hsl(38 22% 92%)',
                borderBottomRightRadius: '6px',
                boxShadow: '0 2px 8px hsl(38 52% 58% / 0.08)',
              }
            : {
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid hsl(248 22% 16%)',
                color: 'hsl(38 22% 88%)',
                borderBottomLeftRadius: '6px',
                boxShadow: 'inset 0 1px 0 hsl(248 100% 100% / 0.04)',
              }
        }
      >
        {message.isStreaming && !message.content ? (
          <span style={{ color: 'hsl(248 10% 50%)' }}>…</span>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
    </div>
  )
}
