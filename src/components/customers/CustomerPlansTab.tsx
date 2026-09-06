import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { DerivedPlan } from "@/data/admin";
import { planStatusTone } from "@/data/admin/statusTones";
import { formatCompactInr, formatDate, humanizeSnakeCase } from "@/lib/format";

export function CustomerPlansTab({ plans }: { plans: DerivedPlan[] }) {
  if (plans.length === 0) {
    return <p className="py-8 text-center text-[13px] text-text-muted">No Udhaar plans yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {plans.map((plan) => (
        <Link
          key={plan.id}
          href={`/plans/${plan.id}`}
          className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3.5 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-text-primary">{plan.id}</span>
            <StatusBadge tone={planStatusTone[plan.status]}>{humanizeSnakeCase(plan.status)}</StatusBadge>
          </div>
          <p className="truncate text-[12.5px] text-text-secondary">{plan.purchaseDescription}</p>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-2.5 text-[12.5px]">
            <span className="text-text-muted">Original</span>
            <span className="text-right tabular-nums text-text-primary">
              {formatCompactInr(plan.originalAmount)}
            </span>
            <span className="text-text-muted">Collected</span>
            <span className="text-right tabular-nums text-text-primary">
              {formatCompactInr(plan.collectedAmount)}
            </span>
            <span className="text-text-muted">Installment</span>
            <span className="text-right tabular-nums text-text-primary">
              {formatCompactInr(plan.installmentAmount)} / {plan.frequency}
            </span>
            <span className="text-text-muted">Remaining</span>
            <span className="text-right tabular-nums text-text-primary">
              {formatCompactInr(plan.remainingAmount)}
            </span>
            <span className="text-text-muted">Next Due</span>
            <span className="text-right text-text-primary">{formatDate(plan.nextDueDate)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
