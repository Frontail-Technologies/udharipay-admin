import { z } from "zod";

export const collectionsSettingsEditSchema = z.object({
  atRiskOverdueDays: z
    .number({ message: "Enter the At Risk threshold" })
    .int()
    .min(1, "At least 1 day")
    .max(30, "Enter 30 or fewer days"),
  overdueFollowUpDays: z
    .number({ message: "Enter the follow-up offset" })
    .int()
    .min(0, "Cannot be negative")
    .max(30, "Enter 30 or fewer days"),
});
export type CollectionsSettingsEditValues = z.infer<typeof collectionsSettingsEditSchema>;

export const planSettingsEditSchema = z
  .object({
    allowedDaily: z.boolean(),
    allowedWeekly: z.boolean(),
    allowedMonthly: z.boolean(),
    defaultFrequency: z.enum(["daily", "weekly", "monthly"]),
  })
  .refine((values) => values.allowedDaily || values.allowedWeekly || values.allowedMonthly, {
    message: "At least one frequency must be allowed",
    path: ["allowedDaily"],
  })
  .refine(
    (values) => {
      if (values.defaultFrequency === "daily") return values.allowedDaily;
      if (values.defaultFrequency === "weekly") return values.allowedWeekly;
      return values.allowedMonthly;
    },
    { message: "Default frequency must be one of the allowed frequencies", path: ["defaultFrequency"] },
  );
export type PlanSettingsEditValues = z.infer<typeof planSettingsEditSchema>;
