ALTER TABLE "memory" ADD COLUMN "filename" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN "image_key_original";--> statement-breakpoint
ALTER TABLE "memory" DROP COLUMN "image_key_thumbnail";