// src/lib/auth/actions.ts
// Server Actions Next.js pour register, login, logout, reset password

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateUsernameSchema,
  updatePreferencesSchema,
  consentSchema,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
  type UpdateUsernameInput,
  type UpdatePreferencesInput,
  type ConsentInput,
} from './validations'
import { isUsernameTaken, updateProfile, updateUserPreferences, updateUsername } from '@/lib/supabase/queries/users'

// Type de retour unifié pour les Server Actions
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; field?: string }

// ============================================================
// INSCRIPTION
// ============================================================

export async function register(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first.message, field: first.path[0] as string }
  }

  const { email, password, username } = parsed.data

  // Vérifier disponibilité du username
  const taken = await isUsernameTaken(username)
  if (taken) {
    return { success: false, error: 'Ce nom d\'utilisateur est déjà pris', field: 'username' }
  }

  const supabase = await createClient()

  // Inscription Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { username }, // stocké dans user_metadata
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Un compte existe déjà avec cet email', field: 'email' }
    }
    return { success: false, error: 'Erreur lors de l\'inscription. Réessaie.' }
  }

  if (!data.user) {
    return { success: false, error: 'Erreur inattendue. Réessaie.' }
  }

  // Créer explicitement User + Profile dans Prisma (pas de trigger configuré)
  try {
    await prisma.user.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id },
      update: {},
    })
    await prisma.profile.upsert({
      where: { userId: data.user.id },
      create: { userId: data.user.id, username },
      update: { username },
    })
  } catch {
    // Non bloquant — on laisse passer pour ne pas bloquer l'inscription
  }

  return { success: true }
}

// ============================================================
// CONNEXION
// ============================================================

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first.message, field: first.path[0] as string }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { success: false, error: 'Email ou mot de passe incorrect' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'Confirme ton email avant de te connecter', field: 'email' }
    }
    return { success: false, error: 'Erreur de connexion. Réessaie.' }
  }

  revalidatePath('/', 'layout')
  redirect('/accueil')
}

// ============================================================
// DÉCONNEXION
// ============================================================

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

// ============================================================
// CONNEXION AVEC OAUTH (Google / Apple)
// ============================================================

export async function loginWithProvider(
  provider: 'google' | 'apple',
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

  if (error) return { success: false, error: 'Erreur de connexion OAuth' }
  if (!data.url) return { success: false, error: 'URL OAuth manquante' }

  return { success: true, data: { url: data.url } }
}

// ============================================================
// MOT DE PASSE OUBLIÉ
// ============================================================

export async function forgotPassword(email: string): Promise<ActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Email invalide', field: 'email' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) return { success: false, error: 'Erreur. Réessaie.' }

  // Toujours retourner success pour ne pas exposer si l'email existe
  return { success: true }
}

// ============================================================
// MISE À JOUR DU MOT DE PASSE (après reset)
// ============================================================

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Le mot de passe doit faire au moins 8 caractères', field: 'password' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { success: false, error: 'Erreur lors de la mise à jour du mot de passe. Réessaie.' }

  return { success: true }
}

// ============================================================
// CONSENTEMENTS LÉGAUX
// ============================================================

export async function saveConsents(
  userId: string,
  input: ConsentInput,
): Promise<ActionResult> {
  const parsed = consentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Consentements incomplets' }
  }

  const version = '1.0'
  const now = new Date()

  // Garantir que le user existe dans Prisma avant la FK
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  })

  await prisma.$transaction([
    prisma.legalConsent.create({
      data: { userId, consentType: 'terms',   consentVersion: version, accepted: true, acceptedAt: now },
    }),
    prisma.legalConsent.create({
      data: { userId, consentType: 'privacy', consentVersion: version, accepted: true, acceptedAt: now },
    }),
    prisma.legalConsent.create({
      data: { userId, consentType: 'age_18',  consentVersion: version, accepted: true, acceptedAt: now },
    }),
    prisma.ageConsent.upsert({
      where: { userId },
      create: { userId, declaredAgeGroup: 'adult' },
      update: { declaredAgeGroup: 'adult' },
    }),
  ])

  return { success: true }
}

// ============================================================
// MISE À JOUR DU PROFIL
// ============================================================

export async function updateProfileAction(
  userId: string,
  input: UpdateProfileInput,
): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first.message, field: first.path[0] as string }
  }

  try {
    await updateProfile(userId, parsed.data)
    revalidatePath('/profil')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

export async function updateUsernameAction(
  userId: string,
  input: UpdateUsernameInput,
): Promise<ActionResult> {
  const parsed = updateUsernameSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first.message, field: first.path[0] as string }
  }

  try {
    await updateUsername(userId, parsed.data.username)
    revalidatePath('/profil')
    return { success: true }
  } catch (e: any) {
    if (e.message === 'USERNAME_TAKEN') {
      return { success: false, error: 'Ce nom d\'utilisateur est déjà pris', field: 'username' }
    }
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

// ============================================================
// MISE À JOUR DE L'AVATAR
// ============================================================

export async function updateAvatarAction(
  userId: string,
  avatarUrl: string,
): Promise<ActionResult> {
  if (!userId || !avatarUrl) {
    return { success: false, error: 'Données invalides' }
  }

  // Valider le format — galerie ou URL http
  const isGallery = avatarUrl.startsWith('gallery:')
  const isUrl = avatarUrl.startsWith('http')
  if (!isGallery && !isUrl) {
    return { success: false, error: 'Format d\'avatar invalide' }
  }

  try {
    await prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    })
    revalidatePath('/profil')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour de l\'avatar' }
  }
}

// ============================================================
// MISE À JOUR DE LA LANGUE
// ============================================================

export async function updateLanguageAction(
  userId: string,
  language: 'fr' | 'en' | 'es' | 'pt',
): Promise<ActionResult> {
  try {
    await prisma.profile.update({
      where: { userId },
      data: { language },
    })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour de la langue' }
  }
}

export async function updatePreferencesAction(
  userId: string,
  input: UpdatePreferencesInput,
): Promise<ActionResult> {
  const parsed = updatePreferencesSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Données invalides' }
  }

  try {
    await updateUserPreferences(userId, parsed.data)
    revalidatePath('/profil')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}
