/**
 * Gold findings as stack-finding files for a stage-5 inject.
 * A gold stack id that is only a cluster member is filed under the harness stack.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { readFileSync } from "node:fs";
import { docFile, loadCorpus } from "../src/corpus.js";
import { assertArtifact } from "../src/schema.js";
import { buildStacks } from "../src/stacks.js";

const root = path.resolve(import.meta.dirname, "..");
const corpus = loadCorpus(root, "corpus");
const stacks = buildStacks(corpus.docs);
const fileToStack = new Map<string, string>();
for (const stack of stacks) {
  for (const member of stack.members) fileToStack.set(docFile(corpus, member), stack.stack_id);
}

type Span = { file: string; start: number; end: number; quote: string; section_label?: string };
type GoldFinding = {
  id: string;
  stack_id: string;
  change_ref: string;
  required_spans?: Span[];
  labels: {
    urgency: string;
    materiality: string;
    direction: string;
    finding_type: string;
    response_type: string | string[];
    materiality_test?: string;
  } | null;
  facts?: { deadline_date?: string; deadline_rule?: Record<string, unknown> | null; exposure?: Record<string, unknown> | null };
  rationale?: string;
  pass_rule?: string;
};

const jobs = [
  ["t1", "eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml"],
  ["t3a", "eval-scenarios/answer-keys/e2e/T3a_TR10_2026-10-01.yaml"],
  ["t3b", "eval-scenarios/answer-keys/e2e/T3b_TR10_2027-07-01.yaml"],
] as const;

function spanOf(raw: Span): Span {
  return {
    file: raw.file,
    start: raw.start,
    end: raw.end,
    quote: raw.quote,
    ...(raw.section_label ? { section_label: raw.section_label } : {}),
  };
}

function harnessStack(item: GoldFinding): string {
  if (stacks.some((s) => s.stack_id === item.stack_id)) return item.stack_id;
  for (const span of item.required_spans ?? []) {
    const hit = fileToStack.get(span.file);
    if (hit) return hit;
  }
  throw new Error(`${item.id} stack ${item.stack_id} is not a harness stack and no span file matched`);
}

for (const [slug, file] of jobs) {
  const gold = parseYaml(readFileSync(path.join(root, file), "utf8")) as { findings: GoldFinding[] };
  const grouped = new Map<string, GoldFinding[]>();
  for (const item of gold.findings) {
    const id = harnessStack(item);
    const list = grouped.get(id) ?? [];
    list.push(item);
    grouped.set(id, list);
  }
  const dir = path.join(root, "runs/step6-findings", slug);
  mkdirSync(dir, { recursive: true });
  for (const [stackId, items] of grouped) {
    const live = items.filter((item) => item.labels && item.pass_rule !== "not_affected");
    const findings = live.map((item) => {
      const spans = item.required_spans ?? [];
      const trigger = spans.find((s) => s.file.includes("/triggers/")) ?? spans[0];
      const clause = spans.find((s) => s !== trigger && s.file.includes("/documents/")) ?? spans.find((s) => s !== trigger) ?? trigger;
      if (!trigger || !clause || !item.labels) throw new Error(`incomplete ${item.id}`);
      const response = Array.isArray(item.labels.response_type) ? item.labels.response_type[0] : item.labels.response_type;
      const hops = spans.filter((s) => s !== trigger && s !== clause).map((s) => ({ span: spanOf(s), inference: item.rationale ?? "" }));
      return {
        id: item.id,
        change_ref: item.change_ref,
        finding_type: item.labels.finding_type,
        hop_chain: hops,
        citations: { trigger: spanOf(trigger), clause: spanOf(clause) },
        labels: {
          urgency: item.labels.urgency,
          materiality: item.labels.materiality,
          direction: item.labels.direction,
          response_type: response,
          materiality_test: item.rationale ?? "",
          label_source: "self" as const,
        },
        facts: {
          deadline_rule: item.facts?.deadline_rule ?? null,
          deadline_date: item.facts?.deadline_date ?? null,
          exposure: item.facts?.exposure ?? null,
        },
        reasoning: item.rationale ?? "",
      };
    });
    const cross = stackId.includes("sunpoint-public-schools")
      ? [{
          target_description: "Northbrook Commons pricing letter, the more favorable Illinois price",
          target_stack_id: "customers/notices/meridian-illinois_pricing-letter-agreement_northbrook-commons_2026-02-17",
          span: spanOf((items.find((i) => i.id === "F5")?.required_spans ?? []).find((s) => s.file.includes("northbrook"))!),
        }]
      : [];
    const doc = {
      stack_id: stackId,
      applicability: live.length ? "applies" : "does_not_apply",
      determination: live.length ? "affected" : "not_affected",
      findings,
      files_read: [...new Set(findings.flatMap((f) => [f.citations.trigger.file, f.citations.clause.file]))],
      files_unparseable: [],
      cross_references: cross.filter((row) => row.span),
    };
    assertArtifact("stack-finding.schema.json", doc);
    writeFileSync(path.join(dir, `${stackId.replaceAll("/", "__")}.json`), JSON.stringify(doc, null, 2));
    const moved = items.filter((item) => item.stack_id !== stackId).map((item) => `${item.id}->${stackId}`);
    console.log(`${slug} ${stackId} findings=${findings.map((f) => f.id).join(",") || "(none)"}${moved.length ? ` remapped ${moved.join(" ")}` : ""}`);
  }
}
