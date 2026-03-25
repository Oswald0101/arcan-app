'use client'

import { useEffect, useState } from 'react'

interface GenerationScreenProps {
  lang?: string
}

const STEPS: Record<string, { text: string; symbol: string }[]> = {
  fr: [
    { text: 'Lecture de tes réponses…',      symbol: '◦' },
    { text: 'Composition de ta Voie…',        symbol: '◉' },
    { text: 'Création de ton Guide…',         symbol: '◎' },
    { text: 'Rédaction de ton Manifeste…',    symbol: '✦' },
    { text: 'Initialisation de ton Codex…',   symbol: '◈' },
    { text: 'Ta Voie est tracée.',            symbol: '◯' },
  ],
  en: [
    { text: 'Reading your answers…',          symbol: '◦' },
    { text: 'Composing your Path…',           symbol: '◉' },
    { text: 'Creating your Guide…',           symbol: '◎' },
    { text: 'Writing your Manifesto…',        symbol: '✦' },
    { text: 'Initializing your Codex…',       symbol: '◈' },
    { text: 'Your Path is traced.',           symbol: '◯' },
  ],
}

export function GenerationScreen({ lang = 'fr' }: GenerationScreenProps) {
  const steps = STEPS[lang] ?? STEPS['fr']
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering')

  useEffect(() => {
    if (currentStep >= steps.length - 1) return
    const timer = setTimeout(() => {
      setPhase('exiting')
      setTimeout(() => {
        setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
        setPhase('entering')
        setTimeout(() => setPhase('visible'), 50)
      }, 300)
    }, 2400)
    return () => clearTimeout(timer)
  }, [currentStep, steps.length])

  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 50)
    return () => clearTimeout(t)
  }, [])

  const step = steps[currentStep]
  const isFinal = currentStep === steps.length - 1

  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4"
      style={{ userSelect: 'none' }}
    >
      {/* Orbite principale */}
      <div className="relative flex items-center justify-center mb-12">

        {/* Anneau externe rotatif */}
        <div
          className="absolute h-32 w-32 rounded-full"
          style={{
            border: '1px solid hsl(38 52% 58% / 0.12)',
            animation: 'spin-slow 20s linear infinite',
          }}
        />

        {/* Anneau moyen pulsant */}
        <div
          className="absolute h-20 w-20 rounded-full"
          style={{
            border: '1px solid hsl(38 52% 58% / 0.25)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Orbes en orbite */}
        <div
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            background: 'hsl(38 52% 65%)',
            boxShadow: '0 0 8px hsl(38 52% 65%)',
            animation: 'orbit 8s linear infinite',
          }}
        />
        <div
          className="absolute h-1 w-1 rounded-full"
          style={{
            background: 'hsl(38 52% 50%)',
            animation: 'orbit 13s linear infinite reverse',
          }}
        />

        {/* Centre */}
        <div
          className="relative h-16 w-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500"
          style={{
            background: 'radial-gradient(circle, hsl(38 52% 58% / 0.15) 0%, hsl(38 52% 58% / 0.03) 70%)',
            border: '1px solid hsl(38 52% 58% / 0.3)',
            color: 'hsl(38 52% 68%)',
            boxShadow: '0 0 24px hsl(38 52% 58% / 0.12), inset 0 0 16px hsl(38 52% 58% / 0.05)',
            opacity: phase === 'exiting' ? 0.4 : 1,
            transform: phase === 'exiting' ? 'scale(0.9)' : 'scale(1)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {step.symbol}
        </div>
      </div>

      {/* Texte principal */}
      <div
        className="space-y-3 mb-10"
        style={{
          opacity: phase === 'entering' ? 0 : phase === 'exiting' ? 0 : 1,
          transform: phase === 'entering' ? 'translateY(10px)' : phase === 'exiting' ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <h2
          className="font-serif text-3xl font-medium"
          style={{ color: 'hsl(38 22% 90%)' }}
        >
          {lang === 'fr' ? 'Ta Voie prend forme' : 'Your Path is taking shape'}
        </h2>
        <p
          className="text-sm"
          style={{ color: 'hsl(248 8% 52%)' }}
        >
          {step.text}
        </p>
      </div>

      {/* Étapes visuelles */}
      <div className="space-y-2.5 w-full max-w-xs">
        {steps.map((s, idx) => {
          const done = idx < currentStep
          const active = idx === currentStep
          return (
            <div
              key={idx}
              className="flex items-center gap-3 text-xs transition-all duration-500"
              style={{
                opacity: done ? 0.5 : active ? 1 : 0.2,
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-500"
                style={{
                  background: done
                    ? 'hsl(38 52% 50%)'
                    : active
                    ? 'hsl(38 52% 65%)'
                    : 'hsl(248 16% 25%)',
                  boxShadow: active ? '0 0 6px hsl(38 52% 58%)' : 'none',
                }}
              />
              <span style={{ color: active ? 'hsl(38 22% 85%)' : 'hsl(248 8% 48%)' }}>
                {s.text}
              </span>
              {done && (
                <span className="ml-auto" style={{ color: 'hsl(38 52% 50%)' }}>✓</span>
              )}
            </div>
          )
        })}
      </div>

      {isFinal && (
        <div
          className="mt-10 animate-fade-up"
          style={{ color: 'hsl(38 52% 62%)' }}
        >
          <p className="font-serif text-lg italic">« Le chemin commence ici »</p>
        </div>
      )}
    </div>
  )
}
