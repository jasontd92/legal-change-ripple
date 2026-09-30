# Research 1: External Law & Regulation That Changes Over Time
## (Use-case research for GC AI take-home: monitored sources + change log + "rippling effects" reasoning)

Prepared 2026-09-23. Claims from sources are cited inline. My own synthesis is marked **[INFERRED]**. Where search-result summaries were ambiguous or conflicting, I flag it as **[VERIFY]**.

---

## 0. TL;DR for the use case

1. **The volume problem is real but it is not the pain.** The 2024 Federal Register hit a record 107,262 pages and 3,248 final rules ([CEI](https://cei.org/publication/10kc-2025-numbers-of-rules/), [Forbes/Crews](https://www.forbes.com/sites/waynecrews/2024/12/31/bidens-2024-federal-register-page-count-is-highest-ever/)). There were 12,414 new or updated sales/use tax jurisdictions in 2025 ([Vertex](https://www.vertexinc.com/resources/resource-library/numbers-2025-us-sales-tax-rates-and-rules-changes)). GCs are already drowning in alerts: "That's why God invented the Delete button" ([Bloomberg Law](https://news.bloomberglaw.com/us-law-week/insight-why-your-client-alerts-fail-three-ways-to-fix-them)). **The pain is the "so what for us?" step**: in-house counsel say they are "much more inclined to read a client alert when accompanied by a concise note ... explaining why the issue is relevant to our company" (same source).
2. **2024–2026 was a period of whiplash, not just change.** Rules were issued, enjoined, vacated, delayed, revived, or replaced: the FTC noncompete ban, FTC click-to-cancel, the DOL overtime rule, the DOL independent-contractor rule, the NLRB joint-employer rule, the Corporate Transparency Act, the Colorado AI Act, the EU AI Act high-risk deadlines, the CFPB 1033 rule, the BIS Affiliates Rule, IEEPA tariffs, and the FCC TCPA 1:1 consent rule. **A change log with status (proposed / final / effective / enjoined / vacated / delayed) is itself valuable**, because "is this still live?" is a question GCs get wrong. **[INFERRED]**
3. **The best "ripple" examples link a public-law change to specific clauses in internal documents.** Examples: tariff refunds versus pass-through surcharge clauses; noncompete bans versus offer letters; the CCPA versus service-provider contract terms (Tractor Supply was fined partly for missing contract terms); the BIPA and CCPA ADMT rules versus vendor DPAs; and the Mobley v. Workday "vendor as agent" theory versus SaaS liability caps.
4. **This reaches every industry.** A 40-person California plumbing contractor, in 2024–2026 alone, had to deal with: a new state minimum wage and exempt-salary threshold, the SB 553 workplace-violence plan, the AB 1076 noncompete-void notice, pay transparency (if hiring in WA/IL/NJ/MA etc.), heat-illness rules, CSLB workers' comp mandate changes, the 50% Section 232 tariff on copper pipe and fittings (hitting fixed-price bids), and CCPA job-applicant notices if over thresholds. **[INFERRED from sources below]**

---

## 1. Employment law

### 1a. State/local minimum wage and exempt salary thresholds
- **Source/location:** State labor department pages (e.g., CA DIR, NY DOL), city ordinances (dozens of localities), state statutes with CPI indexing. Federal: 29 CFR 541 (the DOL overtime rule).
- **Recent changes:**
  - On Jan 1, 2026, 18 states raised minimum wage and six states adjusted exempt salary thresholds ([Epstein Becker Green](https://www.wagehourblog.com/minimum-wages-and-exemption-thresholds-adjusted-across-the-usa)).
  - CA: minimum wage $16.90 and exempt salary $70,304 ([NatLawReview](https://natlawreview.com/article/minimum-wages-and-exemption-thresholds-adjusted-across-usa)).
  - NY: $17.00 in NYC/LI/Westchester and $16.00 elsewhere; exempt salary $1,275/week downstate ([Mintz](https://www.mintz.com/insights-center/viewpoints/2226/2025-12-29-new-york-state-minimum-wage-and-salary-thresholds)).
  - Federal DOL 2024 overtime rule: **vacated nationwide Nov 15, 2024** under Loper Bright reasoning; the threshold reverted to $684/week ($35,568) ([Holland & Knight](https://www.hklaw.com/en/insights/publications/2024/11/federal-court-vacates-department-of-labor-overtime-exemption-rule); [Epstein Becker](https://www.wagehourblog.com/not-so-final-texas-court-vacates-the-dols-2024-final-overtime-rule)). Employers who raised salaries or reclassified in July 2024 then had to decide whether to reverse.
- **Frequency:** Annual (Jan 1 and Jul 1 waves), plus mid-year local changes. Indexed amounts are announced in the fall. **[INFERRED]**
- **Ripples into:** Exempt/non-exempt classification roster, offer letter templates, handbook overtime section, payroll config, staffing-agency bill rates (price-escalation clauses in MSAs), government/prevailing-wage bids, franchise agreements.
- **GC action:** Re-run the exempt roster against the new thresholds per state, reclassify or raise salary, update postings, review staffing-agency contracts for pass-through clauses.
- **Cost of missing:** FLSA collective action settlements totaled $418M across 337 cases in 2025, and 5,702 FLSA suits were filed ([HR Morning on Seyfarth report](https://www.hrmorning.com/news/flsa-lawsuits-report-seyfarth-shaw/)).
- **Breadth:** Universal. A plumbing company with salaried dispatchers or foremen cares directly.

### 1b. Paid sick leave
- **Source:** Ballot measures and state statutes.
- **Recent:** Missouri (May 1, 2025), Alaska (Jul 1, 2025), and Nebraska (Oct 1, 2025) all passed via ballot initiative ([Epstein Becker Green](https://www.ebglaw.com/insights/publications/paid-sick-leave-is-coming-to-alaska-missouri-and-nebraska-in-2025)). Accrual is 1 hour per 30 hours worked, with caps varying by employer size ([Foley](https://www.foley.com/insights/publications/2024/12/paid-sick-leave-laws-popularity-state-ballot-initiatives/)). **[VERIFY]** Missouri's legislature later repealed/modified its measure in 2025. Check current status. This is itself an example of whiplash.
- **Ripples into:** Handbook PTO/sick policy, state addenda, payroll accrual config, collective bargaining agreements, PEO/staffing contracts.
- **GC action:** Update the handbook's state supplement, decide between frontloading and accrual, and update notices and posters.
- **Breadth:** Universal. It is triggered by headcount in the state, so even small employers are covered.

### 1c. Pay transparency
- **Source:** State statutes.
- **Recent effective dates:** IL Jan 1, 2025 (15+ employees); MN Jan 1, 2025 (30+); NJ Jun 1, 2025 (10+); VT Jul 1, 2025 (5+); MA Oct 29, 2025 (25+) ([Mintz](https://www.mintz.com/insights-center/viewpoints/2226/2025-02-05-state-pay-transparency-2025), [Loio tracker](https://loio.com/guides/pay-transparency-laws-by-state/)). Coverage often extends to remote roles that could be filled in-state.
- **Case law ripple:** In *Branson v. Washington Fine Wine & Spirits* (Wash. Sup. Ct., Sept 4, 2025), the court held that applicants need not be "bona fide" to sue ([opinion PDF](https://www.courts.wa.gov/opinions/pdf/1033940.pdf); [Ogletree](https://ogletree.com/insights-resources/blog-posts/washington-state-supreme-court-broadly-defines-job-applicants-covered-by-pay-transparency-law/)). There have been 250+ class actions, 75% filed by one firm ([AWB](https://www.awb.org/was-pay-transparency-law-undergoes-key-fixes-but-challenges-remain/)). A July 27, 2025 amendment cut statutory damages from a $5,000 minimum to a $100–$5,000 range ([Duane Morris](https://blogs.duanemorris.com/classactiondefense/2025/09/11/the-class-action-weekly-wire-episode-118-washington-supreme-court-adopts-broad-definition-of-job-applicant-for-pay-transparency-class-actions/)).
- **Ripples into:** Job posting templates, ATS configuration, recruiter/staffing-agency agreements (who is liable for the posting?), compensation band policy.
- **GC action:** Add pay ranges to every posting that could be filled in covered states, audit third-party job boards and recruiters, add indemnity for posting compliance to recruiter contracts. **[INFERRED]**
- **Breadth:** Universal once over the headcount thresholds, which run as low as 5 employees in VT.

### 1d. Noncompetes and no-poach
- **Federal saga:**
  - The FTC rule (April 2024) was set aside nationwide in *Ryan LLC v. FTC* (N.D. Tex., Aug 2024).
  - On Sept 5, 2025, the FTC voted 3–1 to dismiss its appeals and accede to vacatur ([FTC press release](https://www.ftc.gov/news-events/news/press-releases/2025/09/federal-trade-commission-files-accede-vacatur-non-compete-clause-rule)).
  - The rule was formally removed in the Federal Register on Feb 12, 2026 ([Fed. Reg.](https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to)).
  - **But enforcement pivoted to case-by-case:** the Gateway Services (pet cremation, ~1,800 employees incl. hourly) consent order was finalized in Nov 2025 ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/11/ftc-approves-final-order-prohibiting-noncompete-enforcement-gateway-services)). On Sept 10, 2025, warning letters went to healthcare employers and staffing firms ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-chairman-ferguson-issues-noncompete-warning-letters-healthcare-employers-staffing-companies)).
- **State changes (2025):**
  - Wyoming voided most noncompetes (except for executives/management and sale of business) effective Jul 1, 2025.
  - Virginia extended its ban to all FLSA non-exempt employees.
  - Florida's CHOICE Act went the *other* way, creating a presumption of enforceability for high earners.
  - Texas capped physician/nurse/PA covenants at 1 year and 5 miles with a buyout ([Faegre Drinker Top 10](https://www.faegredrinker.com/en/insights/publications/2026/1/top-10-noncompete-developments-of-2025); [Duane Morris](https://www.duanemorris.com/alerts/virginia_wyoming_latest_states_tighten_restrictions_noncompete_agreements_0425.html)).
- **California AB 1076:** Required *individualized written notice* by Feb 14, 2024 to current employees, and to former employees employed after Jan 1, 2022, that their noncompete clauses are void. Failure is unfair competition, with penalties up to $2,500 per violation ([Holland & Knight](https://www.hklaw.com/en/insights/publications/2024/02/california-regulation-impacting-noncompete-agreements-requires); [bill text](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB1076)). **This is the perfect "ripple" example: a statute that required finding every affected contract and taking action per-person. [INFERRED]**
- **Case law:** In *Sunder Energy v. Jackson* (Del. Sup. Ct., Dec 10, 2024), Delaware courts may refuse to blue-pencil overbroad covenants, so a Delaware choice-of-law clause no longer "saves" an aggressive noncompete ([Jenner](https://www.jenner.com/en/news-insights/publications/delaware-supreme-court-reaffirms-reluctance-to-blue-pencil-overbroad-restrictive-covenants-in-sunder-v-jackson); [opinion](https://courts.delaware.gov/Opinions/Download.aspx?id=372810)).
- **Ripples into:** Offer letters, employment agreements, equity/incentive-unit agreements (Sunder involved incentive units), M&A purchase agreements, franchise agreements (no-poach), staffing agreements (no-hire clauses), separation agreements.
- **GC action:** Inventory restrictive covenants by employee state and role, then remove, narrow, or re-paper them. Send notices where required. Adjust governing-law strategy.
- **Breadth:** Universal. Wyoming and Virginia specifically hit hourly and non-exempt workers, the exact population of trades, restaurants, and retail.

### 1e. Independent contractor classification
- **Source:** DOL WHD regulations (29 CFR 795), Field Assistance Bulletins, state ABC tests (CA AB5).
- **Recent:**
  - May 1, 2025: FAB 2025-1 said WHD would stop enforcing the 2024 six-factor rule and use 2008 Fact Sheet #13 and Opinion Letter FLSA2019-6 instead. The 2024 rule nonetheless remained binding in private litigation ([Sullivan & Cromwell](https://www.sullcrom.com/insights/blogs/2025/May/DOL-Declines-Enforce-Biden-Era-Independent-Contractor-Rule)).
  - Feb 26–27, 2026: NPRM to rescind and replace it with a two-core-factor test (control plus opportunity for profit/loss). Comments were due Apr 28, 2026 ([DOL](https://www.dol.gov/agencies/whd/flsa/misclassification/2026rulemaking); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/03/dol-proposes-new-independent-contractor-rule-to-replace-biden-era-regulation)).
- **Ripples into:** Independent contractor agreements, subcontractor agreements (construction), 1099 vendor onboarding, insurance (workers' comp audits), gig platform terms.
- **GC action:** Re-assess classification under the *strictest* applicable test (state ABC tests are unaffected by federal loosening). Update IC agreement control/profit terms.
- **Breadth:** High for trades (sub-contractors), trucking (owner-operators), delivery, and healthcare staffing.

### 1f. California PAGA reform (2024)
- AB 2288 and SB 92, signed Jul 1, 2024, apply to notices filed on/after Jun 19, 2024. Penalties are capped at 15% if the employer took "all reasonable steps" *before* notice, and 30% if within 60 days after. "Reasonable steps" include periodic payroll audits, lawful written policies, and supervisor training ([Morgan Lewis](https://www.morganlewis.com/pubs/2024/07/californias-new-paga-bill-key-changes-and-implications-for-employers); [Haynes Boone](https://www.haynesboone.com/news/alerts/californias-paga-reform-what-employers-need-to-know)).
- **Why it matters for this product:** The reform **rewards documented proactive policy updates**. A change log showing "we updated the handbook within X days of the law change" is evidence for the 15% cap. **[INFERRED]**
- **Breadth:** Every California employer.

### 1g. Joint employer
- The NLRB 2023 rule was vacated Mar 8, 2024 (E.D. Tex.). The Board did not appeal, so the 2020 rule governs ([NLRB](https://www.nlrb.gov/news-outreach/news-story/nlrbs-joint-employer-rule-vacated-by-us-district-judge)). The formal withdrawal of the 2023 standard was published Feb 27, 2026 ([Fed. Reg.](https://www.federalregister.gov/documents/2026/02/27/2026-03955/withdrawal-of-2023-standard-for-determining-joint-employer-status)).
- **Ripples into:** Franchise agreements and operations manuals, staffing MSAs (control language), subcontractor agreements.
- **Breadth:** Franchisors/franchisees (restaurants, home services), and anyone using staffing agencies.

### 1h. Arbitration agreements and class waivers
- ***Smith v. Spizzirri* (U.S. May 16, 2024):** Courts must stay rather than dismiss when a party requests a stay ([opinion](https://www.supremecourt.gov/opinions/23pdf/22-1218_5357.pdf)).
- **EFAA (2022):** Predispute arbitration is unenforceable for sexual harassment/assault claims. Courts are split on whether it takes the *entire case* out of arbitration ([Katz Banks](https://katzbanks.com/employment-law-blog/the-ending-forced-arbitration-of-sexual-harassment-and-sexual-assault-act-helps-plaintiffs-escape-arbitration-even-for-non-sexual-harassment-assault-claims/)).
- **Mass arbitration:** The AAA amended its Mass Arbitration Supplementary Rules on Jan 15, 2024. Company fees are $8,125 per mass filing in employment ([ABA](https://www.americanbar.org/groups/labor_law/resources/magazine/2024-summer/aaa-employment-mass-arbitration-rules-update/)). JAMS adopted new mass rules ([Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2024/05/jams-adopts-new-mass-arbitration-rules-and-fee-schedules)). **Arbitration provider rule changes silently alter the economics of every arbitration clause that incorporates "AAA rules then in effect." [INFERRED]**
- ***Hohenshelt v. Superior Court* (Cal. Aug 11, 2025):** SB 707's 30-day fee-payment rule is not FAA-preempted, but waiver applies only for willful, grossly negligent, or fraudulent nonpayment ([Justia](https://law.justia.com/cases/california/supreme-court/2025/s284498.html); [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2025/08/california-supreme-court-upholds-faa)).
- **Ripples into:** Employee arbitration agreements, consumer terms of service, customer contracts, the internal process for paying arbitration invoices (a legal-ops workflow).
- **GC action:** Decide whether to keep arbitration or class waivers given mass-arb exposure. Update carve-outs (EFAA, PAGA). Set up an invoice-payment SLA.
- **Breadth:** Any company with arbitration in an employee handbook or consumer ToS. This includes restaurants, retailers, and home-services companies with online booking.

### 1i. Workplace safety (overlaps with agency rules)
- **California SB 553:** Written Workplace Violence Prevention Plan, training, and incident log required for nearly all CA employers by Jul 1, 2024. Penalties run up to $25K for serious violations and $158,727 for willful ([DLA Piper](https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2024/californias-new-workplace-violence-prevention-mandate); [Cal/OSHA](https://www.dir.ca.gov/dosh/workplace-violence.html)).
- **Heat illness:** See section 4.

---

## 2. Privacy

### 2a. US state comprehensive privacy laws
- **Source:** State statutes plus AG/agency regulations. As of 2026 there are 20 states ([MultiState](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026)). Indiana, Kentucky, and Rhode Island took effect Jan 1, 2026. Rhode Island's threshold is low: 35,000 consumers, or 10,000 if more than 20% of revenue comes from data sales ([Koley Jessen](https://www.koleyjessen.com/insights/publications/new-state-privacy-laws-effective-january-1-2026-indiana-kentucky-and-rhode-island); [IAPP](https://iapp.org/news/a/new-year-new-rules-us-state-privacy-requirements-coming-online-as-2026-begins)).
- **CCPA regulations:** OAL approved regulations on ADMT, risk assessments, and cybersecurity audits on Sept 23, 2025. They are effective Jan 1, 2026, phased through 2030. Risk assessments for existing processing are due by Dec 31, 2027, and attestations by Apr 1, 2028 ([CPPA announcement](https://cppa.ca.gov/announcements/2025/20250923.html); [White & Case](https://www.whitecase.com/insight-alert/cppa-finalizes-rules-admt-risk-assessments-and-cybersecurity-audits-requirements)). ADMT covers "significant decisions" including **employment** (hiring and promotion).
- **Enforcement examples (the ripple into contracts is explicit):**
  - **Tractor Supply, $1.35M (CPPA, Sept 30, 2025).** This was the record CPPA fine and the first to cover *job-applicant* privacy notices. The claims included **failure to "maintain adequate service provider agreements"** ([White & Case](https://www.whitecase.com/insight-alert/california-privacy-protection-agency-issues-record-135-million-fine-against-tractor); [Venable](https://www.venable.com/insights/publications/2025/10/privacy-opt-outs-remain-in-the-crosshairs-tractor)). A farm-and-ranch retailer is exactly the "non-tech GC" customer.
  - **Healthline, $1.55M (CA AG, Jul 2025).** Pixels and cookies sharing health-related data, and "weak contractual safeguards" ([Buchalter](https://www.buchalter.com/insights/cppa-expands-enforcement-with-record-1-35-million-fine-against-tractor-supply/)).
  - **Texas AG v. Allstate/Arity (Jan 13, 2025).** The first-ever lawsuit under a state comprehensive privacy law (the TDPSA), also invoking the Data Broker Act. It followed a 30-day cure notice ([Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/texas-ag-sues-allstate-for-violations-of-texas-privacy-law-in-first-enforcement-action-under-a-state-comprehensive-data-privacy-law); [WilmerHale](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250121-texas-ag-brings-first-ever-lawsuit-under-a-state-comprehensive-privacy-law)).
- **Ripples into:** Website privacy policy, cookie banner/GPC handling, **vendor DPAs and service-provider agreements (statutorily required terms)**, job-applicant/employee privacy notice, marketing SDK contracts, data-sharing agreements, and the vendor risk questionnaire.
- **GC action:** Applicability analysis per new state, based on consumer counts by state from the company profile. Update the privacy notice. Re-paper vendor contracts with required terms. Start risk assessments and ADMT notices.
- **Breadth:** Applicability is threshold-based (e.g., 100K consumers, or 35K in RI). A plumbing company usually won't meet consumer thresholds except in CA, where the $25M+ revenue prong applies **and** CCPA covers employee and applicant data. A mid-size CA contractor with more than $25M revenue is covered. **[INFERRED from CCPA structure]**

### 2b. Biometrics (Illinois BIPA)
- SB 2979 (signed Aug 2, 2024) changed damages to **per-person, not per-scan**. It responded to *Cothron v. White Castle*, which had allowed per-scan damages of $1,000/$5,000 ([Shook Hardy](https://www.shb.com/intelligence/client-alerts/pds/may-2024-bipa-amendment-wolfe-searle)). The 7th Circuit held that the amendment applies retroactively ([ABA 2026](https://www.americanbar.org/groups/business_law/resources/business-law-today/2026-may/7th-circuit-holds-bipa-damages-remedy-applies-retroactively/)). Litigation continues: 107+ new BIPA suits in 2025, and Clearview AI settled for $51.75M ([source aggregator, Lyon Firm](https://thelyonfirm.com/class-action/data-privacy/bipa/), treat as secondary).
- **Ripples into:** Timekeeping vendor contracts (finger/face clocks are ubiquitous in restaurants, warehouses, and trades), employee consent forms, retention policy, indemnities from timeclock vendors.
- **Breadth:** Very high for hourly workforces with biometric timeclocks in IL (restaurants, retail, logistics, and manufacturing). White Castle is a burger chain.

### 2c. Health data (WA My Health My Data Act)
- The first class action was *Maxwell v. Amazon* (W.D. Wash., filed Feb 10, 2025), which alleged SDK harvesting of location data indicating health-service seeking. It has a private right of action through the WA CPA with treble damages ([Orrick](https://www.orrick.com/en/Insights/2025/02/First-Lawsuit-Filed-Under-Washingtons-My-Health-My-Data-Act); [WilmerHale](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250220-first-lawsuit-filed-under-washingtons-my-health-my-data-act)).
- **Ripples into:** Ad-tech/SDK vendor contracts, website pixel usage, consumer health data privacy policy (a separate policy is required).
- **Breadth:** Broad, because "consumer health data" is defined expansively. Gyms, pharmacies, retailers selling health products, and clinics are all implicated. **[INFERRED]**

### 2d. Children's privacy (COPPA)
- Amended rule published Apr 22, 2025, effective Jun 23, 2025, **compliance by Apr 22, 2026**. It added biometric identifiers, requires separate parental consent for non-integral third-party disclosures, and mandates a written security program and retention policy. Penalties run up to $53,088 per violation ([Fed. Reg.](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule); [Davis Polk](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)).
- **Breadth:** Narrower. It applies to child-directed services or actual knowledge of children's data (e.g., edtech, toys, games, family restaurants with kids' loyalty programs).

### 2e. Telemarketing and texting (TCPA)
- The 11th Circuit vacated the FCC 1:1 consent rule on Jan 24, 2025 ([Wiley](https://www.wiley.law/alert-UPDATE-11th-Circuit-Vacates-FCCs-One-to-One-TCPA-Consent-Rule)). The revocation-of-consent rule took effect Apr 11, 2025, with 10 business days to honor opt-outs "by any reasonable method." The "revoke-all" portion is delayed to Jan 31, 2027 ([Consumer Fin. Services Law Monitor](https://www.consumerfinancialserviceslawmonitor.com/2026/01/fcc-further-extends-effective-date-for-tcpa-revoke-all-rule/)).
- ***McLaughlin Chiropractic v. McKesson* (U.S. Jun 20, 2025):** District courts are not bound by FCC interpretations ([opinion](https://www.supremecourt.gov/opinions/24pdf/23-1226_1a72.pdf)), so decades of FCC orders can be re-litigated.
- **Ripples into:** SMS marketing vendor contracts, lead-gen agreements, consent language on web forms, internal opt-out SLAs.
- **Breadth:** Very high. Home services (plumbers, HVAC) rely heavily on SMS appointment reminders and marketing texts. **[INFERRED]**

---

## 3. Case law shifting contract enforceability and the agency-deference regime

- ***Loper Bright v. Raimondo* (2024)** overturned Chevron. Effects seen above:
  - The DOL overtime rule was vacated (Nov 2024).
  - The FTC noncompete rule was set aside.
  - The FCC 1:1 consent rule was vacated on statutory-authority grounds.
  - The CFPB moved to vacate its own 1033 rule ([Cooley](https://www.cooley.com/news/insight/2025/2025-06-05-cfpb-moves-to-vacate-its-own-open-banking-rule-citing-legal-deficiencies-and-overreach)).
  - *McLaughlin* (2025) extended the logic to Hobbs Act orders.
  - **Practical meaning [INFERRED]:** Any compliance program built on agency guidance is now less stable. Monitoring *court dockets challenging rules* matters as much as monitoring the Federal Register.
- **Arbitration:** *Spizzirri*, *Hohenshelt*, EFAA splits, and mass-arb fee rules (see 1h).
- **Restrictive covenants:** *Sunder Energy* and *Kodiak* in Delaware (see 1d).
- **AI vendor liability:** In *Mobley v. Workday* (N.D. Cal.), the court let claims proceed on the theory that an AI screening vendor is an **agent** of employers, and so an "employer" under Title VII, ADEA, and ADA. It granted preliminary ADEA collective certification on May 16, 2025 ([Seyfarth](https://www.seyfarth.com/news-insights/mobley-v-workday-court-holds-ai-service-providers-could-be-directly-liable-for-employment-discrimination-under-agent-theory.html); [Labor & Employment Insights](https://www.laborandemploymentlawinsights.com/2025/07/california-court-grants-preliminary-collective-certification-to-job-applicants-claiming-age-discrimination-by-artificial-intelligence/)). Commentators flag the mismatch between SaaS liability caps set at subscription fees and discrimination exposure ([Mondaq](https://www.mondaq.com/unitedstates/contracts-and-commercial-law/1836646/ai-vendor-liability-after-mobley-v-workday-when-risk-doesnt-follow-control)). **This is a textbook ripple: a court ruling that changes how you should read the LoL/indemnity clause in your HR-tech vendor contract. [INFERRED]**
- **Force majeure and tariffs:** Courts generally require impossibility, not unprofitability. Foreseeability at signing matters ([Morgan Lewis Aug 2025](https://www.morganlewis.com/pubs/2025/08/tariff-related-commercial-litigation-what-businesses-need-to-know-about-force-majeure-clauses-and-common-law-defenses); [K&L Gates](https://www.klgates.com/Impact-of-Tariffs-on-Commercial-Contractual-Performance-Can-Tariffs-Be-a-Force-Majeure-Event-4-28-2025)).

---

## 4. Agency rules and guidance

| Agency / rule | Status (sourced) | Internal docs affected | Breadth |
|---|---|---|---|
| **OSHA heat illness** (NPRM Aug 30, 2024) | Hearing Jun 16–Jul 2, 2025; post-hearing comments closed Oct 30, 2025; **not final** ([OSHA](https://www.osha.gov/heat-exposure/rulemaking/); [B&D](https://www.bdlaw.com/publications/osha-refines-heat-enforcement-strategy-while-federal-heat-rule-remains-pending/)). States filled the gap: MD (Sept 2024, heat index 80°F/90°F triggers) ([MOSH](https://labor.maryland.gov/labor/mosh/moshheatstress.shtml)), NV (Apr 2025, written JHA for 10+ employees) ([OSHA Defense Report](https://oshadefensereport.com/2025/03/24/nevada-osha-adopts-new-heat-illness-prevention-regulation-what-employers-need-to-know/)), CA indoor (82°F) and outdoor (80°F). | Written heat illness prevention plan, safety manual, training records, subcontractor safety clauses, GC/owner contract safety exhibits | **Very high**: construction, plumbing/HVAC, landscaping, warehouses, restaurants (kitchens) |
| **OSHA penalties** | Inflation-adjusted every January; max willful/repeat $165,514 and serious $16,550 in 2025 ([OSHA](https://www.osha.gov/news/newsreleases/osha-trade-release/20250114)); 2026 adjustment memo ([OSHA](https://www.osha.gov/memos/2026-05-21/2026-annual-adjustments-osha-civil-penalties)) | Risk register, insurance limits | Universal |
| **FTC click-to-cancel** | **Vacated** by 8th Cir. Jul 8, 2025, days before compliance ([Sidley](https://www.sidley.com/en/insights/newsupdates/2025/07/us-ftc-click-to-cancel-rule-struck-down)); FTC removal notice Feb 12, 2026 ([Fed. Reg.](https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to)). **But** CA ARL amendments (AB 2863) took effect Jul 1, 2025: express consent records kept 3 years, annual reminders, click-to-quit, free-to-paid conversions covered ([Cooley](https://www.cooley.com/news/insight/2025/2025-06-04-california-automatic-renewal-law-amendments-take-effect-on-july-1-2025)); ROSCA still applies | Subscription ToS, checkout flow, cancellation flow, maintenance-plan contracts | High: SaaS, gyms, **home-services maintenance plans** (HVAC/plumbing "club" memberships), meal kits |
| **FTC junk fees rule** | Effective May 12, 2025; narrowed to live-event tickets and short-term lodging ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/05/ftc-rule-unfair-or-deceptive-fees-take-effect-may-12-2025)). State laws are broader: CA SB 478 covers restaurants etc. ([GT](https://www.gtlaw.com/en/insights/2025/5/ftc-issues-faqs-on-junk-fees-rule)) | Pricing pages, menus, service-fee disclosures, franchise pricing policy | Hotels, venues; restaurants (via CA SB 478); **trip/service fees for home services [INFERRED]** |
| **FTC fake reviews rule** (16 CFR 465) | Effective Oct 21, 2024; civil penalties for first-time violations (~$51,744–$53,088 per violation); warning letters with 5-day response demands ([FTC Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers); [Benesch](https://www.beneschlaw.com/insight/five-stars-zero-tolerance-ftc-turns-up-enforcement-under-consumer-review-rule/)) | Marketing agency contracts, review-incentive programs, employee social media policy, influencer agreements | **Universal for local businesses** living on Google/Yelp reviews |
| **FTC noncompete enforcement** | See 1d | Employment agreements | Universal |
| **CFPB** | Withdrew 67 guidance documents May 12, 2025 ([Fed. Reg.](https://www.federalregister.gov/documents/2025/05/12/2025-08286/interpretive-rules-policy-statements-and-advisory-opinions-withdrawal)); medical debt rule vacated; 1033 open banking rule enjoined Oct 29, 2025 ([ABA Banking Journal](https://bankingjournal.aba.com/2025/10/court-temporarily-halts-section-1033-rule-enforcement/)); **state AGs stepping in** ([Morgan Lewis](https://www.morganlewis.com/pubs/2025/05/state-attorneys-general-step-up-consumer-financial-services-enforcement)) | Consumer financing agreements, collection practices, BNPL partner contracts | Any business offering financing (**home services offer financing**, auto dealers, medical/dental) |
| **SEC cyber disclosure** (8-K Item 1.05, 4 business days after materiality determination) | Rules remain; SolarWinds case dismissed with prejudice Nov 20, 2025 ([Perkins Coie](https://perkinscoie.com/insights/update/sec-dismisses-cyber-disclosure-case-against-solarwinds-and-ciso); [Harvard Forum](https://corpgov.law.harvard.edu/2025/12/07/solarwinds-dismissed-what-the-secs-u-turn-signals-for-cyber-enforcement/)) | Incident response plan, disclosure controls, vendor breach-notice clauses (timing must feed the 4-day clock) | Public companies only |
| **FMCSA** | English-language proficiency out-of-service enforcement restored Jun 25, 2025; non-domiciled CDL interim final rule **stayed** by D.C. Cir. Nov 13, 2025 ([FMCSA](https://www.fmcsa.dot.gov/newsroom/trumps-transportation-secretary-sean-p-duffy-takes-emergency-action-protect-americas-roads); [Jackson Lewis](https://www.jacksonlewis.com/insights/fmcsa-new-rule-cracks-down-non-citizen-commercial-drivers-licenses-creating-carrier-burdens)) | Driver qualification files, broker-carrier agreements, shipper contracts (carrier-selection negligence), hiring policy | Trucking, **and any shipper/broker**, plus companies with CDL fleets (e.g., plumbing supply) |
| **FinCEN CTA / BOI** | Whiplash: injunctions late 2024; 5th Cir. reinstated Dec 23, 2024; interim final rule Mar 26, 2025 exempted all U.S. entities ([Fed. Reg.](https://www.federalregister.gov/documents/2025/03/26/2025-05199/beneficial-ownership-information-reporting-requirement-revision-and-deadline-extension); [DWT](https://www.dwt.com/insights/2025/03/corporate-transparency-act-stay-5th-circuit)). State analogs may still apply ([Procopio](https://www.procopio.com/resource/latest-cta-update)) | Entity management, operating agreements, loan covenants | Universal for small businesses; a canonical "is it still live?" example |

---

## 5. Sanctions and export controls

- **Sources:** OFAC SDN List (updated multiple times per week), BIS Entity List (Federal Register rules), Consolidated Screening List.
- **Recent:**
  - **BIS Affiliates Rule** (IFR Sept 29, 2025): extends Entity List and MEU restrictions to entities 50%+ owned by listed parties, mirroring OFAC's 50% rule ([Fed. Reg.](https://www.federalregister.gov/documents/2025/09/30/2025-19001/expansion-of-end-user-controls-to-cover-affiliates-of-certain-listed-entities); [Ropes & Gray](https://www.ropesgray.com/en/insights/alerts/2025/09/us-export-controls-bis-adopts-ofac-style-50-percent-affiliates-rule)). It was **stayed from Nov 10, 2025 until Nov 9, 2026** (per [White & Case](https://www.whitecase.com/insight-alert/bis-implements-affiliates-rule-50-rule-applicable-entity-list-and-military-end-user)), so it could snap back ~6 weeks from today. **[VERIFY stay details]**
  - **GVA Capital, ~$216M OFAC penalty (Jun 2025):** statutory maximum. The firm had a legal opinion that an entity was not 50%-owned by an SDN; OFAC found the entity blocked via a trust beneficial interest ([Paul Weiss](https://www.paulweiss.com/insights/client-memos/ofac-imposes-216-million-penalty-on-silicon-valley-venture-capital-firm-for-russian-sanctions-violations)). **Ripple lesson: counterparty status can change through ownership changes, not just listings. [INFERRED]**
- **Ripples into:** Customer/distributor agreements (sanctions reps, termination rights), supplier agreements, KYC files, M&A diligence, the export classification matrix.
- **GC action:** Re-screen the counterparty master list on every list update. Trigger termination/suspension clauses. File blocked-property reports.
- **Breadth:** Manufacturers, distributors, exporters, and anyone with foreign suppliers. Low for a purely domestic plumber, **but their suppliers' supply chains may be affected**. **[INFERRED]**

---

## 6. Tariffs and trade (the strongest 2025–2026 cross-industry ripple story)

- **Sources:** Presidential proclamations and EOs (whitehouse.gov), Federal Register, the CBP CSMS messages, HTSUS, and CIT/Federal Circuit/SCOTUS dockets.
- **Timeline:**
  - 2025: IEEPA "reciprocal" and fentanyl tariffs, plus Section 232 expansions. Copper was set at 50% on the copper content of semi-finished copper (pipes, tubes, wire) and intensive derivatives (pipe fittings, connectors) from Aug 1, 2025 ([White House](https://www.whitehouse.gov/presidential-actions/2025/07/adjusting-imports-of-copper-into-the-united-states/); [White & Case](https://www.whitecase.com/insight-alert/president-trump-orders-50-percent-section-232-tariff-copper-imports)). It later moved to 50% of *full value* for semi-finished products from Apr 6, 2026 (search summary; **[VERIFY]** against the CRS report at [congress.gov IN12614](https://www.congress.gov/crs-product/IN12614)).
  - **Feb 20, 2026: *Learning Resources v. Trump*.** A 6–3 decision holding that IEEPA does not authorize tariffs ([opinion](https://www.supremecourt.gov/opinions/25pdf/24-1287_4gcj.pdf); [CRS](https://www.congress.gov/crs-product/LSB11398)). $166B+ was collected, and the refund process was left unclear ([A&O Shearman](https://www.aoshearman.com/en/insights/scotus-rejects-ieepa-tariffs-refund-opportunities-and-uncertainty-emerge)).
  - Feb 24, 2026: A Section 122 replacement surcharge (up to 15%, max 150 days, expiring ~Jul 24, 2026) ([Snell & Wilmer](https://www.swlaw.com/publication/tariffs-redux-what-importers-should-know-about-ieepa-refunds-and-section-122/)). The CIT then **rejected** the 10% Section 122 tariff, with an appeal pending ([Ward and Smith](https://www.wardandsmith.com/article/court-of-international-trade-rejects-10-section-122-tariff-what-businesses-should-know-while-the-appeal-proceeds)).
  - **More than 100 consumer class actions** now seek pass-through of refunds, against Costco, FedEx, IKEA, and others. They allege unjust enrichment and breach of contract, even without an itemized surcharge ([Foley](https://www.foley.com/insights/publications/2026/07/after-learning-resources-defending-against-the-wave-of-consumer-class-actions-seeking-tariff-refunds/); [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/06/tariff-consumer-class-actions)). B2B disputes over who gets the refund are also emerging ([vcfo](https://vcfo.com/insights/tariff-whiplash-2026-manufacturer-cfo-playbook/)).
- **Ripples into:**
  - Supply agreements: tariff-adjustment, change-in-law, price-reopener, force majeure, and MFN clauses.
  - Customer contracts and invoices: surcharge language.
  - Fixed-price construction bids with no material-escalation clause. This matters for plumbing because copper is a direct input.
  - Consumer-facing surcharge disclosures.
  - Distributor agreements.
- **GC action:**
  1. Inventory which contracts allocate tariff cost, and to whom.
  2. Decide whether to file for refunds (via the CIT) and how refunds flow contractually.
  3. Assess class action exposure from pass-through.
  4. Add escalation clauses on renewal.
  (Summarized from [Snell & Wilmer](https://www.swlaw.com/publication/tariffs-redux-what-importers-should-know-about-ieepa-refunds-and-section-122/) and [Skadden](https://www.skadden.com/insights/publications/2025/06/insights-june-2025/navigating-the-impact-of-the-trump-tariffs).)
- **Breadth:** Nearly universal. Importers are directly affected. Downstream buyers (a plumber buying copper fittings, a restaurant buying imported equipment) are affected via supplier price-increase notices and their own fixed-price customer contracts. **[INFERRED]**
- **Why it's a great demo scenario [INFERRED]:** A single court decision flips the interpretation of dozens of clause types across supplier *and* customer contracts at once, with money flowing in opposite directions. "Does the Learning Resources decision change our position under our supply agreement with X and our customer surcharge terms?" is exactly the cross-document reasoning the interviewer described.

---

## 7. Licensing, permits, and insurance mandates

- **CA contractor licensing (CSLB):**
  - AB 2622 raised the minor-work (no license) threshold from $500 to $1,000 in 2025 ([ADHI](https://www.adhischools.com/blog/ab-2622-unlicensed-contractors)).
  - **SB 216** would require workers' comp for *all* licensed contractors regardless of employees, originally from Jan 1, 2026. Phase 1 in 2023 covered C-8, C-20 (HVAC), C-22, and D-49. **SB 1455 delayed the full mandate to Jan 1, 2028** ([State Fund](https://www.statefundca.com/state-fund-today/what-you-need-to-know-about-sb-216/); [CCIS Bonds](https://www.ccisbonds.com/blog/do-californias-new-bills-require-workers-comp-coverage-for-contractors-understanding-2026-requirement-changes/)). **[VERIFY]** Some secondary sources state the mandate is already in force. That conflict is itself a case for a verified change log.
  - Unlicensed-contractor **disgorgement** (B&P Code §7031) requires return of ALL compensation ([Levelset](https://www.levelset.com/news/california-disgorgement-claim-limited-one-year/)). The license status of *your subcontractors* is therefore existential for a GC or prime contractor. **[INFERRED]**
- **Construction anti-indemnity statutes:** State statutes void indemnities and additional-insured requirements for the indemnitee's sole or own negligence. Oregon amended its statute effective Jan 1, 2025 (public-body design professional contracts). D.C. enacted a new statute voiding both sole-negligence indemnity and AI endorsements. PA HB 1887 is pending ([SDV survey](https://www.sdvlaw.com/surveys/construction-anti-indemnity-statutes/); [TTH Law](https://www.tthlaw.com/client-advisory-d-c-enacts-anti-indemnity-statute-prohibiting-indemnity-and-additional-insured-provisions-in-construction-contracts-that-require-a-subcontractor-to-indemnify-a-contractor-for-the-co/)).
- **Ripples into:** Subcontract templates (indemnity and insurance exhibits), COI tracking, insurance program (limits, AI endorsements), license-verification process for subs, bid templates.
- **Breadth:** Construction and trades specifically. This is **the strongest "plumbing company" category**.

---

## 8. AI regulation

- **EU AI Act:**
  - GPAI obligations have run since Aug 2025.
  - Art. 50 transparency applies from Aug 2, 2026.
  - The Digital Omnibus (Reg. (EU) 2026/1744, in force Jul 27, 2026) **deferred** Annex III high-risk obligations to **Dec 2, 2027** and Annex I obligations to **Aug 2, 2028** ([Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/); [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/eu-ai-act-unpacked-34-the-final-digital-omnibus-on-ai-key-amendments-to-the-a-102nber)). Employment/HR AI is in Annex III.
- **Colorado AI Act (SB 24-205):**
  - Delayed from Feb 1 to Jun 30, 2026 by SB 25B-004 ([Colorado GA](https://leg.colorado.gov/bills/sb25b-004)).
  - A federal court paused enforcement on Apr 27, 2026.
  - **SB 189 (signed May 14, 2026)** replaced it with a narrower disclosure regime effective Jan 1, 2027. It eliminated the duty of care, impact assessments, and risk programs ([McDermott](https://www.mcdermottlaw.com/insights/colorado-ai-law-in-flux-comprehensive-replacement-bill-signed-after-federal-court-blocks-predecessors-enforcement/); [Troutman](https://www.troutmanprivacy.com/2026/04/colorado-attorney-general-delays-enforcement-of-colorado-ai-act/)). **Anyone who built a Colorado impact-assessment program in 2025 now has partially obsolete work. [INFERRED]**
- **NYC Local Law 144 (AEDT bias audits):** A Dec 2, 2025 NY State Comptroller audit found DCWP enforcement "ineffective." The city found 1 noncompliance issue in 32 companies, while auditors found 17+. DCWP agreed to strengthen enforcement ([OSC](https://www.osc.ny.gov/state-agencies/audits/2025/12/02/enforcement-local-law-144-automated-employment-decision-tools); [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2026/01/critical-audit-of-nyc-ai-hiring-law-signals-increased-risk-for-employers)).
- **California Civil Rights Council ADS regulations** (effective Oct 1, 2025; employers with 5+ employees): ADS discrimination can violate FEHA, and ADS data must be retained 4 years ([Paul Hastings](https://www.paulhastings.com/insights/client-alerts/new-california-regulations-on-employers-use-of-ai-to-make-decisions-go-into-effect-oct-1-2025)).
- **Illinois HB 3773** (effective Jan 1, 2026): Notice is required for AI in employment decisions, and zip code cannot be used as a proxy ([NatLawReview](https://natlawreview.com/article/illinois-anti-discrimination-law-address-ai-goes-effect-1-january-2026)).
- **Texas TRAIGA** (effective Jan 1, 2026) and **CA SB 53** (frontier developers, Jan 1, 2026) ([Norton Rose](https://www.nortonrosefulbright.com/en/knowledge/publications/c6c60e0c/the-texas-responsible-ai-governance-act)).
- **Federal preemption push:** EO 14365 (Dec 11, 2025) created a DOJ AI Litigation Task Force to challenge state AI laws. Its legal effect on its own is doubtful ([White House](https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/); [Skadden](https://www.skadden.com/insights/publications/2025/12/white-house-launches-national-framework)).
- **Ripples into:** HR-tech vendor contracts (bias-audit cooperation, data retention, indemnity, LoL; cf. *Mobley*), the AI acceptable use policy, candidate notices, the handbook, the privacy notice (CCPA ADMT).
- **Breadth:** Any employer using ATS screening (Workday, iCIMS, Indeed screening). Mid-size trades companies using Indeed or ServiceTitan hiring features could be touched through CA regs and IL HB 3773. **[INFERRED]**

---

## 9. Tax nexus (brief)
- 17 states have eliminated the 200-transaction economic nexus threshold as of Aug 2026, including Alaska (Jan 1, 2025), Utah (Jul 1, 2025), and Illinois (Jan 1, 2026) ([Avalara](https://www.avalara.com/blog/en/north-america/2025/06/states-eliminating-economic-nexus-transaction-thresholds.html)). There were 408 rate changes in H1 2025, up 24% year over year ([CPA Practice Advisor/Vertex](https://www.cpapracticeadvisor.com/2025/07/28/vertex-report-u-s-sees-continued-acceleration-in-sales-tax-rates-and-rules-changes/165697/)).
- **Ripples into:** Tax clauses in customer contracts (who bears tax), marketplace agreements, registration obligations. This is usually owned by finance and tax, not legal, **so it is a poor primary use case**. It is handled by Avalara/Vertex. **[INFERRED]**

---

## 10. How in-house teams handle regulatory change today

### Tools
- **Thomson Reuters Regulatory Intelligence:** Horizon scanning; 2,500 regulatory and legislative materials, 1,300+ regulatory bodies. Heavily financial-services focused ([TR UK](https://legalsolutions.thomsonreuters.co.uk/en/products-services/regulatory-intelligence.html/)).
- **Compliance.ai**, acquired by **Archer** (GRC) on Feb 20, 2024: "automatically maps regulatory changes to internal policies, procedures, and controls" ([Archer](https://www.archerirm.com/press-releases/archer-acquires-compliance-ai-to-drive-ai-powered-regulatory-compliance-and-risk-management)). It maps to *controls and policies*, not contracts, and is FS-oriented.
- **Ascent RegTech**, now part of Resolver: obligations-based. It extracts every obligation from a rulebook as an object, maps obligations to the business profile, and shows side-by-side old and new rule diffs ([Ascent](https://www.ascentregtech.com/our-difference/ascentai/); [Resolver](https://www.resolver.com/ascent/)). This is the closest conceptual analog to "monitored source plus change log." It is FS-only.
- **Norm Ai:** "Regulatory AI Agents" that turn regulations into agents evaluating whether content or actions comply. $48M round in Mar 2025 led by Coatue ([SiliconANGLE](https://siliconangle.com/2025/03/11/ai-agent-powered-compliance-automation-startup-norm-ai-raises-48m/)), plus a $50M Blackstone investment in Nov 2025. Its customers are asset managers and financial institutions.
- **Lexology PRO / Scanner:** 1,500+ regulatory sources with AI summaries of "key changes and implications" ([Lexology PRO](https://www.lexology.com/pro)). **JD Supra**, Mondaq, and law-firm client alerts are free, generic, and not tied to the company.
- **Repapering / CLM tools** (Sirion, Bryter, PwC NewLaw, LIBOR tooling): mass contract remediation *after* someone decides a change matters. One LIBOR project reviewed 50,000+ contracts ([Sirion](https://www.sirion.ai/library/contract-insights/align-contracts-new-regulatory-requirements/); [Bryter](https://bryter.com/applications/repapering/)).

### Pain points (sourced)
- **Alert overload:** "Most clients tell us that they get too many of these alerts, they don't read them, and when they do read them, they don't find them helpful" ([Bloomberg Law](https://news.bloomberglaw.com/us-law-week/insight-why-your-client-alerts-fail-three-ways-to-fix-them)). Financial firms handle ~220 regulatory alerts per day ([DiliTrust](https://www.dilitrust.com/regulatory-change-management/), secondary). Thomson Reuters counted ~200 regulatory changes daily worldwide as early as 2015–16 ([Compliance & Risks](https://www.complianceandrisks.com/blog/24-stats-every-chief-compliance-officer-should-know-in-2024/)).
- **Fragmentation:** "Legal still runs on email threads, shared drives, and disconnected tools" ([DiliTrust](https://www.dilitrust.com/regulatory-change-management/)).
- **What CLOs worry about:** In the 2025 ACC CLO Survey (772 CLOs), 70%+ named industry-specific enforcement their top regulatory concern, followed by labor/employment (37%) and third-party risk (35%) ([ACC](https://www.acc.com/about/newsroom/news/risk-compliance-data-privacy-and-regulatory-changes-named-top-concerns-global)).

### The gap **[INFERRED, the core thesis]**
| Step | Who does it today | Tooling |
|---|---|---|
| 1. Detect that a source changed | Alerts, law-firm memos, RegTech feeds | Well served (TR, Lexology, JD Supra, Compliance.ai) |
| 2. Decide whether it applies to *us* (industry, states, headcount, revenue, data volumes) | GC reads it manually | Partially served (Ascent/Compliance.ai do profile mapping, **FS only**) |
| 3. **Find which of *our* documents it touches** (which contracts, which clauses, which handbook section, which vendor DPA) | GC, from memory or by searching the CLM for keywords | **Poorly served**; CLMs don't know about the law change, and RegTech doesn't read contracts |
| 4. Reason about the effect on exposure ("does this change our position under clause 12.3?") | GC or outside counsel ($$$) | **Unserved** |
| 5. Act (redline, notice, policy update, re-screen) and document it (PAGA "reasonable steps") | GC plus business | CLM and repapering tools, once scoped |

The FS-focused RegTech vendors (Ascent, Compliance.ai, Norm) prove the "obligations inventory plus diff" pattern. **No one serves the generalist GC at a 200–2,000-person company in plumbing, retail, restaurants, trucking, or clinics across employment, privacy, trade, and contracts at once.** GC AI's customer base matches that population.

---

## 11. Category ranking for the take-home use case **[INFERRED]**

| Category | Change freq | Clear ripple to internal docs | Industry breadth | Demo-ability with public sources | Score |
|---|---|---|---|---|---|
| Employment (wage, noncompete, pay transparency, sick leave) | High (annual waves + ad hoc) | Handbook, offer letters, employment agreements | Universal | High (statute text, state DOL pages) | ★★★★★ |
| Tariffs / trade | Very high in 2025–26 | Supply agreements, customer surcharge terms, fixed-price bids | Very high | High (Fed. Reg., SCOTUS opinion, CRS) | ★★★★★ |
| Privacy (state laws, CCPA regs) | High | Privacy policy, vendor DPAs, applicant notices | Threshold-dependent | High | ★★★★ |
| Case law on contract enforceability | Medium, unpredictable | Arbitration clauses, restrictive covenants, LoL/indemnity | Universal | Medium (opinions are long; good LLM task) | ★★★★ |
| AI regulation | High but with delays/reversals | HR-tech vendor contracts, AI policy | Growing | High | ★★★ |
| Agency consumer protection (FTC/state UDAP) | Medium | ToS, subscription flows, marketing contracts | High for B2C | High | ★★★ |
| Licensing / insurance / anti-indemnity | Low–medium | Subcontracts, COIs | Construction and trades | Medium | ★★★ (great for a "plumbing" persona) |
| Sanctions lists | Very high (list-level) | Counterparty list, termination clauses | Narrower | High but more screening than reasoning | ★★ |
| Tax nexus | High | Tax clauses | Owned by finance | Low | ★ |

**Suggested demo persona [INFERRED]:** A multi-state (CA, WA, IL, TX) home-services or plumbing company with ~400 employees. Monitored sources:
- CA/WA/IL labor statute pages
- the Federal Register (DOL, FTC, OSHA)
- the SCOTUS/CIT tariff docket
- CSLB news
- the CPPA regulations page

Internal docs:
- employee handbook
- offer letter / noncompete template
- a supplier agreement with a copper price clause
- a customer maintenance-plan auto-renew ToS
- an HR-tech vendor contract (LoL/indemnity)
- a subcontract with indemnity and AI endorsement requirements

Every one of those docs had at least one real public-law change hit it between 2024 and 2026 (sources above).
