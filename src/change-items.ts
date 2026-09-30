import type { Hunk } from "./diff.js";

/**
 * Deterministic side of stage 1. The diff proposes the change items; the model
 * describes them or opts them out as noise. Nothing here calls a model.
 */

/** A hunk longer than this is a rewrite (or two different documents), not an item. The model cites lines inside it instead. */
export const MAX_KEPT_HUNK_LINES = 30;

export type Candidate = { id: string; from: number; to: number };

/** Changed lines of the new snapshot, one candidate per hunk. Pure deletions point at the context where the text was. */
export function hunkCandidates(hunks: Hunk[]): Candidate[] {
  const out: Candidate[] = [];
  for (const hunk of hunks) {
    const added = hunk.rows.filter((row) => row.mark === "+" && row.newLine != null).map((row) => row.newLine as number);
    const from = added.length ? Math.min(...added) : Math.max(1, hunk.newStart);
    const to = added.length ? Math.max(...added) : Math.max(from, hunk.newStart + hunk.newCount - 1);
    if (to - from + 1 > MAX_KEPT_HUNK_LINES) continue;
    out.push({ id: hunk.id, from, to });
  }
  return out;
}

/** Candidates that no recorded item (substantive or noise) overlaps. */
export function uncovered(candidates: Candidate[], ranges: { from: number; to: number }[]): Candidate[] {
  return candidates.filter((c) => !ranges.some((r) => r.from <= c.to && c.from <= r.to));
}

const PLACEHOLDER = /^(?:test|testing|todo|tbd|placeholder|lorem|sample|example|foo|bar|xxx+|n\/?a|none|change|item)\b[\s\w]{0,3}$|\btest\s+[a-z0-9]\b/i;

/** A probe or stand-in rather than a description ("test A", "TODO", three words or fewer). */
export function isPlaceholder(summary: string | null | undefined): boolean {
  const text = summary?.trim() ?? "";
  return PLACEHOLDER.test(text) || text.split(/\s+/).filter(Boolean).length < 4;
}

/** Why a summary is not usable, or null. Catches probes and placeholders ("test A"), not style. */
export function summaryProblem(summary: string | null | undefined): string | null {
  const text = summary?.trim() ?? "";
  const words = text.split(/\s+/).filter(Boolean).length;
  if (PLACEHOLDER.test(text)) return `"${text}" is a placeholder. Every call records a real item; there is no test mode.`;
  if (words < 4) return "The summary needs one plain sentence (at least four words) saying what changed.";
  if (words > 50) return "Keep the summary to one sentence of at most 40 words. The cited lines carry the detail.";
  return null;
}
