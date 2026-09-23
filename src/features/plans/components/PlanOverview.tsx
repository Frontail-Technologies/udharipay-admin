import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { PlanDetail } from "@/api/generated/contracts/plans";
import { planFrequencyLabels, planStatusTone } from "@/features/plans/utils/metadata";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function PlanOverview({ plan }: { plan: PlanDetail }) {
  const finalDueDate = plan.installments.at(-1)?.dueDate;
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><DetailSection title="Plan Details"><KeyValueRow label="Plan ID" value={plan.publicId} /><KeyValueRow label="Description" value={plan.description} /><KeyValueRow label="Invoice Number" value={plan.invoiceNumber ?? "Not provided"} /><KeyValueRow label="Original Udhaar" value={formatPaiseInr(plan.originalAmountPaise)} /><KeyValueRow label="Status" value={<StatusBadge tone={planStatusTone[plan.status]}>{humanizeSnakeCase(plan.status)}</StatusBadge>} /></DetailSection><DetailSection title="Schedule Contract"><KeyValueRow label="Frequency" value={planFrequencyLabels[plan.frequency]} /><KeyValueRow label="Number of Collections" value={String(plan.numberOfCollections)} /><KeyValueRow label="Start Date" value={formatDate(plan.startDate)} /><KeyValueRow label="Final Due Date" value={formatDate(finalDueDate)} /><KeyValueRow label="Created" value={formatTimestamp(plan.createdAt)} /></DetailSection><DetailSection title="Ownership"><KeyValueRow label="Customer" value={<Link href={`/customers/${plan.customerId}`} className="inline-flex items-center gap-1 text-primary hover:underline">View Customer<ExternalLink className="size-3" /></Link>} /><KeyValueRow label="Merchant" value={<Link href={`/merchants/${plan.merchantId}`} className="inline-flex items-center gap-1 text-primary hover:underline">View Merchant<ExternalLink className="size-3" /></Link>} /></DetailSection></div>;
}
