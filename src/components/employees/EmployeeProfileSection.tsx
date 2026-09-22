"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Employee, UpdateEmployeeBody } from "@/api/generated/contracts/employees";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useUpdateEmployee } from "@/features/employees/useEmployees";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

type EmployeeProfileValues = { name: string; branch: string };
const FORM_ID = "employee-basic-info-form";

function currentValues(employee: Employee): EmployeeProfileValues {
  return { name: employee.name, branch: employee.branch ?? "" };
}

export function EmployeeProfileSection({ employee }: { employee: Employee }) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateEmployee();
  const { register, handleSubmit, reset, setError, setFocus, formState: { errors } } = useForm<EmployeeProfileValues>({ defaultValues: currentValues(employee) });

  useEffect(() => {
    if (editing) setFocus("name");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(employee));
    setEditing(true);
  };

  const submit = async (values: EmployeeProfileValues) => {
    const input: UpdateEmployeeBody = {
      ...(values.name.trim() !== employee.name ? { name: values.name.trim() } : {}),
      ...(values.branch.trim() !== (employee.branch ?? "") ? { branch: values.branch.trim() || null } : {}),
    };
    if (!Object.keys(input).length) {
      setEditing(false);
      return;
    }
    try {
      await mutation.mutateAsync({ employeeId: employee.id, input });
      setEditing(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return (
    <EditableDetailSection title="Basic Information" editAriaLabel="Edit Basic Information" editing={editing} isSaving={mutation.isPending} onEdit={startEdit} onCancel={() => setEditing(false)} formId={FORM_ID}>
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}><Input id="name" className="h-9" {...register("name", { required: "Name is required" })} /></FormField>
          <FormField label="Branch" htmlFor="branch" error={errors.branch?.message}><Input id="branch" className="h-9" {...register("branch")} /></FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Name" value={employee.name} />
          <KeyValueRow label="Employee ID" value={employee.publicId} />
          <KeyValueRow label="Branch" value={employee.branch ?? "Not assigned"} />
          <KeyValueRow label="Joined" value={formatDate(employee.createdAt)} />
        </>
      )}
    </EditableDetailSection>
  );
}
