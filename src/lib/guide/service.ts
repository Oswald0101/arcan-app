// src/lib/guide/service.ts
// Service central du Guide IA — orchestre context + prompt + IA + mémoire

import { buildGuideContext } from '@/lib/ai/context'
import { buildSystemPrompt } from '@/lib/ai/prompts/guide-system'
import { complete } from '@/lib/ai/providers'
import {
  loadActiveMemory,
  extractMemoryFromMessages,
  upsertMemoryItem,
  refreshMemorySummary,
} from '@/lib/ai/memory'
import {
  checkInputSafety,
  checkOutputSafety,
  getCrisisResponse,
  getBlockResponse,
} from '@/lib/ai/safety'
import {
  getOrCreateConversation,
  saveMessage,
  touchConversation,
  getConversationMessageCount,
} from '@/lib/supabase/queries/guide'
import { prisma } from '@/lib/prisma'
import type { ChatRequest, ChatResponse } from '@/types/guide'

// Tous les N messages, on tente d'extraire de la mémoire
const MEMORY_EXTRACTION_INTERVAL = 6

export async function processGuideMessage(
  userId: string,
  guideId: string,
  request: ChatRequest,
  language: string = 'fr',
): Promise<ChatResponse> {

  // 1. Vérifier les garde-fous sur l'input
  const safetyCheck = checkInputSafety(request.message)

  if (!safetyCheck.safe) {
    // Créer/récupérer la conversation pour logguer quand même
    const conv = await getOrCreateConversation({
      userId,
      guideId,
      conversationId: request.conversationId,
    })

    // Sauvegarder le message du membre
    await saveMessage({
      conversationId: conv.id,
      senderType: 'member',
      content: request.message,
      metadata: { safety_flagged: true, safety_level: safetyCheck.level },
    })

    // Réponse de sécurité appropriée
    const safeResponse =
      safetyCheck.level === 'concern'
        ? getCrisisResponse(language)
        : getBlockResponse(language)

    const responseMsg = await saveMessage({
      conversationId: conv.id,
      senderType: 'guide',
      content: safeResponse,
      metadata: { safety_response: true },
    })

    await touchConversation(conv.id)

    return {
      conversationId: conv.id,
      messageId: responseMsg.id,
      content: safeResponse,
    }
  }

  // 2. Créer ou récupérer la conversation
  const conversation = await getOrCreateConversation({
    userId,
    guideId,
    conversationId: request.conversationId,
  })

  // 3. Sauvegarder le message du membre en base
  const memberMessage = await saveMessage({
    conversationId: conversation.id,
    senderType: 'member',
    content: request.message,
  })

  // 4. Construire le contexte complet (en parallèle avec la sauvegarde)
  const context = await buildGuideContext(
    userId,
    guideId,
    conversation.id,
    20, // derniers 20 messages
  )

  // 5. Construire le prompt système
  const systemPrompt = buildSystemPrompt(context)

  // 6. Préparer l'historique pour l'IA
  // On exclut le dernier message (déjà ajouté dans recentMessages via buildGuideContext)
  // mais comme on vient de sauvegarder, l'historique ne l'inclut pas encore
  const messages = [
    ...context.recentMessages,
    { role: 'user' as const, content: request.message },
  ]

  // 7. Appel IA
  const aiResult = await complete({
    systemPrompt,
    messages,
    maxTokens: 1024,
  })

  // 8. Vérification de la réponse générée
  let responseContent = aiResult.content
  if (!checkOutputSafety(responseContent)) {
    responseContent = getBlockResponse(language)
  }

  // 9. Sauvegarder la réponse du guide
  const guideMessage = await saveMessage({
    conversationId: conversation.id,
    senderType: 'guide',
    content: responseContent,
    inputTokens: aiResult.inputTokens,
    outputTokens: aiResult.outputTokens,
    modelUsed: aiResult.model,
  })

  // 10. Toucher la conversation (updatedAt + auto-titre)
  const isFirstMessage = context.recentMessages.length === 0
  await touchConversation(
    conversation.id,
    isFirstMessage ? request.message : undefined,
  )

  // 11. Extraction mémoire asynchrone (toutes les N paires de messages)
  // Ne bloque pas la réponse — s'exécute en background
  const messageCount = await getConversationMessageCount(conversation.id)
  if (messageCount % MEMORY_EXTRACTION_INTERVAL === 0 && messageCount > 0) {
    // Fire and forget — on ne bloque pas l'utilisateur
    extractAndSaveMemory(userId, guideId, conversation.id, context.activeMemoryItems).catch(
      (err) => console.error('[Memory extraction error]', err),
    )
  }

  return {
    conversationId: conversation.id,
    messageId: guideMessage.id,
    content: responseContent,
  }
}

// ---- Extraction mémoire asynchrone ----

async function extractAndSaveMemory(
  userId: string,
  guideId: string,
  conversationId: string,
  existingMemory: any[],
): Promise<void> {
  const recentMessages = await prisma.guideMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { senderType: true, content: true },
  })

  const formattedMessages = recentMessages
    .reverse()
    .map((m: { senderType: string; content: string }) => ({
      role: m.senderType === 'member' ? 'user' : 'assistant',
      content: m.content,
    }))

  const extracted = await extractMemoryFromMessages({
    messages: formattedMessages,
    existingMemory,
  })

  for (const item of extracted) {
    await upsertMemoryItem({
      userId,
      guideId,
      memoryType: item.memoryType,
      memoryKey: item.memoryKey,
      memoryValue: item.memoryValue,
      importanceScore: item.importanceScore,
    })
  }

  if (extracted.length > 0) {
    await refreshMemorySummary(guideId, userId)
  }
}
