// src/lib/onboarding/actions.ts
// Server Actions pour le parcours d'onboarding

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getActiveSession,
  createSession,
  updateSessionBloc,
  saveAnswer,
  getSessionAnswers,
  upsertSensitivityProfile,
  createPathWithCircle,
  createGuide,
  createManifestoAndPrinciples,
  createInitialCodex,
  completeSession,
  finalizeOnboarding,
  generateUniqueSlug,
} from '@/lib/supabase/queries/onboarding'
import {
  computeSensitivityScores,
  deriveRecommendations,
  extractKeywordsFromFreeText,
} from '@/lib/onboarding/scoring'
import {
  generateOnboardingContent,
} from '@/lib/ai/onboarding'
import { getQuestionByKey, ALL_QUESTIONS } from '@/lib/onboarding/questions'
import type { AnswerPayload } from '@/types/onboarding'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// INIT / REPRISE SESSION
// ============================================================

export async function initOrResumeOnboarding(): Promise<
  ActionResult<{ sessionId: string; currentBloc: number; savedAnswers: AnswerPayload[] }>
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const existing = await getActiveSession(user.id)

  if (existing) {
    const savedAnswers: AnswerPayload[] = (existing.answers ?? []).map((a: any) => ({
      questionKey: a.questionKey,
      questionType: a.questionType,
      answerText: a.answerText ?? undefined,
      answerChoice: a.answerChoice ?? undefined,
      answerChoices: a.answerChoices ?? [],
      answerScale: a.answerScale ?? undefined,
    }))
    return {
      success: true,
      data: { sessionId: existing.id, currentBloc: existing.currentBloc, savedAnswers },
    }
  }

  const created = await createSession(user.id)
  return {
    success: true,
    data: { sessionId: created.id, currentBloc: created.currentBloc, savedAnswers: [] },
  }
}

// ============================================================
// SAUVEGARDER UNE RÉPONSE
// ============================================================

export async function saveOnboardingAnswer(
  sessionId: string,
  answer: AnswerPayload,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  const question = getQuestionByKey(answer.questionKey)
  if (!question) return { success: false, error: 'Question inconnue' }

  // Validation minimale
  if (question.required) {
    const isEmpty =
      !answer.answerText &&
      !answer.answerChoice &&
      (!answer.answerChoices || answer.answerChoices.length === 0) &&
      answer.answerScale == null

    if (isEmpty) {
      return { success: false, error: 'Cette question est obligatoire' }
    }
  }

  // Validation spécifique scale
  if (question.type === 'scale' && answer.answerScale != null) {
    const min = question.min ?? 1
    const max = question.max ?? 5
    if (answer.answerScale < min || answer.answerScale > max) {
      return { success: false, error: `Valeur hors limites (${min}-${max})` }
    }
  }

  await saveAnswer({
    sessionId,
    userId: user.id,
    blocNumber: question.bloc,
    questionKey: answer.questionKey,
    questionType: question.type,
    answerText: answer.answerText,
    answerChoice: answer.answerChoice,
    answerChoices: answer.answerChoices,
    answerScale: answer.answerScale,
  })

  return { success: true }
}

// ============================================================
// AVANCER AU BLOC SUIVANT
// ============================================================

export async function advanceToBloc(
  sessionId: string,
  nextBloc: number,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  await updateSessionBloc(sessionId, nextBloc)
  return { success: true }
}

// ============================================================
// GÉNÉRATION FINALE (Bloc 8)
// ============================================================

export async function generateOnboardingResult(
  sessionId: string,
): Promise<ActionResult<{ pathId: string; guideId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non autorisé' }

  // 1. Récupérer toutes les réponses
  const rawAnswers = await getSessionAnswers(sessionId)
  if (rawAnswers.length === 0) {
    return { success: false, error: 'Aucune réponse trouvée pour cette session' }
  }

  // 2. Calculer le profil de sensibilité
  const scores = computeSensitivityScores(rawAnswers)

  // 3. Extraire les réponses libres et les affinités symboliques
  const freeTextAnswers = rawAnswers
    .filter((a: any) => a.questionType === 'free_text' && a.answerText)
    .map((a: any) => a.answerText as string)

  const symbolicAffinities = rawAnswers
    .find((a: any) => a.questionKey === 'symbolic_affinities')
    ?.answerChoices ?? []

  // 4. Dériver les recommandations
  const recs = deriveRecommendations(scores, freeTextAnswers, symbolicAffinities)

  // 5. Récupérer le profil pour la langue
  const { prisma } = await import('@/lib/prisma')
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  const language = profile?.language ?? 'fr'

  // 6. Construire le résumé des réponses pour les prompts IA
  const getAnswer = (key: string) =>
    rawAnswers.find((a: any) => a.questionKey === key)

  const answerSummary = {
    arrivalReason: getAnswer('arrival_reason')?.answerChoice ?? undefined,
    missingToday: getAnswer('missing_today')?.answerText ?? undefined,
    mainStruggle: getAnswer('main_struggle')?.answerText ?? undefined,
    qualityToStrengthen: getAnswer('quality_to_strengthen')?.answerText ?? undefined,
    truthDescription: getAnswer('truth_description')?.answerText ?? undefined,
    pathName: getAnswer('path_name')?.answerText ?? 'Ma Voie',
    foundingSentence: getAnswer('founding_sentence')?.answerText ?? undefined,
    firstPrinciples: (getAnswer('first_principles')?.answerText ?? '')
      .split('\n')
      .map((p: string) => p.trim())
      .filter(Boolean)
      .slice(0, 5),
    thirtyDayVision: getAnswer('thirty_day_vision')?.answerText ?? undefined,
    selfCommitment: getAnswer('self_commitment')?.answerText ?? undefined,
    symbolicAffinities,
  }

  // 7. Configurer le guide
  const guideToneRaw = getAnswer('guide_tone')?.answerChoice ?? ''
  const guideTone = mapToneChoice(guideToneRaw, language)
  const addressModeRaw = getAnswer('guide_address_mode')?.answerChoice ?? ''
  const addressMode: 'tutoiement' | 'vouvoiement' =
    addressModeRaw.toLowerCase().includes('vouvoi') ? 'vouvoiement' : 'tutoiement'
  const guideName = getAnswer('guide_name')?.answerText?.trim() || 'Guide'
  const memberName = getAnswer('member_name')?.answerText?.trim() || ''

  // 8. Générer le contenu IA (manifeste + guide + codex + récap de bienvenue)
  const pathNameForGen = answerSummary.pathName || 'Ma Voie'
  const pathTypeRawForGen = getAnswer('path_type')?.answerChoice ?? 'Voie'

  const { manifestoText, guidePersonalityPrompt, codexContent, welcomeRecap } =
    await generateOnboardingContent({
      answers: answerSummary,
      scores,
      recs,
      guideName,
      memberName,
      guideTone,
      addressMode,
      language,
      pathName: pathNameForGen,
      pathType: pathTypeRawForGen,
    })

  // 9. Mapper le type de voie
  const pathTypeRaw = getAnswer('path_type')?.answerChoice ?? 'Voie'
  const canonicalType = mapPathTypeChoice(pathTypeRaw)
  const pathName = answerSummary.pathName || 'Ma Voie'
  const slug = await generateUniqueSlug(pathName)

  // 10. Tout créer en base dans le bon ordre
  const { path, circle } = await createPathWithCircle({
    founderUserId: user.id,
    canonicalType,
    customTypeLabel: pathTypeRaw !== 'Voie' ? pathTypeRaw : undefined,
    name: pathName,
    slug,
    shortDescription: answerSummary.foundingSentence ?? pathName,
    language,
    manifestoText,
    principles: answerSummary.firstPrinciples ?? [],
  })

  const firmnessLevel = Math.round(scores.confrontation_preference * 4) + 1 // 1-5
  const warmthLevel = Math.round((1 - scores.confrontation_preference) * 4) + 1

  const guide = await createGuide({
    ownerUserId: user.id,
    pathId: path.id,
    name: guideName,
    memberName: memberName || undefined,
    tone: guideTone,
    addressMode,
    firmnessLevel: Math.min(5, Math.max(1, firmnessLevel)),
    warmthLevel: Math.min(5, Math.max(1, warmthLevel)),
    personalityPrompt: guidePersonalityPrompt,
  })

  await createManifestoAndPrinciples({
    pathId: path.id,
    userId: user.id,
    manifestoText,
    principles: answerSummary.firstPrinciples ?? [],
  })

  await createInitialCodex({
    userId: user.id,
    pathId: path.id,
    codexContent,
    manifestoText,
    principles: answerSummary.firstPrinciples ?? [],
  })

  // 11. Sauvegarder le profil de sensibilité
  const keywords = freeTextAnswers.flatMap(extractKeywordsFromFreeText).slice(0, 15)
  await upsertSensitivityProfile(
    user.id,
    sessionId,
    scores,
    keywords,
    symbolicAffinities,
    `Voie: ${pathName} | Univers: ${recs.symbolicUniverse} | Ton: ${guideTone}`,
  )

  // 12. Marquer la session comme complétée (+ stocker le récap de bienvenue)
  await completeSession(sessionId, {
    pathId: path.id,
    guideId: guide.id,
    scores,
    recs,
    welcomeRecap,
  })

  // 13. Finaliser l'onboarding
  await finalizeOnboarding(user.id)

  // 14. Sauvegarder le nom membre comme displayName
  const memberNameAnswer = getAnswer('member_name')?.answerText?.trim()
  if (memberNameAnswer) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: { displayName: memberNameAnswer },
    }).catch(() => null)
  }

  revalidatePath('/', 'layout')

  return { success: true, data: { pathId: path.id, guideId: guide.id } }
}

// ============================================================
// HELPERS
// ============================================================

function mapToneChoice(choice: string, language: string): string {
  const mappings: Record<string, string> = {
    // FR
    'direct et sans filtre': 'direct',
    'direct and unfiltered': 'direct',
    'bienveillant mais honnête': 'doux',
    'kind but honest': 'doux',
    'philosophique et questionnant': 'philosophique',
    'philosophical and questioning': 'philosophique',
    'sobre et stoïque': 'stoique',
    'sober and stoic': 'stoique',
    'mystique et symbolique': 'mystique',
    'mystical and symbolic': 'mystique',
    'fraternel et proche': 'fraternel',
    'brotherly and close': 'fraternel',
    'solennel et inspirant': 'solennel',
    'solemn and inspiring': 'solennel',
  }

  const lower = choice.toLowerCase()
  for (const [key, value] of Object.entries(mappings)) {
    if (lower.startsWith(key)) return value
  }
  return 'direct'
}

function mapPathTypeChoice(choice: string): string {
  const mappings: Record<string, string> = {
    voie: 'voie',
    path: 'voie',
    camino: 'voie',
    caminho: 'voie',
    religion: 'religion',
    religión: 'religion',
    mouvement: 'mouvement',
    movement: 'mouvement',
    movimiento: 'mouvement',
    movimento: 'mouvement',
    philosophie: 'philosophie',
    philosophy: 'philosophie',
    filosofía: 'philosophie',
    filosofia: 'philosophie',
    ordre: 'ordre',
    order: 'ordre',
    orden: 'ordre',
    tradition: 'tradition',
    tradición: 'tradition',
    tradição: 'tradition',
    courant: 'courant',
    current: 'courant',
    corriente: 'courant',
    corrente: 'courant',
    école: 'ecole',
    school: 'ecole',
    escuela: 'ecole',
    escola: 'ecole',
  }

  const lower = choice.toLowerCase()
  return mappings[lower] ?? 'voie'
}
