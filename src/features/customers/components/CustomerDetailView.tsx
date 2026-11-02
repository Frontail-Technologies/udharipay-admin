"use client";

import { CustomerStatus, type CustomerStatus as CustomerStatusType } from "@/api/generated/contracts/customers";
import { normalizeApiError } from "@/api/http/errors";
import { useChangeCustomerStatus, useCustomer } from "@/features/customers/hooks/useCustomers";
import { customerStatusTone } from "@/features/customers/utils/status";
import { CustomerRemindersSection } from "@/features/communications/components/CustomerRemindersSection";
import { CustomerActivationSection } from "@/features/customers/components/CustomerActivationSection";
import { CustomerOverview } from "@/features/customers/components/CustomerOverview";
import { CustomerPlansSection } from "@/features/plans/components/CustomerPlansSection";
import { CustomerMandatesSection } from "@/features/mandates/components/CustomerMandatesSection";
import { SubjectKycSection } from "@/features/kyc/components/SubjectKycSection";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { humanizeSnakeCase, initialsFromName } from "@/lib/format";

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);
  const statusChange = useChangeCustomerStatus();
  if (query.isPending) return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-52 w-full" /></div>;
  if (query.isError) return <div className="rounded-xl bg-destructive/[0.06] px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const customer = query.data.data;
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5"><EntityPageHeader backHref={`/customers?merchantId=${customer.merchantId}`} avatarLabel={initialsFromName(customer.name)} title={customer.name} meta={`${customer.publicId} · ${customer.phone} · ${customer.city}, ${customer.state}`} badges={<StatusBadge tone={customerStatusTone[customer.status]}>{humanizeSnakeCase(customer.status)}</StatusBadge>} actions={<Select value={customer.status} disabled={statusChange.isPending} onValueChange={(value) => void statusChange.changeStatus(customer, parseStatus(value))}><SelectTrigger className="h-8 w-32 text-[12.5px]" aria-label="Change customer status"><SelectValue /></SelectTrigger><SelectContent>{Object.values(CustomerStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent></Select>} /><CustomerOverview customer={customer} /><CustomerActivationSection customerId={customer.id} /><CustomerPlansSection customerId={customer.id} merchantId={customer.merchantId} /><CustomerMandatesSection customerId={customer.id} merchantId={customer.merchantId} /><CustomerRemindersSection customerId={customer.id} /><SubjectKycSection subjectType="customer" subjectId={customer.id} /></div>;
}

function parseStatus(value: string): CustomerStatusType {
  return Object.values(CustomerStatus).find((status) => status === value) ?? "inactive";
}
