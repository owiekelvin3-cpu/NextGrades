import { describe, it, expect, vi, afterEach } from "vitest";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/redirect";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isAdminBootstrapAllowed, isProduction } from "@/lib/security/env";

describe("auth config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires email verification in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("REQUIRE_EMAIL_VERIFICATION", "");
    expect(isEmailVerificationRequired()).toBe(true);
    vi.stubEnv("REQUIRE_EMAIL_VERIFICATION", "false");
    expect(isEmailVerificationRequired()).toBe(false);
  });
});

describe("redirect RBAC", () => {
  it("routes admins to portal only", () => {
    expect(getDashboardPathForRole("admin")).toBe("/portal/admin");
    expect(canRoleAccessPath("admin", "/portal/admin/users")).toBe(true);
    expect(canRoleAccessPath("student", "/portal/admin")).toBe(false);
    expect(canRoleAccessPath("admin", "/dashboard/admin")).toBe(false);
  });

  it("keeps student and teacher dashboards isolated", () => {
    expect(canRoleAccessPath("student", "/dashboard/student/courses")).toBe(true);
    expect(canRoleAccessPath("student", "/dashboard/teacher")).toBe(false);
    expect(canRoleAccessPath("teacher", "/dashboard/teacher/resources")).toBe(true);
  });
});

describe("rate limit", () => {
  it("blocks after limit exceeded", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60).allowed).toBe(true);
    const blocked = checkRateLimit(key, 2, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});

describe("production security env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disables admin bootstrap in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_ADMIN_BOOTSTRAP", "");
    expect(isAdminBootstrapAllowed()).toBe(false);
    vi.stubEnv("ALLOW_ADMIN_BOOTSTRAP", "true");
    expect(isAdminBootstrapAllowed()).toBe(true);
  });

  it("detects production runtime", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isProduction()).toBe(true);
    vi.stubEnv("NODE_ENV", "development");
    expect(isProduction()).toBe(false);
  });
});
