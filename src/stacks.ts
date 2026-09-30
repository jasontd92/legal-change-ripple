import type { DocRecord } from "./corpus.js";
import { docRepoPath } from "./paths.js";
import type { IncorporatesEdge } from "./types.js";

export type Stack = {
  stack_id: string;
  members: DocRecord[];
  /** Member with no parent inside the component, preferring one that carries the cluster. */
  root: DocRecord;
};

class UnionFind {
  private parent = new Map<string, string>();
  add(id: string): void {
    if (!this.parent.has(id)) this.parent.set(id, id);
  }
  find(id: string): string {
    let cur = this.parent.get(id) ?? id;
    const root = (): string => {
      while ((this.parent.get(cur) ?? cur) !== cur) cur = this.parent.get(cur) ?? cur;
      return cur;
    };
    const r = root();
    let node = id;
    while (node !== r) {
      const next = this.parent.get(node) ?? node;
      this.parent.set(node, r);
      node = next;
    }
    return r;
  }
  union(a: string, b: string): void {
    this.add(a);
    this.add(b);
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

/**
 * A stack is one connected component of `cluster` and `parent_id`.
 * Shared directories do not grant membership. Incorporates edges do not either.
 */
export function buildStacks(docs: DocRecord[]): Stack[] {
  const uf = new UnionFind();
  const byId = new Map(docs.map((d) => [d.doc_id, d]));
  for (const doc of docs) uf.add(doc.doc_id);

  const byCluster = new Map<string, string[]>();
  for (const doc of docs) {
    if (!doc.cluster) continue;
    const key = `${doc.area}/${doc.cluster}`;
    const list = byCluster.get(key) ?? [];
    list.push(doc.doc_id);
    byCluster.set(key, list);
  }
  for (const ids of byCluster.values()) {
    for (let i = 1; i < ids.length; i++) uf.union(ids[0]!, ids[i]!);
  }
  for (const doc of docs) {
    if (doc.parent_id && byId.has(doc.parent_id)) uf.union(doc.doc_id, doc.parent_id);
  }

  const groups = new Map<string, DocRecord[]>();
  for (const doc of docs) {
    const root = uf.find(doc.doc_id);
    const list = groups.get(root) ?? [];
    list.push(doc);
    groups.set(root, list);
  }

  const stacks: Stack[] = [];
  for (const members of groups.values()) {
    members.sort((a, b) => a.doc_id.localeCompare(b.doc_id));
    const ids = new Set(members.map((m) => m.doc_id));
    const roots = members.filter((m) => !m.parent_id || !ids.has(m.parent_id));
    const clustered = members.filter((m) => m.cluster);
    let stack_id: string;
    if (clustered.length) {
      const rootCluster = roots.find((m) => m.cluster) ?? clustered[0]!;
      stack_id = `${rootCluster.area}/${rootCluster.cluster}`;
    } else {
      const root = roots[0] ?? members[0]!;
      stack_id = root.path.replace(/^documents\//, "").replace(/\.md$/i, "");
    }
    const root = roots.find((m) => m.cluster) ?? roots[0] ?? members[0]!;
    stacks.push({ stack_id, members, root });
  }
  stacks.sort((a, b) => a.stack_id.localeCompare(b.stack_id));
  const seen = new Set<string>();
  for (const stack of stacks) {
    if (seen.has(stack.stack_id)) {
      throw new Error(`Two components produced stack_id ${stack.stack_id}`);
    }
    seen.add(stack.stack_id);
  }
  return stacks;
}

export function stackFiles(corpusRoot: string, stack: Stack): string[] {
  return stack.members.map((m) => docRepoPath(corpusRoot, m.path));
}

/** Family, plus one hop to each incorporates target. Targets are not members. */
export function readingSet(corpusRoot: string, stack: Stack, edges: IncorporatesEdge[], byId: Map<string, DocRecord>): string[] {
  const files = new Set(stackFiles(corpusRoot, stack));
  const memberIds = new Set(stack.members.map((m) => m.doc_id));
  for (const edge of edges) {
    if (!memberIds.has(edge.source_doc_id)) continue;
    const target = byId.get(edge.target_doc_id);
    if (target) files.add(docRepoPath(corpusRoot, target.path));
  }
  return [...files].sort();
}

const CLAUSE_PATTERNS: { type: string; re: RegExp }[] = [
  { type: "Governing Law", re: /governed by the laws/i },
  { type: "Non-Compete", re: /non-?compet/i },
  { type: "Indemnification", re: /indemnif/i },
  { type: "Limitation of Liability", re: /limitation of liability/i },
  { type: "Termination", re: /\bterminat(e|ion)\b/i },
  { type: "Insurance", re: /additional insured|certificate of insurance|\binsurance\b/i },
  { type: "Most Favored", re: /most favou?red/i },
  { type: "Audit Rights", re: /\baudit\b/i },
  { type: "Change of Control", re: /change of control/i },
  { type: "Renewal", re: /automatic renewal|auto-?renew/i },
  { type: "Confidentiality", re: /confidential/i },
  { type: "Price Adjustment", re: /price adjustment|surcharge|tariff/i },
  { type: "Pass-through", re: /pass-?through/i },
  { type: "Payment", re: /\bpayment terms\b|\bnet \d+/i },
];

export type StackManifest = {
  stack_id: string;
  parties: string[];
  roles: string[];
  doc_types: string[];
  governing_law: string | null;
  term_start: string | null;
  term_end: string | null;
  member_count: number;
  members: { doc_id: string; doc_type?: string; path: string; parent_id?: string; effective_date?: string }[];
  clause_types: string[];
  incorporates: { target_doc_id: string; section: string; version_pin: string | null; quote: string }[];
};

export function manifestFor(
  corpusRoot: string,
  stack: Stack,
  edges: IncorporatesEdge[],
  readText: (repoPath: string) => string,
): StackManifest {
  const memberIds = new Set(stack.members.map((m) => m.doc_id));
  const roles = unique(stack.members.flatMap((m) => m.roles ?? []));
  const parties = unique(stack.members.map((m) => m.counterparty).filter((v): v is string => Boolean(v)));
  const doc_types = unique(stack.members.map((m) => m.doc_type).filter((v): v is string => Boolean(v)));
  const dates = stack.members.map((m) => m.effective_date).filter((v): v is string => Boolean(v)).sort();
  const ends = stack.members.map((m) => m.expiry_date).filter((v): v is string => Boolean(v)).sort();
  let governing_law: string | null = null;
  const clause_types = new Set<string>();
  for (const member of stack.members) {
    let text = "";
    try {
      text = readText(docRepoPath(corpusRoot, member.path)).slice(0, 12_000);
    } catch {
      continue;
    }
    if (!governing_law) {
      const law = /governed by the laws of (?:the )?(?:State of )?([A-Za-z][A-Za-z .]+?)(?:[,.]|\s+and\b)/i.exec(text);
      if (law) governing_law = law[1]!.trim();
    }
    for (const pattern of CLAUSE_PATTERNS) {
      if (pattern.re.test(text)) clause_types.add(pattern.type);
    }
  }
  const incorporates = edges
    .filter((e) => memberIds.has(e.source_doc_id))
    .map((e) => ({
      target_doc_id: e.target_doc_id,
      section: e.section,
      version_pin: e.version_pin,
      quote: e.quote.slice(0, 400),
    }));
  return {
    stack_id: stack.stack_id,
    parties,
    roles,
    doc_types,
    governing_law,
    term_start: dates[0] ?? null,
    term_end: ends[ends.length - 1] ?? null,
    member_count: stack.members.length,
    members: stack.members.map((m) => ({
      doc_id: m.doc_id,
      doc_type: m.doc_type,
      path: docRepoPath(corpusRoot, m.path),
      parent_id: m.parent_id,
      effective_date: m.effective_date,
    })),
    clause_types: [...clause_types].sort(),
    incorporates,
  };
}

export function manifestLine(m: StackManifest): string {
  const parts = [
    m.stack_id,
    m.doc_types.slice(0, 4).join("+") || "document",
    m.parties.length ? `parties:${m.parties.join(",")}` : "",
    m.roles.length ? `roles:${m.roles.slice(0, 6).join(",")}` : "",
    m.governing_law ? `law:${m.governing_law}` : "",
    m.term_start ? `term:${m.term_start}${m.term_end ? `→${m.term_end}` : ""}` : "",
    m.clause_types.length ? `clauses:${m.clause_types.slice(0, 6).join(",")}` : "",
    `n:${m.member_count}`,
    m.incorporates.length ? `incorporates:${m.incorporates.map((e) => e.target_doc_id).join(",")}` : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}
