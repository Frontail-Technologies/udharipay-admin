export type CursorState = { cursor?: string; search?: string; status?: string; category?: string };

export function readCursorState(searchParams: URLSearchParams): CursorState {
  return compact({ cursor: searchParams.get("cursor") ?? undefined, search: searchParams.get("search") ?? undefined, status: searchParams.get("status") ?? undefined, category: searchParams.get("category") ?? undefined });
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
