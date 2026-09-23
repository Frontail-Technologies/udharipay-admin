export function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatIndiaDateFromTimestamp(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export function indiaDateInputToTimestamp(value: string) {
  return new Date(`${value}T00:00:00+05:30`).toISOString();
}

export function indiaDateTimeInputToTimestamp(value: string) {
  return new Date(`${value}:00+05:30`).toISOString();
}
