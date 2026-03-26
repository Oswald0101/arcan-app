// src/components/onboarding/question-types.tsx
// Composants pour chaque type de question d'onboarding
// Refonte : Lisibilité mobile, zones de frappe plus grandes, hiérarchie visuelle

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
      <label htmlFor={id} className="block text-lg font-medium leading-relaxed">
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
        className="textarea"
        style={{
          fontSize: '16px',
          minHeight: '120px',
        }}
      />
    </div>
  )
}

// ---- Choix unique ----

export function QuestionSingleChoice({ question, lang, value, onChange, disabled }: QuestionProps) {
  const label = question.labels[lang] ?? question.labels['fr']
  const options = question.options?.[lang] ?? question.options?.['fr'] ?? []

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium leading-relaxed">{label}</p>
      <div className="space-y-3">
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
              className="w-full rounded-lg border-2 px-4 py-4 text-left text-base font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{
                borderColor: isSelected ? 'hsl(38 52% 58%)' : 'hsl(248 22% 14%)',
                background: isSelected
                  ? 'hsl(38 52% 58% / 0.08)'
                  : 'hsl(248 30% 6%)',
                color: isSelected ? 'hsl(38 52% 65%)' : 'hsl(248 10% 50%)',
                boxShadow: isSelected ? '0 0 20px hsl(38 52% 58% / 0.12)' : 'none',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="flex-1">{option}</span>
              {isSelected && (
                <span style={{ color: 'hsl(38 52% 65%)', fontSize: '18px' }}>✓</span>
              )}
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
    <div className="space-y-4">
      <div>
        <p className="text-lg font-medium leading-relaxed">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === 'fr' ? 'Sélectionne tout ce qui s\'applique' : 'Select all that apply'}
        </p>
      </div>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected.has(option)
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option)}
              className="flex w-full items-center gap-3 rounded-lg border-2 px-4 py-4 text-left text-base font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{
                borderColor: isSelected ? 'hsl(38 52% 58%)' : 'hsl(248 22% 14%)',
                background: isSelected
                  ? 'hsl(38 52% 58% / 0.08)'
                  : 'hsl(248 30% 6%)',
                color: isSelected ? 'hsl(38 52% 65%)' : 'hsl(248 10% 50%)',
                boxShadow: isSelected ? '0 0 20px hsl(38 52% 58% / 0.12)' : 'none',
                minHeight: '48px',
              }}
            >
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all"
                style={{
                  borderColor: isSelected ? 'hsl(38 52% 65%)' : 'hsl(248 22% 18%)',
                  background: isSelected ? 'hsl(38 52% 58%)' : 'transparent',
                }}
              >
                {isSelected && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 10 8" style={{ color: 'hsl(246 40% 5%)' }}>
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="flex-1">{option}</span>
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
    <div className="space-y-5">
      <p className="text-lg font-medium leading-relaxed">{label}</p>
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
              className="flex-1 rounded-lg border-2 py-4 text-base font-semibold transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{
                borderColor: isSelected ? 'hsl(38 52% 58%)' : 'hsl(248 22% 14%)',
                background: isSelected
                  ? 'hsl(38 52% 58%)'
                  : 'hsl(248 30% 6%)',
                color: isSelected ? 'hsl(246 40% 5%)' : 'hsl(248 10% 50%)',
                boxShadow: isSelected ? '0 0 20px hsl(38 52% 58% / 0.15)' : 'none',
                minHeight: '48px',
              }}
            >
              {step}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lang === 'fr' ? 'Peu' : 'Low'}</span>
        <span>{lang === 'fr' ? 'Beaucoup' : 'High'}</span>
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
