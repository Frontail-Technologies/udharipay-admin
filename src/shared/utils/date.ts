export function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
