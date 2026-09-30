# Text normalisation (contract v0.1.0)

Every character offset in the contract (`span.start` / `span.end`) and in the
answer keys indexes into `normalize(raw_file_text)`. Both the harness
(TypeScript) and the eval tooling (Python) must implement **exactly** these
steps, and must pass `test_vectors.json`.

1. Decode bytes as UTF-8. A byte-order mark, if present, is removed.
2. Convert line endings: `\r\n` → `\n`, then any remaining `\r` → `\n`.
3. Apply Unicode **NFC** normalisation.
4. Nothing else. **No** whitespace collapsing, trimming, dehyphenation or
   case folding. Offsets must point at text as a reader sees it.

Offsets are in **Unicode code points** (Python `str` indexing), not UTF-16
code units. The TypeScript side must index by code point (e.g.
`Array.from(text)`), not with `String.prototype.slice` on UTF-16.

**Quote comparison (V2) is separate from offsets:** to check that a quote
appears in a span, both sides collapse runs of whitespace to a single space
and strip the ends before comparing (`norm_ws`). Offsets are never computed
on the collapsed form.
