import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

interface PromptEntry {
  prompt: string;
  response: string;
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

export function findResponse(input: string): string | null {
  const normalized = input.trim().toLowerCase();
  const match = entries.find((e) => e.prompt.trim().toLowerCase() === normalized);
  return match ? match.response : null;
}
