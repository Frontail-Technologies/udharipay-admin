import type { CanonicalReportMetricsItem } from "@/api/generated/contracts/reports";
import { formatReportValue } from "@/features/reports/utils/report-values";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";

export function ReportMetricsGrid({ metrics }: { metrics: CanonicalReportMetricsItem[] }) {
  if (!metrics.length) return null;
  return <EntitySummaryGrid items={metrics.map((metric) => ({ label: metric.label, value: formatReportValue(metric.value, metric.type) }))} />;
}
