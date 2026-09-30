/**
 * Step-1 invariant score on already-written runs. No model calls.
 * V1 schema, V2 surfaced quotes, V8 conservation, V10 change-item closure, V11 scope completeness.
 * Also tallies trigger-file tool calls and failed commit_finding attempts.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadCorpus, readNormalized } from "../src/corpus.js";
import { findRepo } from "../src/paths.js";
import { validateArtifact } from "../src/schema.js";
import { buildStacks } from "../src/stacks.js";
import { locateQuote, quoteInSpan } from "../src/text.js";

type Span = { file?: string; start?: number; end?: number; quote?: string; section_label?: string };
type Finding = { id: string; citations?: { trigger?: Span; clause?: Span } };
type StackFinding = { stack_id: string; findings: Finding[] };
type Report = {
  items: { stack_id: string; finding_id: string; citations?: { trigger?: Span; clause?: Span } }[];
  not_material: { stack_id: string; finding_id: string }[];
  change_item_closure: { change_ref: string; status: string; reason?: string }[];
};
type Change = { items: { id: string; substantive?: boolean }[] };
type Scope = { stacks: { stack_id: string; in_scope: boolean }[] };
type ToolCall = { tool: string; file?: string | null; ok: boolean; error?: string | null; chars_returned?: number | null; file_chars?: number | null };
type Agent = { role: string; stack_id?: string | null; tool_calls?: ToolCall[]; retries?: number };

const repo = findRepo();
const runs = [
  "runs/TR-01-copper-section-232-1790748586041",
  "runs/smoke-t5",
];

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function quoteCheck(corpus: ReturnType<typeof loadCorpus>, span: Span | undefined, where: string): string | null {
  if (!span?.quote || !span.file) return `${where}: surfaced citation has no quote or file`;
  let text: string;
  try {
    text = readNormalized(corpus, span.file);
  } catch (err) {
    return `${where}: ${err instanceof Error ? err.message : String(err)}`;
  }
  const located = locateQuote(text, span.quote, span.section_label);
  if (!located) return `${where}: quote not found verbatim in ${span.file}`;
  if (typeof span.start === "number" && typeof span.end === "number" && !quoteInSpan(text, span.start, span.end, span.quote)) {
    return `${where}: quote locates in the file but not inside the stored span ${span.start}:${span.end}`;
  }
  return null;
}

for (const rel of runs) {
  const dir = path.join(repo, rel);
  const corpus = loadCorpus(repo, "corpus");
  const stacks = buildStacks(corpus.docs).map((s) => s.stack_id);
  const problems: string[] = [];

  const artifacts: [string, string][] = [
    ["change_record.json", "change-record.schema.json"],
    ["scope_trace.json", "scope-trace.schema.json"],
    ["impact_report.json", "impact-report.schema.json"],
    ["coverage.json", "coverage-statement.schema.json"],
    ["run.json", "run-trace.schema.json"],
    ["input.json", "scenario-input.schema.json"],
  ];
  for (const [file, schema] of artifacts) {
    const errors = validateArtifact(schema, readJson(path.join(dir, file)));
    if (errors.length) problems.push(`V1 ${file}: ${errors.slice(0, 3).join(" | ")}`);
  }
  const findingFiles = readdirSync(path.join(dir, "findings")).filter((f) => f.endsWith(".json"));
  const findings: StackFinding[] = [];
  for (const file of findingFiles) {
    const data = readJson<StackFinding>(path.join(dir, "findings", file));
    const errors = validateArtifact("stack-finding.schema.json", data);
    if (errors.length) problems.push(`V1 findings/${file}: ${errors.slice(0, 2).join(" | ")}`);
    findings.push(data);
  }

  const report = readJson<Report>(path.join(dir, "impact_report.json"));
  let quoteFails = 0;
  for (const item of report.items) {
    for (const side of ["trigger", "clause"] as const) {
      const err = quoteCheck(corpus, item.citations?.[side], `${item.stack_id} ${item.finding_id} ${side}`);
      if (err) {
        quoteFails += 1;
        if (quoteFails <= 8) problems.push(`V2 ${err}`);
      }
    }
  }

  const surfaced = new Set<string>();
  for (const item of report.items) surfaced.add(`${item.stack_id}::${item.finding_id}`);
  for (const item of report.not_material) surfaced.add(`${item.stack_id}::${item.finding_id}`);
  let dropped = 0;
  let accepted = 0;
  for (const stack of findings) {
    for (const finding of stack.findings ?? []) {
      accepted += 1;
      const key = `${stack.stack_id}::${finding.id}`;
      if (!surfaced.has(key)) {
        dropped += 1;
        if (dropped <= 8) problems.push(`V8 dropped ${key}`);
      }
    }
  }
  const orphans = [...surfaced].filter((key) => {
    const [stackId, findingId] = key.split("::");
    const stack = findings.find((f) => f.stack_id === stackId);
    return !stack?.findings?.some((f) => f.id === findingId);
  });

  const change = readJson<Change>(path.join(dir, "change_record.json"));
  const closed = new Map(report.change_item_closure.map((row) => [row.change_ref, row]));
  for (const item of change.items) {
    const row = closed.get(item.id);
    if (!row) problems.push(`V10 missing closure for ${item.id}`);
    else if (!row.reason?.trim()) problems.push(`V10 ${item.id} has empty reason`);
  }

  const scope = readJson<Scope>(path.join(dir, "scope_trace.json"));
  const scoped = new Set(scope.stacks.map((s) => s.stack_id));
  const missingScope = stacks.filter((id) => !scoped.has(id));
  const extraScope = [...scoped].filter((id) => !stacks.includes(id));
  const inScope = scope.stacks.filter((s) => s.in_scope).length;

  const run = readJson<{ agents: Agent[] }>(path.join(dir, "run.json"));
  const triggerFiles = new Set(change.items.flatMap(() => []));
  const changeFull = readJson<{ items: { anchor?: { file?: string } }[] }>(path.join(dir, "change_record.json"));
  for (const item of changeFull.items) if (item.anchor?.file) triggerFiles.add(item.anchor.file);

  let triggerCalls = 0;
  const triggerByStack = new Map<string, number>();
  const commitFails = new Map<string, string[]>();
  const commitOk = new Map<string, number>();
  for (const agent of run.agents) {
    if (agent.role !== "subagent" || !agent.stack_id) continue;
    for (const call of agent.tool_calls ?? []) {
      const file = call.file ?? "";
      const isTrigger = [...triggerFiles].some((t) => file === t || file.endsWith(t) || t.endsWith(file));
      if ((call.tool === "read" || call.tool === "grep") && isTrigger) {
        triggerCalls += 1;
        triggerByStack.set(agent.stack_id, (triggerByStack.get(agent.stack_id) ?? 0) + 1);
      }
      if (call.tool === "commit_finding" && !call.ok) {
        const list = commitFails.get(agent.stack_id) ?? [];
        list.push(call.error ?? "failed");
        commitFails.set(agent.stack_id, list);
      }
      if (call.tool === "commit_finding" && call.ok) commitOk.set(agent.stack_id, (commitOk.get(agent.stack_id) ?? 0) + 1);
    }
  }
  const both = [...commitFails.keys()].filter((id) => (triggerByStack.get(id) ?? 0) > 0);
  both.sort((a, b) => (triggerByStack.get(b) ?? 0) - (triggerByStack.get(a) ?? 0));

  const summary = {
    run: rel,
    finding_files: findingFiles.length,
    in_scope: inScope,
    vault_stacks: stacks.length,
    scope_missing: missingScope.length,
    scope_extra: extraScope.slice(0, 5),
    accepted_findings: accepted,
    surfaced: surfaced.size,
    dropped,
    report_orphans: orphans.slice(0, 5),
    change_items: change.items.length,
    closure_rows: report.change_item_closure.length,
    quote_fails: quoteFails,
    trigger_tool_calls: triggerCalls,
    stacks_that_touched_trigger: triggerByStack.size,
    commit_finding_fail_stacks: commitFails.size,
    stacks_with_both: both.slice(0, 8).map((id) => ({
      stack_id: id,
      trigger_calls: triggerByStack.get(id),
      commit_errors: (commitFails.get(id) ?? []).slice(0, 2),
    })),
    v1_to_v11_problems: problems.slice(0, 30),
    problem_count: problems.length,
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}
