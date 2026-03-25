// src/hooks/use-contacts.ts
'use client'

import { useState, useCallback } from 'react'

interface ContactsState {
  contacts: any[]
  pendingReceived: any[]
  pendingSent: any[]
  blockedUsers: any[]
  isLoading: boolean
  error: string | null
}

export function useContacts() {
  const [state, setState] = useState<ContactsState>({
    contacts: [],
    pendingReceived: [],
    pendingSent: [],
    blockedUsers: [],
    isLoading: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch('/api/contacts')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setState({ ...data, isLoading: false, error: null })
    } catch {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Impossible de charger les contacts' }))
    }
  }, [])

  return { ...state, refresh }
}
