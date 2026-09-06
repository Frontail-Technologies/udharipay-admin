"use client";

import { useMemo } from "react";
import {
  useAdminMerchants,
  useAdminCustomers,
  useAdminEmployees,
  useAdminMandates,
  useAdminSubscriptions,
} from "@/hooks/useAdminEntities";
import type { EventEntityType } from "@/data/admin/events/types";

export type ResolvedEventEntity = {
  label: string;
  href: string | null;
  actionLabel: string;
};

/**
 * Resolves an event's entityType/entityId to a display name and a real
 * link through canonical relationships — never a name stored on the event
 * itself, so a merchant/customer rename shows up immediately. For a
 * Mandate or Subscription (which aren't people/businesses on their own),
 * the "Entity" shown is the underlying customer/merchant — matching the
 * worked example in the brief (a "Mandate" category event's Entity column
 * shows the customer's name, not the mandate id).
 */
export function useEventEntityResolver() {
  const merchants = useAdminMerchants();
  const customers = useAdminCustomers();
  const employees = useAdminEmployees();
  const mandates = useAdminMandates();
  const subscriptions = useAdminSubscriptions();

  return useMemo(() => {
    const merchantById = new Map(merchants.map((m) => [m.id, m]));
    const customerById = new Map(customers.map((c) => [c.id, c]));
    const employeeById = new Map(employees.map((e) => [e.id, e]));
    const mandateById = new Map(mandates.map((m) => [m.id, m]));
    const subscriptionById = new Map(subscriptions.map((s) => [s.id, s]));

    return (entityType: EventEntityType, entityId: string): ResolvedEventEntity => {
      switch (entityType) {
        case "merchant": {
          const merchant = merchantById.get(entityId);
          return {
            label: merchant?.businessName ?? entityId,
            href: merchant ? `/merchants/${entityId}` : null,
            actionLabel: "View Merchant",
          };
        }
        case "customer": {
          const customer = customerById.get(entityId);
          return {
            label: customer?.name ?? entityId,
            href: customer ? `/customers/${entityId}` : null,
            actionLabel: "View Customer",
          };
        }
        case "employee": {
          const employee = employeeById.get(entityId);
          return {
            label: employee?.name ?? entityId,
            href: employee ? `/employees/${entityId}` : null,
            actionLabel: "View Employee",
          };
        }
        case "mandate": {
          const mandate = mandateById.get(entityId);
          const customer = mandate ? customerById.get(mandate.customerId) : undefined;
          return {
            label: customer?.name ?? entityId,
            href: mandate ? `/mandates/${entityId}` : null,
            actionLabel: "View Mandate",
          };
        }
        case "subscription": {
          const subscription = subscriptionById.get(entityId);
          const merchant = subscription ? merchantById.get(subscription.merchantId) : undefined;
          return {
            label: merchant?.businessName ?? entityId,
            href: subscription ? `/subscriptions/${entityId}` : null,
            actionLabel: "View Subscription",
          };
        }
        case "plan":
        case "kyc_review":
        case "installment":
        case "payment":
          return { label: entityId, href: null, actionLabel: "" };
      }
    };
  }, [merchants, customers, employees, mandates, subscriptions]);
}
