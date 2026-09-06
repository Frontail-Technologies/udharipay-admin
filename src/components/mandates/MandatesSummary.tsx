"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminMandates } from "@/hooks/useAdminEntities";
import { DEMO_TODAY } from "@/data/admin/seededRandom";

const EXPIRY_WINDOW_DAYS = 14;

export function MandatesSummary() {
  const mandates = useAdminMandates();

  const items = useMemo(() => {
    const active = mandates.filter((m) => m.status === "active").length;
    const pending = mandates.filter((m) => m.status === "pending_authorization").length;
    const needsAction = mandates.filter((m) => m.status === "failed" || m.status === "revoked").length;

    const windowEnd = new Date(DEMO_TODAY);
    windowEnd.setDate(windowEnd.getDate() + EXPIRY_WINDOW_DAYS);
    const expiringSoon = mandates.filter((m) => {
      if (!m.expiresAt || m.status !== "active") return false;
      const expiry = new Date(m.expiresAt);
      return expiry >= DEMO_TODAY && expiry <= windowEnd;
    }).length;

    const resolvable = mandates.filter((m) => m.status !== "pending_authorization").length;
    const successRate =
      resolvable > 0 ? Math.round(((active + mandates.filter((m) => m.status === "paused").length) / resolvable) * 100) : 0;

    return [
      { label: "Active Mandates", value: String(active) },
      { label: "Pending Authorization", value: String(pending) },
      {
        label: "Needs Action",
        value: String(needsAction),
        emphasis: needsAction > 0 ? ("error" as const) : ("default" as const),
      },
      { label: "Expiring Soon", value: String(expiringSoon) },
      { label: "Authorization Success", value: `${successRate}%` },
    ];
  }, [mandates]);

  return <EntitySummaryGrid items={items} />;
}
