ALTER TABLE "memory" RENAME COLUMN "dominant_color" TO "average_color";--> statement-breakpoint
ALTER TABLE "memory" ADD COLUMN "original_url" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "memory" ADD COLUMN "thumbnail_url" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN "filename";