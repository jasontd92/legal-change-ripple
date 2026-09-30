/**
 * Contract normaliser (contracts/normalize/SPEC.md, v0.1.0).
 * Offsets are Unicode code points into this text. Nothing else is folded.
 */
export function normalize(raw: Buffer | string): string {
  let text = typeof raw === "string" ? raw : new TextDecoder("utf-8", { fatal: false }).decode(raw);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return text.normalize("NFC");
}

/** Code-point length. Do not use String.length for contract offsets. */
export function cpLength(text: string): number {
  return Array.from(text).length;
}

/** Slice by code point, end exclusive. */
export function cpSlice(text: string, start: number, end: number): string {
  return Array.from(text).slice(start, end).join("");
}

/**
 * Stage-0 cosmetic form. Encoding is already handled by `normalize`.
 * This additionally strips HTML tags and collapses whitespace so a
 * formatting-only snapshot does not open an orchestrator session.
 * Offsets are never computed on this form.
 */
export function cosmetic(text: string): string {
  // Line-leading "a)" / "1." markers are outline labels. Renumbering them is
  // not a change to the sentence that follows.
  const marked = normalize(text).replace(/(^|\n)\s*(?:[a-z]\)|\d+\.)\s+/g, "$1");
  return marked.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
