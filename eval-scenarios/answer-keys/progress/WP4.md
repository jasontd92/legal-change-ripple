# WP4 progress — Package D (consumer / TR-14 / controls) + e2e T5, TR-03, TR-90

STATUS: paused

## Reading done
Read (per BRIEF-common.md order): HANDOFF.md, CONVENTIONS.md, contracts/README.md §2,
common.schema.json, D-consumer-controls-trigger-side.md (full, incl. Revision log),
CHANGES-2026-09-29.md, legal-questions.md (Q1-Q8), priority-tiers-draft.md (T5 table +
tier defs + FCCR guardrails), A-tariff-supply.md TR-03 section (S1a-TR03-01, S3-03),
TR-03/TR-90/TR-14 meta.yaml, TX SB 1318 + WY SF 107 full text, SB 699 + AB 1076 full
text, corpus/company/profile.yaml.

**Not yet read in this pass:** eval-design.md §1/§2/§4/§5/§12/§13 and system-design.md
§5-§6 (StackFinding shape, label precedence beyond common.schema.json — already have
enums from common.schema.json, which should suffice), Castellano offer letter full
text, CA technician template + 6 signed instances, CA membership-terms 2024-06 /
2026-08 files, CA residential installation agreement (§6), AB 2863 trigger text
sections cited. **Resume here first** — read these before writing any gold file, per
method step 1 (open cited corpus files, confirm section/operative sentence) and to
run `spans.py fill`.

## Key decisions already made (don't re-derive on resume)
- **TR-90 controls are both clean exits.** Verified from primary text:
  - WY SF 107 §1(a): voids noncompetes for "skilled or unskilled labor" broadly (not
    physician-only — that's §1(b)) but the company-gate reason is **jurisdiction**
    (profile.yaml states_of_operation = [CA, WA, IL, TX], no WY) — gate exits
    out-of-footprint regardless of §1(a)'s breadth. Matches D-TR90-S1b-03.
  - TX SB 1318 §15.50(b)/§15.501: restricted to physicians (Texas Medical Board),
    dentists, nurses, PAs. profile.yaml workforce has no such roles (field
    technicians, service managers, sales/comfort advisors, dispatch, executives) —
    gate exits wrong-profession. Matches D-TR90-S1b-04. **Confirmed: gold is exit
    for both; the task's "check TX SB 1318 carefully" branch does NOT apply — no
    reclassification needed.**
  - So **C2_TR90 is ONE file** (not C2a/C2b split) — both controls share gate: exit.
- **V14 negative control target for T5:** `corporate/first-harbor-bank_credit-agreement`
  (path confirmed: `corpus/documents/corporate/first-harbor-bank_credit-agreement/01_credit-agreement_2021-07-20.md`).
- **C1 (TR-03) negative control candidate:** `supply/great-plains-copper-tube_master-supply-agreement`
  (keyword-collision risk: GPC sells "copper tube", but domestic/OK mill, not
  Mexico-origin pipe — the Realism note in A-tariff-supply.md S3-03 flags exactly
  this false-positive risk). Use as the named `negative_controls` entry (not V14 —
  TR-03 is tariff, V14 doesn't apply; this is a plain precision control).
- **T5 tiers (copy verbatim from priority-tiers-draft.md, don't re-derive):**
  - Tier 2: CA technician template §6.1 + Castellano §12 (SB 699) — likely void,
    unlawful to enter/enforce, private right of action; no deadline but recurring
    exposure with each new hire.
  - Tier 3: AB 1076 notice for the 5 pre-2024-02-14 technician instances — needs
    review.
  - Logged (not surfaced): Castellano §10 (in-term, decoy), Castellano §13
    (trade-secret customer non-solicit, decoy), technician §6.2 (trade-secret
    decoy).
- **D-TR14-S4-01 finding structure:** template §6.1 + 6 signed instances (Alan
  Ellison 2017-12-10, Uma Kilgore 2019-02-09, Farah Abernathy 2020-06-15, Felix
  Delacroix 2021-08-28, Gemma Tallis 2023-01-04, Sabrina Marchetti 2024-04-07).
  Sabrina Marchetti = clearest/highest-confidence hit (post-SB-699 "entered into").
  Plan: F1 = template + Marchetti as the required-span pair (hop-complete,
  confidence high), note other 5 instances in facts/rationale as same-clause
  additional exposure (don't necessarily need 6 separate finding ids — one finding
  per distinct legal theory is fine per schema; will decide exact F-id split when
  writing, but Marchetti must be the cited instance for the "clearest hit").
- **D-TR14-S4-02:** abstain_only / needs_review for the 5 pre-deadline instances
  (Ellison, Kilgore, Abernathy, Delacroix, Tallis) — NOT Marchetti (she's post-SB-699,
  not part of the AB-1076-pre-deadline group). pass_rule: abstain_only.
- **D-TR14-S4-03:** decoy — template §6.2, same 6 instances, trade-secret carve-out,
  not_affected, labels: null.
- **D-TR90-S1b-01 / D-TR90-S1b-02 / D-TR90-S3-01:** all authored inside the T5 e2e
  file (Castellano §12 finding, Castellano/AB1076 clean-for-this-doc note, and the
  combined scope trace for TR-14+TR-90 groups). Castellano document itself is
  Package C's domain but WP4 (e2e owner for T5) writes the finding per ownership
  rule ("e2e owner writes every finding in its e2e file, including findings from
  another package's scenario file"). Package C's TR13-S4-03 sentinel independently
  covers the Castellano §10/§13 decoy pair — don't duplicate authorship, just cite
  consistently; if Package C's file conflicts on facts, corpus text wins.
- **D-DIST-04** (WY §1(b) vs TX SB1318 physician carve-out overlap) — cheap add to
  C2_TR90 e2e as a noise/change-item-separation entry (both texts already read
  above).
- **TR-03 (C1) gate:** company_gate = uncertain-counts-as-proceed is NOT right here —
  meta.yaml + S3-03 + S1a-TR03-01 all point to **proceed** (the AD/CVD order does
  reach "importers of record of subject merchandise" in the abstract — Meridian is
  an importer generally — so gate is not a footprint/profession exit) **then an
  empty relevant_stacks** (scope-out at stage 3, not gate exit). This is the
  "proceed-then-empty-scope" branch the task flagged as distinct from "exit" — do
  NOT set company_gate: exit for TR-03. Confirm this against S3-03's own wording
  ("all supply stacks are pruned... this is a true negative the pipeline must
  reach") when writing — it frames this as a stage-3 prune, not a stage-1b exit.

## Selection plan (target ~17 done rows; not yet written)
**e2e files:**
1. `e2e/T5_TR14_2026-10-01.yaml` — scenario_ids: D-TR14-S4-01, D-TR14-S4-02,
   D-TR14-S4-03, D-TR90-S1b-01, D-TR90-S1b-02, D-TR90-S3-01. change_record (SB 699
   §16600.5, AB 1076 §16600.1/§16600(b)); company_gate: proceed; relevant_stacks =
   {employment/templates (CA technician template + 6 instances),
   employment/nadia-castellano offer letter}; findings F1 (template§6.1+instances,
   tier 2, affected), F2 (Castellano §12, tier 2, affected), F3 (AB1076 5
   pre-deadline instances, tier 3, abstain_only/needs_review); decoy_spans for
   §6.2, §10, §13; negative_controls: first-harbor-bank credit-agreement (V14).
2. `e2e/C1_TR03_2026-10-01.yaml` — scenario_ids: S1a-TR03-01, S3-03 (source_file:
   A-tariff-supply.md, "authored by WP4" per ownership rule since these are the
   e2e's own scenario ids, not a duplicate-elsewhere case — WP4 owns TR-03 e2e
   per HANDOFF §4/§8). change_record (preliminary AFA margin, status: preliminary,
   no operative cash-deposit date yet); company_gate: proceed (see note above);
   relevant_stacks: []; pruned_stacks: all supply stacks with reason "no
   Mexico-origin copper pipe/tube exposure found"; monitor note (not a finding) on
   Keystone/Lakeshore shipment-date pricing; negative_controls: great-plains
   keyword-collision.
3. `e2e/C2_TR90_2026-10-01.yaml` — scenario_ids: D-TR90-S1b-03 (WY, exit,
   out-of-footprint), D-TR90-S1b-04 (TX, exit, wrong-profession), D-DIST-04
   (two separate change items, not merged). ONE file (both gates = exit — no
   need for C2a/C2b split). negative_controls: first-harbor-bank (V14, still
   applies since this file isn't tariff).

**Unit files:**
4. `unit/D-S1B-01.yaml` — remove WA from states_of_operation → TR-10 gate flips
   proceed→exit. Cross-reference Package C/B's TR-10 e2e (T3a/T3b) for the
   baseline "proceed" finding this flips; don't re-author TR-10's substantive
   findings, just the gate delta.
5. `unit/D-S1B-03.yaml` — remove CA → TR-20 AND TR-14 (SB699/AB1076) both flip
   proceed→exit; note this now suppresses a REAL finding (Castellano/technician),
   not just a control no-op (per Round 2 note in scenario file).
6. `unit/D-S0-05.yaml` (+ cosmetic-variant note, `fixtures/s0/` if a written
   description is needed) — CA membership-terms 2024-06 (superseded) vs 2026-08
   (active) substantive pair; gold = substantive diff classification with spans on
   §7 (2024) and §4 (2026) automatic-renewal clauses. Second "item" = the cosmetic
   variant (reformat numbered-list a/b/c → 1/2/3, no wording change) — describe as
   a fixture, confirm it must still classify as cosmetic/exit at stage 0.
7. `unit/D-TR20-S4-07.yaml` — version-resolution (V5): must cite Aug 2026 text
   only; citing June 2024 as current = V5 violation. Note D-TR20-S4-03 is a
   **merge** into this canonical id (same underlying pair/claim) — record
   status: merged, canonical: D-TR20-S4-07 for D-TR20-S4-03 in the index.
8. `unit/D-TR20-S4-01.yaml` — real finding: CA residential installation
   agreement §6.1-6.5 Comfort Club bundled free-to-pay conversion; §6.5's
   self-serving consent claim may not satisfy express-consent/anti-undermining
   test. affected/material/exposure. (Needed anyway as a dependency of item 9.)
9. `unit/D-TR20-S4-08.yaml` — two-silo decoy (installation agreement $19.95 vs
   standalone membership terms $21.95, two separate enrollment paths, don't merge
   compliance conclusions) — gold as decoy pattern, flag `notes: "pending Jason
   per HANDOFF §10 (CA Comfort Club two-price split)"`.

Total done-row count once written: D-TR14-S4-01/02/03, D-TR90-S1b-01/02/03/04,
D-TR90-S3-01, D-DIST-04, S1a-TR03-01, S3-03, D-S1B-01, D-S1B-03, D-S0-05,
D-TR20-S4-07, D-TR20-S4-01, D-TR20-S4-08 = **17 rows**, matching the ~14-18 budget.
Everything else in file D → backlog (TR-21 entirely, per Gaps: 16 CFR 425 text
missing; D-DIST-01/02; D-S0-01/02/03/04; D-S1B-02/04/05/06/07/08/09; remaining
D-TR20-S1a-*/S4-02..06/S3-01).

## Checklist (none ticked yet — no gold file written this session)
- [ ] e2e/T5_TR14_2026-10-01.yaml
- [ ] e2e/C1_TR03_2026-10-01.yaml
- [ ] e2e/C2_TR90_2026-10-01.yaml
- [ ] unit/D-S1B-01.yaml
- [ ] unit/D-S1B-03.yaml
- [ ] unit/D-S0-05.yaml
- [ ] unit/D-TR20-S4-07.yaml
- [ ] unit/D-TR20-S4-01.yaml
- [ ] unit/D-TR20-S4-08.yaml
- [ ] run `spans.py fill` + `spans.py check` on all of the above
- [ ] finalize index-parts/WP4.yaml statuses (done vs backlog vs merged)
- [ ] append `## Gold notes` to D-consumer-controls-trigger-side.md IF research
      contradicts the scenario file (none found so far — TR-90 exits both confirmed
      clean, matching the file's own scenarios; no contradiction identified yet)
- [ ] final report to orchestrator

## Corpus defects found
None yet.

## Remaining (see Selection plan above for full detail)
Everything under "Selection plan" is unwritten. On resume: read the still-unread
corpus docs listed under "Reading done", then write files in the order listed
(T5 e2e first — it's the largest and has the most sentinels), running
`spans.py fill`/`check` after each file per BRIEF-common.md Method step 4.
