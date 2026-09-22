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

type EmployeeContactValues = { email: string; phone: string };
const FORM_ID = "employee-contact-form";

function currentValues(employee: Employee): EmployeeContactValues {
  return { email: employee.email ?? "", phone: employee.phone ?? "" };
}

export function EmployeeContactSection({ employee }: { employee: Employee }) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateEmployee();
  const { register, handleSubmit, reset, setError, setFocus, formState: { errors } } = useForm<EmployeeContactValues>({ defaultValues: currentValues(employee) });

  useEffect(() => {
    if (editing) setFocus(employee.email ? "email" : "phone");
  }, [editing, employee.email, setFocus]);

  const startEdit = () => {
    reset(currentValues(employee));
    setEditing(true);
  };

  const submit = async (values: EmployeeContactValues) => {
    const email = values.email.trim();
    const phone = values.phone.trim();
    if (employee.email && !email) {
      setError("email", { type: "validate", message: "Email cannot be removed" });
      return;
    }
    if (employee.phone && !phone) {
      setError("phone", { type: "validate", message: "Mobile number cannot be removed" });
      return;
    }
    const input: UpdateEmployeeBody = {
      ...(email && email !== employee.email ? { email } : {}),
      ...(phone && phone !== employee.phone ? { phone } : {}),
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
    <EditableDetailSection title="Contact Information" editAriaLabel="Edit Contact Information" editing={editing} isSaving={mutation.isPending} onEdit={startEdit} onCancel={() => setEditing(false)} formId={FORM_ID}>
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <FormField label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" className="h-9" {...register("email")} /></FormField>
          <FormField label="Mobile" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" className="h-9" {...register("phone")} /></FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Email" value={employee.email ?? "Not provided"} />
          <KeyValueRow label="Mobile" value={employee.phone ?? "Not provided"} />
        </>
      )}
    </EditableDetailSection>
  );
}
