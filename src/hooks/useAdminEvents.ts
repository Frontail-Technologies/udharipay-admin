"use client";

import { useMemo } from "react";
import { buildOperationalEvents } from "@/data/admin/events/operationalEvents";
import type { AdminOperationalEvent } from "@/data/admin/events/types";
import {
  useAdminPayments,
  useAdminInstallments,
  useAdminMandates,
  useAdminMandateAttemptsByMandate,
  useAdminSubscriptionInvoices,
  useAdminKycReviews,
  useAdminCollectionFollowUps,
} from "@/hooks/useAdminEntities";
import { useAdminSettings } from "@/store/adminSettingsStore";

/**
 * Wires the pure `buildOperationalEvents()` derivation to the canonical
 * EFFECTIVE data hooks — including `useAdminKycReviews()`, so a KYC
 * decision made live this session (approve/reject/resubmission) appears as
 * a new operational event immediately, the same propagation guarantee
 * every other canonical hook gives.
 */
export function useAdminOperationalEvents(): AdminOperationalEvent[] {
  const payments = useAdminPayments();
  const installments = useAdminInstallments();
  const mandates = useAdminMandates();
  const mandateAttempts = useAdminMandateAttemptsByMandate(undefined);
  const subscriptionInvoices = useAdminSubscriptionInvoices();
  const kycReviews = useAdminKycReviews();
  const followUps = useAdminCollectionFollowUps();
  const atRiskOverdueDays = useAdminSettings().collections.atRiskOverdueDays;

  return useMemo(
    () =>
      buildOperationalEvents({
        payments,
        installments,
        mandates,
        mandateAttempts,
        subscriptionInvoices,
        kycReviews,
        followUps,
        atRiskOverdueDays,
      }),
    [payments, installments, mandates, mandateAttempts, subscriptionInvoices, kycReviews, followUps, atRiskOverdueDays],
  );
}
