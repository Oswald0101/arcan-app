// src/app/admin/business/page.tsx
import { getAdminBusinessOverview } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Business' }

export default async function AdminBusinessPage() {
  await requireAdmin('billing', 'read')
  const { activeSubsByPlan, recentPurchases, recentInvites } = await getAdminBusinessOverview()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-medium">Vue business</h1>

      {/* Abonnements par plan */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Abonnements actifs</p>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Abonnés</th>
              </tr>
            </thead>
            <tbody>
              {activeSubsByPlan.map((row: any) => (
                <tr key={row.planId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm">{row.planId}</td>
                  <td className="px-4 py-3 text-right font-medium">{row._count._all}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Achats récents */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Achats récents (30 jours)</p>
        <div className="space-y-2">
          {recentPurchases.slice(0, 10).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{p.product?.title ?? '—'}</p>
                <p className="text-xs text-muted-foreground">@{p.user?.profile?.username ?? '—'}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{((p.product?.priceAmount ?? 0) / 100).toFixed(2)} €</p>
                <p className="text-xs text-muted-foreground">{new Date(p.purchasedAt).toLocaleDateString('fr')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parrainages */}
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Parrainages activés (30 jours)</p>
        <p className="text-sm text-muted-foreground">{recentInvites.length} activation{recentInvites.length > 1 ? 's' : ''}</p>
      </section>
    </div>
  )
}
