// src/components/layout/top-bar.tsx
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
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 h-14">

        {/* Logo ARCAN */}
        <Link href="/accueil" className="flex items-center gap-2.5 group">
          <span
            className="transition-all duration-300 group-hover:opacity-70"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '22px',
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: 'hsl(38 55% 62%)',
            }}
          >
            ARCAN
          </span>
        </Link>

        {/* Droite */}
        <div className="flex items-center gap-3">
          {/* Badge niveau */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '3px 9px',
              borderRadius: '999px',
              background: 'hsl(38 52% 58% / 0.09)',
              color: 'hsl(38 55% 60%)',
              border: '1px solid hsl(38 52% 58% / 0.16)',
            }}
          >
            Niv.{level}
          </span>

          {/* Accès console admin — visible seulement pour les admins */}
          {isAdmin && (
            <Link
              href="/admin"
              title="Console admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                background: 'hsl(248 30% 8%)',
                color: 'hsl(38 52% 52%)',
                border: '1px solid hsl(38 52% 58% / 0.20)',
                transition: 'all 0.2s ease',
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
            className="block rounded-full transition-all duration-200 hover:ring-2 hover:ring-offset-2"
            style={{
              '--tw-ring-color': 'hsl(38 52% 58% / 0.30)',
              '--tw-ring-offset-color': 'hsl(var(--background))',
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
