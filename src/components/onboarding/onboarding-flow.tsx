// src/components/onboarding/onboarding-flow.tsx
// Client Component principal — orchestre le flow complet d'onboarding

'use client'

import { useEffect } from 'react'
import { useOnboarding } from '@/hooks/use-onboarding'
import { BlocForm } from './bloc-form'
import { ProgressBar } from './progress-bar'
import { GenerationScreen } from './generation-screen'
import { getBlocQuestions, TOTAL_BLOCS } from '@/lib/onboarding/questions'
import type { AnswerPayload } from '@/types/onboarding'

interface OnboardingFlowProps {
  lang: 'fr' | 'en' | 'es' | 'pt'
}

export function OnboardingFlow({ lang }: OnboardingFlowProps) {
  const {
    sessionId,
    currentBloc,
    answers,
    isLoading,
    isGenerating,
    isComplete,
    error,
    saveAndContinue,
    prevBloc,
    clearError,
  } = useOnboarding()

  // Auto-clear error après 5s
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(clearError, 5000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Chargement…' : 'Loading…'}
        </div>
      </div>
    )
  }

  if (isGenerating || isComplete) {
    return <GenerationScreen lang={lang} />
  }

  // Écran d'introduction (avant le bloc 1)
  if (!sessionId) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Initialisation…' : 'Initializing…'}
        </p>
      </div>
    )
  }

  const questions = getBlocQuestions(currentBloc)

  return (
    <div className="space-y-8">
      {/* Barre de progression */}
      <ProgressBar
        currentBloc={currentBloc}
        totalBlocs={TOTAL_BLOCS}
        lang={lang}
      />

      {/* Header intro pour le premier bloc */}
      {currentBloc === 1 && (
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">
            {lang === 'fr'
              ? 'Ta Voie commence ici.'
              : lang === 'en'
              ? 'Your Path starts here.'
              : lang === 'es'
              ? 'Tu Camino comienza aquí.'
              : 'Seu Caminho começa aqui.'}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lang === 'fr'
              ? 'Réponds honnêtement. Plus tes réponses sont sincères, plus ta Voie sera juste et utile.'
              : lang === 'en'
              ? 'Answer honestly. The more sincere your answers, the more relevant your Path will be.'
              : lang === 'es'
              ? 'Responde honestamente. Cuanto más sinceras sean tus respuestas, más relevante será tu Camino.'
              : 'Responda honestamente. Quanto mais sinceras suas respostas, mais relevante será seu Caminho.'}
          </p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Questions du bloc courant */}
      <BlocForm
        bloc={currentBloc}
        totalBlocs={TOTAL_BLOCS}
        questions={questions}
        lang={lang}
        initialAnswers={answers}
        isSubmitting={isGenerating}
        onSubmit={async (blocAnswers: AnswerPayload[]) => {
          await saveAndContinue(blocAnswers)
        }}
        onBack={prevBloc}
        showBack={currentBloc > 1}
      />
    </div>
  )
}
