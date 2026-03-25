// src/lib/progression/validation.ts
// Moteur de validation qualitative des pratiques
// Principe : ARCAN récompense la présence, la sincérité, l'effort, la régularité.
//            La triche ne produit pas d'XP — elle stagne.

// ============================================================
// TYPES
// ============================================================

export type ValidationInput = {
  practiceId: string
  userId: string
  elapsedSeconds: number
  responseText?: string | null
  // Réponses précédentes du même utilisateur pour cette pratique (anti-répétition)
  previousResponses?: string[]
  // Nombre de pratiques validées dans les dernières 2h (anti-grind)
  recentCount2h?: number
  // Nombre de pratiques validées aujourd'hui (cap journalier)
  todayCount?: number
  // Streak en jours (bonus régularité)
  streakDays?: number
}

export type PracticeConfig = {
  xpReward: number
  validationType: string   // simple | corporelle | journal | lecture | meditation | epreuve
  minDurationSeconds: number
}

export type ValidationResult = {
  score: number             // 0.0 – 1.0
  xpAwarded: number
  flags: string[]           // signaux détectés
  guideQuestion?: string    // question posée si validation partielle
  blocked: boolean          // true = pratique refusée (cap journalier ou trop rapide)
}

// ============================================================
// CONSTANTES
// ============================================================

const DAILY_XP_CAP = 8          // max pratiques comptant pour l'XP par jour
const GRIND_WINDOW_LIMIT = 3     // max pratiques en 2h avant pénalité

const MIN_WORDS: Record<string, number> = {
  corporelle:  10,
  journal:     30,
  lecture:     16,
  meditation:  12,
  epreuve:     20,
  simple:       0,
}

const GUIDE_QUESTIONS: Record<string, string> = {
  corporelle:  "Qu'est-ce que ton corps t'a montré aujourd'hui ?",
  journal:     "Qu'est-ce qui t'a vraiment traversé en écrivant cela ?",
  lecture:     "Comment ce que tu as lu s'applique-t-il à toi en ce moment ?",
  meditation:  "Sur quoi t'es-tu réellement tenu pendant ce temps ?",
  epreuve:     "Qu'est-ce que cette épreuve a révélé en toi ?",
  simple:      "Qu'as-tu ressenti en faisant cette pratique ?",
}

// ============================================================
// POINT D'ENTRÉE PRINCIPAL
// ============================================================

export function validatePractice(
  input: ValidationInput,
  practice: PracticeConfig,
): ValidationResult {
  const flags: string[] = []

  // ── Cap journalier anti-grind ──────────────────────────────
  if ((input.todayCount ?? 0) >= DAILY_XP_CAP) {
    flags.push('daily_cap_reached')
    return {
      score: 0,
      xpAwarded: 0,
      flags,
      blocked: false, // La pratique est quand même loguée, juste sans XP
    }
  }

  // ── Score présence (timer) ─────────────────────────────────
  // Ratio : temps passé / temps minimum requis (cap à 1.0)
  const minSec = practice.minDurationSeconds
  const presenceScore = minSec === 0
    ? 1.0
    : Math.min(input.elapsedSeconds / minSec, 1.0)

  // Pratique complétée en moins de 40% du temps minimum → flag
  if (minSec > 0 && presenceScore < 0.4) {
    flags.push('too_fast')
  }

  // ── Score effort (texte) ───────────────────────────────────
  const text = (input.responseText ?? '').trim()
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const minWords = MIN_WORDS[practice.validationType] ?? 0
  const effortScore = minWords === 0
    ? 1.0
    : Math.min(wordCount / minWords, 1.0)

  if (minWords > 0 && wordCount === 0) {
    flags.push('no_text')
  } else if (minWords > 0 && isLowEntropy(text)) {
    flags.push('low_quality_text')
  }

  // ── Score sincérité (anti-copier-coller / répétition) ─────
  let sincerityScore = 1.0
  if (text.length > 0 && input.previousResponses?.length) {
    const isDuplicate = input.previousResponses.some(
      prev => levenshteinRatio(text, prev) > 0.80
    )
    if (isDuplicate) {
      flags.push('repeated_response')
      sincerityScore = 0.0
    }
  }
  // Texte à faible entropie compte aussi sur la sincérité
  if (flags.includes('low_quality_text')) {
    sincerityScore *= 0.30
  }

  // ── Score régularité (streak) ──────────────────────────────
  const streak = input.streakDays ?? 0
  // Interpolation : 0 jour → 0.60, 7 jours → 0.80, 30 jours → 1.0
  const regularityScore = Math.min(0.60 + (streak / 30) * 0.40, 1.0)

  // ── Pénalité anti-grind (3+ pratiques en 2h) ──────────────
  const grindPenalty = (input.recentCount2h ?? 0) >= GRIND_WINDOW_LIMIT ? 0.5 : 1.0

  // ── Score global pondéré ───────────────────────────────────
  //   présence  25%  — est-tu réellement là ?
  //   effort    30%  — as-tu fourni un retour substantiel ?
  //   sincérité 25%  — as-tu répondu de manière originale ?
  //   régularité 20% — reviens-tu régulièrement ?
  const rawScore =
    presenceScore  * 0.25 +
    effortScore    * 0.30 +
    sincerityScore * 0.25 +
    regularityScore * 0.20

  const score = Math.max(0, Math.min(rawScore * grindPenalty, 1.0))

  // ── XP selon le score ──────────────────────────────────────
  const xpRatio = scoreToXpRatio(score)
  const xpAwarded = Math.floor(practice.xpReward * xpRatio)

  // ── Question guide si validation partielle ─────────────────
  const guideQuestion = score < 0.5
    ? GUIDE_QUESTIONS[practice.validationType] ?? GUIDE_QUESTIONS.simple
    : undefined

  return {
    score: parseFloat(score.toFixed(3)),
    xpAwarded,
    flags,
    guideQuestion,
    blocked: false,
  }
}

// ============================================================
// HELPERS INTERNES
// ============================================================

/**
 * Convertit un score en ratio d'XP accordée.
 * Paliers volontairement resserrés pour que la qualité compte vraiment.
 *
 * score < 0.30 → 0 %   (validation superficielle : rien)
 * score 0.30–0.50 → 30 %  (présence minimale mais réponse pauvre)
 * score 0.50–0.70 → 60 %  (effort moyen)
 * score 0.70–0.90 → 85 %  (bonne pratique)
 * score ≥ 0.90   → 100 %  (pratique exemplaire)
 */
function scoreToXpRatio(score: number): number {
  if (score < 0.30) return 0
  if (score < 0.50) return 0.30
  if (score < 0.70) return 0.60
  if (score < 0.90) return 0.85
  return 1.0
}

/**
 * Détecte un texte à faible entropie : trop court, mots très répétés,
 * ou réponse du type "ok", "fait", "oui", "c'est bon".
 */
function isLowEntropy(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length < 4) return true

  const JUNK = new Set(['ok', 'oui', 'non', 'fait', 'okey', 'yes', 'no', 'done',
    'rien', 'bien', 'super', 'cool', 'top', 'bof', 'voilà', 'voila', 'ok.'])
  if (words.every(w => JUNK.has(w))) return true

  // Ratio mots uniques / total < 40% = trop répétitif
  const unique = new Set(words)
  return unique.size / words.length < 0.40
}

/**
 * Distance de Levenshtein normalisée entre deux chaînes.
 * Retourne un ratio 0.0 (rien en commun) → 1.0 (identique).
 */
function levenshteinRatio(a: string, b: string): number {
  const la = a.toLowerCase().trim()
  const lb = b.toLowerCase().trim()
  if (!la || !lb) return 0
  const longer = la.length >= lb.length ? la : lb
  const shorter = la.length >= lb.length ? lb : la
  const dist = levenshteinDistance(longer, shorter)
  return (longer.length - dist) / longer.length
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  // Utilise deux rangées pour économiser la mémoire
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1).fill(0)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1])
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}
