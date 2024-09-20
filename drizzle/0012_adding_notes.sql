CREATE TABLE IF NOT EXISTS "book_note" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"book_id" integer,
	"updated_date" timestamp,
	"note" text,
	"page_number" integer,
	"series" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book_note" ADD CONSTRAINT "book_note_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
