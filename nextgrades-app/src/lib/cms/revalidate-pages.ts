import { revalidatePath } from "next/cache";
import { CMS_PAGE_PREVIEW_ROUTES } from "./page-routes";

/** Revalidate public routes after CMS publish so the live site updates immediately. */
export function revalidateCmsAfterPublish(pageIds: string[]) {
  const paths = new Set<string>(["/"]);

  for (const pageId of pageIds) {
    const path = CMS_PAGE_PREVIEW_ROUTES[pageId];
    if (path) paths.add(path);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  revalidatePath("/api/cms/overrides");
}
