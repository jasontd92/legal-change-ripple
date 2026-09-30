import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { readJson, writeJson } from "./paths.js";

/**
 * The GC's verdict on a finding: approved, or dismissed (a soft delete, hidden
 * from the report). Each entry keeps the model's labels as they were when the
 * verdict was given, so the file reads as a human-labelled set on its own.
 *
 * Stored beside the run's other artifacts: `verdicts.json` is the current state,
 * `verdict_events.jsonl` is the append-only history. Nothing is ever removed.
 */
export type Verdict = "approved" | "dismissed";

export type VerdictSnapshot = {
  change_ref?: string;
  headline?: string;
  urgency?: string;
  materiality?: string;
  direction?: string;
  response_type?: string;
};

export type VerdictEntry = {
  stack_id: string;
  finding_id: string;
  verdict: Verdict | null;
  snapshot: VerdictSnapshot;
  created_at: string;
  updated_at: string;
};

export type VerdictInput = {
  stack_id?: unknown;
  finding_id?: unknown;
  verdict?: unknown;
  snapshot?: VerdictSnapshot;
};

const VERDICTS = new Set<unknown>(["approved", "dismissed", null]);

function verdictFile(runDir: string): string {
  return path.join(runDir, "verdicts.json");
}

function readAll(runDir: string): Record<string, VerdictEntry> {
  const file = verdictFile(runDir);
  return existsSync(file) ? readJson<{ verdicts: Record<string, VerdictEntry> }>(file).verdicts : {};
}

/** Current verdicts for a run. A cleared verdict (null) is kept on disk but not returned. */
export function listVerdicts(runDir: string): VerdictEntry[] {
  return Object.values(readAll(runDir)).filter((entry) => entry.verdict !== null);
}

/** Sets or clears one verdict. Clearing keeps the entry with a null verdict. */
export function setVerdict(runDir: string, input: VerdictInput): VerdictEntry {
  const stackId = typeof input.stack_id === "string" ? input.stack_id : "";
  const findingId = typeof input.finding_id === "string" ? input.finding_id : "";
  if (!stackId || !findingId) throw new Error("stack_id and finding_id are required");
  const verdict = input.verdict ?? null;
  if (!VERDICTS.has(verdict)) throw new Error("verdict must be approved, dismissed or null");
  if (!existsSync(runDir)) throw new Error("no such run");

  const all = readAll(runDir);
  const key = `${stackId}:${findingId}`;
  const at = new Date().toISOString();
  const prior = all[key];
  const entry: VerdictEntry = {
    stack_id: stackId,
    finding_id: findingId,
    verdict: verdict as Verdict | null,
    snapshot: { ...prior?.snapshot, ...input.snapshot },
    created_at: prior?.created_at ?? at,
    updated_at: at,
  };
  all[key] = entry;
  writeJson(verdictFile(runDir), { verdicts: all });
  mkdirSync(runDir, { recursive: true });
  appendFileSync(path.join(runDir, "verdict_events.jsonl"), `${JSON.stringify({ at, stack_id: stackId, finding_id: findingId, verdict })}\n`);
  return entry;
}
