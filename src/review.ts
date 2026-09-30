import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { loadConfig } from "./corpus.js";
import { findRepo, readJson, writeJson } from "./paths.js";
import { advanceReview, type AdvanceResult } from "./pipeline.js";
import { beginLive, rememberLive, type LiveReady } from "./tick.js";
import type { ScenarioInput } from "./types.js";

export type ReviewRequest = {
  config: string;
  custom_prompt?: string | null;
  as_of?: string;
  source_url?: string | null;
  trigger_group?: string | null;
  versions?: string[];
  scenario_id?: string;
};

export async function openReview(request: ReviewRequest): Promise<AdvanceResult> {
  const repo = findRepo();
  const configPath = path.isAbsolute(request.config) ? request.config : path.join(repo, request.config);
  const config = loadConfig(configPath);
  const source = request.source_url?.trim() ?? "";
  if (source) {
    const begun = await beginLive({
      repo,
      url: source,
      configPath,
      statePath: path.join(repo, ".harness", "watches.json"),
      customPrompt: request.custom_prompt ?? null,
      asOf: request.as_of ?? "2026-10-01",
    });
    if (begun.status === "unchanged") {
      return {
        run_id: "",
        done: true,
        status: "unchanged",
        step: { id: "diff", label: "Change", state: "done", detail: "That URL matches the last snapshot. No new review was started." },
        next_id: null,
        next_label: null,
      };
    }
    writeLive(begun);
    const result = await advanceReview({ repo, runDir: begun.runDir, scenario: begun.scenario, config });
    if (result.done && result.status === "completed") rememberLive(begun);
    return result;
  }
  const group = request.trigger_group?.trim() ?? "";
  const versions = (request.versions ?? []).map((version) => version.trim()).filter(Boolean);
  if (!group || versions.length === 0) throw new Error("A review needs a source URL, or an authority and at least one snapshot.");
  const scenario: ScenarioInput = {
    scenario_id: request.scenario_id?.trim() || `${group}-${Date.now()}`,
    trigger: { group, versions },
    as_of: request.as_of ?? "2026-10-01",
    profile: "default",
    custom_prompt: request.custom_prompt ?? null,
    corpus_root: "corpus",
  };
  const runDir = path.join(repo, "runs", scenario.scenario_id);
  return advanceReview({ repo, runDir, scenario, config });
}

export async function continueReview(runId: string): Promise<AdvanceResult> {
  if (!runId || runId.includes("..") || runId.includes("/") || runId.includes("\\")) throw new Error("bad run id");
  const repo = findRepo();
  const runDir = path.join(repo, "runs", runId);
  const scenario = readJson<ScenarioInput>(path.join(runDir, "input.json"));
  const config = loadConfig(path.join(runDir, "config.json"));
  const result = await advanceReview({ repo, runDir, scenario, config });
  if (result.done && result.status === "completed") {
    const live = readLive(runDir);
    if (live) rememberLive(live);
  }
  return result;
}

function writeLive(ready: LiveReady): void {
  writeJson(path.join(ready.runDir, "live.json"), ready);
}

function readLive(runDir: string): LiveReady | null {
  const file = path.join(runDir, "live.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as LiveReady;
}
