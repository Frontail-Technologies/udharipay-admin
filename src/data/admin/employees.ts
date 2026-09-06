import { addDays, toIsoDate, DEMO_TODAY } from "./seededRandom";
import type { KycStatus } from "./types";

export type EmployeeStatus = "active" | "inactive" | "suspended";

export type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  city: string;
  state: string;
  assignedArea: string;
  status: EmployeeStatus;
  kycStatus: KycStatus;
  kycLastReviewedAt: string;
  panMasked: string;
  idProofMasked: string;
  joinedAt: string;
};

/**
 * Deliberately the same name pool `merchants.ts` uses for
 * `assignedEmployeeName` — Employees are matched to merchants by name in
 * this pre-backend phase (no employee-id foreign key exists on Merchant
 * yet), so the pools must line up for the relationship to resolve.
 */
const EMPLOYEE_NAMES = ["Farhan Sheikh", "Nikita Rao", "Abhishek Tiwari", "Rohini Kulkarni"] as const;

const ROLES = ["Onboarding Associate", "Field Executive", "Collections Executive", "Onboarding Associate"] as const;

const CITY_STATE: readonly [city: string, state: string, area: string][] = [
  ["Bengaluru", "Karnataka", "Bengaluru North Zone"],
  ["Mumbai", "Maharashtra", "Mumbai West Zone"],
  ["Pune", "Maharashtra", "Pune East Zone"],
  ["Hyderabad", "Telangana", "Hyderabad Central Zone"],
];

const EMPLOYEE_STATUSES: EmployeeStatus[] = ["active", "active", "active", "inactive"];
const KYC_STATUSES: KycStatus[] = ["verified", "verified", "pending", "action_required"];

export const employees: Employee[] = EMPLOYEE_NAMES.map((name, index) => {
  const [city, state, assignedArea] = CITY_STATE[index % CITY_STATE.length];
  const kycStatus = KYC_STATUSES[index % KYC_STATUSES.length];

  return {
    id: `EMP-${1021 + index * 6}`,
    name,
    phone: `+91 97${(20000000 + index * 111827).toString().slice(0, 8)}`,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@udharipay.example`,
    role: ROLES[index % ROLES.length],
    city,
    state,
    assignedArea,
    status: EMPLOYEE_STATUSES[index % EMPLOYEE_STATUSES.length],
    kycStatus,
    kycLastReviewedAt: toIsoDate(addDays(DEMO_TODAY, -(8 + index * 11))),
    panMasked: `XXXXX${(2000 + index * 71) % 10000}X`,
    idProofMasked: `XXXX XXXX ${(3000 + index * 89) % 10000}`,
    joinedAt: toIsoDate(addDays(DEMO_TODAY, -(320 + index * 54))),
  } satisfies Employee;
});

export function getEmployeeById(employeeId: string): Employee | undefined {
  return employees.find((employee) => employee.id === employeeId);
}

export function getEmployeeByName(name: string): Employee | undefined {
  return employees.find((employee) => employee.name === name);
}
