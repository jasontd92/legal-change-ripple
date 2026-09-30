import { DEFAULT_URGENCY_WINDOW_DAYS, WATCH_LEGAL, type LegalStatus, type Materiality, type Urgency } from "./enums.js";
import type { ChangeRecord, Finding, ImpactReport, Labels, ReportItem, StackFinding } from "./types.js";

const MATERIALITY_RANK: Record<Materiality, number> = { material: 0, undeterminable: 1, not_material: 2 };
const URGENCY_RANK: Record<Urgency, number> = {
  forfeitable_clock_running: 0,
  obligation_clock_running: 1,
  undeterminable: 2,
  clock_pending: 3,
  no_clock: 4,
};

export type Accepted = {
  stack_id: string;
  finding: Finding;
  labels: Labels;
  headline?: string;
  what?: string;
  why?: string;
  when?: string;
  rationale?: string;
};

/**
 * Labels plus a deterministic sort (system-design §6, approach A).
 * Not-material findings are logged and omitted from the ranked list.
 * Stayed, proposed, and vacated changes sink to the watch band.
 */
export function rankReport(opts: {
  change: ChangeRecord;
  findings: StackFinding[];
  accepted: Accepted[];
  asOf: string;
  windowDays?: number;
  cross_links: ImpactReport["cross_links"];
  resolutions: Record<string, unknown>[];
  closureNotes: Map<string, string>;
}): ImpactReport {
  const byChange = new Map(opts.change.items.map((item) => [item.id, item]));
  const windowDays = opts.windowDays ?? DEFAULT_URGENCY_WINDOW_DAYS;
  const conserved = conserve(opts.findings, opts.accepted);
  const shown: Accepted[] = [];
  const not_material: ImpactReport["not_material"] = [];
  for (const row of conserved) {
    if (row.labels.materiality === "not_material") {
      not_material.push({
        stack_id: row.stack_id,
        finding_id: row.finding.id,
        reason: row.rationale || row.labels.materiality_test || "Not material.",
      });
    } else {
      shown.push(row);
    }
  }
  const decorated = shown.map((row, index) => ({ row, index, key: sortKey(row, byChange, opts.asOf) }));
  decorated.sort((a, b) => compareKey(a.key, b.key) || a.index - b.index);
  const items: ReportItem[] = decorated.map(({ row }, i) => ({
    rank: i + 1,
    stack_id: row.stack_id,
    finding_id: row.finding.id,
    change_ref: row.finding.change_ref,
    labels: row.labels,
    category: row.finding.finding_type,
    group: row.labels.direction,
    headline: row.headline,
    amount: exposureAmount(row.finding.facts?.exposure),
    what: row.what || clip(row.finding.reasoning, 240),
    why: row.why || row.labels.materiality_test || clip(row.finding.reasoning, 240),
    when: row.when || whenText(row, opts.asOf, windowDays),
    rationale: ensureRationale(row, byChange.get(row.finding.change_ref)?.legal_status),
    citations: row.finding.citations,
  }));
  const referenced = new Set(conserved.map((row) => row.finding.change_ref));
  const change_item_closure = opts.change.items.map((item) => {
    if (referenced.has(item.id)) return { change_ref: item.id, status: "addressed" as const, reason: "Referenced by a finding." };
    const note = opts.closureNotes.get(item.id);
    if (!item.substantive) {
      return { change_ref: item.id, status: "unaddressed" as const, reason: note || `Dismissed as non-substantive: ${item.dismissal_reason ?? "noise"}.` };
    }
    return { change_ref: item.id, status: "unaddressed" as const, reason: note || "No finding referenced this change." };
  });
  return {
    items,
    not_material,
    cross_links: opts.cross_links,
    cross_reference_resolutions: closeCrossReferences(opts.findings, opts.resolutions),
    change_item_closure,
  };
}

function conserve(findings: StackFinding[], accepted: Accepted[]): Accepted[] {
  const keyed = new Map(accepted.map((row) => [`${row.stack_id}::${row.finding.id}`, row]));
  const out: Accepted[] = [];
  for (const stack of findings) {
    for (const finding of stack.findings) {
      const hit = keyed.get(`${stack.stack_id}::${finding.id}`);
      if (hit) out.push(hit);
      else {
        out.push({
          stack_id: stack.stack_id,
          finding,
          labels: finding.labels,
          rationale: `Conserved from the stack finding. urgency=${finding.labels.urgency}; materiality=${finding.labels.materiality}.`,
        });
      }
    }
  }
  return out;
}

type Key = { watch: number; materiality: number; urgency: number; days: number | null; exposure: number };

function sortKey(row: Accepted, byChange: Map<string, { legal_status: LegalStatus }>, asOf: string): Key {
  const legal = byChange.get(row.finding.change_ref)?.legal_status;
  const days = daysRemaining(row.finding.facts?.deadline_date, asOf);
  const amount = exposureAmount(row.finding.facts?.exposure);
  return {
    watch: legal && WATCH_LEGAL.has(legal) ? 1 : 0,
    materiality: MATERIALITY_RANK[row.labels.materiality],
    urgency: URGENCY_RANK[row.labels.urgency],
    days,
    exposure: amount ?? Number.NEGATIVE_INFINITY,
  };
}

function compareDays(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  // A missing date is unknown. It sorts after a future date and before a date already past.
  if (a === null) return b !== null && b < 0 ? -1 : 1;
  if (b === null) return a < 0 ? 1 : -1;
  return a - b;
}

function compareKey(a: Key, b: Key): number {
  return a.watch - b.watch || a.materiality - b.materiality || a.urgency - b.urgency || compareDays(a.days, b.days) || b.exposure - a.exposure;
}

function daysRemaining(date: string | null | undefined, asOf: string): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${asOf}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return Math.round(ms / 86_400_000);
}

function exposureAmount(exposure: Record<string, unknown> | null | undefined): number | null {
  if (!exposure) return null;
  const amount = exposure.amount ?? exposure.value;
  return typeof amount === "number" ? amount : null;
}

function whenText(row: Accepted, asOf: string, windowDays: number): string {
  const date = row.finding.facts?.deadline_date;
  if (date) {
    const days = daysRemaining(date, asOf);
    if (days === null) return date;
    const horizon = days <= windowDays ? `inside the ${windowDays}-day window` : `outside the ${windowDays}-day window`;
    return `${date} (${days} day(s) from ${asOf}; ${horizon})`;
  }
  return row.labels.urgency.replaceAll("_", " ");
}

function ensureRationale(row: Accepted, legal: LegalStatus | undefined): string {
  const base = row.rationale?.trim() || "";
  const hasUrgency = base.includes("urgency");
  const hasMateriality = base.includes("materiality");
  if (hasUrgency && hasMateriality) return base;
  const suffix = `Deciding fields: urgency=${row.labels.urgency}; materiality=${row.labels.materiality}; legal_status=${legal ?? "undeterminable"}.`;
  return base ? `${base} ${suffix}` : suffix;
}

function closeCrossReferences(findings: StackFinding[], provided: Record<string, unknown>[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const stack of findings) {
    for (const ref of stack.cross_references) {
      const match = provided.find((row) => row.target_description === ref.target_description || row.resolves_cross_reference === ref.target_description);
      out.push(
        match ?? {
          source_stack_id: stack.stack_id,
          target_description: ref.target_description,
          target_stack_id: ref.target_stack_id ?? null,
          status: "unresolved",
          resolves_cross_reference: ref.target_description,
        },
      );
    }
  }
  return out;
}

function clip(text: string, n: number): string {
  const trimmed = text.trim();
  return trimmed.length <= n ? trimmed : `${trimmed.slice(0, n - 1)}…`;
}

export function urgencyWindowFromPrompt(custom: string | null | undefined): number {
  if (!custom) return DEFAULT_URGENCY_WINDOW_DAYS;
  const match = /(\d+)\s*-?\s*day/i.exec(custom);
  if (!match) return DEFAULT_URGENCY_WINDOW_DAYS;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 && n < 3650 ? n : DEFAULT_URGENCY_WINDOW_DAYS;
}
