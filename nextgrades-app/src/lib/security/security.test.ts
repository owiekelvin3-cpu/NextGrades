import { describe, it, expect, vi, afterEach } from "vitest";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { canRoleAccessPath, getDashboardPathForRole } from "@/lib/auth/redirect";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isAdminBootstrapAllowed, isProduction, validateProductionEnv } from "@/lib/security/env";
import { resolveCheckoutStripePrice, isApprovedStripePriceId } from "@/lib/stripe/prices";
import { validateStrongPassword } from "@/lib/auth/password-policy";
import { hashOtpCode, verifyOtpHash } from "@/lib/auth/otp-crypto";
import { detectMeetingProvider, validateMeetingLink, lessonHasMeetingLink } from "@/lib/meetings/link";
import { resolveMediaKind } from "@/lib/resources/media-type";
import { isVideoResource } from "@/lib/resources/video";

describe("auth config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires email verification in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("REQUIRE_SIGNUP_EMAIL_VERIFICATION", "");
    vi.stubEnv("REQUIRE_EMAIL_VERIFICATION", "");
    expect(isEmailVerificationRequired()).toBe(true);
    vi.stubEnv("REQUIRE_SIGNUP_EMAIL_VERIFICATION", "false");
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

  it("requires AUTH_SESSION_SECRET in production validation", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.example.com");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("AUTH_SESSION_SECRET", "");
    const errors = validateProductionEnv().filter((i) => i.level === "error");
    expect(errors.some((e) => e.message.includes("AUTH_SESSION_SECRET"))).toBe(true);
  });
});

describe("stripe price resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never trusts a client price that differs from server mapping", () => {
    vi.stubEnv("STRIPE_PRICE_GROUP_MONTHLY", "price_server_monthly");
    const result = resolveCheckoutStripePrice({
      planId: "group",
      billing: "monthly",
      clientPriceId: "price_attacker_cheap",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("price_mismatch");
  });

  it("resolves price from plan and billing only", () => {
    vi.stubEnv("STRIPE_PRICE_GROUP_YEARLY", "price_group_yearly");
    const result = resolveCheckoutStripePrice({ planId: "group", billing: "yearly" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.priceId).toBe("price_group_yearly");
  });

  it("resolves premium price from STRIPE_PRICE_PREMIUM env", () => {
    vi.stubEnv("STRIPE_PRICE_PREMIUM_MONTHLY", "price_premium_monthly");
    const result = resolveCheckoutStripePrice({ planId: "premium", billing: "monthly" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.priceId).toBe("price_premium_monthly");
  });

  it("falls back to legacy STRIPE_PRICE_INDIVIDUAL env for premium", () => {
    vi.stubEnv("STRIPE_PRICE_PREMIUM_YEARLY", "");
    vi.stubEnv("STRIPE_PRICE_INDIVIDUAL_YEARLY", "price_individual_yearly");
    const result = resolveCheckoutStripePrice({ planId: "premium", billing: "yearly" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.priceId).toBe("price_individual_yearly");
  });

  it("rejects unknown client price ids", () => {
    vi.stubEnv("STRIPE_PRICE_GROUP_MONTHLY", "price_server");
    expect(isApprovedStripePriceId("price_unknown")).toBe(false);
  });
});

describe("password policy", () => {
  it("enforces 12+ character complexity", () => {
    expect(validateStrongPassword("short").valid).toBe(false);
    expect(validateStrongPassword("LongEnough1!").valid).toBe(true);
  });
});

describe("otp hashing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes and verifies registration codes", () => {
    vi.stubEnv("AUTH_SESSION_SECRET", "test-secret-with-enough-length-for-dev");
    const hash = hashOtpCode("123456", "user@example.com");
    expect(verifyOtpHash("123456", "user@example.com", hash)).toBe(true);
    expect(verifyOtpHash("000000", "user@example.com", hash)).toBe(false);
  });
});

describe("meeting link validation", () => {
  it("detects Zoom, Meet, and Teams providers", () => {
    expect(detectMeetingProvider("https://zoom.us/j/123")).toBe("zoom");
    expect(detectMeetingProvider("https://meet.google.com/abc-def")).toBe("google_meet");
    expect(detectMeetingProvider("https://teams.microsoft.com/l/meetup")).toBe("microsoft_teams");
  });

  it("accepts valid HTTPS links and rejects insecure URLs", () => {
    expect(validateMeetingLink("https://zoom.us/j/123456789").ok).toBe(true);
    expect(validateMeetingLink("http://zoom.us/j/123").ok).toBe(false);
    expect(validateMeetingLink("").ok).toBe(false);
  });

  it("detects lessons with pasted meeting links", () => {
    expect(lessonHasMeetingLink({ meeting_url: "https://zoom.us/j/1", zoom_link: null })).toBe(true);
    expect(lessonHasMeetingLink({ meeting_url: null, zoom_link: "https://zoom.us/j/1" })).toBe(true);
    expect(lessonHasMeetingLink({ meeting_url: null, zoom_link: null, zoom_meeting_id: "123" })).toBe(true);
    expect(lessonHasMeetingLink({ meeting_url: null, zoom_link: null })).toBe(false);
  });
});

describe("library media type detection", () => {
  it("detects video files by extension even when content type is learning_material", () => {
    expect(
      resolveMediaKind({
        content_type: "learning_material",
        type: "pdf",
        file_name: "lesson.mp4",
      })
    ).toBe("video");
    expect(isVideoResource({ content_type: "learning_material", file_name: "lesson.mp4" })).toBe(true);
  });

  it("detects PDFs and images from file names", () => {
    expect(resolveMediaKind({ file_name: "worksheet.pdf" })).toBe("pdf");
    expect(resolveMediaKind({ file_name: "diagram.png" })).toBe("image");
  });
});
