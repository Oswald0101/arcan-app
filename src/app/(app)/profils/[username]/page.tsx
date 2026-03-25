// src/app/profils/[username]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicProfile } from '@/lib/supabase/queries/profiles'
import { ProfileCard } from '@/components/social/profile-card'
import { ContactButton } from '@/components/social/contact-button'
import type { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username} — Voie` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await getPublicProfile(username, user.id)
  if (!profile) notFound()

  const isOwnProfile = profile.userId === user.id

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <ProfileCard profile={profile} />

      {!isOwnProfile && !profile.isBlockedBy && (
        <ContactButton
          targetUserId={profile.userId}
          targetUsername={profile.username}
          initialStatus={profile.contactStatus as any}
          isBlocked={profile.isBlocked}
        />
      )}

      {profile.isBlocked && (
        <p className="text-center text-sm text-muted-foreground">
          Tu as bloqué ce membre.
        </p>
      )}
    </div>
  )
}
