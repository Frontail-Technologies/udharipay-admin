"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentListItem } from "@/api/generated/contracts/payments";
import { normalizeApiError } from "@/api/http/errors";
import { usePlanPaymentHistory } from "@/features/payments/hooks/usePayments";
import { paymentMethodLabels, paymentSourceLabels, paymentStatusTone } from "@/features/payments/utils/metadata";
import { formatTimestamp } from "@/shared/utils/date";
import { DataTable } from "@/components/table/DataTable";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";

export function PaymentHistory({ planId }: { planId: string }) {
  const router = useRouter();
  const history = usePlanPaymentHistory(planId);
  const columns = useMemo<ColumnDef<PaymentListItem>[]>(() => [
    { accessorKey: "publicId", header: "Payment", cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.publicId}</span> },
    { accessorKey: "amountPaise", header: "Amount", cell: ({ row }) => <span className="tabular-nums">{formatPaiseInr(row.original.amountPaise)}</span> },
    { accessorKey: "method", header: "Method", cell: ({ row }) => <span className="text-text-secondary">{paymentMethodLabels[row.original.method]}</span> },
    { accessorKey: "source", header: "Source", cell: ({ row }) => <span className="text-text-secondary">{paymentSourceLabels[row.original.source]}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge tone={paymentStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge> },
    { accessorKey: "provider", header: "Provider", cell: ({ row }) => <span className="text-text-secondary">{row.original.provider ?? "-"}</span> },
    { accessorKey: "paidAt", header: "Paid At", cell: ({ row }) => <span className="text-[12px] text-text-muted">{formatTimestamp(row.original.paidAt)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <RowActionsMenu actions={[{ label: "View Payment", href: `/payments/${row.original.id}` }]} /> },
  ], []);

  if (history.query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(history.query.error).message}</div>;
  return <div className="flex flex-col gap-3"><PlanPaymentNotice /><DataTable columns={columns} data={history.payments} isLoading={history.query.isPending} stickyHeader tableClassName="min-w-[1040px]" onRowClick={(payment) => router.push(`/payments/${payment.id}`)} emptyState={<span className="text-[13px] text-text-muted">No payments recorded for this Plan.</span>} /><div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{history.payments.length} result{history.payments.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!history.hasPrevious} onClick={history.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!history.nextCursor} onClick={() => history.nextCursor && history.goNext(history.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div></div>;
}

function PlanPaymentNotice() {
  return <p className="text-[12px] text-text-muted">Payment history is the canonical ledger. Installment balances remain sourced from Plan detail.</p>;
}
