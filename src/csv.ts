import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

type MatchType = "exact" | "contain";

interface PromptEntry {
  matchType?: string;
  prompt: string;
  response?: string;
  response1?: string;
  response2?: string;
  response3?: string;
  response4?: string;
  response5?: string;
}

let entries: PromptEntry[] = [];

export function loadCsv(): void {
  entries = [];
  const csvPath = join(process.cwd(), "prompts.csv");
  if (!existsSync(csvPath)) {
    console.log("No prompts.csv found — using default response for all prompts.");
    return;
  }

  const content = readFileSync(csvPath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PromptEntry[];

  entries = records;
  console.log(`Loaded ${entries.length} entries from prompts.csv`);
}

function pickResponse(entry: PromptEntry): string {
  const candidates = [
    entry.response1,
    entry.response2,
    entry.response3,
    entry.response4,
    entry.response5,
  ].filter((r) => r !== undefined && r.trim() !== "");

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)]!;
  }

  return entry.response ?? "";
}

export function findResponse(input: string): string | null {
  const normalized = input.trim().toLowerCase();

  const match = entries.find((e) => {
    const matchType: MatchType =
      e.matchType && e.matchType.trim().toLowerCase() === "contain" ? "contain" : "exact";
    const prompt = e.prompt.trim().toLowerCase();
    return matchType === "contain" ? normalized.includes(prompt) : normalized === prompt;
  });

  return match ? pickResponse(match) : null;
}
