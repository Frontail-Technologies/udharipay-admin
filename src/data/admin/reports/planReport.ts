import type { DerivedPlan } from "../aggregates";
import type { PlanFrequency } from "../types";
import { countByKey } from "./reportHelpers";

/**
 * This report is about receivable schedules, not UdhariPay's lending
 * returns — deliberately no APR, no interest yield, no loan-book
 * terminology anywhere in this file.
 */
export type PlanMetrics = {
  activePlans: number;
  completedPlans: number;
  overduePlans: number;
  averagePlanSize: number;
  averageCollectionsPerPlan: number;
};

export function calculatePlanMetrics(plans: DerivedPlan[]): PlanMetrics {
  const activePlans = plans.filter((plan) => plan.status !== "completed").length;
  const completedPlans = plans.filter((plan) => plan.status === "completed").length;
  const overduePlans = plans.filter((plan) => plan.status === "overdue").length;
  const averagePlanSize =
    plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.originalAmount, 0) / plans.length) : 0;
  const averageCollectionsPerPlan =
    plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.collectedAmount, 0) / plans.length) : 0;

  return { activePlans, completedPlans, overduePlans, averagePlanSize, averageCollectionsPerPlan };
}

export function breakdownPlansByFrequency(plans: DerivedPlan[]): { key: PlanFrequency; count: number }[] {
  return countByKey(plans, (plan) => plan.frequency);
}

export function breakdownPlansByStatus(plans: DerivedPlan[]): { key: DerivedPlan["status"]; count: number }[] {
  return countByKey(plans, (plan) => plan.status);
}
