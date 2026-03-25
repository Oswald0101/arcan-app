// src/types/auth.ts
// Types métier pour auth, profil, préférences

export type UserRole = 'member' | 'founder' | 'moderator' | 'admin' | 'super_admin'
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'banned' | 'deleted'
export type VerificationBadge = 'none' | 'verified' | 'founder_verified'
export type LanguageCode = 'fr' | 'en' | 'es' | 'pt'
export type ThemeMode = 'dark' | 'light' | 'system'
export type NotificationLevel = 'all' | 'important' | 'minimal' | 'none'
export type GuideAddressMode = 'tutoiement' | 'vouvoiement'

export interface User {
  id: string
  role: UserRole
  accountStatus: AccountStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  deletedAt: Date | null
}

export interface Profile {
  id: string
  userId: string
  username: string
  displayName: string | null
  bio: string | null
  avatarType: string
  avatarUrl: string | null
  country: string | null
  city: string | null
  language: LanguageCode
  timezone: string
  isPublic: boolean
  showLocation: boolean
  showPath: boolean
  showGuide: boolean
  showLevel: boolean
  verificationStatus: VerificationBadge
  onboardingCompleted: boolean
  onboardingCompletedAt: Date | null
  currentLevel: number
  currentXp: number
  createdAt: Date
  updatedAt: Date
}

export interface UserPreference {
  id: string
  userId: string
  language: LanguageCode
  themeMode: ThemeMode
  soundEnabled: boolean
  hapticsEnabled: boolean
  notificationLevel: NotificationLevel
  guideAddressMode: GuideAddressMode
  extraPrefs: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

// Profil public (données visibles selon paramètres de visibilité)
export interface PublicProfile {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  verificationStatus: VerificationBadge
  currentLevel: number
  language: LanguageCode
  // Données conditionnelles
  country?: string | null
  city?: string | null
  createdAt: Date
}

// Session complète côté app
export interface AppSession {
  user: User
  profile: Profile
  preferences: UserPreference | null
}
