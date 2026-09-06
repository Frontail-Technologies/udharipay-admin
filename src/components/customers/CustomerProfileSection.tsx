"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DerivedCustomer } from "@/data/admin";
import { INDIAN_STATES } from "@/data/admin/indianStates";
import { kycStatusTone } from "@/data/admin/statusTones";
import { formatDate, humanizeSnakeCase } from "@/lib/format";
import { customerProfileEditSchema, type CustomerProfileEditValues } from "@/lib/adminEditSchemas";
import { patchCustomer } from "@/store/adminDemoStore";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

const FORM_ID = "customer-profile-form";

const FIELD_LABELS: Partial<Record<keyof CustomerProfileEditValues, string>> = {
  name: "Name",
  phone: "Phone",
  alternatePhone: "Alternate Phone",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

function currentValues(customer: DerivedCustomer): CustomerProfileEditValues {
  return {
    name: customer.name,
    phone: customer.phone,
    alternatePhone: customer.alternatePhone ?? "",
    addressLine1: customer.address.line1,
    city: customer.address.city,
    state: customer.address.state,
    pincode: customer.address.pincode,
  };
}

/** `customer` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function CustomerProfileSection({ customer: effective }: { customer: DerivedCustomer }) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CustomerProfileEditValues>({
    resolver: zodResolver(customerProfileEditSchema),
    defaultValues: currentValues(effective),
  });

  useEffect(() => {
    if (editing) setFocus("name");
  }, [editing, setFocus]);

  const startEdit = () => {
    reset(currentValues(effective));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = (values: CustomerProfileEditValues) => {
    patchCustomer(effective.id, {
      name: values.name,
      phone: values.phone,
      alternatePhone: values.alternatePhone ? values.alternatePhone : null,
      address: {
        line1: values.addressLine1,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
      },
    });
    recordAuditEvent({
      action: "Updated Customer",
      entityType: "customer",
      entityId: effective.id,
      entityLabel: values.name,
      changes: diffFlatFields(currentValues(effective), values, FIELD_LABELS),
    });
    toast.success("Customer details updated");
    setEditing(false);
  };

  return (
    <EditableDetailSection
      title="Customer Profile"
      editAriaLabel="Edit Customer Profile"
      editing={editing}
      onEdit={startEdit}
      onCancel={cancelEdit}
      formId={FORM_ID}
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" className="h-9" {...register("name")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" className="h-9" {...register("phone")} />
            </FormField>
            <FormField label="Alternate Phone" htmlFor="alternatePhone" error={errors.alternatePhone?.message}>
              <Input id="alternatePhone" type="tel" className="h-9" {...register("alternatePhone")} />
            </FormField>
          </div>
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
          <KeyValueRow label="Name" value={effective.name} />
          <KeyValueRow label="Customer ID" value={effective.id} />
          <KeyValueRow label="Phone" value={effective.phone} />
          <KeyValueRow label="Alternate Phone" value={effective.alternatePhone ?? "—"} />
          <KeyValueRow label="Joined" value={formatDate(effective.joinedAt)} />
          <KeyValueRow label="City / State" value={`${effective.address.city}, ${effective.address.state}`} />
          <KeyValueRow label="Address" value={effective.address.line1} />
          <KeyValueRow label="Pincode" value={effective.address.pincode} />
          <KeyValueRow
            label="Verification"
            value={
              <StatusBadge tone={kycStatusTone[effective.verificationStatus]}>
                {humanizeSnakeCase(effective.verificationStatus)}
              </StatusBadge>
            }
          />
        </>
      )}
    </EditableDetailSection>
  );
}
