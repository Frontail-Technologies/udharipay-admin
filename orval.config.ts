import { defineConfig } from "orval";

export default defineConfig({
  udharipay: {
    input: "../backend/openapi.json",
    output: {
      mode: "tags",
      target: "src/api/generated",
      schemas: false,
      client: "axios-functions",
      httpClient: "axios",
      clean: true,
      override: {
        header: false,
        jsDoc: {
          filter: () => [],
        },
        mutator: {
          path: "src/api/http/client.ts",
          name: "apiClient",
        },
      },
    },
  },
});
