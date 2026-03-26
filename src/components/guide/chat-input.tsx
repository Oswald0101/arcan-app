'use client'

// src/components/guide/chat-input.tsx
// Refonte : Input premium, zones de frappe augmentées, mobile-first

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
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
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
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { setValue(e.target.value); adjustHeight() }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? 'Écrire un message…'}
        rows={1}
        className="textarea flex-1 resize-none max-h-[200px] overflow-y-auto"
        style={{
          fontSize: '16px',
          minHeight: '44px',
          paddingTop: '12px',
          paddingBottom: '12px',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !hasContent}
        className="flex-shrink-0 rounded-lg transition-all duration-200 active:scale-95"
        style={{
          background: hasContent ? 'hsl(38 52% 58%)' : 'hsl(248 28% 11%)',
          color: hasContent ? 'hsl(246 40% 5%)' : 'hsl(248 10% 40%)',
          border: hasContent ? '1px solid hsl(38 52% 58%)' : '1px solid hsl(248 22% 16%)',
          boxShadow: hasContent ? '0 4px 12px hsl(38 52% 58% / 0.25)' : 'none',
          padding: '12px 14px',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-label="Envoyer"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 16 16">
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
