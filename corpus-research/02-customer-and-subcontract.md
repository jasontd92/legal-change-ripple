# 02 — Customer-side and subcontract documents: sources, verification, generation recipes

Scope: public-sector on-call/term MSAs + child docs, commercial facilities-service agreements, residential
membership-plan terms, subcontracts (upstream to GCs and downstream to our subs), and L2 cross-contract link docs.
Fictional company placeholder used below: **"Cascade Mechanical Services, Inc."** (CA/WA/IL/TX, ~400 employees).
User preference (confirmed): substitute party names; prioritize UNREDACTED documents (public-agency contracts
with bid pricing/rate schedules). Each source notes redaction status.

Status legend: VERIFIED = fetched during this session (date 2026-09-25); LISTED = URL/dataset confirmed but
the document itself not pulled; UNVERIFIED = from memory, needs a fetch before use.

WebSearch was unavailable (budget exhausted); all verification via curl / Socrata APIs / EDGAR FTS / headless Chromium.

**Caveat:** document URLs/contents marked VERIFIED were fetched this session. Statutes, cases and legal-change dates cited as
"hooks" (anti-indemnity, pay-if-paid, auto-renewal, noncompete) are from background knowledge and were **not** re-verified
here — confirm before relying on them in eval gold labels.

---

## 1. Public-sector term / on-call MSAs with child documents

### 1.1 City of Chicago — open-data Contracts dataset + eSMART PDF repository  (VERIFIED, top pick for families)

- Dataset API: `https://data.cityofchicago.org/resource/rsxa-ify5.json` (Socrata). One row per contract *revision*
  (`purchase_order_contract_number`, `revision_number`, `award_amount` delta, `contract_pdf.url`). Revision 0 = the
  base contract; revisions 1..N = modifications / change orders / extensions / amount increases, each with its own PDF.
- Direct PDF URL pattern (works with plain curl, no session; discovered by rendering the viewer in headless Chromium):
  `https://ecm.chicago.gov/eSMARTContracts/service/DPSWebDocumentViewer?id={GUID}&osName=eContentContracts&el=0&image=image`
  (The `contract_pdf.url` in the dataset points to a JS (ZK) viewer page; swap in the pattern above using the `id=`.)
- Verified family: **PO 32572, Spec 126321, "American Airlines Baggage Area HVAC – ORD"**, contractor F.E. Moran Inc
  (mechanical contractor — a near-perfect stand-in for our company), Dept. of Aviation, base $9,150,000, revisions 0–20.
  - Rev 0 PDF: 152 pages, 142 with a text layer (13 MB). Contains contract summary sheet, specs/general conditions,
    insurance (~40 hits), indemnification, prevailing wage, liquidated damages, extensive subcontracting/MBE-WBE
    provisions (~170 hits "subcontract"). Pricing is NOT redacted (bid amount on summary sheet; bid forms inside).
  - Rev 19 PDF (credit −$425,000): 5 pages, **scanned image, no text layer** → needs OCR (tesseract is installed locally).
  - So: 1 base + 20 modification docs = a genuine real "stack" with change-order deltas both positive and negative.
- Other families surfaced in the same query (all with per-revision PDFs):
  - PO 30539 Friedler Construction, "Lee Animal Care and Control Facility HVAC, Monitoring…", base $8.25M, revs 0–6+.
  - PO 15251 Ideal Heating Co, "1869 West Pershing – HVAC Upgrades", $1.29M, revs 0–2.
  - PO 21222 Meccon Ind, "1869 W Pershing – HVAC Bid Package #3", $965K + rev 1.
  - PO 5299 Honeywell, "Annual service for maintenance & repair of HVAC system" (a true service term agreement).
  - PO T25169 / T3910600101 G F Connelly Mechanical, "Plumbing repairs & parts".
  - Job Order Contracts (JOC, i.e., master + task-order model): PO 15036 FHP Tectonics ($16M), 7119 Meccor ($18M),
    16609 F.H. Paschen ($18M), 8866 Old Veterans ($4.5M), 19642/19643 general-construction JOCs, 20604/20605
    "Heating/Weatherization JO" ($2M each), 231772 Paschen "AIS EHS 2022 Remediation JOC" (rev 2, 2026).
- Licensing: government records of the City of Chicago; public records, no copyright asserted on contract content in
  practice (Illinois FOIA). Safe to commit adapted text; strip vendor names (we substitute anyway).
- Tariff relevance: medium. Chicago construction contracts are lump-sum/unit-price; escalation language is sparse
  (1 hit for "escalat" in rev 0) — perfect as **fixed-price, no-pass-through** exhibits (the materiality driver).
- Noncompete relevance: low (none in the text); useful as distractor + flow-down (MBE/WBE, prevailing-wage
  flow-down to subs).
- Effort: low–medium (API query + curl; OCR scanned mods; trim 150-page spec books to the contract-relevant parts).

#### Chicago — best service-MSA families (VERIFIED 2026-09-25)
Query that finds them (contract_type is the facilities-maintenance bucket):
```
curl -s -G https://data.cityofchicago.org/resource/rsxa-ify5.json \
 --data-urlencode "$where=contract_type like 'WORK SERVICES%' AND (upper(purchase_order_description) like '%HVAC%' OR ... '%PLUMB%' OR '%BOILER%' OR '%CHILLER%')" \
 --data-urlencode '$select=purchase_order_contract_number,count(*) as n,...' --data-urlencode '$group=purchase_order_contract_number'
```
| PO | Contractor | Title | Revisions in dataset | Term | Notes |
|---|---|---|---|---|---|
| **134953** | Trane U.S. Inc | "Reference Contract for HVAC Products, Installation, Services and Related Products and Services" (Spec 1198987) | 0,1,2,3,4 (rev 4 approved 2026-01-28: 1-yr time extension + value increase $4.28M) | 4/20/2021 → 4/19/2027 | Base = $27.1M, **404 pp, 263 with text**. It is a City "reference" (piggyback) of the **OMNIA Partners / U.S. Communities cooperative master** (Harford County Public Schools RFP #15-JLP-023) — i.e., a real 3-level stack: cooperative master → city reference contract → modifications → PO releases. Contains prevailing wage (11), indemnification (21), insurance (100+), subcontracting/MBE-WBE (300+), CPI-indexed minimum-wage clause, and the rule "*invoices… with price/wage escalations will be rejected unless the Contract includes a provision for such an adjustment*" — a clean **no-pass-through** hook for tariff analysis. Rev 4 PDF = 27 pp, 21 text pages ("Modification Summary Report" + blanket PO modification line items with unit costs). **Unredacted** (pricing and line items visible). |
| **19651** | Anchor Mechanical, Inc | "Preventive maintenance, parts and repair service for air conditioning…" | 18 rows (revs 0–23, 2009-04 → 2020-10) | 2009–2020 | Textbook on-call HVAC service term agreement with ~18 amount/time mods. Rev 0 PDF = 180 pp **scanned (no text layer)**, rev 21 = 3 pp scanned → OCR required. Unredacted. |
| 8820 | Carrier Corp | "Maintenance, parts and repair service for AC equipment, chillers, pneumatic…" | 15 rows (2005–2015) | 2005–2015 | Older; mix of EDGE (scanned) PDFs. |
| 24483 | Independent Mechanical Industries | Maintenance, inspection and repair of high-temperature water generators | 2011–2016 | | |
| T25770 / T25775 / T25769 | Soderlund Bros / Carrier | Chiller maintenance & emergency repair; city-wide boiler repair | 1998–2004 | | |
| 1223 | All Chicago Inc | Coil cleaning of HVAC equipment | 2003–2008 | | distractor-grade |

- Older "EDGE" ids (e.g., `sid=EDGE&id=00003BJC`) resolve to a GUID only after the ZK viewer renders. Recipe: a
  12-line Playwright script (headless Chromium, installed locally) that loads the dataset URL and captures the
  `application/pdf` response URL; then curl. Verified on 19651 rev 0 → `{7DF477A4-D66F-43DF-97DC-C65463F52A6C}`.
- Use in corpus: **Stack "City of Chicago – HVAC Term Agreement"**: adapt 134953 base (trim to ~40 pp of
  contract terms + a rate/price schedule) + mods 1, 2, 4 + 2–3 generated PO releases (task orders). Replace Trane
  with Cascade Mechanical; keep the cooperative-master reference as an **L2 link** (a cooperative master whose
  pricing terms govern the city contract).

### 1.2 Cook County, IL — "Procurement – Awarded Contracts & Amendments" (VERIFIED)
- API: `https://datacatalog.cookcountyil.gov/resource/qh8j-6k63.json`; each row has `category.url` pointing to a direct PDF:
  `https://opendocs.cookcountyil.gov/procurement/contracts/<no>.pdf` and `.../procurement/modifications/<no>-A<n>.pdf`.
  Plain curl works (no JS).
- Verified documents:
  - **2245-06165 The Stone Group — chiller maintenance at Dept. of Facilities Mgmt outlying facilities**: base 113 pp
    (17.9 MB) + **A1 (2026-02, $2.0M)** 35 pp. Mostly scanned; the text layer that exists is font-encoded garbage
    (`/0/1/2/...`) → **OCR required** (tesseract).
  - **12-28-340-MC9 S Mechanical, Inc. — County-wide Job Order Contract (mechanical)**: base 250 pp scanned;
    **A2** 1 pp clean text ("increase of $714,345.21 … two one-year renewal options … NTE $4,000,000"). Sister contract
    12-28-340-MC10 (Paschen/Autumn JV) with its own A2. A genuine JOC master → amendments family (JOC task orders are
    issued against a unit-price book, e.g., Gordian RSMeans + contractor coefficient).
  - 1345-12956 Anchor Mechanical — "Service contract, centrifugal and absorption chillers, maintenance" (121 pp, scanned).
  - 2585-05300 Meade Inc — Electrical & Mechanical item maintenance, $26.1M (2026-01) — not fetched.
- Redaction: none observed (county posts executed contracts incl. bid pages).
- Licensing: Illinois public records. Effort: medium (OCR on large scans; tesseract is available locally).

### 1.3 Washington DES statewide contracts (VERIFIED) — **the single best customer-side source found**
Portal: `https://apps.des.wa.gov/DESContracts/` (list is JS-rendered; contract PDFs are plain static files under
`https://apps.des.wa.gov/contracting/`, curl-able). All documents are **fully unredacted** — rates and markups public.

**Contract 04224 "HVAC Services" (eff. 2025-09-10 → 2028-09-30; replaces 02919)**
Summary page: https://apps.des.wa.gov/DESContracts/Home/ContractSummary/04224 — has an explicit
**"TARIFFS: No tariffs have been approved for this Contract. Any additional fees proposed by the Contractor are not
authorized or allowed. Please return invoices for correction…"** notice. That is a live, real-world tariff-surcharge
prohibition sitting on a customer contract for exactly our company's work.
- Multi-award (7 mechanical contractors, by region): McKinstry, Apollo Mechanical, Elite Mechanical, West Coast
  Mechanical, TRS Mechanical, Western Mechanical, JH Kelly. Per-vendor docs:
  - Contract: `04224c.McKinstry.pdf` (39 pp, all text), `04224c.WesternMech.pdf` (40 pp), `04224c.Apollo.pdf`,
    `04224c.Elite.pdf`, `04224c.WestCoast.pdf`, `04224c.TRS.pdf`, `04224c.JHKelly.pdf`
  - Amendment: `04224a.McKinstry.pdf` (7 pp; Amendment No. 1 eff. 2025-10-01 adding North-Central region and
    **replacing Exhibit B – Prices in its entirety** — a clean price-exhibit-swap amendment pattern), `04224a.Apollo.pdf`
  - Pricing: `04224p.xlsx` (sheets: Awarded Areas & Other Fees; Electrician; Refrigeration-Air Conditioning;
    **Plumber & Pipefitter**; Sheet Metal Worker; **Parts**). Pricing model = county prevailing wage + % markup
    (regular / after-hours / emergency), parts at cost + % markup (e.g., McKinstry 14–22%), truck charge ($60–$205),
    subcontractor markup (25% for two vendors).
- Key clauses (verified text):
  - §3.3 Economic adjustment for labor: only via L&I semi-annual prevailing-wage updates; "There shall be no other
    economic adjustment to the labor rates."
  - §3.4 Economic adjustments for part rates: "The prices for HVAC Parts … will not be adjusted through the Economic
    Adjustment process … There shall be no other economic adjustment." → parts are **cost + fixed markup**; a tariff
    raises cost (passes through at cost) but the markup % and any fixed-price quote are locked. Great nuanced test.
  - §3.5 **Price ceiling**: "Contractor guarantees to provide the Goods and/or Services at no greater than the prices
    set forth in Exhibit B" — a quasi-MFN/ceiling (L2 hook).
  - §7 Subcontractors; §8 Prevailing wages (RCW 39.12); §14 Insurance (additional insured, primary, waiver of
    subrogation, extended reporting); indemnification with express **Title 51 industrial-insurance immunity waiver
    "mutually negotiated"** (the RCW 4.24.115 anti-indemnity carve-out in action); §18 PO termination; §19 Public Records.
  - Invoice requirements: "(e) Prevailing Wage plus percent prevailing wage markup… (f) Itemized list of parts with
    actual cost and parts over percent markup".
- Predecessor **02919 HVAC Services** (2019–2025) with amendment binders: `02919c.Mckinstry.pdf`,
  `02919%20McKinstry%20Binder%20AMD%201-3.pdf` (binder is **scanned**, 9 pp, OCR needed), `02919c.air.pdf`,
  `02919%20Air%20Sysms%20AMD%201-3.pdf`, `02919c.Apollo.pdf`, `02919c.Hermanson.pdf`, `02919c.TRS.pdf`,
  `02919a.TRS.pdf`, pricing `02919p.xlsx`. Useful for "old vs. new version" of the same stack.
- Related (supplier side; L2 to supplier contracts in another agent's scope): **23623 Plumbing Fixtures, Repair Parts,
  and Culverts** (Ferguson, Keller, The Part Works; same "No tariffs have been approved" notice; note "bid pricing was
  adjusted in Feb '26"); `23623a.Ferguson.pdf` = Amendment 1 eff. 2025-06-15 (21 pp, text). **27723 HVAC Parts**
  (catalog price lists for Belimo/Honeywell/JCI/Siemens). 06225 Generator maintenance; 28723 Elevator maintenance
  (distractors).
- Licensing: Washington state government records, public under RCW 42.56; no copyright restriction asserted. OK to commit.
- Corpus use: **Stack "WA DES Statewide HVAC Services – Contract 04224"**: base contract + Amendment 1 + Exhibit B pricing
  (convert xlsx to a text table, keep only Cascade's column) + 3–5 generated agency purchase orders / service quotes
  (e.g., WSDOT region office PM, UW Tacoma emergency repair) that incorporate 04224 by reference. Tariff test: a
  steel/aluminum/copper tariff raises parts cost → allowed at cost only; any tariff *surcharge* line is disallowed per
  the DES notice; fixed-price PM quotes absorb it. Effort: **low** (text PDFs + xlsx).

### 1.4 Legistar Web API — generic method for CA / TX / WA city council agreements (VERIFIED)
Many cities attach the executed agreement, RFP (with the sample contract terms), amendments, and price schedules to
council "matters". The public API needs no key:
```
curl -s -G "https://webapi.legistar.com/v1/<client>/matters" \
  --data-urlencode "\$filter=substringof('lumbing',MatterTitle) or substringof('HVAC',MatterTitle)" --data-urlencode '$top=200'
curl -s "https://webapi.legistar.com/v1/<client>/matters/<MatterId>/attachments"   # -> MatterAttachmentHyperlink (PDF)
```
Clients verified to respond: `sanantonio` (89 hits), `longbeach` (98), `fresno` (33), `sfgov` (49; mostly codes/MOUs),
`cityofdallas` (29), `fortworthgov` (17), `sanjose` (18), `oakland` (21), `sacramento` (7), `seattle` (8; codes/CBAs).
(`chicago`, `cook-county` not on Legistar.) Attachment links are on `legistar.granicus.com/<client>/attachments/<guid>.pdf`
or `<client>.legistar1.com/...`; a few return HTML/truncated streams on first try — retry.

**San Antonio, TX (VERIFIED)** — richest TX family.
- Matter 32852 (2019): "contract with Mueller & Wilson, Inc., to provide on-call plumbing maintenance and repair
  services for the San Antonio Airport System" ($200K/yr). Attachments: RFCSP 6100011090 "Annual JOC for On-Call
  Plumbing Services – SAIA" (**70 pp, 68 text pages**; contains the full contract terms — the RFCSP *is* the
  contract form in SA practice), executed contract/signature page (`61-11090 Mueller & Wilson`, 1 p scanned), scoring
  matrix, ordinance 2019-10-03-0796.
  - Pricing model: **Job Order Contract** — "Contractor's Coefficient shall be applied to the applicable line item(s)
    in the *most current* RS Means Plumbing Cost Data price book" (fallback: RSMeans Facilities M&R). Work is released
    by purchase orders/job orders (70 hits), P&P bonds per Tex. Gov't Code ch. 2253, prevailing wage rates,
    **broad-form "FULLY INDEMNIFY, DEFEND and HOLD HARMLESS"** (note Tex. Ins. Code ch. 151 anti-indemnity limits
    this for construction work since 2012 — a good legal-analysis wrinkle), insurance (43 hits), SBEDA subcontracting (114).
  - Tariff nuance: the "most current RSMeans book" clause is an **indirect annual escalator** — material-cost increases
    from tariffs flow in with the next book edition, not immediately. The coefficient is fixed. Excellent test case.
- Matter 40662 (2021): contracts with A-Ram Plumbing, Craftsman Plumbing, HJD Capital Electric for on-call commercial
  plumbing citywide; attachments: RFCSP "Annual Contract for On-Call Plumbing Services Citywide", Addendum I, score
  matrix, Ordinance 2021-02-18-0107 (first fetch returned HTML — retry).
- Matter 40529 (2021): On-Call City-wide Commercial HVAC Services; 6499/13910/20459 (2015–2017) JOCs with Accu-Aire
  Mechanical, Brandt Companies, Mechanical Technical Services (HVAC) — a multi-year sequence of the same program.
- Redaction: none (price proposal/coefficients typically appear in the score matrix or award memo).
**Dallas, TX**: 16345 (2024) "three-year service price agreement for citywide plumbing services — A Star Heat and Air";
  5537/20727 minor-plumbing SPAs (2020, 2025); 5156 cooperative (BuyBoard/TIPS) plumbing with The Brandt Companies.
  Attachments on the matter are only resolutions (.docx) → the agreement itself needs an open-records request or the
  Dallas procurement portal. LISTED.
**Fort Worth, TX**: 6802 (2022) "Agreement with Jackey R Dunn dba Romance Services for Plumbing Services on an
  As-needed Basis, up to $1,825,700 initial term + four renewals"; 8826 (2023) Freer Mechanical & A&G Piping via
  **interlocal with Tarrant County Contract 2022-210** (piggyback = L2); 3943 (2021) Trane/Enviromatic via
  **BuyBoard cooperative**; 12447 (2025) BuyBoard 756-24. Only M&C memos attached. LISTED.
**San José, CA**: 13973 (2024) "Amendment to the Master Agreement with Advance Design Consultants … MEP consulting" —
  attachment `Agreement` (2 pp) = First Amendment replacing **Exhibit B: Schedule of Rates and Charges** (VERIFIED). A&E
  side, not trade work, but the master-agreement + rate-exhibit-amendment pattern is directly reusable.
**Long Beach, CA**: 237480 (2021) contract with Engineered Mechanical Services (HVAC); 242943 (2023) Allied Refrigeration
  "emergency as-needed HVAC…"; 210579 as-needed HVAC parts. Attachments are staff reports; agreements LISTED.

### 1.5 Other public-sector sources (LISTED / partially verified)
- **Fresno, CA** (Legistar `fresno`): JOC "General Building Construction and HVAC Construction" program, Bid File 9549 (matter
  11964, 2020: "Standard Contract" + bid evaluation, 3 pp each, scanned) → matter 13953 (2022) **Amendment No. 1 –
  Strategic Mechanical, Inc.** (VERIFIED text: +$700,000; max contract value $3.7M over three one-year terms) and
  Amendment No. 2 for Durham/Puma; matter 12417 (2020) JOC amendments (Durham, Puma, Mesa Energy); 16836 (2023) new
  multi-award HVAC JOC; 11965/20221 Gordian Group JOC program agreements (the unit-price-book vendor → L2).
  The JOC "Standard Contract" references specs not attached → pull full bid-file from the city (open records) or generate.
- **Austin, TX** Finance Online contract catalog (200 OK): https://financeonline.austintexas.gov/afo/contract_catalog/OVCCSearch.cfm
  — ColdFusion search of Master Agreements (MA) with per-contract document links (not deep-tested).
- **King County, WA** procurement dataset `https://data.kingcounty.gov/resource/dqit-zt74.json` (metadata only:
  not-to-exceed, spend to date, "WORK ORDER" contract type) — good for realistic dollar figures, no docs.
- **Sourcewell / OMNIA / BuyBoard / TIPS cooperative contracts**: Sourcewell pages are JS-rendered and old contract IDs
  redirect to search; Sourcewell has regional "Mechanical/HVAC Construction" JOC awards (e.g., MO-R3-HVAC01-051222-VCC,
  IL-R1-GC-122122-AGA). TIPS returned 403 to curl. These matter mainly as **L2 piggyback masters** (Chicago 134953 ←
  OMNIA; Fort Worth ← BuyBoard 756-24 / Tarrant County 2022-210). Generate a short cooperative master summary rather
  than chase full docs.
- **Federal/HUD public-domain flow-down forms** (VERIFIED fetchable, public domain as U.S. Government works):
  - FHWA-1273 Required Contract Provisions, Federal-Aid Construction: https://www.fhwa.dot.gov/programadmin/contracts/1273/1273.pdf (341 KB) — must be physically incorporated in every subcontract → canonical flow-down.
  - HUD-5370 General Conditions for Construction Contracts – Public Housing Programs: https://www.hud.gov/sites/dfiles/OCHCO/documents/5370.pdf (775 KB). (5370-C non-construction URL guess 404'd; find via HUDCLIPS forms index https://www.hud.gov/program_offices/administration/hudclips/forms/hud5a.)
  - FAR 52.244-6 (commercial subcontract flow-downs): https://www.acquisition.gov/far/52.244-6.

---

## 2. Subcontract agreements

### 2.1 Real subcontract found on EDGAR — BW Industrial Holdings / Propersys "Service Agreement" (VERIFIED, 2025)
- URL: https://www.sec.gov/Archives/edgar/data/2080841/000121390025126775/ea025237804ex10-1_bwindus.htm
  (EX-10.1 to BW Industrial Holdings S-1/F-1, filed 2025-12-31; ~70K chars).
- Structure: Propersys Corporation ("Contractor", under a **Design-Build Master Work Agreement with Owner TSMC Arizona
  Corporation dated April 15, 2025**) ↔ BW Industrial Construction ("Subcontractor"). 38 articles: incorporation of
  Contract Documents (flow-down / "bound to Contractor as Contractor is bound to Owner"), P&P bonds, Contract Price by
  Purchase Order (i.e., MSA + PO children), progress payments with retainage, final payment, insurance (CGL $1M/$2M,
  auto $1M, WC/EL), broad-form indemnity with a savings clause ("any portion… exceeding the scope permitted under law
  shall be considered to be redacted"), E-Verify FAR 52.222-54 flow-down, changes, claims, backcharges, default,
  termination, limitation of liability, controlling law.
- Redaction: only phone/email `[*]`. **Pricing lives in POs not filed** → generate POs.
- Use: adapt as **our downstream sub-subcontract template** (Cascade → its insulation / controls / excavation subs),
  or invert as the GC-issued subcontract Cascade signs. Pay-when-paid language is weak here; add a Cascade-drafted
  pay-if-paid variant for CA/IL/TX/WA comparison (see 2.3).
- License: SEC filings are public records; drafting party retains nominal copyright but EDGAR exhibits are the standard
  source for public contract corpora (CUAD, LEDGAR). Low risk; name substitution further de-identifies.

### 2.2 Copyrighted forms to AVOID committing verbatim
- **AIA** A401 (Contractor–Subcontractor), A201, A121/CMc, A111 appear verbatim in EDGAR exhibits (e.g., Wheeling
  Island Gaming EX-10.7 2003 — AIA A121/CMc–AGC 565; DuPont Fabros EX-10.31 2007 — AIA A111-1997 Holder Construction;
  Skechers EX-10.1 2010 — AIA A111 with 119 confidential-treatment omissions). Being on EDGAR does **not** license AIA
  text. Use only as structural reference; do not commit.
- **ConsensusDocs 750/751/752**, **AGC**, **EJCDC** forms: copyrighted, licensed per use. Avoid.
- GC house forms (Turner, Skanska, Hensel Phelps, etc.) found online: copyrighted, no license → paraphrase only.

### 2.3 What must be generated for subcontracts (recipe)
Real, freely redistributable GC→trade subcontract forms are scarce (AIA/ConsensusDocs dominate; GC house forms are
copyrighted). Recommended approach: **one real anchor (2.1) + generated variants built from public-domain clause
building blocks**:
- Public-domain flow-down blocks to paste verbatim: FHWA-1273 (federal-aid), HUD-5370 §§ on subcontracts, Davis-Bacon
  29 CFR 5.5(a) clauses, FAR 52.222-54 E-Verify, 52.244-6; state prevailing-wage statutes (Cal. Lab. Code §§1775–1777.5,
  RCW 39.12, 820 ILCS 130, Tex. Gov't Code ch. 2258); public-agency prime terms from §1 above (WA DES 04224, Chicago
  134953, San Antonio JOC) to be "flowed down".
- State-specific traps to encode (each is a legal-change hook):
  - Anti-indemnity: **CA Civ. Code §2782** (+ §2782.05 for private residential/commercial post-2013), **WA RCW 4.24.115**
    (plus Title 51 waiver must be "mutually negotiated" — matches WA DES text), **IL 740 ILCS 35**, **TX Ins. Code ch. 151**
    (2012; bars broad-form indemnity for most construction, applies to CGL-backed indemnities).
  - Pay-if-paid: **CA** unenforceable (*Wm. R. Clarke Corp. v. Safeco*, 1997); **TX** enforceable only with Bus. & Com.
    Code §56.051 notices/limits; **IL** generally enforceable if clearly stated; **WA** enforceable if unambiguous
    (pay-when-paid read as timing absent clear language).
  - Retention caps / prompt pay: CA Pub. Cont. Code §7107 & Civ. Code §8800-8822 (5% public retention cap since 2012 for
    most public works), TX Prop. Code ch. 28 / Gov't Code ch. 2251, WA RCW 60.28 (5% retainage), IL 50 ILCS 505 / 30 ILCS 540.
- Generated subcontract set (Cascade as sub to a GC): 4 subcontracts, one per state, each with (a) a GC form drafted by
  a fictional GC (e.g., "Northline Builders" in WA, "Lakeshore Construction Group" in IL), (b) the GC's prime-contract
  excerpt it incorporates (flow-down), (c) 1–3 change orders, (d) a material-escalation rider on one of them, (e) a
  fixed-price, no-escalation lump-sum on another (tariff-exposed). Seed language from the 2.1 anchor's 38-article
  structure, write fresh prose (don't paraphrase AIA A401 line by line).
- Generated downstream sub-subcontracts (Cascade → its subs: insulation, controls/BAS, core-drilling, excavation,
  crane): adapt 2.1 directly as Cascade's "Master Subcontract Agreement" + short "Work Authorization" POs; include a
  **mirror flow-down** clause pointing at the customer prime (L2), an employee **non-solicitation/no-hire** clause
  (noncompete-relevant; see §5), and a pay-if-paid clause that is void in CA (tests state-aware analysis).
- Pricing gaps: sub-subcontract values for a ~400-person MEP firm are typically $15K–$750K per scope; controls
  subs $40K–$250K on a $2–5M mechanical package; insulation 4–7% of mechanical contract value; retainage 5% (WA/CA public),
  10% (TX/IL private, often reduced to 5% at 50% completion).

---

## 3. Commercial facilities-maintenance / service agreements (property managers, GCs, facilities)

### 3.1 What exists and what doesn't
- EDGAR (VERIFIED, several full-text queries): vendor-level HVAC/plumbing service MSAs are almost never material enough
  to be filed. Hits are master leases (HCP/Brookdale EX-10.2 2014 — HVAC/plumbing *maintenance obligations of tenant*),
  REIT PSAs (KBS, Hines, Mack-Cali 2013–2014 EX-10.x), IT/BPO outsourcing MSAs with facilities schedules (Gap 2009/2013
  `exhibit101msa.htm`, Health Net 2008/2015, CoreLogic 2011–2012), and LNG EPC contracts with **tariff/change-in-law price
  adjustment** language (Cheniere Stage III EPC EX-10.1 2022-05-04; NextDecade EX-10.1/10.2 2025-08-01; Sabine Pass
  2018-11-09). The EPC tariff clauses are the best **real clause language** to borrow for a commercial "tariff /
  change-in-law adjustment" provision, then scale down.
  Example URL (verified pattern): https://www.sec.gov/Archives/edgar/data/1612720/000161272025000009/ex101-2q25.htm
  (NextDecade 2025 — not opened; confirm before use).
- Leases are useful **distractors** and **L2**: a tenant-maintenance-obligation master lease (HCP/Emeritus EX-10.2
  2014: https://www.sec.gov/Archives/edgar/data/1332349/000133234914000027/exhibit10_2.htm, 850K chars, CPI escalator)
  shows why a property manager customer cares about a tariff on replacement RTUs (pass-through to tenants via CAM).
- Real public MSAs in §1 (Chicago 134953/19651, WA DES 04224, San Antonio JOC) are structurally identical to commercial
  facilities MSAs (master → PO/work order → change order). **Recommendation: generate commercial MSAs by re-skinning the
  WA DES 04224 structure into private-sector form**, which keeps realism and no redactions.

### 3.2 Generation recipe — commercial customer stacks
For each stack: MSA (12–25 pp) + Rate Schedule exhibit + 3–8 Work Orders/SOWs + 0–2 amendments + customer's
incorporated vendor code of conduct / web terms.
- Customers (fictional): a national property manager (e.g., "Meridian Property Partners" — 40 office/multifamily sites in
  CA/WA), a REIT-owned life-science campus (IL), a hospital system facilities dept (TX), a big-box retailer (multi-state
  RTU PM program), a data-center operator (chiller PM; high liquidated-damages SLA), a GC with a warranty-service MSA.
- Pricing (realistic for ~400-employee, ~$90–120M revenue MEP service firm):
  - Labor: journeyman HVAC/plumbing tech $135–$175/hr (CA/WA), $115–$150 (IL), $95–$135 (TX); OT 1.5×, emergency/after
    hours 2×; apprentice $85–$110; trip/truck charge $95–$205 (WA DES real range $60–$205).
  - Materials: cost + 15–35% (WA DES real range 14–90% by region); equipment >$10K at cost + 10–15%.
  - PM contracts: fixed annual fee, e.g., $3.2K–$9K per RTU/year for quarterly PM; chiller PM $18K–$60K/yr.
  - Escalation variants to seed: (a) fixed price, no escalation for 3 yrs (tariff-exposed); (b) annual CPI-U cap 3–4%;
  (c) PPI-based material index (BLS WPU10250201 copper wire/pipe, WPU101 iron & steel, PCU333415 HVAC equipment);
  (d) explicit "changes in law, including tariffs, duties…" pass-through with 30-day notice + documentation;
  (e) force-majeure price-increase clause (real example: Four Seasons Heating & Air terms, §4.1).
  - MFN/most-favored-customer and price-ceiling clauses on 2 of the stacks (see §5).
  - VERIFIED 2025-09-25: NextDecade EX-10.1 (2025-08-01) is the *Amended and Restated Fixed Price Turnkey Agreement*
    (Rio Grande LNG, Texas); "Applicable Law" expressly includes "(iii) tariffs, quotas, and duties" (→ change-in-law
    relief) and "Taxes" includes "tariffs, duties". **Heavily redacted (1,629 `[***]` placeholders)** — use only for clause
    language, never as a corpus stack. Gap-fill not needed since we only borrow definitions.

---

## 4. Residential service agreements and maintenance-membership terms (HTML)

All VERIFIED fetchable with curl (HTML, no JS needed) on 2026-09-25; Wayback CDX counts are distinct-digest captures
(`https://web.archive.org/cdx/search/cdx?url=<url>&output=json&collapse=digest&filter=statuscode:200`; note: use https —
the http endpoint returned empty).

| Company (state) | URL | What it contains | Wayback versions |
|---|---|---|---|
| **Washington Energy Services** (Seattle, WA) | https://www.washingtonenergy.com/guardian-maintenance-club-terms-restrictions/ + plan page https://www.washingtonenergy.com/guardian-maintenance-plan/ | Guardian Maintenance Club: anniversary date, AC window (May 15–Sep 15), reminders, 45-day scheduling duty, cancellation/transfer, refunds, discount benefits; plan page shows $ prices | 4 (2014, 2015, 2019×2) |
| **Four Seasons Heating & Air** (Chicago area, IL) | https://www.fourseasonsheatingcooling.com/terms-conditions/ | Sales & service T&Cs (~30K chars): title retention until paid, taxes/shipping extra, **force-majeure clause allowing price increase "if the Company's costs are otherwise increased"**, Illinois governing law | 3 (2026) |
| **Bell Brothers** (Sacramento, CA) | https://bellbrothers.com/comfort-club ; https://bellbrothers.com/terms-and-conditions | Comfort Club membership marketing + site/sales terms (large pages, ~68K chars incl. boilerplate) | 13 (2024-12 → 2026-06) |
| **Parker & Sons** (Phoenix, AZ — relocate to TX/CA in adaptation) | https://www.parkerandsons.com/maintenance-agreement (+ /plans/annual, /plans/monthly) | Full membership contract text: annual vs **monthly plan "continues perpetually until the Purchaser cancels"**, 30-day refund less $20 fee, prorated refunds, benefits, prices | **39** (2017 → 2022+) — best for version-diff tests |
| **One Hour Heating & Air** (Neighborly franchise; TX/CA locations exist) | https://www.onehourheatandair.com/albany/about-us/protection-plans/terms-conditions/ ; club pages per location e.g. /elk-grove/about-us/heros-club/ (CA), /ellis-county/about-us/heroes-club/ (TX) | Protection-plan T&Cs: warranty disclaimers, consequential-damages exclusion, 1-yr limitation of action, alterations void | 8 (2022 → 2026) |
| **Benjamin Franklin Plumbing** (Neighborly) | https://www.benjaminfranklinplumbing.com/about-us/club-membership-program/ ; /albany/about-us/protection-plans/terms-conditions/ | Club membership program + T&Cs | 27 (2023-12 → 2025+) |
| **ARS / Rescue Rooter** (national incl. TX) | https://www.ars.com/ars-cares/terms-conditions | Program T&Cs (~21K chars) incl. price/increase language | 14 (2019 → 2026) |
| Mr. Rooter (Neighborly) | https://www.mrrooter.com/maintenance-plans/ ; https://www.mrrooter.com/neighborly-done-right-promise-terms/ | Plan marketing + "Done Right Promise" terms | not checked |

- Redaction: none (public web pages). Licensing: **copyrighted website text** of real companies — adapt heavily
  (rename, restructure, rewrite) rather than commit verbatim; keep a source map privately. Lower risk than AIA, but do
  not commit raw copies.
- Legal-change hooks: CA Automatic Renewal Law (Bus. & Prof. Code §17600 et seq., amended by **AB 2863, eff. July 1,
  2025**: click-to-cancel, annual reminder, consent to price changes); FTC Negative Option ("click-to-cancel") rule —
  vacated by the 8th Circuit in July 2025 (a "change that un-happens" test case); WA RCW 19.86 + 2025 auto-renewal bills;
  IL 815 ILCS 601 Automatic Contract Renewal Act; TX Occupations Code ch. 1303 (residential service companies — TREC
  regulates *home warranty*-like plans; test whether a membership plan crosses into a regulated "residential service
  contract"). CA Bus. & Prof. Code §9855 (service contracts) likewise.
- Tariff hook: membership plans usually promise "X% off repairs" and "no overtime charges" — price-lock exposure is
  small but equipment-replacement quotes (HVAC system $9K–$22K) are tariff-exposed; generate 5–10 signed residential
  **installation proposals** with 30-day price validity and a "prices subject to manufacturer increases" clause (or not).

### 4.1 Recipe — residential docs
- Cascade "Comfort Club" membership terms (HTML), 3 dated versions (2023, 2025-07 AB 2863 update, 2026) — derive from
  Parker & Sons (structure) + Washington Energy (benefits) + Four Seasons (force-majeure price clause). Prices: $16.95–
  $24.95/mo or $189–$279/yr per system; 15% repair discount; priority dispatch; waived trip fee ($89 value).
- Residential Sales & Service Terms (web terms incorporated by reference into every invoice/proposal) — one current + one prior.
- 6–10 residential proposals/contracts (water-heater replacement $2.4K–$4.8K; tankless $4.5K–$7.5K; HVAC changeout
  $9K–$22K; repipe $6K–$15K) with CA 3-day right-to-cancel (Civ. Code §1689.5ff home-solicitation) and TX/IL/WA equivalents.

---

## 5. L2 cross-contract link documents and noncompete-relevant customer-side clauses

| Link type | Real source (verified) | What to generate |
|---|---|---|
| **Price ceiling / quasi-MFN** in customer contract | WA DES 04224 §3.5 "no greater than the prices set forth in Exhibit B"; Chicago 134953 invoices "with price/wage escalations will be rejected unless the Contract includes a provision" | 2 commercial MSAs with true MFN ("no less favorable than prices offered to any similarly situated customer") → raising prices elsewhere (tariff pass-through) triggers MFN duty on the MFN customer |
| **Cooperative piggyback master → local contract** | Chicago 134953 ← OMNIA/U.S. Communities (Harford County RFP 15-JLP-023); Fort Worth ← BuyBoard 756-24, Tarrant County 2022-210 (Legistar 8826, 12447) | A 5–8 pp cooperative master summary + 2 local "participating addenda" that inherit its price-adjustment clause |
| **Flow-down mirror** (prime → our subcontract → our sub-sub) | BW Industrial/Propersys 2025 (incorporation by reference to Owner Design-Build Master Work Agreement, E-Verify flow-down); FHWA-1273; HUD-5370 | Chain: GC prime excerpt (generated) → GC-issued subcontract to Cascade → Cascade sub-sub to insulation sub; tariff relief granted in prime flows (or fails to flow) down |
| **Fixed-price, no pass-through** | WA DES 04224 §3.3–3.4 ("There shall be no other economic adjustment"), Chicago 32572 lump-sum HVAC construction ($9.15M) with 20 change orders | 3 lump-sum work orders/subcontracts signed pre-tariff with install dates post-tariff |
| **Indirect escalator** | San Antonio JOC: coefficient × "most current RS Means" book | 1 JOC stack; tariff flows in only at next book edition |
| **Tariff-surcharge prohibition** | WA DES 04224 & 23623 summary pages: "No tariffs have been approved for this Contract… additional fees… not authorized" | Put this language in the incorporated "ordering instructions" web page of the WA stack |
| **Noncompete / no-hire** (customer or GC can't hire our techs; we can't solicit theirs) | Not found in public-agency docs (public contracts rarely include them). Common in private MSAs and staffing-like service contracts | Add employee non-solicit/no-hire (12–24 mo, liquidated fee = 25–50% of annual comp) to: 2 commercial MSAs (CA, WA), 1 GC subcontract (IL), Cascade's sub-sub template. Hooks: CA B&P §16600/16600.5 (2024) & *AMN Healthcare v. Aya* (2018) on no-hire; WA RCW 49.62 as amended 2024 (SB 5935 — "noncompetition covenant" includes agreements that prohibit/penalize employees from serving former customers); IL 820 ILCS 90 (Freedom to Work Act, amended 2022, non-solicit income threshold $45K); TX Bus. & Com. Code §15.50; federal FTC noncompete rule (vacated 2024; FTC dropped appeal 2025). |

---

## 6. Summary table — document types for the corpus

| # | Doc type | Purpose | Best real source (verified) | Redaction | License | Effort | Generate? | Suggested count |
|---|---|---|---|---|---|---|---|---|
| 1 | Public on-call HVAC service master (multi-award statewide) | tariff + L2 (price ceiling, surcharge ban) | WA DES 04224 (contract, amendment 1, pricing xlsx) | none | public record | low | 3–5 agency POs/quotes | 1 stack, ~8 docs |
| 2 | City HVAC term agreement with long mod history | tariff (no pass-through), distractor volume | Chicago 134953 (Trane ref. contract, 5 revs) / 19651 (Anchor Mech., 18 revs) | none | public record | medium (OCR, trimming 400 pp) | 2–3 PO releases | 1–2 stacks, 6–10 docs each |
| 3 | JOC master (unit-price book × coefficient) | tariff (indirect escalator) | San Antonio RFCSP 6100011090 (70 pp text) + ordinance; Cook County 12-28-340-MC9 + A2; Fresno Strategic Mechanical A1 | none | public record | low–medium | 3–4 job orders with RSMeans line items | 1 stack, ~6 docs |
| 4 | Lump-sum HVAC construction contract + change orders | tariff (fixed price) | Chicago 32572 (F.E. Moran, $9.15M, 20 mods) | none | public record | medium (OCR mods) | none/2 COs | 1 stack, 5–8 docs (subset of mods) |
| 5 | Commercial facilities MSA + WOs | tariff, MFN, no-hire | none suitable (EDGAR thin) — re-skin WA DES/Chicago structure | n/a | generated | medium | full | 5–6 stacks, 4–10 docs each |
| 6 | GC → Cascade subcontract + prime excerpt + COs | flow-down L2, anti-indemnity, pay-if-paid | BW Industrial/Propersys 2025 anchor; public-domain FHWA-1273/HUD-5370 | contact info only | EDGAR public | medium | yes (4 states) | 4 stacks, 3–5 docs each |
| 7 | Cascade → sub-sub master + work authorizations | flow-down L2, no-hire | same anchor | — | — | low | yes | 3 subs × (MSA + 1–2 WAs) |
| 8 | Residential membership terms (HTML, versioned) | ARL / auto-renew law changes; mild tariff | Parker & Sons (39 Wayback versions), Washington Energy, Four Seasons (IL force-majeure price clause), Bell Bros (CA), One Hour/Ben Franklin/ARS | none | copyrighted web text → adapt | low | yes (rewrite) | 3 versions + 1 web T&C × 2 versions |
| 9 | Residential proposals/contracts | tariff (quotes), home-solicitation cancel rights | none (generate) | — | — | low | yes | 6–10 |
| 10 | Cooperative master / piggyback addendum | L2 | Chicago 134953 ← OMNIA; Fort Worth ← BuyBoard | — | — | low | yes (summary) | 1 master + 2 addenda |
| 11 | Distractors | noise | WA DES 06225 generator maint., 28723 elevator; Cook County boiler/parts POs; HCP/Emeritus master lease; San José MEP consultant rate-exhibit amendment | none | public | low | no | 8–15 |

**Rough totals for this scope:** ~20–25 stacks, ~110–150 documents; ~40% real-adapted (public-agency + EDGAR anchor),
~60% generated using the real documents as templates and the pricing recipe above.

### 6.1 Gap-filling recipe for any redacted / missing pricing (for a ~400-employee CA/WA/IL/TX mechanical service firm)
1. Labor: start from the state's prevailing-wage determination for Plumber/Pipefitter & Refrigeration/AC Mechanic
   (WA L&I, CA DIR, IL IDOL, TX Davis-Bacon WD) — add **markup 50–110%** for billed rate (WA DES real: 0.5–1.9× on PW).
2. Materials: parts at cost + 14–35% (use 0.9 only for remote counties); equipment at cost + 10–15%.
3. Truck/trip: $60–$205; emergency 1.5–2×; minimum 2-hr call-out for after-hours.
4. Contract NTE sizes: city on-call $200K–$2M/yr; state multi-award $1–7M over term; county JOC $2–4M NTE;
   commercial PM MSA $150K–$1.5M/yr; GC subcontracts $0.4–9M.
5. Change orders: 60% additive (+2–15% of base), 25% time-only, 15% deductive (Chicago 32572 shows −$425K, −$150K credits).
6. Keep numbers internally consistent across the stack (amendment totals = base + Σ deltas) — the eval can test this.

### 6.2 Tooling notes (reproducible)
- Headless Chromium via local Playwright (`npm i playwright`, chromium already cached) resolves JS viewers (Chicago
  eSMART ZK viewer; WA DES contract list; Sourcewell).
- `pypdf` for text layers; **tesseract** (installed at /opt/homebrew/bin) for scanned mods (Chicago EDGE-era, Cook
  County, WA 02919 binders).
- SEC EDGAR FTS works with `User-Agent: research-bot/1.0 research@example.com`; full-text index covers 2001+.
- WebSearch, DuckDuckGo HTML (captcha) and Bing were unavailable; everything above was discovered via APIs and site maps.
