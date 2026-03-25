'use client'

// src/components/billing/pricing-ui.tsx
// Pricing ARCAN — 3 plans, toggle mensuel/annuel, design premium

import { useState, useTransition } from 'react'
import { checkoutSubscriptionAction, openBillingPortalAction } from '@/lib/billing/actions'

type Period = 'monthly' | 'yearly'
type PlanKey = 'free' | 'premium' | 'founder'

interface PricingPlan {
  key: PlanKey
  symbol: string
  name: string
  tagline: string
  badge?: { label: string; color: 'gold' | 'purple' }
  monthly: { price: number; label: string }
  yearly: { price: number; monthlyEquiv: number; label: string }
  features: Array<{ text: string; highlight?: boolean }>
  cta: string
  highlighted?: boolean
}

const PLANS: PricingPlan[] = [
  {
    key: 'free',
    symbol: '○',
    name: 'Gratuit',
    tagline: 'Pour explorer ta voie',
    monthly: { price: 0, label: 'Toujours gratuit' },
    yearly: { price: 0, monthlyEquiv: 0, label: 'Toujours gratuit' },
    features: [
      { text: 'Guide IA — 5 conversations par jour' },
      { text: '1 Voie active' },
      { text: 'Codex personnel basique' },
      { text: 'Accès à la Communauté ARCAN' },
      { text: 'Profil public' },
    ],
    cta: 'Plan actuel',
  },
  {
    key: 'premium',
    symbol: '◉',
    name: 'Premium',
    tagline: 'L\'expérience complète',
    badge: { label: 'Populaire', color: 'gold' },
    monthly: { price: 999, label: '/mois' },
    yearly: { price: 7999, monthlyEquiv: 667, label: '/an' },
    features: [
      { text: 'Guide IA illimité + mémoire longue durée', highlight: true },
      { text: 'Voies illimitées', highlight: true },
      { text: 'Progression complète & tous les badges', highlight: true },
      { text: 'Export Codex en PDF' },
      { text: 'Réseau social complet' },
      { text: 'Thème Aube + Pack Lumières offerts' },
      { text: 'Support standard' },
    ],
    cta: 'Choisir Premium',
    highlighted: true,
  },
  {
    key: 'founder',
    symbol: '✦',
    name: 'Fondateur',
    tagline: 'Statut élite et permanent',
    badge: { label: 'Élite', color: 'purple' },
    monthly: { price: 1999, label: '/mois' },
    yearly: { price: 14999, monthlyEquiv: 1250, label: '/an' },
    features: [
      { text: 'Tout ce qui est Premium' },
      { text: '✦ Badge Fondateur exclusif et permanent', highlight: true },
      { text: 'Boutique ARCAN entière incluse', highlight: true },
      { text: 'Cercle Fondateur privé', highlight: true },
      { text: 'Accès anticipé à chaque nouveauté' },
      { text: 'Support prioritaire direct' },
      { text: 'Statut inscrit dans ARCAN pour toujours' },
    ],
    cta: 'Devenir Fondateur',
  },
]

interface PricingUIProps {
  currentPlanKey: string
  hasActiveSub: boolean
  periodEnd?: string | null
}

export function PricingUI({ currentPlanKey, hasActiveSub, periodEnd }: PricingUIProps) {
  const [period, setPeriod] = useState<Period>('monthly')

  const normalizedPlanKey = currentPlanKey.replace(/_monthly|_yearly/, '')
  const savings = period === 'yearly' ? 'jusqu\'à -37%' : null

  return (
    <div>
      {/* ── Toggle période ── */}
      <div className="flex justify-center mb-10">
        <div
          className="relative flex items-center rounded-2xl p-1"
          style={{
            background: 'hsl(248 30% 7%)',
            border: '1px solid hsl(248 22% 13%)',
          }}
        >
          {(['monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: period === p ? 'hsl(38 52% 58% / 0.12)' : 'transparent',
                color: period === p ? 'hsl(38 58% 68%)' : 'hsl(248 10% 42%)',
                border: period === p ? '1px solid hsl(38 52% 58% / 0.22)' : '1px solid transparent',
              }}
            >
              {p === 'monthly' ? 'Mensuel' : 'Annuel'}
              {p === 'yearly' && savings && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '1px 5px',
                    borderRadius: '999px',
                    background: 'hsl(142 52% 42% / 0.12)',
                    color: 'hsl(142 52% 58%)',
                    border: '1px solid hsl(142 52% 42% / 0.22)',
                    verticalAlign: 'middle',
                  }}
                >
                  {savings}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Abonnement actif ── */}
      {hasActiveSub && periodEnd && (
        <div
          className="mx-auto max-w-md mb-8 rounded-2xl px-4 py-3 text-center"
          style={{
            background: 'hsl(38 52% 58% / 0.05)',
            border: '1px solid hsl(38 52% 58% / 0.14)',
          }}
        >
          <p className="text-xs" style={{ color: 'hsl(248 10% 44%)' }}>
            Plan actif jusqu&apos;au{' '}
            <span style={{ color: 'hsl(38 52% 62%)' }}>
              {new Date(periodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </p>
        </div>
      )}

      {/* ── Cartes ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            period={period}
            isCurrentPlan={normalizedPlanKey === plan.key}
            hasActiveSub={hasActiveSub}
          />
        ))}
      </div>

      {/* ── Note paiement ── */}
      <p
        className="text-center text-xs mt-8"
        style={{ color: 'hsl(248 10% 30%)' }}
      >
        Paiement sécurisé via Stripe · Résiliable à tout moment
      </p>
    </div>
  )
}

// ── Carte plan ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  period,
  isCurrentPlan,
  hasActiveSub,
}: {
  plan: PricingPlan
  period: Period
  isCurrentPlan: boolean
  hasActiveSub: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [hovered, setHovered] = useState(false)

  const isHighlighted = plan.highlighted
  const isPremium = plan.key === 'premium'
  const isFounder = plan.key === 'founder'
  const isFree = plan.key === 'free'

  const priceData = period === 'yearly' ? plan.yearly : plan.monthly
  const formatEur = (cents: number) =>
    (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

  const priceDisplay = priceData.price === 0 ? '0 €' : formatEur(priceData.price)

  const monthlyEquivDisplay = period === 'yearly' && priceData.price > 0
    ? `soit ${formatEur(plan.yearly.monthlyEquiv)}/mois`
    : null

  // Économies en annuel vs mensuel
  const yearlySavingsPct = plan.monthly.price > 0
    ? Math.round((1 - plan.yearly.price / (plan.monthly.price * 12)) * 100)
    : 0

  function handleCTA() {
    if (isFree) return
    startTransition(async () => {
      if (isCurrentPlan && hasActiveSub) {
        const result = await openBillingPortalAction()
        if (result.success && result.data) window.location.href = result.data.url
        return
      }
      const result = await checkoutSubscriptionAction({
        planKey: plan.key as 'premium' | 'founder',
        billingPeriod: period,
      })
      if (result.success && result.data) window.location.href = result.data.url
    })
  }

  // Styles par variante
  const borderColor = isCurrentPlan
    ? 'hsl(38 52% 58% / 0.35)'
    : isPremium && hovered
      ? 'hsl(38 52% 58% / 0.40)'
      : isPremium
        ? 'hsl(38 52% 58% / 0.28)'
        : isFounder && hovered
          ? 'hsl(275 52% 58% / 0.30)'
          : isFounder
            ? 'hsl(275 52% 58% / 0.20)'
            : hovered
              ? 'hsl(248 22% 18%)'
              : 'hsl(248 22% 12%)'

  const bgColor = isPremium
    ? 'hsl(38 52% 58% / 0.04)'
    : isFounder
      ? 'hsl(275 52% 48% / 0.03)'
      : 'hsl(248 30% 5%)'

  const glowShadow = isPremium
    ? `0 0 ${hovered ? '60px' : '30px'} hsl(38 52% 58% / ${hovered ? '0.10' : '0.06'}), 0 20px 60px hsl(246 40% 2% / 0.5)`
    : isFounder
      ? `0 0 ${hovered ? '50px' : '20px'} hsl(275 52% 48% / ${hovered ? '0.08' : '0.04'}), 0 20px 50px hsl(246 40% 2% / 0.4)`
      : '0 8px 32px hsl(246 40% 2% / 0.3)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '20px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            background: plan.badge.color === 'gold'
              ? 'hsl(38 52% 52%)'
              : 'hsl(275 52% 44%)',
            color: plan.badge.color === 'gold'
              ? 'hsl(38 80% 12%)'
              : 'hsl(275 80% 96%)',
            boxShadow: plan.badge.color === 'gold'
              ? '0 4px 16px hsl(38 52% 52% / 0.35)'
              : '0 4px 16px hsl(275 52% 44% / 0.35)',
          }}
        >
          {plan.badge.label}
        </div>
      )}

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <span
            style={{
              fontSize: '20px',
              color: isPremium
                ? 'hsl(38 58% 62%)'
                : isFounder
                  ? 'hsl(275 58% 66%)'
                  : 'hsl(248 10% 38%)',
            }}
          >
            {plan.symbol}
          </span>
          {isCurrentPlan && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'hsl(38 52% 58% / 0.10)',
                color: 'hsl(38 58% 62%)',
                border: '1px solid hsl(38 52% 58% / 0.20)',
                textTransform: 'uppercase',
              }}
            >
              Actuel
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '22px',
            fontWeight: 400,
            color: 'hsl(38 14% 90%)',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            marginBottom: '4px',
          }}
        >
          {plan.name}
        </h3>
        <p style={{ fontSize: '12px', color: 'hsl(248 10% 40%)' }}>
          {plan.tagline}
        </p>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '42px',
              fontWeight: 300,
              color: 'hsl(38 14% 90%)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {priceDisplay}
          </span>
          {priceData.price > 0 && (
            <span style={{ fontSize: '13px', color: 'hsl(248 10% 40%)' }}>
              {priceData.label}
            </span>
          )}
        </div>
        {monthlyEquivDisplay && (
          <p style={{ fontSize: '11px', marginTop: '4px', color: 'hsl(248 10% 38%)' }}>
            {monthlyEquivDisplay}
          </p>
        )}
        {period === 'yearly' && yearlySavingsPct > 0 && (
          <span
            style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'hsl(142 52% 42% / 0.10)',
              color: 'hsl(142 52% 56%)',
              border: '1px solid hsl(142 52% 42% / 0.20)',
            }}
          >
            -{yearlySavingsPct}% vs mensuel
          </span>
        )}
        {priceData.price === 0 && (
          <p style={{ fontSize: '12px', color: 'hsl(248 10% 38%)', marginTop: '2px' }}>
            {priceData.label}
          </p>
        )}
      </div>

      {/* Séparateur */}
      <div
        style={{
          height: '1px',
          background: isPremium
            ? 'hsl(38 52% 58% / 0.10)'
            : 'hsl(248 22% 10%)',
          marginBottom: '20px',
        }}
      />

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              style={{
                fontSize: '11px',
                flexShrink: 0,
                marginTop: '2px',
                color: feat.highlight
                  ? isPremium ? 'hsl(38 58% 60%)' : 'hsl(275 58% 62%)'
                  : 'hsl(248 10% 36%)',
              }}
            >
              {feat.highlight ? '◆' : '○'}
            </span>
            <span
              style={{
                fontSize: '13px',
                lineHeight: 1.4,
                color: feat.highlight ? 'hsl(248 10% 72%)' : 'hsl(248 10% 46%)',
                fontWeight: feat.highlight ? 500 : 400,
              }}
            >
              {feat.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleCTA}
        disabled={isPending || isFree}
        style={{
          width: '100%',
          padding: '13px 20px',
          borderRadius: '14px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          cursor: isFree ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isPending ? 0.6 : 1,
          ...(isPremium
            ? {
                background: 'linear-gradient(135deg, hsl(38 55% 56%), hsl(38 48% 48%))',
                border: '1px solid hsl(38 52% 58% / 0.35)',
                color: 'hsl(38 80% 14%)',
                boxShadow: '0 4px 20px hsl(38 52% 52% / 0.25)',
              }
            : isFounder
              ? {
                  background: 'hsl(275 52% 44% / 0.12)',
                  border: '1px solid hsl(275 52% 58% / 0.25)',
                  color: 'hsl(275 58% 72%)',
                }
              : {
                  background: 'transparent',
                  border: '1px solid hsl(248 22% 16%)',
                  color: 'hsl(248 10% 44%)',
                }),
        }}
      >
        {isPending
          ? 'Chargement…'
          : isCurrentPlan && hasActiveSub
            ? 'Gérer mon abonnement'
            : plan.cta}
      </button>
    </div>
  )
}
