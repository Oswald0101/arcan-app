// src/app/(app)/community/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { UserAvatar } from '@/components/profile/user-avatar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Communauté — Arcan' }

interface CommunityPageProps {
  searchParams: Promise<{ q?: string; sort?: string }>
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const sort = params.sort === 'level' ? 'level' : 'recent'

  // Seuil "en ligne" : actif dans les 10 dernières minutes
  const onlineThreshold = new Date(Date.now() - 10 * 60 * 1000)

  const members = await prisma.profile.findMany({
    where: {
      onboardingCompleted: true,
      userId: { not: user.id },
      ...(query ? {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: {
      userId: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      currentLevel: true,
      updatedAt: true,
    },
    orderBy: sort === 'level'
      ? { currentLevel: 'desc' }
      : { updatedAt: 'desc' },
    take: 60,
  })

  const onlineCount = members.filter(m => m.updatedAt >= onlineThreshold).length
  const totalCount = await prisma.profile.count({ where: { onboardingCompleted: true } })

  return (
    <div className="mx-auto max-w-lg px-4 py-6">

      {/* ── En-tête ── */}
      <div className="mb-6">
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'hsl(38 52% 58% / 0.65)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          Communauté
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            color: 'hsl(38 14% 90%)',
            lineHeight: 1.1,
          }}
        >
          Les marcheurs d'ARCAN.
        </h1>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="status-dot-online" style={{ width: '6px', height: '6px' }} />
            <span className="text-xs" style={{ color: 'hsl(142 45% 52%)' }}>
              {onlineCount} en ligne
            </span>
          </div>
          <span style={{ color: 'hsl(248 10% 28%)', fontSize: '12px' }}>·</span>
          <span className="text-xs" style={{ color: 'hsl(248 10% 40%)' }}>
            {totalCount.toLocaleString('fr-FR')} membres
          </span>
        </div>
      </div>

      {/* ── Recherche + tri ── */}
      <div className="flex gap-2 mb-5">
        <form className="flex-1" action="/community" method="get">
          {sort !== 'recent' && <input type="hidden" name="sort" value={sort} />}
          <input
            name="q"
            defaultValue={query}
            placeholder="Rechercher un membre…"
            className="input w-full"
            style={{ height: '38px', fontSize: '13px' }}
          />
        </form>

        <div className="flex gap-1">
          {[
            { value: 'recent', label: 'Récents' },
            { value: 'level', label: 'Niveau' },
          ].map(opt => (
            <Link
              key={opt.value}
              href={`/community?sort=${opt.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
              className="flex items-center px-3 rounded-xl text-xs transition-all"
              style={{
                height: '38px',
                background: sort === opt.value ? 'hsl(38 52% 58% / 0.10)' : 'hsl(248 30% 7%)',
                border: `1px solid ${sort === opt.value ? 'hsl(38 52% 58% / 0.22)' : 'hsl(248 22% 13%)'}`,
                color: sort === opt.value ? 'hsl(38 58% 66%)' : 'hsl(248 10% 42%)',
                fontWeight: sort === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Résultats ── */}
      {members.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center space-y-3"
          style={{ background: 'hsl(248 30% 5%)', border: '1px solid hsl(248 22% 10%)' }}
        >
          {query ? (
            <>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: 300,
                  color: 'hsl(248 10% 46%)',
                }}
              >
                Aucun marcheur trouvé.
              </p>
              <p className="text-sm" style={{ color: 'hsl(248 10% 34%)' }}>
                Personne ne correspond à &quot;{query}&quot; pour l&apos;instant.
              </p>
            </>
          ) : (
            <>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 300,
                  color: 'hsl(38 14% 72%)',
                  letterSpacing: '-0.01em',
                }}
              >
                Les premiers marcheurs arrivent.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(248 10% 38%)' }}>
                La communauté ARCAN se construit. Complète ton profil pour<br />
                apparaître ici et inspirer les autres sur leur voie.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                {['◎', '◉', '○', '◇', '✦'].map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '16px',
                      color: `hsl(248 10% ${20 + i * 4}%)`,
                      opacity: 0.6,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const isOnline = member.updatedAt >= onlineThreshold
            const name = member.displayName || member.username

            return (
              <Link
                key={member.userId}
                href={`/profils/${member.username}`}
                className="flex items-center gap-3 rounded-2xl p-3 transition-all duration-200 group"
                style={{
                  background: 'hsl(248 30% 5%)',
                  border: '1px solid hsl(248 22% 10%)',
                }}
              >
                {/* Avatar + statut */}
                <div className="relative flex-shrink-0">
                  <UserAvatar
                    avatarUrl={member.avatarUrl}
                    displayName={member.displayName}
                    username={member.username}
                    size="sm"
                  />
                  {isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'hsl(142 52% 48%)',
                        border: '1.5px solid hsl(246 40% 3%)',
                      }}
                    />
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate transition-colors group-hover:text-foreground"
                    style={{ color: 'hsl(248 10% 72%)' }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'hsl(248 10% 38%)' }}
                  >
                    @{member.username}
                  </p>
                </div>

                {/* Niveau */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'hsl(38 52% 58% / 0.08)',
                    color: 'hsl(38 52% 58%)',
                    border: '1px solid hsl(38 52% 58% / 0.15)',
                    flexShrink: 0,
                  }}
                >
                  Niv.{member.currentLevel}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {members.length === 60 && (
        <p
          className="text-center text-xs mt-6"
          style={{ color: 'hsl(248 10% 30%)' }}
        >
          Affichage des 60 premiers membres
        </p>
      )}
    </div>
  )
}
