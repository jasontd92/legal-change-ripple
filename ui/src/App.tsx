import type { ReviewDiff } from "../../src/diff";
import { useEveAgent, type EveMessageData } from "eve/react";
import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { documentIdentity, plainReason } from "../../src/report-display";
import { ChangesSoFar, ReportView, type ChangeBrief, type ReportData } from "./ReportView";
import { sampleChanges, sampleDiff, sampleLegal, sampleReport } from "./sampleReport";

type Version = { id: string; title?: string; effective?: string; source_url?: string | null };
type Trigger = { group: string; summary?: string; versions: Version[] };
type Config = { id: string; file: string; label: string };
type Report = ReportData;
type Coverage = { reviewed_stacks: string[]; excluded_stacks: { stack_id?: string; reason?: string }[]; unparseable_files: string[] };
type RunPayload = {
  error?: string;
  job?: { status: string; error?: string } | null;
  run?: { status: string; stages?: { stage: string; status: string }[]; scenario?: { as_of?: string } } | null;
  impact_report?: Report | null;
  coverage?: Coverage | null;
  raw_change?: { exit?: boolean; reason?: string } | null;
  diff?: ReviewDiff | null;
  change_record?: {
    company_gate?: string;
    items?: { id: string; summary?: string; substantive: boolean; legal_status?: string; anchor?: { start?: number; end?: number } }[];
  } | null;
};

const ClusterMap = lazy(() => import("./ClusterMap"));

/** Configs that cannot run a review from this page: the offline stub, and the Jev classifier config. */
const NOT_ORCHESTRATORS = new Set(["stub", "j-jev"]);

const TERMINAL = new Set(["completed", "failed", "resumed_completed", "partial"]);

export function App() {
  const hash = useHash();
  const sessionId = /^#\/sessions\/(.+)$/.exec(hash)?.[1];
  const runId = /^#\/runs\/([^/]+)$/.exec(hash)?.[1];
  const mapRun = /^#\/runs\/([^/]+)\/clusters$/.exec(hash)?.[1];
  const map = hash === "#/clusters" || Boolean(mapRun);
  const preview = hash === "#/preview";
  const past = hash === "#/runs";
  const setup = !sessionId && !runId && !preview && !past && !map;
  return (
    <div className="shell">
      <header className="top">
        <div className="mark">Meridian Mechanical Group</div>
        <nav className="top-nav">
          <a className="nav-quiet" href="#/runs" aria-current={past ? "page" : undefined}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v4l2.5 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Past reviews
          </a>
          {!setup && <a className="button" href="#/setup">
            <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
              <path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New review
          </a>}
        </nav>
      </header>
      {sessionId ? <SessionPage key={sessionId} id={decodeURIComponent(sessionId)} /> : runId ? <ReportPage id={decodeURIComponent(runId)} /> : preview ? <SamplePage /> : past ? <PastReviews /> : map ? (
        <Suspense fallback={<p className="meta">Loading the map…</p>}>
          <ClusterMap key={mapRun ?? ""} runId={mapRun ? decodeURIComponent(mapRun) : undefined} />
        </Suspense>
      ) : <Setup />}
    </div>
  );
}

type RunSummary = {
  run_id: string;
  status?: string;
  group: string | null;
  model: string | null;
  started_at: string | null;
  findings: number | null;
};

function PastReviews() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/runs")
      .then((r) => r.json())
      .then((body: { runs: RunSummary[] }) => setRuns(body.runs))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <>
      <h1>Past reviews</h1>
      <p className="lede">Every review run on this machine, newest first.</p>
      {error && <p className="err">{error}</p>}
      {runs === null && !error && <p className="meta">Loading…</p>}
      {runs?.length === 0 && <p className="meta">No reviews yet. <a href="#/setup">Start one.</a></p>}
      {runs && runs.length > 0 && (
        <ul className="plain runs">
          {runs.map((run) => (
            <li key={run.run_id}>
              <a href={`#/runs/${encodeURIComponent(run.run_id)}`}>
                <span className="lead">{run.group ?? run.run_id}</span>
                <span className={`meta${run.status === "failed" ? " bad" : ""}`}>
                  {[when(run.started_at), outcome(run), run.model].filter(Boolean).join(" · ")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function when(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function outcome(run: RunSummary): string {
  if (run.status === "failed") return "Failed";
  if (run.findings !== null) return run.findings === 1 ? "1 finding" : `${run.findings} findings`;
  if (run.status === "partial") return "Stopped partway";
  if (run.status === "completed" || run.status === "resumed_completed") return "No report";
  return "Running";
}

function SamplePage() {
  return (
    <>
      <p className="kicker page-kicker">Daily review · sample fixtures</p>
      <ReportView report={sampleReport} legalStatus={sampleLegal} asOf="2026-10-01" diff={sampleDiff} changes={sampleChanges} />
    </>
  );
}

function Setup() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [profile, setProfile] = useState("");
  const [group, setGroup] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [older, setOlder] = useState("");
  const [newer, setNewer] = useState("");
  const [config, setConfig] = useState("configs/o1-glm.json");
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const armed = useRef(false);
  const agent = useEveAgent({
    onSessionChange(session) {
      if (!armed.current || !session?.sessionId) return;
      const next = `#/sessions/${encodeURIComponent(session.sessionId)}`;
      if (location.hash !== next) location.hash = next;
    },
  });

  useEffect(() => {
    void fetch("/api/triggers").then((r) => r.json()).then((body: { triggers: Trigger[] }) => {
      setTriggers(body.triggers);
      setGroup(body.triggers[0]?.group ?? "");
    });
    void fetch("/api/configs").then((r) => r.json()).then((body: { configs: Config[] }) => setConfigs(body.configs));
    void fetch("/api/profile").then((r) => r.json()).then((body: { data: unknown }) => setProfile(JSON.stringify(body.data, null, 2)));
  }, []);

  const selected = triggers.find((t) => t.group === group);
  const snapshots = byEffective(selected?.versions ?? []);
  const olderAt = snapshots.findIndex((v) => v.id === older);
  const newerAt = snapshots.findIndex((v) => v.id === newer);
  const snapshotKey = snapshots.map((v) => v.id).join("|");
  const source = snapshots.find((v) => v.id === newer)?.source_url ?? null;

  useEffect(() => {
    const ids = snapshotKey ? snapshotKey.split("|") : [];
    setNewer(ids[ids.length - 1] ?? "");
    setOlder(ids.length > 1 ? ids[ids.length - 2] ?? "" : "");
  }, [snapshotKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const body = liveUrl.trim()
      ? { source_url: liveUrl.trim(), config, custom_prompt: custom || null, as_of: "2026-10-01" }
      : {
          trigger_group: group,
          versions: older && older !== newer ? [older, newer] : [newer],
          config,
          custom_prompt: custom || null,
          as_of: "2026-10-01",
          scenario_id: `${group}-${Date.now()}`,
        };
    armed.current = true;
    try {
      await agent.send(`Start this review. Call the review tool once with this JSON and no other tools.\n${JSON.stringify(body)}`);
    } catch (err) {
      armed.current = false;
      setBusy(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <h1>Impact review</h1>
      <p className="lede">One monitored authority, one session. The review keeps running if you leave this page. Opening the session again catches up and follows it.</p>
      <form onSubmit={submit}>
        <label htmlFor="profile">Company profile</label>
        <textarea id="profile" readOnly value={profile} />
        <label htmlFor="group">Authority</label>
        <select id="group" value={group} onChange={(e) => setGroup(e.target.value)}>
          {triggers.map((t) => <option key={t.group} value={t.group}>{t.group}</option>)}
        </select>
        <div className="row">
          <div>
            <label htmlFor="older">Previous snapshot</label>
            <select id="older" value={older} onChange={(e) => setOlder(e.target.value)}>
              <option value="">First observation</option>
              {snapshots.map((v, i) => <option key={v.id} value={v.id} disabled={newerAt >= 0 && i >= newerAt}>{v.title || v.id}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="newer">Current snapshot</label>
            <select id="newer" value={newer} onChange={(e) => setNewer(e.target.value)}>
              {snapshots.map((v, i) => <option key={v.id} value={v.id} disabled={olderAt >= 0 && i <= olderAt}>{v.title || v.id}</option>)}
            </select>
          </div>
        </div>
        {source && <p className="meta source-link">Source: <a href={source} target="_blank" rel="noreferrer">{source.replace(/^https?:\/\/(www\.)?/, "")}</a></p>}
        <label htmlFor="live">Or fetch a live URL <span id="live-note" className="aside-note">(scheduled monitoring, reviews only on change. Not enabled in this demo.)</span></label>
        <input id="live" value={liveUrl} placeholder="https://…" disabled aria-describedby="live-note" onChange={(e) => setLiveUrl(e.target.value)} />
        <label htmlFor="config">Model</label>
        <select id="config" value={config} onChange={(e) => setConfig(e.target.value)}>
          {configs.filter((c) => !NOT_ORCHESTRATORS.has(c.id)).map((c) => <option key={c.id} value={c.file}>{c.label}</option>)}
        </select>
        <label htmlFor="custom">Custom instructions</label>
        <textarea id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Optional. Name a document cluster to leave out of the review. The instruction is recorded next to the exclusion." />
        {error && <p className="err">{error}</p>}
        <div className="actions">
          <button type="submit" disabled={busy || !newer && !liveUrl.trim()}>{busy ? "Starting…" : "Start review"}</button>
        </div>
      </form>
    </>
  );
}

/** Oldest first, so "previous" can only be an earlier version. Undated versions keep their listed order at the end. */
function byEffective(versions: Version[]): Version[] {
  return versions
    .map((v, i) => ({ v, i }))
    .sort((a, b) => (a.v.effective ?? "9999").localeCompare(b.v.effective ?? "9999") || a.i - b.i)
    .map(({ v }) => v);
}

type ReviewStep = { id: string; label: string; state: "running" | "done" | "failed"; detail: string };
type ReviewStream = { run_id: string; status: string; steps: ReviewStep[] };

function SessionPage({ id }: { id: string }) {
  const agent = useEveAgent({ initialSession: { sessionId: id, streamIndex: 0 }, resume: true });
  const review = reviewFrom(agent.data);
  const reply = assistantText(agent.data);
  const [data, setData] = useState<RunPayload | null>(null);
  const statusRef = useRef(agent.status);
  statusRef.current = agent.status;
  const runId = review?.run_id ?? "";

  useEffect(() => {
    if (!runId) return;
    let stop = false;
    async function poll() {
      const response = await fetch(`/api/runs/${encodeURIComponent(runId)}`);
      const body = await response.json() as RunPayload;
      if (stop) return;
      setData(body);
      const settled = Boolean(body.impact_report || body.raw_change?.exit || body.run?.status === "completed" || body.run?.status === "failed" || body.run?.status === "resumed_completed");
      const eveBusy = statusRef.current === "submitted" || statusRef.current === "streaming" || statusRef.current === "resuming";
      if (!settled || eveBusy) window.setTimeout(poll, 1000);
    }
    void poll();
    return () => { stop = true; };
  }, [runId]);

  const steps = review?.steps ?? [];
  const waiting = steps.length === 0 && (agent.status === "submitted" || agent.status === "streaming" || agent.status === "resuming");
  const report = data?.impact_report;

  return (
    <>
      {report ? <p className="kicker page-kicker">Impact review</p> : (
        <>
          <h1>Impact review</h1>
          <p className="lede">Session {id}. Leaving this page does not stop the review.</p>
        </>
      )}
      {agent.error && <p className="err">{agent.error.message}</p>}
      {review?.status === "unchanged" && <div className="banner"><strong>No new review.</strong> That URL matches the last snapshot.</div>}
      {data?.raw_change?.exit && <div className="banner"><strong>No substantive change.</strong> {data.raw_change.reason}</div>}
      {data?.change_record?.company_gate === "exit" && <div className="banner">The company gate exited. The profile makes this authority inapplicable, so no document clusters were reviewed.</div>}
      {!report && <ChangesSoFar diff={data?.diff ?? null} changes={changeBriefs(data?.change_record)} />}
      <StepActivity steps={steps} waiting={waiting} />
      {reply && <p className="meta">{reply}</p>}
      {!report && review?.status === "running" && <p>The review is still running. Each line above is a step finishing on the session.</p>}
      {report && <ReportView report={report} legalStatus={legalMap(data?.change_record)} asOf={data?.run?.scenario?.as_of} diff={data?.diff} changes={changeBriefs(data?.change_record)} runId={runId} />}
      {data?.coverage && <Coverage coverage={data.coverage} runId={runId} />}
    </>
  );
}

function reviewFrom(data: EveMessageData): ReviewStream | null {
  let found: ReviewStream | null = null;
  for (const message of data.messages) {
    for (const part of message.parts) {
      if (part.type !== "dynamic-tool" || part.toolName !== "review") continue;
      if ((part.state === "input-streaming" || part.state === "input-available") && found === null) {
        found = { run_id: "", status: "running", steps: [{ id: "diff", label: "Change", state: "running", detail: "Comparing the two snapshots." }] };
      } else if (part.state === "output-available") {
        const parsed = asReviewStream(part.output);
        if (parsed) found = parsed;
      } else if (part.state === "output-error") {
        found = failedReview(found, part.errorText);
      }
    }
  }
  return found;
}

function failedReview(previous: ReviewStream | null, errorText: string): ReviewStream {
  const steps = previous === null ? [] : previous.steps.filter((step) => step.state !== "running");
  return {
    run_id: previous === null ? "" : previous.run_id,
    status: "failed",
    steps: [...steps, { id: "error", label: "Stopped", state: "failed", detail: errorText }],
  };
}

function asReviewStream(value: unknown): ReviewStream | null {
  if (!value || typeof value !== "object") return null;
  const row = value as ReviewStream;
  if (typeof row.status !== "string" || !Array.isArray(row.steps)) return null;
  return row;
}

function assistantText(data: EveMessageData): string {
  let text = "";
  for (const message of data.messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts) {
      if (part.type === "text" && part.text.trim()) text = part.text.trim();
    }
  }
  return text;
}

function StepActivity({ steps, waiting }: { steps: ReviewStep[]; waiting: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = box.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [steps]);
  return (
    <div className="activity" ref={box} aria-live="polite">
      {steps.length === 0 && <div className="line live">{waiting ? "Waiting for the reviewer…" : "No activity yet."}</div>}
      {steps.map((step) => (
        <div className={`line${step.state === "failed" ? " bad" : ""}${step.state === "running" ? " live" : ""}`} key={step.id}>
          {step.label}{step.detail ? ` · ${step.detail}` : ""}
        </div>
      ))}
    </div>
  );
}

function ReportPage({ id }: { id: string }) {
  const [data, setData] = useState<RunPayload | null>(null);
  const [seen, setSeen] = useState(id);
  if (seen !== id) {
    setSeen(id);
    setData(null);
  }

  useEffect(() => {
    let stop = false;
    async function poll() {
      const response = await fetch(`/api/runs/${encodeURIComponent(id)}`);
      const body = await response.json() as RunPayload;
      if (stop) return;
      setData(body);
      const status = body.run?.status || body.job?.status || "";
      if (!TERMINAL.has(status) && !body.raw_change?.exit) {
        window.setTimeout(poll, 1000);
      }
    }
    void poll();
    return () => { stop = true; };
  }, [id]);

  if (seen !== id || !data) return <p>Loading the run…</p>;
  if (data.error && !data.run) return <p className="err">{data.error}</p>;
  const report = data.impact_report;
  const status = data.run?.status || data.job?.status || "running";

  return (
    <>
      {report ? <p className="kicker page-kicker">{id}</p> : (
        <>
          <h1>{id}</h1>
          <p className="lede">Status: {status}{data.job?.error ? ` — ${data.job.error}` : ""}</p>
        </>
      )}
      {data.raw_change?.exit && <div className="banner"><strong>No substantive change.</strong> {data.raw_change.reason}</div>}
      {data.change_record?.company_gate === "exit" && <div className="banner">The company gate exited. The profile makes this authority inapplicable, so no document clusters were reviewed.</div>}
      {!report && <ChangesSoFar diff={data.diff ?? null} changes={changeBriefs(data.change_record)} />}
      <Activity key={id} id={id} />
      {!report && !data.raw_change?.exit && <p>The review is still running. The activity above updates as each stage and document cluster works.</p>}
      {report && <ReportView report={report} legalStatus={legalMap(data?.change_record)} asOf={data?.run?.scenario?.as_of} diff={data?.diff} changes={changeBriefs(data?.change_record)} runId={id} />}
      {data.coverage && <Coverage coverage={data.coverage} runId={id} />}
    </>
  );
}

type TraceEvent = {
  at?: string;
  type?: string;
  phase?: string;
  stage?: string;
  name?: string;
  status?: string;
  stack_id?: string;
  role?: string;
  tool?: string;
  file?: string | null;
  ok?: boolean;
  error?: string | null;
  model?: string;
  determination?: string;
  message?: string;
  reason?: string;
};

function Activity({ id }: { id: string }) {
  const [lines, setLines] = useState<TraceEvent[]>([]);
  const [open, setOpen] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let buf = "";
    async function follow() {
      const response = await fetch(`/api/runs/${encodeURIComponent(id)}/trace`, { signal: ctrl.signal });
      if (!response.body) return;
      const reader = response.body.getReader();
      const decode = new TextDecoder();
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) {
          setOpen(false);
          break;
        }
        buf += decode.decode(chunk.value, { stream: true });
        const parts = buf.split("\n");
        buf = parts.pop() ?? "";
        const incoming = parts.filter((line) => line.trim()).flatMap((line) => {
          try {
            return [JSON.parse(line) as TraceEvent];
          } catch {
            return [];
          }
        });
        if (incoming.length) setLines((prev) => foldActivity(prev, incoming));
      }
    }
    void follow().catch((err: unknown) => {
      if (ctrl.signal.aborted) return;
      const message = err instanceof Error ? err.message : String(err);
      setLines((prev) => [...prev, { type: "error", message }]);
      setOpen(false);
    });
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => {
    const node = box.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lines]);

  return (
    <div className="activity" ref={box} aria-live="polite">
      {lines.length === 0 && <div className="line live">{open ? "Waiting for the run…" : "No activity recorded."}</div>}
      {lines.map((event, index) => {
        const view = formatActivity(event);
        const live = open && index === lines.length - 1 && event.type !== "run";
        return <div className={`line${view.bad ? " bad" : ""}${live ? " live" : ""}`} key={`${event.at ?? ""}-${index}`}>{view.text}</div>;
      })}
    </div>
  );
}

function foldActivity(prev: TraceEvent[], incoming: TraceEvent[]): TraceEvent[] {
  const next = [...prev];
  for (const event of incoming) {
    const last = next[next.length - 1];
    if (event.type === "working" && last?.type === "working" && last.stack_id === event.stack_id && last.role === event.role) {
      next[next.length - 1] = event;
    } else {
      next.push(event);
    }
  }
  return next;
}

function formatActivity(event: TraceEvent): { text: string; bad: boolean } {
  const who = event.stack_id || event.role || "orchestrator";
  if (event.type === "run" && event.phase === "started") return { text: "Run started", bad: false };
  if (event.type === "run") return { text: `Run ${event.status ?? "finished"}`, bad: event.status === "failed" };
  if (event.type === "stage" && event.phase === "started") return { text: `Stage ${event.stage} · ${stageName(event.name)} · started`, bad: false };
  if (event.type === "stage") return { text: `Stage ${event.stage} · ${stageName(event.name)} · ${event.status ?? "finished"}`, bad: false };
  if (event.type === "stack") return { text: `${event.stack_id} · review started`, bad: false };
  if (event.type === "tool" && event.phase === "started") return { text: `${who} · ${event.tool} ${event.file ?? ""}`.trim(), bad: false };
  if (event.type === "tool") return { text: `${who} · ${event.tool} ${event.ok === false ? `failed · ${event.error ?? ""}` : "returned"}`.trim(), bad: event.ok === false };
  if (event.type === "finding") return { text: `${event.stack_id} · finding · ${event.determination ?? ""}`, bad: false };
  if (event.type === "working") return { text: `${who} · still working · ${event.model ?? ""}`.trim(), bad: false };
  if (event.type === "error") return { text: `Error · ${event.message ?? ""}`, bad: true };
  if (event.type === "early_exit") return { text: event.reason ?? "Exited early", bad: false };
  if (event.type === "kill_after") return { text: "Stopped early", bad: false };
  return { text: event.type ?? "event", bad: false };
}

function stageName(name: string | undefined): string {
  if (name === "stacks") return "document clusters";
  return name ?? "";
}

/** What the review covered. The per-cluster list of what was left out stays folded until asked for. */
function Coverage({ coverage, runId }: { coverage: Coverage; runId: string }) {
  const [open, setOpen] = useState(false);
  const reviewed = coverage.reviewed_stacks.length;
  const excluded = coverage.excluded_stacks.length;
  const unreadable = coverage.unparseable_files.length;
  const total = reviewed + excluded;
  return (
    <footer className="coverage">
      <div className="kicker">Coverage</div>
      <p>
        Checked{" "}
        <a href={runId ? `#/runs/${encodeURIComponent(runId)}/clusters` : "#/clusters"}>
          {total} document {total === 1 ? "cluster" : "clusters"}
        </a>
        . {reviewed} {reviewed === 1 ? "was" : "were"} reviewed and {excluded} {excluded === 1 ? "was" : "were"} set aside as unrelated to this change.
        {unreadable > 0 ? ` ${unreadable} ${unreadable === 1 ? "file" : "files"} could not be read.` : ""}
      </p>
      {excluded > 0 && (
        <>
          <button className="more" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "Hide what was set aside" : "See what was set aside"}
          </button>
          {open && (
            <ul className="plain">
              {coverage.excluded_stacks.map((row, i) => (
                <li key={row.stack_id ?? i}>
                  <span className="lead">{row.stack_id ? documentIdentity(row.stack_id).line : "Document cluster"}</span>
                  {row.reason && <span className="meta">{plainReason(row.reason)}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {unreadable > 0 && <p className="meta">Could not read: {coverage.unparseable_files.map((f) => f.split("/").pop()).join(", ")}</p>}
    </footer>
  );
}

function legalMap(record: RunPayload["change_record"]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of record?.items ?? []) {
    if (item.legal_status) map.set(item.id, item.legal_status);
  }
  return map;
}

function changeBriefs(record: RunPayload["change_record"]): ChangeBrief[] {
  return (record?.items ?? []).map((item) => ({
    id: item.id,
    summary: item.summary,
    substantive: item.substantive,
    start: item.anchor?.start,
    end: item.anchor?.end,
  }));
}

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash || "#/setup");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/setup");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}
