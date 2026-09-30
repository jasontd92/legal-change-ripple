import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { readFileSync } from "node:fs";
import { loadCorpus } from "../src/corpus.js";
import { buildIncorporates } from "../src/incorporates.js";
import { findRepo } from "../src/paths.js";
import { validateArtifact } from "../src/schema.js";
import { buildStacks, readingSet } from "../src/stacks.js";

const repo = findRepo();
const corpus = loadCorpus(repo, "corpus");
const stacks = buildStacks(corpus.docs);
const edges = buildIncorporates(corpus);

function readingOf(id: string): void {
  const stack = stacks.find((s) => s.stack_id === id);
  if (!stack) {
    process.stdout.write(`MISSING ${id}\n`);
    return;
  }
  const files = readingSet("corpus", stack, edges, corpus.byId);
  process.stdout.write(`\n${id} (${files.length})\n`);
  for (const file of files) process.stdout.write(`  ${file}\n`);
}

readingOf("employment/templates/form_technician-employment-agreement_california_rev-2017");
readingOf("employment/signed-agreements/sabrina-marchetti_technician-employment-agreement_ca_2024-04-07");
readingOf("supply/purchase-orders/PO-2025-0231_keystone-plumbing-supply_2025-02-24");

type GoldItem = {
  id: string;
  substantive?: boolean;
  anchor: { file: string; start: number; end: number; quote: string; section_label?: string; section_note?: string };
  legal_status?: string;
  effective_date?: string | null;
  applies_to?: Record<string, unknown>;
  reason?: string;
};

function toRecord(file: string): unknown {
  const gold = parseYaml(readFileSync(file, "utf8")) as {
    company_gate: string;
    change_record: { items: GoldItem[]; noise_items?: GoldItem[] };
  };
  const span = (anchor: GoldItem["anchor"]) => ({
    file: anchor.file,
    start: anchor.start,
    end: anchor.end,
    quote: anchor.quote,
    ...(anchor.section_label ? { section_label: anchor.section_label } : {}),
  });
  const items = [
    ...gold.change_record.items.map((item) => ({
      id: item.id,
      substantive: item.substantive !== false,
      dismissal_reason: null,
      anchor: span(item.anchor),
      legal_status: item.legal_status,
      effective_date: item.effective_date ?? null,
      applies_to: item.applies_to ?? {},
    })),
    ...(gold.change_record.noise_items ?? []).map((item) => ({
      id: item.id,
      substantive: false,
      dismissal_reason: item.reason ?? "noise",
      anchor: span(item.anchor),
      legal_status: "in_force",
      effective_date: null,
    })),
  ];
  return {
    items,
    company_gate: gold.company_gate,
    company_gate_reason: "Injected gold change record.",
  };
}

const out = path.join(repo, "runs", "step2-inject");
mkdirSync(out, { recursive: true });
for (const [name, file] of [
  ["t1-change.json", "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml"],
  ["t5-change.json", "eval-scenarios/answer-keys/e2e/T5_TR14_2026-10-01.yaml"],
] as const) {
  const record = toRecord(path.join(repo, file));
  const errors = validateArtifact("change-record.schema.json", record);
  process.stdout.write(`${name} schema ${errors.length ? errors.join(" | ") : "ok"}\n`);
  writeFileSync(path.join(out, name), `${JSON.stringify(record, null, 2)}\n`);
}

const inputs = path.join(repo, "runs", "step2-inputs");
mkdirSync(inputs, { recursive: true });
writeFileSync(path.join(inputs, "t1.json"), `${JSON.stringify({
  scenario_id: "T1_TR01_2026-10-01",
  trigger: { group: "TR-01-copper-section-232", versions: ["2026-04-02_proclamation-11021"] },
  as_of: "2026-10-01",
  profile: "default",
  custom_prompt: null,
  corpus_root: "corpus",
}, null, 2)}\n`);
writeFileSync(path.join(inputs, "t5.json"), `${JSON.stringify({
  scenario_id: "T5_TR14_2026-10-01",
  trigger: { group: "TR-14-ca-noncompete-sb699-ab1076", versions: ["2023-09-01_ca-sb-699", "2023-10-13_ca-ab-1076"] },
  as_of: "2026-10-01",
  profile: "default",
  custom_prompt: null,
  corpus_root: "corpus",
}, null, 2)}\n`);
