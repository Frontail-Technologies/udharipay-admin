/**
 * Small generic helpers shared across the report calculators, so a "group
 * and count" breakdown (mandate method, KYC status, plan frequency, ...)
 * is written once, not reimplemented per report.
 */
export function countByKey<T, K extends string>(items: T[], keyFn: (item: T) => K): { key: K; count: number }[] {
  const counts = new Map<K, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([key, count]) => ({ key, count }));
}
