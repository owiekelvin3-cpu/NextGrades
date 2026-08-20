import { redirect } from "next/navigation";
import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

export default function LegacyAIGeneratorPage() {
  redirect(`${ADMIN_PORTAL_PREFIX}/ai-generator`);
}
