"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { CustomerStatus, type CreateCustomerBody, type CustomerStatus as CustomerStatusType } from "@/api/generated/contracts/customers";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useCreateCustomer } from "@/features/customers/hooks/useCustomers";
import { INDIAN_STATES } from "@/shared/utils/india";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";
import { humanizeSnakeCase } from "@/lib/format";

type CreateValues = Omit<CreateCustomerBody, "alternatePhone" | "status"> & { alternatePhone: string; status: CustomerStatusType };
const defaultValues: CreateValues = { name: "", phone: "", alternatePhone: "", address: "", city: "", state: "", pincode: "", status: "active" };

export function CreateCustomerDialog({ merchantId }: { merchantId: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useCreateCustomer();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreateValues>({ defaultValues });
  const setDialogOpen = (next: boolean) => { if (mutation.isPending) return; setOpen(next); if (!next) reset(defaultValues); };
  const submit = async (values: CreateValues) => {
    const input: CreateCustomerBody = { name: values.name.trim(), phone: values.phone.trim(), address: values.address.trim(), city: values.city.trim(), state: values.state, pincode: values.pincode.trim(), status: values.status, ...(values.alternatePhone.trim() ? { alternatePhone: values.alternatePhone.trim() } : {}) };
    try { await mutation.mutateAsync({ merchantId, input }); reset(defaultValues); setOpen(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button size="sm" className="h-9 gap-1.5 text-[13px]"><Plus className="size-3.5" />Add Customer</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Add Customer</DialogTitle><DialogDescription>Create a customer under the selected merchant.</DialogDescription></DialogHeader><form id="create-customer-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
    <FormField label="Name" htmlFor="customer-name" error={errors.name?.message}><Input id="customer-name" autoFocus {...register("name", { required: "Name is required" })} /></FormField>
    <div className="grid gap-3 sm:grid-cols-2"><FormField label="Mobile" htmlFor="customer-phone" error={errors.phone?.message}><Input id="customer-phone" type="tel" {...register("phone", { required: "Mobile number is required" })} /></FormField><FormField label="Alternate Mobile" htmlFor="customer-alternate-phone" error={errors.alternatePhone?.message}><Input id="customer-alternate-phone" type="tel" {...register("alternatePhone")} /></FormField></div>
    <FormField label="Address" htmlFor="customer-address" error={errors.address?.message}><Input id="customer-address" {...register("address", { required: "Address is required" })} /></FormField>
    <div className="grid gap-3 sm:grid-cols-3"><FormField label="City" htmlFor="customer-city" error={errors.city?.message}><Input id="customer-city" {...register("city", { required: "City is required" })} /></FormField><FormField label="State" htmlFor="customer-state" error={errors.state?.message}><Controller control={control} name="state" rules={{ required: "State is required" }} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="customer-state" className="w-full"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{INDIAN_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>} /></FormField><FormField label="Pincode" htmlFor="customer-pincode" error={errors.pincode?.message}><Input id="customer-pincode" inputMode="numeric" {...register("pincode", { required: "Pincode is required" })} /></FormField></div>
    <FormField label="Status" htmlFor="customer-status" error={errors.status?.message}><Controller control={control} name="status" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="customer-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.values(CustomerStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent></Select>} /></FormField>
  </form><DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="create-customer-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Customer</Button></DialogFooter></DialogContent></Dialog>;
}
