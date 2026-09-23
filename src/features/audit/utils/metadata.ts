export type AuditEntityRoute = { label: string; href: (entityId: string) => string };

export const auditEntityRoutes: Record<string, AuditEntityRoute> = {
  merchant: { label: "Merchant", href: (id) => `/merchants/${id}` },
  customer: { label: "Customer", href: (id) => `/customers/${id}` },
  employee: { label: "Employee", href: (id) => `/employees/${id}` },
  mandate: { label: "Mandate", href: (id) => `/mandates/${id}` },
  payment: { label: "Payment", href: (id) => `/payments/${id}` },
  plan: { label: "Plan", href: (id) => `/plans/${id}` },
  kyc_review: { label: "KYC Review", href: (id) => `/kyc/${id}` },
  subscription_invoice: { label: "Invoice", href: (id) => `/subscriptions/${id}` },
};

export function humanizeAuditToken(value: string): string {
  return value
    .split(/[._]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
