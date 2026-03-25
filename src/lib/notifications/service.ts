// src/lib/notifications/service.ts
// Notifications — aligné sur schema.prisma réel
// Schema: type (NotificationType enum), title, body, isRead (bool), entityType, entityId

import { prisma } from '@/lib/prisma'

// Types disponibles dans le schema
type SchemaNotificationType =
  | 'guide_message' | 'daily_practice' | 'challenge_reminder'
  | 'contact_request' | 'new_message' | 'rank_up'
  | 'level_up' | 'badge_earned' | 'invite_accepted' | 'system'

export interface NotificationPayload {
  type: SchemaNotificationType
  title: string
  body: string
  entityType?: string
  entityId?: string
}

export async function createNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  const prefs = await prisma.userPreference.findUnique({
    where: { userId },
    select: { notificationLevel: true },
  })

  const level = prefs?.notificationLevel ?? 'all'
  if (level === 'none') return
  if (level === 'minimal' && !isImportant(payload.type)) return

  await prisma.notification.create({
    data: {
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      isRead: false,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
    },
  })
}

export async function createBulkNotifications(
  userIds: string[],
  payload: NotificationPayload,
): Promise<void> {
  if (userIds.length === 0) return
  await Promise.allSettled(userIds.map((id) => createNotification(id, payload)))
}

export async function getNotifications(userId: string, params?: { limit?: number }) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: params?.limit ?? 30,
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

// Helpers métier — appelés depuis les Server Actions
export async function notifyContactRequest(receiverId: string, senderUsername: string) {
  await createNotification(receiverId, {
    type: 'contact_request',
    title: `@${senderUsername} t'a envoyé une demande de contact`,
    body: 'Réponds depuis la page Contacts.',
    entityType: 'user',
  })
}

export async function notifyNewMessage(receiverId: string, senderUsername: string, conversationId: string) {
  await createNotification(receiverId, {
    type: 'new_message',
    title: `Message de @${senderUsername}`,
    body: 'Tu as un nouveau message.',
    entityType: 'conversation',
    entityId: conversationId,
  })
}

export async function notifyLevelUp(userId: string, levelTitle: string) {
  await createNotification(userId, {
    type: 'level_up',
    title: `Nouveau niveau : ${levelTitle}`,
    body: 'Continue sur ta lancée.',
  })
}

export async function notifyRankUp(userId: string, rankTitle: string) {
  await createNotification(userId, {
    type: 'rank_up',
    title: `Nouveau rang : ${rankTitle}`,
    body: 'Ta progression est réelle.',
  })
}

export async function notifyBadgeEarned(userId: string, badgeTitle: string) {
  await createNotification(userId, {
    type: 'badge_earned',
    title: `Badge débloqué : ${badgeTitle}`,
    body: '',
  })
}

export async function notifyInviteAccepted(inviterId: string, inviteeUsername: string) {
  await createNotification(inviterId, {
    type: 'invite_accepted',
    title: `@${inviteeUsername} a rejoint grâce à ton invitation`,
    body: 'Tu as gagné 30 jours de premium !',
  })
}

function isImportant(type: SchemaNotificationType): boolean {
  return ['contact_request', 'invite_accepted', 'system'].includes(type)
}
