// src/hooks/use-session.ts
// Hook client pour accéder à la session et écouter les changements auth

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  onboardingCompleted: boolean
  currentLevel: number
  currentXp: number
  verificationStatus: string
  isPublic: boolean
}

interface SessionState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      const data = await res.json()
      return data.profile as Profile
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Session initiale
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted) return

      if (user) {
        const profile = await fetchProfile(user.id)
        setState({ user, profile, loading: false, error: null })
      } else {
        setState({ user: null, profile: null, loading: false, error: null })
      }
    })

    // Écoute les changements d'auth (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({ user: session.user, profile, loading: false, error: null })
        } else {
          setState({ user: null, profile: null, loading: false, error: null })
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const refresh = useCallback(async () => {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    setState((prev) => ({ ...prev, profile }))
  }, [state.user, fetchProfile])

  return { ...state, refresh }
}
