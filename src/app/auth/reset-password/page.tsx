'use client'
// src/app/auth/reset-password/page.tsx
// Reçoit ?token_hash=xxx&type=recovery depuis l'email Supabase
// Échange le token, affiche le formulaire de nouveau mot de passe

import { useEffect, useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updatePassword } from '@/lib/auth/actions'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Étape 1 : vérifier le token au montage
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'recovery') {
      setTokenError('Lien invalide ou expiré. Demande un nouveau lien de réinitialisation.')
      setVerifying(false)
      return
    }

    const supabase = createClient()
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setTokenError('Ce lien a expiré ou est invalide. Demande un nouveau lien.')
        } else {
          setVerified(true)
        }
        setVerifying(false)
      })
  }, [searchParams])

  // Étape 2 : soumettre le nouveau mot de passe
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (password.length < 8) {
      setFormError('Le mot de passe doit faire au moins 8 caractères')
      return
    }
    if (password !== confirm) {
      setFormError('Les mots de passe ne correspondent pas')
      return
    }

    startTransition(async () => {
      const result = await updatePassword(password)
      if (result.success) {
        setDone(true)
        setTimeout(() => router.push('/accueil'), 2500)
      } else {
        setFormError(result.error)
      }
    })
  }

  // ── États ──

  if (verifying) {
    return (
      <div className="text-center space-y-3">
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '20px',
            fontWeight: 300,
            color: 'hsl(248 10% 52%)',
          }}
        >
          Vérification du lien…
        </div>
        <p className="text-sm" style={{ color: 'hsl(248 10% 36%)' }}>
          Un instant.
        </p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="text-center space-y-4">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px',
            fontWeight: 300,
            color: 'hsl(0 52% 58%)',
          }}
        >
          Lien invalide.
        </p>
        <p className="text-sm" style={{ color: 'hsl(248 10% 42%)' }}>
          {tokenError}
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'hsl(38 52% 62%)' }}
        >
          Demander un nouveau lien →
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 300,
            color: 'hsl(142 52% 58%)',
          }}
        >
          Mot de passe mis à jour.
        </p>
        <p className="text-sm" style={{ color: 'hsl(248 10% 42%)' }}>
          Redirection vers ton espace…
        </p>
      </div>
    )
  }

  if (!verified) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium"
          style={{ color: 'hsl(248 10% 60%)' }}
        >
          Nouveau mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          placeholder="Au moins 8 caractères"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm"
          className="text-sm font-medium"
          style={{ color: 'hsl(248 10% 60%)' }}
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          type="password"
          required
          disabled={isPending}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input w-full"
          placeholder="Répète ton mot de passe"
          autoComplete="new-password"
        />
      </div>

      {formError && (
        <p className="text-xs" style={{ color: 'hsl(0 52% 58%)' }}>
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full"
        style={{ padding: '12px 20px', fontSize: '14px' }}
      >
        {isPending ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* En-tête */}
        <div className="text-center mb-8">
          <p
            style={{
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              color: 'hsl(38 52% 58% / 0.65)',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            ARCAN
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              color: 'hsl(38 14% 90%)',
              lineHeight: 1.1,
            }}
          >
            Nouveau mot de passe.
          </h1>
          <p className="text-sm mt-2" style={{ color: 'hsl(248 10% 44%)' }}>
            Choisis un mot de passe sécurisé.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="text-center text-sm" style={{ color: 'hsl(248 10% 40%)' }}>
              Chargement…
            </p>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm" style={{ color: 'hsl(248 10% 34%)' }}>
          <Link
            href="/auth/login"
            className="transition-opacity hover:opacity-70"
            style={{ color: 'hsl(248 10% 44%)' }}
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
