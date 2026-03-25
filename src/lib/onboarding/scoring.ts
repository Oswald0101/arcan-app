// src/lib/onboarding/scoring.ts
// Calcul du profil de sensibilité à partir des réponses d'onboarding
// Scores normalisés entre 0.0 et 1.0 pour chaque dimension

import { ALL_QUESTIONS, type ScoringDimension } from './questions'
import type { OnboardingAnswer } from '@/types/onboarding'

export interface SensitivityScores {
  need_for_structure: number
  need_for_meaning: number
  spiritual_affinity: number
  symbolic_affinity: number
  rational_affinity: number
  community_desire: number
  confrontation_preference: number
  softness_preference: number
  commitment_level: number
  emotional_stability: number
  creation_desire: number
}

// Toutes les dimensions initialisées à 0.5 (neutre)
const DEFAULT_SCORES: SensitivityScores = {
  need_for_structure: 0.5,
  need_for_meaning: 0.5,
  spiritual_affinity: 0.5,
  symbolic_affinity: 0.5,
  rational_affinity: 0.5,
  community_desire: 0.5,
  confrontation_preference: 0.5,
  softness_preference: 0.5,
  commitment_level: 0.5,
  emotional_stability: 0.5,
  creation_desire: 0.5,
}

// Map des choix fermés vers un score normalisé (index / (options.length - 1))
// Le premier choix = 1.0 (max), le dernier = 0.0 (min) — sauf exceptions
function normalizeChoiceScore(
  choiceIndex: number,
  totalOptions: number,
  direction: 'positive' | 'negative',
): number {
  const raw = 1 - choiceIndex / Math.max(totalOptions - 1, 1)
  return direction === 'positive' ? raw : 1 - raw
}

// Extrait les mots-clés d'une réponse libre (simple extraction sans IA)
export function extractKeywordsFromFreeText(text: string): string[] {
  if (!text || text.length < 3) return []

  // Mots à ignorer (stopwords FR/EN basiques)
  const stopwords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc',
    'or', 'ni', 'car', 'ce', 'cet', 'cette', 'mon', 'ma', 'mes', 'ton',
    'ta', 'tes', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'que', 'qui', 'quoi', 'dans', 'sur', 'par', 'pour', 'avec', 'sans',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'i',
    'my', 'your', 'his', 'her', 'we', 'they', 'it', 'this', 'that', 'not',
  ])

  return text
    .toLowerCase()
    .replace(/[^a-zàâäéèêëîïôöùûüç\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopwords.has(word))
    .slice(0, 20) // max 20 mots-clés
}

// Calcul principal du scoring
export function computeSensitivityScores(
  answers: Pick<OnboardingAnswer, 'questionKey' | 'questionType' | 'answerChoice' | 'answerChoices' | 'answerScale'>[],
): SensitivityScores {
  const scores = { ...DEFAULT_SCORES }
  const weights: Record<ScoringDimension, number[]> = {
    need_for_structure: [],
    need_for_meaning: [],
    spiritual_affinity: [],
    symbolic_affinity: [],
    rational_affinity: [],
    community_desire: [],
    confrontation_preference: [],
    softness_preference: [],
    commitment_level: [],
    emotional_stability: [],
    creation_desire: [],
  }

  for (const answer of answers) {
    const question = ALL_QUESTIONS.find((q) => q.key === answer.questionKey)
    if (!question?.scoring) continue

    let rawScore: number | null = null

    // Score selon le type de question
    if (answer.questionType === 'scale' && answer.answerScale != null) {
      // Échelle 1-5 → normalisé 0-1
      rawScore = (answer.answerScale - 1) / 4
    } else if (answer.questionType === 'single_choice' && answer.answerChoice != null) {
      // Choix unique : on utilise l'index du choix (FR comme référence)
      const options = question.options?.['fr'] ?? []
      const idx = options.indexOf(answer.answerChoice)
      if (idx >= 0) rawScore = normalizeChoiceScore(idx, options.length, 'positive')
    } else if (answer.questionType === 'multi_choice' && answer.answerChoices?.length) {
      // Multi-choix : ratio de choix sélectionnés
      const options = question.options?.['fr'] ?? []
      rawScore = answer.answerChoices.length / Math.max(options.length, 1)
    }

    if (rawScore === null) continue

    // Appliquer le score à chaque dimension scorée
    for (const scoring of question.scoring) {
      const adjusted =
        scoring.direction === 'positive'
          ? rawScore * scoring.weight
          : (1 - rawScore) * scoring.weight
      weights[scoring.dimension].push(adjusted)
    }
  }

  // Moyenne pondérée pour chaque dimension
  for (const dim of Object.keys(scores) as ScoringDimension[]) {
    const values = weights[dim]
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0)
      // Clamp entre 0.0 et 1.0, arrondi à 2 décimales
      scores[dim] = Math.round(Math.min(1, Math.max(0, sum / values.length)) * 100) / 100
    }
  }

  return scores
}

// Dérive les recommandations depuis les scores
export interface OnboardingRecommendations {
  suggestedPathType: string
  suggestedGuideTone: string
  confrontationLevel: 'soft' | 'balanced' | 'direct'
  symbolicUniverse: string
  extractedKeywords: string[]
}

export function deriveRecommendations(
  scores: SensitivityScores,
  freeTextAnswers: string[],
  symbolicAffinities: string[],
): OnboardingRecommendations {
  // Ton du guide
  let suggestedGuideTone = 'direct'
  if (scores.confrontation_preference < 0.35) suggestedGuideTone = 'doux'
  else if (scores.confrontation_preference > 0.65) suggestedGuideTone = 'direct'
  else if (scores.spiritual_affinity > 0.6) suggestedGuideTone = 'mystique'
  else if (scores.rational_affinity > 0.6) suggestedGuideTone = 'philosophique'
  else suggestedGuideTone = 'sobre'

  // Type de voie recommandé
  let suggestedPathType = 'voie'
  if (scores.spiritual_affinity > 0.7) suggestedPathType = 'voie'
  else if (scores.rational_affinity > 0.65) suggestedPathType = 'philosophie'
  else if (scores.need_for_structure > 0.7) suggestedPathType = 'ordre'
  else if (scores.symbolic_affinity > 0.7) suggestedPathType = 'tradition'
  else if (scores.community_desire > 0.7) suggestedPathType = 'mouvement'

  // Niveau de confrontation
  let confrontationLevel: 'soft' | 'balanced' | 'direct' = 'balanced'
  if (scores.confrontation_preference < 0.35) confrontationLevel = 'soft'
  else if (scores.confrontation_preference > 0.65) confrontationLevel = 'direct'

  // Univers symbolique
  let symbolicUniverse = 'libre'
  if (symbolicAffinities.length > 0) {
    // Prend la première affinité symbolique déclarée
    symbolicUniverse = symbolicAffinities[0]
  } else if (scores.spiritual_affinity > 0.6) symbolicUniverse = 'mystique'
  else if (scores.rational_affinity > 0.6) symbolicUniverse = 'philosophique'

  // Mots-clés extraits
  const extractedKeywords = freeTextAnswers
    .flatMap((text) => extractKeywordsFromFreeText(text))
    .filter((word, idx, arr) => arr.indexOf(word) === idx) // déduplique
    .slice(0, 15)

  return {
    suggestedPathType,
    suggestedGuideTone,
    confrontationLevel,
    symbolicUniverse,
    extractedKeywords,
  }
}
