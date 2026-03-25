// src/app/cgu/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Conditions générales — Voie' }

export default function CguPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <h1 className="text-2xl font-medium">Conditions générales d&apos;utilisation</h1>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : mars 2026</p>
      <div className="prose prose-sm max-w-none space-y-4 text-sm text-muted-foreground">
        <p>
          En utilisant Voie, vous acceptez les présentes conditions générales d&apos;utilisation.
          Ce document sera complété avant le lancement public.
        </p>
        <h2 className="text-base font-medium text-foreground">1. Objet</h2>
        <p>
          La plateforme Voie permet à ses membres de créer et suivre une voie symbolique,
          philosophique ou spirituelle personnelle, accompagnée d&apos;un guide IA.
        </p>
        <h2 className="text-base font-medium text-foreground">2. Accès</h2>
        <p>L&apos;accès est réservé aux personnes majeures (18 ans et plus).</p>
        <h2 className="text-base font-medium text-foreground">3. Contenu</h2>
        <p>
          Les membres sont responsables du contenu qu&apos;ils publient.
          Tout contenu incitant à la violence, à la haine ou à l&apos;automutilation est interdit.
        </p>
        <h2 className="text-base font-medium text-foreground">4. Données personnelles</h2>
        <p>Voir notre politique de confidentialité.</p>
      </div>
    </div>
  )
}
