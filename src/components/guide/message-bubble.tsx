'use client'

// src/components/guide/message-bubble.tsx
// Bulles premium : glassmorphism guide, gradient user, timestamps

import type { ChatMessage } from '@/hooks/use-guide-chat'

interface MessageBubbleProps {
  message: ChatMessage
}

function formatTime(date: Date | string | undefined) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMember = message.senderType === 'member'
  const time = formatTime((message as any).createdAt)

  if (isMember) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bubble-user">
          {message.isStreaming && !message.content ? (
            <span style={{ color: 'hsl(248 10% 55%)' }}>…</span>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        {time && (
          <span style={{ fontSize: '11px', color: 'hsl(248 10% 36%)', paddingRight: 4 }}>
            {time}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-end gap-2.5">
        {/* Orbe guide */}
        <div
          className="flex-shrink-0 flex items-center justify-center select-none"
          style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, hsl(38 54% 62% / 0.18), hsl(265 55% 30% / 0.10))',
            border: '1px solid hsl(38 54% 62% / 0.22)',
            color: 'hsl(38 60% 68%)',
            fontSize: '13px',
            boxShadow: '0 0 10px hsl(38 54% 62% / 0.10)',
            marginBottom: 2,
          }}
        >
          ◎
        </div>
        <div className="bubble-guide">
          {message.isStreaming && !message.content ? (
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      </div>
      {time && (
        <span style={{ fontSize: '11px', color: 'hsl(248 10% 36%)', paddingLeft: 40 }}>
          {time}
        </span>
      )}
    </div>
  )
}
