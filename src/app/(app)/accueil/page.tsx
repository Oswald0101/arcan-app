// Refonte Ultra-Premium : Dashboard mystique immersif, gradients complexes, relief profond

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
    <div className="mx-auto max-w-lg px-4 space-y-7 pb-6">
      {/* Intro ARCAN — première connexion uniquement */}
      <ArcanIntro userId={user.id} />

      {/* ── HERO ────────────────────────────────── */}
      <div className="pt-8 pb-2 animate-fade-up">
        <p className="label-section mb-4" style={{ color: 'hsl(38 52% 58% / 0.75)' }}>{greeting}</p>
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(52px, 13vw, 72px)',
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: 'hsl(38 14% 95%)',
            marginBottom: '24px',
            textShadow: '0 4px 16px hsl(246 40% 2% / 0.40)',
          }}
        >
          {memberName}
        </h1>

        {/* XP sous le nom — barre ultra-premium avec glow */}
        {memberProgress?.currentLevel && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'hsl(248 10% 55%)' }}>
                {memberProgress.currentLevel.title}
              </span>
              <span className="text-sm font-medium text-accent">
                {xpCurrent.toLocaleString()} / {xpRequired.toLocaleString()} XP
              </span>
            </div>
            <div
              className="h-3 w-full rounded-full overflow-hidden relative"
              style={{
                background: 'linear-gradient(to right, hsl(248 22% 14%), hsl(248 20% 12%))',
                boxShadow: 'inset 0 2px 4px hsl(246 40% 2% / 0.50)',
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${xpPercent}%`,
                  background: 'linear-gradient(to right, hsl(38 50% 48%), hsl(38 65% 70%))',
                  boxShadow: '0 0 20px hsl(38 52% 58% / 0.60), inset 0 1px 0 hsl(38 100% 90% / 0.20)',
                  transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'drop-shadow(0 0 8px hsl(38 52% 58% / 0.40))',
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
            className="flex items-center justify-between rounded-lg px-5 py-4 text-sm font-medium transition-all hover:brightness-125 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.12) 0%, hsl(38 52% 58% / 0.06) 100%)',
              border: '1.5px solid hsl(38 52% 58% / 0.28)',
              color: 'hsl(38 65% 72%)',
              boxShadow: '0 0 24px hsl(38 52% 58% / 0.08)',
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
      <div className="grid grid-cols-2 gap-5 animate-fade-up delay-100">
        {/* Streak */}
        <div 
          className="card p-7 space-y-3 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
            boxShadow: '0 0 40px hsl(38 52% 58% / 0.08)',
          }}
        >
          {/* Glow au hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, hsl(38 52% 58% / 0.05) 0%, transparent 70%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            className="group-hover:opacity-100"
          />
          <div className="relative flex items-end gap-2">
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '56px',
                fontWeight: 500,
                lineHeight: 1,
                color: streakDays >= 7 ? 'hsl(38 65% 75%)' : 'hsl(38 14% 92%)',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 2px 8px hsl(246 40% 2% / 0.30)',
              }}
            >
              {streakDays}
            </span>
            {streakDays >= 7 && (
              <span className="text-3xl pb-1 animate-glow-pulse">🔥</span>
            )}
          </div>
          <p className="label-section relative">{t(lang, 'streak_days')}</p>
        </div>

        {/* Niveau */}
        <div 
          className="card p-7 space-y-3 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
            boxShadow: '0 0 40px hsl(265 60% 50% / 0.06)',
          }}
        >
          {/* Glow violet au hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, hsl(265 60% 50% / 0.04) 0%, transparent 70%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            className="group-hover:opacity-100"
          />
          <p
            className="relative"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '40px',
              fontWeight: 500,
              lineHeight: 1,
              color: 'hsl(38 14% 92%)',
              textShadow: '0 2px 8px hsl(246 40% 2% / 0.30)',
            }}
          >
            {memberProgress?.currentLevel?.title ?? `Niv. ${profile?.currentLevel ?? 1}`}
          </p>
          <p className="label-section relative">{t(lang, 'profile_level')}</p>
        </div>
      </div>

      {/* ── GUIDE — CARTE PORTAIL ULTRA-PREMIUM ───────────────── */}
      {guide && (
        <Link href="/guide" className="block animate-fade-up delay-150">
          <div
            className="relative overflow-hidden rounded-2xl p-7 card-hover transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(265 40% 11%) 0%, hsl(250 35% 9%) 50%, hsl(265 38% 10%) 100%)',
              border: '1.5px solid hsl(38 35% 25% / 0.20)',
              boxShadow:
                'inset 0 1px 0 hsl(38 100% 85% / 0.08), 0 12px 48px hsl(246 40% 2% / 0.70), 0 0 60px hsl(38 52% 58% / 0.08)',
            }}
          >
            {/* Halo ambiant animé — or */}
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '80%',
                height: '250%',
                background: 'radial-gradient(ellipse, hsl(38 52% 58% / 0.12) 0%, transparent 65%)',
                pointerEvents: 'none',
                animation: 'ambient 8s ease-in-out infinite',
              }}
            />
            {/* Halo ambiant animé — violet */}
            <div
              style={{
                position: 'absolute',
                bottom: '-40%',
                left: '0%',
                width: '50%',
                height: '150%',
                background: 'radial-gradient(ellipse, hsl(265 60% 50% / 0.08) 0%, transparent 65%)',
                pointerEvents: 'none',
                animation: 'ambient 12s ease-in-out infinite reverse',
              }}
            />

            {/* Contenu */}
            <div className="relative flex items-center gap-5">
              {/* Symbole guide avec glow */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full select-none"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.18) 0%, hsl(38 52% 58% / 0.08) 100%)',
                  border: '1.5px solid hsl(38 52% 58% / 0.35)',
                  color: 'hsl(38 65% 75%)',
                  fontSize: '28px',
                  boxShadow: '0 0 32px hsl(38 52% 58% / 0.25), inset 0 1px 0 hsl(38 100% 90% / 0.10)',
                }}
              >
                ◎
              </div>

              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '24px',
                    fontWeight: 500,
                    color: 'hsl(38 14% 95%)',
                    lineHeight: 1.2,
                    textShadow: '0 2px 6px hsl(246 40% 2% / 0.25)',
                  }}
                >
                  {guide.name}
                </p>
                <p
                  className="text-sm capitalize mt-1.5 font-medium"
                  style={{ color: 'hsl(248 10% 52%)' }}
                >
                  {guide.customTypeLabel ?? guide.canonicalType}
                </p>
              </div>

              {/* Indicateur en ligne */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="status-dot-online" />
                <span
                  className="text-xs hidden sm:inline font-medium"
                  style={{ color: 'hsl(148 55% 62%)' }}
                >
                  {t(lang, 'guide_online')}
                </span>
              </div>
            </div>

            {/* Tagline sous la carte */}
            <div
              className="relative mt-6 pt-5"
              style={{ borderTop: '1px solid hsl(38 20% 18% / 0.25)' }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: 'hsl(38 65% 72%)' }}
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
          <div className="space-y-3">
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
          <div className="space-y-3">
            {activeChallenges.map((log: any) => (
              <div 
                key={log.id} 
                className="card px-5 py-4 flex items-center justify-between group hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(135deg, hsl(248 30% 10%) 0%, hsl(248 28% 8%) 100%)',
                  boxShadow: '0 0 24px hsl(38 52% 58% / 0.04)',
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'hsl(38 14% 90%)' }}>
                    {log.challenge.title}
                  </p>
                  <p className="text-xs mt-1 capitalize" style={{ color: 'hsl(248 10% 48%)' }}>
                    {log.challenge.difficulty}
                  </p>
                </div>
                <Link
                  href="/progression"
                  className="text-xs px-4 py-2 rounded-lg font-medium transition-all hover:brightness-125 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, hsl(248 30% 12%) 0%, hsl(248 28% 10%) 100%)',
                    border: '1px solid hsl(38 35% 25% / 0.20)',
                    color: 'hsl(38 65% 72%)',
                    boxShadow: '0 0 16px hsl(38 52% 58% / 0.06)',
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
            <div 
              className="rounded-2xl p-7 card"
              style={{
                background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
                boxShadow: '0 0 40px hsl(38 52% 58% / 0.06)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '24px',
                  fontWeight: 500,
                  color: 'hsl(38 14% 94%)',
                  textShadow: '0 2px 6px hsl(246 40% 2% / 0.25)',
                }}
              >
                {activePath.name}
              </p>
              <div className="flex items-center gap-3 mt-4">
                {pathProgress?.currentRank && (
                  <span className="badge badge-gold">{pathProgress.currentRank.title}</span>
                )}
                <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 50%)' }}>
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
          <div className="flex gap-4">
            {recentBadges.map((ub: any) => (
              <div
                key={ub.id}
                className="card p-5 text-center space-y-3 flex-1 group hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
                  boxShadow: '0 0 24px hsl(38 52% 58% / 0.04)',
                }}
              >
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-11 w-11 mx-auto group-hover:scale-110 transition-transform" />
                ) : (
                  <div
                    className="h-11 w-11 mx-auto rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.15) 0%, hsl(38 52% 58% / 0.08) 100%)',
                      color: 'hsl(38 65% 72%)', 
                      fontSize: '18px',
                      boxShadow: '0 0 16px hsl(38 52% 58% / 0.10)',
                    }}
                  >
                    ◆
                  </div>
                )}
                <p className="text-xs font-medium" style={{ color: 'hsl(248 10% 54%)' }}>
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
              className="rounded-2xl p-7 text-center space-y-3 card-hover transition-all"
              style={{
                background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.12) 0%, hsl(38 52% 58% / 0.06) 100%)',
                border: '1.5px solid hsl(38 52% 58% / 0.22)',
                boxShadow: '0 0 32px hsl(38 52% 58% / 0.08)',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: 'hsl(38 65% 75%)' }}>
                Passe Premium
              </p>
              <p className="text-xs" style={{ color: 'hsl(248 10% 50%)' }}>
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
        className="text-xs font-medium transition-all hover:text-accent"
        style={{ color: 'hsl(38 65% 72%)' }}
      >
        {linkLabel} →
      </Link>
    </div>
  )
}
