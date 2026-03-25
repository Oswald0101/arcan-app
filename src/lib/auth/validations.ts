// src/lib/auth/validations.ts
// Schemas Zod pour inscription, connexion, profil

import { z } from 'zod'

// ---- Auth ----

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  username: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-z0-9_]+$/, 'Uniquement lettres minuscules, chiffres et _'),
  ageConfirmed: z
    .boolean()
    .refine((v) => v === true, 'Vous devez confirmer avoir 18 ans ou plus'),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email requis').email('Email invalide'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

// ---- Profil ----

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .max(50, 'Maximum 50 caractères')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Maximum 500 caractères')
    .optional()
    .nullable(),
  country: z.string().length(2).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  language: z.enum(['fr', 'en', 'es', 'pt']).optional(),
  isPublic: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showPath: z.boolean().optional(),
  showGuide: z.boolean().optional(),
  showLevel: z.boolean().optional(),
})

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Minimum 3 caractères')
    .max(30, 'Maximum 30 caractères')
    .regex(/^[a-z0-9_]+$/, 'Uniquement lettres minuscules, chiffres et _'),
})

export const updatePreferencesSchema = z.object({
  language: z.enum(['fr', 'en', 'es', 'pt']).optional(),
  themeMode: z.enum(['dark', 'light', 'system']).optional(),
  soundEnabled: z.boolean().optional(),
  hapticsEnabled: z.boolean().optional(),
  notificationLevel: z.enum(['all', 'important', 'minimal', 'none']).optional(),
  guideAddressMode: z.enum(['tutoiement', 'vouvoiement']).optional(),
})

export const consentSchema = z.object({
  termsAccepted: z.boolean().refine((v) => v, 'Vous devez accepter les CGU'),
  privacyAccepted: z.boolean().refine((v) => v, 'Vous devez accepter la politique de confidentialité'),
  ageConfirmed: z.boolean().refine((v) => v, 'Vous devez confirmer avoir 18 ans ou plus'),
})

// Types inférés
export type RegisterInput    = z.infer<typeof registerSchema>
export type LoginInput       = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type ConsentInput     = z.infer<typeof consentSchema>
