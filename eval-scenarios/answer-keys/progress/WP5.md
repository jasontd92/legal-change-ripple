# WP5 progress: cross-cutting (metamorphic, robustness, invariant fixtures)

STATUS: paused (session-limit pause; resume from ## Remaining)

## Reading done
- BRIEF-common.md, CONVENTIONS.md, HANDOFF.md (all)
- eval-design.md (all, incl. §4 invariants, §6 metamorphic, §8 gaps/I6, §13 budget)
- system-design.md §5-6 (StackFinding, label sets, ranking)
- contracts/README.md, all contracts/schemas/*.json (common, stack-finding,
  impact-report, change-record, scope-trace, coverage-statement, run-trace)
- eval-scenarios/E-cross-cutting.md (full, incl. Gaps + both Revision logs)
- priority-tiers-draft.md (full)
- legal-questions.md (Q1, Q4, Q5 read; Q2/Q3/Q6-Q8 not yet needed)
- answer-keys/tools/spans.py (fully read: find/fill/check semantics, e2e checks)
- Confirmed: answer-keys/ currently empty except BRIEF/CONVENTIONS/tools (no
  WP1-4 files landed yet in this snapshot; no collision risk observed).

## Selection plan (decided, not yet authored)

### Metamorphic (target ~12 items)
- M1 (1 unit item beyond the T3a/T3b pair, which WP3 owns): **E-M1-03** (CA
  AB 692 / TR-12, plant `ca_ab692_after_cutoff` vs `ca_ab692_before_cutoff`,
  as-of 2025-11-15 vs 2026-10-01). Clean, no VERIFY blocking.
- M2: **none** — E-cross-cutting.md has no M2 (profile-swap) scenarios; that
  slice is owned by D-S1B-01 (WP4/sentinel). Note this in index notes, don't
  invent one.
- M3: **E-M3-01**, **E-M3-02** (WA-focus prompt; deadline-only-focus prompt).
- M4: **E-M4-01**, **E-M4-02** (materiality threshold; dangerous-confusion
  stress case pairing with E-M1-04's forfeitable clock).
- M5: **E-M5-01** only (technician-family scale knob; the only
  count-driven family in `structured.py`). One item; E doesn't support a
  second distinct M5 case (training-repayment/vendor-NDA families are
  hardcoded tuples, not knob-scalable — noted as a gap, not invented).
- M6: **E-M6-01** (rename/reorder ids+files), **E-M6-02** (cluster-folder
  amendment reorder, stricter test).
- M7: pick 4 of the 6 non-excluded candidates (E-M7-06 excluded per
  HANDOFF/legal-questions Q4): **E-M7-01** (Valley Medical
  FIXED_PRICE_VALLEY), **E-M7-02** (WA technician TECH_NC_WA),
  **E-M7-03** (Cascade Ridge ESCALATION_CASCADE), **E-M7-05** (retention-bonus
  STAY_BONUS_CLAWBACK, standalone, no cross-stack dependency issues). Skip
  E-M7-04 (paired with excluded E-VR-01, abstention-only caution) and
  E-M7-07 (would push M7 over budget; AB692/TRAINING_REPAY already gets
  temporal coverage via M1-03).
  - Quotes confirmed verbatim via grep (see below); still need `spans.py find`
    to get exact offsets for each fixture's "before" quote and the
    replacement text for `fixtures/metamorphic/<id>.yaml`.

Running total: M1(1)+M3(2)+M4(2)+M5(1)+M6(2)+M7(4) = 12.

### Robustness I6 (target ~4 items)
- **E-I6-01** (mandatory): cosmetic-only trigger pair — must construct the
  fixture myself (reformat a copy of an existing WA ESHB 1155 trigger file:
  re-wrap lines, curly quotes, trailing blank line, no substantive change).
  Not yet built.
- **E-I6-04**: injected tool error on ACQ-05 (pinecrest franchise, 206,523
  chars) — maps to `faults.tool_error` hook (contract §2.6).
- **E-I6-05**: kill/restart mid-run — maps to `faults.kill_after` +
  `harness resume` (contract §2.6), app-level checkpoint-and-skip behavior.
- **E-I6-03**: unparseable/corrupted file (First Harbor Bank credit
  agreement, truncated mid-section before the FCCR covenant at ~line 3,770)
  — exercises `files_unparseable` + V6/V7 interaction.

Running total I6 = 4. Metamorphic+robustness = 16 (top of the 12-16 budget).

### Invariant fixtures V1-V14 (target 14, one per V id)
Design decided for all 14 (not yet built as JSON):
- V1 schema: StackFinding JSON missing a required field / bad enum type.
- V2 verbatim: ImpactReport item citation.clause quote altered vs. real file
  text at the same span (Valley Medical FIXED_PRICE_VALLEY clause, real
  offsets, one word changed in the surfaced quote).
- V3 locates: quote is real verbatim text from the file but the span
  offsets point elsewhere in the same file (out-of-section).
- V4 truncated exception: quote cut immediately before "...this Section shall
  not apply if..." in `TECH_NC_WA` (real text, confirmed via grep at line 67
  of the WA technician template) — truncate right before the "shall not
  apply if" carve-out.
- V5 operative text: finding citing GPC's superseded 2019 base Exhibit A /
  Metals Price Adjustment instead of Amendment-1's Exhibit A-1 (E-V5-05
  material).
- V6 coverage audit: run-trace claiming a full read of First Harbor Bank
  credit agreement (441,875 chars, confirmed via manifest `CORP-CREDIT-01`)
  with `chars_returned` far short of `file_chars`.
- V7 absence backing: absence finding (Valley Medical, E-V7-01) whose
  `searched_files` includes a file the run-trace shows was only partially
  read.
- V8 conservation: StackFinding emits finding F1; ImpactReport omits F1 from
  both `items` and `not_material`.
- V9 cross-reference closure: StackFinding `cross_references` entry with no
  matching `cross_reference_resolutions` entry in ImpactReport.
- V10 change-item closure: ChangeRecord item C2 (substantive) absent from
  ImpactReport `change_item_closure`.
- V11 scope completeness: ScopeTrace omits a real stack_id present in
  `corpus/manifest.jsonl` (243 doc entries; need to pick one cluster stack id
  and confirm its `stack_id` form per CONVENTIONS §3).
- V12 label-rationale agreement: ImpactReport item rationale text doesn't
  reference any of the finding's actual label/fact fields (structural check).
- V13 trigger nexus (per HANDOFF): finding.change_ref points to an id absent
  from the run's own ChangeRecord.items.
- V14 (per HANDOFF): First Harbor Bank FCCR covenant finding appears in a
  non-tariff run's ImpactReport (e.g. a TR-10 run) as a negative-control
  violation.

Each gets `fixtures/invariants/V<n>/*.json` + a row in
`fixtures/invariants/EXPECTED.yaml` + one index row `id: V<n>-FX`,
`set: invariant-fixture`.

## Corpus facts already confirmed (safe to reuse on resume)
- Valley Medical `CUS-VMS-MSA`
  (`corpus/documents/customers/valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md`)
  line 65: "Fixed Pricing. The Annual Maintenance Fee and all rates set forth
  in Exhibit A are firm and fixed for the Initial Term and each Renewal Term
  and shall not be adjusted for any reason, including changes in the cost of
  labor, materials, equipment, fuel, freight, taxes, tariffs, duties or other
  governmental charges. Contractor assumes all risk of such cost changes."
  (no "unless/except" continuation after this — confirmed by grep context,
  not a V4 candidate; use for M7-01/V2/V5/V7/V8 instead.)
- WA technician template `EMP-TPL-TECH-WA`
  (`corpus/documents/employment/templates/form_technician-employment-agreement_washington_rev-2019.md`)
  line 67: "Noncompetition. For twelve (12) months after the end of
  Employee's employment for any reason, Employee shall not, within
  twenty-five (25) miles of the Company branch at which Employee was
  primarily assigned, perform residential or commercial plumbing, heating,
  ventilation or air-conditioning service work for any business that
  competes with the Company. The parties intend this covenant to be
  enforceable to the fullest extent permitted by RCW 49.62; this Section
  shall not apply if Employee's earnings from the Company, when annualized,
  are equal to or less than the threshold amount then in effect under RCW
  49.62.020." — good V4 candidate: truncate right after "...to the fullest
  extent permitted by RCW 49.62;" and before "this Section shall not apply
  if..." (an unless/carve-out continuation).
- Cascade Ridge `SUBK-CRC-01`
  (`corpus/documents/subcontracts/cascade-ridge-contractors_subcontract-puyallup-medical-office/01_subcontract-agreement_2025-03-17.md`)
  line 103: "Material Price Escalation. If, between the date of
  Subcontractor's bid (February 10, 2025) and the date Subcontractor
  purchases copper tube, copper fittings or HVAC equipment for the Work, the
  documented price of any such item increases by more than eight percent
  (8%), Subcontractor may request an equitable adjustment equal to the
  increase in excess of eight percent (8%), supported by supplier quotations
  and invoices. Requests must be submitted within twenty-one (21) days after
  Subcontractor receives notice of the price increase; requests not timely
  submitted are waived."
- `corpus/manifest.jsonl`: 243 lines, one JSON object per doc, fields
  `doc_id, path, area, doc_type, effective_date, roles, source_class,
  source_ref, year_shift, chars, status_at_as_of` (plus `parent_id`,
  `planted_features` on some rows per HANDOFF §2 — not yet inspected in
  detail). No `stack_id` field printed directly; stack id must be derived
  per CONVENTIONS §3 (cluster folder vs standalone path) — resume by reading
  a cluster-folder row (e.g. `great-plains-copper-tube_master-supply-agreement/`)
  to confirm the folder-grouping convention before writing V11's fixture.

## Checklist (none ticked yet — no gold/fixture files written)
- [ ] E-M1-03 unit item
- [ ] E-M3-01, E-M3-02 unit items
- [ ] E-M4-01, E-M4-02 unit items
- [ ] E-M5-01 unit item + fixtures/metamorphic/E-M5-01.yaml (+ optional build.py)
- [ ] E-M6-01, E-M6-02 unit items + fixtures/metamorphic/*.yaml
- [ ] E-M7-01, E-M7-02, E-M7-03, E-M7-05 unit items + fixtures/metamorphic/*.yaml
- [ ] E-I6-01 unit item + constructed cosmetic-pair fixture files
- [ ] E-I6-03, E-I6-04, E-I6-05 unit items
- [ ] V1-FX .. V14-FX: 14 JSON fixtures under fixtures/invariants/V<n>/ +
      fixtures/invariants/EXPECTED.yaml
- [ ] index-parts/WP5.yaml: full 60-row E-scenario-id sweep (currently only
      scaffolded — see file) + 14 V-fixture rows + set/status updates for
      every item above once authored
- [ ] E-cross-cutting.md `## Gold notes` append, if research contradicts
      anything (none found yet)
- [ ] Final `spans.py fill` + `spans.py check` over all WP5 files, 0 errors
- [ ] Re-tick this file's checklist, flip STATUS to complete

## Corpus defects
(none logged yet)

## Remaining
Everything in the checklist above is still open. No gold YAML, no fixture
JSON/YAML, and no built.py scripts have been written yet — only research and
planning. On resume:
1. Confirm remaining VERIFY-flagged facts each chosen item depends on
   (E-M1-03 has none blocking; E-M5-01/M6-01/M6-02/I6-03/I6-04/I6-05 are
   mechanism-only, no VERIFY dependency).
2. Write unit/<id>.yaml files per CONVENTIONS §2 schema, run `spans.py fill`
   then `spans.py check` immediately per file (not batched at the end) so
   partial progress is always valid.
3. Build fixtures/metamorphic/*.yaml (and E-I6-01's constructed corpus copy)
   before or alongside their unit files.
4. Build fixtures/invariants/V<n>/*.json + EXPECTED.yaml using the corpus
   facts already confirmed above; get real offsets via
   `python3 eval-scenarios/answer-keys/tools/spans.py find <file> "<quote>"`.
5. Populate index-parts/WP5.yaml row-by-row as each item is authored (a full
   60-row backlog scaffold already exists in that file so nothing needs
   re-deriving — just flip `status`/`set`/`gold_file`/`gold_ref` per row).
6. Run `spans.py check` with no args at the very end (checks all e2e+unit
   files repo-wide) to confirm 0 errors before flipping STATUS to complete.
