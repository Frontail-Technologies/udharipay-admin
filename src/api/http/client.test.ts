import AxiosMockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adminLogin, getCurrentSession } from "@/api/generated/auth/auth";
import { exportReport } from "@/api/generated/reports/reports";
import { httpClient } from "./client";

const mock = new AxiosMockAdapter(httpClient);

afterEach(() => mock.reset());

describe("HTTP client", () => {
  it("uses cookie credentials for Admin login", async () => {
    mock.onPost("/api/v1/auth/admin/login").reply(200, { data: { user: { id: crypto.randomUUID(), role: "admin", status: "active" }, accessExpiresAt: "2026-09-20T10:00:00.000Z", expiresAt: "2026-09-21T10:00:00.000Z", absoluteExpiresAt: "2026-09-27T10:00:00.000Z" } });
    await adminLogin({ identifier: "admin@example.com", password: "password123" });
    expect(httpClient.defaults.withCredentials).toBe(true);
    expect(mock.history.post).toHaveLength(1);
  });

  it("resolves the authenticated Admin from the cookie session", async () => {
    mock.onGet("/api/v1/auth/me").reply(200, { data: { user: { id: crypto.randomUUID(), role: "admin", status: "active" } } });
    const session = await getCurrentSession();
    expect(session.data.user.role).toBe("admin");
    expect(mock.history.get[0].headers?.["X-Request-ID"]).toBeTruthy();
  });

  it("coalesces concurrent 401 responses into one refresh", async () => {
    let secureCalls = 0;
    let refreshCalls = 0;
    mock.onGet("/secure").reply(() => ++secureCalls <= 2 ? [401, { error: { code: "AUTH_SESSION_EXPIRED", message: "Expired" } }] : [200, { ok: true }]);
    mock.onPost("/api/v1/auth/admin/refresh").reply(async () => {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return [200, { data: {} }];
    });
    const responses = await Promise.all([httpClient.get("/secure"), httpClient.get("/secure")]);
    expect(responses.map((response) => response.data)).toEqual([{ ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
  });

  it("signals session expiry when refresh fails", async () => {
    const listener = vi.fn();
    window.addEventListener("udharipay:session-expired", listener);
    mock.onGet("/secure").reply(401, { error: { code: "AUTH_SESSION_EXPIRED", message: "Expired" } });
    mock.onPost("/api/v1/auth/admin/refresh").reply(401, { error: { code: "AUTH_REFRESH_INVALID", message: "Invalid" } });
    await expect(httpClient.get("/secure")).rejects.toMatchObject({ code: "AUTH_REFRESH_INVALID" });
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("udharipay:session-expired", listener);
  });

  it("requests report exports as blobs", async () => {
    mock.onGet(/\/api\/v1\/reports\/collections\/export/).reply(200, new Blob(["report"]));
    const report = await exportReport("collections", { format: "xlsx" });
    expect(report).toBeInstanceOf(Blob);
    expect(mock.history.get[0].responseType).toBe("blob");
  });
});
