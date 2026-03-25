// src/lib/i18n/use-lang.ts
// Helpers client pour le cookie de langue

'use client'

import type { Lang } from './dict'

const COOKIE_NAME = 'voie-lang'
const VALID_LANGS: Lang[] = ['fr', 'en', 'es', 'pt']

/** Lit la langue dans le cookie — côté client uniquement */
export function readLangCookie(): Lang {
  if (typeof document === 'undefined') return 'fr'
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  const val = match ? decodeURIComponent(match[1]) : null
  return (VALID_LANGS.includes(val as Lang) ? val : 'fr') as Lang
}

/** Écrit le cookie de langue — côté client uniquement */
export function setLangCookie(lang: Lang): void {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365 // 1 an
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`
}
