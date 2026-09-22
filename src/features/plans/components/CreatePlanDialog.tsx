"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { PlanFrequency, type CreatePlanBody, type PlanFrequency as PlanFrequencyType } from "@/api/generated/contracts/plans";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useCreatePlan } from "@/features/plans/hooks/usePlans";
import { planFrequencyLabels } from "@/features/plans/utils/metadata";
import { rupeesToPaise } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";

type CreatePlanValues = { description: string; invoiceNumber: string; originalAmountPaise: string; numberOfCollections: string; frequency: PlanFrequencyType; startDate: string };
const defaultValues: CreatePlanValues = { description: "", invoiceNumber: "", originalAmountPaise: "", numberOfCollections: "", frequency: "monthly", startDate: "" };

export function CreatePlanDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useCreatePlan();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreatePlanValues>({ defaultValues });
  const setDialogOpen = (next: boolean) => { if (mutation.isPending) return; setOpen(next); if (!next) reset(defaultValues); };
  const submit = async (values: CreatePlanValues) => {
    const originalAmountPaise = rupeesToPaise(values.originalAmountPaise);
    const numberOfCollections = Number(values.numberOfCollections);
    if (!originalAmountPaise || BigInt(originalAmountPaise) < BigInt(1)) { setError("originalAmountPaise", { message: "Enter a valid amount with up to two decimal places" }); return; }
    if (!Number.isInteger(numberOfCollections) || numberOfCollections < 1 || numberOfCollections > 366) { setError("numberOfCollections", { message: "Collections must be between 1 and 366" }); return; }
    if (BigInt(originalAmountPaise) < BigInt(numberOfCollections)) { setError("numberOfCollections", { message: "Amount must support at least one paise per collection" }); return; }
    const input: CreatePlanBody = { description: values.description.trim(), originalAmountPaise, numberOfCollections, frequency: values.frequency, startDate: values.startDate, ...(values.invoiceNumber.trim() ? { invoiceNumber: values.invoiceNumber.trim() } : {}) };
    try { await mutation.mutateAsync({ customerId, input }); reset(defaultValues); setOpen(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button size="sm" className="h-9 gap-1.5 text-[13px]"><Plus className="size-3.5" />Create Plan</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Create Udhaar Plan</DialogTitle><DialogDescription>Create the contractual plan. The backend will generate its installment schedule.</DialogDescription></DialogHeader><form id="create-plan-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
    <FormField label="Description" htmlFor="plan-description" error={errors.description?.message}><Input id="plan-description" autoFocus {...register("description", { required: "Description is required" })} /></FormField>
    <FormField label="Invoice Number" htmlFor="plan-invoice" error={errors.invoiceNumber?.message}><Input id="plan-invoice" {...register("invoiceNumber")} /></FormField>
    <div className="grid gap-3 sm:grid-cols-2"><FormField label="Original Amount (₹)" htmlFor="plan-amount" error={errors.originalAmountPaise?.message}><Input id="plan-amount" inputMode="decimal" placeholder="10000.00" {...register("originalAmountPaise", { required: "Amount is required" })} /></FormField><FormField label="Number of Collections" htmlFor="plan-collections" error={errors.numberOfCollections?.message}><Input id="plan-collections" type="number" min={1} max={366} {...register("numberOfCollections", { required: "Number of collections is required" })} /></FormField></div>
    <div className="grid gap-3 sm:grid-cols-2"><FormField label="Frequency" htmlFor="plan-frequency" error={errors.frequency?.message}><Controller control={control} name="frequency" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="plan-frequency" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.values(PlanFrequency).map((frequency) => <SelectItem key={frequency} value={frequency}>{planFrequencyLabels[frequency]}</SelectItem>)}</SelectContent></Select>} /></FormField><FormField label="Start Date" htmlFor="plan-start-date" error={errors.startDate?.message}><Input id="plan-start-date" type="date" {...register("startDate", { required: "Start date is required" })} /></FormField></div>
  </form><DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="create-plan-form" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Plan</Button></DialogFooter></DialogContent></Dialog>;
}
