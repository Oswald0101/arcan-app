// src/lib/supabase/queries/guide.ts
// Requêtes Prisma pour le module guide IA

import { prisma } from '@/lib/prisma'

// ---- Conversation ----

export async function getOrCreateConversation(params: {
  userId: string
  guideId: string
  conversationId?: string | null
}) {
  const { userId, guideId, conversationId } = params

  if (conversationId) {
    const existing = await prisma.guideConversation.findFirst({
      where: { id: conversationId, userId, guideId },
    })
    if (existing) return existing
  }

  // Créer une nouvelle conversation
  return prisma.guideConversation.create({
    data: { userId, guideId, status: 'active' },
  })
}

export async function getUserConversations(userId: string, guideId: string) {
  return prisma.guideConversation.findMany({
    where: { userId, guideId, status: 'active' },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string,
  limit = 50,
) {
  const conversation = await prisma.guideConversation.findFirst({
    where: { id: conversationId, userId },
  })
  if (!conversation) return null

  const messages = await prisma.guideMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      senderType: true,
      content: true,
      createdAt: true,
      metadata: true,
    },
  })

  return { conversation, messages }
}

// ---- Messages ----

export async function saveMessage(params: {
  conversationId: string
  senderType: 'member' | 'guide' | 'system'
  content: string
  inputTokens?: number
  outputTokens?: number
  modelUsed?: string
  metadata?: Record<string, unknown>
}) {
  return prisma.guideMessage.create({
    data: {
      conversationId: params.conversationId,
      senderType: params.senderType,
      content: params.content,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      modelUsed: params.modelUsed,
      metadata: params.metadata ?? {},
    },
  })
}

// Met à jour l'updatedAt de la conversation + title si premier message
export async function touchConversation(
  conversationId: string,
  firstMemberMessage?: string,
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  // Auto-titre basé sur le premier message (30 chars max)
  if (firstMemberMessage) {
    const conversation = await prisma.guideConversation.findUnique({
      where: { id: conversationId },
      select: { title: true },
    })
    if (!conversation?.title) {
      updates.title = firstMemberMessage.slice(0, 50).trim()
    }
  }

  return prisma.guideConversation.update({
    where: { id: conversationId },
    data: updates,
  })
}

// ---- Guide ----

export async function getGuideForUser(userId: string) {
  return prisma.guide.findFirst({
    where: { ownerUserId: userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getGuideById(guideId: string, userId: string) {
  return prisma.guide.findFirst({
    where: { id: guideId, ownerUserId: userId },
  })
}

// ---- Compteur de messages (pour déclencher l'extraction mémoire) ----

export async function getConversationMessageCount(conversationId: string): Promise<number> {
  return prisma.guideMessage.count({
    where: { conversationId },
  })
}
