import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { normalizeApiError } from "@/api/http/errors";

type ValidationDetails = { fieldErrors?: Record<string, string[] | undefined> };

export function applyApiFormErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  const normalized = normalizeApiError(error);
  const details = normalized.details as ValidationDetails | undefined;
  let applied = false;
  for (const [field, messages] of Object.entries(details?.fieldErrors ?? {})) {
    const message = messages?.[0];
    if (!message) continue;
    setError(field as Path<T>, { type: "server", message });
    applied = true;
  }
  return { applied, error: normalized };
}
