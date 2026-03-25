// src/types/paths.ts

export type PathCanonicalType =
  | 'voie' | 'religion' | 'mouvement' | 'philosophie' | 'ordre'
  | 'tradition' | 'courant' | 'ecole' | 'cercle_type' | 'temple'
  | 'doctrine' | 'culte' | 'autre'

export type PathVisibility  = 'public' | 'unlisted' | 'private'
export type AdmissionMode   = 'open' | 'on_request' | 'invite_only'
export type PathStatus      = 'active' | 'archived' | 'suspended'
export type MembershipRole   = 'member' | 'elder' | 'moderator' | 'founder'
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'left' | 'banned'
export type Difficulty       = 'easy' | 'medium' | 'hard'
export type PracticeFrequency = 'daily' | 'weekly' | 'monthly' | 'custom'
export type LogStatus        = 'in_progress' | 'completed' | 'failed' | 'skipped'

// ---- Voie ----

export interface Path {
  id: string
  founderUserId: string
  canonicalType: PathCanonicalType
  customTypeLabel: string | null
  name: string
  slug: string
  shortDescription: string
  longDescription: string | null
  language: string
  status: PathStatus
  visibility: PathVisibility
  admissionMode: AdmissionMode
  primaryTheme: string | null
  symbolicStyle: string | null
  memberCount: number
  currentVersion: number
  createdAt: Date
  updatedAt: Date
}

export interface PathVersion {
  id: string
  pathId: string
  versionNumber: number
  manifestoText: string | null
  principles: string[]
  practices: string[]
  evolutionNotes: string | null
  createdByUserId: string
  createdAt: Date
}

// Vue enrichie pour l'affichage
export interface PathView extends Path {
  currentManifesto: string | null
  currentPrinciples: string[]
  guideId: string | null
  guideName: string | null
  userMembership: CircleMembership | null // null si non-membre
  circle: CircleSummary | null
}

// ---- Cercle ----

export interface Circle {
  id: string
  pathId: string
  founderUserId: string
  name: string | null
  description: string | null
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CircleSummary {
  id: string
  memberCount: number
  name: string | null
}

export interface CircleMembership {
  id: string
  circleId: string
  userId: string
  role: MembershipRole
  status: MembershipStatus
  joinedAt: Date
  invitedByUserId: string | null
  approvedByUserId: string | null
}

export interface CircleMemberWithProfile extends CircleMembership {
  profile: {
    username: string
    displayName: string | null
    avatarUrl: string | null
    currentLevel: number
    verificationStatus: string
  }
  pathProgress: {
    rankTitle: string | null
    rankXp: number
  } | null
}

// ---- Progression ----

export interface MemberLevel {
  id: string
  levelNumber: number
  title: string
  requiredXp: number
  badgeUrl: string | null
  perks: string[]
}

export interface UserMemberProgress {
  id: string
  userId: string
  currentLevelId: string | null
  currentXp: number
  streakDays: number
  longestStreak: number
  totalPracticesCompleted: number
  totalChallengesCompleted: number
  totalDaysActive: number
  lastActivityAt: Date | null
  currentLevel: MemberLevel | null
}

export interface PathRank {
  id: string
  pathId: string
  rankOrder: number
  title: string
  description: string | null
  requiredXp: number
  requiredConditions: Record<string, unknown>
  badgeUrl: string | null
}

export interface UserPathProgress {
  id: string
  userId: string
  pathId: string
  currentRankId: string | null
  rankXp: number
  practicesCompleted: number
  challengesCompleted: number
  consistencyScore: number
  joinedAt: Date
  lastProgressAt: Date | null
  currentRank: PathRank | null
  nextRank: PathRank | null
}

// ---- Pratiques & Épreuves ----

export interface Practice {
  id: string
  pathId: string | null
  title: string
  description: string
  frequency: PracticeFrequency
  xpReward: number
  isActive: boolean
  validationType: string
  minDurationSeconds: number
}

export interface Challenge {
  id: string
  pathId: string | null
  title: string
  description: string
  difficulty: Difficulty
  durationDays: number | null
  xpReward: number
  isActive: boolean
}

export interface UserPracticeLog {
  id: string
  userId: string
  practiceId: string
  status: LogStatus
  note: string | null
  xpEarned: number
  loggedAt: Date
  practice?: Practice
}

export interface UserChallengeLog {
  id: string
  userId: string
  challengeId: string
  status: LogStatus
  startedAt: Date
  completedAt: Date | null
  note: string | null
  xpEarned: number
  challenge?: Challenge
}

// ---- Badges ----

export interface Badge {
  id: string
  key: string
  title: string
  description: string | null
  imageUrl: string | null
  triggerType: string
  triggerValue: number | null
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  badge?: Badge
}

// ---- Résultats des actions ----

export interface ProgressionUpdate {
  xpEarned: number
  newPlatformXp: number
  leveledUp: boolean
  newLevel: MemberLevel | null
  rankedUp: boolean
  newRank: PathRank | null
  badgesEarned: Badge[]
}
