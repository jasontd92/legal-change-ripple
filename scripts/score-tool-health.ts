/**
 * V15 change items are real, V16 tool-call health. No model calls.
 *   npx tsx scripts/score-tool-health.ts runs/<id> [runs/<id> ...]
 * Exit code 1 when any run fails.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { hunkCandidates, isPlaceholder, uncovered } from "../src/change-items.js";
import { loadCorpus, readNormalized } from "../src/corpus.js";
import { diffLines } from "../src/diff.js";
import { cpSlice } from "../src/normalize.js";
import { findRepo } from "../src/paths.js";
import { quoteInSpan } from "../src/text.js";
import type { ChangeRecord } from "../src/types.js";

type Trace = { type?: string; phase?: string; tool?: string; ok?: boolean; error?: string | null };
export type Health = { run: string; failures: string[]; warnings: string[]; invalid: number; rejected: number; items: number };

const repo = findRepo();
const corpus = loadCorpus(repo, "corpus");

export function scoreRun(dir: string): Health {
  const health: Health = { run: path.basename(dir), failures: [], warnings: [], invalid: 0, rejected: 0, items: 0 };
  const changeFile = path.join(dir, "change_record.json");
  if (!existsSync(changeFile)) {
    health.failures.push("V15: no change_record.json");
    return health;
  }
  const change = JSON.parse(readFileSync(changeFile, "utf8")) as ChangeRecord;
  health.items = change.items.length;
  for (const item of change.items) {
    if (item.id.startsWith("K")) health.warnings.push(`V15: ${item.id} kept by default; the model left it undescribed`);
    else if (item.substantive) {
      if (isPlaceholder(item.summary)) health.failures.push(`V15: ${item.id} summary ${JSON.stringify(item.summary)} is a placeholder, not a description`);
      else if ((item.summary ?? "").split(/\s+/).length > 50) health.warnings.push(`V15: ${item.id} summary runs past one sentence`);
    }
    try {
      const text = readNormalized(corpus, item.anchor.file);
      const exact = cpSlice(text, item.anchor.start, item.anchor.end);
      if (!item.anchor.quote || !(exact === item.anchor.quote || quoteInSpan(text, item.anchor.start, item.anchor.end, item.anchor.quote))) {
        health.failures.push(`V15: ${item.id} anchor quote is not the text at its span`);
      }
    } catch (err) {
      health.failures.push(`V15: ${item.id} anchor file unreadable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const raw = readJsonIf<{ old_file?: string | null; new_file?: string }>(path.join(dir, "raw_change.json"));
  if (raw?.old_file && raw.new_file) {
    const next = readNormalized(corpus, raw.new_file);
    const lineOf = (cp: number) => cpSlice(next, 0, cp).split("\n").length;
    const ranges = change.items.filter((i) => i.anchor.file === raw.new_file).map((i) => ({ from: lineOf(i.anchor.start), to: lineOf(i.anchor.end) }));
    const gaps = uncovered(hunkCandidates(diffLines(readNormalized(corpus, raw.old_file), next)), ranges);
    for (const gap of gaps) health.failures.push(`V15: changed lines ${gap.from}-${gap.to} are in no change item`);
  }
  const trace = path.join(dir, "trace.jsonl");
  if (existsSync(trace)) {
    for (const line of readFileSync(trace, "utf8").split("\n")) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as Trace;
      if (event.type !== "tool" || event.phase !== "finished" || event.ok !== false) continue;
      if (event.error?.startsWith("invalid tool call")) {
        health.invalid += 1;
        // Structural: a list sent as a string, a required field missing. That is what corrupted runs.
        const structural = /expected (array|object), received|expected string, received undefined|Unexpected token|JSON/i.test(event.error);
        if (structural) health.failures.push(`V16: structurally invalid ${event.tool} call: ${issue(event.error)}`);
        else health.warnings.push(`V16: rejected ${event.tool} value (recovered by retry): ${issue(event.error)}`);
      } else if (/^(record_|finish_|commit_)/.test(event.tool ?? "")) {
        health.rejected += 1;
      }
    }
  } else {
    health.warnings.push("V16: no trace.jsonl");
  }
  if (/did not close the change record/.test(change.company_gate_reason ?? "")) health.failures.push("V16: stage 1 never finished; the gate defaulted to uncertain");
  for (const file of listFindings(dir)) {
    const reason = (JSON.parse(readFileSync(file, "utf8")) as { applicability_reason?: string }).applicability_reason ?? "";
    if (/stopped before a verified finding/.test(reason)) health.failures.push(`V16: ${path.basename(file, ".json")} never finished (${reason.slice(0, 80)})`);
  }
  return health;
}

function issue(error: string): string {
  const at = error.indexOf("Error message:");
  return (at >= 0 ? error.slice(at + 14) : error).replace(/\s+/g, " ").slice(0, 160);
}

function listFindings(dir: string): string[] {
  const at = path.join(dir, "findings");
  return existsSync(at) ? readdirSync(at).filter((f) => f.endsWith(".json")).map((f) => path.join(at, f)) : [];
}

function readJsonIf<T>(file: string): T | null {
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : null;
}

export function printHealth(rows: Health[]): boolean {
  let ok = true;
  for (const row of rows) {
    const pass = row.failures.length === 0;
    ok &&= pass;
    console.log(`${pass ? "PASS" : "FAIL"}  ${row.run}  items=${row.items} invalid_calls=${row.invalid} rejected_calls=${row.rejected}`);
    for (const failure of row.failures) console.log(`      ${failure}`);
    for (const warning of row.warnings) console.log(`      warn ${warning}`);
  }
  return ok;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) throw new Error("usage: score-tool-health.ts <run dir> [...]");
  const ok = printHealth(dirs.map((dir) => scoreRun(path.resolve(dir))));
  process.exit(ok ? 0 : 1);
}
