import type { AdminAuditChange } from "@/data/admin/events/types";

/**
 * Fields whose VALUE must never appear in an audit change record, even
 * masked — matched by field key (case-insensitive substring). Bank account
 * numbers, PAN, and identity document references are never shown, per
 * Part R.
 */
const NEVER_SHOW_KEY_PATTERN = /account|pan|ifsc|identity|idreference|secret|token/i;

/** Fields shown masked (partial) rather than in full — phone numbers, per the Part C worked example. */
const PHONE_KEY_PATTERN = /phone/i;

function maskPhoneForAudit(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `+91••••${digits.slice(-4)}`;
}

function displayValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const text = String(value);
  if (NEVER_SHOW_KEY_PATTERN.test(key)) return "••••••"; // never reveal, masked or not
  if (PHONE_KEY_PATTERN.test(key)) return maskPhoneForAudit(text);
  return text;
}

/**
 * Diffs two flat (non-nested) form-value objects sharing the same keys —
 * the exact shape every profile-edit form in this app already produces
 * (`currentValues(effective)` vs the submitted RHF `values`). Sensitive
 * fields are masked or fully withheld per Part R; never diff a field whose
 * raw value must not be displayed.
 */
export function diffFlatFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
  labels: Partial<Record<keyof T, string>>,
): AdminAuditChange[] {
  const changes: AdminAuditChange[] = [];
  for (const key of Object.keys(after) as (keyof T)[]) {
    const beforeValue = before[key];
    const afterValue = after[key];
    if (beforeValue === afterValue) continue;
    if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) continue;

    changes.push({
      field: labels[key] ?? String(key),
      from: displayValue(String(key), beforeValue),
      to: displayValue(String(key), afterValue),
    });
  }
  return changes;
}
