// src/app/admin/verification/page.tsx
import { getPendingVerifications } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import { VerificationActions } from '@/components/admin/verification-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Vérifications' }

export default async function AdminVerificationPage() {
  await requireAdmin('verification', 'read')
  const requests = await getPendingVerifications({ limit: 30 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Vérifications de compte</h1>
        <p className="text-sm text-muted-foreground">{requests.length} en attente</p>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            Aucune demande en attente
          </div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex-shrink-0">
                    {req.user?.profile?.avatarUrl && (
                      <img src={req.user.profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      @{req.user?.profile?.username ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type : {req.requestType} · {new Date(req.createdAt).toLocaleDateString('fr')}
                    </p>
                  </div>
                </div>
                <VerificationActions requestId={req.id} username={req.user?.profile?.username ?? ''} />
              </div>

              {req.submittedData && Object.keys(req.submittedData).length > 0 && (
                <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(req.submittedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
