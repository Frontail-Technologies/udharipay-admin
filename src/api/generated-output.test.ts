import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const generatedDirectory = path.resolve("src/api/generated");

function generatedFiles(directory = generatedDirectory): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? generatedFiles(target) : entry.name.endsWith(".ts") ? [target] : [];
  });
}

describe("generated API output", () => {
  it("contains only the supported domain-oriented client surface", () => {
    const files = generatedFiles();
    expect(files.some((file) => file.endsWith("udhariPayAPI.schemas.ts"))).toBe(false);

    for (const file of files) {
      const source = fs.readFileSync(file, "utf8");
      const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, source);
      const comments = [];
      for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
        if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) comments.push(token);
      }
      expect(comments, file).toHaveLength(0);
      expect(source, file).not.toMatch(/\b(?:BodyType|SecondParameter)\b|\b\w+Result\s*=|@tanstack\/react-query|useMutation|useQuery/);
    }
  });
});
