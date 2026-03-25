// src/app/confidentialite/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — Voie' }

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <h1 className="text-2xl font-medium">Politique de confidentialité</h1>
      <p className="text-sm text-muted-foreground">Dernière mise à jour : mars 2026</p>
      <div className="prose prose-sm max-w-none space-y-4 text-sm text-muted-foreground">
        <p>Ce document sera complété avant le lancement public.</p>
        <h2 className="text-base font-medium text-foreground">Données collectées</h2>
        <p>
          Nous collectons les données nécessaires au fonctionnement du service :
          adresse email, contenu des échanges avec le Guide IA, historique de progression.
        </p>
        <h2 className="text-base font-medium text-foreground">Utilisation des données</h2>
        <p>
          Vos données sont utilisées exclusivement pour personaliser votre expérience Voie.
          Elles ne sont jamais vendues à des tiers.
        </p>
        <h2 className="text-base font-medium text-foreground">Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
          Contactez-nous via les paramètres de votre profil.
        </p>
        <h2 className="text-base font-medium text-foreground">Hébergement</h2>
        <p>Les données sont hébergées sur infrastructure Supabase (UE) et Vercel.</p>
      </div>
    </div>
  )
}
