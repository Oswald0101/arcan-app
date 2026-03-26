// src/app/(app)/profil/page.tsx
// Refonte : Profil premium, lisibilité mobile, affichage du nom d'utilisateur correct

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
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 pb-4 animate-fade-up">

      {/* ── Card profil principal ── */}
      <div className="card-premium p-6 space-y-6">

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
                {profile.displayName || profile.username}
              </h1>
              {profile.verificationStatus !== 'none' && (
                <span className="badge badge-gold">✓ Vérifié</span>
              )}
            </div>
            <p className="text-base mt-1 font-medium" style={{ color: 'hsl(38 52% 65%)' }}>
              @{profile.username}
            </p>
            <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 48%)' }}>
              Membre depuis {memberSince}
            </p>
          </div>
          <Link
            href="/profil/modifier"
            className="btn-ghost text-sm px-4 py-2 flex-shrink-0"
            style={{ minHeight: '40px' }}
          >
            Modifier
          </Link>
        </div>

        {/* Bio */}
        {profile.bio && (
          <>
            <div className="divider-gold" />
            <p className="text-base leading-relaxed" style={{ color: 'hsl(38 12% 70%)' }}>
              {profile.bio}
            </p>
          </>
        )}

        <div className="divider-gold" />

        {/* Niveau + XP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-serif text-lg font-medium"
                style={{ color: 'hsl(38 22% 88%)' }}
              >
                {progress?.currentLevel?.title ?? `Niveau ${profile.currentLevel}`}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(248 10% 48%)' }}>
                {xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </p>
            </div>
            <span
              className="badge badge-gold font-serif text-base"
            >
              Niv. {profile.currentLevel}
            </span>
          </div>

          {/* Barre XP */}
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: 'hsl(248 20% 14%)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPercent}%`,
                background: 'linear-gradient(to right, hsl(38 40% 42%), hsl(38 58% 66%))',
                boxShadow: '0 0 12px hsl(38 52% 58% / 0.4)',
              }}
            />
          </div>
        </div>

        {/* Streak */}
        {(progress?.streakDays ?? 0) > 0 && (
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3.5"
            style={{
              background: 'hsl(38 52% 58% / 0.08)',
              border: '1px solid hsl(38 52% 58% / 0.15)',
            }}
          >
            <span className="text-xl">{(progress?.streakDays ?? 0) >= 7 ? '🔥' : '◉'}</span>
            <p className="text-base" style={{ color: 'hsl(38 22% 84%)' }}>
              <strong style={{ color: 'hsl(38 58% 68%)' }}>{progress?.streakDays ?? 0}</strong>
              {' '}jours consécutifs
            </p>
          </div>
        )}
      </div>

      {/* ── Abonnement ── */}
      <div className="card p-5 flex items-center justify-between animate-fade-up delay-100">
        <div>
          <p className="text-base font-medium" style={{ color: 'hsl(38 22% 88%)' }}>
            {sub?.plan?.title ?? 'Plan Gratuit'}
          </p>
          {sub?.currentPeriodEnd && (
            <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 46%)' }}>
              {sub.cancelAtPeriodEnd ? 'Se termine le ' : 'Renouvellement le '}
              {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
            </p>
          )}
          {!sub && (
            <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 46%)' }}>
              Passe à Premium pour débloquer tout
            </p>
          )}
        </div>
        <Link
          href="/abonnement"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'hsl(38 52% 65%)' }}
        >
          Gérer →
        </Link>
      </div>

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <section className="space-y-4 animate-fade-up delay-150">
          <div className="flex items-center justify-between">
            <p className="label-section">Badges ({badges.length})</p>
            <Link href="/progression" className="text-sm font-medium" style={{ color: 'hsl(38 52% 65%)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((ub: any) => (
              <div key={ub.id} className="card p-4 text-center space-y-2">
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-10 w-10 mx-auto" />
                ) : (
                  <div
                    className="h-10 w-10 mx-auto rounded-full flex items-center justify-center text-lg"
                    style={{
                      background: 'hsl(38 52% 58% / 0.10)',
                      color: 'hsl(38 55% 65%)',
                    }}
                  >
                    ✦
                  </div>
                )}
                <p className="text-xs font-medium truncate" style={{ color: 'hsl(248 10% 50%)' }}>
                  {ub.badge.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Navigation ── */}
      <nav className="card space-y-1 p-2 animate-fade-up delay-200">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3.5 text-base font-medium transition-all duration-150 hover:bg-surface-elevated group active:scale-95"
            style={{
              color: 'hsl(248 10% 55%)',
              minHeight: '48px',
            }}
          >
            <span
              className="text-lg w-6 text-center flex-shrink-0 transition-colors"
              style={{ color: 'hsl(38 52% 55%)' }}
            >
              {item.icon}
            </span>
            <span
              className="flex-1 transition-colors group-hover:text-foreground"
            >
              {item.label}
            </span>
            <span className="text-sm opacity-50">→</span>
          </Link>
        ))}
      </nav>

      {/* ── Déconnexion ── */}
      <div className="pt-2 animate-fade-up delay-300">
        <LogoutButton className="w-full rounded-lg px-4 py-3.5 text-base font-medium transition-all duration-150 hover:bg-destructive/8 hover:text-destructive text-foreground-dim border border-border active:scale-95" style={{ minHeight: '48px' }} />
      </div>
    </div>
  )
}
