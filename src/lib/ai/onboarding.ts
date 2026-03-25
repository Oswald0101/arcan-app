// src/lib/ai/onboarding.ts
// Service IA pour la génération de contenu à l'issue de l'onboarding

import { complete } from './providers'
import {
  buildManifestoPrompt,
  buildGuidePersonalityPrompt,
  buildInitialCodexPrompt,
  type OnboardingAnswerSummary,
} from './prompts/onboarding'
import type { SensitivityScores, OnboardingRecommendations } from '@/lib/onboarding/scoring'

// ---- Génération du Manifeste ----

export async function generateManifesto(
  answers: OnboardingAnswerSummary,
  scores: SensitivityScores,
  recs: OnboardingRecommendations,
  language: string = 'fr',
): Promise<string> {
  const prompt = buildManifestoPrompt(answers, scores, recs, language)

  const response = await complete({
    systemPrompt: 'Tu aides à rédiger un manifeste fondateur profond, clair, cohérent et inspirant.',
    maxTokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content.trim()
}

// ---- Génération de la personnalité du Guide ----

export async function generateGuidePersonality(
  answers: OnboardingAnswerSummary,
  scores: SensitivityScores,
  guideName: string,
  memberName: string,
  guideTone: string,
  addressMode: 'tutoiement' | 'vouvoiement',
  language: string = 'fr',
): Promise<string> {
  const prompt = buildGuidePersonalityPrompt(
    answers,
    scores,
    guideName,
    memberName,
    guideTone,
    addressMode,
    language,
  )

  const response = await complete({
    systemPrompt: 'Tu conçois la personnalité d’un guide intérieur spirituel, moderne, profond et utile.',
    maxTokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content.trim()
}

// ---- Génération du Codex initial ----

export async function generateInitialCodex(
  answers: OnboardingAnswerSummary,
  manifestoText: string,
  principles: string[],
  language: string = 'fr',
): Promise<string> {
  const prompt = buildInitialCodexPrompt(answers, manifestoText, principles, language)

  const response = await complete({
    systemPrompt: 'Tu rédiges un codex initial structuré, utile, lisible, cohérent avec un manifeste fondateur.',
    maxTokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content.trim()
}

// ---- Génération du récap de bienvenue personnalisé ----

export async function generateWelcomeRecap(params: {
  answers: OnboardingAnswerSummary
  scores: SensitivityScores
  guideName: string
  memberName: string
  guideTone: string
  pathName: string
  pathType: string
  language: string
}): Promise<string> {
  const { answers, scores, guideName, memberName, guideTone, pathName, pathType, language } = params

  // Construire les axes forts depuis les scores (top 3)
  const dimensionLabels: Record<string, string> = {
    spiritual_affinity:       'sensibilité spirituelle',
    rational_affinity:        'ancrage rationnel',
    community_desire:         'désir de communion',
    need_for_structure:       'besoin d\'ordre et de cadre',
    symbolic_affinity:        'langage symbolique',
    confrontation_preference: 'goût pour la vérité directe',
    commitment_level:         'engagement dans la durée',
    creation_desire:          'élan créateur',
    softness_preference:      'douceur intérieure',
    emotional_stability:      'stabilité émotionnelle',
    need_for_meaning:         'quête de sens',
  }

  const axes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dim]) => dimensionLabels[dim] ?? dim)
    .join(', ')

  const prenom = memberName ? `Cet être s'appelle ${memberName}.` : ''
  const principes = (answers.firstPrinciples ?? []).slice(0, 3).join(' / ')
  const lutte = answers.mainStruggle ?? ''
  const manque = answers.missingToday ?? ''
  const qualite = answers.qualityToStrengthen ?? ''
  const sentence = answers.foundingSentence ?? ''

  const langInstructions: Record<string, string> = {
    fr: 'Réponds en français.',
    en: 'Reply in English.',
    es: 'Responde en español.',
    pt: 'Responde em português.',
  }

  const prompt = `Tu es ARCAN — une entité de transformation intérieure, sobre et profonde.
Un membre vient de finir son onboarding. Tu dois écrire son message de bienvenue personnalisé.

Données sur ce membre :
- ${prenom}
- Ce qu'il cherchait en arrivant : "${answers.arrivalReason ?? ''}"
- Ce qui lui manque : "${manque}"
- Sa lutte principale : "${lutte}"
- La qualité qu'il veut renforcer : "${qualite}"
- Ce qu'il vient de créer : un(e) ${pathType} nommé(e) "${pathName}"
- Sa phrase fondatrice : "${sentence}"
- Ses premiers principes : ${principes || '(non définis)'}
- Son guide s'appelle ${guideName}, ton : ${guideTone}
- Ses trois axes de sensibilité dominants : ${axes}

Écris un message de bienvenue (200 à 280 mots, STRICTEMENT).
Ce message doit :
1. Ouvrir en montrant que tu as compris QUI est cette personne et CE qu'elle cherchait — sans liste, en prose fluide
2. Nommer ce qu'elle vient de créer comme si c'était réel et puissant — pas générique, ancré dans ses mots à elle
3. Évoquer 2-3 de ses axes forts avec des formulations qui lui parlent (pas de termes techniques)
4. Présenter brièvement son guide (nom + tonalité) comme une présence vivante
5. Terminer par une invitation à commencer — sobre, juste, non rhétorique

Style : sobre, profond, sans emphase excessive, sans point d'exclamation, sans liste.
Evite : les formules creuses, "bienvenue chez toi", "belle aventure", "chemin", "voyage".
${langInstructions[language] ?? langInstructions.fr}`

  const response = await complete({
    systemPrompt: 'Tu es ARCAN. Tu écris avec clarté, sobriété et profondeur. Jamais de clichés du développement personnel.',
    maxTokens: 450,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content.trim()
}

// ---- Génération en parallèle (manifeste + guide + récap) ----

export async function generateOnboardingContent(params: {
  answers: OnboardingAnswerSummary
  scores: SensitivityScores
  recs: OnboardingRecommendations
  guideName: string
  memberName: string
  guideTone: string
  addressMode: 'tutoiement' | 'vouvoiement'
  language: string
  pathName: string
  pathType: string
}): Promise<{
  manifestoText: string
  guidePersonalityPrompt: string
  codexContent: string
  welcomeRecap: string
}> {
  const {
    answers,
    scores,
    recs,
    guideName,
    memberName,
    guideTone,
    addressMode,
    language,
    pathName,
    pathType,
  } = params

  const [manifestoText, guidePersonalityPrompt, welcomeRecap] = await Promise.all([
    generateManifesto(answers, scores, recs, language),
    generateGuidePersonality(
      answers,
      scores,
      guideName,
      memberName,
      guideTone,
      addressMode,
      language,
    ),
    generateWelcomeRecap({
      answers,
      scores,
      guideName,
      memberName,
      guideTone,
      pathName,
      pathType,
      language,
    }),
  ])

  const principles = answers.firstPrinciples ?? []
  const codexContent = await generateInitialCodex(
    answers,
    manifestoText,
    principles,
    language,
  )

  return { manifestoText, guidePersonalityPrompt, codexContent, welcomeRecap }
}
