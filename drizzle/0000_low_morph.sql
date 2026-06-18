CREATE TYPE "public"."login_provider" AS ENUM('apple');--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"provider" "login_provider" NOT NULL,
	"identity" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"front_message" varchar,
	"rear_message" varchar,
	"filename" varchar NOT NULL,
	"average_color" varchar NOT NULL,
	"app_user_id" bigint NOT NULL,
	CONSTRAINT "memory_date_app_user_id_unique" UNIQUE("date","app_user_id")
);
--> statement-breakpoint
ALTER TABLE "memory" ADD CONSTRAINT "memory_app_user_id_app_user_id_fk" FOREIGN KEY ("app_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;