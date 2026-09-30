# 03 — Employment documents + noncompete trigger sources

Scope: employment-side documents for the fictional ~400-employee plumbing/HVAC company
(CA, WA, IL, TX; grows by acquiring small shops) and the real noncompete legal changes that
would serve as the second eval trigger. Research date: 2026-09-25. WebSearch was unavailable;
everything below was verified by direct fetch (curl / Federal Register API / legislature sites)
unless marked [UNVERIFIED].

User preference (coordinator, confirmed): party-name substitution into one fictional company is
fine; strongly prefer documents WITHOUT redactions (comp, durations, geography, prices). Each
source notes redaction status; redacted-but-ideal docs get a fill-in recipe.

---

## PART B — NONCOMPETE TRIGGER SOURCES (verified)

### B1. Washington ESHB 1155 — full noncompete ban (Chapter 149, Laws of 2026) — RECOMMENDED PRIMARY TRIGGER

- Bill page: https://app.leg.wa.gov/billsummary?BillNumber=1155&Year=2025&Initiative=false
- Session law (enrolled, VERIFIED text): https://lawfilesext.leg.wa.gov/biennium/2025-26/Pdf/Bills/Session%20Laws/House/1155-S.SL.pdf
- Passed House 3/9/2026 (62-33), Senate 3/5/2026 (30-19); signed by Gov. Bob Ferguson 3/23/2026.
- **Effective June 30, 2027.** Notice deadline **October 1, 2027**.
- "Before" text = current RCW 49.62 (as amended by 2024 c 36 / SB 5935):
  https://app.leg.wa.gov/RCW/default.aspx?cite=49.62&full=true ; 2024 session law:
  https://lawfilesext.leg.wa.gov/biennium/2023-24/Pdf/Bills/Session%20Laws/Senate/5935-S.SL.pdf

What changes (from the enrolled text):
1. **All noncompetition covenants void and unenforceable "regardless of when the parties entered
   into" them** (RCW 49.62.020(1)). Retroactive to existing agreements. Removes the old
   earnings threshold (employees > ~$100k adjusted; independent contractors > ~$250k adjusted),
   the disclosure-at-offer rule, the layoff garden-leave rule, and the 18-month presumption.
   Repeals RCW 49.62.030 (contractor thresholds) and 49.62.040 (annual adjustments).
2. **Illegal to enter into, attempt to enter into, enforce, threaten to enforce, or represent**
   that a worker is subject to a noncompete (new 49.62.020(2)). => keeping the clause in a
   template/handbook after 6/30/2027 is itself a violation.
3. **Notice**: by Oct 1, 2027 employer must make reasonable efforts to give written notice to all
   current AND former employees and independent contractors whose noncompete is still within its
   effective period that it is void (49.62.020(3)).
4. **Definition** (49.62.010(3)): (c) any agreement that "directly or indirectly prohibits the
   acceptance or transaction of business with a customer" (no-service / no-accept clauses) —
   NOTE: this was ALREADY added by SB 5935 (2024 c 36, eff. 6/6/2024), verified in the 2024
   session law; **NEW in 2026:** (d) **any provision that "threatens, demands, requires, or
   otherwise effectuates that an individual return, repay, or forfeit any right, benefit, or
   compensation" as a consequence of engaging in a lawful profession** — catches
   forfeiture-for-competition clauses in bonus plans, equity/PSU awards, severance clawbacks,
   stay bonuses, and training-repayment agreements; (b) performer/venue covenants.
5. **Exceptions** (49.62.010(3)(e)): nonsolicitation agreements; confidentiality agreements;
   trade-secret/invention covenants; **sale-of-business covenant — only if the signer purchases/
   sells/acquires/disposes of an ownership interest of 1% or more** (the 1% floor ALREADY existed
   since the 2024 amendment — verified; 1155 carries it forward); franchisee covenants where the
   franchise sale complies with RCW 19.100.020(1); and **NEW: training repayment** only if (A)
   expires within 18 months of start date, (B) pro rata over remaining 18-month period, (C) no
   repayment if separation is for "good cause" under RCW 50.20.050.
6. **Nonsolicitation narrowed (NEW)** (49.62.010(4)): before (2024 text) = non-solicit of "any
   current customer of the employer to cease or reduce the extent to which it is doing business";
   after = "any current or prospective customer, patient, or client ... to shift business away"
   **only if the employee established or substantially developed a direct relationship** with
   that customer through their work, and **the prohibition expires no later than 18 months**
   after termination; any no-acceptance clause is expressly NOT a nonsolicitation agreement.
   => Many existing non-solicits (24-month, "any customer of the Company", 3-year lookback) fall
   out of the exception and become void noncompetes.
7. Remedies: greater of actual damages or $5,000 statutory penalty + fees; AG enforcement; old
   reform/partial-enforcement penalty and pre-2020 safe harbor removed.
8. Unchanged: RCW 49.62.050 (WA-based employee cannot be bound to out-of-state law/forum —
   strengthened in 2024), 49.62.060 (franchisor-franchisee no-poach ban), 49.62.070 (moonlighting
   for low-wage workers).
9. "Before" thresholds being repealed (WA L&I, verified https://lni.wa.gov/workers-rights/workplace-policies/non-compete-agreements):
   employees $116,593.18 (2023), $120,559.99 (2024), $123,394.17 (2025), **$126,858.83 (2026)**;
   independent contractors $291,482.95 / $301,399.98 / $308,485.43 / **$317,147.09**.
   => Today a WA tech at $70k with a noncompete is already void; a WA GM at $150k is currently
   enforceable and becomes void 6/30/2027. The trigger's marginal impact is concentrated on
   high earners, forfeiture/TRAP clauses, over-broad non-solicits, and sale-adjacent covenants.

WA 2024 amendment (SB 5935, Ch. 36 L. 2024, eff. 6/6/2024; VERIFIED):
https://lawfilesext.leg.wa.gov/biennium/2023-24/Pdf/Bills/Session%20Laws/Senate/5935-S.SL.pdf
— added no-accept to noncompete definition, 1% sale-of-business floor, narrowed non-solicit to
"current" customers, amended 49.62.050 (choice of law/venue) — usable as an "older change"
control trigger.

Why ESHB 1155 is the best trigger: in a company state; no earnings threshold (hits managers,
execs and the few high-earning techs/sales reps that 2019–2024 law still allowed); retroactive
("regardless of when"); mandatory notice to current AND former workers by 10/1/2027; the
sale-of-business exception with a 1% floor gives a crisp decoy (owner-sellers survive) and a
crisp trap (non-owner key employees who signed in the APA do not); new forfeiture/TRAP and
non-solicit rules force the agent to re-check the "compensating protection" documents.

### B2. FTC Non-Compete Clause Rule — vacated; FTC acceded; removed from CFR; case-by-case enforcement (Rollins)

- Final rule: 89 FR 38342 (May 7, 2024), 16 CFR part 910, would have been effective Sept 4, 2024.
  https://www.federalregister.gov/documents/2024/05/07/2024-09171/non-compete-clause-rule
- Ryan, LLC v. FTC, 746 F. Supp. 3d 369 (N.D. Tex. Aug. 20, 2024) — set aside under APA §706(2)
  (exceeded statutory authority; arbitrary and capricious). CourtListener docket:
  https://www.courtlistener.com/?q=%22Ryan%2C+LLC+v.+Federal+Trade+Commission%22 (No. 3:24-cv-00986-E)
- Sept 5, 2025: Commission voted 3-1 to dismiss appeals (Ryan, No. 24-10951, 5th Cir.; Properties
  of the Villages, No. 24-13102, 11th Cir.) and accede to vacatur. Press release:
  https://www.ftc.gov/news-events/news/press-releases/2025/09/federal-trade-commission-files-accede-vacatur-non-compete-clause-rule
- Feb 12, 2026: final rule removing 16 CFR part 910 from the CFR, 91 FR 6507:
  https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to
  (VERIFIED text quotes the 3-1 vote and the appeal numbers.)
- Enforcement pivot: Gateway Services consent (90 FR 43606, Sept 10, 2025)
  https://www.federalregister.gov/documents/2025/09/10/2025-17416/gateway-services-analysis-of-agreement-containing-consent-order-to-aid-public-comment
- **Rollins, Inc. (Orkin) proposed consent order, 91 FR 21497 (Apr. 22, 2026), File No. 251 0011** —
  HOME-SERVICES ANALOG, VERIFIED:
  https://www.federalregister.gov/documents/2026/04/22/2026-07844/rollins-inc-analysis-of-proposed-agreement-containing-consent-order-to-aid-public-comment
  - Alleged: policy requiring all new hires (pest-control technicians, customer-service reps,
    low-wage staff) to sign noncompetes: 2 years, usually 75-mile radius around the branch or a
    multi-county region; ~18,000 US employees, 700+ locations.
  - Order: no entering/maintaining/enforcing noncompetes against Covered Employees; no telling
    employers they are bound; no fees/penalties tied to noncompetes; **cannot bar general
    advertising to solicit customers or responding to customer-initiated inquiries**; must send
    clear written notice to Covered Employees; 10-year term.
  - Complaint says narrowly tailored non-solicits/NDAs are less restrictive alternatives (useful
    ground truth for "compensating protection").
  - Chairman Ferguson statement: noncompetes judged case-by-case under rule of reason; notes
    sale-of-business noncompetes are procompetitive (decoy support).
- Eval use: (a) a "vacatur/no-op" trigger — the 2024 rule never took effect, so a correct agent
  should report near-zero required contract changes (good precision test; any document that
  cites "the FTC rule" e.g. a 2024 HR memo / notice template becomes the hit); (b) Rollins order
  as a "regulatory-risk" trigger: not binding on our company but a GC would flag tech-level
  blanket noncompetes with 2-yr/75-mile scope as FTC Section 5 risk in TX and IL.

### B3. California AB 692 — "stay-or-pay" / training-repayment ban (Ch. 703, Stats. 2025) — VERIFIED

- Text: https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB692
- Approved by Governor Oct 13, 2025. Adds Bus. & Prof. Code §16608 and Lab. Code §926.
- Applies to contracts entered into on or after **January 1, 2026**. Unlawful to include in an
  employment contract, or require as a condition of employment, a term that (A) requires the
  worker to pay the employer/training provider/debt collector for a debt if employment ends,
  (B) accelerates/initiates collection on termination, or (C) imposes any "penalty, fee, or
  cost" on termination (incl. replacement-hire fee, retraining fee, quit fee, liquidated damages,
  lost goodwill, lost profit).
- Exceptions: government loan-repayment programs; tuition for a **transferable credential**
  meeting 5 conditions (separate agreement, not a condition of employment, amount specified
  up front and capped at cost, prorated, no repayment on termination except for misconduct);
  **DAS-approved apprenticeship programs** (relevant: plumbing/HVAC apprenticeships);
  sign-on bonus repayment meeting conditions (separate agreement, 5 business days to consult
  counsel, no interest, prorated, retention period <= 2 years, option to defer); plus others
  (residential property lease/ purchase contracts — see statute).
- Private right of action (actual damages or $5,000 per worker, whichever greater), fees.
- Hits: Technician Training Repayment Agreement (EPA 608 / backflow cert / manufacturer
  training), sign-on bonus letters, tool-allowance clawback, van/uniform "damages" clauses,
  liquidated-damages-on-quit clauses in offer letters.

### B4. California SB 699 + AB 1076 (effective Jan 1, 2024) — baseline / notice trigger

- SB 699 (Ch. 157, Stats. 2023) adds B&P §16600.5: void noncompetes unenforceable regardless of
  where/when signed; employer may not enter or attempt to enforce; private right of action.
  https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB699
- AB 1076 (Ch. 828, Stats. 2023) adds B&P §16600.1 and amends §16600: codifies Edwards v.
  Arthur Andersen; **notice by Feb 14, 2024** to current and former employees employed after
  Jan 1, 2022 whose contracts include a noncompete clause; failure = unfair competition.
  https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB1076
- Sale-of-business exceptions unchanged: B&P §16601 (sale of goodwill / all ownership interest),
  §16602 (partnership dissolution), §16602.5 (LLC).
  https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=16601
- Eval use: "old change" / already-complied control — docs dated after 2024 with CA noncompetes
  are planted violations; CA notice letter (Feb 2024) is a consistency doc.

(Illinois / Texas / other states: see sections below.)

AB 692 extra detail (VERIFIED): sign-on bonus exception requires ALL of: separate agreement;
notice of right to consult attorney + >= 5 business days; no interest, prorated, retention
period <= 2 years; option to defer the payment to end of retention period; and separation
before the retention period was the employee's own election or for misconduct. Also excepted:
residential property lease/financing/purchase contracts. Lab. Code §926: void only if entered
on/after 1/1/2026 (so pre-2026 TRAPs are NOT voided by this statute — date-sensitivity test);
civil action by worker or worker representative; greater of actual damages or $5,000 per worker.
SB 699 = Ch. 157, Stats. 2023; AB 1076 = Ch. 828, Stats. 2023 (both VERIFIED on leginfo).

### B5. Illinois Freedom to Work Act (820 ILCS 90) — construction-worker ban (P.A. 103-921, SB 2770, eff. 1/1/2025) + threshold step-up 1/1/2027 — VERIFIED

- Current text: https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3737&ChapterID=68
  (ilga.gov has a broken TLS chain; `curl -k` works; WebFetch fails.)
- P.A. 103-0921 text: https://www.ilga.gov/legislation/publicacts/fulltext.asp?Name=103-0921
- "Before" text (2023 Wayback, P.A. 102-358 version):
  http://web.archive.org/web/20230306194439/https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3737&ChapterID=68
- Old §10(d): noncompete (only) void for CBA-covered public employees "and individuals employed
  in construction" (carve-out for management/engineering/design/sales/owners).
- **New §10(e) (eff. 1/1/2025): "A covenant not to compete OR A COVENANT NOT TO SOLICIT is void
  and illegal with respect to individuals employed in construction, regardless of whether an
  individual is covered by a collective bargaining agreement."** Same carve-out (primarily
  management, engineering/architectural, design, or sales; or shareholders/partners/owners).
  => For a plumbing/HVAC company doing commercial construction/new-install work in IL, the
  compensating-protection fallback (non-solicit) ALSO dies for field installers. Great L2 test:
  agent must notice the non-solicit is hit too, not just the noncompete; and must distinguish
  construction installers from residential service techs (fact question — flag, don't decide)
  and from sales/estimators (carve-out).
- **Threshold step-ups written into §10(a)/(b) (already law, a scheduled change):** noncompete
  void unless annualized earnings > $75,000 → **$80,000 on Jan 1, 2027** (then $85k 2032,
  $90k 2037); non-solicit > $45,000 → **$47,500 on Jan 1, 2027** ($50k 2032, $52.5k 2037).
  "Earnings" = W-2 box 1 plus elective deferrals. => A tech or dispatcher earning $46–47.5k
  with a non-solicit, or a service manager at $76–80k with a noncompete, flips to void on
  1/1/2027. Needs comp data in the corpus (unredacted offer letters / comp schedule).
- Other unchanged requirements (checklist for every IL agreement): §15 adequate consideration
  (2 years' continued employment or other consideration), legitimate business interest; §20
  **advise in writing to consult an attorney + 14 calendar days to review**; §25 employee
  prevailing gets fees; §30 AG enforcement. §5 exclusions from "covenant not to compete":
  **sale-of-business (purchasing or selling goodwill or acquiring/disposing of an ownership
  interest)**, garden-leave notice clauses, no-rehire clauses; "adverse financial consequences"
  forfeiture clauses DO count as noncompetes.
- Other P.A.s in the source note: 103-915 (mental health professionals for veterans/first
  responders, eff 1/1/2025), 103-1062 (eff 2/7/2025, renumbering), 104-417 (eff 8/15/2025,
  appears to be another profession-specific addition — [UNVERIFIED content]; not construction).

### B6. Texas SB 1318 (89R, 2025) — physician/health-practitioner limits — NEGATIVE CONTROL

- https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB1318 ;
  enrolled text https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01318F.htm
- Signed 6/20/2025, effective 9/1/2025. Amends Bus. & Com. Code §15.50(b): physician covenants
  must have buyout <= annual salary, expire <= 1 year, radius <= 5 miles, conspicuous writing;
  also health-care practitioners (dentists, nurses, PAs — per caption "certain health care
  practitioners").
- Texas general rule (§15.50(a)) unchanged: noncompete enforceable if ancillary to an otherwise
  enforceable agreement and reasonable in time/area/scope. §15.51(c) reformation.
- Eval use: a correct agent should find **zero** affected documents in a plumbing company
  (maybe flag an occupational-health clinic contract as irrelevant). Tests false-positive rate
  and "TX = still enforceable" reasoning.

### B7. Out-of-footprint statutes (scoping negatives — the company has no employees there)

- **Wyoming SF 107, Enrolled Act 87 (2025)**, W.S. 1-23-108, effective 7/1/2025, applies to
  contracts on/after 7/1/2025 (VERIFIED: https://wyoleg.gov/2025/Enroll/SF0107.pdf). Voids
  noncompetes restricting "skilled or unskilled labor"; exceptions: sale of business or its
  assets, trade-secret protection, relocation/education/training recovery on a 100%/66%/33%
  schedule (<2y / 2–3y / 3–4y), executive and management personnel and their professional staff.
- **Virginia** Va. Code §40.1-28.7:8 (VERIFIED current text):
  https://law.lis.virginia.gov/vacode/title40.1/chapter2/section40.1-28.7:8/ — "low-wage
  employee" now includes anyone entitled to FLSA overtime (29 U.S.C. §207) regardless of
  earnings (added by 2025 SB 1218, eff. 7/1/2025 [bill number from memory; verify at
  https://lis.virginia.gov/bill-details/20251/SB1218]).
- **Minnesota** Minn. Stat. §181.988 (2023, eff. 7/1/2023) — full ban with sale/dissolution
  exception: https://www.revisor.mn.gov/statutes/cite/181.988 [not re-fetched].
- Use: include one of these as a trigger the agent should scope out ("no WY/VA/MN employees";
  unless a remote employee or a franchise/acquisition target is located there — plant one WY
  remote dispatcher to make it non-trivial).

### Trigger comparison / recommendation

| Trigger | Company state? | Hits hourly techs? | Sale-of-business exception | Required action / deadline | Recommended role |
|---|---|---|---|---|---|
| WA ESHB 1155 (Ch.149 L.2026) | WA | Yes, all workers, retroactive | Yes, but only >= 1% ownership | Written notice to current+former by 10/1/2027; stop using clauses by 6/30/2027 | **Primary** noncompete trigger |
| IL P.A. 103-921 + 1/1/2027 thresholds | IL | Yes (construction) — nonsolicit too | Yes (§5) | Stop entering; re-paper; comp check | Secondary / L2 compensating-protection test |
| CA AB 692 (B&P 16608) | CA | Yes (training repayment, quit fees) | n/a (sign-on/apprentice exceptions) | Stop using TRAPs in contracts from 1/1/2026 | Clause-type variant (TRAP) test |
| CA SB 699/AB 1076 | CA | Yes | §16601–16602.5 | Notice by 2/14/2024 (past) | Control / consistency |
| FTC rule vacatur + Rollins order | federal | (would have) | Rule had one | None (rule gone); risk flag only | Negative / "no-op" trigger + risk |
| TX SB 1318 | TX | No (physicians) | — | — | Negative control |
| WY SF 107 / VA / MN | No | — | — | — | Scoping negative |

---

## PART A — DOCUMENT SOURCES (in progress; verified entries below)

### A-GOLD: Buckeye Ventures / Energy King, Inc. (EDGAR CIK 1005502) — a real small HVAC/plumbing roll-up's paper trail, UNREDACTED

This is the single best find: a 2006–2008 California HVAC/plumbing roll-up (Buckeye Ventures,
renamed Energy King, Inc.) that filed nearly every acquisition and employment document as
exhibits. It maps almost 1:1 onto "our company grows by buying small local shops." Filing
index: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1005502&type=&dateb=&owner=include&count=40
License: SEC filings are US-government-hosted public records; the documents themselves are
private contracts filed publicly — no copyright claim is usually asserted, redistribution
of EDGAR exhibits is common practice (CUAD redistributes EDGAR contracts under CC BY 4.0).
Substituting fictional names removes any real-person issue. Redactions: NONE observed
(prices, salaries, durations and areas all present).

| Doc | URL | What's in it (verified) | Corpus role |
|---|---|---|---|
| Asset Purchase Agreement, Energy King (buyer, CA) / **Barnett Plumbing, Inc. dba Barnett Heating and Air** (seller) / Robert & Sherry Barnett, Jan 2, 2007 | https://www.sec.gov/Archives/edgar/data/1005502/000101968707000082/buckeye_8k-ex1001.htm | $300,000 cash + 600,000 shares; allocation among assets and "non-competition agreements" (Schedule 2.2, IRC §1060); closing condition: noncompete (Exh. D) by Seller Parties AND "agreements in the form attached hereto as Exhibit E" by **Kyle E. Barnett and Travis J. Barnett** (non-owner family members); assumed service/maintenance agreements & customer deposits | Sale-of-business noncompete (owner = exception = DECOY); Exh. E non-owner covenants = TRAP (not protected by CA §16601 / WA 1% rule); L1 stack parent |
| Asset Purchase Agreement, **American Residential Services L.L.C. (ARS)** (buyer) / Energy King Inc. dba Heating & Air Conditioning Services (MA) / owner Alan Mintz / **Jeff Hultman**, Dec 1, 2008 | https://www.sec.gov/Archives/edgar/data/1005502/000101968708005426/energyking_8k-ex0201.htm | Price $447,463.69; §10 noncompete 5 years, "Area" = Plymouth & Suffolk counties + any county where seller's customers serviced; includes **no-accept** of customer business, non-solicit/no-hire of buyer employees 120 days; 2% public-stock carve-out; tradename restriction; allocation Goodwill 68% / Non-Compete 12% / Assets 20%; **Hultman signs §10 only "in consideration of the payment made to Hultman"** — a non-owner employee noncompete embedded in an APA; rep that all seller employees signed noncompete/NDA/non-solicit agreements | Best single decoy/trap doc: owner covenant survives, Hultman covenant does not (no ownership; WA needs ≥1%); "no-accept" language now a noncompete under WA 1155; purchase-price allocation gives materiality number |
| Agreement and Plan of Merger, Buckeye / GHA Acquisition Corp. / **Gallagher's Heating & Air Conditioning, Inc.** (CA) / Timothy E. Gallagher, Feb 29, 2008 | https://www.sec.gov/Archives/edgar/data/1005502/000101968708000961/energyking_8k-ex1001.htm | 130k chars; stock merger; reps re: contracts restricting solicitation/territory; employment agreements terminated except NC/NS/NDA provisions survive | Stock-deal variant (exception applies to sale of all ownership interest) |
| Employment Agreement, Gallagher's Heating & Air / Timothy E. Gallagher, Feb 2008 | https://www.sec.gov/Archives/edgar/data/1005502/000101968708002225/energyking_10qsb-ex1001.htm | $150,000 salary; non-solicit of customers with 3-yr lookback, tied to Term | **Seller-turned-employee** agreement: the hard question — is it "ancillary to sale" (exception) or an employment covenant (not)? Great L2 link to the merger agreement |
| Employment Agreement, Energy King / **Varin Larson**, Sept 28, 2006 (+ promissory note to Varin & Deanna Larson, EX-99.3) | https://www.sec.gov/Archives/edgar/data/1005502/000101968706002838/buckeye_ex9901.htm ; note: .../buckeye_ex9903.htm | $165,000 salary; noncompete re "heating, air conditioning, cooling, ventilation or plumbing businesses" in "Territory"; customer non-solicit with 3-yr lookback | Acquired-owner employment + seller note (L2 timing/economic link: offset rights) |
| Employment Agreement, Alan Hardwick (EX-99.2) + promissory note (EX-99.4) | https://www.sec.gov/Archives/edgar/data/1005502/000101968706002838/buckeye_ex9902.htm | same family | Second acquired-owner stack |
| Employment Agreement, Energy King / **Jeffrey R. Hultman** (Executive), May 23, 2008 | https://www.sec.gov/Archives/edgar/data/1005502/000101968708002513/energyking_8k-ex9902.htm | $175,000 salary, accrued until $2M financing; confidentiality; restrictive covenants | Exec agreement; same person as APA non-owner signer → party/entity L2 link |
| Exec employment agreements — Mintz (2/10/2006), Weinstein, Papasodero, Hancock (S-1/A EX-10.17–10.20) | https://www.sec.gov/Archives/edgar/data/1005502/000101968708000629/buckeye_sb2a1-ex1017.htm (…ex1018, ex1019, ex1020) | 2-year post-term customer non-solicit + no-hire; noncompete during term; base salary TBD | Executive template lineage |
| Employment Agreements of Leonard, Kurz (10QSB EX-10.4/10.5, May 2008); two more (10-Q/A EX-10.1/10.4/10.5, Nov 2008) | https://www.sec.gov/Archives/edgar/data/1005502/000101968708002225/energyking_10qsb-ex1005.htm ; .../energyking_10qsb-ex1004.htm ; https://www.sec.gov/Archives/edgar/data/1005502/000101968708004978/energyking_10qsba-ex1001.htm | manager-level | Manager tier |
| Seller promissory notes, pledge & escrow agreements | e.g. https://www.sec.gov/Archives/edgar/data/1005502/000101968708002225/energyking_10qsb-ex1002.htm | seller financing | Economic link: noncompete breach → note set-off |

Adaptation recipe: rename Energy King → [OurCo] Holdings; each acquired shop becomes a
subsidiary/DBA in a company state (keep Barnett + Gallagher in CA; re-home Energy King-MA/ARS
deal as a WA shop by editing "Area" to King/Snohomish counties and governing law to WA; re-home
Larson as IL). Update dates to 2019–2025 (keep recitals consistent), bump prices ~1.6x for
inflation. Exhibits D/E (the standalone noncompetes) are referenced but NOT filed → generate
them from the APA's §10 language (owner version) and a thinner non-owner "key employee"
version for Kyle/Travis-equivalents.

### A-GOLD-2: Southern HVAC Corp. v. Konforte (M.D. Fla. No. 6:18-cv-01589) — RECAP exhibits of a residential-HVAC roll-up acquisition, UNREDACTED

Docket search: https://www.courtlistener.com/?type=r&q=%22Josko%22%20court_id%3Aflmd (M.D. Fla. 2018, RECAP dir gov.uscourts.flmd.355075) — files:
- Exh. A — **Noncompetition, Nonsolicitation and Confidentiality Agreement** (seller covenant
  ancillary to APA dated Feb 1, 2017) among U.S. H&AC, LLC (Purchaser), Southern HVAC Corporation
  (Parent), U.S. Heating & Air Conditioning, Inc. (Company) and Arie Konforte (Shareholder):
  5-year Restricted Period, area = any geography where any Group Company does business, employee/
  consultant non-solicit, tolling clause, Delaware law & forum.
  https://storage.courtlistener.com/recap/gov.uscourts.flmd.355075/gov.uscourts.flmd.355075.4.1.pdf (9 pp)
  → This is the standalone "Exhibit D" form Buckeye didn't file. Perfect sale-of-business DECOY.
- Exh. B — **Consulting Agreement** with the seller (post-closing, $15,000/month, 1-year term,
  1-year post-term customer/vendor non-solicit, IP/work-product assignment).
  https://storage.courtlistener.com/recap/gov.uscourts.flmd.355075/gov.uscourts.flmd.355075.4.2.pdf (13 pp)
  → Independent-contractor covenant: WA 1155 covers independent contractors; CA 16600 covers
  "anyone". Tests whether agent treats consultant covenant as ancillary-to-sale or not.
- Exh. C — **Southern HVAC Employee Guidebook (Jan 1, 2018) excerpt** — confidentiality, customer
  list "exclusive and confidential", no soliciting customers for personal gain during employment.
  https://storage.courtlistener.com/recap/gov.uscourts.flmd.355075/gov.uscourts.flmd.355075.4.3_1.pdf (6 pp)
  → Handbook consistency doc (in-term restriction only = not a noncompete; decoy).
- Amended complaint (54 pp) quotes APA terms: .../gov.uscourts.flmd.355075.4.0.pdf
License: federal court filings are public records (PACER/RECAP); no copyright asserted in
practice for contracts attached as exhibits; RECAP hosts them freely. Substitute names.

### Other RECAP / court sources (verified)

| Source | URL | What | Redaction | Role |
|---|---|---|---|---|
| Climate Pros, LLC v. Wade (W.D. Tex. 1:22-cv-00223), complaint 29 pp | https://storage.courtlistener.com/recap/gov.uscourts.txwd.1164756/gov.uscourts.txwd.1164756.2.0.pdf | Commercial HVAC (SMCP Holdings) sues ex-employees hired at acquisition of Tri-Temp and Norfoxx; quotes verbatim **"Confidential Information, Non-competition and Cooperation, Non-solicitation Agreement"** (24-month noncompete in IL, MI, WI, IN, HI, FL; no-hire; customer non-solicit w/ 24-month lookback) and **"Confidentiality and Stay Bonus Agreement"** (1-yr non-solicit of customers/suppliers, 12-mo lookback; noncompete w/ 1% public-stock carve-out). Exhibits A/B themselves not on RECAP. | none in quotes | Acquisition-hire employee covenants (NOT sale-of-business: employees weren't sellers) — trap; stay-bonus = WA 1155 "forfeit/repay" check; TX forum/IL geography |
| 1-Tom-Plumber Global Inc. v. Blue Ridge Plumbing & Drain LLC (S.D. Ohio 1:25-cv-00396), Exh. 1 = full **plumbing Franchise Agreement** (113 pp) | https://storage.courtlistener.com/recap/gov.uscourts.ohsd.303558/gov.uscourts.ohsd.303558.1.1.pdf | §11: in-term noncompete; 2-yr post-term within Operating Area + 25 mi (<5 yrs experience) or 40 mi (>5 yrs); **franchisor/franchisee mutual no-poach (3 months)**; 6% royalty, $2,500 min monthly; Ohio law; **Attachment D "Management Confidentiality and Non-Competition Agreement"** — franchisee's on-premises manager bound to 24-month noncompete, Ohio law, indemnity + disgorgement | none observed | Franchise stack (company operates one acquired franchised location): franchisee covenant = WA exception (if RCW 19.100 compliant); manager covenant = employee noncompete → void; **no-poach violates RCW 49.62.060**; Ohio choice of law violates RCW 49.62.050 for WA-based employee |
| Rooterman, LLC v. Belegu (D. Mass. 1:24-cv-13015), 2d am. compl. | https://storage.courtlistener.com/recap/gov.uscourts.mad.278363/gov.uscourts.mad.278363.89.0.pdf | quotes plumbing franchise 3-yr / 100-mile post-term covenant | none | alt. franchise clause source |
| Comfort Systems USA (Ohio) v. Wilmink (S.D. Ohio 2022), PI order | https://storage.courtlistener.com/recap/gov.uscourts.ohsd.269003/gov.uscourts.ohsd.269003.30.0.pdf | mechanical contractor employee noncompete partly enforced | none | clause text for manager tier |
| Comfort Systems USA (Kentucky) v. AHM Bowling Green (W.D. Ky., op. 8/14/2026) | https://storage.courtlistener.com/recap/gov.uscourts.kywd.144934/gov.uscourts.kywd.144934.43.0.pdf | very recent HVAC noncompete opinion | none | optional trigger-adjacent case law |
| R.J. Heating Co. v. Rust (N.D. Ohio 2022) | https://storage.courtlistener.com/recap/gov.uscourts.ohnd.287147/gov.uscourts.ohnd.287147.20.0.pdf | HVAC tech noncompete; judgment on pleadings for defendants | none | clause text (tech level) |

### Other EDGAR employment sources (verified, unredacted unless noted)

| Doc | URL | Verified content | Redactions | Role |
|---|---|---|---|---|
| Remitly (Seattle, WA) **Transition Agreement** w/ exec Joshua Hug, Mar 5, 2025 (10-Q EX-10.1) | https://www.sec.gov/Archives/edgar/data/1782170/000178217025000093/exhibit101-executionversio.htm | WA general release listing RCW 49.62 (noncompetition law), Silenced No More Act (49.44.211), WLAD etc.; **"Executive will remain bound by ... non-competition, non-solicitation and confidentiality covenants, to the extent permitted by applicable law"**; Mutual Arbitration Agreement with severable Class Action Waiver | none | WA **separation/transition agreement** template. After 6/30/2027 the reaffirmation of a noncompete = "represent that the worker is subject to a noncompetition covenant" (RCW 49.62.020(2)) → planted hit |
| Remitly Consulting Agreement (post-retirement exec), 10-K EX-10.16, 2025 | https://www.sec.gov/Archives/edgar/data/1782170/000178217025000018/exhibit1016-postxretiremen.htm | independent-contractor agreement with WA release + mutual arbitration + class waiver; $4,000/month; term 1/1/2025–12/31/2026 | none | contractor covenant / arbitration template |
| ServiceMaster (Terminix — home services) **Separation Letter Agreement**, N. Varty, Jan 17, 2020 (8-K EX-10.1) | https://www.sec.gov/Archives/edgar/data/1428875/000142887520000005/serv-20200121xex10_1.htm | OWBPA/ADEA release; carve-out preserving "confidentiality/non-solicitation/non-compete" obligations; disputes → **"ServiceMaster We Listen Dispute Resolution Plan"** (mandatory employee arbitration program) | only address withheld | Exec separation template; home-services lineage |
| ServiceMaster Performance Share Agreement form, 10-K EX-10.30 (2016) | https://www.sec.gov/Archives/edgar/data/1428875/000142887517000052/serv-20161231xex10_30.htm | award conditioned on not competing / soliciting customers, franchisees, subcontractors | EPS targets "$xxx" (irrelevant) | **Forfeiture-for-competition** clause → WA 1155 new (3)(d) hit; IL "adverse financial consequences" = noncompete |
| Frontdoor (home warranty; plumbing/HVAC contractor network) 2025 CEO PSU Agreement, 10-K EX-10.24 (filed 2/26/2026) | https://www.sec.gov/Archives/edgar/data/1727263/000119312526076548/ftdr-ex10_24.htm | grant conditioned on executing **"Noncompetition, Assignment of Work Product and Confidentiality Agreement"** (Exh. A, incorporated by reference, not filed); vesting "subject to the Associate's not having violated any restrictive covenant"; clawback; disputes → "Frontdoor We Listen Dispute Resolution Plan"; TRO carve-out | template placeholders (/$ParticipantName$/) | Best **incorporation-by-reference L1** example: equity award → RCA; forfeiture → WA (3)(d) |
| IES Holdings (Houston, TX; electrical/mechanical contractor) Employment Agreement, G. Matthews, Feb 28, 2019 (10-Q EX-10.9) | https://www.sec.gov/Archives/edgar/data/1048268/000119312519138305/d740684dex109.htm | $650,000 base; noncompete/non-solicit defined by reference to **Section 14 of the Severance Plan** (Restricted Period extended to 2 yrs if terminated for Cause/resigns w/o Good Reason) | none | TX exec; cross-document incorporation (employment agreement → severance plan) |
| Comfort Systems USA (Houston, TX; HVAC) exec employment agreements 2001–2004 (e.g., Hess 2002) | https://www.sec.gov/Archives/edgar/data/1035983/000095012902002592/h96776qex10-1.txt | HVAC roll-up exec noncompetes (plain text) | none | Older-template lineage (pre-2020 WA law) |
| NorthStar Healthcare "Restrictive Covenant Agreement" (form, 2022) | https://www.sec.gov/Archives/edgar/data/1503707/000150370722000031/ceoformofrestrictivecovena.htm | standalone confidentiality + invention assignment w/ state non-assignable-invention exemptions (CA §2870, IL, WA, MN, KS), DTSA immunity notice, noncompete + non-solicit, US-wide scope | none | **PIIA / standalone RCA** template (compensating-protection doc) |
| SOS Hydration offer letter + PIIA (S-1/A EX-10.10, 2022) | https://www.sec.gov/Archives/edgar/data/1861785/000190359622000562/f2ssos1a042122ex10_10.htm | $160,000 salary, $30,000 relocation allowance, arbitration clause, in-term duty not to compete, 1-yr employee non-solicit, customer non-solicit w/o end date | none | **Offer letter** template; relocation allowance → CA AB 692 / WA TRAP analysis |

License note for all EDGAR exhibits: publicly filed; widely redistributed (CUAD, CC BY 4.0,
is built from EDGAR contracts). Keep a SOURCES.md mapping each adapted doc to its accession URL;
replace all real people/companies with fictional names (this also avoids any appearance of
publishing real individuals' comp data).

---

## PART A — DOCUMENT TYPE PLAN (purpose, sources, effort, generation recipe, counts)

Fictional company used below: "Cascade Summit Plumbing & Air, Inc." (placeholder — use whatever
name the corpus adopts). ~400 employees: ~260 hourly field techs/installers/apprentices,
~45 dispatch/CSR, ~40 sales (comfort advisors, commercial estimators), ~40 managers/GMs,
~8 execs. Four states. Acquired shops: 5–7 (2019–2025).

### A1. Technician / hourly offer letters + "Employee Confidentiality, Non-Solicitation and Non-Competition Agreement" (field techs, CSRs, dispatch)
- Purpose: PRIMARY noncompete-relevant population (Rollins pattern: blanket covenant for all
  new hires). Also consistency with handbook and arbitration agreement.
- Real-source basis: no full technician-level agreement text found freely on RECAP (exhibits
  usually sealed/not purchased). Use real clause language from: Rollins complaint facts
  (2 years / 75-mile radius around branch / "all new hires"), 1-Tom-Plumber Attachment D
  (24-month, operating area of any unit), Climate Pros quoted covenants, Buckeye employment
  agreement §§ (downscaled). Redactions: none in sources.
- Effort: medium (generation from real clause bank).
- Recipe: build ONE 2019 "legacy" template (national, TX law, 24 mo / 50 mi noncompete, customer
  no-solicit + **no-accept** ("shall not accept or perform services for any customer serviced
  in last 24 months"), employee no-hire, training repayment §, liquidated damages $5,000 on
  breach, arbitration reference) + state riders created over time:
  - CA rider (2020): noncompete deleted, customer non-solicit kept "to the extent trade secrets"
    (lineage test: rider supersedes body — L1 precedence).
  - WA rider (2020 after RCW 49.62): noncompete applies "only if annual earnings exceed
    threshold"; choice of WA law. (2027: entire noncompete void; notice needed.)
  - IL rider (2022): 14-day review + "consult an attorney" language; earnings gate $75k/$45k.
  - TX: no rider (template governs; TX §15.50 enforceable if ancillary to confidential info).
  - Generate filled instances from an HR roster CSV (name, role, state, hire date, annualized
    W-2 earnings, template version, signed date). Unredacted comp in each offer letter.
- Counts: 1 legacy template + 3 riders + 2023 revised template = 5 templates; 20–30 signed
  instances (sample, not 260) spread across states, incl. planted edge cases:
  WA tech at $128k (above 2026 threshold → currently enforceable → flips 6/30/2027);
  IL service tech doing new-construction installs (P.A. 103-921 construction ban, incl.
  non-solicit) vs IL comfort advisor (sales carve-out); IL dispatcher at $46,900 (non-solicit
  void after 1/1/2027 threshold $47,500); CA tech hired 2025 with TRAP (pre-AB 692 → not
  voided by §16608, still void under §16600 if noncompete-like) vs CA tech hired Feb 2026 with
  same TRAP (AB 692 violation); remote WY-based dispatcher (WY SF 107 scoping).

### A2. Training Repayment Agreements (TRAPs) / stay bonus / sign-on repayment
- Purpose: noncompete-relevant under WA 1155 (3)(d)+(e)(vi), CA AB 692, WY SF 107 schedule,
  IL "adverse financial consequences". Very realistic in HVAC (EPA 608, NATE, backflow cert,
  manufacturer training) and apprenticeship.
- Sources: Climate Pros "Confidentiality and Stay Bonus Agreement" (quoted); SOS relocation
  allowance; AB 692 text defines the categories. Generation needed.
- Recipe: 3 variants: (a) 24-month pro-rata training repayment $4,500 cap (fails WA 18-month
  rule); (b) DAS-registered apprenticeship agreement (CA exception — decoy); (c) sign-on bonus
  $2,500 with 12-month clawback in a separate doc with 5-business-day counsel notice (meets
  AB 692 exception — decoy) vs same clause embedded in offer letter (fails).
- Counts: 3 templates + 6 instances.

### A3. Manager / GM / sales-manager employment agreements
- Purpose: noncompete-relevant; the population above WA/IL thresholds whose covenants are
  CURRENTLY valid and flip under WA 1155.
- Sources: Buckeye/Energy King manager agreements (Leonard, Kurz, Larson, Gallagher; $150–175k,
  3-yr customer lookback, "Territory"); Comfort Systems 2002–2004 exec agreements.
  Redactions: none.
- Recipe: adapt Buckeye text → rename, update dates (2021–2024), set comp $105k–$185k, choose
  governing law per state (plant one WA GM with **Texas choice-of-law** → violates 49.62.050).
- Counts: 6–8.

### A4. Executive employment agreements + equity award agreements + severance plan
- Purpose: noncompete-relevant (execs are where noncompetes remain lawful in TX/IL);
  forfeiture-for-competition in equity = WA (3)(d) new hit; incorporation by reference (L1).
- Sources: IES Holdings 2019 (severance-plan incorporation), Frontdoor 2025 PSU (+ RCA by
  reference; We Listen DR plan), ServiceMaster PSU form (forfeiture), Hultman/Mintz (Buckeye).
- Recipe: CEO (TX), CFO (TX), COO (WA-based, TX law — planted conflict), VP Ops West (CA):
  base $240k–$520k. Equity: phantom unit plan award w/ "Detrimental Activity" forfeiture;
  Executive Severance Plan with §14 Restrictive Covenants (the defined-term source).
- Counts: 4 exec agreements + 1 severance plan + 2 award forms.

### A5. Confidentiality & invention assignment (PIIA) / standalone non-solicitation agreements
- Purpose: **compensating protection** L2 link (Rollins complaint & FTC: non-solicit/NDA are the
  less restrictive alternatives; WA/IL/CA all exempt NDAs and trade-secret covenants). The
  agent should (i) NOT flag them as void, but (ii) check whether the non-solicits now exceed
  WA's 18-month / direct-relationship limits and IL construction ban.
- Sources: NorthStar RCA form (multi-state invention notices, DTSA notice); SOS PIIA; Remitly.
- Recipe: company-wide "Confidential Information and Customer Relationship Agreement" v2021
  (24-month non-solicit of "any customer of the Company" — over-broad for WA after 2027) and
  v2025 (12-month, relationship-based — compliant; tests that agent distinguishes versions).
- Counts: 2 templates + 8 instances.

### A6. Separation / severance agreements with restrictive covenants
- Purpose: noncompete-relevant (reaffirmation of noncompete; forfeiture of severance on
  competition = WA (3)(d)); also CA SB 699/AB 1076 notice consistency.
- Sources: Remitly Transition Agreement (WA), ServiceMaster Varty letter (OWBPA; DR plan).
- Recipe: 3 instances: WA branch manager 2025 (reaffirms 12-mo noncompete; severance
  conditioned on compliance → both hit by 1155); CA tech 2024 (includes the §16600.1 notice
  sentence — compliant decoy); TX sales manager (TX law — not hit).
- Counts: 3–4.

### A7. Employee handbook (multi-state) + state supplements; arbitration agreement with class waiver
- Purpose: consistency link (handbook ↔ offer letters ↔ arbitration agreement); mostly
  DISTRACTOR for tariff trigger; for noncompete, handbook "Conflicts of Interest / Outside
  Employment / Confidentiality" sections are in-term restrictions (NOT noncompetes → decoy)
  except a planted "Employees who leave may not service Company customers for 12 months"
  sentence (a hidden no-accept covenant in a handbook → hit).
- Sources: Southern HVAC Employee Guidebook excerpt (RECAP, 2018, 6 pp, real HVAC roll-up
  language); ServiceMaster/Frontdoor "We Listen" DR plan references (mandatory arbitration
  program for a home-services workforce); Remitly Mutual Arbitration Agreement w/ severable
  Class Action Waiver (full text in filed exhibit). No full trades handbook located freely
  (Wayback CDX found none on major brand domains).
- Recipe: generate a 25–35 page handbook seeded with Southern HVAC Guidebook policies (vehicle,
  customer-list confidentiality, gifts, trademarks) + standard sections (EEO, at-will, PTO,
  on-call pay, drug testing for drivers/DOT, tool policy, uniform/van deduction policy —
  deduction/“damages” policy is an AB 692 "penalty, fee, or cost" candidate). Add CA/WA/IL/TX
  supplements. Arbitration: adapt Remitly MAA to "Dispute Resolution Program" (+ PAGA carve-out
  for CA; WA note re Silenced No More).
- Counts: 1 handbook + 4 state supplements + 1 arbitration agreement + 1 acknowledgment form.

### A8. Asset purchase agreements for acquired shops + ancillary seller noncompetes + seller employment/consulting
- Purpose: the **sale-of-business exception DECOY** plus embedded **traps** (non-owner signers,
  consulting agreements, seller-turned-employee agreements, stay bonuses for acquired staff).
  Also L1 stacks (APA → Exh. D noncompete → seller employment agreement → promissory note).
- Sources (all unredacted): Buckeye/Energy King–Barnett Plumbing APA (CA, 2007); ARS–Energy
  King MA APA (2008; Hultman non-owner covenant; purchase-price allocation 12% to noncompete);
  Gallagher's Heating & Air merger + employment (CA, 2008); Southern HVAC–U.S. Heating & Air
  seller Noncompetition/Nonsolicitation/Confidentiality Agreement (5 yrs, Delaware law) +
  Consulting Agreement ($15k/mo) (RECAP 2017); Climate Pros acquisition-hire covenants.
- Recipe: 5 acquisitions:
  1. CA shop 2019 (Barnett-based APA; owners' 5-yr noncompete = §16601 valid; sons' Exh. E
     covenants = void) — generate Exh. D/E from ARS §10 and Southern HVAC Exh. A text.
  2. WA shop 2021 (ARS-based APA re-homed to King/Snohomish counties; owner 60% + "key employee"
     who received 0.5% rollover units → below 1% floor → void; after 1155 still void; owner OK).
  3. WA franchised shop 2023 (company became a 1-Tom-Plumber-style franchisee; carries franchise
     agreement + Attachment D manager covenants + no-poach → RCW 49.62.060).
  4. IL shop 2022 (Gallagher-style stock purchase + seller employment agreement w/ 3-yr
     noncompete; seller owns 100% → IL §5 sale-of-business exclusion; but agreement is the
     EMPLOYMENT agreement, not the SPA — ambiguity to flag).
  5. TX shop 2024 (Southern HVAC-based; seller consulting agreement 12 months + 1-yr non-solicit;
     TX law — not hit; decoy for WA/CA triggers).
  Bump prices ~1.5–2x from 2007 values; keep allocation schedules (materiality numbers).
- Counts: 5 APAs/SPAs + 5 seller noncompetes + 3 seller employment/consulting + 2 notes.

### A9. Franchise agreement (if the company owns a franchised location)
- Purpose: L2 party/lineage link; franchisee exception vs manager covenant vs no-poach.
- Source: 1-Tom-Plumber Franchise Agreement (RECAP, 113 pp, full, unredacted: 6% royalty,
  $2,500 min monthly royalty, 25/40-mile post-term radius, Ohio law, Attachment D).
  FDD databases (MN CARDS, WI DFI) blocked automated access (Cloudflare 403) — Mr. Rooter /
  Benjamin Franklin FDDs require manual browser download; the RECAP franchise agreement is a
  sufficient substitute.
- Counts: 1 franchise agreement + 2 signed Attachment D manager agreements.

### A10. Independent-contractor / subcontractor agreements with individual plumbers (1099)
- Purpose: WA 1155 and CA §16600 cover independent contractors — commercial-looking contracts
  that ARE hit (cross-over with tariff corpus's subcontract stack).
- Sources: Southern HVAC Consulting Agreement; Remitly Consulting Agreement.
- Recipe: master subcontract for sole-proprietor plumbers with "shall not solicit or perform
  work for Company customers for 12 months" (no-accept) → hit. Counts: 2–3.

### A11. Notices / memos (post-change artifacts, and pre-existing compliance artifacts)
- CA AB 1076 notice letter (Feb 2024) sent to current/former CA employees — consistency doc;
  presence proves CA template lineage was addressed.
- HR memo (May 2024) "FTC noncompete ban effective Sept 4, 2024 — pause enforcement" — becomes
  stale after vacatur (FTC trigger hit: memo is outdated).
- Counts: 2–3.

Suggested total employment slice: ~70–90 documents (≈25 templates/forms, ≈50–65 instances),
of which ~35% real-adapted (APAs, franchise, exec, separation, PIIA, arbitration) and the
hourly-population instances generated from roster data.

---

## Ground-truth sketch per trigger (for eval design)

| Doc family | WA ESHB 1155 | IL P.A.103-921 / 2027 thresholds | CA AB 692 | FTC vacatur/Rollins | TX SB 1318 |
|---|---|---|---|---|---|
| Owner seller noncompetes (APA Exh. D) | Not affected (≥1% owner) — DECOY | Not affected (§5 exclusion) | n/a | not affected | none |
| Non-owner APA signers (Hultman/Kyle/Travis analogs) | Void; notice by 10/1/2027 (if WA-based) | depends (not sale exclusion) | n/a (already void under 16600) | risk | none |
| Tech/CSR noncompetes (WA) | Already void if < threshold; notice duty now applies to all in-period covenants | — | — | Rollins-pattern risk | none |
| WA managers/execs noncompetes | **Void 6/30/2027 (material)** | — | — | — | none |
| No-accept customer clauses | noncompete (since 2024) | covenant not to solicit | — | Rollins order barred these | none |
| Non-solicits (24-mo, any customer) | Outside new exception → void | IL construction workers void (since 1/1/2025) | CA: void unless trade-secret | "less restrictive alternative" | none |
| TRAPs / forfeiture / stay bonus | New (3)(d) + 18-month exception test | "adverse financial consequences" = noncompete | Void if entered ≥1/1/2026 & no exception | — | none |
| Equity/PSU forfeiture on competition | New (3)(d) hit | same | — | — | none |
| Franchise agreement (franchisee covenant) | Exception if RCW 19.100 compliant; no-poach void (49.62.060, unchanged) | — | — | — | none |
| Franchise Attachment D (manager) | Void; Ohio law clause violates 49.62.050 | — | — | — | none |
| Separation agreement reaffirming noncompete | "represent subject to" = violation after 6/30/2027 | — | — | — | none |
| Handbook in-term conflict rules, NDAs, PIIAs | Not affected (exception) — DECOY / compensating protection | Not affected | — | — | none |
| HR memo re FTC rule | — | — | — | Outdated → update | none |

---

## Redaction status summary (user preference: unredacted)

- Unredacted (verified by inspection): all Buckeye/Energy King exhibits (prices $300,000 +
  600k shares; $447,463.69; salaries $150k/$165k/$175k; 5-yr; county-level Area); Southern
  HVAC RECAP exhibits (5-yr; $15,000/month); 1-Tom-Plumber franchise agreement (6%, $2,500,
  25/40 mi, 2 yrs); IES ($650,000); Remitly ($4,000/month; dates); SOS ($160,000; $30,000);
  Climate Pros quoted covenants (24 months; states listed).
- Placeholders rather than redactions: Frontdoor PSU (/$ParticipantName$/ merge fields) and
  ServiceMaster forms ("$xxx" EPS targets, blank names) — these are forms, fill with roster
  values. Recipe: award size = 0.6–1.2x base salary / grant-date price; EPS targets irrelevant
  to noncompete analysis — replace with plausible EBITDA targets.
- Not filed / must be generated: Buckeye Exh. D/E noncompetes (use ARS §10 + Southern HVAC
  Exh. A text), Frontdoor Exh. A RCA (use NorthStar RCA), Climate Pros Exh. A/B (use the
  verbatim quotes in the complaint as the operative sections, wrap with standard boilerplate).
- Redaction pattern to avoid: most large-cap EDGAR material contracts (supply/APAs) redact
  pricing with "[***]"; the small-cap Buckeye/Energy King and RECAP exhibits avoid this.

## Licensing / redistribution

- State statutes, session laws, Federal Register, court opinions: public domain / government
  works (US federal works not copyrightable; state enactments are edicts of government,
  Georgia v. Public.Resource.Org, 590 U.S. 255 (2020)). Safe to commit snapshots.
- EDGAR exhibits and RECAP exhibits: private contracts filed publicly; no license granted, but
  contracts are generally thin-copyright functional text and are routinely redistributed
  (CUAD/ACORD datasets under CC BY 4.0 were built from EDGAR). Adapting with name
  substitution + attribution in SOURCES.md is a reasonable, common practice. Avoid committing
  un-substituted docs that name real private individuals with compensation (do the
  substitution before commit).
- CourtListener API data: Free Law Project; RECAP PDFs are public records. CourtListener
  asks for attribution; API needs no key for search at low volume.
- Trademarks: do not reuse "1-Tom-Plumber", "Rooterman", "ARS", "Orkin" etc. as the fictional
  company's brands; substitute.

## Fetch notes (for replay / snapshotting)

- ilga.gov: TLS chain incomplete → `curl -k`; WebFetch fails. Wayback copies work.
- leginfo.legislature.ca.gov billTextClient.xhtml pages return full HTML to curl.
- app.leg.wa.gov bill summary + lawfilesext PDFs fetch fine; PDFs need pypdf (no pdftotext).
- wyoleg.gov/2025/Enroll/SF0107.pdf fetches fine.
- Federal Register API: https://www.federalregister.gov/api/v1/documents/{doc_number}.json ;
  full text at /documents/full_text/text/YYYY/MM/DD/{doc}.txt.
- MN CARDS and WI DFI franchise databases: Cloudflare-blocked for scripts.
- CourtListener: `type=rd` + `available_only=on` for downloadable PDFs; storage URL prefix
  https://storage.courtlistener.com/ + filepath_local.

## Unverified / to-check items

- Virginia 2025 bill number (SB 1218) — statute text verified, bill number from memory.
- Minnesota §181.988 not re-fetched this session.
- Illinois P.A. 104-417 (eff. 8/15/2025) content not inspected.
- TX SB 1318 coverage of non-physician health practitioners — caption says "certain health
  care practitioners"; details not extracted.
- Ryan v. FTC CourtListener docket URL not individually fetched (citation 746 F. Supp. 3d 369
  and appeal numbers verified via the FTC's Feb 2026 Federal Register rule).
- Rollins consent order final approval status after the May 22, 2026 comment deadline not
  checked.
