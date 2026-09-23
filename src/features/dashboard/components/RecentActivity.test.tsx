import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { RecentActivity } from "./RecentActivity";

const event: AuditEvent = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", actorUserId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", actorRole: "admin", requestId: "req-1", action: "merchant.updated", entityType: "merchant", entityId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", changes: null, metadata: null, createdAt: "2026-09-22T08:30:00.000Z" };

describe("RecentActivity", () => {
  it("renders bounded recent audit events with real entity navigation", () => {
    const dashboard = { activity: { isPending: false, isError: false, data: { data: { items: [event], pagination: { nextCursor: null } } } } } as never;
    render(<RecentActivity dashboard={dashboard} />);
    expect(screen.getByText("Merchant Updated")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Merchant" })).toHaveAttribute("href", `/merchants/${event.entityId}`);
  });

  it("shows a real empty state with no demo fallback", () => {
    const dashboard = { activity: { isPending: false, isError: false, data: { data: { items: [], pagination: { nextCursor: null } } } } } as never;
    render(<RecentActivity dashboard={dashboard} />);
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("shows a real error state instead of demo rows on failure", () => {
    const dashboard = { activity: { isPending: false, isError: true, error: new Error("Unavailable"), data: undefined } } as never;
    render(<RecentActivity dashboard={dashboard} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });
});
