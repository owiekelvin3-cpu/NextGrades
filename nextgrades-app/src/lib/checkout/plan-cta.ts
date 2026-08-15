export const PROGRAM_PLAN_IDS = ["premium", "group", "matura", "library"] as const;

export type ProgramPlanId = (typeof PROGRAM_PLAN_IDS)[number];

export function planActionI18nKey(planId: string): string {
  return `pricingPage.planActions.${planId}`;
}
