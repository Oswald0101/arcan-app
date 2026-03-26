// Client Component principal — orchestre le flow complet d'onboarding
// Refonte Ultra-Premium : Typographie Serif, ambiance mystique, progression lumineuse

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
        <div className="text-sm text-muted-foreground animate-fade-in">
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
      <div className="space-y-6 text-center animate-fade-in">
        <p className="text-sm text-muted-foreground">
          {lang === 'fr' ? 'Initialisation…' : 'Initializing…'}
        </p>
      </div>
    )
  }

  const questions = getBlocQuestions(currentBloc)

  return (
    <div ref={containerRef} className="space-y-10">
      {/* Barre de progression — ultra-premium */}
      <ProgressBar
        currentBloc={currentBloc}
        totalBlocs={TOTAL_BLOCS}
        lang={lang}
      />

      {/* Header intro pour le premier bloc — mystique élégant */}
      {currentBloc === 1 && (
        <div className="space-y-6 text-center animate-fade-up">
          {/* Symbole guide avec glow */}
          <div
            className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.16) 0%, hsl(38 52% 58% / 0.08) 100%)',
              border: '1.5px solid hsl(38 52% 58% / 0.30)',
              color: 'hsl(38 65% 72%)',
              boxShadow: '0 0 40px hsl(38 52% 58% / 0.20), inset 0 1px 0 hsl(38 100% 90% / 0.10)',
            }}
          >
            ◯
          </div>
          <div className="space-y-4">
            <h1
              className="font-serif text-4xl font-medium"
              style={{
                color: 'hsl(38 14% 95%)',
                textShadow: '0 4px 12px hsl(246 40% 2% / 0.35)',
              }}
            >
              {lang === 'fr'
                ? 'Ta Voie commence ici.'
                : lang === 'en'
                ? 'Your Path starts here.'
                : lang === 'es'
                ? 'Tu Camino comienza aquí.'
                : 'Seu Caminho começa aqui.'}
            </h1>
            <p className="text-base font-medium leading-relaxed max-w-md mx-auto" style={{ color: 'hsl(248 10% 52%)' }}>
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

      {/* Erreur — ultra-visible */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 text-sm font-medium animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, hsl(0 70% 45% / 0.15) 0%, hsl(0 65% 40% / 0.08) 100%)',
            border: '1.5px solid hsl(0 70% 50% / 0.30)',
            color: 'hsl(0 70% 72%)',
            boxShadow: '0 0 24px hsl(0 70% 45% / 0.10)',
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
