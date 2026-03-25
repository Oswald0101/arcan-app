// src/app/(app)/accueil/page.tsx
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

  const lang = (profile?.language ?? 'fr') as Lang
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
    <div className="mx-auto max-w-lg px-4 space-y-5">
      {/* Intro ARCAN — première connexion uniquement */}
      <ArcanIntro userId={user.id} />

      {/* ── HERO ────────────────────────────────── */}
      <div className="pt-8 pb-2 animate-fade-up">
        <p className="label-section mb-2">{greeting}</p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(52px, 13vw, 72px)',
            fontWeight: 300,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 92%)',
          }}
        >
          {memberName}
        </h1>

        {/* XP sous le nom */}
        {memberProgress?.currentLevel && (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex-1 h-px rounded-full overflow-hidden"
              style={{ background: 'hsl(248 22% 14%)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${xpPercent}%`,
                  background: 'linear-gradient(to right, hsl(38 38% 40%), hsl(38 58% 65%))',
                  boxShadow: '0 0 10px hsl(38 52% 58% / 0.5)',
                  transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
            <span
              className="text-xs flex-shrink-0"
              style={{ color: 'hsl(248 10% 40%)', fontVariantNumeric: 'tabular-nums' }}
            >
              {xpCurrent} <span style={{ color: 'hsl(248 10% 30%)' }}>/ {xpRequired} XP</span>
            </span>
          </div>
        )}
      </div>

      {/* ── ALERTE CONTACT ──────────────────────── */}
      {pendingContactRequests > 0 && (
        <Link href="/contacts" className="block animate-fade-up delay-50">
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all hover:brightness-110"
            style={{
              background: 'hsl(38 52% 58% / 0.07)',
              border: '1px solid hsl(38 52% 58% / 0.18)',
            }}
          >
            <span style={{ color: 'hsl(38 22% 82%)' }}>
              {pendingContactRequests} demande{pendingContactRequests > 1 ? 's' : ''} de contact
            </span>
            <span style={{ color: 'hsl(38 52% 60%)' }}>→</span>
          </div>
        </Link>
      )}

      {/* ── STATS MONUMENTAUX ───────────────────── */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up delay-100">
        {/* Streak */}
        <div className="card p-5 space-y-1">
          <div className="flex items-end gap-1.5">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '54px',
                fontWeight: 300,
                lineHeight: 1,
                color: streakDays >= 7 ? 'hsl(38 58% 68%)' : 'hsl(38 14% 88%)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {streakDays}
            </span>
            {streakDays >= 7 && (
              <span className="text-xl pb-1">🔥</span>
            )}
          </div>
          <p className="label-section">{t(lang, 'streak_days')}</p>
        </div>

        {/* Niveau */}
        <div className="card p-5 space-y-1">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '36px',
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
            className="relative overflow-hidden rounded-2xl p-6 card-hover"
            style={{
              background: 'linear-gradient(135deg, hsl(250 35% 9%) 0%, hsl(260 40% 12%) 100%)',
              border: '1px solid hsl(38 30% 20% / 0.28)',
              boxShadow:
                'inset 0 1px 0 hsl(38 100% 80% / 0.06), var(--shadow-xl)',
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
                background: 'radial-gradient(ellipse, hsl(38 52% 58% / 0.10) 0%, transparent 70%)',
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
                background: 'radial-gradient(ellipse, hsl(265 55% 40% / 0.08) 0%, transparent 70%)',
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
                  width: '52px',
                  height: '52px',
                  background: 'hsl(38 52% 58% / 0.10)',
                  border: '1px solid hsl(38 52% 58% / 0.22)',
                  color: 'hsl(38 58% 68%)',
                  fontSize: '22px',
                  boxShadow: 'var(--glow-sm)',
                }}
              >
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
                <p
                  className="text-xs capitalize mt-1"
                  style={{ color: 'hsl(248 10% 46%)' }}
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
              style={{ borderTop: '1px solid hsl(38 20% 18% / 0.4)' }}
            >
              <p
                className="text-xs"
                style={{ color: 'hsl(248 10% 42%)' }}
              >
                Commence une conversation →
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* ── PRATIQUES DU JOUR ───────────────────── */}
      {todayPractices.length > 0 && (
        <section className="space-y-3 animate-fade-up delay-200">
          <SectionHeader title={t(lang, 'practices_today')} href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="space-y-2">
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
        <section className="space-y-3 animate-fade-up delay-250">
          <SectionHeader title="Épreuves en cours" href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="space-y-2">
            {activeChallenges.map((log: any) => (
              <div key={log.id} className="card px-4 py-3 flex items-center justify-between">
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
                  className="text-xs px-3 py-1.5 rounded-xl transition-colors hover:bg-surface-elevated"
                  style={{
                    background: 'hsl(248 28% 11%)',
                    border: '1px solid hsl(248 20% 18%)',
                    color: 'hsl(38 14% 70%)',
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
        <section className="space-y-3 animate-fade-up delay-300">
          <SectionHeader title={t(lang, 'my_path')} href={`/cercles/${activePath.slug}`} linkLabel={t(lang, 'see_all')} />
          <Link href={`/cercles/${activePath.slug}`} className="block card-hover">
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(248 22% 14%)',
                boxShadow: 'inset 0 1px 0 hsl(248 100% 100% / 0.05)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  color: 'hsl(38 14% 90%)',
                }}
              >
                {activePath.name}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {pathProgress?.currentRank && (
                  <span className="badge badge-gold">{pathProgress.currentRank.title}</span>
                )}
                <p className="text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
                  {activePath.memberCount} membre{activePath.memberCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── BADGES RÉCENTS ──────────────────────── */}
      {recentBadges.length > 0 && (
        <section className="space-y-3 animate-fade-up delay-350">
          <SectionHeader title={t(lang, 'recent_badges')} href="/progression" linkLabel={t(lang, 'see_all')} />
          <div className="flex gap-2.5">
            {recentBadges.map((ub: any) => (
              <div
                key={ub.id}
                className="card p-3.5 text-center space-y-2 flex-1"
              >
                {ub.badge.imageUrl ? (
                  <img src={ub.badge.imageUrl} alt="" className="h-8 w-8 mx-auto" />
                ) : (
                  <div
                    className="h-9 w-9 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(38 52% 58% / 0.10)', color: 'hsl(38 58% 65%)', fontSize: '16px' }}
                  >
                    ✦
                  </div>
                )}
                <p className="text-[10px] truncate" style={{ color: 'hsl(248 10% 46%)' }}>
                  {ub.badge.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA PREMIUM ─────────────────────────── */}
      {planKey === 'free' && (
        <Link href="/abonnement" className="block animate-fade-up delay-400">
          <div
            className="rounded-2xl p-6 text-center card-hover"
            style={{
              background: 'linear-gradient(145deg, hsl(248 30% 9%) 0%, hsl(38 20% 8%) 100%)',
              border: '1px solid hsl(38 30% 18% / 0.35)',
              boxShadow: 'inset 0 1px 0 hsl(38 100% 80% / 0.05)',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 400,
                color: 'hsl(38 14% 88%)',
              }}
            >
              {t(lang, 'go_premium')}
            </p>
            <p className="text-xs mt-2" style={{ color: 'hsl(248 10% 44%)' }}>
              Guide avancé · Codex complet · Progression sans limite
            </p>
            <div
              className="inline-flex items-center gap-2 mt-4 text-xs font-medium"
              style={{ color: 'hsl(38 55% 62%)' }}
            >
              Découvrir <span>→</span>
            </div>
          </div>
        </Link>
      )}

      <div className="h-6" />
    </div>
  )
}

function SectionHeader({
  title, href, linkLabel,
}: {
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="label-section">{title}</p>
      <Link
        href={href}
        className="text-xs transition-opacity hover:opacity-60"
        style={{ color: 'hsl(38 52% 52%)' }}
      >
        {linkLabel}
      </Link>
    </div>
  )
}
