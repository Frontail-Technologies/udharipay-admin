"use client";

import { DetailSection } from "@/components/entity/DetailSection";
import { KeyValueRow } from "@/components/entity/KeyValueRow";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EditBankDetailsDialog } from "@/components/merchants/EditBankDetailsDialog";
import type { DerivedMerchant } from "@/data/admin";
import { autoPayStatusTone } from "@/data/admin/statusTones";
import { humanizeSnakeCase } from "@/lib/format";

/** `merchant` is expected to already be the canonical effective entity (see useAdminEntities.ts). */
export function MerchantBankSummary({ merchant }: { merchant: DerivedMerchant }) {
  const bank = merchant.bank;

  return (
    <DetailSection title="Settlement / Bank" action={<EditBankDetailsDialog merchant={merchant} />}>
      <KeyValueRow label="Bank" value={bank.bankName} />
      <KeyValueRow label="Account Holder" value={bank.accountHolderName} />
      <KeyValueRow label="Account" value={bank.accountMasked} />
      <KeyValueRow label="IFSC" value={bank.ifsc} />
      <KeyValueRow
        label="Settlement Status"
        value={
          <StatusBadge tone={bank.verified ? "success" : "warning"}>
            {bank.verified ? "Verified" : "Pending"}
          </StatusBadge>
        }
      />
      <KeyValueRow
        label="AutoPay Mandate"
        value={
          <StatusBadge tone={autoPayStatusTone[merchant.autoPayStatus]}>
            {humanizeSnakeCase(merchant.autoPayStatus)}
          </StatusBadge>
        }
      />
    </DetailSection>
  );
}
