# Research 4 — Landscape: GC AI today, competitors, and gaps

Researched 2026-09-23. Verified facts are cited with URLs and dates. Anything marked [INFERRED] is my own reading, not a published claim.
Note: the session's WebSearch budget ran out partway through the competitor section. Competitor coverage after Legora comes from fetching vendor homepages directly, so it is thinner. See "Open items" at the end.

---

## 1. GC AI today

### 1.1 Company facts
- **Incorporation:** General Counsel AI, Inc. was incorporated about a week after 2023-11-01. Source: https://gc.ai/company/about
- **CEO:** Cecilia Ziniti, co-founder. She was GC three times (Anki, Bloomtech, Replit) and in-house counsel at Amazon and Cruise.
- **CTO:** Bardia Pourvakil, co-founder. The about page describes him as "Building in AI since GPT-2; prompt and AI engineering." He was previously at Replit (2021–2023), in roles including product engineer and head of developer relations. Sources: https://gc.ai/company/about and https://www.crunchbase.com/person/bardia-pourvakil
- **Funding:** $60M Series B in November 2025, led by Scale Venture Partners and Northzone, at a $555M valuation. Total raised is about $73M. Other investors include Sound Ventures, News Corp and Guillermo Rauch. Source: https://gc.ai/blog/gc-ai-raises-60-million-series-b-to-give-every-company-a-legal-advantage (BusinessWire, 2025-11-07)
- **Scale claims:**
  - "2,100+ legal teams across 53 countries" (Sept 2026).
  - Job posts say "200+ public companies, 25+ unicorns," "80 NPS," and "doubled ARR in six months."
  - The Platform Engineering post says "1,700+ enterprise customers."
  - Customers named include News Corp, Nestlé, Miro, Bass Pro Shops, Snyk, Skims, Liquid Death, Vercel, Zscaler, TIME, Hitachi, Logitech, Tipalti, Eventbrite and Columbia Sportswear.
  - Source: Ashby job board, https://api.ashbyhq.com/posting-api/job-board/gc-ai
- **Pricing:**
  - Individual seat is $500/month with a 14-day free trial.
  - Team and Enterprise pricing is custom. Team adds SSO, a team skill library, shared chats, Agent Connectors and Solutions Attorney support.
  - API usage is "billed separately in credits."
  - Sources: https://gc.ai/pricing and https://docs.gc.ai/about/pricing
- **Stack hints:**
  - Runs on GCP, per the Platform Engineering job post.
  - TypeScript, per the Applied AI job post.
  - Multi-model: Claude Opus 4.6 has been the default since 2026-02-13. GPT-5, Gemini 3.1 Pro and Grok are also offered, with "automatic model fallback chains." Source: https://docs.gc.ai/about/features

### 1.2 Feature inventory, with ship dates from the changelog (https://docs.gc.ai/llms.txt and https://releasebot.io/updates/gc-ai)
| Feature | What it is | Date |
|---|---|---|
| Playbooks | Structured contract review with pass/fallback/flag checks, AI redlines and escalation rules. Includes a Playbook Builder Agent and a Playbook Review Agent. | 2026-01-29 |
| Chat 2.0 (multi-agent) | Rebuilt chat. Parallel research subprocesses. A 5-step reasoning frame: Scope, Systematic Sweep, Pattern Tracing, Completeness Accounting, Reconcile. Visible reasoning. | 2026-02-13 (blog 2026-02-27) |
| Research Agent | "autonomous researcher… runs its own searches, reads full pages… iterates." For multi-part questions "GC AI may launch several Research Agents in parallel." Progress cards. Source: https://docs.gc.ai/docs/chat/research | Feb 2026 |
| Projects | Workspace with shared files, instructions and cross-chat memory. Chats are summarized at 50% of the context window. | 2026-03-16 |
| Skill Library | Replaced the Prompt Library. Skills attach like files and can be chained. Includes Skill Creator (6 patterns: checklist, role, template, workflow, style, drafting). Skills can carry files. | 2026-04-18 |
| In-House Legal Bench | 100 tasks across 10 categories. An LLM judge gives criteria-level pass/fail, checked against human scoring. Scores: GC AI 86.8%, ChatGPT 79.8%, Claude 68.4%, Gemini 57.5%. Source: https://gc.ai/blog/in-house-legal-bench-evaluating-ai-assistants-for-in-house-legal-work | 2026-05-15 |
| Automations | See 1.3. Local timezone support added 2026-06-01. Monthly and quarterly schedules from chat added 2026-07-14. Redlines from automations added 2026-09-15. | ~May 2026 [INFERRED: first changelog mention is 2026-06-01] |
| US Case Law | 13–14M opinions with treatment flags | 2026-06-30 |
| Agent Connectors | 20+ apps: Gmail, Outlook, Slack, Drive, HubSpot, M365, Airtable, Todoist, Box. Per-action approval, and writes need approval by default. | 2026-07-31 |
| Easy Edit | Word editor in the web app with tracked-change redlines | 2026-07-31 |
| Contract Intelligence / Vaults | Portfolio tables with extraction columns, citations, execution status, contract-family relationships and a "Current Terms" rollup. Sources sync every 15 minutes. CSV export up to 10k rows. | GA 2026-08-05 |
| Vault linked hosted terms | "If a document cites hosted terms (for example an online EULA), you will see those URLs on the Related Documents tab, marked as not in this vault… **Those pages are not fetched.**" Source: https://docs.gc.ai/changelog/september-2026/sep-3-2026 | **2026-09-03** |
| API / MCP / CLI | REST API with async jobs (long-poll `wait` max 90 s, `job_id` polling), MCP server and a `gcai` CLI. Covers chats, files, projects, playbooks, skills, vaults and company profiles. | 2026 |
| Company profiles | Legal name, industry, jurisdictions, risk tolerance, preferred clauses and decision-makers. Can be drafted from the company website. Multiple profiles, with personal and project defaults. Source: https://docs.gc.ai/docs/organizations/company-profiles | defaults 2026-09-01 |
| Other | Word add-in, Exact Quote (character-level citations), Easy Prompt, agentic chat-history search (2026-06-17), Academy (2026-08-13) | — |

### 1.3 Automations — precise description
Source: https://docs.gc.ai/docs/automations/overview (fetched 2026-09-23). Marketing page: https://gc.ai/features/automations

- **What it is:** "Automations are recurring GC AI chats." The marketing page says: "If you can ask GC AI to do it in a chat, you can schedule it as an automation." Its tagline is "Put your favorite Skills on auto-pilot."
- **Trigger:** time only. The schedules are "Daily, Weekdays, Weekends, Weekly (one day a week), Monthly, Quarterly (relative to calendar quarter-end), or Custom (any combination of days)," plus a time, a time zone and an optional "Local timezone." You can also click **Run now**. There are no event triggers: no document change, no webpage change, no email or webhook.
- **Inputs:**
  - A name, a description and instructions. The docs warn: "the instructions need to stand on their own, since there is no live back-and-forth during the run" and "A run cannot ask a clarifying question."
  - Attachments can be skills, files and folders, playbooks, a company profile, labels or a project. Connectors (email, Slack and so on) are available during a run.
  - "Easy Automation™" expands a short prompt into structured instructions.
- **Output:**
  - "Each run starts a fresh chat… named for the automation and dated for the run, **so you can compare results across weeks**." In other words, the human does the comparing.
  - Email notification when a run finishes. "Slack notifications are on the roadmap."
  - Since 2026-09-15: "An automation that edits a document now leaves you tracked changes to read and apply."
- **Ownership:** "Each automation stays with its creator." Teammates cannot share automations. "Run history stays with the creator." Shared context comes only from connecting the automation to a project.
- **Controls:** pause/resume, duplicate, and "Automate this skill" (the Zap icon) on any skill.
- **Documented examples:**
  - Weekly regulatory scan for a jurisdiction
  - Monthly playbook "legislative drift" review ("scans for regulatory developments since the last run, and flags clauses")
  - Weekly legal-ops briefing on a project
  - Quarterly close checklist
  - Daily briefing across connected apps ("An official Daily Briefing template is not available yet")
- **Not documented (absent from the docs):**
  - No cross-run diffing or stored snapshots.
  - No materiality memory ("already told you about this").
  - No run-level state beyond the chats in a project.
  - No limits on runtime or compute.
  - No task or owner tracking.
  - No shared team automations.

### 1.4 GC AI's own public framing of agents and monitoring
- **Blog, "AI Agents for Lawyers: 5 Agents In-House Teams Run in 2026"** (Josh Bertini, 2026-09-04). Source: https://gc.ai/blog/ai-agents-for-lawyers
  - It names 5 agents: first-pass contract review, **regulatory monitoring**, **vendor terms re-checks** ("Quarterly re-review of key vendors' terms of service for changes that matter to your data posture"), research memos and document extraction.
  - It spells out the TOS re-check recipe: "each quarter, pull the current terms of service for five named vendors, compare each against the version on file in Files, flag changes to data use, subprocessors, or liability, quote the changed language exactly, and deliver a one-page summary marked review-needed or no-action."
  - **This is very close to the candidate's TOS-monitor idea.** GC AI already markets it as a prompt-plus-schedule pattern. In their version the baseline is a manually kept file, not a stored snapshot.
  - It names a "**Regulatory Monitoring Skill Creator**": "set your jurisdictions, risk areas, and a materiality threshold, and the agent verifies every flagged item against primary sources and returns a prioritized action-items table" with "Critical/High/Medium/Low tiers."
  - Quotes: "Scheduled execution is the difference between a workflow you use and a workflow that happens." "An agent you can trust is a workflow you already standardized, running on a schedule, with your name still on the review." "Save a workflow as a Skill, schedule it with Automations, and you are running a supervised agent."
- **Blog, "AI for Compliance Monitoring"** (Caitlin Price, published 2026-07-20, updated 2026-09-04). Source: https://gc.ai/blog/ai-for-compliance-monitoring
  - It defines four capabilities: change detection, evidence/control mapping, risk scoring, and "**Policy and Contract Alignment** — The newest capability… reviews existing contracts and policies against the new rule and surfaces clauses that need updates."
  - It admits the manual gap: "A four-person legal team can read the filings. It cannot also map each change to the company's contracts, policies, product features, and vendor agreements."
  - GC AI's own workflow for this is three **manual** steps: "Research pulls the primary text → Exact Quote maps it against the contracts and policies in your Files collection → A Playbook or Skill… re-run the review."
  - Files limit quoted there: "up to 1,500 pages… in a single collection."
- **Chat 2.0 blog** (Ziniti, 2026-02-27). Source: https://gc.ai/blog/introducing-chat-2-0-powered-by-a-multi-agent-architecture
  - Quote: "'Agent' means different things… autonomous systems, workflow automation layers… **That is not how Chat 2.0 uses agents.** In Chat 2.0, agents operate at the architectural layer within the core chat experience… while the customer remains in a single, continuous conversation."
  - It describes the work as "compresses hours of manual research into minutes."
  - **This confirms the interviewer's point:** GC AI's agent design is in-chat and measured in minutes. They have no published long-horizon runtime.
- **Contract Intelligence FAQ.** Source: https://docs.gc.ai/guides/contract-intelligence/faq
  - "Chat works against one Vault at a time… Attaching several Vaults to one Project is on the roadmap."
- **Job posts (Ashby, fetched 2026-09-23).** Source: https://api.ashbyhq.com/posting-api/job-board/gc-ai
  - *Member of Technical Staff, Applied AI* (posted 2026-05-22):
    - "working directly with our CTO (ex-Replit)"
    - "Design and run rigorous legal-grade evals that harden model choices, prompts, and retrieval for accuracy and explainability"
    - "advancing RAG, structured reasoning, and tool-use pipelines"
    - "Build frameworks for rapid prototyping and validation of AI features"
    - Nice-to-have: "Experience with multi-agent AI systems"
    - Requires TypeScript
    - Values "communicate clearly in writing and operate well asynchronously"
  - *R&D Attorney* (posted 2026-09-22): "design legal evaluations… determining whether the solution requires a **a prompt, skill, tool, or broader product change**, and creating tests that prevent recurrence." That line is the house taxonomy for fixes.
  - Culture values: "1% Better Every Day, Customer Obsession, Ship Today, Find a Way, Care, Own It."
  - There is also a Forward Deployed Engineer role (posted 2026-06-12).

---

## 2. Competitors: long-running, agentic and monitoring work

| Vendor | Long-running / agentic | Monitoring | External change → your own documents | Follow-through |
|---|---|---|---|---|
| **Harvey** | Agents (2025-03-11). **Harvey II** (2026-08-18): agents run inside "Spaces" that hold matter context, memory and tasks. "worked through the latest batch of material contracts in the data room overnight." Tasks go to "a lawyer or an agent." Recurring background runs (e.g. expiration checks), per third-party coverage. LAB benchmark: 1,200+ long-horizon tasks (2026-05-06). | **Horizon Scanning** (Early Access, ~2026-09-01): "12,000+ sources across 100+ jurisdictions… relevance assessment," email digests, "turn scans into a memo revision, a recommended policy update." | Partial. Relevance is scored against scan parameters (topic, region, regulator). Documents can be pulled in from a DMS, but I found no automatic portfolio-wide impact mapping. | Tasks inside Spaces |
| **Legora** | **Legora Agent** (2026-06-04): multi-phase plan, "dispatches sub-agents to work in parallel… Forty minutes later, the draft report is complete." Also "The Agent doesn't wait to be asked. It monitors your email, documents, and projects." (https://legora.com/product/agent, https://legora.com/blog/2026-the-year-of-agents-in-legal-ai) | **Monitors**: "single feed scoped to your regulatory perimeter… research it, assess impact, assign owners, and keep an audit trail." (https://legora.com/product/monitors) | Partial. "Compare current law, assess impact." Pitched mostly to law firms. | **Yes**: owners, tasks, audit trail |
| **Thomson Reuters CoCounsel Legal** | "agentic reasoning builds the plan and executes each step," plus Deep Research grounded in Westlaw. (https://legal.thomsonreuters.com/en/products/cocounsel-legal) | Adverse-media monitoring (in a separate product) | No | — |
| **Lexis+ AI Protégé** | Agentic workflows, custom agents, "agent skills," and an integration with M365 Copilot | — | No | — |
| **Ironclad** | "Jurist… agents specifically designed for legal work." Obligation extraction inside the CLM. | Renewals and obligations in the CLM | CLM-internal only, not driven by external change | CLM workflows |
| **Spellbook** | "Associate" agent for drafting and review | "Every signed contract is stored, searchable, and monitored for renewals and new risks." | Not driven by external change | — |
| **Luminance / LinkSquares / Evisort (Workday)** | Portfolio analytics, with agents in Workday | Renewals and obligations | Internal portfolio queries only | Renewal workflows |
| **Norm Ai** | Compliance agents for financial institutions. $120M Series C at $1.2B (June 2026). Runs Norm Law, an AI-native law firm. | Regulation-as-code for FS compliance | For marketing and communications review in FS, not the contract portfolio | — |
| **Compliance.ai → Archer Evolv Compliance** | — | 8,000+ sources. "130+ in-house regulatory specialists supervise and validate every… change alert." | "pinpoint their impact on your **controls, policies, and processes**" (GRC side, not contracts) | GRC workflows |
| **Ascent RegTech** | — | Rules to obligations | "Identifies impacts of rule changes based on your obligations inventory" (FS, GRC) | Change proliferation into GRC |
| **Bloomberg Regology** | "Regulatory Change Agent," Smart Law Library | Bills, laws and agency updates | Applicable-law mapping, not contracts | Workflows |
| **DeepJudge / Eudia / Hebbia** | Agent builders on top of enterprise search (DeepJudge AI Workflows), "legal agents" (Eudia), and Hebbia's Matrix | — | No | — |
| **Crosby** | An "agentic law firm": "did in 12 hours what took a really great law firm six weeks" | — | — | Human attorneys |

**Who connects "external change → impact on your own contract portfolio and policies" today?** No one does it end to end with a persistent register.
- GRC regtech (Archer/compliance.ai, Ascent) maps rules to *controls and policies* in financial services, backed by human analysts.
- Harvey Horizon and Legora Monitors assess impact against a *topic perimeter*. They can then be steered by hand toward documents.
- GC AI admits the mapping is manual ("It cannot also map each change to the company's contracts…"). Its Vaults hold the portfolio, but chat works against one Vault at a time, and Vaults do not fetch the hosted terms they cite.
- [INFERRED] The piece nobody has productized is the join: a *change event* joined to a *clause-level inventory* across the Vault, producing a *materiality verdict per affected document* that is *kept across runs*.

---

## 3. Gaps (strongest first)

**(a) Cross-document ripple analysis between external changes and the company's own documents**
- GC AI has every ingredient: Vault columns and relationships, company profile, Research Agent, playbooks and Automations. What it lacks is the join. Its own blog calls this "capability 4… the biggest lift" and describes it as a manual three-step flow.
- A specific, verified hole: Vault finds online-terms URLs that contracts incorporate by reference, but "**Those pages are not fetched**" (2026-09-03). Online EULAs, DPAs, AUPs and subprocessor lists that vendors can change unilaterally are therefore invisible to portfolio analysis. That is a natural wedge: fetch, snapshot and diff them, then ripple the change to every contract that incorporates that URL.

**(b) Long-running background research (tens of minutes to hours, with subagents)**
- GC AI's Research Agent runs parallel subagents *inside a chat turn*, on a scale of minutes. The API's async jobs exist, but the long-poll window is at most 90 s, and the docs say "a couple of seconds to well over a minute."
- Legora (40-minute subagent runs) and Harvey II ("overnight," continuous agents) are ahead here. GC AI has published nothing on hour-scale jobs, checkpoints or resumability.

**(c) Persistent monitoring with change logs and profile-tailored materiality**
- Automations are stateless and time-triggered. Each run is a fresh chat, and the *human* compares weeks.
- The Regulatory Monitoring Skill has a materiality threshold, but it lives in a prompt, with no memory of what it has already reported.
- The TOS re-check depends on "the version on file in Files," a baseline the user keeps up by hand.
- Missing pieces:
  - content snapshots with a diff
  - change-event triggers
  - de-duplication of findings
  - an audit log of "what changed, when, and what we decided"
  - materiality calibrated to the company profile and its contract exposure
  - evals for false-positive and false-negative change alerts

**(d) Follow-through: tracking actions after a change**
- GC AI has no tasks or owners. Automations belong to one person and cannot be shared. Slack notifications are only on the roadmap.
- Legora Monitors (owners, audit trail) and Harvey II (tasks assigned to lawyers or agents) are ahead.
- [INFERRED] An "impact register" would close the loop and fit GC AI's primitives (Vault manual columns, cell notes, connectors with write-approval, redlines from automations). It would track each affected document with an owner, a status (review-needed / no-action / amended), a due date and a link to the proposed redline.

**Positioning note [INFERRED].**
- A pure "monitor URLs + company profile + prompt" build is *not* new for GC AI. Automations plus the published vendor-TOS recipe already cover it.
- The differentiated version is a user-initiated, long-running job with four properties:
  1. It holds durable state (snapshots, a change log).
  2. It fans out subagents across the company's Vault or portfolio.
  3. It judges materiality against the company profile and the actual clauses.
  4. It writes an impact register, with evals behind it.
- That matches both the interviewer's stated direction (long-running, user-initiated first) and the job post's emphasis on evals, tool-use pipelines and multi-agent systems.

---

## 4. Open items (not verified; the search budget ran out)
- The exact launch date and launch post for Automations. The first changelog mention is 2026-06-01; there is no May 2026 changelog page in the docs index.
- Full Harvey Horizon Scanning documentation, including whether it maps to a Vault. Only the blog was read.
- Spellbook "Associate" and "Library" details. CoCounsel and Protégé runtime claims.
- Podcast or talk content from Bardia Pourvakil on evals or harness design. None found.
- The CCBJ article "In-House Legal AI Needs a Different Architecture" (2026-08-20), linked from https://gc.ai/company/about. Not read.
