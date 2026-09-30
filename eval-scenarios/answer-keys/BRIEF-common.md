# Common brief for gold work packages WP1–WP5

You are authoring **gold answer keys** for an eval suite of a legal-change
monitoring agent. Planning is finished and validated. Your job is to select
items, verify every fact against the corpus, and write gold files. You don't
build harnesses, run models, or write scorers.

## Read first (in this order, only the parts you need)
1. `eval-scenarios/HANDOFF.md`: the whole file. §3 (frozen decisions) is
   not up for debate.
2. `eval-scenarios/answer-keys/CONVENTIONS.md`: **binding** file layout,
   span rules, index-fragment format. Where it's more specific than
   HANDOFF, it wins.
3. `contracts/README.md` §2 and `contracts/schemas/common.schema.json`
   (enums).
4. `eval-design.md` §1, §2, §5, and the sections for your eval ids.
   `system-design.md` §5–§6 (StackFinding, label sets, ranking).
5. Your scenario file(s) and their `## Revision 2026-09-29` sections,
   `eval-scenarios/legal-questions.md`, `eval-scenarios/priority-tiers-draft.md`
   (validated tiers), `eval-scenarios/CHANGES-2026-09-29.md`.
6. The corpus (`corpus/`) is **ground truth**. Source-of-truth order is in
   HANDOFF §2. Don't use `corpus-research/`, `research/`, or
   `use-case-research.md`.

## Ownership rules (5 packages run in parallel)
- **The e2e owner writes every finding in its e2e file,** including
  findings that come from another package's scenario file. For those, read
  the other scenario file; don't wait for the other package.
- For scenario ids in **your** source file whose gold lives in **another
  package's** e2e file, write an index row with `status: done`,
  `gold_file: e2e/<that file>.yaml`, `gold_ref: <scenario id>`, and
  `notes: "authored by WP<n>"`. Don't author a duplicate.
- Write only your own files (CONVENTIONS §4). Never edit `corpus/`, other
  packages' files, or any scenario file other than your own `## Gold notes`
  append.
- Run tools from the repo root:
  `/Users/jason/Documents/gc-ai-take-home-research`.

## Method (HANDOFF §5), per item
1. Open the cited corpus files. Confirm the path, section and operative
   sentence. Choose tight verbatim `quote`s. Run `spans.py find` if unsure.
2. Resolve every `VERIFY` the item depends on from the corpus (or the
   trigger text, or a reputable/official source for law, with URL). If it
   can't be resolved cleanly: `abstain_only` or swap in another item.
3. Status at as-of: `python3 corpus/status_at.py <date>`.
4. Write the item into the gold file. Then run `spans.py fill <file>` and
   `spans.py check <file>` until there are 0 errors and every warning is
   addressed.
5. Tick the item in `progress/WP<n>.md` and append its index row.

## Quality bar
- High-confidence gold only. If a competent GC couldn't decide it cleanly,
  it's `abstain_only` (pass = needs review) or excluded. Never gold a
  guess. Every tier-1 finding must be `confidence: high`.
- Every positive finding: required spans for **every hop** (trigger item
  first), labels from contract enums, `facts` with cites, a `rationale`
  naming the deciding fact.
- Every decoy: `pass_rule: not_affected` (or a positive finding with
  `decoy_spans`), with the tempting span recorded.
- Dollar amounts, dates, notice windows: recompute from the document text.
  If the scenario file's number is wrong, use the corpus number and record
  the contradiction.
- Tiers: copied from the tier file, never re-derived.

## Finish
- Create `progress/WP<n>.md` **first** (checklist of the selected items),
  and your gold file headers before any deep reading, so partial work
  survives an interruption. Update as you go.
- Final `spans.py check` over all your files: 0 errors.
- End your progress file with `STATUS: complete`.
- Final report to the orchestrator (≤ 250 words):
  - items done / abstain-only / excluded
  - slices and eval ids you covered
  - contradictions with scenario files
  - corpus defects
  - findings you added to tiers (`tier_flag`)
  - anything that needs Jason's decision
