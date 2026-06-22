import { redirect } from "next/navigation";
import { CMS_SIDEBAR_PAGES } from "@/lib/cms/cms-nav";

/** Hero & landing content is edited on the Home page visual editor. */
export default function CmsHeroPage() {
  const home = CMS_SIDEBAR_PAGES.find((p) => p.id === "home");
  redirect(home?.href ?? CMS_SIDEBAR_PAGES[0].href);
}
