'use client'

import type { ChatMessage } from '@/hooks/use-guide-chat'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMember = message.senderType === 'member'

  return (
    <div className={`flex items-end gap-2 ${isMember ? 'justify-end' : 'justify-start'}`}>

      {/* Avatar guide */}
      {!isMember && (
        <div
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs select-none mb-0.5"
          style={{
            background: 'hsl(38 52% 58% / 0.08)',
            border: '1px solid hsl(38 52% 58% / 0.2)',
            color: 'hsl(38 52% 62%)',
          }}
        >
          ◎
        </div>
      )}

      {/* Bulle */}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isMember
            ? {
                background: 'hsl(38 52% 58% / 0.12)',
                border: '1px solid hsl(38 52% 58% / 0.2)',
                color: 'hsl(38 22% 90%)',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(38 22% 86%)',
                borderBottomLeftRadius: '4px',
              }
        }
      >
        {message.isStreaming && !message.content ? (
          <span style={{ color: 'hsl(248 8% 45%)' }}>…</span>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  )
}
