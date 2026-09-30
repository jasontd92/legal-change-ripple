# Draft Priority Tiers (Expanded)

**Status: VALIDATED by Jason 2026-09-29** (tiers accepted; Q1–Q4 decided; Q2 = tier 1 in both tariff runs with the two guardrails below). These become the gold tiers for
the stage-5 ranking checks (R1–R3 in `eval-design.md` §5). Written from
judgement ("what would a GC handle first?"), never derived from our sort
policy (the circularity guard). Non-attorney reference.

## Why this file exists

The scenario files had four "tier sketches" (B31, B32, TR10-R1-DRAFT,
TR12-R1-DRAFT). Each assigned a tier to **one** finding. A usable gold needs
**every finding in a scenario run placed into a tier**, because R1–R3 score
the relative order of the whole report:

- **R1:** every tier-1 item above every tier-3 item
- **R2:** every tier-1 item in the top N
- **R3:** no tier-1 item hidden as not material

This file replaces the four sketches with full lists, one per end-to-end
scenario (trigger + as-of date + default profile + no custom prompt).

## Tier definitions


| Tier | Name                     | Test                                                                                                                                                                | What the GC does                                          |
| ---- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1    | **Act now**              | A right is lost or a breach continues if nothing happens within the urgency window (default 30 days), **or** money is leaking now through a live, fixable mechanism | Acts this week: sends notice, disputes, briefs the lender |
| 2    | **Act soon**             | Material and actionable, but no hard deadline inside the window; value erodes or risk grows with delay                                                              | Schedules this month: renegotiate, file, fix a template   |
| 3    | **Monitor / brief**      | Real but not actionable yet (future effective date, missing facts, foreclosed remedy), or only needs a finance briefing                                             | Tracks it; briefs finance; revisits on a date             |
| —    | **Logged, not surfaced** | Not affected or not material (decoys, expired with nothing surviving, out of scope)                                                                                 | Nothing; kept in the audit log                            |


Within a tier, order isn't scored.

---



## Scenario T1: TR-01 (copper §232), as-of 2026-10-01


| Tier | Finding (scenario)                                                                                          | Why this tier                                                                                                                                                        | Would move if…                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1    | **Valley Medical fixed-price auto-renewal** (B03)                                                           | Non-renewal notice due **2026-11-01** (§3.2, 60 days before the 2026-12-31 term end); missing it locks a tariff-blind $486k/yr fixed price through 2027. Forfeitable | Notice already sent → logged                                   |
| 1    | **FCCR covenant breach linked to unrecovered tariff costs** (B15, B23 fan-in)                               | A live Event of Default with the waiver only requested; cross-default and lender-relationship risk. Tops the report regardless of trigger                            | Waiver confirmed granted → tier 2 (monitor the next test date) |
| 1    | **Credit agreement MAE notice duty** (B14)                                                                  | Obligation clock: a >10% tariff-driven cost increase requires lender notice; failing to give it compounds #2                                                         | Cost increase confirmed <10% → logged                          |
| 1    | **Harborview pass-through not re-noticed for 11021/11032** (B05)                                            | The pass-through is forward-only (30-day notice); every day without an updated notice is permanently unrecoverable cost                                              | Updated notice already sent → logged                           |
| 2    | **Northaire one-way ratchet** (A S4-NCS-01, B26; was B31)                                                   | A frozen surcharge despite 11032's rate relief. Quantifiable overpayment and a renegotiation argument, no deadline                                                   | A named renegotiation deadline → tier 1                        |
| 2    | **GPC recurring §232 surcharge** (A S4-GPC-01)                                                              | Recurring cost on every invoice; check it's computed on the current rate/basis                                                                                       | —                                                              |
| 2    | **Lakeshore surcharge on PO** (A S4-LWP-01)                                                                 | Recurring cost exposure; confirm the 4% vs 9% line split is applied correctly                                                                                        | —                                                              |
| 2    | **Harborview lump-sum: post-contract tariffs** (B04)                                                        | Possible recovery: the contract sum only includes tariffs "in effect or announced" by 2025-05-19, and 11021/11032 came later. Needs review, but real money           | A change-order deadline found in the contract → tier 1         |
| 2    | **Bridgewell subcontract: no escalation clause** (B10)                                                      | Full absorption; seek a change order before more copper is bought                                                                                                    | —                                                              |
| 2    | **Cascade Ridge REA filed late** (B11)                                                                      | The 21-day window likely ran (~61 days late). Act soon to preserve waiver / course-of-dealing arguments before a formal rejection                                    | Formal rejection received → tier 3 (write-off briefing)        |
| 2    | **Sunpoint MFN refund claim, 2026-02-17 → 2026-06-30** (B02/B21)                                            | An accrued liability that survives expiry, plus a possibly inaccurate annual certification. No deadline, but quantify and decide on disclosure                       | Cooperative raises it → tier 1                                 |
| 3    | **WA DES "no tariffs approved" absorption** (B07)                                                           | Remedy foreclosed twice; brief finance                                                                                                                               | —                                                              |
| 3    | **San Marcos RSMeans indirect exposure** (B08)                                                              | Real but lagging; size is undeterminable from the documents                                                                                                          | —                                                              |
| 3    | **Titan Peak firm price** (B12)                                                                             | Relief only through the Owner's prime contract (not in the corpus)                                                                                                   | Owner recovery found → tier 2                                  |
| 3    | **GPC couplings invoice, successor basis** (A S4-GPC-05 / INV-26-1912)                                      | Needs review: depends on the unconfirmed 7412 tier                                                                                                                   | Tier confirmed as mis-billed → tier 1 (like 1911)              |
| —    | Lakemont subcontract (B13)                                                                                  | Expired 2026-08-31; nothing surviving identified                                                                                                                     | —                                                              |
| —    | Crestline MFN (B01), Harborview-to-Crestline no-trigger (B22)                                               | Expired; decoy pair                                                                                                                                                  | —                                                              |
| —    | GPC Metals Adjustment (A S4-GPC-02), old Lakeshore POs (A S4-LWP-02), Delmont exercised quote (A S4-DSC-01) | Decoy / predates the trigger / already exercised                                                                                                                     | —                                                              |
| —    | Utility "tariff" (B16), insurance (B17), leases (B18), vendor/SaaS (B19)                                    | Lexical decoy / out of scope                                                                                                                                         | —                                                              |


---



## Scenario T2: TR-02 (IEEPA / SCOTUS / §122 / refunds), as-of 2026-10-01


| Tier | Finding (scenario)                                                                     | Why this tier                                                                                                                                                                                                   | Would move if…                                              |
| ---- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1    | **GPC §122 overcharge** (A S4-GPC-03, B24; INV-26-1911, dated 2026-08-21)              | The §122 authority expired 2026-07-24 and GPC is still billing it. Money is leaking on every shipment, and the invoice is past its Net-30 date, so this is now a credit claim. Dispute and stop further billing | GPC already corrected it → tier 2 (recover the past amount) |
| 1    | **FCCR covenant breach** (B15; was B32)                                                | As in T1: live default, waiver pending. Appears in both tariff runs because it fans in                                                                                                                          | Waiver granted → tier 2                                     |
| 2    | **Hai Phong IEEPA refund via CAPE** (A S4-HPB-01; the $8,172 line only, per S4-HPB-02) | Meridian is importer of record, so a refund is available. No filing deadline exists in the corpus, so it isn't forfeitable; file promptly                                                                       | A CAPE filing deadline added to the corpus → tier 1         |
| 2    | **Keystone passed IEEPA duties with no refund pass-back** (A S4-KPS-01, B25)           | KPS (likely importer of record) gets the refund; Meridian has no contractual claim. Negotiate a pass-back now, while refunds are flowing                                                                        | —                                                           |
| 3    | **Section 122 surcharge window closed** (TR-02 S1a item)                               | Informational: confirms no new §122 charges should appear                                                                                                                                                       | —                                                           |
| —    | GPC Amendment 2 refund pass-back (A S4-GPC-04)                                         | Likely moot for the TR-02 refund path; exposure only                                                                                                                                                            | —                                                           |
| —    | EO 14389 cited as relief for §232 costs                                                | Cross-trigger decoy: must not appear                                                                                                                                                                            | —                                                           |
| —    | §232 and MFN lines on the Hai Phong entry (A S4-HPB-02)                                | Belong to TR-01, not TR-02                                                                                                                                                                                      | —                                                           |


---



## Scenario T3: TR-10 (WA ESHB 1155), two as-of dates

The WA law is effective **2027-06-30**, with employer notices due
**2027-10-01**. The same findings tier differently depending on the date.
This is the M1 (as-of shift) pair.

### T3a: as-of 2026-10-01 (law enacted, not yet effective)


| Tier | Finding (scenario)                                                                                 | Why this tier                                                                                                                                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2    | **Gemma Northcott "customer non-solicit" is a noncompete** (C TR10-S4-05, flipped)                 | The "solicit, divert **or accept**" clause is a noncompetition covenant under *current* RCW 49.62 too. If her earnings are below the current threshold (VERIFY), it's unenforceable today and asserting it risks penalties. Fix now |
| 3    | **WA technician noncompetes** (C TR10-S4-01, 9 instances incl. Isaac Whitcombe, was TR10-R1-DRAFT) | The template self-disables at or below the current threshold, so it's compliant today. All become void 2027-06-30. Plan the remediation and notices                                                                                 |
| 3    | **Non-owner-signer seller noncompetes** (C TR10-S4-06: Jeffrey Hale ACQ-02, Leah Pemberton ACQ-05) | Void from 2027-06-30 (the sale-of-business exception needs ≥1% ownership). Plan                                                                                                                                                     |
| 3    | **Training repayment, Gavin Ingersoll** (C TR10-S4-03)                                             | Becomes a noncompete under §(3)(d) from 2027-06-30 (fails the §(3)(e)(vi) carve-out). Plan a template fix                                                                                                                           |
| 3    | **Stay-bonus forfeiture** (C TR10-S4-02)                                                           | Forfeiture-for-competition sweep from 2027-06-30                                                                                                                                                                                    |
| —    | Owner seller noncompetes (Alan Mercer ACQ-02; ACQ-05 restrictive covenant)                         | Sale-of-business exception applies                                                                                                                                                                                                  |
| —    | Terminated legacy franchise no-poach (ACQ-05 franchise)                                            | Terminated on acquisition                                                                                                                                                                                                           |




### T3b: as-of 2027-07-01 (law in force)

Every tier-3 item above moves to **tier 1**. The obligation clocks are
running: stop enforcing or representing (§4(2)), and send notices by
**2027-10-01** (§4(3)) to all current and former employees whose covenant is
still in effect. Gemma Northcott stays tier 1. Owner covenants stay logged.

---



## Scenario T4: TR-12 (CA AB 692 stay-or-pay), as-of 2026-10-01


| Tier | Finding (scenario)                                                                          | Why this tier                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Training-repayment template still in use after 2026-01-01** (template + C TR12-S4 series) | Each new agreement signed on the old template is void and unlawful to include. It's an ongoing violation with every hire, so fix the template now |
| 1    | **Delia Kilgore training repayment, signed 2026-02-09** (C TR12-S4, was TR12-R1-DRAFT)      | Void from inception, but relied on as enforceable. Stop any collection or wage deduction; check whether any amount was collected                  |
| —    | Sabrina Haverford training repayment, signed 2025-09-15                                     | Before the cutoff: not affected. Note: don't re-sign or amend it in 2026                                                                          |
| —    | Castellano relocation allowance                                                             | Unconditional; no repayment term (tag corrected)                                                                                                  |


Changed from the draft: TR12-R1-DRAFT had Kilgore at "act soon / tier-1 or
tier-2". I've put her in tier 1 because the template-level issue makes it
recurring, not a one-off.

---



## Scenario T5: TR-14 (CA SB 699 / AB 1076), as-of 2026-10-01


| Tier | Finding                                                                        | Why this tier                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2    | **CA technician template §6.1 employee non-solicit + Castellano §12** (SB 699) | Likely void, and entering into or enforcing it is unlawful (private right of action). Fix the template; don't enforce. No deadline, but the exposure accrues with each new hire |
| 3    | **AB 1076 notice for the 5 pre-2024-02-14 technician instances**               | Needs review: unsettled scope for non-solicits; whether notice was sent is unknown. Brief and confirm                                                                           |
| —    | Castellano §10 (in-term) and §13 / technician §6.2 (trade-secret-limited)      | Decoys                                                                                                                                                                          |


---



## Open questions for Jason

1. **Tier 1 threshold:** is "money leaking now through a fixable mechanism"
  (the Harborview re-notice, the GPC overcharge) tier 1 without a legal
   deadline? It's included above as a judgement call.  
    
  A: Yes, Tier 1
2. **FCCR:** keep it at tier 1 in both tariff runs, or only in the run that
  produced the larger share of unrecovered cost? A: Not sure - expand on the tradoffs here, and impact to the agent optimization throgh evals.

   **[DECIDED 2026-09-29] Tier 1 in both tariff runs, with two guardrails.** Rationale: deterministic, high-confidence rules give predictable optimization signal.
   - *Why not "larger share only":* the gold would depend on an attribution the
     corpus can't support (the compliance certificate's $1,140,000 isn't
     itemized) and on cross-run knowledge the orchestrator never has (no
     history, by design). The eval would penalise behaviour the agent can't
     get right, so hill-climbing would reward confident guessing.
   - *Risk of "both" without guardrails:* the agent learns a shortcut ("always
     top-rank the credit agreement").
   - *Guardrail 1, trigger-specific nexus (deterministic):* the FCCR finding's
     `change_ref` must point to a change item of *that* run's trigger.
     - TR-01: copper §232 costs on fixed-price stacks contributed to the
       shortfall (direction: exposure).
     - TR-02: the §122 surcharge contributed, and the Hai Phong refund and the
       GPC §122 credit are leverage for the pending waiver (direction: both).

     A generic copy of one finding across both runs fails.
   - *Guardrail 2, negative control:* the FCCR finding must **not** appear in
     non-tariff runs (TR-10, 11, 12, 13, 14, 20, 21). Scored as a false
     positive if it does.
   - Dollar attribution stays **undeterminable** in both runs (B23).
3. **TR-14 template fix:** tier 2 here, versus TR-12's template fix at tier
  1. The difference: AB 692's violation is squarely settled by statute,
    ereas the SB 699 non-solicit point rests on case law. Agree? A: Yes
4. Should the stage-5 ranking eval score **T3a vs T3b as a pair**
  (tier-3 → tier-1 flip), as an M1 check? A: Yes

