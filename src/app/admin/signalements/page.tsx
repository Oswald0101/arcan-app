// src/app/admin/signalements/page.tsx
import { getAdminReports } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import { ReportActions } from '@/components/admin/report-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Signalements' }

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; type?: string }>
}

export default async function AdminSignalementsPage({ searchParams }: PageProps) {
  await requireAdmin('reports', 'read')
  const params = await searchParams

  const { reports, total, pages } = await getAdminReports({
    page: Number(params.page ?? 1),
    limit: 25,
    status: params.status,
    targetType: params.type,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Signalements</h1>
          <p className="text-sm text-muted-foreground">{total} en attente de traitement</p>
        </div>
        <form className="flex gap-2">
          <select
            name="status"
            defaultValue={params.status ?? ''}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="">Non résolus</option>
            <option value="pending">En attente</option>
            <option value="under_review">En cours</option>
            <option value="resolved_no_action">Résolu - sans action</option>
            <option value="resolved_action_taken">Résolu - action prise</option>
            <option value="dismissed">Rejeté</option>
          </select>
          <select
            name="type"
            defaultValue={params.type ?? ''}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="">Tous les types</option>
            <option value="user">Membre</option>
            <option value="path">Voie</option>
            <option value="direct_message">Message</option>
          </select>
          <button type="submit" className="rounded-lg bg-foreground px-3 py-2 text-sm text-background">
            Filtrer
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            Aucun signalement en attente
          </div>
        ) : (
          reports.map((report: any) => (
            <div key={report.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {report.targetType === 'user'
                        ? `@${report.targetInfo.username ?? report.targetId.slice(0, 8)}`
                        : report.targetType === 'path'
                        ? `Voie : ${report.targetInfo.pathName ?? report.targetId.slice(0, 8)}`
                        : `${report.targetType} : ${report.targetId.slice(0, 8)}`}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{report.targetType}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Raison : <strong>{report.reasonKey}</strong>
                    {report.detailsText && ` — ${report.detailsText.slice(0, 80)}${report.detailsText.length > 80 ? '…' : ''}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signalé par @{report.reporterUsername} · {new Date(report.createdAt).toLocaleDateString('fr')}
                  </p>
                </div>
                <ReportActions report={report} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
