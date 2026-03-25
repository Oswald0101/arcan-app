// src/components/auth/register-form.tsx
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register, loginWithProvider } from '@/lib/auth/actions'
import type { RegisterInput } from '@/lib/auth/validations'

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const data: RegisterInput = {
      email,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      username: (form.elements.namedItem('username') as HTMLInputElement).value,
      ageConfirmed: (form.elements.namedItem('ageConfirmed') as HTMLInputElement).checked,
    }

    startTransition(async () => {
      const result = await register(data)
      if (result.success) {
        setRegisteredEmail(email)
        setSuccess(true)
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
      } else {
        if (result.field) {
          setFieldErrors({ [result.field]: result.error })
        } else {
          setError(result.error)
        }
      }
    })
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    const result = await loginWithProvider(provider)
    if (result.success && result.data?.url) {
      window.location.href = result.data.url
    } else {
      setError('Erreur de connexion')
    }
  }

  if (success) {
    return (
      <div className="space-y-5 text-center animate-fade-up">
        <div
          className="mx-auto h-14 w-14 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'hsl(38 52% 58% / 0.08)',
            border: '1px solid hsl(38 52% 58% / 0.25)',
            color: 'hsl(38 52% 65%)',
          }}
        >
          ✦
        </div>
        <div>
          <h1 className="font-serif text-2xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
            Vérifie ton email
          </h1>
          <p className="text-sm mt-2" style={{ color: 'hsl(248 8% 50%)' }}>
            Un lien a été envoyé à{' '}
            <strong style={{ color: 'hsl(38 22% 80%)' }}>{registeredEmail}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">

      {/* En-tête */}
      <div className="text-center space-y-3 animate-fade-up">
        <div
          className="mx-auto h-14 w-14 rounded-full flex items-center justify-center text-2xl"
          style={{
            background: 'hsl(38 52% 58% / 0.08)',
            border: '1px solid hsl(38 52% 58% / 0.2)',
            color: 'hsl(38 52% 65%)',
          }}
        >
          ◯
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.22em',
              color: 'hsl(38 52% 58% / 0.65)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            ARCAN
          </p>
          <h1 className="font-serif text-3xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
            Révèle ce qui est en toi.
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(248 8% 52%)' }}>
            Crée ton espace personnel.
          </p>
        </div>
      </div>

      {/* Google */}
      <div className="animate-fade-up delay-100">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'hsl(var(--surface-elevated))',
            border: '1px solid hsl(var(--border-bright))',
            color: 'hsl(var(--foreground))',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M47.532 24.552c0-1.636-.132-3.196-.396-4.68H24v9.288h13.228c-.576 3.036-2.268 5.616-4.812 7.344v6.084h7.788c4.56-4.188 7.188-10.356 7.188-18.036h.14Z" fill="#4285F4"/>
            <path d="M24 48c6.48 0 11.916-2.148 15.888-5.832l-7.788-6.084c-2.148 1.44-4.896 2.292-8.1 2.292-6.228 0-11.508-4.212-13.404-9.876H2.544v6.276C6.504 42.54 14.712 48 24 48Z" fill="#34A853"/>
            <path d="M10.596 28.5A14.58 14.58 0 0 1 9.6 24c0-1.572.276-3.096.756-4.5v-6.276H2.544A23.988 23.988 0 0 0 0 24c0 3.876.924 7.548 2.544 10.776L10.596 28.5Z" fill="#FBBC05"/>
            <path d="M24 9.624c3.516 0 6.672 1.212 9.156 3.576l6.84-6.84C35.88 2.388 30.444 0 24 0 14.712 0 6.504 5.46 2.544 13.224l8.052 6.276C12.492 13.836 17.772 9.624 24 9.624Z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>
      </div>

      <div className="flex items-center gap-4 animate-fade-up delay-100">
        <div className="divider-gold flex-1" />
        <span className="text-xs" style={{ color: 'hsl(248 8% 40%)' }}>ou par email</span>
        <div className="divider-gold flex-1" />
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'hsl(0 70% 45% / 0.1)',
            border: '1px solid hsl(0 70% 45% / 0.2)',
            color: 'hsl(0 70% 65%)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up delay-200">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-xs font-medium" style={{ color: 'hsl(248 8% 52%)' }}>
            Nom d&apos;utilisateur
          </label>
          <input id="username" name="username" type="text" autoComplete="username"
            required disabled={isPending} className="input" placeholder="ta_voie" />
          {fieldErrors.username && (
            <p className="text-xs" style={{ color: 'hsl(0 70% 55%)' }}>{fieldErrors.username}</p>
          )}
          <p className="text-xs" style={{ color: 'hsl(248 8% 38%)' }}>
            Minuscules, chiffres et _ uniquement.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium" style={{ color: 'hsl(248 8% 52%)' }}>
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email"
            required disabled={isPending} className="input" placeholder="ton@email.com" />
          {fieldErrors.email && (
            <p className="text-xs" style={{ color: 'hsl(0 70% 55%)' }}>{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium" style={{ color: 'hsl(248 8% 52%)' }}>
            Mot de passe
          </label>
          <input id="password" name="password" type="password" autoComplete="new-password"
            required disabled={isPending} className="input" placeholder="8 caractères minimum" />
          {fieldErrors.password && (
            <p className="text-xs" style={{ color: 'hsl(0 70% 55%)' }}>{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input id="ageConfirmed" name="ageConfirmed" type="checkbox"
              disabled={isPending}
              className="mt-0.5 h-4 w-4 rounded"
              style={{ accentColor: 'hsl(38 52% 58%)' }}
            />
            <span className="text-xs leading-relaxed" style={{ color: 'hsl(248 8% 45%)' }}>
              Je confirme avoir{' '}
              <strong style={{ color: 'hsl(38 22% 75%)' }}>18 ans ou plus</strong> et j&apos;accepte les{' '}
              <Link href="/cgu" className="underline hover:opacity-80" style={{ color: 'hsl(38 52% 58%)' }}>
                conditions
              </Link>{' '}
              et la{' '}
              <Link href="/confidentialite" className="underline hover:opacity-80" style={{ color: 'hsl(38 52% 58%)' }}>
                politique de confidentialité
              </Link>.
            </span>
          </label>
          {fieldErrors.ageConfirmed && (
            <p className="text-xs" style={{ color: 'hsl(0 70% 55%)' }}>{fieldErrors.ageConfirmed}</p>
          )}
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-1">
          {isPending ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm animate-fade-up delay-300" style={{ color: 'hsl(248 8% 45%)' }}>
        Déjà un compte ?{' '}
        <Link href="/auth/login" className="font-medium hover:opacity-80" style={{ color: 'hsl(38 52% 65%)' }}>
          Se connecter
        </Link>
      </p>
    </div>
  )
}
