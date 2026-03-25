// src/types/admin.ts

export type AdminRoleKey = 'super_admin' | 'admin' | 'moderator' | 'support'

export interface AdminPermissions {
  members?:      string[]
  paths?:        string[]
  reports?:      string[]
  verification?: string[]
  billing?:      string[]
  logs?:         string[]
  admins?:       string[]
  settings?:     string[]
  all?:          string[]
}

export const ROLE_PERMISSIONS: Record<AdminRoleKey, AdminPermissions> = {
  super_admin: { all: ['*'] },
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

export function hasPermission(
  permissions: AdminPermissions,
  domain: keyof Omit<AdminPermissions, 'all'>,
  action: string,
): boolean {
  if (permissions.all?.includes('*')) return true
  const domainPerms = permissions[domain] ?? []
  return domainPerms.includes(action) || domainPerms.includes('*')
}

// Correspond exactement au retour de getDashboardStats() dans admin/queries/index.ts
export interface DashboardStats {
  totalMembers: number
  newMembersLast7Days: number
  totalPaths: number
  totalCircles: number
  activeSubscriptions: number
  recentPurchases: number
  openReports: number
  pendingVerifications: number
  pendingMemberships: number
  recentInviteActivations: number
}

export interface AdminMemberView {
  id: string
  role: string
  accountStatus: string
  createdAt: Date
  lastLoginAt: Date | null
  profile: {
    username: string
    displayName: string | null
    avatarUrl: string | null
    verificationStatus: string
    currentLevel: number
    onboardingCompleted: boolean
  } | null
  subscriptionStatus: string | null
  reportsCount: number
}

export interface AdminPathView {
  id: string
  slug: string
  name: string
  canonicalType: string
  status: string
  visibility: string
  memberCount: number
  createdAt: Date
  founderUsername: string | null
}

export interface AdminReportView {
  id: string
  reporterUsername: string | null
  targetType: string
  targetId: string
  reasonKey: string
  detailsText: string | null
  status: string
  assignedTo: string | null
  createdAt: Date
  resolvedAt: Date | null
}

export type ModerationActionType =
  | 'warning' | 'content_removed' | 'suspend' | 'ban'
  | 'path_suspended' | 'path_deleted'

export interface ModerationInput {
  targetType: 'user' | 'path'
  targetId: string
  actionType: ModerationActionType
  reasonText: string
  reportId?: string
}
