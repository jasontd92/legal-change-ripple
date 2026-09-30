# Corpus collection plan (2026-09-28)

This is the plan for fetching, adapting, generating and assembling the whole
corpus into one directory. Source URLs and recipes are in reports 01–04 in this
folder. The source categories and the verification results are in `00-overview.md`.

## Decisions carried in
- **Size:** 200 documents at minimum, 300 ideally. The plan targets **about 240
  core documents**. Generated *instance* counts (POs, signed employee
  agreements, work orders) are parameterised, so going to 300 is a config change.
- **Swap every party name to one fictional company.** Prefer unredacted
  sources. Fill redaction gaps from a parameter sheet for each document, and log
  every injected value.
- **Skip scanned or OCR-only sources.** Keep a document only if it extracts at
  roughly 500 characters per page or more.
- **Rewrite copyrighted web terms** under fictional supplier names. Keep the real
  version dates and the operative clause mechanics, and record the original URL
  and Wayback snapshot in `SOURCES.md`.

## As-of date: **2026-10-01** (a parameter, overridable per scenario)
This date puts real events at a useful spread of distances in time, which is
what the prioritisation dimension needs:

| Distance | Tariff events | Noncompete / other events |
|---|---|---|
| **Past, with exposure possibly already running** | Copper 232 (2025-08-01); full-value restructure (2026-04-06); residential HVAC decrease (2026-06-08); SCOTUS IEEPA (2026-02-20); the §122 surcharge window closed 2026-07-24 | IL construction noncompete/non-solicit ban (2025-01-01); CA AB 692 (2026-01-01); CA ARL AB 2863 (2025-07-01) |
| **Active now** | IEEPA refunds through CBP's CAPE tool (importer of record only, 60–90 days); AD/CVD preliminary results on Mexican copper pipe (2026-09-21) | FTC negative-option re-proposal open for comment (2026-03) |
| **Imminent (about 3 months)** | Refined-copper duty *contemplated* for 2027-01-01 but **not adopted** (status test) | IL threshold step-up (2027-01-01) |
| **Future (about 9–12 months)** | Temporary tiers under Procs. 11021/11032 expire 2027-12-31 | **WA ESHB 1155** effective 2027-06-30; notices due 2027-10-01 |

Because the as-of date is an input to each scenario, one corpus can be
re-scored with a shifted date. For example, as-of 2027-05-15 makes WA
imminent. Document dates are generated *relative to* the as-of date:
- contracts signed 2014 through 2026-09
- some already expired or superseded
- some auto-renewing through the as-of date

## Target directory layout
```
corpus/
  company/profile.yaml             # fictional company: entities, branches, states, headcount, suppliers, as_of
  triggers/<trigger_id>/           # change sources (not company documents)
    v<date>.txt|html  meta.yaml    # url, fetched_at, version_date, status (proposed/final/effective/vacated)
  documents/<stack_id>/<doc_id>.md # company documents, in normalised text (Markdown headings)
  manifest.jsonl                   # one row per document (schema below)
  SOURCES.md                       # provenance and attribution for every real-derived document
build/
  sources.yaml                     # every fetch target: id, url, method, category, keep_pages
  fetch/  transform/  generate/  validate/    # scripts
  raw/                             # original downloads, not committed (.gitignore)
  specs/                           # generation specs: YAML per document or per template
```
**Manifest row:**
- `doc_id`, `stack_id`, `parent_id`, `doc_type`
- `source_class` (public_domain | edgar | cuad | court | web_rewritten | generated)
- `source_ref`, `counterparty`, `governing_law`, `state`
- `effective_date`, `expiry_date`, `renewal`, `status` (active | expired | superseded)
- `filled_fields[]`, `cuad_labels{}`, `planted_features[]`, `notes`

`planted_features` is what later feeds the eval ground truth.

## Pipelines

### P1. Triggers: fetch and commit (public domain)
- **Federal Register:** the API `full_text/text` endpoint. Covers Procs. 10962,
  11021 and 11032, EO 14389, Proc. 11012, the CBP PRA refund notice, FTC
  91 FR 6507, FTC 2026-04952, the Rollins order 91 FR 21497, the AD/CVD copper
  pipe notices, and Proc. 11045 as a distractor.
- **Court opinions:** supremecourt.gov PDF, converted to text with pypdf
  (*Learning Resources*). CourtListener for *Ryan v. FTC* and *Custom Commc'ns*.
- **State law:**
  - WA session law PDF for ESHB 1155, plus the prior RCW 49.62 text
    (app.leg.wa.gov works with curl).
  - CA leginfo for AB 692 and AB 2863 (HTML).
  - IL PA 103-921 through ilga.gov. It returns 403 to curl, so use WebFetch or a
    headless browser.
- **CBP:** the trade-remedies page and CSMS bulletins through govdelivery links
  (#65794272 and the 2026 series).
- **Old/new pairs** where a trigger amends earlier text: RCW 49.62 before and
  after ESHB 1155, and Proc. 10962 versus 11021.
- **Output:** 20–25 trigger files, each with `meta.yaml`.
- **Effort:** low. One script driven by `sources.yaml`.

### P2. Public-agency contracts: fetch, extract, adapt
| Family | Method | Keep |
|---|---|---|
| WA DES 04224 HVAC Services: 1–2 contractors' contracts, Amendment 1, pricing sheet, contract page | Direct PDFs from apps.des.wa.gov | Full contract text and the price exhibit |
| Chicago 134953 Trane: cooperative-master summary, rev 0 and rev 4 | Socrata `rsxa-ify5`, then the eSMART direct pattern | Contract terms; trim the 404-page spec to the relevant parts |
| Chicago 32572 F.E. Moran lump sum: award and text-native change orders | Same | Award and about 5 change orders |
| Chicago 74381 / 33469 Johnson Pipe blanket supply, rev 0, 8, 10 | Same (verified working) | Re-papered as a **supply-side** stack: the Company as buyer, a fictional distributor as seller |
| San Antonio on-call plumbing job-order contract (text) | Legistar Web API `matters/{id}/attachments` | The contract body |
| Fresno and Fort Worth piggyback amendments | Legistar | 1–2 short documents |
| FHWA-1273 and HUD-5370 | Direct | Used as flow-down exhibits |
| Distractors (WA DES generator and elevator contracts, a Cook County text-native PO) | Direct | 3–4 documents |

### P3. EDGAR and CUAD: fetch, adapt
- **CUAD:** download `CUAD_v1.json` and `master_clauses.csv` once from Hugging
  Face (about 40 MB), then select by file name:
  - Reynolds–Pactiv, Upjohn/Pfizer, Loha, Lime Energy, Agape
  - SandRidge O&M, UAGH/Suntron maintenance, Merit Life MSA
  - the Quaker Chemical noncompete, the Vivint noncompete amendment
  - look-alike distractors: Range/MPLX/Atmos pipeline "tariffs", Western Copper

  Carry the CUAD clause labels into `cuad_labels`.
- **EDGAR:** direct `Archives/edgar/data/...` URLs, with
  `User-Agent: <name> <email>` and at most one request per second. List:
  - Illumina–Natera amendments, including Amendment 11 (tariff surcharge and
    refund pass-back)
  - Federal Cartridge metals-adjustment exhibit
  - the ElectraMeccanica clause (lift only)
  - Buckeye Ventures / ARS: asset purchase agreements, employment agreements,
    notes
  - Legence RSU riders
  - IES / Comfort Systems executive agreements
  - Frontdoor / ServiceMaster forfeiture awards
  - Remitly WA separation agreement
  - NorthStar CIIAA
  - Limbach credit agreement and 2018 amendments
  - Comfort Systems waivers
  - Enterprise Fleet master lease and maintenance agreement
  - IL, CA, TX and WA leases
  - BW Industrial / Propersys subcontract
- **Convert** HTML to text with BeautifulSoup and keep section numbering.

### P4. Court exhibits
CourtListener RECAP (the API, with a free token if the download needs one):
- **Southern HVAC** (M.D. Fla. 2018): seller noncompete, consulting agreement,
  guidebook excerpt.
- **1-Tom-Plumber franchise agreement.** Frame it as one acquired shop's
  pre-existing franchise tie. That gives the WA no-poach L2 link.
- **Climate Pros complaint**, which quotes the covenants verbatim.

### P5. Web terms: fetch the versions, then rewrite
- **Fetch** the current version and dated versions: Carrier (PDFs), Core & Main
  (Wayback 2025-01 and 2025-02), Ferguson (2 snapshots), Hajoca (3 versions),
  Daikin, and the residential membership terms (Parker & Sons, WA Energy, Four
  Seasons, Bell Bros; 2–3 dated versions each).
- **Rewrite**, one version per LLM call:
  - Input: the original text plus a spec listing the operative clauses to
    preserve (price change, duties, tariff, notice periods, "not subject to
    decrease", Incoterms, the version header).
  - Output: a fictional supplier's terms with the same mechanics and the same
    version date.
  - Validate by diffing clause presence between original and rewrite, and by
    checking n-gram overlap so the rewrite doesn't copy the original.
- **About 15 documents.** Raw originals stay in `build/raw/`, which isn't
  committed.

### P6. Transform all real-derived documents ("re-paper")
This step is deterministic first, with an LLM pass only for leftovers.
1. **Name map per source**, in `specs/names.yaml`: real party names to fictional
   ones. Include parent companies, dba names, addresses, and people's names and
   titles.
2. **Scrub personal data:** real individuals' names, compensation, addresses and
   signatures. Replace them with generated values consistent with the company
   profile.
3. **Remap jurisdiction:** governing law and venue to CA/WA/IL/TX according to
   which stack the document lands in. Update `cuad_labels` to match.
4. **Trim** oversized documents: the Limbach credit agreement to about 40–60%,
   and the Chicago spec books to their contract sections.
5. **Fill redaction gaps.** Detect `[***]` and similar markers, then fill from
   the per-document parameter sheet (prices indexed to COMEX or PPI, volumes
   scaled to about $80–120M revenue). Log each fill in `filled_fields`.
6. **Leak check:** grep the output for any original entity or person names from
   the name map. The build fails on any hit.

### P7. Generation (about 60% of documents): templates, seeded parameters, and `claude -p`
There are two kinds of generated documents.

**(a) Structured and short.** Deterministic Python with Jinja2 and a seeded
random number generator. No LLM is needed.
- **Covers:** POs, quotes, pricing schedules, work orders, change orders, job
  orders, COIs, amendment cover sheets, compliance certificates, signed
  instances of employee agreements (template plus signer, role, state, dates),
  and offer letters.
- **Parameters come from `profile.yaml`:**
  - branches, suppliers and SKUs, with HTS codes: copper tube 7411, fittings
    7412, brass valves 8481 as a near-miss, residential heat pumps 8415,
    water heaters 8419
  - Incoterms mix: DDP, FCA, EXW, FOB and CIF, where CIF makes the Company the
    importer of record
  - surcharge labels (IEEPA or §232)
  - which web-terms version a PO references
  - dates relative to the as-of date
- **Instant and reproducible.** This is the knob that takes the corpus from 240
  to 300 documents.

**(b) Clause-heavy prose.** A spec plus `claude -p` on Haiku.
- **Covers:** technician employment agreements (4 state/era templates), the
  handbook and state addenda, the arbitration agreement, training-repayment and
  stay-bonus agreements, 5 commercial facilities MSAs, residential service
  agreement, insurance policy documents, generic leases, NDAs, SaaS-like vendor
  terms, and dealer or credit-account agreements.
- **Spec YAML per document:**
  - `doc_type`, parties (from the profile), jurisdiction, target length
  - `required_clauses[]`, each with an intent
  - `planted_clauses[]`: exact verbatim text, inserted deterministically
  - `style_exemplars[]`: 1–3 real clause excerpts from P2–P4, so the prose
    reads like real drafting rather than generic AI text
  - `forbidden[]`: things like "as an AI" and placeholder brackets
- **Call shape:**
  `claude -p --model haiku --output-format json --system-prompt "$(cat build/generate/drafter_system.md)" < spec_prompt.txt`
  - Run in parallel with `xargs -P 6`.
  - Cache by spec hash, so a rerun only regenerates documents whose spec changed.
- **Planted text is never left to the model.** The model writes the body with
  `{{PLANT:<id>}}` markers, and the script substitutes the exact planted clause
  text. That keeps ground truth exact while the surrounding prose varies.
- **Validation after generation:**
  - every required clause heading is present
  - every plant marker has been substituted
  - length falls within the target
  - no names outside the profile
  - no bracket placeholders

  A failure triggers one retry with the validator errors appended.
- **Model:** Haiku for bulk. The handbook and the MSAs (the 5–8 longest
  documents) can switch to Sonnet through a per-spec `model:` field if Haiku's
  output reads thin. [OPEN, decide after a sample]
- **Cost is trivial:** about 150 documents at 3–8k output tokens each.

### P8. Assemble and validate
- **Build `manifest.jsonl`** from the transform and generation outputs.
- **Checks:**
  - every `parent_id` exists
  - amendment dates fall after their parent document's date
  - no document is dated after the as-of date unless it is flagged as a future
    effective date
  - amendment totals equal the base plus the deltas
  - counts per type match the targets
  - leak check is clean
  - every real-derived document has a `SOURCES.md` entry
- **Report:** a summary table of documents per stack, per source class and per
  role (tariff, noncompete, L2, distractor).

## Inventory (target of about 240 documents)
| Area | Stacks and documents | Count | Real-derived / generated |
|---|---|---|---|
| **Supply** | Copper-tube mill MSA (Reynolds skeleton, Federal Cartridge metals exhibit, Natera-style surcharge with refund pass-back) + pricing schedule + 2 amendments + 8 POs; Distributor A (Ferguson-derived terms, 2 versions) + account agreement + 8 POs/quotes; Distributor B (Core & Main-derived, before/after) + 6 POs; HVAC manufacturer (Carrier-derived, 3 of 5 versions) + dealer agreement + 6 POs; Distributor C (Hajoca-derived) + 2 protected job quotes + 3 POs; direct-import fittings supplier (Loha, CIF, Company is importer of record) + 4 POs; blanket supply (Chicago 74381 re-papered) + 3 revisions | ~56 | ~16 / ~40 |
| **Customers** | WA DES 04224 stack (contract, Amendment 1, 4 work orders); Chicago Trane 3-level (4); lump-sum project with change orders (6); San Antonio job-order contract with 3 job orders (4); 5 generated commercial MSAs with 2–3 work orders each, including an MFN pair, fixed-price and no-hire (~15); residential membership terms (3 versions) + service agreement (5); public distractors (4) | ~44 | ~20 / ~24 |
| **Subcontracts** | 4 stacks: as a subcontractor to general contractors (BW Industrial anchor, prime-contract excerpt, flow-down exhibits, change orders) and the Company's own sub-subcontracts | ~14 | ~5 / ~9 |
| **Employment** | Handbook + 2 state addenda; arbitration agreement; 4 technician templates + ~20 signed instances (varied state, role and signing date); 4 manager and executive agreements; 1–2 RSU grants with riders; CIIAA template + 2; 3 separation agreements (including a WA reaffirmation); 3 training-repayment agreements (straddling AB 692's date); 2 stay-bonus agreements; 2 standalone non-solicits | ~47 | ~10 / ~37 |
| **Acquisitions** | 5 deals, each with an APA, seller noncompete (including a **non-owner** signer), seller employment or consulting agreement, and a promissory note; 1 acquired shop's pre-existing franchise agreement | ~26 | ~14 / ~12 |
| **Corporate / finance** | Credit agreement + 2 amendments + compliance certificate; fleet master lease + maintenance + 3 schedules; 8 branch leases (2 amended); insurance (CGL declarations and endorsements, umbrella, auto, 4 COIs) | ~27 | ~12 / ~15 |
| **Distractors / operations** | 7 SaaS/vendor terms (field-service software, payments, telematics, lead generation ×2, payroll, fuel card); 5 NDAs; 2 marketing agreements; 4 CUAD look-alikes; 4 expired or superseded documents; 3 miscellaneous (equipment rental, waste, uniforms) | ~25 | ~8 / ~17 |
| **Total** | **~40 stacks** | **~239** | **~85 (36%) / ~154** |

Scaling to 300 adds about 60 generated instances: more POs, signed employee
agreements and work orders. That adds scale for scoping and distractor noise
without adding new hand-built stacks.

## Execution order and parallelism
1. **Profile and name map first**, in `profile.yaml` and `names.yaml`, because
   everything else depends on them. Then four fetch workers run in parallel:
   - P1 triggers
   - P2 public agency
   - P3 EDGAR/CUAD, rate-limited
   - P4 court plus P5 web versions
2. **P6 transforms**, per family and parallelisable. Run the leak check.
3. **P7 generation.** Do (a) first because it's instant. For (b), draft a
   sample of 5 specs, review the quality, then run the rest in bulk.
4. **P8 assembly and validation**, then review the stack table.

**Dependencies:** python3, pypdf (installed), requests, beautifulsoup4, pyyaml,
jinja2, and the `claude` CLI (installed, v2.1.283). Playwright is only needed
for the IL statute and NIBCO; both can be skipped or fetched through WebFetch.

## Known risks
- EDGAR full-text search throttles, but P3 uses direct Archive URLs, not search.
- A few Chicago revisions may be scanned. The text-density filter drops them
  automatically.
- Rewritten web terms have to keep the *mechanics* exactly, because the tariff
  gold labels depend on them. The clause-presence diff in P5 guards this.
- LLM-generated prose drifting generic: mitigated by the style exemplars drawn
  from real clauses and by reviewing a sample before the bulk run.
