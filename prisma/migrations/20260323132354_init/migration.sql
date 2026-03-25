-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('member', 'founder', 'moderator', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('pending', 'active', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "verification_badge" AS ENUM ('none', 'verified', 'founder_verified');

-- CreateEnum
CREATE TYPE "language_code" AS ENUM ('fr', 'en', 'es', 'pt');

-- CreateEnum
CREATE TYPE "theme_mode" AS ENUM ('dark', 'light', 'system');

-- CreateEnum
CREATE TYPE "notification_level" AS ENUM ('all', 'important', 'minimal', 'none');

-- CreateEnum
CREATE TYPE "guide_address_mode" AS ENUM ('tutoiement', 'vouvoiement');

-- CreateEnum
CREATE TYPE "onboarding_status" AS ENUM ('started', 'in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('free_text', 'single_choice', 'multi_choice', 'scale');

-- CreateEnum
CREATE TYPE "path_canonical_type" AS ENUM ('voie', 'religion', 'mouvement', 'philosophie', 'ordre', 'tradition', 'courant', 'ecole', 'cercle_type', 'temple', 'doctrine', 'culte', 'autre');

-- CreateEnum
CREATE TYPE "guide_canonical_type" AS ENUM ('guide', 'dieu', 'presence', 'source', 'gardien', 'maitre', 'oracle', 'voix', 'force', 'flamme', 'conscience', 'esprit', 'principe', 'autre');

-- CreateEnum
CREATE TYPE "path_visibility" AS ENUM ('public', 'unlisted', 'private');

-- CreateEnum
CREATE TYPE "admission_mode" AS ENUM ('open', 'on_request', 'invite_only');

-- CreateEnum
CREATE TYPE "path_status" AS ENUM ('active', 'archived', 'suspended');

-- CreateEnum
CREATE TYPE "guide_tone" AS ENUM ('direct', 'doux', 'philosophique', 'stoique', 'mystique', 'socratique', 'solennel', 'fraternel', 'sobre', 'inspirant');

-- CreateEnum
CREATE TYPE "membership_role" AS ENUM ('member', 'elder', 'moderator', 'founder');

-- CreateEnum
CREATE TYPE "membership_status" AS ENUM ('pending', 'active', 'suspended', 'left', 'banned');

-- CreateEnum
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "practice_frequency" AS ENUM ('daily', 'weekly', 'monthly', 'custom');

-- CreateEnum
CREATE TYPE "log_status" AS ENUM ('in_progress', 'completed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "sender_type" AS ENUM ('member', 'guide', 'system');

-- CreateEnum
CREATE TYPE "conversation_status" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "memory_type" AS ENUM ('commitment', 'struggle', 'progress', 'preference', 'context', 'keyword', 'warning');

-- CreateEnum
CREATE TYPE "codex_type" AS ENUM ('personal', 'path', 'guide');

-- CreateEnum
CREATE TYPE "codex_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "codex_order_type" AS ENUM ('pdf_export', 'premium_edition', 'print');

-- CreateEnum
CREATE TYPE "codex_order_status" AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "contact_status" AS ENUM ('pending', 'accepted', 'rejected', 'blocked');

-- CreateEnum
CREATE TYPE "follow_target_type" AS ENUM ('user', 'path');

-- CreateEnum
CREATE TYPE "invite_status" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "invite_type" AS ENUM ('app', 'path');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('guide_message', 'daily_practice', 'challenge_reminder', 'contact_request', 'new_message', 'rank_up', 'level_up', 'badge_earned', 'invite_accepted', 'system');

-- CreateEnum
CREATE TYPE "billing_period" AS ENUM ('monthly', 'yearly', 'lifetime', 'one_time');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('avatar_pack', 'guide_skin', 'theme', 'practice_pack', 'challenge_pack', 'codex_export', 'codex_premium_edition', 'subscription_upgrade');

-- CreateEnum
CREATE TYPE "purchase_status" AS ENUM ('pending', 'completed', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "entitlement_source" AS ENUM ('subscription', 'purchase', 'referral', 'admin_grant');

-- CreateEnum
CREATE TYPE "report_target_type" AS ENUM ('user', 'path', 'guide_message', 'direct_message', 'codex');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('pending', 'under_review', 'resolved_no_action', 'resolved_action_taken', 'dismissed');

-- CreateEnum
CREATE TYPE "moderation_action_type" AS ENUM ('warning', 'content_removed', 'suspend', 'ban', 'path_suspended', 'path_deleted');

-- CreateEnum
CREATE TYPE "verification_request_type" AS ENUM ('standard', 'founder');

-- CreateEnum
CREATE TYPE "verification_request_status" AS ENUM ('pending', 'approved', 'rejected', 'more_info_needed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'member',
    "account_status" "account_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_login_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_type" TEXT NOT NULL DEFAULT 'preset',
    "avatar_url" TEXT,
    "country" TEXT,
    "city" TEXT,
    "language" "language_code" NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "show_location" BOOLEAN NOT NULL DEFAULT false,
    "show_path" BOOLEAN NOT NULL DEFAULT true,
    "show_guide" BOOLEAN NOT NULL DEFAULT false,
    "show_level" BOOLEAN NOT NULL DEFAULT true,
    "verification_status" "verification_badge" NOT NULL DEFAULT 'none',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_completed_at" TIMESTAMPTZ,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "current_xp" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "language" "language_code" NOT NULL DEFAULT 'fr',
    "theme_mode" "theme_mode" NOT NULL DEFAULT 'dark',
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "haptics_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notification_level" "notification_level" NOT NULL DEFAULT 'important',
    "guide_address_mode" "guide_address_mode" NOT NULL DEFAULT 'tutoiement',
    "extra_prefs" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_consents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "consent_type" TEXT NOT NULL,
    "consent_version" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT true,
    "accepted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_hash" TEXT,
    "user_agent_hash" TEXT,

    CONSTRAINT "legal_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "status" "onboarding_status" NOT NULL DEFAULT 'started',
    "current_bloc" INTEGER NOT NULL DEFAULT 1,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "generated_profile_snapshot" JSONB,

    CONSTRAINT "onboarding_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_answers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bloc_number" INTEGER NOT NULL,
    "question_key" TEXT NOT NULL,
    "question_type" "question_type" NOT NULL,
    "answer_text" TEXT,
    "answer_choice" TEXT,
    "answer_choices" TEXT[],
    "answer_scale" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sensitivity_profiles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "session_id" UUID,
    "need_for_structure" DECIMAL(3,2),
    "need_for_meaning" DECIMAL(3,2),
    "spiritual_affinity" DECIMAL(3,2),
    "symbolic_affinity" DECIMAL(3,2),
    "rational_affinity" DECIMAL(3,2),
    "community_desire" DECIMAL(3,2),
    "confrontation_preference" DECIMAL(3,2),
    "softness_preference" DECIMAL(3,2),
    "commitment_level" DECIMAL(3,2),
    "emotional_stability" DECIMAL(3,2),
    "creation_desire" DECIMAL(3,2),
    "generated_summary" TEXT,
    "extracted_keywords" TEXT[],
    "symbolic_affinities" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_sensitivity_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paths" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "founder_user_id" UUID NOT NULL,
    "canonical_type" "path_canonical_type" NOT NULL DEFAULT 'voie',
    "custom_type_label" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT,
    "language" "language_code" NOT NULL DEFAULT 'fr',
    "status" "path_status" NOT NULL DEFAULT 'active',
    "visibility" "path_visibility" NOT NULL DEFAULT 'public',
    "admission_mode" "admission_mode" NOT NULL DEFAULT 'open',
    "primary_theme" TEXT,
    "symbolic_style" TEXT,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_versions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "manifesto_text" TEXT,
    "principles" TEXT[],
    "practices" TEXT[],
    "evolution_notes" TEXT,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guides" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "owner_user_id" UUID NOT NULL,
    "path_id" UUID,
    "canonical_type" "guide_canonical_type" NOT NULL DEFAULT 'guide',
    "custom_type_label" TEXT,
    "name" TEXT NOT NULL,
    "member_name" TEXT,
    "tone" "guide_tone" NOT NULL DEFAULT 'direct',
    "address_mode" "guide_address_mode" NOT NULL DEFAULT 'tutoiement',
    "firmness_level" INTEGER NOT NULL DEFAULT 3,
    "warmth_level" INTEGER NOT NULL DEFAULT 3,
    "symbolic_identity" TEXT,
    "avatar_asset_url" TEXT,
    "personality_prompt" TEXT NOT NULL,
    "memory_summary" TEXT,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_versions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "guide_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "tone" "guide_tone" NOT NULL,
    "firmness_level" INTEGER NOT NULL,
    "warmth_level" INTEGER NOT NULL,
    "personality_prompt" TEXT NOT NULL,
    "change_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID NOT NULL,
    "founder_user_id" UUID NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circle_memberships" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "circle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "membership_role" NOT NULL DEFAULT 'member',
    "status" "membership_status" NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invited_by_user_id" UUID,
    "approved_by_user_id" UUID,

    CONSTRAINT "circle_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_levels" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "level_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "required_xp" INTEGER NOT NULL,
    "badge_url" TEXT,
    "perks" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_member_progress" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "current_level_id" UUID,
    "current_xp" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "total_practices_completed" INTEGER NOT NULL DEFAULT 0,
    "total_challenges_completed" INTEGER NOT NULL DEFAULT 0,
    "total_days_active" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_member_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_ranks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID NOT NULL,
    "rank_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required_xp" INTEGER NOT NULL DEFAULT 0,
    "required_conditions" JSONB NOT NULL DEFAULT '{}',
    "badge_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_path_progress" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "current_rank_id" UUID,
    "rank_xp" INTEGER NOT NULL DEFAULT 0,
    "practices_completed" INTEGER NOT NULL DEFAULT 0,
    "challenges_completed" INTEGER NOT NULL DEFAULT 0,
    "consistency_score" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_progress_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_path_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practices" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "practice_frequency" NOT NULL DEFAULT 'daily',
    "xp_reward" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "difficulty" NOT NULL DEFAULT 'medium',
    "duration_days" INTEGER,
    "xp_reward" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_practice_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "practice_id" UUID NOT NULL,
    "status" "log_status" NOT NULL DEFAULT 'completed',
    "note" TEXT,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "logged_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_practice_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_challenge_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "status" "log_status" NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "note" TEXT,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_challenge_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "trigger_type" TEXT NOT NULL,
    "trigger_value" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_conversations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "guide_id" UUID NOT NULL,
    "title" TEXT,
    "status" "conversation_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guide_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "sender_type" "sender_type" NOT NULL,
    "content" TEXT NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "model_used" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_memory_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "guide_id" UUID NOT NULL,
    "memory_type" "memory_type" NOT NULL,
    "memory_key" TEXT NOT NULL,
    "memory_value" TEXT NOT NULL,
    "importance_score" DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    "source_message_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guide_memory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codexes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "codex_type" "codex_type" NOT NULL,
    "owner_user_id" UUID,
    "path_id" UUID,
    "guide_id" UUID,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "status" "codex_status" NOT NULL DEFAULT 'published',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "is_exportable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "codexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codex_versions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "codex_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "pdf_url" TEXT,
    "cover_asset_url" TEXT,
    "created_by_type" "sender_type" NOT NULL DEFAULT 'member',
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codex_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifestos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID,
    "user_id" UUID,
    "title" TEXT NOT NULL DEFAULT 'Manifeste',
    "content" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manifestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "principles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path_id" UUID,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "principles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codex_orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "codex_id" UUID NOT NULL,
    "codex_version_id" UUID,
    "order_type" "codex_order_type" NOT NULL,
    "status" "codex_order_status" NOT NULL DEFAULT 'pending',
    "price_amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "pdf_url" TEXT,
    "delivery_address" JSONB,
    "print_vendor_ref" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "codex_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sender_user_id" UUID NOT NULL,
    "receiver_user_id" UUID NOT NULL,
    "message" TEXT,
    "status" "contact_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_one_id" UUID NOT NULL,
    "user_two_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_conversations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_one_id" UUID NOT NULL,
    "user_two_id" UUID NOT NULL,
    "last_message_preview" TEXT,
    "last_message_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "sender_user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "follower_user_id" UUID NOT NULL,
    "followed_type" "follow_target_type" NOT NULL,
    "followed_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "inviter_user_id" UUID NOT NULL,
    "invite_type" "invite_type" NOT NULL DEFAULT 'app',
    "path_id" UUID,
    "invite_code" TEXT NOT NULL,
    "status" "invite_status" NOT NULL DEFAULT 'pending',
    "invited_email" TEXT,
    "accepted_user_id" UUID,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "invite_id" UUID NOT NULL,
    "inviter_user_id" UUID NOT NULL,
    "invitee_user_id" UUID NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" INTEGER,
    "is_granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "entity_type" TEXT,
    "entity_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "plan_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "billing_period" "billing_period" NOT NULL,
    "price_amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripe_price_id" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "provider_subscription_id" TEXT,
    "provider_customer_id" TEXT,
    "status" "subscription_status" NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMPTZ NOT NULL,
    "current_period_end" TIMESTAMPTZ NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "product_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "product_type" "product_type" NOT NULL,
    "price_amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripe_price_id" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "provider_payment_id" TEXT,
    "status" "purchase_status" NOT NULL DEFAULT 'pending',
    "amount_paid" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "product_snapshot" JSONB NOT NULL DEFAULT '{}',
    "purchased_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_entitlements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "entitlement_type" TEXT NOT NULL,
    "entitlement_key" TEXT NOT NULL,
    "source_type" "entitlement_source" NOT NULL,
    "source_id" UUID,
    "active_until" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "reporter_user_id" UUID NOT NULL,
    "target_type" "report_target_type" NOT NULL,
    "target_id" UUID NOT NULL,
    "reason_key" TEXT NOT NULL,
    "details_text" TEXT,
    "status" "report_status" NOT NULL DEFAULT 'pending',
    "assigned_to" UUID,
    "moderator_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "moderator_user_id" UUID NOT NULL,
    "report_id" UUID,
    "target_type" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "action_type" "moderation_action_type" NOT NULL,
    "reason_text" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "blocker_user_id" UUID NOT NULL,
    "blocked_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "request_type" "verification_request_type" NOT NULL DEFAULT 'standard',
    "status" "verification_request_status" NOT NULL DEFAULT 'pending',
    "submitted_data" JSONB NOT NULL DEFAULT '{}',
    "reviewer_user_id" UUID,
    "reviewer_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "age_consents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "declared_age_group" TEXT NOT NULL DEFAULT 'adult',
    "declared_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parental_consent_required" BOOLEAN NOT NULL DEFAULT false,
    "parental_consent_status" TEXT NOT NULL DEFAULT 'not_required',
    "parental_email" TEXT,
    "consent_reference" TEXT,

    CONSTRAINT "age_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_admin_roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "admin_role_id" UUID NOT NULL,
    "granted_by_user_id" UUID,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "target_type" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "setting_key" TEXT NOT NULL,
    "setting_value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "actor_user_id" UUID,
    "actor_type" TEXT NOT NULL DEFAULT 'user',
    "action_key" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_hash" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "event_key" TEXT NOT NULL,
    "event_data" JSONB NOT NULL DEFAULT '{}',
    "session_id" TEXT,
    "platform" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_answers_session_id_question_key_key" ON "onboarding_answers"("session_id", "question_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_sensitivity_profiles_userId_key" ON "user_sensitivity_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sensitivity_profiles_session_id_key" ON "user_sensitivity_profiles"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "paths_slug_key" ON "paths"("slug");

-- CreateIndex
CREATE INDEX "paths_visibility_idx" ON "paths"("visibility");

-- CreateIndex
CREATE INDEX "paths_founder_user_id_idx" ON "paths"("founder_user_id");

-- CreateIndex
CREATE INDEX "paths_status_idx" ON "paths"("status");

-- CreateIndex
CREATE UNIQUE INDEX "path_versions_path_id_version_number_key" ON "path_versions"("path_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "guide_versions_guide_id_version_number_key" ON "guide_versions"("guide_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "circles_path_id_key" ON "circles"("path_id");

-- CreateIndex
CREATE INDEX "circle_memberships_circle_id_status_idx" ON "circle_memberships"("circle_id", "status");

-- CreateIndex
CREATE INDEX "circle_memberships_user_id_status_idx" ON "circle_memberships"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "circle_memberships_circle_id_user_id_key" ON "circle_memberships"("circle_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_levels_level_number_key" ON "member_levels"("level_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_member_progress_user_id_key" ON "user_member_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "path_ranks_path_id_rank_order_key" ON "path_ranks"("path_id", "rank_order");

-- CreateIndex
CREATE UNIQUE INDEX "user_path_progress_user_id_path_id_key" ON "user_path_progress"("user_id", "path_id");

-- CreateIndex
CREATE INDEX "user_practice_logs_user_id_logged_at_idx" ON "user_practice_logs"("user_id", "logged_at" DESC);

-- CreateIndex
CREATE INDEX "user_challenge_logs_user_id_status_idx" ON "user_challenge_logs"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "badges_key_key" ON "badges"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE INDEX "guide_conversations_user_id_status_idx" ON "guide_conversations"("user_id", "status");

-- CreateIndex
CREATE INDEX "guide_messages_conversation_id_created_at_idx" ON "guide_messages"("conversation_id", "created_at" ASC);

-- CreateIndex
CREATE INDEX "guide_memory_items_user_id_guide_id_idx" ON "guide_memory_items"("user_id", "guide_id");

-- CreateIndex
CREATE UNIQUE INDEX "codex_versions_codex_id_version_number_key" ON "codex_versions"("codex_id", "version_number");

-- CreateIndex
CREATE INDEX "manifestos_path_id_idx" ON "manifestos"("path_id");

-- CreateIndex
CREATE INDEX "manifestos_user_id_idx" ON "manifestos"("user_id");

-- CreateIndex
CREATE INDEX "contact_requests_receiver_user_id_status_idx" ON "contact_requests"("receiver_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_user_one_id_user_two_id_key" ON "contacts"("user_one_id", "user_two_id");

-- CreateIndex
CREATE UNIQUE INDEX "direct_conversations_user_one_id_user_two_id_key" ON "direct_conversations"("user_one_id", "user_two_id");

-- CreateIndex
CREATE INDEX "direct_messages_conversation_id_created_at_idx" ON "direct_messages"("conversation_id", "created_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_user_id_followed_type_followed_id_key" ON "follows"("follower_user_id", "followed_type", "followed_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_invite_code_key" ON "invites"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "invites_accepted_user_id_key" ON "invites"("accepted_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_rewards_invite_id_key" ON "referral_rewards"("invite_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_plan_key_key" ON "subscription_plans"("plan_key");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_key_key" ON "products"("product_key");

-- CreateIndex
CREATE INDEX "user_entitlements_user_id_is_active_idx" ON "user_entitlements"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_blocker_user_id_blocked_user_id_key" ON "blocks"("blocker_user_id", "blocked_user_id");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "age_consents_user_id_key" ON "age_consents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_role_key_key" ON "admin_roles"("role_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_admin_roles_user_id_admin_role_id_key" ON "user_admin_roles"("user_id", "admin_role_id");

-- CreateIndex
CREATE INDEX "admin_notes_target_type_target_id_idx" ON "admin_notes"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_created_at_idx" ON "audit_logs"("target_type", "target_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_action_key_created_at_idx" ON "audit_logs"("action_key", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "analytics_events_event_key_created_at_idx" ON "analytics_events"("event_key", "created_at" DESC);

-- CreateIndex
CREATE INDEX "analytics_events_user_id_created_at_idx" ON "analytics_events"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_consents" ADD CONSTRAINT "legal_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_sessions" ADD CONSTRAINT "onboarding_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_answers" ADD CONSTRAINT "onboarding_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "onboarding_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_answers" ADD CONSTRAINT "onboarding_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sensitivity_profiles" ADD CONSTRAINT "user_sensitivity_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sensitivity_profiles" ADD CONSTRAINT "user_sensitivity_profiles_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "onboarding_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paths" ADD CONSTRAINT "paths_founder_user_id_fkey" FOREIGN KEY ("founder_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_versions" ADD CONSTRAINT "path_versions_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_versions" ADD CONSTRAINT "path_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides" ADD CONSTRAINT "guides_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides" ADD CONSTRAINT "guides_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_versions" ADD CONSTRAINT "guide_versions_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circles" ADD CONSTRAINT "circles_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circles" ADD CONSTRAINT "circles_founder_user_id_fkey" FOREIGN KEY ("founder_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_circle_id_fkey" FOREIGN KEY ("circle_id") REFERENCES "circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_member_progress" ADD CONSTRAINT "user_member_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_member_progress" ADD CONSTRAINT "user_member_progress_current_level_id_fkey" FOREIGN KEY ("current_level_id") REFERENCES "member_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_ranks" ADD CONSTRAINT "path_ranks_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_path_progress" ADD CONSTRAINT "user_path_progress_current_rank_id_fkey" FOREIGN KEY ("current_rank_id") REFERENCES "path_ranks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_practice_logs" ADD CONSTRAINT "user_practice_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_practice_logs" ADD CONSTRAINT "user_practice_logs_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_logs" ADD CONSTRAINT "user_challenge_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_logs" ADD CONSTRAINT "user_challenge_logs_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_conversations" ADD CONSTRAINT "guide_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_conversations" ADD CONSTRAINT "guide_conversations_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_messages" ADD CONSTRAINT "guide_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "guide_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_memory_items" ADD CONSTRAINT "guide_memory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_memory_items" ADD CONSTRAINT "guide_memory_items_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_memory_items" ADD CONSTRAINT "guide_memory_items_source_message_id_fkey" FOREIGN KEY ("source_message_id") REFERENCES "guide_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codexes" ADD CONSTRAINT "codexes_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codexes" ADD CONSTRAINT "codexes_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codexes" ADD CONSTRAINT "codexes_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_versions" ADD CONSTRAINT "codex_versions_codex_id_fkey" FOREIGN KEY ("codex_id") REFERENCES "codexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_versions" ADD CONSTRAINT "codex_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestos" ADD CONSTRAINT "manifestos_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestos" ADD CONSTRAINT "manifestos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principles" ADD CONSTRAINT "principles_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "principles" ADD CONSTRAINT "principles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_orders" ADD CONSTRAINT "codex_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_orders" ADD CONSTRAINT "codex_orders_codex_id_fkey" FOREIGN KEY ("codex_id") REFERENCES "codexes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codex_orders" ADD CONSTRAINT "codex_orders_codex_version_id_fkey" FOREIGN KEY ("codex_version_id") REFERENCES "codex_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_receiver_user_id_fkey" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_one_id_fkey" FOREIGN KEY ("user_one_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_two_id_fkey" FOREIGN KEY ("user_two_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_conversations" ADD CONSTRAINT "direct_conversations_user_one_id_fkey" FOREIGN KEY ("user_one_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_conversations" ADD CONSTRAINT "direct_conversations_user_two_id_fkey" FOREIGN KEY ("user_two_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "direct_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_user_id_fkey" FOREIGN KEY ("follower_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_accepted_user_id_fkey" FOREIGN KEY ("accepted_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_invitee_user_id_fkey" FOREIGN KEY ("invitee_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderator_user_id_fkey" FOREIGN KEY ("moderator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_user_id_fkey" FOREIGN KEY ("blocker_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_user_id_fkey" FOREIGN KEY ("blocked_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "age_consents" ADD CONSTRAINT "age_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_admin_roles" ADD CONSTRAINT "user_admin_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_admin_roles" ADD CONSTRAINT "user_admin_roles_admin_role_id_fkey" FOREIGN KEY ("admin_role_id") REFERENCES "admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_admin_roles" ADD CONSTRAINT "user_admin_roles_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
