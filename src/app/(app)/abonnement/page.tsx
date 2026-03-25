// src/app/(app)/abonnement/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveSubscription } from '@/lib/supabase/queries/billing'
import { PricingUI } from '@/components/billing/pricing-ui'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Plans — Arcan' }

interface PageProps {
  searchParams: Promise<{ success?: string; cancelled?: string }>
}

export default async function AbonnementPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const activeSub = await getActiveSubscription(user.id)

  const currentPlanKey = activeSub?.plan?.planKey ?? 'free'
  const periodEnd = activeSub?.currentPeriodEnd?.toISOString() ?? null

  return (
    <div className="mx-auto px-4 py-8" style={{ maxWidth: '960px' }}>

      {/* ── En-tête ── */}
      <div className="text-center mb-10">
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'hsl(38 52% 58% / 0.60)',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Plans
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(30px, 6vw, 44px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 92%)',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}
        >
          Choisis ta profondeur.
        </h1>
        <p style={{ fontSize: '15px', color: 'hsl(248 10% 46%)', maxWidth: '380px', margin: '0 auto' }}>
          Commence gratuitement. Évolue selon ton propre rythme.
        </p>
      </div>

      {/* ── Bannière succès ── */}
      {params.success && (
        <div
          className="mb-8 rounded-2xl px-4 py-3 text-center mx-auto"
          style={{
            maxWidth: '480px',
            background: 'hsl(142 52% 42% / 0.08)',
            border: '1px solid hsl(142 52% 42% / 0.20)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'hsl(142 52% 60%)' }}>
            ✓ Paiement confirmé — ton plan est actif !
          </p>
        </div>
      )}

      {/* ── Pricing UI (client) ── */}
      <PricingUI
        currentPlanKey={currentPlanKey}
        hasActiveSub={!!activeSub}
        periodEnd={periodEnd}
      />
    </div>
  )
}
