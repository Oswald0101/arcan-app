// src/app/onboarding/page.tsx
// Page principale du flow d'onboarding — Server Component qui protège l'accès

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ta Voie commence ici — Voie',
  description: 'Réponds à quelques questions pour que nous construisions ton expérience personnelle.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Si déjà complété → accueil
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true, language: true },
  })

  if (profile?.onboardingCompleted) redirect('/accueil')

  const lang = (profile?.language ?? 'fr') as 'fr' | 'en' | 'es' | 'pt'

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto max-w-lg px-4 py-10">
        <OnboardingFlow lang={lang} />
      </div>
    </div>
  )
}
