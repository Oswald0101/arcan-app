// src/components/layout/top-bar.tsx
// Refonte : Header premium, safe-area, zones de frappe augmentées

import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { UserAvatar } from '@/components/profile/user-avatar'

interface TopBarProps {
  username: string
  displayName: string | null
  avatarUrl: string | null
  level: number
  isAdmin?: boolean
}

export function TopBar({ username, displayName, avatarUrl, level, isAdmin }: TopBarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: 'hsl(248 32% 5% / 0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderBottom: '1px solid hsl(248 22% 13% / 0.60)',
        boxShadow: '0 1px 0 hsl(248 100% 100% / 0.025), 0 4px 24px hsl(246 40% 2% / 0.20)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
      }}
    >
      <div
        className="mx-auto flex max-w-lg items-center justify-between px-4"
        style={{
          height: '56px',
        }}
      >

        {/* Logo ARCAN */}
        <Link href="/accueil" className="flex items-center gap-2.5 group transition-opacity hover:opacity-70">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '20px',
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: 'hsl(38 55% 62%)',
            }}
          >
            ARCAN
          </span>
        </Link>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {/* Badge niveau */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'hsl(38 52% 58% / 0.10)',
              color: 'hsl(38 55% 62%)',
              border: '1px solid hsl(38 52% 58% / 0.18)',
              textTransform: 'uppercase',
            }}
          >
            Niv.{level}
          </span>

          {/* Accès console admin — visible seulement pour les admins */}
          {isAdmin && (
            <Link
              href="/admin"
              title="Console admin"
              className="transition-all hover:opacity-70"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                background: 'hsl(248 30% 8%)',
                color: 'hsl(38 52% 55%)',
                border: '1px solid hsl(38 52% 58% / 0.20)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '12px', lineHeight: 1 }}>◎</span>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <NotificationBell />

          <Link
            href="/profil"
            className="block rounded-full transition-all duration-200 hover:ring-2 hover:ring-offset-2 active:scale-95"
            style={{
              '--tw-ring-color': 'hsl(38 52% 58% / 0.30)',
              '--tw-ring-offset-color': 'hsl(var(--background))',
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } as React.CSSProperties}
          >
            <UserAvatar
              avatarUrl={avatarUrl}
              displayName={displayName}
              username={username}
              size="xs"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
