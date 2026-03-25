// src/lib/billing/boutique.ts
// Catalogue complet de la boutique ARCAN

import { prisma } from '@/lib/prisma'

export type ProductCategory = 'identite' | 'experience' | 'codex' | 'packs'

export interface BoutiqueProduct {
  key: string
  category: ProductCategory
  type: 'avatar' | 'theme' | 'guide_skin' | 'pack' | 'codex_export' | 'codex_edition'
  title: string
  subtitle: string
  description: string
  symbol: string
  priceAmount: number       // centimes
  originalAmount?: number   // prix barré pour les packs
  entitlementKey: string
  includedInPlans: Array<'premium' | 'founder'>
  isNew?: boolean
}

export const BOUTIQUE_CATALOGUE: BoutiqueProduct[] = [
  // ── IDENTITÉ ──────────────────────────────────────────────────────────────
  {
    key: 'avatar_pack_lumieres',
    category: 'identite',
    type: 'avatar',
    title: 'Pack Lumières',
    subtitle: '10 avatars lumineux',
    description: 'Dix symboles rayonnants pour exprimer ta part la plus claire.',
    symbol: '◑',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'avatar_pack_lumieres',
    includedInPlans: ['premium', 'founder'],
  },
  {
    key: 'avatar_pack_ombres',
    category: 'identite',
    type: 'avatar',
    title: 'Pack Ombres',
    subtitle: '10 avatars symboliques',
    description: 'Dix symboles sombres et profonds pour incarner la face cachée de ton être.',
    symbol: '◐',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'avatar_pack_ombres',
    includedInPlans: ['founder'],
  },
  {
    key: 'avatar_pack_arcanes',
    category: 'identite',
    type: 'avatar',
    title: 'Pack Arcanes',
    subtitle: '10 avatars rares',
    description: 'La collection la plus rare. Dix symboles sacrés réservés à ceux qui cherchent le plus loin.',
    symbol: '✦',
    priceAmount: 499,   // 4,99 €
    entitlementKey: 'avatar_pack_arcanes',
    includedInPlans: ['founder'],
    isNew: true,
  },
  {
    key: 'guide_skin_oracle',
    category: 'identite',
    type: 'guide_skin',
    title: 'Guide Oracle',
    subtitle: 'Style contemplatif',
    description: 'Ton guide prend la forme d\'un oracle lumineux, calme et profond dans ses réponses.',
    symbol: '⊙',
    priceAmount: 199,   // 1,99 €
    entitlementKey: 'guide_skin_oracle',
    includedInPlans: ['premium', 'founder'],
  },
  {
    key: 'guide_skin_sphinx',
    category: 'identite',
    type: 'guide_skin',
    title: 'Guide Sphinx',
    subtitle: 'Style énigmatique',
    description: 'Ton guide revêt la forme du gardien des secrets anciens. Mystérieux et précis.',
    symbol: '△',
    priceAmount: 199,   // 1,99 €
    entitlementKey: 'guide_skin_sphinx',
    includedInPlans: ['founder'],
  },
  {
    key: 'guide_skin_ombre',
    category: 'identite',
    type: 'guide_skin',
    title: 'Guide de l\'Ombre',
    subtitle: 'Style introspectif',
    description: 'Plus sombre, plus direct. Ce guide descend avec toi dans les profondeurs.',
    symbol: '◈',
    priceAmount: 199,   // 1,99 €
    entitlementKey: 'guide_skin_ombre',
    includedInPlans: ['founder'],
  },

  // ── EXPÉRIENCE ─────────────────────────────────────────────────────────────
  {
    key: 'theme_aube',
    category: 'experience',
    type: 'theme',
    title: 'Thème Aube',
    subtitle: 'Lavande & or',
    description: 'Un univers visuel doux, lumineux, entre brume matinale et clarté intérieure.',
    symbol: '◇',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'theme_aube',
    includedInPlans: ['premium', 'founder'],
  },
  {
    key: 'theme_minuit',
    category: 'experience',
    type: 'theme',
    title: 'Thème Minuit',
    subtitle: 'Bleu profond & étoiles',
    description: 'L\'obscurité absolue. Un bleu nuit intense parsemé d\'éclats stellaires.',
    symbol: '✧',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'theme_minuit',
    includedInPlans: ['founder'],
  },
  {
    key: 'theme_feu_sacre',
    category: 'experience',
    type: 'theme',
    title: 'Thème Feu Sacré',
    subtitle: 'Rouge & ambre',
    description: 'La chaleur du feu intérieur. Un univers ardent pour ceux qui avancent avec intensité.',
    symbol: '◉',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'theme_feu_sacre',
    includedInPlans: ['founder'],
  },
  {
    key: 'theme_abime',
    category: 'experience',
    type: 'theme',
    title: 'Thème Abîme',
    subtitle: 'Vert noir & profondeur',
    description: 'Descends dans les couches les plus sombres. Un vert abyssal pour l\'introspection totale.',
    symbol: '◆',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'theme_abime',
    includedInPlans: ['founder'],
  },

  // ── CODEX ──────────────────────────────────────────────────────────────────
  {
    key: 'codex_export_premium',
    category: 'codex',
    type: 'codex_export',
    title: 'Export Codex Premium',
    subtitle: 'PDF haute qualité',
    description: 'Exporte ton Codex en PDF avec une mise en page soignée, prête à être partagée ou imprimée.',
    symbol: '▣',
    priceAmount: 199,   // 1,99 €
    entitlementKey: 'codex_export_pdf',
    includedInPlans: ['premium', 'founder'],
  },
  {
    key: 'codex_edition_avancee',
    category: 'codex',
    type: 'codex_edition',
    title: 'Édition Codex Avancée',
    subtitle: 'Polices & mises en page enrichies',
    description: 'Polices premium, sections avancées et mises en page élaborées pour un Codex à la hauteur de ton chemin.',
    symbol: '◫',
    priceAmount: 299,   // 2,99 €
    entitlementKey: 'codex_edition_full',
    includedInPlans: ['founder'],
  },
  {
    key: 'codex_manifeste_enrichi',
    category: 'codex',
    type: 'codex_edition',
    title: 'Manifeste Enrichi',
    subtitle: 'Présentation luxueuse',
    description: 'Ton Manifeste présenté dans une mise en page digne de ce qu\'il représente.',
    symbol: '◰',
    priceAmount: 199,   // 1,99 €
    entitlementKey: 'codex_manifeste_enrichi',
    includedInPlans: ['founder'],
  },

  // ── PACKS ──────────────────────────────────────────────────────────────────
  {
    key: 'pack_fondation',
    category: 'packs',
    type: 'pack',
    title: 'Pack Fondation',
    subtitle: 'Pack Lumières + Thème Aube',
    description: 'L\'essentiel pour commencer à personnaliser ton espace ARCAN. Vendu séparément : 5,98 €.',
    symbol: '◎',
    priceAmount: 499,   // 4,99 € — économie ~17%
    originalAmount: 598,
    entitlementKey: 'pack_fondation',
    includedInPlans: ['founder'],
  },
  {
    key: 'pack_initie',
    category: 'packs',
    type: 'pack',
    title: 'Pack Initié',
    subtitle: 'Arcanes + Sphinx + Minuit',
    description: 'Trois éléments rares pour une expérience profondément personnalisée. Vendu séparément : 9,97 €.',
    symbol: '⊛',
    priceAmount: 799,   // 7,99 € — économie ~20%
    originalAmount: 997,
    entitlementKey: 'pack_initie',
    includedInPlans: ['founder'],
    isNew: true,
  },
  {
    key: 'pack_revelation',
    category: 'packs',
    type: 'pack',
    title: 'Pack Révélation',
    subtitle: 'L\'expérience totale ARCAN',
    description: 'Toute la boutique ARCAN, réunie en une seule collection définitive.',
    symbol: '✦',
    priceAmount: 1299,  // 12,99 € — économie majeure
    originalAmount: 3387,
    entitlementKey: 'pack_revelation',
    includedInPlans: ['founder'],
  },
]

export const CATEGORY_META: Record<ProductCategory, {
  label: string
  description: string
  symbol: string
  count: number
}> = {
  identite: {
    label: 'Identité',
    description: 'Avatars, skins du Guide',
    symbol: '◐',
    count: BOUTIQUE_CATALOGUE.filter(p => p.category === 'identite').length,
  },
  experience: {
    label: 'Expérience',
    description: 'Thèmes visuels',
    symbol: '✧',
    count: BOUTIQUE_CATALOGUE.filter(p => p.category === 'experience').length,
  },
  codex: {
    label: 'Codex',
    description: 'Exports & éditions',
    symbol: '▣',
    count: BOUTIQUE_CATALOGUE.filter(p => p.category === 'codex').length,
  },
  packs: {
    label: 'Packs',
    description: 'Bundles à prix réduit',
    symbol: '◎',
    count: BOUTIQUE_CATALOGUE.filter(p => p.category === 'packs').length,
  },
}

export async function getUserEntitlementKeys(userId: string): Promise<Set<string>> {
  const entitlements = await prisma.userEntitlement.findMany({
    where: { userId, isActive: true },
    select: { entitlementKey: true },
  })
  return new Set(entitlements.map(e => e.entitlementKey))
}

export function getProductStatus(
  product: BoutiqueProduct,
  userEntitlements: Set<string>,
  planKey: string,
): 'included' | 'owned' | 'available' | 'founder_only' {
  // Inclus via plan actif
  if (
    (planKey === 'founder') ||
    (planKey === 'premium' && product.includedInPlans.includes('premium'))
  ) {
    return 'included'
  }
  // Acheté séparément
  if (userEntitlements.has(product.entitlementKey)) {
    return 'owned'
  }
  // Réservé fondateur uniquement
  if (!product.includedInPlans.includes('premium') && product.includedInPlans.includes('founder')) {
    // Montrer comme "founder_only" seulement pour les gratuits
    if (planKey === 'free') return 'founder_only'
  }
  return 'available'
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

// Produits Prisma à seeder
export const BOUTIQUE_SEED_PRODUCTS = BOUTIQUE_CATALOGUE.map(p => ({
  productKey: p.key,
  productType: p.type,
  title: p.title,
  description: p.description,
  priceAmount: p.priceAmount,
  currency: 'EUR',
  stripePriceId: null,
  isActive: true,
  payload: {
    category: p.category,
    entitlementKey: p.entitlementKey,
    symbol: p.symbol,
    subtitle: p.subtitle,
  },
}))
