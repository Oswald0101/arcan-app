// src/lib/ai/memory/index.ts
// Mémoire personnelle du guide — aligné sur schema.prisma réel

import { prisma } from '@/lib/prisma'
import { complete } from '@/lib/ai/providers'
import type { MemoryType } from '@/types/guide'

const MAX_MEMORY_ITEMS = 30
const MIN_IMPORTANCE_TO_KEEP = 0.3

export async function loadActiveMemory(userId: string, guideId: string, limit = 15) {
  return prisma.guideMemoryItem.findMany({
    where: { userId, guideId, isActive: true },
    orderBy: [{ importanceScore: 'desc' }, { updatedAt: 'desc' }],
    take: limit,
  })
}

export async function upsertMemoryItem(params: {
  userId: string
  guideId: string
  memoryType: MemoryType
  memoryKey: string
  memoryValue: string
  importanceScore: number
  sourceMessageId?: string
}) {
  // findFirst + update/create (pas de @unique sur userId+guideId+memoryKey dans le schema)
  const existing = await prisma.guideMemoryItem.findFirst({
    where: { userId: params.userId, guideId: params.guideId, memoryKey: params.memoryKey, isActive: true },
  })

  let item
  if (existing) {
    item = await prisma.guideMemoryItem.update({
      where: { id: existing.id },
      data: {
        memoryValue: params.memoryValue,
        importanceScore: params.importanceScore,
        sourceMessageId: params.sourceMessageId ?? null,
        updatedAt: new Date(),
      },
    })
  } else {
    item = await prisma.guideMemoryItem.create({
      data: {
        userId: params.userId,
        guideId: params.guideId,
        memoryType: params.memoryType,
        memoryKey: params.memoryKey,
        memoryValue: params.memoryValue,
        importanceScore: params.importanceScore,
        sourceMessageId: params.sourceMessageId ?? null,
        isActive: true,
      },
    })
  }

  await pruneMemory(params.userId, params.guideId)
  return item
}

async function pruneMemory(userId: string, guideId: string): Promise<void> {
  const all = await prisma.guideMemoryItem.findMany({
    where: { userId, guideId, isActive: true },
    orderBy: { importanceScore: 'desc' },
  })

  if (all.length <= MAX_MEMORY_ITEMS) return

  const toDeactivate = all
    .slice(MAX_MEMORY_ITEMS)
    .filter((item: any) => Number(item.importanceScore) < MIN_IMPORTANCE_TO_KEEP)
    .map((item: any) => item.id)

  if (toDeactivate.length > 0) {
    await prisma.guideMemoryItem.updateMany({
      where: { id: { in: toDeactivate } },
      data: { isActive: false },
    })
  }
}

const MEMORY_EXTRACTION_PROMPT = `Tu es un système de mémoire pour un guide IA de croissance personnelle.

ÉCHANGES RÉCENTS :
{MESSAGES}

MÉMOIRE EXISTANTE (à ne pas dupliquer) :
{EXISTING_MEMORY}

MISSION :
Identifie les éléments vraiment mémorables dans ces échanges.

Retourne UNIQUEMENT un JSON valide (tableau vide si rien) :
[
  {
    "memoryType": "commitment|struggle|progress|preference|context|keyword|warning",
    "memoryKey": "clé courte snake_case",
    "memoryValue": "phrase concise (max 100 chars)",
    "importanceScore": 0.1
  }
]

RÈGLES : Max 5 items. Seulement ce qui est durable. Ne pas dupliquer l'existant.
importanceScore: 0.8-1.0 = engagements/vigilances, 0.5-0.7 = contexte, 0.3-0.5 = préférences`

export async function extractMemoryFromMessages(params: {
  messages: { role: string; content: string }[]
  existingMemory: any[]
}): Promise<Array<{ memoryType: MemoryType; memoryKey: string; memoryValue: string; importanceScore: number }>> {
  if (params.messages.length < 4) return []

  const messagesText = params.messages.slice(-10)
    .map((m) => `${m.role === 'user' ? 'Membre' : 'Guide'}: ${m.content}`)
    .join('\n')

  const existingText = params.existingMemory.length > 0
    ? params.existingMemory.map((m: any) => `[${m.memoryKey}] ${m.memoryValue}`).join('\n')
    : 'Aucune mémoire existante'

  const prompt = MEMORY_EXTRACTION_PROMPT
    .replace('{MESSAGES}', messagesText)
    .replace('{EXISTING_MEMORY}', existingText)

  try {
    const result = await complete({
      systemPrompt: 'Tu es un système de mémoire. Réponds uniquement en JSON valide.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 512,
    })
    const cleaned = result.content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item: any) =>
      item.memoryType && item.memoryKey && item.memoryValue && typeof item.importanceScore === 'number'
    )
  } catch {
    return []
  }
}

export async function refreshMemorySummary(guideId: string, userId: string): Promise<void> {
  const items = await loadActiveMemory(userId, guideId, 20)
  if (items.length === 0) return

  const summary = items
    .sort((a: any, b: any) => Number(b.importanceScore) - Number(a.importanceScore))
    .slice(0, 10)
    .map((item: any) => `[${item.memoryType}] ${item.memoryValue}`)
    .join(' | ')

  await prisma.guide.update({
    where: { id: guideId },
    data: { memorySummary: summary, updatedAt: new Date() },
  })
}
