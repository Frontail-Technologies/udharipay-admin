"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { CreateMerchantSubscriptionBody } from "@/api/generated/contracts/billing";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useBillingPlans, useCreateMerchantSubscription } from "@/features/billing/hooks/useBilling";
import { normalizeApiError } from "@/api/http/errors";
import { formatPaiseInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";

type CreateSubscriptionValues = { planCode: string; startsOn: string };
const defaultValues: CreateSubscriptionValues = { planCode: "", startsOn: "" };

export function CreateSubscriptionDialog({ merchantId }: { merchantId: string }) {
  const [open, setOpen] = useState(false);
  const plansQuery = useBillingPlans();
  const mutation = useCreateMerchantSubscription();
  const { control, register, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm<CreateSubscriptionValues>({ defaultValues });
  const activePlans = (plansQuery.data?.data.items ?? []).filter((plan) => plan.isActive);

  useEffect(() => {
    if (open && activePlans.length > 0) setValue("planCode", activePlans[0].code);
  }, [open, activePlans, setValue]);

  const setDialogOpen = (next: boolean) => { if (mutation.isPending) return; setOpen(next); if (!next) reset(defaultValues); };
  const submit = async (values: CreateSubscriptionValues) => {
    const input: CreateMerchantSubscriptionBody = { planCode: values.planCode, startsOn: values.startsOn };
    try { await mutation.mutateAsync({ merchantId, input }); reset(defaultValues); setOpen(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}>
    <DialogTrigger asChild><Button size="sm" className="h-9 gap-1.5 text-[13px]"><Plus className="size-3.5" />Create Subscription</Button></DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Create Subscription</DialogTitle><DialogDescription>Start this merchant&apos;s SaaS billing subscription. The backend generates the activation invoice automatically.</DialogDescription></DialogHeader>
      {plansQuery.isPending ? <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-text-muted" /></div>
        : plansQuery.isError ? <p className="text-[13px] text-destructive">{normalizeApiError(plansQuery.error).message}</p>
        : activePlans.length === 0 ? <p className="text-[13px] text-text-muted">No active billing plans are available. Activate a plan before creating a subscription.</p>
        : <form id="create-subscription-form" className="grid gap-3" onSubmit={handleSubmit(submit)}>
          <FormField label="Plan" htmlFor="subscription-plan" error={errors.planCode?.message}><Controller control={control} name="planCode" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="subscription-plan" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{activePlans.map((plan) => <SelectItem key={plan.code} value={plan.code}>{plan.name} — {formatPaiseInr(plan.monthlyAmountPaise)}/mo</SelectItem>)}</SelectContent></Select>} /></FormField>
          <FormField label="Start Date" htmlFor="subscription-starts-on" error={errors.startsOn?.message}><Input id="subscription-starts-on" type="date" {...register("startsOn", { required: "Start date is required" })} /></FormField>
        </form>}
      <DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="create-subscription-form" disabled={mutation.isPending || activePlans.length === 0 || plansQuery.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Create Subscription</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
