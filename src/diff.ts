/**
 * Shortest edit script (Myers, 1986) on lines of the normalized snapshots,
 * then again on words inside each changed region. Hunks keep three lines of
 * unchanged context.
 */

export type Edit = { op: "equal" | "delete" | "insert"; text: string };

export type DiffSpan = { kind: "same" | "del" | "ins"; text: string };

export type DiffRow = {
  mark: " " | "-" | "+";
  oldLine: number | null;
  newLine: number | null;
  spans: DiffSpan[];
};

export type Hunk = {
  id: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  /** Code-point range of this hunk in the new snapshot, end exclusive. */
  newStartCp: number;
  newEndCp: number;
  rows: DiffRow[];
};

export type ReviewDiff = {
  kind: "first" | "compared";
  old_file: string | null;
  new_file: string;
  hunks: Hunk[];
  /** Code-point bounds of each line in the new snapshot. Index 0 is line 1. */
  lines: { start: number; end: number }[];
};

const CONTEXT = 3;

type Tagged =
  | { op: "equal"; text: string; oldLine: number; newLine: number }
  | { op: "delete"; text: string; oldLine: number }
  | { op: "insert"; text: string; newLine: number };

/** Line ranges tile the text. Each range includes its trailing newline, end exclusive. */
export function lineBounds(text: string): { start: number; end: number }[] {
  const lines = text.split("\n");
  const bounds: { start: number; end: number }[] = [];
  let cursor = 0;
  for (let index = 0; index < lines.length; index++) {
    const start = cursor;
    cursor += cpLength(lines[index] ?? "");
    if (index < lines.length - 1) cursor += 1;
    bounds.push({ start, end: cursor });
  }
  return bounds;
}

export function myersDiff(a: string[], b: string[]): Edit[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) return b.map((text) => ({ op: "insert", text }));
  if (m === 0) return a.map((text) => ({ op: "delete", text }));

  const max = n + m;
  const offset = max;
  const v = new Int32Array(2 * max + 1);
  const trace: Int32Array[] = [];
  let endD = -1;

  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!);
      let x = down ? v[offset + k + 1]! : v[offset + k - 1]! + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        endD = d;
        break outer;
      }
    }
  }
  if (endD < 0) throw new Error("Myers diff did not reach the end.");
  return backtrack(a, b, trace, endD, offset);
}

function backtrack(a: string[], b: string[], trace: Int32Array[], endD: number, offset: number): Edit[] {
  let x = a.length;
  let y = b.length;
  const edits: Edit[] = [];
  for (let d = endD; d > 0; d--) {
    const v = trace[d]!;
    const k = x - y;
    const down = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!);
    const prevK = down ? k + 1 : k - 1;
    const prevX = v[offset + prevK]!;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x -= 1;
      y -= 1;
      edits.push({ op: "equal", text: a[x]! });
    }
    if (down) edits.push({ op: "insert", text: b[prevY]! });
    else edits.push({ op: "delete", text: a[prevX]! });
    x = prevX;
    y = prevY;
  }
  while (x > 0 && y > 0) {
    x -= 1;
    y -= 1;
    edits.push({ op: "equal", text: a[x]! });
  }
  edits.reverse();
  return edits;
}

export function diffLines(oldText: string, newText: string): Hunk[] {
  if (oldText === newText) return [];
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const bounds = lineBounds(newText);
  const tagged = tag(myersDiff(oldLines, newLines));
  return windows(tagged, CONTEXT).map((window, index) => toHunk(tagged, window, bounds, index));
}

export function hunkForRange(hunks: Hunk[], start: number, end: number): Hunk | null {
  if (!(end > start)) return null;
  let best: Hunk | null = null;
  let bestOverlap = 0;
  for (const hunk of hunks) {
    const overlap = Math.min(end, hunk.newEndCp) - Math.max(start, hunk.newStartCp);
    if (overlap > bestOverlap) {
      best = hunk;
      bestOverlap = overlap;
    }
  }
  return best;
}

/**
 * The rows of a hunk that sit on a citation, plus a few neighbors.
 * A rewritten statute is one large hunk; the card shows this window, and the
 * viewer holds the rest.
 */
export function excerptRows(
  hunk: Hunk,
  lines: { start: number; end: number }[],
  start: number,
  end: number,
  pad = 3,
): { rows: DiffRow[]; truncated: boolean; line: number | null } {
  const hit = new Set<number>();
  lines.forEach((line, index) => {
    if (line.end > start && line.start < end) hit.add(index + 1);
  });
  const anchors: number[] = [];
  hunk.rows.forEach((row, index) => {
    if (row.newLine !== null && hit.has(row.newLine)) anchors.push(index);
  });
  if (anchors.length === 0) {
    const rows = hunk.rows.slice(0, pad * 2);
    return { rows, truncated: hunk.rows.length > rows.length, line: rows.find((row) => row.newLine !== null)?.newLine ?? null };
  }
  let lo = Math.max(0, Math.min(...anchors) - pad);
  const hi = Math.min(hunk.rows.length - 1, Math.max(...anchors) + pad);
  while (lo > 0 && hunk.rows[lo]?.mark === "+" && hunk.rows[lo - 1]?.mark === "-") lo -= 1;
  return {
    rows: hunk.rows.slice(lo, hi + 1),
    truncated: lo > 0 || hi < hunk.rows.length - 1,
    line: hunk.rows[anchors[0]!]?.newLine ?? null,
  };
}

/** Unified preview for the stage-1 prompt. The full new snapshot is sent separately. */
export function previewFromHunks(hunks: Hunk[], maxRows = 100): string {
  const blocks: string[] = [];
  let used = 0;
  let omitted = 0;
  for (const [index, hunk] of hunks.entries()) {
    if (used >= maxRows) {
      omitted += hunks.length - index;
      break;
    }
    const end = hunk.newCount > 0 ? hunk.newStart + hunk.newCount - 1 : hunk.newStart;
    const block = [`@@ ${hunk.id} new lines ${hunk.newStart}-${end}`];
    let cut = false;
    for (const row of hunk.rows) {
      if (used + block.length >= maxRows) {
        cut = true;
        break;
      }
      block.push(`${row.mark}${row.spans.map((span) => span.text).join("")}`);
    }
    if (cut) block.push("…");
    used += block.length;
    blocks.push(block.join("\n"));
  }
  if (omitted > 0) blocks.push(`(${omitted} further hunks omitted from this preview. The full new snapshot follows.)`);
  return blocks.join("\n\n") || "(no differing lines)";
}

function tag(edits: Edit[]): Tagged[] {
  const tagged: Tagged[] = [];
  let oldLine = 1;
  let newLine = 1;
  for (const edit of edits) {
    if (edit.op === "equal") {
      tagged.push({ op: "equal", text: edit.text, oldLine, newLine });
      oldLine += 1;
      newLine += 1;
    } else if (edit.op === "delete") {
      tagged.push({ op: "delete", text: edit.text, oldLine });
      oldLine += 1;
    } else {
      tagged.push({ op: "insert", text: edit.text, newLine });
      newLine += 1;
    }
  }
  return tagged;
}

function windows(tagged: Tagged[], context: number): { lo: number; hi: number }[] {
  const out: { lo: number; hi: number }[] = [];
  tagged.forEach((row, index) => {
    if (row.op === "equal") return;
    const lo = Math.max(0, index - context);
    const hi = Math.min(tagged.length - 1, index + context);
    const last = out[out.length - 1];
    if (last && lo <= last.hi + 1) last.hi = Math.max(last.hi, hi);
    else out.push({ lo, hi });
  });
  return out;
}

function toHunk(tagged: Tagged[], window: { lo: number; hi: number }, bounds: { start: number; end: number }[], index: number): Hunk {
  const slice = tagged.slice(window.lo, window.hi + 1);
  const rows: DiffRow[] = [];
  let cursor = 0;
  while (cursor < slice.length) {
    const row = slice[cursor]!;
    if (row.op === "equal") {
      rows.push({ mark: " ", oldLine: row.oldLine, newLine: row.newLine, spans: [{ kind: "same", text: row.text }] });
      cursor += 1;
      continue;
    }
    const group: Tagged[] = [];
    while (cursor < slice.length && slice[cursor]!.op !== "equal") {
      group.push(slice[cursor]!);
      cursor += 1;
    }
    rows.push(...paintGroup(group));
  }
  const newNums = rows.flatMap((row) => (row.newLine === null ? [] : [row.newLine]));
  const oldNums = rows.flatMap((row) => (row.oldLine === null ? [] : [row.oldLine]));
  const newStart = newNums[0] ?? 1;
  const newCount = newNums.length;
  const newStartCp = newCount === 0 ? 0 : bounds[newStart - 1]?.start ?? 0;
  const newEndCp = newCount === 0 ? newStartCp : bounds[newStart + newCount - 2]?.end ?? newStartCp;
  return {
    id: `h${index + 1}`,
    oldStart: oldNums[0] ?? 0,
    oldCount: oldNums.length,
    newStart,
    newCount,
    newStartCp,
    newEndCp,
    rows,
  };
}

function paintGroup(group: Tagged[]): DiffRow[] {
  const dels = group.filter((row): row is Extract<Tagged, { op: "delete" }> => row.op === "delete");
  const ins = group.filter((row): row is Extract<Tagged, { op: "insert" }> => row.op === "insert");
  if (dels.length > 0 && ins.length > 0 && dels.length === ins.length) {
    const rows: DiffRow[] = [];
    for (let index = 0; index < dels.length; index++) {
      const painted = paintWords(dels[index]!.text, ins[index]!.text);
      rows.push({ mark: "-", oldLine: dels[index]!.oldLine, newLine: null, spans: painted.before });
      rows.push({ mark: "+", oldLine: null, newLine: ins[index]!.newLine, spans: painted.after });
    }
    return rows;
  }
  if (dels.length > 0 && ins.length > 0) {
    const painted = paintWords(dels.map((row) => row.text).join("\n"), ins.map((row) => row.text).join("\n"));
    return [
      ...splitRows("-", painted.before, dels.map((row) => row.oldLine)),
      ...splitRows("+", painted.after, ins.map((row) => row.newLine)),
    ];
  }
  return [
    ...dels.map((row) => ({ mark: "-" as const, oldLine: row.oldLine, newLine: null, spans: [{ kind: "del" as const, text: row.text }] })),
    ...ins.map((row) => ({ mark: "+" as const, oldLine: null, newLine: row.newLine, spans: [{ kind: "ins" as const, text: row.text }] })),
  ];
}

function paintWords(before: string, after: string): { before: DiffSpan[]; after: DiffSpan[] } {
  const edits = myersDiff(tokenize(before), tokenize(after));
  const left = renderTokens(edits, "before");
  const right = renderTokens(edits, "after");
  if (left.length === 0) left.push({ kind: "del", text: "" });
  if (right.length === 0) right.push({ kind: "ins", text: "" });
  return { before: left, after: right };
}

function renderTokens(edits: Edit[], side: "before" | "after"): DiffSpan[] {
  const spans: DiffSpan[] = [];
  let word = false;
  for (const edit of edits) {
    if (side === "before" && edit.op === "insert") continue;
    if (side === "after" && edit.op === "delete") continue;
    const kind: DiffSpan["kind"] = edit.op === "equal" ? "same" : side === "before" ? "del" : "ins";
    if (edit.text.includes("\n")) {
      pushSpan(spans, kind, edit.text);
      word = false;
      continue;
    }
    if (word) pushSpan(spans, "same", " ");
    pushSpan(spans, kind, edit.text);
    word = true;
  }
  return spans;
}

function splitRows(mark: "-" | "+", spans: DiffSpan[], lines: number[]): DiffRow[] {
  const broken: DiffSpan[][] = [[]];
  for (const span of spans) {
    const parts = span.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) broken.push([]);
      if (part.length > 0) pushSpan(broken[broken.length - 1]!, span.kind, part);
    });
  }
  return broken.map((line, index) => ({
    mark,
    oldLine: mark === "-" ? lines[index] ?? null : null,
    newLine: mark === "+" ? lines[index] ?? null : null,
    spans: line.length > 0 ? line : [{ kind: "same", text: "" }],
  }));
}

function cpLength(text: string): number {
  return Array.from(text).length;
}

function tokenize(text: string): string[] {
  return text.match(/\n+|\S+/g) ?? [];
}

function pushSpan(out: DiffSpan[], kind: DiffSpan["kind"], text: string): void {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.kind === kind) last.text += text;
  else out.push({ kind, text });
}
