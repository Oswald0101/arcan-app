// src/app/profil/parametres/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Paramètres — Voie' }

export default async function ParametresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const prefs = await prisma.userPreference.findUnique({ where: { userId: user.id } })

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profil" className="text-muted-foreground hover:text-foreground text-sm">← Profil</Link>
        <h1 className="text-xl font-medium">Paramètres</h1>
      </div>

      <nav className="space-y-1">
        {[
          { href: '/profil/modifier', label: 'Modifier mon profil' },
          { href: '/profil/confidentialite', label: 'Confidentialité' },
          { href: '/abonnement', label: 'Mon abonnement' },
          { href: '/parrainage', label: 'Parrainage' },
          { href: '/cgu', label: 'Conditions générales' },
          { href: '/confidentialite', label: 'Politique de confidentialité' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm hover:bg-muted/40"
          >
            {item.label}
            <span className="text-muted-foreground">→</span>
          </Link>
        ))}
      </nav>

      <div className="rounded-xl border border-destructive/20 p-4 space-y-2">
        <p className="text-sm font-medium text-destructive">Zone dangereuse</p>
        <p className="text-xs text-muted-foreground">
          La suppression de compte est définitive. Contacte le support si nécessaire.
        </p>
      </div>
    </div>
  )
}
