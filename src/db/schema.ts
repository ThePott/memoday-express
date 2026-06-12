import { pgTable, unique, integer, varchar, date, bigint } from "drizzle-orm/pg-core"

export const app_user = pgTable("app_user", {
    id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
})

export const memory = pgTable(
    "memory",
    {
        id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
        date: date().notNull,
        app_user_id: bigint({ mode: "bigint" }),
    },
    (table) => [unique("users_email_unique").on(table.email)],
)
