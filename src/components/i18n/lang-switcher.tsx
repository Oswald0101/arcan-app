'use client'

// src/components/i18n/lang-switcher.tsx
// Sélecteur de langue — changement instantané, persistance cookie, responsive mobile

import { useLang, useSetLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n/dict'

const LANG_OPTIONS: { value: Lang; label: string; flag: string }[] = [
  { value: 'fr', label: 'Français',  flag: '🇫🇷' },
  { value: 'en', label: 'English',   flag: '🇬🇧' },
  { value: 'es', label: 'Español',   flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
]

export function LangSwitcher() {
  const lang = useLang()
  const setLang = useSetLang()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}
    >
      {LANG_OPTIONS.map((option) => {
        const isActive = option.value === lang
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLang(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1px solid ${isActive ? 'hsl(38 52% 58% / 0.40)' : 'hsl(248 22% 16%)'}`,
              background: isActive
                ? 'linear-gradient(135deg, hsl(38 52% 58% / 0.12), hsl(38 52% 58% / 0.06))'
                : 'hsl(248 30% 7%)',
              color: isActive ? 'hsl(38 62% 70%)' : 'hsl(248 10% 48%)',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>
              {option.flag}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {option.label}
            </span>
            {isActive && (
              <span style={{ fontSize: '12px', color: 'hsl(38 62% 68%)', flexShrink: 0 }}>
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
