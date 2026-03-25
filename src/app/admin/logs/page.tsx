// src/app/admin/logs/page.tsx
import { getAuditLogs } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Logs d\'audit' }

interface PageProps {
  searchParams: Promise<{ page?: string; action?: string }>
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  await requireAdmin('logs', 'read')
  const params = await searchParams

  const logs = await getAuditLogs({
    page: Number(params.page ?? 1),
    limit: 50,
    actionKey: params.action,
  })

  // Couleurs par catégorie d'action
  const getActionColor = (key: string) => {
    if (key.includes('ban'))     return 'text-red-600'
    if (key.includes('suspend')) return 'text-orange-600'
    if (key.includes('verify'))  return 'text-blue-600'
    if (key.includes('approve')) return 'text-green-600'
    if (key.includes('reject'))  return 'text-muted-foreground'
    if (key.includes('report'))  return 'text-amber-600'
    return 'text-foreground'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Logs d&apos;audit</h1>
        <form>
          <input
            name="action"
            defaultValue={params.action}
            placeholder="Filtrer par action…"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cible</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Admin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <span className={`font-mono text-xs ${getActionColor(log.actionKey)}`}>
                    {log.actionKey}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {log.targetType ? `${log.targetType} · ${log.targetId?.slice(0, 8)}…` : '—'}
                </td>
                <td className="px-4 py-3 text-xs">
                  {log.actor?.profile?.username ? `@${log.actor.profile.username}` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('fr', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
