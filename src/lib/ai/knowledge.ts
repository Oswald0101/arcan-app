// src/lib/ai/knowledge.ts
// Retrieval adaptatif de la base de connaissances du Guide.
//
// Hiérarchie de priorité :
//   1. Entrées scopées à la Voie spécifique ("voie:{pathId}")
//   2. Entrées globales ciblant la sensibilité dominante du membre
//   3. Entrées globales par poids décroissant
//
// Les tags extraits de la conversation créent un boost supplémentaire
// — sans LLM, par simple matching de mots-clés thématiques.

import { prisma } from '@/lib/prisma'

// ============================================================
// TYPES
// ============================================================

export type KnowledgeSnippet = {
  category: string
  content: string
}

// ============================================================
// POINT D'ENTRÉE PRINCIPAL
// ============================================================

/**
 * Récupère les savoirs pertinents pour un échange donné.
 * Appelé en parallèle dans buildGuideContext(), résultat injecté
 * dans le bloc 5.5 du prompt système.
 */
export async function fetchRelevantKnowledge(
  pathId: string | null,
  sensitivityScores: Record<string, number>,
  conversationSnippet: string = '',
  limit = 4,
): Promise<KnowledgeSnippet[]> {
  const scopes = ['global']
  if (pathId) scopes.push(`voie:${pathId}`)

  const candidates = await prisma.knowledgeEntry.findMany({
    where: {
      scope: { in: scopes },
      isActive: true,
    },
    orderBy: { weight: 'desc' },
    take: limit * 4, // suréchantillonner pour trier ensuite
    select: {
      category:          true,
      content:           true,
      weight:            true,
      tags:              true,
      targetSensitivity: true,
      scope:             true,
    },
  })

  if (candidates.length === 0) return []

  const dominant = getDominantSensitivity(sensitivityScores)
  const convTags  = extractTagsFromSnippet(conversationSnippet)

  // Scoring multi-critères
  const scored = candidates.map(entry => {
    let score = Number(entry.weight)

    // Entrée spécifique à la Voie > globale
    if (entry.scope !== 'global') score += 0.5

    // Sensibilité ciblée correspond à la dominante du membre
    if (entry.targetSensitivity === dominant) score += 0.4

    // Chaque tag de la conversation présent dans l'entrée = +0.2
    const entryTags = entry.tags as string[]
    const tagHits = convTags.filter(t => entryTags.includes(t)).length
    score += tagHits * 0.2

    return { ...entry, relevanceScore: score }
  })

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(e => ({ category: e.category, content: e.content }))
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Dimension de sensibilité la plus haute dans le profil du membre.
 */
function getDominantSensitivity(scores: Record<string, number>): string {
  const entries = Object.entries(scores)
  if (entries.length === 0) return 'need_for_meaning'
  return entries.sort(([, a], [, b]) => b - a)[0][0]
}

/**
 * Extraction légère de tags thématiques depuis un extrait de conversation.
 * Pas de LLM — matching de mots-clés FR/EN, exécuté en < 1ms.
 *
 * Ces tags servent à booster les entrées KnowledgeEntry qui les portent,
 * rendant le retrieval sensible au sujet réel de l'échange.
 */
function extractTagsFromSnippet(text: string): string[] {
  if (!text) return []
  const lower = text.toLowerCase()

  const TAG_KEYWORDS: Record<string, string[]> = {
    discipline:     ['discipline', 'régularité', 'habitude', 'constance', 'rigueur', 'routine'],
    resilience:     ['résilience', 'surmonter', 'difficulté', 'obstacle', 'échouer', 'chute', 'rechute'],
    meditation:     ['méditation', 'silence', 'intérieur', 'calme', 'présence', 'pleine conscience'],
    emotion:        ['émotion', 'sentiment', 'ressentir', 'colère', 'tristesse', 'peur', 'honte', 'joie'],
    identite:       ['identité', 'qui suis-je', 'moi', 'sens', 'purpose', 'vocation', 'mission'],
    relation:       ['relation', 'famille', 'couple', 'ami', 'entourage', 'lien', 'conflits', 'solitude'],
    travail:        ['travail', 'carrière', 'projet', 'professionnel', 'ambition', 'performance'],
    corps:          ['corps', 'physique', 'santé', 'sport', 'mouvement', 'sommeil', 'alimentation'],
    philosophie:    ['philosophie', 'sagesse', 'stoïcisme', 'bouddhisme', 'vérité', 'épictète', 'socrate'],
    transformation: ['changer', 'transformation', 'évoluer', 'grandir', 'progresser', 'devenir'],
    doute:          ['doute', 'incertitude', 'perdu', 'confus', 'chercher', 'questionnement'],
    creation:       ['créer', 'créativité', 'art', 'écrire', 'inventer', 'projet', 'construire'],
    engagement:     ['engagement', 'promesse', 'objectif', 'décision', 'résolution', 'commitment'],
    spiritualite:   ['spirituel', 'âme', 'transcendance', 'divin', 'énergie', 'univers', 'croyance'],
    mort:           ['mort', 'mortalité', 'finitude', 'deuil', 'disparition', 'héritage'],
  }

  return Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some(kw => lower.includes(kw)))
    .map(([tag]) => tag)
}

// ============================================================
// INSTRUCTIONS D'ADAPTATION À LA SENSIBILITÉ
// ============================================================

/**
 * Génère les instructions de style adaptées au profil de sensibilité.
 * Appelé dans buildSystemPrompt() pour enrichir les blocs Ton + Membre.
 *
 * Règles actives seulement si la dimension dépasse un seuil significatif.
 */
export function buildSensitivityInstructions(scores: Record<string, number>): string {
  const rules: string[] = []

  const s = (key: string) => scores[key] ?? 0.5

  // Sensibilité spirituelle
  if (s('spiritual_affinity') > 0.65) {
    rules.push('Ce membre est sensible au spirituel — les symboles, métaphores et références non-rationnelles résonnent avec lui.')
  }

  // Ancrage rationnel
  if (s('rational_affinity') > 0.65) {
    rules.push("Ce membre pense par concepts et raisonnements — préfère les arguments solides aux formules inspirationnelles.")
  }

  // Désir de communauté
  if (s('community_desire') > 0.65) {
    rules.push("Ce membre cherche à appartenir — évoque la Voie comme espace partagé quand c'est pertinent.")
  }

  // Besoin de structure
  if (s('need_for_structure') > 0.65) {
    rules.push("Ce membre a besoin de clarté et d'ordre — des réponses bien structurées avec des étapes concrètes l'aident.")
  }

  // Affinité symbolique
  if (s('symbolic_affinity') > 0.65) {
    rules.push("Ce membre pense en images et archétypes — les métaphores et le langage symbolique fort portent bien.")
  }

  // Confrontation — élevée
  if (s('confrontation_preference') > 0.65) {
    rules.push("Ce membre veut être challengé directement — ne ménage pas la vérité, il la préfère brute.")
  }

  // Confrontation — faible
  if (s('confrontation_preference') < 0.35) {
    rules.push("Ce membre est sensible à l'approche frontale — privilégie le reframing doux et la bienveillance ferme.")
  }

  // Engagement fragile
  if (s('commitment_level') < 0.35) {
    rules.push("Ce membre a déclaré un engagement fragile — sois attentif aux signaux d'abandon, recadre avec douceur mais sans complaisance.")
  }

  // Élan créateur
  if (s('creation_desire') > 0.70) {
    rules.push("Ce membre est animé par un élan créateur — valorise ses initiatives, propose des défis qui l'invitent à construire.")
  }

  // Quête de sens
  if (s('need_for_meaning') > 0.70) {
    rules.push("Ce membre est en quête profonde de sens — ne reste pas en surface, il veut de la profondeur.")
  }

  if (rules.length === 0) return ''
  return rules.join('\n')
}
