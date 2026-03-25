// src/app/admin/page.tsx
import { getDashboardStats } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Vue globale' }

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8 animate-fade-up">

      {/* En-tête */}
      <div>
        <h1 className="font-serif text-2xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
          Vue globale
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 48%)' }}>
          État de la plateforme en temps réel
        </p>
      </div>

      {/* Alertes urgentes */}
      {(stats.openReports > 0 || stats.pendingVerifications > 0) && (
        <div className="space-y-2">
          {stats.openReports > 0 && (
            <AlertBanner
              href="/admin/signalements"
              icon="⚠"
              label={`${stats.openReports} signalement${stats.openReports > 1 ? 's' : ''} en attente`}
              level="warning"
            />
          )}
          {stats.pendingVerifications > 0 && (
            <AlertBanner
              href="/admin/verification"
              icon="✦"
              label={`${stats.pendingVerifications} demande${stats.pendingVerifications > 1 ? 's' : ''} de vérification`}
              level="info"
            />
          )}
        </div>
      )}

      {/* Stats membres */}
      <StatSection title="Membres">
        <StatCard label="Total membres"       value={stats.totalMembers}          />
        <StatCard label="Nouveaux (7j)"        value={stats.newMembersLast7Days}   accent />
        <StatCard label="En onboarding"        value={stats.pendingMemberships}    />
      </StatSection>

      {/* Stats contenu */}
      <StatSection title="Contenu">
        <StatCard label="Voies actives" value={stats.totalPaths}   />
        <StatCard label="Cercles"       value={stats.totalCircles} />
      </StatSection>

      {/* Stats business */}
      <StatSection title="Business">
        <StatCard label="Abonnements actifs"      value={stats.activeSubscriptions}   accent />
        <StatCard label="Achats (7j)"              value={stats.recentPurchases}        />
        <StatCard label="Invitations activées (7j)" value={stats.recentInviteActivations} />
      </StatSection>

      {/* Modération */}
      <StatSection title="Modération">
        <StatCard label="Signalements ouverts"    value={stats.openReports}          urgent={stats.openReports > 5} />
        <StatCard label="Vérifications en attente" value={stats.pendingVerifications} />
      </StatSection>
    </div>
  )
}

function StatSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 animate-fade-up">
      <p className="label-section">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  )
}

function StatCard({
  label, value, accent, urgent,
}: {
  label: string
  value: number
  accent?: boolean
  urgent?: boolean
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-1"
      style={{
        background: urgent
          ? 'hsl(0 68% 48% / 0.07)'
          : 'hsl(var(--surface))',
        border: urgent
          ? '1px solid hsl(0 68% 48% / 0.2)'
          : '1px solid hsl(var(--border))',
        boxShadow: 'inset 0 1px 0 hsl(38 22% 90% / 0.04)',
      }}
    >
      <p
        className="font-serif text-3xl font-medium"
        style={{
          color: urgent
            ? 'hsl(0 68% 62%)'
            : accent
              ? 'hsl(38 58% 65%)'
              : 'hsl(38 22% 88%)',
        }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'hsl(248 10% 48%)' }}>{label}</p>
    </div>
  )
}

function AlertBanner({
  href, icon, label, level,
}: {
  href: string
  icon: string
  label: string
  level: 'warning' | 'info'
}) {
  const styles = {
    warning: {
      bg:     'hsl(38 70% 50% / 0.08)',
      border: 'hsl(38 70% 50% / 0.2)',
      color:  'hsl(38 75% 65%)',
    },
    info: {
      bg:     'hsl(220 60% 55% / 0.08)',
      border: 'hsl(220 60% 55% / 0.2)',
      color:  'hsl(220 65% 72%)',
    },
  }
  const s = styles[level]
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all hover:brightness-110"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="flex-shrink-0 text-xs opacity-70">Voir →</span>
    </Link>
  )
}
