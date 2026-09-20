import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { clearAuthenticatedCache } from "./AuthProvider";

describe("logout cache handling", () => {
  it("removes all authenticated query data", () => {
    const client = new QueryClient();
    client.setQueryData(["merchant", "one"], { id: "one" });
    clearAuthenticatedCache(client);
    expect(client.getQueryData(["merchant", "one"])).toBeUndefined();
  });
});
