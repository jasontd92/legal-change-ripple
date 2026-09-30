# Package A: Tariff Triggers (TR-01, TR-02, TR-03) + Supply-Area Findings

Scope per `PLAN.md`: trigger-side evals (S1a) for TR-01/TR-02/TR-03, including
distractor and status-test cases; S4 per-stack scenarios for the supply area
(`corpus/documents/supply/**`); S3 gold/pruned relevant-stack sets; LBL
label-set scenarios on supply findings. Customers, subcontracts, corporate,
vendors are Package B. Cross-cutting metamorphic work is Package E.

Format follows `PLAN.md` "Shared brief" scenario entry format. Eval ids:
S1a, S3, S4, LBL-<set>.

As-of default: 2026-10-01 (`corpus/company/profile.yaml`) unless a scenario
overrides it. Profile default: Meridian Mechanical Group, Inc. (Meridian
Plumbing, Heating & Air), Delaware corp, CA/WA/IL/TX, NAICS 238220, imports
directly (small share, CIF Long Beach, importer of record for that share).

Suppliers (from `corpus/company/profile.yaml`):
- SUP-GPC Great Plains Copper Tube, Inc. — copper tube mill, direct MSA, OK
- SUP-KPS Keystone Plumbing Supply, LLC — national plumbing distributor, web terms, implicit pass-through, VA
- SUP-LWP Lakeshore Waterworks & PVF, LP — waterworks/PVF distributor, web terms, tariff clause added Feb 2025, MO
- SUP-NCS Northaire Comfort Systems Corporation — HVAC equipment mfr, versioned terms, one-way ratchet, FL
- SUP-DSC Delmont Supply Company — plumbing/HVAC distributor, job-quote price protection, PA
- SUP-SCP Solace Comfort Products, Inc. — HVAC equipment, duties paid by buyer, TX
- SUP-HPB Hai Phong Precision Brass Co., Ltd. — direct-import fittings, CIF, Company is importer of record, Vietnam

Note: Riverside Pipe & Supply Co. (formerly SUP-RPS), Clearpath, and FleetCard
have been **removed from `corpus/company/profile.yaml` entirely** (2026-09-29
corpus change) — they had no documents. Northbrook Commons Condominium
Association (CUS-NBC) and residential customers (CUS-RES, "Meridian Comfort
Club" members) were added as counterparties; both are customer-side (Package
B), not suppliers.

---

## TR-01: Section 232 Copper

Versions: EO 14220 (2025-02-25, investigation only, no duties) -> Proclamation
10962 (2025-07-30/effective 2025-08-01, 50% ad valorem on copper content of
semi-finished copper products and intensive copper derivative products,
Annex covers HTS 7406-7419 incl. 7411 copper tube/pipe, 7412 fittings,
7418.20 sanitary ware; NOT 8481 valves, 8419 water heaters, 8415 A/C per
meta.yaml annex note) -> CBP CSMS #65794272 (2025-07-31, guidance: HTSUS
9903.78.01 = 50% on copper-content value, 9903.78.02 = 0% on non-copper
content; two-line entry reporting; no drawback; FTZ privileged-foreign
status) -> Proclamation 11021 (2026-04-02/effective 2026-04-06, joint
Al/Steel/Copper action: clause (1) switches the dutiable base from
copper-content-only to **full customs value of the imported product,
regardless of metal content** for all three metals; clause (2) sets 50% for
Annex I-A articles (most copper articles) unless UK (25%) or US-smelted/cast
copper content (10%); clause (3) sets 25% for Annex I-B copper articles,
similar carve-outs) -> Proclamation 11032 (2026-06-01/effective 2026-06-08,
further adjustment). Distractors: Proclamation 11045 (aluminum only,
2026-07-20) and DPA critical-minerals determination (2026-07-30) — both
copper-adjacent by domain but not copper-pipe/tariff-rate changes.

### S1a scenarios

- **S1a-TR01-01** · S1a · EO 14220 orders a Section-232 *investigation* into
  copper imports; no duty is imposed. Status-test case: contemplated action,
  not yet adopted.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-02-25_eo-14220-investigation.txt` — Sec. 2 "Investigation Into the National Security Impact of Copper Imports"; Sec. 3(b) 270-day report deadline
  - Docs: none (pre-duty; nothing to scope yet)
  - Inputs: as-of 2025-03-01 (near issuance); profile default; custom prompt none
  - Expected: legal_status = proposed/investigation-only; company-level gate = proceed but no stack findings (no operative duty)
  - Verify: 270-day reporting deadline computed from 2025-02-25 (~2025-11-22)
  - Realism: none

- **S1a-TR01-02** · S1a · Proclamation 10962 imposes the first operative
  copper duty: 50% ad valorem on the *copper content* of semi-finished copper
  products and intensive copper derivative products, effective 2025-08-01.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` — clause (1) (50% rate, effective date), clause (10) ("No drawback"); scope now machine-readable at `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt` (transcribed + visually verified full HTS list, per CHANGES-2026-09-29.md §A1)
  - Docs: none at trigger-stage; feeds S3/S4 below
  - Inputs: as-of 2025-08-15; profile default; custom prompt none
  - Expected: legal_status = in force; applies_to (structured) = {hts: [7406–7419 incl. 7411.10/7411.21-29 copper tube/pipe, 7412.10/7412.20 fittings, 7418.10/7418.20 sanitary ware, 8544.42/8544.49 insulated conductors], entity_type: importer of record, dutiable_basis: copper content only}; explicitly NOT covered: 7403 cathode/unwrought copper, 7404 scrap, 8481 valves, 8419 water heaters, 8415/8418 A/C and heat pumps
  - Verify: the HTS list is now confirmed via the scope-derived note (no longer UNVERIFIED for 10962 — resolved by CHANGES-2026-09-29.md §A1); a later agent should still cite the scope note (not the raw proclamation text, which carries the Annex only as images) as the source for any HTS-level claim
  - Realism: the Annex itself remains image-only in the raw FR text (`meta.yaml` note); the scope note is a derived/transcribed artifact, not the primary source — a strict V7/grounding check should still expect a citation to the scope note file, not a fabricated read of the image annex.

- **S1a-TR01-03** · S1a · CBP CSMS #65794272 operationalizes Proc. 10962:
  splits reporting into HTSUS 9903.78.01 (50% on copper-content value) vs
  9903.78.02 (0% on non-copper content), two-line entry filing, no drawback,
  FTZ privileged-foreign status.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-31_cbp-csms-65794272.txt` — "Reporting Instructions for Applying Duties Based on Copper Content", "DRAWBACK", "FOREIGN TRADE ZONE"
  - Docs: none at trigger-stage
  - Inputs: as-of 2025-08-15; profile default; custom prompt none
  - Expected: legal_status = guidance (implements 10962, not itself a change in duty); who-it-applies-to = importers/brokers filing HTSUS 9903.78.01/.02
  - Verify: "no drawback" language is verbatim identical to Proc. 10962 clause (10)
  - Realism: none

- **S1a-TR01-04** · S1a · Version pair 10962 → 11021: Proc. 11021 (eff.
  2026-04-06) changes the **dutiable base** from copper-content-only to
  **full customs value of the imported product, regardless of metal
  content** (clause (1)), and restructures rates into Annex I-A (50%, most
  copper articles) and Annex I-B (25%), with a 10% carve-out for articles
  whose copper content is entirely US-smelted-and-cast (clauses (2)-(3)).
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt` — clause (1) (base change), clause (2)(a)-(c), clause (3)(a)-(c); change source: diff against `2025-07-30_proclamation-10962.txt` clause (1); scope now partially machine-readable at `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt` (OCR of the Annex images, items it couldn't read marked UNVERIFIED)
  - Docs: none at trigger-stage; downstream effect is that CSMS #65794272's two-line copper-content-only reporting method is superseded for goods entered on/after 2026-04-06
  - Inputs: as-of 2026-04-10; profile default; custom prompt none
  - Expected: substantive change item (base broadened + rate restructure); effective 2026-04-06; supersedes the copper-content-only basis in the CSMS guidance (V5-relevant: CSMS text becomes non-operative computation method after this date); copper tube/pipe (HTS 7411) confirmed on Annex I-A (50%) per OCR of the annex pages
  - Verify: fittings (HTS 7412) Annex placement (I-A vs I-B) is explicitly **UNVERIFIED** per the OCR scope note ("Copper tube or pipe fittings (7412) annex placement (I-A vs I-B): UNVERIFIED") — the annotator's OCR pass could not resolve this; a gold answer must not assert a specific rate for 7412 fittings under 11021 without flagging this
  - Realism: same annex-image limitation as TR01-02 (mitigated here only by an OCR pass, which itself has confirmed gaps); also the proclamation covers aluminum/steel/copper jointly, so an agent must isolate the copper-specific clauses without misreading aluminum/steel-only provisions as copper changes.

- **S1a-TR01-05** · S1a · Version pair 11021 → 11032: Proc. 11032 (eff.
  2026-06-08) (a) expands the temporarily-reduced 15% category to include
  "certain heating, ventilation, and air conditioning (HVAC) systems and
  components that are predominantly for residential use" (¶7), and (b)
  loosens the "entirely" domestic-content threshold for the 10% carve-out
  from 95% to 85% (¶10).
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamation-11032.txt` — ¶7 (HVAC inclusion), ¶10 (95%→85% threshold), clause (2) (Annex I-C 25% rate); change source: diff against `2026-04-02_proclamation-11021.txt`; scope note: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt`
  - Docs: candidate downstream stacks — `corpus/documents/supply/**` clusters for SUP-NCS (Northaire Comfort Systems, HVAC equipment mfr) and SUP-SCP (Solace Comfort Products, HVAC equipment, duties paid by buyer); see S4 below
  - Inputs: as-of 2026-06-15; profile default; custom prompt none
  - Expected: substantive change item, directly on-point for Meridian (HVAC condensers/furnaces/heat pumps/air handlers are named `main_inputs` in profile); effective 2026-06-08; direction = likely cost relief (15% vs higher Annex rate) for qualifying residential HVAC; 85% domestic-content threshold change is confirmed (proclamation text, not annex-dependent)
  - Verify: the specific HTS codes moved into Annex I-C for "certain HVAC systems and components that are predominantly for residential use" are explicitly **UNVERIFIED** per the scope note — the OCR pass of the Annex I-C pages found only steel-derivative codes, not the HVAC codes the proclamation text describes; a gold answer must flag that it cannot confirm which of Meridian's specific HVAC purchases (from Northaire/Solace) qualify for the 15% tier without this list
  - Realism: still the strongest "direct hit" trigger-to-company link in TR-01, but the eligibility test itself (which HVAC HTS codes actually got the rate cut) remains an open, corpus-acknowledged gap rather than a solved fact — a careful agent should say "likely relief, exact scope unconfirmed," not assert the 15% rate applies to a named SKU.

- **S1a-TR01-06** · S1a · Distractor: Proclamation 11045 (2026-07-20) is
  "Further Strengthening Actions ... Aluminum" — aluminum-only, no copper
  content. Should-not-flag / noise item for a copper-tariff monitor.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-07-20_proclamation-11045-aluminum-DISTRACTOR.txt` — title page
  - Docs: none
  - Inputs: as-of 2026-07-25; profile default; custom prompt none
  - Expected: dismissed as noise (out of scope: aluminum, not copper); no ChangeRecord item for copper-tube supply stacks
  - Plants: distractor: true (per `meta.yaml`)
  - Verify: confirm no copper-derivative clause is smuggled into 11045's text (title-only check may be insufficient — a subagent that skims only the caption could either correctly dismiss or, worse, wrongly flag due to "Section 232" pattern-matching)
  - Realism: none

- **S1a-TR01-07** · S1a · Distractor: DPA critical-minerals Presidential
  Determination (2026-07-30) is a recoverability/critical-minerals mining
  policy document (Defense Production Act §101), not a tariff-rate or
  HTS-scope change. Should-not-flag / noise item.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-07-30_dpa-critical-minerals-DISTRACTOR.txt` — title/heading
  - Docs: none
  - Inputs: as-of 2026-08-05; profile default; custom prompt none
  - Expected: dismissed as noise (different authority/DPA §101, not a duty action); no ChangeRecord item
  - Plants: distractor: true (per `meta.yaml`)
  - Verify: none beyond confirming no duty/HTS text appears
  - Realism: none

---

## TR-02: IEEPA / SCOTUS / Refunds / §122

Versions: *Learning Resources, Inc. v. Trump*, 607 U.S. 229 (2026) — SCOTUS
holds IEEPA does not authorize the President to impose tariffs; judgment
vacated/remanded (2026-02-20) → EO 14389 (2026-02-20/effective 2026-02-24)
ends collection of IEEPA-based ad valorem duties imposed under EO 14193,
14194, 14195, 14245, 14257 (reciprocal tariff), 14323, 14329, 14380, 14382 —
**expressly does not touch Section 232 duties** (copper/steel/aluminum) or
non-duty actions under those emergencies → Proclamation 11012 (Section 122
surcharge, 2026-02-20/effective 2026-02-24) imposes a 150-day, 10% ad
valorem bridge surcharge on nearly all imports, **expired 2026-07-24** per
`meta.yaml` → CBP PRA notice (2026-07-08) and CBP IEEPA Duty Refunds page
(2026-09-02) describe the CAPE refund mechanism: refunds go to the
**Importer of Record (IOR)**, consolidated via CAPE Declaration, 60–90 days
after acceptance; Phase 1 = unliquidated entries / entries within 80 days of
liquidation; Phase 2 = reconciliation-flagged entries.

### S1a scenarios

- **S1a-TR02-01** · S1a · SCOTUS holding: IEEPA does not authorize tariffs;
  judgment vacated and remanded. This is the root legal event, not itself an
  HTS/duty-rate change.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_learning-resources-v-trump-opinion.txt` — "Held:" syllabus (~line 73); disposition "It is so ordered." (~line 1150)
  - Docs: none directly (implementation is via EO 14389/Proc. 11012, below)
  - Inputs: as-of 2026-02-21; profile default; custom prompt none
  - Expected: legal_status = decided (challenged/overturning prior IEEPA tariff actions); change item logged but marked "implementation pending" until EO 14389
  - Verify: the opinion is 351,971 chars — confirm the agent's read covers the full holding, not just headnote text (V6-style coverage risk noted as a gap, not an eval here)
  - Realism: a 350k-char SCOTUS opinion is unusually long for a stage-1 "understand the change" read; flagged in Gaps.

- **S1a-TR02-02** · S1a · EO 14389 implements the SCOTUS holding: terminates
  collection of IEEPA duties under nine named EOs (14193/94/95, 14245,
  14257, 14323, 14329, 14380, 14382), effective 2026-02-24, but **explicitly
  preserves** all non-IEEPA-duty actions and the underlying national
  emergencies. Section 232 (copper, TR-01) is a different statutory basis
  and is untouched.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_eo-14389-ending-ieepa-tariffs.txt` — Sec. 1 (list of terminated EOs + carve-out language "shall not be affected by this order"), Sec. 2(a) (implementation, "as soon as practicable")
  - Docs: none directly; cross-trigger boundary test for TR-01 stacks (should NOT be marked affected by EO 14389)
  - Inputs: as-of 2026-03-01; profile default; custom prompt none
  - Expected: legal_status = in force; applies_to = importer of record on entries under the nine named IEEPA EOs; TR-01 (Section 232 copper) findings must NOT cite EO 14389 as a basis for relief — negative/decoy cross-trigger check
  - Verify: exact effective date/time (2026-02-24) vs SCOTUS decision date (2026-02-20)
  - Realism: none

- **S1a-TR02-03** · S1a · Proclamation 11012 imposes a temporary Section 122
  bridge surcharge: 10% ad valorem, nearly all countries, for 150 days from
  2026-02-24 — i.e., **expired 2026-07-24** per `meta.yaml`. Status-test /
  expired-document case.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_proclamation-11012-section-122-surcharge.txt` — "I impose, for a period of 150 days, a temporary import surcharge of 10 percent ad valorem ... effective February 24, 2026" (~line 259-262)
  - Docs: any supply stack whose PO/quote/invoice dates fall between 2026-02-24 and 2026-07-24 could cite this surcharge; entries after 2026-07-24 must not
  - Inputs: as-of 2026-10-01 (default); profile default; custom prompt none
  - Expected: legal_status = expired as of as-of date; a finding that cites Proc. 11012 as currently operative on the default as-of date is a V5 violation (operative-text check)
  - Plants: pairs with M1 (as-of shift) in Package E — rerunning with as-of inside the 150-day window should flip the status to "in force"
  - Verify: exact 150-day expiry arithmetic (2026-02-24 + 150 days = 2026-07-24, per `meta.yaml` `expires` field)
  - Realism: none

- **S1a-TR02-04/05** · S1a · CBP refund mechanics (PRA notice + duty-refunds
  page): refunds of IEEPA duties are consolidated and paid to the
  **Importer of Record**, via CAPE Declaration, generally 60–90 days after
  acceptance; Phase 1 = unliquidated entries / within 80 days of liquidation.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-07-08_cbp-ieepa-refunds-pra-notice.txt` — "refund for a given importer" / IOR refund language (~line 182-203); `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt` — "Phase 1: certain unliquidated entries..." (~line 168), "generally issued within 60-90 days" (~line 179)
  - Docs: relevant only to stacks where **Meridian itself is the importer of record** — per `corpus/company/profile.yaml` purchasing.imports_directly=true, direct_import_share=0.06 — i.e., SUP-HPB (Hai Phong Precision Brass, CIF, Company is IOR); NOT relevant to domestic-distributor pass-through suppliers (SUP-KPS, SUP-LWP, SUP-DSC, etc.) where the supplier/broker, not Meridian, is IOR
  - Inputs: as-of 2026-09-15; profile default; custom prompt none
  - Expected: direction = recovery opportunity, scoped narrowly to the ~6% direct-import share; a finding that treats all copper/HVAC cost increases as IEEPA-refundable (rather than only the direct-import IEEPA-duty-bearing entries) is a false positive
  - Verify: whether Hai Phong Precision Brass's product (fittings, HTS likely 7412) was ever subject to an IEEPA-basis duty (reciprocal tariff / country IEEPA EOs) as opposed to only Section 232 copper duty (10962/11021/11032), since only IEEPA duties are CAPE-refund-eligible — Section 232 duties are explicitly "no drawback" (10962 cl. 10) and NOT part of this refund program
  - Realism: this is a sharp, easy-to-miss decoy: an agent could conflate "tariff refund" language generally and claim Section 232 copper duties are refundable through CAPE, which they are not. Strong candidate for a decoy/precision-slice scenario in S4 below.

---

## TR-03: AD/CVD Copper Pipe (Mexico)

Single version so far: Commerce's preliminary results of the administrative
review of the AD order on seamless refined copper pipe/tube from Mexico
(2026-09-21, **preliminary**, not final). Mandatory respondent Nacional de
Cobre, S.A. de C.V. ("Cobre") gets a 56.43% AFA margin for failure to
cooperate; the "all-others" cash-deposit rate continues at 26.03% (from the
original LTFV investigation) until final results are published and new cash
deposit rates take effect. Scope: "copper pipe from Mexico" (seamless
refined copper pipe and tube).

**TR-03 is now declared a control in `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/meta.yaml`**
(`role: control`), per CHANGES-2026-09-29.md §A6: "No corpus document
specifies Mexican-origin copper pipe or tube, and Meridian imports directly
only from Vietnam. Expected result: no direct exposure; at most a monitor
note that distributors pricing at time of shipment (Keystone, Lakeshore)
could pass through any duty change." This resolves the prior A/B scope
conflict — **TR-03's relevant-stack set is authoritatively empty**, not
merely inferred by this package's absence-of-evidence reasoning.

### S1a scenarios

- **S1a-TR03-01** · S1a · Preliminary AFA margin for Cobre (56.43%) and
  continuing all-others rate (26.03%); status = **preliminary**, cash
  deposit rates only take effect on publication of the **final** results —
  status-test case (contemplated rate change, not yet operative for cash
  deposit purposes).
  - Trigger: `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/2026-09-21_preliminary-results.txt` — "Preliminary Results" table (Cobre 56.43%); "Cash Deposit Instructions" (¶ "The following deposit requirements will be effective for all shipments ... on or after the publication date of the final results"); `meta.yaml` — `role: control`, `expected_relevance` note
  - Docs: candidate — any supply stack sourcing copper pipe/tube from a Mexican producer/exporter; based on `corpus/company/profile.yaml` counterparties (now 7, after Riverside/Clearpath/FleetCard removal), none is explicitly Mexico-origin copper pipe (Great Plains Copper Tube is OK/US; Hai Phong is Vietnam/brass fittings) — this is now a **confirmed control case** per `meta.yaml`, not merely a pending-confirmation absence case (see S4/S3 below)
  - Inputs: as-of 2026-09-25; profile default; custom prompt none
  - Expected: legal_status = preliminary; effective/operative date = none yet (deposit rate change effective only at final results, a future/undetermined date); "who it applies to" (structured) = {hts: copper pipe/tube (unspecified in this notice — full scope description is in the incorporated-by-reference Preliminary Decision Memorandum, not in this file), country_of_origin: Mexico, entity_type: importer of record of subject merchandise}; company-level result = no direct exposure; at most a monitor note for distributors who price at time of shipment (Keystone, Lakeshore), per `meta.yaml` `expected_relevance`
  - Verify: full HTS scope is NOT in this document — it defers to "the Preliminary Decision Memorandum" (external, not in corpus). This is a genuine absence-of-scope-detail case, not an agent miss.
  - Realism: the notice's 14-day case-brief / hearing-request deadlines (¶ "Public Comment") are procedural deadlines for *parties to the AD proceeding* (i.e., domestic producers, respondent, etc.), not compliance deadlines for a downstream buyer like Meridian. An agent surfacing these as "urgent deadlines" for the GC would be a materiality/urgency mislabel — good should-not-flag nuance within an otherwise-relevant trigger.

---

## Supply-area corpus map (for S3/S4/LBL)

Confirmed by reading `corpus/documents/supply/**` and cross-checking
`corpus/manifest.jsonl` (`"area": "supply"`, 58 entries):

| Stack | Key docs | Planted features | Notes |
|---|---|---|---|
| Great Plains Copper Tube (SUP-GPC) | MSA (2019-11-01) + Exhibit B metals adjustment (COMEX-indexed) + Amendment 1 (pricing/term, 2022-04-01, thru 2027-10-31) + Amendment 2 (tariff surcharge, 2026-03-02) + Exhibit A price list; invoices GPC-INV-26-0877/1402/1911/1912; POs PO-2025-0112/0588, PO-2026-0204/0461/0693/0788 | `tariff_surcharge` (2 invoices); `surcharge_after_section122_expiry` (GPC-INV-26-1911); `ambiguous_surcharge_possible_s232_successor_needs_review` (GPC-INV-26-1912) | Amendment 2 §7(g) ties "Tariff Charges" to Proc. 11012 (§122) *and* successor/replacement duties incl. §232; refund pass-back clause to Buyer pro-rata. **2026-09-29 corpus change:** PO-2026-0693 now splits across two invoices — GPC-INV-26-1911 (copper tube only, from imported cathode HTS 7403.11, not §232-covered) and GPC-INV-26-1912 (copper press couplings, HTS 7412.10, §232-covered) — resolving the prior single-invoice ambiguity into a clean overcharge (1911) vs. a genuine needs-review case (1912); see S4-GPC-03/05 below. |
| Hai Phong Precision Brass (SUP-HPB) | Supply Contract (2023-05-15, CIF Long Beach, Buyer = IOR); POs PO-2025-0215/0618/1027, PO-2026-0409; customs entries MX7-2291846-3 (2025-07-28), MX7-2304417-9 (2025-12-15) | `meridian_is_ior_ieepa_refund_eligible` (both customs entries) | Only direct-import stack; Meridian is IOR of record (IOR No. 84-3317265) |
| Keystone Plumbing Supply (SUP-KPS) | Commercial Credit Account Agreement (2016-02-08, "terms as in effect on date of shipment"); web terms 2019-10-22 (superseded) / 2025-06-08 (active); invoices KPS-417-558210/601877; POs PO-2024-1130, PO-2025-0231/0419/0703/0914, PO-2026-0118 | `ieepa_duty_passthrough_no_refund_clause` (2 invoices); `KPS_ACCOUNT_TERMS` | §3 PRICE (both versions): duties passed through, no refund-sharing mechanism |
| Lakeshore Waterworks & PVF (SUP-LWP) | Web terms 2018-09-17 (superseded, no tariff clause) / 2025-02-04 "Rev 020425" (active, adds tariff clause); price-increase notice 2025-03-10; POs PO-2024-0822/1207 (cite Rev 091718), PO-2025-0506, PO-2026-0322 (cite Rev 020425) | none listed in manifest, but notice text is a strong plant-like signal | Notice cites both IEEPA and §232 as bases for a blended 9%/4% increase across copper tube, brass valves, ductile fittings |
| Northaire Comfort Systems (SUP-NCS) | Authorized Dealer Agreement (2020-01-15, no tariff clause); web terms 2024-07-23 / 2024-12-10 (superseded) / 2026-08-21 (active), all with identical §33 "not subject to decrease" ratchet; tariff-price-adjustment notice 2025-01-06; dealer bulletin DB-2026-11 (2026-06-15); POs PO-2024-1016, PO-2025-0307/0822, PO-2026-0715 | `ratchet_after_tariff_decrease` (dealer bulletin) | §33 ties price to tariffs/trade policy AND to a PPI index (HVAC/refrigeration equipment, PCU33341-33341); one-way ratchet is contractual, present in every version |
| Solace Comfort Products (SUP-SCP) | Terms of Sale (2025-11-01) only — §5 Taxes/Other Charges makes Buyer responsible for duties | none | **No PO, quote, or invoice exists for Solace anywhere in the corpus** — terms-only stack |
| Delmont Supply (SUP-DSC) | Web terms 2019-09-20 / 2024-04-04 (superseded) / 2025-01-29 (active); job quotes Q-2025-45122 (2025-02-18, 45-day protection to 2025-04-04) and Q-2025-44710 (2025-05-28, 60-day protection to 2025-07-27); POs PO-2025-0402 (within window), PO-2025-0611 (within window), PO-2025-0827 (2025-08-29, **after** Q-2025-44710's window closed) | `price_protection_expiry:2025-07-27`, `price_protection_expiry:2025-04-04` | PO-2025-0827 cites an already-expired quote for pricing. **Both quotes now carry `status_at_as_of: expired`** at the 2026-10-01 default (manifest IDs `SUP-DSC-Q-2025-44710`, `SUP-DSC-Q-2025-45122`) — see S4-DSC-01/02 for the "accrued right vs. not affected (expired)" framing per CHANGES-2026-09-29.md §C5. |

### S3 scenarios: gold relevant-stack sets and pruning (supply area)

- **S3-01** · S3 · TR-01 (copper §232, any version 10962/11021/11032) gold
  relevant-stack set within supply: {GPC MSA cluster, Hai Phong supply
  contract + customs entries + POs, Lakeshore web-terms cluster + notice +
  POs, Northaire web-terms cluster + notices + POs, KPS invoices/POs
  (copper-tube and fitting lines only, not the valve/water-heater lines)}.
  Pruned: Solace (terms-only, no transaction ever realized a copper/HVAC
  duty).
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt` (representative version)
  - Docs: see corpus map above
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: 5 stacks in scope, 1 pruned (Solace: no document to analyze despite matching role)
  - Verify: whether Solace's absence of PO/invoice history should itself be logged as a "no transaction, cannot assess exposure" note rather than a silent prune — see LBL and Gaps below
  - Realism: none. **2026-09-29 update:** Riverside Pipe & Supply Co. (formerly SUP-RPS) is no longer in `corpus/company/profile.yaml` at all (removed along with Clearpath and FleetCard, per CHANGES-2026-09-29.md §A3), so it is no longer a candidate to prune — there is nothing in the current profile for a scoping step to consider and reject. S4-RPS-01 below is accordingly REMOVED.

- **S3-02** · S3 · TR-02 (IEEPA/§122/refunds) gold relevant-stack set within
  supply, narrower than TR-01's: only stacks where an entity in the chain
  is, or contractually shares in, an **importer of record** for
  IEEPA-basis duties. In: Hai Phong (Meridian is IOR directly — both
  customs entries show IEEPA-basis lines); GPC (Amendment 2's pro-rata
  refund pass-back clause is contingent, but present); KPS (duty
  pass-through invoices exist, though no refund right — included as a
  "cost exposure, not recovery" finding, not excluded). Out: Lakeshore and
  Northaire notices name §232/general "trade policy," not an IEEPA-specific
  basis eligible for the CBP CAPE refund program — a closer call than it
  looks (see Realism).
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt`
  - Docs: see corpus map above
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: 3 stacks in scope for a *refund-opportunity* finding (Hai Phong, GPC, KPS-as-cost-only); Lakeshore/Northaire scoped in for TR-01 (§232) findings but NOT for a TR-02 refund finding
  - Verify: Lakeshore's 2025-03-10 notice blends IEEPA and §232 language for a single blended surcharge (9%/4%) without separating the two bases per product line — an agent may need to treat this stack as "undeterminable" for refund purposes rather than cleanly in or out
  - Realism: this is the sharpest scope-precision test in the set: correctly scoping TR-02 requires reading past "tariff" language to the specific legal basis (IEEPA vs §232 vs §122), which the corpus documents don't always separate cleanly (Lakeshore notice, GPC Amendment 2's broad "Tariff Rate" definition).

- **S3-03** · S3 · TR-03 (AD/CVD copper pipe, Mexico) gold relevant-stack
  set within supply: **empty**, now confirmed at the trigger level.
  `meta.yaml` declares `role: control` with `expected_relevance`: "No
  corpus document specifies Mexican-origin copper pipe or tube, and
  Meridian imports directly only from Vietnam. Expected result: no direct
  exposure; at most a monitor note that distributors pricing at time of
  shipment (Keystone, Lakeshore) could pass through any duty change." None
  of the 7 named suppliers in `profile.yaml` (post Riverside/Clearpath/
  FleetCard removal) is a Mexican copper-pipe producer/exporter, and no PO,
  invoice, or customs entry in the supply corpus shows Mexico as country of
  origin for copper pipe/tube (Hai Phong is Vietnam/brass; all copper-tube
  purchases are domestic-mill Great Plains or pass-through distributors
  with no stated country of origin). All supply stacks are pruned for
  TR-03, except a permitted **monitor note** (not a finding) on
  Keystone/Lakeshore's shipment-date pricing mechanism.
  - Trigger: `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/2026-09-21_preliminary-results.txt`; `meta.yaml`
  - Docs: none (confirmed absence)
  - Inputs: as-of 2026-09-25; profile default; custom prompt none
  - Expected: ScopeTrace records all supply stacks out, each with reason "no Mexico-origin copper pipe exposure found"; this is a **true negative** the pipeline must reach, not a miss — and it is now the corpus's designated control case for the pipeline's precision/should-not-flag measurement (this resolves the former A/B scope conflict per CHANGES-2026-09-29.md §A6)
  - Verify: confirm no supply document names Mexico as country of origin (spot-checked customs/PO/invoice docs; none found)
  - Realism: this makes TR-03 a scope-recall risk in the *other* direction — an agent that over-triggers on "copper pipe" keyword matching (e.g., flagging Great Plains as relevant because it also sells "copper pipe") without checking country of origin would produce a false positive. Good precision test even though it's an empty gold set.

### S4 scenarios: per-stack findings (supply area)

- **S4-GPC-01** · S4 · Direct hit, hop-complete chain: PO → MSA (as amended)
  → Amendment 2 §7(g) tariff-surcharge clause → invoice line item.
  Section 232/§122 tariff increase flows through to Meridian as an explicit
  invoiced surcharge.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt` — clauses (1)-(3)
  - Docs: `corpus/documents/supply/purchase-orders/PO-2026-0204_great-plains-copper-tube_2025-01-14.md` (PO) [VERIFY exact filename/date]; `.../great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` — §7(g) (MSA); `corpus/documents/supply/invoices/GPC-INV-26-0877_great-plains-copper-tube_2026-03-27.md` — "Tariff Surcharge per Section 7(g)" line (invoice)
  - Inputs: as-of 2026-04-01; profile default; custom prompt none
  - Expected: hop-complete finding; direction = cost exposure; finding_type = cost exposure (recurring); materiality = material (recurring surcharge on every invoice while Tariff Rate > 5%)
  - Plants: none listed in manifest for this specific PO, but `tariff_surcharge` plant on the invoice
  - Verify: PO number/date pairing with invoice's "Customer PO: PO-2026-0204" field — confirm PO-2026-0204's actual file date (`2026-03-16` per manifest) rather than the placeholder above
  - Realism: none

- **S4-GPC-02** · S4 · Decoy / look-alike: the Exhibit B "Metals Adjustment"
  (COMEX copper price index, present since 2019, unrelated to any tariff
  action) sits on the *same invoice line group* as the Amendment 2 tariff
  surcharge. A subagent that conflates the two — e.g., attributing the
  much larger Metals Adjustment dollar amount to a tariff trigger — would
  overstate tariff-driven cost exposure severalfold.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt`
  - Docs: `corpus/documents/supply/great-plains-copper-tube_master-supply-agreement/02_exhibit-b_metals-price-adjustment_2019-11-01.md` (Exhibit B, commodity-index mechanism, not tariff-linked); `corpus/documents/supply/invoices/GPC-INV-26-1402_great-plains-copper-tube_2026-06-12.md` — both "Metals Adjustment per Exhibit B" ($23,903.46) and "Tariff Surcharge per Section 7(g)" ($3,265.50) lines
  - Inputs: as-of 2026-06-15; profile default; custom prompt none
  - Expected: a correct finding attributes only the Section 7(g) line to the tariff trigger; the Metals Adjustment line is out of scope for a tariff-monitoring finding (it would exist regardless of any proclamation)
  - Verify: Exhibit B's formula independent of any tariff text — confirm no cross-reference between Exhibit B and Amendment 2
  - Realism: none — this is a very plausible real-world confusion (two "extra charge" lines, one commodity-indexed, one tariff-indexed, both driven partly by the same underlying copper-price volatility).

- **S4-GPC-03** · S4 · **Updated 2026-09-29 (formerly a single-invoice
  "undeterminable" scenario; the corpus now splits the underlying PO into
  two invoices — see S4-GPC-05 for the companion).** Clean overcharge:
  invoice GPC-INV-26-1911 (2026-08-21, copper water tube only, HTS
  7411.10.1030, manufactured "from imported refined copper cathode (HTS
  7403.11)") charges "Tariff Surcharge per Section 7(g) - Section 122
  Tariff Rate 10% (Proclamation 11012) less 5% threshold" — now explicitly
  naming Proclamation 11012 as its basis. Proc. 11012 expired 2026-07-24
  (28 days before this invoice), **and** copper cathode (HTS 7403) is
  affirmatively excluded from every §232 copper Annex per the scope notes
  ("NOT LISTED: refined copper cathode and unwrought copper (7403)") — so
  there is no successor-duty basis to fall back on either. Both legs of the
  "maybe it's now a valid §232 surcharge" defense fail on this invoice.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_proclamation-11012-section-122-surcharge.txt` (expiry) cross-referenced with `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt` (7403 cathode exclusion)
  - Docs: `corpus/documents/supply/great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` — §7(g) ("Tariff Rate" definition, successor-duty language); `corpus/documents/supply/invoices/GPC-INV-26-1911_great-plains-copper-tube_2026-08-21.md` — surcharge line, "imported refined copper cathode (HTS 7403.11)" product note
  - Inputs: as-of 2026-09-01; profile default; custom prompt none
  - Expected: finding_type = billing inaccuracy / overcharge; direction = recovery opportunity (dispute/credit); materiality = material, not undeterminable — this is now a **confident** overcharge call: the named basis (§122) is expired, and the product (cathode-sourced copper tube) was never §232-dutiable in the first place, so no successor-duty theory can rescue it either
  - Plants: `surcharge_after_section122_expiry`
  - Verify: 150-day expiry arithmetic (2026-02-24 + 150 days = 2026-07-24) puts this invoice 28 days after expiry; confirm HTS 7403 (cathode input) is excluded from Proc. 10962/11021/11032 annexes across all three (verified on 10962's derived note; 11021/11032's OCR note doesn't list 7403 anywhere either)
  - Realism: this is the corpus's designed "clean overcharge" (CHANGES-2026-09-29.md §A5) — a good agent should reach a confident affected/overcharge finding here, in contrast to S4-GPC-05's genuine needs-review sibling on the same PO.

- **S4-GPC-04** · S4 · Absence / likely-moot recovery clause: Amendment 2's
  refund pass-back clause ("if Seller later receives a rebate, refund...")
  is unlikely to ever be triggered for the invoiced surcharges, because
  neither §122 nor §232 duties are part of the CBP CAPE/IEEPA refund
  program described in TR-02 (that program covers only the nine named
  IEEPA EOs; §232 duties are expressly "no drawback" per Proc. 10962 cl.
  (10)).
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt` (refund program scope) cross-referenced with `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` — clause (10) ("No drawback")
  - Docs: `corpus/documents/supply/great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` — refund pass-back paragraph
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: direction = cost exposure only (not recovery); a finding that flags this clause as a live refund opportunity under the TR-02 CAPE program would be a false positive
  - Verify: whether Proc. 11012 (§122) duties are separately eligible for any CBP refund mechanism outside the IEEPA-specific program described in the corpus — not addressed in the corpus, flagged as a fact gap
  - Realism: a subtle negative finding; a GC-facing report that surfaces "you have a contractual right to a refund share" without this caveat would be misleading.

- **S4-GPC-05** · S4 · **New 2026-09-29** (companion to S4-GPC-03, same
  underlying PO-2026-0693, split by the corpus into a second invoice):
  genuine needs-review case. Invoice GPC-INV-26-1912 (2026-08-21, copper
  press couplings only, HTS 7412.10.0000, "assembled by Seller from
  imported copper fittings components") charges "Tariff Surcharge per
  Section 7(g) - Tariff Rate 10% less 5% threshold (imported fittings
  components)" — but, unlike GPC-INV-26-1911, does **not** name Proclamation
  11012/§122 explicitly. HTS 7412 fittings are genuinely §232-covered (on
  Proc. 10962's Annex per the derived scope note, and on Proc. 11021/11032's
  Annex I-A or I-B — placement UNVERIFIED per the OCR scope note), so
  Amendment 2 §7(g)'s successor-duty language could plausibly re-anchor this
  surcharge to the current §232 rate rather than the expired §122 rate. But
  the flat "10% less 5% threshold = 5.0%" math on this invoice is
  identical to the (clearly stale) §122-era math on GPC-INV-26-1911, and
  §232's actual rate for 7412 under 11021/11032 (50% Annex I-A or 25% Annex
  I-B) is nowhere near 5%. A correct finding should flag this as
  **needs_review**, not a confident overcharge or a confident pass.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt` (7412 placement UNVERIFIED) cross-referenced with `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_proclamation-11012-section-122-surcharge.txt` (expired basis, not explicitly cited on this invoice)
  - Docs: `corpus/documents/supply/great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` — §7(g); `corpus/documents/supply/invoices/GPC-INV-26-1912_great-plains-copper-tube_2026-08-21.md` — surcharge line
  - Inputs: as-of 2026-09-01; profile default; custom prompt none
  - Expected: finding_type = consistency gap / needs review; open_questions = "which Annex (I-A 50% vs I-B 25%) HTS 7412 falls under as of Aug 2026, and whether GPC has actually re-based this surcharge to that rate or is still coasting on the expired §122 math"; materiality = undeterminable pending the Annex-placement fact; this is the scenario that should land on "needs review," not the (now-resolved) S4-GPC-03
  - Plants: `ambiguous_surcharge_possible_s232_successor_needs_review`
  - Verify: HTS 7412 Annex I-A vs I-B placement is UNVERIFIED per the OCR scope note — a gold answer must say so rather than pick one
  - Realism: this is the deliberate contrast pair with S4-GPC-03 — same PO, same invoice date, same nominal "10%/5%" surcharge math, but one line item is a confident overcharge and the sibling line item is a genuine needs-review call, because the product-level HTS/§232-coverage facts differ. Good precision test for whether an agent treats "same PO" as license to give both invoices the same disposition.

- **S4-HPB-01** · S4 · Direct hit, hop-complete chain: PO → Supply Contract
  (Incoterms/IOR clause) → customs broker entry summary. Meridian is
  directly the importer of record and bears (and can potentially recover)
  IEEPA-basis duties on this stack, uniquely among the 8 suppliers.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-07-08_cbp-ieepa-refunds-pra-notice.txt`
  - Docs: `corpus/documents/supply/purchase-orders/PO-2025-0618_hai-phong-precision-brass_2025-06-23.md` — "Buyer is importer of record" (PO); `corpus/documents/supply/hai-phong-precision-brass_supply-contract_2023-05-15.md` — clause 22/Incoterms + IOR clause (contract); `corpus/documents/supply/customs/MX7-2291846-3_entry-summary-and-broker-invoice_2025-07-28.md` — "9903.01.25 IEEPA reciprocal duty 10% (EO 14257) $17,650.00", "unliquidated as of statement date" (customs entry)
  - Inputs: as-of 2026-07-15; profile default; custom prompt none
  - Expected: hop-complete finding; direction = recovery opportunity; urgency = obligation/opportunity clock pending on CAPE Declaration filing (no hard deadline named in the corpus beyond "generally issued within 60-90 days" after filing — filing itself has no stated deadline in the TR-02 texts read)
  - Plants: `meridian_is_ior_ieepa_refund_eligible`
  - Verify: entry's "unliquidated" status against CAPE Phase 1 eligibility ("unliquidated entries and certain entries within 80 days of liquidation")
  - Realism: none

- **S4-HPB-02** · S4 · Decoy / precision test: the second customs entry
  (MX7-2304417-9, 2025-12-15) contains **both** a Section 232 copper-content
  duty line ($30,645.00, not refund-eligible) and an IEEPA reciprocal-duty
  line on non-copper content ($8,172.00, refund-eligible). A finding that
  claims the full $41,881.50 "total duties deposited" is IEEPA-refundable
  overstates the recovery opportunity by more than 4x.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt`
  - Docs: `corpus/documents/supply/customs/MX7-2304417-9_entry-summary-and-broker-invoice_2025-12-15.md` — line-item duty table
  - Inputs: as-of 2026-01-05; profile default; custom prompt none
  - Expected: exposure_basis should isolate the $8,172.00 IEEPA line as the refund-eligible amount; the $30,645.00 §232 line and $3,064.50 MFN line are out of scope for a TR-02 finding (the §232 line belongs to a TR-01 finding instead, with direction = cost exposure, no drawback)
  - Plants: `meridian_is_ior_ieepa_refund_eligible` (applies to the eligible portion only)
  - Verify: $61,290 copper-content value × 50% = $30,645.00 (arithmetic check); $8,172 ÷ some non-copper base = 20% rate stated
  - Realism: this is the single best "right stack, wrong amount" precision test in the corpus — same document, same duty category header ("Section 232 copper" vs "IEEPA reciprocal duty"), two different eligibility outcomes on adjacent table rows.

- **S4-KPS-01** · S4 · Hop-complete chain but absence-of-protection finding:
  KPS invoices show a flat "Import duty recovery" line passed to Meridian,
  but KPS's Terms and Conditions of Sale §3 (both the 2019 and 2025
  versions) give Meridian no right to share in any refund KPS/its importer
  later obtains.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt`
  - Docs: `corpus/documents/supply/invoices/KPS-417-558210_keystone-plumbing-supply_2025-04-30.md` — "Import duty recovery - IEEPA reciprocal and fentanyl duties (EO 14257 / 14194)" line; `corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2025-06-08.md` — §3 PRICE (no refund clause)
  - Inputs: as-of 2025-05-15; profile default; custom prompt none
  - Expected: absence finding — clause type "duty refund pass-through" expected but not found in §3 or elsewhere in the KPS terms; direction = cost exposure with no offsetting recovery right; contrast explicitly with GPC's Amendment 2 pass-back clause (S4-GPC-04) to show the same fact pattern (indirect importer, distributor pass-through) produces different contractual outcomes across two suppliers
  - Plants: `ieepa_duty_passthrough_no_refund_clause`
  - Verify: absence claim requires having read the full KPS terms (§1-15, both versions) — V7-style backing
  - Realism: none

- **S4-KPS-02** · S4 · HTS near-miss decoy: the same KPS invoices bundle a
  valve line (HTS 8481.80.1095 — explicitly outside Proc. 10962's copper
  Annex per the annotated scope note) and a water-heater line (HTS
  8419.11.0000 — also outside the copper Annex) with copper-tube/fitting
  lines under a single blended "Import duty recovery" percentage. A finding
  that treats the valve/water-heater lines as §232 copper-duty exposure
  would misattribute the trigger.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` (Annex scope) with `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt` (machine-readable scope note, confirms 8481/8419 as "NOT LISTED")
  - Docs: `corpus/documents/supply/invoices/KPS-417-601877_keystone-plumbing-supply_2025-09-24.md` — line 1 (valve, 8481.80.1095), line 3 (water heater, 8419.11.0000) vs. line 2 (fitting, 7412.20.0000)
  - Inputs: as-of 2025-10-01; profile default; custom prompt none
  - Expected: only the copper-tube/fitting HTS lines are candidate §232 findings; the invoice's blended "Import duty recovery - IEEPA reciprocal and fentanyl duties" line is correctly a TR-02-family (IEEPA) finding for all lines, since IEEPA reciprocal tariffs apply regardless of HTS/metal content — the two trigger families require different per-line HTS filtering
  - Verify: HTS 8481 and 8419 exclusion from the copper Annex is now confirmed via the derived scope note (no longer solely a `meta.yaml` paraphrase) — cite the scope note file, not the raw proclamation text (Annex is image-only there)
  - Realism: none

- **S4-KPS-03** · S4 · Version-pinned web terms: PO-2025-0231 (2025-02-24)
  explicitly pins "as published October 2019" terms; PO-2025-0914
  (2025-09-15) pins "as published June 2025" terms — the same supplier, two
  different POs, deliberately citing different dated versions of the same
  URL.
  - Trigger: none (contract-mechanics scenario, not trigger-driven)
  - Docs: `corpus/documents/supply/purchase-orders/PO-2025-0231_keystone-plumbing-supply_2025-02-24.md` — "as published October 2019"; `corpus/documents/supply/purchase-orders/PO-2025-0914_keystone-plumbing-supply_2025-09-15.md` — "as published June 2025"; `corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2019-10-22.md` (superseded) vs `.../2025-06-08.md` (active); also note the master Commercial Credit Account Agreement's own incorporation rule ("as in effect on the date of shipment") potentially conflicting with a PO's explicit dated citation
  - Inputs: as-of 2025-10-01; profile default; custom prompt none
  - Expected: a finding grounded in PO-2025-0231 must cite the October 2019 terms text, not the June 2025 text, even though June 2025 is the "current" version at any later as-of date; V5 violation if it cites the wrong version
  - Verify: whether the October 2019 and June 2025 §3 PRICE clauses differ in substance (both say duties are passed through; confirm no material difference before treating this as purely a version-fidelity test rather than a substantive one)
  - Realism: none — this is the cleanest version-resolution slice case in the supply area (`eval-design.md` §8 gap: "wrong version of incorporated terms").

- **S4-LWP-01** · S4 · Direct hit, hop-complete chain: PO (citing "Rev
  020425") → web terms (tariff clause added) → price-increase notice
  (2025-03-10, cites IEEPA and §232) → applies to the PO's line items.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` and `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_eo-14389-ending-ieepa-tariffs.txt` (both cited in the notice)
  - Docs: `corpus/documents/supply/purchase-orders/PO-2025-0506_lakeshore-waterworks-pvf_2025-05-12.md` — "Rev 020425" (PO); `corpus/documents/supply/supplier-terms/lakeshore-waterworks-pvf_terms-and-conditions-of-sale_2025-02-04.md` — pricing clause (terms); `corpus/documents/supply/supplier-notices/lakeshore-waterworks-pvf_price-increase-notice_2025-03-10.md` — "9% ... and a separate tariff surcharge of 4% ... on imported valve and fitting products" (notice)
  - Inputs: as-of 2025-04-15; profile default; custom prompt none
  - Expected: hop-complete finding covering the PO's valve line (4% surcharge applies) and copper-tube line (9% general increase, not the 4% import surcharge); direction = cost exposure
  - Verify: whether "imported valve and fitting products" is a defined term elsewhere in the Lakeshore terms (not found in the sections read) — VERIFY scope of "imported" vs domestically-sourced valves/fittings from the same supplier
  - Realism: the notice blends a general 9% price increase (broader than any single trigger — could be ordinary cost inflation) with a specific 4% "tariff surcharge" on a narrower product set; a sloppy finding could attribute the full 9%+4%=13% to the tariff triggers when only the 4% line is clearly trigger-linked.

- **S4-LWP-02** · S4 · Expired/superseded terms, should-not-flag: POs
  PO-2024-0822 (2024-08-26) and PO-2024-1207 (2024-12-09) both cite "Rev
  091718" terms, which predate the tariff clause entirely (added only in
  Rev 020425, effective Feb 2025) and predate the March 2025 price-increase
  notice. Neither PO should be linked to a tariff-surcharge finding.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` (postdates both POs)
  - Docs: `corpus/documents/supply/purchase-orders/PO-2024-0822_lakeshore-waterworks-pvf_2024-08-26.md`, `corpus/documents/supply/purchase-orders/PO-2024-1207_lakeshore-waterworks-pvf_2024-12-09.md` — both "Rev 091718"; `corpus/documents/supply/supplier-terms/lakeshore-waterworks-pvf_terms-and-conditions-of-sale_2018-09-17.md` (no tariff language, confirmed by grep)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: not affected — both POs predate every TR-01/TR-02 duty action in this corpus (earliest is EO 14220, 2025-02-25) and predate the supplier's own tariff clause; a finding here is a false positive
  - Verify: PO dates (2024-08-26, 2024-12-09) vs. EO 14220 date (2025-02-25) — both POs are chronologically impossible to link to any TR-01/TR-02 version
  - Realism: none

- **S4-NCS-01** · S4 · Direct hit + ratchet decoy: Proc. 11032 (eff.
  2026-06-08) moves qualifying residential HVAC into the temporarily-reduced
  15% §232 tier, but Northaire's dealer bulletin confirms its 6% tariff
  surcharge "remains in effect" and, per Terms §33, "is not subject to
  decrease." A GC-facing finding should flag this as a renegotiation
  opportunity, not treat the surcharge as still cost-justified at the old
  level, and not treat it as resolved by the tariff decrease.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamation-11032.txt` — ¶7 (HVAC inclusion in 15% tier)
  - Docs: `corpus/documents/supply/supplier-notices/northaire-comfort-systems_dealer-bulletin_2026-06-15.md` — "Section 232 Changes Effective June 8, 2026 ... surcharge of 6% remains in effect ... not subject to decrease" (notice); `corpus/documents/supply/supplier-terms/northaire-comfort-systems_terms-and-conditions-of-sale_2026-08-21.md` — §33 (terms, ratchet clause, PPI-indexed floor); `corpus/documents/supply/purchase-orders/PO-2026-0715_northaire-comfort-systems_2026-07-20.md` — cites Rev. 12/10/24 (PO)
  - Inputs: as-of 2026-06-20; profile default; custom prompt none
  - Expected: finding_type = cost exposure / consistency gap; response_type = renegotiate; direction = cost exposure (locked in despite the trigger's rate relief); materiality = material (recurring, contractually one-directional)
  - Plants: `ratchet_after_tariff_decrease`
  - Verify: whether the specific HVAC models Meridian buys from Northaire (condensers, furnaces, heat pumps, air handlers per `profile.yaml` `main_inputs`) meet Proc. 11032's "predominantly for residential use" test — not confirmable from the corpus text read; VERIFY against the full proclamation/Annex
  - Realism: strong direct hit and one of the best "trigger changed in the company's favor but the contract doesn't pass it through" scenarios in the set.

- **S4-NCS-02** · S4 · Version-pinned terms resolution: three Northaire
  terms versions (07/23/24, 12/10/24, 08/21/26) all carry byte-for-byte
  identical §33 ratchet language; POs across 2024-2026 correctly cite
  whichever version was current at PO date. A finding must resolve the
  *correct* version per PO date even though the substantive clause hasn't
  changed — this tests version-resolution mechanics independent of
  substantive drift.
  - Trigger: none (contract-mechanics scenario)
  - Docs: `corpus/documents/supply/purchase-orders/PO-2024-1016_northaire-comfort-systems_2024-10-21.md` (cites Rev. 07/23/24); `corpus/documents/supply/purchase-orders/PO-2025-0307_northaire-comfort-systems_2025-03-17.md` and `PO-2025-0822` (cite Rev. 12/10/24); `corpus/documents/supply/purchase-orders/PO-2026-0715_northaire-comfort-systems_2026-07-20.md` (cites Rev. 12/10/24, not yet superseded by the 08/21/26 version at that date)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: each PO's finding cites the version that PO named, not the current (08/21/26) version, even though the substance is identical — a control case isolating pure version-fidelity from substantive-drift detection
  - Verify: confirm §33 text is truly identical across all three versions (spot-checked; grep shows byte-identical wording in the two compared)
  - Realism: none

- **S4-DSC-01** · S4 · Forfeitable-window hop-complete chain: Delmont job
  quote Q-2025-45122 (2025-02-18) protects pricing for 45 days (through
  2025-04-04); PO-2025-0402 (2025-03-24) releases against it validly, within
  the window.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-02-25_eo-14220-investigation.txt` (contemporaneous investigation; no duty yet — tests that urgency here is a **contractual** price-protection clock, not a tariff-driven one)
  - Docs: `corpus/documents/supply/quotes/Q-2025-45122_delmont-supply_job-quotation_2025-02-18.md` — "protected for 45 days, through April 4, 2025" (quote); `corpus/documents/supply/purchase-orders/PO-2025-0402_delmont-supply_2025-03-24.md` — "Release against Delmont written job quotation Q-2025-45122" (PO)
  - Inputs: as-of 2025-03-25 (one day after PO, still inside window); profile default; custom prompt none
  - Expected: urgency = forfeitable clock running (if evaluated before 2025-04-04) or no clock (after, since already exercised); this scenario's PO release means the clock is exercised, not missed — used as the LBL urgency contrast case (see LBL below) against Q-2025-44710/PO-2025-0827. **At the 2026-10-01 default as-of, `manifest.jsonl` now marks the quote itself `status_at_as_of: expired`** (per CHANGES-2026-09-29.md §A2/§C5) — the correct framing is **"affected (accrued right)"**, not "not affected (expired)": the quote's own expiration on 2025-04-04 doesn't unwind PO-2025-0402, which validly locked in the protected price on 2025-03-24, inside the window. The right accrued at release and survives the quote's later lapse.
  - Plants: `price_protection_expiry:2025-04-04`
  - Verify: PO date (2025-03-24) is within the 45-day window from quote date (2025-02-18)
  - Realism: none

- **S4-DSC-02** · S4 · Expired-reference decoy: PO-2025-0827 (2025-08-29)
  cites "Release against Delmont written job quotation Q-2025-44710;
  pricing per quotation," but Q-2025-44710's 60-day price protection
  expired 2025-07-27 — the PO is dated **33 days after** the quoted price
  protection lapsed.
  - Trigger: none (contract-mechanics scenario)
  - Docs: `corpus/documents/supply/quotes/Q-2025-44710_delmont-supply_job-quotation_2025-05-28.md` — "protected for 60 days, through July 27, 2025" (quote); `corpus/documents/supply/purchase-orders/PO-2025-0827_delmont-supply_2025-08-29.md` — "pricing per quotation" (PO)
  - Inputs: as-of 2025-09-01; profile default; custom prompt none
  - Expected: absence/consistency finding — the PO's stated pricing basis is not actually binding per the quote's own terms; open_questions = "did Delmont honor Q-2025-44710 pricing anyway, or reprice at then-current rates?" (not answerable from the corpus); materiality = undeterminable. Correct expired-status framing per CHANGES-2026-09-29.md §C5: this is **"not affected (expired)"** — unlike S4-DSC-01, no accrued right exists here, because the PO's release itself (2025-08-29) fell outside the protection window; there was no valid exercise of the price-protection right before it lapsed, so there is nothing left for the quote's later `status_at_as_of: expired` tag to have unwound.
  - Verify: date arithmetic: 2025-05-28 + 60 days = 2025-07-27; PO date 2025-08-29 is after
  - Realism: this requires date arithmetic across two documents rather than a keyword match — a good grounding test (M7-adjacent: does the agent actually compute the window, or just match the quote number).

- **S4-SCP-01** · S4 · Absence case: Solace's Terms of Sale §5 establishes
  that Meridian (Buyer) bears all duties, but **no PO, quote, or invoice
  from Solace exists anywhere in the corpus** — there is no transaction to
  which a tariff-driven cost increase could actually be traced.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamation-11032.txt` (HVAC-relevant, and Solace is an HVAC equipment supplier per `profile.yaml`)
  - Docs: `corpus/documents/supply/supplier-terms/solace-comfort-products_terms-of-sale_2025-11-01.md` — §5 "Taxes and Other Charges" (terms only; confirmed no other Solace document exists)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: applicability = applies in principle (duty-pass-through clause exists) but determination = not affected / insufficient transaction history; absence finding should explicitly say "no purchase order or invoice found for this supplier" rather than silently omitting the stack
  - Verify: confirm (already done) that no `supply/purchase-orders/`, `supply/invoices/`, or `supply/quotes/` file references Solace
  - Realism: distinguishes "no protective clause" absence (V7's main target) from a different absence flavor — "clause exists, but no transaction to apply it to" — worth keeping as a separate slice since the missing evidence and its implication differ.

- **S4-RPS-01** · REMOVED: Riverside Pipe & Supply Co. (formerly SUP-RPS)
  was removed from `corpus/company/profile.yaml` entirely on 2026-09-29
  (along with Clearpath and FleetCard — they had no documents), per
  CHANGES-2026-09-29.md §A3. The "profile names a supplier with no
  vault presence" inconsistency this scenario tested is now resolved: the
  profile no longer names Riverside at all, so there is nothing left to
  prune or scope. See S3-01's Realism note and the Gaps section for the
  resolution record.

### LBL scenarios: label-set tests on supply findings

- **LBL-urgency-01** · LBL-urgency · Forfeitable clock running vs. already
  exercised vs. no clock: the same fact pattern (Delmont price-protection
  window) yields three different urgency labels depending only on the
  as-of date relative to the window.
  - Trigger: none (contract-mechanics)
  - Docs: `corpus/documents/supply/quotes/Q-2025-45122_delmont-supply_job-quotation_2025-02-18.md` (window 2025-02-18 → 2025-04-04)
  - Inputs: **three as-of variants** — (a) 2025-03-01 (inside window, no release order yet — forfeitable clock running, ~34 days left); (b) 2025-03-25 (PO-2025-0402 already released against it — clock already exercised, no longer forfeitable); (c) 2026-10-01 (default — long expired, no clock, historical only); profile default; custom prompt none
  - Expected: urgency = {forfeitable clock running, obligation already satisfied/no clock, no clock} respectively; a labeller that returns "forfeitable" at variant (c) is a dangerous confusion (stale urgency)
  - Verify: 45-day window arithmetic from 2025-02-18
  - Realism: none — this triple is designed to pair with Package E's M1 (as-of shift) metamorphic test.

- **LBL-urgency-02** · LBL-urgency · No-clock / already-lapsed case:
  Proclamation 11012's §122 surcharge expired 2026-07-24; any finding that
  still labels a §122-linked obligation "forfeitable" or "pending" at the
  default as-of (2026-10-01) is a dangerous confusion (stale urgency in the
  other direction — treating an expired legal basis as still live).
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_proclamation-11012-section-122-surcharge.txt`
  - Docs: `corpus/documents/supply/invoices/GPC-INV-26-1911_great-plains-copper-tube_2026-08-21.md` (surcharge invoiced after §122 expiry)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: urgency = no clock (for the §122 basis specifically) but materiality = undeterminable pending confirmation of the successor-basis rate (see S4-GPC-03); the two labels should not be conflated into a single "no action needed"
  - Verify: none beyond S4-GPC-03
  - Realism: none

- **LBL-materiality-01** · LBL-materiality · Undeterminable due to missing
  facts: TR-03's scope (full HTS list, country-of-origin confirmation for
  any Meridian purchase) is not in the corpus text (deferred to an external,
  uncollected Preliminary Decision Memorandum), and no supply document shows
  Mexico-origin copper pipe. Materiality cannot be resolved either way from
  available facts.
  - Trigger: `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/2026-09-21_preliminary-results.txt`
  - Docs: none (confirmed absence across supply corpus)
  - Inputs: as-of 2026-09-25; profile default; custom prompt none
  - Expected: materiality = undeterminable, naming the missing fact ("no confirmed Mexico-origin copper pipe purchase in the vault; full AD order scope not available in the monitored source"); NOT "not material" (which would imply a considered negative, rather than missing information)
  - Verify: none beyond S3-03
  - Realism: tests the material/undeterminable boundary the label-set design calls out explicitly (`system-design.md` §6).

- **LBL-direction-01** · LBL-direction · Split direction on one document:
  Hai Phong customs entry MX7-2304417-9 carries both a recovery-direction
  fact (IEEPA line, $8,172, refund-eligible) and a cost-exposure-direction
  fact (§232 line, $30,645, no drawback) in the same table. A single
  per-finding "direction" label would be wrong however it's set unless the
  two duty lines are split into two findings.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2025-07-30_proclamation-10962.txt` (§232 line) and `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt` (IEEPA line)
  - Docs: `corpus/documents/supply/customs/MX7-2304417-9_entry-summary-and-broker-invoice_2025-12-15.md`
  - Inputs: as-of 2026-01-10; profile default; custom prompt none
  - Expected: two findings, direction = recovery ($8,172 line) and direction = exposure ($30,645 line), not one finding with direction = "both" applied uniformly to the full $41,881.50 — "both" should be reserved for a single fact pattern with two effects, not a container for two unrelated facts
  - Verify: none beyond S4-HPB-02
  - Realism: tests whether "both" is used as intended (`system-design.md` §6 direction enum) rather than as a catch-all.

- **LBL-direction-02** · LBL-direction · Cost exposure with no matching
  recovery right (contrast case): KPS's duty pass-through has no refund
  pass-back clause (unlike GPC's Amendment 2), so direction = exposure only,
  even though the underlying duty (IEEPA reciprocal) is, in principle,
  refundable to *someone* in the chain — just not contractually to Meridian.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-09-02_cbp-ieepa-duty-refunds-page.txt`
  - Docs: `corpus/documents/supply/invoices/KPS-417-558210_keystone-plumbing-supply_2025-04-30.md`; `corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2025-06-08.md` — §3
  - Inputs: as-of 2025-05-15; profile default; custom prompt none
  - Expected: direction = exposure (not recovery, not both) — the refund exists somewhere in the chain but Meridian has no contractual claim to it; a "recovery" or "both" label here would overstate Meridian's actual position
  - Verify: none beyond S4-KPS-01
  - Realism: this is a materially different fact pattern from LBL-direction-01 despite superficial similarity ("IEEPA duty is refundable") — the deciding fact is contractual privity to the refund, not the duty's refund-eligibility in the abstract.

- **LBL-materiality-02** · LBL-materiality · Material despite no hard
  deadline: Northaire's ratchet (S4-NCS-01) has no forfeitable clock, but is
  material because it "shifts a recurring cost" (system-design.md §6 test)
  indefinitely, with no contractual mechanism to unwind it as the
  underlying tariff basis softens.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamation-11032.txt`
  - Docs: `corpus/documents/supply/supplier-notices/northaire-comfort-systems_dealer-bulletin_2026-06-15.md`; `corpus/documents/supply/supplier-terms/northaire-comfort-systems_terms-and-conditions-of-sale_2026-08-21.md` — §33
  - Inputs: as-of 2026-06-20; profile default; custom prompt none
  - Expected: materiality = material; urgency = no clock (or obligation clock only if a renegotiation deadline were named, which it isn't); response_type = renegotiate — tests that "no clock" and "not material" are not conflated (a dangerous-confusion pairing worth checking explicitly)
  - Verify: none beyond S4-NCS-01
  - Realism: none

---

## Gaps

- **TR-01 Annex/scope images — partially resolved 2026-09-29.** Proclamation
  10962's and 11021/11032's HTS annexes are still image-only in the
  underlying Federal Register text; the .txt files carry no machine-readable
  HTS list. The corpus now adds two derived scope-note files
  (`2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt`, transcribed and
  visually verified; `2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt`,
  OCR-derived) that resolve 10962's full HTS list and most of 11021's
  descriptive scope. **Still open:** HTS 7412 (fittings) Annex I-A vs I-B
  placement under 11021/11032, and the specific HTS codes moved into Annex
  I-C's residential-HVAC tier under 11032 — both explicitly marked
  UNVERIFIED in the OCR scope note (OCR could not read those annex pages
  reliably). S1a-TR01-04 and -05 above now cite the scope notes and narrow
  the remaining VERIFY items to just these two facts, rather than treating
  all of TR-01's HTS scope as unverifiable.
- **TR-03 has no supply-area document to anchor a direct-hit scenario.**
  None of the 7 named suppliers (post Riverside/Clearpath/FleetCard removal)
  is a Mexico-origin copper-pipe producer/exporter. TR-03's `meta.yaml` now
  formally declares `role: control` with this exact expectation, so this is
  a **confirmed, designed** true-negative S3 case (S3-03), not a corpus
  defect — but it still means TR-03 has **no S4 direct-hit or
  hop-complete-chain scenario anywhere in Package A's scope**. If a later
  iteration wants a TR-03 direct hit, the enabling change would be a new
  supplier or PO naming a Mexican copper-pipe producer (e.g., a distractor
  entity resembling "Nacional de Cobre" or "IUSA") — that would require
  reclassifying TR-03 out of `role: control` first.
- **Riverside Pipe & Supply Co. gap — resolved 2026-09-29.** Riverside
  (formerly SUP-RPS), Clearpath, and FleetCard have been removed from
  `corpus/company/profile.yaml` entirely (they had no documents), per
  CHANGES-2026-09-29.md §A3. S4-RPS-01 above is REMOVED accordingly; no
  further action needed here.
- **No document splits the Lakeshore 2025-03-10 notice's blended
  9%/4% increase by legal basis (IEEPA vs §232) per product line.** This
  makes a clean TR-02-only or TR-01-only S4 finding for Lakeshore
  impossible to fully hop-complete without an inference step the source
  documents don't fully support (flagged in S3-02 and S4-LWP-01). A
  clarifying supplier notice or invoice line-item breakout would close this.
- **No stated deadline for filing a CAPE Declaration.** The TR-02 CBP
  documents describe refund *processing* timelines (60-90 days after
  acceptance; Phase 1 = unliquidated/within-80-days) but not a hard filing
  deadline for the importer. This limits how "forfeitable" the Hai Phong
  refund-opportunity urgency label (S4-HPB-01) can be made without an
  invented deadline; as scoped, it's an "obligation/opportunity clock
  pending" rather than a hard forfeitable window. A future corpus addition
  (e.g., a liquidation-date fact per entry, since refund rights sharpen as
  liquidation approaches) would enable a genuine forfeitable-window S4/LBL
  pair for this stack.
- **TR-02's SCOTUS opinion is ~352,000 characters.** No eval in this
  package directly measures whether an agent's stage-1 read of the full
  opinion is complete (vs. skimming the syllabus) — flagged as a candidate
  for Package E's coverage-style checks (V6) rather than duplicated here.
- **Amendment 1's pricing mechanics (Great Plains) were read but not
  reconciled against the invoice math** (e.g., whether the $2.60/lb Exhibit
  B base or the $4.75/lb Amendment 1 base governs the "Metals Adjustment"
  percentages shown on the 2026 invoices). Flagged as a VERIFY item on
  S4-GPC-02 rather than resolved here, since resolving it requires
  cross-referencing Amendment 1's Exhibits E-1/E-2 (not fully read in this
  pass) against the specific SKUs on each invoice.

---

## Revision 2026-09-29

Applied `CHANGES-2026-09-29.md` (source of truth; see §D for update rules).

- **Changed** supplier list header: removed Riverside Pipe & Supply Co.
  (SUP-RPS) and noted the Clearpath/FleetCard removal and Northbrook
  Commons/residential-customer additions in `profile.yaml` (§A3).
- **Changed** S1a-TR01-02 (Proc. 10962): now cites the new
  `2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt` scope note;
  full HTS list confirmed, no longer UNVERIFIED (§A1).
- **Changed** S1a-TR01-04 (Proc. 11021): now cites
  `2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt`;
  copper tube/pipe confirmed on Annex I-A (50%); HTS 7412 fittings
  Annex I-A vs I-B placement narrowed to the sole remaining UNVERIFIED item
  (§A1).
- **Changed** S1a-TR01-05 (Proc. 11032): cites the same OCR scope note;
  85% domestic-content threshold confirmed; residential-HVAC HTS codes in
  Annex I-C remain the sole UNVERIFIED item (§A1).
- **Changed** TR-03 section intro and S1a-TR03-01: TR-03's `meta.yaml` now
  declares `role: control`; cites the `expected_relevance` monitor note for
  Keystone/Lakeshore shipment-date pricing (§A6).
- **Changed** supply-area corpus map (GPC row): added GPC-INV-26-1912 and
  the PO-2026-0693 split; added the `ambiguous_surcharge_possible_s232_successor_needs_review`
  plant id (§A5).
- **Changed** supply-area corpus map (Delmont row): noted both quotes now
  carry `status_at_as_of: expired` (§A2).
- **Changed** S3-01: removed Riverside from the "pruned" list (no longer in
  `profile.yaml`, so nothing to prune) (§A3).
- **Changed** S3-03 (TR-03 gold set): reframed as a trigger-level-confirmed
  control per `meta.yaml`, not an inferred absence; added the
  Keystone/Lakeshore monitor-note caveat (§A6).
- **Changed** S4-KPS-02: HTS 8481/8419 exclusion now cited to the derived
  scope note instead of a `meta.yaml` paraphrase (§A1).
- **Changed** S4-GPC-03: rewritten around the corpus's new invoice split —
  now GPC-INV-26-1911 only (copper tube from cathode, HTS 7403 excluded from
  every §232 annex), reframed from "undeterminable" to a confident, clean
  overcharge finding (§A5).
- **Added** S4-GPC-05: new scenario for GPC-INV-26-1912 (copper press
  couplings, HTS 7412, §232-covered) — the genuine needs-review sibling to
  S4-GPC-03 on the same PO (§A5).
- **Changed** S4-DSC-01: added explicit "affected (accrued right)" framing
  now that the quote carries `status_at_as_of: expired` (§C5).
- **Changed** S4-DSC-02: added explicit "not affected (expired)" framing —
  no accrued right, since the PO's release fell outside the window (§C5).
- **Removed** S4-RPS-01: Riverside removed from `profile.yaml` entirely;
  the "named supplier, no documents" inconsistency it tested no longer
  exists (§A3).
- **Changed** Gaps: resolved the Riverside gap entry; narrowed the
  Annex/scope-images gap to the two still-UNVERIFIED OCR items; reframed
  the TR-03 gap around the confirmed `role: control` declaration.
- **Resolved VERIFY items:** 10962's HTS scope (was UNVERIFIED, now
  confirmed via scope note); the Riverside profile/corpus inconsistency
  (now removed from profile); the GPC-INV-26-1911/1912 "which trigger
  actually justifies this line item" ambiguity (now cleanly split, per
  §A5, resolving the former A/B/E conflict).
- **New conflicts found:** none.

STATUS: complete
