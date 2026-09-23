import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollectionQueueTable } from "./CollectionQueueTable";
import { collectionItem } from "@/test/fixtures/collections";

describe("CollectionQueueTable", () => {
  it("renders backend timing, money, and risk signals without financial mutation actions", () => {
    render(<CollectionQueueTable rows={[collectionItem]} isLoading={false} onSelect={vi.fn()} />);
    expect(screen.getByText("Rahul Verma")).toBeInTheDocument();
    expect(screen.getByText("3 days overdue")).toBeInTheDocument();
    expect(screen.getByText("₹8,000")).toBeInTheDocument();
    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(screen.getByText("Autopay attempt failed")).toBeInTheDocument();
    expect(screen.queryByText(/payment failed/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark paid|collect|retry|reschedule|waive|settle/i })).not.toBeInTheDocument();
  });
});
