// src/app/(app)/guide/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGuideForUser } from '@/lib/supabase/queries/guide'
import { prisma } from '@/lib/prisma'
import { ChatWindow } from '@/components/guide/chat-window'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/i18n/dict'
import { t } from '@/lib/i18n/dict'

export const metadata: Metadata = { title: 'Guide — Arcan' }

const VALID_LANGS: Lang[] = ['fr', 'en', 'es', 'pt']

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [guide, profile] = await Promise.all([
    getGuideForUser(user.id),
    prisma.profile.findUnique({ where: { userId: user.id }, select: { language: true } }),
  ])

  if (!guide) redirect('/onboarding')

  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('voie-lang')?.value as Lang | undefined
  const lang: Lang = (cookieLang && VALID_LANGS.includes(cookieLang))
    ? cookieLang
    : ((profile?.language && VALID_LANGS.includes(profile.language as Lang))
      ? profile.language as Lang
      : 'fr')

  const guideName = guide.name
  const guideType = guide.customTypeLabel ?? guide.canonicalType

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100dvh - 3.5rem - 4.5rem)' }}
    >
      {/* ── Header guide ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3.5 px-4 py-3.5"
        style={{
          background: 'hsl(248 32% 6% / 0.90)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid hsl(248 22% 14%)',
          boxShadow: '0 1px 0 hsl(248 100% 100% / 0.03)',
        }}
      >
        {/* Avatar guide */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full select-none relative"
          style={{
            width: '40px',
            height: '40px',
            background: 'radial-gradient(ellipse at 30% 30%, hsl(38 52% 58% / 0.18), hsl(248 40% 8%))',
            border: '1px solid hsl(38 52% 58% / 0.25)',
            color: 'hsl(38 58% 68%)',
            fontSize: '18px',
            boxShadow: 'var(--glow-xs)',
          }}
        >
          ◎
          {/* Pulsation ambiante */}
          <span
            style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              border: '1px solid hsl(38 52% 58% / 0.12)',
              animation: 'glow-pulse 3s ease-in-out infinite',
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '18px',
              fontWeight: 400,
              color: 'hsl(38 14% 90%)',
              lineHeight: 1.2,
            }}
          >
            {guideName}
          </p>
          <p className="text-xs capitalize mt-0.5" style={{ color: 'hsl(248 10% 44%)' }}>
            {guideType}
          </p>
        </div>

        {/* Indicateur en ligne */}
        <div className="flex-shrink-0 flex items-center gap-2 ml-auto">
          <span className="status-dot-online" />
          <span className="text-xs" style={{ color: 'hsl(148 45% 50%)' }}>
            {t(lang, 'guide_online')}
          </span>
        </div>
      </div>

      {/* ── Chat ── */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow guideName={guideName} guideType={guideType} />
      </div>
    </div>
  )
}
