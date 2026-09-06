"use client";

import { useMemo } from "react";
import { EntitySummaryGrid } from "@/components/entity/EntitySummaryGrid";
import { useAdminKycReviews } from "@/hooks/useAdminEntities";
import { DEMO_TODAY } from "@/data/admin";

export function KycQueueSummary() {
  const reviews = useAdminKycReviews();
  const demoTodayIso = DEMO_TODAY.toISOString().slice(0, 10);

  const items = useMemo(() => {
    const pendingReview = reviews.filter((r) => r.status === "pending" || r.status === "in_review").length;
    const actionRequired = reviews.filter((r) => r.status === "resubmission_required").length;
    const approvedToday = reviews.filter(
      (r) => r.status === "approved" && r.history.some((event) => event.type === "approved" && event.at.startsWith(demoTodayIso)),
    ).length;
    const rejectedOrResubmission = reviews.filter(
      (r) => r.status === "rejected" || r.status === "resubmission_required",
    ).length;

    return [
      { label: "Pending Review", value: String(pendingReview) },
      { label: "Action Required", value: String(actionRequired), emphasis: actionRequired > 0 ? "warning" as const : "default" as const },
      { label: "Approved Today", value: String(approvedToday) },
      { label: "Rejected / Resubmission", value: String(rejectedOrResubmission), emphasis: rejectedOrResubmission > 0 ? "error" as const : "default" as const },
    ];
  }, [reviews, demoTodayIso]);

  return <EntitySummaryGrid items={items} />;
}
