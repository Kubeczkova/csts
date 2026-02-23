CREATE TABLE "enums" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"enum_id" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participant" ALTER COLUMN "club" DROP NOT NULL;