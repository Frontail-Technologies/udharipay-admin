"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/entity/FormField";
import { addFollowUpSchema, FOLLOW_UP_TYPE_OPTIONS, type AddFollowUpValues } from "@/lib/collectionSchemas";
import { addCollectionFollowUp } from "@/store/adminCollectionsStore";
import { useAdminSettings } from "@/store/adminSettingsStore";
import { addDays, toIsoDate, DEMO_TODAY } from "@/data/admin/seededRandom";

/** Shared with the Plan Detail Follow-up tab and the Collections workspace — never writes to a payment record. */
export function AddFollowUpDialog({
  customerId,
  planId,
  installmentId = null,
  employeeId = null,
  triggerVariant = "outline",
  triggerLabel = "Add Follow-up",
}: {
  customerId: string;
  planId: string;
  installmentId?: string | null;
  employeeId?: string | null;
  triggerVariant?: "outline" | "default";
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  // Settings-driven suggested default — see Collection Settings' "Overdue
  // Follow-up" field. Still fully editable; this only pre-fills it.
  const overdueFollowUpDays = useAdminSettings().collections.overdueFollowUpDays;
  const suggestedNextFollowUpDate = () => toIsoDate(addDays(DEMO_TODAY, overdueFollowUpDays));

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddFollowUpValues>({
    resolver: zodResolver(addFollowUpSchema),
    defaultValues: { type: "call_attempted", note: "", nextFollowUpDate: suggestedNextFollowUpDate(), promisedDate: "" },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (open) reset({ type: "call_attempted", note: "", nextFollowUpDate: suggestedNextFollowUpDate(), promisedDate: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-seed when the dialog opens, matching EditBankDetailsDialog's convention
  }, [open]);

  const onSubmit = (values: AddFollowUpValues) => {
    addCollectionFollowUp({
      customerId,
      planId,
      installmentId,
      employeeId,
      type: values.type,
      note: values.note.trim(),
      promisedDate: values.promisedDate || null,
      nextFollowUpDate: values.nextFollowUpDate || null,
    });
    toast.success("Follow-up added");
    reset({ type: "call_attempted", note: "", nextFollowUpDate: suggestedNextFollowUpDate(), promisedDate: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="sm" className="h-8 gap-1.5 text-[12.5px]">
          <Plus className="size-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Follow-up</DialogTitle>
          <DialogDescription>
            Logs an operational follow-up entry only — this never changes payment or installment status.
          </DialogDescription>
        </DialogHeader>
        <form id="add-follow-up-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Outcome / Type" htmlFor="type" error={errors.type?.message}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLLOW_UP_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Note" htmlFor="note" error={errors.note?.message}>
            <Textarea id="note" className="min-h-20 text-[13px]" {...register("note")} />
          </FormField>
          {selectedType === "promise_to_pay" && (
            <FormField label="Promise to Pay Date" htmlFor="promisedDate" error={errors.promisedDate?.message}>
              <Input id="promisedDate" type="date" className="h-9" {...register("promisedDate")} />
            </FormField>
          )}
          <FormField label="Next Follow-up Date (optional)" htmlFor="nextFollowUpDate" error={errors.nextFollowUpDate?.message}>
            <Input id="nextFollowUpDate" type="date" className="h-9" {...register("nextFollowUpDate")} />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-[12.5px]">
            Cancel
          </Button>
          <Button type="submit" form="add-follow-up-form" size="sm" className="h-8 text-[12.5px]">
            Save Follow-up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
