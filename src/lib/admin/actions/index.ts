// src/lib/admin/actions/index.ts
// Server Actions admin — toutes les mutations sensibles

'use server'

import { prisma } from '@/lib/prisma'
import { checkAdminPermission, writeAuditLog } from '@/lib/admin/permissions'
import { z } from 'zod'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// GESTION MEMBRES
// ============================================================

const MemberActionSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  expiresAt: z.string().datetime().optional(),
})

export async function suspendMemberAction(
  input: z.infer<typeof MemberActionSchema>,
): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('members', 'suspend')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  const parsed = MemberActionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: parsed.data.userId },
        data: { accountStatus: 'suspended', updatedAt: new Date() },
      })

      await tx.moderationAction.create({
        data: {
          moderatorUserId: adminId,
          targetType: 'user',
          targetId: parsed.data.userId,
          actionType: 'suspend',
          reasonText: parsed.data.reason,
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        },
      })
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'member.suspend',
      targetType: 'user',
      targetId: parsed.data.userId,
      metadata: { reason: parsed.data.reason },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la suspension' }
  }
}

export async function banMemberAction(
  input: z.infer<typeof MemberActionSchema>,
): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('members', 'ban')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  const parsed = MemberActionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: parsed.data.userId },
        data: { accountStatus: 'banned', updatedAt: new Date() },
      })

      await tx.moderationAction.create({
        data: {
          moderatorUserId: adminId,
          targetType: 'user',
          targetId: parsed.data.userId,
          actionType: 'ban',
          reasonText: parsed.data.reason,
        },
      })
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'member.ban',
      targetType: 'user',
      targetId: parsed.data.userId,
      metadata: { reason: parsed.data.reason },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors du bannissement' }
  }
}

export async function reactivateMemberAction(userId: string): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('members', 'reactivate')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'active', updatedAt: new Date() },
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'member.reactivate',
      targetType: 'user',
      targetId: userId,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la réactivation' }
  }
}

// ============================================================
// GESTION VOIES
// ============================================================

const PathActionSchema = z.object({
  pathId: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export async function suspendPathAction(
  input: z.infer<typeof PathActionSchema>,
): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('paths', 'suspend')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  const parsed = PathActionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.path.update({
        where: { id: parsed.data.pathId },
        data: { status: 'suspended', updatedAt: new Date() },
      })

      await tx.moderationAction.create({
        data: {
          moderatorUserId: adminId,
          targetType: 'path',
          targetId: parsed.data.pathId,
          actionType: 'path_suspended',
          reasonText: parsed.data.reason,
        },
      })
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'path.suspend',
      targetType: 'path',
      targetId: parsed.data.pathId,
      metadata: { reason: parsed.data.reason },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la suspension de la voie' }
  }
}

export async function restorePathAction(pathId: string): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('paths', 'suspend')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  try {
    await prisma.path.update({
      where: { id: pathId },
      data: { status: 'active', updatedAt: new Date() },
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'path.restore',
      targetType: 'path',
      targetId: pathId,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur' }
  }
}

// ============================================================
// SIGNALEMENTS / MODÉRATION
// ============================================================

const ResolveReportSchema = z.object({
  reportId: z.string().uuid(),
  resolution: z.enum(['no_action', 'action_taken', 'dismissed']),
  moderatorNote: z.string().max(500).optional(),
  // Action optionnelle sur la cible
  targetAction: z.enum(['warn', 'suspend', 'ban', 'content_removed', 'path_suspended']).optional(),
  targetActionReason: z.string().max(500).optional(),
})

export async function resolveReportAction(
  input: z.infer<typeof ResolveReportSchema>,
): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('reports', 'resolve')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  const parsed = ResolveReportSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  const { reportId, resolution, moderatorNote, targetAction, targetActionReason } = parsed.data

  try {
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { success: false, error: 'Signalement introuvable' }

    await prisma.$transaction(async (tx) => {
      // Résoudre le signalement
      const statusMap = {
        no_action: 'resolved_no_action',
        action_taken: 'resolved_action_taken',
        dismissed: 'dismissed',
      }
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: statusMap[resolution] as any,
          moderatorNote: moderatorNote ?? null,
          resolvedAt: new Date(),
          assignedTo: adminId,
        },
      })

      // Action sur la cible si demandée
      if (targetAction && targetActionReason) {
        await tx.moderationAction.create({
          data: {
            moderatorUserId: adminId,
            reportId,
            targetType: report.targetType,
            targetId: report.targetId,
            actionType: targetAction,
            reasonText: targetActionReason,
          },
        })

        // Appliquer l'action selon le type
        if (report.targetType === 'user') {
          if (targetAction === 'suspend') {
            await tx.user.update({
              where: { id: report.targetId },
              data: { accountStatus: 'suspended' },
            })
          } else if (targetAction === 'ban') {
            await tx.user.update({
              where: { id: report.targetId },
              data: { accountStatus: 'banned' },
            })
          }
        } else if (report.targetType === 'path') {
          if (targetAction === 'path_suspended') {
            await tx.path.update({
              where: { id: report.targetId },
              data: { status: 'suspended' },
            })
          }
        }
      }
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: 'report.resolve',
      targetType: 'report',
      targetId: reportId,
      metadata: { resolution, targetAction, targetActionReason },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors du traitement du signalement' }
  }
}

// ============================================================
// VÉRIFICATION DE COMPTE
// ============================================================

const VerificationActionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reviewerNote: z.string().max(300).optional(),
})

export async function handleVerificationAction(
  input: z.infer<typeof VerificationActionSchema>,
): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('verification', 'approve')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  const parsed = VerificationActionSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Données invalides' }

  const { requestId, action, reviewerNote } = parsed.data

  try {
    const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } })
    if (!request) return { success: false, error: 'Demande introuvable' }

    await prisma.$transaction(async (tx) => {
      await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewerUserId: adminId,
          reviewerNote: reviewerNote ?? null,
          reviewedAt: new Date(),
        },
      })

      if (action === 'approve') {
        const badge = request.requestType === 'founder'
          ? 'founder_verified'
          : 'verified'

        await tx.profile.update({
          where: { userId: request.userId },
          data: { verificationStatus: badge as any, updatedAt: new Date() },
        })
      }
    })

    await writeAuditLog({
      actorUserId: adminId,
      actionKey: `verification.${action}`,
      targetType: 'user',
      targetId: request.userId,
      metadata: { requestId, reviewerNote },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors du traitement de la vérification' }
  }
}

// ============================================================
// NOTES ADMIN INTERNES
// ============================================================

export async function addAdminNoteAction(params: {
  targetType: string
  targetId: string
  content: string
}): Promise<ActionResult> {
  const { allowed, userId: adminId } = await checkAdminPermission('members', 'read')
  if (!allowed || !adminId) return { success: false, error: 'Non autorisé' }

  try {
    await prisma.adminNote.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        authorUserId: adminId,
        content: params.content,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur' }
  }
}
