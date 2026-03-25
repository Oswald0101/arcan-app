// src/types/notifications.ts — aligné sur schema.prisma réel

export type SchemaNotificationType =
  | 'guide_message' | 'daily_practice' | 'challenge_reminder'
  | 'contact_request' | 'new_message' | 'rank_up'
  | 'level_up' | 'badge_earned' | 'invite_accepted' | 'system'

export interface Notification {
  id: string
  userId: string
  type: SchemaNotificationType
  title: string
  body: string
  isRead: boolean
  entityType: string | null
  entityId: string | null
  createdAt: Date
}

// Gardé pour compatibilité avec le code existant qui utilise NotificationType
export type NotificationType = SchemaNotificationType
