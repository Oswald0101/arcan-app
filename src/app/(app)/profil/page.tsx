// Refonte Ultra-Premium : Profil mystique avec relief, glows et hiérarchie visuelle forte

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
    <div className="mx-auto max-w-lg px-4 py-8 space-y-7 pb-6 animate-fade-up">

      {/* ── Card profil principal — ultra-premium ── */}
      <div 
        className="card-premium p-8 space-y-7 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
          boxShadow: '0 0 48px hsl(38 52% 58% / 0.08), inset 0 1px 0 hsl(248 100% 100% / 0.05)',
          border: '1.5px solid hsl(38 35% 25% / 0.15)',
        }}
      >

        {/* Avatar + identité */}
        <div className="flex items-start gap-5">
          <UserAvatar
            avatarUrl={profile.avatarUrl}
            displayName={profile.displayName}
            username={profile.username}
            size="xl"
            showRing
          />
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="font-serif text-3xl font-medium leading-tight"
                style={{
                  color: 'hsl(38 14% 95%)',
                  textShadow: '0 2px 8px hsl(246 40% 2% / 0.30)',
                }}
              >
                {profile.displayName || profile.username}
              </h1>
              {profile.verificationStatus !== 'none' && (
                <span className="badge badge-gold">✓ Vérifié</span>
              )}
            </div>
            <p className="text-base mt-2 font-semibold" style={{ color: 'hsl(38 65% 75%)' }}>
              @{profile.username}
            </p>
            <p className="text-sm mt-1.5 font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
              Membre depuis {memberSince}
            </p>
          </div>
          <Link
            href="/profil/modifier"
            className="btn-ghost text-sm px-5 py-2.5 flex-shrink-0 font-semibold"
            style={{ minHeight: '44px' }}
          >
            Modifier
          </Link>
        </div>

        {/* Bio */}
        {profile.bio && (
          <>
            <div className="divider-gold" />
            <p className="text-base leading-relaxed font-medium" style={{ color: 'hsl(248 10% 62%)' }}>
              {profile.bio}
            </p>
          </>
        )}

        <div className="divider-gold" />

        {/* Niveau + XP — ultra-premium */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-serif text-xl font-medium"
                style={{ color: 'hsl(38 14% 94%)' }}
              >
                {progress?.currentLevel?.title ?? `Niveau ${profile.currentLevel}`}
              </p>
              <p className="text-sm mt-1 font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
                {xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </p>
            </div>
            <span
              className="badge badge-gold font-serif text-lg"
              style={{
                boxShadow: '0 0 20px hsl(38 52% 58% / 0.25)',
              }}
            >
              Niv. {profile.currentLevel}
            </span>
          </div>

          {/* Barre XP — glow amélioré */}
          <div
            className="h-3 w-full rounded-full overflow-hidden"
            style={{
              background: 'linear-gradient(to right, hsl(248 22% 16%), hsl(248 20% 12%))',
              boxShadow: 'inset 0 2px 4px hsl(246 40% 2% / 0.50)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-800"
              style={{
                width: `${xpPercent}%`,
                background: 'linear-gradient(to right, hsl(38 50% 48%), hsl(38 65% 70%))',
                boxShadow: '0 0 24px hsl(38 52% 58% / 0.60), inset 0 1px 0 hsl(38 100% 90% / 0.20)',
                filter: 'drop-shadow(0 0 12px hsl(38 52% 58% / 0.40))',
              }}
            />
          </div>
        </div>

        {/* Streak — avec glow */}
        {(progress?.streakDays ?? 0) > 0 && (
          <div
            className="flex items-center gap-4 rounded-lg px-5 py-4 group"
            style={{
              background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.12) 0%, hsl(38 52% 58% / 0.06) 100%)',
              border: '1.5px solid hsl(38 52% 58% / 0.25)',
              boxShadow: '0 0 24px hsl(38 52% 58% / 0.08)',
            }}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {(progress?.streakDays ?? 0) >= 7 ? '🔥' : '◉'}
            </span>
            <p className="text-base font-semibold" style={{ color: 'hsl(38 22% 88%)' }}>
              <strong style={{ color: 'hsl(38 65% 75%)' }}>{progress?.streakDays ?? 0}</strong>
              {' '}jours consécutifs
            </p>
          </div>
        )}
      </div>

      {/* ── Abonnement — ultra-premium ── */}
      <div 
        className="card p-6 flex items-center justify-between animate-fade-up delay-100 group hover:brightness-110 transition-all rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
          boxShadow: '0 0 32px hsl(38 52% 58% / 0.06)',
          border: '1.5px solid hsl(38 35% 25% / 0.15)',
        }}
      >
        <div>
          <p className="text-base font-semibold" style={{ color: 'hsl(38 14% 94%)' }}>
            {sub?.plan?.title ?? 'Plan Gratuit'}
          </p>
          {sub?.currentPeriodEnd && (
            <p className="text-sm mt-1.5 font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
              {sub.cancelAtPeriodEnd ? 'Se termine le ' : 'Renouvellement le '}
              {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
            </p>
          )}
          {!sub && (
            <p className="text-sm mt-1.5 font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
              Passe à Premium pour débloquer tout
            </p>
          )}
        </div>
        <Link
          href="/abonnement"
          className="text-sm font-semibold transition-all hover:text-accent"
          style={{ color: 'hsl(38 65% 75%)' }}
        >
          Gérer →
        </Link>
      </div>

      {/* ── Badges — avec relief ── */}
      {badges.length > 0 && (
        <section className="space-y-5 animate-fade-up delay-150">
          <div className="flex items-center justify-between">
            <p className="label-section">Badges ({badges.length})</p>
            <Link href="/progression" className="text-sm font-semibold" style={{ color: 'hsl(38 65% 75%)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {badges.map((ub: any) => (
              <div 
                key={ub.id} 
                className="card p-5 text-center space-y-3 group hover:brightness-110 transition-all rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
                  boxShadow: '0 0 24px hsl(38 52% 58% / 0.04)',
                  border: '1px solid hsl(38 35% 25% / 0.10)',
                }}
              >
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-12 w-12 mx-auto group-hover:scale-110 transition-transform" />
                ) : (
                  <div
                    className="h-12 w-12 mx-auto rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.16) 0%, hsl(38 52% 58% / 0.08) 100%)',
                      color: 'hsl(38 65% 72%)',
                      boxShadow: '0 0 16px hsl(38 52% 58% / 0.10)',
                    }}
                  >
                    ✦
                  </div>
                )}
                <p className="text-xs font-semibold truncate" style={{ color: 'hsl(248 10% 54%)' }}>
                  {ub.badge.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Navigation — zones de frappe 48px ── */}
      <nav 
        className="card space-y-1 p-3 animate-fade-up delay-200 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
          boxShadow: '0 0 32px hsl(38 52% 58% / 0.04)',
          border: '1.5px solid hsl(38 35% 25% / 0.15)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-lg px-5 py-4 text-base font-semibold transition-all duration-150 hover:brightness-110 group active:scale-95"
            style={{
              color: 'hsl(248 10% 58%)',
              minHeight: '48px',
            }}
          >
            <span
              className="text-lg w-6 text-center flex-shrink-0 transition-colors group-hover:text-accent"
              style={{ color: 'hsl(38 65% 72%)' }}
            >
              {item.icon}
            </span>
            <span
              className="flex-1 transition-colors group-hover:text-foreground"
            >
              {item.label}
            </span>
            <span className="text-sm opacity-60">→</span>
          </Link>
        ))}
      </nav>

      {/* ── Déconnexion ── */}
      <div className="pt-4 animate-fade-up delay-300">
        <LogoutButton 
          className="w-full rounded-lg px-5 py-4 text-base font-semibold transition-all duration-150 hover:bg-destructive/12 hover:text-destructive text-foreground-dim border active:scale-95"
          style={{
            minHeight: '48px',
            borderColor: 'hsl(0 70% 50% / 0.25)',
          }}
        />
      </div>
    </div>
  )
}
