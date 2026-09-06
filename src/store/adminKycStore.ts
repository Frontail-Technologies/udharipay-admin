"use client";

import { useSyncExternalStore } from "react";
import type { KycHistoryEvent, KycReviewNote, KycReviewStatus } from "@/data/admin";

/**
 * Pre-backend demo KYC WORKFLOW state — deliberately a separate store from
 * `adminDemoStore.ts` (which only ever holds profile-field patches). This
 * store never touches Merchant/Customer/Employee profile fields directly;
 * it only records review status transitions, reviewer, notes, and history
 * for a `KycReview`. `useAdminEntities.ts` is what translates an approved
 * review into an entity's displayed KYC status (see kycStatusMapping.ts) —
 * this store has no opinion about entities at all, keeping the two patch
 * concepts from collapsing into one untyped blob.
 *
 * Every action here appends to arrays rather than replacing them, so the
 * seed history/notes are never lost — this is explicitly modeled as demo
 * workflow history, not a real backend audit log.
 */
const STORAGE_KEY = "udharipay-admin-kyc-workflow.v1";

type KycReviewPatch = {
  status?: KycReviewStatus;
  reviewerName?: string | null;
  additionalNotes: KycReviewNote[];
  additionalHistory: KycHistoryEvent[];
};

type KycOverlayState = Record<string, KycReviewPatch>;

function emptyPatch(): KycReviewPatch {
  return { additionalNotes: [], additionalHistory: [] };
}

function emptyState(): KycOverlayState {
  return {};
}

function loadFromStorage(): KycOverlayState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return JSON.parse(raw) as KycOverlayState;
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

function getSnapshot(): KycOverlayState {
  ensureHydrated();
  return state;
}

// A stable, module-level reference — useSyncExternalStore requires
// getServerSnapshot() to return the SAME value on every call, not just an
// equal-looking one. Calling emptyState() fresh here built a new object
// each time, which is an infinite-update-loop bug, not just a perf cost.
const SERVER_SNAPSHOT = emptyState();

function getServerSnapshot(): KycOverlayState {
  return SERVER_SNAPSHOT;
}

let historyCounter = 0;
let noteCounter = 0;

function nextHistoryEvent(type: KycHistoryEvent["type"], note?: string): KycHistoryEvent {
  historyCounter += 1;
  return { id: `live-hist-${historyCounter}`, type, at: new Date().toISOString(), note };
}

function applyPatch(reviewId: string, patch: Partial<KycReviewPatch>) {
  ensureHydrated();
  const current = state[reviewId] ?? emptyPatch();
  state = {
    ...state,
    [reviewId]: {
      ...current,
      ...patch,
      additionalNotes: [...current.additionalNotes, ...(patch.additionalNotes ?? [])],
      additionalHistory: [...current.additionalHistory, ...(patch.additionalHistory ?? [])],
    },
  };
  persist();
  notify();
}

export function startKycReview(reviewId: string, reviewerName = "Admin User") {
  applyPatch(reviewId, {
    status: "in_review",
    reviewerName,
    additionalHistory: [nextHistoryEvent("review_started")],
  });
}

export function approveKycReview(reviewId: string, note?: string) {
  applyPatch(reviewId, {
    status: "approved",
    additionalHistory: [nextHistoryEvent("approved", note)],
  });
}

export function requestKycResubmission(reviewId: string, reason: string) {
  applyPatch(reviewId, {
    status: "resubmission_required",
    additionalHistory: [nextHistoryEvent("resubmission_requested", reason)],
  });
}

export function rejectKycReview(reviewId: string, reason: string) {
  applyPatch(reviewId, {
    status: "rejected",
    additionalHistory: [nextHistoryEvent("rejected", reason)],
  });
}

export function addKycReviewNote(reviewId: string, text: string) {
  noteCounter += 1;
  const note: KycReviewNote = { id: `live-note-${noteCounter}`, text, at: new Date().toISOString() };
  applyPatch(reviewId, {
    additionalNotes: [note],
    additionalHistory: [nextHistoryEvent("note_added", text)],
  });
}

export function useKycReviewOverlays(): KycOverlayState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
