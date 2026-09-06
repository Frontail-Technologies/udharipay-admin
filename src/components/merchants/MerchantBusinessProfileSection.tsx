"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DerivedMerchant } from "@/data/admin";
import { BUSINESS_CATEGORIES } from "@/data/admin/merchants";
import { formatDate } from "@/lib/format";
import { merchantProfileEditSchema, type MerchantProfileEditValues } from "@/lib/adminEditSchemas";
import { patchMerchant } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

const FORM_ID = "merchant-business-profile-form";

const FIELD_LABELS: Partial<Record<keyof MerchantProfileEditValues, string>> = {
  businessName: "Business Name",
  ownerName: "Owner Name",
  businessCategory: "Category",
  assignedEmployeeName: "Assigned Representative",
  branchCount: "Branches",
};

function currentValues(merchant: DerivedMerchant): MerchantProfileEditValues {
  return {
    businessName: merchant.businessName,
    ownerName: merchant.ownerName,
    businessCategory: merchant.businessCategory,
    assignedEmployeeName: merchant.assignedEmployeeName,
    branchCount: merchant.branchCount,
  };
}

/** `merchant` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function MerchantBusinessProfileSection({ merchant: effective }: { merchant: DerivedMerchant }) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<MerchantProfileEditValues>({
    resolver: zodResolver(merchantProfileEditSchema),
    defaultValues: currentValues(effective),
  });

  useEffect(() => {
    if (editing) setFocus("businessName");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(effective));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: MerchantProfileEditValues) => {
    patchMerchant(effective.id, values);
    recordAuditEvent({
      action: "Updated Merchant",
      entityType: "merchant",
      entityId: effective.id,
      entityLabel: values.businessName,
      changes: diffFlatFields(currentValues(effective), values, FIELD_LABELS),
    });
    toast.success("Merchant details updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Business Profile"
      editAriaLabel="Edit Business Profile"
      editing={editing}
      onEdit={startEdit}
      onCancel={cancelEdit}
      formId={FORM_ID}
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Business Name" htmlFor="businessName" error={errors.businessName?.message}>
            <Input id="businessName" className="h-9" {...register("businessName")} />
          </FormField>
          <FormField label="Owner Name" htmlFor="ownerName" error={errors.ownerName?.message}>
            <Input id="ownerName" className="h-9" {...register("ownerName")} />
          </FormField>
          <FormField label="Category" htmlFor="businessCategory" error={errors.businessCategory?.message}>
            <Controller
              control={control}
              name="businessCategory"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="businessCategory" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            label="Assigned Representative"
            htmlFor="assignedEmployeeName"
            error={errors.assignedEmployeeName?.message}
          >
            <Input id="assignedEmployeeName" className="h-9" {...register("assignedEmployeeName")} />
          </FormField>
          <FormField label="Branches" htmlFor="branchCount" error={errors.branchCount?.message}>
            <Input
              id="branchCount"
              type="number"
              min={1}
              max={50}
              className="h-9"
              {...register("branchCount", { valueAsNumber: true })}
            />
          </FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Business Name" value={effective.businessName} />
          <KeyValueRow label="Merchant ID" value={effective.id} />
          <KeyValueRow label="Category" value={effective.businessCategory} />
          <KeyValueRow label="Owner" value={effective.ownerName} />
          <KeyValueRow label="Assigned Rep" value={effective.assignedEmployeeName} />
          <KeyValueRow label="Branches" value={String(effective.branchCount)} />
          <KeyValueRow label="Joined" value={formatDate(effective.joinedAt)} />
        </>
      )}
    </EditableDetailSection>
  );
}
