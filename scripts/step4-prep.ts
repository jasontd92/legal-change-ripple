import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { diffSnapshots } from "../src/stage0.js";
import { normalize } from "../src/normalize.js";
import { validateArtifact } from "../src/schema.js";

const root = process.cwd();

function text(rel: string): string {
  return normalize(readFileSync(path.join(root, rel)));
}

const pairs = [
  {
    id: "membership-substantive",
    expectExit: false,
    old: "corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2024-06-01.md",
    neu: "corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2026-08-01.md",
  },
  {
    id: "membership-cosmetic",
    expectExit: true,
    old: "corpus/documents/customers/residential-terms/meridian-comfort-club_membership-terms_california_2026-08-01.md",
    neu: "eval-scenarios/answer-keys/fixtures/s0/membership-terms-california-2026-08-01-cosmetic.md",
  },
  {
    id: "E-I6-01",
    expectExit: true,
    old: "corpus/triggers/TR-90-controls/2025-03-_wy-sf-107.txt",
    neu: "eval-scenarios/answer-keys/fixtures/s0/wy-sf-107-cosmetic.txt",
  },
];
let stage0Fail = 0;
for (const pair of pairs) {
  const raw = diffSnapshots(text(pair.old), text(pair.neu), pair.old, pair.neu);
  const ok = raw.exit === pair.expectExit;
  if (!ok) stage0Fail += 1;
  process.stdout.write(`stage0 ${pair.id} exit=${raw.exit} expectExit=${pair.expectExit} ${ok ? "pass" : "FAIL"} ${raw.reason ?? ""}\n`);
}

type GoldItem = {
  id: string;
  substantive?: boolean;
  anchor: { file: string; start: number; end: number; quote: string; section_label?: string };
  legal_status?: string;
  effective_date?: string | null;
  applies_to?: Record<string, unknown>;
  reason?: string;
};

function toRecord(file: string): unknown {
  const gold = parseYaml(readFileSync(path.join(root, file), "utf8")) as {
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
  return {
    items: [
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
    ],
    company_gate: gold.company_gate,
    company_gate_reason: "Injected gold change record.",
  };
}

const injectDir = path.join(root, "runs/step4-inject");
mkdirSync(injectDir, { recursive: true });
for (const [name, file] of [
  ["t1.json", "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml"],
  ["t3a.json", "eval-scenarios/answer-keys/e2e/T3a_TR10_2026-10-01.yaml"],
  ["t3b.json", "eval-scenarios/answer-keys/e2e/T3b_TR10_2027-07-01.yaml"],
  ["t5.json", "eval-scenarios/answer-keys/e2e/T5_TR14_2026-10-01.yaml"],
  ["c1.json", "eval-scenarios/answer-keys/e2e/C1_TR03_2026-10-01.yaml"],
] as const) {
  const record = toRecord(file);
  const errors = validateArtifact("change-record.schema.json", record);
  process.stdout.write(`inject ${name} ${errors.length ? errors.join(" | ") : "ok"}\n`);
  writeFileSync(path.join(injectDir, name), `${JSON.stringify(record, null, 2)}\n`);
}

const inputDir = path.join(root, "runs/step4-inputs");
mkdirSync(inputDir, { recursive: true });
function scenario(name: string, body: unknown): void {
  const errors = validateArtifact("scenario-input.schema.json", body);
  if (errors.length) throw new Error(`${name} ${errors.join(" | ")}`);
  writeFileSync(path.join(inputDir, name), `${JSON.stringify(body, null, 2)}\n`);
}
const base = { profile: "default", custom_prompt: null, corpus_root: "corpus" };
scenario("t1.json", { scenario_id: "T1_TR01_2026-10-01", trigger: { group: "TR-01-copper-section-232", versions: ["2026-04-02_proclamation-11021"] }, as_of: "2026-10-01", ...base });
scenario("t3a.json", { scenario_id: "T3a_TR10_2026-10-01", trigger: { group: "TR-10-wa-noncompete-eshb-1155", versions: ["2026-03-23_eshb-1155-session-law"] }, as_of: "2026-10-01", ...base });
scenario("t3b.json", { scenario_id: "T3b_TR10_2027-07-01", trigger: { group: "TR-10-wa-noncompete-eshb-1155", versions: ["2026-03-23_eshb-1155-session-law"] }, as_of: "2027-07-01", ...base });
scenario("t5-sb.json", { scenario_id: "T5_SB699", trigger: { group: "TR-14-ca-noncompete-sb699-ab1076", versions: ["2023-09-01_ca-sb-699"] }, as_of: "2026-10-01", ...base });
scenario("t5-ab.json", { scenario_id: "T5_AB1076", trigger: { group: "TR-14-ca-noncompete-sb699-ab1076", versions: ["2023-10-13_ca-ab-1076"] }, as_of: "2026-10-01", ...base });
scenario("t5-scope.json", { scenario_id: "T5_TR14_2026-10-01", trigger: { group: "TR-14-ca-noncompete-sb699-ab1076", versions: ["2023-09-01_ca-sb-699"] }, as_of: "2026-10-01", ...base });
scenario("tr03.json", { scenario_id: "C1_TR03_2026-10-01", trigger: { group: "TR-03-adcvd-copper-pipe-mexico", versions: ["2026-09-21_preliminary-results"] }, as_of: "2026-10-01", ...base });
scenario("tr90-wy.json", { scenario_id: "C2_WY", trigger: { group: "TR-90-controls", versions: ["2025-03-_wy-sf-107"] }, as_of: "2026-10-01", ...base });
scenario("tr90-tx.json", { scenario_id: "C2_TX", trigger: { group: "TR-90-controls", versions: ["2025-06-20_tx-sb-1318-physicians"] }, as_of: "2026-10-01", ...base });

let profile = readFileSync(path.join(root, "corpus/company/profile.yaml"), "utf8");
profile = profile.replace("states_of_operation: [CA, WA, IL, TX]", "states_of_operation: [CA, IL, TX]");
profile = profile.replace("    - {name: Meridian Mechanical of Washington, LLC, state: WA}\n", "");
profile = profile.replace("    - {id: TAC, city: Tacoma, state: WA, employees: 44}\n", "");
profile = profile.replace("    - {id: SPO, city: Spokane, state: WA, employees: 21}\n", "");
const profileDir = path.join(root, "runs/step4-profiles");
mkdirSync(profileDir, { recursive: true });
writeFileSync(path.join(profileDir, "drop-wa.yaml"), profile);
scenario("s1b.json", {
  scenario_id: "D-S1B-01",
  trigger: { group: "TR-10-wa-noncompete-eshb-1155", versions: ["2026-03-23_eshb-1155-session-law"] },
  as_of: "2026-10-01",
  profile: "runs/step4-profiles/drop-wa.yaml",
  custom_prompt: null,
  corpus_root: "corpus",
});

if (stage0Fail) process.exitCode = 1;
