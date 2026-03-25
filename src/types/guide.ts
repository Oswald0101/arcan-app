// src/types/guide.ts
// Types complets du module Guide IA

export type GuideTone =
  | 'direct' | 'doux' | 'philosophique' | 'stoique'
  | 'mystique' | 'socratique' | 'solennel' | 'fraternel'
  | 'sobre' | 'inspirant'

export type GuideAddressMode = 'tutoiement' | 'vouvoiement'
export type MemoryType =
  | 'commitment'   // engagement pris
  | 'struggle'     // difficulté récurrente
  | 'progress'     // progrès notable
  | 'preference'   // préférence exprimée
  | 'context'      // contexte de vie durable
  | 'keyword'      // mot-clé fort extrait
  | 'warning'      // point de vigilance

export type SenderType = 'member' | 'guide' | 'system'
export type ConversationStatus = 'active' | 'archived'

// ---- Guide ----

export interface Guide {
  id: string
  ownerUserId: string
  pathId: string | null
  canonicalType: string
  customTypeLabel: string | null
  name: string
  memberName: string | null
  tone: GuideTone
  addressMode: GuideAddressMode
  firmnessLevel: number      // 1-5
  warmthLevel: number        // 1-5
  symbolicIdentity: string | null
  avatarAssetUrl: string | null
  personalityPrompt: string
  memorySummary: string | null
  currentVersion: number
}

// ---- Conversations ----

export interface GuideConversation {
  id: string
  userId: string
  guideId: string
  title: string | null
  status: ConversationStatus
  createdAt: Date
  updatedAt: Date
}

export interface GuideMessage {
  id: string
  conversationId: string
  senderType: SenderType
  content: string
  inputTokens: number | null
  outputTokens: number | null
  modelUsed: string | null
  metadata: Record<string, unknown>
  createdAt: Date
}

// ---- Mémoire ----

export interface GuideMemoryItem {
  id: string
  userId: string
  guideId: string
  memoryType: MemoryType
  memoryKey: string
  memoryValue: string
  importanceScore: number   // 0.0-1.0
  sourceMessageId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ---- Base de connaissances ----

export interface KnowledgeSnippet {
  category: string
  content: string
}

// ---- Contexte construit avant chaque réponse ----

export interface GuideContext {
  guide: Guide
  memberName: string
  pathName: string
  pathType: string
  pathId: string | null
  manifestoText: string | null
  principles: string[]
  sensitivityScores: Record<string, number>
  platformLevel: number
  platformXp: number
  streakDays: number
  activeMemoryItems: GuideMemoryItem[]
  recentMessages: { role: 'user' | 'assistant'; content: string }[]
  // Couche cerveau mère — savoirs pertinents récupérés au moment de l'échange
  knowledgeEntries: KnowledgeSnippet[]
}

// ---- Chat request / response ----

export interface ChatRequest {
  conversationId: string | null  // null = nouvelle conversation
  message: string
}

export interface ChatResponse {
  conversationId: string
  messageId: string
  content: string
  newMemoryItems?: GuideMemoryItem[]
}

// ---- Provider abstraction ----

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AICompletionParams {
  systemPrompt: string
  messages: AIMessage[]
  maxTokens?: number
  temperature?: number
}

export interface AICompletionResult {
  content: string
  inputTokens: number
  outputTokens: number
  model: string
}
