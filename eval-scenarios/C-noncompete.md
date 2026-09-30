# Package C: Noncompete / Employment Triggers (TR-10..13)

Scope: TR-10 (WA ESHB 1155 / RCW 49.62), TR-11 (IL construction noncompete,
820 ILCS 90 / PA 103-0921), TR-12 (CA AB 692 stay-or-pay), TR-13 (FTC
noncompete rule removal + Rollins consent order). Covers S1a change items,
S4 findings across employment/**, acquisitions/**, vendor/customer no-hire
and NDA no-hire clauses, and lease radius look-alikes; S5-link cross-stack
links; S3 relevant/irrelevant stacks; draft S5-R1/R2/R3 priority tiers;
LBL label scenarios.

Corpus basis: `corpus/triggers/TR-10..13-*/meta.yaml` + version texts,
`corpus/manifest.jsonl` (roles, planted_features, parent_id), `corpus/company/profile.yaml`,
`build/generate/specs_gen.py` (PLANTS verbatim text, PROSE specs), `build/specs/plan_real.yaml`
(real-adapted employment/acquisitions docs, `map_roles`, `adapt_note`).

As-of default: 2026-10-01 (from `corpus/company/profile.yaml`). Company: Meridian
Mechanical Group, Inc. (Delaware corp, dba Meridian Plumbing, Heating & Air),
subsidiaries in WA/IL/TX, HQ California; naics 238220 residential/commercial
plumbing & HVAC. Workforce: 268 hourly field technicians, 34 salaried service
managers, 38 commission comfort advisors (sales), 52 dispatch/CSR/admin, 20
executives/directors.

---

## TR-10 — WA ESHB 1155 (RCW 49.62)

### S1a — Change items

- **TR10-S1a-01** · S1a · ESHB 1155 voids *all* noncompetition covenants for
  Washington workers, effective 2027-06-30 (not yet in force at the default
  as-of date 2026-10-01); RCW 49.62 as currently in force (post-SB 5935, 2024)
  still permits noncompetes above an earnings threshold.
  - Trigger: `corpus/triggers/TR-10-wa-noncompete-eshb-1155/2026-03-23_eshb-1155-session-law.txt` — session law, Chapter 149, Laws of 2026 vs. `2026-09-_rcw-49-62-current-text.txt` — RCW 49.62 (current, in force until 2027-06-30)
  - Docs: n/a (trigger-side item)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: change item logged — legal status "enacted, effective later" (2027-06-30); old = earnings-threshold-gated enforceability under current RCW 49.62; new = blanket void plus notice-by-2027-10-01 requirement plus forfeiture/repayment terms newly treated as noncompetes
  - Verify: exact effective date 2027-06-30 and notice deadline 2027-10-01 VERIFY against `2026-03-23_eshb-1155-session-law.txt` text; confirm "treats forfeiture and repayment as noncompetes" wording (relevant to TRAINING_REPAY / STAY_BONUS_CLAWBACK plants below)
  - Realism: a GC monitoring in Oct 2026 sees a *future* law — correctly "watch," not "act now"; this is the intended M1 (as-of shift) test bed noted in the plan.

- **TR10-S1a-02** · S1a · Sale-of-business exception in ESHB 1155 vs. current RCW 49.62; per meta.yaml both keep a **1%-ownership** sale-of-business exception (structured field).
  - Trigger: `2026-03-23_eshb-1155-session-law.txt` — sale-of-business section; `2026-09-_rcw-49-62-current-text.txt` — RCW 49.62.030(equivalent)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: applies-to field `sale_of_business_exception: true, min_ownership_pct: 1`
  - Verify: exact statutory section number and "1% or greater" ownership language, VERIFY in trigger text
  - Plants: relevant to ACQ-* seller noncompetes below (non-owner signers do NOT qualify for this exception)

- **TR10-S1a-03** · S1a · SB 5935 (2024) is the prior amendment already baked into the "current text" version; a diff between `2024-03-_sb-5935-session-law.txt` and `2026-09-_rcw-49-62-current-text.txt` should show near-zero substantive delta (SB 5935 is already incorporated) — a stage-0 near-duplicate / noise check.
  - Trigger: `2024-03-_sb-5935-session-law.txt` vs `2026-09-_rcw-49-62-current-text.txt`
  - Inputs: as-of 2026-10-01
  - Expected: no new substantive change item; if the orchestrator surfaces SB 5935 as a "new" change at this as-of date it is a **false positive** (SB 5935 took effect 2024-06-06, already reflected)
  - Realism: tests whether stage 1 correctly treats the "current text" version as the resting state rather than re-flagging the older session law it's derived from.

- **TR10-S1a-04** · S1a · Applicability structured fields for TR-10: state=WA; worker_type=all employees (not contractor-limited per meta summary "voids all noncompetition covenants"); earnings_threshold=n/a under ESHB 1155 (blanket void) vs. threshold-gated under current law; industry=none specified (general); sale_of_business exception carried forward.
  - Trigger: `2026-03-23_eshb-1155-session-law.txt`
  - Inputs: as-of 2026-10-01
  - Expected: structured "who it applies to" record with state=WA, worker_type=employee (all), earnings_threshold=none (post-2027-06-30) / current RCW threshold (pre-2027-06-30) — VERIFY exact current threshold dollar figure from `2026-09-_rcw-49-62-current-text.txt`

### S3 — Scope (TR-10)

- **TR10-S3-01** · S3 · Relevant-stack set for TR-10: all `employment/signed-agreements/*wa*` (9 technician agreements), `employment/templates/form_technician-employment-agreement_washington_rev-2019.md`, `employment/employee-handbook_2025-edition/03_washington-addendum_2025-01-01.md`, `employment/rafael-underhill_retention-bonus-agreement_2025-04-01.md`, `employment/talia-ruiz-montoya_retention-bonus-agreement_2024-02-15.md`, `employment/joshua-halvorsen_transition-and-separation-agreement_2025-03-05.md`, `employment/gemma-northcott_customer-non-solicitation-agreement_2023-08-21.md`, `employment/templates/form_training-repayment-agreement_rev-2024.md` + WA signed instances, plus `acquisitions/ACQ-02-*`, `acquisitions/ACQ-05-*` (WA deals), `acquisitions/ACQ-05_pinecrest-legacy-franchise-agreement_trupipe_2019-05-01.md`.
  - Inputs: as-of 2026-10-01; profile default
  - Expected: all listed stacks in-scope (state=WA)
  - Verify: manifest `roles` contains "wa" and "noncompete"/"forfeiture" tags per doc — cross-checked above from manifest.jsonl.

- **TR10-S3-02** · S3 · Irrelevant-stack pruning for TR-10: `supply/**` (all), `corporate/lease_*` (non-WA branches: SAC, SJC, FRE, DAL, ELK, NAP, HOU, SAT, DAL), CA/IL/TX-only employment templates and signed instances, `vendors/**` NDAs without no-hire.
  - Inputs: as-of 2026-10-01
  - Expected: excluded, reason "no WA nexus / not an employment-restrictive-covenant document"
  - Realism: `corporate/lease_tacoma-branch_2019-08-01.md` is a WA-situs document but has no noncompete content (roles: distractor) — good decoy: WA location alone shouldn't pull it in.

### S4 — Findings (TR-10)

- **TR10-S4-01** · S4 · Template-instance variance: the WA technician template (`EMP-TPL-TECH-WA`, plant `TECH_NC_WA`) carries a noncompete tied to RCW 49.62's earnings-threshold carve-out; among the 9 signed WA instances, earnings range from $66,560 (Willa Lachance, 2025-08-11) to $127,920 (Isaac Whitcombe 2021-09-23; Omar Wilder 2024-10-14) — instances below WA's inflation-adjusted annual threshold (~$120,559.99 in 2024, adjusts yearly; VERIFY current 2026 figure) fall inside the carve-out (noncompete unenforceable for that employee) while higher earners do not.
  - Docs: `employment/templates/form_technician-employment-agreement_washington_rev-2019.md` §Noncompetition (template); `employment/signed-agreements/willa-lachance_technician-employment-agreement_wa_2025-08-11.md`, `employment/signed-agreements/isaac-whitcombe_technician-employment-agreement_wa_2021-09-23.md`, `employment/signed-agreements/omar-wilder_technician-employment-agreement_wa_2024-10-14.md`, `employment/signed-agreements/beatrice-falkner_technician-employment-agreement_wa_2024-01-06.md` (annualized_earnings:121160 — near-threshold), and remaining WA instances (carter-thornbury $68,640; gavin-falkner $68,120; hana-bellweather $85,800; renee-mbeki $96,720; omar-vasquez-reid $71,240)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: per-instance materiality/applicability varies — a correct subagent must compute each employee's threshold status individually, not apply one answer to all "WA technician agreements"
  - Plants: `TECH_NC_WA` (verbatim: "...shall not apply if Employee's earnings from the Company, when annualized, are equal to or less than the threshold amount then in effect under RCW 49.62.020"); `annualized_earnings:<n>` per signed instance (see manifest.jsonl)
  - Verify: 2026 RCW 49.62.020 inflation-adjusted threshold dollar figure (VERIFY — not in corpus, must be sourced or treated as an open fact); whether "undeterminable" is the correct label if the agent cannot find the current dollar figure in the trigger text itself
  - Realism: this is the clean "same template, different earnings → different outcome" case called out in the brief.

- **TR10-S4-02** · S4 · Forfeiture-for-competition (stay bonus) reclassified as a noncompete under ESHB 1155 definitions: Rafael Underhill's and Talia Ruiz-Montoya's WA retention bonus agreements have a **clawback-upon-competition** clause that operates like a de facto noncompete (forfeit/repay retention bonus if employee joins a competitor within 50 miles of a WA branch within 12 months). **Updated 2026-09-29:** per `corpus/status_at.py`, Talia Ruiz-Montoya's agreement (`EMP-STAY-WA-2024`) is now **expired** (expiry 2026-02-15 — the clawback window ran 12 months past her final installment, paid 2025-02-15) as of the default as-of date, while Rafael Underhill's (`EMP-STAY-WA-2025`, expiry 2027-10-01) is still **active**. These are no longer a matched pair for the 2027-07-01 metamorphic run.
  - Docs: `employment/rafael-underhill_retention-bonus-agreement_2025-04-01.md` §4 Clawback Upon Competition (active, expiry 2027-10-01); `employment/talia-ruiz-montoya_retention-bonus-agreement_2024-02-15.md` §4 Clawback Upon Competition (expired 2026-02-15)
  - Inputs: as-of 2026-10-01 (not yet affected — future law) and as-of 2027-07-01 (post-effective, metamorphic variant)
  - Expected: **Talia Ruiz-Montoya** — at both as-of 2026-10-01 and 2027-07-01, "not affected / moot": her own 12-month clawback window closed on its own terms (2026-02-15) before ESHB 1155's 2027-06-30 effective date, so there is no live forfeiture obligation left for the statute to void — an "expired ≠ irrelevant" case that nonetheless resolves to no exposure once the underlying window is checked, not a default "watch." **Rafael Underhill** — as-of 2026-10-01 → "affected: not yet, watch" (law not effective, clause still live through 2027-10-01); as-of 2027-07-01 → "affected: forfeiture/repayment clause now void as a noncompete" if his 12-month window is still open at that date
  - Plants: `STAY_BONUS_CLAWBACK`
  - Verify: does ESHB 1155's "treats forfeiture and repayment as noncompetes" language (per meta.yaml summary) actually sweep in clawback clauses — VERIFY against session-law text, section number; confirm Rafael Underhill's own 12-month clawback window relative to 2027-06-30 (his agreement's overall term runs to 2027-10-01, but the clawback trigger is 12 months from each installment, not from the agreement's expiry date — verify installment dates before scoring the 2027-07-01 variant)
  - Realism: this is a deliberately non-obvious hop — a shallow reader would only look at documents labeled "noncompete," missing the retention-bonus clawback; the Talia/Rafael split is now also a clean same-plant, different-status pairing (expired-and-moot vs. active-and-future-exposed).

- **TR10-S4-03** · S4 · Training-repayment agreement (`TRAINING_REPAY` plant) signed by WA employee Gavin Ingersoll (2025-06-02) — similar "forfeiture/repayment as noncompete" question as TR10-S4-02, but this plant is state-neutral text used across CA/IL/WA; only the WA instance is in TR-10's relevant set (the CA instance is separately relevant to TR-12). **Resolved 2026-09-29** (`legal-questions.md` Q5): post-2027 RCW 49.62.010(3)(d) sweeps in any provision requiring an employee to "return, repay, or forfeit any right, benefit, or compensation" as a consequence of engaging in a lawful profession; §(3)(e)(vi) carves out educational-expense repayment agreements only if all three hold — (A) expires within 18 months of the **start date**, (B) pro rata over that 18 months, (C) released on a "good cause" separation under RCW 50.20.050. The plant fails all three: it runs 24 months from training **completion** (not 18 from the start date), is pro rata over 24 (not 18), and releases only on termination without cause, with no good-cause-quit release.
  - Docs: `employment/signed-agreements/gavin-ingersoll_training-repayment-agreement_wa_2025-06-02.md`; template `employment/templates/form_training-repayment-agreement_rev-2024.md`
  - Inputs: as-of 2027-07-01 (post-effective) — affected: repayment obligation void as a noncompete under RCW 49.62.010(3)(d), since it fails all three §(3)(e)(vi) carve-out conditions. Pass = affected or needs review. As-of before 2027-06-30 (e.g. the 2026-10-01 default): not affected — the current definition (§(4)) has no forfeiture/repayment sweep, so there is no live noncompete theory yet.
  - Expected: affected from 2027-06-30 (void repayment obligation); not affected before 2027-06-30
  - Plants: `TRAINING_REPAY`
  - Verify: resolved — no VERIFY remains on ESHB 1155's forfeiture/repayment scope or the carve-out analysis. Separately, the final-wage deduction authorization raises a WA wage-deduction question under RCW 49.52.060 — out of scope for TR-10, note only.

- **TR10-S4-04** · S4 · Handbook consistency: WA addendum already states (as of the 2025 edition) that noncompetes are "enforceable only as permitted by RCW 49.62 (earnings thresholds as adjusted annually)" — this is accurate today but will become **stale/wrong** once ESHB 1155 takes effect 2027-06-30 (voids all covenants regardless of earnings).
  - Docs: `employment/employee-handbook_2025-edition/03_washington-addendum_2025-01-01.md` §Noncompetition Covenants
  - Inputs: as-of 2026-10-01 (accurate) vs. as-of 2027-07-01 (stale)
  - Expected: consistency-gap finding type at the later as-of date only (M1 metamorphic pair)
  - Verify: exact addendum wording, VERIFY

- **TR10-S4-05** · S4 · Customer non-solicitation agreement (Gemma Northcott, WA comfort advisor, 2023-08-21, `CUST_NONSOLICIT` plant, §4.1: "shall not … solicit, divert **or accept** … business … For twenty-four (24) months"). **Reclassified 2026-09-29** (`legal-questions.md` Q5): **this is no longer a decoy.** Both RCW 49.62.010's current §(4) and the post-2027-06-30 §(3)(c)/§(4) expressly provide that "a noncompetition covenant also includes an agreement that directly or indirectly prohibits the acceptance or transaction of business with a customer," and the post-2027 §(4) further states that such an "acceptance or transaction" clause is **not** a "nonsolicitation agreement" (true non-solicits are also capped at ≤18 months for customers the employee personally developed — this clause runs 24 months and has no such limitation). A clause barring *acceptance* of business — not just active solicitation — is a **noncompetition covenant** under both versions of the statute.
  - Docs: `employment/gemma-northcott_customer-non-solicitation-agreement_2023-08-21.md` §4.1
  - Inputs: as-of 2027-07-01 — **affected**: void regardless of signing date under ESHB 1155 §4(1) ("all noncompetition covenants are void and unenforceable … regardless of when the parties entered into the noncompetition covenant"), with an employer notice duty by 2027-10-01 under §4(3). As-of the default 2026-10-01: **pending clock** — under current law the clause is a noncompetition covenant subject to the earnings-threshold carve-out (RCW 49.62.020), not the nonsolicitation carve-out; whether it's currently enforceable turns on Northcott's annualized earnings against the current WA threshold.
  - Expected: as-of 2027-07-01: affected (void + notice due 2027-10-01). As-of default: pending clock, materiality contingent on the current-year earnings threshold.
  - Verify: resolved — the statutory classification is settled (noncompetition covenant, not a nonsolicitation agreement) under both current and post-2027 text. Remaining: Gemma Northcott's annualized earnings as a comfort advisor (commission sales role) against the current-year RCW 49.62.020 inflation-adjusted threshold, to determine pre-2027-06-30 enforceability — VERIFY (same out-of-corpus dollar-figure gap as TR10-S4-01).
  - Realism: this is the corpus's clean "acceptance clause, not solicitation clause" trap — an agent that pattern-matches on the document's own title ("customer non-solicitation agreement") or the word "solicit" without reading the "or accept" language and the statute's express treatment of acceptance clauses would wrongly treat this as a should-not-flag decoy.

- **TR10-S4-06** · S4 · Acquisitions ACQ-02 (Northgate, WA, closed 2021-06-01) and ACQ-05 (Pinecrest, WA, closed 2025-02-18) seller noncompetes: ACQ-02 owner Alan Mercer and ACQ-05's seller-restrictive-covenant party Owen Pemberton likely qualify for the **sale-of-business exception** (≥1% ownership); but ACQ-02's Jeffrey Hale and ACQ-05's Leah Pemberton are flagged `non_owner_signer` — the sale-of-business exception does **not** apply to them, so their individual noncompetes are governed by the general employee rule (earnings-threshold today, void after 2027-06-30).
  - Docs: `acquisitions/ACQ-02_alan-mercer_employment-agreement_2021-06-01.md` (owner); `acquisitions/ACQ-02_jeffrey-hale_executive-employment-agreement_2021-06-01.md` (non-owner, roles: non_owner_signer, party_link); `acquisitions/ACQ-05_owen-pemberton_seller-restrictive-covenant-agreement_2025-02-18.md` (owner/seller); `acquisitions/ACQ-05_leah-pemberton_employment-agreement_2025-02-18.md` (non-owner, roles: non_owner_signer)
  - Inputs: as-of 2027-07-01; profile default
  - Expected: two-track finding — owner noncompetes exempt (sale-of-business), non-owner-signer noncompetes voided by ESHB 1155
  - Verify: confirm Jeffrey Hale and Leah Pemberton actually held no meaningful equity in the acquired business (manifest role `non_owner_signer` is the plan's own hint — VERIFY against agreement text, e.g. any equity/ownership recital)
  - Realism: this is exactly the brief's called-out "non-owner signers — the sale-of-business exception doesn't apply" case, doubled across two deals.

- **TR10-S4-07** · S4 · ACQ-05 legacy franchise agreement (TruPipe, terminated on acquisition 2025-02-18) contains a no-poach clause predating the acquisition; status is `terminated_on_acquisition` — should NOT be surfaced as a live TR-10 noncompete finding, but is relevant to S5-link (see below) as a historical artifact / superseded document (V5 test).
  - Docs: `acquisitions/ACQ-05_pinecrest-legacy-franchise-agreement_trupipe_2019-05-01.md`
  - Inputs: as-of 2026-10-01 or 2027-07-01
  - Expected: not affected — document terminated, operative-text invariant (V5) should prevent citing it as live law-relevant text
  - Realism: superseded/expired-document decoy called out in the brief.

### S5-link (TR-10)

- **TR10-L1** · S5-link · L2 compensating-protection link: if WA technician noncompetes become void (post-2027-06-30), weight shifts to the surviving customer non-solicitation and confidentiality clauses in the same template family (`TECH_NC_WA` co-located with a customer non-solicitation section in the WA template) and to `EMP-RCA-FORM` (restrictive-covenant-and-invention-assignment form, roles include `compensating_protection`).
  - Docs: `employment/templates/form_technician-employment-agreement_washington_rev-2019.md` §Non-Solicitation; `employment/form_restrictive-covenant-and-invention-assignment-agreement_managers_2022.md`
  - Inputs: as-of 2027-07-01
  - Expected: link type "compensating_protection" recorded between the TR-10 finding and the non-solicit/confidentiality clauses
  - Plants: `EMP-RCA-FORM` role tag `compensating_protection` is itself a hint from the manifest — treat as directional, verify text supports the framing.

- **TR10-L2** · S5-link · Handbook/agreement consistency link: WA handbook addendum's noncompete statement (TR10-S4-04) should be checked against the actual WA technician template and signed instances for internal consistency, both now (accurate) and post-2027-06-30 (handbook becomes wrong unless updated).
  - Docs: `employment/employee-handbook_2025-edition/03_washington-addendum_2025-01-01.md`; `employment/templates/form_technician-employment-agreement_washington_rev-2019.md`
  - Inputs: as-of 2027-07-01
  - Expected: link type "consistency_gap"

### S5-R1/R2/R3 draft tier (TR-10)

- **TR10-R1-DRAFT** · S5-R1/R2/R3 · Draft tier sketch for one TR-10 scenario: Isaac Whitcombe's WA technician noncompete ($127,920 annualized, signed 2021-09-23), evaluated **as of 2026-10-01** (default date).
  - Tier: **watch / tier-3 (monitor)** — one-line reason: the law is enacted but not effective until 2027-06-30, so at the default as-of date there is no clock running and no current obligation change; this is the plan's called-out example that WA's 2027-06-30 effective date makes TR-10 "future" at the default as-of date.
  - Inputs: as-of 2026-10-01; profile default
  - Verify: confirm no interim obligation (e.g., no notice requirement already due) attaches before 2027-06-30.

### LBL (TR-10)

- **TR10-LBL-01** · LBL-urgency · Urgency label test: as-of 2026-10-01, TR-10 items are "clock pending on a known future event" (2027-06-30) rather than "no clock" — distinguishes a future-effective statute from a truly dormant one.
  - Inputs: as-of 2026-10-01
  - Expected: urgency = clock pending on known future event

- **TR10-LBL-02** · LBL-materiality · Materiality label for Isaac Whitcombe's / Omar Wilder's WA noncompete once ESHB 1155 is in force (as-of 2027-07-01): material (removes the value of a right the Company held — ability to restrict a departing high-earning technician).
  - Inputs: as-of 2027-07-01

- **TR10-LBL-03** · LBL-undeterminable · Materiality/applicability for a signed WA instance if the agent cannot locate the current RCW 49.62.020 dollar threshold (it is not in the corpus and changes annually) — correct label is "undeterminable, missing fact: current WA noncompete earnings threshold," not a guess.
  - Docs: any WA signed technician agreement, e.g. `employment/signed-agreements/hana-bellweather_technician-employment-agreement_wa_2023-03-23.md` ($85,800)
  - Inputs: as-of 2026-10-01

---

## TR-11 — IL Construction Noncompete (820 ILCS 90 / PA 103-0921)

### S1a — Change items

- **TR11-S1a-01** · S1a · PA 103-0921 (effective 2025-01-01) voids noncompete **and** non-solicit covenants specifically for **construction employees** in Illinois; prior 820 ILCS 90 text (pre-2025) allowed IL noncompetes above earnings thresholds generally, without a construction-specific carve-out.
  - Trigger: `corpus/triggers/TR-11-il-noncompete-construction/2023-03-_820-ilcs-90-prior-text.txt` (old) vs `2024-08-09_public-act-103-0921.txt` (new)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: legal status = "in force" (effective 2025-01-01, before as-of date); who-it-applies-to: industry=construction, state=IL, worker_type=construction employee (structured)
  - Verify: exact statutory definition of "construction employee" in PA 103-0921 — VERIFY scope (does it include HVAC/plumbing installation techs, or only employees primarily performing "construction" per a specific statutory list)

- **TR11-S1a-02** · S1a · Earnings-threshold step-up 2027-01-01 (per meta.yaml summary) for the general (non-construction) IL noncompete/non-solicit thresholds under 820 ILCS 90.
  - Trigger: `2024-08-09_public-act-103-0921.txt`
  - Inputs: as-of 2026-10-01 (not yet in force) vs. as-of 2027-02-01 (in force, metamorphic)
  - Expected: legal status "enacted, effective later" at 2026-10-01; "in force" at 2027-02-01
  - Verify: exact new threshold dollar figures, VERIFY

### S3 — Scope (TR-11)

- **TR11-S3-01** · S3 · Relevant-stack set: `employment/signed-agreements/*il*` (8 technician instances), `employment/templates/form_technician-employment-agreement_illinois_rev-2021.md`, `employment/employee-handbook_2025-edition/04_illinois-addendum_2025-01-01.md`, `employment/branch-manager-employment-agreement_elk-grove-village_2022-11-01.md`, `employment/general-manager-employment-agreement_illinois_2014-06-02.md` (legacy template — pre-2025 signing), `employment/hector-bancroft_separation-agreement-and-general-release_2025-11-14.md`, `employment/meridian-v-former-technicians_complaint-for-injunctive-relief_n-d-ill_2025-08-11.md`, `employment/signed-agreements/dmitri-rosales_training-repayment-agreement_il_2025-03-10.md`, plus `acquisitions/ACQ-03-*` (Kessler, IL).
  - Inputs: as-of 2026-10-01
  - Expected: all in-scope (state=IL, and several explicitly tagged `construction_employees`)

- **TR11-S3-02** · S3 · Pruning: non-IL employment stacks, `supply/**`, `corporate/**` leases outside IL (ELK/NAP are IL branches — leases there ARE potentially relevant to nothing noncompete-related; still pruned as non-employment).
  - Inputs: as-of 2026-10-01
  - Expected: excluded with reason

### S4 — Findings (TR-11)

- **TR11-S4-01** · S4 · Signing-date-vs-effective-date cutoff, **resolved into three tiers** per `legal-questions.md` Q1 (Illinois' presumption against retroactive substantive change, plus PA 102-358's own "entered into after" definitional cutoff): the IL technician template's noncompete plant (`TECH_NC_IL`) was signed by different employees across all three bands among the 8 IL technician instances (`EMP-TECH-IL-01..08`).
  - **Pre-2022-01-01 (outside 820 ILCS 90's own definitions; not affected by TR-11 at all):** Carter Sorenson (2021-04-27, earnings $70,720), Talia Tanaka (2021-12-07, earnings $102,960).
  - **2022-01-01 → 2024-12-31 ("needs review" band — ambiguous text, presumption against retroactivity, but each covenant must still independently satisfy the pre-existing 2022 IFWA requirements — earnings threshold, 14-day review, attorney advice):** Ingrid Yardley (2022-06-27, $69,680 — VERIFY against the 2022 IFWA earnings threshold in force at signing, separate from the construction-ban question), Farah Haverford (2023-01-21, $99,320), Nolan Quill (2023-08-25, $96,720), Brianna Falkner (2024-03-21, $106,600), Delia Whitcombe (2024-10-14, $93,080).
  - **On/after 2025-01-01 (void):** Sabrina Dunmore (2025-05-23, $101,920), flagged `il_construction_ban_in_effect_at_signing` — void ab initio if she is a "construction employee" (a field HVAC/plumbing technician squarely fits).
  - Docs: `employment/templates/form_technician-employment-agreement_illinois_rev-2021.md` §Restrictive Covenants; the 8 signed instances listed above
  - Inputs: as-of 2026-10-01
  - Expected: pre-2022 signers = not affected by TR-11; 2022–2024 signers = **needs review**, not "void" and not "unaffected" (gold should not collapse this band into either extreme); post-2025 signer (Dunmore) = void
  - Plants: `TECH_NC_IL`; `il_construction_ban_in_effect_at_signing` marker
  - Verify: the prospective-vs-retroactive question is now settled by `legal-questions.md` Q1 (statute-of-statutes presumption + no retroactive-intent language in PA 103-0921) — no longer an open critical fact for the post-2025 vs. pre-2025 split. What remains open per-instance: (a) each in-band employee's independent compliance with the pre-existing 2022 IFWA earnings threshold/14-day-review/attorney-advice requirements (could independently void a 2022–2024 covenant regardless of the construction-ban question); (b) confirm none of the 8 technicians holds a management/engineering/design/sales role or ownership stake that would trigger the role exception (manifest roles show only `noncompete, il` for all 8 — no exception indicator, consistent with field technician job titles).
  - Realism: this is the flagship signing-date-vs-effective-date scenario called out explicitly in the brief, now spanning all three resolved tiers rather than a binary pre/post split.

- **TR11-S4-02** · S4 · Legacy template drift: `general-manager-employment-agreement_illinois_2014-06-02.md` (`EMP-GM-IL-2014`, roles: `legacy_template`) predates both 820 ILCS 90 (2022 threshold regime) and PA 103-0921 by signing date (2014-06-02, pre-2022) — a stale-template absence/superseded-context finding, doubly not affected: (1) signed before 2022-01-01, outside the Act's own definitions entirely per Q1; and (2) a general manager falls within the management exception that applies "throughout" per `legal-questions.md` Q1, so even a later-dated GM covenant would be exempt.
  - Docs: `employment/general-manager-employment-agreement_illinois_2014-06-02.md`
  - Inputs: as-of 2026-10-01
  - Expected: not affected by TR-11, on two independent grounds (pre-2022 signing date and managerial-role exception) — good redundant-decoy case, not one requiring role-classification VERIFY

- **TR11-S4-06** · S4 · Role exception inside the ambiguous band: `branch-manager-employment-agreement_elk-grove-village_2022-11-01.md` (`EMP-MGR-IL-2022`) is signed 2022-11-01 — squarely inside the 2022–2024 "needs review" band by date alone — but the manager role exception applies "throughout" per `legal-questions.md` Q1, so this instance resolves to **not affected** even though a technician signed the same week would be a needs-review case. Deliberate contrast with the technician-only band in TR11-S4-01.
  - Docs: `employment/branch-manager-employment-agreement_elk-grove-village_2022-11-01.md`
  - Inputs: as-of 2026-10-01
  - Expected: not affected (management exception), despite falling inside the date band that would otherwise trigger "needs review" for a non-exempt employee
  - Verify: confirm the branch manager role as described in the agreement (title, duties) is squarely "management" under the IFWA's exception language, not a working supervisor who also performs construction-employee duties
  - Realism: tests whether an agent applies the date band mechanically without checking the role exception first — the brief's called-out "role exception applies throughout" point needs its own positive should-not-flag case, not just a restatement in prose.

- **TR11-S4-03** · S4 · Litigation exposure: `meridian-v-former-technicians_complaint-for-injunctive-relief_n-d-ill_2025-08-11.md` is Meridian's own **active lawsuit seeking to enforce** noncompete/non-solicit covenants against two former HVAC technicians acquired via Kessler (ACQ-03, IL) — filed 2025-08-11, *after* PA 103-0921's 2025-01-01 effective date. This is a direct, high-materiality exposure: the covenants being enforced may themselves be void under the construction-employee ban, undermining the litigation.
  - Docs: `employment/meridian-v-former-technicians_complaint-for-injunctive-relief_n-d-ill_2025-08-11.md`
  - Inputs: as-of 2026-10-01
  - Expected: material finding, direction = exposure (litigation risk / potential to lose the case or face a counterclaim), urgency = obligation clock running (active litigation) or forfeitable clock if a preliminary injunction deadline exists — VERIFY complaint for any deadline
  - Verify: whether the technicians at issue are classified as "construction employees" under the complaint's own factual allegations (job duties) — the complaint won't concede this, so this requires a determinability judgment
  - Realism: strong real-GC scenario — an active suit built on covenants that a subsequent (or concurrent) statute may have voided is exactly the kind of item a monitoring agent should surface prominently.

- **TR11-S4-04** · S4 · Training-repayment agreement, IL instance (Dmitri Rosales, 2025-03-10) — TR-11 governs noncompetes/non-solicits for construction employees; TRAINING_REPAY is a repayment obligation, not squarely a noncompete. **Resolved 2026-09-29** (`legal-questions.md` Q5): **confirmed decoy.** PA 103-0921's "covenant not to compete" definition reaches an agreement that "imposes adverse financial consequences on the former employee **if the employee engages in competitive activities** after … termination" — a competitive-activity trigger IL's definition requires but that this plant does not have: `TRAINING_REPAY` triggers on resignation or for-cause termination regardless of what the employee does afterward, with no competitive-activity condition anywhere in the text. It is therefore not a "covenant not to compete," and (separately) not a "covenant not to solicit" either, so PA 103-0921 does not reach it at all. Note the contrast: **IL customer non-solicits *are* covered** — PA 103-0921's "covenant not to solicit" definition expressly includes restricting solicitation of "the employer's clients, prospective clients … or interfering with the employer's relationships" (relevant to any IL customer non-solicit plant, distinct from this training-repayment finding).
  - Docs: `employment/signed-agreements/dmitri-rosales_training-repayment-agreement_il_2025-03-10.md`
  - Inputs: as-of 2026-10-01
  - Expected: **not affected — confirmed decoy** for TR-11 (distinguish from TR-10's WA forfeiture sweep, which has no competitive-activity condition in its own definition)
  - Verify: resolved — no VERIFY remains; PA 103-0921's text has been read directly (definitions section, "covenant not to compete").
  - Realism: good negative-transfer decoy — an agent that over-generalizes "forfeiture=noncompete" from the WA plant to the IL plant would incorrectly flag this; the fix is checking IL's own competitive-activity condition rather than assuming parity with WA's broader post-2027 forfeiture sweep.

- **TR11-S4-05** · S4 · Amendment overriding the base agreement: ACQ-03's seller noncompete (Kessler, IL, signed 2022-10-03, 5-year restricted period through 2027-10-03) was narrowed by **Amendment No. 1 (2024-08-16)**, which shrinks the Territory from 5 counties to 2 (Cook and DuPage) and carves out a permitted activity (Karl Kessler may perform residential boiler service for Kessler Refrigeration customers). The amendment is a sale-of-business seller noncompete, separate from the construction-employee ban, but is in-scope for TR-11's IL jurisdiction sweep and for template/version-resolution testing (operative text = amended Territory, not the original 5-county territory).
  - Docs: `acquisitions/ACQ-03_kessler-seller-noncompetition-agreement/01_noncompetition-and-nonsolicitation-agreement_2022-10-03.md` §Territory (superseded in part); `acquisitions/ACQ-03_kessler-seller-noncompetition-agreement/02_amendment-1_noncompetition-agreement_2024-08-16.md` (operative)
  - Inputs: as-of 2026-10-01
  - Expected: PA 103-0921 does not apply (sale-of-business seller noncompete, not an employee/construction-employee covenant) — not affected by TR-11; but any finding **must cite the amended territory**, not the original, else it is a V5 operative-text violation
  - Verify: does the Illinois Freedom to Work Act's sale-of-business exception (parallel to WA's) apply cleanly here — is Karl Kessler still ≥ some ownership threshold — VERIFY exact IL exception mechanics (act doesn't necessarily use "1%" like WA)
  - Realism: this is the brief's explicitly called-out "ACQ-03 amendment overriding the base agreement" case.

### S5-link (TR-11)

- **TR11-L1** · S5-link · Handbook consistency: IL addendum states covenants "are subject to the Illinois Freedom to Work Act (820 ILCS 90), including its earnings thresholds" — accurate as a general statement but doesn't call out the construction-employee categorical ban; check consistency against the IL technician template and signed instances, especially construction-classified technicians.
  - Docs: `employment/employee-handbook_2025-edition/04_illinois-addendum_2025-01-01.md` §Restrictive Covenants; `employment/templates/form_technician-employment-agreement_illinois_rev-2021.md`
  - Inputs: as-of 2026-10-01
  - Expected: consistency-gap link (handbook silent on construction-specific ban)

- **TR11-L2** · S5-link · Compensating protection: if IL construction-employee noncompetes are void, the same template's **non-solicit** provision is *also* void per PA 103-0921 (unlike WA/CA, IL's construction ban sweeps non-solicitation too) — so there is **no** compensating non-solicit fallback for IL construction employees, unlike TR-10's WA case. This is a deliberate asymmetry worth surfacing.
  - Docs: `employment/templates/form_technician-employment-agreement_illinois_rev-2021.md` §Restrictive Covenants (both noncompete and non-solicit in one plant, `TECH_NC_IL`)
  - Inputs: as-of 2026-10-01
  - Verify: confirm PA 103-0921 voids non-solicits too (per meta.yaml: "voids noncompetes AND non-solicits for construction employees") — already stated in meta summary, cite trigger text directly for the finding.

### S5-R1/R2/R3, LBL (TR-11)

- **TR11-LBL-01** · LBL-urgency · TR11-S4-03 (active litigation) = urgency "obligation clock running" (litigation deadlines, potential adverse ruling) — pending-clock case distinct from TR-10's future-law no-clock-yet case; good urgency-label contrast pair with TR-10-R1-DRAFT.
  - Inputs: as-of 2026-10-01

- **TR11-LBL-02** · LBL-materiality · **Updated 2026-09-29 (resolved, no longer undeterminable):** Sabrina Dunmore's void-ab-initio noncompete (TR11-S4-01, signed 2025-05-23) = material (removes an enforceable right the Company believed it had); Carter Sorenson's pre-2022 signed instance = not material (never within the Act's scope); a 2022–2024-band instance (e.g. Ingrid Yardley or Brianna Falkner) = the correct label is **needs-review**, a distinct third value from "material" and "not material," not an "undeterminable" placeholder — `legal-questions.md` Q1 settles the pre/post-2025 split, so only the middle band should carry this label, and only because the text is genuinely ambiguous there, not because research wasn't done.

---

## TR-12 — CA AB 692 (Stay-or-Pay)

### S1a — Change items

- **TR12-S1a-01** · S1a · AB 692 bans training-repayment/"stay-or-pay" terms in CA employment contracts **entered on or after 2026-01-01**; prior law (no direct predecessor trigger version in corpus — TR-12 has only one version) permitted such terms generally under ordinary contract law.
  - Trigger: `corpus/triggers/TR-12-ca-ab-692-stay-or-pay/2025-10-13_ab-692-chaptered.txt`
  - Inputs: as-of 2026-10-01; profile default
  - Expected: legal status = "in force" (effective 2026-01-01, before as-of date); who-it-applies-to: state=CA, worker_type=employee, contract-date cutoff=2026-01-01 (structured field distinct from "signing date" in TR-11 — here it's the **contract's** effective/signing date, not the employee's job classification)
  - Verify: exact statutory scope — does AB 692 cover only "training repayment agreement provisions" (TRAPs) specifically, or broader "stay-or-pay" arrangements (e.g., relocation repayment, sign-on bonus clawbacks)? VERIFY against trigger text — moot for `EMP-OFFER-CA-2024` itself: its relocation clause is now correctly tagged `relocation_allowance` (an unconditional payment, no repayment term — see TR12-S4-03) rather than the prior `relocation_repayment` mislabel, so it is not a stay-or-pay candidate regardless of this VERIFY's outcome; the VERIFY still matters for any other repayment/clawback arrangement.

### S3 — Scope (TR-12)

- **TR12-S3-01** · S3 · Relevant-stack set: `employment/signed-agreements/*ca*technician*` (8 instances), `employment/templates/form_technician-employment-agreement_california_rev-2017.md` (no training-repayment plant itself, but CA employees may separately sign training-repayment agreements), `employment/templates/form_training-repayment-agreement_rev-2024.md` + CA signed instances (`delia-kilgore` 2026-02-09, `sabrina-haverford` 2025-09-15), `employment/employee-handbook_2025-edition/02_california-addendum_2025-01-01.md` (Tuition/Training Assistance cross-reference in core handbook), `employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` (`relocation_allowance` role, renamed from `relocation_repayment` per `CHANGES-2026-09-29.md` §E), `acquisitions/ACQ-01-*` (CA, 2019 — pre-dates AB 692 by construction, but check any post-2026 amendment — none found), `acquisitions/ACQ-05_owen-pemberton_consulting-agreement_2025-02-18.md` if it contains any repayment terms (VERIFY, likely not in scope — consulting, not employee).
  - Inputs: as-of 2026-10-01
  - Expected: in-scope list above

### S4 — Findings (TR-12)

- **TR12-S4-01** · S4 · Signing-date-vs-effective-date cutoff, the flagship TR-12 pair, **now resolved** by `legal-questions.md` Q1: AB 692 is prospective only, settled by the statute's own text (B&P §16608(b)(1) "for contracts entered into on or after January 1, 2026"; §16608(c) and Lab. Code §926(a) both void "only if" entered on/after that date). The training-repayment form template is dated 2024-01-01 (`EMP-TPL-TRAINING`, plant `TRAINING_REPAY`), predating AB 692. Two CA signed instances sit on opposite sides of the 2026-01-01 cutoff: **Sabrina Haverford (2025-09-15)** is flagged `ca_ab692_before_cutoff`; **Delia Kilgore (2026-02-09)** is flagged `ca_ab692_after_cutoff`.
  - Docs: `employment/templates/form_training-repayment-agreement_rev-2024.md` §Repayment of Training Costs; `employment/signed-agreements/sabrina-haverford_training-repayment-agreement_ca_2025-09-15.md` (planted: `ca_ab692_before_cutoff`); `employment/signed-agreements/delia-kilgore_training-repayment-agreement_ca_2026-02-09.md` (planted: `ca_ab692_after_cutoff`)
  - Inputs: as-of 2026-10-01
  - Expected: **Delia Kilgore's** clause = void ab initio, material finding, direction = recovery-risk-removed (Company loses a repayment right it thought it had); **Sabrina Haverford's** clause = **not affected by TR-12** — entered into before 2026-01-01, so it is enforceable under prior law and stays enforceable going forward (AB 692 does not retroactively reach existing contracts; this is now a should-not-flag / decoy result, not an open question)
  - Plants: `TRAINING_REPAY`; `ca_ab692_before_cutoff` / `ca_ab692_after_cutoff` markers
  - Verify: the prospective-only question is settled (see above) — no longer VERIFY. Remaining open item: whether Sabrina Haverford's agreement is ever re-signed, amended, or extended on/after 2026-01-01, which under Q1's re-signing nuance would make it a "new contract entered into" and flip her to affected — no such amendment exists in the corpus today (checked `manifest.jsonl` for any `amendment` doc tied to `EMP-TRAIN-CA-2025-09-15`; none found), so this remains a hypothetical variant rather than a scoreable scenario (see Gaps).
  - Realism: this is the plan's explicitly named `ca_ab692_before/after_cutoff` scenario pair — the cleanest signing-date-cutoff test in the corpus, and now a fully resolved one rather than one hinging on an open legal question.

- **TR12-S4-02** · S4 · CA technician employment template (`EMP-TPL-TECH-CA`) itself carries no noncompete (California already bars noncompetes generally under Bus. & Prof. Code §16600, reflected in `TECH_NS_CA` plant and the CA handbook addendum's explicit statement) — AB 692 is a distinct, narrower stay-or-pay ban layered on top of the pre-existing §16600 noncompete ban. The 8 CA technician signed instances are **not** independently affected by AB 692 (no repayment clause in that template) — decoy/should-not-flag for this trigger, contrast with the training-repayment agreements which are the real hits.
  - Docs: `employment/templates/form_technician-employment-agreement_california_rev-2017.md`; e.g. `employment/signed-agreements/uma-kilgore_technician-employment-agreement_ca_2019-02-09.md`
  - Inputs: as-of 2026-10-01
  - Expected: not affected by TR-12 (right document type, wrong trigger)

- **TR12-S4-03** · S4 · Nadia Castellano's offer letter/PIIA (2024-05-06) — **not affected by TR-12, confirmed on two independent grounds** per `legal-questions.md` Q1/Q2: (1) signed 2024-05-06, well before AB 692's 2026-01-01 cutoff — pre-AB-692 under the now-resolved prospective-only reading; and (2) **read against the actual text**, §3's relocation clause ("Meridian will pay you a one-time relocation allowance of USD $30,000 which will be paid with your first pay cheque") is a **flat, unconditional payment with no repayment, clawback, or tenure condition anywhere in the document** (checked for "repay/forfeit/clawback/reimburse" — none found tied to relocation). There is no stay-or-pay term here at all, so it would fall outside AB 692's scope by structure even for a post-2026 signing, not only by timing. **Corpus fix 2026-09-29** (`CHANGES-2026-09-29.md` §E): the manifest role tag itself is now `relocation_allowance` (was `relocation_repayment`), matching the actual clause text.
  - Docs: `employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` §3 (relocation allowance, no repayment condition; manifest role `relocation_allowance`)
  - Inputs: as-of 2026-10-01
  - Expected: not affected — a doubly-safe should-not-flag case (timing AND no repayment obligation to void)
  - Verify: resolved — no VERIFY remains on the timing question, and the manifest tag naming mismatch flagged in this scenario has been fixed at the corpus level (`relocation_repayment` → `relocation_allowance`)
  - Realism: a shallow agent keying off a stale `relocation_repayment` tag (without reading §3) could have wrongly treated this as TR-12-adjacent; the corpus tag now matches the text, so this scenario tests reading §3 directly rather than trusting the tag name — either path now correctly reaches "nothing to repay."

- **TR12-S4-04** · S4 · Handbook cross-reference: core handbook's `HANDBOOK_TRAINING` plant ("Employees who participate in Company-paid training costing more than $2,500 must sign a Training Repayment Agreement before training begins") is itself a *policy statement* pointing at a now-partially-void agreement type for CA hires after 2026-01-01 — a template/policy needing update, not a contract itself.
  - Docs: `employment/employee-handbook_2025-edition/01_employee-handbook_core_2025-01-01.md` §Tuition and Training Assistance; `employment/employee-handbook_2025-edition/02_california-addendum_2025-01-01.md`
  - Inputs: as-of 2026-10-01
  - Expected: consistency/update-needed finding — response_type candidate "update template"

### S5-link (TR-12)

- **TR12-L1** · S5-link · Consistency between the CA handbook addendum (silent on AB 692 specifically, only discusses noncompete void under §16600) and the training-repayment form/instances — the handbook needs an AB 692-specific update once instances start failing on the new-contract side.
  - Docs: `employment/employee-handbook_2025-edition/02_california-addendum_2025-01-01.md`; `employment/templates/form_training-repayment-agreement_rev-2024.md`
  - Inputs: as-of 2026-10-01

### S5-R1/R2/R3 draft tier (TR-12)

- **TR12-R1-DRAFT** · S5-R1/R2/R3 · Draft tier sketch for one TR-12 scenario: Delia Kilgore's training-repayment agreement (signed 2026-02-09, after AB 692's 2026-01-01 cutoff), evaluated as of 2026-10-01.
  - Tier: **act soon / tier-1 or tier-2** — one-line reason: the repayment clause is void from inception under a law already in force, creating an active, incorrectly-relied-upon right (recovery exposure the Company may try to enforce without knowing it's unenforceable); no forfeitable clock, but material and currently wrong, warranting near-term legal/HR correction (e.g., stop attempting to enforce, update the form) rather than routine monitoring.
  - Inputs: as-of 2026-10-01; profile default
  - Verify: confirm Delia Kilgore's training program cost and repayment schedule so materiality/exposure figure can be attached (`TRAINING_COST` placeholder — VERIFY actual dollar figure in the instance document, not just the template).

### LBL (TR-12)

- **TR12-LBL-01** · LBL-materiality · Delia Kilgore instance = material (creates a compliance/breach risk if enforced); Sabrina Haverford instance = materiality depends on the prospective-vs-retroactive VERIFY question — potential "undeterminable" only if the statute text itself is ambiguous, otherwise should resolve to "not material" (still valid) once confirmed.
  - Inputs: as-of 2026-10-01

- **TR12-LBL-02** · LBL-urgency · No forfeitable clock on either CA training-repayment instance (AB 692 doesn't create a deadline for the Company to act) — urgency = "no clock" but materiality still high for Delia Kilgore — good example that urgency and materiality are independent axes.

---

## TR-13 — FTC Noncompete Rule Removal + Rollins Consent Order

### S1a — Change items

- **TR13-S1a-01** · S1a · FTC formally removes the (already-vacated) Non-Compete Clause Rule from the CFR — legal status = "vacated or repealed" / per meta.yaml this is explicitly framed as a **no-op control** (the rule was enjoined/vacated by courts before this removal; removing it from the CFR doesn't change substantive obligations).
  - Trigger: `corpus/triggers/TR-13-ftc-noncompete-rule-removal/2026-02-12_ftc-rule-removal.txt`
  - Inputs: as-of 2026-10-01; profile default
  - Expected: change item logged with legal status "vacated or repealed"; company-level applicability gate (stage 1b) should likely **exit or mark not material** since the rule was never actually in effect — this is intentionally a control / negative case, not a real compliance event
  - Verify: confirm the rule was vacated (not just proposed) prior to this removal — VERIFY exact procedural history in the trigger text
  - Realism: this is the corpus's deliberate **no-op / decoy trigger** for TR-13 — an agent that treats "FTC removes noncompete rule" as a big deal (e.g., "great news, noncompetes are now unrestricted federally") would be wrong twice over: (1) it was never in force, and (2) state law (TR-10, TR-11, TR-12, CA §16600) still governs regardless.

- **TR13-S1a-02** · S1a · Rollins consent order (proposed, 2026-04-22) — an FTC enforcement action against a **pest-control/home-services company** for allegedly overbroad noncompetes imposed on **technicians** — status = "proposed_order" (not yet final); applies-to: industry=home services/pest control (analogous to Meridian's HVAC/plumbing technician workforce), worker_type=technician, no state limitation (federal enforcement theory under FTC Act unfairness, not the vacated rule).
  - Trigger: `corpus/triggers/TR-13-ftc-noncompete-rule-removal/2026-04-22_ftc-rollins-consent-order-analysis.txt`
  - Inputs: as-of 2026-10-01
  - Expected: legal status = "proposed" (consent order not final); company-level gate should **not** exit (industry analogy to Meridian's own technician-workforce noncompetes is close enough to proceed, per the lenient-gate rule) — flagged as an enforcement-posture signal rather than a binding legal change
  - Verify: exact terms of the proposed order (which covenant types are targeted, any earnings threshold or geographic scope the FTC's theory relies on) — VERIFY, since it may inform which of Meridian's own technician noncompetes (TECH_NC_WA/IL/TX plants) look most exposed to a similar theory
  - Realism: this is the "soft law" / enforcement-signal case — no direct legal obligation change, but real GCs do treat FTC consent orders against peer industries as an early-warning signal worth a "monitor" tier item.

### S3 — Scope (TR-13)

- **TR13-S3-01** · S3 · Relevant-stack set: all employment noncompete-bearing documents company-wide (TECH_NC_WA/IL/TX plants, seller noncompetes in acquisitions, retention-bonus clawbacks) since TR-13 is not state-limited — broader sweep than TR-10/11/12.
  - Inputs: as-of 2026-10-01
  - Expected: broad in-scope set across `employment/**` and `acquisitions/**`

- **TR13-S3-02** · S3 · Irrelevant stacks: `supply/**`, `corporate/**` (non-employment), `customers/**` and `vendors/**` **except** the no-hire clauses (`NOHIRE_OAKRIDGE`, `NDA_NOHIRE`) which are personnel-restriction look-alikes worth a scoping judgment call (no-hire between businesses is not an employee noncompete and is outside the FTC rule/Rollins theory, which targets employer-employee covenants) — good pruning test: a shallow scoper might over-include B2B no-hire clauses just because they mention "solicit for employment."
  - Inputs: as-of 2026-10-01
  - Expected: `NOHIRE_OAKRIDGE` and `NDA_NOHIRE` excluded from TR-13's relevant set with reason "B2B no-hire, not an employee noncompete; outside FTC rule and Rollins theory scope"

### S4 — Findings (TR-13)

- **TR13-S4-01** · S4 · Because TR-13's headline action (rule removal) is a no-op and the Rollins order is only proposed and non-binding on Meridian, **no document-level finding should be material** purely from TR-13 alone — the correct output across all employment/acquisitions stacks is "not affected" or "monitor only" for this trigger, distinguishing it sharply from TR-10/11/12 which do change enforceability.
  - Docs: representative sample — `employment/templates/form_technician-employment-agreement_washington_rev-2019.md`, `employment/templates/form_technician-employment-agreement_illinois_rev-2021.md`, `employment/templates/form_technician-employment-agreement_texas_rev-2023.md`, `acquisitions/ACQ-03-*`
  - Inputs: as-of 2026-10-01
  - Expected: not affected (federal rule vacated/no-op) / at most a "monitor" watch item for the Rollins enforcement-posture signal
  - Realism: this is the plan's most important **dangerous "false material" test** — a subagent should not manufacture urgency from a headline-sounding FTC trigger when the substance is null.

- **TR13-S4-03** · S4 · Nadia Castellano's CA offer letter/PIIA (2024-05-06) carries three restrictive covenants, resolved per `legal-questions.md` Q2 — **not affected by TR-13** for all three (the FTC rule is vacated/no-op and Rollins is only proposed, so TR-13 itself produces no CA finding here), but the underlying CA-law exposure is real and belongs to a different trigger group (**TR-14, CA SB 699/AB 1076** — Package D's scope; SB 699/AB 1076 moved out of the old `TR-90-controls` group into `TR-14-ca-noncompete-sb699-ab1076` per `CHANGES-2026-09-29.md` §E), so this document needs a cross-reference rather than a silent drop:
  - **§10 "Efforts; Duty Not to Compete"** (in-term only — "While I am employed by the Company, I will not … provide services to … any business … which competes") = **decoy / should-not-flag** for §16600 purposes generally: an in-term restraint that CA §16600 doesn't reach (*Techno Lite, Inc. v. Emcod, LLC* (2020)).
  - **§12 "Non-Solicitation of Employees/Consultants"** (post-employment, "for a period of one (1) year thereafter") = **the real finding** — a post-employment employee non-solicit, likely void under §16600 per *AMN Healthcare v. Aya* (2018) and later authority. Signed 2024-05-06, after CA SB 699's 2024-01-01 effective date, so it falls squarely within SB 699's private-right-of-action exposure (TR-14, Package D) — **this is the fact that reclassifies SB 699 from a clean control to a positive trigger** (see Package D's `D-TR90-S1b-01`, which now references TR-14 despite keeping its legacy ID).
  - **§13 "Non-Solicitation of Suppliers/Customers"** (limited to trade-secret/confidential supplier-customer identity) = **decoy / should-not-flag**: the trade-secret-limited carve-out is the recognized exception to §16600.
  - Docs: `employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md` §10, §12, §13 (all ~line 337-357 of ~1,500; low truncation risk per Q2's V6 note)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected by TR-13 itself (no-op trigger); §12's exposure should be surfaced via TR-14/Package D, with a link back to this document — a stage-5 cross-reference test, not a TR-13 finding
  - Verify: none remaining on the decoy/finding/decoy split (settled by Q2); confirm at build time that Package D's TR-14/TR-90 scenarios cite this same §12 span so the two packages don't produce duplicate, differently-worded findings for the same clause
  - Realism: this is the corpus's clearest "right trigger, wrong package" case — a template/list agent that only looks for TR-10..13 outcomes here would correctly say "not affected," but a GC-facing synthesis that doesn't link forward to the SB 699 exposure would miss the one real risk in the document; also a good S5-link case (`compensating_protection`/`cross_reference` type) for a later pass.

- **TR13-S4-02** · S4 · Texas technician noncompete (`TECH_NC_TX` plant) is the one plant explicitly drafted to track a still-fully-permissive state regime (Tex. Bus. & Com. Code §15.50) with no state-law noncompete restriction trigger in this corpus (TX has no TR-1x equivalent) — TR-13's Rollins signal is the *only* trigger in the corpus that could ever touch TX technician noncompetes; useful as the "only relevant trigger for this stack" scope-completeness case.
  - Docs: `employment/templates/form_technician-employment-agreement_texas_rev-2023.md`; TX signed instances e.g. `employment/signed-agreements/quentin-lachance_technician-employment-agreement_tx_2026-04-29.md` (lowest TX earner, $56,160)
  - Inputs: as-of 2026-10-01
  - Expected: not affected today (proposed order only); flagged as the stack most exposed if Rollins-style enforcement expands
  - Verify: confirm no other TR in the corpus covers TX noncompetes — cross-check TR-01/02/03/20/21/90 meta.yaml (none are employment-related) — this is a coverage/gap observation, not a finding per se.

### S5-link (TR-13)

- **TR13-L1** · S5-link · Cross-trigger consistency: TR-13's Rollins signal + TR-10/TR-11's actual statutory changes should be **aggregated** at stage 5 into one "noncompete regime under pressure" narrative for the GC, not reported as four disconnected items — tests stage-5 cross-reference synthesis across triggers within the same domain (noncompete), not just cross-stack within one trigger.
  - Inputs: as-of 2026-10-01 and 2027-07-01 (post-WA-effective)

### LBL (TR-13)

- **TR13-LBL-01** · LBL-urgency · Rollins consent order and CFR rule removal = urgency "no clock" (no deadline, no binding obligation) — contrast with TR-10/TR-12's clock-bearing items; tests the agent's ability to correctly assign "no clock" rather than manufacturing urgency from a headline-sounding federal action.

- **TR13-LBL-02** · LBL-materiality · Both TR-13 versions = "not material" as applied to Meridian directly today (no test fires: no cost shift, no right created/removed, no compliance risk triggered by the CFR housekeeping change; the Rollins order is against a different company) — dangerous-confusion check: gold expects NOT material, and a false "material" here is exactly the kind of hidden error the eval design flags as dangerous in the *other* direction (over-flagging, wasting GC attention) even though the north-star dangerous-confusion list focuses on under-flagging.

---

## Cross-trigger observations

- **Lease radius look-alike (not a noncompete):** `corporate/lease_dallas-branch-and-showroom_2022-10-01.md` (roles: `distractor`, `noncompete_lookalike`, plant `LEASE_RADIUS_DAL`) restricts Meridian itself (as tenant) from opening a *competing showroom* within 3 miles — this is a landlord-tenant radius restriction, structurally similar to a noncompete but governed by ordinary contract law, not TR-10/11/12/13. Should be excluded from all four triggers' relevant-stack sets but is a natural decoy for a scoper keying on "noncompete"-adjacent language.
  - Docs: `corporate/lease_dallas-branch-and-showroom_2022-10-01.md` §Radius Restriction
  - Inputs: as-of 2026-10-01
  - Expected: not affected by any of TR-10/11/12/13 (excluded from scope, reason "radius restriction between landlord/tenant, not an employee or sale-of-business noncompete")
  - Plants: `LEASE_RADIUS_DAL`

- **Vendor/customer no-hire clauses (B2B, not employee noncompete):**
  - `NDA_NOHIRE` — `vendors/summit-valley-plumbing-rooter-inc_mutual-nondisclosure-agreement_2026-05-18.md` §"No Hire" (18-month no-hire between Meridian and a counterparty post-NDA, active, expiry 2029-05-18)
  - `NOHIRE_OAKRIDGE` — `customers/oakridge-hospitality-group_master-services-agreement_2020-09-15.md` (12-month mutual no-hire between Meridian and hotel-group customer, with a 50%-of-annualized-compensation liquidated-damages remedy)
  - Both are B2B non-solicitation-of-personnel clauses; relevant only as **look-alikes to prune** from TR-10/11/12/13's employee-noncompete scope, and potentially relevant to a hypothetical antitrust/no-poach trigger not present in this corpus (gap, see below).
  - Inputs: as-of 2026-10-01
  - Expected: excluded from TR-10/11/12/13 scope with reason "B2B no-hire between businesses, not an employee restrictive covenant"

- **Three now-expired vendor NDAs — no-hire clauses do not survive because none existed.** Per `CHANGES-2026-09-29.md` §A2, three vendor NDAs from the same `VEN-NDA-FORM` template family are now **expired** at the default as-of date: `vendors/great-plains-copper-tube-inc_mutual-nondisclosure-agreement_2019-08-05.md` (expired 2022-08-05, three-year term), `vendors/fieldflow-software-inc_mutual-nondisclosure-agreement_2021-01-11.md` (expired 2024-01-11), and `vendors/first-harbor-bank-n-a_mutual-nondisclosure-agreement_2021-04-26.md` (expired 2024-04-26). **Checked verbatim: none of the three, nor the base form (`vendors/form_mutual-nondisclosure-agreement_rev-2022.md`), contains a "No Hire" clause at all** — that clause only exists in the *active* Summit Valley instance above (`NDA_NOHIRE`, added 2026-05-18). All three expired NDAs share the same §5 Term/Survival language: a 3-year term after which "the confidentiality obligations set forth herein shall terminate," with only a narrow trade-secret survival clause (§5(b)) continuing past expiry. This is a deliberate decoy for the "now-expired document → check for a surviving no-hire tail" instinct from `legal-questions.md` §C5: the correct answer here is **not** "no-hire clause expired" or "no-hire clause survives in a tail" — it's **there was never a no-hire clause to begin with**, only the ordinary confidentiality/trade-secret survival common to the template family. A shallow scoper that assumes "vendor NDA = has a no-hire clause" (reasoning from the Summit Valley/Oakridge examples above) would misclassify these three.
  - Docs: `vendors/great-plains-copper-tube-inc_mutual-nondisclosure-agreement_2019-08-05.md`, `vendors/fieldflow-software-inc_mutual-nondisclosure-agreement_2021-01-11.md`, `vendors/first-harbor-bank-n-a_mutual-nondisclosure-agreement_2021-04-26.md` — all §5 Term/Survival; contrast `vendors/form_mutual-nondisclosure-agreement_rev-2022.md` (base form, also no no-hire clause) and `vendors/summit-valley-plumbing-rooter-inc_mutual-nondisclosure-agreement_2026-05-18.md` §"No Hire" (the one instance that does add one, and is not expired)
  - Inputs: as-of 2026-10-01
  - Expected: not affected by TR-10/11/12/13 (no employee-restrictive-covenant content at all, expired or not); no surviving no-hire obligation because none was ever created — the only thing surviving expiry is ordinary trade-secret confidentiality, not itself a noncompete/no-hire issue
  - Realism: a good "expired ≠ irrelevant, but also not everything you'd guess survives" companion to the Sunpoint MFN case in `legal-questions.md` §C4 — expiry analysis has to be clause-specific, not template-family-specific.

- **Other now-expired employment document identified this pass:** beyond Talia Ruiz-Montoya's retention bonus agreement (see the updated TR10-S4-02 above), a full sweep of `python3 corpus/status_at.py 2026-10-01` against `employment/**` and `acquisitions/**` found no other newly-expired employment or acquisition document relevant to TR-10..13 (the only other non-active statuses in those two areas are `ACQ-05_pinecrest-legacy-franchise-agreement_trupipe_2019-05-01.md`, `terminated_on_acquisition`, already covered at TR10-S4-07 and in the cross-trigger notes below). All signed technician/manager/seller-noncompete agreements across WA/IL/TX/CA remain `active` at the default as-of date.
  - Inputs: as-of 2026-10-01
  - Verify: re-run `status_at.py` after any future corpus edit to `term`/`expiry_date` fields in `build/specs/terms.yaml`, since this list is a point-in-time check

- **Legacy franchise no-poach (ACQ-05, TruPipe):** `acquisitions/ACQ-05_pinecrest-legacy-franchise-agreement_trupipe_2019-05-01.md` (status `terminated_on_acquisition`, roles include `no_poach`, `l2_link`) — a franchisor-franchisee no-poach clause from before Meridian acquired Pinecrest; terminated on acquisition, so operatively dead. Relevant to S5-link as a **historical/context item** (shows the acquired business's prior restrictive-covenant environment) but must not be cited as a live obligation (V5 operative-text check).
  - Inputs: as-of 2026-10-01
  - Expected: not affected (terminated); available for dev-facing context only

- **Arbitration/class-action waiver (`ARB_CLASS_WAIVER`):** present in the company-wide mutual arbitration agreement form (`employment/templates/form_mutual-arbitration-agreement_2023.md`) — not itself a noncompete, but frequently bundled with restrictive-covenant enforcement litigation (see TR11-S4-03); worth noting as adjacent context for any "how would Meridian enforce/defend a noncompete claim" downstream question, though out of scope for TR-10/11/12/13's substantive change items themselves.
  - Inputs: as-of 2026-10-01
  - Expected: not directly affected by any of TR-10/11/12/13; cross-reference only if a finding discusses enforcement mechanics

---

## Gaps

- **WA/IL current-year earnings thresholds not in corpus.** TR-10's RCW 49.62.020 and TR-11's 820 ILCS 90 earnings thresholds (both inflation-adjusted annually by state agencies) are not quoted with a specific current dollar figure anywhere in the trigger texts I read at meta/overview level (VERIFY at full-text read — the current-text version `2026-09-_rcw-49-62-current-text.txt` may state a 2024-vintage figure only). Without a fixed number, several S4 scenarios (TR10-S4-01) can only be scored as "undeterminable" or require an out-of-corpus fact. Enabling document: either (a) a short addendum/footnote in the trigger text stating the 2026 adjusted figure, or (b) treat this deliberately as an "undeterminable" gold answer and add a labeling scenario for it (already sketched as TR10-LBL-03).
- ~~PA 103-0921 / AB 692 retroactivity language not yet confirmed verbatim.~~ **Resolved 2026-09-29** by `legal-questions.md` Q1, which reads both statutes' text directly: AB 692 is prospective only (settled by the statute's own "on or after January 1, 2026" language); PA 103-0921's most defensible reading is also prospective for the construction-employee void rule (on/after 2025-01-01), with a genuine textual ambiguity for 2022-01-01 → 2024-12-31 that resolves to "needs review," not "void" or "unaffected." TR11-S4-01 and TR12-S4-01 have been updated accordingly; no VERIFY remains on the prospective-vs-retroactive question itself. Residual open items are narrower: each 2022-2024-band IL instance's independent compliance with the pre-existing 2022 IFWA earnings/notice requirements (see TR11-S4-01), and whether any pre-2026 CA training-repayment agreement is later re-signed/amended/extended on or after 2026-01-01 (no such instance exists in the corpus today — see the new gap below).
- **No re-signed/amended-in-2026 CA repayment instance in the corpus.** `legal-questions.md` Q1 flags that a pre-2026 stay-or-pay agreement re-signed, amended, or extended on/after 2026-01-01 would count as a new contract "entered into" and flip to affected under AB 692 — a useful S4/M1 test. Checked `manifest.jsonl` for any `amendment` doc tied to `EMP-TRAIN-CA-2025-09-15` (Sabrina Haverford) or any other pre-cutoff CA repayment instance; none exists. Enabling document: an amendment/renewal instrument for one CA training-repayment agreement, dated on/after 2026-01-01.
- **No TX-specific noncompete-restricting trigger exists in the corpus.** TR13-S4-02 notes TX technician noncompetes (`TECH_NC_TX`) are untouched by any state-law trigger; only the federal Rollins signal (non-binding) could ever reach them. This is a legitimate scope-completeness note, not a corpus defect, but worth flagging so a later reviewer doesn't go looking for a missing TR-1x-TX file.
- **No dedicated antitrust/no-poach trigger for the B2B no-hire clauses.** `NDA_NOHIRE` and `NOHIRE_OAKRIDGE` are good look-alike/decoy material for TR-10/11/12/13 but have no corresponding real trigger in this corpus (e.g., a DOJ/FTC no-poach antitrust guidance change) to test them as true positives elsewhere. If a future package wants a true-positive no-poach scenario, a trigger document would need to be added; noted for the Z-consolidation pass in case another package (A/B/D/E) already covers something adjacent.
- **Franchise agreement full text not read in this pass.** `ACQ-05_pinecrest-legacy-franchise-agreement_trupipe_2019-05-01.md` is a large document (206,523 chars per manifest); I relied on manifest roles/plan_real.yaml notes (`no_poach`, `l2_link`) rather than reading the no-poach clause verbatim. A later pass must pull the exact section/clause number before this becomes a scored scenario.
- **Rollins consent order specifics not read verbatim.** TR13-S1a-02's applies-to fields (industry, worker type, geographic scope of the FTC's theory) are inferred from the meta.yaml summary and trigger filename, not a full-text read of `2026-04-22_ftc-rollins-consent-order-analysis.txt`. Flagged VERIFY.

## Revision 2026-09-29

Applied `CHANGES-2026-09-29.md` and `legal-questions.md` Q1/Q2. No scenario IDs were removed.

- **Changed — TR10-S4-02:** split the Rafael Underhill / Talia Ruiz-Montoya stay-bonus clawback pair; Talia's agreement is now `expired` (2026-02-15, clawback window closed on its own terms before ESHB 1155 takes effect) and resolves to "not affected / moot" at both as-of dates, while Rafael's stays the live 2027-07-01 metamorphic case.
- **Changed — TR11-S4-01:** resolved the pre/post-2025 VERIFY into the three-tier IL band (pre-2022 unaffected, 2022–2024 needs-review, post-2025 void) per `legal-questions.md` Q1; added Nolan Quill and Ingrid Yardley to the enumerated 2022–2024 instances; narrowed the remaining VERIFY to per-instance 2022 IFWA compliance and the role exception.
- **Changed — TR11-S4-02:** legacy GM agreement now cites two independent not-affected grounds (pre-2022 signing + management exception) instead of one VERIFY-gated exclusion.
- **Added — TR11-S4-06:** new scenario for the branch-manager agreement (`EMP-MGR-IL-2022`, 2022-11-01) — falls inside the 2022–2024 date band but is exempt via the management-role exception; contrast case for TR11-S4-01.
- **Changed — TR11-LBL-02:** removed the "undeterminable-pending-verification" framing; materiality now resolves definitely per tier, with "needs review" as its own label for the middle band.
- **Changed — TR12-S4-01:** resolved AB 692's prospective-only scope; Sabrina Haverford's pre-cutoff instance is now a settled should-not-flag decoy rather than an open retroactivity question.
- **Changed — TR12-S4-03:** Castellano relocation clause confirmed not affected on two independent grounds — pre-cutoff signing AND no repayment/clawback condition exists in the text at all (the `relocation_repayment` manifest tag is a naming mismatch).
- **Added — TR13-S4-03:** new scenario cataloguing Castellano's §10 (decoy), §12 (real finding — post-employment employee non-solicit, likely void, the fact that reclassifies TR-90/SB 699 as a positive trigger in Package D), and §13 (decoy) — not affected by TR-13 itself, but needs a cross-reference to Package D's TR-90 scenarios rather than a silent drop.
- **Added — Cross-trigger observations:** new bullet on the three now-expired vendor NDAs (Great Plains, FieldFlow, First Harbor Bank) — confirmed none of them, nor the base NDA form, contains a no-hire clause at all; the only surviving obligation past their 3-year term is ordinary trade-secret confidentiality. New bullet confirming no other employment/acquisition document besides Talia Ruiz-Montoya's newly expired.
- **Gaps:** marked the PA 103-0921/AB 692 retroactivity gap resolved; added a narrower gap for the absent re-signed/amended-in-2026 CA repayment instance.

**Round 2 (2026-09-29): applied `README.md` §5(b) and `legal-questions.md` Q5.**

- **Changed — TR10-S4-05:** reclassified from decoy to a real finding. Gemma Northcott's `CUST_NONSOLICIT` §4.1 ("solicit, divert or accept," 24 months) is a **noncompetition covenant** under both current RCW 49.62.010(4) and post-2027 §(3)(c)/(4) (an "acceptance or transaction of business" clause is expressly *not* a nonsolicitation agreement). As-of 2027-07-01: affected (void regardless of signing date, ESHB 1155 §4(1); notice due 2027-10-01, §4(3)). As-of the default 2026-10-01: pending clock, contingent on Northcott's earnings against the current WA threshold (added Verify). Updated Expected, Realism and Verify.
- **Changed — TR10-S4-03:** resolved the VERIFY. Affected from 2027-06-30 under RCW 49.62.010(3)(d) (forfeiture/repayment sweep); the plant fails all three §(3)(e)(vi) carve-out conditions (24 months from completion vs. 18 from the start date; pro rata over 24, not 18; no good-cause-quit release). Pass = affected or needs review. Before 2027-06-30: not affected.
- **Changed — TR11-S4-04:** resolved the VERIFY. Confirmed decoy — IL's "covenant not to compete" definition requires the clause trigger on the employee's post-termination "competitive activities"; `TRAINING_REPAY` triggers on resignation/for-cause termination regardless. Added a note that IL customer non-solicits *are* covered separately, as a "covenant not to solicit."
- **Changed — TR12-S1a-01, TR12-S3-01, TR12-S4-03:** updated all references to Castellano's relocation-clause manifest tag from `relocation_repayment` to `relocation_allowance`, reflecting the corpus fix in `CHANGES-2026-09-29.md` §E (the tag now matches the clause's actual unconditional, no-repayment text; no scenario outcome changes).
- **Changed — TR13-S4-03:** updated cross-references from "TR-90, Package D" to "TR-14, Package D," reflecting that SB 699/AB 1076 moved out of `TR-90-controls` into the new `TR-14-ca-noncompete-sb699-ab1076` trigger group (`CHANGES-2026-09-29.md` §E); Package D's `D-TR90-S1b-01` keeps its legacy scenario ID but now references TR-14.

STATUS: complete
