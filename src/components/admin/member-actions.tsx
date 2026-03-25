// src/components/admin/member-actions.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  suspendMemberAction,
  banMemberAction,
  reactivateMemberAction,
} from '@/lib/admin/actions'

interface MemberActionsProps {
  userId: string
  currentStatus: string
}

export function MemberActions({ userId, currentStatus }: MemberActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)
  const [showModal, setShowModal] = useState<'suspend' | 'ban' | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAction(action: 'suspend' | 'ban') {
    if (!reason.trim()) return
    setError(null)
    startTransition(async () => {
      const fn = action === 'suspend' ? suspendMemberAction : banMemberAction
      const result = await fn({ userId, reason })
      if (result.success) {
        setStatus(action === 'suspend' ? 'suspended' : 'banned')
        setShowModal(null)
        setReason('')
      } else {
        setError(result.error)
      }
    })
  }

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateMemberAction(userId)
      if (result.success) setStatus('active')
    })
  }

  return (
    <div className="relative">
      <div className="flex gap-1.5">
        <a href={`/admin/membres/${userId}`} className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
          Voir
        </a>
        {(status === 'suspended' || status === 'banned') && (
          <button
            onClick={handleReactivate}
            disabled={isPending}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
          >
            Réactiver
          </button>
        )}
        {status === 'active' && (
          <>
            <button
              onClick={() => setShowModal('suspend')}
              className="rounded-lg border border-orange-500/30 px-2.5 py-1.5 text-xs text-orange-600 hover:bg-orange-500/10"
            >
              Suspendre
            </button>
            <button
              onClick={() => setShowModal('ban')}
              className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10"
            >
              Bannir
            </button>
          </>
        )}
      </div>

      {/* Modal raison */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-border bg-background p-5 w-full max-w-sm space-y-4">
            <h3 className="font-medium">
              {showModal === 'suspend' ? 'Suspendre ce membre' : 'Bannir ce membre'}
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison (obligatoire)"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(showModal)}
                disabled={!reason.trim() || isPending}
                className="flex-1 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                {isPending ? 'Chargement…' : 'Confirmer'}
              </button>
              <button
                onClick={() => { setShowModal(null); setReason('') }}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
