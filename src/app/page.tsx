// src/app/page.tsx
// Page racine — redirige vers /accueil si connecté, sinon /auth/login

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/accueil')
  } else {
    redirect('/auth/login')
  }
}
