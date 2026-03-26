'use client'

import type { ChatMessage } from '@/hooks/use-guide-chat'

interface MessageBubbleProps {
  message: ChatMessage
}

function formatTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMember = message.senderType === 'member'
  const time = formatTime((message as any).createdAt ?? (message as any).timestamp)

  return (
    <div className={`flex flex-col ${isMember ? 'items-end' : 'items-start'} gap-1`}>
      <div className={`flex items-end gap-2 ${isMember ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar guide */}
        {!isMember && (
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs select-none mb-0.5"
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
          className="max-w-[78%] rounded-2xl px-4 py-3 leading-relaxed"
          style={
            isMember
              ? {
                  fontSize: '15px',
                  background: 'hsl(38 52% 58% / 0.14)',
                  border: '1px solid hsl(38 52% 58% / 0.22)',
                  color: 'hsl(38 22% 92%)',
                  borderBottomRightRadius: '6px',
                }
              : {
                  fontSize: '15px',
                  background: 'hsl(var(--surface-elevated))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(38 14% 88%)',
                  borderBottomLeftRadius: '6px',
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

      {/* Timestamp */}
      {time && (
        <span
          className="text-[11px] px-1"
          style={{ color: 'hsl(248 8% 38%)' }}
        >
          {time}
        </span>
      )}
    </div>
  )
}
