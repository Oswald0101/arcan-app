/**
 * scripts/bootstrap-founder.ts
 *
 * Bootstrap du compte super-admin + fondateur pour le développement.
 * Exécution : npx tsx scripts/bootstrap-founder.ts
 *
 * Stratégie : script idempotent — peut être rejoué sans doublons.
 * Aucun Stripe requis. Entitlements accordés via 'admin_grant'.
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const FOUNDER_EMAIL = 'valenteoswald@gmail.com'

// Entitlements fondateur (depuis src/types/billing.ts)
const FOUNDER_ENTITLEMENTS = [
  'guide_basic', 'guide_premium', 'path_create_unlimited', 'circle_founder',
  'codex_basic', 'codex_export_pdf', 'codex_edition_full',
  'social_full', 'progression_full', 'founder_badge', 'analytics_basic',
]

const ADMIN_ROLES = [
  { roleKey: 'super_admin', title: 'Super Admin',  description: 'Accès total à toutes les fonctions admin' },
  { roleKey: 'admin',       title: 'Admin',        description: 'Gestion membres, contenus, modération' },
  { roleKey: 'moderator',   title: 'Modérateur',   description: 'Modération et signalements' },
  { roleKey: 'support',     title: 'Support',      description: 'Assistance et lecture' },
]

async function main() {
  console.log(`\n🔧 Bootstrap ARCAN — ${FOUNDER_EMAIL}\n`)

  // ─── 1. Trouver le user dans Supabase Auth ────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('❌ Supabase error:', error.message)
    process.exit(1)
  }

  const supabaseUser = users.find(u => u.email === FOUNDER_EMAIL)
  if (!supabaseUser) {
    console.error(`\n❌ Utilisateur introuvable : ${FOUNDER_EMAIL}`)
    console.error('   Crée d\'abord un compte depuis l\'app, puis relance ce script.\n')
    process.exit(1)
  }

  const userId = supabaseUser.id
  console.log(`✓ Utilisateur trouvé : ${userId.slice(0, 8)}...`)

  // ─── 2. Upsert User Prisma + role founder ─────────────────────────────────
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, role: 'founder' },
    update: { role: 'founder' },
  })
  console.log('✓ user.role = founder')

  // ─── 3. Créer/upsert tous les AdminRole ───────────────────────────────────
  for (const role of ADMIN_ROLES) {
    await prisma.adminRole.upsert({
      where: { roleKey: role.roleKey },
      create: role,
      update: { title: role.title, description: role.description },
    })
  }
  console.log('✓ AdminRole — 4 rôles upsertés')

  // ─── 4. Attribuer super_admin à l'utilisateur ─────────────────────────────
  const superAdminRole = await prisma.adminRole.findUnique({ where: { roleKey: 'super_admin' } })
  if (!superAdminRole) throw new Error('super_admin AdminRole introuvable')

  await prisma.userAdminRole.upsert({
    where: { userId_adminRoleId: { userId, adminRoleId: superAdminRole.id } },
    create: { userId, adminRoleId: superAdminRole.id, isActive: true },
    update: { isActive: true },
  })
  console.log('✓ UserAdminRole = super_admin (actif)')

  // ─── 5. Entitlements fondateur — deleteMany puis createMany ───────────────
  // (pas de contrainte unique composite → on nettoie avant d'insérer)
  await prisma.userEntitlement.deleteMany({
    where: { userId, sourceType: 'admin_grant', sourceId: null },
  })

  const ACTIVE_UNTIL = new Date('2099-12-31')

  for (const key of FOUNDER_ENTITLEMENTS) {
    await prisma.userEntitlement.create({
      data: {
        userId,
        entitlementKey: key,
        entitlementType: 'feature',
        sourceType: 'admin_grant',
        sourceId: null,
        activeUntil: ACTIVE_UNTIL,
        isActive: true,
      },
    })
  }
  console.log(`✓ ${FOUNDER_ENTITLEMENTS.length} entitlements fondateur créés`)

  // ─── 6. Abonnement fondateur fictif (pour l'affichage dans l'app) ─────────
  const founderPlan = await prisma.subscriptionPlan.findFirst({
    where: { planKey: { contains: 'founder' } },
  })

  if (founderPlan) {
    const existingSub = await prisma.userSubscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
    })
    if (!existingSub) {
      await prisma.userSubscription.create({
        data: {
          userId,
          planId: founderPlan.id,
          provider: 'admin_grant',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: ACTIVE_UNTIL,
          cancelAtPeriodEnd: false,
        },
      })
      console.log('✓ Abonnement fondateur fictif créé')
    } else {
      console.log('✓ Abonnement déjà présent — conservé')
    }
  } else {
    console.warn('⚠  Plan fondateur absent en DB — lance : npm run db:seed')
  }

  // ─── 7. Résumé ────────────────────────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════════╗')
  console.log('║  ✅  Bootstrap terminé                         ║')
  console.log('╠═══════════════════════════════════════════════╣')
  console.log(`║  Email   : ${FOUNDER_EMAIL.padEnd(34)}║`)
  console.log('║  Rôle    : super_admin + founder               ║')
  console.log('║  Plans   : 11 entitlements fondateur           ║')
  console.log('╠═══════════════════════════════════════════════╣')
  console.log('║  Admin   : http://localhost:3000/admin         ║')
  console.log('║  → Relance le serveur puis reconnecte-toi     ║')
  console.log('╚═══════════════════════════════════════════════╝\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
