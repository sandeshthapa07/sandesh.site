import { loadEnvConfig } from "@next/env"
import { defineConfig } from "drizzle-kit"

// DATABASE_URL lives in the apps' .env.local files — try each until found.
for (const dir of ["../../apps/admin", "../../apps/web", "../.."]) {
  if (process.env.DATABASE_URL) break
  loadEnvConfig(dir)
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
