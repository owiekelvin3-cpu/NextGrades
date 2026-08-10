import type { AppRole } from "@/lib/auth/roles";

/** When false, only admins can upload or publish library materials. */
export const TEACHER_PUBLISHING_ENABLED = false;

export function canPublishLibraryMaterials(role: AppRole | string | undefined): boolean {
  if (role === "admin") return true;
  if (role === "teacher") return TEACHER_PUBLISHING_ENABLED;
  return false;
}

export const PUBLISH_FORBIDDEN_MESSAGE =
  "Only administrators can publish library materials. Contact your admin if something should be added.";
