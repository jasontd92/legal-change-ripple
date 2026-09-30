import { cpSlice } from "./normalize.js";

/** Quote comparison (V2). Offsets are never computed on this form. */
export function normWs(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

export function quoteInSpan(text: string, start: number, end: number, quote: string): boolean {
  return normWs(quote).length > 0 && normWs(cpSlice(text, start, end)).includes(normWs(quote));
}

type Piece = { ch: string; start: number; end: number };

function isSpace(ch: string): boolean {
  return /\s/u.test(ch);
}

/** Collapsed form of `text`, with each collapsed character mapped back to code-point offsets. */
function collapse(text: string): { norm: string; pieces: Piece[] } {
  const cps = Array.from(text);
  const pieces: Piece[] = [];
  let i = 0;
  let started = false;
  while (i < cps.length) {
    if (isSpace(cps[i] ?? "")) {
      if (started && pieces[pieces.length - 1]?.ch !== " ") {
        const spaceAt = i;
        while (i < cps.length && isSpace(cps[i] ?? "")) i++;
        pieces.push({ ch: " ", start: spaceAt, end: i });
      } else {
        while (i < cps.length && isSpace(cps[i] ?? "")) i++;
      }
      continue;
    }
    started = true;
    pieces.push({ ch: cps[i] ?? "", start: i, end: i + 1 });
    i++;
  }
  while (pieces.length > 0 && pieces[pieces.length - 1]?.ch === " ") pieces.pop();
  return { norm: pieces.map((p) => p.ch).join(""), pieces };
}

export type Located = { start: number; end: number };

/**
 * Find `quote` in `text` under whitespace collapsing.
 * Returns code-point offsets into `text` (end exclusive) whose collapsed
 * form contains the collapsed quote. Multiple hits: the one under
 * `sectionLabel` when that heading exists, otherwise the first.
 */
export function locateQuote(text: string, quote: string, sectionLabel?: string | null): Located | null {
  const q = normWs(quote);
  if (!q) return null;
  const { pieces } = collapse(text);
  const needle = Array.from(q);
  const hits: Located[] = [];
  for (let at = 0; at <= pieces.length - needle.length; at++) {
    let matched = true;
    for (let j = 0; j < needle.length; j++) {
      if (pieces[at + j]?.ch !== needle[j]) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;
    const first = pieces[at];
    const last = pieces[at + needle.length - 1];
    if (first && last) hits.push({ start: first.start, end: last.end });
  }
  if (hits.length === 0) return null;
  if (sectionLabel && sectionLabel.trim()) {
    const under = hits.find((hit) => headingCovers(text, hit.start, sectionLabel));
    if (under) return under;
  }
  return hits[0] ?? null;
}

function headingCovers(text: string, codePoint: number, sectionLabel: string): boolean {
  const lines = text.split("\n");
  const target = sectionLabel.trim().toLowerCase();
  let cursor = 0;
  let open = false;
  let openLevel = 0;
  const cps = Array.from(text);
  // Walk lines using code-point cursor. `split` is code-unit based; for
  // heading detection a line walk on the JS string is enough because headings
  // are ASCII markers. Convert the match point to a JS index via the prefix.
  const jsIndex = cps.slice(0, codePoint).join("").length;
  void cursor;
  let offset = 0;
  for (const line of lines) {
    const lineStart = offset;
    const lineEnd = offset + line.length;
    const heading = headingOf(line);
    if (heading) {
      if (open && heading.level <= openLevel && lineStart > 0) {
        if (jsIndex < lineStart) return true;
        open = false;
      }
      if (heading.text.toLowerCase() === target || heading.text.toLowerCase().includes(target)) {
        open = true;
        openLevel = heading.level;
      } else if (open && heading.level <= openLevel) {
        open = false;
      }
    }
    if (open && jsIndex >= lineStart && jsIndex <= lineEnd) return true;
    offset = lineEnd + 1;
  }
  return open && jsIndex >= 0;
}

function headingOf(line: string): { level: number; text: string } | null {
  const md = /^(#{1,6})\s+(.*)$/.exec(line.trim());
  if (md) return { level: md[1].length, text: md[2].trim() };
  return null;
}

/** Nearest preceding markdown heading, or a TERMS label on the line itself. */
export function headingBefore(text: string, codePoint: number): string | null {
  const prefix = Array.from(text).slice(0, codePoint).join("");
  const lines = prefix.split("\n");
  const current = lines[lines.length - 1] ?? "";
  if (/^TERMS\b/i.test(current.trim())) return "TERMS";
  for (let i = lines.length - 1; i >= 0; i--) {
    const heading = headingOf(lines[i] ?? "");
    if (heading) return heading.text;
  }
  if (/^TERMS\b/i.test(current.trim())) return "TERMS";
  return null;
}

export function lineAt(text: string, codePoint: number): string {
  const prefix = Array.from(text).slice(0, codePoint).join("");
  const lines = text.split("\n");
  const lineNo = prefix.split("\n").length - 1;
  return lines[lineNo] ?? "";
}
