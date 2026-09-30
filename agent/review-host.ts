import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

type ReviewRequest = {
  config: string;
  custom_prompt?: string | null;
  as_of?: string;
  source_url?: string | null;
  trigger_group?: string | null;
  versions?: string[];
  scenario_id?: string;
};

export type ReviewCall =
  | { phase: "open"; step: number; request: ReviewRequest }
  | { phase: "continue"; step: number; run_id: string };

type AdvanceResult = {
  run_id: string;
  done: boolean;
  status: "running" | "completed" | "failed" | "partial" | "unchanged" | "resumed_completed";
  step: { id: string; label: string; state: "running" | "done" | "failed"; detail: string } | null;
  steps?: { id: string; label: string; state: "running" | "done" | "failed"; detail: string }[];
  next_id: string | null;
  next_label: string | null;
};

export function runReviewCli(call: ReviewCall): Promise<AdvanceResult> {
  const repo = repoRoot();
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", path.join(repo, "src/review-cli.ts")], {
      cwd: repo,
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { out += chunk; });
    child.stderr.on("data", (chunk: string) => { err += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(err.trim() || out.trim() || `review step exited ${code ?? "unknown"}`));
      else resolve(JSON.parse(out) as AdvanceResult);
    });
    child.stdin.end(JSON.stringify(call));
  });
}

function repoRoot(): string {
  let dir = process.cwd();
  for (;;) {
    if (existsSync(path.join(dir, "contracts", "VERSION")) && existsSync(path.join(dir, "src", "review-cli.ts"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error("Could not find the repo root from the review step.");
    dir = parent;
  }
}
