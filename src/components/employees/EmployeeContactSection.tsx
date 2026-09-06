"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DerivedEmployee } from "@/data/admin";
import { INDIAN_STATES } from "@/data/admin/indianStates";
import { employeeContactEditSchema, type EmployeeContactEditValues } from "@/lib/adminEditSchemas";
import { patchEmployee } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

const FORM_ID = "employee-contact-form";

const FIELD_LABELS: Partial<Record<keyof EmployeeContactEditValues, string>> = {
  phone: "Phone",
  email: "Email",
  city: "City",
  state: "State",
  assignedArea: "Assigned Area",
};

function currentValues(employee: DerivedEmployee): EmployeeContactEditValues {
  return {
    phone: employee.phone,
    email: employee.email,
    city: employee.city,
    state: employee.state,
    assignedArea: employee.assignedArea,
  };
}

/** `employee` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function EmployeeContactSection({ employee: effective }: { employee: DerivedEmployee }) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<EmployeeContactEditValues>({
    resolver: zodResolver(employeeContactEditSchema),
    defaultValues: currentValues(effective),
  });

  useEffect(() => {
    if (editing) setFocus("phone");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(effective));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: EmployeeContactEditValues) => {
    patchEmployee(effective.id, values);
    recordAuditEvent({
      action: "Updated Employee",
      entityType: "employee",
      entityId: effective.id,
      entityLabel: effective.name,
      changes: diffFlatFields(currentValues(effective), values, FIELD_LABELS),
    });
    toast.success("Employee details updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Contact & Operational Assignment"
      editAriaLabel="Edit Contact & Assignment"
      editing={editing}
      onEdit={startEdit}
      onCancel={cancelEdit}
      formId={FORM_ID}
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" className="h-9" {...register("phone")} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" className="h-9" {...register("email")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" htmlFor="city" error={errors.city?.message}>
              <Input id="city" className="h-9" {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state?.message}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="state" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <FormField label="Assigned Area" htmlFor="assignedArea" error={errors.assignedArea?.message}>
            <Input id="assignedArea" className="h-9" {...register("assignedArea")} />
          </FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Phone" value={effective.phone} />
          <KeyValueRow label="Email" value={effective.email} />
          <KeyValueRow label="City / State" value={`${effective.city}, ${effective.state}`} />
          <KeyValueRow label="Assigned Area" value={effective.assignedArea} />
        </>
      )}
    </EditableDetailSection>
  );
}
