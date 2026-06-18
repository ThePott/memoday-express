import { pgTable, varchar, date, bigint, pgEnum, unique } from "drizzle-orm/pg-core"

export const login_provider = pgEnum("login_provider", ["apple"])

export const app_user = pgTable("app_user", {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
    provider: login_provider().notNull(),
    identity: varchar().notNull(),
})

export const memory = pgTable(
    "memory",
    {
        id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
        date: date({ mode: "string" }).notNull(), // NOTE: yyyy-mm-dd
        front_message: varchar(),
        rear_message: varchar(),
        filename: varchar().notNull(),
        average_color: varchar().notNull(), // NOTE: HEXCODE
        app_user_id: bigint({ mode: "bigint" })
            .notNull()
            .references(() => app_user.id, { onDelete: "cascade" }),
    },
    (table) => [unique().on(table.date, table.app_user_id)],
)
