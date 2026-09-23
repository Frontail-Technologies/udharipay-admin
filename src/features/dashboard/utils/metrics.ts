import type { CanonicalReportMetricsItem } from "@/api/generated/contracts/reports";

export function findMetric(metrics: CanonicalReportMetricsItem[] | undefined, key: string) {
  return metrics?.find((metric) => metric.key === key);
}
