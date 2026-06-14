import { pgTable, varchar, date, bigint } from "drizzle-orm/pg-core"

export const memory = pgTable("memory", {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    date: date({ mode: "string" }).notNull(),
    front_message: varchar(),
    rear_message: varchar(),
    filename: varchar().notNull(),
    dominant_color: varchar().notNull(), // NOTE: HEXCODE
})
