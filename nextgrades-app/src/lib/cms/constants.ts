/** Top-level locale groups editable in the CMS (public marketing site). */
export const CMS_PAGE_GROUPS = [
  { id: "home", label: "Home", prefixes: ["home"] },
  { id: "about", label: "About", prefixes: ["about", "aboutPage"] },
  { id: "programs", label: "Programs", prefixes: ["programs", "programsPage"] },
  { id: "subjects", label: "Subjects", prefixes: ["subjects", "subjectsPage"] },
  { id: "resources", label: "Resources", prefixes: ["resources", "resourcesPage"] },
  { id: "pricing", label: "Pricing", prefixes: ["pricing", "pricingPage"] },
  { id: "consultation", label: "Consultation", prefixes: ["consultation"] },
  { id: "contact", label: "Contact", prefixes: ["contact"] },
  { id: "help", label: "Help", prefixes: ["help"] },
  { id: "careers", label: "Careers", prefixes: ["careers", "careersPage"] },
  { id: "legal", label: "Privacy & Terms", prefixes: ["privacy", "terms"] },
  { id: "global", label: "Navbar & Footer", prefixes: ["navbar", "footer", "common"] },
  { id: "auth", label: "Login & Auth pages", prefixes: ["login", "loginPage", "forgotPassword", "resetPassword"] },
  { id: "misc", label: "Other copy", prefixes: ["misc", "images", "aiGenerator", "aiGeneratorPage"] },
] as const;

/** Dashboard-only keys — not shown in public CMS. */
export const CMS_EXCLUDED_PREFIXES = [
  "dashboardNav",
  "dashboardPages",
  "studentDashboard",
  "teacherDashboard",
  "adminDashboard",
  "dashboardCommon",
  "dashboard.",
  "admin.",
];

export function getPageGroupForKey(i18nKey: string): string {
  const group = CMS_PAGE_GROUPS.find((g) => g.prefixes.some((p) => i18nKey === p || i18nKey.startsWith(`${p}.`)));
  return group?.id ?? "misc";
}

export function humanizeKey(key: string): string {
  const last = key.split(".").pop() ?? key;
  return last
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
