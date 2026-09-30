import assert from "node:assert/strict";
import { test } from "node:test";
import { hunkCandidates, summaryProblem, uncovered } from "../src/change-items.js";
import { MAX_CITED_LINES, parseLines, resolveLines } from "../src/citations.js";
import { loadCorpus, readNormalized } from "../src/corpus.js";
import { diffLines } from "../src/diff.js";
import { cpSlice } from "../src/normalize.js";
import { stallRetry } from "../src/models.js";
import { findRepo } from "../src/paths.js";

const repo = findRepo();
const ROLLINS = "corpus/triggers/TR-13-ftc-noncompete-rule-removal/2026-04-22_ftc-rollins-consent-order-analysis.txt";

test("line references parse in the forms models write", () => {
  assert.deepEqual(parseLines("12"), { from: 12, to: 12 });
  assert.deepEqual(parseLines("12-18"), { from: 12, to: 18 });
  assert.deepEqual(parseLines("L12-L18"), { from: 12, to: 18 });
  assert.deepEqual(parseLines("12–18"), { from: 12, to: 18 });
  assert.equal(parseLines("18-12"), null);
  assert.equal(parseLines("page 3"), null);
});

// Regression: Federal Register text carries footnote markers like \1\. A model copying
// them into a JSON tool argument broke the whole call. A line reference has nothing to escape.
test("a line reference cites backslash-heavy text verbatim without the model copying it", () => {
  const corpus = loadCorpus(repo, "corpus");
  const text = readNormalized(corpus, ROLLINS);
  const lineNo = text.split("\n").findIndex((line) => line.includes("\\1\\")) + 1;
  assert.ok(lineNo > 0, "fixture still has a footnote marker");
  const hit = resolveLines(corpus, { file: ROLLINS, lines: `${lineNo}-${lineNo + 1}` }, new Set([ROLLINS]));
  assert.ok(hit.span, hit.error ?? "no span");
  assert.equal(cpSlice(text, hit.span.start, hit.span.end), hit.span.quote);
  assert.ok(hit.span.quote?.includes("\\1\\"));
});

test("a line reference refuses whole sections and ranges past the end", () => {
  const corpus = loadCorpus(repo, "corpus");
  const allowed = new Set([ROLLINS]);
  assert.match(resolveLines(corpus, { file: ROLLINS, lines: `1-${MAX_CITED_LINES + 1}` }, allowed).error ?? "", /at most/);
  assert.match(resolveLines(corpus, { file: ROLLINS, lines: "99999" }, allowed).error ?? "", /past the end/);
  assert.match(resolveLines(corpus, { file: "corpus/elsewhere.md", lines: "1" }, allowed).error ?? "", /not available/);
});

// Regression: a debugging probe with summaries "test A" / "test B" was persisted as the change record.
test("placeholder summaries are refused, real ones pass", () => {
  for (const bad of ["test A", "test B", "TODO", "placeholder", "Change", "tbd", "Rate changed"]) {
    assert.ok(summaryProblem(bad), `should refuse ${JSON.stringify(bad)}`);
  }
  for (const good of [
    "Proclamation 10962 imposes a 50 percent tariff on semi-finished copper imports.",
    "Test results must now be reported to the agency within 30 days.",
  ]) {
    assert.equal(summaryProblem(good), null, good);
  }
});

test("a changed region stays a change unless an item covers it", () => {
  const before = ["alpha", "notice thirty days", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "footer v1"].join("\n");
  const after = ["alpha", "notice sixty days", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "footer v2"].join("\n");
  const candidates = hunkCandidates(diffLines(before, after));
  assert.equal(candidates.length, 2);
  const [notice, footer] = candidates;
  assert.deepEqual(uncovered(candidates, []), candidates);
  // The model describes the notice change and opts the footer out as noise: nothing is left over.
  assert.deepEqual(uncovered(candidates, [{ from: notice!.from, to: notice!.to }, { from: footer!.from, to: footer!.to }]), []);
  // It forgets the footer: the footer is what gets kept by default.
  assert.deepEqual(uncovered(candidates, [{ from: notice!.from, to: notice!.to }]), [footer]);
});

test("a rewrite is not one giant candidate", () => {
  const before = Array.from({ length: 80 }, (_, i) => `old line ${i}`).join("\n");
  const after = Array.from({ length: 80 }, (_, i) => `new line ${i}`).join("\n");
  assert.deepEqual(hunkCandidates(diffLines(before, after)), []);
});

// Regression: a provider request that never answered sank the whole run after the step limit.
test("a stalled model request is retried alone, and gives up with a plain message", async () => {
  const hang = (signal?: AbortSignal) => new Promise<never>((_, reject) => signal?.addEventListener("abort", () => reject(new Error("aborted"))));
  let calls = 0;
  const stalls: number[] = [];
  const model = {
    doGenerate: (opts: { abortSignal?: AbortSignal }) => {
      calls += 1;
      return calls === 1 ? hang(opts.abortSignal) : Promise.resolve({ ok: calls });
    },
  };
  const wrap = stallRetry((attempt) => stalls.push(attempt), 30, 3).wrapGenerate!;
  const call = async () => wrap({ model: model as never, params: {} as never, doGenerate: null as never, doStream: null as never });
  assert.deepEqual(await call(), { ok: 2 });
  assert.deepEqual(stalls, [1]);

  calls = -10; // every call hangs
  model.doGenerate = (opts) => hang(opts.abortSignal);
  await assert.rejects(call(), /no answer within 0.03s, 3 times/);
});
