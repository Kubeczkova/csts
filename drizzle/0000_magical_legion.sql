CREATE TABLE "competition" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_created" date NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"date_from" date NOT NULL,
	"date_to" date NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"log_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_created" date NOT NULL,
	"type" text,
	"url" text NOT NULL,
	"request" text NOT NULL,
	"processed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant" (
	"id" serial PRIMARY KEY NOT NULL,
	"club" text NOT NULL,
	"first" text NOT NULL,
	"second" text NOT NULL,
	"ranking" text NOT NULL,
	"dance_class" text NOT NULL,
	"dance_category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result" (
	"id" serial PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"participant_id" text NOT NULL
);
