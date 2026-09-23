"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { MandateAttempt } from "@/api/generated/contracts/mandates";
import { normalizeApiError } from "@/api/http/errors";
import { useAttemptHistory } from "@/features/mandates/hooks/useMandates";
import { mandateAttemptStatusTone } from "@/features/mandates/utils/metadata";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import { formatTimestamp } from "@/shared/utils/date";

export function MandateAttempts({ mandateId }: { mandateId: string }) {
  const history = useAttemptHistory(mandateId);
  const columns = useMemo<ColumnDef<MandateAttempt>[]>(() => [
    { accessorKey: "attemptedAt", header: "Attempted At", cell: ({ row }) => <span className="text-[12px] text-text-secondary">{formatTimestamp(row.original.attemptedAt)}</span> },
    { accessorKey: "amountPaise", header: "Attempt Amount", cell: ({ row }) => <span className="tabular-nums">{row.original.amountPaise ? formatPaiseInr(row.original.amountPaise) : "Not provided"}</span> },
    { accessorKey: "status", header: "Attempt Status", cell: ({ row }) => <StatusBadge tone={mandateAttemptStatusTone[row.original.status]}>{humanizeSnakeCase(row.original.status)}</StatusBadge> },
    { accessorKey: "planId", header: "Plan", cell: ({ row }) => <span className="font-mono text-[11.5px] text-text-secondary">{row.original.planId ?? "Customer-level"}</span> },
    { accessorKey: "installmentId", header: "Installment", cell: ({ row }) => <span className="font-mono text-[11.5px] text-text-secondary">{row.original.installmentId ?? "Not linked"}</span> },
    { accessorKey: "provider", header: "Provider", cell: ({ row }) => <span className="text-text-secondary">{row.original.provider ?? "Not provided"}</span> },
    { accessorKey: "providerReference", header: "Provider Reference", cell: ({ row }) => <span className="text-text-secondary">{row.original.providerReference ?? "Not provided"}</span> },
    { id: "failure", header: "Failure", cell: ({ row }) => <div className="max-w-64"><p className="truncate text-text-secondary">{row.original.failureReason ?? "-"}</p>{row.original.failureCode && <p className="truncate text-[11.5px] text-text-muted">{row.original.failureCode}</p>}</div> },
  ], []);
  if (history.query.isError) return <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-[13px] text-destructive">{normalizeApiError(history.query.error).message}</div>;
  return <div className="flex flex-col gap-3"><p className="text-[12px] text-text-muted">Attempts are provider execution evidence, not canonical Payments or collected money.</p><DataTable columns={columns} data={history.attempts} isLoading={history.query.isPending} stickyHeader tableClassName="min-w-[1320px]" emptyState={<span className="text-[13px] text-text-muted">No mandate attempts recorded.</span>} /><div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{history.attempts.length} result{history.attempts.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!history.hasPrevious} onClick={history.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!history.nextCursor} onClick={() => history.nextCursor && history.goNext(history.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div></div>;
}
