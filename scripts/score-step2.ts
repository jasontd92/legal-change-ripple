import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { normWs } from "../src/text.js";

type Span = { file?: string; quote?: string };
type Finding = {
  id?: string;
  change_ref?: string;
  citations?: { trigger?: Span; clause?: Span };
  hop_chain?: { span?: Span }[];
  labels?: { urgency?: string; materiality?: string; finding_type?: string };
  facts?: { deadline_date?: string | null };
  absence?: { clause_type?: string } | null;
  reasoning?: string;
};
type StackFinding = {
  stack_id: string;
  determination?: string;
  applicability?: string;
  findings?: Finding[];
  applicability_reason?: string;
};
type GoldSpan = { file: string; quote: string };
type GoldFinding = {
  id: string;
  scenario_id: string;
  stack_id: string;
  required_spans?: GoldSpan[];
  decoy_spans?: GoldSpan[];
  pass_rule: string;
  labels?: { urgency?: string } | null;
  facts?: { deadline_date?: string };
  absence?: { clause_type?: string } | null;
};

const runs: { slug: string; goldFile: string; ids: string[] }[] = [
  { slug: "gp", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F4", "F9"] },
  { slug: "valley", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F1"] },
  { slug: "cascade", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F6"] },
  { slug: "bridgewell", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F7"] },
  { slug: "sunpoint", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F5"] },
  { slug: "lease", goldFile: "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml", ids: ["F10"] },
  { slug: "keystone", goldFile: "eval-scenarios/answer-keys/unit/S4-KPS-03.yaml", ids: ["F1"] },
  { slug: "ca-tech", goldFile: "eval-scenarios/answer-keys/e2e/T5_TR14_2026-10-01.yaml", ids: ["F1", "F3", "F4"] },
];

function loadGold(file: string): GoldFinding[] {
  const doc = parseYaml(readFileSync(file, "utf8")) as { findings: GoldFinding[] };
  return doc.findings;
}

function quotesOf(finding: Finding): Span[] {
  const out: Span[] = [];
  if (finding.citations?.trigger?.quote) out.push(finding.citations.trigger);
  if (finding.citations?.clause?.quote) out.push(finding.citations.clause);
  for (const hop of finding.hop_chain ?? []) if (hop.span?.quote) out.push(hop.span);
  return out;
}

function sameFile(a: string | undefined, b: string): boolean {
  if (!a) return false;
  return a === b || a.endsWith(b) || b.endsWith(a);
}

function overlaps(cited: string, gold: string): boolean {
  const c = normWs(cited);
  const g = normWs(gold);
  if (c.length < 24 || g.length < 24) return c.length > 0 && (g.includes(c) || c.includes(g));
  return g.includes(c) || c.includes(g);
}

function spanHit(findings: Finding[], span: GoldSpan): boolean {
  for (const finding of findings) {
    for (const quote of quotesOf(finding)) {
      if (sameFile(quote.file, span.file) && quote.quote && overlaps(quote.quote, span.quote)) return true;
    }
  }
  return false;
}

function decoyHit(findings: Finding[], span: GoldSpan): boolean {
  for (const finding of findings) {
    const clause = finding.citations?.clause;
    if (!clause?.quote || !sameFile(clause.file, span.file) || !overlaps(clause.quote, span.quote)) continue;
    if (finding.labels?.materiality === "not_material") continue;
    return true;
  }
  return false;
}

function loadRun(dir: string): { finding: StackFinding; cost: number } {
  const files = readdirSync(path.join(dir, "findings")).filter((f) => f.endsWith(".json"));
  const finding = JSON.parse(readFileSync(path.join(dir, "findings", files[0]!), "utf8")) as StackFinding;
  const run = JSON.parse(readFileSync(path.join(dir, "run.json"), "utf8")) as { agents: { cost_usd?: number }[] };
  const cost = run.agents.reduce((sum, agent) => sum + (agent.cost_usd ?? 0), 0);
  return { finding, cost };
}

let total = 0;
for (const row of runs) {
  const gold = loadGold(row.goldFile).filter((item) => row.ids.includes(item.id));
  process.stdout.write(`\n== ${row.slug}\n`);
  const maxK = Number(process.argv[3] ?? 3);
  for (let k = 1; k <= maxK; k++) {
    const dir = path.join(process.argv[2] ?? "runs/step2", `${row.slug}-k${k}`);
    if (!existsSync(dir) || !existsSync(path.join(dir, "findings"))) continue;
    const { finding, cost } = loadRun(dir);
    total += cost;
    const preds = finding.findings ?? [];
    const bits: string[] = [`det=${finding.determination}`, `n=${preds.length}`, `$${cost.toFixed(3)}`];
    for (const item of gold) {
      const required = (item.required_spans ?? []).filter((span) => !span.file.includes("/triggers/"));
      const missing = required.filter((span) => !spanHit(preds, span)).map((span) => span.file.split("/").pop());
      const decoys = (item.decoy_spans ?? []).filter((span) => decoyHit(preds, span)).map((span) => span.file.split("/").pop());
      const clocks = preds.map((p) => `${p.labels?.urgency ?? "-"}/${p.facts?.deadline_date ?? "-"}`).join(",");
      const absence = preds.some((p) => p.absence);
      bits.push(`${item.scenario_id}: hop ${required.length - missing.length}/${required.length}${missing.length ? ` miss=${missing.join("|")}` : ""}${decoys.length ? ` DECOY=${decoys.join("|")}` : ""} abs=${absence} [${clocks}]`);
    }
    process.stdout.write(`k${k} ${bits.join(" | ")}\n`);
  }
}
process.stdout.write(`\nTOTAL $${total.toFixed(3)}\n`);
