import type { MandateOperationalStatus, MandateStatus } from "./types";

/**
 * The ONE place a canonical Mandate's rich status maps down to the
 * simpler legacy `Customer.mandateStatus` vocabulary — used only so
 * surfaces that still display the compact 4-value badge (e.g. a dense
 * table column) stay consistent with the canonical Mandate rather than
 * reading their own independently-set value. `useAdminCustomers()` is the
 * only place that applies this mapping; nowhere else should re-derive it.
 */
export function mandateOperationalStatusToLegacy(status: MandateOperationalStatus): MandateStatus {
  switch (status) {
    case "active":
    case "paused":
      return "active";
    case "pending_authorization":
      return "pending";
    case "failed":
    case "revoked":
    case "expired":
      return "failed";
  }
}
