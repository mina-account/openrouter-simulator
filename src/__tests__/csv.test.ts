import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { findResponse, loadCsv } from "../csv";
import * as fs from "fs";

vi.mock("fs");

const mockCsvContent = `prompt,response
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

  describe("findResponse", () => {
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
  });

  describe("loadCsv", () => {
    it("does nothing when prompts.csv does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      loadCsv();
      // After reloading with no file, entries are cleared — no match
      expect(findResponse("hello")).toBeNull();
    });
  });
});
