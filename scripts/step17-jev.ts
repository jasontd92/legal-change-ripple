/**
 * Jev on the frozen Cascade findings that already date the closed window.
 * No analyst pass. Thirty draws on each no_clock finding dated 2025-04-02.
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
if (!process.env.TYPESAFE_API_KEY) throw new Error("JEV_API_KEY is not set, and TYPESAFE_API_KEY is not set.");

const K = 30;
const asOf = "2026-10-01";
const company = readFileSync(path.join(root, "corpus/company/profile.yaml"), "utf8").slice(0, 4000);
const outDir = path.join(root, "runs/step17");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "cascade-slot-a.jsonl");

const sources = ["cascade-k4", "cascade-k5"].map((dir) => {
  const file = path.join(
    root,
    "runs/step8/glm",
    dir,
    "findings/subcontracts__cascade-ridge-contractors_subcontract-puyallup-medical-office.json",
  );
  const doc = JSON.parse(readFileSync(file, "utf8")) as { findings: Finding[] };
  const finding = doc.findings.find((item) => item.facts?.deadline_date === "2025-04-02" && item.labels.urgency === "no_clock");
  if (!finding) throw new Error(`No closed-window finding in ${dir}`);
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
  try {
    const classified = await classifyFinding({ finding: job.finding, company, asOf });
    appendFileSync(outFile, JSON.stringify({
      source: job.dir,
      n: job.n,
      self_urgency: job.self,
      urgency: classified.labels.urgency,
      materiality: classified.labels.materiality,
      model: classified.model,
      usage: classified.usage,
    }) + "\n");
    done += 1;
    console.log(`ok ${job.dir} #${job.n} ${classified.labels.urgency} (${done + failed}/${jobs.length})`);
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
