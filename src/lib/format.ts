export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCompactInr(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatPaiseInr(amountPaise: string): string {
  const paise = BigInt(amountPaise);
  const rupees = paise / BigInt(100);
  const remainder = paise % BigInt(100);
  const fraction = remainder === BigInt(0) ? "" : `.${remainder.toString().padStart(2, "0")}`;
  return `₹${rupees.toLocaleString("en-IN")}${fraction}`;
}

export function rupeesToPaise(value: string): string | null {
  const normalized = value.trim().replace(/,/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) return null;
  const rupees = BigInt(match[1]);
  const paise = BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  return (rupees * BigInt(100) + paise).toString();
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

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function humanizeSnakeCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
