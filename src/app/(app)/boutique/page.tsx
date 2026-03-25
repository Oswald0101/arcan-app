// src/app/(app)/boutique/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  BOUTIQUE_CATALOGUE,
  CATEGORY_META,
  getUserEntitlementKeys,
  getProductStatus,
  formatPrice,
  type ProductCategory,
  type BoutiqueProduct,
} from '@/lib/billing/boutique'
import {
  ProductVisual,
  AvatarPackPreview,
  ThemePreview,
  PackContentsPreview,
} from '@/lib/billing/product-visuals'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boutique — Arcan' }

const CATEGORIES: ProductCategory[] = ['identite', 'experience', 'codex', 'packs']

interface BoutiquePageProps {
  searchParams: Promise<{ cat?: string }>
}

export default async function BoutiquePage({ searchParams }: BoutiquePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const activeCategory = (CATEGORIES.includes(params.cat as ProductCategory)
    ? params.cat
    : 'identite') as ProductCategory

  const [subscription, entitlementKeys] = await Promise.all([
    prisma.userSubscription.findFirst({
      where: { userId: user.id, status: { in: ['active', 'trialing'] } },
      include: { plan: true },
    }),
    getUserEntitlementKeys(user.id),
  ])

  const rawPlanKey = subscription?.plan?.planKey ?? 'free'
  const planKey = rawPlanKey.replace(/_monthly|_yearly/, '')

  const products = BOUTIQUE_CATALOGUE.filter(p => p.category === activeCategory)

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
          Boutique
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
          Révèle ce qui est en toi.
        </h1>
        <p className="text-sm mt-1.5" style={{ color: 'hsl(248 10% 44%)' }}>
          Personnalise ton espace. Enrichis ton Codex.
        </p>
      </div>

      {/* ── Bannière plan ── */}
      <PlanBanner planKey={planKey} />

      {/* ── Tabs catégories ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const isActive = cat === activeCategory
          return (
            <Link
              key={cat}
              href={`/boutique?cat=${cat}`}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200"
              style={{
                background: isActive ? 'hsl(38 52% 58% / 0.1)' : 'hsl(248 30% 7%)',
                border: `1px solid ${isActive ? 'hsl(38 52% 58% / 0.25)' : 'hsl(248 22% 13%)'}`,
                color: isActive ? 'hsl(38 58% 68%)' : 'hsl(248 10% 44%)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '13px' }}>{meta.symbol}</span>
              <span style={{ fontSize: '12px' }}>{meta.label}</span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  background: 'hsl(248 30% 10%)',
                  color: 'hsl(248 10% 38%)',
                }}
              >
                {meta.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* ── Grille produits ── */}
      <div className="space-y-3">
        {products.map((product) => {
          const status = getProductStatus(product, entitlementKeys, planKey)
          return (
            <ProductCard
              key={product.key}
              product={product}
              status={status}
            />
          )
        })}
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-xs" style={{ color: 'hsl(248 10% 28%)' }}>
          Les achats sont définitifs et non remboursables.
        </p>
        {planKey === 'free' && (
          <Link
            href="/abonnement"
            className="inline-block text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'hsl(38 52% 60%)' }}
          >
            Passer Premium pour débloquer plus →
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Bannière plan ─────────────────────────────────────────────────────────────

function PlanBanner({ planKey }: { planKey: string }) {
  const isFounder = planKey === 'founder'
  const isPremium = planKey === 'premium'

  return (
    <div
      className="rounded-2xl px-4 py-3 mb-6 flex items-center justify-between gap-3"
      style={{
        background: isFounder
          ? 'hsl(38 52% 58% / 0.06)'
          : isPremium
            ? 'hsl(275 52% 48% / 0.06)'
            : 'hsl(248 30% 6%)',
        border: `1px solid ${isFounder
          ? 'hsl(38 52% 58% / 0.18)'
          : isPremium
            ? 'hsl(275 52% 48% / 0.18)'
            : 'hsl(248 22% 12%)'}`,
      }}
    >
      <div>
        <p className="text-xs font-medium" style={{ color: 'hsl(38 14% 84%)' }}>
          {isFounder
            ? 'Fondateur — Tout est inclus dans ton plan'
            : isPremium
              ? 'Premium — Certains produits sont déjà inclus'
              : 'Plan Gratuit — Acquiers des éléments à l\'unité'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 40%)' }}>
          {isFounder
            ? 'Tu as accès à la totalité de la boutique.'
            : isPremium
              ? 'Les éléments marqués "Inclus" sont déjà débloqués.'
              : 'Passe Premium pour débloquer plusieurs avantages inclus.'}
        </p>
      </div>
      <span
        className="flex-shrink-0"
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          padding: '4px 10px',
          borderRadius: '999px',
          background: isFounder
            ? 'hsl(38 52% 58% / 0.12)'
            : isPremium
              ? 'hsl(275 52% 48% / 0.12)'
              : 'hsl(248 30% 10%)',
          color: isFounder
            ? 'hsl(38 58% 68%)'
            : isPremium
              ? 'hsl(275 58% 72%)'
              : 'hsl(248 10% 46%)',
          border: `1px solid ${isFounder
            ? 'hsl(38 52% 58% / 0.22)'
            : isPremium
              ? 'hsl(275 52% 48% / 0.22)'
              : 'hsl(248 22% 18%)'}`,
          textTransform: 'uppercase',
        }}
      >
        {isFounder ? 'Fondateur' : isPremium ? 'Premium' : 'Gratuit'}
      </span>
    </div>
  )
}

// ── Carte produit avec visuel ─────────────────────────────────────────────────

function ProductCard({
  product,
  status,
}: {
  product: BoutiqueProduct
  status: 'included' | 'owned' | 'available' | 'founder_only'
}) {
  const isAccessible = status === 'included' || status === 'owned'
  const isPack = product.category === 'packs'

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: isPack && isAccessible
          ? 'hsl(38 52% 58% / 0.05)'
          : isPack
            ? 'hsl(248 30% 6%)'
            : isAccessible
              ? 'hsl(38 52% 58% / 0.03)'
              : 'hsl(248 30% 4%)',
        border: `1px solid ${isPack
          ? isAccessible ? 'hsl(38 52% 58% / 0.20)' : 'hsl(38 52% 58% / 0.10)'
          : isAccessible ? 'hsl(38 52% 58% / 0.12)' : 'hsl(248 22% 10%)'}`,
        boxShadow: isPack
          ? `0 0 ${isAccessible ? '30px' : '20px'} hsl(38 52% 58% / ${isAccessible ? '0.06' : '0.03'})`
          : 'none',
      }}
    >
      {/* Bande Pack */}
      {isPack && (
        <div
          style={{
            padding: '6px 16px',
            background: 'hsl(38 52% 58% / 0.07)',
            borderBottom: '1px solid hsl(38 52% 58% / 0.10)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'hsl(38 58% 60%)',
                textTransform: 'uppercase',
              }}
            >
              ◆ Pack
            </span>
            {product.originalAmount && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'hsl(142 52% 42% / 0.10)',
                  color: 'hsl(142 52% 55%)',
                  border: '1px solid hsl(142 52% 42% / 0.20)',
                }}
              >
                −{Math.round((1 - product.priceAmount / product.originalAmount) * 100)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4 flex items-start gap-3 sm:gap-4">

        {/* Visuel produit */}
        <ProductVisual
          productKey={product.key}
          category={product.category}
          symbol={product.symbol}
          isAccessible={isAccessible}
          size="sm"
        />

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isAccessible ? 'hsl(38 14% 90%)' : 'hsl(248 10% 68%)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {product.title}
                </h3>
                {product.isNew && (
                  <span
                    style={{
                      fontSize: '8px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '2px 5px',
                      borderRadius: '999px',
                      background: 'hsl(142 52% 42% / 0.10)',
                      color: 'hsl(142 52% 55%)',
                      border: '1px solid hsl(142 52% 42% / 0.20)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'hsl(248 10% 40%)' }}>
                {product.subtitle}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: 'hsl(248 10% 46%)', marginBottom: '8px' }}
          >
            {product.description}
          </p>

          {/* Previews spécifiques par type */}
          {product.type === 'avatar' && (
            <AvatarPackPreview productKey={product.key} isAccessible={isAccessible} />
          )}
          {product.type === 'theme' && (
            <ThemePreview productKey={product.key} isAccessible={isAccessible} />
          )}
          {product.type === 'pack' && (
            <PackContentsPreview productKey={product.key} isAccessible={isAccessible} />
          )}

          <div style={{ marginTop: '10px' }}>
            <PriceDisplay product={product} status={status} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'included' | 'owned' | 'available' | 'founder_only' }) {
  if (status === 'included') {
    return (
      <span
        className="flex-shrink-0"
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '3px 7px',
          borderRadius: '999px',
          background: 'hsl(38 52% 58% / 0.09)',
          color: 'hsl(38 58% 64%)',
          border: '1px solid hsl(38 52% 58% / 0.18)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        ✓ Inclus
      </span>
    )
  }
  if (status === 'owned') {
    return (
      <span
        className="flex-shrink-0"
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '3px 7px',
          borderRadius: '999px',
          background: 'hsl(142 52% 42% / 0.09)',
          color: 'hsl(142 52% 55%)',
          border: '1px solid hsl(142 52% 42% / 0.18)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        ✓ Obtenu
      </span>
    )
  }
  if (status === 'founder_only') {
    return (
      <span
        className="flex-shrink-0"
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '3px 7px',
          borderRadius: '999px',
          background: 'hsl(275 52% 48% / 0.09)',
          color: 'hsl(275 58% 68%)',
          border: '1px solid hsl(275 52% 48% / 0.18)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Fondateur
      </span>
    )
  }
  return null
}

function PriceDisplay({
  product,
  status,
}: {
  product: BoutiqueProduct
  status: 'included' | 'owned' | 'available' | 'founder_only'
}) {
  if (status === 'included') {
    return (
      <span className="text-xs" style={{ color: 'hsl(248 10% 32%)' }}>
        Déjà inclus dans ton plan
      </span>
    )
  }
  if (status === 'owned') {
    return (
      <span className="text-xs" style={{ color: 'hsl(248 10% 32%)' }}>
        Déjà dans ton espace
      </span>
    )
  }
  if (status === 'founder_only') {
    return (
      <Link
        href="/abonnement"
        className="text-xs transition-opacity hover:opacity-70"
        style={{ color: 'hsl(275 52% 60%)' }}
      >
        Passer Fondateur →
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '20px',
            fontWeight: 500,
            color: 'hsl(38 14% 86%)',
            lineHeight: 1,
          }}
        >
          {formatPrice(product.priceAmount)}
        </span>
        {product.originalAmount && (
          <span
            className="text-xs line-through"
            style={{ color: 'hsl(248 10% 32%)' }}
          >
            {formatPrice(product.originalAmount)}
          </span>
        )}
      </div>
      <button
        className="btn-primary"
        style={{ fontSize: '11px', padding: '5px 14px' }}
        disabled
        title="Paiement disponible prochainement"
      >
        Obtenir
      </button>
    </div>
  )
}
