import { describe, expect, it } from "vitest";

import type { KycUploadSession } from "./files";
import { buildUploadBody } from "./files";

const file = new File(["x"], "a.png", { type: "image/png" });
const base = { documentId: "d", upload: { url: "https://u.test", headers: {}, expiresInSeconds: 60 } };

describe("buildUploadBody", () => {
  it("uploads the raw file for presigned PUT", () => {
    const session: KycUploadSession = { ...base, upload: { ...base.upload, method: "PUT" } };
    expect(buildUploadBody(session, file)).toBe(file);
  });

  it("builds a multipart form with signed fields before the file for POST", () => {
    const session: KycUploadSession = { ...base, upload: { ...base.upload, method: "POST", fields: { api_key: "k", signature: "s" } } };
    const body = buildUploadBody(session, file) as FormData;
    expect([...body.keys()]).toEqual(["api_key", "signature", "file"]);
    expect((body.get("file") as File).name).toBe("a.png");
  });
});
