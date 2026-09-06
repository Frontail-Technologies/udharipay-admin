import type { DerivedEmployee, DerivedMerchant } from "../aggregates";
import type { CollectionFollowUp, KycReview } from "../types";
import { isIsoDateInRange, type ReportDateRange } from "./reportDateRange";

/**
 * Operational workload, not HR/payroll — no "performance score" is
 * computed anywhere here, since no formula for one was ever defined.
 *
 * Known, documented limitation carried over from Merchant.assignedEmployeeName
 * (see merchants.ts / employees.ts): the Employee<->Merchant relationship
 * is still NAME-based, not a real employeeId foreign key — there is no
 * backend yet. This report deliberately reuses that exact relationship
 * (the same one Employee Detail and Collections follow-up attribution
 * already rely on) rather than inventing a second, competing one.
 */
export type EmployeeReportRow = {
  employeeId: string;
  name: string;
  assignedMerchants: number;
  customersOnboarded: number;
  activePlans: number;
  collectionsHandled: number;
  outstandingUnderAssigned: number;
  overdueUnderAssigned: number;
  followUpsLogged: number;
  kycReviewsWorkload: number;
};

export function calculateEmployeeReport(
  employees: DerivedEmployee[],
  merchants: DerivedMerchant[],
  followUps: CollectionFollowUp[],
  kycReviews: KycReview[],
  range: ReportDateRange,
): EmployeeReportRow[] {
  return employees.map((employee) => {
    const assignedMerchants = merchants.filter((merchant) => merchant.assignedEmployeeName === employee.name);
    const outstandingUnderAssigned = assignedMerchants.reduce((sum, merchant) => sum + merchant.outstanding, 0);
    const overdueUnderAssigned = assignedMerchants.reduce((sum, merchant) => sum + merchant.overdueAmount, 0);
    // Follow-ups are events, so they're scoped to the report period.
    const followUpsLogged = followUps.filter(
      (entry) => entry.employeeId === employee.id && isIsoDateInRange(entry.createdAt, range),
    ).length;
    // KYC workload is current assigned-review state, not a period event —
    // left unscoped, same treatment as "assigned merchants" below.
    const kycReviewsWorkload = kycReviews.filter((review) => review.assignedEmployeeName === employee.name).length;

    return {
      employeeId: employee.id,
      name: employee.name,
      assignedMerchants: employee.assignedMerchantCount,
      customersOnboarded: employee.customersOnboarded,
      activePlans: employee.activePlansCreated,
      collectionsHandled: employee.collectionsHandled,
      outstandingUnderAssigned,
      overdueUnderAssigned,
      followUpsLogged,
      kycReviewsWorkload,
    };
  });
}
