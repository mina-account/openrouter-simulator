import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { findResponse, loadCsv } from "../csv";
import * as fs from "fs";

vi.mock("fs");

const mockCsvContent = `matchType,prompt,response1,response2,response3,response4,response5
exact,hello,Hi there!,,,,
exact,what is 2+2,The answer is 4.,,,,
exact,multi response,Option A,Option B,Option C,,
contain,capital,Paris is the capital of France.,,,,
`;

const legacyCsvContent = `prompt,response
hello,Hi there!
what is 2+2,The answer is 4.
`;

describe("csv", () => {
  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockCsvContent);
    loadCsv();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findResponse — exact match (default)", () => {
    it("returns the matching response for an exact prompt", () => {
      expect(findResponse("hello")).toBe("Hi there!");
    });

    it("matches case-insensitively", () => {
      expect(findResponse("HELLO")).toBe("Hi there!");
      expect(findResponse("Hello")).toBe("Hi there!");
    });

    it("trims whitespace before matching", () => {
      expect(findResponse("  hello  ")).toBe("Hi there!");
    });

    it("returns null when no match is found", () => {
      expect(findResponse("unknown prompt")).toBeNull();
    });

    it("returns null for empty input when no empty row exists", () => {
      expect(findResponse("")).toBeNull();
    });

    it("does not match a prompt that only contains the keyword (exact row)", () => {
      expect(findResponse("say hello please")).toBeNull();
    });
  });

  describe("findResponse — contain match", () => {
    it("matches when input contains the CSV prompt", () => {
      expect(findResponse("What is the capital of France?")).toBe(
        "Paris is the capital of France."
      );
    });

    it("matches case-insensitively for contain", () => {
      expect(findResponse("CAPITAL city")).toBe("Paris is the capital of France.");
    });

    it("does not match an exact row that is only a substring of input", () => {
      // 'hello' is exact — 'say hello please' should not match
      expect(findResponse("say hello please")).toBeNull();
    });
  });

  describe("findResponse — multiple responses", () => {
    it("returns one of the available responses randomly", () => {
      const results = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const r = findResponse("multi response");
        expect(["Option A", "Option B", "Option C"]).toContain(r);
        if (r) results.add(r);
      }
      // With 100 tries, extremely likely all 3 options appear
      expect(results.size).toBe(3);
    });
  });

  describe("legacy CSV format (prompt + response columns)", () => {
    beforeEach(() => {
      vi.mocked(fs.readFileSync).mockReturnValue(legacyCsvContent);
      loadCsv();
    });

    it("still matches prompts from legacy format", () => {
      expect(findResponse("hello")).toBe("Hi there!");
      expect(findResponse("what is 2+2")).toBe("The answer is 4.");
    });
  });

  describe("loadCsv", () => {
    it("does nothing when prompts.csv does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      loadCsv();
      expect(findResponse("hello")).toBeNull();
    });
  });
});
