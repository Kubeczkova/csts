ALTER TABLE "participant" ADD COLUMN "competition_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "result" DROP COLUMN "participant_id";