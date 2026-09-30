import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { buildIncorporates } from "../src/incorporates.js";
import { loadCorpus } from "../src/corpus.js";
import { cpSlice, normalize } from "../src/normalize.js";
import { findRepo, readJson } from "../src/paths.js";
import { advanceReview, executeRun } from "../src/pipeline.js";
import { rankReport } from "../src/ranking.js";
import { triggerSnapshotAnswer } from "../src/readset.js";
import { buildStacks } from "../src/stacks.js";
import { locateQuote, quoteInSpan } from "../src/text.js";
import { loadConfig, loadScenario } from "../src/corpus.js";
import type { ChangeRecord, ImpactReport, ScopeTrace, StackFinding } from "../src/types.js";

const repo = findRepo();

test("normaliser matches the contract vectors", () => {
  const vectors = JSON.parse(readFileSync(path.join(repo, "contracts/normalize/test_vectors.json"), "utf8")) as {
    name: string;
    raw: string;
    normalized: string;
    start: number;
    end: number;
    slice: string;
  }[];
  for (const vector of vectors) {
    const got = normalize(vector.raw);
    assert.equal(got, vector.normalized, vector.name);
    assert.equal(cpSlice(got, vector.start, vector.end), vector.slice, vector.name);
  }
  const py = execFileSync("python3", ["contracts/normalize/normalize.py"], { cwd: repo, encoding: "utf8" });
  assert.match(py, /PASS crlf_to_lf/);
  assert.doesNotMatch(py, /FAIL/);
});

test("locateQuote collapses whitespace and keeps code-point offsets", () => {
  const text = "shall  not\tbe\n😀 duty";
  const hit = locateQuote(text, "shall not");
  assert.ok(hit);
  assert.equal(quoteInSpan(text, hit.start, hit.end, "shall not"), true);
  const duty = locateQuote(text, "duty");
  assert.deepEqual(duty, { start: Array.from(text).indexOf("d"), end: Array.from(text).indexOf("d") + 4 });
});

test("stacks follow cluster and parent_id, not shared directories", () => {
  const corpus = loadCorpus(repo, "corpus");
  const stacks = buildStacks(corpus.docs);
  const owner = new Map<string, string>();
  for (const stack of stacks) {
    for (const member of stack.members) {
      assert.equal(owner.has(member.doc_id), false);
      owner.set(member.doc_id, stack.stack_id);
    }
  }
  assert.equal(owner.size, corpus.docs.length);
  for (const doc of corpus.docs) {
    if (doc.parent_id && corpus.byId.has(doc.parent_id)) {
      assert.equal(owner.get(doc.doc_id), owner.get(doc.parent_id));
    }
    if (doc.cluster) {
      const peers = corpus.docs.filter((other) => other.cluster === doc.cluster && other.area === doc.area);
      for (const peer of peers) assert.equal(owner.get(peer.doc_id), owner.get(doc.doc_id));
    }
  }
  const poStacks = new Set(
    corpus.docs.filter((doc) => doc.path.includes("/purchase-orders/") && !doc.parent_id && !doc.cluster).map((doc) => owner.get(doc.doc_id)),
  );
  assert.ok(poStacks.size > 1);
});

test("an October 2019 pin resolves to that Keystone terms file", () => {
  const corpus = loadCorpus(repo, "corpus");
  const edges = buildIncorporates(corpus);
  const edge = edges.find((row) => row.source_doc_id === "SUP-KPS-PO-2025-0419");
  assert.ok(edge, "expected an incorporates row from the April 2025 Keystone PO");
  assert.equal(edge.target_doc_id, "SUP-KPS-TERMS-2019-10-22");
  assert.match(edge.version_pin ?? "", /October 2019/);
});

test("mini corpus: PO joins the MSA stack and incorporates the pinned terms", () => {
  const corpus = loadCorpus(repo, "test/fixtures/mini");
  const stacks = buildStacks(corpus.docs);
  const acme = stacks.find((stack) => stack.stack_id === "supply/acme-supply");
  assert.ok(acme);
  assert.deepEqual(acme.members.map((m) => m.doc_id).sort(), ["MSA", "PO-1"]);
  assert.equal(stacks.some((stack) => stack.stack_id.includes("purchase-orders")), false);
  const edges = buildIncorporates(corpus);
  assert.equal(edges.length, 1);
  assert.equal(edges[0]?.source_doc_id, "PO-1");
  assert.equal(edges[0]?.target_doc_id, "TERMS-2019");
});

test("stage 0 exits on whitespace and markup only", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-ws-"));
  try {
    const trace = await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-whitespace.json")),
      config: loadConfig(path.join(repo, "configs/stub.json")),
      mode: { kind: "full" },
    });
    assert.equal(trace.status, "completed");
    assert.equal(trace.stages[0]?.stage, "0");
    assert.equal(trace.stages[0]?.status, "no_substantive_diff");
    assert.equal(trace.stages.some((stage) => stage.stage === "1"), false);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("advanceReview walks a stub scenario one step at a time", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-advance-"));
  try {
    const scenario = loadScenario(path.join(repo, "test/fixtures/scenario-substantive.json"));
    const config = loadConfig(path.join(repo, "configs/stub.json"));
    const ids: string[] = [];
    let last = await advanceReview({ repo, runDir: out, scenario, config });
    if (last.step) ids.push(last.step.id);
    for (let i = 0; i < 12 && !last.done; i++) {
      assert.equal(last.status, "running");
      assert.ok(last.next_id);
      last = await advanceReview({ repo, runDir: out, scenario, config });
      if (last.step) ids.push(last.step.id);
    }
    assert.equal(last.done, true);
    assert.equal(last.status, "completed");
    assert.equal(ids[0], "diff");
    assert.ok(ids.includes("gate"));
    assert.ok(ids.includes("scope"));
    assert.ok(ids.some((id) => id.startsWith("stack:")));
    assert.equal(ids.at(-1), "report");
    const report = readJson<ImpactReport>(path.join(out, "impact_report.json"));
    assert.ok(report.items.length >= 1);
    const again = await advanceReview({ repo, runDir: out, scenario, config });
    assert.equal(again.done, true);
    assert.equal(again.step, null);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("stub pipeline writes schema-valid artifacts and conserves findings", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-full-"));
  try {
    const trace = await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-substantive.json")),
      config: loadConfig(path.join(repo, "configs/stub.json")),
      mode: { kind: "full" },
    });
    assert.equal(trace.status, "completed");
    assert.ok(trace.agents.some((agent) => agent.role === "orchestrator" && agent.tokens.input > 0));
    assert.ok(trace.agents.some((agent) => agent.role === "subagent" && agent.tool_calls.some((call) => call.tool === "read" && typeof call.chars_returned === "number")));
    const scope = readJson<ScopeTrace>(path.join(out, "scope_trace.json"));
    assert.equal(scope.stacks.length, 3);
    const report = readJson<ImpactReport>(path.join(out, "impact_report.json"));
    assert.ok(report.items.length >= 1);
    assert.equal(report.items[0]?.rank, 1);
    assert.match(report.items[0]?.rationale ?? "", /urgency=/);
    const activity = readFileSync(path.join(out, "trace.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line) as { type?: string; phase?: string; stage?: string; tool?: string });
    assert.ok(activity.some((event) => event.type === "stage" && event.phase === "started" && event.stage === "1"));
    assert.ok(activity.some((event) => event.type === "stack" && event.phase === "started"));
    assert.ok(activity.some((event) => event.type === "tool" && event.tool === "read" && event.phase === "finished"));
    assert.ok(activity.some((event) => event.type === "finding"));
    assert.equal(activity.at(-1)?.type, "run");
    assert.equal(activity.at(-1)?.phase, "finished");
    const findingFiles = ["supply__acme-supply.json", "supply__supplier-terms__acme-terms_2019.json", "vendors__lone-nda.json"];
    for (const name of findingFiles) {
      const finding = readJson<StackFinding>(path.join(out, "findings", name));
      const first = finding.findings[0];
      if (first) {
        assert.equal(first.change_ref, "C1");
        assert.ok((first.citations.trigger.quote ?? "").length > 0);
      }
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("company gate exit does not fan out", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-gate-"));
  try {
    const trace = await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-banks.json")),
      config: loadConfig(path.join(repo, "configs/stub.json")),
      mode: { kind: "full" },
    });
    const change = readJson<ChangeRecord>(path.join(out, "change_record.json"));
    assert.equal(change.company_gate, "exit");
    assert.equal(trace.stages.some((stage) => stage.stage === "3"), false);
    const report = readJson<ImpactReport>(path.join(out, "impact_report.json"));
    assert.equal(report.items.length, 0);
    assert.equal(report.change_item_closure[0]?.status, "unaddressed");
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("a named stack is excluded and not dispatched", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-black-"));
  try {
    await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-blacklist.json")),
      config: loadConfig(path.join(repo, "configs/stub.json")),
      mode: { kind: "full" },
    });
    const scope = readJson<ScopeTrace>(path.join(out, "scope_trace.json"));
    const nda = scope.stacks.find((row) => row.stack_id === "vendors/lone-nda");
    assert.equal(nda?.in_scope, false);
    assert.match(nda?.reason ?? "", /Ignore vendors\/lone-nda/);
    assert.equal(existsSync(path.join(out, "findings", "vendors__lone-nda.json")), false);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("resume finishes remaining stacks and does not rewrite finished findings", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-resume-"));
  try {
    const scenario = loadScenario(path.join(repo, "test/fixtures/scenario-substantive.json"));
    const config = loadConfig(path.join(repo, "test/fixtures/stub-kill.json"));
    const first = await executeRun({ repo, runDir: out, scenario, config, mode: { kind: "full" } });
    assert.equal(first.status, "partial");
    const finished = readFileSync(path.join(out, "findings", "supply__acme-supply.json"), "utf8");
    const second = await executeRun({ repo, runDir: out, scenario, config, mode: { kind: "full" }, resume: true });
    assert.equal(second.status, "resumed_completed");
    assert.equal(readFileSync(path.join(out, "findings", "supply__acme-supply.json"), "utf8"), finished);
    assert.ok(readFileSync(path.join(out, "findings", "vendors__lone-nda.json"), "utf8").length > 20);
    const report = readJson<ImpactReport>(path.join(out, "impact_report.json"));
    assert.ok(report.items.length >= 2);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("an injected read fault is recorded on the first call", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-fault-"));
  try {
    const config = loadConfig(path.join(repo, "configs/stub.json"));
    config.faults = { tool_error: { tool: "read", nth_call: 1 } };
    const trace = await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-substantive.json")),
      config,
      mode: { kind: "full" },
    });
    const calls = trace.agents.flatMap((agent) => agent.tool_calls);
    assert.equal(calls.some((call) => call.tool === "read" && call.injected_fault === true && call.ok === false), true);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("not-material findings are logged and forfeitable clocks sort first", () => {
  const change: ChangeRecord = {
    items: [{ id: "C1", substantive: true, anchor: { file: "a", start: 0, end: 4, quote: "duty" }, legal_status: "in_force" }],
    company_gate: "proceed",
  };
  const common = {
    change_ref: "C1",
    finding_type: "cost_exposure" as const,
    citations: {
      trigger: { file: "a", start: 0, end: 4, quote: "duty" },
      clause: { file: "b", start: 0, end: 4, quote: "cost" },
    },
    reasoning: "because",
  };
  const findings = [{
    stack_id: "s",
    applicability: "applies" as const,
    determination: "affected" as const,
    files_read: [],
    files_unparseable: [],
    cross_references: [],
    findings: [
      { ...common, id: "late", labels: { urgency: "no_clock" as const, materiality: "material" as const, direction: "exposure" as const, response_type: "monitor" as const } },
      { ...common, id: "soon", labels: { urgency: "forfeitable_clock_running" as const, materiality: "material" as const, direction: "exposure" as const, response_type: "send_notice" as const }, facts: { deadline_date: "2026-10-05" } },
      { ...common, id: "small", labels: { urgency: "obligation_clock_running" as const, materiality: "not_material" as const, direction: "neutral" as const, response_type: "no_action" as const } },
    ],
  }];
  const report = rankReport({
    change,
    findings,
    accepted: findings[0]!.findings.map((finding) => ({ stack_id: "s", finding, labels: finding.labels })),
    asOf: "2026-10-01",
    cross_links: [],
    resolutions: [],
    closureNotes: new Map(),
  });
  assert.deepEqual(report.items.map((item) => item.finding_id), ["soon", "late"]);
  assert.equal(report.not_material[0]?.finding_id, "small");
  assert.equal(report.items[0]?.rank, 1);
});

test("a trigger path returns the quote already on the change record", () => {
  const file = "corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt";
  const answer = triggerSnapshotAnswer({
    tool: "grep",
    file,
    anchors: [{ id: "C1", file, quote: "additional ad valorem duty", section_label: "clause (1)" }],
  });
  assert.ok(answer);
  assert.equal(answer.telemetry.ok, true);
  assert.equal(answer.telemetry.chars_returned! > 0, true);
  const model = answer.model as { note: string; quotes: { change_ref: string; quote: string }[] };
  assert.match(model.note, /change record/);
  assert.equal(model.quotes[0]?.change_ref, "C1");
  assert.equal(model.quotes[0]?.quote, "additional ad valorem duty");
  assert.equal(triggerSnapshotAnswer({
    tool: "read",
    file: "corpus/documents/supply/other.md",
    anchors: [{ id: "C1", file, quote: "additional ad valorem duty" }],
  }), null);
});

test("only_stacks dispatches the named stacks and records the rest as out of scope", async () => {
  const out = mkdtempSync(path.join(tmpdir(), "harness-slice-"));
  try {
    const config = loadConfig(path.join(repo, "configs/stub.json"));
    config.only_stacks = ["supply/acme-supply"];
    const trace = await executeRun({
      repo,
      runDir: out,
      scenario: loadScenario(path.join(repo, "test/fixtures/scenario-substantive.json")),
      config,
      mode: { kind: "full" },
    });
    assert.equal(trace.status, "completed");
    const scope = readJson<ScopeTrace>(path.join(out, "scope_trace.json"));
    assert.deepEqual(scope.stacks.filter((row) => row.in_scope).map((row) => row.stack_id), ["supply/acme-supply"]);
    assert.ok(scope.stacks.filter((row) => !row.in_scope).every((row) => row.reason.startsWith("Outside only_stacks.")));
    assert.equal(existsSync(path.join(out, "findings", "supply__acme-supply.json")), true);
    assert.equal(existsSync(path.join(out, "findings", "vendors__lone-nda.json")), false);
    const activity = readFileSync(path.join(out, "trace.jsonl"), "utf8");
    assert.match(activity, /"type":"stack_slice"/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
