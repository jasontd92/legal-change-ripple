# Use-case research — synthesis (2026-09-23)

Findings come from five parallel research agents. Their raw reports, with cited
URLs, are in `research/`:
- `research-1-regulatory.md`: external laws and regulations that change
- `research-2-contractual.md`: the company's own contracts and documents, and
  counterparty documents
- `research-3-user-stories.md`: 22 GC user stories and survey data
- `research-4-landscape.md`: what GC AI offers today, and competitors
- `research-5-agents-evals.md`: when a long-running agent is warranted, which
  harnesses to use, legal evals

Tags: **[RESEARCH]** means an agent found it on the web, with a cited source in
its raw report. It has **not** been re-verified. Facts from 2026 in particular
need a spot-check before they go into the design doc or the presentation.
**[INFERRED]** means it's Claude's synthesis. **Nothing in this file is a
decision.** Selecting a use case is still [OPEN] and is Jason's call.

---

## 1. The headline findings

1. **What Jonathon suggested mostly exists already.** [RESEARCH, docs.gc.ai/docs/automations]
   - **What they are.** GC AI Automations are "recurring GC AI chats."
     - They're triggered only by a schedule (daily, weekly, quarterly, etc.). No
       event, web-page-change or webhook triggers.
     - Inputs are the prompt plus the company profile, files, skills and playbooks.
     - Each run is a fresh chat. There's no diff between runs, no stored
       snapshot, no memory of what was already reported, no owners or tasks, and
       no sharing.
     - The docs say: "A run cannot ask a clarifying question."
   - **The TOS idea is already a recipe.** GC AI's blog (2026-09-04) publishes a
     "quarterly vendor TOS re-check" recipe. That's the original design-doc idea,
     done as a prompt.
2. **GC AI publicly names the exact gap.** [RESEARCH, GC AI compliance-monitoring
   post, 2026-07-20]
   - It says: "A four-person legal team… cannot also map each change to the
     company's contracts, policies, product features, and vendor agreements."
   - It calls this the step with "the biggest lift."
   - Their suggested workflow for it is three manual steps.
3. **GC AI's agents are in-chat and run for minutes, by design.** [RESEARCH, Chat 2.0
   post, 2026-02-27; API docs]
   - In their words, "'Agent' means… autonomous systems, workflow automation
     layers… That is not how Chat 2.0 uses agents."
   - Their async API jobs hold a connection for at most 90 seconds.
   - Competitors go longer: Legora's Agent runs for about 40 minutes with
     subagents, and Harvey runs "overnight" on data rooms.
4. **A GC AI feature shipped this month leaves a gap you could build into.**
   [RESEARCH, GC AI changelog, 2026-09-03] Contract Vaults now *detect* online
   terms that contracts incorporate by URL. Their docs say "Those pages are not
   fetched."
5. **Other tools stop at the alert.** [RESEARCH]
   - Regulatory-change tools (Norm Ai, Compliance.ai/Archer, Ascent, Regology)
     map rule changes to policies and controls. They serve financial services
     only, rely on human analysts, and don't read contracts.
   - CLM tools (Ironclad, LinkSquares, Evisort) track obligations *inside* the
     contract set, not changes coming from outside it.
   - In-house lawyers say they don't read alerts unless the alert explains "why
     the issue is relevant to our company." [Bloomberg Law]
6. **The user.** [RESEARCH, ACC 2026 / CLOC 2026 / FTI 2026]
   - **Small, stretched teams.** About 40% of legal departments have 1–5 people.
     Manufacturing is the biggest industry, and 59% of the companies are private.
     The median is 3 lawyers per $1B of revenue.
   - **More regulatory work on top of legal.** 70% of general counsel also own
     risk, compliance or privacy. Regulatory compliance is the #1 reason workload
     is growing, and 43% say regulatory change is pushing work to outside counsel.
   - **AI use is still one document at a time.** 87% use generative AI, mostly to
     summarise or find a clause in a single document.
7. **Laws flip status often.** [RESEARCH] In 2024–26 several rules were stayed,
   vacated or replaced:
   - the FTC noncompete ban
   - the DOL overtime and contractor rules
   - click-to-cancel
   - the Colorado AI Act
   - the IEEPA tariffs, which SCOTUS struck down in Feb 2026

   So "is this change still in force?" has to be a tracked status in its own
   right. It's also a hard eval dimension. [INFERRED]

---

## 2. Brainstorm: documents that change → documents they affect → GC action

### A. External law changes → the company's own documents
| # | Changing source | Affected internal documents | GC action | Breadth |
|---|---|---|---|---|
| A1 | State employment law (wage/salary thresholds, leave, pay transparency, noncompete bans) | Handbook + state addenda, offer letters, separation agreements, job-posting templates | Redline the handbook and addenda, send notices (e.g. the individual notices CA AB 1076 required), roll out to HR | Every employer |
| A2 | Court rulings on enforceability (arbitration/class waivers, unilateral modification, noncompetes; *Montgomery v. Caribe*, broker liability, 2026) | Customer templates, signed contracts, SOPs, insurance | Re-paper templates, assess exposure in contracts already signed, fill insurance gaps | Every industry (this is Jonathon's "case law" example) |
| A3 | Tariff / trade actions (SCOTUS IEEPA ruling Feb 2026 → 100+ refund class actions; 50% copper tariff) | Supplier and customer contracts: price-adjustment, change-in-law, force majeure, surcharge terms | Rank contracts by exposure, send notice/renegotiation letters, draft a fallback clause | Manufacturing, retail, construction, trades |
| A4 | State privacy laws (20 states; new ones take effect each Jan 1) | Privacy notice, vendor DPAs (~40), data map | Applicability memo, redline the notice, list DPA gaps | Any company that sells to consumers |
| A5 | Consumer-protection rules (state auto-renewal laws, ROSCA, junk fees, texting consent) | Membership and subscription terms, checkout flow, call scripts, renewal emails | Gap report per state, redlined templates | Home services, retail, subscriptions |
| A6 | Industry regulators (OSHA/state heat rules, FMCSA, health-transaction notice laws, HIPAA Security Rule) | SOPs, vendor/BAA agreements, deal checklists | Update policies, amendment templates, filings | Varies by industry |
| A7 | AI rules (IL HB 3773, EU AI Act, CO's replacement law) | HR-tech vendor contracts, AI-use policy, product terms | Applicability memo, vendor re-papering | Growing across industries |

### B. Counterparty documents that change on their own → the company's contracts
| # | Changing source | Affected documents | GC action | Breadth |
|---|---|---|---|---|
| B1 | Vendor online terms incorporated by URL (Stripe, Amazon seller policies, card-network rules, delivery-app commissions) | The signed MSA's modification and precedence clauses; every contract that references the URL | Decide whether the change is binding, object or opt out by the deadline, renegotiate | Every company (this is the Vault gap) |
| B2 | Subprocessor lists / DPAs (Microsoft cut its AI-subprocessor notice from 6 months to 30 days, May 2026) | Our customer DPAs that promise flow-down notice | Notify customers, handle objections | SaaS and data processors (narrower) |
| B3 | Insurance policy forms and endorsements at renewal (e.g. PFAS exclusions added as a form number) | Insurance clauses in every customer contract, lease and loan | Gap matrix before the renewal binds, negotiate with the broker | Contractors, trucking, manufacturing, anyone |
| B4 | Franchise operations manual, supplier codes of conduct "as amended" | Franchise agreement, lease, vendor contracts | Assess new obligations and fees | Franchise, anyone supplying big retailers |
| B5 | Open-source license changes (HashiCorp, Redis, Elastic) | Product dependencies, customer IP warranties | Swap the component or accept the risk | Software |

### C. An event → a sweep across the whole contract set (not a document change, but the same ripple shape)
| # | Trigger | Sweep | GC action |
|---|---|---|---|
| C1 | Vendor breach or outage (CDK ~15k dealers, Blue Yonder 3,000+ customers, Snowflake ~165 organisations) | Which contracts require us to notify, and within how many hours (24/48/72) | Draft notices, track the deadlines |
| C2 | A counterparty is sanctioned (the OFAC 50% rule means an unlisted affiliate can be caught too) | Which contracts involve that entity or its affiliates | Suspend, terminate, report |
| C3 | M&A LOI / change of control | Assignment, change-of-control and MFN clauses across 50–3,000 contracts | Consent list, diligence memo |
| C4 | Entering a new state | Licensing, handbook addendum, customer contract addendum | Launch checklist and addenda |
| C5 | Signing a construction prime contract | Flow the notice deadlines down to about 30 subcontracts, plus statutory lien deadlines | A calendar that runs for the whole project, with draft notices |

---

## 3. Scoring the candidates [INFERRED]

The rubric is condensed from research-5, based on Anthropic, Cognition, Manus and
METR. A task warrants a long-running agent when:
- the number of steps is unknown
- work fans out across many independent units
- the corpus is bigger than one context window
- the agent has to decide what to look up next (cross-references, defined terms,
  which document takes precedence)
- a verifier loop can check the work
- it waits on time or external events
- state has to persist between runs
- the value per run justifies about 15× the tokens of a chat answer
- it has a natural checkpoint for a human

The rubric also carries a caution: parallel subagents should not be making
conflicting implicit decisions. Keep the synthesis step in a single thread.

Scores are 1–5.

| Candidate | Cross-industry | Truly long-running | Evals you can build (can plant changes) | New vs GC AI | Size of time/money/risk | Buildable in the take-home |
|---|---|---|---|---|---|---|
| **A2/A3 Change-in-law → portfolio impact sweep** | 5 | 5 (fans out across N docs, cross-refs, verifier) | 5 | 5 (GC AI names it the "biggest lift") | 5 | 4 |
| **B1 Incorporated-URL terms → contract impact** | 4 | 4 (persistent baselines + fan-out) | 5 (easiest diffs to plant) | 5 (extends Vaults) | 3 | 5 |
| **C1 Vendor incident → notice obligations** | 4 | 4 (fan-out + deadline tracking) | 5 | 4 | 5 (72-hour clocks) | 4 |
| **A1 Multi-state handbook refresh** | 5 | 4 (states × policies) | 3 (ground truth depends on getting real law right, so hallucination risk is higher) | 3 | 4 | 3 |
| **B3 Insurance renewal vs promises** | 5 | 4 | 4 | 5 | 4 | 3 (policy PDFs, not URLs, so less of a "monitored change") |
| C5 Construction notice calendar | 2 | 5 (runs for months) | 3 | 4 | 5 | 2 |
| C3 M&A change-of-control | 4 | 4 | 4 | 2 (Harvey and Legora do diligence) | 4 | 3 (not a monitored input) |
| B2 Subprocessor cascade | 2 (SaaS) | 3 | 5 | 3 | 3 | 5 |
| C2 Sanctions | 4 | 2 (mostly name-matching) | 3 | 3 | 3 | 4 |

**What the top candidates have in common.** A2/A3, B1, C1, A1 and B3 all have the
*same harness shape*:

> trigger (a monitored URL changes, *or* the GC points at a change) → scope it
> against the company profile + custom prompt → fan out one worker per document
> across the company's own documents → per-document exposure finding with verbatim
> clause citations → verifier pass → a synthesis step, in a single thread, that
> produces a ranked impact register with a coverage statement → draft
> redlines/notices → human approval gate → deadline tracking and re-alerts
> across runs.

One of the brief's judging criteria is "how well it generalizes to other
in-house counsel workflows." A harness that handles this ripple pattern for any
kind of trigger answers that directly. The demo could show the same harness
running on two different triggers, such as a court ruling and a vendor-terms
diff.

**Which parts should be an agent at all.** Per research-5:
- **Monitoring and diffing:** a scheduled, durable pipeline, *not* an agent.
- **Checking the change against every document:** the agentic core.
- **Drafting the response:** one synthesis step, then a separate evaluator, then
  a pause for approval.

An ablation turns "does this need to be long-running?" into a measured
quality-per-dollar answer: a single call vs the agent, with vs without the
verifier, with vs without fan-out.

---

## 4. Leading candidate [INFERRED — for Jason to accept, change or reject]

**"Change Impact Sweep": a durable background job that turns one change into an
impact register across the company's documents.**

**Demo company.** Research-1 suggests a home-services / plumbing company:
- about 400 employees, operating in CA, WA, IL and TX
- documents: handbook, offer letter with a noncompete, a supplier agreement with a
  copper price clause, membership auto-renewal terms, an HR-tech vendor contract,
  and a subcontract with indemnity and additional-insured terms

Every one of those documents was hit by a real, cited change in 2024–26. The
setup also matches Jonathon's "plumbing" framing.

### Tiered scope
- **Core (must work end to end).**
  - The GC starts it by pointing at a change (URL, or an old/new pair).
  - Inputs are the company profile, a custom prompt, and a corpus of about 30–60
    documents: CUAD real contracts plus synthetic policies.
  - It runs as a background job with a progress log and checkpoints, so it can
    resume after a crash.
  - Workers run one per document; a verifier checks each claimed citation
    verbatim.
  - The output is a ranked register: document, clause, why it matters, severity,
    deadline, recommended action, "unclear → needs review" where applicable, and
    a coverage statement.
  - The job pauses for approval before it drafts anything.
  - Evals run across 2–3 models.
- **Extension 1 (proactive).**
  - Monitored URLs with snapshots, a change log, a legal-status field
    (proposed / final / effective / stayed / vacated) and deduplication across
    runs.
  - A material diff triggers a sweep automatically.
  - This is the piece Automations doesn't have.
- **Extension 2 (follow-through).**
  - Each finding gets an owner, a status and a due date.
  - A durable sleep wakes the job for deadline re-alerts.
  - Draft notices and redlines.
- **Extension 3 (Vault gap).**
  - Pull the URLs of incorporated terms out of the contracts themselves.
  - Fetch and snapshot each page as of the signing date, keeping it as evidence.
  - Diff later versions against that snapshot.
- **Extension 4.** Questions across changes: "what's our total exposure to X across
  everything we track?"

### Eval sketch (details in research-5 §5)
- **Scenario format.** Each scenario is (old source, new source, corpus snapshot).
- **Mix.** About 40–60 scenarios:
  - about 70% *planted* changes, where the ground truth is known by construction
  - about 15% real historical diffs, reported separately
  - about 15% adversarial: cosmetic-only edits, false premises, garbage fetches,
    repeat notices, prompt injection
  - at least 25% "should not flag"
- **How a change reaches a document.** Scenarios cover a direct hit, a hit via a
  defined term, via a cross-reference, via which document takes precedence, via a
  *missing* clause, and look-alike decoys.
- **Dimensions.** Materiality F1 and false-alarm rate, clause recall and
  precision, severity calibration, citation faithfulness (a hard gate), and
  hallucination as negative points. Also actionability, process safety (no action
  before approval, no duplicates), cost and latency, pass^3 consistency, and
  style.
- **Why the dimensions weigh differently.** Recall and citation carry the most
  weight: a sweep that misses a document is worse than a false alarm (research-3).
- **Mirror GC AI's house style.** Their own In-House Legal Bench (2026-05-15) is
  100 tasks, each with about 12 attorney-written criteria and a judge checked
  against humans. Reusing their format signals fluency. [RESEARCH]
- **The white space.** No public benchmark exists for how a regulatory change
  ripples through a portfolio. CLAUSE (EACL 2026) is a precedent for planting
  anomalies in real contracts; the best model reached about 64% F1. [RESEARCH]
- **Idea: GC AI as a baseline.** Run the same scenarios through the GC AI trial
  account (an Automation or a chat) and score it on the same rubric.

### Harness candidates (research-5)
- **eve (Vercel, Apache-2.0, beta, June 2026)** is almost certainly the "Vercel's
  Eve" in the brief.
  - Each agent is a directory: instructions, tools, skills, subagents, schedules,
    sandbox.
  - Sessions are durable on Vercel Workflow and can pause for approval.
  - Changing models is a one-string swap through the AI Gateway.
  - Built-in `evals/**/*.eval.ts` with an LLM judge and a Braintrust reporter.
  - Risk: it's beta and tied to Vercel.
- **pi / pi-mono (Mario Zechner)** is minimal: four tools and many providers.
  You'd build durability, scheduling and evals yourself.

---

## 5. Open questions for Jason
- Core trigger: **user-initiated** (point at a change) or **proactive**
  (monitored URL)? GC AI said they're starting with user-initiated. Proactive is
  what differentiates this from Automations.
- Which demo company and which 2–3 real triggers?
- Where the corpus comes from: CUAD real contracts, synthetic, or a mix?
- Harness: eve vs pi vs the Claude Agent SDK?
- Use the GC AI trial account as an eval baseline?

## 6. Items to verify before they're relied on
- Everything dated 2026: *Montgomery v. Caribe* (May 14, 2026), the SCOTUS
  IEEPA ruling (Feb 2026), the Colorado AI Act's replacement, the Microsoft
  subprocessor-notice change, the GC AI Vault/Automations changelog dates.
- The [VERIFY] items in research-1: the Missouri sick-leave law, the pause on
  BIS's affiliates rule, the scope of the copper tariff, and the CA contractor
  workers'-comp mandate date.
- Stats: WorldCC's 8.6% / 9.2% value-leakage figures are solid. The "Gartner"
  figures on auto-renewal and change-of-control come only from vendor blogs.

---

## 7. Scoping decisions (2026-09-25) [JASON, decided]
- **Core covers steps 1–5:** understand the change, applicability, scoping,
  per-document analysis, materiality and prioritization.
  - The system does these end to end.
  - The output notifies the GC of the highest-value areas to investigate.
- **Transparency and drill-down are required.** The GC can drill into any
  dimension:
  - citations to documents
  - the exact references
  - concise reasoning for every decision, including materiality *and*
    immateriality calls
  - everything logged
- **Eval goal:** show performance at the level of an attorney peer, from
  understanding the change through scoring materiality.
- **Step 6 (applying GC judgment to the findings) is an extension.** It's likely
  in scope, but it's not the starting point.
- **Steps 7 (execute) and 8 (track to close) are independent extensions.**
  They're likely out of scope and are kept only to show where the build would go
  next.
