"use client";

import { MerchantStatus, type MerchantStatus as MerchantStatusType } from "@/api/generated/contracts/merchants";
import { normalizeApiError } from "@/api/http/errors";
import { merchantStatusTone } from "@/features/merchants/utils/status";
import { useChangeMerchantStatus, useMerchant } from "@/features/merchants/hooks/useMerchants";
import { EntityPageHeader } from "@/components/entity/EntityPageHeader";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { MerchantOverviewTab } from "@/features/merchants/components/MerchantOverviewTab";
import { SubjectKycSection } from "@/features/kyc/components/SubjectKycSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, humanizeSnakeCase, initialsFromName } from "@/lib/format";

export function MerchantDetailView({ merchantId }: { merchantId: string }) {
  const query = useMerchant(merchantId);
  const statusChange = useChangeMerchantStatus();

  if (query.isPending) return <MerchantDetailSkeleton />;
  if (query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(query.error).message}</div>;

  const merchant = query.data.data;
  return <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-5">
    <EntityPageHeader backHref="/merchants" avatarLabel={initialsFromName(merchant.businessName)} title={merchant.businessName} meta={`${merchant.publicId} · Merchant since ${formatDate(merchant.createdAt)}`} badges={<StatusBadge tone={merchantStatusTone[merchant.status]}>Business {humanizeSnakeCase(merchant.status)}</StatusBadge>} actions={<Select value={merchant.status} disabled={statusChange.isPending} onValueChange={(value) => void statusChange.changeStatus(merchant, parseStatus(value))}><SelectTrigger className="h-8 w-36 text-[12.5px]" aria-label="Change merchant status"><SelectValue /></SelectTrigger><SelectContent>{Object.values(MerchantStatus).map((status) => <SelectItem key={status} value={status}>{humanizeSnakeCase(status)}</SelectItem>)}</SelectContent></Select>} />
    <EntitySummaryGrid items={[{ label: "Owner", value: merchant.ownerName }, { label: "Business Category", value: merchant.businessCategory }, { label: "Location", value: `${merchant.city}, ${merchant.state}` }, { label: "Last Updated", value: formatDate(merchant.updatedAt) }]} />
    <MerchantOverviewTab merchant={merchant} />
    <SubjectKycSection subjectType="merchant" subjectId={merchant.id} />
  </div>;
}

function MerchantDetailSkeleton() {
  return <div className="mx-auto flex max-w-6xl flex-col gap-5"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div></div>;
}

function parseStatus(value: string): MerchantStatusType {
  return Object.values(MerchantStatus).find((status) => status === value) ?? "draft";
}
