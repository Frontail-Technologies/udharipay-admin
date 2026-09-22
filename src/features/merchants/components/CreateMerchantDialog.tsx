"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { MerchantStatus, type CreateMerchantBody, type MerchantStatus as MerchantStatusType } from "@/api/generated/contracts/merchants";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useCreateMerchant } from "@/features/merchants/hooks/useMerchants";
import { BUSINESS_CATEGORIES } from "@/features/merchants/utils/options";
import { INDIAN_STATES } from "@/shared/utils/india";
import { humanizeSnakeCase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";

type CreateMerchantValues = Omit<CreateMerchantBody, "email"> & { email: string; status: MerchantStatusType };

const defaultValues: CreateMerchantValues = { businessName: "", ownerName: "", businessCategory: "", phone: "", email: "", address: "", city: "", state: "", pincode: "", status: "draft" };

export function CreateMerchantDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateMerchant();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreateMerchantValues>({ defaultValues });

  const setDialogOpen = (next: boolean) => {
    if (mutation.isPending) return;
    setOpen(next);
    if (!next) reset(defaultValues);
  };

  const submit = async (values: CreateMerchantValues) => {
    const body: CreateMerchantBody = { ...values, businessName: values.businessName.trim(), ownerName: values.ownerName.trim(), phone: values.phone.trim(), address: values.address.trim(), city: values.city.trim(), pincode: values.pincode.trim(), ...(values.email.trim() ? { email: values.email.trim() } : {}) };
    try {
      await mutation.mutateAsync(body);
      reset(defaultValues);
      setOpen(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}>
    <DialogTrigger asChild><Button size="sm" className="h-9 gap-1.5 text-[13px]"><Plus className="size-3.5" />Add Merchant</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Add Merchant</DialogTitle><DialogDescription>Create the merchant business profile. Login access is provisioned separately.</DialogDescription></DialogHeader>
      <form id="create-merchant-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Business Name" htmlFor="merchant-business-name" error={errors.businessName?.message}><Input id="merchant-business-name" autoFocus {...register("businessName", { required: "Business name is required" })} /></FormField>
          <FormField label="Owner Name" htmlFor="merchant-owner-name" error={errors.ownerName?.message}><Input id="merchant-owner-name" {...register("ownerName", { required: "Owner name is required" })} /></FormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Business Category" htmlFor="merchant-category" error={errors.businessCategory?.message}><Controller control={control} name="businessCategory" rules={{ required: "Category is required" }} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="merchant-category" className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{BUSINESS_CATEGORIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>} /></FormField>
          <FormField label="Status" htmlFor="merchant-status" error={errors.status?.message}><Controller control={control} name="status" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="merchant-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.values(MerchantStatus).map((value) => <SelectItem key={value} value={value}>{humanizeSnakeCase(value)}</SelectItem>)}</SelectContent></Select>} /></FormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Mobile" htmlFor="merchant-phone" error={errors.phone?.message}><Input id="merchant-phone" type="tel" {...register("phone", { required: "Mobile number is required" })} /></FormField>
          <FormField label="Email" htmlFor="merchant-email" error={errors.email?.message}><Input id="merchant-email" type="email" {...register("email")} /></FormField>
        </div>
        <FormField label="Address" htmlFor="merchant-address" error={errors.address?.message}><Input id="merchant-address" {...register("address", { required: "Address is required" })} /></FormField>
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField label="City" htmlFor="merchant-city" error={errors.city?.message}><Input id="merchant-city" {...register("city", { required: "City is required" })} /></FormField>
          <FormField label="State" htmlFor="merchant-state" error={errors.state?.message}><Controller control={control} name="state" rules={{ required: "State is required" }} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="merchant-state" className="w-full"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{INDIAN_STATES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>} /></FormField>
          <FormField label="Pincode" htmlFor="merchant-pincode" error={errors.pincode?.message}><Input id="merchant-pincode" inputMode="numeric" {...register("pincode", { required: "Pincode is required" })} /></FormField>
        </div>
      </form>
      <DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="create-merchant-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Merchant</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
