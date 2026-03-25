// prisma/seed.ts — Seed minimal aligné sur schema.prisma réel

import { PrismaClient, BillingPeriod } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // ---- Niveaux membre ----
  const levels = [
    { levelNumber: 1,  title: 'Chercheur',    requiredXp: 0 },
    { levelNumber: 2,  title: 'Éveillé',      requiredXp: 100 },
    { levelNumber: 3,  title: 'Marcheur',     requiredXp: 300 },
    { levelNumber: 4,  title: 'Adepte',       requiredXp: 700 },
    { levelNumber: 5,  title: 'Gardien',      requiredXp: 1500 },
    { levelNumber: 6,  title: 'Fondé',        requiredXp: 3000 },
    { levelNumber: 7,  title: 'Maître',       requiredXp: 5500 },
    { levelNumber: 8,  title: 'Sage',         requiredXp: 9000 },
    { levelNumber: 9,  title: 'Ancien',       requiredXp: 14000 },
    { levelNumber: 10, title: 'Éternel',      requiredXp: 21000 },
  ]

  for (const level of levels) {
    await prisma.memberLevel.upsert({
      where: { levelNumber: level.levelNumber },
      create: level,
      update: { title: level.title, requiredXp: level.requiredXp },
    })
  }
  console.log('✓ MemberLevel')

  // ---- Badges ----
  const badges = [
    { key: 'practice_7',      title: '7 pratiques',        triggerType: 'practice_count',  triggerValue: 7 },
    { key: 'practice_30',     title: '30 pratiques',       triggerType: 'practice_count',  triggerValue: 30 },
    { key: 'practice_100',    title: '100 pratiques',      triggerType: 'practice_count',  triggerValue: 100 },
    { key: 'streak_7',        title: 'Série de 7 jours',   triggerType: 'streak_days',     triggerValue: 7 },
    { key: 'streak_30',       title: 'Série de 30 jours',  triggerType: 'streak_days',     triggerValue: 30 },
    { key: 'streak_100',      title: 'Série de 100 jours', triggerType: 'streak_days',     triggerValue: 100 },
    { key: 'first_challenge', title: 'Première épreuve',   triggerType: 'challenge_count', triggerValue: 1 },
    { key: 'challenge_10',    title: '10 épreuves',        triggerType: 'challenge_count', triggerValue: 10 },
    { key: 'level_2',         title: 'Éveillé',            triggerType: 'level_up',        triggerValue: 2 },
    { key: 'level_5',         title: 'Gardien',            triggerType: 'level_up',        triggerValue: 5 },
    { key: 'level_10',        title: 'Éternel',            triggerType: 'level_up',        triggerValue: 10 },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      create: badge,
      update: { title: badge.title },
    })
  }
  console.log('✓ Badge')

  // ---- Plans d'abonnement ----
  // Un plan par ligne (billingPeriod séparé)
  const plans: { planKey: string; title: string; billingPeriod: BillingPeriod; priceAmount: number; description: string; features: string[] }[] = [
    { planKey: 'free',             title: 'Gratuit',           billingPeriod: 'one_time', priceAmount: 0,    description: 'Pour découvrir',           features: ['Guide basique', '1 Voie', 'Codex simple'] },
    { planKey: 'premium_monthly',  title: 'Premium Mensuel',   billingPeriod: 'monthly',  priceAmount: 1299, description: 'Accès complet',             features: ['Guide avancé', 'Voies illimitées', 'Export PDF'] },
    { planKey: 'premium_yearly',   title: 'Premium Annuel',    billingPeriod: 'yearly',   priceAmount: 8999, description: 'Accès complet, -40%',       features: ['Guide avancé', 'Voies illimitées', 'Export PDF'] },
    { planKey: 'founder_monthly',  title: 'Fondateur Mensuel', billingPeriod: 'monthly',  priceAmount: 2499, description: 'Pour les créateurs',         features: ['Tout Premium', 'Badge Fondateur', 'Analytics'] },
    { planKey: 'founder_yearly',   title: 'Fondateur Annuel',  billingPeriod: 'yearly',   priceAmount: 17999,description: 'Pour les créateurs, -40%',   features: ['Tout Premium', 'Badge Fondateur', 'Analytics'] },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { planKey: plan.planKey },
      create: { planKey: plan.planKey, title: plan.title, billingPeriod: plan.billingPeriod, priceAmount: plan.priceAmount, description: plan.description, features: plan.features },
      update: { title: plan.title, priceAmount: plan.priceAmount, billingPeriod: plan.billingPeriod },
    })
  }
  console.log('✓ SubscriptionPlan')

  // ---- Pratiques globales (pas d'upsert unique, on vérifie existence) ----
  const globalPractices = [
    { title: 'Méditation quotidienne',  description: 'Prendre 10 minutes pour soi',               frequency: 'daily',  xpReward: 10 },
    { title: 'Lecture intentionnelle',  description: 'Lire un texte en lien avec ta Voie',         frequency: 'daily',  xpReward: 15 },
    { title: 'Journal de progression',  description: 'Noter une réflexion de la journée',           frequency: 'daily',  xpReward: 20 },
    { title: 'Pratique corporelle',     description: 'Mouvement, respiration ou étirement',         frequency: 'daily',  xpReward: 10 },
  ]

  for (const p of globalPractices) {
    const exists = await prisma.practice.findFirst({ where: { title: p.title, pathId: null } })
    if (!exists) await prisma.practice.create({ data: p as any })
  }
  console.log('✓ Practice')

  // ---- Épreuves globales ----
  const globalChallenges = [
    { title: '7 jours de présence',    description: 'Pratiquer chaque jour pendant 7 jours', difficulty: 'easy',   durationDays: 7,  xpReward: 150 },
    { title: '30 jours de discipline', description: 'Tenir ton engagement 30 jours',          difficulty: 'medium', durationDays: 30, xpReward: 500 },
    { title: 'Compléter ton Codex',    description: 'Écrire les sections fondatrices',         difficulty: 'medium', durationDays: null, xpReward: 300 },
    { title: 'Inviter un membre',      description: 'Faire rejoindre un proche',               difficulty: 'easy',   durationDays: null, xpReward: 200 },
  ]

  for (const c of globalChallenges) {
    const exists = await prisma.challenge.findFirst({ where: { title: c.title, pathId: null } })
    if (!exists) await prisma.challenge.create({ data: c as any })
  }
  console.log('✓ Challenge')

  // ---- Rôles admin (AdminRole a: roleKey, title, description, permissions) ----
  const adminRoles = [
    { roleKey: 'super_admin', title: 'Super Admin',  permissions: {} },
    { roleKey: 'admin',       title: 'Admin',        permissions: {} },
    { roleKey: 'moderator',   title: 'Modérateur',   permissions: {} },
    { roleKey: 'support',     title: 'Support',      permissions: {} },
  ]

  for (const role of adminRoles) {
    await prisma.adminRole.upsert({
      where: { roleKey: role.roleKey },
      create: role,
      update: { title: role.title },
    })
  }
  console.log('✓ AdminRole')

  // ---- Produits boutique ARCAN ----
  const boutiqueProducts = [
    // Identité — Avatars
    { productKey: 'avatar_pack_lumieres', productType: 'avatar',        title: 'Pack Lumières',           description: 'Dix avatars lumineux pour exprimer ta part la plus claire.',                        priceAmount: 299,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'avatar_pack_lumieres', symbol: '◑', subtitle: '10 avatars lumineux' } },
    { productKey: 'avatar_pack_ombres',   productType: 'avatar',        title: 'Pack Ombres',             description: 'Dix symboles sombres pour incarner la face cachée de ton être.',                     priceAmount: 299,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'avatar_pack_ombres',   symbol: '◐', subtitle: '10 avatars symboliques' } },
    { productKey: 'avatar_pack_arcanes',  productType: 'avatar',        title: 'Pack Arcanes',            description: 'La collection la plus rare. Dix symboles sacrés.',                                   priceAmount: 499,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'avatar_pack_arcanes',  symbol: '✦', subtitle: '10 avatars rares' } },
    // Identité — Skins guide
    { productKey: 'guide_skin_oracle',    productType: 'guide_skin',    title: 'Guide Oracle',            description: 'Ton guide prend la forme d\'un oracle lumineux, calme et profond.',                   priceAmount: 299,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'guide_skin_oracle',    symbol: '⊙', subtitle: 'Style contemplatif' } },
    { productKey: 'guide_skin_sphinx',    productType: 'guide_skin',    title: 'Guide Sphinx',            description: 'Ton guide revêt la forme du gardien des secrets anciens.',                           priceAmount: 299,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'guide_skin_sphinx',    symbol: '△', subtitle: 'Style énigmatique' } },
    { productKey: 'guide_skin_ombre',     productType: 'guide_skin',    title: 'Guide de l\'Ombre',       description: 'Plus sombre, plus direct. Ce guide descend avec toi dans les profondeurs.',           priceAmount: 299,  currency: 'EUR', isActive: true, payload: { category: 'identite', entitlementKey: 'guide_skin_ombre',     symbol: '◈', subtitle: 'Style introspectif' } },
    // Expérience — Thèmes
    { productKey: 'theme_aube',           productType: 'theme',         title: 'Thème Aube',              description: 'Un univers visuel doux, lumineux, entre brume matinale et clarté intérieure.',        priceAmount: 399,  currency: 'EUR', isActive: true, payload: { category: 'experience', entitlementKey: 'theme_aube',           symbol: '◇', subtitle: 'Lavande & or' } },
    { productKey: 'theme_minuit',         productType: 'theme',         title: 'Thème Minuit',            description: 'L\'obscurité absolue. Un bleu nuit intense parsemé d\'éclats stellaires.',            priceAmount: 399,  currency: 'EUR', isActive: true, payload: { category: 'experience', entitlementKey: 'theme_minuit',         symbol: '✧', subtitle: 'Bleu profond & étoiles' } },
    { productKey: 'theme_feu_sacre',      productType: 'theme',         title: 'Thème Feu Sacré',         description: 'La chaleur du feu intérieur. Un univers ardent pour ceux qui avancent.',              priceAmount: 399,  currency: 'EUR', isActive: true, payload: { category: 'experience', entitlementKey: 'theme_feu_sacre',      symbol: '◉', subtitle: 'Rouge & ambre' } },
    { productKey: 'theme_abime',          productType: 'theme',         title: 'Thème Abîme',             description: 'Un vert abyssal pour l\'introspection totale.',                                       priceAmount: 399,  currency: 'EUR', isActive: true, payload: { category: 'experience', entitlementKey: 'theme_abime',          symbol: '◆', subtitle: 'Vert noir & profondeur' } },
    // Codex
    { productKey: 'codex_export_premium', productType: 'codex_export',  title: 'Export Codex Premium',    description: 'Exporte ton Codex en PDF avec une mise en page soignée.',                             priceAmount: 199,  currency: 'EUR', isActive: true, payload: { category: 'codex', entitlementKey: 'codex_export_pdf',        symbol: '▣', subtitle: 'PDF haute qualité' } },
    { productKey: 'codex_edition_avancee',productType: 'codex_edition', title: 'Édition Codex Avancée',   description: 'Polices premium, sections avancées, mises en page élaborées.',                        priceAmount: 399,  currency: 'EUR', isActive: true, payload: { category: 'codex', entitlementKey: 'codex_edition_full',     symbol: '◫', subtitle: 'Polices & mises en page enrichies' } },
    { productKey: 'codex_manifeste_enrichi',productType: 'codex_edition',title: 'Manifeste Enrichi',      description: 'Ton Manifeste présenté dans une mise en page digne de ce qu\'il représente.',         priceAmount: 199,  currency: 'EUR', isActive: true, payload: { category: 'codex', entitlementKey: 'codex_manifeste_enrichi', symbol: '◰', subtitle: 'Présentation luxueuse' } },
    // Packs
    { productKey: 'pack_fondation',       productType: 'pack',          title: 'Pack Fondation',          description: 'Pack Lumières + Thème Aube. L\'essentiel pour personnaliser ton espace ARCAN.',      priceAmount: 499,  currency: 'EUR', isActive: true, payload: { category: 'packs', entitlementKey: 'pack_fondation', symbol: '◎', subtitle: 'Pack Lumières + Thème Aube', originalAmount: 698 } },
    { productKey: 'pack_initie',          productType: 'pack',          title: 'Pack Initié',             description: 'Arcanes + Guide Sphinx + Thème Minuit. L\'expérience totalement personnalisée.',      priceAmount: 999,  currency: 'EUR', isActive: true, payload: { category: 'packs', entitlementKey: 'pack_initie',    symbol: '⊛', subtitle: 'Arcanes + Sphinx + Minuit',   originalAmount: 1197 } },
    { productKey: 'pack_revelation',      productType: 'pack',          title: 'Pack Révélation',         description: 'Tout ce que la boutique offre, réuni en une seule collection.',                       priceAmount: 1999, currency: 'EUR', isActive: true, payload: { category: 'packs', entitlementKey: 'pack_revelation', symbol: '✦', subtitle: 'L\'expérience totale ARCAN',  originalAmount: 3796 } },
  ]

  for (const product of boutiqueProducts) {
    await prisma.product.upsert({
      where: { productKey: product.productKey },
      create: product as any,
      update: {
        title: product.title,
        description: product.description,
        priceAmount: product.priceAmount,
        isActive: product.isActive,
        payload: product.payload,
      },
    })
  }
  console.log(`✓ Product (${boutiqueProducts.length} produits boutique)`)

  console.log('✅ Seed terminé')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
