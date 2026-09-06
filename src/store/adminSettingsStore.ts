"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_ADMIN_SETTINGS, type AdminPlatformSettings } from "@/data/admin/settings";
import { recordAuditEvent } from "@/store/adminAuditStore";
import { diffFlatFields } from "@/lib/auditDiff";

/**
 * Kept deliberately separate from adminDemoStore/adminKycStore/
 * adminCollectionsStore — Settings is platform configuration, not an
 * entity profile patch, a KYC workflow, or a follow-up record.
 */
// Bumped from v1 — the settings shape shrank to only collections/plans;
// a v1 blob with removed fields is simply discarded (see loadFromStorage).
const STORAGE_KEY = "udharipay-admin-settings.v2";

const SECTION_LABELS: Record<keyof AdminPlatformSettings, string> = {
  collections: "Collection Settings",
  plans: "Plan Settings",
};

function cloneDefaults(): AdminPlatformSettings {
  return JSON.parse(JSON.stringify(DEFAULT_ADMIN_SETTINGS)) as AdminPlatformSettings;
}

function loadFromStorage(): AdminPlatformSettings {
  if (typeof window === "undefined") return cloneDefaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as Partial<AdminPlatformSettings>;
    // Shallow-merge over defaults per section so a future new setting field
    // added to DEFAULT_ADMIN_SETTINGS is never silently missing for a
    // browser that already has an older saved settings blob.
    const defaults = cloneDefaults();
    return {
      collections: { ...defaults.collections, ...parsed.collections },
      plans: { ...defaults.plans, ...parsed.plans },
    };
  } catch {
    return cloneDefaults();
  }
}

let state = cloneDefaults();
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

function getSnapshot(): AdminPlatformSettings {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): AdminPlatformSettings {
  return DEFAULT_ADMIN_SETTINGS;
}

/**
 * Unlike the entity overlay stores, Settings has no separate "seed" source
 * of truth to diff against — the store's own current section state IS the
 * effective value — so the audit diff happens right here, in one place,
 * rather than requiring every settings panel to compute it.
 */
export function updateSettingsSection<K extends keyof AdminPlatformSettings>(
  section: K,
  patch: AdminPlatformSettings[K],
) {
  ensureHydrated();
  const before = state[section];
  state = { ...state, [section]: patch };
  persist();

  const changes = diffFlatFields(
    before as Record<string, unknown>,
    patch as Record<string, unknown>,
    {},
  );
  if (changes.length > 0) {
    recordAuditEvent({
      action: `Updated ${SECTION_LABELS[section]}`,
      entityType: "settings",
      entityId: section,
      entityLabel: SECTION_LABELS[section],
      changes,
    });
  }

  notify();
}

export function resetAdminSettings() {
  ensureHydrated();
  state = cloneDefaults();
  persist();
  recordAuditEvent({
    action: "Reset Settings to Defaults",
    entityType: "settings",
    entityId: "all",
    entityLabel: "All Settings",
  });
  notify();
}

export function useAdminSettings(): AdminPlatformSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
