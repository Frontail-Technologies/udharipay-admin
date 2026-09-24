"use client";

import { normalizeApiError } from "@/api/http/errors";
import { useCustomerActivation } from "@/features/customers/hooks/useCustomers";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge, type StatusBadgeTone } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

const tone: Record<string, StatusBadgeTone> = { pending: "warning", paid: "success", void: "neutral" };

export function CustomerActivationSection({ customerId }: { customerId: string }) {
  const query = useCustomerActivation(customerId);
  if (query.isPending) return <Skeleton className="h-24 w-full" />;
  if (query.isError) {
    const error = normalizeApiError(query.error);
    if (error.status === 404) return <DetailSection title="Activation"><p className="text-[13px] text-text-muted">No activation fee charged.</p></DetailSection>;
    return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-[13px] text-destructive">{error.message}</div>;
  }
  const activation = query.data.data;
  return <DetailSection title="Activation" description="One-time customer activation fee" action={<StatusBadge tone={tone[activation.status] ?? "neutral"}>{humanizeSnakeCase(activation.status)}</StatusBadge>}>
    <div className="grid gap-x-6 sm:grid-cols-2">
      <KeyValueRow label="Reference" value={activation.publicId} />
      <KeyValueRow label="Fee" value={formatPaiseInr(activation.amountPaise)} />
      <KeyValueRow label="Due Date" value={formatDate(activation.dueDate)} />
      <KeyValueRow label="Paid At" value={formatTimestamp(activation.paidAt)} />
    </div>
  </DetailSection>;
}
