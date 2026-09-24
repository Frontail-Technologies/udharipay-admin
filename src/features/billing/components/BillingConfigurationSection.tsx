"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { BillingPlan } from "@/api/generated/contracts/billing";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { normalizeApiError } from "@/api/http/errors";
import { useBillingPlans, useBillingSettings, useUpdateBillingPlan, useUpdateBillingSettings } from "@/features/billing/hooks/useBilling";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPaiseInr, rupeesToPaise } from "@/lib/format";

export function BillingConfigurationSection() {
  return <div className="flex flex-col gap-4">
    <ActivationFeeSection />
    <BillingPlansSection />
  </div>;
}

type FeeValues = { activationFeeRupees: string; customerActivationFeeRupees: string };

function ActivationFeeSection() {
  const query = useBillingSettings();
  const mutation = useUpdateBillingSettings();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FeeValues>({ defaultValues: { activationFeeRupees: "", customerActivationFeeRupees: "" } });

  if (query.isPending) return <Skeleton className="h-24 w-full max-w-xl" />;
  if (query.isError) return <div className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const settings = query.data.data;
  const startEdit = () => { reset({ activationFeeRupees: rupeesFromPaise(settings.activationFeePaise), customerActivationFeeRupees: rupeesFromPaise(settings.customerActivationFeePaise) }); setEditing(true); };
  const submit = async (values: FeeValues) => {
    const activationFeePaise = rupeesToPaise(values.activationFeeRupees);
    if (!activationFeePaise) { setError("activationFeeRupees", { message: "Enter a valid amount with up to two decimal places" }); return; }
    const customerActivationFeePaise = rupeesToPaise(values.customerActivationFeeRupees);
    if (!customerActivationFeePaise) { setError("customerActivationFeeRupees", { message: "Enter a valid amount with up to two decimal places (0 disables the fee)" }); return; }
    try { await mutation.mutateAsync({ activationFeePaise, customerActivationFeePaise }); setEditing(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <EditableDetailSection title="Activation Fees" editAriaLabel="Edit Activation Fee" editing={editing} isSaving={mutation.isPending} onEdit={startEdit} onCancel={() => setEditing(false)} formId="activation-fee-form" className="max-w-xl">
    {editing ? <form id="activation-fee-form" onSubmit={handleSubmit(submit)} className="flex flex-col gap-2">
      <FormField label="Activation Fee (₹)" htmlFor="activation-fee-input" error={errors.activationFeeRupees?.message}><Input id="activation-fee-input" inputMode="decimal" placeholder="499.00" {...register("activationFeeRupees", { required: "Activation fee is required" })} /></FormField>
      <FormField label="Customer Activation Fee (₹)" htmlFor="customer-activation-fee-input" error={errors.customerActivationFeeRupees?.message}><Input id="customer-activation-fee-input" inputMode="decimal" placeholder="0" {...register("customerActivationFeeRupees", { required: "Customer activation fee is required" })} /></FormField>
    </form> : <><KeyValueRow label="Merchant Activation Fee" value={formatPaiseInr(settings.activationFeePaise)} /><KeyValueRow label="Customer Activation Fee" value={BigInt(settings.customerActivationFeePaise) === BigInt(0) ? "Not charged" : formatPaiseInr(settings.customerActivationFeePaise)} /></>}
  </EditableDetailSection>;
}

function BillingPlansSection() {
  const query = useBillingPlans();
  if (query.isPending) return <Skeleton className="h-52 w-full max-w-xl" />;
  if (query.isError) return <div className="max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const plans = query.data.data.items;
  return <div className="flex max-w-xl flex-col gap-3">
    <h3 className="text-[13.5px] font-semibold text-text-primary">Subscription Plans</h3>
    {plans.map((plan) => <BillingPlanCard key={plan.code} plan={plan} />)}
  </div>;
}

function BillingPlanCard({ plan }: { plan: BillingPlan }) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateBillingPlan();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<{ name: string; monthlyAmountRupees: string; isActive: boolean }>({ defaultValues: { name: plan.name, monthlyAmountRupees: rupeesFromPaise(plan.monthlyAmountPaise), isActive: plan.isActive } });

  const startEdit = () => { reset({ name: plan.name, monthlyAmountRupees: rupeesFromPaise(plan.monthlyAmountPaise), isActive: plan.isActive }); setEditing(true); };
  const submit = async (values: { name: string; monthlyAmountRupees: string; isActive: boolean }) => {
    const monthlyAmountPaise = rupeesToPaise(values.monthlyAmountRupees);
    if (!monthlyAmountPaise || BigInt(monthlyAmountPaise) < BigInt(1)) { setError("monthlyAmountRupees", { message: "Enter a valid amount with up to two decimal places" }); return; }
    if (!values.name.trim()) { setError("name", { message: "Plan name is required" }); return; }
    try { await mutation.mutateAsync({ planCode: plan.code, input: { name: values.name.trim(), monthlyAmountPaise, isActive: values.isActive } }); setEditing(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <div className={`rounded-[11px] border p-4 transition-colors ${editing ? "border-primary/30" : "border-border"} bg-surface`}>
    {editing ? <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Plan Name" htmlFor={`plan-name-${plan.code}`} error={errors.name?.message}><Input id={`plan-name-${plan.code}`} {...register("name", { required: "Plan name is required" })} /></FormField>
        <FormField label="Monthly Price (₹)" htmlFor={`plan-price-${plan.code}`} error={errors.monthlyAmountRupees?.message}><Input id={`plan-price-${plan.code}`} inputMode="decimal" {...register("monthlyAmountRupees", { required: "Monthly price is required" })} /></FormField>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-text-secondary"><input type="checkbox" className="size-3.5 rounded border-border-strong accent-primary" {...register("isActive")} />Active — selectable for new subscriptions</label>
      <p className="text-[11.5px] text-text-muted">Changes apply to new subscriptions only. Existing subscriptions keep their current price.</p>
      <div className="flex justify-end gap-1.5"><Button type="button" variant="outline" size="sm" disabled={mutation.isPending} onClick={() => setEditing(false)} className="h-8 text-[12.5px]">Cancel</Button><Button type="submit" size="sm" disabled={mutation.isPending} className="h-8 text-[12.5px]">Save Changes</Button></div>
    </form> : <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2"><p className="text-[13.5px] font-semibold text-text-primary">{plan.name}</p><StatusBadge tone={plan.isActive ? "success" : "neutral"}>{plan.isActive ? "Active" : "Inactive"}</StatusBadge></div>
        <p className="mt-1 text-[11.5px] text-text-muted">Code: {plan.code}</p>
        <p className="mt-1 text-[15px] font-semibold text-text-primary">{formatPaiseInr(plan.monthlyAmountPaise)}<span className="text-[12px] font-normal text-text-muted">/mo</span></p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={startEdit} className="h-8 shrink-0 text-[12.5px] text-text-secondary">Edit</Button>
    </div>}
  </div>;
}

function rupeesFromPaise(amountPaise: string) {
  const paise = BigInt(amountPaise);
  const rupees = paise / BigInt(100);
  const remainder = paise % BigInt(100);
  return remainder === BigInt(0) ? rupees.toString() : `${rupees}.${remainder.toString().padStart(2, "0")}`;
}
