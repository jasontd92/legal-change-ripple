/**
 * Jev labels on the frozen Cascade step-2 findings. No analyst pass.
 * Thirty draws on each mislabeled clock finding (self urgency was a live
 * clock or undeterminable).
 */
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { classifyFinding } from "../src/classify.js";
import type { Finding } from "../src/types.js";

const root = path.resolve(import.meta.dirname, "..");
process.loadEnvFile(path.join(root, ".env.local"));
if (!process.env.TYPESAFE_API_KEY && process.env.JEV_API_KEY) {
  process.env.TYPESAFE_API_KEY = process.env.JEV_API_KEY;
}
if (!process.env.TYPESAFE_API_KEY) {
  throw new Error("JEV_API_KEY is not set, and TYPESAFE_API_KEY is not set.");
}

const K = 30;
const asOf = "2026-10-01";
const company = readFileSync(path.join(root, "corpus/company/profile.yaml"), "utf8").slice(0, 4000);
const outDir = path.join(root, "runs/step5");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "cascade-jev.jsonl");

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

let done = 0;
let failed = 0;

async function one(job: Job): Promise<void> {
  const started = Date.now();
  try {
    const classified = await classifyFinding({ finding: job.finding, company, asOf });
    const row = {
      source: job.dir,
      n: job.n,
      self_urgency: job.self,
      ms: Date.now() - started,
      urgency: classified.labels.urgency,
      materiality: classified.labels.materiality,
      direction: classified.labels.direction,
      finding_type: classified.finding_type,
      response_type: classified.labels.response_type,
      missing_fact: classified.labels.missing_fact,
      probabilities: classified.labels.label_probabilities,
      usage: classified.usage,
      model: classified.model,
    };
    appendFileSync(outFile, JSON.stringify(row) + "\n");
    done += 1;
    console.log(`ok ${job.dir} #${job.n} ${classified.labels.urgency} (${done + failed}/${jobs.length})`);
  } catch (err) {
    failed += 1;
    const message = err instanceof Error ? err.message : String(err);
    appendFileSync(outFile, JSON.stringify({ source: job.dir, n: job.n, error: message }) + "\n");
    console.log(`FAIL ${job.dir} #${job.n} ${message.slice(0, 180)}`);
  }
}

const queue = [...jobs];
const workers = Array.from({ length: 4 }, async () => {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    await one(job);
  }
});
await Promise.all(workers);
console.log(`DONE ok=${done} fail=${failed}`);
if (failed) process.exitCode = 1;
