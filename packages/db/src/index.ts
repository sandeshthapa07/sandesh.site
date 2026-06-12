import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

/**
 * Lazy singleton so the apps build without a DATABASE_URL — the connection
 * is only opened when a query actually runs. `max: 1` keeps serverless
 * functions to a single connection (use Neon's pooled URL in production).
 */
let instance: ReturnType<typeof create> | null = null

function create() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  const client = postgres(url, { max: 1 })
  return drizzle(client, { schema })
}

export function db() {
  return (instance ??= create())
}
