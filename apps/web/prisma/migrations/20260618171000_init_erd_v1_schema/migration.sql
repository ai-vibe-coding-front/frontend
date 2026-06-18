-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "exploration_session_status" AS ENUM ('LOCATION_CONFIRMED', 'QUESTION_IN_PROGRESS', 'RECOMMENDATION_REQUESTED', 'RECOMMENDATION_COMPLETED', 'RESULT_VIEWED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "question_key" AS ENUM ('q1', 'q2', 'q3', 'q4');

-- CreateEnum
CREATE TYPE "event_name" AS ENUM ('LOCATION_PERMISSION_VIEWED', 'LOCATION_CONFIRMED', 'QUESTION_FLOW_STARTED', 'QUESTION_STEP_VIEWED', 'QUESTION_ANSWERED', 'RECOMMENDATION_REQUESTED', 'RECOMMENDATION_COMPLETED', 'RESULT_VIEWED', 'RECOMMENDATION_CARD_CLICKED', 'EVENT_DETAIL_VIEWED', 'FAVORITE_ATTEMPTED', 'FAVORITE_COMPLETED', 'MAP_VIEWED', 'MAP_EVENT_CARD_CLICKED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_credentials" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploration_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_key" VARCHAR(255) NOT NULL,
    "is_guest" BOOLEAN NOT NULL DEFAULT true,
    "status" "exploration_session_status" NOT NULL DEFAULT 'LOCATION_CONFIRMED',
    "current_step" VARCHAR(50),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "nx" INTEGER,
    "ny" INTEGER,
    "sido" VARCHAR(50),
    "address" TEXT,
    "station_name" VARCHAR(100),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exploration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploration_answers" (
    "id" UUID NOT NULL,
    "exploration_session_id" UUID NOT NULL,
    "question_key" "question_key" NOT NULL,
    "answer_value" VARCHAR(100) NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exploration_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_items" (
    "id" UUID NOT NULL,
    "external_id" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "realm_code" VARCHAR(50),
    "realm_name" VARCHAR(100),
    "start_date" DATE,
    "end_date" DATE,
    "place" VARCHAR(255),
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "image_url" TEXT,
    "price" VARCHAR(255),
    "description" TEXT,
    "booking_url" TEXT,
    "is_indoor" BOOLEAN,
    "source" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_item_tags" (
    "id" UUID NOT NULL,
    "event_item_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_item_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_runs" (
    "id" UUID NOT NULL,
    "exploration_session_id" UUID NOT NULL,
    "user_id" UUID,
    "curation" TEXT,
    "indoor_forced" BOOLEAN NOT NULL DEFAULT false,
    "nearby_expanded" BOOLEAN NOT NULL DEFAULT false,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_snapshots" (
    "id" UUID NOT NULL,
    "recommendation_run_id" UUID NOT NULL,
    "sido" VARCHAR(50),
    "nx" INTEGER,
    "ny" INTEGER,
    "sky_label" VARCHAR(50),
    "pty" INTEGER,
    "temperature" DOUBLE PRECISION,
    "pm10_value" INTEGER,
    "pm10_grade" VARCHAR(50),
    "pm25_value" INTEGER,
    "pm25_grade" VARCHAR(50),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_items" (
    "id" UUID NOT NULL,
    "recommendation_run_id" UUID NOT NULL,
    "event_item_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "distance_km" DOUBLE PRECISION,
    "reason" TEXT,
    "matched_tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_item_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" UUID NOT NULL,
    "exploration_session_id" UUID,
    "user_id" UUID,
    "event_item_id" UUID,
    "recommendation_run_id" UUID,
    "event_name" "event_name" NOT NULL,
    "step" VARCHAR(50),
    "page_path" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_credentials_user_id_key" ON "auth_credentials"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_revoked_at_idx" ON "refresh_tokens"("revoked_at");

-- CreateIndex
CREATE INDEX "exploration_sessions_session_key_idx" ON "exploration_sessions"("session_key");

-- CreateIndex
CREATE INDEX "exploration_sessions_user_id_idx" ON "exploration_sessions"("user_id");

-- CreateIndex
CREATE INDEX "exploration_sessions_status_idx" ON "exploration_sessions"("status");

-- CreateIndex
CREATE INDEX "exploration_sessions_current_step_idx" ON "exploration_sessions"("current_step");

-- CreateIndex
CREATE INDEX "exploration_sessions_expires_at_idx" ON "exploration_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "exploration_answers_question_key_idx" ON "exploration_answers"("question_key");

-- CreateIndex
CREATE UNIQUE INDEX "exploration_answers_exploration_session_id_question_key_key" ON "exploration_answers"("exploration_session_id", "question_key");

-- CreateIndex
CREATE UNIQUE INDEX "event_items_external_id_key" ON "event_items"("external_id");

-- CreateIndex
CREATE INDEX "event_items_realm_code_idx" ON "event_items"("realm_code");

-- CreateIndex
CREATE INDEX "event_items_realm_name_idx" ON "event_items"("realm_name");

-- CreateIndex
CREATE INDEX "event_items_start_date_end_date_idx" ON "event_items"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "event_items_lat_lng_idx" ON "event_items"("lat", "lng");

-- CreateIndex
CREATE INDEX "event_items_deleted_at_idx" ON "event_items"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_type_idx" ON "tags"("type");

-- CreateIndex
CREATE INDEX "event_item_tags_tag_id_idx" ON "event_item_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_item_tags_event_item_id_tag_id_key" ON "event_item_tags"("event_item_id", "tag_id");

-- CreateIndex
CREATE INDEX "recommendation_runs_exploration_session_id_idx" ON "recommendation_runs"("exploration_session_id");

-- CreateIndex
CREATE INDEX "recommendation_runs_user_id_idx" ON "recommendation_runs"("user_id");

-- CreateIndex
CREATE INDEX "recommendation_runs_created_at_idx" ON "recommendation_runs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "weather_snapshots_recommendation_run_id_key" ON "weather_snapshots"("recommendation_run_id");

-- CreateIndex
CREATE INDEX "weather_snapshots_sido_idx" ON "weather_snapshots"("sido");

-- CreateIndex
CREATE INDEX "weather_snapshots_fetched_at_idx" ON "weather_snapshots"("fetched_at");

-- CreateIndex
CREATE INDEX "recommendation_items_event_item_id_idx" ON "recommendation_items"("event_item_id");

-- CreateIndex
CREATE INDEX "recommendation_items_rank_idx" ON "recommendation_items"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_items_recommendation_run_id_event_item_id_key" ON "recommendation_items"("recommendation_run_id", "event_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_items_recommendation_run_id_rank_key" ON "recommendation_items"("recommendation_run_id", "rank");

-- CreateIndex
CREATE INDEX "favorites_event_item_id_idx" ON "favorites"("event_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_event_item_id_key" ON "favorites"("user_id", "event_item_id");

-- CreateIndex
CREATE INDEX "event_logs_exploration_session_id_idx" ON "event_logs"("exploration_session_id");

-- CreateIndex
CREATE INDEX "event_logs_user_id_idx" ON "event_logs"("user_id");

-- CreateIndex
CREATE INDEX "event_logs_event_name_idx" ON "event_logs"("event_name");

-- CreateIndex
CREATE INDEX "event_logs_step_idx" ON "event_logs"("step");

-- CreateIndex
CREATE INDEX "event_logs_created_at_idx" ON "event_logs"("created_at");

-- AddForeignKey
ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploration_sessions" ADD CONSTRAINT "exploration_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploration_answers" ADD CONSTRAINT "exploration_answers_exploration_session_id_fkey" FOREIGN KEY ("exploration_session_id") REFERENCES "exploration_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_item_tags" ADD CONSTRAINT "event_item_tags_event_item_id_fkey" FOREIGN KEY ("event_item_id") REFERENCES "event_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_item_tags" ADD CONSTRAINT "event_item_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_runs" ADD CONSTRAINT "recommendation_runs_exploration_session_id_fkey" FOREIGN KEY ("exploration_session_id") REFERENCES "exploration_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_runs" ADD CONSTRAINT "recommendation_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_snapshots" ADD CONSTRAINT "weather_snapshots_recommendation_run_id_fkey" FOREIGN KEY ("recommendation_run_id") REFERENCES "recommendation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_items" ADD CONSTRAINT "recommendation_items_recommendation_run_id_fkey" FOREIGN KEY ("recommendation_run_id") REFERENCES "recommendation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_items" ADD CONSTRAINT "recommendation_items_event_item_id_fkey" FOREIGN KEY ("event_item_id") REFERENCES "event_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_event_item_id_fkey" FOREIGN KEY ("event_item_id") REFERENCES "event_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_exploration_session_id_fkey" FOREIGN KEY ("exploration_session_id") REFERENCES "exploration_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_event_item_id_fkey" FOREIGN KEY ("event_item_id") REFERENCES "event_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_recommendation_run_id_fkey" FOREIGN KEY ("recommendation_run_id") REFERENCES "recommendation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
