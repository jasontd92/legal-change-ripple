import { useEffect, useRef, useState } from "react";
import { excerptRows, hunkForRange, type DiffRow, type ReviewDiff } from "../../src/diff";
import {
  changeLabel,
  clockChip,
  companyDocumentLabel,
  documentIdentity,
  agentNote,
  fileName,
  formatAmount,
  legalLabel,
  plainReason,
  quoteExcerpt,
  splitWhat,
  whenDetail,
} from "../../src/report-display";
import { DiffExcerpt, DiffViewer } from "./DiffView";

type Span = { file: string; start: number; end: number; quote?: string; section_label?: string | null };
export type ReportItem = {
  rank: number;
  stack_id: string;
  finding_id: string;
  change_ref: string;
  category?: string;
  group?: string;
  headline?: string;
  amount?: number | null;
  what?: string;
  why?: string;
  when?: string;
  rationale?: string;
  labels?: { urgency?: string; materiality?: string; direction?: string; response_type?: string };
  citations?: { trigger?: Span; clause?: Span };
};
export type ReportData = {
  items: ReportItem[];
  not_material: { stack_id: string; finding_id: string; reason: string }[];
  change_item_closure: { change_ref: string; status: string; reason?: string }[];
};
export type ChangeBrief = { id: string; summary?: string; substantive?: boolean; start?: number; end?: number };

type Deadline = { text: string; hot: boolean; date: string | null };
type Verdict = "approved" | "dismissed";

const PASSIVE = new Set(["monitor", "no_action"]);
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/**
 * The morning report, read top down: a verdict, the things to do, then what to
 * watch and what was set aside. Each layer stays folded until it is asked for.
 * With a run id, the GC's approve and dismiss marks are saved to that run.
 */
export function ReportView({
  report,
  legalStatus,
  asOf = "2026-10-01",
  diff = null,
  changes = [],
  runId,
}: {
  report: ReportData;
  legalStatus: Map<string, string>;
  asOf?: string;
  diff?: ReviewDiff | null;
  changes?: ChangeBrief[];
  runId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ line: number | null } | null>(null);
  const { verdicts, mark, undo, dismissNotice } = useVerdicts(runId);
  const [dismissedOpen, setDismissedOpen] = useState(false);
  const all = [...report.items].sort((a, b) => a.rank - b.rank);
  const dismissed = all.filter((item) => verdicts.get(keyOf(item)) === "dismissed");
  const ranked = all.filter((item) => verdicts.get(keyOf(item)) !== "dismissed");
  const act = ranked.filter(needsAction);
  const watch = ranked.filter((item) => !needsAction(item));
  const [watchOpen, setWatchOpen] = useState(act.length === 0);
  const [asideOpen, setAsideOpen] = useState(false);
  const setAside = report.change_item_closure.filter((row) => row.status !== "addressed");
  const asideCount = setAside.length + report.not_material.length;
  const reviewed = report.change_item_closure.length;
  const year = asOf.slice(0, 4);
  const deadlines = act.map((item) => deadlineOf(item, year));
  const earliest = deadlines.find((d) => d?.date)?.date ?? null;
  const running = deadlines.filter((d) => d?.hot).length;

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  function openViewer(line: number | null) {
    setAsideOpen(true);
    setViewer({ line });
  }

  function list(items: ReportItem[]) {
    return (
      <div className="findings">
        {items.map((item) => {
          const id = `${item.stack_id}:${item.finding_id}`;
          return (
            <FindingRow
              key={id}
              item={item}
              year={year}
              expanded={openId === id}
              legal={legalFor(item, legalStatus)}
              diff={diff}
              verdict={verdicts.get(id) ?? null}
              onVerdict={(next) => {
                if (next === "dismissed" && openId === id) setOpenId(null);
                mark(item, next);
              }}
              onToggle={() => toggle(id)}
              onOpenDiff={openViewer}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="report">
      <header className="hero">
        <h1>{verdict(act.length)}</h1>
        <p className="subhead">{subhead(act.length, watch.length, reviewed, earliest, running)}</p>
      </header>

      {act.length > 0 && list(act)}

      {watch.length > 0 && (
        <section className="next">
          <h2>
            <button className="handoff" type="button" aria-expanded={watchOpen} onClick={() => setWatchOpen((open) => !open)}>
              {act.length > 0
                ? `That's everything that needs you. ${num(watch.length)} more ${watch.length === 1 ? "is" : "are"} worth watching.`
                : `${num(watch.length)} ${watch.length === 1 ? "change is" : "changes are"} worth watching.`}
              <span className="arrow" aria-hidden="true">{watchOpen ? "↑" : "→"}</span>
            </button>
          </h2>
          {watchOpen && list(watch)}
        </section>
      )}

      {(reviewed > 0 || asideCount > 0 || diff?.kind === "first") && (
        <section className="next quiet-end">
          <h2>
            <button className="handoff" type="button" aria-expanded={asideOpen} onClick={() => setAsideOpen((open) => !open)}>
              {reviewed > 0 ? `Reviewed ${plural(reviewed, "change")}. ` : ""}
              {asideCount > 0 ? `${num(asideCount)} didn't affect you.` : "Nothing was set aside."}
              <span className="arrow" aria-hidden="true">{asideOpen ? "↑" : "→"}</span>
            </button>
          </h2>
          {asideOpen && (
            <div className="aside">
              {diff?.kind === "first" && <p className="body">This is the first reading of this source, so there is no earlier version to compare.</p>}
              {asideCount > 0 && (
                <ul className="plain">
                  {report.not_material.map((row) => (
                    <li key={`${row.stack_id}:${row.finding_id}`}>
                      <span className="lead">{documentIdentity(row.stack_id).line}</span>
                      <span className="meta">{plainReason(row.reason)}</span>
                    </li>
                  ))}
                  {setAside.map((row) => {
                    const brief = changes.find((change) => change.id === row.change_ref);
                    return (
                      <li key={row.change_ref}>
                        <span className="lead">{brief?.summary?.trim() || "Change"}</span>
                        {row.reason && <span className="meta">{plainReason(row.reason)}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
              {diff?.kind === "compared" && diff.hunks.length > 0 && (
                <>
                  <button
                    className="more"
                    type="button"
                    aria-expanded={viewer !== null}
                    onClick={() => setViewer((current) => (current === null ? { line: null } : null))}
                  >
                    {viewer === null ? "See the whole change" : "Hide the whole change"}
                  </button>
                  {viewer !== null && <DiffViewer diff={diff} focusLine={viewer.line} />}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {dismissed.length > 0 && (
        <section className="next quiet-end">
          <h2>
            <button className="handoff" type="button" aria-expanded={dismissedOpen} onClick={() => setDismissedOpen((open) => !open)}>
              {`You dismissed ${plural(dismissed.length, "finding")}.`}
              <span className="arrow" aria-hidden="true">{dismissedOpen ? "↑" : "→"}</span>
            </button>
          </h2>
          {dismissedOpen && (
            <ul className="plain dismissed">
              {dismissed.map((item) => (
                <li key={keyOf(item)}>
                  <span className="lead">{item.headline?.trim() || splitWhat(item.what).lead}</span>
                  <button className="more" type="button" onClick={() => mark(item, null)}>restore</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {dismissNotice && (
        <div className="toast" role="status">
          <span>Dismissed.</span>
          <button type="button" onClick={undo}>Undo</button>
        </div>
      )}
    </div>
  );
}

function keyOf(item: { stack_id: string; finding_id: string }): string {
  return `${item.stack_id}:${item.finding_id}`;
}

/**
 * Approve and dismiss marks for one run. Changes show at once and are saved in
 * the background; a failed save puts the previous mark back. Without a run id
 * (the sample page) marks stay in the page.
 */
function useVerdicts(runId: string | undefined) {
  const [verdicts, setVerdicts] = useState<Map<string, Verdict>>(new Map());
  const [dismissNotice, setDismissNotice] = useState<ReportItem | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setVerdicts(new Map());
    if (!runId) return;
    let stop = false;
    void fetch(`/api/runs/${encodeURIComponent(runId)}/verdicts`)
      .then((r) => r.json())
      .then((body: { verdicts?: { stack_id: string; finding_id: string; verdict: Verdict }[] }) => {
        if (stop) return;
        setVerdicts(new Map((body.verdicts ?? []).map((row) => [keyOf(row), row.verdict])));
      })
      .catch(() => {});
    return () => { stop = true; };
  }, [runId]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function put(key: string, next: Verdict | null) {
    setVerdicts((prev) => {
      const copy = new Map(prev);
      if (next) copy.set(key, next);
      else copy.delete(key);
      return copy;
    });
  }

  function mark(item: ReportItem, next: Verdict | null) {
    const key = keyOf(item);
    const before = verdicts.get(key) ?? null;
    put(key, next);
    window.clearTimeout(timer.current);
    if (next === "dismissed") {
      setDismissNotice(item);
      timer.current = window.setTimeout(() => setDismissNotice(null), 6000);
    } else {
      setDismissNotice(null);
    }
    if (!runId) return;
    const body = {
      stack_id: item.stack_id,
      finding_id: item.finding_id,
      verdict: next,
      snapshot: { change_ref: item.change_ref, headline: item.headline, ...item.labels },
    };
    void fetch(`/api/runs/${encodeURIComponent(runId)}/verdicts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); })
      .catch(() => put(key, before));
  }

  function undo() {
    if (dismissNotice) mark(dismissNotice, null);
  }

  return { verdicts, mark, undo, dismissNotice };
}

/**
 * Shown while the review is still reading documents: the change itself is known
 * well before the report, so the GC can start reading it.
 */
export function ChangesSoFar({ diff, changes }: { diff: ReviewDiff | null; changes: ChangeBrief[] }) {
  const [viewer, setViewer] = useState<{ line: number | null } | null>(null);
  const real = changes.filter((change) => change.substantive !== false);
  const noise = changes.length - real.length;
  const compared = diff?.kind === "compared" && diff.hunks.length > 0 ? diff : null;
  if (changes.length === 0 && !compared) return null;
  return (
    <section className="early">
      <h2>{changes.length === 0 ? "Comparing the two versions." : real.length === 0 ? "Only formatting changed." : `${num(real.length)} ${real.length === 1 ? "change" : "changes"} found.`}</h2>
      {real.length > 0 && <p className="subhead">Checking your documents against {real.length === 1 ? "it" : "them"} now.</p>}
      {real.length > 0 && (
        <ul className="plain">
          {real.map((change) => {
            const located = compared && change.start != null && change.end != null ? locatedChange(compared, change.start, change.end) : null;
            return (
              <li key={change.id}>
                <span className="lead">{change.summary?.trim() || "Change"}</span>
                {located && (
                  <button className="more" type="button" onClick={() => setViewer({ line: located.line })}>
                    see it in the text
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {noise > 0 && <p className="meta">{num(noise)} formatting or noise {noise === 1 ? "edit was" : "edits were"} set aside.</p>}
      {compared && (
        <>
          <button className="more" type="button" aria-expanded={viewer !== null} onClick={() => setViewer((current) => (current === null ? { line: null } : null))}>
            {viewer === null ? "See the whole change" : "Hide the whole change"}
          </button>
          {viewer !== null && <DiffViewer diff={compared} focusLine={viewer.line} />}
        </>
      )}
    </section>
  );
}

function FindingRow({
  item,
  year,
  expanded,
  legal,
  diff,
  verdict,
  onVerdict,
  onToggle,
  onOpenDiff,
}: {
  item: ReportItem;
  year: string;
  expanded: boolean;
  legal: string | null;
  diff: ReviewDiff | null;
  verdict: Verdict | null;
  onVerdict: (next: Verdict | null) => void;
  onToggle: () => void;
  onOpenDiff: (line: number | null) => void;
}) {
  const [evidence, setEvidence] = useState(false);
  const id = `${item.stack_id}:${item.finding_id}`;
  const panelId = `finding-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const doc = documentIdentity(item.stack_id);
  const split = splitWhat(item.what);
  const headline = item.headline?.trim() || split.lead;
  const deadline = deadlineOf(item, year);
  const amount = formatAmount(item.amount);
  const clock = clockChip(item.labels?.urgency, item.when);
  const timing = whenDetail(item.labels?.urgency, item.when, clock.label);
  const lead = item.headline?.trim() ? item.what?.trim() ?? "" : "";
  const note = agentNote(headline, item.why, [lead, split.rest].filter(Boolean).join(" "), timing);
  const trigger = item.citations?.trigger;
  const clause = item.citations?.clause;
  const located = diff && trigger ? locatedChange(diff, trigger.start, trigger.end) : null;
  const context = [doc.line, legal].filter(Boolean).join(" · ");

  return (
    <article className={`finding${expanded ? " open" : ""}${verdict === "approved" ? " approved" : ""}`}>
      <div className="row-line">
        <button className="row" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={onToggle}>
          <span className="headline">{headline}</span>
          {(amount || deadline) && (
            <span className="stakes">
              {amount && <span className="amount">{amount}</span>}
              {deadline && <span className={deadline.hot ? "due hot" : "due"}>{deadline.text}</span>}
            </span>
          )}
        </button>
        <div className="verdict-actions">
          <button
            className="icon approve"
            type="button"
            aria-pressed={verdict === "approved"}
            aria-label={verdict === "approved" ? "Approved. Click to clear" : "Approve this finding"}
            title={verdict === "approved" ? "Approved" : "Approve"}
            onClick={() => onVerdict(verdict === "approved" ? null : "approved")}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="icon dismiss"
            type="button"
            aria-label="Dismiss this finding"
            title="Dismiss"
            onClick={() => onVerdict("dismissed")}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path d="M4 6h12M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6M8.5 9v4M11.5 9v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {expanded && (
        <div className="detail" id={panelId}>
          {note && <p className="body">{note}</p>}
          <p className="meta">{context}</p>
          <button className="more" type="button" aria-expanded={evidence} onClick={() => setEvidence((open) => !open)}>
            {evidence ? "Hide the language" : "See the language"}
          </button>
          {evidence && (
            <div className="sources">
              <Source
                tone="yours"
                eyebrow="Your document"
                title={clause ? companyDocumentLabel(clause.file, clause.section_label) : doc.line}
                quote={clause?.quote}
                file={clause?.file}
              />
              <Source
                tone="change"
                eyebrow="The change"
                title={trigger ? changeLabel(trigger.file) : "Change"}
                quote={trigger?.quote}
                file={trigger?.file}
                excerpt={located ?? undefined}
                onOpenDiff={located?.truncated ? () => onOpenDiff(located.line) : undefined}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Source({
  tone,
  eyebrow,
  title,
  quote,
  file,
  excerpt,
  onOpenDiff,
}: {
  tone: "change" | "yours";
  eyebrow: string;
  title: string;
  quote?: string;
  file?: string;
  excerpt?: { rows: DiffRow[]; truncated: boolean };
  onOpenDiff?: () => void;
}) {
  const [more, setMore] = useState(false);
  const quoteView = quoteExcerpt(quote);
  const text = quote?.trim() ?? "";
  const shown = excerpt && excerpt.rows.length > 0;
  return (
    <div className={`source ${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      {shown ? (
        <DiffExcerpt rows={excerpt.rows} />
      ) : text ? (
        <blockquote className="passage">{more ? text : quoteView.lead}</blockquote>
      ) : (
        <p className="passage missing">Quoted language was not stored.</p>
      )}
      {!shown && quoteView.more && (
        <button className="more" type="button" onClick={() => setMore((open) => !open)}>
          {more ? "see less" : "see more"}
        </button>
      )}
      {onOpenDiff && (
        <button className="more" type="button" onClick={onOpenDiff}>
          in the full change
        </button>
      )}
      {more && !shown && file && <p className="file">{fileName(file)}</p>}
    </div>
  );
}

/** An item needs the GC when a clock is running or the response is something to do, not to watch. */
function needsAction(item: ReportItem): boolean {
  if (clockChip(item.labels?.urgency, item.when).tone === "act") return true;
  const response = item.labels?.response_type;
  return Boolean(response) && !PASSIVE.has(response ?? "");
}

function deadlineOf(item: ReportItem, year: string): Deadline | null {
  const clock = clockChip(item.labels?.urgency, item.when);
  if (clock.tone === "none") return null;
  const date = /[A-Z][a-z]{2} \d{1,2}, \d{4}/.exec(clock.label)?.[0].replace(`, ${year}`, "") ?? null;
  if (!date) return { text: clock.tone === "act" ? "Deadline running" : "Deadline ahead", hot: clock.tone === "act", date: null };
  return { text: clock.tone === "act" ? `by ${date}` : `due ${date}`, hot: clock.tone === "act", date };
}

function verdict(act: number): string {
  if (act === 0) return "Nothing needs you today.";
  if (act === 1) return "One thing needs you.";
  return `${num(act)} things need you.`;
}

function subhead(act: number, watch: number, reviewed: number, earliest: string | null, running: number): string {
  if (act > 0 && earliest) return `The earliest deadline is ${earliest}.`;
  if (act > 0 && running === 1) return "One has a deadline running.";
  if (act > 0 && running > 1) return `${num(running)} have a deadline running.`;
  if (act > 0) return "None has a deadline running.";
  if (watch > 0) return "No deadlines are running, and nothing needs a response yet.";
  if (reviewed > 0) return `Reviewed ${plural(reviewed, "change")}. None affects your documents.`;
  return "The review found nothing that affects your documents.";
}

function num(n: number): string {
  return WORDS[n] ?? String(n);
}

function plural(n: number, noun: string): string {
  return `${n <= 10 ? num(n).toLowerCase() : n} ${noun}${n === 1 ? "" : "s"}`;
}

function locatedChange(diff: ReviewDiff, start: number, end: number) {
  const hunk = hunkForRange(diff.hunks, start, end);
  if (!hunk) return null;
  return excerptRows(hunk, diff.lines, start, end);
}

function legalFor(item: ReportItem, legalStatus: Map<string, string>): string | null {
  const fromChange = legalStatus.get(item.change_ref);
  const raw = fromChange ?? /legal_status=([a-z_]+)/.exec(item.rationale ?? "")?.[1];
  if (!raw || raw === "in_force") return null;
  return legalLabel(raw);
}
