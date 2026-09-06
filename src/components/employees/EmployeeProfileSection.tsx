"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import type { DerivedEmployee } from "@/data/admin";
import { formatDate } from "@/lib/format";
import { employeeBasicInfoEditSchema, type EmployeeBasicInfoEditValues } from "@/lib/adminEditSchemas";
import { patchEmployee } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

const FORM_ID = "employee-basic-info-form";

const FIELD_LABELS: Partial<Record<keyof EmployeeBasicInfoEditValues, string>> = {
  name: "Name",
  role: "Role",
};

function currentValues(employee: DerivedEmployee): EmployeeBasicInfoEditValues {
  return { name: employee.name, role: employee.role };
}

/** `employee` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function EmployeeProfileSection({ employee: effective }: { employee: DerivedEmployee }) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<EmployeeBasicInfoEditValues>({
    resolver: zodResolver(employeeBasicInfoEditSchema),
    defaultValues: currentValues(effective),
  });

  useEffect(() => {
    if (editing) setFocus("name");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(effective));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: EmployeeBasicInfoEditValues) => {
    patchEmployee(effective.id, values);
    recordAuditEvent({
      action: "Updated Employee",
      entityType: "employee",
      entityId: effective.id,
      entityLabel: values.name,
      changes: diffFlatFields(currentValues(effective), values, FIELD_LABELS),
    });
    toast.success("Employee details updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Basic Information"
      editAriaLabel="Edit Basic Information"
      editing={editing}
      onEdit={startEdit}
      onCancel={cancelEdit}
      formId={FORM_ID}
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" className="h-9" {...register("name")} />
          </FormField>
          <FormField label="Role" htmlFor="role" error={errors.role?.message}>
            <Input id="role" className="h-9" {...register("role")} />
          </FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Name" value={effective.name} />
          <KeyValueRow label="Employee ID" value={effective.id} />
          <KeyValueRow label="Role" value={effective.role} />
          <KeyValueRow label="Joined" value={formatDate(effective.joinedAt)} />
        </>
      )}
    </EditableDetailSection>
  );
}
