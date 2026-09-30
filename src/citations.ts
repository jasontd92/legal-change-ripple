import type { Corpus } from "./corpus.js";
import { readNormalized } from "./corpus.js";
import { headingBefore, quoteInSpan, locateQuote } from "./text.js";
import type { Span } from "./types.js";

export type LineRequest = {
  file: string;
  lines: string;
  section_label?: string | null;
};

/** A citation is a passage, not a section. Longer ranges are refused so a model cannot cite a whole page. */
export const MAX_CITED_LINES = 30;

/** "12", "12-18", "L12-L18", "12–18". 1-based, inclusive. */
export function parseLines(ref: string): { from: number; to: number } | null {
  const match = /^\s*L?(\d+)\s*(?:[-–—]|to)?\s*(?:L?(\d+))?\s*$/i.exec(String(ref));
  if (!match) return null;
  const from = Number(match[1]);
  const to = match[2] ? Number(match[2]) : from;
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) return null;
  return { from, to };
}

/** Code-point span covering lines from..to of `text`, trimmed of the whitespace at either end. */
export function lineSpan(text: string, from: number, to: number): { start: number; end: number; quote: string } | null {
  const lines = text.split("\n");
  if (from < 1 || to > lines.length) return null;
  let start = 0;
  for (let i = 0; i < from - 1; i++) start += Array.from(lines[i] ?? "").length + 1;
  const body = Array.from(lines.slice(from - 1, to).join("\n"));
  let lead = 0;
  while (lead < body.length && /\s/u.test(body[lead] ?? "")) lead++;
  let tail = body.length;
  while (tail > lead && /\s/u.test(body[tail - 1] ?? "")) tail--;
  if (tail <= lead) return null;
  return { start: start + lead, end: start + tail, quote: body.slice(lead, tail).join("") };
}

/** Resolve a line reference to a span. The quote is read from the file, never written by the model. */
export function resolveLines(corpus: Corpus, request: LineRequest, allowed: Set<string> | null): { span?: Span; error?: string } {
  const file = resolveFile(request.file, allowed, corpus);
  if (!file) return { error: `Citation file is not available: ${request.file}` };
  let text: string;
  try {
    text = readNormalized(corpus, file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  const range = parseLines(request.lines);
  if (!range) return { error: `Lines must look like "120" or "120-126": got ${JSON.stringify(request.lines)}.` };
  const count = text.split("\n").length;
  if (range.to > count) return { error: `Lines ${request.lines} run past the end of ${file} (${count} lines).` };
  if (range.to - range.from + 1 > MAX_CITED_LINES) return { error: `Cite at most ${MAX_CITED_LINES} lines: the passage that does the work, not the section.` };
  const hit = lineSpan(text, range.from, range.to);
  if (!hit) return { error: `Lines ${request.lines} of ${file} are blank.` };
  const span: Span = { file, start: hit.start, end: hit.end, quote: hit.quote };
  const label = request.section_label?.trim() || headingBefore(text, hit.start);
  if (label) span.section_label = label;
  return { span };
}

export type QuoteRequest = {
  file: string;
  quote: string;
  section_label?: string | null;
};

export function resolveSpan(corpus: Corpus, request: QuoteRequest, allowed: Set<string> | null): { span?: Span; error?: string } {
  const file = resolveFile(request.file, allowed, corpus);
  if (!file) {
    const listed = allowed && allowed.size > 0 && allowed.size <= 4 ? ` Available files: ${[...allowed].join(", ")}.` : "";
    return { error: `Citation file is not available: ${request.file}.${listed}` };
  }
  let text: string;
  try {
    text = readNormalized(corpus, file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  const located = locateQuote(text, request.quote, request.section_label);
  if (!located) return { error: `Quote was not found verbatim in ${file}. Copy a shorter contiguous substring from that file. Whitespace may differ; words may not.` };
  const span: Span = {
    file,
    start: located.start,
    end: located.end,
    quote: request.quote,
  };
  if (request.section_label) span.section_label = request.section_label;
  if (!quoteInSpan(text, span.start, span.end, request.quote)) {
    return { error: `Located a span in ${file} but the quote is not contained in it.` };
  }
  return { span };
}

function foldBase(file: string): string {
  const base = (file.split("/").pop() ?? file).toLowerCase();
  const stem = base.replace(/\.[a-z0-9]{1,5}$/, "");
  return stem.replace(/[-_\s]+/g, "");
}

/** Hyphen and underscore are the same character. A unique basename, or a unique suffix of one, resolves. */
export function matchFileName(request: string, candidates: Iterable<string>): string | null {
  const want = foldBase(request);
  if (want.length < 8) return null;
  const hits = [...candidates].filter((file) => {
    const got = foldBase(file);
    return got === want || got.endsWith(want);
  });
  return hits.length === 1 ? hits[0]! : null;
}

function resolveFile(file: string, allowed: Set<string> | null, corpus: Corpus): string | null {
  const norm = file.replaceAll("\\", "/").replace(/^\.\//, "");
  if (allowed) {
    if (allowed.has(norm)) return norm;
    const suffix = [...allowed].find((f) => f.endsWith(`/${norm}`));
    if (suffix) return suffix;
    return matchFileName(norm, allowed);
  }
  const candidates = [norm];
  if (!norm.startsWith(`${corpus.corpusRoot}/`)) {
    candidates.push(`${corpus.corpusRoot}/${norm.replace(/^\//, "")}`);
  }
  for (const item of candidates) {
    try {
      readNormalized(corpus, item);
      return item;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

export function spanOk(corpus: Corpus, span: Span): boolean {
  try {
    const text = readNormalized(corpus, span.file);
    if (span.start < 0 || span.end > [...text].length || span.end <= span.start) return false;
    if (!span.quote) return true;
    return quoteInSpan(text, span.start, span.end, span.quote);
  } catch {
    return false;
  }
}
