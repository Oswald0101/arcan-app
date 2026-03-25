// src/hooks/use-onboarding.ts
// Hook principal du flow d'onboarding côté client

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  initOrResumeOnboarding,
  saveOnboardingAnswer,
  advanceToBloc,
  generateOnboardingResult,
} from '@/lib/onboarding/actions'
import type { AnswerPayload, OnboardingState } from '@/types/onboarding'
import { TOTAL_BLOCS } from '@/lib/onboarding/questions'

const INITIAL_STATE: OnboardingState = {
  sessionId: null,
  currentBloc: 1,
  answers: {},
  isGenerating: false,
  isComplete: false,
  error: null,
}

export function useOnboarding() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE)
  const [isLoading, setIsLoading] = useState(true)

  // Init ou reprise de session au montage
  useEffect(() => {
    let mounted = true

    async function init() {
      const result = await initOrResumeOnboarding()
      if (!mounted) return

      if (result.success && result.data) {
        const { sessionId, currentBloc, answeredKeys } = result.data

        // Reconstruit un état partiel depuis les clés répondues
        // Les valeurs réelles ne sont pas rechargées — juste les clés
        // pour savoir quelles questions ont été répondues
        const answersFromKeys: Record<string, AnswerPayload> = {}
        for (const key of answeredKeys) {
          answersFromKeys[key] = { questionKey: key, questionType: 'free_text' }
        }

        setState((prev) => ({
          ...prev,
          sessionId,
          currentBloc,
          answers: answersFromKeys,
        }))
      } else {
        setState((prev) => ({ ...prev, error: result.error }))
      }

      setIsLoading(false)
    }

    init()
    return () => { mounted = false }
  }, [])

  // Sauvegarder une réponse sans changer de bloc
  const saveAnswer = useCallback(
    async (payload: AnswerPayload): Promise<boolean> => {
      if (!state.sessionId) return false

      const result = await saveOnboardingAnswer(state.sessionId, payload)
      if (!result.success) {
        setState((prev) => ({ ...prev, error: result.error }))
        return false
      }

      setState((prev) => ({
        ...prev,
        answers: { ...prev.answers, [payload.questionKey]: payload },
        error: null,
      }))
      return true
    },
    [state.sessionId],
  )

  // Passer au bloc suivant
  const nextBloc = useCallback(async () => {
    if (!state.sessionId) return

    const next = state.currentBloc + 1

    if (next >= TOTAL_BLOCS) {
      // Bloc 8 = génération finale
      setState((prev) => ({ ...prev, isGenerating: true, error: null }))
      const result = await generateOnboardingResult(state.sessionId)

      if (result.success) {
        setState((prev) => ({ ...prev, isGenerating: false, isComplete: true }))
        router.push('/onboarding/resultat')
      } else {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: result.error,
        }))
      }
      return
    }

    await advanceToBloc(state.sessionId, next)
    setState((prev) => ({ ...prev, currentBloc: next, error: null }))
  }, [state.sessionId, state.currentBloc, router])

  // Revenir au bloc précédent
  const prevBloc = useCallback(async () => {
    if (!state.sessionId || state.currentBloc <= 1) return
    const prev = state.currentBloc - 1
    await advanceToBloc(state.sessionId, prev)
    setState((prevState) => ({ ...prevState, currentBloc: prev, error: null }))
  }, [state.sessionId, state.currentBloc])

  // Sauvegarde + avance (bouton "Continuer")
  const saveAndContinue = useCallback(
    async (answers: AnswerPayload[]): Promise<boolean> => {
      if (!state.sessionId) return false

      // Sauvegarder toutes les réponses du bloc en séquence
      for (const answer of answers) {
        const ok = await saveAnswer(answer)
        if (!ok) return false
      }

      await nextBloc()
      return true
    },
    [state.sessionId, saveAnswer, nextBloc],
  )

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const progress = (state.currentBloc - 1) / (TOTAL_BLOCS - 1)

  return {
    ...state,
    isLoading,
    progress,
    saveAnswer,
    saveAndContinue,
    nextBloc,
    prevBloc,
    clearError,
  }
}
