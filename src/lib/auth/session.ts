// src/lib/auth/session.ts
// Helpers session : récupérer l'utilisateur connecté côté serveur

import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId } from '@/lib/supabase/queries/users'
import { redirect } from 'next/navigation'

// Récupère la session Supabase + profil Prisma
// À utiliser dans les Server Components et API Routes
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const profile = await getProfileByUserId(user.id)
  return { user, profile }
}

// Variante qui redirige si non connecté — pour les Server Components protégés
export async function requireSession(redirectTo = '/auth/login') {
  const session = await getSession()
  if (!session) redirect(redirectTo)
  return session
}

// Variante qui redirige si onboarding non complété
export async function requireOnboarding() {
  const session = await requireSession()
  if (!session.profile?.onboardingCompleted) {
    redirect('/onboarding')
  }
  return session
}

// Vérifie si l'utilisateur est admin
export async function requireAdmin() {
  const session = await requireSession()
  const isAdmin = ['admin', 'super_admin', 'moderator'].includes(
    session.user.user_metadata?.role ?? '',
  )
  if (!isAdmin) redirect('/accueil')
  return session
}
