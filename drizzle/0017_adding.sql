CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"user_name" text,
	"last_logged_in" timestamp

);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_goal" ADD CONSTRAINT "user_goal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
