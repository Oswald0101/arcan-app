// Refonte Ultra-Premium : Boutique immersive avec désirabilité visuelle, glows et relief

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
    <div className="mx-auto max-w-lg px-4 py-8 space-y-8 pb-6 animate-fade-up">

      {/* ── En-tête — ultra-immersif ── */}
      <div className="space-y-5">
        <p
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: 'hsl(38 65% 72%)',
            textTransform: 'uppercase',
          }}
        >
          ✨ Boutique
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(36px, 9vw, 52px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            color: 'hsl(38 14% 96%)',
            lineHeight: 1.1,
            textShadow: '0 4px 16px hsl(246 40% 2% / 0.40)',
          }}
        >
          Révèle ce qui est en toi.
        </h1>
        <p className="text-base font-medium leading-relaxed" style={{ color: 'hsl(248 10% 52%)' }}>
          Personnalise ton espace. Enrichis ton Codex. Exprime ton essence.
        </p>
      </div>

      {/* ── Bannière plan — ultra-premium ── */}
      <PlanBanner planKey={planKey} />

      {/* ── Tabs catégories — ultra-visibles ── */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const isActive = cat === activeCategory
          return (
            <Link
              key={cat}
              href={`/boutique?cat=${cat}`}
              className="flex-shrink-0 flex items-center gap-2.5 rounded-lg px-5 py-3 font-semibold transition-all duration-200 active:scale-95"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, hsl(38 52% 58% / 0.18) 0%, hsl(38 52% 58% / 0.08) 100%)'
                  : 'linear-gradient(135deg, hsl(248 30% 10%) 0%, hsl(248 28% 8%) 100%)',
                border: isActive
                  ? '1.5px solid hsl(38 52% 58% / 0.40)'
                  : '1.5px solid hsl(248 22% 18%)',
                color: isActive ? 'hsl(38 65% 75%)' : 'hsl(248 10% 52%)',
                fontSize: '15px',
                minHeight: '44px',
                boxShadow: isActive ? '0 0 20px hsl(38 52% 58% / 0.12)' : 'none',
              }}
            >
              <span style={{ fontSize: '18px' }}>{meta.symbol}</span>
              <span>{meta.label}</span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: isActive ? 'hsl(38 52% 58% / 0.20)' : 'hsl(248 30% 12%)',
                  color: isActive ? 'hsl(38 65% 72%)' : 'hsl(248 10% 48%)',
                  fontWeight: 700,
                }}
              >
                {meta.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* ── Grille produits — ultra-désirable ── */}
      <div className="space-y-5">
        {products.map((product, idx) => {
          const status = getProductStatus(product, entitlementKeys, planKey)
          return (
            <div
              key={product.key}
              className="animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
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
      <div className="mt-10 text-center space-y-4">
        <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 48%)' }}>
          Les achats sont définitifs et non remboursables.
        </p>
        {planKey === 'free' && (
          <Link
            href="/abonnement"
            className="inline-block text-sm font-semibold transition-all hover:text-accent"
            style={{ color: 'hsl(38 65% 75%)' }}
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
        className="rounded-2xl p-7 text-center space-y-3 card-hover transition-all"
        style={{
          background: 'linear-gradient(135deg, hsl(38 52% 58% / 0.14) 0%, hsl(38 52% 58% / 0.06) 100%)',
          border: '1.5px solid hsl(38 52% 58% / 0.25)',
          boxShadow: '0 0 32px hsl(38 52% 58% / 0.08)',
        }}
      >
        <p className="text-base font-semibold" style={{ color: 'hsl(38 65% 75%)' }}>
          ✨ Plan Premium
        </p>
        <p className="text-sm font-medium" style={{ color: 'hsl(248 10% 52%)' }}>
          Débloque tous les produits et contenus exclusifs
        </p>
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
  const isOwned = status.owned
  const isLocked = status.locked
  const isPurchasable = status.purchasable
  const price = formatPrice(product.priceCents)

  return (
    <Link href={`/boutique/${product.key}`} className="block group">
      <div
        className="rounded-2xl overflow-hidden card-hover transition-all"
        style={{
          background: 'linear-gradient(135deg, hsl(248 32% 10%) 0%, hsl(250 30% 8%) 100%)',
          border: '1.5px solid hsl(38 35% 25% / 0.15)',
          boxShadow: '0 0 40px hsl(38 52% 58% / 0.06)',
        }}
      >
        {/* Visuel produit — avec glow */}
        <div
          className="relative aspect-video bg-gradient-to-br from-surface-elevated to-surface overflow-hidden flex items-center justify-center group-hover:brightness-110 transition-all"
          style={{
            background: 'linear-gradient(135deg, hsl(265 40% 12%) 0%, hsl(250 35% 10%) 100%)',
            boxShadow: 'inset 0 1px 0 hsl(248 100% 100% / 0.05)',
          }}
        >
          <ProductVisual product={product} />

          {/* Badge statut — ultra-visible */}
          {isOwned && (
            <div
              className="absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(148 50% 40% / 0.25) 0%, hsl(148 45% 35% / 0.15) 100%)',
                border: '1.5px solid hsl(148 55% 50% / 0.40)',
                color: 'hsl(148 60% 68%)',
                boxShadow: '0 0 20px hsl(148 55% 50% / 0.15)',
              }}
            >
              ✓ Possédé
            </div>
          )}
          {isLocked && (
            <div
              className="absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(248 30% 20% / 0.25) 0%, hsl(248 28% 15% / 0.15) 100%)',
                border: '1.5px solid hsl(248 20% 30% / 0.40)',
                color: 'hsl(248 10% 68%)',
                boxShadow: '0 0 20px hsl(248 20% 30% / 0.10)',
              }}
            >
              🔒 Verrouillé
            </div>
          )}
        </div>

        {/* Contenu — avec relief */}
        <div className="p-6 space-y-4">
          <div>
            <h3
              className="font-serif text-xl font-medium"
              style={{
                color: 'hsl(38 14% 94%)',
                textShadow: '0 2px 6px hsl(246 40% 2% / 0.25)',
              }}
            >
              {product.name}
            </h3>
            <p className="text-sm mt-2 font-medium leading-relaxed" style={{ color: 'hsl(248 10% 54%)' }}>
              {product.description}
            </p>
          </div>

          {/* Pied de carte */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              {product.tags?.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-muted text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
            {!isOwned && isPurchasable && (
              <span
                className="text-lg font-bold"
                style={{ color: 'hsl(38 65% 75%)' }}
              >
                {price}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
