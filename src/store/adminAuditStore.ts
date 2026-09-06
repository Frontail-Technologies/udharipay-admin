"use client";

import { useSyncExternalStore } from "react";
import { addDays, toIsoDate, DEMO_TODAY } from "@/data/admin/seededRandom";
import { merchants } from "@/data/admin/merchants";
import { customers } from "@/data/admin/customers";
import { employees } from "@/data/admin/employees";
import type { AdminAuditChange, AdminAuditEvent, EventEntityType } from "@/data/admin/events/types";

/**
 * DEMO audit presentation architecture (Part C) — explicitly NOT a
 * production-grade audit trail. There is no authenticated Admin actor or
 * backend yet, so:
 *
 *   1. A small SEEDED demo audit history below stands in for "what an
 *      admin might have done before this session" — deterministic, not
 *      reverse-engineered from current entity state (we never claim to
 *      know the *actual* prior values of every field that's never been
 *      edited).
 *   2. Real write actions taken THIS session (profile-section saves, KYC
 *      decisions, Settings changes) call `recordAuditEvent()` below and
 *      genuinely capture their own before/after values — real diffs, real
 *      timestamps, just not durable beyond this browser/session and not
 *      backed by a real authenticated actor.
 *
 * This is the shape a future backend audit log would want to receive, so
 * wiring a real API in later means swapping this store's persistence, not
 * redesigning every call site.
 */
const STORAGE_KEY = "udharipay-admin-audit-log.v1";

const SEED_MERCHANT = merchants[0];
const SEED_MERCHANT_2 = merchants[3];
const SEED_CUSTOMER = customers[0];
const SEED_EMPLOYEE = employees[0];

function seedAuditHistory(): AdminAuditEvent[] {
  return [
    {
      id: "AUDIT-SEED-1",
      actorName: "Admin User",
      action: "Updated Merchant",
      entityType: "merchant",
      entityId: SEED_MERCHANT.id,
      entityLabel: SEED_MERCHANT.businessName,
      changes: [
        { field: "Phone", from: "+91••••1001", to: "+91••••2001" },
        { field: "City", from: "Pune", to: "Bengaluru" },
      ],
      createdAt: toIsoDate(addDays(DEMO_TODAY, -14)),
    },
    {
      id: "AUDIT-SEED-2",
      actorName: "Admin User",
      action: "Approved KYC Review",
      entityType: "merchant",
      entityId: SEED_MERCHANT.id,
      entityLabel: SEED_MERCHANT.businessName,
      changes: [{ field: "Review Status", from: "In Review", to: "Approved" }],
      createdAt: toIsoDate(addDays(DEMO_TODAY, -12)),
    },
    {
      id: "AUDIT-SEED-3",
      actorName: "Admin User",
      action: "Updated Customer",
      entityType: "customer",
      entityId: SEED_CUSTOMER.id,
      entityLabel: SEED_CUSTOMER.name,
      changes: [{ field: "Alternate Phone", from: "—", to: "+91••••4410" }],
      createdAt: toIsoDate(addDays(DEMO_TODAY, -9)),
    },
    {
      id: "AUDIT-SEED-4",
      actorName: "Admin User",
      action: "Updated Employee",
      entityType: "employee",
      entityId: SEED_EMPLOYEE.id,
      entityLabel: SEED_EMPLOYEE.name,
      changes: [{ field: "Assigned Area", from: "Bengaluru North Zone", to: "Bengaluru Central Zone" }],
      createdAt: toIsoDate(addDays(DEMO_TODAY, -7)),
    },
    {
      id: "AUDIT-SEED-5",
      actorName: "Admin User",
      action: "Rejected KYC Review",
      entityType: "customer",
      entityId: SEED_CUSTOMER.id,
      entityLabel: SEED_CUSTOMER.name,
      changes: [{ field: "Review Status", from: "In Review", to: "Rejected" }],
      metadata: "Submitted documents did not match records on file.",
      createdAt: toIsoDate(addDays(DEMO_TODAY, -5)),
    },
    {
      id: "AUDIT-SEED-6",
      actorName: "Admin User",
      action: "Updated Merchant",
      entityType: "merchant",
      entityId: SEED_MERCHANT_2.id,
      entityLabel: SEED_MERCHANT_2.businessName,
      changes: [{ field: "Bank Details", from: "••••••", to: "••••••" }],
      createdAt: toIsoDate(addDays(DEMO_TODAY, -3)),
    },
  ];
}

type AuditState = {
  liveEvents: AdminAuditEvent[];
};

function emptyState(): AuditState {
  return { liveEvents: [] };
}

function loadFromStorage(): AuditState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AuditState>;
    return { liveEvents: parsed.liveEvents ?? [] };
  } catch {
    return emptyState();
  }
}

let state = emptyState();
let hydrated = false;
const listeners = new Set<() => void>();
let idCounter = 0;

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = loadFromStorage();
  hydrated = true;
  rebuildSnapshot();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // best-effort only
  }
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const seed = seedAuditHistory();

// useSyncExternalStore requires getSnapshot() to return a referentially
// stable value when nothing has changed — returning a freshly spread array
// on every call (even an identical one) makes React think the store
// changes on every render, which is an infinite-update-loop bug, not just
// a performance issue. So the merged array is cached and only rebuilt when
// `state` actually changes (hydration or a new recorded event).
let cachedSnapshot: AdminAuditEvent[] = [...state.liveEvents, ...seed];

function rebuildSnapshot() {
  cachedSnapshot = [...state.liveEvents, ...seed];
}

function getSnapshot(): AdminAuditEvent[] {
  ensureHydrated();
  return cachedSnapshot;
}

function getServerSnapshot(): AdminAuditEvent[] {
  return seed;
}

export function recordAuditEvent(input: {
  actorName?: string;
  action: string;
  entityType: EventEntityType | "settings";
  entityId: string;
  entityLabel: string;
  changes?: AdminAuditChange[];
  metadata?: string;
}) {
  ensureHydrated();
  idCounter += 1;
  const entry: AdminAuditEvent = {
    id: `AUDIT-LIVE-${idCounter}`,
    actorName: input.actorName ?? "Admin User",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    changes: input.changes,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
  state = { liveEvents: [entry, ...state.liveEvents] };
  rebuildSnapshot();
  persist();
  notify();
  return entry;
}

/** Newest first — live (this session) entries before the seeded demo history. */
export function useAdminAuditEvents(): AdminAuditEvent[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
