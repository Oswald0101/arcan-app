// src/lib/ai/safety/index.ts
// Garde-fous et modération — vérification avant et après génération

// ============================================================
// PATTERNS BLOQUANTS (vérification rapide avant appel IA)
// ============================================================
// Évite d'appeler l'IA pour des messages clairement dangereux

const BLOCKING_PATTERNS = [
  // Intentions violentes directes
  /\b(tuer|assassiner|massacrer|éliminer).*(quelqu|moi|personne)/i,
  /\b(kill|murder|slaughter|assassinate).*(someone|myself|people)/i,
  // Automutilation directe
  /\b(me (couper|blesser|mutiler|brûler)|self.?harm|cut myself)\b/i,
  // Méthodes suicide
  /\b(comment (se suicider|mourir facilement)|suicide methods|how to die)\b/i,
  // Extrémisme
  /\b(attentat|terrorisme|djihadisme|propagande nazie)\b/i,
]

// Patterns qui déclenchent une réponse de soutien spéciale
const CONCERN_PATTERNS = [
  /\b(envie de mourir|plus envie de vivre|à quoi ça sert de vivre|fin de tout)\b/i,
  /\b(want to die|no reason to live|end it all|give up on life)\b/i,
  /\b(me suicider|me tuer|my life is over)\b/i,
]

export type SafetyCheckResult =
  | { safe: true }
  | { safe: false; level: 'block' | 'concern'; reason: string }

export function checkInputSafety(message: string): SafetyCheckResult {
  // Vérification blocage
  for (const pattern of BLOCKING_PATTERNS) {
    if (pattern.test(message)) {
      return {
        safe: false,
        level: 'block',
        reason: 'Ce message contient du contenu potentiellement dangereux.',
      }
    }
  }

  // Vérification préoccupation
  for (const pattern of CONCERN_PATTERNS) {
    if (pattern.test(message)) {
      return {
        safe: false,
        level: 'concern',
        reason: 'Ce message exprime une potentielle détresse.',
      }
    }
  }

  return { safe: true }
}

// ============================================================
// RÉPONSES DE SÉCURITÉ
// ============================================================

export function getCrisisResponse(lang: string = 'fr'): string {
  const responses: Record<string, string> = {
    fr: `Ce que tu traverses semble difficile. Je ne suis pas équipé pour t'aider comme tu en as besoin là maintenant.

Si tu es en détresse ou en danger, contacte une ligne d'écoute :
**France** : 3114 (numéro national de prévention du suicide, 24h/24)
**Belgique** : 0800 32 123
**Suisse** : 143
**Canada** : 1-866-APPELLE

Ces lignes sont gratuites, confidentielles, et les personnes qui répondent sont formées pour ce que tu vis.

Je suis là quand tu veux reparler d'autre chose.`,

    en: `What you're going through sounds difficult. I'm not equipped to help you the way you need right now.

If you're in distress or danger, please reach out:
**International** : findahelpline.com
**US/Canada** : 988 (Suicide & Crisis Lifeline)
**UK** : 116 123 (Samaritans)

These lines are free, confidential, and staffed by trained listeners.

I'm here when you want to talk about something else.`,
  }

  return responses[lang] ?? responses['fr']
}

export function getBlockResponse(lang: string = 'fr'): string {
  const responses: Record<string, string> = {
    fr: `Je ne peux pas engager sur ce sujet. Ce n'est pas quelque chose que je suis conçu pour traiter.

Si tu veux explorer quelque chose de difficile dans ta Voie, je suis là — mais pas sur ce terrain-là.`,
    en: `I can't engage on this topic. It's not something I'm designed to address.

If you want to explore something difficult on your Path, I'm here — but not on this ground.`,
  }

  return responses[lang] ?? responses['fr']
}

// ============================================================
// VÉRIFICATION DE LA RÉPONSE GÉNÉRÉE
// ============================================================
// Dernière ligne de défense — vérifie que la réponse du guide est sûre
// (Le prompt système inclut déjà les garde-fous côté IA)

const RESPONSE_RED_FLAGS = [
  /voici comment (se suicider|mourir|vous tuer)/i,
  /je vous conseille de (vous blesser|mettre fin)/i,
  /c'est une bonne idée de (vous suicider|mourir)/i,
]

export function checkOutputSafety(response: string): boolean {
  for (const pattern of RESPONSE_RED_FLAGS) {
    if (pattern.test(response)) return false
  }
  return true
}
