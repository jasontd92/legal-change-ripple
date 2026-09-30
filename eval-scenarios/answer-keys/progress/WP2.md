# WP2 progress — Package B (tariff downstream) + e2e T1 (TR-01)

STATUS: paused

## What's done
- Read (in order): BRIEF-common.md, HANDOFF.md (full), CONVENTIONS.md (full),
  contracts/README.md, contracts/schemas/common.schema.json,
  contracts/schemas/change-record.schema.json,
  contracts/schemas/scope-trace.schema.json,
  contracts/schemas/stack-finding.schema.json,
  eval-scenarios/B-tariff-downstream.md (full, my source file),
  eval-scenarios/A-tariff-supply.md (full — needed for A-authored findings
  that land in my T1 file: S4-GPC-01/02/05, S4-LWP-01/02, S4-NCS-01,
  S4-DSC-01, and S3-01 supply relevant/pruned stacks),
  eval-scenarios/D-consumer-controls-trigger-side.md §4 (D-DIST-01/02, same
  facts as A's S1a-TR01-06/07 — just confirms trigger paths),
  eval-scenarios/priority-tiers-draft.md (full — T1 tier table is the
  source of truth for tiers, do NOT re-derive),
  eval-scenarios/legal-questions.md (full — Q3 Sunpoint/Northbrook MFN
  comparability is load-bearing for B02/B09/B21),
  eval-scenarios/CHANGES-2026-09-29.md (full),
  answer-keys/tools/spans.py (fill/check behavior).
- Confirmed: no other WP has written anything yet (e2e/, unit/,
  index-parts/, progress/ all empty at session start). I have NOT yet
  created any gold files, index-parts/WP2.yaml, or read a single corpus
  document body (only listed the TR-01 trigger folder contents via `find`).
- **No spans.py fill/check needed yet — zero YAML gold files exist.**

## Plan (derived, not yet executed — do this on resume)

### Scenario-id disposition (37 ids in B-tariff-downstream.md: B01–B37)
All of these get a row in `index-parts/WP2.yaml` (not yet created).

**Mine, authored in `e2e/T1_TR01_2026-10-01.yaml`** (status: done,
gold_file: e2e/T1_TR01_2026-10-01.yaml) — 26 ids, at the top of the
20–26 budget on purpose (T1 is the big file):
B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, B11, B12, B13, B14, B15,
B16, B17, B18, B19, B20, B21, B22, B23, B26, B27, B28.

**Authored by WP1 (T2/TR-02)** (status: done, gold_file:
e2e/T2_TR02_2026-10-01.yaml, notes: "authored by WP1"):
B24 (alias S4-GPC-03), B25 (alias S4-KPS-01), B29 (TR-02 S3 scope).
B15 is BOTH: index it under T1 (mine) per the task instructions, with a
note it also appears in T2.

**Authored by WP4 (TR-03 control)** (status: done, gold_file:
e2e/C1_TR03_2026-10-01.yaml, notes: "authored by WP4"): B30.

**Merged (tier sketches superseded by priority-tiers-draft.md)**
(status: merged, canonical: the corresponding T1 tier-table row): B31, B32.

**Backlog** (status: backlog, with a note why not selected):
B33 (LBL-materiality threshold variant — needs custom_prompt input, not in
T1's default-profile snapshot; materiality/undeterminable boundary already
demonstrated in T1 by B03 and B08),
B34 (LBL-direction taxonomy — direction labels for HRP/VMS/GPC/KPS already
individually assigned inside the T1 findings for B05/B03 and the A-sourced
GPC/KPS findings; no separate unit file needed),
B35 (LBL-clock-type contrast — forfeitable vs obligation clock already
shown by B11 and B14 inside T1),
B36 (LBL-undeterminable — already shown by B12/B13 inside T1),
B37 (Sunpoint term-resolution/M1 as-of-shift scenario — three as-of variants
outside T1's single 2026-10-01 snapshot; good V5/M1 candidate but not one of
the four coverage-fill thin slices named in the WP2 brief
(absence/template-instance/superseded/expired-surviving); leaving for a
future pass or WP5's M1 metamorphic set rather than spending one of my 3
allowed coverage-fill slots on it).

Net: I am NOT planning any extra coverage-fill unit files beyond what's
already inside T1 — T1 already covers absence (B10/B12/B13/B27),
expired-surviving (B01/B02/B13), template-instance (B19), and decoys
thoroughly. If on resume this looks thin somewhere, reconsider B37 as one
of the 3 allowed extras (slice: version/superseded).

### T1 (`e2e/T1_TR01_2026-10-01.yaml`) construction plan
- **change_record.items** (C1–C5, from A's TR-01 trigger read): EO 14220
  (2025-02-25, substantive:false, investigation only), Proclamation 10962
  (2025-07-30, substantive:true), CBP CSMS 65794272 (2025-07-31,
  substantive:false, guidance implementing 10962), Proclamation 11021
  (2026-04-02, substantive:true, base-broadening + Annex I-A/I-B),
  Proclamation 11032 (2026-06-01, substantive:true, HVAC into 15% tier +
  85% threshold). Anchors: need to open each .txt and pick the operative
  clause text (see A's citations: 10962 clause (1)/(10); CSMS "Reporting
  Instructions.../DRAWBACK/FOREIGN TRADE ZONE"; 11021 clause (1)/(2)/(3);
  11032 ¶7/¶10). NOT YET OPENED — do this first on resume.
- **noise_items** (N1–N2): Proclamation 11045 aluminum-DISTRACTOR
  (2026-07-20), DPA critical-minerals-DISTRACTOR (2026-07-30). Anchor to
  title/heading per A's S1a-TR01-06/07.
- **company_gate:** proceed (obvious — direct copper/HVAC importer +
  domestic pass-through exposure).
- **relevant_stacks / pruned_stacks:** union of A's S3-01 (supply) + my B28
  (downstream). Relevant: GPC MSA cluster, Hai Phong supply-contract
  cluster, Lakeshore web-terms cluster, Northaire web-terms cluster, KPS
  invoices/POs (copper-tube/fitting lines only) + CRT, SPS, VMS,
  HRP-lump-sum, HRP-MSA, WADES, LKP+SMB, Bridgewell, Cascade Ridge, Titan
  Peak, Lakemont, First-Harbor-Bank credit-agreement cluster. Pruned:
  Solace (terms-only), all vendor stacks, insurance/COIs, non-SJC leases,
  SJC lease (utility "tariff" decoy), acquisitions/employment (out of
  package scope). **Need exact stack_id strings** — have NOT yet listed
  `corpus/documents/{supply,customers,subcontracts,corporate,vendors}`
  directory names or checked manifest.jsonl `parent_id`/path fields for the
  canonical cluster-folder spelling. Do this before writing stack_ids.
- **Findings to write** (one F per item below; scenario_id = canonical id;
  tier per priority-tiers-draft.md T1 table verbatim):
  - F: B03 Valley Medical — tier 1, forfeitable clock, deadline arithmetic
    (§3.2, 60 days before 2026-12-31 → **2026-11-01**). SENTINEL.
  - F: B15/B23 FCCR covenant — tier 1, `change_ref` MUST point to a T1
    (TR-01) change item per V13/guardrail 1 (direction: exposure, citing
    the copper §232 cost-on-fixed-price-stacks nexus, NOT the §122/HPB
    nexus which is T2's own version). confidence: high required — if the
    trigger-specific nexus can't be cleanly shown from T1's own change
    items, this must stay tier 1 but flip to abstain_only and be flagged
    prominently (per task instructions) rather than silently downgraded.
    **Check this carefully on resume — it's the highest-stakes call in the
    file.**
  - F: B14 MAE notice — tier 1, obligation clock (recurring, >10% test).
  - F: B05 Harborview pass-through not re-noticed — tier 1.
  - F: A S4-NCS-01 / B26 Northaire ratchet — tier 2. MUST verify from
    `northaire-comfort-systems_authorized-dealer-agreement_2020-01-15.md`
    and/or the T&Cs §33 whether "not subject to decrease" is contractually
    binding on Meridian or just a unilateral dealer-bulletin assertion (A's
    own Verify note flags this as open). If it isn't clean, keep tier 2 (or
    whatever the tier file says) but confidence: abstain_only + flag per
    task instructions — do NOT silently treat it as a clean contractual
    ratchet without reading the dealer agreement text.
  - F: A S4-GPC-01 — tier 2, hop-complete (PO → MSA Amdt2 §7(g) → invoice).
  - F: A S4-LWP-01 — tier 2, hop-complete; Lakeshore blended 9%/4% notice —
    per task instructions, hop-complete only for the 4% tariff-linked
    line; the 9% general increase portion is needs-review, not hop-complete
    (don't claim the full 13% as trigger-linked).
  - F: B04 Harborview lump-sum — tier 2, needs-review/possible CO right.
  - F: B10 Bridgewell — tier 2, absence finding.
  - F: B11 Cascade Ridge — tier 2, SENTINEL, REA window already run, show
    21-day-window arithmetic (notice received ~Mar 12 2025, window to
    ~Apr 2 2025, REA filed May 12 2025 ≈ 61 days late).
  - F: B02/B21 Sunpoint MFN — tier 2, SENTINEL "expired ≠ irrelevant",
    affected/accrued, claim window 2026-02-17→2026-06-30, markup-gap
    primary basis per legal-questions.md Q3/Q6.
  - F: B07 WA DES — tier 3, should-not-flag-for-relief but material
    exposure.
  - F: B08 San Marcos/Lakeport — tier 3, undeterminable materiality.
  - F: B12 Titan Peak — tier 3, absence/needs-review (Prime Contract not
    in corpus).
  - F: A S4-GPC-05 / GPC-INV-26-1912 — tier 3, needs-review,
    confidence: **abstain_only** (task explicitly calls this out —
    abstention-only sentinel, don't silently pick I-A vs I-B).
  - Logged/tier — (no forward action):
    - B01 Crestline — not affected (expired), no accrued claim.
    - B13 Lakemont — not affected (expired), absence.
    - B06 Harborview CA concession — lapsed waiver, pass-through live again.
    - B09 Northbrook letter — represented as the source span for B21/B02,
      not a separate finding (it's not its own line in the tier table).
    - B16 SJC lease "tariff" — decoy, not_affected, SENTINEL.
    - B17+B18+B19 — batch not_affected/pruned (insurance, other leases,
      vendor/SaaS).
    - B22 — decoy cross_link, expected not_found.
    - A S4-GPC-02 — decoy, Metals Adjustment vs tariff surcharge. SENTINEL.
    - A S4-LWP-02 — decoy, superseded/predates-trigger POs.
    - A S4-DSC-01 — decoy, exercised quote, no longer forfeitable (this is
      the one where the underlying quote is `status_at_as_of: expired` but
      the right was validly exercised pre-lapse — affected/accrued but
      "logged" in the tier table because it's already resolved/exercised,
      not a live action item — needs a clear rationale distinguishing it
      from B02's still-live accrued claim).
  - **cross_links (B20, B21, B22, B23, B26, B27):**
    - B20: 3 sub-links (LWP notice × B05 pass_through_allowed; × B03
      pass_through_blocked_absorbed; × B07 pass_through_prohibited).
    - B21: mfn_trigger, expected found (ties to B02 finding).
    - B22: mfn_no_trigger, expected not_found (decoy).
    - B23: 3 sub-links (B03→B15, B07→B15, B12→B15, type
      cost_exposure_to_covenant), with explicit "undeterminable dollar
      attribution" language, not a fabricated per-stack split.
    - B26: ratchet_pass_through (Northaire → B05, B08).
    - B27: flow_down_chain_incomplete (Cascade Ridge REA → no prime
      contract in corpus), absence-style link.
  - **tiers block:** copy verbatim from priority-tiers-draft.md T1 table
    (tier 1: B03, B15/B23, B14, B05; tier 2: A-S4-NCS-01/B26, A-S4-GPC-01,
    A-S4-LWP-01, B04, B10, B11, B02/B21; tier 3: B07, B08, B12,
    A-S4-GPC-05; logged: everything else listed above).
  - **negative_controls:** not required for a tariff run (V14 only applies
    to non-tarity runs per spans.py check logic), but the credit-agreement
    cluster (First Harbor Bank) is IN scope here (it's the FCCR/MAE stack),
    so no negative_control entry needed in T1.

## Remaining (do these, in this order, on resume)
1. List `corpus/documents/{supply,customers,subcontracts,corporate,vendors}`
   directory names + spot-check `corpus/manifest.jsonl` for exact
   `stack_id`/`parent_id` spellings (needed before any span work).
2. Open and quote from all 7 TR-01 trigger files (5 real + CSMS + 2
   distractors) to build change_record C1–C5 + N1–N2 with tight anchors.
3. Open every doc cited in B01–B23, B26, B27, B28 (my scenario file already
   gives exact paths and section labels/quoted language for most — reuse
   those quotes verbatim where B's own text already quotes the corpus,
   confirm against the live file) plus A's docs for
   S4-GPC-01/02/05, S4-LWP-01/02, S4-NCS-01, S4-DSC-01, S3-01.
4. Write `e2e/T1_TR01_2026-10-01.yaml` header first (id, contract_version,
   offsets, scenario_ids, eval_ids, set, inputs, provenance), then append
   change_record, company_gate, relevant_stacks/pruned_stacks, findings
   (one at a time, ticking below), cross_links, tiers.
5. Run `python3 eval-scenarios/answer-keys/tools/spans.py fill
   eval-scenarios/answer-keys/e2e/T1_TR01_2026-10-01.yaml` then `... check
   ...` until 0 errors, addressing every warning (fix section_label or add
   section_note).
6. Write `index-parts/WP2.yaml` (all 37 B ids, per the disposition table
   above).
7. Append `## Gold notes` to `B-tariff-downstream.md` ONLY if research
   contradicts the scenario file (none found yet — re-check once corpus is
   actually read; my current read is scenario-file-only, not corpus-first).
8. Final report per BRIEF-common.md §Finish, flagging: (a) the FCCR
   trigger-specific-nexus confidence call, (b) the Northaire "not subject
   to decrease" contractual-bindingness call, (c) S4-GPC-05 abstain_only
   (expected, not a problem), (d) any corpus defects found while actually
   reading files (none found yet since no corpus files have been opened).

## Corpus defects
(none logged yet — no corpus files opened yet this session)

## Blocking notes for whoever resumes
- **Zero corpus document files have been opened yet** — all of the above
  quotes/facts are taken from the scenario files (B, A, D) and
  priority-tiers-draft.md / legal-questions.md, which is enough to plan but
  NOT enough to write spans (CONVENTIONS requires opening the cited corpus
  file and confirming the exact operative sentence, never trusting the
  scenario file's paraphrase). Do not skip step 1–3 above.
- No YAML gold files exist yet, so there is nothing for spans.py to check
  and no risk of stale offsets.
