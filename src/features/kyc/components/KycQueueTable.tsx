"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import type { KycReviewSummary } from "@/api/generated/contracts/kyc";
import { kycStatusLabels, kycStatusTones, kycSubjectLabels } from "@/features/kyc/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatTimestamp } from "@/shared/utils/date";

export function KycQueueTable({ reviews, isLoading }: { reviews: KycReviewSummary[]; isLoading: boolean }) {
  const router = useRouter();
  const columns = useMemo<ColumnDef<KycReviewSummary>[]>(() => [
    { id: "subject", header: "Subject", cell: ({ row }) => <div className="min-w-0"><p className="truncate font-medium text-text-primary">{row.original.subject.name}</p><p className="truncate text-[11.5px] text-text-muted">{row.original.subject.publicId}</p></div> },
    { id: "subjectType", header: "Subject Type", cell: ({ row }) => <span className="text-text-secondary">{kycSubjectLabels[row.original.subject.type]}</span> },
    { accessorKey: "submittedAt", header: "Submitted", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatTimestamp(row.original.submittedAt)}</span> },
    { accessorKey: "assignedReviewerUserId", header: "Assigned Reviewer", cell: ({ row }) => <span className="text-text-secondary">{row.original.assignedReviewerUserId ?? "Not assigned"}</span> },
    { accessorKey: "decisionReason", header: "Decision Reason", cell: ({ row }) => <span className="block max-w-60 truncate text-[12px] text-text-secondary">{row.original.decisionReason ?? "Not provided"}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={kycStatusTones[row.original.status]}>{kycStatusLabels[row.original.status]}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "Open Review", href: `/kyc/${row.original.id}` }, { label: `View ${kycSubjectLabels[row.original.subject.type]}`, href: `/${row.original.subject.type}s/${row.original.subject.id}` }]} /> },
  ], []);
  return <DataTable columns={columns} data={reviews} isLoading={isLoading} stickyHeader tableClassName="min-w-[1050px]" onRowClick={(review) => router.push(`/kyc/${review.id}`)} emptyState={<span className="text-[13px] text-text-muted">No KYC reviews match these filters.</span>} />;
}
