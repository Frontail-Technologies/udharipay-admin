"use client";

import { useMemo } from "react";
import { AlertTriangle, ChevronRight, Info, OctagonAlert } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatusBadge, type StatusBadgeTone } from "@/components/admin/StatusBadge";
import { needsAttentionItems, type NeedsAttentionSeverity } from "@/data/admin-demo-data";
import { useAdminMerchants, useAdminSubscriptions, useAdminSubscriptionInvoices } from "@/hooks/useAdminEntities";
import { findSubscriptionAttentionItem } from "@/data/admin/reports";

const severityConfig: Record<
  NeedsAttentionSeverity,
  { icon: typeof AlertTriangle; iconClass: string; badgeTone: StatusBadgeTone }
> = {
  error: { icon: OctagonAlert, iconClass: "bg-error/10 text-error", badgeTone: "error" },
  warning: { icon: AlertTriangle, iconClass: "bg-warning/10 text-warning", badgeTone: "warning" },
  info: { icon: Info, iconClass: "bg-info/10 text-info", badgeTone: "info" },
};

export function NeedsAttention() {
  const merchants = useAdminMerchants();
  const subscriptions = useAdminSubscriptions();
  const subscriptionInvoices = useAdminSubscriptionInvoices();

  // The "na-4" row is the one Phase 4 audit flagged as a disconnected
  // static fact — it's now replaced with a real subscription/invoice-
  // derived item (see subscriptionReport.ts). Every other row here is
  // still explicit demo presentation data; see the Phase 5 report for why
  // they were intentionally left as-is.
  const items = useMemo(() => {
    const merchantNameById = new Map(merchants.map((merchant) => [merchant.id, merchant.businessName]));
    const attention = findSubscriptionAttentionItem(subscriptions, subscriptionInvoices, merchantNameById);

    return needsAttentionItems.map((item) => {
      if (item.id !== "na-4" || !attention) return item;
      return { ...item, title: attention.title, context: attention.context, severity: attention.severity, badgeLabel: attention.badgeLabel };
    });
  }, [merchants, subscriptions, subscriptionInvoices]);

  return (
    <ChartCard
      title="Needs Attention"
      contentClassName="overflow-y-auto"
    >
      <ul className="flex flex-col">
        {items.map((item, index) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;

          return (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full min-w-0 items-center gap-3 rounded-md px-1.5 py-2.5 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${config.iconClass}`}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-text-primary">
                    {item.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-text-muted">{item.context}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge tone={config.badgeTone}>{item.badgeLabel}</StatusBadge>
                  <span className="text-[11px] text-text-muted">{item.timestamp}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-text-muted" />
              </button>
              {index < items.length - 1 && (
                <div className="mx-1.5 border-t border-border" />
              )}
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
