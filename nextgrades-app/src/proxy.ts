import { NextResponse, type NextRequest } from "next/server";
import { resolveUserRole, type AppRole } from "@/lib/auth/roles";
import { resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { isGuestAuthPath } from "@/lib/auth/guest-paths";
import { isSupabaseEnvConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADMIN_PORTAL_HOME,
  ADMIN_PORTAL_LOGIN,
  mapLegacyAdminPath,
} from "@/lib/admin/portal-paths";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  isAuthUserEmailVerified,
  isSignupEmailVerificationRequired,
  isLoginEmailVerificationRequired,
} from "@/lib/auth/config";
import { isLoginMfaSatisfiedFromRequest } from "@/lib/auth/mfa-cookies";
import { isVerificationPath, redirectToVerification } from "@/lib/auth/verification-routes";
import { PASSWORD_SETUP_PATH, isPasswordSetupPath } from "@/lib/auth/password-setup";
import { enforceGlobalApiRateLimit } from "@/lib/security/rate-limit";

const DASHBOARD_ROLE_PREFIXES: Record<string, AppRole[]> = {
  "/dashboard/student": ["student"],
  "/dashboard/teacher": ["teacher"],
};

const AUTHENTICATED_DASHBOARD_PREFIXES = ["/dashboard"];
const PROTECTED_APP_PREFIXES = ["/dashboard", "/portal", "/checkout", "/ai-generator"];

function isProtectedAppPath(path: string): boolean {
  return PROTECTED_APP_PREFIXES.some((p) => path.startsWith(p));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const requestedPath = request.nextUrl.pathname;

  if (requestedPath.startsWith("/api/")) {
    const limited = await enforceGlobalApiRateLimit(request);
    if (limited) return limited;
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // /signin → /login (preserve query string)
  if (requestedPath === "/signin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isSupabaseEnvConfigured()) {
    if (requestedPath.startsWith("/dashboard") || requestedPath.startsWith("/portal")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = requestedPath.startsWith("/portal") ? ADMIN_PORTAL_LOGIN : "/login";
      redirectUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: AppRole | null = null;
  let userActive = true;
  let passwordSetupRequired = false;
  if (user) {
    let profileRole: unknown = null;
    let profileActive: boolean | null = null;
    let profilePasswordSetupRequired: boolean | null = null;

    if (isSupabaseServiceRoleConfigured()) {
      const { data: profile } = await createAdminClient()
        .from("profiles")
        .select("role, is_active, password_setup_required")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
      profileActive = profile?.is_active ?? null;
      profilePasswordSetupRequired = profile?.password_setup_required ?? null;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active, password_setup_required")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
      profileActive = profile?.is_active ?? null;
      profilePasswordSetupRequired = profile?.password_setup_required ?? null;
    }

    userActive = profileActive !== false;
    passwordSetupRequired = profilePasswordSetupRequired === true;
    userRole = resolveUserRole(profileRole, user.user_metadata);

    if (!userActive) {
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("suspended", "1");
      redirectUrl.searchParams.delete("redirect");
      return NextResponse.redirect(redirectUrl);
    }

    if (
      passwordSetupRequired &&
      isProtectedAppPath(requestedPath) &&
      !isPasswordSetupPath(requestedPath) &&
      !isVerificationPath(requestedPath)
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = PASSWORD_SETUP_PATH;
      redirectUrl.search = "";
      redirectUrl.searchParams.set("setup", "required");
      return NextResponse.redirect(redirectUrl);
    }

    if (isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
      const needsVerifiedSession =
        isProtectedAppPath(requestedPath) ||
        requestedPath === "/choose-role";

      if (needsVerifiedSession && !isVerificationPath(requestedPath)) {
        const redirectUrl = redirectToVerification(request, "signup", {
          email: user.email,
          redirect: requestedPath !== "/choose-role" ? requestedPath : null,
        });
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (
      isLoginEmailVerificationRequired() &&
      isAuthUserEmailVerified(user) &&
      isProtectedAppPath(requestedPath) &&
      !(userRole === "admin" && requestedPath.startsWith("/portal")) &&
      !(await isLoginMfaSatisfiedFromRequest(request, user.id)) &&
      !isVerificationPath(requestedPath)
    ) {
      const redirectUrl = redirectToVerification(request, "login", {
        email: user.email,
        redirect: requestedPath,
      });
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Legacy admin dashboard URLs → admin portal
  if (requestedPath.startsWith("/dashboard/admin")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = mapLegacyAdminPath(requestedPath);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // Admin portal routes
  if (requestedPath.startsWith("/portal")) {
    if (requestedPath === ADMIN_PORTAL_LOGIN) {
      if (user) {
        if (
          isLoginEmailVerificationRequired() &&
          userRole !== "admin" &&
          !(await isLoginMfaSatisfiedFromRequest(request, user.id))
        ) {
          const redirectUrl = redirectToVerification(request, "login", {
            email: user.email,
          });
          return NextResponse.redirect(redirectUrl);
        }

        const redirectUrl = request.nextUrl.clone();
        if (userRole === "admin") {
          redirectUrl.pathname = ADMIN_PORTAL_HOME;
        } else if (userRole) {
          redirectUrl.pathname = resolvePostAuthRedirect(userRole, null);
        } else {
          redirectUrl.pathname = "/choose-role";
        }
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }

    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ADMIN_PORTAL_LOGIN;
      redirectUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole ? `/dashboard/${userRole}` : "/login";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const isDashboardRoute = AUTHENTICATED_DASHBOARD_PREFIXES.some((p) =>
    requestedPath.startsWith(p)
  );

  if (isDashboardRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }

    if (!userRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/choose-role";
      return NextResponse.redirect(redirectUrl);
    }

    // Admins belong in the portal, not the student/teacher dashboard shell
    if (userRole === "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ADMIN_PORTAL_HOME;
      return NextResponse.redirect(redirectUrl);
    }

    if (requestedPath === "/dashboard" || requestedPath === "/dashboard/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }

    for (const [path, roles] of Object.entries(DASHBOARD_ROLE_PREFIXES)) {
      if (requestedPath.startsWith(path) && !roles.includes(userRole)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/dashboard/${userRole}`;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  if (requestedPath.startsWith("/admin") && requestedPath !== "/admin-access") {
    const redirectUrl = request.nextUrl.clone();
    if (!user) {
      redirectUrl.pathname = ADMIN_PORTAL_LOGIN;
      redirectUrl.searchParams.set("redirect", ADMIN_PORTAL_HOME);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== "admin") {
      redirectUrl.pathname = userRole ? `/dashboard/${userRole}` : "/login";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    redirectUrl.pathname = ADMIN_PORTAL_HOME;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (requestedPath === "/choose-role") {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
    if (passwordSetupRequired) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = PASSWORD_SETUP_PATH;
      redirectUrl.search = "";
      redirectUrl.searchParams.set("setup", "required");
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole === "admin" ? ADMIN_PORTAL_HOME : `/dashboard/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (
    !user &&
    requestedPath.startsWith("/ai-generator")
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", requestedPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isVerificationPath(requestedPath)) {
    return response;
  }

  if (user && isGuestAuthPath(requestedPath)) {
    if (passwordSetupRequired) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = PASSWORD_SETUP_PATH;
      redirectUrl.search = "";
      redirectUrl.searchParams.set("setup", "required");
      return NextResponse.redirect(redirectUrl);
    }

    const needsSignupVerify =
      isSignupEmailVerificationRequired() && !isAuthUserEmailVerified(user);
    const needsLoginMfa =
      isLoginEmailVerificationRequired() &&
      isAuthUserEmailVerified(user) &&
      !(await isLoginMfaSatisfiedFromRequest(request, user.id));

    if (needsSignupVerify) {
      const redirectUrl = redirectToVerification(request, "signup", {
        email: user.email,
        redirect: request.nextUrl.searchParams.get("redirect"),
      });
      return NextResponse.redirect(redirectUrl);
    }

    if (needsLoginMfa) {
      const redirectUrl = redirectToVerification(request, "login", {
        email: user.email,
        redirect: request.nextUrl.searchParams.get("redirect"),
      });
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = request.nextUrl.clone();
    if (userRole) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      redirectUrl.pathname = resolvePostAuthRedirect(userRole, redirectParam);
      redirectUrl.search = "";
    } else {
      redirectUrl.pathname = "/choose-role";
      redirectUrl.search = "";
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/portal/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/checkout",
    "/ai-generator/:path*",
    "/ai-generator",
    "/login",
    "/register",
    "/signup",
    "/signin",
    "/forgot-password",
    "/reset-password",
    "/admin-access",
    "/choose-role",
    "/verify",
  ],
};
