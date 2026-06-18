CREATE TYPE "public"."login_provider" AS ENUM('apple');--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"provider" "login_provider" NOT NULL,
	"identity" varchar NOT NULL
);
