// src/hooks/use-progression.ts
'use client'

import { useState, useCallback } from 'react'
import type { UserMemberProgress, UserPathProgress, Badge } from '@/types/paths'

interface ProgressionState {
  memberProgress: UserMemberProgress | null
  pathProgresses: (UserPathProgress & { path: { name: string; slug: string } })[]
  badges: (Badge & { earnedAt: Date })[]
  isLoading: boolean
  error: string | null
}

export function useProgression() {
  const [state, setState] = useState<ProgressionState>({
    memberProgress: null,
    pathProgresses: [],
    badges: [],
    isLoading: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch('/api/progression')
      if (!res.ok) throw new Error('Erreur')
      const data = await res.json()
      setState({
        memberProgress: data.memberProgress,
        pathProgresses: data.pathProgresses,
        badges: data.badges?.map((b: any) => ({ ...b.badge, earnedAt: new Date(b.earnedAt) })) ?? [],
        isLoading: false,
        error: null,
      })
    } catch {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Impossible de charger la progression' }))
    }
  }, [])

  return { ...state, refresh }
}
