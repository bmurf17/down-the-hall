-- Step 1: Drop the existing foreign key constraint
ALTER TABLE "user_activity_log" DROP CONSTRAINT IF EXISTS "user_activity_log_user_id_user_site_id_fk";

-- Step 2: Alter the data types
ALTER TABLE "user_site" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "user_activity_log" ALTER COLUMN "user_id" SET DATA TYPE text;

-- Step 3: Re-create the foreign key constraint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_user_site_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "user_site"("id")