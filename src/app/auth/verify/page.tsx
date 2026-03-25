// src/app/auth/verify/page.tsx

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vérifie ton email — Voie',
}

interface VerifyPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">Vérifie ton email</h1>
          <p className="text-sm text-muted-foreground">
            Un lien de confirmation a été envoyé
            {email ? (
              <> à <strong className="text-foreground">{email}</strong></>
            ) : (
              ' à ton adresse email'
            )}.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Ouvre ton email et clique sur le lien pour activer ton compte.
          Le lien expire dans 24 heures.
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Pas reçu l&apos;email ?</p>
          <Link
            href="/auth/login"
            className="text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
