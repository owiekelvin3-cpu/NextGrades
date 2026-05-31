import { redirect } from "next/navigation";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export default function LegacyAdminPage() {
  redirect(ADMIN_PORTAL_HOME);
}
