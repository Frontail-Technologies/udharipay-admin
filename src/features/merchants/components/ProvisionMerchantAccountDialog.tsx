"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { ProvisionMerchantAccountBody } from "@/api/generated/contracts/merchants";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useProvisionMerchantAccount } from "@/features/merchants/hooks/useMerchants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/entity/FormField";

type ProvisionValues = { email: string; phone: string; initialPassword: string };
const defaultValues: ProvisionValues = { email: "", phone: "", initialPassword: "" };

export function ProvisionMerchantAccountDialog({ merchantId }: { merchantId: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useProvisionMerchantAccount();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<ProvisionValues>({ defaultValues });

  const setDialogOpen = (next: boolean) => {
    if (mutation.isPending) return;
    setOpen(next);
    if (!next) reset(defaultValues);
  };

  const submit = async (values: ProvisionValues) => {
    if (!values.email.trim() && !values.phone.trim()) {
      setError("email", { type: "validate", message: "Enter an email or mobile number" });
      return;
    }
    const input: ProvisionMerchantAccountBody = { initialPassword: values.initialPassword, ...(values.email.trim() ? { email: values.email.trim() } : {}), ...(values.phone.trim() ? { phone: values.phone.trim() } : {}) };
    try {
      await mutation.mutateAsync({ merchantId, input });
      reset(defaultValues);
      setOpen(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}>
    <DialogTrigger asChild><Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-[12.5px]"><UserPlus className="size-3.5" />Provision Account</Button></DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Provision Merchant Account</DialogTitle><DialogDescription>Create login access for this merchant. Account status remains separate from business status.</DialogDescription></DialogHeader>
      <form id="provision-merchant-account-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
        <FormField label="Email" htmlFor="account-email" error={errors.email?.message}><Input id="account-email" type="email" autoFocus {...register("email")} /></FormField>
        <FormField label="Mobile" htmlFor="account-phone" error={errors.phone?.message}><Input id="account-phone" type="tel" {...register("phone")} /></FormField>
        <FormField label="Initial Password" htmlFor="account-password" error={errors.initialPassword?.message}><Input id="account-password" type="password" autoComplete="new-password" {...register("initialPassword", { required: "Initial password is required" })} /></FormField>
      </form>
      <DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="provision-merchant-account-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Provision Account</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
