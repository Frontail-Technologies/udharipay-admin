import { DEMO_TODAY } from "./seededRandom";
import { merchants } from "./merchants";
import { customers, getCustomersByMerchant } from "./customers";
import { plans, getPlansByCustomer, getPlansByMerchant } from "./plans";
import { getPaymentsByPlan, getPaymentsByCustomer, getPaymentsByMerchant } from "./payments";
import type { Employee } from "./employees";
import type { Customer, UdhaarPlan, Payment, Merchant } from "./types";

export type PlanStatus = "active" | "due" | "overdue" | "completed";
export type CustomerStatus = "active" | "due" | "overdue" | "completed" | "restricted";

export type DerivedPlan = UdhaarPlan & {
  status: PlanStatus;
  collectedAmount: number;
  remainingAmount: number;
  nextDueDate: string | null;
  payments: Payment[];
};

export type DerivedCustomer = Customer & {
  status: CustomerStatus;
  outstanding: number;
  totalUdhaar: number;
  collected: number;
  overdueAmount: number;
  activePlanCount: number;
  completedPlanCount: number;
  nextDueDate: string | null;
  lastPaymentDate: string | null;
  plans: DerivedPlan[];
};

export type DerivedMerchant = Merchant & {
  customerCount: number;
  activeCustomerCount: number;
  outstanding: number;
  overdueAmount: number;
  dueToday: number;
  collectedThisMonth: number;
  collectionRate: number;
  activePlans: number;
  lastActivityDate: string | null;
};

const DEMO_MONTH_PREFIX = DEMO_TODAY.toISOString().slice(0, 7);
const DEMO_TODAY_ISO = DEMO_TODAY.toISOString().slice(0, 10);

export function derivePlan(plan: UdhaarPlan): DerivedPlan {
  const planPayments = getPaymentsByPlan(plan.id);
  const collectedAmount = planPayments
    .filter((payment) => payment.status === "collected")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const collectedCount = planPayments.filter((payment) => payment.status === "collected").length;
  const remainingAmount = Math.max(plan.originalAmount - collectedAmount, 0);
  const isCompleted = collectedCount >= plan.totalInstallments;
  const hasOverdue = planPayments.some(
    (payment) => payment.status === "overdue" || payment.status === "failed",
  );
  const dueRow = planPayments.find((payment) => payment.status === "due");

  let status: PlanStatus;
  if (isCompleted) status = "completed";
  else if (hasOverdue) status = "overdue";
  else if (dueRow) status = "due";
  else status = "active";

  const overdueRow = planPayments.find((payment) => payment.status === "overdue");
  const nextDueDate = isCompleted ? null : (dueRow ?? overdueRow)?.date ?? null;

  return { ...plan, status, collectedAmount, remainingAmount, nextDueDate, payments: planPayments };
}

export function deriveCustomer(customer: Customer): DerivedCustomer {
  const customerPlans = getPlansByCustomer(customer.id).map(derivePlan);
  const outstanding = customerPlans.reduce((sum, plan) => sum + plan.remainingAmount, 0);
  const totalUdhaar = customerPlans.reduce((sum, plan) => sum + plan.originalAmount, 0);
  const collected = customerPlans.reduce((sum, plan) => sum + plan.collectedAmount, 0);
  const overdueAmount = customerPlans
    .filter((plan) => plan.status === "overdue")
    .reduce((sum, plan) => sum + plan.remainingAmount, 0);
  const activePlanCount = customerPlans.filter((plan) => plan.status !== "completed").length;
  const completedPlanCount = customerPlans.filter((plan) => plan.status === "completed").length;

  const collectedPayments = getPaymentsByCustomer(customer.id).filter(
    (payment) => payment.status === "collected",
  );
  const lastPaymentDate =
    collectedPayments.length > 0
      ? collectedPayments.reduce((latest, payment) => (payment.date > latest ? payment.date : latest), collectedPayments[0].date)
      : null;

  const nextDueDate = customerPlans
    .map((plan) => plan.nextDueDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0] ?? null;

  let status: CustomerStatus;
  if (customer.accountFlag === "restricted") status = "restricted";
  else if (customerPlans.some((plan) => plan.status === "overdue")) status = "overdue";
  else if (customerPlans.some((plan) => plan.status === "due")) status = "due";
  else if (customerPlans.length > 0 && customerPlans.every((plan) => plan.status === "completed"))
    status = "completed";
  else status = "active";

  return {
    ...customer,
    status,
    outstanding,
    totalUdhaar,
    collected,
    overdueAmount,
    activePlanCount,
    completedPlanCount,
    nextDueDate,
    lastPaymentDate,
    plans: customerPlans,
  };
}

export function deriveMerchant(merchant: Merchant): DerivedMerchant {
  const merchantCustomers = getCustomersByMerchant(merchant.id).map(deriveCustomer);
  const outstanding = merchantCustomers.reduce((sum, customer) => sum + customer.outstanding, 0);
  const overdueAmount = merchantCustomers.reduce((sum, customer) => sum + customer.overdueAmount, 0);
  const activePlans = merchantCustomers.reduce((sum, customer) => sum + customer.activePlanCount, 0);
  const activeCustomerCount = merchantCustomers.filter((customer) => customer.status !== "completed").length;

  const merchantPayments = getPaymentsByMerchant(merchant.id);
  const collectedThisMonth = merchantPayments
    .filter((payment) => payment.status === "collected" && payment.date.startsWith(DEMO_MONTH_PREFIX))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const collectedTotal = merchantCustomers.reduce((sum, customer) => sum + customer.collected, 0);
  const collectionRate =
    collectedTotal + outstanding > 0 ? Math.round((collectedTotal / (collectedTotal + outstanding)) * 100) : 0;

  const dueToday = merchantPayments
    .filter((payment) => payment.status === "due" && payment.date === DEMO_TODAY_ISO)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const lastActivityDate =
    merchantPayments.length > 0
      ? merchantPayments.reduce((latest, payment) => (payment.date > latest ? payment.date : latest), merchantPayments[0].date)
      : merchant.joinedAt;

  return {
    ...merchant,
    customerCount: merchantCustomers.length,
    activeCustomerCount,
    outstanding,
    overdueAmount,
    dueToday,
    collectedThisMonth,
    collectionRate,
    activePlans,
    lastActivityDate,
  };
}

export const derivedMerchants: DerivedMerchant[] = merchants.map(deriveMerchant);
export const derivedCustomers: DerivedCustomer[] = customers.map(deriveCustomer);

export function getDerivedMerchant(merchantId: string): DerivedMerchant | undefined {
  return derivedMerchants.find((merchant) => merchant.id === merchantId);
}

export function getDerivedCustomer(customerId: string): DerivedCustomer | undefined {
  return derivedCustomers.find((customer) => customer.id === customerId);
}

export function getDerivedCustomersByMerchant(merchantId: string): DerivedCustomer[] {
  return derivedCustomers.filter((customer) => customer.merchantId === merchantId);
}

export function getDerivedPlansByMerchant(merchantId: string): DerivedPlan[] {
  return getPlansByMerchant(merchantId).map(derivePlan);
}

export const derivedPlans: DerivedPlan[] = plans.map(derivePlan);

export function getDerivedPlan(planId: string): DerivedPlan | undefined {
  return derivedPlans.find((plan) => plan.id === planId);
}

export function getDerivedPlansByCustomer(customerId: string): DerivedPlan[] {
  return derivedPlans.filter((plan) => plan.customerId === customerId);
}

export type DerivedEmployee = Employee & {
  assignedMerchantCount: number;
  customersOnboarded: number;
  activePlansCreated: number;
  collectionsHandled: number;
  pendingRequests: number;
  lastActivityDate: string | null;
};

/**
 * Employee metrics are NOT computed statically at module load like
 * Merchant/Customer aggregates — `assignedMerchants` must be the caller's
 * current EFFECTIVE (overlay-applied) merchant list, since which merchants
 * are assigned to an employee depends on the editable
 * `Merchant.assignedEmployeeName` field. Feeding this function a stale
 * (pre-edit) merchant list would silently break employee/merchant
 * propagation, so only `useAdminEntities.ts` calls it, with reactive data.
 */
export function deriveEmployeeFromMerchants(
  employee: Employee,
  assignedMerchants: DerivedMerchant[],
): DerivedEmployee {
  const customersOnboarded = assignedMerchants.reduce((sum, merchant) => sum + merchant.customerCount, 0);
  const activePlansCreated = assignedMerchants.reduce((sum, merchant) => sum + merchant.activePlans, 0);
  const collectionsHandled = assignedMerchants.reduce(
    (sum, merchant) =>
      sum + getPaymentsByMerchant(merchant.id).filter((payment) => payment.status === "collected").length,
    0,
  );
  const pendingRequests = assignedMerchants.filter(
    (merchant) => merchant.kycStatus === "pending" || merchant.kycStatus === "action_required",
  ).length;

  const lastActivityDate = assignedMerchants.reduce<string | null>(
    (latest, merchant) => (!latest || (merchant.lastActivityDate ?? "") > latest ? merchant.lastActivityDate : latest),
    null,
  );

  return {
    ...employee,
    assignedMerchantCount: assignedMerchants.length,
    customersOnboarded,
    activePlansCreated,
    collectionsHandled,
    pendingRequests,
    lastActivityDate: lastActivityDate ?? employee.joinedAt,
  };
}
