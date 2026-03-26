// src/components/onboarding/onboarding-flow.tsx
// Client Component principal — orchestre le flow complet d'onboarding
// Refonte : UX immersive, mobile-first, scroll management

'use client'

import { useEffect, useRef } from 'react'
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

  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-clear error après 5s
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(clearError, 5000)
    return () => clearTimeout(timer)
  }, [error, clearError])

  // Scroll au top quand le bloc change (fix pour le scroll qui ne revient pas)
  useEffect(() => {
    if (containerRef.current && !isLoading && !isGenerating && !isComplete) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentBloc, isLoading, isGenerating, isComplete])

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
    <div ref={containerRef} className="space-y-8">
      {/* Barre de progression */}
      <ProgressBar
        currentBloc={currentBloc}
        totalBlocs={TOTAL_BLOCS}
        lang={lang}
      />

      {/* Header intro pour le premier bloc */}
      {currentBloc === 1 && (
        <div className="space-y-4 text-center animate-fade-up">
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: 'hsl(38 52% 58% / 0.08)',
              border: '1px solid hsl(38 52% 58% / 0.20)',
              color: 'hsl(38 52% 65%)',
            }}
          >
            ◯
          </div>
          <div>
            <h1
              className="font-serif text-3xl font-medium"
              style={{ color: 'hsl(38 14% 92%)' }}
            >
              {lang === 'fr'
                ? 'Ta Voie commence ici.'
                : lang === 'en'
                ? 'Your Path starts here.'
                : lang === 'es'
                ? 'Tu Camino comienza aquí.'
                : 'Seu Caminho começa aqui.'}
            </h1>
            <p className="text-base mt-3" style={{ color: 'hsl(248 10% 50%)' }}>
              {lang === 'fr'
                ? 'Réponds honnêtement. Plus tes réponses sont sincères, plus ta Voie sera juste et utile.'
                : lang === 'en'
                ? 'Answer honestly. The more sincere your answers, the more relevant your Path will be.'
                : lang === 'es'
                ? 'Responde honestamente. Cuanto más sinceras sean tus respuestas, más relevante será tu Camino.'
                : 'Responda honestamente. Quanto mais sinceras suas respostas, mais relevante será seu Caminho.'}
            </p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm animate-fade-up"
          style={{
            background: 'hsl(0 70% 45% / 0.1)',
            border: '1px solid hsl(0 70% 45% / 0.2)',
            color: 'hsl(0 70% 65%)',
          }}
        >
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
