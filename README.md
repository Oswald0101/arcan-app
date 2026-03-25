# Voie — MVP

Application spirituelle/sociale/IA. Stack : Next.js 14, Supabase, Prisma, Tailwind, Stripe, Claude API.

## Démarrage rapide

### 1. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` → Dashboard Supabase > Settings > API
- `DATABASE_URL` (port 6543, pgbouncer=true) + `DIRECT_URL` (port 5432) → Supabase > Settings > Database
- `ANTHROPIC_API_KEY` → console.anthropic.com
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → dashboard.stripe.com
- `STRIPE_WEBHOOK_SECRET` → généré par `stripe listen` (voir étape 5)

### 2. Dépendances

```bash
npm install
```

### 3. Base de données

```bash
npx prisma generate           # génère le client Prisma typé
npx prisma migrate dev --name init  # crée les tables
npm run db:seed                # seed : niveaux, badges, plans, pratiques
```

### 4. Types Supabase (optionnel, remplace le stub)

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

### 5. Stripe webhooks (dev local)

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
# Copier le webhook secret affiché dans .env.local STRIPE_WEBHOOK_SECRET
```

### 6. Lancer

```bash
npm run dev
```

Ouvrir http://localhost:3000

---

## Architecture

```
src/
├── app/
│   ├── (app)/          ← pages protégées (layout : TopBar + BottomNav + auth check)
│   │   ├── accueil/    ← dashboard membre
│   │   ├── guide/      ← chat guide IA
│   │   ├── cercles/    ← voies et cercles
│   │   ├── codex/      ← codex personnel
│   │   ├── profil/     ← profil + paramètres
│   │   ├── contacts/   ← contacts et demandes
│   │   ├── messages/   ← messagerie privée
│   │   ├── progression/← XP, pratiques, épreuves, badges
│   │   ├── abonnement/ ← plans et billing
│   │   ├── boutique/   ← produits one-shot
│   │   └── parrainage/ ← invitations et récompenses
│   ├── admin/          ← dashboard admin (rôle requis)
│   ├── auth/           ← login, register, verify, consent, forgot-password
│   ├── onboarding/     ← parcours d'onboarding (8 blocs)
│   ├── api/            ← API Routes
│   ├── cgu/            ← conditions générales
│   └── confidentialite/← politique de confidentialité
├── components/         ← par domaine
├── lib/
│   ├── ai/             ← providers, prompts, memory, context, safety
│   ├── auth/           ← session, validations, actions
│   ├── billing/        ← entitlements, referral, actions
│   ├── guide/          ← service guide IA
│   ├── onboarding/     ← questions, scoring, actions
│   ├── paths/          ← actions voies/cercles/progression
│   ├── progression/    ← XP, niveaux, badges
│   ├── social/         ← contacts, messages, blocage
│   ├── notifications/  ← service notifications
│   ├── admin/          ← guard, permissions, queries, actions
│   ├── stripe/         ← client, webhooks
│   ├── supabase/       ← client, server, queries/ (11 fichiers)
│   └── prisma.ts       ← singleton Prisma
├── hooks/              ← 7 hooks React
└── types/              ← 9 fichiers de types
```

## Règles importantes

- **Auth** : toujours `supabase.auth.getUser()` côté serveur, jamais `getSession()`
- **Entitlements** : `user_entitlements` = source de vérité. Jamais `if plan === 'premium'`
- **Billing** : toute attribution d'entitlements passe par les webhooks Stripe
- **Admin** : sécurité côté serveur via `checkAdminPermission()`, toujours loggué via `writeAuditLog()`
- **Guide IA** : prompt système en 8 blocs via `buildSystemPrompt()`, mémoire fire-and-forget
- **Webhook Stripe** : point d'entrée unique `/api/billing/webhook`

## Parcours critique à tester en premier

```
/auth/register → /auth/consent → /onboarding → /onboarding/resultat → /accueil → /guide
```
