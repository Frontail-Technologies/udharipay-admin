/**
 * Deterministic PRNG (mulberry32) — demo data is generated once at module
 * load with a fixed seed so it's identical on every server/client render.
 * Never swap this for Math.random()/Date.now(): that would cause SSR/CSR
 * hydration mismatches.
 */
export function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length) % items.length];
}

export function intBetween(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

export const DEMO_TODAY = new Date("2026-08-28T00:00:00");

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
