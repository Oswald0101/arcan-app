// src/components/billing/plan-card.tsx
'use client'

import { useTransition } from 'react'
import { checkoutSubscriptionAction, openBillingPortalAction } from '@/lib/billing/actions'
import type { SubscriptionPlan, PlanKey } from '@/types/billing'

interface PlanCardProps {
  plan: SubscriptionPlan
  currentPlanKey: PlanKey
  isCurrentPlan: boolean
}

const PLAN_ORDER: PlanKey[] = ['free', 'premium', 'founder']

export function PlanCard({ plan, currentPlanKey, isCurrentPlan }: PlanCardProps) {
  const [isPending, startTransition] = useTransition()

  const priceDisplay = plan.priceAmount === 0
    ? 'Gratuit'
    : `${(plan.priceAmount / 100).toFixed(2).replace('.', ',')} €`

  const periodLabel = plan.billingPeriod === 'yearly' ? '/an'
    : plan.billingPeriod === 'monthly' ? '/mois'
    : ''

  function handleSubscribe() {
    if (plan.planKey === 'free') return
    startTransition(async () => {
      if (isCurrentPlan) {
        const result = await openBillingPortalAction()
        if (result.success && result.data) window.location.href = result.data.url
        return
      }
      const result = await checkoutSubscriptionAction({ planKey: plan.planKey as 'premium' | 'founder' })
      if (result.success && result.data) window.location.href = result.data.url
    })
  }

  const isUpgrade = PLAN_ORDER.indexOf(plan.planKey as PlanKey) > PLAN_ORDER.indexOf(currentPlanKey)

  return (
    <div className={`rounded-2xl border p-6 space-y-5 ${isCurrentPlan ? 'border-foreground/40 bg-foreground/5' : 'border-border bg-background'}`}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{plan.title}</p>
          {isCurrentPlan && <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">Actif</span>}
        </div>
        {plan.description && <p className="text-xs text-muted-foreground">{plan.description}</p>}
      </div>

      <div>
        <p className="text-2xl font-medium">
          {priceDisplay}
          {plan.priceAmount > 0 && <span className="text-sm font-normal text-muted-foreground">{periodLabel}</span>}
        </p>
      </div>

      <ul className="space-y-1.5">
        {(plan.features as string[]).map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-foreground/60 flex-shrink-0">✓</span>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {plan.planKey !== 'free' && (
        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-opacity disabled:opacity-50 ${
            isCurrentPlan ? 'border border-border bg-background hover:bg-muted'
              : isUpgrade ? 'bg-foreground text-background hover:opacity-90'
              : 'border border-border bg-background hover:bg-muted'
          }`}
        >
          {isPending ? 'Chargement…'
            : isCurrentPlan ? 'Gérer mon abonnement'
            : isUpgrade ? `Passer à ${plan.title}`
            : `Choisir ${plan.title}`}
        </button>
      )}
    </div>
  )
}
