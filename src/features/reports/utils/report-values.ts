import { formatDateShort, formatPaiseInr, humanizeSnakeCase } from "@/lib/format";
import type { CanonicalReportRowsItem } from "@/api/generated/contracts/reports";

export function formatReportValue(value: CanonicalReportRowsItem[string] | undefined, type: string): string {
  if (value === null || value === undefined) return "-";
  if (type === "money" && typeof value === "string") return formatPaiseInr(value);
  if (type === "percent" && typeof value === "string") return formatBasisPointsPercent(value);
  if (type === "date" && typeof value === "string") return formatDateShort(value);
  if (type === "count" && (typeof value === "string" || typeof value === "number")) return Number(value).toLocaleString("en-IN");
  if (type === "status" && typeof value === "string") return humanizeSnakeCase(value);
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "-";
}

function formatBasisPointsPercent(value: string) {
  try {
    const basisPoints = BigInt(value);
    const hundred = BigInt(100);
    const whole = basisPoints / hundred;
    const absolute = basisPoints < BigInt(0) ? -basisPoints : basisPoints;
    const fraction = absolute % hundred;
    return `${whole}.${fraction.toString().padStart(2, "0")}%`;
  } catch {
    return value;
  }
}
