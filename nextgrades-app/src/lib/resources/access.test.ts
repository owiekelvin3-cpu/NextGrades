import { describe, expect, it } from "vitest";
import {
  canAccessMaterial,
  isAssignedStudentMaterial,
  isMaterialGrantActive,
  type AccessContext,
  type MaterialAccessRow,
} from "./access";

const premiumPdf: MaterialAccessRow = {
  id: "mat-1",
  access_type: "premium",
  is_premium: true,
};

function ctx(partial: Partial<AccessContext>): AccessContext {
  return {
    userId: "student-1",
    role: "student",
    subscriptionStatus: null,
    subscriptionEndsAt: null,
    enrollments: [],
    grantedMaterialIds: [],
    ...partial,
  };
}

describe("material grants", () => {
  it("treats a grant without expiry as active", () => {
    expect(isMaterialGrantActive(null)).toBe(true);
    expect(isMaterialGrantActive(undefined)).toBe(true);
  });

  it("rejects expired grants", () => {
    expect(isMaterialGrantActive("2000-01-01T00:00:00.000Z")).toBe(false);
  });

  it("keeps unassigned catalog files out of the student portal", () => {
    expect(isAssignedStudentMaterial(premiumPdf, ctx({}))).toBe(false);
    expect(isAssignedStudentMaterial({ id: "free-1", is_premium: false }, ctx({}))).toBe(false);
    expect(isAssignedStudentMaterial(premiumPdf, ctx({ grantedMaterialIds: ["mat-1"] }))).toBe(true);
  });

  it("unlocks a premium resource of any type for a granted student", () => {
    expect(canAccessMaterial(premiumPdf, ctx({ grantedMaterialIds: ["mat-1"] }))).toBe(true);
    expect(
      canAccessMaterial(
        { ...premiumPdf, id: "vid-9" },
        ctx({ grantedMaterialIds: ["vid-9"] })
      )
    ).toBe(true);
  });

  it("does not unlock other premium resources", () => {
    expect(canAccessMaterial(premiumPdf, ctx({ grantedMaterialIds: ["other"] }))).toBe(false);
  });

  it("does not unlock every premium file just because a subscription is active", () => {
    expect(
      canAccessMaterial(
        premiumPdf,
        ctx({ subscriptionStatus: "active", subscriptionEndsAt: "2099-01-01T00:00:00.000Z" })
      )
    ).toBe(false);
  });

  it("unlocks a premium file that matches the student's enrollment", () => {
    const mathNotes: MaterialAccessRow = {
      id: "mat-math",
      access_type: "premium",
      is_premium: true,
      subject_id: "subj-1",
      class_id: "class-1",
      semester: 1,
    };
    expect(
      canAccessMaterial(
        mathNotes,
        ctx({
          enrollments: [
            { subject_id: "subj-1", class_id: "class-1", semester: 1, status: "active" },
          ],
        })
      )
    ).toBe(true);
  });
});
