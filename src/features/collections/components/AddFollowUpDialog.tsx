"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { FollowUpType, type CreateFollowUpBody, type FollowUpType as FollowUpTypeValue } from "@/api/generated/contracts/collections";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useCreateFollowUp } from "@/features/collections/hooks/useCollections";
import { followUpTypeLabels } from "@/features/collections/utils/metadata";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/entity/FormField";
import { indiaDateInputToTimestamp, indiaDateTimeInputToTimestamp } from "@/shared/utils/date";

type FollowUpValues = { type: FollowUpTypeValue; note: string; promisedDate: string; nextFollowUpAt: string };
const defaultValues: FollowUpValues = { type: "customer_contacted", note: "", promisedDate: "", nextFollowUpAt: "" };

export function AddFollowUpDialog({ installmentId }: { installmentId: string }) {
  const [open, setOpen] = useState(false);
  const mutation = useCreateFollowUp();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<FollowUpValues>({ defaultValues });
  const selectedType = useWatch({ control, name: "type" });
  const setDialogOpen = (next: boolean) => { if (mutation.isPending) return; setOpen(next); if (!next) reset(defaultValues); };
  const submit = async (values: FollowUpValues) => {
    if (values.type === "will_pay" && !values.promisedDate) { setError("promisedDate", { message: "Promise-to-pay date is required" }); return; }
    const input: CreateFollowUpBody = {
      type: values.type,
      note: values.note.trim() || null,
      promisedDate: values.promisedDate ? indiaDateInputToTimestamp(values.promisedDate) : null,
      nextFollowUpAt: values.nextFollowUpAt ? indiaDateTimeInputToTimestamp(values.nextFollowUpAt) : null,
    };
    try { await mutation.mutateAsync({ installmentId, input }); reset(defaultValues); setOpen(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <Dialog open={open} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button type="button" size="sm" className="h-8 gap-1.5 text-[12.5px]"><Plus className="size-3.5" />Add Follow-up</Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add Follow-up</DialogTitle><DialogDescription>Record a collection interaction without changing the installment due date or payment state.</DialogDescription></DialogHeader><form id="add-follow-up-form" onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
    <FormField label="Outcome / Type" htmlFor="follow-up-type" error={errors.type?.message}><Controller control={control} name="type" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="follow-up-type" className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.values(FollowUpType).map((type) => <SelectItem key={type} value={type}>{followUpTypeLabels[type]}</SelectItem>)}</SelectContent></Select>} /></FormField>
    <FormField label="Note" htmlFor="follow-up-note" error={errors.note?.message}><Textarea id="follow-up-note" className="min-h-20 text-[13px]" maxLength={1000} {...register("note")} /></FormField>
    {selectedType === "will_pay" && <FormField label="Promise-to-pay Date" htmlFor="promised-date" error={errors.promisedDate?.message}><Input id="promised-date" type="date" className="h-9" {...register("promisedDate")} /></FormField>}
    <FormField label="Next Follow-up (optional)" htmlFor="next-follow-up" error={errors.nextFollowUpAt?.message}><Input id="next-follow-up" type="datetime-local" className="h-9" {...register("nextFollowUpAt")} /></FormField>
  </form><DialogFooter><Button type="button" variant="outline" size="sm" disabled={mutation.isPending} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" form="add-follow-up-form" size="sm" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="size-4 animate-spin" />}Save Follow-up</Button></DialogFooter></DialogContent></Dialog>;
}
