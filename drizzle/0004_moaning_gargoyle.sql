ALTER TABLE "log" RENAME COLUMN "processed" TO "is_processed";--> statement-breakpoint
ALTER TABLE "competition" ADD COLUMN "is_processed" boolean DEFAULT false NOT NULL;