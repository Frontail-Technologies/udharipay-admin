import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import { customers } from "./customers";
import type { Mandate, MandateOperationalStatus, MandateStatus, PlanFrequency } from "./types";

/**
 * One Mandate per customer who has ever set one up (`mandateStatus !==
 * "not_set"` in the seed) — customers who never configured one simply have
 * no Mandate record, which is more honest than inventing a placeholder.
 * The base status comes straight from the existing seeded
 * `Customer.mandateStatus` so the two never start out contradicting each
 * other; a small deterministic subset of "active" mandates is then spread
 * across paused/revoked/expired so the admin UI can demonstrate the full
 * operational vocabulary, not just 3 of 6 states.
 */
function baseStatus(customerStatus: MandateStatus): MandateOperationalStatus | null {
  switch (customerStatus) {
    case "active":
      return "active";
    case "pending":
      return "pending_authorization";
    case "failed":
      return "failed";
    case "not_set":
      return null;
  }
}

function spreadActiveStatus(index: number, status: MandateOperationalStatus): MandateOperationalStatus {
  if (status !== "active") return status;
  if (index % 11 === 0) return "expired";
  if (index % 8 === 0) return "revoked";
  if (index % 6 === 0) return "paused";
  return "active";
}

const FREQUENCIES: PlanFrequency[] = ["weekly", "monthly"];

export const mandates: Mandate[] = customers.flatMap((customer, index) => {
  const base = baseStatus(customer.mandateStatus);
  if (!base) return [];
  const status = spreadActiveStatus(index, base);

  const wasEverAuthorized = status !== "pending_authorization" && status !== "failed";
  const authorizedAt = wasEverAuthorized ? customer.mandateAuthorizedAt : null;
  const activatedAt = status === "active" || status === "paused" ? authorizedAt : null;
  const expiresAt =
    status === "expired"
      ? toIsoDate(addDays(DEMO_TODAY, -(10 + (index % 30))))
      : authorizedAt
        ? toIsoDate(addDays(new Date(`${authorizedAt}T00:00:00`), 365 * 3))
        : null;

  return [
    {
      id: `MAND-${1024 + index * 7}`,
      customerId: customer.id,
      merchantId: customer.merchantId,
      planId: null,
      provider: "Paycorp",
      method: customer.mandateMethod,
      status,
      authorizedAt,
      activatedAt,
      expiresAt,
      maxAmount: 3000 + ((index * 137) % 7000),
      frequency: FREQUENCIES[index % FREQUENCIES.length],
      providerReferenceMasked: `UMRN XXXX XXXX ${(4000 + index * 97) % 10000}`,
      createdAt: customer.joinedAt,
      updatedAt: authorizedAt ?? customer.joinedAt,
    } satisfies Mandate,
  ];
});

export function getMandateById(mandateId: string): Mandate | undefined {
  return mandates.find((mandate) => mandate.id === mandateId);
}

export function getMandateByCustomer(customerId: string): Mandate | undefined {
  return mandates.find((mandate) => mandate.customerId === customerId);
}

export function getMandatesByMerchant(merchantId: string): Mandate[] {
  return mandates.filter((mandate) => mandate.merchantId === merchantId);
}
