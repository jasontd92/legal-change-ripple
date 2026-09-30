# Answer-key conventions (binding for WP1–WP6)

Supplements `../HANDOFF.md` §6. Where this file is more specific, follow it.
Contract version: **0.1.0** (`contracts/VERSION`). All paths below are
repo-relative (repo root = `gc-ai-take-home-research/`); run tools from there.

## 1. Spans and offsets
- Every span has the contract shape (`contracts/schemas/common.schema.json`
  `span`) plus an optional helper field:
  `{file, section_label, quote, start, end, occurrence?}`.
  - `file`: repo-relative, e.g. `corpus/documents/customers/x.md` or
    `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt`.
  - `section_label`: the section number and heading **as printed** in the
    document (e.g. `"3.2 Automatic Renewal Terms"`, `"Sec. 2(b)"`,
    `"clause (3)"`). Use the printed number first; the QA check looks for it
    before the offset.
  - `quote`: **verbatim** text copied from the file, the operative sentence
    or clause (typically 1–3 sentences, ≤ ~400 chars). Not the whole section:
    the matching rule is "≥ 50 % of the gold span covered, or containment", so
    a tight gold span is what makes location scoring meaningful.
  - `start`/`end`: **never type them by hand.** Run
    `python3 eval-scenarios/answer-keys/tools/spans.py fill <gold.yaml>`;
    it computes offsets from the quote (code points into the normalised text,
    `end` exclusive). If a quote occurs more than once, lengthen it or add
    `occurrence: N` (1-based). `spans.py find <file> "<quote>"` shows matches.
- Offsets are computed **pre-G0** against normaliser v0.1.0. If the
  normaliser changes at G0, re-running `fill` recomputes everything. Record
  `offsets: computed_pre_G0` in each gold file header.
- `required_spans`: one per hop. The trigger-side span (the change item's
  operative text) is the **first** hop; then each document hop in order
  (e.g. PO → MSA clause → schedule). All are needed for hop-complete credit.
- `decoy_spans`: the tempting-but-wrong text a model might cite (Metals
  Adjustment, utility "tariff", in-term §10, …). Citing it = decoy hit.
- Must pass: `python3 eval-scenarios/answer-keys/tools/spans.py check <file>`
  with **0 errors**. Warnings about `section_label` must be looked at; fix the
  label if it's wrong, otherwise add `section_note: "<why>"` to the span.

## 2. Gold file shape
Per HANDOFF §6, plus these header fields:
```yaml
id: T1_TR01_2026-10-01            # e2e file name stem, or the canonical scenario id for unit files
contract_version: 0.1.0
offsets: computed_pre_G0
scenario_ids: [B03, S4-GPC-01, ...]   # canonical ids whose gold lives in this file
eval_ids: [...]
set: e2e | sentinel | broad | metamorphic | robustness | invariant-fixture
inputs: {trigger: <trigger folder>, versions: [<file names>], as_of: 2026-10-01, profile: default, custom_prompt: null}
provenance: {author: non-attorney reference, sources: [...], verified_on: 2026-09-29}
```
- Each finding also carries `scenario_id` (canonical) and `aliases: []`,
  `stack_id`, `change_ref`, `required_spans`, `decoy_spans`, `absence`,
  `labels`, `facts`, `confidence`, `pass_rule`, and a short `rationale`
  (1–3 sentences; why the answer is what it is, with the deciding fact).
- `labels`: contract enums only. `urgency`, `materiality`, `direction`,
  `finding_type` are **single values**; `response_type` is a list of 1–2
  acceptable values. `finding_type` by the schema's precedence order.
  For `pass_rule: not_affected` items, set `labels: null` (labels aren't
  scored on correct non-flags).
- `pass_rule`: `affected` | `affected_or_needs_review` | `not_affected` |
  `abstain_only` (needs review / open question = pass; settled affected or
  not affected = fail).
- `confidence`: `high` | `abstain_only`. Nothing else is gold.
- `facts`: dates ISO; money as numbers (USD); every fact that came from the
  corpus gets a `cite` span. Facts from outside the corpus (e.g. a state
  earnings threshold) go in `provenance.sources` with URL + retrieval date.
- Unit files: same schema; omit sections that don't apply (a stage-1 unit
  item may have only `change_record`; an S1b item only `company_gate` +
  `inputs.profile`; an S3 item `relevant_stacks`/`pruned_stacks`).
- No `VERIFY`, no `TODO`, no comments. Use `notes:` strings for anything
  a reviewer should know.

## 3. Identifiers
- `stack_id`: cluster folder → `<area>/<cluster folder>`
  (e.g. `supply/great-plains-copper-tube_master-supply-agreement`); a
  standalone doc → path under `corpus/documents/` without `.md`. Standalone
  docs inside a grouping folder that is **not** a cluster (e.g.
  `supply/purchase-orders/`, `customers/notices/`, `customers/work-orders/`)
  use the doc path. When unsure, check `manifest.jsonl` (`parent_id`,
  path) and `corpus/INDEX.md`, and record the rule you applied in `notes`.
- Change-item ids in gold are `C1, C2, …` per file (system ids are mapped by
  anchor overlap). Noise items `N1, …`.
- Finding ids `F1, F2, …` per file. Scenario ids: the canonical id from the
  scenario file (`B03`, `S4-GPC-01`, `TR10-S4-05`, `D-TR14-S4-01`, …).
- e2e file names: `T1_TR01_2026-10-01`, `T2_TR02_2026-10-01`,
  `T3a_TR10_2026-10-01`, `T3b_TR10_2027-07-01`, `T4_TR12_2026-10-01`,
  `T5_TR14_2026-10-01`, `C1_TR03_2026-10-01`, `C2_TR90_2026-10-01`.

## 4. Index fragments and progress (so parallel packages never collide)
- Each WP writes **only**: its gold files, `index-parts/WP<n>.yaml`, and
  `progress/WP<n>.md`. WP6 merges them into `INDEX.yaml` and `PROGRESS.md`.
- `index-parts/WP<n>.yaml` is a YAML list with **one row per scenario id in
  your source file(s)**, selected or not:
  ```yaml
  - id: B03
    aliases: []
    source_file: B-tariff-downstream.md
    trigger: TR-01
    eval_ids: [S4, LBL-urgency, LBL-finding_type]
    set: sentinel            # sentinel | e2e | broad | metamorphic | robustness | invariant-fixture | null (backlog)
    slice: [forfeitable-clock]   # hop-complete | decoy | absence | version | template-instance | superseded | expired-surviving | abstention | control | forfeitable-clock (extra tags ok)
    confidence: high         # high | abstain_only | null
    status: done             # done | excluded | backlog | merged
    gold_file: e2e/T1_TR01_2026-10-01.yaml   # null for backlog/excluded
    gold_ref: F3             # finding id, "change_record", "company_gate", "relevant_stacks", or null
    canonical: null          # for status: merged → the canonical id
    exclusion_reason: null
    contradiction: null      # where research contradicted the scenario file
    tier_flag: null          # set when you added a finding the tier file lacks
  ```
- `progress/WP<n>.md`: a checklist of your selected items; tick each one
  as it's done. On resume, skip ticked items.
- Scenario files A–E: you may only **append** a `## Gold notes` section to
  the file your WP owns (WP1 → A, WP2 → B, WP3 → C, WP4 → D, WP5 → E) when
  research contradicts a scenario. Record the same contradiction in your
  index row.
- **Never edit `corpus/`.** If a corpus defect blocks high-confidence gold,
  stop on that item, record it in your progress file under
  `## Corpus defects`, pick a substitute item for the slice, and say so in
  your final report.

## 5. Legal and date rules
- Legal positions: `../legal-questions.md` Q1–Q8, verbatim. Anything
  not covered: research it (trigger text first, then official/reputable
  sources with URLs) and label it `non-attorney reference`. If it's
  still not clean, make the item `abstain_only` or exclude it.
- Document status at the as-of date: `python3 corpus/status_at.py <date>`.
  Expired docs need an explicit call: `not affected (expired)` or
  `affected (accrued/surviving right)`, with the reason in `rationale`.
- Tiers: copy from `../priority-tiers-draft.md`. Don't re-derive them. A
  finding the tier file lacks: add it with `tier_flag: "<one-line reason>"`
  in both the gold file (on the finding) and the index row.
- Deadlines: compute from the clause and show the arithmetic in
  `facts.deadline_rule` (days, trigger event, before/after), then
  `deadline_date`.
