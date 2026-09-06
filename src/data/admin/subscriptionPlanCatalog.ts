/**
 * Centralized SaaS plan catalog (Part O) — previously embedded directly
 * inside subscriptions.ts. Moved here so Settings can read/display it as
 * configuration without duplicating the numbers.
 *
 * IMPORTANT: `subscriptions.ts` reads this catalog exactly once, at module
 * load, to generate the static `subscriptions` array. Nothing re-reads this
 * catalog at runtime, so a future Settings-driven change to
 * `defaultMonthlyPlanCode` (which plan NEW subscriptions default to) can
 * never retroactively mutate an existing MerchantSubscription's planCode/
 * planName/monthlyAmount — those stay exactly what they were generated
 * with. This file itself is not user-editable in this phase (read-only
 * reference table in Settings); only the *default selection* is.
 */
export type SubscriptionPlanCatalogEntry = {
  code: string;
  name: string;
  monthlyAmount: number;
};

export const SUBSCRIPTION_PLAN_CATALOG: SubscriptionPlanCatalogEntry[] = [
  { code: "starter_monthly", name: "Starter Monthly", monthlyAmount: 999 },
  { code: "growth_monthly", name: "Growth Monthly", monthlyAmount: 1999 },
  { code: "growth_annual", name: "Growth Annual", monthlyAmount: 1666 },
  { code: "pro_monthly", name: "Pro Monthly", monthlyAmount: 3499 },
];

export function getSubscriptionPlanCatalogEntryByName(planName: string): SubscriptionPlanCatalogEntry | undefined {
  return SUBSCRIPTION_PLAN_CATALOG.find((entry) => entry.name === planName);
}

export function getSubscriptionPlanCatalogEntryByCode(planCode: string): SubscriptionPlanCatalogEntry | undefined {
  return SUBSCRIPTION_PLAN_CATALOG.find((entry) => entry.code === planCode);
}

export const DEFAULT_ACTIVATION_FEE_AMOUNT = 999;
