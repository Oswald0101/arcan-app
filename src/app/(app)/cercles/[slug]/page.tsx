// src/app/(app)/cercles/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPathBySlug, getCircleMembers } from '@/lib/supabase/queries/paths'
import { JoinPathButton } from '@/components/cercle/join-path-button'
import { UserAvatar } from '@/components/profile/user-avatar'
import type { Metadata } from 'next'

interface PathPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PathPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const path = await getPathBySlug(slug, user?.id)
  return { title: path ? `${path.name} — Arcan` : 'Voie introuvable' }
}

export default async function PathPage({ params }: PathPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const path = await getPathBySlug(slug, user.id)
  if (!path) notFound()

  const isMember = path.userMembership?.status === 'active'
  const isPending = path.userMembership?.status === 'pending'
  const isFounder = path.founderUserId === user.id
  const isPrivate = path.visibility === 'private'
  const isLocked = isPrivate && !isMember && !isFounder
  const typeLabel = path.customTypeLabel ?? path.canonicalType

  // Membres du cercle (si cercle existe et qu'on peut accéder)
  let members: Awaited<ReturnType<typeof getCircleMembers>>['members'] = []
  if (path.circle && !isLocked) {
    const result = await getCircleMembers(path.circle.id, { limit: 8 })
    members = result.members
  }

  const memberCount = path.circle?.memberCount ?? path.memberCount ?? 0

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5">

      {/* ── En-tête ── */}
      <div>
        {/* Type */}
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: 'hsl(38 52% 58% / 0.6)',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          {typeLabel}
        </p>

        {/* Titre */}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(26px, 7vw, 36px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 90%)',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}
        >
          {path.name}
        </h1>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm" style={{ color: 'hsl(248 10% 44%)' }}>
            {memberCount > 0
              ? `${memberCount} membre${memberCount > 1 ? 's' : ''}`
              : 'Aucun membre'}
          </span>
          <span style={{ color: 'hsl(248 10% 22%)', fontSize: '12px' }}>·</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              padding: '3px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              background: path.admissionMode === 'open'
                ? 'hsl(142 52% 42% / 0.08)'
                : 'hsl(248 30% 10%)',
              color: path.admissionMode === 'open'
                ? 'hsl(142 52% 52%)'
                : 'hsl(248 10% 38%)',
              border: `1px solid ${path.admissionMode === 'open'
                ? 'hsl(142 52% 42% / 0.18)'
                : 'hsl(248 22% 14%)'}`,
            }}
          >
            {path.admissionMode === 'open' ? 'Ouvert' : 'Sur demande'}
          </span>
          {(isMember || isFounder) && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '3px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                background: 'hsl(38 52% 58% / 0.09)',
                color: 'hsl(38 58% 62%)',
                border: '1px solid hsl(38 52% 58% / 0.18)',
              }}
            >
              {isFounder ? '✦ Fondateur' : '✓ Membre'}
            </span>
          )}
        </div>
      </div>

      {/* ── Contenu verrouillé ── */}
      {isLocked ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'hsl(248 30% 5%)', border: '1px solid hsl(248 22% 10%)' }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '20px',
              fontWeight: 300,
              color: 'hsl(248 10% 52%)',
              marginBottom: '6px',
            }}
          >
            Cette Voie est privée.
          </p>
          <p className="text-sm" style={{ color: 'hsl(248 10% 36%)' }}>
            Rejoins cette voie pour en voir le contenu.
          </p>
        </div>
      ) : (
        <>
          {/* Description */}
          {path.shortDescription && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'hsl(248 10% 50%)' }}
            >
              {path.shortDescription}
            </p>
          )}

          {/* Manifeste */}
          {path.currentManifesto && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'hsl(248 30% 5%)', border: '1px solid hsl(248 22% 10%)' }}
            >
              <p
                className="mb-2"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  color: 'hsl(248 10% 36%)',
                  textTransform: 'uppercase',
                }}
              >
                Manifeste
              </p>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'hsl(248 10% 60%)' }}
              >
                {path.currentManifesto}
              </p>
            </div>
          )}

          {/* Principes */}
          {path.currentPrinciples.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'hsl(248 30% 5%)', border: '1px solid hsl(248 22% 10%)' }}
            >
              <p
                className="mb-3"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  color: 'hsl(248 10% 36%)',
                  textTransform: 'uppercase',
                }}
              >
                Principes
              </p>
              <ol className="space-y-2">
                {path.currentPrinciples.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '16px',
                        fontWeight: 400,
                        color: 'hsl(38 52% 58% / 0.5)',
                        flexShrink: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span style={{ color: 'hsl(248 10% 58%)' }}>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Membres */}
          {members.length > 0 && (
            <div>
              <p
                className="mb-3"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  color: 'hsl(248 10% 36%)',
                  textTransform: 'uppercase',
                }}
              >
                Membres · {memberCount}
              </p>
              <div className="flex flex-wrap gap-3">
                {members.map((m: any) => {
                  const profile = m.user?.profile
                  if (!profile) return null
                  return (
                    <Link
                      key={m.userId}
                      href={`/profils/${profile.username}`}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <UserAvatar
                        avatarUrl={profile.avatarUrl}
                        displayName={profile.displayName}
                        username={profile.username}
                        size="sm"
                      />
                      <span
                        className="text-xs text-center max-w-[52px] truncate group-hover:opacity-80"
                        style={{ color: 'hsl(248 10% 40%)' }}
                      >
                        {profile.displayName || profile.username}
                      </span>
                    </Link>
                  )
                })}
                {memberCount > 8 && (
                  <div
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'hsl(248 30% 8%)',
                        border: '1px solid hsl(248 22% 14%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'hsl(248 10% 38%)',
                        fontWeight: 600,
                      }}
                    >
                      +{memberCount - 8}
                    </div>
                    <span style={{ fontSize: '10px', color: 'hsl(248 10% 32%)' }}>autres</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Action ── */}
      {!isFounder && (
        <div className="pt-2">
          <JoinPathButton
            pathId={path.id}
            admissionMode={path.admissionMode}
            currentStatus={path.userMembership?.status ?? null}
            isPrivate={isPrivate}
          />
        </div>
      )}

      {isFounder && (
        <div
          className="rounded-2xl px-4 py-3 text-center"
          style={{
            background: 'hsl(38 52% 58% / 0.05)',
            border: '1px solid hsl(38 52% 58% / 0.14)',
          }}
        >
          <p className="text-sm" style={{ color: 'hsl(38 52% 58%)' }}>
            ✦ Tu es le Fondateur de cette Voie
          </p>
        </div>
      )}
    </div>
  )
}
