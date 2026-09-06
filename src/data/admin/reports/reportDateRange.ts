import { addDays, toIsoDate, DEMO_TODAY } from "../seededRandom";

/**
 * The canonical report date range model. Every report section that filters
 * by date reads one `ReportDateRange` computed here — no section invents
 * its own day math. Ranges are always computed against the fixed
 * `DEMO_TODAY` reference date, never `Date.now()`, for the same
 * SSR/CSR-determinism reason every other date computation in this app
 * follows that rule.
 */
export type ReportDateRangePreset = "7d" | "30d" | "90d" | "this_month" | "previous_month";

export type ReportDateRange = {
  preset: ReportDateRangePreset;
  /** Inclusive, ISO yyyy-mm-dd. */
  start: string;
  /** Inclusive, ISO yyyy-mm-dd. */
  end: string;
  label: string;
};

export const REPORT_DATE_RANGE_PRESETS: { value: ReportDateRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "previous_month", label: "Previous Month" },
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getReportDateRange(
  preset: ReportDateRangePreset,
  referenceDate: Date = DEMO_TODAY,
): ReportDateRange {
  switch (preset) {
    case "7d":
      return {
        preset,
        start: toIsoDate(addDays(referenceDate, -6)),
        end: toIsoDate(referenceDate),
        label: "Last 7 Days",
      };
    case "30d":
      return {
        preset,
        start: toIsoDate(addDays(referenceDate, -29)),
        end: toIsoDate(referenceDate),
        label: "Last 30 Days",
      };
    case "90d":
      return {
        preset,
        start: toIsoDate(addDays(referenceDate, -89)),
        end: toIsoDate(referenceDate),
        label: "Last 90 Days",
      };
    case "this_month":
      return {
        preset,
        start: toIsoDate(startOfMonth(referenceDate)),
        end: toIsoDate(referenceDate),
        label: "This Month",
      };
    case "previous_month": {
      const previousMonthAnchor = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
      return {
        preset,
        start: toIsoDate(startOfMonth(previousMonthAnchor)),
        end: toIsoDate(endOfMonth(previousMonthAnchor)),
        label: "Previous Month",
      };
    }
  }
}

export function isIsoDateInRange(dateIso: string, range: ReportDateRange): boolean {
  return dateIso >= range.start && dateIso <= range.end;
}

export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T00:00:00`).getTime();
  const to = new Date(`${toIso}T00:00:00`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}
