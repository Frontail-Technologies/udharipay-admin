import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CollectionQueueItem } from "@/api/generated/contracts/collections";
import type { KycReviewSummary } from "@/api/generated/contracts/kyc";
import type { SubscriptionInvoice } from "@/api/generated/contracts/billing";
import { NeedsAttention } from "./NeedsAttention";

function query<T>(data: T) {
  return { isPending: false, isError: false, data } as never;
}
function pendingQuery() {
  return { isPending: true, isError: false, data: undefined } as never;
}
function erroredQuery(message: string) {
  return { isPending: false, isError: true, error: new Error(message), data: undefined } as never;
}

const collectionItem: CollectionQueueItem = { installmentId: "i1", planId: "p1", planPublicId: "PLN-1", customerId: "cust-1", customerPublicId: "CUS-1", customerName: "Asha Rao", customerPhone: "+911234567890", merchantId: "m1", merchantName: "Asha Stores", installmentNumber: 1, dueDate: "2026-09-01", amountPaise: "10000", paidAmountPaise: "0", outstandingAmountPaise: "10000", collectionState: "overdue", timingState: "overdue", daysOverdue: 5, latestFollowUp: null, promiseToPayDate: null, riskSignals: { missedFollowUps: 0, brokenPromises: 0 } };
const kycItem: KycReviewSummary = { id: "kyc-1", subject: { type: "merchant", id: "m1", publicId: "MER-1", name: "Asha Stores" }, status: "pending", submittedByUserId: null, assignedReviewerUserId: null, reviewedByUserId: null, submittedAt: "2026-09-20T08:30:00.000Z", reviewStartedAt: null, reviewedAt: null, decisionReason: null, createdAt: "2026-09-20T08:30:00.000Z", updatedAt: "2026-09-20T08:30:00.000Z" };
const overdueInvoice: SubscriptionInvoice = { id: "inv-1", publicId: "INV-1", subscriptionId: "sub-1", merchantId: "m1", type: "subscription", amountPaise: "349900", status: "pending", operationalStatus: "overdue", dueDate: "2026-09-01", periodStart: "2026-09-01", periodEnd: "2026-09-30", paidAt: null, createdAt: "2026-09-01T08:30:00.000Z", updatedAt: "2026-09-01T08:30:00.000Z" };
const notOverdueInvoice: SubscriptionInvoice = { ...overdueInvoice, id: "inv-2", operationalStatus: "pending" };

const baseDashboard = {
  collectionAttention: query({ data: { items: [collectionItem], pagination: { nextCursor: null } } }),
  kycAttention: query({ data: { items: [kycItem], pagination: { nextCursor: null } } }),
  billingAttention: query({ data: { items: [overdueInvoice, notOverdueInvoice], pagination: { nextCursor: null } } }),
} as never;

describe("NeedsAttention", () => {
  it("renders overdue collection, pending KYC and overdue billing items with real navigation", () => {
    render(<NeedsAttention dashboard={baseDashboard} />);
    expect(screen.getByRole("link", { name: /Asha Rao/ })).toHaveAttribute("href", "/customers/cust-1");
    expect(screen.getByRole("link", { name: /Pending Review/ })).toHaveAttribute("href", "/kyc/kyc-1");
    expect(screen.getByRole("link", { name: /INV-1/ })).toHaveAttribute("href", "/subscriptions/inv-1");
  });

  it("filters billing items to those the backend marked overdue, not just pending", () => {
    render(<NeedsAttention dashboard={baseDashboard} />);
    expect(screen.queryByText("INV-2")).not.toBeInTheDocument();
  });

  it("shows items from succeeding sources even when one attention source fails", () => {
    const dashboard = { ...baseDashboard, kycAttention: erroredQuery("KYC unavailable") } as never;
    render(<NeedsAttention dashboard={dashboard} />);
    expect(screen.getByText("KYC unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Asha Rao/ })).toBeInTheDocument();
  });

  it("shows a real empty state when nothing needs attention", () => {
    const empty = { collectionAttention: query({ data: { items: [], pagination: { nextCursor: null } } }), kycAttention: query({ data: { items: [], pagination: { nextCursor: null } } }), billingAttention: query({ data: { items: [], pagination: { nextCursor: null } } }) } as never;
    render(<NeedsAttention dashboard={empty} />);
    expect(screen.getByText("Nothing needs attention right now.")).toBeInTheDocument();
  });

  it("shows a loading state without any demo fallback", () => {
    const loading = { ...baseDashboard, collectionAttention: pendingQuery() } as never;
    render(<NeedsAttention dashboard={loading} />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
