'use client'

// src/components/i18n/lang-switcher.tsx
// Sélecteur de langue — écrit le cookie et recharge la page

import { useRouter } from 'next/navigation'
import { useLang, setLangCookie } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n/dict'

const LANG_OPTIONS: { value: Lang; label: string; flag: string }[] = [
  { value: 'fr', label: 'Français',   flag: '🇫🇷' },
  { value: 'en', label: 'English',    flag: '🇬🇧' },
  { value: 'es', label: 'Español',    flag: '🇪🇸' },
  { value: 'pt', label: 'Português',  flag: '🇧🇷' },
]

interface LangSwitcherProps {
  /** Affichage compact (flag + code) ou complet (flag + label) */
  compact?: boolean
}

export function LangSwitcher({ compact = false }: LangSwitcherProps) {
  const lang = useLang()
  const router = useRouter()

  function handleChange(newLang: Lang) {
    if (newLang === lang) return
    setLangCookie(newLang)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      {LANG_OPTIONS.map((option) => {
        const isActive = option.value === lang
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            title={option.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: compact ? '5px 8px' : '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${isActive ? 'hsl(38 52% 58% / 0.35)' : 'hsl(248 22% 16%)'}`,
              background: isActive ? 'hsl(38 52% 58% / 0.10)' : 'transparent',
              color: isActive ? 'hsl(38 62% 68%)' : 'hsl(248 10% 44%)',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{option.flag}</span>
            {!compact && (
              <span>{option.label}</span>
            )}
            {compact && (
              <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                {option.value}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
