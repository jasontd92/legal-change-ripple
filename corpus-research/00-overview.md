# Corpus overview: document types by source (2026-09-28)

This file combines four research reports in this folder, each with full URLs,
redaction checks and generation recipes:
- `01-supply-and-tariff.md`
- `02-customer-and-subcontract.md`
- `03-employment-and-noncompete.md`
- `04-datasets-corporate-distractors.md`

**Decided:** documents from many sources are adapted into **one fictional
company** by substituting party names. Unredacted sources are preferred. Where
an otherwise ideal document is redacted, the gaps are filled from a
per-document parameter sheet and every injected value is logged in the ground
truth.

**The company:** a plumbing and HVAC company, roughly 400 employees, operating
in CA, WA, IL and TX. It buys copper heavily, grows by acquiring local shops,
and sells to commercial, public-agency and residential customers.

---

## Source category 1: public domain (government works). Fetch as-is and commit.

### Triggers: tariffs (primary sources verified)
| Document | Role |
|---|---|
| Proclamation 10962, Section 232 copper (90 FR 37727; effective 2025-08-01): 50% on copper *content*; the annex covers copper tube/pipe (HTS 7411), fittings (7412) and sanitary ware (7418.20); brass valves, water heaters and AC units are excluded | Trigger A, version 1 |
| Proclamation 11021 (91 FR 18201; effective 2026-04-06): duty charged on the *full customs value*; tiers of 50%, 25% and 10% | Trigger A, version 2 |
| Proclamation 11032 (91 FR 34085; effective 2026-06-08): residential HVAC moves to a temporary 15–25% tier (a *decrease*); the US-metal threshold drops from 95% to 85% | Trigger A, version 3 (tests the price decrease) |
| *Learning Resources v. Trump*, 607 U.S. 229 (decided 2026-02-20, 6–3): "IEEPA does not authorize the President to impose tariffs" | Trigger B (case law) |
| EO 14389 (ends IEEPA duty collection); Proclamation 11012 (a 10% Section 122 surcharge, 2026-02-24 to 07-24, not stacking on 232 duties); CBP's IEEPA refund page and PRA notice (refunds go **only to the importer of record**) | Trigger B context, and the refund chain |
| Proclamation 11045 (aluminum); DPA critical-minerals determination (excludes copper scrap); EO 14388 (de minimis) | Trigger-side distractors |

### Triggers: noncompetes
| Document | Role |
|---|---|
| **WA ESHB 1155** (Ch. 149, Laws of 2026; signed 2026-03-23; **effective 2027-06-30**). Voids all noncompetes regardless of when signed or what the employee earns. Written notice due **2027-10-01**. Treats forfeiture, training-repayment and clawback clauses *as noncompetes*. Customer non-solicits are narrowed (18 months, and only customers the employee personally dealt with). The sale-of-business exception applies only at **≥1% ownership**. Include the prior RCW 49.62 text. | Primary noncompete trigger |
| IL Public Act 103-921 (effective 2025-01-01): noncompetes **and** non-solicits void for construction employees (management, sales and owners carved out). IL threshold step-ups on 2027-01-01. | Tests loss of the fallback protection |
| CA AB 692 (Ch. 703, 2025): bans stay-or-pay and training-repayment clauses in contracts signed **on or after 2026-01-01** | Tests date logic |
| FTC rule vacated (*Ryan v. FTC*), appeal dropped 2025-09-05, rule removed 2026-02-12 (91 FR 6507) | "No-op" control |
| **FTC Rollins (Orkin) consent order**, 91 FR 21497 (April 2026): pest-control technicians in home services | A realistic federal enforcement signal |
| CA SB 699 / AB 1076 (their 2024 deadline has passed); TX SB 1318 (physicians only); WY SF 107 and the VA expansion (states the company doesn't operate in) | Negative and scoping controls |

### Public-agency contracts (unredacted records; re-paper so the Company is the contractor or supplier)
| Document family | Role |
|---|---|
| **WA DES statewide contract 04224, "HVAC Services" (2025–28)**: 7 contractors, 39–40 page text PDFs, Amendment 1 replaces the price exhibit, and a pricing spreadsheet. It says "**No tariffs have been approved for this Contract**" and caps prices. Includes the WA Title 51 indemnity waiver. | **Customer anchor.** Fixed price, so the Company can't pass costs through. Pairs as an L2 link with the supplier web terms that *do* pass tariffs through. |
| Chicago PO 134953, Trane HVAC (a 404-page piggyback on an OMNIA cooperative contract, modifications through January 2026) | A three-level stack: cooperative master, local contract, modifications |
| Chicago PO 32572, F.E. Moran ($9.15M lump sum, 20 change orders) | Lump-sum project plus change orders |
| San Antonio on-call plumbing job-order contract (70 text pages): price is a coefficient applied to the RSMeans cost book; broad indemnity that conflicts with TX Ins. Code ch. 151 | Indirect escalator (tariff arrives with the next book edition); conflict with an indemnity statute |
| Chicago supply POs with Johnson Pipe & Supply (e.g. PO 74381, "Pipes, Fittings, Valves," 2018 through revision 10 in 2026, with growing dollar increases after the tariffs) | **Supplier-side** master plus amendments. **PDFs returned HTTP 500; retry.** |
| Cook County, Chicago pre-2010 and WA 02919 binders; Sourcewell HVAC | Useful but **scanned (needs OCR)**. Lower priority. |
| Flow-down clause forms FHWA-1273 and HUD-5370 | Public-domain flow-down language for subcontracts |

## Source category 2: SEC EDGAR and CUAD (real, attribute when redistributing). Adapt with name substitution.

**Supply side** (EDGAR has almost no plumbing or HVAC supply agreements, so these borrow clause mechanics from adjacent industries):
- **CUAD Reynolds–Pactiv master supply agreement.** Unredacted; the skeleton for the copper supply MSA.
- **CUAD Upjohn/Pfizer.** Passes 100% of materials cost changes through.
- **Other CUAD supply and distributor agreements.** Loha (import, country of origin, Incoterms), Lime Energy, Agape.
- **Illumina–Natera supply agreement plus Amendments 1–11.** Amendment 11 (2026) adds a tariff surcharge that cites Proclamation 11012 and Sections 232/301, **with a refund pass-back**. This is the best real model of the refund chain. It's redacted, so fill the gaps.
- **Federal Cartridge–Orbital ATK.** A COMEX/LME metals adjustment exhibit. Redacted, so fill.
- **ElectraMeccanica.** A steel/aluminum/copper price trigger at a 5% move. Lift the clause; the rest of the document is heavily redacted.

**Customer and subcontract side:**
- **BW Industrial / Propersys subcontract** (2025, under a TSMC Arizona design-build contract). Flow-down, bonds, retainage, broad indemnity. Only contact details are redacted.
- **CUAD maintenance, O&M and service agreements.** SandRidge, UAGH, Suntron, Merit Life MSA.

**Acquisitions and employment:**
- **Buckeye Ventures / ARS filings** (a California HVAC and plumbing roll-up, CIK 1005502):
  - asset purchase agreements, e.g. Barnett Plumbing and Energy King
  - 5-year county-level noncompetes, including one signed by a **non-owner** (the decoy for the sale-of-business exception)
  - seller employment agreements
  - promissory notes
- **Legence 2026 RSU grant.** State riders for CA, IL and WA.
- **Other equity and employment documents:**
  - IES and Comfort Systems executive agreements
  - Frontdoor and ServiceMaster forfeiture-for-competition clauses
  - a Remitly WA separation agreement that reaffirms noncompetes
  - a NorthStar confidentiality and IP-assignment agreement
  - CUAD's Quaker Chemical sale-of-business noncompete and Vivint noncompete amendment

**Corporate:**
- **Limbach 2016 credit agreement and 2018 amendments.** Trim to fit a company this size.
- **Comfort Systems waivers.**
- **Enterprise Fleet master equity lease** and its maintenance agreement.
- **Industrial and warehouse leases** in IL, CA, TX and WA.

**Distractors already in CUAD:**
- "tariff" appears in pipeline and utility rate schedules
- "duties" appears in 255 documents, almost always meaning job or fiduciary duties
- Western Copper's mining noncompete mentions copper 35 times

CUAD's clause labels (MFN, price restrictions, noncompete, change of control, liability cap, and so on) can serve as partial ground truth for **whether a clause is present**. Re-map governing law after moving a document to CA, WA, IL or TX.

## Source category 3: court filings (CourtListener / RECAP). Real exhibits; adapt.
- **Southern HVAC** (M.D. Fla. 2018):
  - a seller's standalone noncompete, non-solicit and confidentiality agreement
  - a $15k-a-month consulting agreement
  - a partial HVAC employee guidebook
- **1-Tom-Plumber franchise agreement** (2025, 113 pages): a manager noncompete, and a franchisor no-poach clause that WA RCW 49.62.060 bans.
- **Climate Pros complaint.** Quotes the covenants signed by employees hired through acquisitions, word for word.

## Source category 4: copyrighted web pages. Rewrite under a fictional supplier's name, or store URL + snapshot + excerpt and fetch at build time.

**Supplier terms of sale**, which POs incorporate by reference. The dated versions are the eval gold here.

| Supplier | Versions | What they test |
|---|---|---|
| **Carrier** (dated PDFs 07/23/24, 12/10/24, 12/01/25, 02/25/26, 08/21/26) | The tariff/import-duty price clause covered services only; on 12/10/24 it was broadened to equipment. Escalates on the PPI index and is "not subject to decrease." | Which version governs; the one-way ratchet when duties are cut or refunded; a 30-day notice precondition |
| **Core & Main** (Rev 091718, then Rev 020425) | A right to raise prices for tariffs was added on 2025-02-04 | A clean before/after pair |
| **Ferguson** | Never says "tariff," but duties are "in addition" and price is set at the time of shipment. Ships FCA from the seller's facility. | Implicit pass-through without the keyword. A quote can override the terms. |
| **Hajoca** (3 versions) | Only written job quotes get price protection | Protected versus unprotected orders |
| **Daikin** | Duties and customs charges are paid by the buyer | Direct pass-through |

**Residential membership and maintenance-plan terms**, with Wayback history:
- Parker & Sons (39 versions)
- WA Energy Guardian Club
- Four Seasons IL (lets price rise with costs under force majeure)
- Bell Brothers CA (13 versions)
- One Hour, Benjamin Franklin, ARS

**SaaS and vendor terms (distractors):**
- Housecall Pro, Stripe, Samsara, Motive, Angi, Thumbtack
- Jobber, via Wayback (2015–2026)
- ServiceTitan's terms aren't public.

**Couldn't capture:**
- NIBCO needs a headless browser.
- No terms-of-sale URL was found for Grainger, Winsupply, Johnstone, Mueller, Uponor, Viega or RWC.

## Source category 5: generated. Grounded in the real clause language above.

| Document | Why it must be generated | Notes |
|---|---|---|
| Company profile | Fictional entity | Includes an **as-of date** for the corpus [OPEN] |
| **Purchase orders, quotes and pricing schedules** (about 30–50) | Line-item private POs are never public | Each cites a specific web-terms *version*. Line items mix in-scope products (copper tube, fittings) with near misses (brass valves, water heaters, heat pumps under Proclamation 11032). Incoterms mix DDP, FCA, EXW, FOB and CIF, which decides who the importer of record is and so who gets refunds. Surcharge lines are labelled IEEPA or Section 232. Pricing is indexed to COMEX or the PPI (FRED series verified). |
| Commercial facilities MSAs and work orders | Almost none are public | Rebuild from the WA DES and Chicago structures. Pricing recipe: labor $95–175/hr, materials at cost plus 15–35%. |
| Technician employment agreements, offer letters, handbook, arbitration agreement | No free trades-level documents exist | Built from the real clause language (Buckeye, Southern HVAC, Climate Pros, Legence riders) |
| No-hire and non-solicit clauses in customer contracts; MFN and flow-down pairs | Not found publicly | Planted L2 links |
| Insurance policies and certificates; standard leases | ISO, ACORD and AIR forms are copyrighted | Generic generated text |
| Gap fills for redactions | For the EDGAR documents | Filled from a per-document parameter sheet; injected values are logged |
| Planted eval variants | Ground truth by construction | Applied as controlled edits to copies |

---

## Scale (the reports' estimates, to reconcile at assembly)
- **A real company this size:** about 1,500–4,000 documents, mostly templated. The CLM-vendor statistics behind that are weak.
- **Proposals:**
  - Report 04 (whole corpus): about 213 documents in 35–40 stacks, about 55–60 of them real.
  - Report 02 (customer and subcontract side only): about 110–150 documents, about 40% real.
  - Report 03 (employment only): about 70–90 documents, about 35% real.
  - Report 01 (supply only): 6–8 MSAs and 30–50 POs.
- **Taken together:** roughly **200–300 documents**. [OPEN: the final target]

## Cross-cutting constraints and to-dos
- **Licensing.** Government works: commit them. EDGAR, CUAD (CC BY 4.0) and court exhibits: commit with attribution in `SOURCES.md`. Copyrighted web terms: rewrite, or store as URL + snapshot + excerpt. Don't commit AIA, ConsensusDocs, ISO, ACORD or AIR forms verbatim.
- **Personal data.** Swap party names *and* the names and compensation of real individuals in the acquisition and employment documents.
- **Formats.** Prefer text-native sources. Scanned documents (Cook County, older Chicago files, Sourcewell's Johnson Controls contract, WA 02919) need OCR; deprioritize them.
- **Blocked retrievals.** Chicago's document-viewer PDFs (HTTP 500; retry). NIBCO (needs a JavaScript-rendering browser). EDGAR full-text search throttles above about one request per second.
- **Not verified:**
  - the CBP copper CSMS message number
  - whether a refined-copper duty for 2027 was adopted
  - the statute and legal-change dates in report 02, which came from the agent's memory
  - check every legal date again before writing gold labels

## Eval hooks the sources provide for free
- **Tariff versions over time** (Aug 2025, Apr 2026, Jun 2026). Which version applies depends on the shipment date. Proclamation 11032 is a *decrease*.
- **Supplier terms versioned by date:** Carrier's broadening of its clause, Core & Main's addition, Ferguson's implicit pass-through.
- **The fixed-price squeeze:** the WA DES "no tariffs approved" contract combined with pass-through supplier terms.
- **The refund chain:** only the importer of record gets refunded. Any credit to the Company depends on surcharge-refund language (Natera-style) and on the Incoterms in each PO.
- **WA ESHB 1155's keyword-free noncompetes:** forfeiture and training-repayment clauses. The 1% ownership test catches non-owners who signed acquisition covenants.
- **IL construction non-solicit ban:** the fallback protection disappears too.
- **CA AB 692's signing-date cutoff.**
- **An enacted but not-yet-effective law:** WA ESHB 1155 takes effect in 2027.
- **Distractors:** pipeline "tariffs," fiduciary "duties," Western Copper, landlord radius clauses, NDA no-hire clauses, lead-generation exclusivity, and expired or superseded documents.

---

## Verification results (2026-09-28, checked against primary sources)
| Item | Result |
|---|---|
| CBP copper guidance | **CSMS #65794272, published 07/31/2025**, "GUIDANCE: Section 232 Import Duties on Copper and Copper Derivative Products." Source: CBP trade-remedies page, Wayback snapshot of 2025-09-12. The 2026 follow-ups are also listed on the live page: #68253075 (04/03/2026), #68554727 (05/06/2026), #68855869 (06/05/2026), and #69252300 (07/15/2026, copper smelt-and-cast reporting). |
| Refined-copper duty for 2027 | **Not adopted.** Proclamation 10962 only *directed* Commerce to report by 2026-06-30 so the President could decide on a phased duty on refined copper (15% from 2027-01-01, 30% from 2028-01-01). A Federal Register search of presidential documents through 2026-09-28 turns up no such proclamation. That makes it a good "contemplated, not enacted" status test. |
| Additional find | There are antidumping orders on **seamless refined copper pipe and tube** from Mexico and Vietnam, among others. Mexico's preliminary results were published **2026-09-21** (FR 2026-19273), and Vietnam's five-year review started 2026-07-02. This is a possible extra trigger or near-miss directly on the company's main input. |
| CA AB 2863 (automatic-renewal law) | **Verified.** Chapter 515, signed 2024-09-24. It applies to contracts "entered into, amended, or extended… on or after July 1, 2025." It requires express consent, a click-to-cancel option, an annual reminder, and 7–30 days' notice of price changes. |
| FTC click-to-cancel rule | **Verified.** The Eighth Circuit vacated it in *Custom Commc'ns, Inc. v. FTC*, 142 F.4th 1060 (8th Cir. 2025); the exact July date is from memory. The FTC restored the pre-2024 rule text on 2026-02-12 (91 FR 6507, the same notice that removed the noncompete rule). The FTC then asked for comment on new amendments on **2026-03-13** (FR 2026-04952). So the rule was vacated and is now back under consideration. |
| WA RCW 4.24.115 (anti-indemnity) | **Verified.** Indemnity for the indemnitee's sole negligence is void. For concurrent negligence, indemnity is valid only to the extent of the indemnitor's negligence and only if expressly stated. A waiver of Title 51 immunity must be expressly stated and "mutually negotiated." Last amended 2012. |
| CA Civ. Code §2782.05 (anti-indemnity) | **Verified.** Applies to construction contracts entered on or after 2013-01-01, with carve-outs. It voids indemnity for the general contractor's active negligence or willful misconduct. |
| TX Ins. Code ch. 151; 740 ILCS 35 (anti-indemnity) | **Not fetched.** Both sites load their text with JavaScript and the mirrors return 403. Neither statute is an evaluation trigger, so this only matters if a gold label depends on it. Fetch with a headless browser if that happens. |
| Chicago Johnson Pipe PDFs | **Resolved.** The viewer URL in the dataset fails, but the direct pattern `https://ecm.chicago.gov/eSMARTContracts/service/DPSWebDocumentViewer?id={GUID}&osName=eContentContracts&el=0&image=image` works with plain curl. PO 74381 rev 0 came back as 169 text-native pages. |
