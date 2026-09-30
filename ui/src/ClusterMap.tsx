import { Background, Controls, Handle, Position, ReactFlow, useStore, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationLinkDatum, type SimulationNodeDatum } from "d3-force";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";

type ClusterFile = { doc_id: string; path: string; parent_id: string | null; doc_type: string | null; effective_date: string | null };
type Cluster = { id: string; folder: string; root: string; root_path: string; files: ClusterFile[] };
type Link = { source: string; target: string; source_doc: string; target_doc: string; section: string; version_pin: string | null; quote: string };
type Graph = { clusters: Cluster[]; links: Link[] };
type RunView = { reviewed: Set<string>; excluded: Set<string>; findings: Map<string, number> };
type Tone = "reviewed" | "excluded" | "finding" | "none";

type Doc = { file: ClusterFile; cluster: Cluster; isRoot: boolean };
type DocData = { doc: Doc; r: number; label: string; tone: Tone };
type HullData = { cluster: Cluster; path: string; pad: number; w: number; h: number; tone: Tone };
type FolderData = { name: string; clusters: number; standalone: number };
type Point = { x: number; y: number };
type Layout = { at: Map<string, Point>; folders: { name: string; x: number; y: number; clusters: number; standalone: number }[] };

const ROOT_R = 8;
const DOC_R = 5;
const SINGLE_R = 5.5;
const HULL_PAD = 14;
const ACRONYMS = new Set(["coi", "hvac", "po", "nda", "llc", "inc", "des", "fm", "rsu", "wa", "ca", "tx", "il", "gpc", "kps"]);

/**
 * Read-only graph of the company's documents, in the manner of a notes graph:
 * every document is a dot, lines join the documents of one cluster, a soft
 * outline marks each cluster, and folders gather into regions. Dashed lines are
 * incorporation by reference between clusters. With a run id, colour shows what
 * that review did with each cluster.
 */
export default function ClusterMap({ runId }: { runId?: string }) {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [run, setRun] = useState<RunView | null>(null);
  const [error, setError] = useState("");
  const [tip, setTip] = useState<ReactNode | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const tipEl = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const focusTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    void fetch("/api/clusters")
      .then((r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("json")) {
          throw new Error("The document clusters could not be loaded. If the server was started before this page existed, restart it.");
        }
        return r.json();
      })
      .then((body: Graph) => setGraph(body))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    setRun(null);
    if (!runId) return;
    void fetch(`/api/runs/${encodeURIComponent(runId)}`)
      .then((r) => r.json())
      .then((body: { coverage?: { reviewed_stacks: string[]; excluded_stacks: { stack_id?: string }[] } | null; impact_report?: { items: { stack_id: string }[] } | null }) => {
        const findings = new Map<string, number>();
        for (const item of body.impact_report?.items ?? []) findings.set(item.stack_id, (findings.get(item.stack_id) ?? 0) + 1);
        setRun({
          reviewed: new Set(body.coverage?.reviewed_stacks ?? []),
          excluded: new Set((body.coverage?.excluded_stacks ?? []).map((row) => row.stack_id ?? "")),
          findings,
        });
      })
      .catch(() => {});
  }, [runId]);

  const layout = useMemo(() => (graph ? forceLayout(graph) : null), [graph]);
  const flow = useMemo(() => (graph && layout ? toFlow(graph, layout, run) : null), [graph, layout, run]);
  const focusCss = useMemo(() => (graph && flow && focus ? highlightCss(graph, flow.index, focus) : ""), [graph, flow, focus]);

  useLayoutEffect(() => {
    if (tipEl.current) placeTip(tipEl.current, pointer.current.x, pointer.current.y);
  }, [tip]);
  useEffect(() => () => window.clearTimeout(focusTimer.current), []);

  const clusters = graph?.clusters.filter((c) => c.files.length > 1).length ?? 0;
  const standalone = graph ? graph.clusters.length - clusters : 0;
  const docs = graph?.clusters.reduce((n, c) => n + c.files.length, 0) ?? 0;

  /** The tooltip follows the pointer by moving its element; nothing re-renders on mouse move. */
  function follow(event: ReactMouseEvent) {
    pointer.current = { x: event.clientX, y: event.clientY };
    if (tipEl.current) placeTip(tipEl.current, event.clientX, event.clientY);
  }

  /**
   * Focus changes after a short pause, and clears after a longer one, so moving
   * across a gap or along a cluster's edge does not flash the whole graph.
   */
  function focusSoon(id: string | null) {
    window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(() => setFocus(id), id ? 40 : 160);
  }

  function onNodeEnter(event: ReactMouseEvent, node: Node) {
    follow(event);
    if (node.type === "doc") {
      const data = node.data as DocData;
      focusSoon(data.doc.cluster.id);
      setTip(docTip(data, run));
    } else if (node.type === "hull") {
      const data = node.data as HullData;
      focusSoon(data.cluster.id);
      setTip(clusterTip(data.cluster, data.tone, run));
    }
  }

  function onLeave() {
    setTip(null);
    focusSoon(null);
  }

  return (
    <>
      <h1>Document clusters</h1>
      <p className="lede">
        {graph ? `${docs} documents: ${clusters} clusters of related documents and ${standalone} standalone documents. ` : ""}
        A cluster is an agreement with everything attached to it. Zoom in to read names; hover a document to see its cluster.
        {runId && <> <a href={`#/runs/${encodeURIComponent(runId)}`}>Back to the review.</a></>}
      </p>
      <ul className="map-legend">
        <li><span className="dot" />Document</li>
        <li><span className="dot root" />Main document of a cluster</li>
        <li><span className="swatch hull" />Cluster</li>
        <li><span className="swatch link" />Incorporates by reference</li>
        {runId && <li><span className="dot reviewed" />Reviewed in this run</li>}
        {runId && <li><span className="dot finding" />Has findings</li>}
        {runId && <li><span className="dot excluded" />Set aside as unrelated</li>}
      </ul>
      {error && <p className="err">{error}</p>}
      {!flow && !error && <p className="meta">Laying out the documents…</p>}
      {flow && (
        <div className={`cluster-map${focus ? " focused" : ""}`}>
          {focusCss && <style>{focusCss}</style>}
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.08}
            maxZoom={3}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            onNodeMouseEnter={onNodeEnter}
            onNodeMouseMove={follow}
            onNodeMouseLeave={onLeave}
            onEdgeMouseEnter={(event, edge) => { if (edge.data?.links) { follow(event); setTip(linkTip(edge.data.links as Link[], graph!)); } }}
            onEdgeMouseMove={follow}
            onEdgeMouseLeave={() => setTip(null)}
          >
            <Background gap={28} size={1} color="#e2dbcf" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}
      {tip && (
        <div className="map-tip" ref={tipEl} role="tooltip">
          {tip}
        </div>
      )}
    </>
  );
}

/** Labels appear with zoom: folders always, cluster names from mid zoom, every document when close. */
function DocNode({ data }: NodeProps<Node<DocData>>) {
  const zoom = useStore((s) => s.transform[2]);
  const main = data.doc.isRoot;
  const multi = data.doc.cluster.files.length > 1;
  const labelled = multi && main ? zoom >= 1 : main ? zoom >= 1.3 : zoom >= 1.8;
  return (
    <div className={`graph-doc ${data.tone}${main && multi ? " root" : ""}`}>
      <Handle type="target" position={Position.Top} className="graph-handle" />
      <Handle type="source" position={Position.Top} className="graph-handle" />
      {(labelled || main) && (
        <span
          className={`graph-label${main ? " main" : ""}${labelled ? "" : " hidden"}`}
          style={{ fontSize: (main && multi ? 12 : 10.5) / zoom, maxWidth: 190 / zoom, marginTop: 3 / zoom }}
        >
          {data.label}
        </span>
      )}
    </div>
  );
}

function HullNode({ data }: NodeProps<Node<HullData>>) {
  return (
    <svg className={`graph-hull ${data.tone}`} width={data.w} height={data.h} aria-hidden="true">
      <path d={data.path} strokeWidth={data.pad * 2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function FolderNode({ data }: NodeProps<Node<FolderData>>) {
  const zoom = useStore((s) => s.transform[2]);
  return (
    <div className="graph-folder" style={{ opacity: zoom > 1.2 ? 0.25 : 1, fontSize: Math.min(56, (window.innerWidth < 700 ? 11 : 18) / Math.max(zoom, 0.3)) }}>
      {data.name}
      <span className="graph-folder-count">{data.clusters} clusters · {data.standalone} standalone</span>
    </div>
  );
}

const NODE_TYPES = { doc: DocNode, hull: HullNode, folder: FolderNode };

type SimNode = SimulationNodeDatum & { id: string; folder: string; r: number };

/**
 * Force layout, run to rest once, with fixed seeds so the picture is the same on
 * every load. Each folder is laid out on its own: lines inside a cluster are short
 * and stiff, incorporation links pull an order toward the terms it names, and
 * standalone documents drift loosely around them. The folders are then packed
 * together by their real size, so no space is wasted between them.
 * This is the one place a different layout (ELK, say) would plug in.
 */
function forceLayout(graph: Graph): Layout {
  const byFolder = new Map<string, Cluster[]>();
  for (const cluster of graph.clusters) byFolder.set(cluster.folder, [...(byFolder.get(cluster.folder) ?? []), cluster]);
  const folders = [...byFolder.entries()].sort((a, b) => docCount(b[1]) - docCount(a[1]) || a[0].localeCompare(b[0]));
  const clusterOfDoc = new Map<string, string>();
  for (const cluster of graph.clusters) for (const file of cluster.files) clusterOfDoc.set(file.doc_id, cluster.folder);

  const local = new Map<string, Map<string, Point>>();
  const radius = new Map<string, number>();
  for (const [name, list] of folders) {
    const nodes: SimNode[] = [];
    const links: (SimulationLinkDatum<SimNode> & { kind: "member" | "incorporates" })[] = [];
    let i = 0;
    for (const cluster of list) {
      for (const file of cluster.files) {
        const angle = i * 2.399963;
        const r = 12 * Math.sqrt(i + 1);
        nodes.push({ id: file.doc_id, folder: name, r: radiusOf(cluster, file), x: r * Math.cos(angle), y: r * Math.sin(angle) });
        i += 1;
      }
      for (const edge of memberEdges(cluster)) links.push({ source: edge.from, target: edge.to, kind: "member" });
    }
    for (const link of graph.links) {
      if (clusterOfDoc.get(link.source_doc) === name && clusterOfDoc.get(link.target_doc) === name) {
        links.push({ source: link.source_doc, target: link.target_doc, kind: "incorporates" });
      }
    }
    const simulation = forceSimulation(nodes)
      .randomSource(seeded(7))
      .force("link", forceLink<SimNode, (typeof links)[number]>(links).id((n) => n.id)
        .distance((l) => (l.kind === "member" ? 24 : 46))
        .strength((l) => (l.kind === "member" ? 0.9 : 0.35)))
      .force("charge", forceManyBody<SimNode>().strength(-30).distanceMax(160))
      .force("collide", forceCollide<SimNode>((n) => n.r + 4))
      .force("x", forceX<SimNode>(0).strength(0.07))
      .force("y", forceY<SimNode>(0).strength(0.07))
      .stop();
    for (let t = 0; t < 400; t++) simulation.tick();
    const cx = nodes.reduce((sum, n) => sum + (n.x ?? 0), 0) / nodes.length;
    const cy = nodes.reduce((sum, n) => sum + (n.y ?? 0), 0) / nodes.length;
    local.set(name, new Map(nodes.map((n) => [n.id, { x: (n.x ?? 0) - cx, y: (n.y ?? 0) - cy }])));
    radius.set(name, Math.max(...nodes.map((n) => Math.hypot((n.x ?? 0) - cx, (n.y ?? 0) - cy) + n.r)) + 20);
  }

  // Pack the folders: each a circle of its real radius, plus room for its label.
  type Blob = SimulationNodeDatum & { name: string; r: number };
  const blobs: Blob[] = folders.map(([name], i) => ({ name, r: radius.get(name)! + 40, x: 400 * Math.cos(i * 2.4), y: 400 * Math.sin(i * 2.4) }));
  const pack = forceSimulation(blobs)
    .randomSource(seeded(11))
    .force("collide", forceCollide<Blob>((b) => b.r + 24).strength(1).iterations(4))
    .force("x", forceX<Blob>(0).strength(0.04))
    .force("y", forceY<Blob>(0).strength(0.06))
    .stop();
  for (let t = 0; t < 500; t++) pack.tick();

  const at = new Map<string, Point>();
  for (const blob of blobs) {
    for (const [id, p] of local.get(blob.name)!) at.set(id, { x: (blob.x ?? 0) + p.x, y: (blob.y ?? 0) + p.y });
  }
  return {
    at,
    folders: folders.map(([name, list]) => {
      const blob = blobs.find((b) => b.name === name)!;
      const points = list.flatMap((c) => c.files.map((f) => at.get(f.doc_id)!));
      return {
        name,
        x: blob.x ?? 0,
        y: Math.min(...points.map((p) => p.y)) - 16,
        clusters: list.filter((c) => c.files.length > 1).length,
        standalone: list.filter((c) => c.files.length === 1).length,
      };
    }),
  };
}

/**
 * Nodes and edges are built once. Each carries its cluster's index as a class
 * (k12), so highlighting a cluster is a generated stylesheet, not a re-render.
 */
function toFlow(graph: Graph, layout: Layout, run: RunView | null): { nodes: Node[]; edges: Edge[]; index: Map<string, number> } {
  const index = new Map(graph.clusters.map((c, i) => [c.id, i]));
  const k = (clusterId: string) => `k${index.get(clusterId) ?? -1}`;
  const nodes: Node[] = [];

  for (const folder of layout.folders) {
    nodes.push({
      id: `folder:${folder.name}`,
      type: "folder",
      position: { x: folder.x, y: folder.y },
      origin: [0.5, 1],
      data: { name: folder.name, clusters: folder.clusters, standalone: folder.standalone } satisfies FolderData,
      zIndex: -2,
      selectable: false,
    });
  }

  for (const cluster of graph.clusters) {
    const tone = toneOf(cluster.id, run);
    if (cluster.files.length > 1) {
      const points = cluster.files.map((f) => layout.at.get(f.doc_id)!);
      const hull = convexHull(points);
      const pad = HULL_PAD;
      const minX = Math.min(...hull.map((p) => p.x)) - pad;
      const minY = Math.min(...hull.map((p) => p.y)) - pad;
      const maxX = Math.max(...hull.map((p) => p.x)) + pad;
      const maxY = Math.max(...hull.map((p) => p.y)) + pad;
      const path = `M ${hull.map((p) => `${p.x - minX} ${p.y - minY}`).join(" L ")} Z`;
      nodes.push({
        id: `hull:${cluster.id}`,
        type: "hull",
        position: { x: minX, y: minY },
        data: { cluster, path, pad, w: maxX - minX, h: maxY - minY, tone } satisfies HullData,
        style: { width: maxX - minX, height: maxY - minY },
        className: `cx ${k(cluster.id)}`,
        zIndex: -1,
      });
    }
    for (const file of cluster.files) {
      const r = radiusOf(cluster, file);
      const p = layout.at.get(file.doc_id)!;
      const isRoot = file.doc_id === cluster.root;
      nodes.push({
        id: file.doc_id,
        type: "doc",
        position: { x: p.x - r, y: p.y - r },
        data: {
          doc: { file, cluster, isRoot },
          r,
          label: isRoot ? title(cluster) : docLabel(file),
          tone,
        } satisfies DocData,
        style: { width: r * 2, height: r * 2 },
        className: `cx ${k(cluster.id)}`,
      });
    }
  }

  const edges: Edge[] = [];
  for (const cluster of graph.clusters) {
    for (const edge of memberEdges(cluster)) {
      edges.push({ id: `m:${edge.from}->${edge.to}`, source: edge.from, target: edge.to, type: "straight", className: `graph-edge cx ${k(cluster.id)}` });
    }
  }
  const grouped = new Map<string, Link[]>();
  for (const link of graph.links) grouped.set(`${link.source_doc}->${link.target_doc}`, [...(grouped.get(`${link.source_doc}->${link.target_doc}`) ?? []), link]);
  for (const [key, links] of grouped) {
    const first = links[0]!;
    const ends = `x${index.get(first.source) ?? -1} x${index.get(first.target) ?? -1}`;
    edges.push({ id: `x:${key}`, source: first.source_doc, target: first.target_doc, type: "straight", data: { links }, className: `graph-xlink cx ${ends}`, zIndex: 1 });
  }
  return { nodes, edges, index };
}

/** The focused cluster and the clusters it links to stay bright; its main label shows at any zoom. */
function highlightCss(graph: Graph, index: Map<string, number>, focus: string): string {
  const f = index.get(focus);
  if (f === undefined) return "";
  const near = new Set<number>([f]);
  for (const link of graph.links) {
    if (link.source === focus) near.add(index.get(link.target) ?? -1);
    if (link.target === focus) near.add(index.get(link.source) ?? -1);
  }
  const bright = [...near].map((i) => `.cluster-map.focused .cx.k${i}`).concat(`.cluster-map.focused .cx.x${f}`).join(",\n");
  return `${bright} { opacity: 1; }
.cluster-map.focused .react-flow__node.k${f} .graph-label.hidden { display: block; }
.cluster-map.focused .react-flow__node.k${f} .graph-doc { box-shadow: 0 0 0 1.5px var(--card), 0 0 0 3px rgba(28, 25, 21, 0.35); }
.cluster-map.focused .react-flow__node.k${f} .graph-hull { opacity: 0.16; }
.cluster-map.focused .react-flow__edge.graph-edge.k${f} .react-flow__edge-path { stroke: var(--ink); stroke-width: 1.4; }
.cluster-map.focused .react-flow__edge.graph-xlink.x${f} .react-flow__edge-path { opacity: 1; stroke-width: 2; }`;
}

/** Lines inside a cluster: each document to its parent, or to the main document when it names none. */
function memberEdges(cluster: Cluster): { from: string; to: string }[] {
  if (cluster.files.length < 2) return [];
  const ids = new Set(cluster.files.map((f) => f.doc_id));
  return cluster.files
    .filter((f) => f.doc_id !== cluster.root)
    .map((f) => ({ from: f.doc_id, to: f.parent_id && ids.has(f.parent_id) && f.parent_id !== f.doc_id ? f.parent_id : cluster.root }));
}

function radiusOf(cluster: Cluster, file: ClusterFile): number {
  if (cluster.files.length === 1) return SINGLE_R;
  return file.doc_id === cluster.root ? ROOT_R : DOC_R;
}

function toneOf(clusterId: string, run: RunView | null): Tone {
  if (!run) return "none";
  if ((run.findings.get(clusterId) ?? 0) > 0) return "finding";
  if (run.reviewed.has(clusterId)) return "reviewed";
  if (run.excluded.has(clusterId)) return "excluded";
  return "none";
}

function docCount(list: Cluster[]): number {
  return list.reduce((n, c) => n + c.files.length, 0);
}

/** Andrew's monotone chain. One or two points come back as they are; the stroke pads them into a blob. */
function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) return sorted;
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (const p of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function docTip(data: DocData, run: RunView | null): ReactNode {
  const { file, cluster } = data.doc;
  const many = cluster.files.length > 1;
  return (
    <>
      <strong>{data.doc.isRoot ? title(cluster) : docLabel(file)}</strong>
      <span className="meta">{[kindLabel(file.doc_type), file.effective_date ? formatDate(file.effective_date) : ""].filter(Boolean).join(" · ")}</span>
      <span className="meta">{many ? `In ${title(cluster)}, ${cluster.files.length} documents` : "Standalone document"}</span>
      {run && data.tone !== "none" && <span className="meta">{toneText(data.tone, run.findings.get(cluster.id) ?? 0)}</span>}
      <span className="map-files">{fileName(file.path)}</span>
    </>
  );
}

function clusterTip(cluster: Cluster, tone: Tone, run: RunView | null): ReactNode {
  return (
    <>
      <strong>{title(cluster)}</strong>
      <span className="meta">{cluster.files.length} documents{run && tone !== "none" ? ` · ${toneText(tone, run.findings.get(cluster.id) ?? 0)}` : ""}</span>
      <ul className="map-files">
        {fileTree(cluster.files).map(({ file, depth }) => (
          <li key={file.doc_id} style={{ paddingLeft: depth * 14 }}>
            {depth > 0 && <span className="map-branch" aria-hidden="true">└ </span>}
            {fileName(file.path)}
          </li>
        ))}
      </ul>
    </>
  );
}

function toneText(tone: Tone, findings: number): string {
  if (tone === "finding") return `Reviewed in this run · ${findings} ${findings === 1 ? "finding" : "findings"}`;
  if (tone === "reviewed") return "Reviewed in this run";
  if (tone === "excluded") return "Set aside in this run";
  return "";
}

function linkTip(links: Link[], graph: Graph): ReactNode {
  const first = links[0]!;
  const source = graph.clusters.find((c) => c.id === first.source);
  const target = graph.clusters.find((c) => c.id === first.target);
  return (
    <>
      <strong>Incorporates by reference</strong>
      <span className="meta">{source ? title(source) : first.source} → {target ? title(target) : first.target}</span>
      {links.map((link, i) => (
        <p key={i} className="map-quote">
          {link.section && <span className="meta">{link.section}{link.version_pin ? ` · ${link.version_pin}` : ""}</span>}
          “{link.quote.length > 220 ? `${link.quote.slice(0, 220).trimEnd()}…` : link.quote}”
        </p>
      ))}
    </>
  );
}

/** Files in parent order: each child listed under the document it points at. */
function fileTree(files: ClusterFile[]): { file: ClusterFile; depth: number }[] {
  const ids = new Set(files.map((f) => f.doc_id));
  const children = new Map<string, ClusterFile[]>();
  const roots: ClusterFile[] = [];
  for (const file of files) {
    if (file.parent_id && ids.has(file.parent_id) && file.parent_id !== file.doc_id) {
      children.set(file.parent_id, [...(children.get(file.parent_id) ?? []), file]);
    } else {
      roots.push(file);
    }
  }
  const out: { file: ClusterFile; depth: number }[] = [];
  const seen = new Set<string>();
  const walk = (file: ClusterFile, depth: number) => {
    if (seen.has(file.doc_id)) return;
    seen.add(file.doc_id);
    out.push({ file, depth });
    for (const child of (children.get(file.doc_id) ?? []).sort((a, b) => a.path.localeCompare(b.path))) walk(child, depth + 1);
  };
  for (const root of roots.sort((a, b) => a.path.localeCompare(b.path))) walk(root, 0);
  for (const file of files) walk(file, 0);
  return out;
}

/** A cluster's name as a reader would say it: "Keystone Plumbing Supply · Terms and conditions of sale". */
function title(cluster: Cluster): string {
  const parts = slugParts(cluster.id.split("/").pop() ?? cluster.id).words;
  if (parts.length === 0) return fileName(cluster.root_path);
  return parts.map((part, i) => words(part, i === 0)).join(" · ");
}

/** One document's name from its file name, without the numbering and date. */
function docLabel(file: ClusterFile): string {
  const base = fileName(file.path).replace(/\.(md|txt|html)$/i, "").replace(/^\d{1,2}_/, "");
  const parts = slugParts(base).words;
  if (parts.length === 0) return base;
  return parts.map((part, i) => words(part, i === 0 && parts.length > 1)).join(" · ");
}

function slugParts(slug: string): { words: string[]; date: string | null } {
  let date: string | null = null;
  const out: string[] = [];
  for (const part of slug.replace(/^ACQ-\d+_/i, "").split("_")) {
    if (/^\d{4}(-\d{2}(-\d{2})?)?$|^\d{4}-\d{4}$/.test(part)) {
      date ??= part;
      continue;
    }
    out.push(part.replace(/(?<!\d)-|-(?!\d)/g, " "));
  }
  return { words: out, date };
}

function words(text: string, capitalizeAll: boolean): string {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word, i) => {
      if (ACRONYMS.has(word.toLowerCase())) return word.toUpperCase();
      if (capitalizeAll || i === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      return word;
    })
    .join(" ");
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(match[2]) - 1];
  return month ? `${month} ${Number(match[3])}, ${match[1]}` : value;
}

function fileName(path: string): string {
  return path.split("/").pop() ?? path;
}

function kindLabel(docType: string | null): string {
  if (!docType) return "Document";
  const text = docType.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Keep the tooltip on screen: flip left or up when the pointer is near an edge. */
function placeTip(el: HTMLElement, x: number, y: number): void {
  const right = x > window.innerWidth - 360;
  const below = y < window.innerHeight - 280;
  el.style.left = right ? "" : `${x + 14}px`;
  el.style.right = right ? `${window.innerWidth - x + 14}px` : "";
  el.style.top = below ? `${y + 14}px` : "";
  el.style.bottom = below ? "" : `${window.innerHeight - y + 14}px`;
}
