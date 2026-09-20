export function paiseToRupees(value: string | bigint) {
  const paise = typeof value === "bigint" ? value : BigInt(value);
  const divisor = BigInt(100);
  return `${paise / divisor}.${(paise % divisor).toString().padStart(2, "0")}`;
}

export function formatPaise(value: string | bigint, options?: Intl.NumberFormatOptions) {
  const [whole, fraction] = paiseToRupees(value).split(".");
  const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, ...options }).format(BigInt(whole));
  return fraction === "00" ? formatted : `${formatted}.${fraction}`;
}

export function rupeesToPaise(value: string) {
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("Invalid rupee amount");
  const [rupees, fraction = ""] = normalized.split(".");
  return (BigInt(rupees) * BigInt(100) + BigInt(fraction.padEnd(2, "0"))).toString();
}
