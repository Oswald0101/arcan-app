// src/app/(app)/profil/modifier/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ProfileEditForm } from '@/components/auth/profile-edit-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Modifier mon profil — Voie' }

export default async function ModifierProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) redirect('/onboarding')

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link
          href="/profil"
          className="text-sm transition-colors hover:opacity-80"
          style={{ color: 'hsl(38 52% 55%)' }}
        >
          ← Profil
        </Link>
        <h1 className="font-serif text-xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
          Modifier mon profil
        </h1>
      </div>

      <ProfileEditForm
        userId={user.id}
        currentAvatarUrl={profile.avatarUrl}
        initialData={{
          displayName: profile.displayName,
          bio: profile.bio,
          country: profile.country,
          city: profile.city,
          language: profile.language,
          isPublic: profile.isPublic,
          showLocation: profile.showLocation,
          showPath: profile.showPath,
          showGuide: profile.showGuide,
          showLevel: profile.showLevel,
        }}
      />
      <div className="h-4" />
    </div>
  )
}
