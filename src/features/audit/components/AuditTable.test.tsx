import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { AuditTable } from "./AuditTable";

const base: AuditEvent = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", actorUserId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", actorRole: "admin", requestId: "req-1", action: "merchant.updated", entityType: "merchant", entityId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", changes: { statusFrom: "draft", statusTo: "active" }, metadata: null, createdAt: "2026-09-22T08:30:00.000Z" };

describe("AuditTable", () => {
  it("links a known entity type to its real detail route", () => {
    render(<AuditTable events={[base]} onRowClick={vi.fn()} />);
    const link = screen.getByRole("link", { name: "Merchant" });
    expect(link).toHaveAttribute("href", `/merchants/${base.entityId}`);
  });

  it("degrades an unknown entity type to safe raw text instead of crashing", () => {
    const event = { ...base, entityType: "razorpay_payment_request" };
    render(<AuditTable events={[event]} onRowClick={vi.fn()} />);
    expect(screen.getByText("Razorpay Payment Request")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows System for events with no actor, without fetching a User record", () => {
    render(<AuditTable events={[{ ...base, actorUserId: null, actorRole: null }]} onRowClick={vi.fn()} />);
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders a real empty state with no demo fallback", () => {
    render(<AuditTable events={[]} onRowClick={vi.fn()} />);
    expect(screen.getByText("No audit events found for the selected filters.")).toBeInTheDocument();
  });
});
