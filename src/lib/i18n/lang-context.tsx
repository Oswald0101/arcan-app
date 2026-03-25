// src/lib/i18n/lang-context.tsx
// Context React pour la langue — disponible dans tous les composants client

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Lang } from './dict'

const LangContext = createContext<Lang>('fr')

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

/** Hook pour récupérer la langue dans n'importe quel Client Component */
export function useLang(): Lang {
  return useContext(LangContext)
}

/** Helper pour traduire directement dans un Client Component */
export { t } from './dict'
