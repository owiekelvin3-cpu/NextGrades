import { redirect } from "next/navigation";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

/** Website content CMS is disabled — send admins back to the portal home. */
export default function WebsiteContentLayout() {
  redirect(ADMIN_PORTAL_HOME);
}
