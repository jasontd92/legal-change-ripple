import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadConfig, loadScenario } from "./corpus.js";
import { findRepo, readJson } from "./paths.js";
import { executeRun, type RunMode } from "./pipeline.js";
import { startServer } from "./server.js";
import { tick } from "./tick.js";
import type { HarnessConfig, ScenarioInput } from "./types.js";

const help = `harness — monitored-authority impact review

  harness run   --input scenario.json --config config.json --out runs/<id>
  harness stage --stage 1|3|4|5 --input scenario.json --config config.json --out DIR
                [--inject change_record.json] [--inject-findings DIR] [--stack stack_id]
  harness resume --run runs/<id>
  harness serve [--port 8787]
  harness tick  --url https://… --config config.json [--state .harness/watches.json]

Stage 0 (diff) runs inside run and stage 1. A formatting-only diff exits before the session.
--inject files are copied into the run directory and the trace marks those stages injected.
Resume continues a partial run from artifacts already written and does not repeat finished stacks.
`;

function loadLocalEnv(repo: string): void {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(repo, name);
    if (!existsSync(file)) continue;
    process.loadEnvFile(file);
  }
}

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      input: { type: "string" },
      config: { type: "string" },
      out: { type: "string" },
      stage: { type: "string" },
      inject: { type: "string" },
      "inject-findings": { type: "string" },
      stack: { type: "string" },
      run: { type: "string" },
      url: { type: "string" },
      state: { type: "string" },
      port: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help || positionals.length === 0) {
    process.stdout.write(help);
    return;
  }
  const cmd = positionals[0];
  const repo = findRepo();
  loadLocalEnv(repo);
  if (cmd === "serve") {
    const port = Number(values.port ?? 8787);
    await startServer({ repo, port });
    return;
  }
  if (cmd === "tick") {
    if (!values.url || !values.config) throw new Error("tick requires --url and --config");
    const result = await tick({
      repo,
      url: values.url,
      configPath: path.resolve(values.config),
      statePath: path.resolve(values.state ?? path.join(repo, ".harness", "watches.json")),
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (cmd === "resume") {
    if (!values.run) throw new Error("resume requires --run");
    const runDir = path.resolve(values.run);
    const scenario = readJson<ScenarioInput>(path.join(runDir, "input.json"));
    const config = readJson<HarnessConfig>(path.join(runDir, "config.json"));
    const trace = await executeRun({ repo, runDir, scenario, config, mode: { kind: "full" }, resume: true });
    process.stdout.write(`${JSON.stringify({ run_id: trace.run_id, status: trace.status, out: runDir })}\n`);
    return;
  }
  if (cmd !== "run" && cmd !== "stage") throw new Error(`Unknown command ${cmd ?? ""}. ${help}`);
  if (!values.input || !values.config || !values.out) throw new Error(`${cmd} requires --input, --config, and --out`);
  const scenario = loadScenario(path.resolve(values.input));
  const config = loadConfig(path.resolve(values.config));
  const runDir = path.resolve(values.out);
  mkdirSync(runDir, { recursive: true });
  if (values.inject) {
    const raw = readFileSync(path.resolve(values.inject), "utf8");
    mkdirSync(runDir, { recursive: true });
    writeFileSync(path.join(runDir, "change_record.json"), raw);
  }
  if (values["inject-findings"]) {
    cpSync(path.resolve(values["inject-findings"]), path.join(runDir, "findings"), { recursive: true });
  }
  const mode: RunMode = cmd === "run"
    ? { kind: "full" }
    : { kind: "stage", stage: parseStage(values.stage), stackId: values.stack };
  const trace = await executeRun({ repo, runDir, scenario, config, mode });
  process.stdout.write(`${JSON.stringify({ run_id: trace.run_id, status: trace.status, out: runDir })}\n`);
}

function parseStage(stage: string | undefined): "1" | "3" | "4" | "5" {
  if (stage === "1" || stage === "3" || stage === "4" || stage === "5") return stage;
  throw new Error("--stage must be 1, 3, 4, or 5");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
