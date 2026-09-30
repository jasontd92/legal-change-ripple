/**
 * Tool-call robustness sentinel (V15/V16). Stage 1 only, plus optional single-stack
 * stage 4 on the families that failed before. Never a full run.
 *   npx tsx scripts/sentinel-stage1.ts --config configs/o1-glm.json [--k 3] [--stacks]
 * Exit code 1 unless every repeat passes (pass^k).
 */
import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { promisify } from "node:util";
import { findRepo } from "../src/paths.js";
import { printHealth, scoreRun } from "./score-tool-health.js";

const run = promisify(execFile);
const repo = findRepo();
const { values } = parseArgs({ options: { config: { type: "string" }, k: { type: "string" }, stacks: { type: "boolean" } } });
if (!values.config) throw new Error("--config is required");
const k = Number(values.k ?? 3);

const CASES: { id: string; group: string; versions: string[]; stacks: string[] }[] = [
  {
    id: "tr13-rollins",
    group: "TR-13-ftc-noncompete-rule-removal",
    versions: ["2026-02-12_ftc-rule-removal", "2026-04-22_ftc-rollins-consent-order-analysis"],
    stacks: ["employment/employee-handbook_2025-edition", "employment/templates/form_mutual-arbitration-agreement_2023"],
  },
  { id: "tr21-first", group: "TR-21-ftc-negative-option", versions: ["2026-03-13_negative-option-request-for-comment"], stacks: [] },
  {
    id: "tr01-proclamation",
    group: "TR-01-copper-section-232",
    versions: ["2025-02-25_eo-14220-investigation", "2025-07-30_proclamation-10962"],
    stacks: ["supply/great-plains-copper-tube_master-supply-agreement", "supply/hai-phong-precision-brass_supply-contract_2023-05-15"],
  },
  { id: "tr11-diff", group: "TR-11-il-noncompete-construction", versions: ["2023-03-_820-ilcs-90-prior-text", "2024-08-09_public-act-103-0921"], stacks: [] },
];

const root = path.join(repo, "runs", "sentinel-stage1", new Date().toISOString().replace(/[:.]/g, "-"));
mkdirSync(root, { recursive: true });
const harness = path.join(repo, "bin", "harness");

async function stage(args: string[]): Promise<void> {
  try {
    await run(harness, args, { cwd: repo, maxBuffer: 16 * 1024 * 1024 });
  } catch (err) {
    // The run directory still holds the trace; the scorer reports what went wrong.
    console.error(`harness ${args.slice(0, 3).join(" ")} failed: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}`);
  }
}

async function one(c: (typeof CASES)[number], rep: number): Promise<string[]> {
  const id = `${c.id}-${rep}`;
  const input = path.join(root, `${id}.json`);
  writeFileSync(input, JSON.stringify({ scenario_id: id, trigger: { group: c.group, versions: c.versions }, as_of: "2026-10-01", profile: "default", custom_prompt: null, corpus_root: "corpus" }));
  const out = path.join(root, id);
  await stage(["stage", "--stage", "1", "--input", input, "--config", values.config!, "--out", out]);
  const dirs = [out];
  if (values.stacks) {
    await Promise.all(c.stacks.map(async (stack, i) => {
      const dir = path.join(root, `${id}-stack${i + 1}`);
      await stage(["stage", "--stage", "4", "--input", input, "--config", values.config!, "--out", dir, "--inject", path.join(out, "change_record.json"), "--stack", stack]);
      dirs.push(dir);
    }));
  }
  return dirs;
}

const dirs = (await Promise.all(CASES.flatMap((c) => Array.from({ length: k }, (_, rep) => one(c, rep + 1))))).flat();
console.log(`Sentinel runs in ${path.relative(repo, root)}`);
const ok = printHealth(dirs.sort().map((dir) => scoreRun(dir)));
process.exit(ok ? 0 : 1);
