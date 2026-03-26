'use client'

// src/components/layout/bottom-nav.tsx
// Refonte : Navigation mobile premium, zones de frappe augmentées, meilleure hiérarchie

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang, t } from '@/lib/i18n'
import type { DictKey } from '@/lib/i18n/dict'

const NAV_ITEMS: { href: string; labelKey: DictKey; icon: (active: boolean) => React.ReactNode }[] = [
  {
    href: '/accueil',
    labelKey: 'nav_home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    href: '/guide',
    labelKey: 'nav_guide',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.9 : 0} />
      </svg>
    ),
  },
  {
    href: '/cercles',
    labelKey: 'nav_paths',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.08 : 0} />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={active ? 1.8 : 1.3} />
        <circle cx="12" cy="12" r="1" fill="currentColor" opacity={active ? 1 : 0.5} />
      </svg>
    ),
  },
  {
    href: '/community',
    labelKey: 'nav_community',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.3} />
        <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
        <path d="M19 14c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth={active ? 1.8 : 1.3} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profil',
    labelKey: 'nav_profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.18 : 0} />
        <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const lang = useLang()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'hsl(248 36% 5% / 0.90)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        boxShadow: '0 -16px 48px hsl(246 42% 2% / 0.35)',
      }}
    >
      {/* Ligne dorée en haut du nav */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, hsl(38 54% 62% / 0.30) 30%, hsl(38 68% 75% / 0.55) 50%, hsl(38 54% 62% / 0.30) 70%, transparent)',
      }} />

      <div
        className="mx-auto flex max-w-lg items-center justify-around"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
          paddingTop: '6px',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 transition-all duration-200 active:scale-90"
              style={{
                padding: '8px 6px 6px',
                minWidth: '56px',
                minHeight: '54px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'hsl(38 62% 68%)' : 'hsl(248 10% 38%)',
              }}
            >
              {/* Glow derrière l'icône active */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, hsl(38 54% 62% / 0.18) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Icône */}
              <div style={{
                position: 'relative',
                filter: isActive ? 'drop-shadow(0 0 6px hsl(38 54% 62% / 0.50))' : 'none',
                transition: 'filter 0.2s ease',
              }}>
                {item.icon(isActive)}
              </div>

              {/* Label */}
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: isActive ? '0.04em' : '0.01em',
                color: isActive ? 'hsl(38 62% 68%)' : 'hsl(248 10% 36%)',
                transition: 'all 0.2s ease',
                lineHeight: 1.2,
                textAlign: 'center',
                maxWidth: '52px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}>
                {t(lang, item.labelKey)}
              </span>

              {/* Point indicateur doré sous l'icône active */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'hsl(38 62% 68%)',
                  boxShadow: '0 0 6px hsl(38 54% 62% / 0.70)',
                }} />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
