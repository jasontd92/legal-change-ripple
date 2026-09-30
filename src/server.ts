import { spawn } from "node:child_process";
import { closeSync, createReadStream, existsSync, openSync, readFileSync, readdirSync, readSync, statSync } from "node:fs";
import { createServer, request as httpRequest, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { listTriggerGroups, loadConfig, loadCorpus } from "./corpus.js";
import { diffLines, lineBounds, type ReviewDiff } from "./diff.js";
import { normalize } from "./normalize.js";
import { readJson } from "./paths.js";
import { buildIncorporates } from "./incorporates.js";
import { executeRun } from "./pipeline.js";
import { buildStacks } from "./stacks.js";
import { beginLive, rememberLive } from "./tick.js";
import type { RunTrace, ScenarioInput } from "./types.js";
import { listVerdicts, setVerdict } from "./verdicts.js";

const jobs = new Map<string, { status: string; error?: string }>();

const EVE_PORT = 3210;

export function startServer(opts: { repo: string; port: number }): Promise<void> {
  const ui = path.join(opts.repo, "ui", "dist");
  startEve(opts.repo);
  const server = createServer(async (req, res) => {
    try {
      await route(opts.repo, ui, req, res);
    } catch (err) {
      if (!res.headersSent) send(res, 500, { error: err instanceof Error ? err.message : String(err) });
    }
  });
  server.requestTimeout = 0;
  server.timeout = 0;
  return new Promise((resolve) => {
    server.listen(opts.port, () => {
      process.stderr.write(`harness serve http://127.0.0.1:${opts.port}\n`);
      resolve();
    });
  });
}

function startEve(repo: string): void {
  const bin = path.join(repo, "node_modules/eve/bin/eve.js");
  const child = spawn(process.execPath, [bin, "dev", "--no-ui", "--host", "127.0.0.1", "--port", String(EVE_PORT)], {
    cwd: repo,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code) => process.stderr.write(`eve dev exited ${code ?? "unknown"}\n`));
}

async function route(repo: string, ui: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname.startsWith("/eve/") || url.pathname.startsWith("/.well-known/workflow/")) {
    proxyEve(req, res);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok: true });
  if (req.method === "GET" && url.pathname === "/api/triggers") {
    const corpus = loadCorpus(repo, "corpus");
    return send(res, 200, { triggers: listTriggerGroups(corpus) });
  }
  if (req.method === "GET" && url.pathname === "/api/profile") {
    const corpus = loadCorpus(repo, "corpus");
    const { loadProfile } = await import("./corpus.js");
    const profile = loadProfile(corpus, "default");
    return send(res, 200, { file: profile.file, data: profile.data });
  }
  if (req.method === "GET" && url.pathname === "/api/clusters") {
    return send(res, 200, clusterGraph(repo));
  }
  if (req.method === "GET" && url.pathname === "/api/configs") {
    return send(res, 200, { configs: listConfigs(repo) });
  }
  if (req.method === "GET" && url.pathname === "/api/runs") {
    return send(res, 200, { runs: listRuns(repo) });
  }
  const traceMatch = /^\/api\/runs\/([^/]+)\/trace$/.exec(url.pathname);
  if (req.method === "GET" && traceMatch) return streamTrace(repo, decodeURIComponent(traceMatch[1]!), req, res);
  const verdictMatch = /^\/api\/runs\/([^/]+)\/verdicts$/.exec(url.pathname);
  if (verdictMatch && (req.method === "GET" || req.method === "POST")) {
    const dir = runDirectory(repo, decodeURIComponent(verdictMatch[1]!));
    if (!dir) return send(res, 400, { error: "bad run id" });
    if (req.method === "GET") return send(res, 200, { verdicts: listVerdicts(dir) });
    try {
      return send(res, 200, { verdict: setVerdict(dir, await readBody(req)) });
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : String(err) });
    }
  }
  const runMatch = /^\/api\/runs\/([^/]+)$/.exec(url.pathname);
  if (req.method === "GET" && runMatch) return send(res, 200, readRun(repo, decodeURIComponent(runMatch[1]!)));
  if (req.method === "POST" && url.pathname === "/api/runs") {
    const body = await readBody(req);
    const created = await createRun(repo, body);
    return send(res, 202, created);
  }
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not found" });
  if (req.method === "GET") return serveStatic(ui, url.pathname, res);
  send(res, 404, { error: "not found" });
}

async function createRun(repo: string, body: Record<string, unknown>): Promise<{ run_id: string; out: string; status?: string }> {
  const sourceUrl = body.source_url == null ? "" : String(body.source_url).trim();
  if (sourceUrl) {
    const configPath = String(body.config ?? "configs/o1-glm.json");
    const begun = await beginLive({
      repo,
      url: sourceUrl,
      configPath: path.isAbsolute(configPath) ? configPath : path.join(repo, configPath),
      statePath: path.join(repo, ".harness", "watches.json"),
      customPrompt: body.custom_prompt == null ? null : String(body.custom_prompt),
      asOf: String(body.as_of ?? "2026-10-01"),
    });
    if (begun.status === "unchanged") return { run_id: "", out: "", status: "unchanged" };
    const config = loadConfig(begun.configPath);
    jobs.set(begun.scenario.scenario_id, { status: "running" });
    void executeRun({ repo, runDir: begun.runDir, scenario: begun.scenario, config, mode: { kind: "full" } })
      .then((trace) => {
        rememberLive(begun);
        jobs.set(begun.scenario.scenario_id, { status: trace.status });
      })
      .catch((err: unknown) => jobs.set(begun.scenario.scenario_id, { status: "failed", error: err instanceof Error ? err.message : String(err) }));
    return { run_id: begun.scenario.scenario_id, out: begun.runDir, status: "running" };
  }
  const group = String(body.trigger_group ?? "");
  const versions = Array.isArray(body.versions) ? body.versions.map(String) : [];
  const configPath = String(body.config ?? "configs/o1-glm.json");
  const config = loadConfig(path.isAbsolute(configPath) ? configPath : path.join(repo, configPath));
  const scenario: ScenarioInput = {
    scenario_id: String(body.scenario_id ?? `${group}-${Date.now()}`),
    trigger: { group, versions },
    as_of: String(body.as_of ?? "2026-10-01"),
    profile: String(body.profile ?? "default"),
    custom_prompt: body.custom_prompt == null ? null : String(body.custom_prompt),
    corpus_root: String(body.corpus_root ?? "corpus"),
  };
  const runDir = path.join(repo, "runs", scenario.scenario_id);
  jobs.set(scenario.scenario_id, { status: "running" });
  void executeRun({ repo, runDir, scenario, config, mode: { kind: "full" } })
    .then((trace) => jobs.set(scenario.scenario_id, { status: trace.status }))
    .catch((err: unknown) => jobs.set(scenario.scenario_id, { status: "failed", error: err instanceof Error ? err.message : String(err) }));
  return { run_id: scenario.scenario_id, out: runDir };
}

function readRun(repo: string, id: string): Record<string, unknown> {
  const dir = path.join(repo, "runs", id);
  if (!existsSync(dir)) return { error: "no such run", job: jobs.get(id) ?? null };
  const read = (name: string) => {
    const file = path.join(dir, name);
    return existsSync(file) ? readJson(file) : null;
  };
  const raw = read("raw_change.json");
  return {
    job: jobs.get(id) ?? null,
    run: read("run.json"),
    impact_report: read("impact_report.json"),
    coverage: read("coverage.json"),
    change_record: read("change_record.json"),
    scope_trace: read("scope_trace.json"),
    incorporates: read("incorporates.json"),
    raw_change: raw,
    diff: reviewDiff(repo, raw),
  };
}

const diffCache = new Map<string, ReviewDiff>();

function reviewDiff(repo: string, raw: unknown): ReviewDiff | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as { old_file?: string | null; new_file?: string; old_sha256?: string | null; new_sha256?: string };
  if (!row.new_file) return null;
  const key = `${row.old_sha256 ?? "-"}:${row.new_sha256 ?? "-"}:${row.old_file ?? ""}:${row.new_file}`;
  const cached = diffCache.get(key);
  if (cached) return cached;
  try {
    const next = readRepoText(repo, row.new_file);
    if (next === null) return null;
    if (!row.old_file) {
      const first: ReviewDiff = { kind: "first", old_file: null, new_file: row.new_file, hunks: [], lines: [] };
      diffCache.set(key, first);
      return first;
    }
    const prev = readRepoText(repo, row.old_file);
    if (prev === null) return null;
    const compared: ReviewDiff = {
      kind: "compared",
      old_file: row.old_file,
      new_file: row.new_file,
      hunks: diffLines(prev, next),
      lines: lineBounds(next),
    };
    diffCache.set(key, compared);
    return compared;
  } catch {
    return null;
  }
}

function readRepoText(repo: string, rel: string): string | null {
  if (!rel || rel.includes("\0") || path.isAbsolute(rel)) return null;
  const root = path.resolve(repo);
  const abs = path.resolve(repo, rel);
  if (abs !== root && !abs.startsWith(`${root}${path.sep}`)) return null;
  if (!existsSync(abs)) return null;
  return normalize(readFileSync(abs));
}

const SETTLED = new Set(["completed", "failed", "resumed_completed"]);

function runDirectory(repo: string, id: string): string | null {
  if (!id || id.includes("..") || id.includes("/") || id.includes("\\") || id.includes("\0")) return null;
  const root = path.resolve(repo, "runs");
  const dir = path.resolve(root, id);
  if (dir !== path.join(root, id)) return null;
  return dir;
}

async function streamTrace(repo: string, id: string, req: IncomingMessage, res: ServerResponse): Promise<void> {
  const dir = runDirectory(repo, id);
  if (!dir) return send(res, 400, { error: "bad run id" });
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "x-accel-buffering": "no",
  });
  res.flushHeaders();
  let closed = false;
  req.on("close", () => { closed = true; });
  const file = path.join(dir, "trace.jsonl");
  const waited = Date.now();
  let offset = 0;
  let buf = "";
  while (!closed) {
    if (existsSync(file)) {
      const next = readSlice(file, offset);
      offset = next.offset;
      buf += next.text;
      let nl = buf.indexOf("\n");
      while (nl >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.trim()) {
          res.write(`${line}\n`);
          if (lineFinished(line)) {
            res.end();
            return;
          }
        }
        nl = buf.indexOf("\n");
      }
    } else if (!existsSync(dir) && Date.now() - waited > 60_000) {
      res.write(`${JSON.stringify({ at: new Date().toISOString(), type: "error", message: "Run directory did not appear." })}\n`);
      res.end();
      return;
    }
    if (runSettled(dir) && (!existsSync(file) || statSync(file).size <= offset) && !buf.includes("\n")) {
      res.end();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

function readSlice(file: string, offset: number): { text: string; offset: number } {
  const size = statSync(file).size;
  if (size < offset) return { text: "", offset: size };
  if (size === offset) return { text: "", offset };
  const length = size - offset;
  const buf = Buffer.alloc(length);
  const fd = openSync(file, "r");
  try {
    readSync(fd, buf, 0, length, offset);
  } finally {
    closeSync(fd);
  }
  return { text: buf.toString("utf8"), offset: size };
}

function lineFinished(line: string): boolean {
  try {
    const event = JSON.parse(line) as { type?: string; phase?: string };
    return event.type === "run" && event.phase === "finished";
  } catch {
    return false;
  }
}

function runSettled(dir: string): boolean {
  const file = path.join(dir, "run.json");
  if (!existsSync(file)) return false;
  try {
    const run = readJson<RunTrace>(file);
    return SETTLED.has(run.status);
  } catch {
    return false;
  }
}

type RunSummary = {
  run_id: string;
  status?: string;
  group: string | null;
  model: string | null;
  started_at: string | null;
  findings: number | null;
};

/** Every run with a run.json, newest first. `findings` is null until the report is written. */
function listRuns(repo: string): RunSummary[] {
  const dir = path.join(repo, "runs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => existsSync(path.join(dir, name, "run.json")))
    .map((name) => {
      const file = path.join(dir, name, "run.json");
      const run = readJson<RunTrace>(file);
      const reportFile = path.join(dir, name, "impact_report.json");
      const report = existsSync(reportFile) ? readJson<{ items?: unknown[] }>(reportFile) : null;
      return {
        run_id: name,
        status: run.status,
        group: run.scenario?.trigger?.group ?? null,
        model: run.model_config?.orchestrator ?? null,
        started_at: run.stages?.[0]?.started_at ?? statSync(file).mtime.toISOString(),
        findings: report ? report.items?.length ?? 0 : null,
      };
    })
    .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""));
}

/**
 * The company vault as the map shows it: each document cluster with its files
 * and parent links, and the incorporates links between clusters. Read-only.
 */
function clusterGraph(repo: string) {
  const corpus = loadCorpus(repo, "corpus");
  const stacks = buildStacks(corpus.docs);
  const clusterOf = new Map<string, string>();
  for (const stack of stacks) for (const member of stack.members) clusterOf.set(member.doc_id, stack.stack_id);
  const clusters = stacks.map((stack) => ({
    id: stack.stack_id,
    folder: stack.stack_id.split("/")[0] ?? "other",
    root: stack.root.doc_id,
    root_path: stack.root.path,
    files: stack.members.map((m) => ({
      doc_id: m.doc_id,
      path: m.path,
      parent_id: m.parent_id ?? null,
      doc_type: m.doc_type ?? null,
      effective_date: m.effective_date ?? null,
    })),
  }));
  const links = buildIncorporates(corpus).flatMap((edge) => {
    const source = clusterOf.get(edge.source_doc_id);
    const target = clusterOf.get(edge.target_doc_id);
    if (!source || !target || source === target) return [];
    return [{ source, target, source_doc: edge.source_doc_id, target_doc: edge.target_doc_id, section: edge.section, version_pin: edge.version_pin, quote: edge.quote.slice(0, 400) }];
  });
  return { clusters, links };
}

function listConfigs(repo: string): { id: string; file: string; label: string }[] {
  const dir = path.join(repo, "configs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => ({ id: name.replace(/\.json$/, ""), file: `configs/${name}`, label: name.replace(/\.json$/, "") }));
}

function serveStatic(ui: string, pathname: string, res: ServerResponse): void {
  if (!existsSync(ui)) {
    send(res, 200, { message: "API is up. Build the UI with npm run ui:build." });
    return;
  }
  const requested = pathname === "/" ? "/index.html" : pathname;
  let file = path.join(ui, path.normalize(requested));
  if (!file.startsWith(ui)) {
    send(res, 403, { error: "forbidden" });
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = path.join(ui, "index.html");
  const ext = path.extname(file);
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };
  const cache = ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";
  res.writeHead(200, { "content-type": types[ext] ?? "application/octet-stream", "cache-control": cache });
  createReadStream(file).pipe(res);
}

function proxyEve(req: IncomingMessage, res: ServerResponse): void {
  const headers = { ...req.headers, host: `127.0.0.1:${EVE_PORT}` };
  delete headers.connection;
  const upstream = httpRequest({
    hostname: "127.0.0.1",
    port: EVE_PORT,
    path: req.url,
    method: req.method,
    headers,
  }, (proxied) => {
    res.writeHead(proxied.statusCode ?? 502, proxied.headers);
    proxied.pipe(res);
  });
  upstream.on("error", () => {
    if (!res.headersSent) send(res, 502, { error: "The review agent is still starting." });
  });
  req.pipe(upstream);
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown> : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
