# Research 3: The User — In-House GC User Stories for a Long-Running Legal Agent

Prepared 2026-09-23 for the GC AI take-home. Angle: what a solo or small-team GC at a mid-market company actually does, what's tedious and spans many documents, and where a long-running agent (not a chat answer) saves time, money, or risk.

Anything marked **[INFERRED]** is my own synthesis or estimate, not a sourced fact. Where a story gives a time or dollar figure without a citation, it is an [INFERRED] estimate. I built those estimates from the rate and time data in Section 1.

**Research limits (read first):**
- Reddit (r/Lawyertalk, r/legaltech, r/Inhouselawyers) can't be reached with my tools; the API rejects the domain. I used GC-voice proxies instead: Sterling Miller (Ten Things / Legal Department Podcast), Today's General Counsel, Above the Law, GC AI's own blog, and ACC/FTI/TR interview-based reports.
- My tools couldn't parse the ACC 2026 CLO Survey key-findings PDF. Numbers below come from the 2025 ACC survey press release plus the 2026 demographics page.
- I hit the web-search budget before I could re-check the **Colorado AI Act's status after the 2026 legislative session**. What I confirmed: SB25B-004 delayed it to June 30, 2026. Check whether it was amended again before using it.

---

## 1. What in-house counsel actually spend time and money on

### Headcount and structure (who the user is)
- **ACC 2026 CLO Survey** (1,049 CLOs, 43 countries): **9% of legal departments have 1 person and 31% have 2–5**, so ~40% are the small-team GC AI target. 59% of companies are private. Manufacturing is the biggest industry at 18%, then finance 10%, healthcare 8%, professional services 8%, information 7%. https://www.ftitechnology.com/spotlight/2026-acc-clo-survey
- **ACC 2026 Law Department Management Benchmarking** (576 departments): total legal spend fell to a six-year low of **0.43% of revenue**. The median is **3 lawyers per $1B revenue**, and each lawyer supports a median **367 employees**, a figure that keeps rising. https://finance.yahoo.com/small-business/articles/total-legal-spend-company-revenue-153300622.html
- Smaller companies spend more relative to their size. US companies **under $250M revenue average ~2.03% of revenue on legal**, and companies under $3B split spend roughly 62% internal / 38% external (ACC benchmarking via search summary). https://www.mlaglobal.com/en/insights/research/2024-acc-law-department-management-benchmarking-report
- **ACC 2025 CLO Survey** (772 CLOs): **70% oversee functions beyond legal** (risk, compliance, privacy, ethics), 58% are heavily involved in M&A, and understaffing is the #1 barrier. https://www.globenewswire.com/news-release/2025/01/28/3016565/25851/en/Risk-Compliance-Data-Privacy-and-Regulatory-Changes-Named-Top-Concerns-for-Global-Chief-Legal-Officers.html
- Solo GCs "may spend much of their time in roles that are not strictly legal, such as employment/HR, insurance, compliance and risk." https://todaysgeneralcounsel.com/life-solo-house-lawyer/

### Where the work is
- **Contracts:** 43% of in-house respondents say contract tasks are at least half of their daily work. 62% say drafting, editing, and negotiating is at least half of their contract work. Nearly half spend 3+ hours reviewing a single contract (ALM/Bloomberg Law survey). https://pro.bloomberglaw.com/insights/company-news/3-out-of-4-in-house-counsel-dissatisfied-with-existing-contract-workflow-technology-per-alm-bloomberg-law-survey/
- **Regulatory:** CLOC 2026 finds regulatory compliance (63%) and cybersecurity (58%) are the top drivers of rising workload. https://cloc.org/newsdesk/cloc-releases-2026-state-of-the-industry-report-rising-legal-demand-outpaces-budget-and-staffing-growth-forcing-operational-shift/
- ACC 2025: **70%+ cite industry-specific enforcement** as their biggest regulatory concern, 37% labor and employment, 35% third-party risk management. **43% say global regulatory change is driving more outside counsel use.** (GlobeNewswire link above)
- Gartner: **52% of legal and compliance leaders prioritize better regulatory tracking and intelligence**, and 54% of lawyers report exhaustion. https://www.gartner.com/en/articles/2025-trends-general-counsel
- Litigation (ACC 2025): 44% saw litigation volume rise, 42% saw more internal investigations, and 60% saw litigation costs grow.

### Demand vs. resources
- CLOC 2025: **83% expect demand to rise**. The top responses are putting more work on existing staff (39%), more technology (36%), process redesign (36%), automation (34%), and more outside counsel (33%). The highest hourly rate requested was **$2,850/hr, up 30% year over year**. https://abovethelaw.com/2025/05/interpreting-the-2025-cloc-in-house-survey-results/
- CLOC 2026: demand keeps rising while fewer departments expect spending growth. 37% expect outside counsel spend to rise (down from 58%) and 32% expect attorney headcount growth. (CLOC link above)
- TR State of the Corporate Law Department 2026: **about half of GCs say staffing and resources are their top barrier**. 86% of GCs think legal contributes significantly, but **only 17% of other C-suite executives agree**. 36% expect outside counsel spend to rise, with regulatory work and M&A as the high-spend areas. https://www.thomsonreuters.com/en/institute/reports/state-of-the-corporate-law-department-report-2026
- Gartner (Dec 2025): **only 20% of matters sent to outside counsel stay within budget.** https://www.gartner.com/en/newsroom/press-releases/2025-12-17-gartner-survey-reveals-only-20-percent-of-legal-matters-to-outside-counsel-stay-within-budget-range
- Rates: mid-size regional partners bill **$700–$1,200/hr in 2026**, and standard rates rose 9.6% year over year in 2025. https://www.legalbillreview.com/blog/legal-billing-rates-2026-benchmarks-trends , https://brightflag.com/resources/law-firm-billing-rates/
- GC AI's own figures (vendor claim, treat with caution): median outside counsel spend of **$1.8M a year** for its customers, **14 hours a week saved per lawyer**, and a 14% cut in outside counsel spend. https://gc.ai/blog/ai-for-general-counsel-operations

### AI adoption and what it's used for today
- FTI/Relativity GC Report (March 2026, 224 GCs): **87% use generative AI, up from 44% in 2025**. The top tasks are summarization (83%), identifying contract clauses (63%), transcription (53%), foreign-language analysis (40%), and first-pass review (37%). **70% raised AI concerns in interviews.** https://www.fticonsulting.com/about/newsroom/press-releases/ai-adoption-in-corporate-legal-departments-doubles-according-to-the-general-counsel-report
- TR 2025 GenAI report: the top legal uses are document review (77%), research (74%), and summarization (74%). https://legal.thomsonreuters.com/blog/genai-report-executive-summary-for-legal-professionals-tri/
- Axiom 2026 (528 in-house leaders): **only 7% have scaled AI, and 83% can't measure whether it's working.** https://www.axiomlaw.com/resources/press-releases/legal-ai-is-everywhere-but-only-7-of-legal-teams-have-made-it-work
- **[INFERRED] What this adds up to:** today's AI use is single-document and user-initiated (summarize this, find the clause). Almost nobody has AI running *across the whole contract and policy corpus* in response to a *trigger*. That gap is where a long-running agent fits.

---

## 2. Recurring, periodic, and event-triggered work that spans many documents

| Work item | Cadence / trigger | Why it hurts | Source |
|---|---|---|---|
| Multi-state handbook and policy update | Annual (Jan 1 and Jul 1 effective dates) plus ad hoc | New leave rules took effect Jan 1, 2026 in AK, CT, DE, IL, MD, MN, NH, NY, RI, and WA. Twelve states require annual harassment training. The Illinois IWTA affects handbooks, offer letters, and separation agreements. | https://www.sixfifty.com/blog/employee-handbook-update-checklist-for-the-latest-law-changes/ |
| State privacy law applicability | New laws each Jan 1 | 20 states have comprehensive laws. IN, KY, and RI took effect Jan 1, 2026, and RI's threshold is as low as 35,000 consumers. | https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026 |
| Auto-renewal / subscription compliance | Law changes (CA amendments effective Jul 1, 2025) | Express consent, click-to-cancel, and a pre-renewal notice 15–45 days before renewal. The FTC click-to-cancel rule was vacated on Jul 8, 2025, but ROSCA and state laws still apply. | https://www.cooley.com/news/insight/2025/2025-06-04-california-automatic-renewal-law-amendments-take-effect-on-july-1-2025 , https://www.sidley.com/en/insights/newsupdates/2025/07/us-ftc-click-to-cancel-rule-struck-down |
| Contract renewals and obligations | Continuous | WorldCC estimates poor contract management costs ~9% of revenue. Auto-renewal notice windows are "buried in section 14.3." | https://juro.com/learn/contract-value-leakage |
| Tariff / change-in-law contract sweep | External shock | Force majeure rarely covers tariffs. Advisers say to prioritize contracts where tariffs exceed 10% of contract value. | https://www.quinnemanuel.com/the-firm/publications/u-s-tariffs-and-potential-contract-disputes/ , https://terms.law/forum/thread/force-majeure-2026-do-tariffs-count.html |
| Franchise FDD renewal | Annual, within 120 days of fiscal year end | Miss it and you can't sell in a registration state (14 states). | https://dale.legal/resources/fdd-renewal-deadlines-going-dark |
| EPR packaging reports | Annual (May 31, 2026 in six states; CA Jun 1) | CA penalties run up to $50k per day per violation. | https://www.faegredrinker.com/en/insights/publications/2026/5/extended-producer-responsibility-six-state-reports-due-may-31 |
| Healthcare transaction notices | Each acquisition | RI requires 60 days' prior notice (effective Jan 28, 2026). MA expanded "material change." CA's AB 1415 expanded to MSOs and PE. | https://www.hklaw.com/en/insights/publications/2026/01/rhode-island-enacts-transaction-notice-requirements-for-medical-groups , https://www.wsgr.com/en/insights/state-healthcare-transaction-notification-laws-a-growing-risk-to-deal-timing-and-execution-in-healthcare-manda.html |
| Money transmitter license renewals | Annual (NMLS window Nov 1–Dec 31, audited financials 90–120 days after fiscal year end) | Multi-state, with state-specific extras. | https://www.csbs.org/newsroom/state-supervisors-urge-licensees-prepare-early-nmls-annual-renewal |
| Construction notice and lien deadlines | Every project | Preliminary notice deadlines are 20 days in CA, AZ, UT, and MI and 45 in FL. Miss one and you lose lien rights. | https://www.siteline.com/blog/preliminary-notice-requirements-for-subcontractors-a-state-by-state-guide |
| Customer security / legal questionnaires and DPAs | Every enterprise deal | 15–40 hours per DDQ. SIG and CAIQ run past 400 questions. 56% of teams can't execute a standard contract within a week. | https://www.vaquill.ai/blog/vendor-security-questionnaire-in-house-counsel , https://www.vaquill.ai/blog/contract-turnaround-time |
| Litigation holds | Each dispute or demand letter | Custodians miss notices. Reminders are due at least every six months. The chronology gets scattered. | https://legal.thomsonreuters.com/en/insights/articles/litigation-holds-what-in-house-counsel-need-to-know |
| Vendor insurance / COI compliance | Annual renewal and continuous | Contract insurance requirements drift out of sync with what vendors actually carry. | https://www.sirion.ai/library/contract-insights/track-vendor-insurance-expirations/ |
| Buy-side M&A diligence | Each deal | Deal-killers include change-of-control termination, unassigned IP, and severance triggers. Data rooms are messy. | https://spellbook.com/briefs/m-a-due-diligence |
| Board / C-suite legal reporting | Quarterly | Only 17% of the C-suite sees legal as a significant contributor, so the GC has to show value. | TR 2026 link above |
| Outside counsel spend control | Monthly | Only 20% of matters stay on budget. | Gartner link above |

**What GCs complain about most [INFERRED from the sources above; Reddit not reachable]:**
1. **Staying current across states.** The "compliance calendar built in March went stale by July" problem (https://gc.ai/blog/ai-for-compliance-monitoring). Gartner's 52% figure on regulatory tracking and CLOC's 63% on compliance workload back this up.
2. **Contract volume and turnaround.** The contract share of daily work and the one-week execution gap.
3. **Not knowing what the company already promised.** Obligations are scattered across hundreds of signed contracts with no central repository (this comes up in M&A diligence and SaaS DPAs).
4. **Outside counsel cost and budget overruns.**
5. **Work outside legal** that lands on a solo GC: HR, insurance, compliance.

---

## 3. User stories (22)

Format: *As the solo GC at [company], when [trigger], I need to [action across documents], because [risk/cost]. Today [time / $].*
Each story is followed by a line with its **trigger type | number of documents | output | human-in-the-loop (HITL) checkpoint**.

### Home services / plumbing / HVAC

**S1. Membership-plan auto-renewal compliance.**
As the solo GC at a 600-employee HVAC and plumbing company (CA, AZ, NV, TX) that sells annual "comfort club" maintenance memberships, when California's auto-renewal amendments take effect (express consent, click-to-cancel, a notice 15–45 days before renewal), I need to compare our membership agreement, web checkout, technician tablet sign-up script, renewal emails, and call-center cancellation script against CA law and every other state's auto-renewal law we sell into, because membership revenue is recurring, consumer class actions under state auto-renewal laws are common, and the vacated FTC rule doesn't protect us (ROSCA and state laws still apply). Today: ~20–30 hours of my time plus ~$15–25k for a consumer-protection firm's 50-state survey. [INFERRED estimate]
- Trigger: external law change (proactive) | ~10–25 documents plus a statute set per state | Output: state-by-state gap report, redlined templates, draft pre-renewal notice | HITL: GC approves the applicability matrix (which states, which plans) before any redlines. Marketing and operations confirm the "as-built" flow matches the scripts.

**S2. Roll-up acquisition diligence.**
As the GC of a PE-backed home-services platform doing 8–12 tuck-in acquisitions a year, when an LOI is signed with a local plumbing shop, I need to review the target's customer agreements, fleet leases, vendor/distributor agreements, technician non-competes, and license files for change-of-control/assignment clauses, license transferability, and pending claims, because deal value depends on keeping the license and the membership base. Today outside counsel charges ~$20–60k per small deal. [INFERRED]
- Trigger: user-initiated (deal event) | 50–300 documents | Output: diligence memo with red/amber/green by issue, consent list, draft consent requests | HITL: GC sets the materiality thresholds up front and signs off on red flags before the memo goes to the deal team.

**S3. New-state expansion.**
As the solo GC of a home-services company entering Colorado, when ops says "we open in 90 days," I need a launch checklist covering contractor and trade licensing, foreign qualification, home-solicitation/cancellation rules, a handbook addendum (leave, pay transparency), a customer contract addendum, and a lien/notice regime, because opening unlicensed or with a non-compliant consumer contract is an enforcement and refund risk. Today this is days of research or ~$10–20k in outside counsel. [INFERRED]
- Trigger: user-initiated | 5–15 internal templates plus a state law corpus | Output: a task list with owners and dates, plus redlined addenda | HITL: GC reviews the research conclusions (with citations) before the tasks go to ops and HR.

### Restaurants / franchise

**S4. Annual FDD renewal plus franchise agreement cleanup.**
As the GC of a 60-unit fast-casual franchisor registered in 4 of the 14 registration states, when our fiscal year closes, I need to update the FDD within 120 days and also comb the franchise agreement, state addenda, and ~60 signed agreements and amendments for non-disparagement, confidentiality, and goodwill clauses the FTC's July 2024 policy statement says can't restrict franchisee reports to regulators, because a missed renewal means we can't sell in that state. Today: franchise counsel charges ~$25–60k a year for FDD renewal. [INFERRED]
- Trigger: periodic (fiscal year end) plus regulatory guidance | 60–100 documents | Output: FDD change list per Item, a clause-remediation report, and a registration renewal calendar | HITL: franchise counsel or the GC approves the Item 19 and Item 21 inputs and any agreement amendment language.
- Sources: https://dale.legal/resources/fdd-renewal-deadlines-going-dark , https://www.ftc.gov/legal-library/browse/policy-statement-of-the-ftc-on-franchisors-use-of-contract-provisions

**S5. Multi-state handbook refresh on Jan 1.**
As the solo GC at a 1,200-employee restaurant group with locations in IL, NY, WA, MN, and CT, when new leave, harassment-training, and confidentiality laws take effect Jan 1, I need to diff our core handbook plus state addenda, offer letter, separation agreement, and training calendar against each state's changes, because wage-and-hour and leave violations are the #1 class-action exposure in hospitality. The IL IWTA alone touches handbooks, offer letters, and separation agreements. Today: ~40 hours in Q4 or ~$10–30k from employment counsel. [INFERRED]
- Trigger: periodic plus external change | ~10–20 documents × 5 states | Output: a redlined handbook and addenda, a changes memo for HR, and a notice/acknowledgment rollout task list | HITL: GC approves each redline. HR approves the rollout.

### Retail / e-commerce / CPG

**S6. New-privacy-law applicability sweep.**
As the GC of an $80M DTC apparel brand shipping to all 50 states, when IN, KY, and RI laws take effect Jan 1 (RI's threshold is 35,000 consumers), I need to figure out which of the 20 state laws now apply given our customer counts by state, then update our privacy notice, DSAR workflow, cookie/opt-out setup, and ~40 vendor DPAs (email, SMS, analytics, reviews apps), because state AGs are actively enforcing and a stale privacy notice is an easy target. Today: ~$15–30k from privacy counsel plus internal time. [INFERRED]
- Trigger: external change | privacy notice, ~40 DPAs, data map | Output: applicability memo, redlined notice, vendor-DPA gap list with a draft amendment | HITL: GC confirms the customer-count data and the "applies / doesn't apply" call per state.

**S7. EPR packaging producer determination.**
As the solo GC of a CPG snack brand that uses co-packers and one licensed brand, when the May 31 EPR reports come due in six states (CA Jun 1), I need to decide who the "producer" is for each brand and SKU under our co-packing, licensing, and distribution agreements, and add EPR data-sharing and fee-allocation clauses, because CA penalties run up to $50k per day per violation. Today this is ad hoc, and I pay ~$10k+ to environmental counsel. [INFERRED]
- Trigger: periodic regulatory deadline | 10–30 contracts | Output: producer matrix, supplier amendment redline, filing calendar | HITL: GC approves the producer determination for each brand.
- Source: https://www.faegredrinker.com/en/insights/publications/2026/5/extended-producer-responsibility-six-state-reports-due-may-31

### Manufacturing / supply chain

**S8. Tariff shock contract sweep.**
As the solo GC of a 350-person auto-parts manufacturer (OH, MI, Mexico plant), when a new tariff hits our steel and electronics inputs, I need to review ~200 customer and supplier contracts for price-adjustment, change-in-law, force majeure, hardship, and termination clauses, rank them by exposure, and draft notice or renegotiation letters, because force majeure rarely covers tariffs and notice windows are short. Today: two to three weeks of my time or ~$50k+ from a firm. [INFERRED]
- Trigger: external event (proactive) | ~200 contracts | Output: ranked exposure report (tariffs above 10% of contract value flagged urgent), draft notice letters, fallback clause for new deals | HITL: GC and CFO choose which counterparties get a notice. GC approves the letter wording before anything goes out.
- Sources: https://www.quinnemanuel.com/the-firm/publications/u-s-tariffs-and-potential-contract-disputes/ , https://www.foley.com/insights/publications/2025/02/multinational-company-import-risks-under-trump-administration-part-iv/

**S9. Insurance renewal vs. contractual promises.**
As the GC and risk owner at a mid-market manufacturer, when our GL, product liability, and umbrella program renews, I need to check the limits, additional-insured status, waiver of subrogation, and primary/non-contributory terms we promised in ~150 customer contracts against what the new policy actually provides, because a gap means an uninsured breach of contract. Today it's a spreadsheet with the broker, taking ~2 weeks. [INFERRED]
- Trigger: periodic | ~150 contracts plus the policy forms | Output: compliance matrix and gap list for broker negotiation | HITL: GC and broker review the gaps before the renewal is bound.

### Healthcare clinic group

**S10. Practice acquisition: state transaction notice.**
As the GC of a PE-backed dermatology MSO with 30 clinics in RI, MA, CA, and two other states, when we sign an LOI to acquire a three-physician practice, I need to decide which state notice or approval laws apply (RI's 60-day prior notice, MA's expanded material-change rules, CA's OHCA/AB 1415) and check our MSA/MSO and physician employment agreements for corporate-practice-of-medicine issues, because a late notice can push back or jeopardize closing. Today: ~$20–40k in healthcare regulatory counsel per deal. [INFERRED]
- Trigger: user-initiated deal event plus fast-changing state law | 20–60 documents | Output: notice checklist and timeline, draft notice filings, a CPOM issues list | HITL: healthcare regulatory counsel or the GC signs every filing.
- Sources: https://www.hklaw.com/en/insights/publications/2026/01/rhode-island-enacts-transaction-notice-requirements-for-medical-groups , https://bassberry.com/news/sessions-out-summary-of-state-health-care-transaction-legislative-updates-since-january-1-2026/

**S11. BAA inventory ahead of the HIPAA Security Rule.**
As the solo GC of the same clinic group, while the HIPAA Security Rule overhaul stays pending (proposed Jan 2025; final reportedly slipped toward 2027), I need a live inventory of ~80 business associate agreements (EHR, billing, telehealth, AI scribe vendors) showing breach-notice timing, safeguard obligations, subcontractor flow-down, and audit rights, and I need to be told the day the final rule publishes, because BAAs would have to be updated on a fixed timeline. Today no one tracks this. [INFERRED]
- Trigger: proactive monitoring (watch a pending rule) | ~80 BAAs | Output: BAA register, a pre-drafted amendment, and a notice when the rule becomes final | HITL: GC approves the amendment template. The agent only drafts the vendor outreach.
- Source: https://www.hipaajournal.com/hipaa-security-rule-business-associates/

### Trucking / logistics

**S12. Broker liability after *Montgomery*.**
As the GC of a 400-truck carrier with a freight brokerage arm (TX), when the Supreme Court held unanimously on May 14, 2026 in *Montgomery v. Caribe Transport II* that negligent-selection claims against brokers aren't preempted, I need to review our broker-carrier agreement and signed carrier packets, shipper contracts (indemnity and insurance), carrier-vetting SOP, and contingent auto liability coverage, because the brokerage arm is now exposed to nuclear-verdict claims (median trucking nuclear verdict ~$36M per an industry source). Today: ~$25k+ for a transportation firm's memo and forms. [INFERRED]
- Trigger: external event (case law) | 5 templates plus hundreds of carrier and shipper contracts | Output: exposure memo, redlined broker-carrier agreement, vetting SOP redline, insurance gap list | HITL: GC approves the risk posture (tighten the vetting standard vs. push indemnity onto carriers).
- Sources: https://www.supremecourt.gov/opinions/25pdf/24-1238_1b7d.pdf , https://www.crowell.com/en/insights/client-alerts/bad-match-big-consequences-supreme-court-holds-freight-brokers-accountable-for-negligent-carrier-selection

**S13. Driver English-proficiency enforcement.**
As the same GC, when English-language proficiency becomes an out-of-service violation (CVSA effective Jun 25, 2025; later written into statute), I need to update hiring and onboarding policy, owner-operator lease agreements, and dispatch procedures, and check anti-discrimination exposure, because out-of-service drivers strand loads and cause service-level breaches. [INFERRED estimates]
- Trigger: external change | ~10 documents | Output: policy redlines plus a task list | HITL: GC and the safety director review.
- Source: https://cvsa.org/news/elp-oosc-06252025

### Construction

**S14. Project notice-deadline calendar.**
As the solo GC of a $150M commercial general contractor working in CA, AZ, NV, and FL, when we sign each new prime contract, I need to pull every notice deadline (delay and claim notice, change orders, pay applications, warranty) and flow them down to ~30 subcontracts, then build a calendar that also covers statutory preliminary-notice and lien deadlines (20 days in CA and AZ, 45 in FL), because a missed notice waives the claim or lien right, which is often six to seven figures on a single project. Today PMs track this in spreadsheets, and I learn about a problem once it's already a dispute. [INFERRED]
- Trigger: user-initiated at the start, then **long-running monitoring for the whole project** | 1 prime contract plus ~30 subcontracts plus a state law set | Output: obligations calendar, flow-down gap report, draft notices ahead of each deadline | HITL: PM confirms the event facts. GC approves any notice before it's sent.
- Source: https://www.siteline.com/blog/preliminary-notice-requirements-for-subcontractors-a-state-by-state-guide

### SaaS

**S15. "What have we promised?" when a subprocessor or incident event happens.**
As the solo GC of a 250-person B2B SaaS company with ~400 customer contracts and DPAs, when engineering wants to add a new AI model provider as a subprocessor (or we have a security incident), I need to find every customer whose contract requires advance subprocessor notice (30 days?), objection rights, data residency, or breach notice within 24/48/72 hours, then draft the notices, because missing a contractual notice is a breach and costs renewals. Today: days of Ctrl-F through a CLM with bad metadata, or I send one blanket notice and hope. [INFERRED]
- Trigger: internal event | ~400 contracts and DPAs | Output: list of affected customers with the clause cited and the deadline, plus draft notices by template tier | HITL: GC approves the list and the wording. The agent never sends anything.

**S16. Security and legal questionnaires.**
As the GC of the same SaaS company, when a hospital-system prospect sends a 300-question security and legal questionnaire plus their own DPA and BAA, I need draft answers that match our SOC 2 report, privacy policy, subprocessor list, insurance certificate, and what we've committed to in prior contracts, with anything we can't support flagged, because an inconsistent answer becomes a misrepresentation claim. Today: 15–40 hours per DDQ across legal, security, and sales.
- Trigger: user-initiated (frequent) | 1 questionnaire plus 5–10 source documents | Output: filled questionnaire with a source citation for each answer, a gap/escalation list, and a DPA redline against our playbook | HITL: security lead and GC approve anything that's escalated or low-confidence.
- Source: https://www.vaquill.ai/blog/vendor-security-questionnaire-in-house-counsel

**S17. State AI laws touching the product and HR.**
As the GC of an HR-tech SaaS company, when Illinois HB 3773 (effective Jan 1, 2026) and Colorado's AI Act (delayed to Jun 30, 2026; **check its status now**) apply to AI used in employment decisions, I need to review customer terms, our product documentation, the internal AI-use policy, and our own recruiting tools, because we're exposed as a vendor and as an employer. [INFERRED estimates]
- Trigger: external change | ~20 documents | Output: applicability memo, customer notice/terms update, internal policy redline | HITL: GC approves the applicability conclusions.
- Sources: https://www.seyfarth.com/news-insights/legal-update-new-illinois-ai-law-requires-employee-notice-affirms-existing-employer-nondiscrimination-duties.html , https://www.hunton.com/privacy-and-cybersecurity-law-blog/enforcement-of-colorado-ai-act-delayed-until-june-2026

### Fintech

**S18. Money transmitter license events and renewals.**
As the solo GC of a payments fintech licensed in ~45 states, when we hire a new CFO or close a funding round that changes control percentages, I need to work out, state by state, which regulators need advance notice, an amendment, or approval (control-person and key-individual changes) and by when, and roll that into the Nov 1–Dec 31 NMLS renewal and the audited-financials deadlines 90–120 days after fiscal year end, because a missed change-of-control filing can mean enforcement or loss of the license. Today: ~$30–80k a year to licensing counsel or a compliance consultancy. [INFERRED]
- Trigger: internal event plus periodic | 45 state regimes plus internal cap table and org documents | Output: filing task list with deadlines, draft filings and letters | HITL: GC and CCO approve every filing.
- Source: https://www.csbs.org/newsroom/state-supervisors-urge-licensees-prepare-early-nmls-annual-renewal

### Staffing

**S19. Pay transparency across client job postings.**
As the GC of a light-industrial staffing firm in 12 states, when MA begins active enforcement and NJ's rule (range spread no more than 60% of the minimum) and VT's (applies at 5+ employees) are in force, I need to audit our posting templates and client MSAs (who sets pay, who approves postings) and brief recruiters, because the laws explicitly reach postings made by staffing agencies. [INFERRED estimates]
- Trigger: external change | ~50 client MSAs plus templates | Output: posting compliance checklist, MSA amendment redline, recruiter guidance | HITL: GC approves the MSA language. Sales delivers the amendments.
- Source: https://www.hunton.com/hunton-retail-law-resource/several-states-enact-pay-transparency-laws-what-employers-need-to-know-in-2026

### Cross-industry

**S20. Litigation hold lifecycle.**
As a solo GC at any mid-market company, when a demand letter arrives, I need to identify custodians (from the org chart, the contract owner, and email threads), draft a hold notice specific to the matter, track acknowledgments, send reminders at least every six months, and release the hold at the end, because spoliation sanctions are worse than the claim. Today: I forget reminders. [INFERRED]
- Trigger: external event, then long-running | a few documents plus people | Output: notice, custodian list, reminder schedule, audit log | HITL: GC approves the custodian list and notice text.

**S21. Quarterly board legal report.**
As a solo GC, before each board meeting, I need to compile open matters, outside counsel spend against budget, material contract exceptions, regulatory changes affecting us, and upcoming deadlines into a two-page report in my voice, because the C-suite underrates legal's value (17%) and the board wants it prioritized by materiality. Today: ~1–2 days per quarter. [INFERRED]
- Trigger: periodic, user-initiated | 20–100 inputs | Output: draft report in my template | HITL: GC edits and owns the whole thing. The agent never contacts the board.

**S22. Outside counsel invoice vs. engagement terms.**
As a solo GC, each month, I need to check invoices against engagement letters, billing guidelines, and matter budgets (block billing, rate increases we didn't approve, staffing creep), because only 20% of matters stay on budget. Today: I skim the totals. [INFERRED]
- Trigger: periodic | ~5–20 invoices plus engagement letters | Output: flagged line items plus a draft pushback email | HITL: GC decides what to dispute.

---

## 4. Top 10 stories (ranked for fit with "long-running autonomous agent" + time/money/risk) [INFERRED]

Ranking criteria: (a) triggered by an external or internal event, not a chat prompt; (b) spans many documents; (c) risk is concrete and dated; (d) output is actionable (report + redlines + drafts + tasks); (e) generalizes across industries; (f) feasible to demo in a ~3-day build with synthetic contracts.

| # | Story | Why it's top-tier |
|---|---|---|
| 1 | **S15 SaaS "what have we promised?"** (subprocessor/incident → affected customers → notices) | Clearest cross-document, event-triggered, deadline-bound job. Easy to demo with ~30 synthetic contracts. The same shape works for any "event → contractual notice duty" case. |
| 2 | **S8 Tariff contract sweep** (manufacturing) | Real 2025–26 shock. Portfolio-wide. Ranked exposure plus notice letters. CFO-visible dollars. |
| 3 | **S12 Broker liability after *Montgomery*** (trucking) | Fresh case-law trigger (May 2026). Non-tech industry. Contracts, SOP, and insurance all in one sweep. |
| 4 | **S14 Construction notice calendar** | Truly long-running (lasts the whole project). A missed notice waives the right. State law plus contract flow-down. |
| 5 | **S5 Multi-state handbook refresh** (restaurants/staffing) | Every company with employees in more than one state has this. Annual and predictable. Law diff plus redlines. |
| 6 | **S1 Membership auto-renewal compliance** (home services) | Consumer class-action exposure. Covers templates, scripts, and 50-state law together. A non-tech mid-market user. |
| 7 | **S6 State privacy applicability** (retail) | New laws each Jan 1. Thresholds, notice, and vendor DPAs. |
| 8 | **S10 Healthcare transaction notice** | Law changing quickly by state. Deal-timing risk. Draft filings. |
| 9 | **S4 FDD renewal + franchise clause cleanup** | Hard annual deadline. A regulator-guidance sweep across 60+ signed agreements. |
| 10 | **S16 Security/legal questionnaire** | Highest-frequency pain for SaaS. The test is consistency across sources, and citations matter. |

Honorable mentions: S2 roll-up M&A diligence, S18 MTL change-of-control filings, S20 litigation hold.

**The common shape [INFERRED]:** *Trigger (law change, court ruling, deal, internal event, calendar date) → find every affected document in the company's own corpus → apply the rule per jurisdiction or counterparty → rank by materiality and deadline → draft the artifacts (redline, notice, filing, task list) → GC approves → track to completion and re-alert.* A chat answer can't do this: it needs the whole corpus, jurisdiction-specific law, many steps, and persistence over weeks. It also matches GC AI's stated view that compliance calendars go stale (https://gc.ai/blog/ai-for-compliance-monitoring) and extends that product from answering a question about one document to acting on the whole portfolio.

---

## 5. What GCs won't trust AI to do, and what "good" looks like

### Won't trust or delegate
- **Final judgment and risk acceptance.** "AI can inform discussion, but cannot own legal judgment." The GC carries the fiduciary and professional responsibility. https://barkergilmore.com/blog/chatgpt-told-me-something-different-how-gcs-handle-ai-generated-legal-advice/
- **Unverified citations or filings.** ABA Formal Opinion 512 (July 2024) requires independent verification. The AI hallucination case database reached 1,348 cases worldwide (915 US) by April 2026, with sanctions typically $1k–$10k per attorney and some over $30k. https://gc.ai/blog/best-ai-for-legal-writing , https://www.nortonrosefulbright.com/en-us/knowledge/publications/792d8bf3/ai-in-litigation-update-on-gen-ai-sanctions-in-2026
- **Unsupervised output.** Sterling Miller: treat AI like a "summer associate." "You would never have a first-year lawyer review the work of a first-year lawyer and then send that work product over to a client." "AI isn't thinking, it's predicting." https://legaldepartmentpod.com/2025/08/26/no-really-this-is-how-to-use-ai-in-the-legal-department-with-sterling-miller-ceo-author-of-ten-things-you-need-to-know-as-in-house-counsel-e76/
- **Confidential or privileged data without enterprise guarantees** (no training on customer data). Miller suggests renaming parties when using consumer tools. The Harvey guide lists data security and no-training as core objections. https://www.harvey.ai/blog/ai-for-general-counsel
- **Board communication, counseling, and strategy** stay with the lawyer. https://gc.ai/blog/best-ai-for-legal-writing ; Google's GC: "The practice of law will always fundamentally rise and fall on the exercise of good judgment." https://www.axios.com/2026/09/08/googles-gemini-enterprise-legal-halimah-delaine-prado
- Trust numbers: only **22.1% of legal users report high trust** in generative AI output. Teams with high trust report positive ROI 89.5% of the time vs. 27.8% without it. 40% of corporate legal respondents name accuracy as a top-three barrier. https://www.filevine.com/guides/ai-trust-index-survey-report/ , https://www.vaquill.ai/blog/legal-ai-trust-is-the-roi . Wolters Kluwer: 37% of corporate legal doubt AI's reliability. https://www.wolterskluwer.com/en/news/wolters-kluwer-releases-2026-future-ready-lawyer-survey-report
- KPMG 2026: 82% of GCs expect their outside firms to track and disclose AI use, a sign of caution. https://abovethelaw.com/2026/05/stats-of-the-week-eyeing-ai/

### What "good" output looks like [INFERRED, grounded in the sources above]
1. **Pinpoint, clickable citations.** Every finding links to the exact clause, section, and page in the source contract, and to primary law (statute or regulation section, effective date). GC AI markets character-locked "Exact Quote" citations for this reason.
2. **Conservative flagging.** When the agent can't tell whether something applies, it says "unclear, needs your review" and explains why, instead of guessing. For a sweep, a missed document is worse than a false alarm, so the agent should lean toward recall.
3. **A coverage statement.** Which documents were reviewed, which couldn't be parsed (scans, missing exhibits), and which were out of scope. The GC has to know what *wasn't* checked.
4. **Prioritized by materiality and deadline.** The top five items the GC must act on this week come first, with dollar exposure or notice deadlines, not a flat list of 200 findings.
5. **In the GC's voice and templates.** Redlines use the company's playbook and fallback positions. Memos follow the GC's format. Notices use existing letterhead and tone.
6. **Nothing leaves the building without approval.** The agent drafts and the human sends. Every external notice, filing, or counterparty email waits at an approval gate.
7. **An audit trail.** What triggered the run, what law version it applied (as of what date), what changed since the last run. This backs up defensibility and the "I checked" record.
8. **Measurable time saved.** Axiom says 83% can't measure AI ROI, so output that reports "hours of review replaced" and "$ of outside counsel avoided" helps the GC make the case to a C-suite that doesn't value legal (17%).

### Human-in-the-loop checkpoint pattern [INFERRED]
1. **Scope check** (before the heavy work): "Here's what I think the trigger means, the jurisdictions and document set in scope, and my materiality thresholds. Confirm?"
2. **Findings review:** a ranked exposure table with citations. The GC accepts, rejects, or reclassifies each item, and those decisions feed back into the playbook.
3. **Draft approval:** redlines and notices shown in a batch. The GC edits and approves each. Nothing goes out on its own.
4. **Tracking:** the agent watches deadlines and responses and re-alerts. The GC marks items closed.

---

## Source list (primary)
- ACC 2026 CLO Survey demographics: https://www.ftitechnology.com/spotlight/2026-acc-clo-survey ; ACC page: https://www.acc.com/resource-library/2026-acc-chief-legal-officers-survey
- ACC 2025 CLO Survey release: https://www.globenewswire.com/news-release/2025/01/28/3016565/25851/en/Risk-Compliance-Data-Privacy-and-Regulatory-Changes-Named-Top-Concerns-for-Global-Chief-Legal-Officers.html
- ACC 2026 benchmarking: https://finance.yahoo.com/small-business/articles/total-legal-spend-company-revenue-153300622.html
- CLOC 2026: https://cloc.org/newsdesk/cloc-releases-2026-state-of-the-industry-report-rising-legal-demand-outpaces-budget-and-staffing-growth-forcing-operational-shift/ ; CLOC 2025 via ATL: https://abovethelaw.com/2025/05/interpreting-the-2025-cloc-in-house-survey-results/
- TR 2026 SCLD: https://www.thomsonreuters.com/en/institute/reports/state-of-the-corporate-law-department-report-2026
- Gartner: https://www.gartner.com/en/articles/2025-trends-general-counsel ; https://www.gartner.com/en/newsroom/press-releases/2025-12-17-gartner-survey-reveals-only-20-percent-of-legal-matters-to-outside-counsel-stay-within-budget-range ; https://www.gartner.com/en/newsroom/press-releases/2025-10-01-gartner-survey-shows-ai-and-contract-analytics-ar-urgent-priorities-for-general-counsel
- FTI/Relativity GC Report 2026: https://www.fticonsulting.com/about/newsroom/press-releases/ai-adoption-in-corporate-legal-departments-doubles-according-to-the-general-counsel-report
- Axiom: https://www.axiomlaw.com/resources/press-releases/legal-ai-is-everywhere-but-only-7-of-legal-teams-have-made-it-work ; https://www.axiomlaw.com/resources/articles/2025-legal-budgeting-survey-report
- Wolters Kluwer FRL 2026: https://www.wolterskluwer.com/en/news/wolters-kluwer-releases-2026-future-ready-lawyer-survey-report
- ALM/Bloomberg contracts survey: https://pro.bloomberglaw.com/insights/company-news/3-out-of-4-in-house-counsel-dissatisfied-with-existing-contract-workflow-technology-per-alm-bloomberg-law-survey/
- Solo GC: https://tenthings.blog/2018/01/31/ten-things-legal-department-of-one-a-survival-guide/ ; https://todaysgeneralcounsel.com/life-solo-house-lawyer/
- GC AI blog: https://gc.ai/blog/ai-for-general-counsel-operations ; https://gc.ai/blog/ai-for-compliance-monitoring ; https://gc.ai/blog/ai-legal-technology
- Industry trigger sources are cited inline in Sections 2 and 3.
