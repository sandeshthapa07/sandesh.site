import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { isAllowedAdminEmail } from "./admin"
import { auth } from "./auth"

/** Resolve the current session or redirect to the login page. */
export async function requireAdmin() {
  const session = await auth().api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  // Defense in depth: the allowlist is enforced at sign-up, but re-check on
  // every request in case ADMIN_EMAILS changed after a user was created.
  if (!isAllowedAdminEmail(session.user.email)) redirect("/login?error=forbidden")
  return session
}
