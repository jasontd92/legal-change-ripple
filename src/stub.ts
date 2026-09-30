import { resolveSpan } from "./citations.js";
import type { Corpus } from "./corpus.js";
import { readNormalized } from "./corpus.js";
import { emptyUsage, providerFor } from "./models.js";
import { readPages, type FaultState } from "./readset.js";
import type { StackManifest } from "./stacks.js";
import type { AgentRecord, ChangeRecord, HarnessConfig, ScenarioInput, StackFinding } from "./types.js";

/** Offline stand-in. It locates real quotes so the artifacts validate; it does not judge. */
export function stubStage1(opts: {
  corpus: Corpus;
  scenario: ScenarioInput;
  profileText: string;
  newFile: string;
  newText: string;
  config: HarnessConfig;
}): { record: ChangeRecord; agent: AgentRecord } {
  const quote = firstLine(opts.newText, 40) ?? opts.newText.trim().slice(0, 80);
  const span = resolveSpan(opts.corpus, { file: opts.newFile, quote, section_label: "Snapshot" }, new Set([opts.newFile]));
  if (!span.span) throw new Error(`Stub could not locate a quote in ${opts.newFile}`);
  const exit = /applies only to (banks|physicians)/i.test(opts.newText) && /plumb/i.test(opts.profileText);
  const record: ChangeRecord = {
    items: [{
      id: "C1",
      summary: exit ? "The source does not reach this company." : "Stub reading of the new snapshot.",
      substantive: true,
      dismissal_reason: null,
      anchor: span.span,
      legal_status: "in_force",
      effective_date: null,
      applies_to: { jurisdictions: ["US"], entity_types: [], product_classes: [], thresholds: [] },
    }],
    company_gate: exit ? "exit" : "proceed",
    company_gate_reason: exit
      ? "The source applies only to a class this company is not, on the profile alone."
      : "The profile does not rule the change out.",
    source_chars_read: Array.from(opts.newText).length,
  };
  return { record, agent: stubAgent(opts.config, "orchestrator", "orchestrator", []) };
}

export function stubScope(opts: {
  stackIds: string[];
  custom: string | null;
  config: HarnessConfig;
}): { decisions: { stack_id: string; in_scope: boolean; reason: string }[]; agent: AgentRecord } {
  const prompt = (opts.custom ?? "").toLowerCase();
  const decisions = opts.stackIds.map((stack_id) => {
    const named = prompt.includes(stack_id.toLowerCase());
    const fleet = prompt.includes("fleet") && stack_id.toLowerCase().includes("fleet");
    if (named || fleet) {
      return { stack_id, in_scope: false, reason: `Excluded by custom instruction: ${opts.custom}` };
    }
    return { stack_id, in_scope: true, reason: "Stub default in." };
  });
  return { decisions, agent: stubAgent(opts.config, "orchestrator", "orchestrator", []) };
}

export function stubStack(opts: {
  corpus: Corpus;
  config: HarnessConfig;
  scenario: ScenarioInput;
  change: ChangeRecord;
  manifest: StackManifest;
  files: string[];
  fault: FaultState | null;
}): { finding: StackFinding; agent: AgentRecord } {
  const root = opts.manifest.members.find((m) => opts.files.includes(m.path))?.path ?? opts.files[0];
  const loaded = new Map<string, string>();
  if (root) {
    try {
      loaded.set(root, readNormalized(opts.corpus, root));
    } catch {
      /* recorded as unparseable below */
    }
  }
  const read = root
    ? readPages({ file: root, startPage: 1, files: loaded, allowed: new Set(loaded.keys()), fault: opts.fault })
    : null;
  const clauseQuote = root && loaded.get(root) ? firstLine(loaded.get(root)!, 20) : null;
  const clause = root && clauseQuote
    ? resolveSpan(opts.corpus, { file: root, quote: clauseQuote }, new Set(opts.files))
    : null;
  const triggerItem = opts.change.items.find((item) => item.substantive) ?? opts.change.items[0];
  const finding: StackFinding = {
    stack_id: opts.manifest.stack_id,
    applicability: "applies",
    applicability_reason: "Stub: the stack was in scope, so the analyst looked.",
    determination: clause?.span && triggerItem ? "affected" : "needs_review",
    findings: clause?.span && triggerItem ? [{
      id: "F1",
      change_ref: triggerItem.id,
      finding_type: "cost_exposure",
      hop_chain: [{ span: clause.span, inference: "Stub hop: the clause sits in this stack." }],
      citations: { trigger: triggerItem.anchor, clause: clause.span },
      absence: null,
      labels: {
        urgency: "obligation_clock_running",
        materiality: "material",
        direction: "exposure",
        response_type: "brief_finance",
        materiality_test: "Shifts a cost.",
        missing_fact: null,
        label_source: "self",
      },
      facts: { deadline_rule: null, deadline_date: null, exposure: null },
      reasoning: "Stub finding from the first locatable clause. urgency and materiality are placeholders.",
      open_questions: [],
    }] : [],
    files_read: read?.telemetry.ok && read.telemetry.file ? [read.telemetry.file] : [],
    files_unparseable: root && !loaded.has(root) ? [root] : [],
    cross_references: [],
  };
  const agent = stubAgent(opts.config, `subagent:${opts.manifest.stack_id}`, "subagent", read ? [read.telemetry] : [], opts.manifest.stack_id);
  return { finding, agent };
}

function firstLine(text: string, min: number): string | null {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length >= min) return trimmed;
  }
  const trimmed = text.trim();
  return trimmed.length >= 8 ? trimmed.slice(0, 200) : null;
}

function stubAgent(
  config: HarnessConfig,
  agent_id: string,
  role: AgentRecord["role"],
  tool_calls: AgentRecord["tool_calls"],
  stack_id?: string,
): AgentRecord {
  const model = role === "subagent" ? config.model_config.subagent : config.model_config.orchestrator;
  return {
    agent_id,
    role,
    stack_id: stack_id ?? null,
    model,
    provider: providerFor(model),
    tokens: { ...emptyUsage(), input: 12, output: 8 },
    peak_context_tokens: 12,
    cost_usd: null,
    retries: 0,
    tool_calls: tool_calls.map((call) => ({
      tool: call.tool,
      file: call.file ?? null,
      chars_returned: call.chars_returned ?? null,
      file_chars: call.file_chars ?? null,
      ok: call.ok,
      error: call.error ?? null,
      injected_fault: call.injected_fault === true,
    })),
  };
}
