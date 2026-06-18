ALTER TABLE "memory" ADD COLUMN "app_user_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "memory" ADD CONSTRAINT "memory_date_app_user_id_unique" UNIQUE("date","app_user_id");--> statement-breakpoint
ALTER TABLE "memory" ADD CONSTRAINT "memory_app_user_id_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "app_user"("id");