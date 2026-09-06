"use client";

import { EntityTabs } from "@/components/entity/EntityTabs";
import { EventsSummary } from "@/components/events/EventsSummary";
import { EventsTable } from "@/components/events/EventsTable";
import { AuditTable } from "@/components/events/AuditTable";

const TABS = [
  { value: "operational", label: "Operational Events" },
  { value: "audit", label: "Audit Log" },
];

/**
 * Part A — Operational Events (something happened in the product/domain)
 * and the Audit Log (who changed what, administratively) are kept
 * conceptually and visually separate as two tabs on one page, rather than
 * a second sidebar item (Part C).
 */
export function EventsView() {
  return (
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-semibold tracking-tight text-text-primary">Events</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">Monitor important platform and operational activity.</p>
      </div>

      <EventsSummary />

      <EntityTabs
        tabs={TABS}
        defaultValue="operational"
        panels={{
          operational: <EventsTable />,
          audit: <AuditTable />,
        }}
      />
    </div>
  );
}
