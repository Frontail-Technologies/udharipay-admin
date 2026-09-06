"use client";

import { useSyncExternalStore } from "react";
import type { CollectionFollowUp, CollectionFollowUpType } from "@/data/admin";

/**
 * Pre-backend demo store for operational collection follow-ups — kept
 * separate from `adminDemoStore.ts` (entity profile patches) and
 * `adminKycStore.ts` (KYC review workflow) on purpose: a follow-up is
 * neither a profile edit nor a KYC decision, and payment/installment
 * records stay completely untouched by anything in this file. No payment
 * is ever written here — logging a follow-up never changes what was
 * actually collected.
 *
 * Shape differs from the other two stores deliberately: a follow-up is a
 * new, independent record (not a patch to an existing keyed entity), so
 * this just appends to a flat array rather than keying patches by id.
 */
const STORAGE_KEY = "udharipay-admin-collections-workflow.v1";

type CollectionsOverlayState = {
  followUps: CollectionFollowUp[];
};

function emptyState(): CollectionsOverlayState {
  return { followUps: [] };
}

function loadFromStorage(): CollectionsOverlayState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<CollectionsOverlayState>;
    return { followUps: parsed.followUps ?? [] };
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

function getSnapshot(): CollectionsOverlayState {
  ensureHydrated();
  return state;
}

// A stable, module-level reference — useSyncExternalStore requires
// getServerSnapshot() to return the SAME value on every call, not just an
// equal-looking one. Calling emptyState() fresh here built a new object
// each time, which is an infinite-update-loop bug, not just a perf cost.
const SERVER_SNAPSHOT = emptyState();

function getServerSnapshot(): CollectionsOverlayState {
  return SERVER_SNAPSHOT;
}

export function addCollectionFollowUp(input: {
  customerId: string;
  planId: string;
  installmentId: string | null;
  employeeId: string | null;
  type: CollectionFollowUpType;
  note: string;
  promisedDate: string | null;
  nextFollowUpDate: string | null;
}): CollectionFollowUp {
  ensureHydrated();
  idCounter += 1;
  const entry: CollectionFollowUp = {
    ...input,
    id: `FOLLOWUP-LIVE-${idCounter}`,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, followUps: [...state.followUps, entry] };
  persist();
  notify();
  return entry;
}

export function useCollectionFollowUpOverlay(): CollectionFollowUp[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).followUps;
}
