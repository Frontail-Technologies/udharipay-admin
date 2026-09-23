"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type {
  Merchant,
  UpdateMerchantBody,
} from "@/api/generated/contracts/merchants";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useUpdateMerchant } from "@/features/merchants/hooks/useMerchants";
import { BUSINESS_CATEGORIES } from "@/features/merchants/utils/options";
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
import { formatTimestamp } from "@/shared/utils/date";

type ProfileValues = Pick<
  Merchant,
  "businessName" | "ownerName" | "businessCategory"
>;
const FORM_ID = "merchant-business-profile-form";

function currentValues(merchant: Merchant): ProfileValues {
  return {
    businessName: merchant.businessName,
    ownerName: merchant.ownerName,
    businessCategory: merchant.businessCategory,
  };
}

export function MerchantBusinessProfileSection({
  merchant,
}: {
  merchant: Merchant;
}) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateMerchant();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ProfileValues>({ defaultValues: currentValues(merchant) });

  useEffect(() => {
    if (editing) setFocus("businessName");
  }, [editing, setFocus]);

  const submit = async (values: ProfileValues) => {
    const input: UpdateMerchantBody = {};
    if (values.businessName.trim() !== merchant.businessName)
      input.businessName = values.businessName.trim();
    if (values.ownerName.trim() !== merchant.ownerName)
      input.ownerName = values.ownerName.trim();
    if (values.businessCategory !== merchant.businessCategory)
      input.businessCategory = values.businessCategory;
    if (Object.keys(input).length === 0) {
      setEditing(false);
      return;
    }
    try {
      await mutation.mutateAsync({ merchantId: merchant.id, input });
      setEditing(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return (
    <EditableDetailSection
      title="Business Profile"
      editAriaLabel="Edit Business Profile"
      editing={editing}
      isSaving={mutation.isPending}
      onEdit={() => {
        reset(currentValues(merchant));
        setEditing(true);
      }}
      onCancel={() => setEditing(false)}
      formId={FORM_ID}
    >
      {editing ? (
        <form
          id={FORM_ID}
          onSubmit={handleSubmit(submit)}
          className="flex flex-col gap-3"
        >
          <FormField
            label="Business Name"
            htmlFor="businessName"
            error={errors.businessName?.message}
          >
            <Input
              id="businessName"
              className="h-9"
              {...register("businessName", {
                required: "Business name is required",
              })}
            />
          </FormField>
          <FormField
            label="Owner Name"
            htmlFor="ownerName"
            error={errors.ownerName?.message}
          >
            <Input
              id="ownerName"
              className="h-9"
              {...register("ownerName", { required: "Owner name is required" })}
            />
          </FormField>
          <FormField
            label="Category"
            htmlFor="businessCategory"
            error={errors.businessCategory?.message}
          >
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
        </form>
      ) : (
        <>
          <KeyValueRow label="Business Name" value={merchant.businessName} />
          <KeyValueRow label="Merchant ID" value={merchant.publicId} />
          <KeyValueRow label="Category" value={merchant.businessCategory} />
          <KeyValueRow label="Owner" value={merchant.ownerName} />
          <KeyValueRow label="Joined" value={formatTimestamp(merchant.createdAt)} />
        </>
      )}
    </EditableDetailSection>
  );
}
