// src/app/auth/login/page.tsx

import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — Arcan',
  description: 'Reprends ta voie intérieure avec ARCAN',
}

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-dvh px-4 pt-16 pb-8 bg-void">
      <div className="w-full max-w-sm mx-auto">
        <LoginForm
          redirectTo={params.redirect}
          oauthError={params.error}
        />
      </div>
    </div>
  )
}
