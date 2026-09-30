import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { normalize } from "./normalize.js";
import { absFromRepo, docRepoPath } from "./paths.js";
import type { HarnessConfig, ScenarioInput } from "./types.js";

export type DocRecord = {
  doc_id: string;
  path: string;
  area: string;
  cluster?: string;
  parent_id?: string;
  doc_type?: string;
  counterparty?: string;
  effective_date?: string;
  expiry_date?: string;
  term_start?: string;
  roles?: string[];
  published_url?: string;
  version_label?: string;
  version_family?: string;
  status_at_as_of?: string;
  chars?: number;
};

export type TriggerVersion = {
  id: string;
  file: string;
  title?: string;
  effective?: string;
  status?: string;
  distractor?: boolean;
  source_url?: string | null;
};

export type TriggerGroup = {
  group: string;
  summary?: string;
  versions: TriggerVersion[];
  dir: string;
};

export type Corpus = {
  repo: string;
  corpusRoot: string;
  docs: DocRecord[];
  byId: Map<string, DocRecord>;
  triggers: Map<string, TriggerGroup>;
  textCache: Map<string, string>;
};

export function loadCorpus(repo: string, corpusRoot: string): Corpus {
  const rootAbs = path.isAbsolute(corpusRoot) ? corpusRoot : path.join(repo, corpusRoot);
  const manifestPath = path.join(rootAbs, "manifest.jsonl");
  if (!existsSync(manifestPath)) throw new Error(`No manifest at ${manifestPath}`);
  const docs: DocRecord[] = readFileSync(manifestPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DocRecord);
  const triggers = new Map<string, TriggerGroup>();
  const triggerRoot = path.join(rootAbs, "triggers");
  if (existsSync(triggerRoot)) {
    for (const name of readdirSync(triggerRoot)) {
      const metaPath = path.join(triggerRoot, name, "meta.yaml");
      if (!existsSync(metaPath)) continue;
      const meta = parseYaml(readFileSync(metaPath, "utf8")) as {
        group?: string;
        summary?: string;
        versions?: TriggerVersion[];
      };
      const group = meta.group ?? name;
      triggers.set(group, {
        group,
        summary: meta.summary,
        versions: meta.versions ?? [],
        dir: path.join(triggerRoot, name),
      });
    }
  }
  return {
    repo,
    corpusRoot: path.relative(repo, rootAbs).split(path.sep).join("/") || corpusRoot,
    docs,
    byId: new Map(docs.map((d) => [d.doc_id, d])),
    triggers,
    textCache: new Map(),
  };
}

export function readNormalized(corpus: Corpus, repoRelativePath: string): string {
  const cached = corpus.textCache.get(repoRelativePath);
  if (cached !== undefined) return cached;
  const abs = absFromRepo(corpus.repo, repoRelativePath);
  if (!existsSync(abs)) throw new Error(`File not in the vault: ${repoRelativePath}`);
  const text = normalize(readFileSync(abs));
  corpus.textCache.set(repoRelativePath, text);
  return text;
}

export function docFile(corpus: Corpus, doc: DocRecord): string {
  return docRepoPath(corpus.corpusRoot, doc.path);
}

export function loadScenario(file: string): ScenarioInput {
  const raw = JSON.parse(readFileSync(file, "utf8")) as ScenarioInput;
  if (!raw.corpus_root) raw.corpus_root = "corpus";
  return raw;
}

export function loadConfig(file: string): HarnessConfig {
  return JSON.parse(readFileSync(file, "utf8")) as HarnessConfig;
}

export function applyOverrides(scenario: ScenarioInput, config: HarnessConfig): ScenarioInput {
  const next: ScenarioInput = { ...scenario, trigger: { ...scenario.trigger, versions: [...scenario.trigger.versions] } };
  if (config.scenario?.as_of) next.as_of = config.scenario.as_of;
  if (config.scenario?.profile) next.profile = config.scenario.profile;
  if (config.scenario?.corpus_root) next.corpus_root = config.scenario.corpus_root;
  if (!next.corpus_root) next.corpus_root = "corpus";
  return next;
}

export function loadProfile(corpus: Corpus, profile: string): { file: string; data: Record<string, unknown>; text: string } {
  const rel =
    profile === "default" ? `${corpus.corpusRoot}/company/profile.yaml` : profile.replace(/^\//, "");
  const abs = absFromRepo(corpus.repo, rel);
  if (!existsSync(abs)) throw new Error(`Profile not found: ${rel}`);
  const text = readFileSync(abs, "utf8");
  return { file: rel, data: parseYaml(text) as Record<string, unknown>, text };
}

export function triggerFiles(
  corpus: Corpus,
  scenario: ScenarioInput,
): { oldFile: string | null; newFile: string; versionIds: string[] } {
  const group = corpus.triggers.get(scenario.trigger.group);
  if (!group) throw new Error(`Unknown trigger group ${scenario.trigger.group}`);
  const ids = scenario.trigger.versions;
  if (ids.length < 1 || ids.length > 2) {
    throw new Error(`A trigger takes one version (first observation) or two (old, then new). Got ${ids.length}.`);
  }
  const resolve = (id: string): string => {
    const version = group.versions.find((v) => v.id === id);
    if (!version) throw new Error(`Version ${id} is not in ${group.group}`);
    const abs = path.join(group.dir, version.file);
    return path.relative(corpus.repo, abs).split(path.sep).join("/");
  };
  if (ids.length === 1) return { oldFile: null, newFile: resolve(ids[0]!), versionIds: ids };
  return { oldFile: resolve(ids[0]!), newFile: resolve(ids[1]!), versionIds: ids };
}

export function listTriggerGroups(corpus: Corpus): { group: string; summary?: string; versions: { id: string; title?: string; effective?: string; source_url?: string | null }[] }[] {
  return [...corpus.triggers.values()]
    .sort((a, b) => a.group.localeCompare(b.group))
    .map((g) => ({
      group: g.group,
      summary: g.summary,
      versions: g.versions.map((v) => ({ id: v.id, title: v.title, effective: v.effective, source_url: v.source_url ?? null })),
    }));
}
