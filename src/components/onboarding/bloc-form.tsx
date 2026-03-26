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

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label-section">{label}</span>
          <span className="text-xs" style={{ color: 'hsl(248 8% 40%)' }}>
            {bloc} / {progressBlocs}
          </span>
        </div>
        <div
          className="h-px w-full rounded-full overflow-hidden"
          style={{ background: 'hsl(var(--border-bright))' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(to right, hsl(38 40% 40%), hsl(38 52% 65%))',
            }}
          />
        </div>
      </div>

      {/* En-tête du bloc */}
      <div className="text-center space-y-3">
        <div
          className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-xl transition-all duration-500"
          style={{
            background: 'hsl(38 52% 58% / 0.06)',
            border: '1px solid hsl(38 52% 58% / 0.18)',
            color: 'hsl(38 52% 65%)',
          }}
        >
          {symbol}
        </div>
        <div>
          <h2 className="font-serif text-3xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
            {label}
          </h2>
          <p className="text-base mt-1" style={{ color: 'hsl(248 8% 50%)' }}>
            {intro}
          </p>
        </div>
      </div>

      {/* Ligne or */}
      <div className="divider-gold" />

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, idx) => (
          <div
            key={question.key}
            className="space-y-2 animate-fade-up"
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
              <p className="text-xs" style={{ color: 'hsl(0 70% 55%)' }}>
                {validationErrors[question.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {showBack && (
          <button
            type="button" onClick={onBack} disabled={isSubmitting}
            className="btn-ghost px-5 py-3"
          >
            ←
          </button>
        )}
        <button
          type="submit" disabled={isSubmitting}
          className="btn-primary flex-1 py-3"
        >
          {isSubmitting
            ? (lang === 'fr' ? 'Un instant…' : 'Loading…')
            : continueLabel}
        </button>
      </div>
    </form>
  )
}
