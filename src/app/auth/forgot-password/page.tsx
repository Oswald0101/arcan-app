// src/app/auth/forgot-password/page.tsx
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth/actions'

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await forgotPassword(email)
      if (result.success) setSent(true)
      else setError(result.error)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {sent ? (
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-medium">Email envoyé</h1>
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec cet email, tu recevras un lien de réinitialisation.
            </p>
            <Link href="/auth/login" className="text-sm underline text-muted-foreground hover:text-foreground">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-medium">Mot de passe oublié</h1>
              <p className="text-sm text-muted-foreground">
                Entre ton email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  placeholder="ton@email.com"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
              >
                {isPending ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="underline hover:text-foreground">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
