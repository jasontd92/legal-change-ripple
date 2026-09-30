# Package B — Tariff Downstream (customers, subcontracts, corporate, vendors)

Scope: downstream effects of tariff triggers TR-01 (Section 232 copper),
TR-02 (IEEPA/SCOTUS/Section 122 surcharge), TR-03 (AD/CVD copper pipe Mexico)
on `corpus/documents/customers/**`, `subcontracts/**`, `corporate/**`, and
`vendors/**`. Trigger-side and supply-area findings belong to Package A;
supply-side stacks are cited here only as link endpoints for cross-stack
(L2) links. Written per the shared brief in `eval-scenarios/PLAN.md`.

As-of date defaults to 2026-10-01 (`corpus/company/profile.yaml`) unless a
scenario states otherwise.

Trigger summaries (see each `meta.yaml` for full version list):
- **TR-01** `corpus/triggers/TR-01-copper-section-232/` — Section 232 copper
  duties, five real dated versions (EO 14220 investigation ->
  Proclamation 10962 -> CSMS 65794272 guidance -> Proclamation 11021 ->
  Proclamation 11032) plus two distractor versions (aluminum proclamation,
  DPA critical minerals). Proclamation 10962's annex covers HTS 7406-7419
  (incl. 7411 copper tube/pipe, 7412 fittings, 7418.20 sanitary ware); not
  8481 valves, 8419 water heaters, or 8415 A/C units.
- **TR-02** `corpus/triggers/TR-02-ieepa-tariffs-scotus/` — SCOTUS holds
  IEEPA doesn't authorize tariffs (Learning Resources v. Trump); EO 14389
  ends IEEPA tariff collection 2026-02-24; Proclamation 11012 imposes a
  temporary Section 122 surcharge 2026-02-24 through 2026-07-24 (expired);
  CBP refund guidance (PRA notice, then the IEEPA duty refunds page) follows
  for the importer of record.
- **TR-03** `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/` — preliminary
  AD administrative-review results, seamless refined copper pipe/tube from
  Mexico, 2026-09-21.

---

## S4 — Customers

- **B01** · S4 · MFN clause interacts with a tariff cost pass-through the
  contractor itself introduced (Crestline Retail Trust, Texas-only MFN).
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-04-02_proclamation-11021.txt` and `2026-06-01_proclamation-11032.txt`
  - Docs: `corpus/documents/customers/crestline-retail-trust_master-services-agreement/01_master-services-agreement_2023-05-15.md` — unnumbered "Most Favored Customer" paragraph after §4.3, and Exhibit A §7 "Competitive Best Pricing Assurance" (role: mfn, plant `MFN_CRESTLINE`); `.../02_amendment-1_rate-adjustment_2025-06-01.md` — §2 "Tariff and Material Surcharge" (role: tariff, pass_through)
  - Inputs: as-of 2026-10-01; profile default; custom prompt none
  - Expected: **as of the 2026-10-01 default as-of, this contract is expired** (`CUS-CRT-MSA`, Initial Term 2023-05-15 → 2026-05-14, per `manifest.jsonl`; no mutual-agreement renewal was executed despite §10.2's auto-renewal sentence — see Realism). Correct framing per CHANGES-2026-09-29.md §C5: **"not affected (expired)"** prospectively — no live MFN protection remains after 2026-05-14, so no current-dated finding should treat B01 as an open monitoring item. §10.6(d)'s survival list (limitation of liability, indemnification, confidentiality, governing law) does **not** include the MFN/pricing clause, so it does not survive termination as an ongoing obligation. The narrow residual question is an **accrued-claim check**: did any other TX customer receive better copper-surcharge terms than CRT's cost-only pass-through *during the active term* (2023-05-15 → 2026-05-14, which includes the entire window Proc. 11021 was in force, 2026-04-06 → 2026-05-14)? The corpus shows no such comparator, so absent new evidence the gold is "not affected (expired), no accrued claim identified" — contrast this explicitly with Sunpoint (B02), which does have a confirmed accrued claim.
  - Plants: MFN_CRESTLINE
  - Verify: exact retroactivity language ("retroactive to the date first extended to such other customer") VERIFY; whether any other TX customer (e.g. SMB, if TX) received better copper-surcharge terms than CRT's cost-only pass-through during 2023-05-15–2026-05-14 (none found in the corpus read for this package)
  - Realism: plausible — MFN clauses paired with a same-agreement surcharge mechanism is a common real drafting pattern. **Note:** §10.2's own text is internally in tension — its first sentence requires renewal "upon mutual written agreement," its second sentence says the Agreement "shall automatically renew" absent a non-renewal notice — yet `manifest.jsonl`'s `term_note` ("renewable only by mutual agreement; none executed") and `status_at_as_of: expired` resolve this in favor of the mutual-agreement reading. A careful agent might flag this drafting tension rather than silently pick a side; worth noting as a should-flag nuance, not a corpus defect to fix here.

- **B02** · S4 · Statewide MFN with an express refund remedy (Sunpoint Public Schools Cooperative, Illinois) — **now the corpus's designed "expired ≠ irrelevant" test case** (CHANGES-2026-09-29.md §C4/§C5).
  - Trigger: TR-01 (§ HTS scope, Proclamation 10962/11021/11032) and TR-02 (Section 122 surcharge and its expiry)
  - Docs: `corpus/documents/customers/sunpoint-public-schools-cooperative_mechanical-services-contract/01_mechanical-services-contract_2021-07-01.md` (**path moved into a cluster folder, 2026-09-29**) — unnumbered "Most Favored Pricing" paragraph in §3 (after §3.7, before §4) (role: mfn, public_entity, plant `MFN_SUNPOINT`); §3.1 (labor: prevailing wage + 42% markup), §3.2 (materials: cost + 15% markup); §5.6 "Continuation of Obligations" (survival language, renumbered from old §5.9 — see below)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: **affected — accrued/surviving right, not "not affected (expired)."** The contract itself is now expired (`CUS-SPS-MSA`, second and final renewal option ran through 2026-06-30, no options remain; `status_at_as_of: expired`), but per CHANGES-2026-09-29.md §C5 expiry doesn't clear an accrued MFN refund claim. The clause reaches "any other public entity or commercial customer in the State of Illinois," broader than Crestline's contractor-wide TX-only test, and a breach carries an automatic refund remedy ("entitles the Cooperative to a refund of the difference for the affected period"). The **primary basis is the markup gap**, not the surcharge waiver alone: Northbrook Commons' 2026-02-17 letter (B09) offers labor at PW+**34%** (vs. Sunpoint's PW+**42%**) and materials at cost+**12%** (vs. cost+**15%**), plus no tariff/material surcharge. §5.6's "Contractor shall remain bound by all terms and conditions of this Agreement with respect to work performed prior to termination" supports the claim surviving expiry for the pre-expiry period. **Claim window: 2026-02-17 → 2026-06-30** (concession date through contract expiry) — this is the live, quantifiable exposure, not a stale one.
  - Plants: MFN_SUNPOINT
  - Verify: whether Northbrook Commons' condo-association mechanical maintenance is "comparable Services" in scope/volume to Sunpoint's school-district contract (a real GC would question comparability, not just same-state); whether a condominium association counts as a "commercial customer" under the clause (arguable — see `legal-questions.md` Q3); whether any annual MFN compliance certification (§3's "Contractor shall certify its compliance with this Section annually") was signed after 2026-02-17 with the higher Sunpoint markups still certified — that would be a separate, independently inaccurate-certification finding.
  - Realism: comparability is a judgment call worth flagging, not a mechanical yes; "affected" or "needs review" should both pass, "not affected" should fail.

- **B03** · S4 · Absolute fixed price, no tariff relief, full cost absorption (Valley Medical Services Group).
  - Trigger: TR-01 (any copper-duty rate change) and TR-02 (Section 122 surcharge while in force)
  - Docs: `corpus/documents/customers/valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md` — §4.1 "Fixed Pricing" unnumbered paragraph (role: tariff, fixed_price, plant `FIXED_PRICE_VALLEY`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: affected, direction exposure, materiality material (recurring cost shift, Annual Maintenance Fee $486,000/yr fixed "for the Initial Term and each Renewal Term"). **Urgency corrected (round 2, 2026-09-29): forfeitable clock running.** §3.1 Initial Term ends 2026-12-31; §3.2 auto-renews for two one-year terms unless either party gives written non-renewal notice at least 60 days prior, i.e. by **2026-11-01** (31 days after the default as-of). Non-renewal is Meridian's only exit (§3.3 termination for convenience is Customer-only), and a renewal locks the tariff-blind fixed price for 2027. response_type = send notice (non-renewal, or renegotiation leverage before the deadline). Should not be flagged as a pass-through candidate: the clause forecloses it ("shall not be adjusted for any reason, including ... tariffs, duties"). Feeds the FCCR chain (B15/B23).
  - Plants: FIXED_PRICE_VALLEY
  - Verify: Annual Maintenance Fee $486,000/yr; §3.2's exact notice wording ("at least sixty (60) days prior to the expiration of the then-current term") and any notice-address/method requirement.

- **B04** · S4 · Lump-sum construction contract sum frozen only to tariffs "in effect or announced as of" contract date — later proclamations may fall outside it (Harborview Capitol Tower).
  - Trigger: `2026-04-02_proclamation-11021.txt` (effective 2026-04-06) and `2026-06-01_proclamation-11032.txt` (effective 2026-06-08) — both postdate the contract
  - Docs: `corpus/documents/customers/harborview-capitol-tower_hvac-replacement-construction-contract/01_construction-contract-stipulated-sum_2025-05-19.md` — §3 "Contract Sum" (role: tariff, fixed_price, lump_sum, plant `LUMPSUM_HARBORVIEW`); change orders 01–03 (no escalation language found in any CO — confirm none references tariffs)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: recovery opportunity / needs-review — the Contract Sum expressly includes "all ... duties and tariffs in effect or announced as of the date of this Agreement" (May 19, 2025); Proclamations 11021 and 11032 were announced/effective after that date, so a literal reading leaves them outside the frozen sum, and "shall not be adjusted for escalation ... except by Change Order" implies a Change Order route exists for changes outside the frozen scope. This is a genuine judgment call, not a slam-dunk — a correct agent should flag it as "possible CO right, needs review," not silently pass or silently deny.
  - Plants: LUMPSUM_HARBORVIEW
  - Verify: whether any of CO1 (2025-08-11), CO2 (2025-11-03), CO3 (2026-01-26) already addressed post-5/19/2025 tariff proclamations (CO3 predates Proc 11021, so likely not); exact NTP/Substantial Completion dates.
  - Realism: this is a real ambiguity a careful GC review would flag, not fabricate — good hop-completeness test (a shallow read stops at "not adjusted for escalation" and misses the announced-as-of carve-out).

- **B05** · S4 · Cost-only pass-through with a 30-day forward-looking notice, already exercised once (Harborview Realty Partners MSA).
  - Trigger: TR-01 versions through 2026 and TR-02 (Section 122, while in force 2026-02-24 to 2026-07-24)
  - Docs: `corpus/documents/customers/harborview-realty-partners_facilities-maintenance-msa_2022-03-01.md` — §4.3 "Material Cost Adjustments" unnumbered para (role: tariff, pass_through, plant `PASS_THROUGH_HARBORVIEW`); `corpus/documents/customers/notices/meridian_notice-of-material-cost-adjustment_harborview_2025-04-14.md` (outgoing notice, cites LWP 2025-03-10 and NCS 2025-01-06 supplier notices, effective for WOs on/after 2025-05-15)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: affected, direction recovery (from Meridian's perspective — cost passes to customer), already operative since May 2025. A later agent should confirm the mechanism has been kept current for tariff changes after April 2025 (Proc 11021, 11032, and the Section 122 surcharge and its 2026-07-24 expiry) — i.e., is Meridian still charging a surcharge tied to an expired Section 122 authority on this contract too (mirrors the GPC decoy in B28)?
  - Plants: PASS_THROUGH_HARBORVIEW
  - Verify: the notice's 30-day timing (issued 2025-04-14, effective for WOs from 2025-05-15 — that's 31 days, VERIFY it satisfies "thirty (30) days' prior written notice").

- **B06** · S4 · Same customer relationship, a later partial concession waiving the very pass-through right in B05 (Harborview, CA properties only) — should not be read as a permanent amendment.
  - Trigger: none directly (concession is contract-internal), but relevant to whether findings from TR-01/TR-02 changes after 2026-03-15 re-activate the pass-through.
  - Docs: `corpus/documents/customers/notices/meridian_pricing-concession-letter_harborview_2025-09-02.md` (role: mfn, l2_link, plant `concession_ca_customer_not_triggering_tx_only_mfn`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected after 2026-03-15 (waiver window: WOs issued 2025-09-15 through 2026-03-16 only, CA properties only) — as of the 2026-10-01 as-of date the waiver has already lapsed, so the B05 pass-through is fully live again; a finding that still treats the pass-through as waived as of Oct 2026 is a dated-reasoning error (see M1 metamorphic relevance).
  - Plants: concession_ca_customer_not_triggering_tx_only_mfn
  - Verify: letter explicitly states "does not amend the Agreement" — confirm no other customer's MFN (e.g. Crestline B01, Texas-only) is triggered by this CA-only, single-customer accommodation — it should not be, per the plant id's own name.
  - Realism: none — this is the designed decoy pairing with B01/B26.

- **B07** · S4 · State-contract "no tariffs approved" prohibition collides with the base contract's own no-escalation clause (WA DES 04224).
  - Trigger: TR-01 (any copper-duty change) and TR-02 (Section 122 surcharge)
  - Docs: `corpus/documents/customers/wa-des-04224_hvac-services-contract/01_contract-04224_hvac-services_2025-09-10.md` — §3.4 "Economic Adjustments for Part Rates" ("will not be adjusted... no other economic adjustment") and §3.5 "Price Ceiling" (role: tariff, fixed_price, price_ceiling); `.../04_contract-summary-and-ordering-instructions_as-published.md` — "TARIFFS: No tariffs have been approved for this Contract. Any additional fees proposed by the Contractor are not authorized or allowed." (role: tariff, surcharge_prohibition)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: affected, direction exposure, materiality material, urgency no clock, response_type "monitor" or "brief finance" — not "exercise pass-through" (that option is explicitly foreclosed twice, at the contract and the web-published summary layer). A finding that recommends invoicing a tariff surcharge on this stack would be a hard miss.
  - Verify: whether any of the four purchase orders under this contract (WA-DOC-CRCC, WA-PARKS-07, WA-UWT-22, WA-WSDOT-OR) post-date a relevant tariff change and thus carries unrecovered cost.
  - Realism: none — deliberate should-not-flag-for-relief case.

- **B08** · S4 · Indexed (not indexed-to-tariff) pricing creates a lagging, indirect exposure rather than a direct pass-through (San Marcos Bend job-order contract; Lakeport reference contract task orders).
  - Trigger: TR-01, TR-02
  - Docs: `corpus/documents/customers/city-of-san-marcos-bend_on-call-plumbing-job-order-contract_2023-10-03.md` — "City Cost Index (CCI)" / RSMeans-based pricing definitions (role: tariff, indirect_escalator); `corpus/documents/customers/work-orders/JO-2026-009_...md` (RSMeans coefficient pricing); `corpus/documents/customers/work-orders/TO-134953-0452_...md` ("Firm fixed price for this Task Order ... based on the Contract pricing in effect on the Task Order date. Invoices that include price or wage escalations will be rejected unless the Contract expressly provides for them.")
  - Inputs: as-of 2026-10-01; profile default
  - Expected: undeterminable/materiality-pending — RSMeans line-item costs update on their own publication cycle, not on the tariff's effective date, so the exposure exists but its size and timing can't be read off these documents alone; each individual task order is fixed at the price in effect on its date, so no direct clause-level pass-through exists on the LKP task orders either.
  - Verify: RSMeans update cadence (external fact, not in corpus) — flag as an open question rather than a computed fact.
  - Realism: this is a genuine "the agent should say undeterminable, not guess" case; flag as a good calibration target for the materiality label's abstention behavior.

- **B09** · LBL / S5-link (customer-side half) · Illinois pricing letter to Northbrook Commons Condominium Association — a candidate MFN trigger for Sunpoint (see B21/B25 for the full cross-stack pairing).
  - Trigger: none directly
  - Docs: `corpus/documents/customers/notices/meridian-illinois_pricing-letter-agreement_northbrook-commons_2026-02-17.md` — "labor at prevailing wage plus 34% markup, and (2) no tariff or material surcharge on copper tube, fittings or HVAC equipment, which will be invoiced at Meridian's cost plus 12%" (role: mfn, l2_link, il, plant `il_concession_triggers_sunpoint_mfn`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: material — **the primary MFN trigger is the markup gap itself (labor PW+34% vs. Sunpoint's PW+42%; materials cost+12% vs. Sunpoint's cost+15%), per `legal-questions.md` Q3, not merely the tariff-surcharge waiver** (which is a secondary, additive basis under the clause's "waiver or reduction of any surcharge" language). Northbrook Commons is now a named counterparty in `corpus/company/profile.yaml` (CUS-NBC, added 2026-09-29 alongside residential customers CUS-RES). Sunpoint's MFN (B02) reaches any IL commercial customer for "comparable Services," and the service-type overlap here (HVAC/boiler/plumbing maintenance and repair) is strong.
  - Verify: whether Northbrook Commons' condo-association mechanical maintenance is "comparable" in scope/volume to Sunpoint's school-district contract (a real GC would question comparability, not just same-state); whether a condominium association is a "commercial customer" at all (arguable — it's a business entity buying services for common elements, but the profile's revenue mix treats commercial and residential as separate categories).
  - Realism: comparability is a judgment call worth flagging, not a mechanical yes.

## S4 — Subcontracts

- **B10** · S4 · Fixed subcontract price via PO, no escalation clause found anywhere in the agreement — full tariff cost exposure, no contractual relief (Bridgewell, Solara Fab).
  - Trigger: TR-01, TR-02
  - Docs: `corpus/documents/subcontracts/bridgewell-construction_master-subcontract-solara-fab/01_service-agreement-subcontract_2025-04-14.md` — §6 "The Contract Price" ("may only be changed by a Change Order") (role: flow_down, anti_indemnity, tariff)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: absence finding — searched §6 (Contract Price), §3 (bonds), full text for "tariff"/"duty"/"escalat"; no price-adjustment or escalation clause exists. Direction exposure, materiality material if copper/HVAC volume is significant on a semiconductor fab job, urgency no clock, response_type "renegotiate" or "seek Change Order."
  - Verify: dollar value and copper/HVAC content of this subcontract (not stated in the base agreement; likely in the referenced Purchase Order, not in corpus) — flag as open_question.
  - Realism: none.

- **B11** · S4 · Escalation cascade with an 8% threshold and a 21-day forfeiture window — already exercised once (Cascade Ridge, Puyallup medical office).
  - Trigger: TR-01 (the LWP/NCS supplier tariff surcharges cited in the REA are downstream of TR-01 rate changes); TR-02 tangentially (IEEPA-era duties predate the REA)
  - Docs: `corpus/documents/subcontracts/cascade-ridge-contractors_subcontract-puyallup-medical-office/01_subcontract-agreement_2025-03-17.md` — §4 "Material Price Escalation" (role: tariff, escalation_clause, notice_deadline, plant `ESCALATION_CASCADE`: 8% threshold measured from Feb 10, 2025 bid date, 21-day request window); `.../02_request-for-equitable-adjustment_2025-05-12.md` (plant `escalation_request_after_21_day_window`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: **the REA appears untimely** — Meridian received the LWP price-increase notice by March 12, 2025 (per the REA's own recitation); the 21-day window runs to approximately April 2, 2025; the REA is dated May 12, 2025, roughly 61 days later. §4's own text: "requests not timely submitted are waived." A correct finding should flag this as likely forfeited, not as a live $61,380 claim — this is the forfeitable-clock LBL case (see B39).
  - Plants: ESCALATION_CASCADE, escalation_request_after_21_day_window
  - Verify: exact date Meridian "received" the LWP notice vs. the notice's own date (March 10 sent, March 12 received per REA) — the 21-day clock likely runs from receipt; also confirm whether NCS's Feb 5, 2025 surcharge (pre-dating the March 12 LWP receipt) has its own, separately-run and possibly also-expired 21-day clock.
  - Realism: this is the strongest "hidden false not-material" risk in the package if an agent treats a stale claim as live, or the mirror error if it dismisses it without checking the receipt-date math — both are wrong for different reasons; a careful agent should show the arithmetic.

- **B12** · S4 · Firm price, explicitly non-recoverable except to the extent recovered from the Owner — and a live example of that clause being invoked to deny a claim (Titan Peak Builders, FM 1960 Interchange, TxDOT federal-aid).
  - Trigger: TR-01
  - Docs: `corpus/documents/subcontracts/titan-peak-builders_subcontract-fm-1960-interchange/01_subcontract-agreement_2024-09-03.md` — §3.1 "Firm Price" (role: tariff, firm_price, flow_down, federal_aid, plant `FIRM_PRICE_TITAN`); `.../03_change-order-1_2025-06-30.md` ("Subcontractor's request for material price escalation on copper piping dated June 2, 2025 is denied; see Section 4 (Firm Price)")
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected for direct relief — Firm Price bars any tariff-cost increase "except to the extent Contractor actually recovers a corresponding increase from the Owner under the Prime Contract, and then only in the amount so recovered." CO1 confirms Titan Peak already denied a copper-escalation request on this reasoning. The live open question is whether the Prime Contract (TxDOT, federal-aid, not in this stack) gives Titan Peak any recovery right that could flow back — an absence finding, since the Prime Contract text isn't in the corpus.
  - Plants: FIRM_PRICE_TITAN
  - Verify: whether Exhibit C (FHWA-1273 required contract provisions, in this cluster) contains any price-adjustment flow-down — read `02_exhibit-c_form-fhwa-1273-required-contract-provisions.md` if pursuing this further (not yet read for this package; Package A or a later agent should confirm federal-aid contracts of this era carry a standard price-adjustment clause).
  - Realism: this is a real construction-law pattern (contingent pass-through tied to the prime); flag as a genuine "needs review," not a clean negative.

- **B13** · S4 · Prime-contract flow-down with no visible tariff-specific clause; whatever relief exists lives in a document not in this stack (Lakemont, Naperville Library). **Now an expired subcontract** (`SUBK-LMC-01`, expiry 2026-08-31, "warranty period ended" per `manifest.jsonl`).
  - Trigger: TR-01, TR-02
  - Docs: `corpus/documents/subcontracts/lakemont-construction-group_subcontract-naperville-library_2023-06-12.md` — §2.5 "Flow-Down of Prime Contract Obligations," §2.6 (Prime Contract Amendments notice, 5 business days), §6.8 "Flow-Down" (role: flow_down, l2_link, plant `FLOWDOWN_LAKEMONT`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: absence finding, undeterminable — the flow-down clause pulls in "all provisions ... applicable to Subcontractor's scope," but the Prime Contract itself (dated 2023-03-15, Naperville Public Library) is not in the corpus; whether it contains a material-price-escalation clause that would flow down to Meridian is unknown. A correct absence finding must say where it searched (this subcontract's full text; no Prime Contract on file) per V7. **Expired-status framing per CHANGES-2026-09-29.md §C5:** the correct gold is **"not affected (expired)"** rather than an open monitoring item — no REA or change-order document in this stack ever invoked §2.5/§2.6 for a tariff cost during the active term, so there is no evidence of an accrued claim to carry forward past the 2026-08-31 expiry (contrast with Sunpoint B02, where an accrued claim is affirmatively evidenced). The undeterminable/absence framing above still governs *whether* a right existed; the expiry only closes off any *new* claim now, and the corpus surfaces no old one either.
  - Plants: FLOWDOWN_LAKEMONT
  - Verify: whether §2.6's 5-business-day amendment-notice obligation has ever been triggered by a Prime Contract change order addressing tariff costs (no evidence in this stack either way).
  - Realism: deliberate corpus gap — see Gaps section.

## S4 — Corporate

- **B14** · S4 · Credit-agreement covenant requiring notice of a tariff-driven Material Adverse Effect (First Harbor Bank).
  - Trigger: TR-01 (Proclamation 11021, 2026-04-06 and 11032, 2026-06-08) — the operative test is "increase the Borrower's material costs by more than ten percent (10%)"
  - Docs: `corpus/documents/corporate/first-harbor-bank_credit-agreement/04_amendment-2_2025-03-26.md` — new covenant §2.3(b)–(c) "Material Adverse Effect Notice" (5 Business Days of actual knowledge) (parent: CORP-CREDIT-01)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: urgency obligation clock (recurring — triggers on each qualifying event, not a one-time deadline); materiality test is structural (>10% cost increase) rather than dollar-threshold; a correct finding should note that failure to give notice is *not itself* an Event of Default ("shall not, standing alone, constitute...") — a materiality/severity nuance an eval should catch if an agent over-escalates this to a breach.
  - Verify: whether Meridian's tariff cost increase (see B17's $1,140,000 figure) crossed the >10% "material operating costs" threshold in aggregate, and whether the required notice was ever given (no notice document in the corpus — open question).

- **B15** · S4 / S5-link anchor · FCCR covenant breach explicitly attributed in part to unrecovered tariff costs on fixed-price customer contracts.
  - Trigger: TR-01, TR-02 (aggregate effect)
  - Docs: `corpus/documents/corporate/first-harbor-bank_credit-agreement/05_compliance-certificate_fiscal-quarter-ended-2026-06-30.md` — item 1 (FCCR 1.23:1.00 vs. 1.25:1.00 minimum, effective 2026-01-01 per Amendment 2 reversion) and item 3 ("$1,140,000 of unrecovered tariff-related material cost increases absorbed on fixed-price customer contracts") (parent: CORP-CREDIT-01; plant `fccr_breach_linked_to_tariff_costs`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: affected, material, direction exposure, urgency obligation clock (a covenant breach is already a live Event of Default subject to a requested waiver) — response_type "brief finance" / "escalate to outside counsel." This is the headline cross-stack finding of the package: fixed-price/no-relief stacks (VMS B03, WADES B07, TPB B12, BHC B10) are the plausible sources of the $1,140,000, per B27.
  - Plants: fccr_breach_linked_to_tariff_costs
  - Verify: the FCCR minimum reverted to 1.25:1.00 on 2026-01-01 per Amendment 2 §2.2 — confirm the compliance certificate's "minimum required: 1.25:1.00 from January 1, 2026" matches; confirm whether a waiver was in fact granted (certificate only requests one, dated 2026-08-12).

- **B16** · S4 (should-not-flag) · Utility-rate "tariff" is a CPUC filed-rate schedule, not a trade tariff — a lexical decoy (San Jose branch lease).
  - Trigger: TR-01, TR-02, TR-03 (all — this decoy applies to any of the three)
  - Docs: `corpus/documents/corporate/lease_san-jose-branch_2021-02-01.md` — §5.1 "Utilities" (role: distractor, tariff_lookalike, plant `LEASE_UTILITY_TARIFF_SJC`)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected — "the applicable utility provider's filed tariff, as amended ... by the California Public Utilities Commission" is a regulatory filed-rate schedule for electricity/gas/water, unrelated to import duties. A finding that flags this clause for any of TR-01/02/03 is a clean false positive.
  - Plants: LEASE_UTILITY_TARIFF_SJC
  - Realism: none — designed decoy.

- **B17** · S4 (should-not-flag) · Insurance stacks (CGL, auto, umbrella, certificates of insurance) have no tariff nexus.
  - Trigger: TR-01, TR-02, TR-03
  - Docs: `corpus/documents/corporate/insurance_commercial-general-liability-policy_2026-2027.md`, `insurance_business-auto-policy_2026-2027.md`, `insurance_commercial-umbrella-policy_2026-2027.md`, and the certificates-of-insurance directory (role: insurance, additional_insured — none carry a `tariff` role)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected / out of scope — a targeted grep confirmed no "tariff/duty/duties" language in the CGL policy body. These stacks belong to a different eval area (contractual additional-insured requirements, e.g. plant `INS_CONTRACTUAL_AI`) and should be pruned early for the tariff triggers rather than analyzed.
  - Realism: none — a correctly-scoped run should exclude these at Stage 3, not spend a subagent on them.

- **B18** · S4 (should-not-flag, batch) · Other corporate leases and equipment/fleet leases carry no tariff clause of any kind.
  - Trigger: TR-01, TR-02, TR-03
  - Docs: `corpus/documents/corporate/lease_dallas-branch-and-showroom_2022-10-01.md`, `lease_elk-grove-village-branch_industrial-building-lease_2020-03-01.md`, `lease_houston-branch_4204-fidelity-road_2018-06-01.md`, `lease_sacramento-headquarters/*`, `lease_tacoma-branch_2019-08-01.md`, `northwind-equipment-finance_master-equipment-lease-agreement_2022-09-01.md`, `summit-fleet-leasing_master-equity-lease/*` (all role: distractor)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected / pruned at Stage 3.
  - Realism: none.

## S4 — Vendors (all should-not-flag / decoys)

- **B19** · S4 (batch, should-not-flag) · Vendor NDAs, SaaS terms of service, and service agreements carry generic "taxes and charges" language but no tariff-specific clause and no tariff role in the manifest.
  - Trigger: TR-01, TR-02, TR-03
  - Docs: `corpus/documents/vendors/form_mutual-nondisclosure-agreement_rev-2022.md` and its three signed instances (Fieldflow, First Harbor Bank, Great Plains Copper Tube, Summit Valley Plumbing — all `template_instance`); `fieldflow-software_terms-of-service_2026-01-15.md`; `paystream-technologies_services-agreement_2026-03-01.md`; `promatch-networks_terms-of-use_2026-02-01.md`; `roadiq-telematics_platform-terms-of-service_2025-07-01.md`; `cintrella-uniform-services_rental-service-agreement_2021-05-03.md`; `greenline-disposal_waste-and-recycling-services-agreement_2023-01-01.md`; `homehero-leads_master-services-agreement_2022-02-05.md`; `summitlift-equipment-rentals_master-rental-agreement_2024-04-15.md`; `valleywave-media_advertising-agreement_2026-01-05.md`
  - Inputs: as-of 2026-10-01; profile default
  - Expected: not affected / pruned — none of these carry a `tariff` role in the manifest, and none involve imported HVAC/copper materials. Included here as should-not-flag volume for precision measurement, not because any single one is interesting.
  - Realism: none.

## S5-link — Cross-stack (L2) links

- **B20** · S5-link (supplier pass-through → fixed-price customer, no relief) · Same LWP/NCS tariff surcharges land differently depending on the customer stack's pricing clause.
  - Link: (`corpus/documents/supply/supplier-notices/lakeshore-waterworks-pvf_price-increase-notice_2025-03-10.md` [A], `corpus/documents/customers/harborview-realty-partners_facilities-maintenance-msa_2022-03-01.md` [B05]) — type: pass_through_allowed
  - Link: (same supplier notice [A], `corpus/documents/customers/valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md` [B03]) — type: pass_through_blocked_absorbed
  - Link: (same supplier notice [A], `corpus/documents/customers/wa-des-04224_hvac-services-contract/04_contract-summary-and-ordering-instructions_as-published.md` [B07]) — type: pass_through_prohibited
  - Inputs: as-of 2026-10-01; profile default
  - Expected: three-way contrast — the same upstream cost event produces recovery (HRP), silent absorption (VMS), and a compliance risk if attempted (WADES). This is the package's clearest "cross-stack intelligence" test for Stage 5.
  - Verify: relative dollar exposure on each stack (VMS annual fee $486,000; WADES purchase-order volumes; HRP quarterly PM fee schedule not read in this pass).

- **B21** · S5-link (concession → MFN, positive) · Illinois pricing letter to Northbrook Commons triggers Sunpoint's statewide MFN — primarily on the markup gap, not the surcharge waiver.
  - Link: (`corpus/documents/customers/notices/meridian-illinois_pricing-letter-agreement_northbrook-commons_2026-02-17.md` [B09], `corpus/documents/customers/sunpoint-public-schools-cooperative_mechanical-services-contract/01_mechanical-services-contract_2021-07-01.md` [B02] — §3 unnumbered MFN paragraph + §3.1/§3.2) — type: mfn_trigger
  - Inputs: as-of 2026-10-01; profile default
  - Expected: link found — same state (IL), "comparable Services" argument plausible. **Required spans per `legal-questions.md` Q3: the Sunpoint MFN paragraph + §3.1/§3.2 markups + the Northbrook letter's pricing sentence.** The markup gap alone triggers the clause (labor PW+42% vs. PW+34%, materials cost+15% vs. cost+12%); the surcharge waiver is a secondary, additive basis. Sunpoint's contract is expired at the default as-of (2026-06-30), but the claim survives for the **2026-02-17 → 2026-06-30** window per §5.6 Continuation of Obligations — this link should be scored "found," not suppressed because the base contract has since expired. Plant ids on both ends (`il_concession_triggers_sunpoint_mfn`, `MFN_SUNPOINT`) confirm this is a designed positive pair.
  - Plants: il_concession_triggers_sunpoint_mfn, MFN_SUNPOINT
  - Verify: whether a condominium association is a "commercial customer" under the clause (real ambiguity, not resolved by the corpus); whether any annual MFN compliance certification was signed after 2026-02-17 (a second, independent inaccurate-certification exposure).

- **B22** · S5-link (concession → MFN, negative / decoy) · California-only Harborview concession should NOT trigger Crestline's Texas-only MFN.
  - Link: (`corpus/documents/customers/notices/meridian_pricing-concession-letter_harborview_2025-09-02.md` [B06], `corpus/documents/customers/crestline-retail-trust_master-services-agreement/01_master-services-agreement_2023-05-15.md` [B01]) — type: mfn_no_trigger (different state, different customer, CRT's MFN is scoped to "the same State")
  - Inputs: as-of 2026-10-01; profile default
  - Expected: link correctly *not* found — a predicted link here is a false positive. Plant id `concession_ca_customer_not_triggering_tx_only_mfn` names this explicitly. The 2025-09-02 concession date falls within Crestline's then-active term (2023-05-15 → 2026-05-14); the negative-link reasoning is the state/customer scope mismatch, not Crestline's now-expired status at the 2026-10-01 default as-of (see B01).
  - Plants: concession_ca_customer_not_triggering_tx_only_mfn, MFN_CRESTLINE
  - Realism: none — this is the designed negative-pair test; scoring must treat "correctly not linked" as a pass, not silence.

- **B23** · S5-link (fixed-price absorption → credit covenant) · Fan-in of unrecovered tariff costs from multiple no-relief customer/subcontract stacks into the FCCR breach.
  - Link: (`corpus/documents/customers/valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md` [B03], `corpus/documents/corporate/first-harbor-bank_credit-agreement/05_compliance-certificate_fiscal-quarter-ended-2026-06-30.md` [B15]) — type: cost_exposure_to_covenant
  - Link: (`corpus/documents/customers/wa-des-04224_hvac-services-contract/01_contract-04224_hvac-services_2025-09-10.md` [B07], same compliance certificate) — type: cost_exposure_to_covenant
  - Link: (`corpus/documents/subcontracts/titan-peak-builders_subcontract-fm-1960-interchange/01_subcontract-agreement_2024-09-03.md` [B12], same compliance certificate) — type: cost_exposure_to_covenant
  - Inputs: as-of 2026-10-01; profile default
  - Expected: links found, but with an honest "undeterminable" on exact dollar attribution — the compliance certificate reports one aggregate figure ($1,140,000); the corpus doesn't itemize it by stack, so a finding claiming a specific dollar split per stack would be fabricating precision. Correct output: qualitative link plus "contributing stacks include X, Y, Z; exact allocation not stated."
  - Realism: flag this precision trap explicitly — it's an easy place for a model to overstate confidence.

- **B24** · S5-link (supply surcharge continuing past its legal trigger's expiry → customer pass-through) · GPC's Section 7(g) tariff surcharge, tied by its own definition to Proclamation 11012 (Section 122), still being invoiced a month after that proclamation expired. **Updated 2026-09-29: the underlying PO now splits across two invoices with different dispositions — this scenario covers GPC-INV-26-1911 only (the clean-overcharge leg); see Package A's S4-GPC-05 for the fittings/needs-review sibling (GPC-INV-26-1912), which this package cites only as a contrast, not a customer-side link.**
  - Link: (`corpus/documents/supply/great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` [A] + `corpus/documents/supply/invoices/GPC-INV-26-1911_great-plains-copper-tube_2026-08-21.md` [A, plant `surcharge_after_section122_expiry`], `corpus/documents/customers/crestline-retail-trust_master-services-agreement/02_amendment-1_rate-adjustment_2025-06-01.md` [B01] and `corpus/documents/customers/harborview-realty-partners_facilities-maintenance-msa_2022-03-01.md` [B05]) — type: surcharge_pass_through_post_expiry
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-02-20_proclamation-11012-section-122-surcharge.txt` (expires 2026-07-24 per meta.yaml)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: **recovery opportunity, now a confident overcharge — not needs review** (revised from the prior draft, which treated this as ambiguous before the invoice split existed). GPC-INV-26-1911 covers copper water tube only, made "from imported refined copper cathode (HTS 7403.11)"; the invoice itself now names "Section 122 Tariff Rate 10% (Proclamation 11012)" explicitly, and HTS 7403 (cathode) is affirmatively excluded from every §232 copper Annex (Package A's derived scope notes) — so there is no successor-duty theory available to re-anchor this specific charge. Section 7(g)'s broad "Tariff Charges" definition doesn't rescue it: the successor-duty clause only helps if a successor duty actually applies to the product on the invoice, and none does here. Downstream, CRT AMD1 (B01, now itself expired — see B01) and HRP-MSA (B05, still active) define their pass-through by product (copper tube/fittings/HVAC equipment), so this line item would flow through to whichever customer's job it was billed against; the customer-side finding should flag the same overcharge, not merely note it disappeared into a "tariff surcharge" bucket.
  - Verify: confirm which customer job(s), if any, GPC-INV-26-1911's copper tube was billed against (not traceable from this stack alone — an open_question, not a resolved fact)
  - Plants: surcharge_after_section122_expiry
  - Realism: still a strong "faithful hop, now with a confident conclusion" scenario — worth contrasting explicitly with GPC-INV-26-1912 (fittings), where the same-looking "10% less 5%" surcharge is a genuine needs-review case because fittings actually are §232-covered.

- **B25** · S5-link (supplier pass-through, no refund clause → recovery gap) · Keystone Plumbing Supply passes through IEEPA duty cost with no contractual refund pass-back if CBP later refunds the underlying duty.
  - Link: (`corpus/documents/supply/invoices/KPS-417-601877_keystone-plumbing-supply_2025-09-24.md` [A, plant `ieepa_duty_passthrough_no_refund_clause`] + `corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2025-06-08.md` [A] — no "refund" language found anywhere in the terms except a warranty-refund remedy, unrelated to duties) — type: refund_chain_gap
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/2026-07-08_cbp-ieepa-refunds-pra-notice.txt` and `2026-09-02_cbp-ieepa-duty-refunds-page.txt`
  - Inputs: as-of 2026-10-01; profile default
  - Expected: recovery opportunity (flag for finance/legal) — CBP's post-*Learning Resources* refund process runs to the importer of record; whether that's KPS or Meridian on these shipments determines who can even file. Contrast with the Hai Phong Precision Brass entries (`corpus/documents/supply/customs/MX7-2291846-3_entry-summary-and-broker-invoice_2025-07-28.md`, plant `meridian_is_ior_ieepa_refund_eligible`), where Meridian is expressly named IOR and the broker note flags refund eligibility directly.
  - Plants: ieepa_duty_passthrough_no_refund_clause, meridian_is_ior_ieepa_refund_eligible
  - Verify: importer of record on the KPS shipping terms (FCA Seller's facility, Incoterms 2020 — this term alone doesn't establish who files as IOR for U.S. customs purposes; needs the KPS master terms' title/risk-of-loss provisions, not yet read for this package).

- **B26** · S5-link (one-way ratchet → downstream contracts that don't decrease either) · Northaire's tariff surcharge survives a Section 232 rate decrease, and downstream pass-through/indirect-escalator customer contracts inherit the same one-way stickiness.
  - Link: (`corpus/documents/supply/supplier-notices/northaire-comfort-systems_dealer-bulletin_2026-06-15.md` [A, plant `ratchet_after_tariff_decrease`], `corpus/documents/customers/harborview-realty-partners_facilities-maintenance-msa_2022-03-01.md` [B05] and `corpus/documents/customers/city-of-lakeport_hvac-reference-contract/` task orders [B08]) — type: ratchet_pass_through
  - Trigger: `corpus/triggers/TR-01-copper-section-232/2026-06-01_proclamation-11032.txt` (moved residential HVAC into a reduced tier effective 2026-06-08)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: recovery opportunity — Northaire's bulletin states "prices adjusted for tariffs and trade policy are not subject to decrease" as its own house policy, not as a term Meridian agreed to; worth testing whether NCS's dealer agreement or T&Cs actually contain a no-decrease clause Meridian is bound by, versus a unilateral assertion. Downstream, if Meridian is still paying NCS's frozen 6% and passing that cost basis through to HRP or LKP customers, the customer-facing number may now be stale relative to the lower tariff.
  - Verify: whether `corpus/documents/supply/northaire-comfort-systems_authorized-dealer-agreement_2020-01-15.md` or the NCS terms-of-sale actually contain a no-decrease/ratchet provision (Package A territory; cite only).

- **B27** · S5-link (escalation cascade, flow-down incompleteness) · Cascade Ridge's own recovery from its Project Owner is not visible in this stack, so the REA's ultimate fate (beyond the timeliness question in B11) can't be traced end to end.
  - Link: (`corpus/documents/subcontracts/cascade-ridge-contractors_subcontract-puyallup-medical-office/02_request-for-equitable-adjustment_2025-05-12.md` [B11], [no prime contract document in corpus]) — type: flow_down_chain_incomplete
  - Inputs: as-of 2026-10-01; profile default
  - Expected: absence finding — a correct agent should say it could not determine whether Cascade Ridge (as general contractor) has its own escalation right against the Puyallup medical office Project Owner, because the prime contract is not in the vault; should not assume either a recovery or a denial.
  - Realism: deliberate corpus gap, paired with B13.

## Legal-status / term resolution

- **B37** · V5 / legal-status / M1 · **New 2026-09-29** — Sunpoint's term
  history is now papered as a real amendment/notice chain rather than
  narrated in the base contract, and is a strong version-resolution and
  as-of-shift test in its own right, independent of the MFN finding in B02.
  - Docs: `corpus/documents/customers/sunpoint-public-schools-cooperative_mechanical-services-contract/01_mechanical-services-contract_2021-07-01.md` — §5.1 Initial Term (2021-07-01 → 2024-06-30), §5.2 Renewal Options (two successive one-year options, ≥60 days' notice), §5.3 Termination by Passage of Time (renumbered from old §5.6); `.../02_notice-of-renewal_first-option_2024-04-15.md` (first renewal, to 2025-06-30); `.../03_notice-of-renewal_second-option_2025-04-14.md` (second and final renewal, to 2026-06-30); `.../04_notice-of-expiration-and-resolicitation_2026-04-20.md` (confirms no options remain, expiry 2026-06-30, no new Task Orders after that date, re-solicitation under RFP SPSC-2026-08); `corpus/documents/customers/work-orders/WO-SPS-2026-02_sps_2026-05-26.md` (issued 2026-05-26, within term; "Requested completion: July 9, 2026," after expiry — permitted under §5.3's "complete all work remaining under existing Task Orders")
  - Trigger: none (contract-mechanics / term-status scenario, not trigger-driven)
  - Inputs: **as-of variants** — (a) 2024-05-01 (after first renewal notice, contract now runs to 2025-06-30); (b) 2025-05-01 (after second renewal notice, contract now runs to 2026-06-30, no options remain); (c) 2026-07-15 (after expiration notice and after WO-SPS-2026-02's completion date — contract expired, work order properly closed out under §5.3); profile default; custom prompt none
  - Expected: legal_status = active at (a) and (b) with the then-current term end date correctly resolved from the most recent renewal notice (not the original 2024-06-30 initial-term date); legal_status = expired at (c), with WO-SPS-2026-02 correctly treated as validly issued (within term) and validly completed post-expiry (per §5.3, not a breach or an anomaly). A finding that reads only the base contract's §5.1 and reports "expires 2024-06-30" at any as-of after 2024-04-15 is a stale-version/V5 failure — the renewal notices are the operative amendments.
  - Verify: renewal notice timing against §5.2's "at least sixty days prior to the expiration of the then-current term" (2024-04-15 notice for a 2024-06-30 expiry = 76 days; 2025-04-14 notice for a 2025-06-30 expiry = 77 days — both timely)
  - Plants: none (this is the corpus-defect fix itself, not a planted feature — see CHANGES-2026-09-29.md §B)
  - Realism: this replaces a real corpus defect (the 2021-dated base contract previously *narrated* the 2024/2025 renewals and a "pending" 2026 renewal in present tense, which a 2021 document cannot do) with a proper amendment/notice chain — good M1 (as-of shift) material precisely because the correct term end date changes three times across the life of the contract and an agent must follow the latest notice, not the base contract alone.

## S3 — Scope (relevant-stack sets and pruning)

- **B28** · S3 · TR-01 (Section 232 copper) relevant-stack set within Package B's areas.
  - Trigger: `corpus/triggers/TR-01-copper-section-232/` (all real versions; exclude the two DISTRACTOR files — aluminum proclamation and DPA critical-minerals determination — which name different HTS scope)
  - Docs (relevant, this package's areas): customers — CRT (B01), SPS (B02), VMS (B03), HRP-LUMPSUM (B04), HRP-MSA (B05/B06), WADES (B07), LKP + SMB (B08); subcontracts — BHC (B10), CRC (B11), TPB (B12), LMC (B13); corporate — CREDIT-04/CC (B14/B15)
  - Docs (pruned, this package's areas, with reason): all vendor stacks (B19, no tariff role); insurance policies and COIs (B17, no tariff nexus); non-SJC corporate leases (B18, no tariff clause); lease SJC (B16, utility-rate lookalike, wrong kind of "tariff"); acquisitions and employment areas (out of package scope; also no tariff role in manifest)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: scope recall target 100% on the "relevant" list above; pruning credit for the "pruned" list. **Note:** CRT (B01), SPS (B02), and LMC (B13) are now `status_at_as_of: expired` at the 2026-10-01 default — per CHANGES-2026-09-29.md §C5, expiry does not itself justify pruning them; they stay on the "relevant" list, but the finding for each must resolve to an explicit "not affected (expired)" or "affected (accrued/surviving right)" disposition (SPS: accrued, per B02; CRT and LMC: not affected/no accrued claim found, per B01/B13) rather than a silent exclusion.
  - Verify: confirm no `tariff`-role document in `customers/**`, `subcontracts/**`, `corporate/**`, or `vendors/**` was left off the relevant list (cross-check against the manifest role filter used to build this package).

- **B29** · S3 · TR-02 (IEEPA/SCOTUS/Section 122/refunds) relevant-stack set within Package B's areas.
  - Trigger: `corpus/triggers/TR-02-ieepa-tariffs-scotus/`
  - Docs (relevant): CREDIT-04/CC (B14/B15, "tariff-related cost" language is broad enough to include IEEPA-era costs, not only Section 232); HRP-MSA and its notices (B05/B06, mechanism is duty-source-agnostic — "tariffs, duties, or other governmental charges"); CRT AMD1 (B01, same duty-source-agnostic drafting, now expired — see B01/B28); WADES (B07, prohibition is duty-source-agnostic too — still relevant to confirm no relief regardless of legal basis); VMS (B03, same); GPC surcharge chain (B24, direct Section 122 dependency — the underlying PO now splits across GPC-INV-26-1911, a clean post-expiry overcharge, and GPC-INV-26-1912, a needs-review §232-successor case; see Package A S4-GPC-03/05) and KPS refund-chain gap (B25) as link endpoints
  - Docs (pruned): lease SJC (B16); insurance (B17); non-SJC leases (B18); vendor decoys (B19); LKP/SMB indirect-escalator stacks are borderline — include with low confidence given no direct clause reference to duty source (see B08)
  - Inputs: as-of 2026-10-01; profile default
  - Realism: TR-02's "who does this reach" question is harder than TR-01's because most customer/corporate clauses are drafted duty-source-agnostic ("tariffs, duties, or other governmental charges") rather than citing IEEPA or Section 122 by name — flag this as a scoping-difficulty note for eval design, not a corpus defect.

- **B30** · S3 · TR-03 (AD/CVD copper pipe, Mexico) relevant-stack set within Package B's areas — **now resolved to empty at the trigger level.**
  - Trigger: `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/2026-09-21_preliminary-results.txt`; `meta.yaml` — `role: control`, `expected_relevance`: "No corpus document specifies Mexican-origin copper pipe or tube, and Meridian imports directly only from Vietnam. Expected result: no direct exposure; at most a monitor note that distributors pricing at time of shipment (Keystone, Lakeshore) could pass through any duty change." (CHANGES-2026-09-29.md §A6)
  - Docs (candidate-relevant, low confidence — retained as a should-not-overclaim precision test, not a live scope question): CRT AMD1 (B01, now expired — see B01/B28) and HRP-MSA (B05) — both define the pass-through by *product* (copper tube/fittings/HVAC equipment) rather than by *duty statute*, so an AD/CVD duty on copper pipe plausibly falls within their contract-language scope *if* Meridian ever sourced Mexican-origin pipe, which it doesn't; TPB Firm Price (B12) similarly names "taxes, duties, tariffs" generically. GPC's Section 7(g) (B24) is the interesting negative case: "Tariff Charges" is defined by cross-reference to Section 122/301/232 specifically, and antidumping/countervailing duties (Tariff Act of 1930, Title VII) arguably are not "other applicable U.S. trade laws" in the sense the drafter meant (a real GC would litigate this ambiguity, not resolve it silently) — moot in practice since GPC is a domestic (Tulsa, OK) mill, not a Mexican importer.
  - Docs (pruned): all of Package B's areas — this is the confirmed control case; WADES (B07), VMS (B03) would be correctly excluded from "recovery opportunity" even under a hypothetical AD/CVD pass-through (absolute no-adjustment language is duty-source-agnostic) but that scenario doesn't arise here.
  - Inputs: as-of 2026-10-01; profile default
  - Verify: `meta.yaml`'s control declaration is authoritative for the supply-side sourcing fact (Great Plains Copper Tube is a domestic mill; no Mexican-origin seamless copper pipe/tube anywhere in the corpus) — this package no longer needs to treat that as an open Package A dependency.
  - Realism: TR-03's downstream reach was previously flagged as depending on an unresolved country-of-origin fact; that dependency is now closed by the trigger-level control declaration (CHANGES-2026-09-29.md §A6). The residual precision test is whether an agent still over-triggers on "copper pipe" keyword matches in CRT/HRP/TPB's generically-worded pass-through clauses despite the confirmed absence of Mexican sourcing — a false positive, not a "needs review."

## S5-R1/R2/R3 — Priority tier sketch (DRAFT for Jason to validate)

- **B31** · S5-R1/R2/R3 · TR-01 scenario: Northaire's one-way ratchet after the June 2026 rate decrease (B26).
  - Tier: **act soon** (not act-now: no forfeitable clock and no covenant trigger by itself; not monitor: real dollars, a live vendor relationship, and a plausible contract argument that a "reasonable time" GC could raise now while it's fresh)
  - One-line reason: real, quantifiable overpayment (6% frozen surcharge vs. a now-reduced Section 232 tier) with a colorable renegotiation argument, but no deadline forces action this week.
  - DRAFT — Jason to validate against how a real GC would actually triage a vendor pricing dispute of this size.

- **B32** · S5-R1/R2/R3 · TR-02 scenario: FCCR covenant breach linked to unrecovered tariff costs (B15/B23).
  - Tier: **act now**
  - One-line reason: an already-existing Event of Default under a credit agreement, with a waiver only requested (not yet confirmed granted) as of the compliance certificate date — lender relationships and cross-default risk make this the highest-priority item in the package regardless of the underlying tariff mechanics.
  - DRAFT — Jason to validate; also confirm whether "waiver requested" vs. "waiver granted" should itself change the tier (arguably act-now either way, since exposure persists until confirmed).

## LBL — Label scenarios

- **B33** · LBL-materiality (with vs. without threshold) · VMS fixed-price absorption (B03) and a single WA DES purchase order (B07) sit on opposite sides of a materiality line depending on whether the GC sets a dollar threshold.
  - Docs: `corpus/documents/customers/valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md`; `corpus/documents/customers/work-orders/WA-PARKS-07_wa-des-04224-purchase-order_2026-06-22.md`
  - Inputs: as-of 2026-10-01; profile default (materiality fires by default — "shifts a recurring cost"); variant: custom prompt sets a $25,000/year materiality threshold
  - Expected: without a threshold, both are material (a cost shift exists); with a $25,000 threshold, VMS (annual fee $486,000, tariff-exposed portion plausibly well above $25k across a year) likely stays material while a single small WA DES parts PO may drop below it — label should flip on the PO-level item but not on the VMS annual relationship. (M4 relevance.)
  - Verify: dollar value of the copper/HVAC-equipment share of each, not fully computable from these documents alone (open_question).

- **B34** · LBL-direction (exposure vs. recovery) · Four stacks already read in this package land on opposite sides of the exposure/recovery axis for the same underlying tariff event.
  - Docs: `.../harborview-realty-partners_facilities-maintenance-msa_2022-03-01.md` (recovery — Meridian passes cost to customer); `.../valley-medical-services-group_hvac-maintenance-agreement_2024-01-01.md` (exposure — Meridian absorbs); `.../great-plains-copper-tube_master-supply-agreement/04_amendment-2_tariff-surcharge_2026-03-02.md` (both — Meridian pays the surcharge up but has a pro-rata rebate right if GPC is later refunded); `.../keystone-plumbing-supply_terms-and-conditions-of-sale_2025-06-08.md` (exposure, with no recovery path — B25)
  - Inputs: as-of 2026-10-01; profile default
  - Expected: direction labels exposure / recovery / both / exposure respectively, per the system-design.md §6 definition. Used to group the report, not rank it — a good scoring check is whether "both" (GPC) gets collapsed into a simpler label by mistake.

- **B35** · LBL-clock-type (forfeitable vs. obligation) · Cascade Ridge's already-lapsed 21-day escalation window (B11) vs. the credit agreement's recurring 5-business-day MAE notice duty (B14).
  - Docs: `.../cascade-ridge-contractors_subcontract-puyallup-medical-office/01_subcontract-agreement_2025-03-17.md` §4 and `.../02_request-for-equitable-adjustment_2025-05-12.md`; `.../first-harbor-bank_credit-agreement/04_amendment-2_2025-03-26.md` §2.3
  - Inputs: as-of 2026-10-01; profile default
  - Expected: Cascade Ridge is a **forfeitable clock, already run** (the right is likely gone, per the arithmetic in B11 — labelling this "obligation clock" or "clock pending" instead of naming the forfeiture would be a dangerous confusion); the MAE notice is an **obligation clock**, recurring, triggered anew by each qualifying tariff event, never fully "expired" in the same sense.
  - Verify: the receipt-date math in B11 before asserting the Cascade Ridge clock has actually run (a later agent must confirm, not assume).

- **B36** · LBL-undeterminable · Titan Peak's contingent firm-price recovery (B12) and Lakemont's flow-down absence (B13) both require a document not in the corpus to resolve.
  - Docs: `.../titan-peak-builders_subcontract-fm-1960-interchange/01_subcontract-agreement_2024-09-03.md` §3.1; `.../lakemont-construction-group_subcontract-naperville-library_2023-06-12.md` §2.5
  - Inputs: as-of 2026-10-01; profile default
  - Expected: materiality **undeterminable**, naming the missing fact explicitly (the Prime Contract / Owner-side recovery terms in each case) — not defaulted to "not material" (a dangerous confusion) and not guessed as "material" without basis. Lakemont's subcontract is now expired (`SUBK-LMC-01`, 2026-08-31); that closes off any *new* claim but doesn't resolve whether an accrued one exists — the undeterminable label still governs, it just now also covers "and this can no longer be cured going forward" (see B13).

---

## Gaps

- **Prime contracts absent for flow-down subcontracts.** TPB (B12) and LMC (B13) both depend on Owner/Prime Contract terms not present in the corpus to fully resolve a tariff-cost recovery question. A document change that would close this gap: add at least one Prime Contract excerpt (even a single price-adjustment clause) for one federal-aid and one municipal project, so the hop-complete chain can actually terminate instead of ending in a corpus-forced absence finding.
- **KPS importer-of-record status is not stated.** B25's refund-chain gap can't be fully resolved without knowing who is IOR on Keystone Plumbing Supply shipments (FCA Seller's facility alone doesn't establish it for U.S. customs purposes). A short IOR statement in the KPS master terms or a sample customs entry (parallel to the Hai Phong Precision Brass entries) would close this.
- **TR-03 country-of-origin dependency — resolved 2026-09-29.** Whether Great Plains Copper Tube (or another supplier) actually sources Mexican-origin seamless copper pipe/tube previously needed to size TR-03's downstream reach (B30) and sat outside this package's document set. `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/meta.yaml` now declares `role: control` with an explicit `expected_relevance` note confirming no Mexican-origin sourcing exists anywhere in the corpus (CHANGES-2026-09-29.md §A6) — this package no longer needs to treat it as an open dependency; see the updated B30.
- **No dollar-level itemization behind the FCCR compliance-certificate figure.** B23's fan-in link (VMS, WADES, TPB → the $1,140,000 aggregate) can't be split by stack from the documents available; an eval that expects a per-stack dollar allocation would need either a finance-schedule document or an explicit design decision that the aggregate-only figure is the intended gold fact.
- **RSMeans/CCI update cadence (B08) is an external fact**, not documentable from the corpus; any eval expecting a computed "as of when does the index reflect this tariff" answer needs either a stated assumption in the scenario or an out-of-corpus reference date supplied to the agent.
- **No customer-side document explicitly reprices after the Section 122 surcharge's 2026-07-24 expiry** other than the GPC supply-side invoice (B24); a downstream customer invoice dated after that expiry, showing whether Meridian's own surcharge-to-customer practice also lagged the expiry, would make B24's chain end-to-end observable instead of stopping at the supply layer.

---

## Revision 2026-09-29

Applied `CHANGES-2026-09-29.md` (source of truth; see §D for update rules).

- **Changed** B01 (Crestline MFN): contract now expired (`CUS-CRT-MSA`,
  2026-05-14); reframed as "not affected (expired), no accrued claim
  identified" per §C5; noted §10.6(d)'s survival list excludes the MFN
  clause; flagged the §10.2 auto-renewal/mutual-agreement drafting tension.
- **Changed** B02 (Sunpoint MFN): path moved to the new cluster file; MFN
  paragraph confirmed unnumbered within §3 (§1–§4 unchanged); reframed as
  "affected — accrued/surviving right" per §C4/§C5, with the markup gap
  (labor PW+42% vs. PW+34%; materials cost+15% vs. cost+12%) as the primary
  basis, the surcharge waiver secondary; claim window 2026-02-17 →
  2026-06-30; cited §5.6 Continuation of Obligations (renumbered from old
  §5.9) for survival; added the annual-certification exposure.
- **Changed** B09 (Northbrook concession): reframed around the markup-gap
  basis per `legal-questions.md` Q3, not the surcharge waiver alone; noted
  CUS-NBC as a newly-added profile counterparty.
- **Changed** B13 (Lakemont flow-down): subcontract now expired
  (`SUBK-LMC-01`, 2026-08-31); reframed as "not affected (expired)," no
  accrued claim evidenced, per §C5.
- **Changed** B21 (concession → MFN link): added required-spans citation
  (MFN paragraph + §3.1/§3.2 + Northbrook pricing sentence), markup-gap
  basis, and the 2026-02-17 → 2026-06-30 claim window; clarified the link
  should score "found" despite Sunpoint's current expired status.
- **Changed** B22: noted Crestline's concession-era active status vs. its
  now-expired status at the default as-of, to preempt confusing the two.
- **Changed** B24 (GPC surcharge pass-through link): revised from "recovery
  opportunity / needs review" to a confident overcharge, now that
  GPC-INV-26-1911 is confirmed cathode-sourced copper tube (HTS 7403,
  excluded from every §232 annex) with no successor-duty theory available;
  cross-referenced the new GPC-INV-26-1912 (fittings) sibling in Package A.
- **Changed** B28 (TR-01 scope): noted CRT/SPS/LMC's expired status doesn't
  justify pruning; each must resolve an explicit expired/accrued
  disposition.
- **Changed** B29 (TR-02 scope): noted the GPC invoice split and CRT's
  expired status.
- **Changed** B30 (TR-03 scope): reframed from "genuinely uncertain,
  supply-side dependency" to a confirmed-empty control case, per the new
  `meta.yaml` `role: control` declaration.
- **Changed** B36: added a one-line note tying Lakemont's expiry to the
  existing undeterminable-materiality framing (no change to the label).
- **Added** B37 (new section "Legal-status / term resolution"): the
  Sunpoint renewal-letter chain (02/03 notices, 04 expiration notice, the
  re-dated WO-SPS-2026-02) as a V5/legal-status/M1 as-of-shift scenario,
  replacing the corpus's former self-narrating-contract defect.
- **Changed** Gaps: resolved the TR-03 country-of-origin dependency entry
  (now closed by the trigger-level control declaration).
- **Removed:** no B-scenario removed.
- **Resolved VERIFY items:** TR-03's downstream-reach dependency (§A6);
  the GPC-INV-26-1911 "which trigger justifies this line item" ambiguity
  for the copper-tube leg (§A5, B24).
- **New conflicts found:** none.

- **Round 2 (2026-09-29) — B03:** urgency corrected from "no clock" to **forfeitable clock running** — §3.2 non-renewal notice due 2026-11-01 (auto-renewal would lock the fixed price through 2027).

STATUS: complete

