// src/app/(app)/profil/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'
import { UserAvatar } from '@/components/profile/user-avatar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mon profil — Voie' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, progress, badges, sub] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      include: { user: { select: { role: true, createdAt: true } } },
    }),
    prisma.userMemberProgress.findUnique({
      where: { userId: user.id },
      include: { currentLevel: true },
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
      take: 8,
    }),
    prisma.userSubscription.findFirst({
      where: { userId: user.id, status: { in: ['active', 'trialing'] } },
      include: { plan: { select: { title: true, planKey: true } } },
    }),
  ])

  if (!profile) redirect('/onboarding')

  const memberSince = new Date(profile.user.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
  const xpCurrent = profile.currentXp ?? 0
  const xpRequired = progress?.currentLevel?.requiredXp ?? 1000
  const xpPercent = Math.min(100, Math.round((xpCurrent / xpRequired) * 100))

  const NAV_ITEMS = [
    { href: '/boutique',              label: 'Boutique',                icon: '◆' },
    { href: '/parrainage',            label: 'Parrainage',              icon: '✦' },
    { href: '/profil/modifier',       label: 'Modifier mon profil',     icon: '◈' },
    { href: '/profil/parametres',     label: 'Paramètres',              icon: '⟡' },
    { href: '/profil/confidentialite',label: 'Confidentialité',         icon: '◯' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5 animate-fade-up">

      {/* ── Card profil principal ── */}
      <div className="card-premium p-6 space-y-5">

        {/* Avatar + identité */}
        <div className="flex items-start gap-4">
          <UserAvatar
            avatarUrl={profile.avatarUrl}
            displayName={profile.displayName}
            username={profile.username}
            size="xl"
            showRing
          />
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="font-serif text-2xl font-medium leading-tight"
                style={{ color: 'hsl(38 22% 92%)' }}
              >
                {profile.displayName ?? profile.username}
              </h1>
              {profile.verificationStatus !== 'none' && (
                <span className="badge badge-gold">✓ Vérifié</span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(248 10% 50%)' }}>
              @{profile.username}
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(248 10% 42%)' }}>
              Membre depuis {memberSince}
            </p>
          </div>
          <Link
            href="/profil/modifier"
            className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0"
          >
            Modifier
          </Link>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(38 12% 68%)' }}>
            {profile.bio}
          </p>
        )}

        <div className="divider-gold" />

        {/* Niveau + XP */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-serif text-base font-medium"
                style={{ color: 'hsl(38 22% 88%)' }}
              >
                {progress?.currentLevel?.title ?? `Niveau ${profile.currentLevel}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 48%)' }}>
                {xpCurrent} / {xpRequired} XP
              </p>
            </div>
            <span
              className="badge badge-gold font-serif text-sm"
            >
              Niv. {profile.currentLevel}
            </span>
          </div>

          {/* Barre XP */}
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'hsl(248 20% 14%)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPercent}%`,
                background: 'linear-gradient(to right, hsl(38 40% 42%), hsl(38 58% 66%))',
                boxShadow: '0 0 8px hsl(38 52% 58% / 0.4)',
              }}
            />
          </div>
        </div>

        {/* Streak */}
        {(progress?.streakDays ?? 0) > 0 && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{
              background: 'hsl(38 52% 58% / 0.06)',
              border: '1px solid hsl(38 52% 58% / 0.12)',
            }}
          >
            <span className="text-lg">{(progress?.streakDays ?? 0) >= 7 ? '🔥' : '◉'}</span>
            <p className="text-sm" style={{ color: 'hsl(38 22% 82%)' }}>
              <strong style={{ color: 'hsl(38 58% 68%)' }}>{progress?.streakDays ?? 0}</strong>
              {' '}jours consécutifs de pratique
            </p>
          </div>
        )}
      </div>

      {/* ── Abonnement ── */}
      <div className="card p-4 flex items-center justify-between animate-fade-up delay-100">
        <div>
          <p className="text-sm font-medium" style={{ color: 'hsl(38 22% 88%)' }}>
            {sub?.plan?.title ?? 'Plan Gratuit'}
          </p>
          {sub?.currentPeriodEnd && (
            <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 46%)' }}>
              {sub.cancelAtPeriodEnd ? 'Se termine le ' : 'Renouvellement le '}
              {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
            </p>
          )}
          {!sub && (
            <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 46%)' }}>
              Passe à Premium pour débloquer tout
            </p>
          )}
        </div>
        <Link
          href="/abonnement"
          className="text-xs transition-colors hover:opacity-80"
          style={{ color: 'hsl(38 52% 60%)' }}
        >
          Gérer →
        </Link>
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <section className="space-y-3 animate-fade-up delay-100">
          <div className="flex items-center justify-between">
            <p className="label-section">Badges ({badges.length})</p>
            <Link href="/progression" className="text-xs" style={{ color: 'hsl(38 52% 55%)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {badges.map((ub: any) => (
              <div key={ub.id} className="card p-3 text-center space-y-1.5">
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-8 w-8 mx-auto" />
                ) : (
                  <div
                    className="h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: 'hsl(38 52% 58% / 0.10)',
                      color: 'hsl(38 55% 65%)',
                    }}
                  >
                    ✦
                  </div>
                )}
                <p className="text-[10px] truncate" style={{ color: 'hsl(248 10% 50%)' }}>
                  {ub.badge.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Navigation ── */}
      <nav className="card space-y-0.5 p-2 animate-fade-up delay-200">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-150 hover:bg-surface-elevated group"
            style={{ color: 'hsl(248 10% 55%)' }}
          >
            <span
              className="text-base w-5 text-center flex-shrink-0 transition-colors"
              style={{ color: 'hsl(38 52% 48%)' }}
            >
              {item.icon}
            </span>
            <span
              className="flex-1 transition-colors group-hover:text-foreground"
            >
              {item.label}
            </span>
            <span className="text-xs opacity-40">→</span>
          </Link>
        ))}
      </nav>

      {/* ── Déconnexion ── */}
      <div className="pt-1 animate-fade-up delay-300">
        <LogoutButton className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-150 hover:bg-destructive/8 hover:text-destructive text-foreground-dim border border-border" />
      </div>

      <div className="h-2" />
    </div>
  )
}
