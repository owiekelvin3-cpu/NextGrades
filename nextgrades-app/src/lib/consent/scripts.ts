import { canLoadAnalytics, canLoadMarketing } from "./manager";

const LOADED = new Set<string>();

function injectScript(id: string, src: string, async = true): void {
  if (typeof document === "undefined" || LOADED.has(id)) return;
  if (document.getElementById(id)) {
    LOADED.add(id);
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
  LOADED.add(id);
}

function injectInlineScript(id: string, content: string): void {
  if (typeof document === "undefined" || LOADED.has(id)) return;
  if (document.getElementById(id)) {
    LOADED.add(id);
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
  LOADED.add(id);
}

export function loadGoogleAnalytics(measurementId: string): void {
  if (!canLoadAnalytics() || !measurementId.trim()) return;
  const gid = measurementId.trim();
  injectScript("ng-ga-loader", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gid)}`);
  injectInlineScript(
    "ng-ga-config",
    `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gid.replace(/'/g, "\\'")}',{anonymize_ip:true});`
  );
}

export function loadCustomScript(id: string, url: string, category: "analytics" | "marketing"): void {
  if (category === "analytics" && !canLoadAnalytics()) return;
  if (category === "marketing" && !canLoadMarketing()) return;
  if (!url.trim()) return;
  injectScript(`ng-custom-${id}`, url.trim());
}

export function unloadThirdPartyScripts(): void {
  if (typeof document === "undefined") return;
  ["ng-ga-loader", "ng-ga-config"].forEach((id) => {
    document.getElementById(id)?.remove();
    LOADED.delete(id);
  });
  document.querySelectorAll('script[id^="ng-custom-"]').forEach((el) => {
    LOADED.delete(el.id);
    el.remove();
  });
}

export type ConsentScriptConfig = {
  googleAnalyticsId?: string | null;
  analyticsScriptUrl?: string | null;
  marketingScriptUrl?: string | null;
};

export function applyConsentScripts(config: ConsentScriptConfig): void {
  unloadThirdPartyScripts();
  if (config.googleAnalyticsId) {
    loadGoogleAnalytics(config.googleAnalyticsId);
  }
  if (config.analyticsScriptUrl) {
    loadCustomScript("analytics", config.analyticsScriptUrl, "analytics");
  }
  if (config.marketingScriptUrl) {
    loadCustomScript("marketing", config.marketingScriptUrl, "marketing");
  }
}
