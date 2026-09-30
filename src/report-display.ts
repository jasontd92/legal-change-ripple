/** Counsel-facing labels and short names for the impact report. Enum values stay in the data. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DROP = new Set(["inc", "llc", "ltd", "corp", "company", "co", "incorporated"]);

const STATES = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "dc", "de", "fl", "ga", "hi", "ia", "id", "il", "in", "ks", "ky", "la", "ma", "md", "me", "mi", "mn", "mo", "ms", "mt", "nc", "nd", "ne", "nh", "nj", "nm", "nv", "ny", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "va", "vt", "wa", "wi", "wv", "wy",
]);

const ACRONYM = new Set(["eo", "ftc", "usc", "cfr", "sb", "ab", "hb", "rcw", "hts", "cbp", "adcvd", "ieepa", "nda", "po"]);

const CATEGORY_ORDER = [
  "deadline_bound_right",
  "deadline_bound_obligation",
  "liability_or_compliance_exposure",
  "recovery_opportunity",
  "billing_discrepancy",
  "cost_exposure",
  "consistency_gap",
  "clerical_update",
  "watch",
];

const CATEGORY: Record<string, string> = {
  deadline_bound_right: "Deadline on a right",
  deadline_bound_obligation: "Deadline you owe",
  liability_or_compliance_exposure: "Compliance",
  recovery_opportunity: "Recovery",
  billing_discrepancy: "Billing",
  cost_exposure: "Cost",
  consistency_gap: "Inconsistent terms",
  clerical_update: "Clerical",
  watch: "Watch",
};

const GROUP: Record<string, string> = {
  exposure: "Costs you",
  recovery: "You can recover",
  both: "Mixed",
  neutral: "No money effect",
};

export const GROUP_ORDER = ["exposure", "recovery", "both", "neutral"];

const RESPONSE: Record<string, string | null> = {
  send_notice: "Send notice",
  exercise_pass_through: "Pass through",
  seek_refund_or_credit: "Seek refund",
  renegotiate: "Renegotiate",
  update_template: "Update template",
  escalate_outside_counsel: "Outside counsel",
  brief_finance: "Brief finance",
  monitor: "Watch",
  no_action: null,
};

const LEGAL: Record<string, string | null> = {
  in_force: "In force",
  enacted_future_effective: "Not yet in force",
  in_force_challenged: "In force, challenged",
  stayed_or_enjoined: "Stayed",
  proposed: "Proposed",
  vacated_or_repealed: "No longer in force",
  undeterminable: null,
};

export type DocumentIdentity = { party: string; kind: string; date: string; line: string };

export type ClockTone = "act" | "ahead" | "none";
export type ClockChip = { label: string; hot: boolean; tone: ClockTone };

export function categoryLabel(value: string | undefined): string {
  if (!value) return "";
  return CATEGORY[value] ?? sentence(value);
}

/** Categories that actually appear, in the fixed precedence order. */
export function categoriesPresent(items: { category?: string }[]): string[] {
  const present = new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value)));
  const known = CATEGORY_ORDER.filter((key) => present.has(key));
  const rest = [...present].filter((key) => !CATEGORY_ORDER.includes(key)).sort();
  return [...known, ...rest];
}

export type Recency = "week" | "days30" | "year";

export const RECENCY_OPTIONS: { id: Recency; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "days30", label: "30 days" },
  { id: "year", label: "This year" },
];

/** Date stamped on the governing change file, when the name starts with one. */
export function changeDate(file: string | undefined): string | null {
  const base = file?.split("/").pop() ?? "";
  const match = /^(\d{4}-\d{2}-\d{2})[_-]/.exec(base);
  return match?.[1] ?? null;
}

/** The change landed inside the window ending on asOf. Undated changes do not match. */
export function matchesRecency(date: string | null, asOf: string, window: Recency): boolean {
  if (!date) return false;
  const days = daysBefore(date, asOf);
  if (days === null || days < 0) return false;
  if (window === "week") return days <= 7;
  if (window === "days30") return days <= 30;
  return date.slice(0, 4) === asOf.slice(0, 4);
}

function daysBefore(date: string, asOf: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) return null;
  const ms = Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return Math.round(ms / 86_400_000);
}

export function groupLabel(value: string | undefined): string {
  if (!value || value === "ungrouped") return "Other";
  return GROUP[value] ?? sentence(value);
}

export function responseLabel(value: string | undefined): string | null {
  if (!value) return null;
  if (value in RESPONSE) return RESPONSE[value] ?? null;
  return sentence(value);
}

export function legalLabel(value: string | undefined): string | null {
  if (!value) return null;
  if (value in LEGAL) return LEGAL[value] ?? null;
  return sentence(value);
}

export function closureLabel(status: string): string {
  if (status === "addressed") return "Addressed";
  if (status === "unaddressed") return "Not in the list";
  return sentence(status);
}

export function formatIso(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month || Number(match[3]) < 1 || Number(match[3]) > 31) return null;
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function documentIdentity(path: string): DocumentIdentity {
  const raw = path.split("/").pop()?.replace(/\.(md|txt|html)$/i, "") ?? path;
  const base = raw.toLowerCase();
  const dateMatch = /_(\d{4}-\d{2}-\d{2})$/.exec(base);
  const date = dateMatch ? formatIso(dateMatch[1]) ?? "" : "";
  let rest = dateMatch ? base.slice(0, -dateMatch[0].length) : base;
  rest = rest.replace(/_([a-z]{2})$/i, (all, state: string) => (STATES.has(state) ? "" : all));

  let party = "";
  let kind = "";
  const parts = rest.split("_").filter(Boolean);
  const head = parts[0] ?? "";
  const po = /^(po)-(\d{4})-(\d+)$/i.exec(head);
  if (po) {
    kind = `PO ${po[3]}`;
    party = partyName(rest.slice(po[0].length).replace(/^_/, "").split("_")[0] ?? "");
  } else if (parts.length >= 2 && /\d/.test(head)) {
    const name = parts.find((part) => !/\d/.test(part)) ?? parts[1] ?? "";
    party = partyName(name);
    kind = docKind(path) || docKind(parts.slice(1).join(" "));
  } else if (parts.length >= 2) {
    party = partyName(head);
    kind = docKind(parts.slice(1).join(" ")) || docKind(path);
  } else {
    const slug = head || rest;
    kind = docKind(slug) || docKind(path);
    party = partyName(kind ? slug.replace(/-?(terms|agreement|invoice|lease|amendment).*$/i, "") : slug);
  }
  const line = [party, kind, date].filter(Boolean).join(" · ");
  return { party, kind, date, line: line || humanize(raw) };
}

export function companyDocumentLabel(file: string, section?: string | null): string {
  const named = documentIdentity(file);
  const head = [named.party, named.kind].filter(Boolean).join(" · ") || named.line;
  const sec = section ? tidySection(section) : "";
  return [head, sec].filter(Boolean).join(" · ");
}

export function changeLabel(file: string): string {
  const parts = file.split("/");
  const base = (parts.pop() ?? file).replace(/\.(txt|md|html)$/i, "");
  const dated = /^(\d{4}-\d{2}-\d{2})[_-](.+)$/.exec(base);
  const date = dated ? formatIso(dated[1]) ?? "" : "";
  let raw = (dated ? dated[2] : base).replace(/^(preliminary|final|current|snapshot)[-_]/i, "");
  raw = raw.replace(/[-_](investigation|order|notice|rule|summary|page|current|text|final|preliminary|results|snapshot)+$/i, "");
  if (!raw || /^(investigation|results|snapshot|page)$/i.test(raw)) {
    const folder = parts[parts.length - 1] ?? "";
    raw = folder.replace(/^TR-\d+-/i, "");
  }
  const pretty = prettyChange(raw);
  return [pretty, date].filter(Boolean).join(" · ");
}

export function tidySection(section: string): string {
  const text = section.trim().replace(/\s+/g, " ");
  if (!text) return "";
  const numbered = /^(?:section\s+|§\s*)?(\d+(?:\.\d+)*)[.\s:—-]*(.*)$/i.exec(text);
  if (!numbered) return clip(text, 48);
  const name = (numbered[2] ?? "").trim();
  const pretty = name && name === name.toUpperCase() ? name.charAt(0) + name.slice(1).toLowerCase() : name;
  const label = pretty ? `§${numbered[1]} ${pretty}` : `§${numbered[1]}`;
  return clip(label, 48);
}

export function fileName(file: string): string {
  const name = file.split("/").pop() || file;
  return name.replaceAll("_", "_\u200b").replaceAll("-", "-\u200b");
}

/** Prefer "$A of $B" (the item, not the company-wide total). Otherwise a single amount. */
export function moneyMark(why: string | undefined): string | null {
  if (!why) return null;
  const pair = /\$[\d,.]+(?:\s*(?:million|billion|[mk]))?\s+of\s+(?:the\s+)?\$[\d,.]+(?:\s*(?:million|billion|[mk]))?/i.exec(why);
  if (pair) {
    const [left, right] = pair[0].split(/\s+of\s+(?:the\s+)?/i);
    if (left && right) return `${compactMoney(left)} of ${compactMoney(right)}`;
  }
  const amounts = [...why.matchAll(/\$[\d,.]+(?:\s*(?:million|billion|[mk]))?/gi)].map((match) => match[0]);
  if (amounts.length !== 1) return null;
  return compactMoney(amounts[0] ?? "");
}

export function clockChip(urgency: string | undefined, when: string | undefined): ClockChip {
  const date = firstIso(when);
  switch (urgency) {
    case "forfeitable_clock_running":
    case "obligation_clock_running":
      return clock(date ?? "Deadline", "act");
    case "clock_pending":
      return clock(date ? `Due ${date}` : "Deadline ahead", "ahead");
    case "no_clock":
      return clock("No deadline", "none");
    case "undeterminable":
      return clock("Deadline unknown", "none");
    default:
      return date ? clock(date, "act") : clock("Deadline unknown", "none");
  }
}

function clock(label: string, tone: ClockTone): ClockChip {
  return { label, hot: tone === "act", tone };
}

/**
 * Keep whole sentences. A short passage is returned whole, so a citation is not
 * cut off in the middle of a clause.
 */
export function quoteExcerpt(quote: string | undefined, max = 280): { lead: string; more: boolean } {
  const text = quote?.trim() ?? "";
  if (!text) return { lead: "", more: false };
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= 1 || text.length <= max) return { lead: text, more: false };
  let lead = "";
  let index = 0;
  for (; index < parts.length; index++) {
    const sentence = parts[index] ?? "";
    const next = lead ? `${lead} ${sentence}` : sentence;
    if (lead && next.length > max) break;
    lead = next;
  }
  if (!lead || index >= parts.length) return { lead: text, more: false };
  return { lead, more: true };
}

/** Agent prose that is not already the row. Shown after the cited text. */
export function agentNote(headline: string, why?: string, rest?: string, timing?: string | null): string {
  const seen = new Set<string>([headline.trim()]);
  const parts: string[] = [];
  for (const raw of [timing, rest, why]) {
    const text = raw?.trim() ?? "";
    if (!text || seen.has(text)) continue;
    seen.add(text);
    parts.push(text);
  }
  return parts.join(" ");
}

/** Timing prose worth showing once the row is open. Enum echoes and machine dates are not. */
export function whenDetail(urgency: string | undefined, when: string | undefined, chip: string): string | null {
  const text = when?.trim() ?? "";
  if (!text) return null;
  if (/^(undeterminable|no clock|no deadline|deadline unknown)$/i.test(text)) return null;
  if (urgency && text.replaceAll("_", " ").toLowerCase() === urgency.replaceAll("_", " ")) return null;
  if (/\bday\(s\) from\b/i.test(text) || /urgency=/i.test(text)) return null;
  const dated = firstIso(text);
  if (chip && (text === chip || (dated === chip && text.length < chip.length + 12))) return null;
  return text;
}

export function splitWhat(what: string | undefined): { lead: string; rest: string } {
  const text = what?.trim() ?? "";
  if (!text) return { lead: "No summary.", rest: "" };
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = parts[0] ?? text;
  if (first.length > 220 || (parts.length === 1 && text.length > 200)) {
    const short = clip(first.length > 220 ? first : text, 180);
    const stem = short.endsWith("…") ? short.slice(0, -1).trimEnd() : short;
    const at = text.indexOf(stem);
    const rest = at >= 0 ? text.slice(at + stem.length).trim() : "";
    return { lead: short, rest };
  }
  if (parts.length <= 1) return { lead: text, rest: "" };
  return { lead: first, rest: parts.slice(1).join(" ") };
}

function firstIso(when: string | undefined): string | null {
  if (!when) return null;
  const match = /\b(\d{4}-\d{2}-\d{2})\b/.exec(when);
  return match ? formatIso(match[1] ?? "") : null;
}

/** The item's dollar exposure from the finding's structured facts, compact for the row. */
export function formatAmount(amount: number | null | undefined): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  return compactMoney(String(amount));
}

function compactMoney(raw: string): string {
  const text = raw.trim();
  const suffixed = /^\$?\s*([\d,.]+)\s*(million|billion|[mk])\b/i.exec(text.replace(/,/g, ""));
  if (suffixed) {
    const n = Number(suffixed[1]);
    const unit = suffixed[2].toLowerCase();
    if (!Number.isFinite(n)) return text;
    if (unit.startsWith("b")) return `$${trimNum(n)}B`;
    if (unit.startsWith("m")) return `$${trimNum(n)}M`;
    return `$${trimNum(n)}k`;
  }
  const n = Number(text.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return text;
  if (n >= 1_000_000_000) return `$${trimNum(n / 1_000_000_000)}B`;
  if (n >= 1_000_000) return `$${trimNum(n / 1_000_000)}M`;
  if (n >= 10_000) return `$${trimNum(n / 1_000)}k`;
  return n >= 100 ? `$${Math.round(n).toLocaleString("en-US")}` : `$${trimNum(n)}`;
}

function trimNum(n: number): string {
  const rounded = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(rounded);
}

function partyName(slug: string): string {
  const words = slug.split("-").filter((word) => word && !DROP.has(word) && !STATES.has(word));
  if (!words.length) return "";
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function docKind(text: string): string {
  const n = text.toLowerCase();
  if (/terms/.test(n)) return "Terms";
  if (/training[- ]repayment/.test(n)) return "Training repayment";
  if (/employment/.test(n)) return "Employment agreement";
  if (/nondisclosure|\bnda\b/.test(n)) return "Nondisclosure";
  if (/credit[- ]agreement/.test(n)) return "Credit agreement";
  if (/services-agreement|master-service/.test(n)) return "Services agreement";
  if (/invoice/.test(n)) return "Invoice";
  if (/lease/.test(n)) return "Lease";
  if (/subcontract/.test(n)) return "Subcontract";
  if (/purchase[- ]order/.test(n)) return "Purchase order";
  if (/amendment/.test(n)) return "Amendment";
  if (/\boffer\b/.test(n)) return "Offer";
  return "";
}

function prettyChange(raw: string): string {
  const parts = raw.split(/[-_\s]+/).filter(Boolean);
  if (!parts.length) return "";
  return parts.map((part) => {
    const lower = part.toLowerCase();
    if (ACRONYM.has(lower)) return lower.toUpperCase();
    if (/^\d+[a-z]?$/i.test(part)) return part.toUpperCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}

function sentence(value: string): string {
  const text = value.replaceAll("_", " ").trim().toLowerCase();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function humanize(base: string): string {
  return base.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  const at = cut > 60 ? cut : max;
  return `${text.slice(0, at).trimEnd()}…`;
}

const URGENCY: Record<string, string> = {
  forfeitable_clock_running: "A deadline is running and the right can be lost",
  obligation_clock_running: "A deadline is running on something you owe",
  clock_pending: "A deadline will start on a known future event",
  no_clock: "No deadline",
  undeterminable: "Deadline unknown",
};

const MATERIALITY: Record<string, string> = {
  material: "Material",
  not_material: "Not material",
  undeterminable: "Materiality unclear",
};

export function urgencyLabel(value: string | undefined): string | null {
  if (!value) return null;
  return URGENCY[value] ?? sentence(value);
}

export function materialityLabel(value: string | undefined): string | null {
  if (!value) return null;
  return MATERIALITY[value] ?? sentence(value);
}

/**
 * A reason as counsel should read it. Pipeline bookkeeping ("Conserved from the
 * stack finding.") is dropped and `urgency=…; materiality=…` pairs become words.
 */
export function plainReason(reason: string | undefined): string {
  let text = reason?.trim() ?? "";
  if (!text) return "";
  text = text.replace(/Conserved from the stack finding\.\s*/i, "");
  let phrase = "";
  const found = /(?:Deciding fields:\s*)?((?:\b(?:urgency|materiality|legal_status)=[a-z_]+[;,.]?\s*)+)/i.exec(text);
  if (found) {
    const words: string[] = [];
    for (const [, key, value] of found[1]!.matchAll(/\b(urgency|materiality|legal_status)=([a-z_]+)/gi)) {
      const label = key === "urgency" ? urgencyLabel(value) : key === "materiality" ? materialityLabel(value) : legalLabel(value);
      if (label) words.push(label);
    }
    phrase = words.length ? `${words.join(". ")}.` : "";
    text = text.replace(found[0], " ");
  }
  text = text
    .replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (token) => URGENCY[token]?.toLowerCase() ?? MATERIALITY[token]?.toLowerCase() ?? token)
    .replace(/\s+/g, " ")
    .trim();
  if (text) text = text.charAt(0).toUpperCase() + text.slice(1);
  return [text, phrase].filter(Boolean).join(" ");
}
