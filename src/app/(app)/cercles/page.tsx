// src/app/(app)/cercles/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPublicPaths, getJoinedPaths } from '@/lib/supabase/queries/paths'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Voies — Arcan' }

export default async function CerclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ paths: publicPaths }, joinedPaths] = await Promise.all([
    getPublicPaths({ limit: 12 }),
    getJoinedPaths(user.id),
  ])

  const joinedPathIds = new Set(joinedPaths.map((j) => j.path.id))
  const explorePaths = publicPaths.filter((p) => !joinedPathIds.has(p.id))

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
          Voies
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
          Trouve ta voie.
        </h1>
        <p className="text-sm mt-1.5" style={{ color: 'hsl(248 10% 44%)' }}>
          Des espaces de transformation collective, ouverts ou privés.
        </p>
      </div>

      {/* ── Mes Voies ── */}
      {joinedPaths.length > 0 && (
        <section className="mb-6">
          <p
            className="mb-3"
            style={{
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'hsl(248 10% 38%)',
              textTransform: 'uppercase',
            }}
          >
            Mes Voies
          </p>
          <div className="space-y-2">
            {joinedPaths.map(({ path, membership }) => (
              <PathCard
                key={path.id}
                path={path}
                isMember
                memberStatus={(membership as any).status}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Explorer ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p
            style={{
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'hsl(248 10% 38%)',
              textTransform: 'uppercase',
            }}
          >
            Explorer {explorePaths.length > 0 && `· ${explorePaths.length}`}
          </p>
        </div>

        {explorePaths.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'hsl(248 30% 5%)', border: '1px solid hsl(248 22% 10%)' }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '18px',
                fontWeight: 300,
                color: 'hsl(248 10% 40%)',
              }}
            >
              Aucune Voie publique pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {explorePaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Carte voie ────────────────────────────────────────────────────────────────

function PathCard({
  path,
  isMember = false,
  memberStatus,
}: {
  path: {
    id: string
    slug: string
    name: string
    canonicalType: string
    customTypeLabel: string | null
    shortDescription: string | null
    memberCount: number
    admissionMode: string
    manifestoPreview?: string | null
  }
  isMember?: boolean
  memberStatus?: string
}) {
  const typeLabel = path.customTypeLabel ?? path.canonicalType
  const isOpen = path.admissionMode === 'open'

  return (
    <Link
      href={`/cercles/${path.slug}`}
      className="block rounded-2xl p-4 transition-all duration-200 group"
      style={{
        background: isMember ? 'hsl(38 52% 58% / 0.04)' : 'hsl(248 30% 5%)',
        border: `1px solid ${isMember ? 'hsl(38 52% 58% / 0.14)' : 'hsl(248 22% 10%)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type */}
          <p
            style={{
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'hsl(248 10% 36%)',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {typeLabel}
          </p>

          {/* Nom */}
          <h3
            className="transition-colors group-hover:text-foreground truncate"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '18px',
              fontWeight: 400,
              color: isMember ? 'hsl(38 14% 88%)' : 'hsl(248 10% 72%)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {path.name}
          </h3>

          {/* Description */}
          {path.shortDescription && (
            <p
              className="text-xs mt-1 line-clamp-2"
              style={{ color: 'hsl(248 10% 42%)' }}
            >
              {path.shortDescription}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: 'hsl(248 10% 36%)' }}>
              {path.memberCount > 0
                ? `${path.memberCount} membre${path.memberCount > 1 ? 's' : ''}`
                : 'Aucun membre'}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                background: isOpen ? 'hsl(142 52% 42% / 0.08)' : 'hsl(248 30% 10%)',
                color: isOpen ? 'hsl(142 52% 52%)' : 'hsl(248 10% 38%)',
                border: `1px solid ${isOpen ? 'hsl(142 52% 42% / 0.18)' : 'hsl(248 22% 14%)'}`,
              }}
            >
              {isOpen ? 'Ouvert' : 'Sur demande'}
            </span>
          </div>
        </div>

        {/* Badge membre */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {isMember && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '3px 7px',
                borderRadius: '999px',
                background: 'hsl(38 52% 58% / 0.09)',
                color: 'hsl(38 58% 62%)',
                border: '1px solid hsl(38 52% 58% / 0.18)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {memberStatus === 'pending' ? 'En attente' : '✓ Membre'}
            </span>
          )}
          <span
            style={{
              fontSize: '14px',
              color: 'hsl(248 10% 28%)',
              transition: 'color 0.2s ease',
            }}
            className="group-hover:text-foreground"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
