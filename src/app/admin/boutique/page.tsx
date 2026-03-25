// src/app/admin/boutique/page.tsx
import { prisma } from '@/lib/prisma'
import { BOUTIQUE_CATALOGUE, CATEGORY_META, formatPrice } from '@/lib/billing/boutique'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boutique — Admin Arcan' }

export default async function AdminBoutiquePage() {
  // Produits en DB (pour montrer stripePriceId, activation réelle)
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
  })
  const dbByKey = new Map(dbProducts.map(p => [p.productKey, p]))

  // Stats rapides
  const totalActive = dbProducts.filter(p => p.isActive).length
  const totalInDB = dbProducts.length
  const catalogueSize = BOUTIQUE_CATALOGUE.length

  return (
    <div className="space-y-8">

      {/* ── En-tête ── */}
      <div>
        <p
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'hsl(38 52% 58% / 0.6)',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          Admin
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 300,
            color: 'hsl(38 14% 88%)',
          }}
        >
          Boutique ARCAN
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(248 10% 44%)' }}>
          Catalogue produits, entitlements, activation.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Produits catalogue', value: catalogueSize },
          { label: 'Produits en DB', value: totalInDB },
          { label: 'Actifs', value: totalActive },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{
              background: 'hsl(248 30% 6%)',
              border: '1px solid hsl(248 22% 11%)',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '36px',
                fontWeight: 300,
                color: 'hsl(38 14% 88%)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'hsl(248 10% 40%)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Info seed ── */}
      {totalInDB === 0 && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: 'hsl(38 52% 58% / 0.06)',
            border: '1px solid hsl(38 52% 58% / 0.18)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'hsl(38 14% 84%)' }}>
            ⚠ Aucun produit en base de données
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(248 10% 44%)' }}>
            Lance <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">npm run db:seed</code> pour insérer les produits du catalogue.
          </p>
        </div>
      )}

      {/* ── Catalogue par catégorie ── */}
      {(Object.entries(CATEGORY_META) as [string, typeof CATEGORY_META[keyof typeof CATEGORY_META]][]).map(([catKey, catMeta]) => {
        const products = BOUTIQUE_CATALOGUE.filter(p => p.category === catKey)

        return (
          <section key={catKey} className="space-y-3">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '16px', color: 'hsl(38 52% 58%)' }}>{catMeta.symbol}</span>
              <h2
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'hsl(248 10% 60%)',
                  textTransform: 'uppercase',
                }}
              >
                {catMeta.label}
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: 'hsl(248 30% 10%)',
                  color: 'hsl(248 10% 38%)',
                }}
              >
                {products.length}
              </span>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid hsl(248 22% 11%)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'hsl(248 30% 6%)', borderBottom: '1px solid hsl(248 22% 11%)' }}>
                    {['Produit', 'Entitlement', 'Prix', 'Plans inclus', 'DB', 'Stripe'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left"
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: 'hsl(248 10% 38%)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => {
                    const dbProduct = dbByKey.get(product.key)
                    const isLast = i === products.length - 1

                    return (
                      <tr
                        key={product.key}
                        style={{
                          background: i % 2 === 0 ? 'hsl(248 30% 5%)' : 'transparent',
                          borderBottom: isLast ? 'none' : '1px solid hsl(248 22% 9%)',
                        }}
                      >
                        {/* Produit */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'hsl(38 52% 54%)', fontSize: '14px' }}>
                              {product.symbol}
                            </span>
                            <div>
                              <p className="font-medium" style={{ color: 'hsl(248 10% 78%)', fontSize: '13px' }}>
                                {product.title}
                              </p>
                              <p style={{ fontSize: '10px', color: 'hsl(248 10% 38%)' }}>
                                {product.key}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Entitlement */}
                        <td className="px-4 py-3">
                          <code
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: 'hsl(248 30% 9%)',
                              color: 'hsl(248 10% 52%)',
                            }}
                          >
                            {product.entitlementKey}
                          </code>
                        </td>

                        {/* Prix */}
                        <td className="px-4 py-3">
                          <span
                            style={{
                              fontFamily: "'Cormorant Garamond', Georgia, serif",
                              fontSize: '16px',
                              fontWeight: 500,
                              color: 'hsl(38 14% 82%)',
                            }}
                          >
                            {formatPrice(product.priceAmount)}
                          </span>
                          {product.originalAmount && (
                            <span
                              className="block text-xs line-through"
                              style={{ color: 'hsl(248 10% 34%)' }}
                            >
                              {formatPrice(product.originalAmount)}
                            </span>
                          )}
                        </td>

                        {/* Plans inclus */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {product.includedInPlans.length === 0 ? (
                              <span style={{ fontSize: '10px', color: 'hsl(248 10% 34%)' }}>—</span>
                            ) : (
                              product.includedInPlans.map(plan => (
                                <span
                                  key={plan}
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    padding: '2px 6px',
                                    borderRadius: '999px',
                                    background: plan === 'founder'
                                      ? 'hsl(38 52% 58% / 0.09)'
                                      : 'hsl(275 52% 48% / 0.09)',
                                    color: plan === 'founder'
                                      ? 'hsl(38 58% 62%)'
                                      : 'hsl(275 58% 66%)',
                                    border: `1px solid ${plan === 'founder'
                                      ? 'hsl(38 52% 58% / 0.18)'
                                      : 'hsl(275 52% 48% / 0.18)'}`,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {plan}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* En DB */}
                        <td className="px-4 py-3">
                          {dbProduct ? (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '2px 7px',
                                borderRadius: '999px',
                                background: dbProduct.isActive
                                  ? 'hsl(142 52% 42% / 0.09)'
                                  : 'hsl(0 52% 42% / 0.09)',
                                color: dbProduct.isActive
                                  ? 'hsl(142 52% 52%)'
                                  : 'hsl(0 52% 55%)',
                                border: `1px solid ${dbProduct.isActive
                                  ? 'hsl(142 52% 42% / 0.18)'
                                  : 'hsl(0 52% 42% / 0.18)'}`,
                              }}
                            >
                              {dbProduct.isActive ? '✓ Actif' : '✗ Inactif'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'hsl(248 10% 30%)' }}>
                              Non seedé
                            </span>
                          )}
                        </td>

                        {/* Stripe */}
                        <td className="px-4 py-3">
                          {dbProduct?.stripePriceId ? (
                            <code style={{ fontSize: '9px', color: 'hsl(142 52% 48%)' }}>
                              {String(dbProduct.stripePriceId).slice(0, 14)}…
                            </code>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'hsl(248 10% 28%)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {/* ── Plans vs Boutique ── */}
      <section className="space-y-3">
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'hsl(248 10% 60%)',
            textTransform: 'uppercase',
          }}
        >
          Inclus par plan
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid hsl(248 22% 11%)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(248 30% 6%)', borderBottom: '1px solid hsl(248 22% 11%)' }}>
                {['Produit', 'Gratuit', 'Premium', 'Fondateur'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      color: 'hsl(248 10% 38%)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOUTIQUE_CATALOGUE.map((product, i) => (
                <tr
                  key={product.key}
                  style={{
                    background: i % 2 === 0 ? 'hsl(248 30% 5%)' : 'transparent',
                    borderBottom: i < BOUTIQUE_CATALOGUE.length - 1 ? '1px solid hsl(248 22% 9%)' : 'none',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <span style={{ fontSize: '12px', color: 'hsl(248 10% 68%)' }}>
                      {product.symbol} {product.title}
                    </span>
                  </td>
                  {(['free', 'premium', 'founder'] as const).map(plan => {
                    const included = plan === 'founder'
                      ? true
                      : product.includedInPlans.includes(plan as 'premium' | 'founder')
                    return (
                      <td key={plan} className="px-4 py-2.5">
                        <span style={{
                          fontSize: '13px',
                          color: included ? 'hsl(142 52% 50%)' : 'hsl(248 10% 28%)',
                        }}>
                          {included ? '✓' : '—'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
