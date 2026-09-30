import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadConfig } from "./corpus.js";
import { normalize } from "./normalize.js";
import { writeJson } from "./paths.js";
import { executeRun } from "./pipeline.js";
import type { ScenarioInput } from "./types.js";

type WatchState = {
  watches: Record<string, { hash: string; snapshot: string; version_id: string }>;
};

/**
 * Production shape of a trigger: fetch one URL, compare a content hash, and
 * start one run when it changes. Snapshots live under .harness so the vault
 * corpus stays read-only. The company documents are linked, not copied.
 */
export type LiveReady = {
  status: "ready";
  hash: string;
  scenario: ScenarioInput;
  runDir: string;
  configPath: string;
  statePath: string;
  url: string;
  snapshot: string;
  versionId: string;
};

export async function beginLive(opts: {
  repo: string;
  url: string;
  configPath: string;
  statePath: string;
  customPrompt?: string | null;
  asOf?: string;
}): Promise<{ status: "unchanged"; hash: string } | LiveReady> {
  const response = await fetch(opts.url);
  if (!response.ok) throw new Error(`Fetch ${opts.url} failed: ${response.status}`);
  const text = normalize(await response.text());
  const hash = createHash("sha256").update(text).digest("hex");
  const state = existsSync(opts.statePath)
    ? (JSON.parse(readFileSync(opts.statePath, "utf8")) as WatchState)
    : { watches: {} };
  const prev = state.watches[opts.url];
  if (prev?.hash === hash) return { status: "unchanged", hash };
  const slug = createHash("sha256").update(opts.url).digest("hex").slice(0, 12);
  const overlay = path.join(opts.repo, ".harness", "live", slug);
  const versionId = hash.slice(0, 16);
  const triggerDir = path.join(overlay, "triggers", `LIVE-${slug}`);
  mkdirSync(triggerDir, { recursive: true });
  linkVault(opts.repo, overlay);
  writeFileSync(path.join(triggerDir, `${versionId}.txt`), text);
  const versions = prev ? [prev.version_id, versionId] : [versionId];
  const metaVersions = [
    ...(prev ? [{ id: prev.version_id, file: `${prev.version_id}.txt` }] : []),
    { id: versionId, file: `${versionId}.txt` },
  ];
  writeFileSync(
    path.join(triggerDir, "meta.yaml"),
    `group: LIVE-${slug}\nsummary: ${JSON.stringify(opts.url)}\nversions:\n${metaVersions.map((v) => `- id: ${v.id}\n  file: ${v.file}\n  source_url: ${JSON.stringify(opts.url)}\n`).join("")}`,
  );
  if (prev && !existsSync(path.join(triggerDir, `${prev.version_id}.txt`))) {
    writeFileSync(path.join(triggerDir, `${prev.version_id}.txt`), readFileSync(path.join(opts.repo, prev.snapshot), "utf8"));
  }
  const scenario: ScenarioInput = {
    scenario_id: `live-${slug}-${versionId}`,
    trigger: { group: `LIVE-${slug}`, versions },
    as_of: opts.asOf ?? "2026-10-01",
    profile: "default",
    custom_prompt: opts.customPrompt ?? null,
    corpus_root: path.relative(opts.repo, overlay).split(path.sep).join("/"),
  };
  const snapshot = path.relative(opts.repo, path.join(triggerDir, `${versionId}.txt`)).split(path.sep).join("/");
  return {
    status: "ready",
    hash,
    scenario,
    runDir: path.join(opts.repo, "runs", scenario.scenario_id),
    configPath: opts.configPath,
    statePath: opts.statePath,
    url: opts.url,
    snapshot,
    versionId,
  };
}

export function rememberLive(ready: LiveReady): void {
  const state = existsSync(ready.statePath)
    ? (JSON.parse(readFileSync(ready.statePath, "utf8")) as WatchState)
    : { watches: {} };
  state.watches[ready.url] = { hash: ready.hash, snapshot: ready.snapshot, version_id: ready.versionId };
  mkdirSync(path.dirname(ready.statePath), { recursive: true });
  writeJson(ready.statePath, state);
}

export async function tick(opts: { repo: string; url: string; configPath: string; statePath: string }): Promise<{ status: string; out?: string; hash: string }> {
  const begun = await beginLive(opts);
  if (begun.status === "unchanged") return begun;
  const config = loadConfig(begun.configPath);
  await executeRun({ repo: opts.repo, runDir: begun.runDir, scenario: begun.scenario, config, mode: { kind: "full" } });
  rememberLive(begun);
  return { status: "ran", out: begun.runDir, hash: begun.hash };
}

function linkVault(repo: string, overlay: string): void {
  for (const name of ["documents", "company", "manifest.jsonl"]) {
    const dest = path.join(overlay, name);
    if (existsSync(dest)) continue;
    symlinkSync(path.join(repo, "corpus", name), dest);
  }
}
