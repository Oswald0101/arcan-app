// src/components/auth/consent-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveConsents } from '@/lib/auth/actions'
import type { ConsentInput } from '@/lib/auth/validations'

interface ConsentFormProps {
  userId: string
}

export function ConsentForm({ userId }: ConsentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const input: ConsentInput = {
      termsAccepted:   (form.elements.namedItem('terms') as HTMLInputElement).checked,
      privacyAccepted: (form.elements.namedItem('privacy') as HTMLInputElement).checked,
      ageConfirmed:    (form.elements.namedItem('age') as HTMLInputElement).checked,
    }

    startTransition(async () => {
      const result = await saveConsents(userId, input)
      if (result.success) {
        router.push('/onboarding')
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">Avant de commencer</h1>
        <p className="text-sm text-muted-foreground">
          Quelques points importants à confirmer.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="age"
            type="checkbox"
            required
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
          />
          <span className="text-sm">
            Je confirme avoir <strong>18 ans ou plus</strong>.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="terms"
            type="checkbox"
            required
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
          />
          <span className="text-sm">
            J&apos;accepte les{' '}
            <Link href="/cgu" target="_blank" className="underline hover:opacity-80">
              conditions générales d&apos;utilisation
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="privacy"
            type="checkbox"
            required
            disabled={isPending}
            className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
          />
          <span className="text-sm">
            J&apos;accepte la{' '}
            <Link href="/confidentialite" target="_blank" className="underline hover:opacity-80">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Enregistrement…' : 'Continuer'}
        </button>
      </form>
    </div>
  )
}
