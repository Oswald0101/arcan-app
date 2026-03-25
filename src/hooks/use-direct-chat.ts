// src/hooks/use-direct-chat.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
import { sendMessageAction } from '@/lib/social/actions'
import type { DirectMessage } from '@/types/social'

interface DirectChatState {
  messages: DirectMessage[]
  isLoading: boolean
  isSending: boolean
  error: string | null
}

export function useDirectChat(conversationId: string | null) {
  const [state, setState] = useState<DirectChatState>({
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
  })

  const loadMessages = useCallback(async (convId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch(`/api/messages/${convId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setState((prev) => ({ ...prev, messages: data.messages, isLoading: false }))
    } catch {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Impossible de charger les messages' }))
    }
  }, [])

  useEffect(() => {
    if (conversationId) loadMessages(conversationId)
  }, [conversationId, loadMessages])

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!conversationId || !content.trim()) return false

    const tempId = `temp-${Date.now()}`
    setState((prev) => ({
      ...prev,
      isSending: true,
      messages: [
        ...prev.messages,
        {
          id: tempId,
          conversationId,
          senderUserId: 'me',
          content,
          isRead: false,
          createdAt: new Date(),
        },
      ],
    }))

    const result = await sendMessageAction({ conversationId, content })

    if (result.success && result.data) {
      setState((prev) => ({
        ...prev,
        isSending: false,
        messages: prev.messages.map((m) =>
          m.id === tempId ? { ...m, id: result.data!.messageId } : m,
        ),
      }))
      return true
    } else {
      setState((prev) => ({
        ...prev,
        isSending: false,
        error: result.error,
        messages: prev.messages.filter((m) => m.id !== tempId),
      }))
      return false
    }
  }, [conversationId])

  return { ...state, loadMessages, sendMessage }
}
