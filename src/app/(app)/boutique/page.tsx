// src/app/(app)/boutique/page.tsx
// Refonte : Boutique premium, désirabilité visuelle, mobile-first

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
import { ProductVisual } from '@/lib/billing/product-visuals'
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
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6 pb-4 animate-fade-up">

      {/* ── En-tête — plus immersif ── */}
      <div className="space-y-3">
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'hsl(38 52% 58% / 0.70)',
            textTransform: 'uppercase',
          }}
        >
          Boutique
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(28px, 7vw, 40px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'hsl(38 14% 90%)',
            lineHeight: 1.1,
          }}
        >
          Révèle ce qui est en toi.
        </h1>
        <p className="text-base" style={{ color: 'hsl(248 10% 48%)' }}>
          Personnalise ton espace. Enrichis ton Codex. Exprime ton essence.
        </p>
        <div className="divider-gold" />
      </div>

      {/* ── Bannière plan ── */}
      <PlanBanner planKey={planKey} />

      {/* ── Tabs catégories — plus visibles ── */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const isActive = cat === activeCategory
          return (
            <Link
              key={cat}
              href={`/boutique?cat=${cat}`}
              className="flex-shrink-0 flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 active:scale-95"
              style={{
                background: isActive ? 'hsl(38 52% 58% / 0.12)' : 'hsl(248 30% 7%)',
                border: `1px solid ${isActive ? 'hsl(38 52% 58% / 0.30)' : 'hsl(248 22% 14%)'}`,
                color: isActive ? 'hsl(38 58% 68%)' : 'hsl(248 10% 48%)',
                fontSize: '14px',
                minHeight: '40px',
              }}
            >
              <span style={{ fontSize: '16px' }}>{meta.symbol}</span>
              <span>{meta.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'hsl(248 30% 10%)',
                  color: 'hsl(248 10% 42%)',
                  fontWeight: 600,
                }}
              >
                {meta.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* ── Grille produits — meilleure présentation ── */}
      <div className="space-y-4">
        {products.map((product, idx) => {
          const status = getProductStatus(product, entitlementKeys, planKey)
          return (
            <div
              key={product.key}
              className="animate-fade-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <ProductCard
                product={product}
                status={status}
              />
            </div>
          )
        })}
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-sm" style={{ color: 'hsl(248 10% 40%)' }}>
          Les achats sont définitifs et non remboursables.
        </p>
        {planKey === 'free' && (
          <Link
            href="/abonnement"
            className="inline-block text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'hsl(38 52% 65%)' }}
          >
            Passe Premium pour débloquer plus →
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Composant : Bannière plan ──

function PlanBanner({ planKey }: { planKey: string }) {
  if (planKey !== 'free') return null

  return (
    <Link href="/abonnement" className="block">
      <div
        className="rounded-xl p-5 text-center space-y-3 card-hover"
        style={{
          background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.10) 0%, hsl(265 50% 15% / 0.40) 100%)',
          border: '1px solid hsl(38 52% 58% / 0.22)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="top-line-gold" />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '20px',
            fontWeight: 400,
            color: 'hsl(38 65% 75%)',
          }}
        >
          Passer Premium
        </p>
        <p className="text-sm" style={{ color: 'hsl(248 10% 52%)' }}>
          Débloque tous les produits et contenus exclusifs
        </p>
        <div
          className="inline-block text-xs font-semibold px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(38 52% 52%), hsl(38 62% 66%))',
            color: 'hsl(246 40% 8%)',
            letterSpacing: '0.05em',
          }}
        >
          Voir les plans →
        </div>
      </div>
    </Link>
  )
}

// ── Composant : Carte produit ──

interface ProductCardProps {
  product: BoutiqueProduct
  status: ReturnType<typeof getProductStatus>
}

function ProductCard({ product, status }: ProductCardProps) {
  const isIncluded = status === 'included'
  const isOwned = status === 'owned'
  const isFounderOnly = status === 'founder_only'
  const isAvailable = status === 'available'
  const isAccessible = isIncluded || isOwned
  const price = formatPrice(product.priceAmount)

  return (
    <Link href={`/boutique/${product.key}`} className="block group">
      <div
        className="rounded-xl overflow-hidden card-hover"
        style={{
          background: isAccessible
            ? 'hsl(248 30% 8%)'
            : 'linear-gradient(145deg, hsl(250 35% 9%) 0%, hsl(260 38% 11%) 100%)',
          border: `1px solid ${isAccessible ? 'hsl(148 40% 35% / 0.25)' : isAvailable ? 'hsl(38 52% 58% / 0.20)' : 'hsl(248 22% 14%)'}`,
          position: 'relative',
        }}
      >
        {isAvailable && <div className="top-line-gold" />}

        {/* Visuel produit */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(250 35% 10%) 0%, hsl(260 40% 13%) 100%)',
            height: '140px',
          }}
        >
          <ProductVisual
            productKey={product.key}
            category={product.category}
            symbol={product.symbol}
            isAccessible={isAccessible || isAvailable}
          />

          {/* Badge statut */}
          {isIncluded && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: 'hsl(148 50% 40% / 0.20)',
                border: '1px solid hsl(148 50% 40% / 0.40)',
                color: 'hsl(148 52% 58%)',
              }}
            >
              ✓ Inclus
            </div>
          )}
          {isOwned && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: 'hsl(148 50% 40% / 0.20)',
                border: '1px solid hsl(148 50% 40% / 0.40)',
                color: 'hsl(148 52% 58%)',
              }}
            >
              ✓ Possédé
            </div>
          )}
          {isFounderOnly && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: 'hsl(38 52% 58% / 0.12)',
                border: '1px solid hsl(38 52% 58% / 0.25)',
                color: 'hsl(38 62% 68%)',
              }}
            >
              ★ Fondateur
            </div>
          )}
          {product.isNew && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'hsl(265 55% 50% / 0.30)',
                border: '1px solid hsl(265 55% 50% / 0.40)',
                color: 'hsl(265 70% 80%)',
                letterSpacing: '0.05em',
              }}
            >
              NOUVEAU
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-3">
          <div>
            <h3
              className="font-serif text-lg font-medium"
              style={{ color: 'hsl(38 22% 90%)' }}
            >
              {product.title}
            </h3>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'hsl(38 52% 58%)' }}>
              {product.subtitle}
            </p>
            <p className="text-sm mt-2" style={{ color: 'hsl(248 10% 48%)' }}>
              {product.description}
            </p>
          </div>

          {/* Pied de carte */}
          <div className="flex items-center justify-between pt-1">
            <div />
            {isAvailable && (
              <div className="flex items-center gap-2">
                {product.originalAmount && (
                  <span
                    className="text-sm"
                    style={{ color: 'hsl(248 10% 38%)', textDecoration: 'line-through' }}
                  >
                    {formatPrice(product.originalAmount)}
                  </span>
                )}
                <span
                  className="text-base font-semibold"
                  style={{ color: 'hsl(38 52% 65%)' }}
                >
                  {price}
                </span>
              </div>
            )}
            {isFounderOnly && (
              <span className="text-xs" style={{ color: 'hsl(248 10% 42%)' }}>
                Plan Fondateur requis
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
