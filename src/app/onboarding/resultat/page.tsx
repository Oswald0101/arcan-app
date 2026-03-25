// src/app/onboarding/resultat/page.tsx
// Récap de fin d'onboarding — synthèse personnalisée, incarnée, émotionnellement forte

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ta Voie est née — ARCAN',
}

// ── Labels humains pour les types de voie ───────────────────
const PATH_TYPE_LABELS: Record<string, string> = {
  voie:         'Voie',
  religion:     'Religion',
  mouvement:    'Mouvement',
  philosophie:  'Philosophie',
  ordre:        'Ordre',
  tradition:    'Tradition',
  courant:      'Courant',
  ecole:        'École',
  cercle_type:  'Cercle',
  temple:       'Temple',
  doctrine:     'Doctrine',
  culte:        'Culte',
  autre:        'Voie',
}

// ── Labels des tons du guide ─────────────────────────────────
const GUIDE_TONE_LABELS: Record<string, string> = {
  direct:        'Direct, sans détour',
  doux:          'Bienveillant et honnête',
  philosophique: 'Philosophique, questionnant',
  stoique:       'Sobre et stoïque',
  mystique:      'Mystique et symbolique',
  fraternel:     'Fraternel et proche',
  solennel:      'Solennel et inspirant',
}

// ── Axes de sensibilité — labels lisibles ────────────────────
const DIMENSION_LABELS: Record<string, string> = {
  spiritual_affinity:       'Sensibilité spirituelle',
  rational_affinity:        'Ancrage rationnel',
  community_desire:         'Désir de communauté',
  need_for_structure:       'Besoin d\'ordre',
  symbolic_affinity:        'Langage symbolique',
  confrontation_preference: 'Vérité directe',
  commitment_level:         'Engagement durable',
  creation_desire:          'Élan créateur',
  softness_preference:      'Douceur intérieure',
  emotional_stability:      'Stabilité intérieure',
  need_for_meaning:         'Quête de sens',
}

export default async function OnboardingResultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Tout en parallèle
  const [path, guide, manifesto, completedSession] = await Promise.all([
    prisma.path.findFirst({
      where: { founderUserId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guide.findFirst({
      where: { ownerUserId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.manifesto.findFirst({
      where: { userId: user.id, isCurrent: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.onboardingSession.findFirst({
      where: { userId: user.id, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      select: { generatedProfileSnapshot: true },
    }),
  ])

  if (!path || !guide) redirect('/onboarding')

  // ── Extraire le récap et les scores depuis le snapshot ──────
  const snapshot = completedSession?.generatedProfileSnapshot as Record<string, any> | null
  const welcomeRecap: string | null = snapshot?.welcomeRecap ?? null
  const scores: Record<string, number> = snapshot?.scores ?? {}

  // Top 3 axes de sensibilité
  const topAxes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dim, val]) => ({
      label: DIMENSION_LABELS[dim] ?? dim,
      value: Math.round(val * 100),
    }))

  const pathTypeLabel = PATH_TYPE_LABELS[path.canonicalType] ?? 'Voie'
  const guideToneLabel = GUIDE_TONE_LABELS[guide.tone] ?? guide.tone

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'hsl(var(--background))' }}
    >
      <div className="mx-auto max-w-lg px-4 py-14 space-y-10">

        {/* ── Ouverture symbolique ─────────────────────────── */}
        <div className="flex flex-col items-center gap-4 text-center pt-2">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '48px',
              lineHeight: 1,
              color: 'hsl(38 52% 56%)',
              opacity: 0.9,
            }}
          >
            ◎
          </span>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '26px',
              fontWeight: 400,
              color: 'hsl(38 14% 92%)',
              letterSpacing: '0.02em',
              lineHeight: 1.3,
            }}
          >
            {path.name}
          </h1>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'hsl(38 40% 45%)',
            }}
          >
            {pathTypeLabel}
          </p>
        </div>

        {/* ── Récap personnalisé ARCAN ─────────────────────── */}
        {welcomeRecap && (
          <div
            className="rounded-2xl px-6 py-6"
            style={{
              background: 'hsl(248 30% 8%)',
              border: '1px solid hsl(248 22% 15%)',
              boxShadow: '0 0 40px hsl(246 40% 2% / 0.40)',
            }}
          >
            {/* Petit fil d'or au-dessus */}
            <div
              style={{
                width: '28px',
                height: '1px',
                background: 'hsl(38 52% 52%)',
                marginBottom: '20px',
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '16.5px',
                fontWeight: 400,
                lineHeight: 1.8,
                color: 'hsl(38 12% 82%)',
                whiteSpace: 'pre-line',
              }}
            >
              {welcomeRecap}
            </p>
            <p
              className="mt-4 text-right"
              style={{
                fontSize: '11px',
                letterSpacing: '0.10em',
                color: 'hsl(38 35% 38%)',
                fontStyle: 'italic',
              }}
            >
              — ARCAN
            </p>
          </div>
        )}

        {/* ── Phrase fondatrice ─────────────────────────────── */}
        {path.shortDescription && path.shortDescription !== path.name && (
          <div className="text-center px-2">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '17px',
                fontStyle: 'italic',
                color: 'hsl(38 20% 64%)',
                lineHeight: 1.6,
              }}
            >
              &ldquo;{path.shortDescription}&rdquo;
            </p>
          </div>
        )}

        {/* ── Bloc : Ce que tu as créé ──────────────────────── */}
        <div className="space-y-3">
          <p
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'hsl(248 10% 38%)',
              paddingLeft: '2px',
            }}
          >
            Ce que tu as fondé
          </p>

          {/* Voie */}
          <div
            className="rounded-2xl p-5 space-y-1.5"
            style={{
              background: 'hsl(248 28% 9%)',
              border: '1px solid hsl(248 22% 16%)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'hsl(38 40% 44%)',
                }}
              >
                {pathTypeLabel}
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '20px',
                fontWeight: 400,
                color: 'hsl(38 14% 90%)',
              }}
            >
              {path.name}
            </p>
            {manifesto && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'hsl(248 10% 52%)',
                  lineHeight: 1.65,
                }}
              >
                {manifesto.content.slice(0, 200)}
                {manifesto.content.length > 200 ? '…' : ''}
              </p>
            )}
          </div>

          {/* Guide */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'hsl(248 28% 9%)',
              border: '1px solid hsl(248 22% 16%)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'hsl(38 40% 44%)',
                    display: 'block',
                  }}
                >
                  Ton Guide
                </span>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: 'hsl(38 14% 90%)',
                  }}
                >
                  {guide.name}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'hsl(248 10% 50%)',
                    fontStyle: 'italic',
                  }}
                >
                  {guideToneLabel}
                </p>
              </div>
              <span
                style={{
                  fontSize: '28px',
                  lineHeight: 1,
                  color: 'hsl(38 40% 40%)',
                  flexShrink: 0,
                  paddingTop: '18px',
                }}
              >
                ◉
              </span>
            </div>
          </div>
        </div>

        {/* ── Axes de sensibilité (si disponibles) ─────────── */}
        {topAxes.length > 0 && (
          <div className="space-y-3">
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'hsl(248 10% 38%)',
                paddingLeft: '2px',
              }}
            >
              Tes axes dominants
            </p>
            <div className="space-y-2">
              {topAxes.map((axis, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: 'hsl(248 28% 9%)',
                    border: '1px solid hsl(248 22% 14%)',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'hsl(38 14% 78%)' }}>
                    {axis.label}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Barre de score */}
                    <div
                      style={{
                        width: '48px',
                        height: '3px',
                        background: 'hsl(248 20% 16%)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${axis.value}%`,
                          height: '100%',
                          background: 'hsl(38 52% 52%)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'hsl(248 10% 42%)', minWidth: '28px', textAlign: 'right' }}>
                      {axis.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────── */}
        <div className="space-y-3 pt-2 pb-6">
          <Link
            href="/guide"
            className="block w-full rounded-2xl py-3.5 text-center text-sm font-medium transition-all duration-200"
            style={{
              background: 'hsl(38 52% 58% / 0.12)',
              color: 'hsl(38 58% 68%)',
              border: '1px solid hsl(38 52% 58% / 0.22)',
            }}
          >
            Parler à {guide.name}
          </Link>
          <Link
            href="/accueil"
            className="block w-full rounded-2xl py-3.5 text-center text-sm transition-colors"
            style={{
              color: 'hsl(248 10% 45%)',
              border: '1px solid hsl(248 20% 14%)',
            }}
          >
            Aller au tableau de bord
          </Link>
        </div>

      </div>
    </div>
  )
}
