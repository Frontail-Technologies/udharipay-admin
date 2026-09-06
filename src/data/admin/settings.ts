/**
 * Settings is deliberately small — only two sections, each with genuine
 * operational effect on demo logic. Everything that was previously here
 * as fixed product/application configuration (platform name, support
 * contact, currency, timezone) or as a decorative/never-consumed field
 * (mandate/subscription/notification/security "settings") has been
 * removed rather than left as dead architecture. See the Settings
 * Simplification pass for the reasoning.
 */

export type AdminCollectionsSettings = {
  /**
   * The ONLY threshold-style field — flows through `isInstallmentAtRisk()`
   * into Collections and Reports. Not decorative.
   */
  atRiskOverdueDays: number;
  /**
   * Drives the suggested "Next Follow-up Date" default in the Add
   * Follow-up dialog (today + N days) — a real, visible effect, not a
   * policy label with nothing behind it.
   */
  overdueFollowUpDays: number;
};

/**
 * Distinct from the canonical `PlanFrequency` the real Plan/Installment
 * schedule engine (planSchedule.ts) supports today (weekly/monthly only).
 * This is intentionally a separate, slightly broader type: these are
 * PLAN CREATION DEFAULTS for a plan-creation flow that doesn't exist as a
 * UI yet, not a system-wide rule the current engine enforces. Offering
 * "Daily" here does not imply the schedule engine can generate a daily
 * plan today.
 */
export type PlanCreationFrequency = "daily" | "weekly" | "monthly";

export type AdminPlanSettings = {
  defaultFrequency: PlanCreationFrequency;
  allowedFrequencies: PlanCreationFrequency[];
};

export type AdminPlatformSettings = {
  collections: AdminCollectionsSettings;
  plans: AdminPlanSettings;
};

export const DEFAULT_AT_RISK_OVERDUE_DAYS = 3;
export const DEFAULT_OVERDUE_FOLLOWUP_DAYS = 2;

export const DEFAULT_ADMIN_SETTINGS: AdminPlatformSettings = {
  collections: {
    atRiskOverdueDays: DEFAULT_AT_RISK_OVERDUE_DAYS,
    overdueFollowUpDays: DEFAULT_OVERDUE_FOLLOWUP_DAYS,
  },
  plans: {
    defaultFrequency: "weekly",
    allowedFrequencies: ["daily", "weekly", "monthly"],
  },
};

