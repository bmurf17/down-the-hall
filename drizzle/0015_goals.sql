CREATE TABLE IF NOT EXISTS "user_goal" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"time_frame" integer,
	"book_count" integer
);
