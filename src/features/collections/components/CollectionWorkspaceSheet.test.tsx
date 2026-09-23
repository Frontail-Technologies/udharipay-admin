import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CollectionWorkspaceSheet } from "./CollectionWorkspaceSheet";
import { collectionItem } from "@/test/fixtures/collections";

vi.mock("./FollowUpHistory", () => ({ FollowUpHistory: () => <div>Real follow-up history</div> }));
vi.mock("./AddFollowUpDialog", () => ({ AddFollowUpDialog: () => <button>Add Follow-up</button> }));

describe("CollectionWorkspaceSheet", () => {
  it("keeps contractual due date and promise-to-pay date separate", () => {
    render(<CollectionWorkspaceSheet item={collectionItem} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Original Due Date")).toBeInTheDocument();
    expect(screen.getByText(/27 Aug 2026/)).toBeInTheDocument();
    expect(screen.getByText("Promise-to-pay Date")).toBeInTheDocument();
    expect(screen.getByText(/31 Aug 2026/)).toBeInTheDocument();
    expect(screen.queryByText("Repeated no answer")).not.toBeInTheDocument();
    expect(screen.getByText("Autopay attempt failed")).toBeInTheDocument();
    expect(screen.queryByText(/new due date|payment failed/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark paid|change due|retry autopay/i })).not.toBeInTheDocument();
  });
});
