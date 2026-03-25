// src/lib/admin/permissions/index.ts
// RBAC backend — vérifié côté serveur, jamais côté frontend seul

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import type { AdminRoleKey, AdminPermissions } from '@/types/admin'
import { redirect } from 'next/navigation'

// ============================================================
// MAP DES PERMISSIONS PAR RÔLE
// ============================================================

const ROLE_PERMISSIONS: Record<AdminRoleKey, AdminPermissions> = {
  super_admin: {
    all: ['*'],
  },
  admin: {
    members:      ['read', 'suspend', 'ban', 'warn', 'reactivate'],
    paths:        ['read', 'suspend', 'delete'],
    reports:      ['read', 'resolve', 'assign'],
    verification: ['read', 'approve', 'reject'],
    billing:      ['read'],
    logs:         ['read'],
    settings:     ['read'],
  },
  moderator: {
    members:  ['read', 'warn', 'suspend'],
    paths:    ['read', 'suspend'],
    reports:  ['read', 'resolve'],
    logs:     ['read'],
  },
  support: {
    members:  ['read'],
    reports:  ['read'],
    billing:  ['read'],
  },
}

// ============================================================
// VÉRIFICATION DE PERMISSION
// ============================================================

function hasPermission(
  permissions: AdminPermissions,
  domain: keyof Omit<AdminPermissions, 'all'>,
  action: string,
): boolean {
  // Super admin = accès total
  if (permissions.all?.includes('*')) return true
  const domainPerms = permissions[domain] ?? []
  return domainPerms.includes(action) || domainPerms.includes('*')
}

// ============================================================
// RÉCUPÉRER LES PERMISSIONS DE L'UTILISATEUR COURANT
// ============================================================

export async function getAdminContext(): Promise<{
  userId: string
  roleKey: AdminRoleKey
  permissions: AdminPermissions
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Récupérer le rôle admin actif
  const adminRole = await prisma.userAdminRole.findFirst({
    where: { userId: user.id, isActive: true },
    include: { adminRole: true },
  })

  if (!adminRole) return null

  const roleKey = adminRole.adminRole.roleKey as AdminRoleKey
  const permissions = ROLE_PERMISSIONS[roleKey] ?? {}

  return { userId: user.id, roleKey, permissions }
}

// ============================================================
// GUARDS — pour les Server Components et Server Actions
// ============================================================

// Vérifie l'accès admin — redirige si non autorisé
export async function requireAdmin(
  domain?: keyof Omit<AdminPermissions, 'all'>,
  action?: string,
) {
  const ctx = await getAdminContext()
  if (!ctx) redirect('/auth/login')

  if (domain && action) {
    if (!hasPermission(ctx.permissions, domain, action)) {
      redirect('/admin?error=forbidden')
    }
  }

  return ctx
}

// Vérification inline (pour les Server Actions)
export async function checkAdminPermission(
  domain: keyof Omit<AdminPermissions, 'all'>,
  action: string,
): Promise<{ allowed: boolean; userId: string | null }> {
  const ctx = await getAdminContext()
  if (!ctx) return { allowed: false, userId: null }
  return {
    allowed: hasPermission(ctx.permissions, domain, action),
    userId: ctx.userId,
  }
}

// ============================================================
// AUDIT LOG — écriture d'un log d'action sensible
// ============================================================

export async function writeAuditLog(params: {
  actorUserId: string
  actionKey: string
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actorType: 'admin',
      actionKey: params.actionKey,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata ?? {},
    },
  })
}
