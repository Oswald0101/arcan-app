// src/components/cercle/join-path-button.tsx
'use client'

import { useTransition, useState } from 'react'
import { joinPathAction, leavePathAction } from '@/lib/paths/actions'

interface JoinPathButtonProps {
  pathId: string
  admissionMode: string
  currentStatus: string | null
  isPrivate: boolean
}

export function JoinPathButton({
  pathId,
  admissionMode,
  currentStatus,
  isPrivate,
}: JoinPathButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)
  const [error, setError] = useState<string | null>(null)

  if (isPrivate && !status) return null

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const result = await joinPathAction(pathId)
      if (result.success && result.data) {
        setStatus(result.data.status)
      } else {
        setError(result.error)
      }
    })
  }

  function handleLeave() {
    setError(null)
    startTransition(async () => {
      const result = await leavePathAction(pathId)
      if (result.success) setStatus(null)
      else setError(result.error)
    })
  }

  if (status === 'active') {
    return (
      <div className="space-y-2">
        <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm text-center text-muted-foreground">
          Tu es membre de ce Cercle
        </div>
        <button
          onClick={handleLeave}
          disabled={isPending}
          className="w-full text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
        >
          {isPending ? 'Chargement…' : 'Quitter ce Cercle'}
        </button>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-center text-amber-600">
        Demande d&apos;accès en attente
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleJoin}
        disabled={isPending}
        className="w-full rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending
          ? 'Chargement…'
          : admissionMode === 'open'
          ? 'Rejoindre ce Cercle'
          : 'Demander à rejoindre'}
      </button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
