"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMerchantInvoiceHistory } from "@/features/billing/hooks/useBilling";
import { InvoiceListTable } from "@/features/billing/components/InvoiceListTable";
import { Button } from "@/components/ui/button";

export function MerchantInvoiceHistory({ merchantId }: { merchantId: string }) {
  const history = useMerchantInvoiceHistory(merchantId);
  return <div className="flex flex-col gap-2">
    <InvoiceListTable invoices={history.invoices} isLoading={history.query.isPending} />
    <div className="flex items-center justify-between"><p className="text-[12px] text-text-muted">{history.invoices.length} result{history.invoices.length === 1 ? "" : "s"} on this page</p><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-8" disabled={!history.hasPrevious} onClick={history.goPrevious}><ChevronLeft className="size-3.5" />Previous</Button><Button variant="outline" size="sm" className="h-8" disabled={!history.nextCursor} onClick={() => history.nextCursor && history.goNext(history.nextCursor)}>Next<ChevronRight className="size-3.5" /></Button></div></div>
  </div>;
}
