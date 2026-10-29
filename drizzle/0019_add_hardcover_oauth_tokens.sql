CREATE TABLE IF NOT EXISTS "hardcover_oauth_token" (
	"id" integer PRIMARY KEY NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scope" text,
	"token_type" text,
	"refresh_lock_expires_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
