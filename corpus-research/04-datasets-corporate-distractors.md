# 04 — Open contract datasets, corporate/finance docs, distractors, corpus-level inventory

Research date: 2026-09-25. Status legend: **[V]** = verified this session (fetched/parsed), **[K]** = from prior knowledge, not re-verified this session, **[W]** = weak source.

Company under simulation: US plumbing & HVAC home/commercial services, ~400 employees, CA/WA/IL/TX, copper-pipe heavy, roll-up acquirer of local shops.

Standing constraints from coordinator: party-name substitution is confirmed; **prefer unredacted documents** (no `[***]` confidential-treatment gaps in price/term provisions); give recipes to fill gaps where an otherwise-ideal document is redacted.

---

## 1. CUAD (Contract Understanding Atticus Dataset) — verified

### 1.1 Facts [V]
- Host: https://huggingface.co/datasets/theatticusproject/cuad (HF API `license:cc-by-4.0`, not gated). Also https://github.com/TheAtticusProject/cuad (code + `data.zip`) and www.atticusprojectai.org/cuad.
- **Source: SEC EDGAR** (README: "The contracts were sourced from EDGAR"). Filenames encode filer, filing date, form, exhibit number, e.g. `UpjohnInc_20200121_10-12G_EX-2.6_11948692_EX-2.6_Manufacturing Agreement_ Supply Agreement`.
- **License: CC BY 4.0** for the annotations/dataset; README disclaimer: "We make no representations or warranties regarding the license status of the underlying contracts, which are publicly available and downloadable from EDGAR." Practical read: EDGAR exhibits are public government filings with no meaningful copyright enforcement practice for this use; attribute CUAD in the repo README (CC BY), and note that the underlying texts are EDGAR public filings. Low risk for a take-home repo.
- **Layout** (HF repo `CUAD_v1/`): `CUAD_v1.json` (SQuAD 2.0 style, 40 MB, includes full text of all 510 contracts as `paragraphs[].context`), `master_clauses.csv` (83 cols × 510 rows, 3.9 MB: filename + per-category context + answer), `master_clauses.xlsx`, `label_group_xlsx/Label Report - <category>.xlsx` (28 files), `full_contract_pdf/Part_I|Part_II|Part_III/<Type>/…pdf`, `full_contract_txt/Part_I|II|III/…txt`, README + Datasheet PDF. 510 contracts, 13,000+ labels.
- Note: HF `siblings` API listing truncates (~745 entries); use `/api/datasets/theatticusproject/cuad/tree/main/<path>?recursive=true` or just use `CUAD_v1.json` titles.

### 1.2 The 41 categories [V]
1 Document Name · 2 Parties · 3 Agreement Date · 4 Effective Date · 5 Expiration Date · 6 Renewal Term · 7 Notice Period to Terminate Renewal · 8 Governing Law · 9 Most Favored Nation · 10 Non-Compete · 11 Exclusivity · 12 No-Solicit of Customers · 13 Competitive Restriction Exception · 14 No-Solicit of Employees · 15 Non-Disparagement · 16 Termination for Convenience · 17 ROFR/ROFO/ROFN · 18 Change of Control · 19 Anti-Assignment · 20 Revenue/Profit Sharing · 21 Price Restrictions · 22 Minimum Commitment · 23 Volume Restriction · 24 IP Ownership Assignment · 25 Joint IP Ownership · 26 License Grant · 27 Non-Transferable License · 28 Affiliate License-Licensor · 29 Affiliate License-Licensee · 30 Unlimited/All-You-Can-Eat License · 31 Irrevocable or Perpetual License · 32 Source Code Escrow · 33 Post-Termination Services · 34 Audit Rights · 35 Uncapped Liability · 36 Cap on Liability · 37 Liquidated Damages · 38 Warranty Duration · 39 Insurance · 40 Covenant Not to Sue · 41 Third Party Beneficiary.
(33 are Yes/No; 8 are extracted values — names, dates, terms, law.)

**No category for:** tariffs/duties allocation, force majeure, change-in-law, raw-material/commodity price escalators, country of origin, taxes. So CUAD labels can't be ground truth for the tariff question directly (see 1.6).

### 1.3 Contract-type breakdown [V] (README table, 510 total)
Affiliate 10 · Agency 13 · Collaboration/Cooperation 26 · Co-Branding 22 · Consulting 11 · Development 29 · Distributor 32 · Endorsement 24 · Franchise 15 · Hosting 20 · IP 17 · Joint Venture 23 · License 33 · **Maintenance 34** · **Manufacturing 17** · Marketing 17 · **Non-Compete/No-Solicit/Non-Disparagement 3** · **Outsourcing 18** · Promotion 12 · Reseller 12 · **Service 28** · Sponsorship 31 · **Supply 18** · Strategic Alliance 32 · **Transportation 13**.
Skew warning: heavy on pharma/biotech, tech, finance funds; almost nothing in construction/building trades. Good for *structure and clause language*, weak for *industry flavor*.

### 1.4 Redaction reality check [V]
Scanned all 510 full texts for redaction markers (`[***]`, `***`, `[*]`, `[REDACTED]`, `XXXX`, blank brackets) and confidential-treatment legends:
- 301/510 have **zero markers and no CT legend**; 181 have ≥1 marker; 150 carry a CT legend.
- The richest supply/manufacturing docs (Sonos, Vapotherm, Vericel, MediWound, ElectraMeccanica, Zogenix, SeaSpine, BellRing, Nanophase) are **heavily redacted** in exactly the price/volume provisions (e.g., Sonos 252 markers, Vericel 113, Nanophase 51 of which 49 sit next to price words).
- Caveat: marker regex may miss blank-underscore redactions (`$____`); spot-read before final selection.

### 1.5 Most useful CUAD contracts for this company (ranked; redaction status noted)
Scoring = count of Yes answers among {MFN, Price Restrictions, Minimum Commitment, Exclusivity, Non-Compete, No-Solicit Employees, Change of Control, Cap on Liability, Insurance, Termination for Convenience, Volume Restriction} + keyword scan (tariff, duties, customs, copper, steel, raw material, surcharge, PPI/CPI, change in law, country of origin).

**A. Tariff-relevant supply / manufacturing (anchor "supplier MSA" candidates)**
| File (CUAD title) | Why | Redaction |
|---|---|---|
| `UpjohnInc_20200121_10-12G_EX-2.6_11948692_EX-2.6_Manufacturing Agreement_ Supply Agreement` (Pfizer→Upjohn, 225k chars) | §3.2 "Price Adjustment — Product Materials Adjustment" passes 100% of materials cost change through annually; §3.6 Taxes; country of origin; Incoterms; min commitment; exclusivity; cap; insurance. Best-in-corpus model of a cost pass-through clause. | **0 markers, no CT legend** — unredacted. **Top pick.** |
| `ReynoldsConsumerProductsInc_20191115_S-1_EX-10.18_11896469_EX-10.18_Supply Agreement` (Reynolds→Pactiv) | Master supply agreement + Purchase Schedules that carry price-adjustment mechanisms → natural **master + child** stack. CoC, cap, insurance. | 0 markers — unredacted |
| `WestPharmaceuticalServicesInc_20200116_8-K_EX-10.1_11947529_EX-10.1_Supply Agreement` (ExxonMobil Chemical seller) | Raw-material supply; Incoterms (15 hits), price adjustments, duties; "tariffs" here = *carrier tariffs* (rail/truck free time) → built-in **semantic distractor inside a relevant doc**. | Light (few markers) — check before use |
| `ELECTRAMECCANICA VEHICLES CORP. - Manufacturing Agreement` | Explicit raw-material escalator: price may change if monthly avg of **steel, aluminum, copper**… moves >5%, on 60 days' notice. Perfect clause text to transplant. | Heavily redacted (43) — use the clause text only |
| `Sonos, Inc. - Manufacturing Agreement` | §4.11 Origin certification, marking, **HTS classification**; customs. | Very heavy (252) — clause-mine only |
| `LiquidmetalTechnologiesInc_20200205_8-K_EX-10.1_…Development Agreement` | Pricing factors expressly include "duties, tariffs and other similar charges". | Few markers |
| `StaarSurgicalCompany_20180801_10-Q_EX-10.37_…Distributor Agreement` | Classic "prices exclusive of … customs duties, or similar tariffs … sole responsibility of Distributor … added to invoice" allocation. | moderate CT |
| `LIMEENERGYCO_09_09_1999-EX-10-DISTRIBUTOR AGREEMENT` (Electric City energy-saver units, Illinois law) | Distributor with annual minimum units schedule, PPI reference, price restrictions, exclusivity. Energy/electrical equipment — closest to building trades. | **0 markers** — unredacted |
| `AgapeAtpCorp_20191202_10-KA_EX-10.1_…Supply Agreement` | Short supply agmt: minimum commitment, exclusivity, non-compete, CoC, insurance. | 0 markers |
| `LohaCompanyltd_20191209_F-1_EX-10.16_…Supply Agreement` | Short import supply contract (packing, country of origin, Incoterms). Good template for an **overseas fittings supplier** child PO/supply contract. | 0 markers |

**B. Maintenance / service (templates for the company's own customer-facing service agreements and vendor O&M)**
| File | Why | Redaction |
|---|---|---|
| `SMITHELECTRICVEHICLESCORP_04_04_2012-EX-10.26-FLEET MAINTENANCE AGREEMENT` | Fleet maintenance with surcharge, min commitment, insurance, TfC — maps to **fleet maintenance vendor**. | Heavy (64) |
| `SANDRIDGEENERGYINC_08_06_2009-EX-10.6-OPERATIONS AND MAINTENANCE AGREEMENT` | O&M agreement; CoC, cap, insurance, TfC. Texas law. | 0 markers |
| `UAGHINC_04_14_2004-EX-10.18-MAINTENANCE AGREEMENT`, `SUNTRONCORP_05_17_2006-EX-10.22-MAINTENANCE AGREEMENT`, `HerImports_…Maintenance Agreement` | Short maintenance agreements — easily re-skinned into **commercial HVAC preventive-maintenance contracts** with building owners. | 0 markers |
| `BloomEnergyCorp_20180321_DRSA…Maintenance Agreement` | Energy equipment O&M; "tariff" = utility tariff (distractor sense). | Heavy (70) |
| `MERITLIFEINSURANCECO_06_19_2020-EX-10.(XIV)-MASTER SERVICES AGREEMENT` (Clear Capital / Radial Spark, Arizona) | Clean modern MSA; no-solicit of employees, cap, insurance, TfC; mentions tariffs/duties in tax clause. | 0 markers |

**C. Non-compete-relevant (for the noncompete-law scenario)**
| File | Why | Redaction |
|---|---|---|
| `Quaker Chemical Corporation - NON COMPETITION AND NON SOLICITATION AGREEMENT` (2019, Buyer vs Sellers) | **Sale-of-business noncompete** — exactly the doc type a roll-up acquirer signs with each acquired shop's sellers. | CT legend but 0 in-text markers |
| `VIVINT SOLAR, INC. - NON-COMPETITION AGREEMENT` (Amendment No. 1, 2017) | Short **amendment to a noncompete** (deletes §2, extends non-solicit) → ideal for an amendment-in-stack test. Residential home-services adjacent. | 0 markers |
| `WESTERN COPPER - NON-COMPETITION AGREEMENT` | Geography-defined noncompete; *copper* appears 35× but in mining sense → **lexical distractor for a copper-tariff query**. | 0 markers |
| Franchise agreements with post-term noncompetes: `JOINTCORP_09_19_2014-EX-10.15`, `GOOSEHEADINSURANCE,INC_04_02_2018-EX-10.6` (Texas), `PfHospitalityGroupInc_…Franchise Agreement1`, `AIRTECHINTERNATIONALGROUPINC_05_08_2000-EX-10.4` (Airsopure—indoor air, HVAC-adjacent, Texas) | Useful if the company holds a franchise-like "licensed dealer" program, or as B2B noncompete **distractors** (franchisee covenants aren't employee noncompetes; FTC rule/state statutes treat them differently). | JointCorp/Goosehead/PfHospitality/Airtech 0–5 markers |
| `WPPPLC_04_30_2020-EX-4.28-SERVICE AGREEMENT` (UK executive service agreement) | Employee-type restrictive covenants, English law → **out-of-jurisdiction distractor**. | 0 markers |
| Consulting agreements (`KIROMICBIOPHARMA…`, `SLINGERBAGINC…`, `DRIVENDELIVERIES…`) | Independent-contractor restrictive covenants (some CA/WA statutes reach contractors). | mostly 0 |

**D. Built-in distractors within CUAD (verified by keyword scan)**
- "**tariff**" appears in 40 CUAD docs, but the top hits are **pipeline/utility rate tariffs** (FERC/state PUC): `RangeResourcesLouisianaInc_…Transportation Agreement` (108 hits), `MPLXLP_06_17_2015-EX-10.1` (33), `ATMOSENERGYCORP_…` (14), `KENTUCKYUTILITIESCO_…` (13), `ENTERPRISEPRODUCTSPARTNERSLP_…` (9). All unredacted or lightly redacted. A naive keyword agent will flag these; a good one won't. **Re-skin one as a natural-gas supply/transport contract for the company's fabrication shop, or as a utility service agreement** — highly realistic distractor.
- "**duty/duties**" in 255/510 docs — overwhelmingly fiduciary/employment "duties".
- "**copper**" — Western Copper (mining noncompete).
- **force majeure** in 216 docs — generic, rarely mentions tariffs.

### 1.6 Can CUAD annotations double as partial ground truth? 
Partially, yes, for **clause-presence** labels that matter to materiality scoring: Price Restrictions, MFN, Minimum Commitment, Exclusivity, Non-Compete, No-Solicit (customers/employees), Change of Control, Anti-Assignment, Cap on Liability, Termination for Convenience, Renewal Term, Notice to Terminate Renewal, Governing Law (critical for noncompete law: CA/WA/IL/TX). Workflow: keep the CUAD title → our synthetic doc-id mapping; carry over CUAD Yes/No + span text as `gt_clauses`; **Governing Law answers must be re-mapped** when we change parties/state (we will often rewrite governing law to CA/WA/IL/TX — then the label must change). Not usable for: tariff allocation, commodity escalators, change-in-law, force majeure (not CUAD categories) — label those ourselves. Caveat: CUAD labels were done for M&A-diligence purposes; "Non-Compete" is any competitive restriction (B2B), not specifically employee noncompetes.

### 1.7 Recipe: filling redaction gaps in otherwise-ideal docs
Use when a clause-rich doc (e.g., Sonos/ElectraMeccanica/Vericel) is `[***]`-redacted in price/volume/term fields.
1. Strip CT legends ("CONFIDENTIAL TREATMENT REQUESTED…", "[***] = omitted…", page footers "Source: X, 8-K, date").
2. Classify each gap by the surrounding words (regex window ±120 chars): *price/unit price*, *%/threshold*, *days/notice*, *volume/minimum*, *term/years*, *name/product*.
3. Fill from a per-document **parameter sheet** generated once from the company profile (not per-gap LLM improv) so values are internally consistent: e.g., copper-fittings unit prices from a small SKU table (½" copper 90° elbow $1.10–1.60; ¾" $2.20–3.10; Type L copper tube 10' ¾" $45–70 — tie to a COMEX baseline like $4.20/lb in the effective-date year), escalator thresholds 3–10%, notice 30/45/60/90 days, minimum annual purchase $1.5–6M for a primary distributor, terms 1–5 years with 1-year evergreen.
4. Record every filled value in ground truth (`filled_fields[]`) so evaluation can distinguish "fact in source" from "fact we injected".
5. Never fill a gap with a value that changes the answer to an evaluation question unless that is deliberate and logged.
6. Prefer choosing unredacted docs: 301/510 CUAD docs have zero markers (list in §1.5).

### 1.8 Other open contract datasets [V unless noted]
| Dataset | Host / license | What it is | Use for this corpus |
|---|---|---|---|
| **CUAD-QA** | HF `theatticusproject/cuad-qa`, CC BY 4.0 | Same 510 contracts, QA format | Nothing new beyond CUAD |
| **MAUD** (Merger Agreement Understanding Dataset) | HF `theatticusproject/maud`, CC BY 4.0; `MAUD_v1/contracts/contract_N.txt` + train/dev/test CSVs | ~150 public-company merger agreements from EDGAR, 92 deal-point questions (MAE definition, no-shop, etc.) | Low. Public-target merger agreements are far larger/more complex than a local-shop APA. Could supply 1 "big-deal" distractor. Use EDGAR small APAs instead (§2.4). |
| **ACORD** (Atticus Clause Retrieval Dataset) | HF `theatticusproject/acord`, CC BY 4.0, single zip `ACORD Dataset & ReadMe.zip`; BEIR format | 114 attorney queries, 126,662 query-clause pairs rated 1–5 stars; 9 categories incl. Limitation of Liability, Indemnification, Affirmative Covenants, **Restrictive Covenants**, Term, Governing Law, Liquidated Damages, Third-party beneficiary, IP | Clause library of **graded near-miss restrictive covenants** — 2-star "same category, not relevant" clauses are ready-made look-alike distractors. Also a template for how to express graded relevance in our ground truth. |
| **LEDGAR** (in LexGLUE) | HF `coastalcph/lex_glue` config `ledgar`, CC BY 4.0 | ~80k single provisions from EDGAR exhibits, 100 labels (e.g., Governing Laws, Non-Compete, Insurance, Taxes, Force Majeure) | **Provision bank only** (no full contracts). Good for sampling realistic boilerplate (Taxes, Force Majeure, Non-Solicit) to splice into generated docs. |
| **ContractNLI** | HF `kiddothe2b/contract-nli`, **CC BY-NC-SA 4.0** (Stanford, Koreeda & Manning 2021) | 607 NDAs, 17 NLI hypotheses with evidence spans | **NDA distractors**, but NC-SA license — OK for a non-commercial take-home but mark it; ShareAlike would attach to derivative files. Prefer EDGAR NDAs or generate. |
| **SEC EDGAR Material Contracts (Exhibit 10)** | HF `chenghao/sec-material-contracts`, CC BY-SA 4.0 (dataset card); 1,141,632 rows, ~40 GB parquet, fields incl. `cik,name,type,filing_date,desc,file_url,file_content` | Bulk Exhibit-10 dump | Too big to use wholesale; use EDGAR full-text search instead. Useful if you want offline bulk filtering by `desc` (e.g., "LEASE", "GUARANTY"). Share-alike note on the compilation. |
| **EDGAR-CORPUS** | HF `eloukas/edgar-corpus`, Apache-2.0 | 10-K annual reports split by Item, 1993–2020 | **Not contracts.** Useful only for realistic company-profile language (risk factors on copper prices / tariffs from Mueller Industries, Watsco, Comfort Systems). |
| Material Contracts Corpus (MCC, academic, ~1M EDGAR contracts 2000–2023) [K] | Published by academic authors (2024) on its own site/Zenodo — not re-verified this session | Classified contract types + metadata | Same role as the chenghao dump; verify license before use. |
| LegalBench CUAD/ContractNLI tasks [K] | HF `nguha/legalbench`, per-task licenses | Clause classification snippets | Not needed. |

**Bottom line:** CUAD is the only one that gives *full, labeled, EDGAR-sourced commercial contracts*; ACORD and LEDGAR are clause banks; everything else is either NC-licensed, too big, or not contracts. Real industry flavor must come from **EDGAR full-text search** targeting HVAC/plumbing peers (next section).

---

## 2. Corporate / finance / real estate / fleet — EDGAR finds (all verified fetchable, redaction counted)

EDGAR full-text search works without auth: `https://efts.sec.gov/LATEST/search-index?q="..."&forms=8-K,10-K,10-Q` with a `User-Agent` header. It rate-limits (returned HTTP 500 after ~40 rapid calls this session); throttle ~1 req/s. Document URL = `https://www.sec.gov/Archives/edgar/data/{cik}/{accession-no-dashes}/{filename}`.

**Industry peers on EDGAR (mine these first — same industry = realistic vocabulary):** Comfort Systems USA (FIX, HVAC roll-up since 1997), Limbach Holdings (LMB, mechanical/HVAC/plumbing contractor), Legence Corp (LGN, mechanical/HVAC services, IPO 2025), American Residential Services (ARS, residential HVAC/plumbing roll-up; appears as buyer in filings), Encompass Services (2000s facilities roll-up), Chemed/Roto-Rooter (plumbing), IES Holdings, Group Maintenance America (1990s). Suppliers: Mueller Industries (copper tube), Watsco (HVAC distribution), Ferguson (plumbing distribution), Lennox, Carrier.

### 2.1 Credit agreement stack (purpose: **L2 link** — notice/MAE/covenant hooks when a tariff shock hits margins or an acquisition needs consent; also a "permitted acquisitions" + "change of control" doc)
| Doc | URL | Size / redaction |
|---|---|---|
| Limbach Facility Services — Credit Agreement (Fifth Third, $ revolver+term, 7/20/2016) with guarantors | https://www.sec.gov/Archives/edgar/data/1606163/000114420416114494/v444860_ex10-3.htm | 519k chars, **0 redactions**. Has Fixed Charge Coverage, Senior Leverage, 39× Material Adverse, 47× "Notice of", Permitted Acquisition, Change of Control, guaranty. |
| Limbach — Loan Agreement (same date; subordinated/term) | https://www.sec.gov/Archives/edgar/data/1606163/000114420416114494/v444860_ex10-6.htm | unredacted |
| Limbach amendments 2018 (EX-10.1 1/12/2018, 3/26/2018, 11/30/2018; EX-10.2 8/14/2018) | e.g. https://www.sec.gov/Archives/edgar/data/1606163/000114420418002128/tv483280_ex10-1.htm | → ready-made **amendment chain** |
| Limbach — PNC Credit Agreement (9/2026; $200M revolver, $50M TL, $50M DDTL) | https://www.sec.gov/Archives/edgar/data/1606163/000162828026061042/pnccreditagreement-limbach.htm | 513k chars, 0 redactions; 41× Permitted Acquisition — fits roll-up story, but oversized for a 400-person company |
| Comfort Systems USA — Waiver of Credit Agreement (5/10/2002) | https://www.sec.gov/Archives/edgar/data/1035983/000095012902004151/h98970aexv10w2.txt | 10.5k chars, 0 redactions — short **waiver** child doc |
| Comfort Systems — Amendment No. 2 / Waiver & Amendment No. 3 (2003) | https://www.sec.gov/Archives/edgar/data/1035983/000095012903001732/h03366exv10w26.txt , …/h03366exv10w27.txt | short amendments |
| Encompass Services — 4th/5th Amendments to credit facility (2001–02) | https://www.sec.gov/Archives/edgar/data/1039690/000095016801501229/dex10.txt | amendments |
**Realism note:** a ~400-employee (~$90–150M revenue) company typically has a single-bank or club ABL/cash-flow revolver + term loan (~$20–50M) — 80–150 pages. Limbach 2016 is close in shape; trim schedules and scale dollar amounts. **Guaranty:** Limbach docs embed guarantor joinders; also generate a standalone **Continuing Guaranty** by the parent/owner (2–5 pp, generated from standard bank form language).
**Recipe:** Take Limbach 2016 → rename parties (Borrower = OpCo LLC, Parent = HoldCo, Agent = fictional regional bank) → cut to ~40–60% by removing syndication mechanics → set covenants (Total Leverage ≤ 3.00x, FCCR ≥ 1.25x) → keep the notice covenant (MAE, litigation, ERISA, "any event that could reasonably be expected to have a Material Adverse Effect") → keep Permitted Acquisitions conditions (pro forma compliance, consideration cap e.g. $10M per deal/$25M aggregate) → add 2 amendments (one adding an acquired entity as guarantor via Joinder, one covenant reset) + 1 waiver. Tariff scenario ground truth: *potentially* affected via MAE-notice / covenant headroom — **medium/low materiality, L2**. Noncompete scenario: not affected (distractor), except the "Permitted Acquisition" diligence deliverables.

### 2.2 Fleet / equipment leases (purpose: **distractor + weak tariff L2** — vehicle prices, upfit parts)
| Doc | URL | Notes |
|---|---|---|
| Enterprise Fleet Management — **Amended and Restated Master Equity Lease Agreement** (Bowman Consulting, 2010 form filed 2021) | https://www.sec.gov/Archives/edgar/data/1847590/000119312521107775/d18075dex1010.htm | 37.5k chars, 0 redactions. The actual MELA used by most small-mid service fleets. Insurance obligations (20×), assignment, Missouri law. |
| Enterprise FM — Master Equity Lease (Computer Software Innovations, 2010) | https://www.sec.gov/Archives/edgar/data/1109879/000119312510231780/dex101.htm | 37.5k, 0 redactions — use as a second version (version-drift test) |
| Enterprise FM — **Maintenance Agreement** (child of MELA) | https://www.sec.gov/Archives/edgar/data/1109879/000119312510231780/dex102.htm | 11k, 0 redactions → **master + child stack** |
| KeyCorp Master Equipment Lease Agreement (Bioanalytical Systems, 2003) | https://www.sec.gov/Archives/edgar/data/720154/000092794603000004/masterleasekeycorp.htm | equipment lease template (pipe-fab/jetter trucks, excavators) |
| PNC Master Lease Agreement (IT Group, 2001) | https://www.sec.gov/Archives/edgar/data/731190/000095013201500043/dex10ii28.txt | alt lessor form |
**Generate:** 6–12 **vehicle schedules/Quote-Addenda** under the MELA (one per batch of vans; fields: VIN, unit, capitalized cost, term 48–60 mo, residual %, upfit vendor e.g. shelving/ladder racks). One schedule can carry a *"cap cost subject to manufacturer price increase / surcharge"* line → nice subtle tariff hook.

### 2.3 Real estate leases (purpose: **distractor**, occasionally L2 via CAM/insurance; one per branch/shop)
| Doc | URL | Notes |
|---|---|---|
| CenterPoint Properties — **Industrial Building Lease** (Power Solutions Intl, Illinois, 2/28/2012) | https://www.sec.gov/Archives/edgar/data/1137091/000119312512093907/d310966dex101.htm | 123k chars, 0 redactions — IL warehouse/shop |
| **Second Amendment to AIR Standard Industrial/Commercial Multi-Tenant Lease** (Pro-Dex, CA, 2017) | https://www.sec.gov/Archives/edgar/data/788920/000155335017001042/pdex_ex10z1.htm | 6k chars — ideal short CA amendment child |
| Other AIR-form CA leases (Rigetti 2024/2025, Amass Brands 2026) | https://www.sec.gov/Archives/edgar/data/1838359/000110465924102448/tm2424646d1_ex10-1.htm | full AIR forms |
| Houston TX industrial leases (Wheeling-Pittsburgh "Lease for 4204 Fidelity Road, Houston", 2003) | https://www.sec.gov/Archives/edgar/data/941738/000095013503004251/b46791wcexv10w14xdy.txt | TX branch |
| Kent, WA warehouse (Geerlings & Wade lease 2001) | https://www.sec.gov/Archives/edgar/data/922810/000092701601001625/0004.txt | WA branch |
**License caveat:** AIR CRE forms are copyrighted by AIR CRE (form legends say so) even though filed on EDGAR. For a public repo, prefer bespoke landlord leases (CenterPoint, Wheeling-Pittsburgh) or keep AIR-form docs out of the committed corpus / paraphrase. [K]
**Recipe:** 1 lease per branch (8–12 branches across CA/WA/IL/TX incl. inherited leases from acquired shops) + 1–2 amendments each for ~half. Include a lease with a **radius/exclusive-use clause** (landlord won't lease to another plumbing contractor within the center) → classic noncompete *look-alike* that is NOT an employee noncompete.

### 2.4 Acquisition stack (purpose: **noncompete-relevant core**; the company "grows by acquiring local shops")
| Doc | URL | Notes |
|---|---|---|
| **Asset Purchase Agreement: American Residential Services L.L.C. (buyer) ← Energy King, Inc. d/b/a Heating & Air Conditioning Services, Inc. + owner Alan Mintz + Jeff Hultman** (12/1/2008) | https://www.sec.gov/Archives/edgar/data/1005502/000101968708005426/energyking_8k-ex0201.htm | 87k chars, **0 redactions**, Tennessee law. Almost exactly our fact pattern: an HVAC roll-up buying a local residential HVAC shop. Base template for 5–8 APAs. |
| Encompass Services APA (2003) | https://www.sec.gov/Archives/edgar/data/1039690/000119312503004754/dex21.txt | second template |
| Quaker Chemical sale-of-business Non-Competition & Non-Solicitation Agmt (CUAD) | in CUAD | template for the seller **Restrictive Covenant Agreement** exhibit |
| **Legence Corp. Form RSU Grant (2025 Omnibus Plan), Exhibit B restrictive covenants with state riders for AZ, CA, CO, DC, GA, IL, MA, MN, ND, OK, OR, VA, WA, WI** (filed 5/14/2026) | https://www.sec.gov/Archives/edgar/data/2052568/000205256826000017/lgnex1052026formofrsugrant.htm | 72k chars, 0 redactions. IL rider cites **820 ILCS 90/10** earnings thresholds; CA rider limits Restricted Period to employment. HVAC/mechanical-services company → the single best real noncompete doc found. Also Form Stock Option (EX-10.4) same filing. |
**Recipe (per acquisition, ~5–6 docs):** APA (from Energy King) → Seller Restrictive Covenant Agreement (5-yr, 50–100-mile radius; mark state of the target: CA deals must rely on B&P §16601 sale-of-business exception; WA RCW 49.62 excludes sale-of-business covenants; IL/TX enforce if reasonable) → Owner Employment/Transition Agreement with noncompete (the *employee* covenant — this is the one CA §16600.5 / WA 49.62 / IL 820 ILCS 90 changes hit) → Earn-out note or Seller Note → Assignment & Assumption of the target's customer maintenance contracts + lease assignment → (sometimes) key-tech retention bonus letters with non-solicit. Vary: one CA deal where the drafter wrongly put a post-employment noncompete in the owner's employment agreement (should be flagged high); one TX deal fully enforceable (flag low); one WA deal with a technician earning below the WA threshold bound by a noncompete (flag high).

### 2.5 Insurance (purpose: **L2 link** — COI/additional insured obligations referenced by customer contracts & leases; tariff-irrelevant; distractor)
- **ISO forms** (CG 00 01 CGL, CA 00 01 business auto, CG 20 10/20 37 additional insured) are © Insurance Services Office/Verisk (https://www.verisk.com/products/forms-rules-and-loss-costs/). Do **not** commit full-text ISO forms. [K]
- **ACORD 25** certificate form is © ACORD; the *form layout* is copyrighted, the *data* isn't. Generate a plain-text COI with the same fields (producer, insured, insurers A–E w/ NAIC #, policy numbers, limits, description of operations, certificate holder, additional insured/waiver of subrogation boxes). [K]
- **SERFF Filing Access** (https://filingaccess.serff.com/sfa/home/{STATE}) hosts insurer rate/rule/form filings publicly for participating states (state-by-state participation not verified this session; CA may use its own portal) — bot-blocked (HTTP 403 to curl this session), browser-only; carrier-proprietary manuscript forms there are still the carrier's copyright. [K/partially V]
- **Recipe (generate):** (1) "Commercial Insurance Program Summary" from broker (schedule: GL $1M/$2M, Auto $1M CSL, Umbrella $10M, WC statutory/EL $1M, Contractor's Pollution $2M, Inland Marine/Installation floater, Cyber $1M, EPLI $1M) → (2) 10–20 COIs issued to customers/landlords/GC's, each tied to a contract that demands them → (3) 1–2 endorsement schedules (blanket AI, primary & noncontributory). Insurance-requirement exhibits (Exhibit "Insurance Requirements") inside customer MSAs can be copied from CUAD (Insurance = Yes docs, e.g., MERITLIFE MSA).

---

## 3. Distractors / operational documents
Purpose: make scoping hard. Each must *look* relevant to one scenario (lexical or structural overlap) while not being affected.

### 3.1 Web terms (incorporated-by-reference "L2" docs and SaaS distractors) — URL status checked 2026-09-25
| Vendor (role) | Live URL (HTTP) | Wayback history | Relevance |
|---|---|---|---|
| ServiceTitan (FSM platform) | Customer subscription agreement is **not public** (order-form-based). Public: https://www.servicetitan.com/legal/terms-of-use (200), /legal/data-protection-addendum (200), /legal/api-terms, /legal/partner-program-agreement, /legal/sms-terms. `/terms-of-service` = 404. | — | Distractor. Generate an Order Form + reference to "ServiceTitan Master Subscription Agreement" (fictional-renamed). |
| Housecall Pro | https://www.housecallpro.com/terms/ (200; 111k chars; 79× arbitration; no FM/tariff/noncompete) | CDX: yearly 200 snapshots 2019→2026 | Distractor; version drift possible |
| Jobber | https://www.getjobber.com/terms-of-service/ (403 to bots) | CDX: yearly snapshots 2015→2026 (`web.archive.org/web/2026…/https://www.getjobber.com/terms-of-service/`) | Distractor |
| Stripe Services Agreement | https://stripe.com/legal/ssa (200; 118k chars; 4× force majeure; no tariff) | long history | Distractor — "force majeure"/"duties" false hits |
| Square General Terms | https://squareup.com/us/en/legal/general/ua (200) | | alt processor |
| Samsara (telematics) | https://www.samsara.com/legal/platform-terms-of-service (200; 54k), /legal/hosted-software-sla | | Distractor (hardware devices — imported electronics could be *weak* tariff L2 if hardware pricing clause exists; check) |
| Motive (telematics) | https://gomotive.com/legal/terms-of-service/ (200) | | Distractor |
| Verizon Connect | https://www.verizonconnect.com/terms/ (200) | | Distractor |
| Angi (lead-gen) | https://legal.angi.com/ (single ~4 MB legal center; anchors incl. `#sppterms` service-pro terms, `#California-Terms`, `#guarantee`) | | Lead-gen distractor; has "exclusive" 380× (license language) |
| Thumbtack | https://www.thumbtack.com/terms (200) | | Lead-gen distractor |
| Google Local Services Ads | https://support.google.com/localservices/answer/6224841 (200, help "Getting started"); LSA terms page URL not confirmed | | Lead-gen distractor |
| DocuSign MSA | https://www.docusign.com/legal/terms-and-conditions/msa (200) | | generic SaaS distractor |
| **Ferguson Enterprises Terms & Conditions of Sale** (supplier web terms) | https://www.ferguson.com/content/customer-support/website-information/terms-of-sale/ (200; 68k) — §3 "All prices are subject to change… invoiced at prices in effect at the time of shipment. All taxes, transportation costs, **duties** and other charges are in addition to quoted prices." | | **NOT a distractor — tariff-relevant L2** incorporated web terms for the plumbing-supply stack. (Rename supplier.) |
| Carrier legal hub | https://www.carrier.com/residential/en/us/legal/ (200) | | equipment dealer/warranty terms — possibly tariff-relevant (equipment pricing) |
**License note:** web terms are copyrighted by their owners. For a public GitHub repo, the safe pattern is: commit a *renamed and lightly rewritten* version, or commit a fetch script + Wayback timestamp and keep raw text out of git. Using real brand names inside the fictional corpus also edges toward impersonation — rename vendors (e.g., "FieldPro Cloud", "PayRail").

### 3.2 Look-alike distractors (designed or harvested)
| Look-alike | Fools which scenario | Source |
|---|---|---|
| Pipeline/utility **transportation agreements with "tariff" = FERC/PUC rate schedule** (Range Resources, MPLX, Atmos, Kentucky Utilities, Enterprise Products) | Tariff | CUAD, unredacted; re-skin as the company's natural-gas service agreement for its fab shop/HQ |
| Contracts where **"duties"** = job duties/fiduciary duties (255 CUAD docs) — e.g., employment/consulting/service agreements | Tariff | CUAD |
| **WESTERN COPPER Non-Competition Agreement** (copper 35×, mining) | Tariff (copper) *and* noncompete (it's B2B, Mexico geography) | CUAD |
| **Customer maintenance agreements with force majeure** listing "acts of government, embargoes" but fixed-price with no pass-through and short term | Tariff (lexical) | Generate from CUAD maintenance templates |
| **Supplier agreement for services only** (e.g., drain-camera calibration service, uniform rental) with "prices exclusive of taxes and duties" | Tariff (lexical; no imported goods) | Generate |
| **Vendor mutual NDA with a non-solicitation of employees clause** (12-month no-hire) | Noncompete (a no-poach, not an employee noncompete; though some state laws — e.g., WA RCW 49.62.060 franchise no-poach — touch these) | EDGAR/ generate |
| **Landlord exclusive-use / radius clause** | Noncompete | lease (2.3) |
| **Franchise/dealer program agreement with post-term noncompete** (e.g., a Carrier/Lennox-style "dealer" or a franchise like Airsopure) | Noncompete (B2B franchise covenant) | CUAD `AIRTECHINTERNATIONALGROUPINC…FRANCHISE AGREEMENT` (0 markers) |
| **Exclusivity in lead-gen/marketing agreements** ("exclusive leads in ZIP codes") | Noncompete (exclusivity ≠ noncompete) | generate from CUAD Marketing/Promotion |
| **Out-of-jurisdiction employee covenant** (UK service agreement, WPP) | Noncompete (not CA/WA/IL/TX) | CUAD |
| **Expired/terminated** supply agreement with copper escalator (term ended 2023, no renewal) | Tariff | generate; tests effective-date reasoning |
| **Superseded version** of a web term / amended-away clause (Vivint amendment deletes §2 non-compete) | Both | CUAD Vivint amendment + generated original |
| Software EULA with **export-control / "customs"** language | Tariff | Stripe/Samsara/DocuSign-style terms |
| Customer **home-warranty network** agreement (e.g., "Frontdoor/AHS"-style contractor agreement) with fixed service fees & non-solicit of warranty customers | Both (weak) | generate |

---

## 4. Corpus-level design

### 4.1 How many contracts would a ~400-employee company actually have?
Evidence quality is weak; these are CLM-vendor/association numbers repeated across the industry. [W/K — not re-verified this session; WebSearch budget exhausted]
- WorldCC/IACCM-attributed figure: "a typical Fortune 1000 company maintains 20,000–40,000 active contracts." [W]
- CLM vendor blogs commonly suggest small-mid businesses (~100–1,000 staff) hold "hundreds to a few thousand" active contracts; a commonly repeated rule of thumb is ~2–10 active contracts per employee for services businesses when counting customer agreements. [W]
- Bottom-up for this company (more defensible than vendor stats): ~8–12 branches → 8–12 leases; 15–40 material suppliers (2–4 with master agreements, rest on web T&Cs + POs); ~20–40 SaaS/IT vendors; 1 credit facility + 1–3 equipment/fleet lessors; 10–25 acquisitions over 10 years (each 5–10 docs); ~400 employee-level docs (offer letters, NDAs/PIIAs, noncompetes for managers/sales/techs, handbook acknowledgment); ~200–1,500 commercial customer service/maintenance agreements (property managers, GC subcontracts, school districts, restaurants) and thousands of residential work orders/membership ("club") agreements on standard forms. **Realistic total: ~1,500–4,000 documents**, most of them templated.

### 4.2 Proposed take-home inventory (balanced: ~180–220 docs, ~35–40 stacks)
The point is *realistic proportions with templated long tail*, not full scale. Counts include children/amendments.
| Family | Docs | Of which real-sourced (renamed) | Scenario role |
|---|---|---|---|
| Supplier master agreements + price schedules + amendments + incorporated web T&Cs (copper tube/fittings distributor, HVAC equipment OEM/distributor, water-heater mfr, PVC/PEX, tools) | 25 | 10 (CUAD Upjohn, Reynolds, Lime Energy, Agape, Loha; Ferguson-style terms; ElectraMeccanica clause) | **Tariff core** — graded high/med/low |
| Purchase orders / quotes referencing supplier terms | 15 | 0 (generated) | Tariff L2 |
| Customer commercial service & PM agreements (fixed-price multi-year → exposed; T&M → pass-through) + GC subcontracts | 30 | 8 (CUAD maintenance/service templates) | Tariff (the company's *revenue* side: can it pass costs on?) |
| Residential membership / service agreement forms + home-warranty network agreement | 6 | 0 | Tariff low/none; distractor |
| Acquisition stacks (6 deals × ~5 docs: APA, seller RCA, owner employment agreement, note/earn-out, assignment) | 30 | 6–8 (Energy King APA, Quaker RCA, Legence covenant language) | **Noncompete core** |
| Employee agreements: offer letter templates by state, PIIA/NDA, manager noncompete (CA/WA/IL/TX variants), sales non-solicit, tech training-repayment (TRAP) agreement, equity award w/ covenants | 30 | 3 (Legence RSU/option forms; CUAD consulting) | **Noncompete core** |
| Employee handbook + policies (restrictive covenant policy, moonlighting) | 3 | 0 | Noncompete L2/distractor |
| Credit facility stack (agreement, 2 amendments, waiver, guaranty, joinders) | 6 | 4 (Limbach, Comfort Systems) | L2 both |
| Fleet (MELA, maintenance agreement, 8 schedules) + 2 equipment leases | 12 | 3 (Enterprise FM ×2, KeyCorp) | Tariff weak L2 / distractor |
| Real estate (10 leases + 5 amendments) | 15 | 4 (CenterPoint IL, TX, WA, CA amendment) | Distractor (radius clause look-alike) |
| Insurance (program summary, 12 COIs, endorsement schedule) | 14 | 0 | L2 / distractor |
| SaaS/IT/payment/telematics/lead-gen terms + order forms | 15 | 8 (renamed web terms) | Distractor |
| NDAs (vendor mutual, M&A target NDAs with no-hire) | 8 | 2 | Noncompete look-alike |
| Utility/gas service agreement with "tariff" (CUAD pipeline re-skin), misc. | 4 | 2 | Tariff lexical distractor |
| **Total** | **~213** | **~55–60 real** | |
Effort: real-sourced docs ≈ 10–20 min each (fetch, rename, trim, set dates) with a script; generated docs ≈ template + parameter sheet, batch-generated.

### 4.3 Company profile (to be generated — structured fields)
`legal_name`, `dba`, `hq_state` (e.g., DE LLC HQ'd in CA), `entities[]` (HoldCo, OpCo, per-state subs from acquisitions), `employees_by_state` (CA 170 / WA 80 / IL 70 / TX 80), `employee_roles` (techs, apprentices, sales/comfort advisors, managers; wage bands per state — needed for WA/IL noncompete earnings thresholds), `revenue` (~$110M), `segments` (residential service & replacement 55%, commercial service/PM 30%, new construction 15%), `branches[]` (address, lease id), `fleet_size` (~260 vehicles), `top_suppliers[]` (category, % spend, origin country mix, copper share of COGS ~12–18%), `customers[]` (top commercial accounts, contract type fixed/T&M), `acquisitions[]` (date, target, state, price, covenant terms), `lender`, `insurance_program`, `software_stack`, `contract_owner/custodian` metadata. All docs should draw dates/parties/amounts from this one profile so cross-references (e.g., credit-agreement Permitted Acquisition caps vs. APA prices) are consistent.

### 4.4 Ground-truth schema hints
Per doc: `doc_id, stack_id, parent_id, doc_type, source (cuad|edgar|web|generated), source_ref (URL/CUAD title), counterparty, governing_law, effective/expiry/renewal, status (active/expired/superseded), filled_fields[], cuad_labels{} (carried over), scenario_labels{tariff:{affected, materiality 0–3, clause_refs, rationale}, noncompete:{…}}`, `distractor_type` for look-alikes.

