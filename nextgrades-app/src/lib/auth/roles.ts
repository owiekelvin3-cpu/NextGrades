export type AppRole = "student" | "teacher" | "admin";

const VALID_ROLES: AppRole[] = ["student", "teacher", "admin"];

export function parseAppRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  return VALID_ROLES.includes(value as AppRole) ? (value as AppRole) : null;
}

export function resolveUserRole(
  profileRole: unknown,
  metadata?: { role?: unknown } | null
): AppRole | null {
  return parseAppRole(profileRole) ?? parseAppRole(metadata?.role);
}
