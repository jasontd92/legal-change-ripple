#!/usr/bin/env python3
"""Answer-key span tooling (eval side). Offsets follow contracts/normalize (v0.1.0):
code points into normalize(file), end exclusive. Run from the repo root.

  python3 eval-scenarios/answer-keys/tools/spans.py find <file> "<quote>"
      Print every match of the quote (whitespace-insensitive) with offsets and the
      nearest preceding heading-like line. Use it to pick quotes and section labels.
  python3 eval-scenarios/answer-keys/tools/spans.py fill <gold.yaml> [...]
      For every span dict ({file, quote, ...}) set start/end from the quote. The quote
      must match exactly once, or carry `occurrence: N` (1-based) to pick one.
      Rewrites the file (PyYAML, key order kept; use `notes:` fields, not comments).
  python3 eval-scenarios/answer-keys/tools/spans.py check [<gold.yaml> ...]
      QA checks (HANDOFF §9). No args = every gold file under answer-keys/{e2e,unit}.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "contracts" / "normalize"))
from normalize import read_normalized, norm_ws  # noqa: E402

import yaml  # noqa: E402

AK = ROOT / "eval-scenarios" / "answer-keys"
COMMON = json.loads((ROOT / "contracts/schemas/common.schema.json").read_text())["$defs"]
ENUMS = {k: set(COMMON[k]["enum"]) for k in
         ("legal_status", "urgency", "materiality", "direction", "finding_type", "response_type", "determination")}
PASS_RULES = {"affected", "affected_or_needs_review", "not_affected", "abstain_only"}
CONFIDENCE = {"high", "abstain_only"}
SPAN_KEYS = ("anchor", "required_spans", "decoy_spans", "span", "cite", "trigger_span", "clause_span")
_cache = {}


def text_of(file):
    if file not in _cache:
        _cache[file] = read_normalized(ROOT / file)
    return _cache[file]


def _collapsed(text):
    """Whitespace-collapsed text plus a map from collapsed index -> original index."""
    out, idx, prev_ws = [], [], False
    for i, ch in enumerate(text):
        if ch.isspace():
            if prev_ws:
                continue
            out.append(" ")
            idx.append(i)
            prev_ws = True
        else:
            out.append(ch)
            idx.append(i)
            prev_ws = False
    return "".join(out), idx


def find_all(file, quote):
    text = text_of(file)
    hits, pos = [], text.find(quote)
    while pos != -1:
        hits.append((pos, pos + len(quote)))
        pos = text.find(quote, pos + 1)
    if hits:
        return hits
    col, idx = _collapsed(text)
    q = norm_ws(quote)
    pos = col.find(q)
    while pos != -1:
        hits.append((idx[pos], idx[pos + len(q) - 1] + 1))
        pos = col.find(q, pos + 1)
    return hits


HEAD = re.compile(r"^\s*(#{1,6}\s|§|Sec(tion)?\.?\s|SECTION|ARTICLE|Article|\(?[0-9]+(\.[0-9]+)*[.)]?\s|[IVX]+\.\s|[A-Z][A-Z .,&'-]{6,}$)")


def heading_before(file, start):
    lines = text_of(file)[:start].split("\n")
    for ln in reversed(lines[:-1] + [lines[-1]]):
        if ln.strip() and HEAD.match(ln):
            return ln.strip()[:120]
    return None


def section_ok(file, start, label):
    """Heuristic: the label's identifier (e.g. '7.2', 'Sec. 2', 'Article IV') or full label occurs
    in the text before `start`, and is the closest such identifier among headings."""
    if not label:
        return False, "no section_label"
    text = text_of(file)[:start + 1]
    full = norm_ws(label).lower()
    if full and full in norm_ws(text[-40000:]).lower():
        return True, ""
    ident = re.match(r"\s*(§+\s*[\w.()-]+|Sec(?:tion)?\.?\s*[\w.()-]+|Article\s+[\w.]+|ARTICLE\s+[\w.]+|[0-9]+(?:\.[0-9]+)*|Part\s+\w+|Exhibit\s+\w+|Schedule\s+\w+|Annex\s+\w+)", label)
    if ident:
        tok = norm_ws(ident.group(1)).rstrip(".").lower()
        tok = tok.replace("§", "").strip() or tok
        if tok and tok in text[-60000:].lower():
            return True, ""
    return False, f"section_label {label!r} not found before offset {start} (nearest heading: {heading_before(file, start)!r})"


def iter_spans(node, path="$"):
    if isinstance(node, dict):
        if "file" in node and ("quote" in node or "start" in node):
            yield path, node
        for k, v in node.items():
            yield from iter_spans(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from iter_spans(v, f"{path}[{i}]")


def load(p):
    return yaml.safe_load(Path(p).read_text())


def dump(p, data):
    Path(p).write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=10_000))


def cmd_find(file, quote):
    hits = find_all(file, quote)
    if not hits:
        print("NO MATCH")
        return 1
    for s, e in hits:
        print(f"start={s} end={e} heading={heading_before(file, s)!r}\n  text={text_of(file)[s:e][:200]!r}")
    return 0


def cmd_fill(paths):
    bad = 0
    for p in paths:
        data = load(p)
        for where, sp in iter_spans(data):
            if "quote" not in sp or not sp.get("file"):
                continue
            if not (ROOT / sp["file"]).exists():
                print(f"{p} {where}: file not found {sp['file']}")
                bad += 1
                continue
            hits = find_all(sp["file"], sp["quote"])
            occ = sp.get("occurrence")
            if not hits:
                print(f"{p} {where}: quote not found in {sp['file']}: {sp['quote'][:80]!r}")
                bad += 1
                continue
            if len(hits) > 1 and not occ:
                print(f"{p} {where}: quote matches {len(hits)}x, add occurrence: N or lengthen it: {sp['quote'][:80]!r}")
                bad += 1
                continue
            s, e = hits[(occ or 1) - 1]
            sp["start"], sp["end"] = s, e
        dump(p, data)
    print("fill:", "OK" if not bad else f"{bad} problem(s)")
    return 1 if bad else 0


def check_file(p):
    errs, warns = [], []
    raw = Path(p).read_text()
    if re.search(r"\bVERIFY\b", raw):
        errs.append("contains VERIFY")
    data = load(p)
    for where, sp in iter_spans(data):
        f = sp.get("file")
        if not f or not (ROOT / f).exists():
            errs.append(f"{where}: file missing {f}")
            continue
        s, e = sp.get("start"), sp.get("end")
        if not isinstance(s, int) or not isinstance(e, int):
            errs.append(f"{where}: offsets not set (run fill)")
            continue
        t = text_of(f)
        if not (0 <= s < e <= len(t)) or not t[s:e].strip():
            errs.append(f"{where}: bad offsets {s}-{e} (len {len(t)})")
            continue
        if sp.get("quote") and norm_ws(sp["quote"]) not in norm_ws(t[s:e]):
            errs.append(f"{where}: quote not in span")
        ok, msg = section_ok(f, s, sp.get("section_label"))
        if not ok:
            warns.append(f"{where}: {msg}")
    for i, fd in enumerate(data.get("findings") or []):
        w = f"findings[{i}]({fd.get('id')})"
        labels = fd.get("labels") or {}
        for k in ("urgency", "materiality", "direction", "finding_type"):
            if k in labels and labels[k] not in ENUMS[k]:
                errs.append(f"{w}: labels.{k}={labels[k]!r} not in contract enum")
        rts = labels.get("response_type")
        rts = rts if isinstance(rts, list) else [rts] if rts else []
        if len(rts) > 2 or any(r not in ENUMS["response_type"] for r in rts):
            errs.append(f"{w}: response_type {rts} invalid (≤2 contract values)")
        if fd.get("confidence") not in CONFIDENCE:
            errs.append(f"{w}: confidence {fd.get('confidence')!r}")
        if fd.get("pass_rule") not in PASS_RULES:
            errs.append(f"{w}: pass_rule {fd.get('pass_rule')!r}")
        if fd.get("pass_rule") in ("affected", "affected_or_needs_review") and not fd.get("required_spans") and not fd.get("absence"):
            errs.append(f"{w}: positive finding without required_spans or absence")
    for it in (data.get("change_record") or {}).get("items") or []:
        if it.get("legal_status") not in ENUMS["legal_status"]:
            errs.append(f"change item {it.get('id')}: legal_status {it.get('legal_status')!r}")
    if "company_gate" in data and data["company_gate"] not in ("proceed", "exit", None):
        errs.append(f"company_gate {data['company_gate']!r}")
    tiers = data.get("tiers") or {}
    by_id = {fd.get("id"): fd for fd in data.get("findings") or []}
    for fid in tiers.get(1, []) or tiers.get("1", []) or []:
        if fid in by_id and by_id[fid].get("confidence") != "high":
            errs.append(f"tier-1 finding {fid} not confidence: high")
    for t, ids in tiers.items():
        for fid in ids or []:
            if fid not in by_id:
                errs.append(f"tiers.{t}: {fid} is not a finding id")
    if "/e2e/" in str(p):
        if not data.get("relevant_stacks") and data.get("company_gate") != "exit" and "TR03" not in str(p) and "TR-03" not in str(data.get("inputs")):
            errs.append("e2e: relevant_stacks empty")
        if "tiers" not in data:
            errs.append("e2e: tiers missing")
        has_decoy = any(fd.get("decoy_spans") for fd in data.get("findings") or []) or data.get("negative_controls") \
            or any(fd.get("pass_rule") == "not_affected" for fd in data.get("findings") or [])
        if not has_decoy:
            errs.append("e2e: no decoy span, not_affected finding or negative control")
        trig = str((data.get("inputs") or {}).get("trigger", ""))
        if not re.match(r"TR-0[12]", trig):
            if not any(nc.get("must_not_appear") for nc in data.get("negative_controls") or []):
                errs.append("e2e non-tariff run: V14 negative control (credit agreement) missing")
    return errs, warns


def cmd_check(paths):
    if not paths:
        paths = sorted(str(p) for d in ("e2e", "unit") for p in (AK / d).glob("*.yaml"))
    nerr = nwarn = 0
    for p in paths:
        try:
            errs, warns = check_file(p)
        except Exception as ex:  # noqa: BLE001
            errs, warns = [f"load error: {ex}"], []
        rel = Path(p).resolve().relative_to(ROOT) if Path(p).resolve().is_relative_to(ROOT) else p
        for e in errs:
            print(f"ERROR {rel}: {e}")
        for w in warns:
            print(f"WARN  {rel}: {w}")
        nerr += len(errs)
        nwarn += len(warns)
    print(f"check: {len(paths)} file(s), {nerr} error(s), {nwarn} warning(s)")
    return 1 if nerr else 0


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        print(__doc__)
        sys.exit(2)
    if a[0] == "find":
        sys.exit(cmd_find(a[1], a[2]))
    if a[0] == "fill":
        sys.exit(cmd_fill(a[1:]))
    if a[0] == "check":
        sys.exit(cmd_check(a[1:]))
    print(__doc__)
    sys.exit(2)
