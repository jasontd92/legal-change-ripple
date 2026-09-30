# WP3 progress (C-noncompete: TR-10, TR-11, TR-12, TR-13)

STATUS: paused

Paused before any gold file was written, per an interrupt from the
orchestrator (session limit). All work so far is background reading and
one resolved VERIFY. No gold YAML files exist yet under `e2e/` or `unit/`
for this package. `index-parts/WP3.yaml` is written as an empty list
(nothing has `status: done` yet).

## Done so far

- Read, in order: `BRIEF-common.md`, `HANDOFF.md`, `answer-keys/CONVENTIONS.md`,
  `contracts/README.md` §2, `contracts/schemas/common.schema.json`,
  `eval-design.md` (§1, §2, §4, §5), `system-design.md` §5–§6,
  `C-noncompete.md` (full, both halves), `priority-tiers-draft.md` (T3/T4
  sections + tier definitions + open questions), `legal-questions.md`
  (Q1, Q2, Q5, Q7 relevant to TR-10/11/12/13), `CHANGES-2026-09-29.md`.
- Read the WA trigger texts in full: `2026-03-23_eshb-1155-session-law.txt`
  and `2026-09-_rcw-49-62-current-text.txt`. Confirmed section numbering
  used in C-noncompete.md (Sec. 4 = RCW 49.62.020(1)/(2)/(3); Sec. 3 =
  RCW 49.62.010(3)(a)-(e), with (3)(c) = acceptance/transaction clause,
  (3)(d) = forfeiture/repayment sweep, (3)(e)(vi) = educational-expense
  carve-out with the 18-month/pro-rata/good-cause conditions).
- Read `TR-12-ca-ab-692-stay-or-pay/meta.yaml` (single version, effective
  2026-01-01).
- Confirmed no gold files from other WPs exist yet (dirs are all empty),
  so there is no e2e file to cross-check the FCCR/credit-agreement
  negative-control shape against; will need to build it directly from
  `B-tariff-downstream.md` B14/B15/B23 (already read) and the V14 rule in
  `eval-design.md` §4 / HANDOFF §3.
- **Resolved the WA 2026 earnings-threshold VERIFY** (TR10-S4-01, and half
  of TR10-S4-05): official source, Washington State Register **WSR
  25-20-099, "Noncompetition Enforceability Thresholds for 2026,"** filed
  by L&I 2025-09-30
  (https://lawfilesext.leg.wa.gov/law/wsr/2025/20/25-20-099.htm), per the
  adjustment mechanism in RCW 49.62.040 (adjusted every Sept 30, effective
  the following Jan 1). **2026 employee threshold: $126,858.83** (in force
  2026-01-01 through 2026-12-31, i.e. covers the default as-of 2026-10-01).
  Independent-contractor figure (RCW 49.62.030): $317,147.09 (not needed
  for TR-10's employee-only scenarios).
  - Against the 9 WA technician instances in TR10-S4-01: only **Isaac
    Whitcombe ($127,920)** and **Omar Wilder ($127,920)** clear
    $126,858.83; **Beatrice Falkner ($121,160)** — despite being
    "near-threshold" in the scenario prose — is actually *below* the 2026
    figure and falls inside the carve-out (noncompete unenforceable for
    her); all other named instances (Willa Lachance $66,560; Carter
    Thornbury $68,640; Gavin Falkner $68,120; Hana Bellweather $85,800;
    Renee Mbeki $96,720; Omar Vasquez-Reid $71,240) are well below.
  - Not yet done: pulling **Gemma Northcott's** annualized earnings from
    `employment/gemma-northcott_customer-non-solicitation-agreement_2023-08-21.md`
    (or her signed-agreement doc / manifest.jsonl) to close the other half
    of TR10-S4-05's VERIFY. If her figure isn't in the corpus, per the WP3
    instructions: split TR10-S4-05 into two findings — the "is a
    noncompete" classification stays `confidence: high`, and the
    enforceability-at-2026-10-01 consequence becomes `abstain_only`
    (missing fact: her earnings).
  - IL threshold (TR11, same-rule VERIFY) not yet researched.

## Remaining (full plan, nothing started)

1. **e2e/T3a_TR10_2026-10-01.yaml** and **e2e/T3b_TR10_2027-07-01.yaml**
   (paired, same finding ids across both):
   - change_record (legal_status enacted_future_effective @T3a vs
     in_force @T3b; C1 = ESHB 1155 Sec.4/Sec.3 amendments; consider a C2
     for the current-RCW baseline / SB 5935 noise item per TR10-S1a-03).
   - company_gate: proceed.
   - relevant_stacks / pruned_stacks from TR10-S3-01/02.
   - Findings, both dates, tiers per `priority-tiers-draft.md` T3a/T3b
     tables: TR10-S4-01 (Whitcombe/Wilder tier), TR10-S4-02 (Underhill
     live / Ruiz-Montoya moot-expired), TR10-S4-03 (Ingersoll training
     repayment), TR10-S4-04 (handbook consistency gap, T3b only per M1),
     TR10-S4-05 (Northcott flip — sentinel, split per above),
     TR10-S4-06 (ACQ-02/ACQ-05 owner vs non-owner two-track),
     TR10-S4-07 (ACQ-05 TruPipe franchise, not_affected/superseded decoy).
   - negative_controls: V14 credit-agreement FCCR entry,
     stack_id `corporate/first-harbor-bank_credit-agreement`,
     must_not_appear: true (this run has no tariff nexus).
   - Run `status_at.py` at both 2026-10-01 and 2027-07-01 before finalizing
     Underhill/Ruiz-Montoya and any other date-sensitive status calls.
   - Decide whether TR10-L1/L2 (S5-link) and TR10-R1-DRAFT (→ merged, since
     it's now superseded by the tier file per WP3 scope item 5) get rows
     only in the index, or also appear as `cross_links` in the e2e file.
2. **e2e/T4_TR12_2026-10-01.yaml**: template + Delia Kilgore (tier 1),
   Sabrina Haverford (decoy, not_affected), Castellano relocation
   (not_affected, two independent grounds per Q1/Q2), change_record, gate,
   stacks (TR12-S3-01), tiers (priority-tiers T4 table), V14 negative
   control. TR12-R1-DRAFT → merged in index (superseded by tier file).
3. **unit/TR11-S4-01.yaml**: IL 2022–2024 needs-review band,
   abstention-only, using the three-tier resolution in `legal-questions.md`
   Q1 / C-noncompete.md's Revision section. Enough change_record anchor for
   V13.
4. **unit/TR11-S4-04.yaml**: IL training-repayment decoy (Dmitri Rosales),
   confirmed not_affected per Q5.
5. **unit/TR13-S4-03.yaml**: Castellano §10 (in-term, decoy) / §13
   (trade-secret, decoy) only — NOT §12 (that belongs to WP4's T5/TR-14,
   per the brief's explicit instruction not to author it). Cross-reference
   D's TR-90/TR-14 scenarios by id only, don't duplicate their finding.
6. **Coverage fill** (≤4 broad items): still need to pick from TR-11/TR-13
   S1a or S3 items, one LBL item, one S5-link item (candidates: TR10-L1,
   TR10-L2, TR12-L1, TR11-L1/L2), and **TR11-S4-06** (contrast case,
   required by the brief) as the last of the four.
7. **index-parts/WP3.yaml**: one row per scenario id appearing anywhere in
   `C-noncompete.md` (TR10-S1a-01..04, TR10-S3-01/02, TR10-S4-01..07,
   TR10-L1/L2, TR10-R1-DRAFT, TR10-LBL-01..03, TR11-S1a-01/02,
   TR11-S3-01/02, TR11-S4-01..06, TR11-L1/L2, TR11-LBL-01/02,
   TR12-S1a-01, TR12-S3-01, TR12-S4-01..04, TR12-L1, TR12-R1-DRAFT,
   TR12-LBL-01/02, TR13-S1a-01/02, TR13-S3-01/02, TR13-S4-01..03,
   TR13-L1, TR13-LBL-01/02, plus the cross-trigger-observations items if
   they're given ids). TR10-R1-DRAFT and TR12-R1-DRAFT → `status: merged`
   (superseded by the tier file). Everything selected → `done` with
   `gold_file`/`gold_ref`. Everything else → `backlog`.
- No files under `e2e/` or `unit/` have been created yet, so there is
  nothing to run `spans.py fill`/`check` on for this package yet.

## Corpus defects
(none identified yet — no gold authored yet to surface any)

## Open items for Jason
- None yet raised.
