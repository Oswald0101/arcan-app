// src/components/admin/verification-actions.tsx
'use client'

import { useState, useTransition } from 'react'
import { handleVerificationAction } from '@/lib/admin/actions'

interface VerificationActionsProps {
  requestId: string
  username: string
}

export function VerificationActions({ requestId, username }: VerificationActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAction(action: 'approve' | 'reject') {
    setError(null)
    startTransition(async () => {
      const result = await handleVerificationAction({
        requestId,
        action,
        reviewerNote: note || undefined,
      })
      if (result.success) {
        setDone(action === 'approve' ? 'approved' : 'rejected')
      } else {
        setError(result.error)
      }
    })
  }

  if (done) {
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        done === 'approved'
          ? 'bg-green-500/10 text-green-700'
          : 'bg-muted text-muted-foreground'
      }`}>
        {done === 'approved' ? '✓ Approuvé' : 'Refusé'}
      </span>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <button
          onClick={() => handleAction('approve')}
          disabled={isPending}
          className="rounded-lg bg-green-500/10 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-500/20 disabled:opacity-50"
        >
          Approuver
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={isPending}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
        >
          Refuser
        </button>
        <button
          onClick={() => setShowNote(!showNote)}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
        >
          Note
        </button>
      </div>
      {showNote && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note interne (optionnel)"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
