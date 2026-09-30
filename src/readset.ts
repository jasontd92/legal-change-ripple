import { cpLength } from "./normalize.js";
import { estimateTokens, GREP_TOKEN_BUDGET, LINES_PER_PAGE, MAX_READ_PAGES, numberLines, pageOfLine, paginate } from "./pages.js";
import type { ToolOutcome } from "./types.js";

export type FaultState = {
  tool_error?: { tool: string; nth_call: number };
  counts: Map<string, number>;
};

export function checkFault(state: FaultState | null, tool: string): { fault: boolean } {
  if (!state?.tool_error || state.tool_error.tool !== tool) return { fault: false };
  const n = (state.counts.get(tool) ?? 0) + 1;
  state.counts.set(tool, n);
  return { fault: n === state.tool_error.nth_call };
}

export function grepReadingSet(opts: {
  query: string;
  file?: string | null;
  files: Map<string, string>;
  allowed: Set<string>;
  fault: FaultState | null;
}): ToolOutcome {
  const tool = "grep";
  const fault = checkFault(opts.fault, tool);
  if (fault.fault) {
    return {
      model: { ok: false, error: "Injected tool error.", injected_fault: true },
      telemetry: { tool, ok: false, error: "Injected tool error.", injected_fault: true, file: opts.file ?? null },
    };
  }
  const query = opts.query.trim();
  if (!query) {
    return fail(tool, "Query is empty.", opts.file ?? null);
  }
  const wanted = opts.file ? resolveAllowed(opts.file, opts.allowed) : null;
  if (opts.file && !wanted) return refuse(tool, opts.file);
  const targets = wanted ? [wanted] : [...opts.allowed].sort();
  type Hit = { file: string; line: number; page: number; snippet: string };
  const hits: Hit[] = [];
  const needle = query.toLowerCase();
  for (const file of targets) {
    const text = opts.files.get(file);
    if (text === undefined) continue;
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i] ?? "").toLowerCase().includes(needle)) {
        hits.push({ file, line: i + 1, page: pageOfLine(i), snippet: (lines[i] ?? "").trim().slice(0, 200) });
      }
    }
  }
  const header = `Query matched ${hits.length} line(s).`;
  const packed: Hit[] = [];
  let used = estimateTokens(header);
  for (const hit of hits) {
    const line = `${hit.file} line ${hit.line} page ${hit.page}: ${hit.snippet}`;
    const cost = estimateTokens(line) + 1;
    if (used + cost > GREP_TOKEN_BUDGET) break;
    packed.push(hit);
    used += cost;
  }
  const truncated = packed.length < hits.length;
  const model = {
    ok: true,
    total: hits.length,
    hits: packed,
    note: truncated
      ? `This search returned ${hits.length} results. Refine or narrow the search to see specific results.`
      : null,
  };
  const rendered = JSON.stringify(model);
  return {
    model,
    telemetry: {
      tool,
      ok: true,
      file: wanted,
      chars_returned: rendered.length,
      file_chars: wanted ? cpLength(opts.files.get(wanted) ?? "") : null,
    },
  };
}

export function readPages(opts: {
  file: string;
  startPage: number;
  files: Map<string, string>;
  allowed: Set<string>;
  fault: FaultState | null;
}): ToolOutcome {
  const tool = "read";
  const fault = checkFault(opts.fault, tool);
  if (fault.fault) {
    return {
      model: { ok: false, error: "Injected tool error.", injected_fault: true },
      telemetry: { tool, ok: false, error: "Injected tool error.", injected_fault: true, file: opts.file },
    };
  }
  const file = resolveAllowed(opts.file, opts.allowed);
  if (!file) return refuse(tool, opts.file);
  const text = opts.files.get(file);
  if (text === undefined) return fail(tool, `Unreadable file: ${file}`, file);
  const pages = paginate(text);
  const start = Math.max(1, opts.startPage || 1);
  if (start > pages.length) {
    return fail(tool, `Page ${start} is past the end (${pages.length} page(s)).`, file, cpLength(text));
  }
  const slice = pages.slice(start - 1, start - 1 + MAX_READ_PAGES);
  const end = slice[slice.length - 1]?.number ?? start;
  const more = end < pages.length;
  const body = slice.map((p) => `--- page ${p.number} ---\n${numberLines(p.text, (p.number - 1) * LINES_PER_PAGE + 1)}`).join("\n");
  const returned = slice.reduce((sum, p) => sum + cpLength(p.text) + 1, 0);
  const note = more
    ? `Returned pages ${start}–${end} of ${pages.length}. grep to narrow by section or keywords, or read the next page range.`
    : null;
  const model = { ok: true, file, start_page: start, end_page: end, page_count: pages.length, text: body, note };
  return {
    model,
    telemetry: {
      tool,
      ok: true,
      file,
      chars_returned: returned,
      file_chars: cpLength(text),
    },
  };
}

/** The trigger snapshot is already quoted on the change record. Return those quotes instead of a refusal. */
export function triggerSnapshotAnswer(opts: {
  tool: string;
  file: string;
  anchors: { id: string; file: string; quote?: string; section_label?: string }[];
}): ToolOutcome | null {
  const norm = opts.file.replaceAll("\\", "/").replace(/^\.\//, "");
  const hits = opts.anchors.filter((anchor) => anchor.file === norm || anchor.file.endsWith(`/${norm}`) || norm.endsWith(`/${anchor.file}`) || norm === anchor.file);
  if (hits.length === 0) return null;
  const model = {
    ok: true,
    note: "This file is the trigger snapshot. Its passages are already on the change record, and a finding cites them through change_ref. Search only this stack's reading set.",
    quotes: hits.map((hit) => ({ change_ref: hit.id, section_label: hit.section_label ?? null, quote: hit.quote ?? "" })),
  };
  return {
    model,
    telemetry: { tool: opts.tool, ok: true, file: hits[0]!.file, chars_returned: JSON.stringify(model).length },
  };
}

function resolveAllowed(file: string, allowed: Set<string>): string | null {
  const norm = file.replaceAll("\\", "/").replace(/^\.\//, "");
  if (allowed.has(norm)) return norm;
  const hit = [...allowed].find((f) => f.endsWith(`/${norm}`) || f.endsWith(norm));
  return hit ?? null;
}

function refuse(tool: string, file: string): ToolOutcome {
  const error = `Path is outside this stack's reading set: ${file}`;
  return {
    model: { ok: false, error },
    telemetry: { tool, ok: false, error, file, chars_returned: 0 },
  };
}

function fail(tool: string, error: string, file: string | null, fileChars?: number): ToolOutcome {
  return {
    model: { ok: false, error },
    telemetry: { tool, ok: false, error, file, file_chars: fileChars ?? null, chars_returned: 0 },
  };
}
