"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Customer, UpdateCustomerBody } from "@/api/generated/contracts/customers";
import { applyApiFormErrors } from "@/api/forms/formErrors";
import { useUpdateCustomer } from "@/features/customers/hooks/useCustomers";
import { INDIAN_STATES } from "@/shared/utils/india";
import { EditableDetailSection } from "@/components/entity/EditableDetailSection";
import { FormField } from "@/components/entity/FormField";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTimestamp } from "@/shared/utils/date";

type ProfileValues = Pick<Customer, "name" | "phone" | "address" | "city" | "state" | "pincode"> & { alternatePhone: string };
const FORM_ID = "customer-profile-form";

function currentValues(customer: Customer): ProfileValues {
  return { name: customer.name, phone: customer.phone, alternatePhone: customer.alternatePhone ?? "", address: customer.address, city: customer.city, state: customer.state, pincode: customer.pincode };
}

export function CustomerProfileSection({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState(false);
  const mutation = useUpdateCustomer();
  const { register, control, handleSubmit, reset, setError, setFocus, formState: { errors } } = useForm<ProfileValues>({ defaultValues: currentValues(customer) });
  useEffect(() => { if (editing) setFocus("name"); }, [editing, setFocus]);
  const submit = async (values: ProfileValues) => {
    const input: UpdateCustomerBody = {};
    if (values.name.trim() !== customer.name) input.name = values.name.trim();
    if (values.phone.trim() !== customer.phone) input.phone = values.phone.trim();
    if ((values.alternatePhone.trim() || null) !== customer.alternatePhone) input.alternatePhone = values.alternatePhone.trim() || null;
    if (values.address.trim() !== customer.address) input.address = values.address.trim();
    if (values.city.trim() !== customer.city) input.city = values.city.trim();
    if (values.state !== customer.state) input.state = values.state;
    if (values.pincode.trim() !== customer.pincode) input.pincode = values.pincode.trim();
    if (Object.keys(input).length === 0) { setEditing(false); return; }
    try { await mutation.mutateAsync({ customerId: customer.id, merchantId: customer.merchantId, input }); setEditing(false); } catch (error) { const result = applyApiFormErrors(error, setError); if (!result.applied) toast.error(result.error.message); }
  };

  return <EditableDetailSection title="Customer Profile" editAriaLabel="Edit Customer Profile" editing={editing} isSaving={mutation.isPending} onEdit={() => { reset(currentValues(customer)); setEditing(true); }} onCancel={() => setEditing(false)} formId={FORM_ID}><div>{editing ? <form id={FORM_ID} onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
    <FormField label="Name" htmlFor="name" error={errors.name?.message}><Input id="name" className="h-9" {...register("name", { required: "Name is required" })} /></FormField><div className="grid grid-cols-2 gap-3"><FormField label="Phone" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" className="h-9" {...register("phone", { required: "Mobile number is required" })} /></FormField><FormField label="Alternate Phone" htmlFor="alternatePhone" error={errors.alternatePhone?.message}><Input id="alternatePhone" type="tel" className="h-9" {...register("alternatePhone")} /></FormField></div>
    <FormField label="Address" htmlFor="address" error={errors.address?.message}><Input id="address" className="h-9" {...register("address", { required: "Address is required" })} /></FormField><div className="grid grid-cols-2 gap-3"><FormField label="City" htmlFor="city" error={errors.city?.message}><Input id="city" className="h-9" {...register("city", { required: "City is required" })} /></FormField><FormField label="State" htmlFor="state" error={errors.state?.message}><Controller control={control} name="state" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="state" className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent>{INDIAN_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>} /></FormField></div><FormField label="Pincode" htmlFor="pincode" error={errors.pincode?.message}><Input id="pincode" inputMode="numeric" className="h-9" {...register("pincode", { required: "Pincode is required" })} /></FormField>
  </form> : <><KeyValueRow label="Name" value={customer.name} /><KeyValueRow label="Customer ID" value={customer.publicId} /><KeyValueRow label="Phone" value={customer.phone} /><KeyValueRow label="Alternate Phone" value={customer.alternatePhone ?? "Not provided"} /><KeyValueRow label="Joined" value={formatTimestamp(customer.createdAt)} /><KeyValueRow label="City / State" value={`${customer.city}, ${customer.state}`} /><KeyValueRow label="Address" value={customer.address} /><KeyValueRow label="Pincode" value={customer.pincode} /></>}</div></EditableDetailSection>;
}
