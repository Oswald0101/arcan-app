// src/app/auth/register/page.tsx

import { RegisterForm } from '@/components/auth/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte — Arcan',
  description: 'Révèle ce qui est en toi. Commence avec ARCAN.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-dvh px-4 pt-16 pb-8 bg-void">
      <div className="w-full max-w-sm mx-auto">
        <RegisterForm />
      </div>
    </div>
  )
}
