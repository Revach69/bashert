-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('creator', 'matchmaker', 'organizer');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'reviewed', 'approved', 'rejected', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['creator']::"Role"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_cards" (
    "id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "subject_first_name" TEXT NOT NULL,
    "subject_last_name" TEXT NOT NULL,
    "subject_email" TEXT,
    "subject_phone" TEXT,
    "gender" "Gender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "photo_url" TEXT,
    "height" TEXT,
    "occupation" TEXT,
    "education" TEXT,
    "ethnicity" TEXT,
    "family_background" TEXT,
    "hashkafa" TEXT,
    "additional_info" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "organizer_id" UUID NOT NULL,
    "matchmaker_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "pre_access_hours" INTEGER NOT NULL DEFAULT 0,
    "post_access_hours" INTEGER NOT NULL DEFAULT 0,
    "join_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "opted_in_by" UUID NOT NULL,
    "opted_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_requests" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "requesting_profile_id" UUID NOT NULL,
    "target_profile_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "matchmaker_notes" TEXT,
    "is_mutual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interest_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "profile_cards_creator_id_idx" ON "profile_cards"("creator_id");

-- CreateIndex
CREATE INDEX "profile_cards_gender_is_active_idx" ON "profile_cards"("gender", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "events_join_code_key" ON "events"("join_code");

-- CreateIndex
CREATE INDEX "events_organizer_id_idx" ON "events"("organizer_id");

-- CreateIndex
CREATE INDEX "events_matchmaker_id_idx" ON "events"("matchmaker_id");

-- CreateIndex
CREATE INDEX "events_join_code_idx" ON "events"("join_code");

-- CreateIndex
CREATE INDEX "event_participations_event_id_idx" ON "event_participations"("event_id");

-- CreateIndex
CREATE INDEX "event_participations_profile_id_idx" ON "event_participations"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participations_event_id_profile_id_key" ON "event_participations"("event_id", "profile_id");

-- CreateIndex
CREATE INDEX "interest_requests_event_id_idx" ON "interest_requests"("event_id");

-- CreateIndex
CREATE INDEX "interest_requests_requesting_profile_id_idx" ON "interest_requests"("requesting_profile_id");

-- CreateIndex
CREATE INDEX "interest_requests_target_profile_id_idx" ON "interest_requests"("target_profile_id");

-- CreateIndex
CREATE INDEX "interest_requests_status_idx" ON "interest_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "interest_requests_event_id_requesting_profile_id_target_pro_key" ON "interest_requests"("event_id", "requesting_profile_id", "target_profile_id");

-- AddForeignKey
ALTER TABLE "profile_cards" ADD CONSTRAINT "profile_cards_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_matchmaker_id_fkey" FOREIGN KEY ("matchmaker_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participations" ADD CONSTRAINT "event_participations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participations" ADD CONSTRAINT "event_participations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participations" ADD CONSTRAINT "event_participations_opted_in_by_fkey" FOREIGN KEY ("opted_in_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_requests" ADD CONSTRAINT "interest_requests_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_requests" ADD CONSTRAINT "interest_requests_requesting_profile_id_fkey" FOREIGN KEY ("requesting_profile_id") REFERENCES "profile_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_requests" ADD CONSTRAINT "interest_requests_target_profile_id_fkey" FOREIGN KEY ("target_profile_id") REFERENCES "profile_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_requests" ADD CONSTRAINT "interest_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

