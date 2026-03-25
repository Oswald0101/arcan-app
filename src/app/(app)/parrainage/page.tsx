// src/app/parrainage/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserInvites, getUserReferralStats } from '@/lib/billing/referral'
import { InviteWidget } from '@/components/billing/invite-widget'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Parrainage — Voie' }

export default async function ParrainagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [stats, invites] = await Promise.all([
    getUserReferralStats(user.id),
    getUserInvites(user.id),
  ])

  // Adapter au format attendu par InviteWidget
  const invitesForWidget = invites.map((inv: any) => ({
    inviteCode: inv.inviteCode,
    status: inv.status,
    expiresAt: inv.expiresAt.toISOString(),
  }))

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-medium">Parrainage</h1>
        <p className="text-sm text-muted-foreground">
          Invite des proches et gagnez tous les deux des jours de premium.
        </p>
      </div>
      <InviteWidget stats={stats} existingCodes={invitesForWidget} />
    </div>
  )
}
