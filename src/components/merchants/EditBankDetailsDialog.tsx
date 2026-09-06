"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/entity/FormField";
import type { DerivedMerchant } from "@/data/admin";
import { merchantBankEditSchema, type MerchantBankEditValues } from "@/lib/adminEditSchemas";
import { patchMerchant } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import type { AdminAuditChange } from "@/data/admin/events/types";

function maskAccountNumber(accountNumber: string): string {
  const lastFour = accountNumber.slice(-4);
  return `XXXX XXXX ${lastFour}`;
}

/** `merchant` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function EditBankDetailsDialog({ merchant }: { merchant: DerivedMerchant }) {
  const bank = merchant.bank;
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<MerchantBankEditValues>({
    resolver: zodResolver(merchantBankEditSchema),
    defaultValues: {
      bankName: bank.bankName,
      accountHolderName: bank.accountHolderName,
      accountNumber: "",
      ifsc: bank.ifsc,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        bankName: bank.bankName,
        accountHolderName: bank.accountHolderName,
        accountNumber: "",
        ifsc: bank.ifsc,
      });
      setFocus("bankName");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-seed when the dialog opens, not on every bank/reset/setFocus identity change
  }, [open]);

  const onSubmit = (values: MerchantBankEditValues) => {
    patchMerchant(merchant.id, {
      bank: {
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        accountMasked: values.accountNumber ? maskAccountNumber(values.accountNumber) : bank.accountMasked,
        ifsc: values.ifsc,
        verified: bank.verified,
      },
    });
    const changed =
      values.bankName !== bank.bankName ||
      values.accountHolderName !== bank.accountHolderName ||
      values.ifsc !== bank.ifsc ||
      Boolean(values.accountNumber);
    if (changed) {
      // Bank details are never shown field-by-field in the audit log, even
      // masked — a single opaque "changed" marker, per Part R.
      const changes: AdminAuditChange[] = [{ field: "Bank Details", from: "••••••", to: "••••••" }];
      recordAuditEvent({
        action: "Updated Merchant",
        entityType: "merchant",
        entityId: merchant.id,
        entityLabel: merchant.businessName,
        changes,
      });
    }
    toast.success("Bank details updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Edit Bank Details"
          className="h-8 gap-1.5 text-[12.5px]"
        >
          <Pencil className="size-3.5" />
          Edit Bank Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bank Details</DialogTitle>
          <DialogDescription>
            Demo/pre-backend edit — no real bank verification is performed. The current account number
            is only ever shown masked; leave it blank to keep the existing one on file.
          </DialogDescription>
        </DialogHeader>
        <form id="merchant-bank-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Bank Name" htmlFor="bankName" error={errors.bankName?.message}>
            <Input id="bankName" className="h-9" {...register("bankName")} />
          </FormField>
          <FormField label="Account Holder Name" htmlFor="accountHolderName" error={errors.accountHolderName?.message}>
            <Input id="accountHolderName" className="h-9" {...register("accountHolderName")} />
          </FormField>
          <FormField label="Account Number" htmlFor="accountNumber" error={errors.accountNumber?.message}>
            <Input
              id="accountNumber"
              inputMode="numeric"
              placeholder={`Currently on file: ${bank.accountMasked}`}
              className="h-9"
              {...register("accountNumber")}
            />
          </FormField>
          <FormField label="IFSC" htmlFor="ifsc" error={errors.ifsc?.message}>
            <Input id="ifsc" className="h-9 uppercase" {...register("ifsc")} />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="h-8 text-[12.5px]">
            Cancel
          </Button>
          <Button type="submit" form="merchant-bank-form" size="sm" className="h-8 text-[12.5px]">
            Save Bank Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
