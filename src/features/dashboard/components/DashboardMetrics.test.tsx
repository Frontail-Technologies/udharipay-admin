import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CanonicalReportMetricsItem } from "@/api/generated/contracts/reports";
import { DashboardPrimaryMetrics, DashboardSecondaryMetrics } from "./DashboardMetrics";

function reportQuery(metrics: CanonicalReportMetricsItem[]) {
  return { isPending: false, isError: false, data: { data: { metrics } } } as never;
}

function pendingQuery() {
  return { isPending: true, isError: false, data: undefined } as never;
}

function erroredQuery(message: string) {
  return { isPending: false, isError: true, error: new Error(message), data: undefined } as never;
}

const baseDashboard = {
  merchantsReport: reportQuery([{ key: "activeCount", label: "Active", value: "12", type: "count" }]),
  customersReport: reportQuery([{ key: "activeCount", label: "Active", value: "40", type: "count" }]),
  collectionsReport: reportQuery([
    { key: "outstandingPaise", label: "Outstanding", value: "500000", type: "money" },
    { key: "collectedPaise", label: "Collected", value: "300000", type: "money" },
    { key: "dueTodayPaise", label: "Due Today", value: "10000", type: "money" },
    { key: "overduePaise", label: "Overdue", value: "20000", type: "money" },
  ]),
  mandatesReport: reportQuery([{ key: "failedCount", label: "Failed or Closed", value: "3", type: "count" }]),
};

describe("DashboardPrimaryMetrics", () => {
  it("renders the canonical report metric value, not a page-derived total", () => {
    render(<DashboardPrimaryMetrics dashboard={baseDashboard as never} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("₹5,000")).toBeInTheDocument();
    expect(screen.getByText("₹3,000")).toBeInTheDocument();
  });

  it("shows an independent skeleton for a still-loading source without blanking other cards", () => {
    const dashboard = { ...baseDashboard, merchantsReport: pendingQuery() };
    render(<DashboardPrimaryMetrics dashboard={dashboard as never} />);
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("shows an inline error for one failed source without blanking other cards", () => {
    const dashboard = { ...baseDashboard, merchantsReport: erroredQuery("Unavailable") };
    render(<DashboardPrimaryMetrics dashboard={dashboard as never} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });
});

describe("DashboardSecondaryMetrics", () => {
  it("renders Due Today, Overdue and Mandate metrics from their canonical reports", () => {
    render(<DashboardSecondaryMetrics dashboard={baseDashboard as never} />);
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
