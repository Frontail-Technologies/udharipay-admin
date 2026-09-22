"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Merchant, UpdateMerchantBody } from "@/api/generated/contracts/merchants";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useUpdateMerchant } from "@/features/merchants/hooks/useMerchants";
import { INDIAN_STATES } from "@/shared/utils/india";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ContactValues = Pick<Merchant, "phone" | "address" | "city" | "state" | "pincode"> & { email: string };
const FORM_ID = "merchant-contact-address-form";

function currentValues(merchant: Merchant): ContactValues {
  return { phone: merchant.phone, email: merchant.email ?? "", address: merchant.address, city: merchant.city, state: merchant.state, pincode: merchant.pincode };
}

export function MerchantContactAddressSection({ merchant }: { merchant: Merchant }) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateMerchant();
  const { register, control, handleSubmit, reset, setError, setFocus, formState: { errors } } = useForm<ContactValues>({ defaultValues: currentValues(merchant) });

  useEffect(() => { if (editing) setFocus("phone"); }, [editing, setFocus]);

  const submit = async (values: ContactValues) => {
    const input: UpdateMerchantBody = {};
    if (values.phone.trim() !== merchant.phone) input.phone = values.phone.trim();
    if ((values.email.trim() || null) !== merchant.email) input.email = values.email.trim() || null;
    if (values.address.trim() !== merchant.address) input.address = values.address.trim();
    if (values.city.trim() !== merchant.city) input.city = values.city.trim();
    if (values.state !== merchant.state) input.state = values.state;
    if (values.pincode.trim() !== merchant.pincode) input.pincode = values.pincode.trim();
    if (Object.keys(input).length === 0) { setEditing(false); return; }
    try {
      await mutation.mutateAsync({ merchantId: merchant.id, input });
      setEditing(false);
    } catch (error) {
      const result = applyApiFormErrors(error, setError);
      if (!result.applied) toast.error(result.error.message);
    }
  };

  return <EditableDetailSection title="Contact & Address" editAriaLabel="Edit Contact & Address" editing={editing} isSaving={mutation.isPending} onEdit={() => { reset(currentValues(merchant)); setEditing(true); }} onCancel={() => setEditing(false)} formId={FORM_ID}>
    {editing ? <form id={FORM_ID} onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" className="h-9" {...register("phone", { required: "Mobile number is required" })} /></FormField>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" className="h-9" {...register("email")} /></FormField>
      <FormField label="Address" htmlFor="address" error={errors.address?.message}><Input id="address" className="h-9" {...register("address", { required: "Address is required" })} /></FormField>
      <div className="grid grid-cols-2 gap-3"><FormField label="City" htmlFor="city" error={errors.city?.message}><Input id="city" className="h-9" {...register("city", { required: "City is required" })} /></FormField><FormField label="State" htmlFor="state" error={errors.state?.message}><Controller control={control} name="state" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="state" className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent>{INDIAN_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>} /></FormField></div>
      <FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message}><Input id="pincode" inputMode="numeric" className="h-9" {...register("pincode", { required: "Pincode is required" })} /></FormField>
    </form> : <><KeyValueRow label="Phone" value={merchant.phone} /><KeyValueRow label="Email" value={merchant.email ?? "Not provided"} /><KeyValueRow label="Address" value={merchant.address} /><KeyValueRow label="City" value={merchant.city} /><KeyValueRow label="State" value={merchant.state} /><KeyValueRow label="Pincode" value={merchant.pincode} /></>}
  </EditableDetailSection>;
}
