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

      {/* Header intro — premier bloc uniquement */}
      {currentBloc === 1 && (
        <div className="space-y-5 text-center animate-fade-up pb-2">
          {/* Ligne dorée décorative */}
          <div className="divider-gold" />
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(32px, 9vw, 48px)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'hsl(38 14% 93%)',
            }}
          >
            {lang === 'fr' ? 'Ta Voie\ncommence ici.' : lang === 'en' ? 'Your Path\nstarts here.' : lang === 'es' ? 'Tu Camino\ncomienza aquí.' : 'Seu Caminho\ncomeça aqui.'}
          </h1>
          <p className="text-base leading-relaxed max-w-xs mx-auto" style={{ color: 'hsl(248 10% 48%)' }}>
            {lang === 'fr'
              ? 'Réponds honnêtement. Plus tu es sincère, plus ta Voie sera juste.'
              : 'Answer honestly. The more sincere, the more relevant your Path.'}
          </p>
          <div className="divider-gold" />
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
