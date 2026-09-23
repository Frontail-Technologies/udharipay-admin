export type DashboardPeriod = "7d" | "30d" | "90d";

export const dashboardPeriodOptions: { value: DashboardPeriod; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

export function periodToDateRange(period: DashboardPeriod): { dateFrom: string; dateTo: string } {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const now = new Date();
  const from = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return { dateFrom: indiaDateString(from), dateTo: indiaDateString(now) };
}

function indiaDateString(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
