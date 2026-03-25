// src/hooks/use-guide-chat.ts
// Hook principal du chat guide côté client

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatRequest } from '@/types/guide'

export interface ChatMessage {
  id: string
  senderType: 'member' | 'guide' | 'system'
  content: string
  createdAt: Date
  isStreaming?: boolean
}

interface GuideChatState {
  conversationId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export function useGuideChat(initialConversationId?: string) {
  const [state, setState] = useState<GuideChatState>({
    conversationId: initialConversationId ?? null,
    messages: [],
    isLoading: false,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  // Charger l'historique d'une conversation existante
  const loadConversation = useCallback(async (conversationId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const res = await fetch(`/api/guide/conversations?id=${conversationId}`)
      if (!res.ok) throw new Error('Conversation introuvable')

      const data = await res.json()
      const messages: ChatMessage[] = data.messages.map((m: any) => ({
        id: m.id,
        senderType: m.senderType,
        content: m.content,
        createdAt: new Date(m.createdAt),
      }))

      setState((prev) => ({
        ...prev,
        conversationId,
        messages,
        isLoading: false,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Impossible de charger la conversation',
      }))
    }
  }, [])

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return

    // Optimistic update — ajouter le message du membre immédiatement
    const tempMemberMsgId = `temp-member-${Date.now()}`
    const tempGuideMsgId = `temp-guide-${Date.now()}`

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [
        ...prev.messages,
        {
          id: tempMemberMsgId,
          senderType: 'member',
          content,
          createdAt: new Date(),
        },
        {
          id: tempGuideMsgId,
          senderType: 'guide',
          content: '',
          createdAt: new Date(),
          isStreaming: true,
        },
      ],
    }))

    abortRef.current = new AbortController()

    try {
      const request: ChatRequest = {
        conversationId: state.conversationId,
        message: content,
      }

      const res = await fetch('/api/guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error ?? 'Erreur serveur')
      }

      const data = await res.json()

      // Remplacer les messages temporaires par les vrais
      setState((prev) => ({
        ...prev,
        isLoading: false,
        conversationId: data.conversationId,
        messages: prev.messages.map((msg) => {
          if (msg.id === tempGuideMsgId) {
            return {
              id: data.messageId,
              senderType: 'guide' as const,
              content: data.content,
              createdAt: new Date(),
              isStreaming: false,
            }
          }
          if (msg.id === tempMemberMsgId) {
            return { ...msg, isStreaming: false }
          }
          return msg
        }),
      }))
    } catch (err: any) {
      if (err.name === 'AbortError') return

      // Rollback du message guide temporaire
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message ?? 'Erreur lors de l\'envoi',
        messages: prev.messages.filter(
          (m) => m.id !== tempGuideMsgId,
        ).map((m) =>
          m.id === tempMemberMsgId ? { ...m, isStreaming: false } : m,
        ),
      }))
    }
  }, [state.isLoading, state.conversationId])

  // Nouvelle conversation
  const newConversation = useCallback(() => {
    abortRef.current?.abort()
    setState({
      conversationId: null,
      messages: [],
      isLoading: false,
      error: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  return {
    ...state,
    loadConversation,
    sendMessage,
    newConversation,
    clearError,
  }
}
