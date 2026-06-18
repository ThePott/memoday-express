ALTER TABLE "memory" ADD COLUMN "filename" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN "original_url";--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN "thumbnail_url";