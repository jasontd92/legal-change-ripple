import type { Corpus, DocRecord } from "./corpus.js";
import { docFile, readNormalized } from "./corpus.js";
import { headingBefore, lineAt, locateQuote } from "./text.js";
import type { IncorporatesEdge } from "./types.js";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * Junction of `incorporates` edges. A row exists only when source text names
 * a published URL that belongs to another corpus document. Nothing else is inferred.
 * A dated pin selects that version. A floating "as in effect" pin selects the
 * version whose effective date is the latest on or before the source's own date.
 */
export function buildIncorporates(corpus: Corpus): IncorporatesEdge[] {
  const byUrl = new Map<string, DocRecord[]>();
  for (const doc of corpus.docs) {
    if (!doc.published_url) continue;
    const key = normalizeUrl(doc.published_url);
    const list = byUrl.get(key) ?? [];
    list.push(doc);
    byUrl.set(key, list);
  }
  const urls = [...byUrl.keys()].sort((a, b) => b.length - a.length);
  const edges: IncorporatesEdge[] = [];
  const seen = new Set<string>();
  for (const doc of corpus.docs) {
    let text: string;
    try {
      text = readNormalized(corpus, docFile(corpus, doc));
    } catch {
      continue;
    }
    const lower = text.toLowerCase();
    for (const url of urls) {
      const versions = byUrl.get(url)!;
      if (versions.some((v) => v.doc_id === doc.doc_id)) continue;
      if (!lower.includes(url)) continue;
      const at = lower.indexOf(url);
      const line = lineAt(text, at).trim();
      const target = pickVersion(versions, line, doc.effective_date);
      if (!target) continue;
      const located = locateQuote(text, line) ?? { start: at, end: at + url.length };
      const pin = extractPin(line);
      const heading = headingBefore(text, located.start) ?? (pin ? "TERMS" : "Incorporation");
      const key = `${doc.doc_id}->${target.doc_id}@${located.start}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        source_doc_id: doc.doc_id,
        target_doc_id: target.doc_id,
        clause_heading: heading,
        section: heading,
        quote: line.slice(0, 800),
        version_pin: pin,
      });
    }
  }
  edges.sort((a, b) => a.source_doc_id.localeCompare(b.source_doc_id) || a.target_doc_id.localeCompare(b.target_doc_id));
  return edges;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

function extractPin(line: string): string | null {
  const paren = /\((as published [^)]+|as in effect [^)]+|updated [^)]+|rev(?:ision)? [^)]+)\)/i.exec(line);
  if (paren) return paren[1]!.trim();
  const loose = /\b(as published [A-Za-z]+ \d{4}|as in effect on the date of [^.,;]+|updated \d{2}-\d{2}-\d{4})\b/i.exec(line);
  return loose ? loose[1]!.trim() : null;
}

function pickVersion(versions: DocRecord[], line: string, sourceDate: string | undefined): DocRecord | null {
  const lower = line.toLowerCase();
  const byLabel = versions.find((v) => v.version_label && lower.includes(v.version_label.toLowerCase()));
  if (byLabel) return byLabel;
  const month = new RegExp(`\\b(${MONTHS.join("|")})\\s+(\\d{4})\\b`, "i").exec(line);
  if (month) {
    const phrase = month[0].toLowerCase();
    const byMonth = versions.find((v) => v.version_label?.toLowerCase().includes(phrase));
    if (byMonth) return byMonth;
    const monthIndex = MONTHS.indexOf(month[1]!.toLowerCase());
    const year = month[2]!;
    const mm = String(monthIndex + 1).padStart(2, "0");
    const byDate = versions.find((v) => v.effective_date?.startsWith(`${year}-${mm}`));
    if (byDate) return byDate;
  }
  const eligible = versions
    .filter((v) => !sourceDate || !v.effective_date || v.effective_date <= sourceDate)
    .sort((a, b) => (b.effective_date ?? "").localeCompare(a.effective_date ?? ""));
  return eligible[0] ?? versions[0] ?? null;
}
