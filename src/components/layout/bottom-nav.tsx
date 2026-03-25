'use client'

// src/components/layout/bottom-nav.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/accueil',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" strokeLinejoin="round" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      </svg>
    ),
  },
  {
    href: '/guide',
    label: 'Guide',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.9 : 0} />
      </svg>
    ),
  },
  {
    href: '/cercles',
    label: 'Voies',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.07 : 0} />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={active ? 1.5 : 1.2} />
        <circle cx="12" cy="12" r="0.9" fill="currentColor" opacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
  {
    href: '/community',
    label: 'Communauté',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
        <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth={active ? 1.5 : 1.2} />
        <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
        <path d="M19 14c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth={active ? 1.5 : 1.2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/codex',
    label: 'Codex',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.08 : 0} />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth={active ? 1.5 : 1.2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'hsl(248 32% 6% / 0.92)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '1px solid hsl(248 22% 16% / 0.55)',
        boxShadow: '0 -1px 0 hsl(248 100% 100% / 0.03), 0 -16px 48px hsl(246 40% 2% / 0.30)',
      }}
    >
      <div
        className="mx-auto flex max-w-lg items-center justify-around"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
          paddingTop: '5px',
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
              className="relative flex flex-col items-center gap-[3px] rounded-2xl transition-all duration-200"
              style={{
                color: isActive ? 'hsl(38 58% 64%)' : 'hsl(248 10% 38%)',
                background: isActive ? 'hsl(38 52% 58% / 0.10)' : 'transparent',
                padding: '7px 6px 5px',
                minWidth: '52px',
                flex: 1,
              }}
            >
              {item.icon(isActive)}
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: isActive ? '0.03em' : '0.01em',
                  color: isActive ? 'hsl(38 58% 64%)' : 'hsl(248 10% 36%)',
                  transition: 'all 0.2s ease',
                  lineHeight: 1,
                  textAlign: 'center',
                  maxWidth: '50px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
