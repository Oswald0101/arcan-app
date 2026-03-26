// src/app/(app)/accueil/page.tsx
// Refonte : Dashboard premium, mobile-first, hiérarchie visuelle forte

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
  const memberName = profile?.displayName || profile?.username || 'Explorateur'
  const xpCurrent = profile?.currentXp ?? 0
  const xpRequired = memberProgress?.currentLevel?.requiredXp ?? 1000
  const xpPercent = Math.min(100, Math.round((xpCurrent / xpRequired) * 100))

  const hour = new Date().getHours()
  const greeting =
    hour < 6  ? t(lang, 'greeting_night')     :
    hour < 12 ? t(lang, 'greeting_morning')   :
    hour < 18 ? t(lang, 'greeting_afternoon') :
                t(lang, 'greeting_evening')

  return (
    <div className="mx-auto max-w-lg px-4 space-y-6 pb-4">
      {/* Intro ARCAN — première connexion uniquement */}
      <ArcanIntro userId={user.id} />

      {/* ── HERO ────────────────────────────────── */}
      <div className="pt-6 pb-2 animate-fade-up">
        <p className="label-section mb-3" style={{ color: 'hsl(248 10% 45%)' }}>{greeting}</p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(48px, 12vw, 64px)',
            fontWeight: 300,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 92%)',
            marginBottom: '20px',
          }}
        >
          {memberName}
        </h1>

        {/* XP sous le nom — plus visible */}
        {memberProgress?.currentLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'hsl(248 10% 50%)' }}>
                {memberProgress.currentLevel.title}
              </span>
              <span className="text-sm font-medium" style={{ color: 'hsl(38 52% 65%)' }}>
                {xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full overflow-hidden"
              style={{ background: 'hsl(248 22% 14%)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${xpPercent}%`,
                  background: 'linear-gradient(to right, hsl(38 40% 45%), hsl(38 58% 65%))',
                  boxShadow: '0 0 12px hsl(38 52% 58% / 0.4)',
                  transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── ALERTE CONTACT ──────────────────────── */}
      {pendingContactRequests > 0 && (
        <Link href="/contacts" className="block animate-fade-up delay-50">
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3.5 text-sm font-medium transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'hsl(38 52% 58% / 0.08)',
              border: '1px solid hsl(38 52% 58% / 0.20)',
              color: 'hsl(38 52% 65%)',
            }}
          >
            <span>
              {pendingContactRequests} demande{pendingContactRequests > 1 ? 's' : ''} de contact
            </span>
            <span>→</span>
          </div>
        </Link>
      )}

      {/* ── STATS MONUMENTAUX ───────────────────── */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up delay-100">
        {/* Streak */}
        <div className="card p-6 space-y-2">
          <div className="flex items-end gap-2">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '48px',
                fontWeight: 300,
                lineHeight: 1,
                color: streakDays >= 7 ? 'hsl(38 58% 68%)' : 'hsl(38 14% 88%)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {streakDays}
            </span>
            {streakDays >= 7 && (
              <span className="text-2xl pb-1">🔥</span>
            )}
          </div>
          <p className="label-section">{t(lang, 'streak_days')}</p>
        </div>

        {/* Niveau */}
        <div className="card p-6 space-y-2">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '32px',
              fontWeight: 300,
              lineHeight: 1,
              color: 'hsl(38 14% 88%)',
            }}
          >
            {memberProgress?.currentLevel?.title ?? `Niv. ${profile?.currentLevel ?? 1}`}
          </p>
          <p className="label-section">{t(lang, 'profile_level')}</p>
        </div>
      </div>

      {/* ── GUIDE — CARTE PORTAIL ───────────────── */}
      {guide && (
        <Link href="/guide" className="block animate-fade-up delay-150">
          <div
            className="relative overflow-hidden rounded-lg p-6 card-hover"
            style={{
              background: 'linear-gradient(135deg, hsl(250 35% 10%) 0%, hsl(260 40% 13%) 100%)',
              border: '1px solid hsl(38 30% 20% / 0.25)',
              boxShadow:
                'inset 0 1px 0 hsl(38 100% 80% / 0.06), 0 8px 32px hsl(246 40% 2% / 0.65)',
            }}
          >
            {/* Halo ambiant animé */}
            <div
              style={{
                position: 'absolute',
                top: '-40%',
                right: '-15%',
                width: '65%',
                height: '200%',
                background: 'radial-gradient(ellipse, hsl(38 52% 58% / 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'ambient 8s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-30%',
                left: '5%',
                width: '40%',
                height: '120%',
                background: 'radial-gradient(ellipse, hsl(265 55% 40% / 0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
                animation: 'ambient 11s ease-in-out infinite reverse',
              }}
            />

            {/* Contenu */}
            <div className="relative flex items-center gap-4">
              {/* Symbole guide */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full select-none"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'hsl(38 52% 58% / 0.12)',
                  border: '1px solid hsl(38 52% 58% / 0.25)',
                  color: 'hsl(38 58% 68%)',
                  fontSize: '24px',
                  boxShadow: '0 0 20px hsl(38 52% 58% / 0.15)',
                }}
              >
                ◎
              </div>

              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: 'hsl(38 14% 92%)',
                    lineHeight: 1.2,
                  }}
                >
                  {guide.name}
                </p>
                <p
                  className="text-sm capitalize mt-1"
                  style={{ color: 'hsl(248 10% 48%)' }}
                >
                  {guide.customTypeLabel ?? guide.canonicalType}
                </p>
              </div>

              {/* Indicateur en ligne */}
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <span className="status-dot-online" />
                <span
                  className="text-xs hidden sm:inline"
                  style={{ color: 'hsl(148 45% 52%)' }}
                >
                  {t(lang, 'guide_online')}
                </span>
              </div>
            </div>

            {/* Tagline sous la carte */}
            <div
              className="relative mt-5 pt-4"
              style={{ borderTop: '1px solid hsl(38 20% 18% / 0.3)' }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'hsl(38 52% 65%)' }}
              >
                Commence une conversation →
              </p>
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
              <div key={log.id} className="card px-4 py-3.5 flex items-center justify-between">
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
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:bg-surface-elevated active:scale-95"
                  style={{
                    background: 'hsl(248 28% 11%)',
                    border: '1px solid hsl(248 20% 18%)',
                    color: 'hsl(38 52% 65%)',
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
            <div className="rounded-lg p-6 card">
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: 400,
                  color: 'hsl(38 14% 90%)',
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
              <div
                key={ub.id}
                className="card p-4 text-center space-y-2 flex-1"
              >
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-9 w-9 mx-auto" />
                ) : (
                  <div
                    className="h-9 w-9 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(38 52% 58% / 0.10)', color: 'hsl(38 58% 65%)', fontSize: '16px' }}
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
        <section className="space-y-4 animate-fade-up delay-400">
          <Link href="/abonnement" className="block">
            <div
              className="rounded-lg p-6 text-center space-y-3 card-hover"
              style={{
                background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.08) 0%, hsl(38 52% 58% / 0.04) 100%)',
                border: '1px solid hsl(38 52% 58% / 0.15)',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'hsl(38 52% 65%)' }}>
                Passe Premium
              </p>
              <p className="text-xs" style={{ color: 'hsl(248 10% 45%)' }}>
                Débloque plus de contenu et de personnalisation
              </p>
            </div>
          </Link>
        </section>
      )}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="label-section">{title}</h2>
      <Link
        href={href}
        className="text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: 'hsl(38 52% 65%)' }}
      >
        {linkLabel} →
      </Link>
    </div>
  )
}
