# WP1 progress (tariff supply, file A + e2e T2)

STATUS: paused (session limit; resuming later)

## Reading done
- BRIEF-common.md, CONVENTIONS.md, HANDOFF.md, README.md (eval-scenarios),
  eval-design.md (all cited sections), system-design.md §5-6, contracts/README.md,
  contracts/schemas/common.schema.json, priority-tiers-draft.md (T1/T2 tables),
  legal-questions.md (Q1-Q8), CHANGES-2026-09-29.md, A-tariff-supply.md (full),
  B-tariff-downstream.md (full).
- Began reading corpus source files for T2 (trigger dir listing done for
  TR-02-ieepa-tariffs-scotus). Have NOT yet opened: GPC MSA Amendment 2 §7(g),
  GPC-INV-26-1911/1912 invoices, Hai Phong supply contract + PO-2025-0618 +
  customs entries MX7-2291846-3/MX7-2304417-9, KPS terms/invoice
  KPS-417-601877, First Harbor Bank credit agreement Amendment 2 + compliance
  certificate, EO 14389 full text, Proc 11012 full text, CBP PRA notice / IEEPA
  refunds page full text.

## Plan (decided, not yet written to gold files)

### e2e/T2_TR02_2026-10-01.yaml (mine)
change_record (stage 1, from A's S1a-TR02-*):
- C1 = S1a-TR02-01 (SCOTUS opinion, Learning Resources v. Trump)
- C2 = S1a-TR02-02 (EO 14389)
- C3 = S1a-TR02-03 (Proc. 11012, §122 surcharge, expired 2026-07-24)
- C4 = S1a-TR02-04/05 (CBP PRA notice + IEEPA duty refunds page, CAPE refund
  mechanics) — may need to split into C4/C5 if the two source docs each need
  their own anchor; decide when writing.
company_gate: proceed (imports_directly=true; Hai Phong direct-import IEEPA
  exposure alone forces proceed).
relevant_stacks (S3-02, supply side): Hai Phong supply contract + customs
  entries + POs; GPC MSA cluster (Amendment 2 §7(g) refund pass-back +
  GPC-INV-26-1911/1912); KPS invoices/terms (cost-only, no refund clause).
pruned_stacks: Lakeshore, Northaire (§232/general "trade policy" basis, not
  IEEPA-specific); Solace (no transactions). Plus B29's downstream pruned set
  (leases, insurance, vendor decoys) — read B29 for the customer/corporate
  side pruning, cite it.
Findings to author (from T2 tier table + brief instructions):
  F1 = GPC §122 overcharge, S4-GPC-03/B24, INV-26-1911, tier 1, sentinel,
       change_ref -> C3 (V13).
  F2 = FCCR covenant breach, B15 (read from B, not yet re-opened for exact
       section numbers/quotes), tier 1, change_ref -> C3 per guardrail-1's
       TR-02 nexus ("the §122 surcharge contributed, and the Hai Phong
       refund and the GPC §122 credit are leverage for the pending waiver"),
       direction: both (not just exposure, per priority-tiers-draft.md Q2
       guardrail 1). MUST NOT appear in non-tariff runs (V14 — not my
       concern here, that's the other WPs' e2e files, but note it in
       rationale).
  F3 = Hai Phong IEEPA refund via CAPE, S4-HPB-01 (hop-complete: PO-2025-0618
       -> Supply Contract IOR clause -> customs entry), sentinel — but per
       brief, isolate the **$8,172 IEEPA line only** on entry
       MX7-2304417-9 (S4-HPB-02's entry, not MX7-2291846-3's $17,650 line —
       tier file explicitly says "$8,172 line only, per S4-HPB-02"). decoy
       within same finding: the $30,645 §232 line + any MFN-rate line on the
       same entry table (S4-HPB-02 decoy folded in). tier 2.
  F4 = Keystone passed IEEPA duties, no refund pass-back, S4-KPS-01/B25,
       tier 2, absence finding (KPS terms §3 has no refund clause).
  F5 = §122 surcharge window closed (S1a-TR02-03 restated as an
       informational finding) — tier 3, "confirms no new §122 charges
       should appear."
  F6 = GPC Amendment 2 refund pass-back, S4-GPC-04 — logged/not material,
       pass_rule not_affected (moot for TR-02 refund path; §232/§122 have
       no CBP drawback).
  F7 (decoy, logged) = EO 14389 cited as relief for §232 costs — cross-
       trigger decoy; pass_rule not_affected; decoy_spans on EO 14389 §1's
       list of terminated EOs (Proc. 11012/§122 and Proc. 10962/11021/11032
       are NOT on that list); attach to the GPC stack since that's where a
       model doing this T2 run might be tempted to over-read relief onto
       the co-located §232 surcharge lines (GPC-INV-26-0877/1402, out of
       T2 scope).
  F8 (decoy, logged) = HPB-02's §232 + MFN lines belong to TR-01, not TR-02
       — likely folded into F3's decoy_spans rather than a standalone
       finding (re-decide when writing; brief lists it as one of the
       "logged decoys" alongside GPC-04 and EO14389, so it may need its own
       row instead — check tier table phrasing again: it IS a separate
       tier-table row "— | §232 and MFN lines on the Hai Phong entry
       (A S4-HPB-02) | Belong to TR-01, not TR-02". Author as its own
       logged/not_affected entry, decoy_spans = the §232 + MFN line items,
       distinct from F3's required_spans.
tiers: {1: [F1,F2], 2: [F3,F4], 3: [F5], logged: [F6,F7,F8]}
cross_links: GPC 1911->credit agreement (leverage, per F2 rationale);
  HPB refund -> credit agreement (leverage, per F2 rationale) — both as
  economic_flow type, expected: found.
negative_controls: not applicable here (V14 is scored on non-tariff runs,
  not on T2 itself) — omit or leave empty per schema.

### unit/S4-KPS-03.yaml (mine)
Version-pinned web terms (PO-2025-0231 "Oct 2019" vs PO-2025-0914 "June
2025"). slice: version. confidence: high (control case, no substantive
diff expected per A's own Verify note — must confirm by reading both terms
§3 PRICE before calling it purely version-fidelity).

### unit/S4-NCS-02.yaml (mine)
Version-pinned Northaire terms (07/23/24, 12/10/24, 08/21/26), byte-
identical §33 ratchet. slice: version. confidence: high.

## index-parts/WP1.yaml
Written this pass — see file. Status key:
- WP2-authored (15 ids): S1a-TR01-01..07, S3-01, S4-GPC-01/02/05,
  S4-LWP-01/02, S4-NCS-01 -> status: done, gold_file: e2e/T1_TR01_2026-10-01.yaml,
  notes: "authored by WP2" (per BRIEF-common.md ownership rule; not
  independently verified by me that WP2 has actually written it yet).
- Mine, planned but NOT yet written (12 ids): S1a-TR02-01/02/03/04-05,
  S3-02, S4-HPB-01/02, S4-GPC-03/04, S4-KPS-01, S4-KPS-03, S4-NCS-02 ->
  status: backlog for now (will flip to done once the actual YAML files
  exist and pass spans.py check).
- Backlog / not selected (8 ids): S4-KPS-02, S4-DSC-02, S4-SCP-01,
  LBL-urgency-01/02, LBL-direction-01/02, LBL-materiality-02 -> status:
  backlog (all slices they'd cover are already "good" per README's
  coverage matrix from other packages; my brief's coverage-fill list is
  restricted to absence/template-instance/superseded/version, all already
  >=2 items without these).
- Excluded (1 id): S4-RPS-01 -> status: excluded (REMOVED from A;
  supplier deleted from profile.yaml 2026-09-29).
- Excluded from this file entirely per brief (3 ids, WP4's C1_TR03):
  S1a-TR03-01, S3-03, LBL-materiality-01 (this last one is my own judgment
  call — it's not literally named in the brief's exclusion list, but its
  entire content is TR-03-specific ("any other TR-03 scenario" catch-all);
  flagged in final report for WP4/WP6 to confirm they pick it up).

## Corpus defects found
- None yet — haven't re-opened the actual documents this pass (only
  A/B scenario-file prose, not primary corpus text, for the T2 items).
  MUST verify GPC-INV-26-1911/1912 exact quotes, HPB entry MX7-2304417-9's
  exact $8,172/$30,645 line text, KPS §3 text, and the credit agreement
  sections before writing final gold — do not treat A/B's prose summaries
  as verified quotes.

## Remaining
1. Read the actual corpus documents listed above (not yet opened this
   pass) and confirm every quote/date/dollar figure before writing gold.
2. Write eval-scenarios/answer-keys/e2e/T2_TR02_2026-10-01.yaml per the
   plan above (header first, then change_record, company_gate,
   relevant_stacks/pruned_stacks, findings F1-F8, cross_links, tiers).
3. Write eval-scenarios/answer-keys/unit/S4-KPS-03.yaml and
   eval-scenarios/answer-keys/unit/S4-NCS-02.yaml.
4. Run `python3 eval-scenarios/answer-keys/tools/spans.py fill <file>` then
   `check` on all three new files until 0 errors.
5. Flip the corresponding index-parts/WP1.yaml rows from backlog to done,
   with gold_ref/slice/confidence filled in.
6. Decide F2 (FCCR)'s exact change_ref and required_spans once the credit
   agreement / compliance certificate sections are re-read (V13 guard).
7. Decide whether F8 (HPB-02 decoy) is a standalone finding or folded into
   F3 — re-read the tier table phrasing once more when writing.
8. If any fact can't be verified cleanly from the corpus, mark that item
   abstain_only or swap in a backlog substitute, and record why.
9. No `## Gold notes` appended to A-tariff-supply.md yet — only append if
   research contradicts the scenario file; none found so far.
10. Final `spans.py check` across all WP1 files; update this file to
    STATUS: complete when done.
