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
    <div className="space-y-4">
      <label htmlFor={id} className="block leading-relaxed" style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(20px, 5vw, 26px)',
        fontWeight: 400,
        color: 'hsl(38 14% 90%)',
        lineHeight: 1.25,
      }}>
        {label}
        {!question.required && (
          <span className="ml-2 text-sm font-normal" style={{ fontFamily: 'inherit', fontSize: '14px', color: 'hsl(248 10% 46%)', fontWeight: 400 }}>
            (facultatif)
          </span>
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
        style={{ fontSize: '16px', minHeight: '120px' }}
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
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(20px, 5vw, 26px)',
        fontWeight: 400,
        color: 'hsl(38 14% 90%)',
        lineHeight: 1.25,
      }}>{label}</p>
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
              className={`choice-btn${isSelected ? ' selected' : ''} disabled:opacity-50`}
            >
              <span className="flex-1">{option}</span>
              {isSelected && (
                <span style={{ color: 'hsl(38 62% 68%)', fontSize: '16px', marginLeft: 8 }}>✓</span>
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
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(20px, 5vw, 26px)',
          fontWeight: 400,
          color: 'hsl(38 14% 90%)',
          lineHeight: 1.25,
        }}>{label}</p>
        <p className="mt-1.5 text-sm" style={{ color: 'hsl(248 10% 46%)' }}>
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
              className={`choice-btn flex items-center gap-3${isSelected ? ' selected' : ''} disabled:opacity-50`}
            >
              {/* Checkbox */}
              <span
                className="flex-shrink-0 flex items-center justify-center rounded transition-all"
                style={{
                  width: 20, height: 20,
                  border: `2px solid ${isSelected ? 'hsl(38 54% 62%)' : 'hsl(248 22% 22%)'}`,
                  background: isSelected ? 'hsl(38 54% 62%)' : 'transparent',
                  borderRadius: 5,
                }}
              >
                {isSelected && (
                  <svg width="10" height="8" fill="none" viewBox="0 0 10 8" style={{ color: 'hsl(246 40% 5%)' }}>
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
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(20px, 5vw, 26px)',
        fontWeight: 400,
        color: 'hsl(38 14% 90%)',
        lineHeight: 1.25,
      }}>{label}</p>
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
              className="flex-1 transition-all duration-200 disabled:opacity-50 active:scale-95"
              style={{
                borderRadius: 12,
                border: `1px solid ${isSelected ? 'hsl(38 54% 62%)' : 'hsl(248 22% 16%)'}`,
                background: isSelected
                  ? 'linear-gradient(145deg, hsl(38 62% 66%), hsl(38 52% 57%))'
                  : 'hsl(248 30% 8%)',
                color: isSelected ? 'hsl(246 42% 5%)' : 'hsl(248 10% 52%)',
                fontWeight: 600,
                fontSize: '16px',
                minHeight: '52px',
                boxShadow: isSelected
                  ? 'inset 0 1px 0 hsl(38 100% 88% / 0.22), 0 4px 14px hsl(38 50% 35% / 0.35)'
                  : 'none',
              }}
            >
              {step}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
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
