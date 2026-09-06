"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminOperationalEvents } from "@/hooks/useAdminEvents";
import { DEMO_TODAY } from "@/data/admin";

const TODAY_ISO = DEMO_TODAY.toISOString().slice(0, 10);

/**
 * Only derives what the current deterministic demo data actually
 * supports — no fake monitoring-service numbers. "Events Today" will
 * legitimately be small (most events fall on their real historical demo
 * date, not today), which is the honest result, not a bug.
 */
export function EventsSummary() {
  const events = useAdminOperationalEvents();

  const items = useMemo(() => {
    const eventsToday = events.filter((event) => event.occurredAt === TODAY_ISO).length;
    const needsAttention = events.filter((event) => event.status === "open").length;
    const paymentCollectionIssues = events.filter(
      (event) => (event.category === "payment" || event.category === "collection") && event.status === "open",
    ).length;
    const mandateIssues = events.filter((event) => event.category === "mandate" && event.status === "open").length;
    const kycActivity = events.filter((event) => event.category === "kyc").length;

    return [
      { label: "Events Today", value: String(eventsToday) },
      {
        label: "Needs Attention",
        value: String(needsAttention),
        emphasis: needsAttention > 0 ? ("warning" as const) : ("default" as const),
      },
      {
        label: "Payment / Collection Issues",
        value: String(paymentCollectionIssues),
        emphasis: paymentCollectionIssues > 0 ? ("error" as const) : ("default" as const),
      },
      { label: "Mandate Issues", value: String(mandateIssues) },
      { label: "KYC Activity", value: String(kycActivity) },
    ];
  }, [events]);

  return <EntitySummaryGrid items={items} />;
}
