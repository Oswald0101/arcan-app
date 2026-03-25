// src/app/auth/consent/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConsentForm } from '@/components/auth/consent-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation — Voie',
}

export default async function ConsentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <ConsentForm userId={user.id} />
      </div>
    </div>
  )
}
