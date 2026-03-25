// src/lib/ai/prompts/onboarding.ts
// Prompts versionnés pour la génération de contenu à l'onboarding

import type { SensitivityScores, OnboardingRecommendations } from '@/lib/onboarding/scoring'

export interface OnboardingAnswerSummary {
  arrivalReason?: string
  missingToday?: string
  mainStruggle?: string
  qualityToStrengthen?: string
  truthDescription?: string
  pathName?: string
  foundingSentence?: string
  firstPrinciples?: string[]
  thirtyDayVision?: string
  selfCommitment?: string
  symbolicAffinities?: string[]
}

// ---- Génération du Manifeste ----

export function buildManifestoPrompt(
  answers: OnboardingAnswerSummary,
  scores: SensitivityScores,
  recs: OnboardingRecommendations,
  language: string = 'fr',
): string {
  const lang = language === 'fr' ? 'français' : language === 'en' ? 'anglais' : language === 'es' ? 'espagnol' : 'portugais'

  return `Tu es un rédacteur de textes fondateurs pour des voies de croissance personnelle.

CONTEXTE DU FONDATEUR :
- Ce qu'il cherche : ${answers.missingToday ?? 'non précisé'}
- Sa lutte principale : ${answers.mainStruggle ?? 'non précisée'}
- La qualité qu'il veut renforcer : ${answers.qualityToStrengthen ?? 'non précisée'}
- La vérité qu'il cherche : ${answers.truthDescription ?? 'non précisée'}
- Sa phrase fondatrice : "${answers.foundingSentence ?? ''}"
- Ses premiers principes : ${answers.firstPrinciples?.join(' / ') ?? 'non précisés'}
- Sa vision à 30 jours : ${answers.thirtyDayVision ?? 'non précisée'}
- Son engagement envers lui-même : ${answers.selfCommitment ?? 'non précisé'}
- Affinités symboliques : ${answers.symbolicAffinities?.join(', ') ?? 'aucune précisée'}

PROFIL DE SENSIBILITÉ (scores 0.0 à 1.0) :
- Besoin de sens : ${scores.need_for_meaning}
- Ancrage spirituel : ${scores.spiritual_affinity}
- Affinité symbolique : ${scores.symbolic_affinity}
- Niveau d'engagement : ${scores.commitment_level}
- Confrontation souhaitée : ${scores.confrontation_preference}

VOIE À CRÉER : "${answers.pathName ?? 'Ma Voie'}"

MISSION :
Écris le Manifeste de cette Voie. Un texte fondateur court, profond et personnel.

RÈGLES STRICTES :
- Langue : ${lang}
- Entre 120 et 250 mots maximum
- Ton cohérent avec le profil (confrontation: ${scores.confrontation_preference > 0.6 ? 'direct' : 'nuancé'}, spiritualité: ${scores.spiritual_affinity > 0.6 ? 'élevée' : 'modérée'})
- Vraiment personnel — pas générique
- Ne commence pas par "Ce manifeste" ni "Bienvenue"
- Utilise la première personne ou un style déclaratif fort
- Reflète la phrase fondatrice de la personne
- Retourne UNIQUEMENT le texte du manifeste, sans titre, sans balises, sans commentaires`
}

// ---- Génération du profil / personnalité du Guide ----

export function buildGuidePersonalityPrompt(
  answers: OnboardingAnswerSummary,
  scores: SensitivityScores,
  guideName: string,
  memberName: string,
  guideTone: string,
  addressMode: 'tutoiement' | 'vouvoiement',
  language: string = 'fr',
): string {
  const lang = language === 'fr' ? 'français' : language === 'en' ? 'anglais' : language === 'es' ? 'espagnol' : 'portugais'

  return `Tu es un architecte de personnalités pour des guides IA de croissance personnelle.

MEMBRE :
- Cherche : ${answers.missingToday ?? 'non précisé'}
- Lutte principale : ${answers.mainStruggle ?? 'non précisée'}
- Qualité à renforcer : ${answers.qualityToStrengthen ?? 'non précisée'}
- Phrase fondatrice de sa Voie : "${answers.foundingSentence ?? ''}"
- Engagement : ${answers.selfCommitment ?? 'non précisé'}

GUIDE :
- Nom : ${guideName}
- Appelle le membre : ${memberName || 'par son nom d\'utilisateur'}
- Ton souhaité : ${guideTone}
- Mode d'adresse : ${addressMode}
- Niveau de confrontation cible : ${scores.confrontation_preference > 0.6 ? 'élevé — direct et sans filtre' : scores.confrontation_preference < 0.35 ? 'doux — bienveillant mais honnête' : 'équilibré'}

MISSION :
Génère le prompt système qui définira la personnalité de ce Guide IA.
Ce prompt sera injecté dans le system prompt à chaque conversation.

RÈGLES STRICTES :
- Langue du prompt généré : ${lang}
- Entre 200 et 400 mots
- Définir clairement : qui est ce Guide, comment il parle, ce qu'il ne dit JAMAIS, comment il recadre
- Inclure : il ne flatte pas, il sert l'évolution, il rappelle les engagements
- Inclure : il refuse violence, suicide, automutilation, haine
- Ton cohérent avec le profil du membre
- Retourne UNIQUEMENT le prompt, sans commentaires, sans balises`
}

// ---- Génération du résumé du Codex initial ----

export function buildInitialCodexPrompt(
  answers: OnboardingAnswerSummary,
  manifestoText: string,
  principles: string[],
  language: string = 'fr',
): string {
  const lang = language === 'fr' ? 'français' : language === 'en' ? 'anglais' : language === 'es' ? 'espagnol' : 'portugais'

  return `Tu génères la première version d'un Codex personnel pour une plateforme de croissance personnelle.

MANIFESTE DE LA VOIE :
${manifestoText}

PRINCIPES FONDATEURS :
${principles.map((p, i) => `${i + 1}. ${p}`).join('\n')}

ENGAGEMENT INITIAL DU MEMBRE :
${answers.selfCommitment ?? 'non précisé'}

VISION À 30 JOURS :
${answers.thirtyDayVision ?? 'non précisée'}

MISSION :
Génère la première version du Codex personnel de ce membre.
Le Codex est son livre vivant — il évoluera avec lui.

FORMAT DEMANDÉ (Markdown) :
# Ma Voie
[2-3 phrases d'introduction personnelle]

## Manifeste
[le manifeste ci-dessus, légèrement condensé si > 200 mots]

## Mes Principes
[liste des principes]

## Mon Engagement
[l'engagement du membre, mis en forme]

## Ce que je construis
[la vision à 30 jours, mise en perspective]

## Pages à venir
_Ce Codex évoluera avec toi. Il est vivant._

RÈGLES :
- Langue : ${lang}
- Sobre et profond, pas générique
- Max 400 mots au total
- Retourne UNIQUEMENT le contenu Markdown, sans commentaires`
}
