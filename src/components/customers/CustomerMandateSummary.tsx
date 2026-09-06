import Link from "next/link";
import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ComingSoonPanel } from "@/components/entity/EntityTabs";
import type { Mandate } from "@/data/admin";
import { mandateOperationalStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function CustomerMandateSummary({ mandate }: { mandate: Mandate | undefined }) {
  if (!mandate) {
    return <ComingSoonPanel label="No mandate set up for this customer" />;
  }

  return (
    <DetailSection
      title="Mandate Summary"
      className="max-w-md"
      action={
        <Link href={`/mandates/${mandate.id}`} className="text-[12px] font-medium text-primary hover:underline">
          View Mandate
        </Link>
      }
    >
      <KeyValueRow label="Mandate ID" value={mandate.id} />
      <KeyValueRow
        label="Status"
        value={
          <StatusBadge tone={mandateOperationalStatusTone[mandate.status]}>
            {humanizeSnakeCase(mandate.status)}
          </StatusBadge>
        }
      />
      <KeyValueRow label="Method" value={mandate.method} />
      <KeyValueRow label="Provider" value={mandate.provider} />
      <KeyValueRow label="Authorized" value={formatDate(mandate.authorizedAt)} />
      <KeyValueRow label="Max Amount" value={mandate.maxAmount ? formatCompactInr(mandate.maxAmount) : "—"} />
    </DetailSection>
  );
}
