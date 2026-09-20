import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "./errors";

describe("API error normalization", () => {
  it.each([403, 404, 409, 429, 500])("normalizes status %s without exposing transport internals", (status) => {
    const response = { status, data: { error: { code: `STATUS_${status}`, message: "Safe message" } }, headers: { "x-request-id": "request-1" } } as unknown as AxiosResponse;
    const normalized = normalizeApiError(new AxiosError("raw transport details", undefined, undefined, undefined, response));
    expect(normalized).toMatchObject({ status, code: `STATUS_${status}`, message: "Safe message", requestId: "request-1" });
    expect(normalized.message).not.toContain("raw transport");
  });
});
