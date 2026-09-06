"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import { useAdminSettings, updateSettingsSection } from "@/store/adminSettingsStore";
import {
  collectionsSettingsEditSchema,
  type CollectionsSettingsEditValues,
} from "@/lib/adminSettingsSchemas";

const FORM_ID = "settings-collections-form";

/**
 * Only two fields, both with genuine effect on demo logic:
 *   - atRiskOverdueDays drives isInstallmentAtRisk() across Collections
 *     and Reports (see atRiskRules.ts).
 *   - overdueFollowUpDays drives the suggested "Next Follow-up Date"
 *     default in the Add Follow-up dialog (today + N days).
 * A "Reminder Before Due" field was considered and deliberately removed —
 * nothing in this demo has a due-reminder surface to wire it into, and a
 * policy label with no real effect isn't worth keeping (prefer fewer real
 * settings over more decorative ones).
 */
export function CollectionsSettingsPanel() {
  const settings = useAdminSettings().collections;
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectionsSettingsEditValues>({
    resolver: zodResolver(collectionsSettingsEditSchema),
    defaultValues: settings,
  });

  const startEdit = () => {
    reset(settings);
    setEditing(true);
  };

  const onSubmit = (values: CollectionsSettingsEditValues) => {
    updateSettingsSection("collections", values);
    toast.success("Settings updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Collections"
      description="Both fields have real effect on Collections/Reports and on the Add Follow-up dialog."
      editAriaLabel="Edit Collection Settings"
      editing={editing}
      onEdit={startEdit}
      onCancel={() => setEditing(false)}
      formId={FORM_ID}
      className="max-w-xl"
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <FormField label="At Risk After (overdue days)" htmlFor="atRiskOverdueDays" error={errors.atRiskOverdueDays?.message}>
              <Input
                id="atRiskOverdueDays"
                type="number"
                min={1}
                max={30}
                className="h-9 max-w-32"
                {...register("atRiskOverdueDays", { valueAsNumber: true })}
              />
            </FormField>
            <p className="text-[11px] text-primary">Drives the At Risk calculation in Collections and Reports.</p>
          </div>

          <div className="flex flex-col gap-1">
            <FormField
              label="Overdue Follow-up (days after due)"
              htmlFor="overdueFollowUpDays"
              error={errors.overdueFollowUpDays?.message}
            >
              <Input
                id="overdueFollowUpDays"
                type="number"
                min={0}
                max={30}
                className="h-9 max-w-32"
                {...register("overdueFollowUpDays", { valueAsNumber: true })}
              />
            </FormField>
            <p className="text-[11px] text-primary">
              Sets the suggested Next Follow-up Date default when logging a follow-up.
            </p>
          </div>
        </form>
      ) : (
        <>
          <KeyValueRow label="At Risk After" value={`${settings.atRiskOverdueDays} overdue days`} />
          <KeyValueRow label="Overdue Follow-up" value={`${settings.overdueFollowUpDays} days after due`} />
        </>
      )}
    </EditableDetailSection>
  );
}
