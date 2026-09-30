/**
 * Score step-4 stage-1 change records and stage-3 scope traces.
 * A missing change_record.json is a failed commit, not a silent skip.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { normWs } from "../src/text.js";

const root = path.resolve(import.meta.dirname, "..");
const runRoot = path.join(root, process.argv[2] ?? "runs/step4");

type GoldItem = {
  id: string;
  substantive?: boolean;
  legal_status?: string;
  anchor?: { quote?: string; file?: string };
};
type Gold = {
  company_gate?: string;
  change_record?: { items?: GoldItem[] };
  relevant_stacks?: string[];
  pruned_stacks?: string[];
};

function gold(file: string): Gold {
  return parseYaml(readFileSync(path.join(root, file), "utf8")) as Gold;
}

function overlap(quote: string, needle: string): boolean {
  const q = normWs(quote);
  const n = normWs(needle);
  return n.length > 0 && (q.includes(n) || n.includes(q));
}

type Item = {
  id: string;
  substantive: boolean;
  legal_status: string;
  dismissal_reason: string | null;
  anchor: { quote: string; file: string };
};

function loadRecord(dir: string): { gate: string; reason: string; items: Item[] } | null {
  const file = path.join(runRoot, dir, "change_record.json");
  if (!existsSync(file)) return null;
  const rec = JSON.parse(readFileSync(file, "utf8")) as {
    company_gate: string;
    company_gate_reason?: string;
    items: Item[];
  };
  return { gate: rec.company_gate, reason: rec.company_gate_reason ?? "", items: rec.items };
}

function gateOk(got: string, want: string): boolean {
  if (want === "proceed") return got === "proceed" || got === "uncertain";
  return got === want;
}

function stage1(
  label: string,
  dirs: string[],
  g: Gold,
  check: (rec: { gate: string; reason: string; items: Item[] }) => string,
): void {
  const lines: string[] = [];
  for (const dir of dirs) {
    const rec = loadRecord(dir);
    if (!rec) {
      lines.push(`${dir}: NO RECORD`);
      continue;
    }
    const gate = `${rec.gate}${gateOk(rec.gate, g.company_gate ?? "") ? "" : ` WANT ${g.company_gate}`}`;
    lines.push(`${dir}: gate=${gate} | ${check(rec)}`);
  }
  console.log(`\n== ${label}`);
  for (const line of lines) console.log(line);
}

function hit(rec: { items: Item[] }, quote: string): Item | undefined {
  return rec.items.find((item) => item.substantive && overlap(item.anchor.quote, quote));
}

const t1 = gold("eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml");
const t3a = gold("eval-scenarios/answer-keys/e2e/T3a_TR10_2026-10-01.yaml");
const t3b = gold("eval-scenarios/answer-keys/e2e/T3b_TR10_2027-07-01.yaml");
const t5 = gold("eval-scenarios/answer-keys/e2e/T5_TR14_2026-10-01.yaml");
const c1 = gold("eval-scenarios/answer-keys/e2e/C1_TR03_2026-10-01.yaml");
const c2 = gold("eval-scenarios/answer-keys/e2e/C2_TR90_2026-10-01.yaml");
const s1b = gold("eval-scenarios/answer-keys/unit/D-S1B-01.yaml");

const quote = (g: Gold, id: string) => g.change_record?.items?.find((i) => i.id === id)?.anchor?.quote ?? "";

stage1("T1 stage1", ["t1-s1-k1", "t1-s1-k2", "t1-s1-k3"], t1, (rec) => {
  const item = hit(rec, quote(t1, "C1"));
  return item ? `C1 ${item.legal_status} date-item ${item.id}` : "C1 quote MISS";
});

stage1("T3a stage1", ["t3a-s1-k1", "t3a-s1-k2", "t3a-s1-k3"], t3a, (rec) => {
  const item = hit(rec, quote(t3a, "C1"));
  return item ? `effective-date ${item.legal_status} (want enacted_future_effective)` : "effective-date quote MISS";
});

stage1("T3b stage1", ["t3b-s1-k1", "t3b-s1-k2", "t3b-s1-k3"], t3b, (rec) => {
  const item = hit(rec, quote(t3b, "C1"));
  return item ? `effective-date ${item.legal_status} (want in_force)` : "effective-date quote MISS";
});

stage1("T5 SB 699", ["t5-sb-s1-k1", "t5-sb-s1-k2", "t5-sb-s1-k3"], t5, (rec) => {
  const c1hit = hit(rec, quote(t5, "C1"));
  const c2hit = hit(rec, quote(t5, "C2"));
  const c3hit = hit(rec, quote(t5, "C3"));
  return `C1 ${c1hit?.legal_status ?? "miss"} | C2 ${c2hit?.legal_status ?? "miss"} | C3-in-SB ${c3hit ? "LEAK" : "absent"}`;
});

stage1("T5 AB 1076", ["t5-ab-s1-k1", "t5-ab-s1-k2", "t5-ab-s1-k3"], t5, (rec) => {
  const c3hit = hit(rec, quote(t5, "C3"));
  const c1hit = hit(rec, quote(t5, "C1"));
  return `C3 ${c3hit?.legal_status ?? "miss"} | SB-quote-in-AB ${c1hit ? "present" : "absent"}`;
});

stage1("TR-03", ["tr03-s1-k1", "tr03-s1-k2", "tr03-s1-k3"], c1, (rec) => {
  const item = hit(rec, quote(c1, "C1"));
  const statuses = rec.items.filter((i) => i.substantive).map((i) => i.legal_status).join(",");
  return item ? `title ${item.legal_status}` : `title MISS statuses=${statuses || "none"}`;
});

stage1("TR-90 WY", ["tr90-wy-s1-k1", "tr90-wy-s1-k2", "tr90-wy-s1-k3"], c2, (rec) => {
  const item = hit(rec, quote(c2, "C1"));
  return `${item ? "WY quote" : "WY quote MISS"} reason=${rec.reason.slice(0, 140)}`;
});

stage1("TR-90 TX", ["tr90-tx-s1-k1", "tr90-tx-s1-k2", "tr90-tx-s1-k3"], c2, (rec) => {
  const item = hit(rec, quote(c2, "C2"));
  return `${item ? "TX quote" : "TX quote MISS"} reason=${rec.reason.slice(0, 140)}`;
});

stage1("D-S1B drop-wa", ["s1b-s1-k1", "s1b-s1-k2", "s1b-s1-k3"], s1b, (rec) => {
  return `reason=${rec.reason.slice(0, 160)}`;
});

function scope(label: string, dirs: string[], g: Gold): void {
  console.log(`\n== ${label} scope`);
  const relevant = g.relevant_stacks ?? [];
  const pruned = new Set(g.pruned_stacks ?? []);
  for (const dir of dirs) {
    const file = path.join(runRoot, dir, "scope_trace.json");
    if (!existsSync(file)) {
      console.log(`${dir}: no scope yet`);
      continue;
    }
    const trace = JSON.parse(readFileSync(file, "utf8")) as {
      stacks: { stack_id: string; in_scope: boolean; reason: string }[];
    };
    const byId = new Map(trace.stacks.map((row) => [row.stack_id, row]));
    const inScope = trace.stacks.filter((row) => row.in_scope);
    const dropped = relevant.filter((id) => byId.get(id) && !byId.get(id)!.in_scope);
    const missing = relevant.filter((id) => !byId.has(id));
    const keptPruned = [...pruned].filter((id) => byId.get(id)?.in_scope).map((id) => {
      const row = byId.get(id)!;
      const how = row.reason.startsWith("Default in") ? "default-in" : "explicit";
      return `${id} [${how}] ${row.reason.slice(0, 100)}`;
    });
    console.log(
      `${dir}: in_scope=${inScope.length} dropped=${dropped.length ? dropped.join(" | ") : "none"} not-a-stack=${missing.join(" | ") || "none"}`,
    );
    for (const row of keptPruned) console.log(`  pruned-in: ${row}`);
  }
}

scope("T1", ["t1-s3-k1", "t1-s3-k2", "t1-s3-k3"], t1);
scope("T3a", ["t3a-s3-k1", "t3a-s3-k2", "t3a-s3-k3"], t3a);
scope("T3b", ["t3b-s3-k1", "t3b-s3-k2", "t3b-s3-k3"], t3b);
scope("T5", ["t5-scope-s3-k1", "t5-scope-s3-k2", "t5-scope-s3-k3"], t5);
scope("C1", ["tr03-s3-k1", "tr03-s3-k2", "tr03-s3-k3"], c1);

let spend = 0;
let runs = 0;
for (const name of readdirSync(runRoot)) {
  const file = path.join(runRoot, name, "run.json");
  if (!existsSync(file)) continue;
  runs += 1;
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/"cost_usd":\s*([0-9.]+)/g)) spend += Number(match[1]);
}
console.log(`\ncost_usd sum ${spend.toFixed(3)} across ${runs} run.json files`);
