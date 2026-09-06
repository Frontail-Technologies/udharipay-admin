export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCompactInr(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/**
 * Deterministic display-only time-of-day derived from an id — the demo data
 * model only stores a payment date, not a real timestamp. This never gets
 * persisted or treated as real precision, it just avoids every "recent
 * activity" row showing an identical, obviously-fake time.
 */
export function pseudoTimeOfDay(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hour24 = 9 + (hash % 9); // 9 AM – 5 PM
  const minute = (hash >> 4) % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/**
 * Contextual "N days overdue" / "Today" / "Due in N days" label used by
 * both Plan Overview's Next Collection and the Collections queue's Days
 * column. Always measured against the fixed demo reference date (never
 * `Date.now()`), so this is fully deterministic — identical on server and
 * client, no hydration mismatch risk.
 */
export function formatDueContext(dueDate: string, referenceIso: string): string {
  const due = new Date(`${dueDate}T00:00:00`).getTime();
  const reference = new Date(`${referenceIso}T00:00:00`).getTime();
  const days = Math.round((due - reference) / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days > 0) return `Due in ${days} day${days === 1 ? "" : "s"}`;
  const overdueDays = Math.abs(days);
  return `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue`;
}

export function humanizeSnakeCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
