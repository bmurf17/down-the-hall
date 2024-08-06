ALTER TABLE "book" RENAME COLUMN "authorId" TO "author_id";--> statement-breakpoint
ALTER TABLE "book" DROP CONSTRAINT "book_authorId_author_id_fk";
--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "default_physical_edition_id" integer;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "series_position" integer;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "series_length" integer;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "series_name" integer;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "hardcover_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_author_id_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
