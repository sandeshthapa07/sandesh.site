/**
 * Comma-separated allowlist of emails that may sign in to the admin panel.
 * Anyone else is rejected before a user row is ever created.
 */
export function isAllowedAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}
