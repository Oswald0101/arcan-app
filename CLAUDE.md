# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack
- Next.js 14 (App Router, Server Actions)
- Supabase (Auth + PostgreSQL)
- Prisma ORM (schéma 1 500+ lignes)
- Tailwind CSS
- Zustand (état global client)
- next-intl (FR, EN, ES, PT)
- Stripe (abonnements + produits one-shot)
- Anthropic Claude API ou DeepSeek (provider interchangeable via `AI_PROVIDER`)
- Vercel (déploiement)

## Commandes

```bash
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run typecheck        # Vérification TypeScript (tsc --noEmit)

# Base de données
npm run db:generate      # Regénérer le client Prisma après modif schema
npm run db:migrate       # Créer et appliquer une migration
npm run db:push          # Push schema sans migration (prototypage)
npm run db:seed          # Seeder la DB (tsx prisma/seed.ts)
npm run db:studio        # Interface graphique Prisma Studio

# Développement local
npx supabase start       # Démarrer Supabase local
stripe listen --forward-to localhost:3000/api/billing/webhook  # Webhooks Stripe
```

**Pas de framework de test configuré** (Jest/Vitest absent du MVP).

## Architecture

```
src/
├── app/
│   ├── (app)/          ← routes protégées (auth middleware + onboarding guard)
│   │   ├── accueil/    ← dashboard membre
│   │   ├── guide/      ← chat guide IA
│   │   ├── cercles/    ← voies et cercles
│   │   ├── codex/      ← codex personnel
│   │   ├── profil/     ← profil + paramètres
│   │   ├── progression/← XP, niveaux, badges, pratiques
│   │   ├── contacts/   ← demandes et connexions
│   │   └── messages/   ← messagerie directe
│   ├── admin/          ← dashboard admin (rôle requis)
│   ├── auth/           ← login, register, verify, consent, callback
│   ├── onboarding/     ← parcours d'onboarding + résultat
│   ├── abonnement/     ← plans et abonnement
│   ├── boutique/       ← produits one-shot
│   ├── parrainage/     ← invitations et récompenses
│   └── api/            ← API Routes (auth, guide, billing, social, admin…)
├── components/         ← par domaine (auth, guide, voie, billing, etc.)
├── lib/
│   ├── ai/             ← providers/, prompts/, memory/, context/, safety/
│   ├── auth/           ← session.ts, validations.ts, actions.ts
│   ├── billing/        ← entitlements.ts, referral.ts, actions.ts
│   ├── guide/          ← service.ts (service central du guide IA)
│   ├── onboarding/     ← questions.ts, scoring.ts, actions.ts
│   ├── paths/          ← actions.ts (voies/cercles)
│   ├── progression/    ← service.ts (XP, niveaux, badges)
│   ├── social/         ← actions.ts (contacts, messages, blocage)
│   ├── codex/          ← actions.ts
│   ├── notifications/  ← service.ts
│   ├── admin/          ← actions/, permissions/, queries/
│   ├── stripe/         ← index.ts (client + gestion événements webhook)
│   ├── supabase/       ← client.ts, server.ts, queries/[domaine].ts
│   └── prisma.ts       ← singleton Prisma
├── hooks/              ← use-session, use-guide-chat, use-onboarding, etc.
├── types/              ← auth, guide, billing, paths, social, admin (barrel: index.ts)
└── middleware.ts        ← refresh session Supabase + protection des routes
```

## Parcours critique à tester en priorité

```
/auth/register → /auth/consent → /onboarding → /onboarding/resultat → /accueil → /guide
```

## Règles importantes

### Auth
- Côté serveur : toujours `supabase.auth.getUser()`, jamais `getSession()`
- Mutations auth : Server Actions uniquement, pas d'API Routes
- Pattern retour : `{ success: true }` ou `{ success: false, error, field? }`
- Middleware (`src/middleware.ts`) : routes publiques = `/auth/*` ; redirige les non-authentifiés vers `/auth/login`

### Base de données
- Toutes les requêtes via Prisma, jamais dans les composants
- Queries isolées dans `lib/supabase/queries/[domaine].ts`
- Mutations complexes dans `$transaction` Prisma
- Validation des inputs avec Zod avant toute mutation

### Entitlements (billing)
- `user_entitlements` = source de vérité des droits utilisateur
- Jamais de `if plan === 'premium'` dispersé — toujours `hasEntitlement(userId, key)`
- Attribution uniquement depuis les webhooks Stripe, jamais côté client

### Guide IA
- Prompt système construit depuis `buildSystemPrompt(context)` en 8 blocs
- Mémoire extraite toutes les 6 paires, fire-and-forget
- Provider IA interchangeable via `lib/ai/providers/index.ts` (contrôlé par `AI_PROVIDER` + `AI_MODEL`)
- Modèle MVP par défaut : `claude-haiku-4-5-20251001` (Anthropic) ou `deepseek-chat` (DeepSeek)

### Admin
- Sécurité uniquement côté serveur via `checkAdminPermission(domain, action)`
- Toutes les actions sensibles loguées via `writeAuditLog()`
- Jamais de trust sur ce que le client envoie

### Webhook Stripe
- Point d'entrée unique : `POST /api/billing/webhook`
- Vérification signature obligatoire avant tout traitement
- Idempotent : upserts partout, pas de doublons si event rejoué

## Variables d'environnement requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=         # Supabase pooler (port 6543, pgbouncer=true)
DIRECT_URL=           # Supabase direct (port 5432, pour migrations)

# App
NEXT_PUBLIC_APP_URL=  # http://localhost:3000 en dev / https://voie.app en prod

# Provider IA (Anthropic ou DeepSeek)
ANTHROPIC_API_KEY=
# ou DEEPSEEK_API_KEY=
AI_MODEL=claude-haiku-4-5-20251001
AI_PROVIDER=anthropic

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Vocabulaire officiel figé

Membre · Voie · Guide · Cercle · Niveau · Rang · Pratiques · Épreuves
Carnet · Manifeste · Principes · Codex · Fondateur · Compte vérifié

## MVP vs Post-MVP

**MVP inclut** : auth, onboarding, guide IA + mémoire, voies/cercles, progression,
social basique, billing, admin, parrainage, codex, notifications

**Post-MVP** : audio guide, feed social complexe, événements live,
export Codex automatisé, analytics avancées, marketplace créateurs
