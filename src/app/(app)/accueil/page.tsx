// src/app/(app)/accueil/page.tsx
// Dashboard premium — XP ring SVG, carte Guide immersive, Cormorant

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAccueilData } from '@/lib/supabase/queries/accueil'
import { PracticeItem } from '@/components/progression/practice-item'
import { ArcanIntro } from '@/components/intro/arcan-intro'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n/dict'
import { t } from '@/lib/i18n/dict'

export const metadata: Metadata = { title: 'Accueil — Arcan' }

export default async function AccueilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const data = await getAccueilData(user.id)
  const {
    profile, memberProgress, guide, activePath, pathProgress,
    activeChallenges, recentBadges, planKey, pendingContactRequests,
    todayPractices, streakDays,
  } = data

  const lang: Lang = 'fr'
  const isAutoUsername = (u?: string | null) =>
    !u || /^[0-9a-f-]{8,}$/i.test(u) || u.startsWith('user_')
  const memberName =
    profile?.displayName ||
    (isAutoUsername(profile?.username) ? null : profile?.username) ||
    'Explorateur'

  const xpCurrent = profile?.currentXp ?? 0
  const xpRequired = memberProgress?.currentLevel?.requiredXp ?? 1000
  const xpPercent = Math.min(100, Math.round((xpCurrent / xpRequired) * 100))

  // SVG ring — circonférence = 2π × 42 = 263.9
  const CIRC = 263.9
  const xpDash = Math.round((xpPercent / 100) * CIRC)

  const hour = new Date().getHours()
  const greeting =
    hour < 6  ? t(lang, 'greeting_night')     :
    hour < 12 ? t(lang, 'greeting_morning')   :
    hour < 18 ? t(lang, 'greeting_afternoon') :
                t(lang, 'greeting_evening')

  return (
    <div className="mx-auto max-w-lg px-4 pb-8 space-y-7">
      <ArcanIntro userId={user.id} />

      {/* ── HERO : NOM + XP RING ────────────────── */}
      <div className="pt-6 animate-fade-up">

        {/* Salutation */}
        <p className="label-section mb-4" style={{ letterSpacing: '0.25em' }}>{greeting}</p>

        {/* Nom + Ring côte à côte sur desktop, empilé sur mobile */}
        <div className="flex items-start justify-between gap-4">

          {/* Nom membre */}
          <div className="flex-1 min-w-0">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(44px, 11vw, 60px)',
                fontWeight: 300,
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                color: 'hsl(38 14% 93%)',
              }}
            >
              {memberName}
            </h1>
            {memberProgress?.currentLevel && (
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: 'hsl(248 10% 48%)' }}
              >
                {memberProgress.currentLevel.title}
              </p>
            )}
          </div>

          {/* XP Ring SVG */}
          {memberProgress?.currentLevel && (
            <div className="xp-ring-container flex-shrink-0" style={{ width: 88, height: 88 }}>
              {/* Halo */}
              <div className="xp-ring-glow" />
              <svg width="88" height="88" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                {/* Piste fond */}
                <circle
                  cx="48" cy="48" r="42"
                  fill="none"
                  stroke="hsl(248 22% 14%)"
                  strokeWidth="7"
                />
                {/* Arc XP */}
                <circle
                  cx="48" cy="48" r="42"
                  fill="none"
                  stroke="url(#xpGradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${xpDash} ${CIRC}`}
                  style={{
                    filter: 'drop-shadow(0 0 6px hsl(38 54% 62% / 0.6))',
                    transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                <defs>
                  <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="hsl(38, 40%, 50%)" />
                    <stop offset="100%" stopColor="hsl(38, 72%, 74%)" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Texte centre */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '22px',
                    fontWeight: 400,
                    lineHeight: 1,
                    color: 'hsl(38 65% 78%)',
                  }}
                >
                  {xpPercent}
                </span>
                <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'hsl(248 10% 44%)' }}>
                  %
                </span>
              </div>
            </div>
          )}
        </div>

        {/* XP en chiffres sous le nom */}
        {memberProgress?.currentLevel && (
          <p className="mt-3 text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
            <span style={{ color: 'hsl(38 54% 62%)' }}>{xpCurrent.toLocaleString()}</span>
            {' '}/ {xpRequired.toLocaleString()} XP
          </p>
        )}
      </div>

      {/* ── ALERTE CONTACTS ─────────────────────── */}
      {pendingContactRequests > 0 && (
        <Link href="/contacts" className="block animate-fade-up delay-50">
          <div
            className="flex items-center justify-between px-5 py-3.5 rounded-2xl"
            style={{
              background: 'hsl(38 52% 58% / 0.07)',
              border: '1px solid hsl(38 52% 58% / 0.22)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'hsl(38 60% 68%)' }}>
              {pendingContactRequests} demande{pendingContactRequests > 1 ? 's' : ''} de contact
            </span>
            <span style={{ color: 'hsl(38 54% 62%)' }}>→</span>
          </div>
        </Link>
      )}

      {/* ── STATS : STREAK + NIVEAU ──────────────── */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-100">

        {/* Streak */}
        <div
          className="card-premium p-5 space-y-3"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Halo feu */}
          {streakDays >= 7 && (
            <div style={{
              position: 'absolute', top: '-40%', right: '-20%',
              width: '70%', height: '180%',
              background: 'radial-gradient(ellipse, hsl(30 80% 50% / 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}
          <div className="relative flex items-end gap-2">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '52px',
                fontWeight: 300,
                lineHeight: 1,
                color: streakDays >= 7 ? 'hsl(38 65% 72%)' : 'hsl(38 10% 86%)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {streakDays}
            </span>
            {streakDays >= 7 && <span style={{ fontSize: '22px', paddingBottom: 4 }}>🔥</span>}
          </div>
          <p className="label-section">{t(lang, 'streak_days')}</p>
        </div>

        {/* Niveau */}
        <div className="card-premium p-5 space-y-3">
          <div style={{ position: 'relative' }}>
            {/* Icône niveau */}
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'hsl(38 54% 62% / 0.10)',
              border: '1px solid hsl(38 54% 62% / 0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(38 60% 68%)',
              fontSize: '16px',
              marginBottom: 8,
            }}>
              ◆
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '26px',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'hsl(38 12% 88%)',
              }}
            >
              {memberProgress?.currentLevel?.title ?? `Niv. ${profile?.currentLevel ?? 1}`}
            </p>
          </div>
          <p className="label-section">{t(lang, 'profile_level')}</p>
        </div>
      </div>

      {/* ── GUIDE — PORTAIL IMMERSIF ─────────────── */}
      {guide && (
        <Link href="/guide" className="block animate-fade-up delay-150">
          <div
            className="card-guide card-hover relative overflow-hidden"
            style={{ padding: '24px' }}
          >
            {/* Halos animés */}
            <div className="animate-ambient" style={{
              position: 'absolute', top: '-50%', right: '-20%',
              width: '70%', height: '220%',
              background: 'radial-gradient(ellipse, hsl(38 54% 62% / 0.10) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40%', left: '0%',
              width: '50%', height: '150%',
              background: 'radial-gradient(ellipse, hsl(265 60% 45% / 0.09) 0%, transparent 65%)',
              pointerEvents: 'none',
              animation: 'ambient 13s ease-in-out infinite reverse',
            }} />

            {/* Ligne dorée en haut */}
            <div className="top-line-gold" />

            {/* Contenu */}
            <div className="relative flex items-center gap-4">

              {/* Orbe Guide */}
              <div style={{
                width: 60, height: 60, flexShrink: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, hsl(38 54% 62% / 0.22), hsl(265 55% 30% / 0.12))',
                border: '1px solid hsl(38 54% 62% / 0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                color: 'hsl(38 65% 72%)',
                boxShadow: '0 0 24px hsl(38 54% 62% / 0.18), inset 0 1px 0 hsl(38 100% 80% / 0.12)',
              }}>
                ◎
              </div>

              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'hsl(38 14% 92%)',
                    lineHeight: 1.2,
                  }}
                >
                  {guide.name}
                </p>
                <p className="text-sm capitalize mt-1" style={{ color: 'hsl(248 10% 48%)' }}>
                  {guide.customTypeLabel ?? guide.canonicalType}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="status-dot-online" />
              </div>
            </div>

            {/* Footer carte */}
            <div
              className="relative mt-5 pt-4 flex items-center justify-between"
              style={{ borderTop: '1px solid hsl(38 25% 16% / 0.4)' }}
            >
              <p className="text-sm" style={{ color: 'hsl(248 10% 46%)' }}>
                Reprendre la conversation
              </p>
              <span
                className="text-sm font-medium"
                style={{ color: 'hsl(38 60% 68%)' }}
              >
                →
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ── PRATIQUES DU JOUR ───────────────────── */}
      {todayPractices.length > 0 && (
        <section className="space-y-4 animate-fade-up delay-200">
          <SectionHeader title={t(lang, 'practices_today')} href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="space-y-2.5">
            {todayPractices.map((practice: any) => (
              <PracticeItem
                key={practice.id}
                practice={practice}
                pathId={activePath?.id}
                isDoneToday={practice.doneToday}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── ÉPREUVES ────────────────────────────── */}
      {activeChallenges.length > 0 && (
        <section className="space-y-4 animate-fade-up delay-250">
          <SectionHeader title="Épreuves en cours" href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="space-y-2.5">
            {activeChallenges.map((log: any) => (
              <div key={log.id} className="card px-4 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'hsl(38 14% 86%)' }}>
                    {log.challenge.title}
                  </p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'hsl(248 10% 44%)' }}>
                    {log.challenge.difficulty}
                  </p>
                </div>
                <Link
                  href="/progression"
                  className="text-xs px-3 py-2 rounded-xl font-medium"
                  style={{
                    background: 'hsl(248 28% 11%)',
                    border: '1px solid hsl(248 20% 18%)',
                    color: 'hsl(38 54% 65%)',
                  }}
                >
                  Gérer
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MA VOIE ─────────────────────────────── */}
      {activePath && (
        <section className="space-y-4 animate-fade-up delay-300">
          <SectionHeader title={t(lang, 'my_path')} href={`/cercles/${activePath.slug}`} linkLabel={t(lang, 'see_all')} />
          <Link href={`/cercles/${activePath.slug}`} className="block card-hover">
            <div className="card-elevated rounded-2xl px-5 py-5">
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  color: 'hsl(38 12% 90%)',
                  lineHeight: 1.2,
                }}
              >
                {activePath.name}
              </p>
              <div className="flex items-center gap-3 mt-3">
                {pathProgress?.currentRank && (
                  <span className="badge badge-gold">{pathProgress.currentRank.title}</span>
                )}
                <p className="text-sm" style={{ color: 'hsl(248 10% 45%)' }}>
                  {activePath.memberCount} membre{activePath.memberCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── BADGES RÉCENTS ──────────────────────── */}
      {recentBadges.length > 0 && (
        <section className="space-y-4 animate-fade-up delay-350">
          <SectionHeader title={t(lang, 'recent_badges')} href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="flex gap-3">
            {recentBadges.map((ub: any) => (
              <div key={ub.id} className="card p-4 text-center space-y-2 flex-1">
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-9 w-9 mx-auto" />
                ) : (
                  <div
                    className="h-9 w-9 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(38 52% 58% / 0.10)', color: 'hsl(38 60% 68%)', fontSize: '16px' }}
                  >
                    ◆
                  </div>
                )}
                <p className="text-xs font-medium" style={{ color: 'hsl(248 10% 50%)' }}>
                  {ub.badge.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PREMIUM CTA ─────────────────────────── */}
      {planKey === 'free' && (
        <section className="animate-fade-up delay-400">
          <Link href="/abonnement" className="block">
            <div
              className="card-hover rounded-2xl px-6 py-5 text-center space-y-2"
              style={{
                background: 'linear-gradient(135deg, hsl(38 54% 62% / 0.07) 0%, hsl(38 54% 62% / 0.03) 100%)',
                border: '1px solid hsl(38 54% 62% / 0.16)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '18px',
                  fontWeight: 400,
                  color: 'hsl(38 60% 68%)',
                }}
              >
                Accède à l'expérience complète
              </p>
              <p className="text-sm" style={{ color: 'hsl(248 10% 45%)' }}>
                Débloque le Guide avancé, toutes les Voies et plus
              </p>
              <div
                className="inline-block mt-1 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'hsl(38 54% 62% / 0.12)',
                  border: '1px solid hsl(38 54% 62% / 0.25)',
                  color: 'hsl(38 65% 72%)',
                  letterSpacing: '0.08em',
                }}
              >
                PASSER PREMIUM
              </div>
            </div>
          </Link>
        </section>
      )}
    </div>
  )
}

// ── Section Header ───────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="label-section">{title}</h2>
      <Link
        href={href}
        className="text-xs font-medium"
        style={{ color: 'hsl(38 54% 62%)', opacity: 0.85 }}
      >
        {linkLabel} →
      </Link>
    </div>
  )
}
