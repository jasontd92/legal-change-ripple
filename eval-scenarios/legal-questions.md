# Legal Questions: Research Notes (2026-09-29)

Research on the three legal-judgement questions raised in `README.md` §5.
Sources are the corpus text plus web research. These are not attorney
opinions. Gold answers built on them should be labelled "non-attorney
reference."

---

## Q1. Do IL PA 103-0921 and CA AB 692 void existing covenants, or only new ones?

### CA AB 692 (TR-12): prospective only. Settled by the statute's own text.
- `corpus/triggers/TR-12-ca-ab-692-stay-or-pay/2025-10-13_ab-692-chaptered.txt`:
  - B&P §16608(b)(1): "for contracts entered into on or after January 1,
    2026"
  - §16608(c): "void under Section 16600 **only if** the contract was entered
    into on or after January 1, 2026"
  - Lab. Code §926(a): "void as contrary to public policy **only if** entered
    into on or after January 1, 2026"
- Firm commentary agrees (Morgan Lewis, Akin, Mayer Brown).
- **Eval implication:** repayment terms signed before 2026-01-01 are **not
  affected** by TR-12. Signed on or after that date → affected. The
  `ca_ab692_before_cutoff` / `ca_ab692_after_cutoff` plants are consistent
  with this.
- Nuance for S4: a pre-2026 agreement that is **re-signed, amended or renewed**
  on or after 2026-01-01 is a new contract entered into, which is worth one
  scenario if the corpus has one.

### IL PA 103-0921 (TR-11): most defensible reading is prospective (covenants entered on or after 2025-01-01), with a real textual ambiguity.
- **Structure of the text** (`2024-08-09_public-act-103-0921.txt`):
  - §10(a)–(c) are phrased as conduct rules: "No employer shall **enter into**
    …"
  - New §10(e) is phrased as a status rule: "A covenant not to compete or a
    covenant not to solicit **is void and illegal** with respect to
    individuals employed in construction". It has no "entered into after"
    limiter of its own.
  - The Act's definitions (from PA 102-358, prior text in
    `2023-03-_820-ilcs-90-prior-text.txt`) limit "covenant not to compete" and
    "covenant not to solicit" to agreements "entered into after the effective
    date of this amendatory Act of the 102nd General Assembly," i.e. after
    2022-01-01.
- **So the plain text alone** could be read to void construction-worker
  covenants signed 2022-01-01 → 2024-12-31. Covenants signed before 2022 are
  outside the Act's definitions in any case.
- **Against that reading:** Illinois' Statute on Statutes (5 ILCS 70/4) and
  the courts' presumption against retroactive *substantive* changes. Voiding a
  signed contract is substantive, and the amendment states no retroactive
  intent. Firm alerts (Epstein Becker Green; Beck Reed Riden) describe it as
  prohibiting employers from *entering into* such covenants and don't address
  existing ones. No commentary found that treats it as retroactive.
- **Eval implication:**
  - Construction-worker covenants signed **on or after 2025-01-01** →
    affected (void).
  - Signed **2022-01-01 → 2024-12-31** → gold = **needs review** (not "void",
    not "unaffected"). A conservative GC would flag the ambiguity, and the
    covenant must still satisfy the pre-existing 2022 IFWA requirements
    (earnings thresholds, 14-day review, attorney advice), which may void it
    independently.
  - Signed **before 2022-01-01** → not affected by TR-11.
  - The exception for construction employees in management, engineering,
    design or sales roles, or who are owners, applies throughout.
  - This matches the `il_construction_ban_in_effect_at_signing` plant for
    post-2025 signings. The 2022–2024 band is where the eval can test
    appropriate abstention.
- Web results also surfaced a later IL bill (HB 3213, 104th GA) that
  proposes broader restrictions. Its status was not verified, and it isn't in
  the corpus. Ignore it for evals.

---

## Q2. Is Nadia Castellano's §10 "Duty Not to Compete" a §16600 covenant?

**No. But the same agreement has a real §16600 problem in §12.**

Document:
`corpus/documents/employment/nadia-castellano_offer-letter-and-piia_sales-manager_2024-05-06.md`
(CA employee; CA governing law; signed 2024-05-06).

| Clause | Text (abridged) | Status under CA law |
|---|---|---|
| §10 Efforts; Duty Not to Compete | "**While I am employed** by the Company, I will not … provide services to … any business … which competes" | **Enforceable.** An in-term restraint; §16600 doesn't reach restrictions during employment (*Techno Lite, Inc. v. Emcod, LLC*, 44 Cal.App.5th 462 (2020)). Should-not-flag / decoy |
| §12 Non-Solicitation of Employees/Consultants | During employment "and for a period of one (1) year thereafter" | **Likely void.** *AMN Healthcare v. Aya* (2018) and later federal decisions treat post-employment employee non-solicits as void under §16600. **This is the real finding** |
| §13 Non-Solicitation of Suppliers/Customers | Limited to where the customer/supplier identity is a trade secret or confidential | **Likely enforceable.** A trade-secret-limited customer non-solicit is the recognised carve-out. Decoy |

**Trigger mapping (TR-90 controls SB 699 / AB 1076):**
- SB 699 (B&P §16600.5, eff. 2024-01-01): unlawful to *enter into* or
  attempt to enforce a void covenant, with a private right of action. The
  agreement was entered 2024-05-06, **after** that date, so §12 is squarely
  within SB 699.
- AB 1076 (B&P §16600.1): notice by 2024-02-14 to current and former
  employees whose contracts contain a void noncompete clause. It applied to
  contracts existing before that deadline. This one was signed after it, so
  the **notice** obligation likely doesn't apply; the SB 699 exposure does.
  Whether an employee non-solicit counts as a "noncompete clause" under AB
  1076 is unsettled; practitioners advised including them.
- **Conclusion: TR-90's SB 699 is not a clean control.** It produces one real
  finding (§12) and one decoy (§10). Either reclassify SB 699 from control to
  positive trigger, or edit §12 to be in-term only if a pure control is
  wanted.
- Side note: the manifest tags this document `relocation_repayment`. Signed
  2024, so it's pre-AB 692 and **not affected by TR-12** (see Q1): a good
  should-not-flag case for the stay-or-pay trigger.
- V6 note: the file is ~114k characters, and the covenants sit around line
  338 of ~1,500 (early), so truncation risk is low for this clause.

---

## Q3. Is Northbrook Commons' concession "comparable Services" under Sunpoint's MFN?

**Most likely yes, and the stronger trigger isn't the surcharge waiver.**

Documents:
- `customers/sunpoint-public-schools-cooperative_mechanical-services-contract_2021-07-01.md`,
  §3 unnumbered "Most Favored Pricing"
- `customers/notices/meridian-illinois_pricing-letter-agreement_northbrook-commons_2026-02-17.md`

| Term | Sunpoint (§3.1, §3.2) | Northbrook letter (2026-02-17) |
|---|---|---|
| Labor | Prevailing wage + **42%** | Prevailing wage + **34%** |
| Materials | Cost + **15%** | Cost + **12%**, "no tariff or material surcharge" |
| Services | Preventive/emergency/routine maintenance: HVAC, boiler, domestic hot water, plumbing (§1.1) | "HVAC, boiler and plumbing maintenance and repair services" |

**Analysis:**
- **Service comparability is strong.** The service types overlap almost
  completely. Northbrook's labor is even priced on a prevailing-wage base,
  unusual for private work, which makes the pricing directly comparable.
- **The clause has no volume, scale or term qualifier,** only "comparable
  Services." MFN clauses that intend to exclude small or differently sized
  accounts usually say "similar quantities / volumes / terms." Their absence
  cuts toward triggering.
- **Clearest breach:** both markups are lower (8 points on labor, 3 on
  materials), and the clause covers "any discount … or waiver or reduction of
  any surcharge." The surcharge waiver adds to the breach, but the markup gap
  alone triggers it. Scenarios B09/B21 frame the finding around the
  surcharge; the gold should cite the markup difference as the primary basis.
- **Real residual ambiguities:**
  1. Is a **condominium association** a "commercial customer"? It's a
     business entity buying services for common elements, typically handled
     as a commercial account, but it's arguable. The profile's revenue mix
     separates commercial from residential.
  2. Scale: a three-building condo vs a multi-district cooperative.
     Relevant to a fairness argument, but not an express qualifier.
- **Timing:**
  - Sunpoint's second renewal ran through **2026-06-30**. §5.5 says the third
    renewal is "pending formal approval," yet
    `work-orders/WO-SPS-2026-02_sps_2026-07-06.md` is "issued under the
    Master Agreement" on 2026-07-06.
  - Either way, the concession (from 2026-02-17) overlaps the second renewal
    period, so an MFN refund claim for **at least 2026-02-17 → 2026-06-30**
    exists ("refund of the difference for the affected period").
  - The **annual compliance certification** is the other exposure: any
    certification signed after 2026-02-17 is inaccurate.
- **Eval implication:**
  - Gold = **affected**, material, direction exposure. Response type: brief
    finance / renegotiate, and review the annual certification.
  - Scoring: "affected" or "needs review" pass; "not affected" fails.
  - Required spans: Sunpoint MFN paragraph + §3.1/§3.2 markups + Northbrook
    letter pricing sentence.
  - Worth a second scenario: M1 as-of shift or term status (is the contract
    live after 2026-06-30?) as a legal-status/undeterminable test.

**Corpus defect found:** the 2021-dated Sunpoint base contract *narrates*
the 2024 and 2025 renewals and a pending 2026 renewal in §5.3–§5.5, in the
present tense. A contract executed in 2021 can't record later events. Real
stacks paper renewals as separate letters or amendments. Fix by moving
§5.3–§5.5 into renewal documents in a Sunpoint cluster folder; that also
creates a genuine amendment chain for V5.

---

## Sources
- AB 692 chaptered text (corpus TR-12)
- [Morgan Lewis: California Bans Stay-or-Pay](https://www.morganlewis.com/pubs/2025/11/california-bans-stay-or-pay-employment-clauses)
- [Mayer Brown: Deeper Dive into AB 692](https://www.mayerbrown.com/en/insights/publications/2026/03/a-deeper-dive-into-californias-new-limitations-on-stay-or-pay-clauses-as-of-january-1-2026)
- PA 103-0921 and prior 820 ILCS 90 text (corpus TR-11)
- [EBG: Nine New Illinois Employment Laws for 2025](https://www.ebglaw.com/insights/publications/illinois-employers-need-to-know-nine-new-employment-laws-for-2025)
- [Beck Reed Riden: Illinois and Pennsylvania exemptions](https://faircompetitionlaw.com/2024/09/02/legislative-update-illinois-and-pennsylvania-pass-targeted-noncompete-nonsolicit-exemptions/)
- [AMN Healthcare v. Aya Healthcare (2018)](https://caselaw.findlaw.com/court/ca-court-of-appeal/1960901.html)
- [DWT: Employers may prohibit competing during employment (Techno Lite)](https://www.dwt.com/blogs/employment-labor-and-benefits/2020/01/california-non-compete-laws)
- [Crowell: employee non-solicits void under CA law](https://www.crowell.com/en/insights/client-alerts/a-nail-in-the-coffin-another-california-district-court-finds-that-employee-non-solicitation-agreements-are-void-under-california-law)
- [Akin: SB 699 / AB 1076 notice](https://www.akingump.com/en/insights/alerts/new-california-laws-provide-private-right-of-action-for-unlawful-restrictive-covenants-require-notice-to-affected-employees-by-february-14-2024)

---

# Round 2 (2026-09-29): remaining questions from README §5(b)

## Q4. KPS PO-2025-0231 clause conflict (E-VR-01), and TX silence on price adjustment (E-M7-06)
**[JASON] Deferred.** Evals carry only high-confidence answer directions.
Neither can be decided cleanly without a GC's judgement (in practice, routed
to a GC or three). **Exclude both from gold.** If kept in the corpus, score
only that the agent does **not** assert a confident answer (needs review or
open question = pass; affected or not affected stated as settled = fail).

## Q5. Do RCW 49.62 (WA) and PA 103-0921 (IL) reach customer non-solicits and training-repayment / forfeiture clauses?

Resolved from the statute text in `corpus/triggers/`.

### WA (TR-10): `2026-09-_rcw-49-62-current-text.txt`, RCW 49.62.010, both versions

**Customer non-solicit with a no-acceptance clause.**
- *Current* §(4) and *post-2027-06-30* §(3)(c): "A noncompetition covenant
  also includes an agreement that directly or indirectly prohibits **the
  acceptance or transaction of business with a customer**."
- The new §(4) adds: "An agreement that directly or indirectly prohibits the
  acceptance or transaction of business with a customer … is **not** a
  'nonsolicitation agreement'." It also limits true non-solicits to customers
  the employee personally developed, lasting ≤ 18 months.
- Plant `CUST_NONSOLICIT` (Gemma Northcott, WA, 2023-08-21, §4.1): "shall not
  … solicit, divert **or accept** plumbing or HVAC business … For twenty-four
  (24) months."
- → This is a **noncompetition covenant** under both current and future WA
  law, **not a non-solicit**.
  - Before 2027-06-30 it's subject to the current earnings threshold (a
    comfort advisor is likely below it: VERIFY the earnings figure).
  - From 2027-06-30 it's void outright "regardless of when the parties
    entered into the noncompetition covenant" (ESHB 1155 §4(1)), with a
    notice duty by 2027-10-01 (§4(3)).
- **TR10-S4-05 is not a decoy.** Reclassify: at as-of 2027-07-01, affected
  (void + notice due). At the default as-of, pending clock (the notice
  deadline is a real obligation clock), and possibly already unenforceable
  under the current threshold.

**Training repayment.**
- *Post-2027* §(3)(d) sweeps in "any provision … that … requires … that an
  individual return, repay, or forfeit any right, benefit, or compensation, as
  a consequence of the individual engaging in a lawful profession."
- §(3)(e)(vi) then **carves out** educational-expense repayment agreements,
  but only if all three hold: (A) the agreement expires within 18 months of
  the **start date**; (B) repayment is pro rata over that 18 months; (C) the
  employee is released on a "good cause" separation (RCW 50.20.050).
- The carve-out only makes sense if non-conforming repayment agreements are
  otherwise noncompetes.
- Plant `TRAINING_REPAY`:
  - runs **24 months** after training completion (not 18 from start)
  - pro rata over **24**
  - releases only on termination *without* cause, with **no good-cause-quit
    release**

  It fails all three conditions.
- → **Affected from 2027-06-30** (Gavin Ingersoll, WA, 2025-06-02:
  TR10-S4-03). Gold = affected at as-of ≥ 2027-06-30. Pass = affected or
  needs review. The structural argument is strong but not tested in court
  yet.
- Separately, the final-wage deduction authorisation raises a WA wage
  deduction question (RCW 49.52.060). That's out of scope for TR-10; note
  only.
- Before 2027-06-30 (current law): no forfeiture clause in the definition, so
  not affected.

### IL (TR-11): `2024-08-09_public-act-103-0921.txt` + prior text (definitions)

**Customer non-solicit.**
- "Covenant not to solicit" expressly includes restricting solicitation of
  "the employer's clients, prospective clients …" or "interfering with the
  employer's relationships".
- → **Covered.** It's void for construction employees under §10(e), with the
  same signing-date bands as Q1, and otherwise subject to the $45,000
  threshold under §10(b).

**Training repayment.**
- "Covenant not to compete" includes an agreement that "imposes adverse
  financial consequences on the former employee **if the employee engages in
  competitive activities** after the termination."
- `TRAINING_REPAY` triggers on resignation or for-cause termination
  regardless of what the employee does next. There's no competitive-activity
  condition.
- → **Not a covenant not to compete, and not a covenant not to solicit. Not
  affected by TR-11.** TR11-S4-04 is **confirmed as a decoy** (the
  "don't over-generalise WA's forfeiture sweep to IL" test).

## Q6. Is Northbrook Commons a "commercial customer"? Does scale matter? (Q3 residuals)
- The company's own profile lists `CUS-NBC` as an "**Illinois commercial
  maintenance customer**" (`corpus/company/profile.yaml`). Meridian's own
  records classify it as commercial, which defeats a "residential" argument
  in practice.
- Scale: the MFN has no volume, quantity or terms qualifier. The size gap is
  a negotiation point, not a defence.
- → **Gold unchanged: affected.** The residual ambiguity doesn't reach
  "needs review".

## Q7. Does AB 1076 apply to employee non-solicits, and is AB 1076 a clean control?

**Castellano §12 itself:** AB 1076's notice duty (B&P §16600.1) covered
contracts in existence by 2024-02-14, and Castellano signed 2024-05-06. →
**No notice duty for §12, whatever the non-solicit scope question.** Her
exposure is SB 699.

**The corpus has a bigger AB 1076 case.**
- The CA technician template (`employment/templates/form_technician-employment-agreement_california_rev-2017.md`)
  and all six signed CA instances contain **§6.1 Non-Solicitation of
  Employees: one year post-employment**. That's the same clause type as
  Castellano §12, likely void under *AMN*.
- Five instances were signed before 2024-02-14: 2017-12-10, 2019-02-09,
  2020-06-15, 2021-08-28, 2023-01-04. For any of those employees who were
  current, or employed after 2022-01-01, AB 1076 notice was due by
  2024-02-14, **if** an employee non-solicit counts as a "noncompete clause".
  That point is unsettled; practitioners advised including them.
- §6.2 (customer non-solicit) is trade-secret-limited and expressly
  §16600-compliant → a decoy.
- Instance 2024-04-07 (Sabrina Marchetti) was signed after SB 699 took effect
  → the same SB 699 exposure as Castellano §12.

**Therefore:**
- **SB 699 → positive trigger.** Findings: template §6.1 + all six instances
  (unlawful to enter into or attempt to enforce), with the 2024-signed
  instances and Castellano clearest. Gold = affected. Pass = affected or
  needs review.
- **AB 1076 → not a clean control either.** Gold for the five pre-deadline
  instances = **needs review**, citing: (a) unsettled scope for
  non-solicits; (b) whether notice was sent (no notice in the corpus); (c)
  whether each employee is current or post-2022. "Needs review" is the
  high-confidence answer direction here; "not affected" fails, and a
  confident "void notice violation" is over-claiming.
- **TR-90's clean controls are now only WY SF 107 and TX SB 1318.** The
  corpus `meta.yaml` should say so.

## Q8. HTS placement under Procs. 11021 / 11032 (web research, partial)
- **Confirmed:** HTS 7412 (copper fittings) is within the 11021 copper
  regime. 11021 split copper derivatives into a **50% Annex I-A** tier and a
  **25% Annex I-B** tier, on full customs value, effective 2026-04-06.
- **Confirmed:** 11032 moved residential-use HVAC into a temporary **15%**
  tier effective 2026-06-08 (from 25%); commercial HVAC stays on derivative
  rules.
- **Not confirmed:** which annex (I-A vs I-B) lists 7412, and the exact
  residential HVAC HTS lines. The accessible sources don't enumerate them;
  CBP CSMS 68253075 (2026-04-06) is the controlling operational list.
- **Eval implication:** GPC-INV-26-1912 correctly stays **needs review**.
  Don't build a gold that depends on the 7412 tier.

Sources (round 2):
- RCW 49.62 current text and ESHB 1155 session law (corpus TR-10)
- PA 103-0921 and prior 820 ILCS 90 text (corpus TR-11)
- [Federal Register: Proclamation 11021](https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states)
- [Tandom: Section 232 duties in 2026 (Annex I-A / I-B split)](https://tandom.ai/resources/section-232-steel-aluminum-copper-duties-2026)
- [ACHR News: HVAC Section 232 tariffs reduced to 15%](https://www.achrnews.com/articles/166275-trump-reduces-section-232-tariffs-on-hvac-equipment-to-15)
- [Federal Register: Proclamation 11032 full text](https://www.federalregister.gov/documents/full_text/html/2026/06/04/2026-11314.html)
