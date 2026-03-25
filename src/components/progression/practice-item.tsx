// src/components/progression/practice-item.tsx
'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { completePracticeAction } from '@/lib/paths/actions'
import type { Practice } from '@/types/paths'

interface PracticeItemProps {
  practice: Practice
  pathId?: string
  isDoneToday?: boolean
  onComplete?: (update: any) => void
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdo',
  monthly: 'Mensuel',
  custom: 'Libre',
}

// Libellé du type + placeholder de réponse
const TYPE_CONFIG: Record<string, { label: string; placeholder: string; requiresText: boolean }> = {
  corporelle: {
    label: 'Pratique corporelle',
    placeholder: "Qu'as-tu fait concrètement ? Comment ton corps a-t-il répondu ?",
    requiresText: true,
  },
  journal: {
    label: 'Journal',
    placeholder: "Écris ce qui t'a traversé. Sois honnête, même si c'est court.",
    requiresText: true,
  },
  lecture: {
    label: 'Lecture intentionnelle',
    placeholder: "Ce que tu retiens. Comment cela s'applique-t-il à toi ?",
    requiresText: true,
  },
  meditation: {
    label: 'Méditation / concentration',
    placeholder: "Sur quoi t'es-tu tenu ? Qu'as-tu ressenti ou observé ?",
    requiresText: true,
  },
  epreuve: {
    label: 'Épreuve',
    placeholder: 'Ce que cette épreuve a révélé en toi. Sois précis.',
    requiresText: true,
  },
  simple: {
    label: '',
    placeholder: 'Une réflexion courte… (optionnel)',
    requiresText: false,
  },
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

type Phase = 'idle' | 'active' | 'responding' | 'done'

export function PracticeItem({ practice, pathId, isDoneToday, onComplete }: PracticeItemProps) {
  const [isPending, startTransition] = useTransition()
  const [phase, setPhase] = useState<Phase>(isDoneToday ? 'done' : 'idle')
  const [responseText, setResponseText] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [guideQuestion, setGuideQuestion] = useState<string | null>(null)
  const [xpResult, setXpResult] = useState<{ awarded: number; score: number } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const config = TYPE_CONFIG[practice.validationType] ?? TYPE_CONFIG.simple
  const minSec = practice.minDurationSeconds
  const timerRequired = minSec > 0
  const responseRequired = config.requiresText

  // Timer
  useEffect(() => {
    if (phase === 'active') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  const timerProgress = timerRequired ? Math.min(elapsed / minSec, 1) : 1
  const timerReady = !timerRequired || elapsed >= minSec

  function handleStart() {
    setElapsed(0)
    setPhase('active')
  }

  function handleStopAndRespond() {
    setPhase('responding')
  }

  function handleSubmit() {
    if (isPending) return
    setError(null)

    // Validation minimale côté client
    if (responseRequired && responseText.trim().length < 20) {
      setError('Ta réponse est trop courte. Développe un peu plus.')
      return
    }

    startTransition(async () => {
      const result = await completePracticeAction({
        practiceId: practice.id,
        pathId,
        elapsedSeconds: elapsed,
        responseText: responseText.trim() || null,
      })

      if (result.success && result.data) {
        const { xpAwarded, guideQuestion: gq, score } = result.data as any
        setPhase('done')
        setXpResult({ awarded: xpAwarded ?? 0, score: score ?? 0 })
        setGuideQuestion(gq ?? null)
        onComplete?.(result.data)
      } else if (!result.success) {
        setError(result.error)
      }
    })
  }

  // ── Pratique déjà faite ──────────────────────────────────
  if (phase === 'done') {
    return (
      <div
        className="rounded-2xl p-4 space-y-2"
        style={{ background: 'hsl(248 28% 8%)', border: '1px solid hsl(248 22% 14%)' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: 'hsl(148 50% 42%)', fontSize: '15px' }}>✓</span>
          <p className="text-sm line-through" style={{ color: 'hsl(248 10% 40%)' }}>
            {practice.title}
          </p>
          {xpResult !== null && xpResult.awarded > 0 && (
            <span
              className="ml-auto text-xs font-semibold"
              style={{ color: 'hsl(38 55% 58%)' }}
            >
              +{xpResult.awarded} XP
            </span>
          )}
          {xpResult !== null && xpResult.awarded === 0 && (
            <span className="ml-auto text-xs" style={{ color: 'hsl(248 10% 38%)' }}>
              0 XP
            </span>
          )}
        </div>

        {guideQuestion && (
          <div
            className="rounded-xl px-3 py-2.5"
            style={{ background: 'hsl(248 32% 11%)', border: '1px solid hsl(38 30% 22% / 0.4)' }}
          >
            <p className="text-xs italic" style={{ color: 'hsl(38 45% 60%)' }}>
              ✦ {guideQuestion}
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Phase idle — présentation de la pratique ─────────────
  if (phase === 'idle') {
    return (
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: 'hsl(248 28% 8%)', border: '1px solid hsl(248 22% 16%)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            {config.label && (
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'hsl(38 40% 45%)' }}>
                {config.label}
              </p>
            )}
            <p className="text-sm font-medium" style={{ color: 'hsl(38 14% 90%)' }}>
              {practice.title}
            </p>
            <p className="text-xs" style={{ color: 'hsl(248 10% 50%)' }}>
              {practice.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs" style={{ color: 'hsl(38 55% 58%)' }}>+{practice.xpReward} XP</span>
            <span className="text-xs" style={{ color: 'hsl(248 10% 38%)' }}>
              {FREQUENCY_LABELS[practice.frequency] ?? practice.frequency}
            </span>
          </div>
        </div>

        {timerRequired && (
          <p className="text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
            Durée recommandée : {formatTime(minSec)}
          </p>
        )}

        <button
          onClick={timerRequired ? handleStart : () => setPhase('responding')}
          className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: 'hsl(38 52% 58% / 0.10)',
            color: 'hsl(38 58% 64%)',
            border: '1px solid hsl(38 52% 58% / 0.18)',
          }}
        >
          {timerRequired ? 'Commencer' : 'Valider cette pratique'}
        </button>
      </div>
    )
  }

  // ── Phase active — timer en cours ────────────────────────
  if (phase === 'active') {
    return (
      <div
        className="rounded-2xl p-4 space-y-4"
        style={{ background: 'hsl(248 28% 8%)', border: '1px solid hsl(248 22% 16%)' }}
      >
        <p className="text-sm font-medium text-center" style={{ color: 'hsl(38 14% 88%)' }}>
          {practice.title}
        </p>

        {/* Timer visuel */}
        <div className="flex flex-col items-center gap-2">
          <span
            className="font-mono text-3xl font-light"
            style={{ color: timerReady ? 'hsl(148 50% 52%)' : 'hsl(38 58% 64%)' }}
          >
            {formatTime(elapsed)}
          </span>

          {/* Barre de progression */}
          <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'hsl(248 22% 14%)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(timerProgress * 100, 100)}%`,
                background: timerReady ? 'hsl(148 50% 45%)' : 'hsl(38 52% 55%)',
              }}
            />
          </div>

          {timerRequired && !timerReady && (
            <p className="text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
              Minimum : {formatTime(minSec)}
            </p>
          )}
          {timerReady && (
            <p className="text-xs" style={{ color: 'hsl(148 45% 50%)' }}>
              Durée atteinte — tu peux t'arrêter quand tu veux
            </p>
          )}
        </div>

        <button
          onClick={handleStopAndRespond}
          className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: timerReady ? 'hsl(38 52% 58% / 0.12)' : 'hsl(248 20% 12%)',
            color: timerReady ? 'hsl(38 58% 64%)' : 'hsl(248 10% 40%)',
            border: `1px solid ${timerReady ? 'hsl(38 52% 58% / 0.20)' : 'hsl(248 20% 16%)'}`,
            cursor: timerReady ? 'pointer' : 'default',
          }}
        >
          {timerReady ? 'Terminer et donner mon retour' : 'En cours…'}
        </button>

        {/* Autoriser l'arrêt prématuré avec avertissement */}
        {!timerReady && elapsed > 10 && (
          <button
            onClick={handleStopAndRespond}
            className="w-full text-xs"
            style={{ color: 'hsl(248 10% 36%)', textDecoration: 'underline' }}
          >
            Arrêter quand même (XP réduite)
          </button>
        )}
      </div>
    )
  }

  // ── Phase responding — retour personnel ──────────────────
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: 'hsl(248 28% 8%)', border: '1px solid hsl(248 22% 16%)' }}
    >
      <p className="text-sm font-medium" style={{ color: 'hsl(38 14% 88%)' }}>
        {practice.title}
      </p>

      {timerRequired && (
        <p className="text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
          Temps : {formatTime(elapsed)}
        </p>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium" style={{ color: 'hsl(248 10% 55%)' }}>
          {responseRequired ? 'Ton retour (obligatoire)' : 'Ton retour (optionnel)'}
        </p>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder={config.placeholder}
          rows={4}
          autoFocus
          className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
          style={{
            background: 'hsl(248 32% 6%)',
            border: '1px solid hsl(248 22% 18%)',
            color: 'hsl(38 14% 88%)',
            lineHeight: 1.6,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'hsl(38 35% 28% / 0.50)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'hsl(248 22% 18%)' }}
        />
        {responseRequired && (
          <p className="text-xs" style={{ color: 'hsl(248 10% 36%)' }}>
            Minimum 20 caractères · {responseText.trim().length} / 20
          </p>
        )}
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'hsl(0 65% 60%)' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending || (responseRequired && responseText.trim().length < 20)}
        className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
        style={{
          background: 'hsl(38 52% 58% / 0.12)',
          color: 'hsl(38 58% 64%)',
          border: '1px solid hsl(38 52% 58% / 0.20)',
          opacity: isPending || (responseRequired && responseText.trim().length < 20) ? 0.4 : 1,
        }}
      >
        {isPending ? 'Enregistrement…' : 'Valider ma pratique'}
      </button>
    </div>
  )
}
