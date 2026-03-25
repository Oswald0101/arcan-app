// src/types/codex.ts

export type CodexType = 'personal' | 'path' | 'collective'
export type CodexStatus = 'draft' | 'published' | 'archived'

export interface Codex {
  id: string
  codexType: CodexType
  ownerUserId: string | null
  title: string
  status: CodexStatus
  currentVersion: number
  isExportable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CodexVersion {
  id: string
  codexId: string
  versionNumber: number
  title: string
  summary: string | null
  content: CodexContent
  createdByType: string
  createdByUserId: string | null
  createdAt: Date
}

export interface CodexContent {
  raw_markdown?: string
  sections?: CodexSection[]
}

export interface CodexSection {
  title: string
  content?: string
  order: number
}

export interface CodexWithVersion extends Codex {
  currentVersionData: CodexVersion | null
  path: { name: string; slug: string } | null
}
