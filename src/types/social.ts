// src/types/social.ts

export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type ReportTargetType = 'user' | 'path' | 'guide_message' | 'direct_message' | 'codex'
export type ReportStatus = 'pending' | 'under_review' | 'resolved_no_action' | 'resolved_action_taken' | 'dismissed'

// ---- Profil public ----
// Ce qui est visible selon les paramètres de visibilité du membre

export interface PublicProfile {
  id: string
  userId: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  verificationStatus: string
  currentLevel: number
  language: string
  createdAt: Date
  // Conditionnel selon show_location
  country?: string | null
  city?: string | null
  // Conditionnel selon show_path
  pathName?: string | null
  pathType?: string | null
  // Conditionnel selon show_guide
  guideName?: string | null
  guideType?: string | null
  // Méta
  isBlocked: boolean       // l'utilisateur courant a bloqué ce profil
  isBlockedBy: boolean     // ce profil a bloqué l'utilisateur courant
  contactStatus: ContactRequestStatus | 'contact' | null  // relation avec l'utilisateur courant
}

// ---- Contacts ----

export interface ContactRequest {
  id: string
  senderUserId: string
  receiverUserId: string
  message: string | null
  status: ContactRequestStatus
  createdAt: Date
  respondedAt: Date | null
  // Enrichi
  otherProfile?: PublicProfile
}

export interface Contact {
  id: string
  userOneId: string
  userTwoId: string
  createdAt: Date
  // Enrichi
  otherProfile?: PublicProfile
}

// ---- Conversations privées ----

export interface DirectConversation {
  id: string
  userOneId: string
  userTwoId: string
  lastMessagePreview: string | null
  lastMessageAt: Date | null
  createdAt: Date
  // Enrichi
  otherProfile?: PublicProfile
  unreadCount?: number
}

export interface DirectMessage {
  id: string
  conversationId: string
  senderUserId: string
  content: string
  isRead: boolean
  createdAt: Date
}

// ---- Blocage ----

export interface Block {
  id: string
  blockerUserId: string
  blockedUserId: string
  createdAt: Date
}

// ---- Signalement ----

export interface ReportInput {
  targetType: ReportTargetType
  targetId: string
  reasonKey: string
  detailsText?: string
}

// Clés de raison normalisées
export const REPORT_REASONS = [
  'hate_speech',
  'harassment',
  'spam',
  'inappropriate_content',
  'dangerous_content',
  'impersonation',
  'extremism',
  'other',
] as const

export type ReportReasonKey = typeof REPORT_REASONS[number]

export const REPORT_REASON_LABELS: Record<ReportReasonKey, Record<string, string>> = {
  hate_speech:           { fr: 'Discours haineux', en: 'Hate speech' },
  harassment:            { fr: 'Harcèlement', en: 'Harassment' },
  spam:                  { fr: 'Spam', en: 'Spam' },
  inappropriate_content: { fr: 'Contenu inapproprié', en: 'Inappropriate content' },
  dangerous_content:     { fr: 'Contenu dangereux', en: 'Dangerous content' },
  impersonation:         { fr: 'Usurpation d\'identité', en: 'Impersonation' },
  extremism:             { fr: 'Extrémisme', en: 'Extremism' },
  other:                 { fr: 'Autre', en: 'Other' },
}
