"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminSettings, updateSettingsSection } from "@/store/adminSettingsStore";
import { planSettingsEditSchema, type PlanSettingsEditValues } from "@/lib/adminSettingsSchemas";
import type { AdminPlanSettings, PlanCreationFrequency } from "@/data/admin/settings";
import { humanizeSnakeCase } from "@/lib/format";

const FORM_ID = "settings-plans-form";

const FREQUENCY_LABEL: Record<PlanCreationFrequency, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

function toFormValues(settings: AdminPlanSettings): PlanSettingsEditValues {
  return {
    allowedDaily: settings.allowedFrequencies.includes("daily"),
    allowedWeekly: settings.allowedFrequencies.includes("weekly"),
    allowedMonthly: settings.allowedFrequencies.includes("monthly"),
    defaultFrequency: settings.defaultFrequency,
  };
}

/**
 * PLAN CREATION DEFAULTS — not a system-wide mutable plan rule. No plan
 * creation UI exists yet, so nothing currently reads these at plan-build
 * time; they're scoped here as forward configuration for that future flow.
 * Changing them can never alter an existing Plan or its schedule — every
 * `DerivedPlan` is generated once at module load from static seed data,
 * completely independent of this store.
 */
export function PlanSettingsPanel() {
  const settings = useAdminSettings().plans;
  const [editing, setEditing] = useState(false);

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanSettingsEditValues>({
    resolver: zodResolver(planSettingsEditSchema),
    defaultValues: toFormValues(settings),
  });

  const startEdit = () => {
    reset(toFormValues(settings));
    setEditing(true);
  };

  const onSubmit = (values: PlanSettingsEditValues) => {
    const allowedFrequencies: AdminPlanSettings["allowedFrequencies"] = [
      ...(values.allowedDaily ? (["daily"] as const) : []),
      ...(values.allowedWeekly ? (["weekly"] as const) : []),
      ...(values.allowedMonthly ? (["monthly"] as const) : []),
    ];
    updateSettingsSection("plans", { allowedFrequencies, defaultFrequency: values.defaultFrequency });
    toast.success("Settings updated");
    setEditing(false);
  };

  const allowedDaily = watch("allowedDaily");
  const allowedWeekly = watch("allowedWeekly");
  const allowedMonthly = watch("allowedMonthly");

  return (
    <EditableDetailSection
      title="Plan Defaults"
      description="Plan creation defaults — applies to newly created plans only. Never mutates existing plans or schedules."
      editAriaLabel="Edit Plan Defaults"
      editing={editing}
      onEdit={startEdit}
      onCancel={() => setEditing(false)}
      formId={FORM_ID}
      className="max-w-xl"
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Allowed Frequencies" htmlFor="allowedDaily" error={errors.allowedDaily?.message}>
            <div className="flex flex-col gap-2">
              {(["daily", "weekly", "monthly"] as PlanCreationFrequency[]).map((frequency) => (
                <Controller
                  key={frequency}
                  control={control}
                  name={frequency === "daily" ? "allowedDaily" : frequency === "weekly" ? "allowedWeekly" : "allowedMonthly"}
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-text-secondary">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        className="size-3.5 rounded border-border-strong accent-primary"
                      />
                      {FREQUENCY_LABEL[frequency]}
                    </label>
                  )}
                />
              ))}
            </div>
          </FormField>
          <FormField label="Default Frequency" htmlFor="defaultFrequency" error={errors.defaultFrequency?.message}>
            <Controller
              control={control}
              name="defaultFrequency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="defaultFrequency" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedDaily && <SelectItem value="daily">Daily</SelectItem>}
                    {allowedWeekly && <SelectItem value="weekly">Weekly</SelectItem>}
                    {allowedMonthly && <SelectItem value="monthly">Monthly</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </form>
      ) : (
        <>
          <KeyValueRow
            label="Allowed Frequencies"
            value={settings.allowedFrequencies.map((frequency) => humanizeSnakeCase(frequency)).join(", ")}
          />
          <KeyValueRow label="Default Frequency" value={humanizeSnakeCase(settings.defaultFrequency)} />
        </>
      )}
    </EditableDetailSection>
  );
}
