import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres"
import { DATABASE_URL } from "./env-var.js"
import type { Pool } from "pg"

const db: NodePgDatabase<Record<string, never>> & {
    $client: Pool
} = drizzle(DATABASE_URL)

export default db
