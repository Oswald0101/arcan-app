'use client'

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
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => { setValue(e.target.value); adjustHeight() }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? 'Écrire un message…'}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm leading-relaxed outline-none max-h-[180px] overflow-y-auto transition-all duration-200"
        style={{
          background: 'hsl(var(--input))',
          border: `1px solid ${hasContent ? 'hsl(38 52% 58% / 0.3)' : 'hsl(var(--border-bright))'}`,
          color: 'hsl(var(--foreground))',
        }}
      />
      <button
        type="submit"
        disabled={disabled || !hasContent}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-30"
        style={{
          background: hasContent ? 'hsl(var(--accent))' : 'hsl(var(--surface-elevated))',
          color: hasContent ? 'hsl(var(--accent-foreground))' : 'hsl(248 8% 45%)',
          border: '1px solid hsl(var(--border-bright))',
          boxShadow: hasContent ? '0 0 12px hsl(38 52% 58% / 0.2)' : 'none',
        }}
        aria-label="Envoyer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
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
