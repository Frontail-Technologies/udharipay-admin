import { describe, expect, it } from "vitest";
import { adaptMerchant } from "./useMerchantDirectory";

describe("merchant API adapter", () => {
  it("keeps backend identity and maps lifecycle status for the UI", () => {
    const merchant = adaptMerchant({ id: "db-id", publicId: "MER-1001", businessName: "Amit Traders", ownerName: "Amit", businessCategory: "Wholesale", phone: "+919999999999", email: null, city: "Jaipur", state: "Rajasthan", status: "in_review", createdAt: "2026-09-20T00:00:00.000Z" }, []);
    expect(merchant.apiId).toBe("db-id");
    expect(merchant.displayId).toBe("MER-1001");
    expect(merchant.status).toBe("inactive");
  });
});
