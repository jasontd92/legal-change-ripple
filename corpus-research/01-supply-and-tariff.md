# 01 — Supply-side documents + tariff trigger sources

Scope: supplier-side contract stacks for the fictional CA/WA/IL/TX plumbing & HVAC company ("the Company"), plus the legal-change events (tariff actions, court rulings) the agent will be evaluated on.
Research date: 2026-09-25. Every URL marked **[verified]** returned HTTP 200 (or its content was read) during this session.
User preference (confirmed): **unredacted documents strongly preferred**; party-name substitution into the one fictional company is fine. Each source notes redaction status.

---

## PART A — TARIFF TRIGGER SOURCES (the change events)

All Federal Register documents are US-government works (17 U.S.C. §105): public domain, freely redistributable. SCOTUS slip opinions: public domain. CBP web pages: public domain.

### A1. Section 232 copper — the full chain (primary sources, verified via FR API)

| # | Instrument | Signed | FR cite / doc no. | Effective | What it does (verified from text) |
|---|---|---|---|---|---|
| 0 | EO 14220 "Addressing the Threat to National Security From Imports of Copper" | 2025-02-25 | 90 FR (2025-03439) | — | Opens the 232 investigation. https://www.federalregister.gov/documents/2025/02/28/2025-03439/addressing-the-threat-to-national-security-from-imports-of-copper **[verified]** |
| 1 | **Proclamation 10962** "Adjusting Imports of Copper Into the United States" | 2025-07-30 | 90 FR 37727 (2025-14893), pub. 2025-08-05 | **12:01 a.m. EDT Aug 1, 2025** | **50% tariff on "semi-finished copper products and intensive copper derivative products"** listed in Annex; applies **only to the copper content**; non-copper content still subject to IEEPA reciprocal/fentanyl duties; **no drawback**; FTZ privileged-foreign status; Commerce to set up a derivative-inclusion process within 90 days; Commerce update due by 2026-06-30 on whether to impose phased **refined-copper duty 15% from 2027-01-01 / 30% from 2028-01-01**; DPA domestic-sales requirement for scrap/input materials. |
| 2 | **Proclamation 11021** "Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper" | 2026-04-02 | 91 FR 18201 (2026-06960), pub. 2026-04-09 | **12:01 a.m. EDT Apr 6, 2026** | Big restructure: 232 duty now applies to the **full customs value regardless of metal content** (reverses the copper-content-only rule). Annex I-A (metal articles, "most copper articles") = **50%**; Annex I-B (some copper articles + predominantly-metal derivatives) = **25%**; Annex III (industrial machinery/power equipment) = temporary 15% all-in through 2027-12-31; **10% rate for goods whose copper was smelted and cast in the US**; UK rates 25%/15%; the old inclusion processes terminated and replaced by Commerce+USTR joint inclusion authority; **manufacturing drawback restored** for Trade-Agreement-Partner (UK, EU, JP, KR, MX, CA) content. |
| 3 | **Proclamation 11032** "Further Adjusting the Tariff Regimes for Imports of Aluminum, Steel, and Copper" | 2026-06-01 | 91 FR 34085 (2026-11314), pub. 2026-06-04 | **12:01 a.m. EDT Jun 8, 2026** | Moves **agricultural equipment and "certain HVAC systems and components that are predominantly for residential use"** into the temporary reduced tier (Annex I-C: 25% default; **15% all-in for EU/JP/KR/UK/CH/TW etc.**; USMCA goods 25% on non-US content only, min 15%) through 2027-12-31, reverting to Proc. 11021 cl. (3) rates 2028-01-01; lowers the "entirely US metal" threshold from **95% to 85%** by weight. Directly relevant to the Company's residential HVAC equipment purchases (a *rate decrease* event — good test of the agent recognizing favorable changes / price-decrease clauses). |
| 4 | Proclamation 11045 "Further Strengthening Actions Taken To Adjust Imports of Aluminum" | 2026-07-20 | 91 FR 46635 (2026-14990) | — | Aluminum onshoring program (half-rate for approved primary-aluminum producers). **Distractor** for a copper-plumbing company (only tangential to aluminum HVAC coil). |
| 5 | Presidential Determination under DPA §101 on Recoverable Critical Minerals | 2026-07-30 | 2026-15859 | — | Explicitly excludes copper scrap (already covered by Proc. 10962). **Distractor.** |

URLs (all **[verified]** via FR API, raw text downloaded):
- Proc. 10962: https://www.federalregister.gov/documents/2025/08/05/2025-14893/adjusting-imports-of-copper-into-the-united-states — PDF https://www.govinfo.gov/content/pkg/FR-2025-08-05/pdf/2025-14893.pdf — text https://www.federalregister.gov/documents/full_text/text/2025/08/05/2025-14893.txt
- White House version (annex as images, text readable): https://www.whitehouse.gov/presidential-actions/2025/07/adjusting-imports-of-copper-into-the-united-states/ **[verified]**; Annex images https://www.whitehouse.gov/wp-content/uploads/2025/07/ANNEX1.png and ANNEX2.png **[verified, read]**
- Proc. 11021: https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states
- Proc. 11032: https://www.federalregister.gov/documents/2026/06/04/2026-11314/further-adjusting-the-tariff-regimes-for-imports-of-aluminum-steel-and-copper-into-the-united-states
- Proc. 11045: https://www.federalregister.gov/documents/2026/07/23/2026-14990/further-strengthening-actions-taken-to-adjust-imports-of-aluminum-into-the-united-states

**Scope — does Proc. 10962 cover plumbing inputs? YES.** Annex (read from the WH images) lists HTSUS subheadings: 7406 (powders), 7407 (bars/rods/profiles), 7408 (wire), 7409 (plates/sheet/strip), 7410 (foil), **7411.10.10, 7411.10.50, 7411.21.10, 7411.21.50, 7411.22.00, 7411.29.10, 7411.29.50 (copper tubes and pipes)**, **7412.10.00, 7412.20.00 (copper tube/pipe fittings — couplings, elbows, sleeves; refined copper and brass/alloy)**, 7413 (stranded wire/cable), 7415 (fasteners), **7418.10/7418.20 (copper household articles and sanitary ware — plumbing fixtures)**, 7419.20/7419.80.xx (other copper articles), 8544.42.xx / 8544.49.10 (insulated copper wire/cable).
Not in the original 10962 annex: valves/taps (HTS 8481 — brass valves), water heaters (8419), AC/heat pumps (8415). Those fall under steel/aluminum derivative lists and, after Proc. 11021/11032, the restructured annexes (annexes to 11021/11032 are GRAPHIC/TIFF images in the FR; must be read from the PDF). Test design implication: a brass ball valve PO (HTS 8481.80) is a *near-miss distractor* for the Aug-2025 copper event, but may be in scope under the 2026 restructure — the agent must check the annex, not keyword-match "brass".

Note for evals: the copper tariff event has **multiple dated versions** — Aug 1 2025 (50% on copper content), Apr 6 2026 (full value, 50/25/10 tiers), Jun 8 2026 (residential HVAC reduced tier; 85% threshold). A contract's exposure depends on which version applies to the shipment date — ideal for "old vs new version" tests.

CBP guidance: CBP's 232 FAQ page is https://www.cbp.gov/trade/programs-administration/entry-summary/232-tariffs-aluminum-and-steel-faqs **[verified 200]** (steel/aluminum focused; references CSMS #64384423/#64384496 for melt-and-pour/smelt-and-cast reporting). A copper-specific CSMS message was issued around 2025-07-31 (I recall CSMS #65794272, "Section 232 tariffs on copper", HTS 9903.78.01/9903.78.02) — **NOT verified this session** (GovDelivery bulletins not indexable without search; WebSearch budget exhausted). Recipe: check https://content.govdelivery.com/accounts/USDHSCBP/bulletins/ by browser, or use FR text as the authoritative trigger (sufficient for the corpus).

### A2. IEEPA tariffs — Supreme Court + unwinding + refund chain (verified)

- **Learning Resources, Inc. v. Trump, No. 24-1287, together with Trump v. V.O.S. Selections, Inc., No. 25-250. Argued Nov 5, 2025; decided Feb 20, 2026. 607 U.S. 229 (2026).** **[verified — PDF downloaded and syllabus read]**
  - Opinion (preliminary print): https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf (listed on https://www.supremecourt.gov/opinions/slipopinion/25 **[verified]**). CourtListener mirror: https://www.courtlistener.com/opinion/10796821/learning-resources-inc-v-trump/
  - **Held: "IEEPA does not authorize the President to impose tariffs."** No. 24-1287 (D.D.C.) vacated and remanded with instructions to dismiss for lack of jurisdiction (belongs in the CIT); No. 25-250 (Fed. Cir. en banc, 149 F.4th 1312) affirmed.
  - Roberts, C.J., for the Court (Parts I, II-A-1, II-B), joined by Sotomayor, Kagan, Gorsuch, Barrett, Jackson; Part II-A-2 (major questions) only Roberts/Gorsuch/Barrett. Concurrences: Gorsuch; Barrett; Kagan (with Sotomayor, Jackson) concurring in part and in judgment; Jackson concurring in part. **Dissents: Thomas; Kavanaugh (joined by Thomas, Alito). 6–3.**
  - The opinion itself does not order refunds; the Kavanaugh dissent flags that the Government "may be required to refund billions of dollars to importers."
- **EO 14389 "Ending Certain Tariff Actions"** (signed 2026-02-20, pub. 2026-02-25, FR doc 2026-03832): IEEPA ad valorem duties under EOs 14193/14194/14195 (fentanyl CA/MX/CN), 14245 (Venezuela oil), 14257 (reciprocal), 14323 (Brazil), 14329 (Russia), 14380 (Cuba), 14382 (Iran) "shall no longer be in effect and, as soon as practicable, shall no longer be collected." https://www.federalregister.gov/documents/2026/02/25/2026-03832/ending-certain-tariff-actions **[verified]**
- **Proclamation 11012 "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems"** (Trade Act §122; signed 2026-02-20; FR doc 2026-03824): **10% surcharge on all imports** (Annex exceptions), effective 12:01 a.m. EST **Feb 24, 2026 through 12:01 a.m. EDT Jul 24, 2026** (150-day statutory limit) unless extended by Congress; **does not stack on 232** — applies only to the non-232 portion of an import. https://www.federalregister.gov/documents/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems **[verified]**. No FR extension found (FR search for "section 122" surcharge after 2026-03-01 returned nothing relevant) → presumptively expired 2026-07-24. (Good "expiring surcharge" event for price-escalation clauses that key off "then-current duties".)
- EO 14388 continuing suspension of de minimis (2026-03829) — distractor for the Company.
- **Refund mechanics (the L2 "refund chain")** — from CBP PRA notice 2026-13771 (pub. 2026-07-08, "Court-Ordered Refunds Under the IEEPA", OMB 1651-0149) https://www.federalregister.gov/documents/2026/07/08/2026-13771/agency-information-collection-activities-extension-court-ordered-refunds-under-the-international **[verified]**:
  - Fed. Cir. mandate to CIT 2026-03-02; CIT order in *Atmus Filtration, Inc. v. United States* 2026-03-04 (amended 03-05, 03-20) directing CBP to liquidate/reliquidate entries without IEEPA duties; stayed 03-06 for immediate-compliance; Atmus voluntarily dismissed 2026-04-08; ***Euro-Notions Florida, Inc. v. United States*, CIT No. 25-00595** became the test case (injunctive order 2026-04-07). Refunds **with interest**.
  - CBP **CAPE** (Consolidated Administration and Processing of Entries) tool in ACE: https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds **[verified, updated through 9/2/2026]** — Phase 1 unliquidated entries and entries within the 80/90-day voluntary reliquidation window; Phase 2 reconciliation entries; refunds generally 60–90 days after CAPE Declaration acceptance; **refunds paid only to the Importer of Record (or its Form 4811 designee)**; netting under 19 CFR 159.1; offset under 19 CFR 24.72; CBP gives no guidance on whether a CIT suit is needed for other entries.
  - **Why this matters for the corpus:** the Company is almost never the IOR — its distributors/manufacturers are. The refund lands with the supplier. Whether the Company can claw back IEEPA-driven surcharges it paid depends entirely on contract language (tariff-surcharge terms that say "refunded/credited if duty is reduced or refunded", MFN clauses, audit rights, "pass-through of actual duties" definitions). This is the core L2 "refund chain" test: supplier terms → PO surcharge line → SCOTUS ruling → CAPE refund to IOR → does the Company have a right to a credit?

### A3. Other 232 changes affecting plumbing/HVAC products
- Steel/aluminum derivative inclusions (2025 inclusion rounds under Procs. 10895/10896; e.g., the BIS derivative inclusions that added ~400 HTS codes in Aug 2025 incl. many HVAC/appliance parts) — not re-verified this session; the 2026 Procs. 11021/11032 supersede the inclusion process and restate everything in annexes, so the corpus can cite 11021/11032 directly.
- Proc. 11032's residential-HVAC 15%/25% tier (above) is the most on-point 2026 change for HVAC equipment POs (condensers, furnaces, air handlers).

---

## PART C — Distributor / manufacturer ONLINE terms and conditions of sale (incorporated by reference into POs/quotes)

**Purpose in corpus:** the "web terms incorporated by reference" layer of each supply stack. These are where tariff pass-through actually lives for most small buyers. Highest-value finding: several have **dated versions**, some of which **added or broadened tariff language in Dec 2024 – Feb 2025** — ideal for "which version governs this PO?" tests.

**License/redistribution:** these are copyrighted corporate web pages. Not public domain. For a GitHub repo: (a) safest = store URL + Wayback snapshot URL + a short excerpt of the operative clauses (fair-use scale) and have a fetch script pull the full text at build time; (b) or adapt/paraphrase into the fictional supplier's terms (party-name substitution + light rewording), noting "adapted from" in a SOURCES file. Do not commit verbatim full copies with the real brand name unless you accept that risk. All are unredacted (web terms never are).

### C1. Carrier Corporation — Terms and Conditions of Sale – Equipment and/or Service (US) — BEST FIND (versioned PDFs, tariff + PPI escalation)
Landing page: https://www.carrier.com/us/en/terms-and-conditions-of-sale/ **[verified]** (Wayback snapshots 2026-01-15, 02-17, 04-07, 05-27, 07-08, 08-11).
Versioned PDFs (all **[verified 200, text extracted]**):
| Version (header) | URL |
|---|---|
| 07/23/24 | https://brandportal.carrier.com/m/544931481e869752/original/terms-conditions-carrier-sale-equip-service-us-english-07-23-2024.pdf |
| 12/10/24 | https://brandportal.carrier.com/m/281b7d20a3b5964e/original/terms-conditions-carrier-sale-equip_service-us-english-12-10-2024.pdf |
| 12/01/25 (file dated 10-22-2025) | https://brandportal.carrier.com/m/33224df5da1f291e/original/terms-conditions-sale-equip-service-us-english-10-22-2025.pdf |
| 02/25/26 | https://brandportal.carrier.com/m/560967de53a62fb8/original/terms-conditions-sale-equip-service-us-english-02-25-2026.pdf |
| 08/21/26 (current) | https://brandportal.carrier.com/asset/f12da63b-e474-4f21-adea-20d769877892/terms-conditions-sale-equip-service-us-english-08-21-2026.pdf |

Key clause — §33 "CHANGE ORDER / ADDITIONAL WORK / PRICE ADJUSTMENTS":
- **07/23/24:** "The price of **services** performed under this Agreement is subject to change due to increases in material costs related to **tariffs, import duties, trade policy**, epidemics, commodity or material costs, fuel surcharges, supplier costs, labor costs… on thirty (30) days' prior written notice." Equipment price separately escalates by **BLS PPI series PCU33341-33341 (HVAC and Commercial Refrigeration Equipment)**: total price × PPI at delivery ÷ PPI at execution; "**Total Agreement price is not subject to decrease.**"
- **12/10/24 onward:** broadened to "The prices of services performed **and/or equipment purchased**…" (tariff clause now reaches equipment). Unchanged through 08/21/26.
- Later versions add telemetry/OTA-update/embedded-software terms (distractor churn — good for testing that the agent ignores irrelevant diffs).
Eval value: (1) version-sensitivity (a July-2024 order vs. a 2025 order); (2) **one-way ratchet** ("not subject to decrease") — when Proc. 11032 *lowers* residential HVAC duty, or IEEPA duties are refunded, the Company gets no automatic decrease; (3) 30-day notice precondition.
Also on the page: Carrier **Terms and Conditions of Purchase Order** (Carrier as buyer) https://brandportal.carrier.com/m/4d91378afe5a9133/original/terms-conditions-purchase-order.pdf (not verified text) — distractor/mirror.

### C2. Core & Main LP — Terms and Conditions of Sale (waterworks/PVF distributor) — tariff clause ADDED Feb 2025
Live: https://coreandmain.com/terms-of-sale/ **[verified]**
Wayback (text diffed this session):
- Old — "Rev 091718", no tariff language: https://web.archive.org/web/20250114034925/https://coreandmain.com/terms-of-sale/
- New — "**Rev 020425**" (Feb 4 2025), first captured https://web.archive.org/web/20250213163816/https://coreandmain.com/terms-of-sale/ — adds: "Seller reserves the right to increase prices at any time upon written notice to address factors beyond its control including but not limited to government regulations, **tariffs**, transportation, fuel and raw material costs." Stable through 2026-04 snapshots.
Also: Core & Main Terms and Conditions of **Purchase** (Core & Main as buyer), https://www.coreandmain.com/wp-content/uploads/CMLP_Terms_and_Conditions_of_Purchase_092724.pdf **[verified, 3.7k words]**.
Eval value: clean before/after pair around the Feb-2025 IEEPA actions; "upon written notice" precondition.

### C3. Ferguson Enterprises — Terms and Conditions of Sale (largest US plumbing distributor)
Live: https://www.ferguson.com/content/customer-support/website-information/terms-of-sale/ (old URL https://www.ferguson.com/content/website-info/terms-of-sale 301-redirects) **[verified]**
Wayback: monthly snapshots 2019-10 → 2026-09 (old URL through 2024-03; new URL from 2024-04). Text diffed 2025-03 → 2026-05: operative text **unchanged since ~June 2025** (only ligature/export-agent edits in May 2025). **No explicit "tariff" word.**
Operative clauses: §2 "All orders are shipped **FCA, Seller's facility (Incoterms® 2020)**"; §3 PRICE "All prices are subject to change unless otherwise noted on Seller's applicable quotation. Buyer will be invoiced at **prices in effect at the time of shipment**. All taxes, transportation costs, **duties** and other charges are in addition to quoted prices."; §4 force majeure incl. "inability to obtain materials or Products"; §19 governing law = law of delivery jurisdiction (→ CA/WA/IL/TX variation).
Eval value: *implicit* pass-through (duties "in addition"; price at shipment) — tests that the agent finds exposure without the keyword "tariff". Quote-level price protection overrides ("unless otherwise noted on Seller's applicable quotation") → link to generated quotes.
Snapshot examples: https://web.archive.org/web/20250608025450/https://www.ferguson.com/content/customer-support/website-information/terms-of-sale/ ; older-URL 2019: https://web.archive.org/web/20191022223341/https://www.ferguson.com/content/website-info/terms-of-sale

### C4. Hajoca Corporation — Terms and Conditions of Sale (plumbing/HVAC/PVF distributor) — 3 versions
Live: https://www.hajoca.com/sales-order-terms-and-conditions/ **[verified]** ("updated 04-04-2024"); also PO terms (Hajoca as buyer) https://www.hajoca.com/purchase-order-terms-and-conditions/ ("Revised 3/14/25") **[verified]**.
Versions (Wayback, diffed): "updated 09-20-2019" (e.g. https://web.archive.org/web/20231003181056/https://www.hajoca.com/sales-order-terms-and-conditions/) → "updated 04-04-2024" (https://web.archive.org/web/20240526142826/…) → Jan-29-2025 edit adding "Interpretation of Customer's Plans and Specs" (https://web.archive.org/web/20250216192159/…).
Price clause (all versions): "Except for written **job quotations that specifically allow price protection** for a certain period of time, all prices are subject to change by Seller without notice. If prices change, Customer agrees to accept the new prices." Includes PMSI security interest, arbitration. No tariff word.
Eval value: price-protected job quote vs. unprotected stock orders; arbitration clause (dispute-path distractor).

### C5. Daikin Comfort (Daikin / Goodman / Amana) — Terms of Sale
Live: https://www.daikincomfort.com/terms-of-sale **[verified, ~3.2k words]** — §5 "Taxes and Other Charges": "Any manufacturer's tax, … **duty, custom**, inspection or testing fee, or any other tax, fee or charge … imposed by any governmental authority … shall be paid by the Buyer in addition to the prices quoted or invoiced." Goodman's https://www.goodmanmfg.com/terms-of-sale is a stub (181 words; points to Daikin). Wayback history not retrieved this session.

### C6. Others checked
- Grainger: all guessed "/content/…terms…" URLs → "Whoops" 404; Grainger's terms live at a URL not found this session (try https://www.grainger.com/content/general-terms-conditions-of-access-and-sale in a browser). Grainger is on the Sourcewell cooperative contract (Part A4).
- NIBCO: https://www.nibco.com/terms-and-conditions-of-sale/ and https://www.nibco.com/po-terms-and-conditions/ exist (sitemap) but are **JS-rendered** (curl & Wayback id_ return empty shell) → need a headless browser (Playwright) to capture.
- Johnstone Supply: https://www.johnstonesupply.com/terms-conditions-of-sale returns a generic shell (1.3k words of nav); real "Sales Policy" is store-specific — low value.
- Winsupply, Carrier Enterprise, HD Supply, McMaster: JS/soft-404 shells via curl.
- RWC/SharkBite, SupplyHouse: Cloudflare 403 to curl.
- A. O. Smith https://www.aosmith.com/terms-and-conditions.html = website terms of use (Effective Nov 1 2021), not sale terms. Rheem https://www.rheem.com/legal/ = website/privacy terms. Viega https://www.viega.us/en/meta/footer/terms-of-service.html = website terms. Lennox https://www.lennoxpros.com/termsofuse = website terms of use (6.8k words).
- Mueller Industries, Uponor: no terms URL found by sitemap/footer scan.
Recipe for the gaps: use Carrier/Core & Main/Ferguson/Hajoca as the four real templates; adapt one into a fictional copper-tube manufacturer's terms (e.g., "Pacific Copper Tube Co." based on the Core & Main 2025 text + a COMEX-based metal adjustment clause).

---

## PART B — Supplier master / supply agreements (EDGAR + public-agency + CC-licensed datasets)

**Bottom line:** EDGAR has almost **no plumbing/HVAC-supply agreements** for this company profile. Full-text searches (efts.sec.gov, 2001–2026) of Mueller Industries (CIK 89439), Lennox (1069202), A. O. Smith (91142), Watsco (105016), AAON (824142), Comfort Systems USA (1035983), Pool Corp (945841), Wolverine Tube (821407), Core & Main (1856525), Ferguson (2011641) returned only M&A, credit, JV and shareholder agreements — distributors and manufacturers do not treat individual supply contracts as "material contracts". The practical strategy is: **(1) real unredacted public-agency supply contracts for the plumbing-domain stack, (2) EDGAR supply-agreement *families* from adjacent industries for clause mechanics (metal-price adjustment, tariff surcharge, refunds, amendments over years), (3) generate the rest.**

### B1. BEST DOMAIN FIT — City of Chicago supply contracts with Johnson Pipe & Supply Co. (IL, unredacted public records)
Source: City of Chicago "Contracts" open dataset (Socrata `rsxa-ify5`) **[verified via API]**:
`https://data.cityofchicago.org/resource/rsxa-ify5.json?$where=upper(vendor_name) like '%JOHNSON PIPE%'`
Families found (each with original award + many modifications — exactly the master + amendments shape):
| PO / Spec | Description | Original | Modifications (approval date → new end date, $ increase) |
|---|---|---|---|
| **PO 74381 / Spec 505525** | **"Pipes, Fittings, Valves and Accessories"** | 2018-04-24, $5,777,880, to 2023-04-22 | rev 1 2018-05-03; rev 4 2022-07-28 (→2025-04-22); rev 5 2023-01-31 (+$1.98M); rev 6 2023-12-01 (+$5.36M); **rev 7 2025-06-23 (+$2.06M, →2026-04-22); rev 8 2025-10-09 (+$7.38M); rev 10 2026-05-15 (+$16.23M, →2027-04-22)** — post-tariff cost growth is visible in the $ amounts |
| PO 33469 / Spec 128260A | "Various Plumbing Supplies (Groups 1, 6-29…)" | 2015-11-23, $3.84M | revs 1–12 (2020-01-31 … 2026-06-18, → 2027-11-22) |
| PO 19755 / Spec 71233 | "HVAC Parts" | 2009-05-06 | revs 1–26 through 2019-08-15 |
| PO 31001 / Spec 116811A | "Pipes, Fittings, Valves and Accessories" (earlier) | 2015-01-12 | revs 1–5 |
Co-awardees on the plumbing-supplies spec: Chicago United Industries, Root Brothers Manufacturing & Supply (same POs, different groups) — useful for "same master, different supplier" duplicates.
Document links are in the dataset `contract_pdf` field, e.g. PO 74381 original: `http://ecm.cityofchicago.org/eSMARTContracts/service/DPSWebDocumentViewer?sid=ESMART&id={A801C86A-72A7-4C82-8656-12BCE12EF601}`; rev 10: `…id={C0E32C9E-0000-C618-9A67-6AB3F3DB29E9}`. **Caveat: the ECM document viewer returned HTTP 500 for every document on 2026-09-25** (metadata verified; PDFs NOT retrieved). Retry later / from a browser, or request via Chicago DPS / FOIA. Also check the bid specification 505525 on Chicago's DPS bid portal (price-adjustment and "manufacturer price increase" clauses are typical in Chicago commodity specs).
License: Illinois public records (government works; vendor-submitted price lists may carry vendor copyright but are routinely published) — low risk for redistribution; attribute source.
Redaction: none expected (public contracts). Party-substitution: City of Chicago → the Company (buyer), Johnson Pipe → fictional distributor.

### B2. Sourcewell (Minnesota public cooperative) contracts — unredacted, but some are scanned images
- HVAC RFP #030817 (NJPA, "HVAC Systems, Installation, and Service") — **text-extractable**, 49 pp: https://www.sourcewell-mn.gov/sites/default/files/2018-05/HVAC%20RFP%20%20030817_3.pdf **[verified]**. §5.35 price decreases/increases ("A Vendor must include reasonable documentation for price-increase requests… including letters from suppliers announcing price increases. Price increases must not exceed the industry standard."), FOB/delivery disclosure rules, force majeure.
- Johnson Controls contract #030817-JHN: https://www.sourcewell-mn.gov/sites/default/files/2019-09-16/Johnson%20Controls-%20Contract%20030817.pdf **[verified 200, but image-only → OCR needed]**; 5th-year extension letter (text) https://www.sourcewell-mn.gov/sites/default/files/2020-12-22/Johnson%20Controls%20030817-5th%20Year%20Extension-Corrected.pdf **[verified]**; award: …/2018-05/Acceptance%20and%20Award-Johnson%20Controls%20030817.pdf.
- Grainger #121416-WWG (public-safety equipment — off-domain but a clean family): contract+Amendment #2 https://www.sourcewell-mn.gov/sites/default/files/2021-12-15/Grainger%20Contract%20121416.pdf; 5th-year extension https://www.sourcewell-mn.gov/sites/default/files/2020-09-03/Grainger%20121416-5th%20Year%20Extension.pdf **[both verified]**.
- Sourcewell's live site is a Salesforce SPA (no curl scraping); discover files via Wayback CDX prefix `sourcewell-mn.gov/sites/default/files/` (3,047 URLs listed this session).
License: MN public data; redistribution low risk. Effort: medium (OCR for scans).

### B3. EDGAR supply-agreement FAMILIES (adjacent industries — use for clause mechanics)
1. **Illumina, Inc. ↔ Natera, Inc. Supply Agreement (2015) + Amendments 1–11 (2016–2026)** — filer CIK 1604821. The **Eleventh Amendment (eff. 2026-03-02)**, https://www.sec.gov/Archives/edgar/data/1604821/000162828026032478/ntra-20260331xex101.htm **[verified, read]**, adds §7(g) "**Tariff Surcharge**": defines "Tariff Charges" as the Section 122 duty "pursuant to Presidential Proclamation 11012 (91 Fed. Reg. 9339 (Feb. 25. 2026)), and any successor, replacement, and/or additional duties … under Section 301 … Section 232 … or other applicable U.S. trade laws"; Tariff Rate 10% as of 3/2/26; surcharge only above a threshold [*]%, formula [*] × (Tariff Rate – [*]%) × [*], 30-day lag, non-retroactive; **refund pass-back: "If … Illumina later receives a rebate, refund or any other form of renumeration … Natera will be entitled to their pro-rata share"**; re-open clause. Also amends "Net Price" to exclude Tariff Charges. Other family members (verified in EFTS listing): S-1 EX-10.13 2015 (https://www.sec.gov/Archives/edgar/data/1604821/000104746915005154/a2224899zex-10_13.htm), 10-Q 2016 EX-10.1/10.2, 10-Q 2017, 10-Q/A 2018, 10-K 2019 EX-10.8, 10-Q 2020, 10-K 2020 EX-10.5.5, 10-Q 2021, 10-K 2024 EX-10.2_8, 10-K 2025 EX-10.2(9)/(10), 10-Q 2026-08-07 EX-10.1–10.4. Redaction: heavy ("[*]", 438 markers in Amend. 11). Domain: genomics (off-domain) → use the *clause text* transplanted into the fictional copper-tube supply agreement. **This is the single best real model for the Section-122/232 surcharge + refund chain.**
2. **Federal Cartridge Co. ↔ Alliant Techsystems (Orbital ATK) Ammunition Products Supply Agreement (Feb 9 2015) + Addenda (6, 7) + successor Ammunition Supply Agreement (eff. Feb 10 2018)** — Vista Outdoor 10-Q filed 2017-08-10 (CIK 1616318): Addendum 6 https://www.sec.gov/Archives/edgar/data/1616318/000161631817000139/apsaaddendum6ex102.htm ; Addendum 7 …/apsaaddendum7ex103.htm ; ASA …/asaex104.htm **[verified]**. Exhibit B "**Metals Adjustment**" per-unit adjustment for **copper**, zinc, lead keyed to **COMEX / LME / Chicago Market** with substitute-index clause; base copper price $*** per pound; firm-fixed-price periods; retroactive pricing; FOB/Incoterm terms (25 hits); force majeure (11). Redaction: "***" (~90 markers per doc). Copper-brass metal-adjustment is directly analogous to copper tube/fittings pricing.
3. Remy International "Accommodation Agreement" (S-1/A 2011, https://www.sec.gov/Archives/edgar/data/1046859/000119312511130861/dex1024.htm) — COMEX copper price adjustment but ~700 redaction markers → low value.
4. CC-BY-4.0 dataset **CUAD v1** (510 EDGAR contracts; https://zenodo.org/records/4595826, HF `theatticusproject/cuad`) **[verified license cc-by-4.0]** — redistributable with attribution. Relevant unredacted skeleton: **Reynolds Consumer Products ↔ Pactiv Master Supply Agreement (Nov 1 2019, Lake Forest IL)**, `CUAD_v1/full_contract_txt/Part_II/ReynoldsConsumerProductsInc_20191115_S-1_EX-10.18_11896469_EX-10.18_Supply Agreement.txt` (9.6k words, 0 redactions, force majeure ×16; thin on pricing). Also distributor agreements (NETGEAR–Ingram Micro + amendment; ScanSource) for distributor-agreement structure.
Recommended use: the corpus's copper supply MSA = Reynolds/CUAD or Chicago structure (unredacted boilerplate) + Vista metals-adjustment exhibit + Natera tariff-surcharge section, re-papered between the Company and a fictional mill ("e.g., Great Plains Copper Tube, Inc."), with gaps filled per the recipe in Part E.

---

## PART D — Purchase orders, order forms, pricing schedules, quotes

**Real availability:** Individual private-company POs/quotes essentially never public. Public-agency *award/modification* documents are (Chicago dataset above — metadata verified, PDFs pending). Distributor quote/PO templates are not published beyond the terms pages (Hajoca & Core & Main & Carrier publish *PO terms* where they are the buyer — useful mirrors).
**Purpose in corpus:** the child docs that (a) carry shipment dates (which tariff version applies), (b) carry Incoterms (who is IOR → who gets CAPE refund), (c) carry explicit surcharge lines, (d) incorporate web terms by URL + version date.
**Recipe (generate; short docs, 1–2 pages each):**
- Header: PO # (e.g., `PO-2025-0847`), date, buyer = Company (branch in CA/WA/IL/TX), seller = fictional distributor, "Ship-to" job site, **"This PO is governed by the Master Supply Agreement dated … and Seller's Terms and Conditions of Sale at [URL] (Rev 020425)"** — reference a specific web-terms version so version tests are possible.
- Lines: real SKU-style items with HTS relevance, e.g. "Type L copper tube 3/4" × 20' hard drawn (ASTM B88), 500 ft" (HTS 7411.10), "Wrot copper 90° elbow 1" C×C" (7412.10), "Lead-free brass ball valve 1" (8481.80 — near-miss), "Residential split heat pump 3-ton" (8415.81 — Proc. 11032 residential HVAC tier), "50-gal gas water heater" (8419.11 — distractor for copper).
- Price basis: "Copper items priced at COMEX + adder; Metal Adjustment per MSA Exh. B"; or "Firm price valid 30 days (job quote #Q-…)".
- Incoterms mix: **DDP job site** (supplier bears duty → cost exposure with supplier unless surcharge clause), **FCA Seller's facility (Incoterms 2020)** (Ferguson default), **EXW** and **FOB Origin/Destination (UCC)**, a few **CIF Long Beach** for direct imports where *the Company is IOR* (→ Company itself files CAPE for IEEPA refunds).
- Surcharge lines on 2025 invoices: "Tariff surcharge 7.5% (IEEPA reciprocal)" / "Section 232 copper surcharge" — the IEEPA-labelled ones become refund-claim candidates after Learning Resources; the 232-labelled ones do not.
- Pricing schedule (Exhibit to MSA): table of item families × base price × adjustment index (COMEX HG / FRED PCOPPUSDM; BLS PPI WPU102502 copper & brass mill shapes; PPI PCU3334133341 HVAC equipment — both **[verified on FRED]**), effective dates, quarterly repricing.
Suggested counts per supplier stack: 1 MSA + 1 pricing schedule + 0–3 amendments + 3–8 POs/quotes + 1 web-terms version (or 2 where versions changed). Effort: low per doc; medium to make internally consistent (dates, rev numbers, prices).

---

## PART E — Synthesis: per-document-type table, redaction-fill recipe, counts

| Doc type | Corpus role | Best real sources (verified) | Redacted? | License | Effort | Generate? | Count |
|---|---|---|---|---|---|---|---|
| Tariff triggers (232 copper chain; SCOTUS IEEPA; EO 14389; Proc. 11012 §122; CBP CAPE) | Change events | FR docs 2025-14893, 2026-06960, 2026-11314, 2026-03832, 2026-03824, 2026-13771; SCOTUS 607 U.S. 229; CBP CAPE page | No | Public domain | Low | No (use as-is) | ~8 events + 3 distractor events (11045 aluminum, DPA scrap determination, de minimis EO 14388) |
| Supplier MSA / supply agreement | Tariff-relevant core | Chicago–Johnson Pipe PO 74381/33469 (unredacted, PDFs pending); CUAD Reynolds MSA (CC-BY); Vista metals-adjustment; Illumina–Natera tariff surcharge | Chicago/CUAD: no; EDGAR: yes | Public / CC-BY / EDGAR (public filings, low risk) | Medium | Adapt + fill | 6–8 (copper tube mill, fittings mfr, 2 distributors, HVAC OEM, water heater mfr, valve mfr, 1 MRO distractor) |
| Amendments | Version / L2 link | Chicago revs 1–12; Natera Amend. 1–11; Vista Addenda 6–7 | mixed | as above | Low–Med | Generate most | 10–15 |
| Pricing schedules | Exposure quantification | FRED PCOPPUSDM, WPU102502, PCU3334133341 for indices | — | Public data | Low | Generate | 1 per MSA |
| POs / quotes / order confirmations | Dates, Incoterms, IOR, surcharges | none public at item level | — | — | Low | Generate | 30–50 |
| Web terms of sale (incorporated by reference) | Pass-through / version tests | Carrier (5 dated PDFs), Core & Main (Rev 091718 → 020425), Ferguson, Hajoca (3 versions), Daikin | No | Copyrighted: store URL + snapshot + excerpt, or adapt | Low | Adapt with names swapped | 5 suppliers × 1–2 versions ≈ 8 |
| Distractors | Precision tests | Carrier telemetry/OTA diffs; aluminum Proc. 11045; Sourcewell Grainger public-safety contract; brass valve (8481) and water heater (8419) lines | — | — | Low | Mixed | ~15% of corpus |

### Recipe for filling redactions realistically ("[***]", "[*]")
Scale anchor: a 400-employee plumbing/HVAC contractor with ~$90–120M revenue buys maybe $25–35M/yr of materials, of which copper tube and fittings are ~$6–10M/yr.
1. **Metal base prices:** set the "base copper price" to the COMEX/LME monthly average for the month before the agreement date. FRED PCOPPUSDM (USD/tonne; ÷2204.6 = $/lb) is **[verified]**: e.g. Jan 2025 ≈ $8,977/t ≈ $4.07/lb; Jul 2025 ≈ $9,771/t ≈ $4.43/lb; Jan 2026 ≈ $12,987/t ≈ $5.89/lb; Jul 2026 ≈ $13,543/t ≈ $6.14/lb. Note: the US COMEX premium over LME spiked in 2025 around the 232 announcement, so the fill should state which index it uses.
2. **Adders / fabrication premiums:** copper tube at roughly $1.50–3.00/lb over metal (make it consistent within a stack). Fittings are priced as a discount off a manufacturer list price (e.g. "List × 0.38 multiplier"). Tie any PPI escalators to WPU102502 (copper & brass mill shapes) or PCU3334133341 (HVAC equipment); Carrier already uses the latter.
3. **Volumes / minimums:** use an annual minimum of 60–80% of the forecast, e.g. 1.2–1.8M lb of copper tube per year, with a take-or-pay shortfall fee of $0.10–0.25/lb.
4. **Tariff thresholds (Natera-style clause):** choose a surcharge trigger such as "Tariff Rate above 5%" and a pass-through share of 50–100%. Keep the refund pass-back sentence, or delete it deliberately in one stack to make a negative test.
5. **Dollar caps / fees:** keep them proportional (e.g. price-increase notice 30 days, cap 8% per quarter). Mark every filled value in a hidden `fills.json` so graders know which values were synthetic.
6. Never leave "[***]" in the final corpus, because it tells the agent the document is real-but-redacted. Replace each one and record provenance.

### Material-test hooks built into the sources
- Carrier 07/23/24 vs 12/10/24: the tariff clause covered services only in the first version and was broadened to equipment in the second. Test which version a 2024 PO incorporated.
- Carrier "Total Agreement price is not subject to decrease": when Proc. 11032 cuts the residential-HVAC rate, or IEEPA duties are refunded, the Company gets no automatic reduction.
- Core & Main Rev 020425: a new "tariffs" price-increase right, conditioned on written notice.
- Ferguson: no "tariff" keyword, but "duties … in addition" plus "prices in effect at the time of shipment". Tests implicit exposure.
- Hajoca: job quotations with price protection are the exception. Test a protected job quote.
- Natera-style clause: a refund pass-back right that is the explicit link from Learning Resources through CAPE to the Company.
- Refunds go to the importer of record only (CBP CAPE page). The Incoterm and IOR on each PO decide who files the refund claim.
- Proc. 10962 (Aug 1 2025) taxed copper content only. Proc. 11021 (Apr 6 2026) moved to full customs value, at 50%/25%/10% US-melt tiers. The 11032 threshold change (95%→85%) affects "made in USA copper" claims in supplier certifications.

### Open items / not verified
- CBP copper CSMS number (I recall #65794272) is not verified.
- Chicago ECM PDFs returned HTTP 500 on 2026-09-25; retry.
- NIBCO terms are JS-rendered; Playwright is needed.
- Grainger, Winsupply, Johnstone, Mueller, Uponor, Viega and RWC sale-terms URLs were not located (JS shells, 404s or Cloudflare blocks).
- The Proc. 11021/11032 annexes are TIFF images in the FR; read HTS coverage from the govinfo PDF.
- It is unconfirmed whether the Commerce June-30-2026 refined-copper update led to a 2027 refined-copper duty (no FR document found in the "copper" presidential-docs search through 2026-08).
