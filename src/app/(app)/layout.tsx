// src/app/(app)/layout.tsx
// Layout principal — protège les routes + fournit nav globale + langue
// Refonte : Safe-areas, padding mobile-first

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { BottomNav } from '@/components/layout/bottom-nav'
import { TopBar } from '@/components/layout/top-bar'
import { LangProvider } from '@/lib/i18n/lang-context'
import type { Lang } from '@/lib/i18n/dict'

const VALID_LANGS: Lang[] = ['fr', 'en', 'es', 'pt']

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [profile, adminRole] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        onboardingCompleted: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        currentLevel: true,
        language: true,
      },
    }),
    prisma.userAdminRole.findFirst({
      where: { userId: user.id, isActive: true },
      select: { id: true },
    }),
  ])

  const isAdmin = !!adminRole

  if (!profile?.onboardingCompleted) redirect('/onboarding')

  // Résoudre la langue — priorité : cookie > DB > 'fr'
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('voie-lang')?.value as Lang | undefined
  const dbLang = profile.language as Lang
  const lang: Lang = (cookieLang && VALID_LANGS.includes(cookieLang))
    ? cookieLang
    : (VALID_LANGS.includes(dbLang) ? dbLang : 'fr')

  return (
    <LangProvider lang={lang}>
      <div className="flex min-h-dvh flex-col" style={{ background: 'hsl(var(--background))' }}>
        <TopBar
          username={profile.username}
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          level={profile.currentLevel}
          isAdmin={isAdmin}
        />

        {/* 
          pt-14 = hauteur TopBar fixe (56px)
          pb-24 = hauteur BottomNav (96px avec safe-area)
          Utilise safe-area-inset pour les notches iPhone
        */}
        <main
          className="flex-1 pt-14 pb-24"
          style={{
            paddingBottom: 'calc(96px + max(env(safe-area-inset-bottom, 0px), 0px))',
          }}
        >
          {children}
        </main>

        <BottomNav />
      </div>
    </LangProvider>
  )
}
