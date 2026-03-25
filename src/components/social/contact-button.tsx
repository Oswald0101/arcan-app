// src/components/social/contact-button.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  sendContactRequestAction,
  cancelContactRequestAction,
  respondToContactRequestAction,
  blockUserAction,
  reportAction,
} from '@/lib/social/actions'
import type { ReportReasonKey } from '@/types/social'
import { REPORT_REASONS, REPORT_REASON_LABELS } from '@/types/social'

interface ContactButtonProps {
  targetUserId: string
  targetUsername: string
  initialStatus: 'contact' | 'pending' | 'received' | null
  isBlocked: boolean
  onBlock?: () => void
}

export function ContactButton({
  targetUserId,
  targetUsername,
  initialStatus,
  isBlocked: initialIsBlocked,
  onBlock,
}: ContactButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(initialStatus)
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked)
  const [error, setError] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  function handleSendRequest() {
    setError(null)
    startTransition(async () => {
      const result = await sendContactRequestAction({ receiverUserId: targetUserId })
      if (result.success) setStatus('pending')
      else setError(result.error)
    })
  }

  function handleCancel(requestId?: string) {
    setError(null)
    startTransition(async () => {
      if (!requestId) return
      const result = await cancelContactRequestAction(requestId)
      if (result.success) setStatus(null)
      else setError(result.error)
    })
  }

  function handleAccept(requestId?: string) {
    setError(null)
    startTransition(async () => {
      if (!requestId) return
      const result = await respondToContactRequestAction(requestId, 'accept')
      if (result.success) setStatus('contact')
      else setError(result.error)
    })
  }

  function handleBlock() {
    setError(null)
    setShowBlockConfirm(false)
    startTransition(async () => {
      const result = await blockUserAction(targetUserId)
      if (result.success) {
        setIsBlocked(true)
        setStatus(null)
        onBlock?.()
      } else {
        setError(result.error)
      }
    })
  }

  if (isBlocked) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2">
        Membre bloqué
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Action principale selon le statut */}
      {status === null && (
        <button
          onClick={handleSendRequest}
          disabled={isPending}
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isPending ? 'Chargement…' : 'Demander en contact'}
        </button>
      )}

      {status === 'pending' && (
        <div className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-center text-muted-foreground">
          Demande envoyée
        </div>
      )}

      {status === 'received' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAccept()}
            disabled={isPending}
            className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            Accepter
          </button>
          <button
            onClick={() => handleCancel()}
            disabled={isPending}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            Refuser
          </button>
        </div>
      )}

      {status === 'contact' && (
        <div className="w-full rounded-xl bg-muted/40 border border-border px-4 py-2.5 text-sm text-center text-muted-foreground">
          En contact
        </div>
      )}

      {/* Actions secondaires */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowBlockConfirm(true)}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Bloquer
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Signaler
        </button>
      </div>

      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {/* Confirmation blocage */}
      {showBlockConfirm && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm font-medium">Bloquer @{targetUsername} ?</p>
          <p className="text-xs text-muted-foreground">
            Vous ne pourrez plus vous envoyer de messages ni voir vos profils mutuellement.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBlock}
              disabled={isPending}
              className="flex-1 rounded-lg bg-destructive px-3 py-2 text-xs font-medium text-destructive-foreground disabled:opacity-50"
            >
              Bloquer
            </button>
            <button
              onClick={() => setShowBlockConfirm(false)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal signalement */}
      {showReportModal && (
        <ReportModal
          targetUserId={targetUserId}
          targetUsername={targetUsername}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}

// ---- Modal de signalement ----

function ReportModal({
  targetUserId,
  targetUsername,
  onClose,
}: {
  targetUserId: string
  targetUsername: string
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [reason, setReason] = useState<ReportReasonKey | ''>('')
  const [details, setDetails] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!reason) return
    setError(null)
    startTransition(async () => {
      const result = await reportAction({
        targetType: 'user',
        targetId: targetUserId,
        reasonKey: reason,
        detailsText: details || undefined,
      })
      if (result.success) setDone(true)
      else setError(result.error)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-4">
      {done ? (
        <div className="space-y-3 text-center py-2">
          <p className="font-medium text-sm">Signalement envoyé</p>
          <p className="text-xs text-muted-foreground">Notre équipe de modération va examiner ça.</p>
          <button onClick={onClose} className="text-xs underline text-muted-foreground">Fermer</button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Signaler @{targetUsername}</p>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
          </div>
          <div className="space-y-2">
            {REPORT_REASONS.map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="reason"
                  value={key}
                  checked={reason === key}
                  onChange={() => setReason(key)}
                  className="accent-foreground"
                />
                {REPORT_REASON_LABELS[key]['fr']}
              </label>
            ))}
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Détails supplémentaires (optionnel)"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!reason || isPending}
            className="w-full rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
          >
            {isPending ? 'Envoi…' : 'Envoyer le signalement'}
          </button>
        </>
      )}
    </div>
  )
}
