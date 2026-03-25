// src/app/admin/membres/page.tsx
import { getAdminMembers } from '@/lib/admin/queries'
import { requireAdmin } from '@/lib/admin/permissions'
import { MemberActions } from '@/components/admin/member-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Membres' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

export default async function AdminMembresPage({ searchParams }: PageProps) {
  await requireAdmin('members', 'read')
  const params = await searchParams

  const { users, total, pages } = await getAdminMembers({
    page: Number(params.page ?? 1),
    limit: 25,
    search: params.search,
    status: params.status,
  })

  return (
    <div className="space-y-6 animate-fade-up">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium" style={{ color: 'hsl(38 22% 90%)' }}>
            Membres
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 48%)' }}>
            {total} membre{total !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Filtres */}
      <form
        className="flex flex-wrap gap-2"
        style={{
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '14px',
          padding: '14px',
        }}
      >
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Rechercher par username ou nom…"
          className="input flex-1 min-w-40"
          style={{ fontSize: '0.8125rem' }}
        />
        <select
          name="status"
          defaultValue={params.status}
          className="select"
          style={{ width: 'auto', minWidth: '150px', fontSize: '0.8125rem' }}
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="banned">Banni</option>
          <option value="pending">En attente</option>
        </select>
        <button type="submit" className="btn-primary px-4 py-2.5 text-sm">
          Filtrer
        </button>
      </form>

      {/* Tableau */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          boxShadow: 'inset 0 1px 0 hsl(38 22% 90% / 0.04)',
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              {['Membre', 'Statut', 'Rôle', 'Inscrit', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-medium ${i === 4 ? 'text-right' : 'text-left'}`}
                  style={{ color: 'hsl(248 10% 46%)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user: any, idx: number) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-surface-elevated"
                style={{
                  borderBottom: idx < users.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/admin/membres/${user.id}`}
                          className="font-medium text-sm transition-colors hover:opacity-80"
                          style={{ color: 'hsl(38 22% 85%)' }}
                        >
                          @{user.profile?.username ?? '—'}
                        </a>
                        {user.profile?.verificationStatus !== 'none' && (
                          <span className="badge badge-gold" style={{ padding: '1px 6px', fontSize: '9px' }}>✓</span>
                        )}
                      </div>
                      {user.profile?.displayName && (
                        <p className="text-xs" style={{ color: 'hsl(248 10% 46%)' }}>
                          {user.profile.displayName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.accountStatus} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: 'hsl(248 10% 50%)' }}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: 'hsl(248 10% 46%)' }}>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <MemberActions userId={user.id} currentStatus={user.accountStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'hsl(248 10% 46%)' }}>
              Aucun membre trouvé
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${params.search ? `&search=${params.search}` : ''}${params.status ? `&status=${params.status}` : ''}`}
              className="rounded-xl px-3 py-1.5 text-sm transition-all"
              style={{
                background: Number(params.page ?? 1) === p
                  ? 'hsl(38 52% 58% / 0.12)'
                  : 'hsl(var(--surface))',
                border: Number(params.page ?? 1) === p
                  ? '1px solid hsl(38 52% 58% / 0.25)'
                  : '1px solid hsl(var(--border))',
                color: Number(params.page ?? 1) === p
                  ? 'hsl(38 58% 65%)'
                  : 'hsl(248 10% 50%)',
              }}
            >
              {p}
            </a>
          ))}
          {pages > 7 && (
            <span className="px-3 py-1.5 text-sm" style={{ color: 'hsl(248 10% 40%)' }}>
              … {pages}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:    'badge-success',
    pending:   'badge-warning',
    suspended: 'badge-warning',
    banned:    'badge-danger',
    deleted:   'badge-muted',
  }
  const labels: Record<string, string> = {
    active:    'Actif',
    pending:   'En attente',
    suspended: 'Suspendu',
    banned:    'Banni',
    deleted:   'Supprimé',
  }
  return (
    <span className={`badge ${styles[status] ?? 'badge-muted'}`}>
      {labels[status] ?? status}
    </span>
  )
}
