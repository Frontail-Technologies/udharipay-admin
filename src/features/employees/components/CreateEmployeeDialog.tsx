"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { UserStatus, type UserStatus as UserStatusType } from "@/api/generated/common";
import type { CreateEmployeeBody } from "@/api/generated/contracts/employees";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useCreateEmployee } from "@/features/employees/hooks/useEmployees";
import { humanizeSnakeCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";

type CreateEmployeeValues = {
  name: string;
  email: string;
  phone: string;
  initialPassword: string;
  status: UserStatusType;
  branch: string;
};

const defaultValues: CreateEmployeeValues = {
  name: "",
  email: "",
  phone: "",
  initialPassword: "",
  status: "active",
  branch: "",
};

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateEmployee();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreateEmployeeValues>({ defaultValues });

  const setDialogOpen = (next: boolean) => {
    if (mutation.isPending) return;
    setOpen(next);
    if (!next) reset(defaultValues);
  };

  const submit = async (values: CreateEmployeeValues) => {
    if (!values.email.trim() && !values.phone.trim()) {
      setError("email", { type: "validate", message: "Enter an email or mobile number" });
      return;
    }
    const body: CreateEmployeeBody = {
      name: values.name.trim(),
      initialPassword: values.initialPassword,
      status: values.status,
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
      ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      ...(values.branch.trim() ? { branch: values.branch.trim() } : {}),
    };
    try {
      await mutation.mutateAsync(body);
      reset(defaultValues);
      setOpen(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5 text-[13px]">
          <Plus className="size-3.5" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Create an employee account and operational profile.</DialogDescription>
        </DialogHeader>
        <form id="create-employee-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
          <FormField label="Name" htmlFor="employee-name" error={errors.name?.message}>
            <Input id="employee-name" autoFocus {...register("name", { required: "Name is required" })} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Email" htmlFor="employee-email" error={errors.email?.message}>
              <Input id="employee-email" type="email" {...register("email")} />
            </FormField>
            <FormField label="Mobile" htmlFor="employee-phone" error={errors.phone?.message}>
              <Input id="employee-phone" type="tel" {...register("phone")} />
            </FormField>
          </div>
          <FormField label="Initial Password" htmlFor="employee-password" error={errors.initialPassword?.message}>
            <Input id="employee-password" type="password" autoComplete="new-password" {...register("initialPassword", { required: "Initial password is required" })} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Branch" htmlFor="employee-branch" error={errors.branch?.message}>
              <Input id="employee-branch" {...register("branch")} />
            </FormField>
            <FormField label="Status" htmlFor="employee-status" error={errors.status?.message}>
              <Controller control={control} name="status" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="employee-status" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.values(UserStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </FormField>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit" form="create-employee-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Create Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
