// src/app/profil/confidentialite/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — Voie' }

export default async function ProfilConfidentialitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
  if (!profile) redirect('/onboarding')

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profil/parametres" className="text-muted-foreground hover:text-foreground text-sm">←</Link>
        <h1 className="text-xl font-medium">Confidentialité</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Gère ce que les autres membres peuvent voir sur ton profil.
      </p>

      <Link
        href="/profil/modifier"
        className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm hover:bg-muted/40"
      >
        <div>
          <p className="font-medium">Modifier les paramètres de visibilité</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Profil public, localisation, voie, guide, niveau
          </p>
        </div>
        <span className="text-muted-foreground">→</span>
      </Link>

      <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
        <p className="font-medium">Données bloquées</p>
        <p className="text-xs text-muted-foreground">
          Les membres que tu as bloqués ne peuvent pas voir ton profil ni t&apos;envoyer de messages.
        </p>
      </div>
    </div>
  )
}
