export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function filenameFromDisposition(value: string | null | undefined, fallback: string) {
  const match = value?.match(/filename\*?=(?:UTF-8''|\")?([^";]+)/i);
  return match?.[1] ? decodeURIComponent(match[1].replace(/"$/, "")) : fallback;
}
