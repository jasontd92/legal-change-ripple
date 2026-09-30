import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { rankReport, type Accepted } from "../src/ranking.js";
import type { ChangeRecord, ImpactReport, Labels, StackFinding } from "../src/types.js";

const root = path.resolve(import.meta.dirname, "..");

type Gold = { tiers: { "1": string[]; "2": string[]; "3": string[] } };

function loadFindings(dir: string): StackFinding[] {
  return readdirSync(path.join(dir, "findings"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(path.join(dir, "findings", name), "utf8")) as StackFinding);
}

for (const slug of ["t1", "t3a", "t3b"]) {
  const gold = parseYaml(readFileSync(path.join(root, `eval-scenarios/answer-keys/e2e/${slug === "t1" ? "T1_TR01_2026-10-01" : slug === "t3a" ? "T3a_TR10_2026-10-01" : "T3b_TR10_2027-07-01"}.yaml`), "utf8")) as Gold;
  const tier1 = new Set(gold.tiers["1"] ?? []);
  const tier3 = new Set(gold.tiers["3"] ?? []);
  console.log(`\n== ${slug}`);
  for (const k of [1, 2, 3]) {
    const dir = path.join(root, "runs/step6", `${slug}-k${k}`);
    const report = JSON.parse(readFileSync(path.join(dir, "impact_report.json"), "utf8")) as ImpactReport;
    const change = JSON.parse(readFileSync(path.join(dir, "change_record.json"), "utf8")) as ChangeRecord;
    const input = JSON.parse(readFileSync(path.join(dir, "input.json"), "utf8")) as { as_of: string };
    const findings = loadFindings(dir);
    const byFinding = new Map(findings.flatMap((stack) => stack.findings.map((finding) => [`${stack.stack_id}::${finding.id}`, { stack_id: stack.stack_id, finding }])));
    const accepted: Accepted[] = report.items.map((item) => {
      const hit = byFinding.get(`${item.stack_id}::${item.finding_id}`);
      if (!hit) throw new Error(`missing ${item.finding_id}`);
      return {
        stack_id: item.stack_id,
        finding: hit.finding,
        labels: item.labels as Labels,
        headline: item.headline,
        what: item.what,
        why: item.why,
        when: item.when,
        rationale: item.rationale,
      };
    });
    const next = rankReport({
      change,
      findings,
      accepted,
      asOf: input.as_of,
      cross_links: report.cross_links,
      resolutions: report.cross_reference_resolutions,
      closureNotes: new Map(),
    });
    const rank = new Map(next.items.map((item) => [item.finding_id, item.rank]));
    const r1 = [...tier1].flatMap((hi) => [...tier3].filter((lo) => {
      const a = rank.get(hi);
      const b = rank.get(lo);
      return !a || (b !== undefined && a >= b);
    }).map((lo) => `${hi}>${lo}`));
    const old = report.items.map((item) => item.finding_id).join(" ");
    const got = next.items.map((item) => item.finding_id).join(" ");
    console.log(`k${k} R1=${r1.length ? "FAIL " + r1.join(",") : "pass"}`);
    console.log(`  old ${old}`);
    console.log(`  new ${got}`);
  }
}
