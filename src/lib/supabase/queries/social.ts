// src/lib/supabase/queries/social.ts
// Requêtes Prisma pour contacts, messages, blocage, signalement

import { prisma } from '@/lib/prisma'

// ============================================================
// GUARD : VÉRIFICATIONS COMMUNES
// ============================================================

export async function assertNotBlocked(userAId: string, userBId: string): Promise<void> {
  const [block1, block2] = await Promise.all([
    prisma.block.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: userAId, blockedUserId: userBId } },
    }),
    prisma.block.findUnique({
      where: { blockerUserId_blockedUserId: { blockerUserId: userBId, blockedUserId: userAId } },
    }),
  ])
  if (block1 || block2) throw new Error('BLOCKED')
}

export async function assertAreContacts(userAId: string, userBId: string): Promise<void> {
  const [id1, id2] = [userAId, userBId].sort()
  const contact = await prisma.contact.findUnique({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
  })
  if (!contact) throw new Error('NOT_CONTACTS')
}

// ============================================================
// DEMANDES DE CONTACT
// ============================================================

export async function sendContactRequest(senderUserId: string, receiverUserId: string, message?: string) {
  if (senderUserId === receiverUserId) throw new Error('SELF_REQUEST')

  await assertNotBlocked(senderUserId, receiverUserId)

  // Déjà contacts ?
  const [id1, id2] = [senderUserId, receiverUserId].sort()
  const existing = await prisma.contact.findUnique({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
  })
  if (existing) throw new Error('ALREADY_CONTACT')

  // Demande déjà en cours dans un sens ou dans l'autre ?
  const existingRequest = await prisma.contactRequest.findFirst({
    where: {
      OR: [
        { senderUserId, receiverUserId, status: 'pending' },
        { senderUserId: receiverUserId, receiverUserId: senderUserId, status: 'pending' },
      ],
    },
  })
  if (existingRequest) throw new Error('REQUEST_ALREADY_EXISTS')

  return prisma.contactRequest.create({
    data: { senderUserId, receiverUserId, message: message ?? null },
  })
}

export async function respondToContactRequest(
  requestId: string,
  receiverUserId: string,
  action: 'accept' | 'reject',
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.contactRequest.findFirst({
      where: { id: requestId, receiverUserId, status: 'pending' },
    })
    if (!request) throw new Error('REQUEST_NOT_FOUND')

    await tx.contactRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'accepted' : 'rejected',
        respondedAt: new Date(),
      },
    })

    if (action === 'accept') {
      const [id1, id2] = [request.senderUserId, request.receiverUserId].sort()
      await tx.contact.upsert({
        where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
        create: { userOneId: id1, userTwoId: id2 },
        update: {},
      })
    }

    return { status: action === 'accept' ? 'accepted' : 'rejected' }
  })
}

export async function cancelContactRequest(requestId: string, senderUserId: string) {
  const request = await prisma.contactRequest.findFirst({
    where: { id: requestId, senderUserId, status: 'pending' },
  })
  if (!request) throw new Error('REQUEST_NOT_FOUND')

  return prisma.contactRequest.update({
    where: { id: requestId },
    data: { status: 'rejected', respondedAt: new Date() },
  })
}

export async function getPendingRequestsReceived(userId: string) {
  return prisma.contactRequest.findMany({
    where: { receiverUserId: userId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      sender: {
        include: {
          profile: {
            select: { username: true, displayName: true, avatarUrl: true, currentLevel: true },
          },
        },
      },
    },
  })
}

export async function getPendingRequestsSent(userId: string) {
  return prisma.contactRequest.findMany({
    where: { senderUserId: userId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      receiver: {
        include: {
          profile: {
            select: { username: true, displayName: true, avatarUrl: true, currentLevel: true },
          },
        },
      },
    },
  })
}

// ============================================================
// CONTACTS
// ============================================================

export async function getContacts(userId: string) {
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      userOne: {
        include: {
          profile: {
            select: { username: true, displayName: true, avatarUrl: true, currentLevel: true, verificationStatus: true },
          },
        },
      },
      userTwo: {
        include: {
          profile: {
            select: { username: true, displayName: true, avatarUrl: true, currentLevel: true, verificationStatus: true },
          },
        },
      },
    },
  })

  // Normalise pour toujours renvoyer le profil de l'autre membre
  return contacts.map((c: any) => {
    const other = c.userOneId === userId ? c.userTwo : c.userOne
    return { contactId: c.id, profile: other.profile, userId: other.id, createdAt: c.createdAt }
  })
}

export async function removeContact(userId: string, otherUserId: string) {
  const [id1, id2] = [userId, otherUserId].sort()
  const contact = await prisma.contact.findUnique({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
  })
  if (!contact) throw new Error('CONTACT_NOT_FOUND')

  return prisma.contact.delete({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
  })
}

// ============================================================
// CONVERSATIONS PRIVÉES
// ============================================================

export async function getOrCreateDirectConversation(userAId: string, userBId: string) {
  await assertNotBlocked(userAId, userBId)
  await assertAreContacts(userAId, userBId)

  const [id1, id2] = [userAId, userBId].sort()

  return prisma.directConversation.upsert({
    where: { userOneId_userTwoId: { userOneId: id1, userTwoId: id2 } },
    create: { userOneId: id1, userTwoId: id2 },
    update: {},
  })
}

export async function getUserConversations(userId: string) {
  const conversations = await prisma.directConversation.findMany({
    where: {
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
    orderBy: [
      { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      { createdAt: 'desc' },
    ],
    take: 50,
    include: {
      userOne: {
        include: {
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      },
      userTwo: {
        include: {
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  })

  return conversations.map((c: any) => {
    const other = c.userOneId === userId ? c.userTwo : c.userOne
    return {
      id: c.id,
      otherProfile: other.profile,
      otherUserId: other.id,
      lastMessagePreview: c.lastMessagePreview,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    }
  })
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  params?: { limit?: number; before?: Date },
) {
  // Vérifier que l'utilisateur est participant
  const conv = await prisma.directConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
  })
  if (!conv) throw new Error('CONVERSATION_NOT_FOUND')

  // Vérifier pas de blocage
  const otherId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId
  await assertNotBlocked(userId, otherId)

  return prisma.directMessage.findMany({
    where: {
      conversationId,
      ...(params?.before ? { createdAt: { lt: params.before } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: params?.limit ?? 50,
  })
}

// ============================================================
// MESSAGES
// ============================================================

export async function sendDirectMessage(params: {
  conversationId: string
  senderUserId: string
  content: string
}) {
  const { conversationId, senderUserId, content } = params

  if (!content.trim()) throw new Error('EMPTY_MESSAGE')
  if (content.length > 2000) throw new Error('MESSAGE_TOO_LONG')

  // Vérifier participation + non-blocage
  const conv = await prisma.directConversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userOneId: senderUserId }, { userTwoId: senderUserId }],
    },
  })
  if (!conv) throw new Error('CONVERSATION_NOT_FOUND')

  const otherId = conv.userOneId === senderUserId ? conv.userTwoId : conv.userOneId
  await assertNotBlocked(senderUserId, otherId)

  return prisma.$transaction(async (tx) => {
    const message = await tx.directMessage.create({
      data: { conversationId, senderUserId, content },
    })

    // Mise à jour preview de la conversation
    await tx.directConversation.update({
      where: { id: conversationId },
      data: {
        lastMessagePreview: content.slice(0, 60),
        lastMessageAt: new Date(),
      },
    })

    return message
  })
}

export async function markMessagesAsRead(conversationId: string, readerUserId: string) {
  // Marquer comme lus les messages de l'autre
  return prisma.directMessage.updateMany({
    where: {
      conversationId,
      senderUserId: { not: readerUserId },
      isRead: false,
    },
    data: { isRead: true },
  })
}

// ============================================================
// BLOCAGE
// ============================================================

export async function blockUser(blockerUserId: string, blockedUserId: string) {
  if (blockerUserId === blockedUserId) throw new Error('SELF_BLOCK')

  return prisma.$transaction(async (tx) => {
    // Créer le blocage
    await tx.block.upsert({
      where: { blockerUserId_blockedUserId: { blockerUserId, blockedUserId } },
      create: { blockerUserId, blockedUserId },
      update: {},
    })

    // Supprimer le contact s'il existe
    const [id1, id2] = [blockerUserId, blockedUserId].sort()
    await tx.contact.deleteMany({
      where: { userOneId: id1, userTwoId: id2 },
    })

    // Annuler les demandes en attente
    await tx.contactRequest.updateMany({
      where: {
        status: 'pending',
        OR: [
          { senderUserId: blockerUserId, receiverUserId: blockedUserId },
          { senderUserId: blockedUserId, receiverUserId: blockerUserId },
        ],
      },
      data: { status: 'rejected', respondedAt: new Date() },
    })
  })
}

export async function unblockUser(blockerUserId: string, blockedUserId: string) {
  return prisma.block.deleteMany({
    where: { blockerUserId, blockedUserId },
  })
}

export async function getBlockedUsers(userId: string) {
  return prisma.block.findMany({
    where: { blockerUserId: userId },
    include: {
      blocked: {
        include: {
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  })
}

// ============================================================
// SIGNALEMENT
// ============================================================

export async function createReport(params: {
  reporterUserId: string
  targetType: string
  targetId: string
  reasonKey: string
  detailsText?: string
}) {
  // Anti-spam : pas plus d'un signalement par cible par utilisateur dans les 24h
  const recentReport = await prisma.report.findFirst({
    where: {
      reporterUserId: params.reporterUserId,
      targetType: params.targetType as any,
      targetId: params.targetId,
      createdAt: { gte: new Date(Date.now() - 86400000) },
    },
  })
  if (recentReport) throw new Error('REPORT_ALREADY_SUBMITTED')

  return prisma.report.create({
    data: {
      reporterUserId: params.reporterUserId,
      targetType: params.targetType as any,
      targetId: params.targetId,
      reasonKey: params.reasonKey,
      detailsText: params.detailsText,
      status: 'pending',
    },
  })
}
