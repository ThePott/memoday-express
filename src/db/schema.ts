import { pgTable, varchar, date, bigint } from "drizzle-orm/pg-core"

export const memory = pgTable("memory", {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    date: date({ mode: "string" }).notNull(),
    front_message: varchar(),
    rear_message: varchar(),
    image_key_original: varchar(),
    image_key_thumbnail: varchar(),
    dominant_color: varchar(), // NOTE: HEXCODE
})
