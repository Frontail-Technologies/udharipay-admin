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
import { INDIAN_STATES } from "@/data/admin/indianStates";
import {
  merchantContactAddressEditSchema,
  type MerchantContactAddressEditValues,
} from "@/lib/adminEditSchemas";
import { patchMerchant } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

const FORM_ID = "merchant-contact-address-form";

const FIELD_LABELS: Partial<Record<keyof MerchantContactAddressEditValues, string>> = {
  phone: "Phone",
  email: "Email",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

function currentValues(merchant: DerivedMerchant): MerchantContactAddressEditValues {
  return {
    phone: merchant.phone,
    email: merchant.email,
    addressLine1: merchant.address.line1,
    city: merchant.address.city,
    state: merchant.address.state,
    pincode: merchant.address.pincode,
  };
}

/** `merchant` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function MerchantContactAddressSection({ merchant: effective }: { merchant: DerivedMerchant }) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<MerchantContactAddressEditValues>({
    resolver: zodResolver(merchantContactAddressEditSchema),
    defaultValues: currentValues(effective),
  });

  useEffect(() => {
    if (editing) setFocus("phone");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(effective));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: MerchantContactAddressEditValues) => {
    patchMerchant(effective.id, {
      phone: values.phone,
      email: values.email,
      address: {
        line1: values.addressLine1,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
      },
    });
    recordAuditEvent({
      action: "Updated Merchant",
      entityType: "merchant",
      entityId: effective.id,
      entityLabel: effective.businessName,
      changes: diffFlatFields(currentValues(effective), values, FIELD_LABELS),
    });
    toast.success("Contact & address updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Contact & Address"
      editAriaLabel="Edit Contact & Address"
      editing={editing}
      onEdit={startEdit}
      onCancel={cancelEdit}
      formId={FORM_ID}
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" className="h-9" {...register("phone")} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" className="h-9" {...register("email")} />
          </FormField>
          <FormField label="Address" htmlFor="addressLine1" error={errors.addressLine1?.message}>
            <Input id="addressLine1" className="h-9" {...register("addressLine1")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" htmlFor="city" error={errors.city?.message}>
              <Input id="city" className="h-9" {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state?.message}>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="state" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message}>
            <Input id="pincode" inputMode="numeric" className="h-9" {...register("pincode")} />
          </FormField>
        </form>
      ) : (
        <>
          <KeyValueRow label="Phone" value={effective.phone} />
          <KeyValueRow label="Email" value={effective.email} />
          <KeyValueRow label="Address" value={effective.address.line1} />
          <KeyValueRow label="City" value={effective.address.city} />
          <KeyValueRow label="State" value={effective.address.state} />
          <KeyValueRow label="Pincode" value={effective.address.pincode} />
        </>
      )}
    </EditableDetailSection>
  );
}
