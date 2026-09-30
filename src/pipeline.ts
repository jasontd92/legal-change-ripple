import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ModelMessage } from "ai";
import { compactFinding, modelStack, modelStage1, modelStage3, modelStage5 } from "./agents.js";
import { applyOverrides, loadCorpus, loadProfile, readNormalized, triggerFiles, type Corpus } from "./corpus.js";
import { buildIncorporates } from "./incorporates.js";
import { providerFor } from "./models.js";
import { requireRunningClockDate } from "./labels.js";
import { urgencyWindowFromPrompt, rankReport, type Accepted } from "./ranking.js";
import { contractVersion, findingPath, readJson, writeJson } from "./paths.js";
import { assertArtifact } from "./schema.js";
import { diffSnapshots, type RawChange } from "./stage0.js";
import { buildStacks, manifestFor, manifestLine, readingSet, type Stack, type StackManifest } from "./stacks.js";
import { stubScope, stubStack, stubStage1 } from "./stub.js";
import type { FaultState } from "./readset.js";
import type {
  AgentRecord,
  ChangeRecord,
  CoverageStatement,
  HarnessConfig,
  ImpactReport,
  RunTrace,
  ScenarioInput,
  ScopeTrace,
  StackFinding,
  StageRecord,
} from "./types.js";

export type RunMode =
  | { kind: "full" }
  | { kind: "stage"; stage: "1" | "3" | "4" | "5"; stackId?: string };

export async function executeRun(opts: {
  repo: string;
  runDir: string;
  scenario: ScenarioInput;
  config: HarnessConfig;
  mode: RunMode;
  resume?: boolean;
}): Promise<RunTrace> {
  const config: HarnessConfig = opts.resume
    ? { ...opts.config, faults: { ...opts.config.faults, kill_after: undefined } }
    : opts.config;
  const scenario = applyOverrides(opts.scenario, config);
  assertArtifact("scenario-input.schema.json", scenario);
  mkdirSync(opts.runDir, { recursive: true });
  writeJson(path.join(opts.runDir, "input.json"), scenario);
  writeJson(path.join(opts.runDir, "config.json"), opts.config);
  const activeConfig = config;
  const corpus = loadCorpus(opts.repo, scenario.corpus_root);
  const stacks = buildStacks(corpus.docs);
  const edges = buildIncorporates(corpus);
  const manifests = new Map<string, StackManifest>();
  for (const stack of stacks) {
    manifests.set(stack.stack_id, manifestFor(scenario.corpus_root, stack, edges, (file) => readNormalized(corpus, file)));
  }
  const state = new RunDir(opts.repo, opts.runDir, scenario, activeConfig, corpus, stacks, manifests);
  if (opts.resume) state.load();
  state.event({ type: "run", phase: "started", run_id: path.basename(opts.runDir) });
  try {
    if (opts.mode.kind === "stage") await runStage(state, opts.mode);
    else await runFull(state);
  } catch (err) {
    state.status = state.status === "partial" ? "partial" : "failed";
    state.event({ type: "error", message: err instanceof Error ? err.message : String(err) });
    state.event({ type: "run", phase: "finished", status: state.status });
    state.flush();
    throw err;
  }
  state.event({ type: "run", phase: "finished", status: state.status });
  state.flush();
  return state.trace();
}

async function runFull(state: RunDir): Promise<void> {
  if (!state.raw) {
    noteStage(state, "0", "started");
    const raw = computeRaw(state);
    state.raw = raw;
    writeJson(path.join(state.runDir, "raw_change.json"), raw);
    state.addStage("0", raw.exit ? "no_substantive_diff" : "diff", false);
    if (raw.exit) {
      state.status = state.resumed ? "resumed_completed" : "completed";
      return;
    }
  } else if (state.raw.exit) {
    state.status = "completed";
    return;
  }
  if (stopAfter(state, "0")) return partial(state);
  await ensureChange(state, false);
  if (state.killed) return;
  if (earlyExit(state)) return;
  if (stopAfter(state, "1")) return partial(state);
  await ensureScope(state, false);
  if (state.killed) return;
  if (stopAfter(state, "3")) return partial(state);
  await fanOut(state);
  if (state.killed || stopAfter(state, "4")) return partial(state);
  if (state.resumeSkip && existsSync(path.join(state.runDir, "impact_report.json"))) {
    state.status = "resumed_completed";
    return;
  }
  await ensureReport(state, false);
  state.status = state.resumed ? "resumed_completed" : "completed";
}

async function runStage(state: RunDir, mode: Extract<RunMode, { kind: "stage" }>): Promise<void> {
  if (mode.stage === "1") {
    noteStage(state, "0", "started");
    const raw = computeRaw(state);
    state.raw = raw;
    writeJson(path.join(state.runDir, "raw_change.json"), raw);
    state.addStage("0", raw.exit ? "no_substantive_diff" : "diff", false);
    if (raw.exit) {
      state.status = "completed";
      return;
    }
    await ensureChange(state, false);
    state.status = "completed";
    return;
  }
  if (mode.stage === "3") {
    state.change = readJson<ChangeRecord>(path.join(state.runDir, "change_record.json"));
    state.addStage("1", "injected", true);
    await ensureScope(state, false);
    state.status = "completed";
    return;
  }
  if (mode.stage === "4") {
    if (!mode.stackId) throw new Error("stage 4 requires --stack");
    state.change = readJson<ChangeRecord>(path.join(state.runDir, "change_record.json"));
    state.addStage("1", "injected", true);
    const manifest = state.manifests.get(mode.stackId);
    if (!manifest) throw new Error(`Unknown stack ${mode.stackId}`);
    await analyse(state, manifest, null);
    state.addStage("4", "one_stack", false);
    state.status = "completed";
    return;
  }
  state.change = readJson<ChangeRecord>(path.join(state.runDir, "change_record.json"));
  state.addStage("1", "injected", true);
  state.addStage("4", "injected", true);
  const scopeFile = path.join(state.runDir, "scope_trace.json");
  if (existsSync(scopeFile)) state.scope = readJson<ScopeTrace>(scopeFile);
  await ensureReport(state, false);
  state.status = "completed";
}

function computeRaw(state: RunDir): RawChange {
  const files = triggerFiles(state.corpus, state.scenario);
  const next = readNormalized(state.corpus, files.newFile);
  const prev = files.oldFile ? readNormalized(state.corpus, files.oldFile) : null;
  state.newFile = files.newFile;
  state.oldFile = files.oldFile;
  state.newText = next;
  return diffSnapshots(prev, next, files.oldFile, files.newFile);
}

async function ensureChange(state: RunDir, injected: boolean): Promise<void> {
  const file = path.join(state.runDir, "change_record.json");
  if (existsSync(file) && state.resumeSkip) {
    state.change = readJson<ChangeRecord>(file);
    return;
  }
  noteStage(state, "1", "started");
  const started = new Date().toISOString();
  if (!state.newText || !state.newFile) {
    const raw = state.raw ?? computeRaw(state);
    state.raw = raw;
    if (!state.newText) throw new Error("Stage 1 has no snapshot text.");
  }
  const profile = loadProfile(state.corpus, state.scenario.profile);
  if (isStub(state.config.model_config.orchestrator)) {
    const stub = stubStage1({
      corpus: state.corpus,
      scenario: state.scenario,
      profileText: profile.text,
      newFile: state.newFile!,
      newText: state.newText!,
      config: state.config,
    });
    state.change = stub.record;
    state.agents.set(stub.agent.agent_id, stub.agent);
  } else {
    const result = await modelStage1({
      config: state.config,
      scenario: state.scenario,
      messages: state.messages,
      sink: (agent) => state.absorb(agent),
      corpus: state.corpus,
      profileText: profile.text,
      oldFile: state.oldFile,
      newFile: state.newFile!,
      preview: state.raw?.preview ?? "",
      newText: state.newText!,
      observe: (event) => state.event(event),
    });
    state.change = result.record;
  }
  assertArtifact("change-record.schema.json", state.change);
  writeJson(file, state.change);
  const ended = new Date().toISOString();
  state.addStageAt("1", "committed", injected, started, ended);
  state.addStageAt("1b", state.change.company_gate, injected, started, ended);
  state.saveTranscript();
  state.flush();
}

function earlyExit(state: RunDir): boolean {
  const change = state.change;
  if (!change) return false;
  const gate = change.company_gate === "exit";
  const noise = change.items.every((item) => !item.substantive);
  if (!gate && !noise) return false;
  const reason = gate
    ? `Company gate exited: ${change.company_gate_reason ?? "profile excludes the change."}`
    : "Every change item was dismissed as noise.";
  const report: ImpactReport = {
    items: [],
    not_material: [],
    cross_links: [],
    cross_reference_resolutions: [],
    change_item_closure: change.items.map((item) => ({
      change_ref: item.id,
      status: "unaddressed",
      reason,
    })),
  };
  const coverage: CoverageStatement = { reviewed_stacks: [], excluded_stacks: [], unparseable_files: [], out_of_scope: [] };
  assertArtifact("impact-report.schema.json", report);
  assertArtifact("coverage-statement.schema.json", coverage);
  writeJson(path.join(state.runDir, "impact_report.json"), report);
  writeJson(path.join(state.runDir, "coverage.json"), coverage);
  state.status = state.resumed ? "resumed_completed" : "completed";
  state.event({ type: "early_exit", reason });
  return true;
}

async function ensureScope(state: RunDir, injected: boolean): Promise<void> {
  const file = path.join(state.runDir, "scope_trace.json");
  if (existsSync(file) && state.resumeSkip) {
    state.scope = readJson<ScopeTrace>(file);
    state.loadExtras();
    return;
  }
  if (!state.change) throw new Error("Stage 3 needs a change record.");
  noteStage(state, "3", "started");
  const started = new Date().toISOString();
  const known = new Set(state.stacks.map((s) => s.stack_id));
  const lines = state.stacks.map((s) => manifestLine(state.manifests.get(s.stack_id)!));
  let decisions: { stack_id: string; in_scope: boolean; reason: string }[] = [];
  let extras = new Map<string, string>();
  if (isStub(state.config.model_config.orchestrator)) {
    const stub = stubScope({ stackIds: [...known], custom: state.scenario.custom_prompt ?? null, config: state.config });
    decisions = stub.decisions;
    state.absorb(stub.agent);
  } else {
    const result = await modelStage3({
      config: state.config,
      scenario: state.scenario,
      messages: state.messages,
      sink: (agent) => state.absorb(agent),
      change: state.change,
      lines,
      known,
      observe: (event) => state.event(event),
    });
    decisions = result.decisions;
    extras = result.extras;
  }
  const byId = new Map(decisions.map((d) => [d.stack_id, d]));
  const scope: ScopeTrace = {
    stacks: state.stacks.map((stack) => {
      const decision = byId.get(stack.stack_id);
      if (!decision || (!decision.in_scope && !decision.reason.trim())) {
        return { stack_id: stack.stack_id, in_scope: true, reason: "Default in: not excluded with a reason." };
      }
      return { stack_id: stack.stack_id, in_scope: decision.in_scope, reason: decision.reason.trim() };
    }),
  };
  assertArtifact("scope-trace.schema.json", scope);
  writeJson(file, scope);
  writeJson(path.join(state.runDir, "scope_extras.json"), Object.fromEntries(extras));
  state.scope = scope;
  state.extras = extras;
  state.addStageAt("3", "scoped", injected, started, new Date().toISOString());
  state.saveTranscript();
  state.flush();
}

function capScopeToSlice(state: RunDir): void {
  const slice = state.config.only_stacks;
  if (!slice || !state.scope) return;
  if (slice.length === 0) throw new Error("only_stacks is empty. Omit it to review every in-scope stack.");
  const keep = new Set(slice);
  const known = new Set(state.stacks.map((stack) => stack.stack_id));
  const unknown = slice.filter((id) => !known.has(id));
  state.scope = {
    stacks: state.scope.stacks.map((row) => {
      if (!row.in_scope || keep.has(row.stack_id)) return row;
      return { stack_id: row.stack_id, in_scope: false, reason: `Outside only_stacks. Model scope was: ${row.reason}` };
    }),
  };
  assertArtifact("scope-trace.schema.json", state.scope);
  writeJson(path.join(state.runDir, "scope_trace.json"), state.scope);
  const kept = state.scope.stacks.filter((row) => row.in_scope && keep.has(row.stack_id)).length;
  state.event({ type: "stack_slice", kept, listed: slice.length, unknown });
}

/** Analyse stacks with `concurrency` workers. Each finding is written as its stack finishes, so a crash resumes cleanly. */
async function analysePool(state: RunDir, rows: ScopeTrace["stacks"], onDone?: (row: ScopeTrace["stacks"][number], finding: StackFinding) => void): Promise<void> {
  const limit = Math.max(1, state.config.concurrency ?? 4);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, Math.max(rows.length, 1)) }, async () => {
    for (;;) {
      if (killed(state)) return;
      const index = cursor++;
      if (index >= rows.length) return;
      const row = rows[index]!;
      const manifest = state.manifests.get(row.stack_id);
      if (!manifest) continue;
      const finding = await analyse(state, manifest, null);
      onDone?.(row, finding);
      state.flush();
      if (killed(state)) return;
    }
  });
  if (rows.length) await Promise.all(workers);
}

async function fanOut(state: RunDir): Promise<void> {
  if (!state.scope || !state.change) throw new Error("Fan-out needs a scope and a change record.");
  capScopeToSlice(state);
  const started = new Date().toISOString();
  const pending = state.scope!.stacks.filter((row) => row.in_scope && !existsSync(findingPath(state.runDir, row.stack_id)));
  noteStage(state, "4", "started");
  await analysePool(state, pending);
  state.addStageAt("4", killed(state) ? "partial" : "fanout", false, started, new Date().toISOString());
}

async function analyse(state: RunDir, manifest: StackManifest, prior: { question: string; finding: StackFinding } | null): Promise<StackFinding> {
  const stack = state.stacks.find((s) => s.stack_id === manifest.stack_id);
  if (!stack || !state.change) throw new Error(`Missing stack ${manifest.stack_id}`);
  state.event({ type: "stack", phase: "started", stack_id: manifest.stack_id });
  const files = readingSet(state.scenario.corpus_root, stack, state.edgesOf(stack), state.corpus.byId);
  const fault = faultState(state);
  const profile = loadProfile(state.corpus, state.scenario.profile);
  let finding: StackFinding;
  if (isStub(state.config.model_config.subagent)) {
    const stub = stubStack({
      corpus: state.corpus,
      config: state.config,
      scenario: state.scenario,
      change: state.change,
      manifest,
      files,
      fault,
    });
    for (const call of stub.agent.tool_calls) {
      state.event({ type: "tool", phase: "started", tool: call.tool, stack_id: manifest.stack_id, file: call.file });
      state.event({ type: "tool", phase: "finished", tool: call.tool, stack_id: manifest.stack_id, file: call.file, ok: call.ok, error: call.error });
    }
    finding = stub.finding;
    state.absorb(stub.agent);
  } else {
    finding = await modelStack({
      config: state.config,
      scenario: state.scenario,
      corpus: state.corpus,
      profileText: profile.text,
      change: state.change,
      manifest,
      files,
      extra: state.extras.get(manifest.stack_id) ?? null,
      prior,
      fault,
      sink: (agent) => state.absorb(agent),
      observe: (event) => state.event(event),
    });
  }
  assertArtifact("stack-finding.schema.json", finding);
  writeJson(findingPath(state.runDir, manifest.stack_id), finding);
  state.event({ type: "finding", stack_id: manifest.stack_id, determination: finding.determination });
  return finding;
}

async function ensureReport(state: RunDir, injected: boolean): Promise<void> {
  noteStage(state, "5", "started");
  const started = new Date().toISOString();
  const findings = loadFindings(state);
  const windowDays = urgencyWindowFromPrompt(state.scenario.custom_prompt);
  let accepted: Accepted[] = findings.flatMap((stack) => stack.findings.map((finding) => ({ stack_id: stack.stack_id, finding, labels: finding.labels })));
  let cross_links: ImpactReport["cross_links"] = [];
  let resolutions: Record<string, unknown>[] = [];
  const closureNotes = new Map<string, string>();
  if (!isStub(state.config.model_config.orchestrator) && findings.some((f) => f.findings.length || f.cross_references.length)) {
    const summaries = findings.map(compactFinding);
    let redispatches = new Map<string, number>();
    await modelStage5({
      config: state.config,
      scenario: state.scenario,
      messages: state.messages,
      sink: (agent) => state.absorb(agent),
      observe: (event) => state.event(event),
      summaries,
      windowDays,
      fetchStack: (stackId) => fetchStack(state, stackId),
      redispatch: async (stackId, question) => {
        const n = redispatches.get(stackId) ?? 0;
        if (n >= 2) return { ok: false, error: "Redispatch budget exhausted for this stack." };
        redispatches.set(stackId, n + 1);
        const manifest = state.manifests.get(stackId);
        const current = findings.find((f) => f.stack_id === stackId);
        if (!manifest || !current) return { ok: false, error: `Unknown stack ${stackId}` };
        const next = await analyse(state, manifest, { question, finding: current });
        const at = findings.findIndex((f) => f.stack_id === stackId);
        if (at >= 0) findings[at] = next;
        return compactFinding(next);
      },
      commit: (raw) => {
        const byFinding = new Map(findings.flatMap((stack) => stack.findings.map((finding) => [`${stack.stack_id}::${finding.id}`, { stack, finding }])));
        accepted = [];
        for (const item of raw.items) {
          const hit = byFinding.get(`${item.stack_id}::${item.finding_id}`);
          if (!hit) continue;
          accepted.push({
            stack_id: item.stack_id,
            finding: hit.finding,
            labels: requireRunningClockDate(
              item.labels ? { ...hit.finding.labels, ...item.labels, label_source: hit.finding.labels.label_source ?? "self" } : hit.finding.labels,
              hit.finding.facts?.deadline_date,
            ),
            headline: item.headline,
            what: item.what,
            why: item.why,
            when: item.when,
            rationale: item.rationale,
          });
        }
        cross_links = raw.cross_links ?? [];
        resolutions = raw.resolutions ?? [];
        for (const note of raw.closure_notes ?? []) closureNotes.set(note.change_ref, note.reason);
        return { ok: true };
      },
    });
  }
  if (!state.change) throw new Error("Stage 5 needs a change record.");
  const report = rankReport({
    change: state.change,
    findings,
    accepted,
    asOf: state.scenario.as_of,
    windowDays,
    cross_links,
    resolutions,
    closureNotes,
  });
  if (state.config.ranking === "model") applyModelOrder(report, accepted);
  const coverage = coverageFrom(state, findings);
  assertArtifact("impact-report.schema.json", report);
  assertArtifact("coverage-statement.schema.json", coverage);
  writeJson(path.join(state.runDir, "impact_report.json"), report);
  writeJson(path.join(state.runDir, "coverage.json"), coverage);
  state.addStageAt("5", "reported", injected, started, new Date().toISOString());
  state.saveTranscript();
}

function applyModelOrder(report: ImpactReport, accepted: Accepted[]): void {
  const order = new Map(accepted.map((row, index) => [`${row.stack_id}::${row.finding.id}`, index]));
  const shown = report.items.filter((item) => order.has(`${item.stack_id}::${item.finding_id}`));
  const rest = report.items.filter((item) => !order.has(`${item.stack_id}::${item.finding_id}`));
  shown.sort((a, b) => (order.get(`${a.stack_id}::${a.finding_id}`) ?? 0) - (order.get(`${b.stack_id}::${b.finding_id}`) ?? 0));
  report.items = [...shown, ...rest].map((item, index) => ({ ...item, rank: index + 1 }));
}

function fetchStack(state: RunDir, stackId: string): unknown {
  const manifest = state.manifests.get(stackId);
  const file = findingPath(state.runDir, stackId);
  const finding = existsSync(file) ? readJson<StackFinding>(file) : null;
  return { manifest: manifest ?? null, finding };
}

function loadFindings(state: RunDir): StackFinding[] {
  const ids = state.scope
    ? state.scope.stacks.filter((row) => row.in_scope).map((row) => row.stack_id)
    : state.stacks.map((s) => s.stack_id).filter((id) => existsSync(findingPath(state.runDir, id)));
  const out: StackFinding[] = [];
  for (const id of ids) {
    const file = findingPath(state.runDir, id);
    if (!existsSync(file)) continue;
    out.push(readJson<StackFinding>(file));
  }
  return out;
}

function coverageFrom(state: RunDir, findings: StackFinding[]): CoverageStatement {
  const scope = state.scope;
  const reviewed = findings.map((f) => f.stack_id);
  const excluded = scope ? scope.stacks.filter((row) => !row.in_scope) : [];
  return {
    reviewed_stacks: reviewed,
    excluded_stacks: excluded.map((row) => ({ stack_id: row.stack_id, reason: row.reason })),
    unparseable_files: [...new Set(findings.flatMap((f) => f.files_unparseable))],
    out_of_scope: excluded.map((row) => row.stack_id),
  };
}

function faultState(state: RunDir): FaultState | null {
  const spec = state.config.faults?.tool_error;
  if (!spec) return null;
  return { tool_error: spec, counts: new Map() };
}

function killed(state: RunDir): boolean {
  const kill = state.config.faults?.kill_after;
  if (!kill?.stack_count) return false;
  const done = state.scope?.stacks.filter((row) => row.in_scope && existsSync(findingPath(state.runDir, row.stack_id))).length ?? 0;
  if (done >= kill.stack_count) {
    state.killed = true;
    return true;
  }
  return false;
}

function stopAfter(state: RunDir, stage: string): boolean {
  return state.config.faults?.kill_after?.stage === stage;
}

function partial(state: RunDir): void {
  state.status = "partial";
  state.killed = true;
  state.event({ type: "kill_after", stage: state.config.faults?.kill_after?.stage ?? null, stack_count: state.config.faults?.kill_after?.stack_count ?? null });
}

function isStub(model: string): boolean {
  return model === "stub";
}

const STAGE_NAME: Record<string, string> = {
  "0": "diff",
  "1": "understand",
  "1b": "company gate",
  "3": "scope",
  "4": "stacks",
  "5": "report",
};

function noteStage(state: RunDir, stage: string, phase: "started"): void {
  state.event({ type: "stage", phase, stage, name: STAGE_NAME[stage] ?? stage });
}

class RunDir {
  messages: ModelMessage[] = [];
  agents = new Map<string, AgentRecord>();
  stages: StageRecord[] = [];
  status: RunTrace["status"] = "partial";
  change: ChangeRecord | null = null;
  scope: ScopeTrace | null = null;
  extras = new Map<string, string>();
  raw: RawChange | null = null;
  newFile: string | null = null;
  oldFile: string | null = null;
  newText: string | null = null;
  killed = false;
  resumed: boolean;
  resumeSkip: boolean;
  private edges: ReturnType<typeof buildIncorporates>;

  constructor(
    readonly repo: string,
    readonly runDir: string,
    readonly scenario: ScenarioInput,
    readonly config: HarnessConfig,
    readonly corpus: Corpus,
    readonly stacks: Stack[],
    readonly manifests: Map<string, StackManifest>,
  ) {
    this.edges = buildIncorporates(corpus);
    const edgeFile = path.join(runDir, "incorporates.json");
    if (!existsSync(edgeFile)) writeJson(edgeFile, { edges: this.edges });
    this.resumed = false;
    this.resumeSkip = false;
  }

  edgesOf(stack: Stack) {
    const ids = new Set(stack.members.map((m) => m.doc_id));
    return this.edges.filter((edge) => ids.has(edge.source_doc_id));
  }

  load(): void {
    this.resumed = true;
    this.resumeSkip = true;
    this.status = "partial";
    const transcript = path.join(this.runDir, "transcript.json");
    if (existsSync(transcript)) this.messages = readJson<ModelMessage[]>(transcript);
    const runFile = path.join(this.runDir, "run.json");
    if (existsSync(runFile)) {
      const prior = readJson<RunTrace>(runFile);
      this.stages = prior.stages ?? [];
      for (const agent of prior.agents ?? []) this.agents.set(agent.agent_id, agent);
    }
    const rawFile = path.join(this.runDir, "raw_change.json");
    if (existsSync(rawFile)) this.raw = readJson<RawChange>(rawFile);
    const changeFile = path.join(this.runDir, "change_record.json");
    if (existsSync(changeFile)) this.change = readJson<ChangeRecord>(changeFile);
    const scopeFile = path.join(this.runDir, "scope_trace.json");
    if (existsSync(scopeFile)) this.scope = readJson<ScopeTrace>(scopeFile);
    this.loadExtras();
    if (this.raw && !this.raw.exit) {
      const files = triggerFiles(this.corpus, this.scenario);
      this.newFile = files.newFile;
      this.oldFile = files.oldFile;
      this.newText = readNormalized(this.corpus, files.newFile);
    }
  }

  loadExtras(): void {
    const file = path.join(this.runDir, "scope_extras.json");
    if (!existsSync(file)) return;
    const raw = readJson<Record<string, string>>(file);
    this.extras = new Map(Object.entries(raw));
  }

  absorb(agent: AgentRecord): void {
    const price = this.config.prices?.[agent.model];
    if (price) {
      const cached = agent.tokens.cached_input ?? 0;
      const fresh = Math.max(0, agent.tokens.input - cached);
      agent.cost_usd = (fresh * price.input + cached * (price.cached_input ?? price.input) + agent.tokens.output * price.output) / 1_000_000;
    }
    agent.provider = agent.provider ?? providerFor(agent.model);
    const prev = this.agents.get(agent.agent_id);
    if (!prev || agent.agent_id === "orchestrator") {
      if (prev && agent.agent_id === "orchestrator") {
        prev.tokens.input += agent.tokens.input;
        prev.tokens.cached_input += agent.tokens.cached_input;
        prev.tokens.output += agent.tokens.output;
        prev.tokens.cache_write = (prev.tokens.cache_write ?? 0) + (agent.tokens.cache_write ?? 0);
        prev.tokens.reasoning = (prev.tokens.reasoning ?? 0) + (agent.tokens.reasoning ?? 0);
        prev.peak_context_tokens = Math.max(prev.peak_context_tokens ?? 0, agent.peak_context_tokens ?? 0);
        prev.tool_calls.push(...agent.tool_calls);
        prev.retries += agent.retries;
        prev.cost_usd = sumCost(prev.cost_usd, agent.cost_usd);
        return;
      }
    }
    this.agents.set(agent.agent_id, agent);
  }

  addStage(stage: StageRecord["stage"], status: string, injected: boolean): void {
    const now = new Date().toISOString();
    this.addStageAt(stage, status, injected, now, now);
  }

  addStageAt(stage: StageRecord["stage"], status: string, injected: boolean, started: string, ended: string): void {
    this.stages = this.stages.filter((row) => row.stage !== stage);
    this.stages.push({ stage, status, started_at: started, ended_at: ended, injected });
    this.event({ type: "stage", phase: "finished", stage, name: STAGE_NAME[stage] ?? stage, status });
  }

  event(value: Record<string, unknown>): void {
    mkdirSync(this.runDir, { recursive: true });
    appendFileSync(path.join(this.runDir, "trace.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), ...value })}\n`);
  }

  saveTranscript(): void {
    writeJson(path.join(this.runDir, "transcript.json"), this.messages);
  }

  flush(): void {
    const trace = this.trace();
    assertArtifact("run-trace.schema.json", trace);
    writeJson(path.join(this.runDir, "run.json"), trace);
  }

  trace(): RunTrace {
    return {
      run_id: path.basename(this.runDir),
      contract_version: contractVersion(this.repo),
      scenario: this.scenario,
      model_config: this.config.model_config,
      status: this.status,
      stages: this.stages,
      agents: [...this.agents.values()],
      compactions: 0,
    };
  }
}

function sumCost(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

export type ReviewStep = {
  id: string;
  label: string;
  state: "done" | "failed";
  detail: string;
};

/** One unit of a review. `running` is the live stream status; run.json stays `partial` until the review settles. */
export type AdvanceResult = {
  run_id: string;
  done: boolean;
  status: "running" | "completed" | "failed" | "partial" | "unchanged" | "resumed_completed";
  step: ReviewStep | null;
  /** Every unit this call finished, in order. A stack batch finishes several. */
  steps?: ReviewStep[];
  next_id: string | null;
  next_label: string | null;
};

/**
 * Runs the next unfinished unit of a review and returns. Diff, the company gate,
 * scoping, each in-scope stack, and the ranked report are separate calls so a
 * session can show them as they finish. Artifacts on disk are the cursor.
 */
export async function advanceReview(opts: {
  repo: string;
  runDir: string;
  scenario: ScenarioInput;
  config: HarnessConfig;
}): Promise<AdvanceResult> {
  const scenario = applyOverrides(opts.scenario, opts.config);
  assertArtifact("scenario-input.schema.json", scenario);
  mkdirSync(opts.runDir, { recursive: true });
  const fresh = !existsSync(path.join(opts.runDir, "input.json"));
  if (fresh) {
    writeJson(path.join(opts.runDir, "input.json"), scenario);
    writeJson(path.join(opts.runDir, "config.json"), opts.config);
  }
  const corpus = loadCorpus(opts.repo, scenario.corpus_root);
  const stacks = buildStacks(corpus.docs);
  const edges = buildIncorporates(corpus);
  const manifests = new Map<string, StackManifest>();
  for (const stack of stacks) {
    manifests.set(stack.stack_id, manifestFor(scenario.corpus_root, stack, edges, (file) => readNormalized(corpus, file)));
  }
  const state = new RunDir(opts.repo, opts.runDir, scenario, opts.config, corpus, stacks, manifests);
  const run_id = path.basename(opts.runDir);
  if (!fresh) {
    state.load();
    const runFile = path.join(opts.runDir, "run.json");
    if (existsSync(runFile)) {
      const prior = readJson<RunTrace>(runFile);
      if (prior.status === "completed" || prior.status === "failed" || prior.status === "resumed_completed") {
        return { run_id, done: true, status: prior.status, step: null, next_id: null, next_label: null };
      }
    }
  } else {
    state.event({ type: "run", phase: "started", run_id });
  }
  try {
    const result = await nextUnit(state);
    state.flush();
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    state.status = "failed";
    state.event({ type: "error", message });
    state.event({ type: "run", phase: "finished", status: "failed" });
    state.flush();
    return {
      run_id,
      done: true,
      status: "failed",
      step: { id: "error", label: "Stopped", state: "failed", detail: clip(message) },
      next_id: null,
      next_label: null,
    };
  }
}

async function nextUnit(state: RunDir): Promise<AdvanceResult> {
  const reportFile = path.join(state.runDir, "impact_report.json");
  if (existsSync(reportFile)) {
    state.status = "completed";
    return settle(state, "completed", null);
  }
  if (!state.raw) {
    noteStage(state, "0", "started");
    const raw = computeRaw(state);
    state.raw = raw;
    writeJson(path.join(state.runDir, "raw_change.json"), raw);
    state.addStage("0", raw.exit ? "no_substantive_diff" : "diff", false);
    if (raw.exit) return settle(state, "completed", { id: "diff", label: "Change", state: "done", detail: clip(raw.reason ?? "No substantive change.") });
    return progress(state, { id: "diff", label: "Change", state: "done", detail: `Substantive change in ${raw.new_file}.` });
  }
  if (state.raw.exit) return settle(state, "completed", { id: "diff", label: "Change", state: "done", detail: clip(state.raw.reason ?? "No substantive change.") });
  if (!state.change) {
    await ensureChange(state, false);
    const change = state.change as ChangeRecord | null;
    if (!change) throw new Error("Stage 1 produced no change record.");
    if (earlyExit(state)) {
      const reason = change.company_gate === "exit"
        ? (change.company_gate_reason ?? "The company profile makes this authority inapplicable.")
        : "Every change item was dismissed as noise.";
      return settle(state, "completed", { id: "gate", label: "Company gate", state: "done", detail: clip(reason) });
    }
    return progress(state, { id: "gate", label: "Company gate", state: "done", detail: clip(`Gate ${change.company_gate}. ${change.items.length} change items.`) });
  }
  if (!state.scope) {
    await ensureScope(state, false);
    const scope = state.scope as ScopeTrace | null;
    if (!scope) throw new Error("Stage 3 produced no scope.");
    const included = scope.stacks.filter((row) => row.in_scope).length;
    return progress(state, { id: "scope", label: "Scope", state: "done", detail: `${included} in scope, ${scope.stacks.length - included} excluded.` });
  }
  const pending = state.scope.stacks.filter((row) => row.in_scope && !existsSync(findingPath(state.runDir, row.stack_id)));
  if (pending.length) {
    const inScope = state.scope.stacks.filter((row) => row.in_scope).length;
    if (pending.length === inScope) noteStage(state, "4", "started");
    // One durable step runs a batch through the worker pool. Twice the pool width keeps one slow stack from idling the rest.
    const batch = pending.slice(0, stackBatch(state));
    const unknown = batch.find((row) => !state.manifests.get(row.stack_id));
    if (unknown) throw new Error(`Unknown stack ${unknown.stack_id}`);
    const steps: ReviewStep[] = [];
    await analysePool(state, batch, (row, finding) => {
      steps.push({
        id: `stack:${row.stack_id}`,
        label: `Document cluster · ${row.stack_id}`,
        state: "done",
        detail: `${finding.determination} · ${finding.findings.length} finding${finding.findings.length === 1 ? "" : "s"}.`,
      });
    });
    if (batch.length === pending.length) {
      state.addStageAt("4", "fanout", false, new Date().toISOString(), new Date().toISOString());
    }
    return { ...progress(state, steps[steps.length - 1] ?? null), steps };
  }
  await ensureReport(state, false);
  const report = readJson<ImpactReport>(reportFile);
  return settle(state, "completed", { id: "report", label: "Ranked report", state: "done", detail: `${report.items.length} ranked item${report.items.length === 1 ? "" : "s"}.` });
}

function stackBatch(state: RunDir): number {
  return Math.max(1, state.config.concurrency ?? 4) * 2;
}

function progress(state: RunDir, step: ReviewStep | null): AdvanceResult {
  state.status = "partial";
  const next = peekNext(state);
  return { run_id: path.basename(state.runDir), done: false, status: "running", step, ...next };
}

function settle(state: RunDir, status: "completed" | "failed" | "partial", step: ReviewStep | null): AdvanceResult {
  state.status = status;
  state.event({ type: "run", phase: "finished", status });
  return { run_id: path.basename(state.runDir), done: true, status, step, next_id: null, next_label: null };
}

function peekNext(state: RunDir): { next_id: string | null; next_label: string | null } {
  if (!state.raw || state.raw.exit) return { next_id: null, next_label: null };
  if (!state.change) return { next_id: "gate", next_label: "Company gate" };
  if (existsSync(path.join(state.runDir, "impact_report.json")) && !state.scope) return { next_id: null, next_label: null };
  if (!state.scope) return { next_id: "scope", next_label: "Scope" };
  const pending = state.scope.stacks.filter((row) => row.in_scope && !existsSync(findingPath(state.runDir, row.stack_id)));
  const next = pending[0];
  if (next) {
    const count = Math.min(pending.length, stackBatch(state));
    return { next_id: `stack:${next.stack_id}`, next_label: count > 1 ? `Document clusters · next ${count} of ${pending.length}` : `Document cluster · ${next.stack_id}` };
  }
  if (!existsSync(path.join(state.runDir, "impact_report.json"))) return { next_id: "report", next_label: "Ranked report" };
  return { next_id: null, next_label: null };
}

function clip(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 240 ? `${flat.slice(0, 239)}…` : flat;
}
