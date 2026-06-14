CREATE TABLE "memory" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"front_message" varchar,
	"rear_message" varchar,
	"image_key_original" varchar,
	"image_key_thumbnail" varchar,
	"dominant_color" varchar
);
