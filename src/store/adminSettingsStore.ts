"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_ADMIN_SETTINGS, type AdminPlatformSettings } from "@/data/admin/settings";

const STORAGE_KEY = "udharipay-admin-settings.v2";

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

export function updateSettingsSection<K extends keyof AdminPlatformSettings>(
  section: K,
  patch: AdminPlatformSettings[K],
) {
  ensureHydrated();
  state = { ...state, [section]: patch };
  persist();
  notify();
}

export function resetAdminSettings() {
  ensureHydrated();
  state = cloneDefaults();
  persist();
  notify();
}

export function useAdminSettings(): AdminPlatformSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
