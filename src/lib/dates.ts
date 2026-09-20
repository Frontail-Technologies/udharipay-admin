export function formatApiDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+05:30`) : new Date(value);
  return new Intl.DateTimeFormat("en-IN", options ?? { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function toDateInputValue(value: string | null | undefined) {
  return value?.slice(0, 10) ?? "";
}
