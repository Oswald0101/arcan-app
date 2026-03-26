// src/lib/i18n/lang-context.tsx
// Context React pour la langue — stateful, mis à jour instantanément côté client

'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lang } from './dict'
import { setLangCookie } from './use-lang'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'fr',
  setLang: () => {},
})

/**
 * Provider — reçoit la langue initiale du serveur (cookie > DB > Accept-Language > fr)
 * et gère l'état localement. Le changement de langue est immédiat et persiste via cookie.
 */
export function LangProvider({ lang: initialLang, children }: { lang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  function setLang(newLang: Lang) {
    if (newLang === lang) return
    setLangState(newLang)
    setLangCookie(newLang)
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

/** Langue courante — utilisable dans n'importe quel Client Component */
export function useLang(): Lang {
  return useContext(LangContext).lang
}

/** Setter de langue — change l'état et écrit le cookie */
export function useSetLang(): (lang: Lang) => void {
  return useContext(LangContext).setLang
}

/** Helper direct pour traduire dans un Client Component */
export { t } from './dict'
