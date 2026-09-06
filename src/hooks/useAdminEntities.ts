"use client";

import { useMemo } from "react";
import {
  derivedMerchants,
  derivedCustomers,
  derivedPlans,
  payments,
  installments,
  collectionFollowUps,
  employees,
  kycReviews,
  mandates,
  mandateAttempts,
  getMandateByCustomer,
  mandateOperationalStatusToLegacy,
  subscriptions,
  subscriptionInvoices,
  getSubscriptionByMerchant,
  subscriptionOperationalStatusToLegacy,
  deriveEmployeeFromMerchants,
  reviewStatusToEntityKyc,
  type DerivedMerchant,
  type DerivedCustomer,
  type DerivedPlan,
  type DerivedEmployee,
  type Merchant,
  type Customer,
  type Employee,
  type Payment,
  type Installment,
  type CollectionFollowUp,
  type KycReview,
  type KycHistoryEvent,
  type KycReviewNote,
  type Mandate,
  type MandateAttempt,
  type MerchantSubscription,
  type SubscriptionInvoice,
} from "@/data/admin";
import { useMerchantOverlays, useCustomerOverlays, useEmployeeOverlays } from "@/store/adminDemoStore";
import { useKycReviewOverlays } from "@/store/adminKycStore";
import { useCollectionFollowUpOverlay } from "@/store/adminCollectionsStore";

/**
 * Canonical effective-entity read layer.
 *
 * Every screen that displays a Merchant, Customer or Employee — list
 * tables, detail headers, cross-entity relationship blocks, everything —
 * must go through one of these hooks rather than reading
 * `derivedMerchants`/`getDerivedMerchant`/etc. directly. That's what makes
 * an edit in one place (e.g. renaming a merchant) show up everywhere else
 * immediately, with no refresh: seed data (+ plan/payment-derived
 * aggregates, which are never edited) + the profile-patch overlay + any
 * KYC-review-derived status override, merged in exactly one place.
 */

function applyMerchantProfileOverlay(base: DerivedMerchant, patch: Partial<Merchant> | undefined): DerivedMerchant {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    address: patch.address ? { ...base.address, ...patch.address } : base.address,
    bank: patch.bank ? { ...base.bank, ...patch.bank } : base.bank,
  };
}

function applyCustomerProfileOverlay(base: DerivedCustomer, patch: Partial<Customer> | undefined): DerivedCustomer {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    address: patch.address ? { ...base.address, ...patch.address } : base.address,
  };
}

function applyEmployeeProfileOverlay(base: Employee, patch: Partial<Employee> | undefined): Employee {
  if (!patch) return base;
  return { ...base, ...patch };
}

function applyReviewOverlay(
  base: KycReview,
  patch:
    | { status?: KycReview["status"]; reviewerName?: string | null; additionalNotes: KycReviewNote[]; additionalHistory: KycHistoryEvent[] }
    | undefined,
): KycReview {
  if (!patch) return base;
  return {
    ...base,
    status: patch.status ?? base.status,
    reviewerName: patch.reviewerName !== undefined ? patch.reviewerName : base.reviewerName,
    notes: [...base.notes, ...patch.additionalNotes],
    history: [...base.history, ...patch.additionalHistory],
  };
}

/** All KYC reviews with workflow-store patches applied — the source every entity KYC status reads from. */
export function useAdminKycReviews(): KycReview[] {
  const overlays = useKycReviewOverlays();
  return useMemo(
    () => kycReviews.map((review) => applyReviewOverlay(review, overlays[review.id])),
    [overlays],
  );
}

export function useAdminKycReview(reviewId: string | undefined): KycReview | undefined {
  const reviews = useAdminKycReviews();
  return useMemo(() => reviews.find((review) => review.id === reviewId), [reviews, reviewId]);
}

export function useAdminKycReviewForEntity(
  entityType: KycReview["entityType"],
  entityId: string | undefined,
): KycReview | undefined {
  const reviews = useAdminKycReviews();
  return useMemo(
    () => reviews.find((review) => review.entityType === entityType && review.entityId === entityId),
    [reviews, entityType, entityId],
  );
}

export function useAdminMerchants(): DerivedMerchant[] {
  const overlays = useMerchantOverlays();
  const reviews = useAdminKycReviews();
  return useMemo(() => {
    const reviewByMerchant = new Map(
      reviews.filter((review) => review.entityType === "merchant").map((review) => [review.entityId, review]),
    );
    return derivedMerchants.map((merchant) => {
      let effective = applyMerchantProfileOverlay(merchant, overlays[merchant.id]);
      const review = reviewByMerchant.get(merchant.id);
      if (review) effective = { ...effective, kycStatus: reviewStatusToEntityKyc(review.status) };

      // Canonical Subscription is the source of truth for these fields —
      // Merchant's own copies exist only for backward-compatible display
      // and are always overridden to mirror the linked Subscription.
      const subscription = getSubscriptionByMerchant(merchant.id);
      if (subscription) {
        effective = {
          ...effective,
          subscriptionStatus: subscriptionOperationalStatusToLegacy(subscription.status),
          subscriptionPlan: subscription.planName,
          activationFeeStatus: subscription.activationFeeStatus,
          autoPayStatus: subscription.autopayStatus,
          nextDebitDate: subscription.nextBillingDate,
        };
      }
      return effective;
    });
  }, [overlays, reviews]);
}

export function useAdminMerchant(merchantId: string | undefined): DerivedMerchant | undefined {
  const allMerchants = useAdminMerchants();
  return useMemo(() => allMerchants.find((merchant) => merchant.id === merchantId), [allMerchants, merchantId]);
}

export function useAdminCustomers(): DerivedCustomer[] {
  const overlays = useCustomerOverlays();
  const reviews = useAdminKycReviews();
  return useMemo(() => {
    const reviewByCustomer = new Map(
      reviews.filter((review) => review.entityType === "customer").map((review) => [review.entityId, review]),
    );
    return derivedCustomers.map((customer) => {
      let effective = applyCustomerProfileOverlay(customer, overlays[customer.id]);
      const review = reviewByCustomer.get(customer.id);
      if (review) effective = { ...effective, verificationStatus: reviewStatusToEntityKyc(review.status) };

      // Canonical Mandate is the source of truth for these fields —
      // Customer's own copies exist only for backward-compatible display
      // (dense table columns, etc.) and are always overridden to mirror
      // the linked Mandate. A customer with no Mandate record keeps
      // "not_set", which is itself accurate — nothing was ever set up.
      const mandate = getMandateByCustomer(customer.id);
      if (mandate) {
        effective = {
          ...effective,
          mandateStatus: mandateOperationalStatusToLegacy(mandate.status),
          mandateMethod: mandate.method,
          mandateAuthorizedAt: mandate.authorizedAt,
        };
      }
      return effective;
    });
  }, [overlays, reviews]);
}

export function useAdminCustomer(customerId: string | undefined): DerivedCustomer | undefined {
  const allCustomers = useAdminCustomers();
  return useMemo(() => allCustomers.find((customer) => customer.id === customerId), [allCustomers, customerId]);
}

export function useAdminCustomersByMerchant(merchantId: string | undefined): DerivedCustomer[] {
  const allCustomers = useAdminCustomers();
  return useMemo(
    () => (merchantId ? allCustomers.filter((customer) => customer.merchantId === merchantId) : allCustomers),
    [allCustomers, merchantId],
  );
}

export function useAdminEmployees(): DerivedEmployee[] {
  const overlays = useEmployeeOverlays();
  const reviews = useAdminKycReviews();
  const allMerchants = useAdminMerchants();
  return useMemo(() => {
    const reviewByEmployee = new Map(
      reviews.filter((review) => review.entityType === "employee").map((review) => [review.entityId, review]),
    );
    return employees.map((employee) => {
      let effective = applyEmployeeProfileOverlay(employee, overlays[employee.id]);
      const review = reviewByEmployee.get(employee.id);
      if (review) effective = { ...effective, kycStatus: reviewStatusToEntityKyc(review.status) };
      const assignedMerchants = allMerchants.filter((merchant) => merchant.assignedEmployeeName === effective.name);
      return deriveEmployeeFromMerchants(effective, assignedMerchants);
    });
  }, [overlays, reviews, allMerchants]);
}

export function useAdminEmployee(employeeId: string | undefined): DerivedEmployee | undefined {
  const allEmployees = useAdminEmployees();
  return useMemo(() => allEmployees.find((employee) => employee.id === employeeId), [allEmployees, employeeId]);
}

/**
 * Plans and Payments are immutable this phase (no plan-editing workflow
 * exists yet — see Part N), so these hooks don't merge any overlay; they
 * exist purely so no screen ever imports the static `derivedPlans`/
 * `payments` arrays directly. Adding real reactivity later (a Pause/Cancel
 * workflow, say) only means changing these functions, not every consumer.
 */
export function useAdminPlans(): DerivedPlan[] {
  return derivedPlans;
}

export function useAdminPlan(planId: string | undefined): DerivedPlan | undefined {
  return useMemo(() => derivedPlans.find((plan) => plan.id === planId), [planId]);
}

export function useAdminPlansByCustomer(customerId: string | undefined): DerivedPlan[] {
  return useMemo(
    () => (customerId ? derivedPlans.filter((plan) => plan.customerId === customerId) : derivedPlans),
    [customerId],
  );
}

export function useAdminPlansByMerchant(merchantId: string | undefined): DerivedPlan[] {
  return useMemo(
    () => (merchantId ? derivedPlans.filter((plan) => plan.merchantId === merchantId) : derivedPlans),
    [merchantId],
  );
}

export function useAdminPayments(): Payment[] {
  return payments;
}

export function useAdminPaymentsByPlan(planId: string | undefined): Payment[] {
  return useMemo(() => (planId ? payments.filter((payment) => payment.planId === planId) : payments), [planId]);
}

export function useAdminPaymentsByCustomer(customerId: string | undefined): Payment[] {
  return useMemo(
    () => (customerId ? payments.filter((payment) => payment.customerId === customerId) : payments),
    [customerId],
  );
}

export function useAdminInstallments(): Installment[] {
  return installments;
}

export function useAdminInstallmentsByPlan(planId: string | undefined): Installment[] {
  return useMemo(
    () => (planId ? installments.filter((installment) => installment.planId === planId) : installments),
    [planId],
  );
}

export function useAdminInstallmentsByCustomer(customerId: string | undefined): Installment[] {
  return useMemo(
    () =>
      customerId ? installments.filter((installment) => installment.customerId === customerId) : installments,
    [customerId],
  );
}

export function useAdminInstallmentsByMerchant(merchantId: string | undefined): Installment[] {
  return useMemo(
    () =>
      merchantId ? installments.filter((installment) => installment.merchantId === merchantId) : installments,
    [merchantId],
  );
}

/** Seed follow-ups + anything added this session via adminCollectionsStore. */
export function useAdminCollectionFollowUps(): CollectionFollowUp[] {
  const liveEntries = useCollectionFollowUpOverlay();
  return useMemo(() => [...collectionFollowUps, ...liveEntries], [liveEntries]);
}

export function useAdminFollowUpsByPlan(planId: string | undefined): CollectionFollowUp[] {
  const all = useAdminCollectionFollowUps();
  return useMemo(() => (planId ? all.filter((entry) => entry.planId === planId) : all), [all, planId]);
}

export function useAdminFollowUpsByCustomer(customerId: string | undefined): CollectionFollowUp[] {
  const all = useAdminCollectionFollowUps();
  return useMemo(() => (customerId ? all.filter((entry) => entry.customerId === customerId) : all), [all, customerId]);
}

/**
 * Mandates, mandate attempts, subscriptions and subscription invoices are
 * all read-only this phase (no admin action changes any of them — Part I
 * is explicit that this stays monitoring-only), so like Plans/Payments
 * these hooks carry no overlay. They still exist as hooks, not static
 * re-exports, so no screen ever imports the underlying arrays directly.
 */
export function useAdminMandates(): Mandate[] {
  return mandates;
}

export function useAdminMandate(mandateId: string | undefined): Mandate | undefined {
  return useMemo(() => mandates.find((mandate) => mandate.id === mandateId), [mandateId]);
}

export function useAdminMandatesByCustomer(customerId: string | undefined): Mandate[] {
  return useMemo(
    () => (customerId ? mandates.filter((mandate) => mandate.customerId === customerId) : mandates),
    [customerId],
  );
}

/** Convenience singular — this demo's mandate model is customer-level, at most one per customer. */
export function useAdminMandateByCustomer(customerId: string | undefined): Mandate | undefined {
  return useMemo(() => mandates.find((mandate) => mandate.customerId === customerId), [customerId]);
}

export function useAdminMandatesByMerchant(merchantId: string | undefined): Mandate[] {
  return useMemo(
    () => (merchantId ? mandates.filter((mandate) => mandate.merchantId === merchantId) : mandates),
    [merchantId],
  );
}

export function useAdminMandateAttemptsByMandate(mandateId: string | undefined): MandateAttempt[] {
  return useMemo(
    () => (mandateId ? mandateAttempts.filter((attempt) => attempt.mandateId === mandateId) : mandateAttempts),
    [mandateId],
  );
}

export function useAdminSubscriptions(): MerchantSubscription[] {
  return subscriptions;
}

export function useAdminSubscription(subscriptionId: string | undefined): MerchantSubscription | undefined {
  return useMemo(() => subscriptions.find((subscription) => subscription.id === subscriptionId), [subscriptionId]);
}

export function useAdminSubscriptionByMerchant(merchantId: string | undefined): MerchantSubscription | undefined {
  return useMemo(
    () => subscriptions.find((subscription) => subscription.merchantId === merchantId),
    [merchantId],
  );
}

export function useAdminSubscriptionInvoices(): SubscriptionInvoice[] {
  return subscriptionInvoices;
}

export function useAdminSubscriptionInvoicesBySubscription(subscriptionId: string | undefined): SubscriptionInvoice[] {
  return useMemo(
    () =>
      subscriptionId
        ? subscriptionInvoices.filter((invoice) => invoice.subscriptionId === subscriptionId)
        : subscriptionInvoices,
    [subscriptionId],
  );
}
