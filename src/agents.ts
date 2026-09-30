import type { ModelMessage } from "ai";
import { z } from "zod";
import { parseLines, resolveLines } from "./citations.js";
import { hunkCandidates, summaryProblem, uncovered, type Candidate } from "./change-items.js";
import { diffLines } from "./diff.js";
import { numberLines } from "./pages.js";
import { classifyFinding } from "./classify.js";
import { shiftDate } from "./dates.js";
import { requireRunningClockDate } from "./labels.js";
import type { Corpus } from "./corpus.js";
import { readNormalized } from "./corpus.js";
import {
  APPLICABILITY,
  COMPANY_GATE,
  DETERMINATION,
  DIRECTION,
  FINDING_TYPE,
  LEGAL_STATUS,
  MATERIALITY,
  RESPONSE_TYPE,
  URGENCY,
} from "./enums.js";
import { emptyUsage, providerFor, runAgent, type AgentTool } from "./models.js";
import { analystBrief, ORCHESTRATOR_PROMPT, STACK_ANALYST_PROMPT, stage1Task, stage3Task, stage5Task } from "./prompts.js";
import { grepReadingSet, readPages, triggerSnapshotAnswer, type FaultState } from "./readset.js";
import type { StackManifest } from "./stacks.js";
import { assertArtifact } from "./schema.js";
import type {
  AgentRecord,
  ChangeRecord,
  Finding,
  HarnessConfig,
  ImpactReport,
  Labels,
  ScenarioInput,
  ScopeTrace,
  StackFinding,
  TokenUse,
  ToolCallRecord,
} from "./types.js";

const lineValue = z.union([z.string(), z.number()]).transform(String);

/** An enum that accepts "Send Notice" or "send-notice" for send_notice. A wrong word is still refused. */
function looseEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase().replace(/[\s-]+/g, "_") : v), z.enum(values));
}
const recordChangeInput = z.object({
  id: z.string().optional(),
  lines: z.union([z.string(), z.number()]).transform(String),
  summary: z.string(),
  substantive: z.boolean(),
  dismissal_reason: z.string().nullable().optional(),
  legal_status: looseEnum(LEGAL_STATUS),
  effective_date: z.string().nullable().optional(),
  jurisdictions: z.array(z.string()).optional(),
  entity_types: z.array(z.string()).optional(),
  product_classes: z.array(z.string()).optional(),
  thresholds: z.array(z.string()).optional(),
});

const finishChangeInput = z.object({
  company_gate: z.enum(COMPANY_GATE),
  company_gate_reason: z.string(),
});

const scopeTool = z.object({
  decisions: z.array(z.object({
    stack_id: z.string(),
    in_scope: z.boolean(),
    reason: z.string(),
  })),
  instruction_extras: z.array(z.object({ stack_id: z.string(), text: z.string() })).optional(),
});

const labelsInput = z.object({
  urgency: z.enum(URGENCY),
  materiality: z.enum(MATERIALITY),
  direction: z.enum(DIRECTION),
  response_type: z.enum(RESPONSE_TYPE),
  materiality_test: z.string().optional(),
  missing_fact: z.string().nullable().optional(),
});

/** One finding, labels flat. The trigger comes from change_ref; the clause is cited by line range, never copied. */
const findingFields = z.object({
  id: z.string().optional(),
  change_ref: z.string(),
  finding_type: looseEnum(FINDING_TYPE),
  clause_file: z.string(),
  clause_lines: lineValue,
  clause_section: z.string().optional(),
  urgency: looseEnum(URGENCY),
  materiality: looseEnum(MATERIALITY),
  direction: looseEnum(DIRECTION),
  response_type: looseEnum(RESPONSE_TYPE),
  materiality_test: z.string().optional(),
  missing_fact: z.string().nullable().optional(),
  deadline_date: z.string().nullable().optional(),
  deadline_rule: z.string().nullable().optional(),
  exposure_amount: z.union([z.number(), z.string()]).nullable().optional(),
  reasoning: z.string(),
  open_questions: z.array(z.string()).optional(),
  absence_clause_type: z.string().nullable().optional(),
  absence_searched_files: z.array(z.string()).optional(),
});

/** A list that some models send as a JSON string. Parse it before validating; count it so the trace shows it. */
function listOrJson<T extends z.ZodType>(item: T, onRepair: () => void) {
  return z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      const parsed = JSON.parse(v);
      onRepair();
      return parsed;
    } catch {
      return v;
    }
  }, z.array(item));
}

const hopInput = z.object({ file: z.string(), lines: lineValue, inference: z.string() });

function commitFindingInput(onRepair: () => void) {
  return z.object({
    applicability: looseEnum(APPLICABILITY),
    applicability_reason: z.string(),
    determination: looseEnum(DETERMINATION),
    findings: listOrJson(findingFields.extend({ hop_chain: listOrJson(hopInput, onRepair).optional() }), onRepair),
    cross_references: listOrJson(z.object({
      target_description: z.string(),
      target_stack_id: z.string().nullable().optional(),
      file: z.string().optional(),
      lines: lineValue.optional(),
    }), onRepair).optional(),
  });
}

const reportTool = z.object({
  items: z.array(z.object({
    stack_id: z.string(),
    finding_id: z.string(),
    labels: labelsInput.optional(),
    headline: z.string().optional(),
    what: z.string().optional(),
    why: z.string().optional(),
    when: z.string().optional(),
    rationale: z.string().optional(),
  })),
  cross_links: z.array(z.object({
    a: z.string(),
    b: z.string(),
    type: z.string(),
    resolves_cross_reference: z.string().nullable().optional(),
  })).optional(),
  resolutions: z.array(z.record(z.string(), z.unknown())).optional(),
  closure_notes: z.array(z.object({ change_ref: z.string(), reason: z.string() })).optional(),
});

export type AgentSink = (record: AgentRecord) => void;
export type Observe = (event: Record<string, unknown>) => void;

type Common = {
  config: HarnessConfig;
  scenario: ScenarioInput;
  messages: ModelMessage[];
  sink: AgentSink;
  observe?: Observe;
};

function cacheOf(config: HarnessConfig): "on" | "off" {
  return config.cache === "off" ? "off" : "on";
}

export async function modelStage1(opts: Common & {
  corpus: Corpus;
  profileText: string;
  oldFile: string | null;
  newFile: string;
  preview: string;
  newText: string;
}): Promise<{ record: ChangeRecord; retries: number }> {
  const only = new Set([opts.newFile]);
  const candidates = opts.oldFile ? hunkCandidates(diffLines(readNormalized(opts.corpus, opts.oldFile), opts.newText)) : [];
  const items = new Map<string, { item: ChangeRecord["items"][number]; from: number; to: number }>();
  const box = { done: false, attempts: 0, warned: false, record: null as ChangeRecord | null };
  const fail = (tool: string, errors: string[]) => {
    box.attempts += 1;
    return { model: { ok: false, errors }, telemetry: { tool, ok: false, error: errors.join("; ").slice(0, 600) } };
  };
  const finish = (gate: ChangeRecord["company_gate"], reason: string, kept: Candidate[]) => {
    for (const gap of kept) {
      const span = resolveLines(opts.corpus, { file: opts.newFile, lines: `${gap.from}-${gap.to}` }, only).span;
      if (!span) continue;
      const id = freeId(items, `K${gap.id}`);
      items.set(id, {
        from: gap.from,
        to: gap.to,
        item: {
          id,
          summary: `Changed text at lines ${gap.from}–${gap.to}. The review did not describe it, so it is kept.`,
          substantive: true,
          dismissal_reason: null,
          anchor: span,
          legal_status: "undeterminable",
          effective_date: null,
        },
      });
    }
    box.record = {
      items: [...items.values()].map((row) => row.item),
      company_gate: gate,
      company_gate_reason: reason,
      source_chars_read: cpCount(opts.newText),
    };
    box.done = true;
  };
  const tools: Record<string, AgentTool> = {
    record_change: {
      description: "Record one change item: a substantive change, or noise you opt out with substantive false. Cite it by line numbers of the new snapshot; the harness copies the text. Every call is real; there is no test mode. Several calls may go in one turn. Recording the same id again replaces it.",
      inputSchema: recordChangeInput,
      execute: async (raw) => {
        const parsed = recordChangeInput.safeParse(raw);
        if (!parsed.success) return fail("record_change", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
        const input = parsed.data;
        const problem = summaryProblem(input.summary);
        if (problem) return fail("record_change", [problem]);
        const resolved = resolveLines(opts.corpus, { file: opts.newFile, lines: input.lines }, only);
        if (!resolved.span) return fail("record_change", [resolved.error ?? "Lines did not resolve."]);
        const range = parseLines(input.lines)!;
        const id = input.id?.trim() && items.has(input.id.trim()) ? input.id.trim() : freeId(items, input.id?.trim() || `C${items.size + 1}`);
        const applies = {
          jurisdictions: input.jurisdictions,
          entity_types: input.entity_types,
          product_classes: input.product_classes,
          thresholds: input.thresholds,
        };
        const hasApplies = Object.values(applies).some((v) => v && v.length);
        items.set(id, {
          from: range.from,
          to: range.to,
          item: {
            id,
            summary: input.summary.trim(),
            substantive: input.substantive,
            dismissal_reason: input.substantive ? null : input.dismissal_reason?.trim() || "Not a substantive change.",
            anchor: resolved.span,
            legal_status: input.legal_status,
            effective_date: input.effective_date && /^\d{4}-\d{2}-\d{2}$/.test(input.effective_date) ? input.effective_date : null,
            ...(hasApplies ? { applies_to: applies } : {}),
          },
        });
        return {
          model: { ok: true, id, cited: clipText(resolved.span.quote ?? "", 160) },
          telemetry: { tool: "record_change", ok: true },
        };
      },
    },
    finish_change_record: {
      description: "Close the change record with the company-level gate, after every item is recorded.",
      inputSchema: finishChangeInput,
      execute: async (raw) => {
        const parsed = finishChangeInput.safeParse(raw);
        if (!parsed.success) return fail("finish_change_record", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
        if (items.size === 0) return fail("finish_change_record", ["Record at least one item with record_change first."]);
        const gaps = uncovered(candidates, [...items.values()]);
        if (gaps.length && !box.warned) {
          box.warned = true;
          return {
            model: {
              ok: false,
              uncovered: gaps.map((gap) => `lines ${gap.from}-${gap.to}`),
              errors: ["These changed lines are not covered by any item. Record each one, as a change or as noise with substantive false. If you finish again, they are kept as substantive changes."],
            },
            telemetry: { tool: "finish_change_record", ok: false, error: `uncovered: ${gaps.length}` },
          };
        }
        finish(parsed.data.company_gate, parsed.data.company_gate_reason, gaps);
        return {
          model: { ok: true, items: box.record!.items.length, kept_by_default: gaps.length, company_gate: parsed.data.company_gate },
          telemetry: { tool: "finish_change_record", ok: true },
        };
      },
    },
  };
  opts.messages.push({
    role: "user",
    content: stage1Task({
      asOf: opts.scenario.as_of,
      profileText: opts.profileText,
      custom: opts.scenario.custom_prompt ?? null,
      oldFile: opts.oldFile,
      newFile: opts.newFile,
      preview: opts.preview,
      newText: numberLines(opts.newText),
      candidates: candidates.map((c) => `lines ${c.from}-${c.to}`),
    }),
  });
  const run = await callOrchestrator(opts, tools, () => box.done, 16);
  if (!box.done) {
    opts.messages.push({ role: "user", content: "Record any remaining items with record_change, then call finish_change_record with the company gate." });
    const again = await callOrchestrator(opts, tools, () => box.done, 6);
    mergeAgent(run, again);
  }
  if (!box.done && items.size > 0) {
    // Recall first: a record without a gate proceeds rather than losing the items.
    finish("uncertain", "The orchestrator did not close the change record; the gate defaults to uncertain, which continues the review.", uncovered(candidates, [...items.values()]));
  }
  if (!box.record || box.record.items.length === 0) throw new Error("Stage 1 did not record any change item.");
  opts.sink(run);
  return { record: box.record, retries: box.attempts };
}

function freeId(items: Map<string, unknown>, base: string): string {
  if (!items.has(base)) return base;
  let n = 2;
  while (items.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function clipText(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export async function modelStage3(opts: Common & {
  change: ChangeRecord;
  lines: string[];
  known: Set<string>;
}): Promise<{ decisions: { stack_id: string; in_scope: boolean; reason: string }[]; extras: Map<string, string>; retries: number }> {
  const box = {
    done: false,
    attempts: 0,
    decisions: [] as { stack_id: string; in_scope: boolean; reason: string }[],
    extras: new Map<string, string>(),
  };
  const toolDef: AgentTool = {
    description: "Record scope decisions. Stacks you omit stay in scope. Exclusions need a reason.",
    inputSchema: scopeTool,
    execute: async (raw) => {
      const parsed = scopeTool.safeParse(raw);
      if (!parsed.success) {
        return { model: { ok: false, errors: parsed.error.issues.map((i) => i.message) }, telemetry: { tool: "commit_scope", ok: false, error: "schema" } };
      }
      const unknown = parsed.data.decisions.filter((d) => !opts.known.has(d.stack_id)).map((d) => d.stack_id);
      if (unknown.length && box.attempts < 1) {
        box.attempts += 1;
        return { model: { ok: false, errors: [`Unknown stack ids (dropped if you commit again): ${unknown.join(", ")}`] }, telemetry: { tool: "commit_scope", ok: false, error: "unknown stack" } };
      }
      box.decisions = parsed.data.decisions.filter((d) => opts.known.has(d.stack_id));
      for (const extra of parsed.data.instruction_extras ?? []) {
        if (opts.known.has(extra.stack_id) && extra.text.trim()) box.extras.set(extra.stack_id, extra.text.trim().slice(0, 2000));
      }
      box.done = true;
      return { model: { ok: true, named: box.decisions.length }, telemetry: { tool: "commit_scope", ok: true } };
    },
  };
  opts.messages.push({
    role: "user",
    content: stage3Task({
      changeJson: JSON.stringify(opts.change, null, 2),
      custom: opts.scenario.custom_prompt ?? null,
      lines: opts.lines,
      stackCount: opts.known.size,
    }),
  });
  const run = await callOrchestrator(opts, { commit_scope: toolDef }, () => box.done, 6);
  if (!box.done) {
    opts.messages.push({ role: "user", content: "Call commit_scope. Name the stacks that are plainly out of scope, each with a reason. Omitting a stack leaves it in scope." });
    const again = await callOrchestrator(opts, { commit_scope: toolDef }, () => box.done, 4);
    mergeAgent(run, again);
  }
  if (!box.done) throw new Error("Stage 3 did not commit a scope decision.");
  opts.sink(run);
  return { decisions: box.decisions, extras: box.extras, retries: box.attempts };
}

export async function modelStack(opts: {
  config: HarnessConfig;
  scenario: ScenarioInput;
  corpus: Corpus;
  profileText: string;
  change: ChangeRecord;
  manifest: StackManifest;
  files: string[];
  extra: string | null;
  prior: { question: string; finding: StackFinding } | null;
  fault: FaultState | null;
  sink: AgentSink;
  observe?: Observe;
}): Promise<StackFinding> {
  const loaded = new Map<string, string>();
  const unparseable: string[] = [];
  for (const file of opts.files) {
    try {
      loaded.set(file, readNormalized(opts.corpus, file));
    } catch {
      unparseable.push(file);
    }
  }
  const allowed = new Set(loaded.keys());
  const filesRead = new Set<string>();
  const maxCalls = opts.config.max_tool_calls_per_subagent ?? 16;
  let toolCalls = 0;
  const box = { done: false, attempts: 0, finding: null as StackFinding | null };
  const anchors = new Map(opts.change.items.map((item) => [item.id, item.anchor]));
  const reject = (tool: string, errors: string[]) => {
    box.attempts += 1;
    return { model: { ok: false, errors }, telemetry: { tool, ok: false, error: errors.join("; ").slice(0, 600) } };
  };
  const members = opts.manifest.members
    .map((m) => `- ${m.doc_id} | ${m.doc_type ?? "document"} | ${m.path} | parent:${m.parent_id ?? "-"} | ${m.effective_date ?? ""}`)
    .join("\n");
  const incorporates = opts.manifest.incorporates
    .map((e) => `- ${e.target_doc_id} | ${e.section} | pin:${e.version_pin ?? "none"} | ${e.quote}`)
    .join("\n");
  const messages: ModelMessage[] = [{
    role: "user",
    content: analystBrief({
      asOf: opts.scenario.as_of,
      profileText: opts.profileText,
      changeJson: JSON.stringify(opts.change, null, 2),
      stackId: opts.manifest.stack_id,
      members,
      incorporates,
      files: opts.files,
      extra: opts.extra,
      prior: opts.prior ? { question: opts.prior.question, findingJson: JSON.stringify(opts.prior.finding, null, 2) } : null,
    }),
  }];
  const budget = (name: "grep" | "read", input: { file?: string | null }): { blocked: boolean; outcome?: Awaited<ReturnType<AgentTool["execute"]>> } => {
    toolCalls += 1;
    if (toolCalls > maxCalls) {
      return {
        blocked: true,
        outcome: {
          model: { ok: false, error: "Tool budget exhausted. Call commit_finding now with what you have, determination needs_review, and say what you did not read." },
          telemetry: { tool: name, ok: false, error: "budget exhausted", file: input.file ?? null },
        },
      };
    }
    return { blocked: false };
  };
  type FindingFields = Omit<z.infer<typeof findingFields>, "id"> & {
    hop_chain?: { file: string; lines: string; inference: string }[];
  };
  /** Shared by both hand-in modes, so citations, labels and facts resolve the same way. */
  const buildFinding = (input: FindingFields, id: string): { finding?: Finding; error?: string; dropped: string[] } => {
    const trigger = anchors.get(input.change_ref);
    if (!trigger) return { error: `${id}: change_ref ${input.change_ref} is not in this run's change record. Use one of: ${[...anchors.keys()].join(", ")}.`, dropped: [] };
    const clause = resolveLines(opts.corpus, { file: input.clause_file, lines: input.clause_lines, section_label: input.clause_section }, allowed);
    if (!clause.span) return { error: `${id} clause: ${clause.error}`, dropped: [] };
    const hops: NonNullable<Finding["hop_chain"]> = [];
    const dropped: string[] = [];
    for (const hop of input.hop_chain ?? []) {
      const span = resolveLines(opts.corpus, hop, allowed).span;
      if (span) hops.push({ span, inference: hop.inference });
      else dropped.push(`${hop.file} ${hop.lines}`);
    }
    if (dropped.length) opts.observe?.({ type: "note", tool: "finding", stack_id: opts.manifest.stack_id, dropped_hops: dropped.map((d) => d.slice(0, 200)) });
    const deadlineDate = input.deadline_date && /^\d{4}-\d{2}-\d{2}$/.test(input.deadline_date) ? input.deadline_date : null;
    const amount = toAmount(input.exposure_amount);
    return {
      dropped,
      finding: {
        id,
        change_ref: input.change_ref,
        finding_type: input.finding_type,
        hop_chain: hops,
        citations: { trigger, clause: clause.span },
        absence: input.absence_clause_type ? { clause_type: input.absence_clause_type, searched_files: input.absence_searched_files ?? [] } : null,
        labels: requireRunningClockDate({
          urgency: input.urgency,
          materiality: input.materiality,
          direction: input.direction,
          response_type: input.response_type,
          materiality_test: input.materiality_test,
          missing_fact: input.missing_fact ?? null,
          label_source: "self",
        }, deadlineDate),
        facts: {
          deadline_rule: input.deadline_rule ? { rule: input.deadline_rule } : null,
          deadline_date: deadlineDate,
          exposure: amount === null ? null : { amount },
        },
        reasoning: input.reasoning,
        open_questions: input.open_questions ?? [],
      },
    };
  };
  const knownTrigger = (tool: string, file: string) => triggerSnapshotAnswer({
    tool,
    file,
    anchors: opts.change.items.map((item) => ({
      id: item.id,
      file: item.anchor.file,
      quote: item.anchor.quote,
      section_label: item.anchor.section_label,
    })),
  });
  const tools: Record<string, AgentTool> = {
    grep: {
      description: "Literal, case-insensitive search of the reading set. Optional file limits it to one file. Returns filename, page, and a one-line snippet.",
      inputSchema: z.object({ query: z.string(), file: z.string().optional() }),
      execute: async (raw) => {
        const input = z.object({ query: z.string(), file: z.string().optional() }).parse(raw);
        const gate = budget("grep", input);
        if (gate.blocked) return gate.outcome!;
        const known = input.file ? knownTrigger("grep", input.file) : null;
        if (known) return known;
        return grepReadingSet({ query: input.query, file: input.file, files: loaded, allowed, fault: opts.fault });
      },
    },
    date_shift: {
      description: "Add or subtract a whole number of calendar days from a YYYY-MM-DD date. Use this for every deadline that is a number of days before or after a date in the document. Do not do that arithmetic yourself.",
      inputSchema: z.object({
        anchor_date: z.string(),
        days: z.number().int().nonnegative(),
        direction: z.enum(["before", "after"]),
      }),
      execute: async (raw) => {
        const input = z.object({
          anchor_date: z.string(),
          days: z.number().int().nonnegative(),
          direction: z.enum(["before", "after"]),
        }).parse(raw);
        const date = shiftDate(input.anchor_date, input.days, input.direction);
        if (!date) {
          return { model: { ok: false, error: "anchor_date must be YYYY-MM-DD and days must be a non-negative integer." }, telemetry: { tool: "date_shift", ok: false, error: "bad date" } };
        }
        return { model: { ok: true, date }, telemetry: { tool: "date_shift", ok: true } };
      },
    },
    read: {
      description: "Read one file from a start page. At most 20 pages (800 lines). A short file returns in one call.",
      inputSchema: z.object({ file: z.string(), start_page: z.number().int().min(1).optional() }),
      execute: async (raw) => {
        const input = z.object({ file: z.string(), start_page: z.number().int().min(1).optional() }).parse(raw);
        const gate = budget("read", input);
        if (gate.blocked) return gate.outcome!;
        const known = knownTrigger("read", input.file);
        if (known) return known;
        const outcome = readPages({ file: input.file, startPage: input.start_page ?? 1, files: loaded, allowed, fault: opts.fault });
        if (outcome.telemetry.ok && outcome.telemetry.file) filesRead.add(outcome.telemetry.file);
        return outcome;
      },
    },
  };
  let repaired = 0;
  const commitInput = commitFindingInput(() => { repaired += 1; });
  tools.commit_finding = {
    description: "Hand in this stack's whole finding once: applicability, determination, every finding, and cross-references. Cite by file and line range. A range that does not resolve sends you back once.",
    inputSchema: commitInput,
    execute: async (raw) => {
      const parsed = commitInput.safeParse(raw);
      if (repaired) opts.observe?.({ type: "note", tool: "commit_finding", stack_id: opts.manifest.stack_id, repaired_json_strings: repaired });
      if (!parsed.success) return reject("commit_finding", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
      const errors: string[] = [];
      const findings: Finding[] = [];
      parsed.data.findings.forEach((item, index) => {
        const built = buildFinding(item, item.id?.trim() || `F${index + 1}`);
        if (built.finding) findings.push(built.finding);
        else errors.push(built.error!);
      });
      if (errors.length && box.attempts < 1) return reject("commit_finding", errors);
      const refs: StackFinding["cross_references"] = (parsed.data.cross_references ?? []).map((ref) => {
        const row: StackFinding["cross_references"][number] = { target_description: ref.target_description, target_stack_id: ref.target_stack_id ?? null };
        const span = ref.file && ref.lines ? resolveLines(opts.corpus, { file: ref.file, lines: ref.lines }, allowed).span : undefined;
        if (span) row.span = span;
        return row;
      });
      const unread = opts.files.filter((f) => !filesRead.has(f));
      let reason = parsed.data.applicability_reason;
      if (errors.length) reason = `${reason} Unverified citations: ${errors.join(" | ")}`.slice(0, 2000);
      if (unread.length && parsed.data.determination === "needs_review") reason = `${reason} Not read: ${unread.join(", ")}`.trim();
      const degraded = errors.length > 0 && findings.length === 0;
      const finding: StackFinding = {
        stack_id: opts.manifest.stack_id,
        applicability: degraded ? "undeterminable" : parsed.data.applicability,
        applicability_reason: reason,
        determination: degraded ? "needs_review" : parsed.data.determination,
        findings,
        files_read: [...filesRead],
        files_unparseable: unparseable,
        cross_references: refs,
      };
      assertArtifact("stack-finding.schema.json", finding);
      box.finding = finding;
      box.done = true;
      return { model: { ok: true, summary: compactFinding(finding) }, telemetry: { tool: "commit_finding", ok: true } };
    },
  };
  const agent = await finishStack(opts, messages, tools, box, filesRead, unparseable);
  return agent;
}

async function finishStack(
  opts: { config: HarnessConfig; scenario: ScenarioInput; profileText: string; manifest: StackManifest; files: string[]; sink: AgentSink; observe?: Observe },
  messages: ModelMessage[],
  tools: Record<string, AgentTool>,
  box: { done: boolean; attempts: number; finding: StackFinding | null },
  filesRead: Set<string>,
  unparseable: string[],
): Promise<StackFinding> {
  const modelId = opts.config.model_config.subagent;
  const step = (maxSteps: number) => runAgent({
    modelId,
    system: STACK_ANALYST_PROMPT,
    messages,
    tools,
    maxSteps,
    stopWhen: () => box.done,
    providerPin: opts.config.model_config.provider_pin,
    cache: cacheOf(opts.config),
    onEvent: (event) => opts.observe?.({ ...event, stack_id: opts.manifest.stack_id }),
  });
  // Reads are capped by the tool budget; recording is not, so leave room for one call per finding.
  // A provider timeout ends the stack as a partial finding instead of failing the run.
  const safe = async (maxSteps: number) => {
    try {
      return await step(maxSteps);
    } catch (err) {
      opts.observe?.({ type: "error", stack_id: opts.manifest.stack_id, message: err instanceof Error ? err.message : String(err) });
      return null;
    }
  };
  const run = (await safe((opts.config.max_tool_calls_per_subagent ?? 16) + 14)) ?? { text: "", messages: [], usage: emptyUsage(), peak_context_tokens: 0, tool_calls: [], steps: 0 };
  messages.push(...run.messages);
  if (!box.finding && run.steps > 0) {
    messages.push({ role: "user", content: "Stop reading. Call commit_finding now with what you have." });
    const again = await safe(8);
    if (again) {
      run.usage.input += again.usage.input;
      run.usage.cached_input += again.usage.cached_input;
      run.usage.output += again.usage.output;
      run.tool_calls.push(...again.tool_calls);
    }
  }
  if (box.finding && !box.done) assertArtifact("stack-finding.schema.json", box.finding);
  if (!box.finding) {
    box.finding = {
      stack_id: opts.manifest.stack_id,
      applicability: "undeterminable",
      applicability_reason: `Partial: the analyst stopped before a verified finding. Not read: ${opts.files.filter((f) => !filesRead.has(f)).join(", ") || "(none)"}.`,
      determination: "needs_review",
      findings: [],
      files_read: [...filesRead],
      files_unparseable: unparseable,
      cross_references: [],
    };
    assertArtifact("stack-finding.schema.json", box.finding);
  }
  opts.sink(agentRecord(`subagent:${opts.manifest.stack_id}`, "subagent", modelId, run.usage, run.peak_context_tokens, run.tool_calls, box.attempts, opts.manifest.stack_id));
  if (opts.config.model_config.classifier === "jev" && box.finding.findings.length) {
    await applyJev(opts.sink, box.finding, opts.manifest.stack_id, opts.scenario.as_of, opts.profileText);
  }
  return box.finding;
}

async function applyJev(sink: AgentSink, finding: StackFinding, stackId: string, asOf: string, profileText: string): Promise<void> {
  const usage = emptyUsage();
  let model = "jev";
  let retries = 0;
  const calls: ToolCallRecord[] = [];
  const company = profileText.slice(0, 4000);
  for (const item of finding.findings) {
    try {
      const classified = await classifyFinding({ finding: item, company, asOf });
      item.finding_type = classified.finding_type;
      item.labels = requireRunningClockDate({ ...item.labels, ...classified.labels }, item.facts?.deadline_date);
      usage.input += classified.usage.input;
      usage.output += classified.usage.output;
      model = classified.model;
      calls.push({ tool: "classify", ok: true });
    } catch (err) {
      retries += 1;
      calls.push({ tool: "classify", ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }
  sink(agentRecord(`classifier:${stackId}`, "classifier", model, usage, usage.input, calls, retries, stackId));
}

export async function modelStage5(opts: Common & {
  summaries: unknown;
  windowDays: number;
  commit: (raw: z.infer<typeof reportTool>) => { ok: true } | { ok: false; errors: string[] };
  fetchStack: (stackId: string) => unknown;
  redispatch: (stackId: string, question: string) => Promise<unknown>;
}): Promise<{ retries: number }> {
  const box = { done: false, attempts: 0 };
  const tools: Record<string, AgentTool> = {
    fetch_stack: {
      description: "Return one family's tree and the finding already written for it. One stack at a time.",
      inputSchema: z.object({ stack_id: z.string() }),
      execute: async (raw) => {
        const { stack_id } = z.object({ stack_id: z.string() }).parse(raw);
        return { model: { ok: true, stack: opts.fetchStack(stack_id) }, telemetry: { tool: "fetch_stack", ok: true } };
      },
    },
    redispatch_stack: {
      description: "Re-run one stack's analyst from a fresh context, with the thin spot named. Use when the finding cannot support a join.",
      inputSchema: z.object({ stack_id: z.string(), question: z.string() }),
      execute: async (raw) => {
        const input = z.object({ stack_id: z.string(), question: z.string() }).parse(raw);
        const summary = await opts.redispatch(input.stack_id, input.question);
        return { model: { ok: true, summary }, telemetry: { tool: "redispatch_stack", ok: true } };
      },
    },
    commit_report: {
      description: "Persist the GC report: final labels, headline/what/why/when, rationales, cross-links, and change-item notes. Citations are copied from the findings.",
      inputSchema: reportTool,
      execute: async (raw) => {
        const parsed = reportTool.safeParse(raw);
        if (!parsed.success) {
          return { model: { ok: false, errors: parsed.error.issues.map((i) => i.message) }, telemetry: { tool: "commit_report", ok: false, error: "schema" } };
        }
        const result = opts.commit(parsed.data);
        if (!result.ok && box.attempts < 1) {
          box.attempts += 1;
          return { model: result, telemetry: { tool: "commit_report", ok: false, error: result.errors.join("; ") } };
        }
        box.done = true;
        return { model: { ok: true }, telemetry: { tool: "commit_report", ok: true } };
      },
    },
  };
  opts.messages.push({
    role: "user",
    content: stage5Task({
      custom: opts.scenario.custom_prompt ?? null,
      asOf: opts.scenario.as_of,
      windowDays: opts.windowDays,
      summaries: opts.summaries,
    }),
  });
  const run = await callOrchestrator(opts, tools, () => box.done, 12);
  if (!box.done) {
    opts.messages.push({ role: "user", content: "Call commit_report now. Include every finding you intend to relabel. Findings you omit are conserved." });
    const again = await callOrchestrator(opts, tools, () => box.done, 6);
    mergeAgent(run, again);
  }
  opts.sink(run);
  return { retries: box.attempts };
}

export function compactFinding(finding: StackFinding): unknown {
  return {
    stack_id: finding.stack_id,
    applicability: finding.applicability,
    determination: finding.determination,
    applicability_reason: finding.applicability_reason,
    findings: finding.findings.map((f) => ({
      id: f.id,
      change_ref: f.change_ref,
      finding_type: f.finding_type,
      labels: f.labels,
      reasoning: f.reasoning,
      deadline: f.facts?.deadline_date ?? null,
      trigger_quote: f.citations.trigger.quote?.slice(0, 400),
      clause_file: f.citations.clause.file,
      clause_quote: f.citations.clause.quote?.slice(0, 400),
    })),
    cross_references: finding.cross_references,
  };
}

async function callOrchestrator(opts: Common, tools: Record<string, AgentTool>, stopWhen: () => boolean, maxSteps: number): Promise<AgentRecord> {
  const modelId = opts.config.model_config.orchestrator;
  const run = await runAgent({
    modelId,
    system: ORCHESTRATOR_PROMPT,
    messages: opts.messages,
    tools,
    maxSteps,
    stopWhen,
    providerPin: opts.config.model_config.provider_pin,
    cache: cacheOf(opts.config),
    onEvent: (event) => opts.observe?.({ ...event, role: "orchestrator" }),
  });
  opts.messages.push(...run.messages);
  return agentRecord("orchestrator", "orchestrator", modelId, run.usage, run.peak_context_tokens, run.tool_calls, 0, null);
}

function mergeAgent(into: AgentRecord, extra: AgentRecord): void {
  into.tokens.input += extra.tokens.input;
  into.tokens.cached_input += extra.tokens.cached_input;
  into.tokens.output += extra.tokens.output;
  into.tokens.cache_write = (into.tokens.cache_write ?? 0) + (extra.tokens.cache_write ?? 0);
  into.tokens.reasoning = (into.tokens.reasoning ?? 0) + (extra.tokens.reasoning ?? 0);
  into.peak_context_tokens = Math.max(into.peak_context_tokens ?? 0, extra.peak_context_tokens ?? 0);
  into.tool_calls.push(...extra.tool_calls);
  into.retries += extra.retries + 1;
}

function agentRecord(
  agent_id: string,
  role: AgentRecord["role"],
  model: string,
  tokens: TokenUse,
  peak: number,
  tool_calls: ToolCallRecord[],
  retries: number,
  stack_id: string | null,
): AgentRecord {
  return {
    agent_id,
    role,
    stack_id,
    model,
    provider: providerFor(model),
    tokens,
    peak_context_tokens: peak,
    cost_usd: null,
    retries,
    tool_calls,
  };
}

function cpCount(text: string): number {
  return Array.from(text).length;
}

function toAmount(value: number | string | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (!value) return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

