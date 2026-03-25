// src/components/admin/report-actions.tsx
'use client'

import { useState, useTransition } from 'react'
import { resolveReportAction } from '@/lib/admin/actions'

interface ReportActionsProps {
  report: { id: string; targetType: string; targetId: string; status: string }
}

export function ReportActions({ report }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)
  const [resolution, setResolution] = useState<string>('no_action')
  const [note, setNote] = useState('')
  const [targetAction, setTargetAction] = useState<string>('')
  const [targetReason, setTargetReason] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (done) {
    return <span className="text-xs text-muted-foreground">Traité</span>
  }

  if (['resolved_no_action', 'resolved_action_taken', 'dismissed'].includes(report.status)) {
    return <span className="text-xs text-muted-foreground">Résolu</span>
  }

  function handleResolve() {
    setError(null)
    startTransition(async () => {
      const result = await resolveReportAction({
        reportId: report.id,
        resolution: resolution as any,
        moderatorNote: note || undefined,
        targetAction: (targetAction || undefined) as any,
        targetActionReason: targetReason || undefined,
      })
      if (result.success) setDone(true)
      else setError(result.error)
    })
  }

  const targetActions = report.targetType === 'user'
    ? [
        { value: 'warn', label: 'Avertissement' },
        { value: 'suspend', label: 'Suspendre' },
        { value: 'ban', label: 'Bannir' },
      ]
    : report.targetType === 'path'
    ? [
        { value: 'path_suspended', label: 'Suspendre la voie' },
        { value: 'content_removed', label: 'Supprimer le contenu' },
      ]
    : []

  return (
    <div>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
        >
          Traiter
        </button>
      ) : (
        <div className="min-w-[240px] rounded-xl border border-border bg-background p-3 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Résolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
            >
              <option value="no_action">Sans action sur la cible</option>
              <option value="action_taken">Action prise</option>
              <option value="dismissed">Rejeter le signalement</option>
            </select>
          </div>

          {targetActions.length > 0 && resolution === 'action_taken' && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Action sur la cible</label>
                <select
                  value={targetAction}
                  onChange={(e) => setTargetAction(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                >
                  <option value="">— aucune action spécifique —</option>
                  {targetActions.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              {targetAction && (
                <input
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  placeholder="Raison de l'action"
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                />
              )}
            </>
          )}

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note modérateur (optionnel)"
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleResolve}
              disabled={isPending}
              className="flex-1 rounded-lg bg-foreground px-2 py-1.5 text-xs font-medium text-background disabled:opacity-50"
            >
              {isPending ? '…' : 'Valider'}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
