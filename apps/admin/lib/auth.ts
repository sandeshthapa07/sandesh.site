import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"

import { db } from "@workspace/db"
import { account, session, user, verification } from "@workspace/db/schema"

import { isAllowedAdminEmail } from "./admin"

/**
 * Lazy singleton: `db()` opens a connection, so building the auth instance
 * at module scope would require DATABASE_URL at build time.
 */
let instance: ReturnType<typeof create> | null = null

function create() {
  return betterAuth({
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            if (!isAllowedAdminEmail(newUser.email)) {
              throw new APIError("FORBIDDEN", {
                message: "This account is not allowed to sign in.",
              })
            }
            return { data: newUser }
          },
        },
      },
    },
    plugins: [nextCookies()],
  })
}

export function auth() {
  return (instance ??= create())
}
