import { describe, it, expect } from "vitest";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/redirect";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isAdminBootstrapAllowed, isProduction } from "@/lib/security/env";

describe("auth config", () => {
  it("requires email verification in production by default", () => {
    const prev = process.env.NODE_ENV;
    const prevFlag = process.env.REQUIRE_EMAIL_VERIFICATION;
    process.env.NODE_ENV = "production";
    delete process.env.REQUIRE_EMAIL_VERIFICATION;
    expect(isEmailVerificationRequired()).toBe(true);
    process.env.REQUIRE_EMAIL_VERIFICATION = "false";
    expect(isEmailVerificationRequired()).toBe(false);
    process.env.NODE_ENV = prev;
    process.env.REQUIRE_EMAIL_VERIFICATION = prevFlag;
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
  it("disables admin bootstrap in production by default", () => {
    const prev = process.env.NODE_ENV;
    const prevAllow = process.env.ALLOW_ADMIN_BOOTSTRAP;
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_ADMIN_BOOTSTRAP;
    expect(isAdminBootstrapAllowed()).toBe(false);
    process.env.ALLOW_ADMIN_BOOTSTRAP = "true";
    expect(isAdminBootstrapAllowed()).toBe(true);
    process.env.NODE_ENV = prev;
    process.env.ALLOW_ADMIN_BOOTSTRAP = prevAllow;
  });

  it("detects production runtime", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(isProduction()).toBe(true);
    process.env.NODE_ENV = "development";
    expect(isProduction()).toBe(false);
    process.env.NODE_ENV = prev;
  });
});
