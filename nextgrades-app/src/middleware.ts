import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveUserRole, type AppRole } from "@/lib/auth/roles";
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
  if (user) {
    let profileRole: unknown = null;

    if (isSupabaseServiceRoleConfigured()) {
      const { data: profile } = await createAdminClient()
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      profileRole = profile?.role;
    }

    userRole = resolveUserRole(profileRole, user.user_metadata);
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
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "profile_incomplete");
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

  if (requestedPath.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", requestedPath);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = userRole ? `/dashboard/${userRole}` : "/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && requestedPath === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = userRole ? `/dashboard/${userRole}` : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
