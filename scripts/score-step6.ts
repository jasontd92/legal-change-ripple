/**
 * R1–R3, the T3 pair, the Sunpoint–Northbrook link, and the T3 credit-agreement absence.
 * Rank numbers are 1-based. R2 margin is tier-1 count + 2.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = path.resolve(import.meta.dirname, "..");
const runRoot = path.join(root, "runs/step6");

type Gold = {
  findings: { id: string; stack_id: string }[];
  tiers: { "1": string[]; "2": string[]; "3": string[]; logged: string[] };
  cross_links?: { a: string; b: string }[];
};
type Report = {
  items: { rank: number; stack_id: string; finding_id: string; labels: { urgency: string; materiality: string } }[];
  not_material: { stack_id: string; finding_id: string }[];
  cross_links: { a: string; b: string; type?: string }[];
};

const cases = [
  ["t1", "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml"],
  ["t3a", "eval-scenarios/answer-keys/e2e/T3a_TR10_2026-10-01.yaml"],
  ["t3b", "eval-scenarios/answer-keys/e2e/T3b_TR10_2027-07-01.yaml"],
] as const;

function goldOf(file: string): Gold {
  return parseYaml(readFileSync(path.join(root, file), "utf8")) as Gold;
}

let spend = 0;
for (const [slug, file] of cases) {
  const gold = goldOf(file);
  const tier1 = new Set(gold.tiers["1"] ?? []);
  const tier3 = new Set(gold.tiers["3"] ?? []);
  console.log(`\n== ${slug} tier1=${[...tier1].join(",") || "-"} tier3=${[...tier3].join(",") || "-"}`);
  for (const k of [1, 2, 3]) {
    const dir = path.join(runRoot, `${slug}-k${k}`);
    const report = JSON.parse(readFileSync(path.join(dir, "impact_report.json"), "utf8")) as Report;
    const run = JSON.parse(readFileSync(path.join(dir, "run.json"), "utf8")) as { agents: { cost_usd?: number; role?: string }[] };
    const cost = run.agents.reduce((sum, agent) => sum + (agent.cost_usd ?? 0), 0);
    spend += cost;
    const rank = new Map(report.items.map((item) => [item.finding_id, item]));
    const hidden = new Set(report.not_material.map((item) => item.finding_id));
    const r1fail: string[] = [];
    for (const hi of tier1) {
      for (const lo of tier3) {
        const a = rank.get(hi);
        const b = rank.get(lo);
        if (!a || (b && a.rank >= b.rank)) r1fail.push(`${hi}>${lo}`);
      }
    }
    const n = tier1.size + 2;
    const r2fail = [...tier1].filter((id) => {
      const item = rank.get(id);
      return !item || item.rank > n;
    });
    const r3fail = [...tier1].filter((id) => hidden.has(id) || rank.get(id)?.labels.materiality === "not_material");
    const order = report.items.map((item) => `${item.rank}:${item.finding_id}/${item.labels.urgency}`).join(" ");
    const credit = [...report.items, ...report.not_material].some((item) => item.stack_id.includes("first-harbor-bank_credit-agreement"));
    const link = (report.cross_links ?? []).some((row) => {
      const ends = `${row.a} ${row.b}`;
      return ends.includes("sunpoint-public-schools") && ends.includes("northbrook-commons");
    });
    const trace = existsSync(path.join(dir, "trace.jsonl")) ? readFileSync(path.join(dir, "trace.jsonl"), "utf8") : "";
    const redispatch = (trace.match(/redispatch_stack/g) ?? []).length;
    console.log(
      `k${k} $${cost.toFixed(3)} R1=${r1fail.length ? "FAIL " + r1fail.join(",") : "pass"} R2=${r2fail.length ? "FAIL " + r2fail.join(",") : "pass"} R3=${r3fail.length ? "FAIL " + r3fail.join(",") : "pass"} credit=${credit ? "PRESENT" : "absent"} link=${link ? "found" : "MISS"} redispatch=${redispatch}`,
    );
    console.log(`  ${order}`);
    if (hidden.size) console.log(`  hidden ${[...hidden].join(",")}`);
  }
}
console.log(`\nspend $${spend.toFixed(3)}`);
