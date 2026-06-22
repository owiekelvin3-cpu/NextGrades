# CMS Reconnaissance — NextGrades.at (`nextgrades-app`)

> Phase 0 findings. Reference for all CMS implementation work.

## 1. File / folder structure

| Area | Path | Notes |
|------|------|-------|
| Routing | `nextgrades-app/src/app/` | **App Router only** (no `/pages`) |
| Components | `src/components/` | Custom UI in `ui/`; CMS in `admin/cms/` |
| Lib | `src/lib/` | CMS logic in `lib/cms/` |
| Hooks | `src/hooks/` | `useHomeCms`, `useCmsImage`, `useCmsTeam` |
| Types | `src/lib/cms/types.ts` | Existing CMS entity types |

**Admin routes:** `/portal/admin/*` (canonical). Legacy `/dashboard/admin/*` redirects via `mapLegacyAdminPath`.

**CMS routes (this build):** `/portal/admin/cms/*` (spec-aligned). Legacy `/portal/admin/website-content/*` redirects here.

## 2. Auth system

| Layer | File | Pattern |
|-------|------|---------|
| Client guard | `src/components/admin/AdminPortalGuard.tsx` | `profiles.role === 'admin'` |
| Portal layout | `src/app/portal/layout.tsx` | Wraps non-login portal routes |
| API auth | `src/lib/auth/api-auth.ts` | `requireAdminApi()` for mutations |
| CMS helper | `src/lib/cms/admin-auth.ts` | `requireAdmin()` |
| Edge | `src/proxy.ts` | Auth logic exists; wire as middleware if needed |

CMS routes inherit `AdminPortalGuard` via `/portal/layout.tsx`.

## 3. Supabase clients

| Client | Path | Use |
|--------|------|-----|
| Browser | `src/lib/supabase/client.ts` | `@supabase/ssr` singleton |
| Server (RLS) | `src/lib/supabase/server.ts` | `createClient()` cookies |
| Service role | `src/lib/supabase/admin.ts` | `createAdminClient()` admin writes |

CMS API routes use `requireAdminApi()` + service role when configured.

## 4. UI component library

**Not shadcn/Radix.** Custom primitives:

- `@/components/ui/Button` — variants: `gold`, `outline`, `ghost`, `dark`, `onDark`
- `@/components/ui/Card`, `Input`, `Badge`, `Skeleton`, `Toggle`
- Icons: `lucide-react` via shim `src/lib/icons/lucide-react.tsx`
- Rich text: TipTap in `CmsRichTextEditor.tsx`

## 5. Admin layout & navigation

| Piece | File |
|-------|------|
| Main sidebar | `src/components/dashboard/Sidebar.tsx` — `adminConfig[]` |
| Admin hub | `src/components/admin/AdminNavHub.tsx` |
| CMS shell | `src/components/admin/cms/shell/CmsShell.tsx` |
| CMS sub-nav | `src/lib/cms/cms-nav.ts` — `CMS_SIDEBAR_PAGES`, `CMS_SIDEBAR_TOOLS` |

Nav items are **arrays of `{ href, icon, labelKey }`** — add CMS entry to `adminConfig` + hub section.

## 6. State management

- **React Context:** `CmsContext` (public overrides), `CmsEditorContext` (admin editor), `ToastContext`, `ThemeContext`
- **No** Zustand, React Query, or SWR
- Data: `fetch` / `cmsFetch()` + `useState`/`useEffect`

## 7. Form handling

- **No** react-hook-form or zod in `package.json`
- CMS uses controlled `useState` + manual validation + `useToast()`

## 8. Notifications

`src/context/ToastContext.tsx` — `useToast()` → `success()`, `error()`, `info()`

## 9. TypeScript

`tsconfig.json`: **`strict: true`**, `@/*` → `./src/*`

## 10. Tailwind

- **Tailwind CSS v4** — no `tailwind.config.js`
- Entry: `src/app/globals.css` — `@import "tailwindcss"`, `@theme inline`
- Tokens: `src/lib/theme/design-tokens.css`

---

## Existing CMS vs spec mapping

| Spec | Existing implementation |
|------|-------------------------|
| `/admin/cms` | **`/portal/admin/cms`** (this build) |
| `cms_pages` / `cms_blocks` | `cms_sections` + `cms_content` + `cms_page_layouts` + i18n keys |
| `site_settings` | `cms_theme_settings` + new `site_settings` table (migration) |
| `subjects` | `cms_subject_items` |
| `pricing_plans` | `cms_pricing_plans` |
| `testimonials` | `cms_testimonials` |
| `faqs` | `cms_faqs` |
| `media` | `cms_media` + Storage `resource-thumbnails/cms/*` |
| `blog_posts` | **New** `blog_posts` table + `/portal/admin/cms/blog` |
| `tests` / `questions` | **Quiz system** (`quizzes`, `quiz_questions`) — CMS links to Quiz Monitor |
| 19 API routes | `src/app/api/cms/*` — fully implemented |

### Disabled gate (fixed in this build)

`website-content/layout.tsx` previously redirected to portal home. CMS re-enabled at `/portal/admin/cms`.

### Key files

- Disable gate (legacy): `src/app/portal/admin/website-content/layout.tsx`
- Editor: `CmsVisualEditor.tsx`, `CmsStructuredDataPage.tsx`
- Public consumption: `CmsContext.tsx`, `/api/cms/overrides`
- Migrations: `00002_cms_content.sql`, `00025_cms_studio.sql`, `00027_cms_enterprise.sql`

## Implementation status (2026-06-21)

- CMS studio live at `/portal/admin/cms` (replaces disabled `website-content` gate)
- Existing i18n CMS (`cms_content`, structured data APIs) preserved — not duplicated as `cms_pages`/`cms_blocks`
- New: `blog_posts`, `site_settings` tables + `/api/cms/blog`, `/api/cms/site-settings`
- Admin: blog manager/editor, site settings (3 tabs), tests hub → quiz monitor
- Shared: `components/cms/*` headers, empty/loading/delete dialog; hooks `useCMSSection`, `useMediaUpload`, `useAutoSave`
- Nav: Sidebar + AdminNavHub CMS entry; legacy redirects in `next.config.ts`
- Migration: `00038_cms_blog_site_settings.sql` (apply via `npm run db:setup` or Supabase SQL editor)


1. **Re-enable** CMS via `CmsShell` at `/portal/admin/cms` (do not duplicate schema).
2. **Extend** with `blog_posts`, `site_settings`, shared `components/cms/*` hooks.
3. **Redirect** legacy `website-content` URLs to `cms`.
4. **Wire** admin sidebar + hub to CMS.
5. **Map** spec "Tests" to existing quiz monitor + student quiz tables.
