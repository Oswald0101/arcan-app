// src/types/onboarding.ts

export type QuestionType = 'free_text' | 'single_choice' | 'multi_choice' | 'scale'
export type OnboardingStatus = 'started' | 'in_progress' | 'completed' | 'abandoned'

export interface OnboardingSession {
  id: string
  userId: string
  status: OnboardingStatus
  currentBloc: number
  version: string
  startedAt: Date
  completedAt: Date | null
  generatedProfileSnapshot: Record<string, unknown> | null
  answers?: OnboardingAnswer[]
}

export interface OnboardingAnswer {
  id: string
  sessionId: string
  userId: string
  blocNumber: number
  questionKey: string
  questionType: QuestionType
  answerText: string | null
  answerChoice: string | null
  answerChoices: string[]
  answerScale: number | null
  createdAt: Date
}

// Payload envoyé par le frontend pour sauvegarder une réponse
export interface AnswerPayload {
  questionKey: string
  questionType: QuestionType
  answerText?: string | null
  answerChoice?: string | null
  answerChoices?: string[]
  answerScale?: number | null
}

// État local du flow d'onboarding côté client
export interface OnboardingState {
  sessionId: string | null
  currentBloc: number
  answers: Record<string, AnswerPayload> // questionKey → réponse
  isGenerating: boolean
  isComplete: boolean
  error: string | null
}

// Résultat de la génération finale
export interface OnboardingResult {
  pathId: string
  guideId: string
}
