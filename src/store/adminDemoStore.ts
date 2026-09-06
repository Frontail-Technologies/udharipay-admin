"use client";

import { useSyncExternalStore } from "react";
import type { Merchant, Customer, Employee } from "@/data/admin";

/**
 * Pre-backend demo persistence layer — PROFILE PATCHES ONLY.
 *
 * There is no backend yet, so edits made in the admin UI are held here as
 * explicit partial patches layered on top of the seeded demo entities in
 * `src/data/admin/*` — the static source files are never mutated. Patches
 * are versioned in localStorage (bump STORAGE_KEY if the shape changes) so
 * they're trivial to invalidate once real persistence exists behind an API.
 *
 * Keeping patches as explicit per-field objects (rather than replacing
 * whole entities) is deliberate: it's the shape a future backend audit log
 * ("actor changed field X from A to B at time T") would want to record.
 *
 * This store never holds workflow state (KYC review status, notes,
 * history) — that lives in `adminKycStore.ts` — so this stays a plain,
 * typed "what did the admin edit on this profile" blob rather than an
 * untyped catch-all. Nothing outside this module and `useAdminEntities.ts`
 * should read these overlays directly: every screen goes through the
 * canonical `useAdminMerchant`/`useAdminCustomer`/`useAdminEmployee`
 * selectors so a merge is never re-implemented ad hoc per component.
 */
const STORAGE_KEY = "udharipay-admin-demo-edits.v2";

type DemoOverlayState = {
  merchants: Record<string, Partial<Merchant>>;
  customers: Record<string, Partial<Customer>>;
  employees: Record<string, Partial<Employee>>;
};

function emptyState(): DemoOverlayState {
  return { merchants: {}, customers: {}, employees: {} };
}

function loadFromStorage(): DemoOverlayState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<DemoOverlayState>;
    return {
      merchants: parsed.merchants ?? {},
      customers: parsed.customers ?? {},
      employees: parsed.employees ?? {},
    };
  } catch {
    return emptyState();
  }
}

let state = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = loadFromStorage();
  hydrated = true;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort only — demo persistence isn't load-bearing
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): DemoOverlayState {
  ensureHydrated();
  return state;
}

// A stable, module-level reference — useSyncExternalStore requires
// getServerSnapshot() to return the SAME value on every call, not just an
// equal-looking one. Calling emptyState() fresh here builds a new object
// each time, which is an infinite-update-loop bug, not just a perf cost.
const SERVER_SNAPSHOT = emptyState();

function getServerSnapshot(): DemoOverlayState {
  return SERVER_SNAPSHOT;
}

export function patchMerchant(merchantId: string, patch: Partial<Merchant>) {
  ensureHydrated();
  state = {
    ...state,
    merchants: {
      ...state.merchants,
      [merchantId]: { ...state.merchants[merchantId], ...patch },
    },
  };
  persist();
  notify();
}

export function patchCustomer(customerId: string, patch: Partial<Customer>) {
  ensureHydrated();
  state = {
    ...state,
    customers: {
      ...state.customers,
      [customerId]: { ...state.customers[customerId], ...patch },
    },
  };
  persist();
  notify();
}

export function patchEmployee(employeeId: string, patch: Partial<Employee>) {
  ensureHydrated();
  state = {
    ...state,
    employees: {
      ...state.employees,
      [employeeId]: { ...state.employees[employeeId], ...patch },
    },
  };
  persist();
  notify();
}

/**
 * Whole-map subscriptions — used only by `useAdminEntities.ts` to build the
 * canonical effective-entity selectors. Individual screens should not call
 * these directly; use `useAdminMerchant`/`useAdminMerchants`/etc. instead so
 * the overlay merge happens in exactly one place.
 */
export function useMerchantOverlays(): Record<string, Partial<Merchant>> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).merchants;
}

export function useCustomerOverlays(): Record<string, Partial<Customer>> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).customers;
}

export function useEmployeeOverlays(): Record<string, Partial<Employee>> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).employees;
}
