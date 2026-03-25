// src/app/admin/roles/page.tsx
// Gestion des rôles admin — qui a accès à quoi
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Rôles Admin — Arcan' }

export default async function AdminRolesPage() {
  const adminUsers = await prisma.userAdminRole.findMany({
    where: { isActive: true },
    orderBy: { grantedAt: 'asc' },
  })

  // Récupérer roles et profiles séparément
  const [adminRolesMap, profilesMap] = await Promise.all([
    prisma.adminRole.findMany().then(roles => new Map(roles.map(r => [r.id, r]))),
    prisma.profile.findMany({
      where: { userId: { in: adminUsers.map(u => u.userId) } },
      select: { userId: true, username: true, displayName: true },
    }).then(profiles => new Map(profiles.map(p => [p.userId, p]))),
  ])

  const allRoles = await prisma.adminRole.findMany({ orderBy: { createdAt: 'asc' } })

  const ROLE_DESCRIPTIONS: Record<string, { icon: string; color: string; desc: string }> = {
    super_admin: { icon: '◎', color: 'hsl(38 58% 62%)', desc: 'Accès total — toutes les fonctions admin' },
    admin:       { icon: '◉', color: 'hsl(195 52% 58%)', desc: 'Gestion membres, contenus, modération' },
    moderator:   { icon: '◇', color: 'hsl(275 52% 62%)', desc: 'Modération et signalements uniquement' },
    support:     { icon: '○', color: 'hsl(248 10% 50%)', desc: 'Lecture et assistance' },
  }

  return (
    <div className="space-y-8">

      {/* ── En-tête ── */}
      <div>
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'hsl(38 52% 58% / 0.6)',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          Admin
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 300,
            color: 'hsl(38 14% 88%)',
          }}
        >
          Rôles & Accès Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 44%)' }}>
          Gérer qui a accès au panneau d'administration et avec quel niveau.
        </p>
      </div>

      {/* ── Légende des rôles ── */}
      <div className="grid grid-cols-2 gap-3">
        {allRoles.map(role => {
          const meta = ROLE_DESCRIPTIONS[role.roleKey] ?? { icon: '○', color: 'hsl(248 10% 50%)', desc: '' }
          return (
            <div
              key={role.id}
              className="rounded-2xl p-4"
              style={{
                background: 'hsl(248 30% 6%)',
                border: '1px solid hsl(248 22% 11%)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '14px', color: meta.color }}>{meta.icon}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: meta.color,
                    textTransform: 'uppercase',
                  }}
                >
                  {role.roleKey}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'hsl(248 10% 40%)' }}>
                {meta.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Admins actuels ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'hsl(248 10% 58%)',
              textTransform: 'uppercase',
            }}
          >
            Admins actifs ({adminUsers.length})
          </h2>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid hsl(248 22% 11%)' }}
        >
          {adminUsers.length === 0 ? (
            <div
              className="p-6 text-center"
              style={{ background: 'hsl(248 30% 6%)' }}
            >
              <p className="text-sm" style={{ color: 'hsl(248 10% 42%)' }}>
                Aucun admin configuré.{' '}
                <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">
                  npx tsx scripts/bootstrap-founder.ts
                </code>
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'hsl(248 30% 6%)', borderBottom: '1px solid hsl(248 22% 11%)' }}>
                  {['Utilisateur', 'Rôle', 'Attribué le', 'Statut'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left"
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        color: 'hsl(248 10% 38%)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((ua, i) => {
                  const profile = profilesMap.get(ua.userId)
                  const role = adminRolesMap.get(ua.adminRoleId)
                  const meta = ROLE_DESCRIPTIONS[role?.roleKey ?? ''] ?? { icon: '○', color: 'hsl(248 10% 50%)', desc: '' }
                  const name = profile?.displayName || (profile?.username ? `@${profile.username}` : 'Utilisateur')

                  return (
                    <tr
                      key={ua.id}
                      style={{
                        background: i % 2 === 0 ? 'hsl(248 30% 5%)' : 'transparent',
                        borderBottom: i < adminUsers.length - 1 ? '1px solid hsl(248 22% 9%)' : 'none',
                      }}
                    >
                      {/* Utilisateur */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 76%)' }}>
                            {name}
                          </p>
                          {profile?.username && (
                            <p className="text-xs" style={{ color: 'hsl(248 10% 38%)' }}>
                              @{profile.username}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            background: meta.color.replace(')', ' / 0.10)'),
                            color: meta.color,
                            border: `1px solid ${meta.color.replace(')', ' / 0.22)')}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {meta.icon} {role?.roleKey ?? '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'hsl(248 10% 38%)' }}>
                          {new Date(ua.grantedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            background: 'hsl(142 52% 42% / 0.09)',
                            color: 'hsl(142 52% 52%)',
                            border: '1px solid hsl(142 52% 42% / 0.18)',
                          }}
                        >
                          Actif
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Comment ajouter un admin ── */}
      <section
        className="rounded-2xl p-5"
        style={{
          background: 'hsl(248 30% 5%)',
          border: '1px solid hsl(248 22% 10%)',
        }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'hsl(38 14% 82%)' }}>
          Ajouter un admin
        </h3>
        <p className="text-xs mb-3" style={{ color: 'hsl(248 10% 42%)' }}>
          Pour ajouter ou modifier les rôles admin, utilise le script de bootstrap dans le terminal :
        </p>
        <div
          className="rounded-xl p-3 font-mono text-xs"
          style={{ background: 'hsl(246 40% 3%)', color: 'hsl(142 52% 55%)', border: '1px solid hsl(248 22% 9%)' }}
        >
          <p style={{ color: 'hsl(248 10% 38%)' }}># Fondateur (super_admin) :</p>
          <p>npx tsx scripts/bootstrap-founder.ts</p>
          <p className="mt-2" style={{ color: 'hsl(248 10% 38%)' }}># Pour d'autres rôles : modifier FOUNDER_EMAIL dans le script</p>
        </div>
        <p className="text-xs mt-3" style={{ color: 'hsl(248 10% 34%)' }}>
          Interface d'ajout direct via email — disponible post-MVP.
        </p>
      </section>
    </div>
  )
}
