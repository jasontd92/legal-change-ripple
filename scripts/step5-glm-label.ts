/**
 * GLM labels on the same frozen Cascade findings Jev saw. No tools, no
 * re-read. The existing self-label is not shown.
 */
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { generateText } from "ai";
import { languageModel } from "../src/models.js";
import type { Finding } from "../src/types.js";

const root = path.resolve(import.meta.dirname, "..");
process.loadEnvFile(path.join(root, ".env.local"));

const K = 30;
const asOf = "2026-10-01";
const company = readFileSync(path.join(root, "corpus/company/profile.yaml"), "utf8").slice(0, 4000);
const outFile = path.join(root, "runs/step5/cascade-glm-label.jsonl");
mkdirSync(path.dirname(outFile), { recursive: true });

const RUBRIC = `Label this one finding. Do not open files. Do not add facts that are not in the evidence. Return one JSON object and nothing else.
Keys: urgency, materiality, direction, finding_type, response_type.
urgency: forfeitable_clock_running (a right or claim is lost if this running deadline passes) | obligation_clock_running (a duty is due and missing it is a breach, but the right itself is not forfeited) | clock_pending (the clock starts on a known future event that has not happened) | no_clock | undeterminable (name the missing fact).
materiality: material | not_material | undeterminable.
direction: exposure | recovery | both | neutral.
finding_type: deadline_bound_right | deadline_bound_obligation | liability_or_compliance_exposure | recovery_opportunity | billing_discrepancy | cost_exposure | consistency_gap | clerical_update | watch.
response_type: send_notice | exercise_pass_through | seek_refund_or_credit | renegotiate | update_template | escalate_outside_counsel | brief_finance | monitor | no_action.`;

const sources = ["cascade-k1", "cascade-k2", "cascade-k3"].map((dir) => {
  const file = path.join(
    root,
    "runs/step2",
    dir,
    "findings/subcontracts__cascade-ridge-contractors_subcontract-puyallup-medical-office.json",
  );
  const doc = JSON.parse(readFileSync(file, "utf8")) as { findings: Finding[] };
  const finding = doc.findings.find((item) => item.finding_type === "deadline_bound_right");
  if (!finding) throw new Error(`No deadline_bound_right finding in ${dir}`);
  return { dir, self: finding.labels.urgency, finding };
});

type Job = { dir: string; self: string; finding: Finding; n: number };
const jobs: Job[] = [];
for (const source of sources) {
  for (let n = 1; n <= K; n++) jobs.push({ ...source, n });
}

function evidence(job: Job): string {
  const finding = job.finding;
  return JSON.stringify({
    as_of: asOf,
    company,
    reasoning: finding.reasoning,
    trigger_quote: finding.citations.trigger.quote ?? "",
    clause_quote: finding.citations.clause.quote ?? "",
    facts: finding.facts ?? null,
    open_questions: finding.open_questions ?? [],
  });
}

let done = 0;
let failed = 0;

async function one(job: Job): Promise<void> {
  try {
    const result = await generateText({
      model: languageModel("zai/glm-5.3-flash"),
      system: RUBRIC,
      prompt: evidence(job),
      timeout: 120_000,
      maxRetries: 2,
    });
    const text = result.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    let parsed: Record<string, string> | null = null;
    let error: string | undefined;
    if (start < 0 || end < start) error = "no json";
    else {
      try {
        parsed = JSON.parse(text.slice(start, end + 1)) as Record<string, string>;
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
    }
    const usage = result.totalUsage ?? result.usage;
    appendFileSync(outFile, JSON.stringify({
      source: job.dir,
      n: job.n,
      self_urgency: job.self,
      urgency: parsed?.urgency ?? null,
      materiality: parsed?.materiality ?? null,
      direction: parsed?.direction ?? null,
      finding_type: parsed?.finding_type ?? null,
      response_type: parsed?.response_type ?? null,
      error: error ?? null,
      usage: {
        input: usage?.inputTokens ?? 0,
        cached_input: usage?.inputTokenDetails?.cacheReadTokens ?? 0,
        output: usage?.outputTokens ?? 0,
      },
    }) + "\n");
    done += 1;
    console.log(`${error ? "FAIL" : "ok"} ${job.dir} #${job.n} ${parsed?.urgency ?? error} (${done + failed}/${jobs.length})`);
    if (error) failed += 1;
  } catch (err) {
    failed += 1;
    const message = err instanceof Error ? err.message : String(err);
    appendFileSync(outFile, JSON.stringify({ source: job.dir, n: job.n, error: message }) + "\n");
    console.log(`FAIL ${job.dir} #${job.n} ${message.slice(0, 160)}`);
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    await one(job);
  }
}));
console.log(`DONE ok=${done} fail=${failed}`);
if (failed) process.exitCode = 1;
