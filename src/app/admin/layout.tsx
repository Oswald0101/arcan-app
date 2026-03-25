// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getAdminContext } from '@/lib/admin/permissions'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s — Admin Voie', default: 'Admin — Voie' },
}

const NAV_LINKS = [
  { href: '/admin',               label: 'Vue globale',    icon: '◎' },
  { href: '/admin/membres',       label: 'Membres',        icon: '◉' },
  { href: '/admin/roles',         label: 'Rôles Admin',    icon: '✦' },
  { href: '/admin/boutique',      label: 'Boutique',       icon: '◇' },
  { href: '/admin/signalements',  label: 'Signalements',   icon: '⚠' },
  { href: '/admin/verification',  label: 'Vérification',   icon: '△' },
  { href: '/admin/business',      label: 'Business',       icon: '◆' },
  { href: '/admin/logs',          label: 'Logs',           icon: '◈' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext()
  if (!ctx) redirect('/auth/login?redirect=/admin')

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>

      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col"
        style={{
          background: 'hsl(var(--surface))',
          borderRight: '1px solid hsl(var(--border))',
        }}
      >
        {/* Logo admin */}
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
            style={{
              background: 'hsl(38 52% 58% / 0.12)',
              border: '1px solid hsl(38 52% 58% / 0.25)',
              color: 'hsl(38 58% 65%)',
            }}
          >
            ◎
          </div>
          <div>
            <p
              className="font-serif text-sm font-medium"
              style={{ color: 'hsl(38 22% 88%)' }}
            >
              Admin
            </p>
            <p className="text-[10px]" style={{ color: 'hsl(248 10% 44%)' }}>
              Voie
            </p>
          </div>
          <span
            className="ml-auto badge badge-gold text-[9px] px-1.5 py-0.5"
            style={{ fontSize: '9px' }}
          >
            {ctx.roleKey}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 group hover:bg-surface-elevated"
              style={{ color: 'hsl(248 10% 52%)' }}
            >
              <span
                className="text-base w-5 text-center flex-shrink-0"
                style={{ color: 'hsl(38 45% 50%)' }}
              >
                {link.icon}
              </span>
              <span className="group-hover:text-foreground transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer sidebar — retour espace utilisateur */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid hsl(var(--border))' }}
        >
          <Link
            href="/accueil"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-150 group hover:bg-surface-elevated w-full"
            style={{ color: 'hsl(248 10% 46%)' }}
          >
            <span
              style={{
                fontSize: '14px',
                color: 'hsl(38 52% 52%)',
                flexShrink: 0,
              }}
            >
              ◈
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium group-hover:text-foreground transition-colors truncate"
                style={{ color: 'hsl(248 10% 58%)' }}
              >
                Espace ARCAN
              </p>
              <p
                className="truncate"
                style={{ fontSize: '10px', color: 'hsl(248 10% 36%)' }}
              >
                Retour au dashboard
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'hsl(248 10% 30%)', flexShrink: 0 }}>
              →
            </span>
          </Link>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
