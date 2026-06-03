import { redirect } from "next/navigation";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export default function WebsiteContentPage() {
  redirect(ADMIN_PORTAL_HOME);
}
