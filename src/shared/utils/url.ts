export type CursorState = { cursor?: string; paymentCursor?: string; mandateCursor?: string; attemptCursor?: string; collectionCursor?: string; search?: string; status?: string; category?: string; merchantId?: string; customerId?: string; employeeId?: string; frequency?: string; collectionState?: string; timingState?: string; dateFrom?: string; dateTo?: string; referenceDate?: string };

export function readCursorState(searchParams: URLSearchParams): CursorState {
  return compact({ cursor: searchParams.get("cursor") ?? undefined, paymentCursor: searchParams.get("paymentCursor") ?? undefined, mandateCursor: searchParams.get("mandateCursor") ?? undefined, attemptCursor: searchParams.get("attemptCursor") ?? undefined, collectionCursor: searchParams.get("collectionCursor") ?? undefined, search: searchParams.get("search") ?? undefined, status: searchParams.get("status") ?? undefined, category: searchParams.get("category") ?? undefined, merchantId: searchParams.get("merchantId") ?? undefined, customerId: searchParams.get("customerId") ?? undefined, employeeId: searchParams.get("employeeId") ?? undefined, frequency: searchParams.get("frequency") ?? undefined, collectionState: searchParams.get("collectionState") ?? undefined, timingState: searchParams.get("timingState") ?? undefined, dateFrom: searchParams.get("dateFrom") ?? undefined, dateTo: searchParams.get("dateTo") ?? undefined, referenceDate: searchParams.get("referenceDate") ?? undefined });
}

export function writeCursorState(current: URLSearchParams, state: CursorState) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(state)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next.toString();
}

function compact<T extends Record<string, string | undefined>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
