/**
 * Real, local, client-side CSV export — no backend, no fake export.
 *
 * "Sr. No." is prepended as the first column by default, numbered 1..N in
 * the exact order `rows` was passed — the caller's already-filtered (and,
 * where applicable, already-sorted) result set, never pagination-sliced.
 * Implemented once here rather than duplicated per export call site, same
 * as the DataTable's own `showSerialNumber` — pass `includeSerialNumber:
 * false` only for a genuinely exceptional export.
 */
export function exportRowsToCsv<T>(
  filename: string,
  rows: T[],
  columns: { header: string; accessor: (row: T) => string | number }[],
  options: { includeSerialNumber?: boolean } = {},
) {
  const { includeSerialNumber = true } = options;

  const escapeCell = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const headerRow = [
    ...(includeSerialNumber ? ["Sr. No."] : []),
    ...columns.map((column) => column.header),
  ];

  const lines = [
    headerRow.map(escapeCell).join(","),
    ...rows.map((row, index) =>
      [
        ...(includeSerialNumber ? [index + 1] : []),
        ...columns.map((column) => column.accessor(row)),
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
