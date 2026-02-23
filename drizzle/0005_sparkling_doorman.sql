ALTER TABLE "participant" ALTER COLUMN "ranking" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "participant" ADD COLUMN "ranking_to" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "dance_class";--> statement-breakpoint
ALTER TABLE "participant" DROP COLUMN "dance_category";