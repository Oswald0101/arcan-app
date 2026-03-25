// src/components/billing/invite-widget.tsx
'use client'

import { useState, useTransition } from 'react'
import { generateInviteAction } from '@/lib/billing/actions'

interface InviteWidgetProps {
  stats: { invitesSent: number; invitesActivated: number; rewardsEarned: number }
  existingCodes: Array<{ inviteCode: string; status: string; expiresAt: string }>
}

export function InviteWidget({ stats, existingCodes }: InviteWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [newCode, setNewCode] = useState<{ code: string; url: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeExisting = existingCodes.find(
    (c) => c.status === 'pending' && new Date(c.expiresAt) > new Date()
  )
  const displayCode = newCode?.code ?? activeExisting?.inviteCode
  const displayUrl = newCode?.url ?? (displayCode ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/register?invite=${displayCode}` : null)

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generateInviteAction()
      if (!result.success) {
        setError(result.error)
      } else if (result.data) {
        setNewCode(result.data)
      } else {
        setError('Erreur inconnue lors de la génération.')
      }
    })
  }

  function handleCopy() {
    if (!displayUrl) return
    navigator.clipboard.writeText(displayUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: stats.invitesSent, label: 'Envoyées' },
          { value: stats.invitesActivated, label: 'Activées' },
          { value: stats.rewardsEarned, label: 'Récompenses' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-3 text-center">
            <p className="text-xl font-medium">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Comment ça marche</p>
        <p>Invite un ami avec ton lien. Quand il s&apos;inscrit et souscrit à un plan, vous recevez tous les deux des jours de premium.</p>
        <p className="text-xs">Toi : +30 jours · Ton filleul : +14 jours</p>
      </div>

      {displayCode ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Ton lien d&apos;invitation</p>
          <div className="flex gap-2">
            <input readOnly value={displayUrl ?? ''} className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs font-mono outline-none" />
            <button onClick={handleCopy} className="rounded-xl border border-border px-3 py-2.5 text-xs hover:bg-muted">
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Code : <strong>{displayCode}</strong></p>
        </div>
      ) : (
        <button onClick={handleGenerate} disabled={isPending} className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background disabled:opacity-50">
          {isPending ? 'Génération…' : 'Générer un lien d\'invitation'}
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {existingCodes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Historique</p>
          {existingCodes.slice(0, 5).map((inv) => (
            <div key={inv.inviteCode} className="flex items-center justify-between text-xs">
              <span className="font-mono">{inv.inviteCode}</span>
              <span className={`rounded-full px-2 py-0.5 ${
                inv.status === 'accepted' ? 'bg-green-500/10 text-green-700'
                : inv.status === 'expired' || inv.status === 'cancelled' ? 'bg-muted text-muted-foreground'
                : 'bg-blue-500/10 text-blue-600'
              }`}>
                {inv.status === 'accepted' ? 'Activé' : inv.status === 'pending' ? 'En attente' : inv.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
