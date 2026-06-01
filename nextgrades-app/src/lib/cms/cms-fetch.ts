/** Authenticated fetch for CMS admin APIs (session cookies). */
export function cmsFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: "include",
    cache: init?.cache ?? "no-store",
  });
}
