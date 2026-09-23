"use client";

import { CustomerStatus, type CustomerStatus as CustomerStatusType } from "@/api/generated/contracts/customers";
import { normalizeApiError } from "@/api/http/errors";
import { useChangeCustomerStatus, useCustomer } from "@/features/customers/hooks/useCustomers";
import { customerStatusTone } from "@/features/customers/utils/status";
import { CustomerOverview } from "@/features/customers/components/CustomerOverview";
import { CustomerPlansSection } from "@/features/plans/components/CustomerPlansSection";
import { CustomerMandatesSection } from "@/features/mandates/components/CustomerMandatesSection";
import { SubjectKycSection } from "@/features/kyc/components/SubjectKycSection";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { humanizeSnakeCase, initialsFromName } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function CustomerDetailView({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);
  const statusChange = useChangeCustomerStatus();
  if (query.isPending) return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-52 w-full" /></div>;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;
  const customer = query.data.data;
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5"><EntityPageHeader backHref={`/customers?merchantId=${customer.merchantId}`} avatarLabel={initialsFromName(customer.name)} title={customer.name} meta={`${customer.publicId} · Joined ${formatTimestamp(customer.createdAt)}`} badges={<StatusBadge tone={customerStatusTone[customer.status]}>{humanizeSnakeCase(customer.status)}</StatusBadge>} actions={<Select value={customer.status} disabled={statusChange.isPending} onValueChange={(value) => void statusChange.changeStatus(customer, parseStatus(value))}><SelectTrigger className="h-8 w-32 text-[12.5px]" aria-label="Change customer status"><SelectValue /></SelectTrigger><SelectContent>{Object.values(CustomerStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent></Select>} /><EntitySummaryGrid items={[{ label: "Mobile", value: customer.phone }, { label: "Alternate Mobile", value: customer.alternatePhone ?? "Not provided" }, { label: "Location", value: `${customer.city}, ${customer.state}` }, { label: "Last Updated", value: formatTimestamp(customer.updatedAt) }]} /><CustomerOverview customer={customer} /><CustomerPlansSection customerId={customer.id} merchantId={customer.merchantId} /><CustomerMandatesSection customerId={customer.id} merchantId={customer.merchantId} /><SubjectKycSection subjectType="customer" subjectId={customer.id} /></div>;
}

function parseStatus(value: string): CustomerStatusType {
  return Object.values(CustomerStatus).find((status) => status === value) ?? "inactive";
}
