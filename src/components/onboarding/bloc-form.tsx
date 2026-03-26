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
    <form onSubmit={handleSubmit} className="space-y-12">

      {/* Barre de progression — ultra-premium avec glow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="label-section">{label}</span>
          <span className="text-xs font-semibold" style={{ color: 'hsl(38 52% 65%)' }}>
            {bloc} / {progressBlocs}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(to right, hsl(248 22% 16%), hsl(248 20% 12%))',
            boxShadow: 'inset 0 2px 4px hsl(246 40% 2% / 0.50)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-800 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(to right, hsl(38 50% 48%), hsl(38 65% 70%))',
              boxShadow: '0 0 24px hsl(38 52% 58% / 0.60), inset 0 1px 0 hsl(38 100% 90% / 0.20)',
              filter: 'drop-shadow(0 0 12px hsl(38 52% 58% / 0.40))',
            }}
          />
        </div>
      </div>

      {/* En-tête du bloc — mystique et immersif */}
      <div className="text-center space-y-6 animate-fade-up">
        {/* Symbole avec glow */}
        <div
          className="mx-auto h-18 w-18 rounded-full flex items-center justify-center text-3xl transition-all duration-500 group"
          style={{
            background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.16) 0%, hsl(38 52% 58% / 0.08) 100%)',
            border: '1.5px solid hsl(38 52% 58% / 0.30)',
            color: 'hsl(38 65% 72%)',
            boxShadow: '0 0 40px hsl(38 52% 58% / 0.20), inset 0 1px 0 hsl(38 100% 90% / 0.10)',
          }}
        >
          {symbol}
        </div>
        <div className="space-y-3">
          <h2
            className="font-serif text-3xl font-medium"
            style={{
              color: 'hsl(38 14% 95%)',
              textShadow: '0 4px 12px hsl(246 40% 2% / 0.35)',
            }}
          >
            {label}
          </h2>
          <p className="text-base font-medium leading-relaxed" style={{ color: 'hsl(248 10% 52%)' }}>
            {intro}
          </p>
        </div>
      </div>

      {/* Ligne or — avec glow */}
      <div className="divider-gold" />

      {/* Questions — espacement et lisibilité augmentés */}
      <div className="space-y-11">
        {questions.map((question, idx) => (
          <div
            key={question.key}
            className="space-y-4 animate-fade-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <QuestionRenderer
              question={question}
              lang={lang}
              value={localAnswers[question.key] ?? null}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {validationErrors[question.key] && (
              <p className="text-sm font-semibold" style={{ color: 'hsl(0 70% 72%)' }}>
                ⚠ {validationErrors[question.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation — zones de frappe 48px minimum */}
      <div className="flex gap-4 pt-6">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="btn-ghost px-7 py-4 text-base font-semibold"
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            ← {lang === 'fr' ? 'Retour' : 'Back'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1 py-4 text-base font-semibold"
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
