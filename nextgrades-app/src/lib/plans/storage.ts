export type PlanId = "resource" | "group" | "premium";

export interface UserPlanState {
  planId: PlanId;
  billing: "monthly" | "yearly";
  activatedAt: string;
}

const KEY = "nextgrades_user_plan";

export function saveUserPlan(userId: string, state: UserPlanState): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, UserPlanState>;
  all[userId] = state;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getUserPlan(userId: string): UserPlanState | null {
  if (typeof window === "undefined") return null;
  const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, UserPlanState>;
  return all[userId] ?? null;
}
