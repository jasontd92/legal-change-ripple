# Eval Implementation Handoff

**For:** the agent that will (1) select the eval cases from the scoped
scenarios, (2) research and author the gold answers (answer keys), and (3)
verify every fact the gold depends on.
**Status:** planning is complete and validated by Jason (2026-09-29). Build
from this document; don't reopen decisions listed in §3.
**Out of scope for you:** building the agent harness, running models, and
writing scorer code. Your output is the answer-key set and its index, in a
form scorers can consume deterministically (§6).

---

## 1. What the system under test does (one paragraph)
A long-running, multi-agent background job for in-house counsel. When a
monitored legal source changes (a tariff proclamation, a court ruling, a
state statute), it:
- understands the change (stage 1)
- decides company-level applicability (1b)
- scopes the company's contract portfolio (3)
- fans out one subagent per document stack, which decides applicability and
  extracts cited findings (2+4)
- aggregates, labels and ranks the findings into a GC report (5)

The fictional company is **Meridian Mechanical Group** (plumbing/HVAC; CA,
WA, IL, TX; as-of **2026-10-01**). The eval set measures each stage on its
own (teacher-forced) and end to end.

## 1a. Contract and sequencing
Gold field names, spans and enums must match **`contracts/`** (read
`contracts/README.md`). Record `contract_version` in `INDEX.yaml`.
- **Now (before G0):** everything except character offsets. Select items;
  resolve facts; record labels, tiers, files and section labels.
- **At G0** (contract frozen, normaliser fixed): compute offsets with
  `contracts/normalize/normalize.py` (`read_normalized`, `quote_in_span`).
  Offsets computed before G0 may need recomputing.
- **Enum mismatches:** if a gold label doesn't fit a contract enum, propose
  a new value through the contract. Don't invent labels in gold.
- **Readiness gates** (G1 unit-ready → G3 full) tell the eval side when each
  class of eval can run. You don't need to wait for them to author gold.

## 2. Read order and source-of-truth hierarchy

Read in this order:
1. **This file.**
2. `../contracts/README.md`: the system ↔ eval contract (schemas, spans, normaliser, readiness gates).
3. `../eval-design.md`: what each eval measures. Key sections:
   - §1 principles (binary-first, deterministic-first, high-confidence
     gold, F2)
   - §2 matching rule
   - §4 invariants V1–V14
   - §5 unit evals
   - §6 metamorphic M1–M7
   - §12 settled parameters
   - §13 budget and sentinel set
4. `../system-design.md`: the pipeline, the `StackFinding` contract (§5),
   the label sets and ranking (§6), GC vs dev view, and the model configs
   (Models section).
5. `README.md` (this folder): the index of all scoped scenarios, the
   coverage matrix, per-trigger scenario sets (§3), realism flags, gaps and
   the VERIFY backlog.
6. Scenario files: `A-tariff-supply.md`, `B-tariff-downstream.md`,
   `C-noncompete.md`, `D-consumer-controls-trigger-side.md`,
   `E-cross-cutting.md`. Each ends with a `## Revision 2026-09-29` log.
7. `priority-tiers-draft.md`: **validated** gold priority tiers T1–T5
   (despite the filename).
8. `legal-questions.md`: resolved legal positions Q1–Q8 (non-attorney
   reference). Use them; don't re-derive them.
9. `CHANGES-2026-09-29.md`: corpus changes since scoping; explains paths
   and statuses.

When sources disagree, trust them in this order:
1. **The corpus** (`../corpus/`): the text is ground truth for spans,
   sections and dates.
2. `legal-questions.md` for legal positions.
3. The validated tiers in `priority-tiers-draft.md`.
4. The latest `## Revision` entry of a scenario file.
5. The scenario body.
6. `README.md`.

**Don't use** `../corpus-research/`, `../research/`, or
`../use-case-research.md`; they're stale. `../take-home-context.md` is
background on the problem only.

**Corpus tooling:**
- `python3 corpus/status_at.py [YYYY-MM-DD] [--counts]`: document status at
  any as-of date.
- `corpus/manifest.jsonl`: roles, `planted_features`, `parent_id`,
  `status_at_as_of`.
- `build/README.md`: rebuild order.
- `python3 build/validate/validate.py`: must stay green if you touch the
  corpus.

## 3. Frozen decisions (don't relitigate)
- **High-confidence gold only.** Every gold answer follows a predictable,
  deterministic rule. If a competent GC couldn't decide it cleanly, the item
  is **excluded** or scored **abstention-only** (needs review / open
  question = pass; a settled affected or not affected = fail). Never gold a
  guess. Already excluded: **E-VR-01** and **E-M7-06**.
- **Binary units, deterministic scoring;** an LLM judge only for the two
  optional checks J1/J2 (eval-design §7).
- **Recall-weighted:** F2 wherever a stage filters or flags. Dangerous
  confusions are counted separately with a zero target:
  - false exits
  - relevant stacks scoped out
  - material → not material
  - a missed forfeitable clock
- **Matching:** a predicted finding matches gold when stack and change item
  are the same **and** it *locates* a gold required span: same file and
  section, overlap ≥ 50% of the gold span or containment. Location, not
  quote fidelity.
- **Hop-complete:** a finding counts toward stage-4 recall only if it cites
  **all** required spans for that gold finding.
- **Citations:** fidelity is scored only on citations the GC sees: the
  trigger quote and the clause quote per report item, and the change-record
  drill-down. The hop chain is dev-only.
- **Label sets** (system-design §6), fixed enums, each with
  "undeterminable":
  - urgency: forfeitable clock running · obligation clock running · clock
    pending · no clock · undeterminable
  - materiality: material · not material · undeterminable
  - direction: exposure · recovery · both · neutral
  - legal status (per change)
  - `finding_type`, `response_type`
- **Tiers** (`priority-tiers-draft.md`):
  - 1 act now (includes money leaking now through a fixable mechanism,
    without a legal deadline)
  - 2 act soon
  - 3 monitor / brief
  - logged

  R1–R3 scoring; R2 margin = tier-1 count + 2. TR-10 at 2026-10-01 vs
  2027-07-01 is scored **as a pair** (M1).
- **FCCR covenant finding:** tier 1 in **both** tariff runs (T1, T2). Guarded
  by:
  - **V13:** its `change_ref` must point to that run's own trigger
  - **V14:** it must **not** appear in any non-tariff run
- **Orchestrator reads no history;** run-over-run cases are out of scope.
- **Repeats:**
  - broad set k=1
  - sentinel k=5 on open-weight configs, k=3 on Luna and the Sonnet check
  - final tier k=3
- **Model matrix** (system-design Models): O1 GLM-5.3-Flash, O2 DeepSeek
  V4.1 Flash, R1 Luna (ChatGPT subscription), J = best O + Jev labeller;
  optional X and a conditional Sonnet ceiling check. Gold is
  model-independent; you never need to run a model.

## 4. Case selection rules (a budgeted subset, not exhaustive)

The ~230 scoped scenarios in files A–E are a **candidate pool**. **Don't
populate gold for all of them.** Select a high-ROI subset (eval-design §13);
everything not selected stays in the pool as an unpopulated **backlog**,
listed in `INDEX.yaml` with `status: backlog` and no gold file.

**Selection, in priority order:**
1. **Sentinel set** (below): all of it.
2. **End-to-end scenarios:**
   - T1 (TR-01), T2 (TR-02), T3a/T3b (TR-10 at both dates), T4 (TR-12),
     T5 (TR-14)
   - the controls TR-03 and TR-90

   Their gold covers stages 1, 1b, 3, 4 and 5 for the findings listed in
   `priority-tiers-draft.md`. Findings already in an e2e file don't need a
   separate unit file.
3. **Coverage fill:** add broad items until **every eval id has ≥ 2 items**
   and **every slice has ≥ 2 items**:
   - eval ids: S0, S1a, S1b, S3, S4, each LBL set, S5-link, S5-R*, V1–V14,
     M1–M7, I6
   - slices: hop-complete · decoy · absence · version · template-instance ·
     superseded · expired-surviving · abstention · control

   Prefer items that are already findings in an e2e file, then the cheapest
   to verify.
4. **Stop** at roughly **60–80 gold items** in total. Go beyond that only
   where a slice would otherwise be represented by a single item.

**Rules for any selected item:**
- **Exclude:** `REMOVED` scenarios (3 in A), E-VR-01 and E-M7-06 (deferred),
  and anything that can't reach high confidence. Either make it
  abstention-only, or swap in another backlog item that covers the same
  slice.
- **Merge duplicates** across files (README §4). Keep one canonical ID and
  list the aliases.
- **Tag every item:**
  - `set`: `sentinel` · `e2e` · `broad` · `metamorphic` (M1–M7, paired with
    a base item) · `robustness` (I6, synthetic fixture) ·
    `invariant-fixture` (a small synthetic case proving each V-check fires)
  - `split`: dev | holdout (§7)
  - `slice`

**Sentinel set** (canonical IDs; k=3/5, pass^k):

| Slice | IDs |
|---|---|
| Forfeitable clocks | B03 (Valley non-renewal due 2026-11-01) · B11 (Cascade REA already run) |
| Gate / control | D-S1B-01 (plus the other D-S1B profile pairs, if cheap) · S1a-TR03-01 / S3-03 (TR-03 true negative) |
| Hop-complete chains | S4-GPC-01 · S4-HPB-01 (the $8,172 IEEPA line only) |
| Decoys | B16 (utility "tariff") · S4-GPC-02 (Metals Adjustment) · TR11-S4-04 (IL training repayment) · TR13-S4-03 (Castellano §10 in-term, §13 trade-secret) · D-TR14-S4-03 (technician §6.2) |
| Abstention is correct | TR11-S4-01 (IL 2022–2024 band) · S4-GPC-05 (INV-26-1912) · D-TR14-S4-02 (AB 1076 pre-deadline instances) |
| Expired ≠ irrelevant | B02 (Sunpoint MFN claim 2026-02-17 → 06-30) |
| Flips | TR10-S4-05 (Gemma Northcott is a noncompete) · D-TR14-S4-01 (technician §6.1, SB 699) |
| Version pin | S4-KPS-03 · S4-NCS-02 |
| Overcharge | S4-GPC-03 / B24 (INV-26-1911) |
| Ranking | T1 and T3a/T3b tier checks (stage 5 on gold findings) |

**End-to-end scenario sets:** one per trigger + as-of, from README §3 and
the tier files T1–T5 (TR-01, TR-02, TR-10 at two dates, TR-12, TR-14), plus
the controls: TR-03 (empty relevant set) and TR-90 (company-gate exits:
WY SF 107, TX SB 1318).

## 5. Gold research procedure (per item)
1. **Open the cited corpus files.** Confirm the path, the section heading or
   number, and the operative sentence.
   - Record **char offsets** (`start`, `end`) in the normalised document
     text, plus the section id.
   - Paths changed on 2026-09-29 (Sunpoint cluster, TR-14, Ingrid Falkner);
     see `CHANGES-2026-09-29.md`.
2. **Resolve every `VERIFY`** the item depends on: dates, dollar amounts,
   notice windows, thresholds, earnings, status at the as-of date. If it
   can't be resolved from the corpus (or, for law, from the trigger text or
   a reputable source), mark the item abstention-only or exclude it.
3. **Legal positions:** use `legal-questions.md`. For anything it doesn't
   cover, research it (the trigger text first, then reputable sources) and
   record sources. Label all legal gold "non-attorney reference".
4. **Author the gold** per the schema in §6:
   - change items with anchor spans
   - company gate
   - relevant stacks
   - findings with **required spans (one per hop)**, **decoy spans**,
     labels, facts, and a pass rule
   - cross-stack links
   - tiers
5. **Status and dates:** compute them with `status_at.py` at the scenario's
   as-of date. Expired contracts need an explicit call: "not affected
   (expired)" or "affected (accrued/surviving right)", with the reason.
6. **Tiers:** copy them from `priority-tiers-draft.md`. Don't re-derive them
   from our sort policy (the circularity guard). Add any finding the tier
   file lacks, with a one-line reason, and flag it for Jason.
7. **Confidence:** each gold item gets `confidence: high` or
   `abstain_only`. Anything else is excluded.

## 6. Output: files and schema
Write everything under `eval-scenarios/answer-keys/`:
```
answer-keys/
  INDEX.yaml             # every scenario: id, aliases, source_file, eval_ids, set, slice, split, confidence, status (todo|done|excluded|backlog), exclusion_reason
  e2e/<scenario>.yaml    # one per end-to-end scenario (e.g. T1_TR01_2026-10-01.yaml)
  unit/<item_id>.yaml    # one per unit / sentinel item not fully covered by an e2e file
  fixtures/              # synthetic inputs for S0 cosmetic pairs, I6 robustness, V-invariant fixtures, M-perturbations (describe; build scripts optional)
  PROGRESS.md            # work-package status (see §8)
```

**Schema** (YAML; field names are the contract for the scorers):
```yaml
id: T1_TR01_2026-10-01            # or the scenario id for unit items
eval_ids: [S1a, S1b, S3, S4, S5-R1, S5-R2, S5-R3, V13, V14]
inputs: {trigger: TR-01-copper-section-232, versions: [...], as_of: 2026-10-01, profile: default, custom_prompt: null}
provenance: {author: non-attorney reference, sources: [...], verified_on: 2026-MM-DD}
change_record:
  items:
    - id: C1
      substantive: true
      anchor: {file: corpus/triggers/.../x.txt, section: "Sec. 2", start: 1234, end: 1410}
      legal_status: in_force            # enum from system-design §6
      effective_date: 2026-04-06
      applies_to: {jurisdictions: [US], entity_types: [importer], product_classes: ["HTS 7411"], thresholds: []}
  noise_items: [{id: N1, anchor: {...}, reason: rephrasing}]
company_gate: proceed                   # proceed | exit ; uncertain counts as proceed
relevant_stacks: [<stack ids>]          # scope recall gold
pruned_stacks: [<stack ids>]            # pruning credit
findings:
  - id: F1
    stack_id: <cluster folder or doc id>
    change_ref: C1                      # V13
    required_spans: [{file: ..., section: ..., start: ..., end: ...}, ...]   # one per hop; all needed for hop-complete
    decoy_spans: [...]                  # citing these = decoy hit
    absence: null | {clause_type: ..., expected_in: [files]}
    labels: {urgency: ..., materiality: ..., direction: ..., finding_type: ..., response_type: [one or two acceptable values]}   # contract enums; finding_type by precedence; urgency/materiality single-valued
    facts: {deadline_rule: {days: 60, trigger_event: ..., before: term_end}, deadline_date: 2026-11-01, exposure: {amount: 486000, basis: annual_fee, cite: {...}}}
    confidence: high | abstain_only
    pass_rule: affected | affected_or_needs_review | not_affected | abstain_only
cross_links: [{a: <stack>, b: <stack>, type: economic_flow | parity | ..., expected: found | not_found}]
tiers: {1: [F..], 2: [F..], 3: [F..], logged: [F..]}
negative_controls: [{stack_id: <credit agreement cluster>, must_not_appear: true}]   # V14, in non-tariff runs
```

## 7. Held-out split
- About 30% of items, **stratified by (trigger, slice)**, fixed seed,
  recorded in `INDEX.yaml`.
- Sentinel items are split in proportion.
- T3a/T3b (TR-10 at both dates) stay together.
- Freeze the split before anyone iterates on prompts. Record the seed and
  the reasoning.

## 8. Working method (recoverable)
- **Suggested work packages,** each writing only its own files:
  - WP1: tariff supply (file A) + e2e T2
  - WP2: tariff downstream (B) + e2e T1
  - WP3: noncompete (C) + e2e T3a/T3b, T4
  - WP4: consumer / TR-14 / controls (D) + e2e T5, TR-03, TR-90
  - WP5: cross-cutting (E): metamorphic, robustness and invariant fixtures
  - WP6: INDEX + split + QA

  Sonnet-class subagents are adequate for WP1–WP5.
- **Write each file's header first,** then append per item. Update
  `PROGRESS.md` after each item. On resume, skip items marked done.
- **Don't edit scenario files A–E** except to append a `## Gold notes` line
  when research contradicts a scenario. Record contradictions in `INDEX.yaml`
  too.
- **Corpus edits:** only if a genuine defect blocks high-confidence gold.
  Log them in a new `CHANGES-<date>.md`, rerun `validate.py`, and tell
  Jason.

## 9. Definition of done (QA checks for WP6)
- Every **selected** item has `status: done` (or is excluded with a reason).
  Unselected scenarios are listed as `status: backlog` with no gold.
- **Span check (scripted):** every `anchor` / `required_spans` / `decoy_spans`
  entry resolves. The file exists, the offsets are inside it, the text at
  those offsets is non-empty, and it sits under the named section.
- No `VERIFY` remains in any gold file.
- Every tier-1 finding has `confidence: high`.
- Every e2e file has `relevant_stacks`, `tiers`, and ≥ 1 decoy or
  negative control.
- V14 negative controls are present in each non-tariff e2e file.
- Totals by eval id and slice are reported in `INDEX.yaml`. Every eval id
  and every slice has ≥ 2 gold items, or a written reason why not. Total is
  about 60–80 items.

## 10. Known open items (carry forward, don't block on them)
- **HTS 7412 annex tier** (11021 I-A 50% vs I-B 25%) is unconfirmed. Keep
  S4-GPC-05 abstention-only; CBP CSMS 68253075 is the controlling list.
- **CA Comfort Club two-price split** (D-TR20-S4-08): pending Jason's
  confirmation that it's intentional. Author gold as a two-silo decoy and
  flag it.
- **WA and IL current earnings thresholds** are not in the corpus. Source
  them from official state publications for the as-of year, or keep
  dependent items abstention-only.
- **16 CFR 425 text** is missing (TR-21's only real finding) and there's no
  synthetic cosmetic-only trigger pair (E-I6-01). Build it as a fixture.
- **Model prices** (open-weight on the Gateway, Jev) are unverified. They
  don't affect gold, only the budget.
