'use client'

import { useState } from 'react'
import { QuestionRenderer } from './question-types'
import type { OnboardingQuestion } from '@/lib/onboarding/questions'
import type { AnswerPayload } from '@/types/onboarding'

type Lang = 'fr' | 'en' | 'es' | 'pt'

interface BlocFormProps {
  bloc: number
  totalBlocs: number
  questions: OnboardingQuestion[]
  lang: Lang
  initialAnswers: Record<string, AnswerPayload>
  isSubmitting: boolean
  onSubmit: (answers: AnswerPayload[]) => Promise<void>
  onBack: () => void
  showBack: boolean
}

const BLOC_META: Record<string, Record<number, { label: string; intro: string; symbol: string }>> = {
  fr: {
    1: { label: 'Intention',       intro: 'Pourquoi es-tu là ?',              symbol: '◦' },
    2: { label: 'Profil intérieur', intro: 'Qui es-tu vraiment ?',            symbol: '◉' },
    3: { label: 'Sens & Sacré',    intro: 'Ce qui te transcende',             symbol: '✦' },
    4: { label: 'Cadre & Évolution', intro: 'Comment tu veux avancer',        symbol: '◈' },
    5: { label: 'Ton Guide',       intro: 'La voix qui t\'accompagne',        symbol: '◎' },
    6: { label: 'Ta Voie',         intro: 'Le nom de ton chemin',             symbol: '⟡' },
    7: { label: 'Engagement',      intro: 'Ce à quoi tu te consacres',        symbol: '◆' },
    8: { label: 'Génération',      intro: 'Ta Voie prend forme',              symbol: '◯' },
  },
}

export function BlocForm({
  bloc, totalBlocs, questions, lang,
  initialAnswers, isSubmitting, onSubmit, onBack, showBack,
}: BlocFormProps) {
  const [localAnswers, setLocalAnswers] = useState<Record<string, AnswerPayload>>(
    () => ({ ...initialAnswers }),
  )
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const meta = BLOC_META[lang]?.[bloc] ?? BLOC_META['fr'][bloc]
  const { label, intro, symbol } = meta ?? { label: `Bloc ${bloc}`, intro: '', symbol: '◎' }

  function handleChange(payload: AnswerPayload) {
    setLocalAnswers((prev) => ({ ...prev, [payload.questionKey]: payload }))
    if (validationErrors[payload.questionKey]) {
      setValidationErrors((prev) => { const n = { ...prev }; delete n[payload.questionKey]; return n })
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {}
    for (const question of questions) {
      if (!question.required) continue
      const answer = localAnswers[question.key]
      const isEmpty = !answer || (
        !answer.answerText && !answer.answerChoice &&
        (!answer.answerChoices || answer.answerChoices.length === 0) &&
        answer.answerScale == null
      )
      if (isEmpty) errors[question.key] = lang === 'fr' ? 'Réponse requise' : 'Required'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const answersToSave = questions.map((q) => localAnswers[q.key]).filter(Boolean) as AnswerPayload[]
    await onSubmit(answersToSave)
  }

  const isLastBloc = bloc === totalBlocs - 1
  const continueLabel = isLastBloc
    ? (lang === 'fr' ? 'Générer ma Voie' : 'Generate my Path')
    : (lang === 'fr' ? 'Continuer' : 'Continue')

  // Progress sur les blocs (excl. bloc génération)
  const progressBlocs = totalBlocs - 1
  const progressPct = Math.round(((bloc - 1) / progressBlocs) * 100)

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* Barre de progression — plus visible */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label-section">{label}</span>
          <span className="text-xs font-medium" style={{ color: 'hsl(248 10% 50%)' }}>
            {bloc} / {progressBlocs}
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: 'hsl(248 22% 14%)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(to right, hsl(38 40% 40%), hsl(38 52% 65%))',
              boxShadow: '0 0 16px hsl(38 52% 58% / 0.3)',
            }}
          />
        </div>
      </div>

      {/* En-tête bloc — immersif */}
      <div className="text-center space-y-5 animate-fade-up">
        {/* Orbe avec glow animé */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute', inset: -18,
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(38 54% 62% / 0.15) 0%, transparent 70%)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }} />
          <div style={{
            width: 68, height: 68,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, hsl(38 54% 62% / 0.20), hsl(265 55% 30% / 0.10))',
            border: '1px solid hsl(38 54% 62% / 0.30)',
            color: 'hsl(38 65% 72%)',
            fontSize: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px hsl(38 54% 62% / 0.15)',
          }}>
            {symbol}
          </div>
        </div>

        <div className="space-y-2">
          <p className="label-section" style={{ letterSpacing: '0.25em' }}>{label}</p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(30px, 8vw, 42px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: 'hsl(38 14% 93%)',
            }}
          >
            {intro}
          </h2>
        </div>
      </div>

      {/* Séparateur doré */}
      <div className="sep-diamond">◆</div>

      {/* Questions — espacement amélioré */}
      <div className="space-y-9">
        {questions.map((question, idx) => (
          <div
            key={question.key}
            className="space-y-3 animate-fade-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <QuestionRenderer
              question={question}
              lang={lang}
              value={localAnswers[question.key] ?? null}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {validationErrors[question.key] && (
              <p className="text-sm font-medium" style={{ color: 'hsl(0 70% 65%)' }}>
                ⚠ {validationErrors[question.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation — zones de frappe plus grandes */}
      <div className="flex gap-3 pt-4">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="btn-ghost px-6 py-3.5 text-base font-medium"
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            ← {lang === 'fr' ? 'Retour' : 'Back'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 py-3.5 text-base font-medium"
          style={{ minHeight: '48px' }}
        >
          {isSubmitting
            ? (lang === 'fr' ? 'Un instant…' : 'Loading…')
            : continueLabel}
        </button>
      </div>
    </form>
  )
}
