/**
 * scripts/dev-unlock.ts
 *
 * Script de déblocage pour développement local.
 * Contourne complètement les emails Supabase (rate limits, SMTP, etc.)
 *
 * Ce script :
 *  1. Trouve le compte par email via l'API admin Supabase
 *  2. Définit un mot de passe connu directement (sans email)
 *  3. Garantit que User + Profile existent dans Prisma
 *  4. Attribue super_admin + entitlements fondateur
 *  5. Crée un abonnement fondateur fictif
 *
 * Exécution :
 *   npx tsx scripts/dev-unlock.ts
 *
 * Idempotent : peut être rejoué sans effet de bord.
 * Usage : développement local UNIQUEMENT.
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

// Variables d'env chargées automatiquement via tsx --env-file=.env.local
// ou via le fichier .env détecté par Prisma

const prisma = new PrismaClient()

// ─── Configuration ────────────────────────────────────────────────────────────

const FOUNDER_EMAIL    = 'valenteoswald@gmail.com'
const DEV_PASSWORD     = 'Arcan2025!'   // Mot de passe temporaire pour le dev

const FOUNDER_ENTITLEMENTS = [
  'guide_basic',
  'guide_premium',
  'path_create_unlimited',
  'circle_founder',
  'codex_basic',
  'codex_export_pdf',
  'codex_edition_full',
  'social_full',
  'progression_full',
  'founder_badge',
  'analytics_basic',
]

const ADMIN_ROLES = [
  { roleKey: 'super_admin', title: 'Super Admin',  description: 'Accès total à toutes les fonctions admin' },
  { roleKey: 'admin',       title: 'Admin',        description: 'Gestion membres, contenus, modération' },
  { roleKey: 'moderator',   title: 'Modérateur',   description: 'Modération et signalements' },
  { roleKey: 'support',     title: 'Support',      description: 'Assistance et lecture' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║  🔧  ARCAN — Dev Unlock Script                   ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variables manquantes dans .env.local :')
    if (!supabaseUrl) console.error('   → NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceKey)  console.error('   → SUPABASE_SERVICE_ROLE_KEY')
    console.error('\n   Vérifie ton fichier .env.local\n')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // ─── 1. Trouver l'utilisateur ──────────────────────────────────────────────
  console.log(`📧  Recherche du compte : ${FOUNDER_EMAIL}`)

  let userId: string

  // Essayer d'abord listUsers (marche pour les petits projets)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  if (listError) {
    console.error('❌ Erreur Supabase admin.listUsers :', listError.message)
    console.error('   Vérifie que SUPABASE_SERVICE_ROLE_KEY est correct.')
    process.exit(1)
  }

  const existingUser = users.find(u => u.email === FOUNDER_EMAIL)

  if (!existingUser) {
    // L'utilisateur n'existe pas encore → le créer
    console.log('⚠️  Compte introuvable — création du compte...')

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: FOUNDER_EMAIL,
      password: DEV_PASSWORD,
      email_confirm: true,   // Email confirmé directement, sans envoyer de mail
    })

    if (createError || !newUser.user) {
      console.error('❌ Impossible de créer le compte :', createError?.message)
      process.exit(1)
    }

    userId = newUser.user.id
    console.log(`✓  Compte créé : ${userId.slice(0, 8)}...`)
  } else {
    userId = existingUser.id
    console.log(`✓  Compte trouvé : ${userId.slice(0, 8)}...`)

    // ─── 2. Définir le mot de passe directement (pas d'email) ─────────────
    console.log(`🔑  Définition du mot de passe (sans email)...`)

    const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
      password: DEV_PASSWORD,
      email_confirm: true,   // S'assurer que l'email est confirmé
    })

    if (pwError) {
      console.error('❌ Erreur lors du changement de mot de passe :', pwError.message)
      process.exit(1)
    }

    console.log('✓  Mot de passe défini')
  }

  // ─── 3. Garantir User + Profile dans Prisma ───────────────────────────────
  console.log('🗄️   Synchronisation Prisma...')

  await prisma.user.upsert({
    where:  { id: userId },
    create: { id: userId, role: 'founder' },
    update: { role: 'founder' },
  })

  // Vérifier si un profil existe déjà
  const existingProfile = await prisma.profile.findUnique({ where: { userId } })
  if (!existingProfile) {
    // Créer un profil basique si absent
    const username = 'arcan_founder'
    const taken = await prisma.profile.findUnique({ where: { username } })
    await prisma.profile.create({
      data: {
        userId,
        username: taken ? `founder_${userId.slice(0, 6)}` : username,
        displayName: 'Fondateur ARCAN',
        onboardingCompleted: true,
        currentLevel: 10,
      },
    })
    console.log('✓  Profil créé (onboarding marqué comme complété)')
  } else {
    // S'assurer que l'onboarding est marqué complété pour accéder à l'app
    await prisma.profile.update({
      where: { userId },
      data:  { onboardingCompleted: true },
    })
    console.log('✓  Profil existant — onboarding marqué complété')
  }

  // ─── 4. Créer les AdminRole en DB ─────────────────────────────────────────
  console.log('🛡️   Rôles admin...')

  for (const role of ADMIN_ROLES) {
    await prisma.adminRole.upsert({
      where:  { roleKey: role.roleKey },
      create: role,
      update: { title: role.title, description: role.description },
    })
  }

  // Attribuer super_admin
  const superAdminRole = await prisma.adminRole.findUnique({ where: { roleKey: 'super_admin' } })
  if (!superAdminRole) throw new Error('super_admin introuvable après upsert')

  await prisma.userAdminRole.upsert({
    where:  { userId_adminRoleId: { userId, adminRoleId: superAdminRole.id } },
    create: { userId, adminRoleId: superAdminRole.id, isActive: true },
    update: { isActive: true },
  })

  console.log('✓  super_admin attribué')

  // ─── 5. Entitlements fondateur ────────────────────────────────────────────
  console.log('🎫  Entitlements...')

  // Nettoyer les anciens admin_grant sans sourceId
  await prisma.userEntitlement.deleteMany({
    where: { userId, sourceType: 'admin_grant', sourceId: null },
  })

  const ACTIVE_UNTIL = new Date('2099-12-31')

  for (const key of FOUNDER_ENTITLEMENTS) {
    await prisma.userEntitlement.create({
      data: {
        userId,
        entitlementKey:  key,
        entitlementType: 'feature',
        sourceType:      'admin_grant',
        sourceId:        null,
        activeUntil:     ACTIVE_UNTIL,
        isActive:        true,
      },
    })
  }

  console.log(`✓  ${FOUNDER_ENTITLEMENTS.length} entitlements fondateur créés`)

  // ─── 6. Abonnement fondateur fictif ───────────────────────────────────────
  console.log('💎  Abonnement fondateur...')

  const founderPlan = await prisma.subscriptionPlan.findFirst({
    where: { planKey: { contains: 'founder' } },
  })

  if (!founderPlan) {
    console.warn('⚠️  Plan fondateur absent — lance d\'abord : npm run db:seed')
    console.warn('   L\'abonnement ne sera pas créé mais les entitlements sont actifs.')
  } else {
    const existingSub = await prisma.userSubscription.findFirst({
      where: { userId, status: { in: ['active', 'trialing'] } },
    })

    if (!existingSub) {
      await prisma.userSubscription.create({
        data: {
          userId,
          planId:               founderPlan.id,
          provider:             'admin_grant',
          status:               'active',
          currentPeriodStart:   new Date(),
          currentPeriodEnd:     ACTIVE_UNTIL,
          cancelAtPeriodEnd:    false,
        },
      })
      console.log('✓  Abonnement fondateur créé')
    } else {
      console.log('✓  Abonnement déjà actif — conservé')
    }
  }

  // ─── 7. Résumé ────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║  ✅  Déblocage terminé                            ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  Email    : ${FOUNDER_EMAIL.padEnd(37)}║`)
  console.log(`║  Password : ${DEV_PASSWORD.padEnd(37)}║`)
  console.log('║  Rôle     : super_admin + founder                ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log('║  ÉTAPES SUIVANTES :                              ║')
  console.log('║  1. npm run dev                                  ║')
  console.log('║  2. Va sur http://localhost:3000/auth/login      ║')
  console.log(`║  3. Email    : ${FOUNDER_EMAIL.slice(0, 26).padEnd(26)}     ║`)
  console.log(`║  4. Password : ${DEV_PASSWORD.padEnd(26)}     ║`)
  console.log('║  5. Admin : http://localhost:3000/admin          ║')
  console.log('╚══════════════════════════════════════════════════╝\n')
}

main()
  .catch(e => {
    console.error('\n❌ Erreur :', e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
