import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveUserRole, type AppRole } from "@/lib/auth/roles";
import { resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { isSupabaseEnvConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";

const DASHBOARD_ROLE_PREFIXES: Record<string, AppRole[]> = {
  "/dashboard/student": ["student"],
  "/dashboard/teacher": ["teacher"],
  "/dashboard/admin": ["admin"],
};

const AUTHENTICATED_DASHBOARD_PREFIXES = ["/dashboard"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const requestedPath = request.nextUrl.pathname;

  if (!isSupabaseEnvConfigured()) {
    if (requestedPath.startsWith("/dashboard")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
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
  if (user) {
    let profileRole: unknown = null;
    let profileActive: boolean | null = null;

    if (isSupabaseServiceRoleConfigured()) {
      const { data: profile } = await createAdminClient()
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
      profileActive = profile?.is_active ?? null;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
      profileActive = profile?.is_active ?? null;
    }

    userActive = profileActive !== false;
    userRole = resolveUserRole(profileRole, user.user_metadata);

    if (!userActive) {
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("suspended", "1");
      redirectUrl.searchParams.delete("redirect");
      return NextResponse.redirect(redirectUrl);
    }
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

    if (requestedPath === "/dashboard" || requestedPath === "/dashboard/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }

    for (const [path, roles] of Object.entries(DASHBOARD_ROLE_PREFIXES)) {
      if (requestedPath.startsWith(path) && !roles.includes(userRole)) {
        const redirectUrl = request.nextUrl.clone();
        if (path === "/dashboard/admin") {
          redirectUrl.pathname = "/admin-access";
          redirectUrl.searchParams.set("return", requestedPath);
        } else {
          redirectUrl.pathname = `/dashboard/${userRole}`;
        }
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  if (requestedPath.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin-access";
      redirectUrl.searchParams.set("return", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (requestedPath === "/choose-role") {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (user && (requestedPath === "/login" || requestedPath === "/register")) {
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
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/admin-access", "/choose-role"],
};
