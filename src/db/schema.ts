import { pgTable, varchar, date, bigint } from "drizzle-orm/pg-core"

export const memory = pgTable("memory", {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    date: date({ mode: "string" }).notNull(), // NOTE: yyyy-mm-dd
    front_message: varchar(),
    rear_message: varchar(),
    original_url: varchar().notNull(),
    thumbnail_url: varchar().notNull(),
    average_color: varchar().notNull(), // NOTE: HEXCODE
})
