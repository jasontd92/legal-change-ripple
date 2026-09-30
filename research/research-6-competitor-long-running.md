# Research 6: long-running use cases at Harvey and Legora vs GC AI (2026-09-25)

Sources were fetched directly this session. The web-search budget was used up, so
this covers vendor blogs and product pages only, which are marketing claims.
Fetches go through a summariser, so the quotes are close to the source but not
guaranteed verbatim.

## Harvey
| What | Mode | Source |
|---|---|---|
| Harvey II: "worked through the latest batch of material contracts in the data room overnight and returned a first-pass review in your format." Spaces hold documents, parties, tasks and history. Tasks go to "lawyers or agents." Memory carries across Harvey, Word and Outlook. | Long-running background work in a persistent workspace | harvey.ai/blog/introducing-harvey-ii (2026-08-18) |
| Horizon Scanning: 12,000+ sources in 100+ jurisdictions plus user-added public sources. Scans are set up in plain language. Each update gets a relevance assessment. Daily digest. Can be turned into "a memo revision, a recommended policy update, or an interactive timeline of upcoming obligations." Compliance teams: "flags which internal policies are affected… suggests revisions." Tariff and data-protection examples. | Proactive monitoring, then impact on *internal policies* | harvey.ai/blog/horizon-scanning-in-harvey (2026-09-01) |
| Contract Review Agents: compare counterparty redlines with positions "accepted in executed contracts… clause by clause", "surface inconsistencies in what your team is agreeing to", and recommend updating the standards. | On demand, across the whole contract set | harvey.ai/blog/contract-review-agents-in-harvey (2026-09-10) |
| Review-table agent actions: edit hundreds of cells, rerun columns, add rows as documents arrive, route rows to reviewers. | Triggered by hand | harvey.ai/blog/review-table-agent-actions (2026-09-17) |
| Agentic Vault organisation: plan, then confirm, then execute, with undo. | Human in the loop | harvey.ai/blog/agentic-vault-search-and-organization (2026-09-08) |
| In-house customer stories: ASML automated DPIAs and handled about 1,000 employment queries a month. A professional-services firm found missing revenue-uplift clauses. Repsol ran M&A in-house (about €200k saved). | Customer stories | harvey.ai/blog/in-house-teams-increase-capacity-legal-ai (2026-09-22) |

## Legora
| What | Mode | Source |
|---|---|---|
| Legora Agent: plan, then execute across documents and tools, then "evaluates whether it achieved your goal, loops back… iterates", then Word/Excel/PPT deliverables. "Monitors your email, documents, and projects and acts the moment something needs attention." Earlier research found "dispatches sub-agents… Forty minutes later, the draft report is complete." | Long-running, and proactive on events | legora.com/product/agent |
| Monitors: jurisdictions and topics, then triage (summary, owners), then "compare current law, assess impact, track tasks, produce final deliverables". Impact is assessed against the *business*, not specific documents. | Proactive monitoring with owners and tasks | legora.com/product/monitors |
| Diligence: "organize [the data room], review it exhaustively and produce the diligence report". Memory of "prior positions, preferred drafting styles… across sessions". | Long-running | legora.com/blog/2026-the-year-of-agents-in-legal-ai |
| Intake: a legal front door that asks clarifying questions, answers routine requests instantly, and gives a first pass on complex ones. | Event-driven | legora.com/blog/the-real-cost-of-legal-intake (2026-09-15) |
| Consumption-based "Agent Pro" pricing. | Pricing for long agent runs | legora.com/blog/consumption-based-pricing (2026-06-23) |

## GC AI's equivalents (docs.gc.ai changelog and guides)
- **Automations:** triggered by schedule only; each run is a fresh chat. Since 2026-09-15 an automation can leave tracked-change redlines.
- **Triage:** Slack triage exists only as a **Zapier + API recipe**. There's no native event trigger.
- **Agent Connectors (2026-07-31):**
  - They cover Gmail, Outlook, Slack, Jira SM, Todoist, Airtable, Box and others.
  - Writes need approval (2026-09-09).
  - Tasks live in *other* apps (Todoist or Jira), not in GC AI.
- **Contract Intelligence / Vaults (GA 2026-08-05)** gets updates nearly every week:
  - "Current Terms" amendment timeline (2026-09-09)
  - linked hosted terms detected but not fetched (2026-09-09)
  - manual columns and cell notes (2026-09-15)
  - child documents that inherit terms from their governing agreement (2026-09-22)
  - Vault chat sharing (2026-09-22)
- **Memory:** "agentic chat history search" (2026-06-17) is recall on demand, not persistent memory.
- **"tasks" (unknown):** the chat-history filter lists "tasks" as a source (2026-09-22). What that feature is wasn't found. **Unknown; ask or check the trial account.**
