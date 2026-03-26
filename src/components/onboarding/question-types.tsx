// src/components/onboarding/question-types.tsx
// Composants pour chaque type de question d'onboarding

'use client'

import { useId } from 'react'
import type { OnboardingQuestion } from '@/lib/onboarding/questions'
import type { AnswerPayload } from '@/types/onboarding'

type Lang = 'fr' | 'en' | 'es' | 'pt'

interface QuestionProps {
  question: OnboardingQuestion
  lang: Lang
  value: AnswerPayload | null
  onChange: (payload: AnswerPayload) => void
  disabled?: boolean
}

// ---- Réponse libre ----

export function QuestionFreeText({ question, lang, value, onChange, disabled }: QuestionProps) {
  const id = useId()
  const label = question.labels[lang] ?? question.labels['fr']
  const placeholder = question.placeholder?.[lang] ?? question.placeholder?.['fr'] ?? ''

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-base font-medium leading-relaxed">
        {label}
        {!question.required && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">(facultatif)</span>
        )}
      </label>
      <textarea
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        value={value?.answerText ?? ''}
        onChange={(e) =>
          onChange({
            questionKey: question.key,
            questionType: 'free_text',
            answerText: e.target.value || null,
          })
        }
        rows={4}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 leading-relaxed outline-none ring-offset-background placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring disabled:opacity-50"
        style={{ fontSize: '16px' }}
      />
    </div>
  )
}

// ---- Choix unique ----

export function QuestionSingleChoice({ question, lang, value, onChange, disabled }: QuestionProps) {
  const label = question.labels[lang] ?? question.labels['fr']
  const options = question.options?.[lang] ?? question.options?.['fr'] ?? []

  return (
    <div className="space-y-3">
      <p className="text-base font-medium leading-relaxed">{label}</p>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value?.answerChoice === option
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  questionKey: question.key,
                  questionType: 'single_choice',
                  answerChoice: option,
                })
              }
              className={`w-full rounded-xl border px-4 py-3 text-left text-base transition-colors disabled:opacity-50 ${
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/40 hover:bg-muted'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---- Choix multiples ----

export function QuestionMultiChoice({ question, lang, value, onChange, disabled }: QuestionProps) {
  const label = question.labels[lang] ?? question.labels['fr']
  const options = question.options?.[lang] ?? question.options?.['fr'] ?? []
  const selected = new Set(value?.answerChoices ?? [])

  function toggle(option: string) {
    const next = new Set(selected)
    if (next.has(option)) next.delete(option)
    else next.add(option)
    onChange({
      questionKey: question.key,
      questionType: 'multi_choice',
      answerChoices: Array.from(next),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-medium leading-relaxed">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Sélectionne tout ce qui s&apos;applique</p>
      </div>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.has(option)
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50 ${
                isSelected
                  ? 'border-foreground bg-foreground/10'
                  : 'border-border bg-background hover:border-foreground/40 hover:bg-muted'
              }`}
            >
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                  isSelected ? 'border-foreground bg-foreground' : 'border-border'
                }`}
              >
                {isSelected && (
                  <svg className="h-2.5 w-2.5 text-background" fill="none" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---- Échelle ----

export function QuestionScale({ question, lang, value, onChange, disabled }: QuestionProps) {
  const label = question.labels[lang] ?? question.labels['fr']
  const min = question.min ?? 1
  const max = question.max ?? 5
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const current = value?.answerScale

  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed">{label}</p>
      <div className="flex gap-2">
        {steps.map((step) => {
          const isSelected = current === step
          return (
            <button
              key={step}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  questionKey: question.key,
                  questionType: 'scale',
                  answerScale: step,
                })
              }
              className={`flex-1 rounded-xl border py-4 text-sm font-medium transition-colors disabled:opacity-50 ${
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/40'
              }`}
            >
              {step}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Peu</span>
        <span>Beaucoup</span>
      </div>
    </div>
  )
}

// ---- Dispatcher : choisit le bon composant selon le type ----

export function QuestionRenderer(props: QuestionProps) {
  switch (props.question.type) {
    case 'free_text':    return <QuestionFreeText    {...props} />
    case 'single_choice': return <QuestionSingleChoice {...props} />
    case 'multi_choice':  return <QuestionMultiChoice  {...props} />
    case 'scale':         return <QuestionScale         {...props} />
    default:              return null
  }
}
