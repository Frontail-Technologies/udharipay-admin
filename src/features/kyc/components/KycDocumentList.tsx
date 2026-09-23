"use client";

import { FileText, Loader2 } from "lucide-react";
import type { KycDocument } from "@/api/generated/contracts/kyc";
import { useViewKycDocument } from "@/features/kyc/hooks/useKyc";
import { kycDocumentLabels, kycDocumentStatusTones } from "@/features/kyc/utils/metadata";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/shared/utils/date";
import { humanizeSnakeCase } from "@/lib/format";

export function KycDocumentList({ documents }: { documents: KycDocument[] }) {
  const view = useViewKycDocument();
  if (!documents.length) return <p className="text-[12px] text-text-muted">No confirmed documents available.</p>;
  return <ul className="flex flex-col divide-y divide-border">{documents.map((document) => <li key={document.id} className="flex items-center justify-between gap-3 py-2.5"><div className="flex min-w-0 items-center gap-2.5"><FileText className="size-4 shrink-0 text-text-muted" /><div className="min-w-0"><p className="truncate text-[13px] font-medium text-text-primary">{kycDocumentLabels[document.documentType]}</p><p className="truncate text-[11.5px] text-text-muted">{document.originalFilename} · {formatTimestamp(document.confirmedAt)}</p></div></div><div className="flex shrink-0 items-center gap-2"><StatusBadge tone={kycDocumentStatusTones[document.status]}>{humanizeSnakeCase(document.status)}</StatusBadge>{document.status !== "pending" && <Button type="button" variant="outline" size="sm" className="h-7 text-[11.5px]" disabled={view.isPending} onClick={() => view.mutate(document.id)}>{view.isPending && <Loader2 className="size-3 animate-spin" />}View</Button>}</div></li>)}</ul>;
}
