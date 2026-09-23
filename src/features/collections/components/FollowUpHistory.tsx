"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeApiError } from "@/api/http/errors";
import { useFollowUpHistory } from "@/features/collections/hooks/useCollections";
import { followUpTypeLabels } from "@/features/collections/utils/metadata";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndiaDateFromTimestamp, formatTimestamp } from "@/shared/utils/date";

export function FollowUpHistory({ installmentId }: { installmentId: string }) {
  const history = useFollowUpHistory(installmentId);
  if (history.query.isPending) return <div className="flex flex-col gap-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>;
  if (history.query.isError) return <p className="text-[12px] text-destructive">{normalizeApiError(history.query.error).message}</p>;
  if (!history.followUps.length) return <p className="text-[12px] text-text-muted">No follow-up activity recorded.</p>;
  return <div className="flex flex-col gap-2">
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {history.followUps.map((followUp) => <li key={followUp.id} className="px-3 py-2.5 text-[12px]"><div className="flex items-start justify-between gap-3"><span className="font-medium text-text-primary">{followUpTypeLabels[followUp.type]}</span><span className="shrink-0 text-[10.5px] text-text-muted">{formatTimestamp(followUp.createdAt)}</span></div>{followUp.note && <p className="mt-1 text-text-secondary">{followUp.note}</p>}<div className="mt-1.5 grid gap-1 text-[11px] text-text-muted">{followUp.promisedDate && <span>Promise-to-pay date: {formatIndiaDateFromTimestamp(followUp.promisedDate)}</span>}{followUp.nextFollowUpAt && <span>Next follow-up: {formatTimestamp(followUp.nextFollowUpAt)}</span>}{followUp.employeeId && <span>Employee ID: {followUp.employeeId}</span>}</div></li>)}
    </ul>
    <div className="flex justify-end gap-1.5"><Button variant="outline" size="sm" className="h-7 text-[11.5px]" disabled={!history.hasPrevious} onClick={history.goPrevious}><ChevronLeft className="size-3" />Previous</Button><Button variant="outline" size="sm" className="h-7 text-[11.5px]" disabled={!history.nextCursor} onClick={() => history.nextCursor && history.goNext(history.nextCursor)}>Next<ChevronRight className="size-3" /></Button></div>
  </div>;
}
