'use client'

// src/components/guide/chat-input.tsx
// Refonte Ultra-Premium : Input conversationnel avec zones de frappe 48px et glows

import { useState, useRef } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { setValue(e.target.value); adjustHeight() }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? 'Écrire un message…'}
        rows={1}
        className="textarea flex-1 resize-none max-h-[240px] overflow-y-auto"
        style={{
          fontSize: '16px',
          minHeight: '48px',
          paddingTop: '14px',
          paddingBottom: '14px',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !hasContent}
        className="flex-shrink-0 rounded-lg transition-all duration-250 active:scale-95 hover:brightness-110"
        style={{
          background: hasContent 
            ? 'linear-gradient(160deg, hsl(38 65% 68%) 0%, hsl(38 55% 58%) 100%)'
            : 'linear-gradient(135deg, hsl(248 28% 11%) 0%, hsl(248 26% 9%) 100%)',
          color: hasContent ? 'hsl(246 40% 5%)' : 'hsl(248 10% 42%)',
          border: hasContent 
            ? '1.5px solid hsl(38 52% 58% / 0.40)'
            : '1.5px solid hsl(248 22% 18%)',
          boxShadow: hasContent 
            ? '0 6px 20px hsl(38 52% 58% / 0.30), 0 0 16px hsl(38 52% 58% / 0.12)'
            : '0 2px 8px hsl(246 40% 2% / 0.20)',
          padding: '14px 16px',
          minWidth: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 600,
        }}
        aria-label="Envoyer"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 16 16">
          <path
            d="M2 8l12-6-6 12V8H2z"
            stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  )
}
