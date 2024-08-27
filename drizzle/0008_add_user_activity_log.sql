CREATE TABLE IF NOT EXISTS "user_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"book_id" integer,
	"updated_date" timestamp,
	"action" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_user_site_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_site"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
