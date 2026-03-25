// src/components/billing/product-card.tsx
'use client'

import { useTransition } from 'react'
import { checkoutProductAction } from '@/lib/billing/actions'
import type { Product } from '@/types/billing'

interface ProductCardProps {
  product: Product & { alreadyOwned: boolean }
}

const TYPE_LABELS: Record<string, string> = {
  avatar: 'Avatar', theme: 'Thème', guide_skin: 'Skin guide',
  pack: 'Pack', codex_export: 'Export Codex', codex_edition: 'Édition Codex', other: 'Autre',
}

export function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition()

  // payload peut contenir assetUrl
  const assetUrl = (product.payload as any)?.assetUrl as string | undefined

  function handleBuy() {
    if (product.alreadyOwned) return
    startTransition(async () => {
      const result = await checkoutProductAction(product.id)
      if (result.success && result.data) window.location.href = result.data.url
    })
  }

  const priceDisplay = (product.priceAmount / 100).toFixed(2).replace('.', ',')

  return (
    <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
      {assetUrl && (
        <div className="aspect-square w-full rounded-xl bg-muted overflow-hidden">
          <img src={assetUrl} alt={product.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{TYPE_LABELS[product.productType] ?? 'Produit'}</p>
        <p className="font-medium text-sm">{product.title}</p>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
      </div>
      {product.alreadyOwned ? (
        <div className="rounded-xl bg-muted/40 py-2 text-center text-xs text-muted-foreground">Déjà possédé</div>
      ) : (
        <button
          onClick={handleBuy}
          disabled={isPending}
          className="w-full rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50 hover:opacity-90"
        >
          {isPending ? 'Chargement…' : `${priceDisplay} €`}
        </button>
      )}
    </div>
  )
}
