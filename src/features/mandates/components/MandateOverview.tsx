import Link from "next/link";
import type { Mandate } from "@/api/generated/contracts/mandates";
import { mandateMethodLabels, mandateStatusTone } from "@/features/mandates/utils/metadata";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function MandateOverview({ mandate }: { mandate: Mandate }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><DetailSection title="Authorization Details"><KeyValueRow label="Mandate ID" value={mandate.publicId} /><KeyValueRow label="Method" value={mandateMethodLabels[mandate.method]} /><KeyValueRow label="Status" value={<StatusBadge tone={mandateStatusTone[mandate.status]}>{humanizeSnakeCase(mandate.status)}</StatusBadge>} /><KeyValueRow label="Maximum Amount" value={mandate.maxAmountPaise ? formatPaiseInr(mandate.maxAmountPaise) : "Not set"} /><KeyValueRow label="Expires" value={formatTimestamp(mandate.expiresAt)} /></DetailSection><DetailSection title="Lifecycle"><KeyValueRow label="Authorized At" value={formatTimestamp(mandate.authorizedAt)} /><KeyValueRow label="Activated At" value={formatTimestamp(mandate.activatedAt)} /><KeyValueRow label="Created At" value={formatTimestamp(mandate.createdAt)} /><KeyValueRow label="Updated At" value={formatTimestamp(mandate.updatedAt)} /></DetailSection><DetailSection title="Scope"><KeyValueRow label="Customer" value={<Link href={`/customers/${mandate.customerId}`} className="text-primary hover:underline">View Customer</Link>} /><KeyValueRow label="Scope" value={mandate.planId ? "Plan-specific" : "Customer-level"} /><KeyValueRow label="Linked Plan" value={mandate.planId ? <Link href={`/plans/${mandate.planId}`} className="text-primary hover:underline">View Plan</Link> : "No Plan restriction"} /></DetailSection><DetailSection title="Provider Information"><KeyValueRow label="Provider" value={mandate.provider ?? "Not provided"} /><KeyValueRow label="Provider Reference" value={mandate.providerReference ?? "Not provided"} /></DetailSection></div>;
}
