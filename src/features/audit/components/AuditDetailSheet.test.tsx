import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuditEvent } from "@/api/generated/contracts/audit";
import { AuditDetailSheet } from "./AuditDetailSheet";

const base: AuditEvent = { id: "8d25b5aa-34e1-4c47-93b2-97bb946e1f71", actorUserId: "7d25b5aa-34e1-4c47-93b2-97bb946e1f72", actorRole: "admin", requestId: "req-1", action: "merchant.updated", entityType: "merchant", entityId: "6d25b5aa-34e1-4c47-93b2-97bb946e1f73", changes: { statusFrom: "draft", statusTo: "active" }, metadata: { fields: ["status"] }, createdAt: "2026-09-22T08:30:00.000Z" };

describe("AuditDetailSheet", () => {
  it("renders scalar change fields without dumping raw JSON", () => {
    render(<AuditDetailSheet event={base} onOpenChange={vi.fn()} />);
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.queryByText(/\{"statusFrom"/)).not.toBeInTheDocument();
  });

  it("renders a nested structured value as a safe placeholder, never raw JSON", () => {
    const event = { ...base, metadata: { context: { nested: { secretLooking: "value" } } } };
    render(<AuditDetailSheet event={event} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Structured value")).toBeInTheDocument();
    expect(screen.queryByText(/secretLooking/)).not.toBeInTheDocument();
  });

  it("shows a real empty state when no changes were recorded", () => {
    render(<AuditDetailSheet event={{ ...base, changes: null }} onOpenChange={vi.fn()} />);
    expect(screen.getByText("No field-level changes recorded for this action.")).toBeInTheDocument();
  });

  it("exposes no edit, delete, replay, undo or revert controls", () => {
    render(<AuditDetailSheet event={base} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /edit|delete|replay|undo|revert/i })).not.toBeInTheDocument();
  });

  it("renders nothing when no event is selected", () => {
    render(<AuditDetailSheet event={null} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
