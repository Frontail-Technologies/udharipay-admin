"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, OctagonAlert } from "lucide-react";
import { normalizeApiError } from "@/api/http/errors";
import { formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import type { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

type AttentionItem = { key: string; href: string; title: string; context: string; badgeLabel: string };

export function NeedsAttention({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const collectionItems: AttentionItem[] = (dashboard.collectionAttention.data?.data.items ?? []).map((item) => ({
    key: `collection-${item.installmentId}`,
    href: `/customers/${item.customerId}`,
    title: item.customerName,
    context: `${item.merchantName} · ${formatPaiseInr(item.outstandingAmountPaise)} overdue · ${item.daysOverdue}d`,
    badgeLabel: "Overdue Collection",
  }));

  const kycItems: AttentionItem[] = (dashboard.kycAttention.data?.data.items ?? []).map((item) => ({
    key: `kyc-${item.id}`,
    href: `/kyc/${item.id}`,
    title: item.subject.name,
    context: `${humanizeSnakeCase(item.subject.type)} · Pending Review`,
    badgeLabel: "KYC Pending",
  }));

  const billingItems: AttentionItem[] = (dashboard.billingAttention.data?.data.items ?? [])
    .filter((invoice) => invoice.operationalStatus === "overdue")
    .map((invoice) => ({
      key: `billing-${invoice.id}`,
      href: `/subscriptions/${invoice.id}`,
      title: invoice.publicId,
      context: `${humanizeSnakeCase(invoice.type)} · ${formatPaiseInr(invoice.amountPaise)} overdue`,
      badgeLabel: "Billing Overdue",
    }));

  const items = [...collectionItems, ...kycItems, ...billingItems];
  const anyLoading = dashboard.collectionAttention.isPending || dashboard.kycAttention.isPending || dashboard.billingAttention.isPending;
  const errors = [dashboard.collectionAttention, dashboard.kycAttention, dashboard.billingAttention].filter((query) => query.isError);

  return <ChartCard title="Needs Attention" contentClassName="overflow-y-auto">
    <div className="flex flex-col gap-2">
      {errors.length > 0 && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11.5px] text-destructive">{errors.map((query) => normalizeApiError(query.error).message).join(" · ")}</div>}
      {anyLoading ? <p className="px-1.5 py-2.5 text-[12.5px] text-text-muted">Loading…</p> : items.length === 0 ? <p className="px-1.5 py-2.5 text-[12.5px] text-text-muted">Nothing needs attention right now.</p> : <ul className="flex flex-col">
        {items.map((item, index) => {
          const Icon = item.badgeLabel === "KYC Pending" ? AlertTriangle : OctagonAlert;
          return <li key={item.key}>
            <Link href={item.href} className="flex w-full min-w-0 items-center gap-3 rounded-md px-1.5 py-2.5 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-error/10 text-error"><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-text-primary">{item.title}</span>
                <span className="block truncate text-[11.5px] text-text-muted">{item.context}</span>
              </span>
              <StatusBadge tone="error">{item.badgeLabel}</StatusBadge>
              <ChevronRight className="size-4 shrink-0 text-text-muted" />
            </Link>
            {index < items.length - 1 && <div className="mx-1.5 border-t border-border" />}
          </li>;
        })}
      </ul>}
    </div>
  </ChartCard>;
}
