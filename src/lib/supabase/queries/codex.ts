// src/lib/supabase/queries/codex.ts

import { prisma } from '@/lib/prisma'

export async function getUserCodex(userId: string) {
  const codex = await prisma.codex.findFirst({
    where: { ownerUserId: userId, codexType: 'personal', status: { not: 'archived' } },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  })
  if (!codex) return null
  return { ...codex, currentVersionData: codex.versions[0] ?? null }
}

export async function getCodexVersions(codexId: string, userId: string) {
  // Vérifier propriété
  const codex = await prisma.codex.findFirst({
    where: { id: codexId, ownerUserId: userId },
  })
  if (!codex) return null

  return prisma.codexVersion.findMany({
    where: { codexId },
    orderBy: { versionNumber: 'desc' },
    select: {
      id: true, versionNumber: true, title: true,
      summary: true, createdAt: true,
    },
  })
}

export async function getCodexVersion(versionId: string, userId: string) {
  const version = await prisma.codexVersion.findUnique({
    where: { id: versionId },
    include: { codex: true },
  })
  if (!version || version.codex.ownerUserId !== userId) return null
  return version
}

export async function createCodexVersion(params: {
  codexId: string
  userId: string
  title: string
  content: object
  summary?: string
}): Promise<{ id: string; versionNumber: number } | null> {
  const codex = await prisma.codex.findFirst({
    where: { id: params.codexId, ownerUserId: params.userId },
    select: { currentVersion: true },
  })
  if (!codex) return null

  const newVersion = codex.currentVersion + 1

  return prisma.$transaction(async (tx) => {
    const version = await tx.codexVersion.create({
      data: {
        codexId: params.codexId,
        versionNumber: newVersion,
        title: params.title,
        content: params.content,
        summary: params.summary ?? null,
        createdByType: 'member',
        createdByUserId: params.userId,
      },
    })

    await tx.codex.update({
      where: { id: params.codexId },
      data: { currentVersion: newVersion, updatedAt: new Date() },
    })

    return { id: version.id, versionNumber: newVersion }
  })
}
