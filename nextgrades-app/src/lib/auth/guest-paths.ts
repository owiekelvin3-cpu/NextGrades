/** Routes that signed-in users should be redirected away from. */
export const GUEST_AUTH_PATHS = [
  "/login",
  "/register",
  "/signup",
  "/signin",
  "/forgot-password",
] as const;

export type GuestAuthPath = (typeof GUEST_AUTH_PATHS)[number];

export function isGuestAuthPath(pathname: string): boolean {
  return (GUEST_AUTH_PATHS as readonly string[]).includes(pathname);
}
