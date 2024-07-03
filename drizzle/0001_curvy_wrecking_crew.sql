CREATE TABLE IF NOT EXISTS "author" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"authorId" integer,
	"image" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_authorId_author_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."author"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
