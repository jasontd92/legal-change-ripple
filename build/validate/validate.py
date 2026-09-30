#!/usr/bin/env python3
"""Assemble corpus/manifest.jsonl, SOURCES.md and INDEX.md, and run deterministic completion checks. Exit 1 on any hard failure."""
import collections, datetime as dt, json, re, sys
from pathlib import Path
import yaml
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib")); sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "generate"))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "transform"))
from common import ROOT, BUILD, META, DOCS, PROFILE, all_meta
from specs_gen import PROSE, PLANTS
import web_rewrite

AS_OF = dt.date.fromisoformat(str(PROFILE["as_of"]))
REDACT = re.compile(r"\[\s*\*+\s*\]|(?<![A-Za-z*])\*{3}(?![*A-Za-z])|\[REDACTED\]|\[Redacted\]")
GENERIC_KEYS = {"Company", "Seller", "Buyer", "Contractor", "Customer", "Executive", "Employee", "Lender", "Agent", "Bank", "Trust", "Parties"}
checks, hard = [], []


def check(name, ok, detail="", severity="hard"):
    checks.append({"check": name, "ok": bool(ok), "detail": detail, "severity": severity})
    if not ok and severity == "hard": hard.append(name)


metas = all_meta()
by_id = {m["doc_id"]: m for m in metas}

# ---- 1. expected vs actual document counts
plan_real = [d["id"] for d in yaml.safe_load(open(BUILD / "specs" / "plan_real.yaml"))["docs"]]
web_ids = [f"{c['id']}-{v[1]}" for c in web_rewrite.CHAINS for v in c["versions"]]
prose_ids = [s["id"] for s in PROSE]
struct_expected = json.loads((BUILD / "specs" / "expected_structured.json").read_text())
expected = {"real_adapted": plan_real, "web_rewritten": web_ids, "generated_prose": prose_ids, "generated_structured": struct_expected}
for k, ids in expected.items():
    missing = [i for i in ids if i not in by_id]
    check(f"count:{k}", not missing, f"expected {len(ids)}, present {len(ids) - len(missing)}; missing: {missing}")
all_expected = {i for ids in expected.values() for i in ids}
extra = [m["doc_id"] for m in metas if m["doc_id"] not in all_expected]
check("count:no_unexpected_documents", not extra, f"unexpected: {extra}")

# ---- 2. file / sidecar integrity
files = sorted(p for p in DOCS.rglob("*.md"))
paths_meta = {m["path"] for m in metas}
orphans = [str(p.relative_to(ROOT / "corpus")) for p in files if str(p.relative_to(ROOT / "corpus")) not in paths_meta]
missing_files = [m["path"] for m in metas if not (ROOT / "corpus" / m["path"]).exists()]
check("files:every_file_has_metadata", not orphans, f"orphans: {orphans}")
check("files:every_metadata_has_file", not missing_files, f"missing: {missing_files}")
small = [m["doc_id"] for m in metas if (ROOT / "corpus" / m["path"]).exists() and len((ROOT / "corpus" / m["path"]).read_text()) < 400]
check("files:minimum_length_400_chars", not small, f"too small: {small}")

# ---- 3. structure: parents, clusters, dates
bad_parent, bad_order, bad_cluster, future = [], [], [], []
for m in metas:
    p = m.get("parent_id")
    if p:
        if p not in by_id: bad_parent.append(f"{m['doc_id']}->{p}")
        else:
            try:
                if m["doc_type"] in ("amendment", "change_order", "waiver") and dt.date.fromisoformat(m["effective_date"]) < dt.date.fromisoformat(by_id[p]["effective_date"]):
                    bad_order.append(f"{m['doc_id']} {m['effective_date']} < parent {by_id[p]['effective_date']}")
            except Exception: pass
    try:
        d = dt.date.fromisoformat(str(m.get("effective_date")))
        if d > AS_OF: future.append(f"{m['doc_id']} {d}")
    except Exception: bad_order.append(f"{m['doc_id']} invalid date {m.get('effective_date')}")
clusters = collections.defaultdict(list)
for m in metas:
    if m.get("cluster"): clusters[(m["area"], m["cluster"])].append(m)
for (area, cl), ms in clusters.items():
    dirs = {Path(m["path"]).parent.name for m in ms}
    if len(ms) < 2: bad_cluster.append(f"{cl}: only {len(ms)} document")
    if dirs != {cl}: bad_cluster.append(f"{cl}: path mismatch {dirs}")
    ids = {m["doc_id"] for m in ms}
    roots = [m for m in ms if not m.get("parent_id") or m["parent_id"] not in ids]
    if len(roots) != 1: bad_cluster.append(f"{cl}: expected exactly one root document, found {[r['doc_id'] for r in roots]}")
check("structure:parents_exist", not bad_parent, bad_parent)
check("structure:dependent_documents_dated_after_parent", not bad_order, bad_order)
check("structure:clusters_have_one_root_and_2plus_docs", not bad_cluster, bad_cluster)
check("structure:no_document_dated_after_as_of", not future, future)

# ---- 4. anonymization: global scan for every original private name recorded in any name map, plus web brands
originals = set()
for mp in META.glob("*.map.json"):
    for k, v in json.loads(mp.read_text()).items():
        if len(k) >= 6 and k not in GENERIC_KEYS and k.lower() not in v.lower() and not re.fullmatch(r"[A-Z][a-z]+", k):
            originals.add(k)
for c in web_rewrite.CHAINS: originals.update(b for b in c["brand"] if len(b) >= 5)
public_keep = {"State of Washington", "Department of Enterprise Services", "Washington", "California", "Illinois", "Texas", "Chicago", "San Antonio"}
originals -= public_keep
# exclusions (recorded in the report): generic phrases, single all-caps words, and strings contained in our own fictional names/addresses
import yaml as _y
fictional_blob = json.dumps(_y.safe_load(open(ROOT / "corpus" / "company" / "profile.yaml")), default=str) + (BUILD / "transform" / "facts_fix.py").read_text()
excluded = sorted(o for o in originals if o == o.lower() or re.fullmatch(r"[A-Z]+", o) or o in fictional_blob or o.lower() in fictional_blob.lower()
                  or re.search(r"(?i)common stock|company group|heating and air|guardian|carrier", o)
                  or re.fullmatch(r"[A-Z][A-Za-z .]+, (?:[A-Z]{2}|[A-Z][a-z]+) \d{5}", o)          # bare city/state/zip (public geography)
                  or re.match(r"(?:City|County|State|Town|Village) of ", o))                        # public entities are kept by design
originals -= set(excluded)
hits = collections.defaultdict(list)
texts = {m["doc_id"]: (ROOT / "corpus" / m["path"]).read_text() for m in metas if (ROOT / "corpus" / m["path"]).exists()}
pat = re.compile("|".join(sorted((r"(?<![A-Za-z0-9])" + re.escape(o) + r"(?![A-Za-z0-9])" for o in originals), key=len, reverse=True))) if originals else None
if pat:
    for i, t in texts.items():
        for mm in pat.finditer(t): hits[i].append(mm.group(0))
check("anonymization:no_original_private_names_anywhere", not hits, {k: sorted(set(v))[:6] for k, v in hits.items()})
checks.append({"check": "anonymization:scan_scope", "ok": True, "detail": {"names_scanned": len(originals), "excluded_as_generic_or_fictional": excluded}, "severity": "info"})
check("anonymization:per_document_leak_checks", all(m.get("leak_check", {"ok": True})["ok"] for m in metas),
      [m["doc_id"] for m in metas if not m.get("leak_check", {"ok": True})["ok"]])

# ---- 5. redactions, plants, placeholders, per-generator checks
red = {i: len(REDACT.findall(t)) for i, t in texts.items() if REDACT.search(t)}
check("content:no_redaction_markers", not red, red)
plant_fail = [s["id"] for s in PROSE if s["id"] in texts and not all(PLANTS[p] in texts[s["id"]] for p in s.get("plants", []))]
check("content:planted_clauses_verbatim", not plant_fail, plant_fail)
tmpl_fail = [s["id"] for s in PROSE if s.get("placeholders") and s["id"] in texts and not all(ph in texts[s["id"]] for ph in s["placeholders"])]
check("content:template_placeholders_present", not tmpl_fail, tmpl_fail)
inst_fail = [m["doc_id"] for m in metas if "template_instance" in (m.get("planted_features") or []) and "[[" in texts.get(m["doc_id"], "")]
check("content:instances_fully_filled", not inst_fail, inst_fail)
gen_fail = [m["doc_id"] for m in metas if m.get("checks") and not m["checks"].get("ok", True)]
check("content:generator_self_checks", not gen_fail, {i: by_id[i]["checks"] for i in gen_fail}, severity="soft")
adapt_short = [m["doc_id"] for m in metas if (m.get("adapt_length_ratio") or 1) < 0.5 and m["doc_type"] not in ("amendment", "pricing_exhibit")]
check("content:adapted_documents_not_truncated", not adapt_short, {i: by_id[i]["adapt_length_ratio"] for i in adapt_short}, severity="soft")

# ---- 6. triggers
tr = json.loads((BUILD / "validate" / "triggers_report.json").read_text())
check("triggers:expectations", not tr["failed"], f"{tr['files']} files, {tr['checks']} checks, failed {tr['failed']}")

# ---- 7. terms, version families, status at as-of
terms = yaml.safe_load(open(BUILD / "specs" / "terms.yaml"))
check("terms:all_term_entries_match_documents", all(k in by_id for k in terms), [k for k in terms if k not in by_id])
for m in metas:
    t = terms.get(m["doc_id"], {})
    if t: m.update({"term_start": str(t["start"]), "expiry_date": str(t["expiry"]) if t.get("expiry") else None, "renewal": t.get("renewal"), "term_note": t.get("note")})
    if m["doc_type"] == "standard_terms": m["version_family"] = re.sub(r"_\d{4}-\d{2}-\d{2}\.md$", "", Path(m["path"]).name)
    if m.get("status") in ("terminated_on_acquisition",) or (m.get("status") == "superseded" and m["doc_type"] != "standard_terms"): m["fixed_status"] = m["status"]
sys.path.insert(0, str(ROOT / "corpus")); import status_at as _sa
fam = collections.defaultdict(list)
for m in metas:
    if m.get("version_family"): fam[m["version_family"]].append(m)
for m in metas: m["status_at_as_of"] = _sa.status_at(m, AS_OF, fam)
sc = collections.Counter(m["status_at_as_of"] for m in metas)
check("status:expired_documents_exist_at_as_of", sc["expired"] >= 5, dict(sc))
check("status:superseded_versions_exist_at_as_of", sc["superseded"] >= 5, dict(sc))
later = collections.Counter(_sa.status_at(m, dt.date(2027, 7, 1), fam) for m in metas)
check("status:changes_when_as_of_shifts", later != sc, {"2027-07-01": dict(later)})

# ---- 8. counterparty consistency against the profile
prof_ids = {c["id"] for grp in PROFILE["counterparties"].values() for c in grp}
used = {m.get("counterparty") for m in metas if m.get("counterparty")}
check("counterparties:every_profile_counterparty_has_documents", not (prof_ids - used), sorted(prof_ids - used))
check("counterparties:every_document_counterparty_in_profile", not (used - prof_ids), sorted(used - prof_ids))

# ---- 9. targeted content checks for the 2026-09-29 corrections
tx = lambda i: texts.get(i, "")
check("fix:ca_terms_2024_has_auto_renewal_phone_cancel", bool(re.search(r"renews automatically", tx("CUS-RES-CA-TERMS-2024-06-01"))) and "Cancel Membership" not in tx("CUS-RES-CA-TERMS-2024-06-01"))
check("fix:ca_terms_2026_has_ab2863_terms", all(re.search(p, tx("CUS-RES-CA-TERMS-2026-08-01")) for p in [r"express affirmative consent", r"Cancel Membership", r"At least once each year", r"seven \(7\) and no more than thirty \(30\) days"]))
inv = tx("SUP-GPC-GPC-INV-26-1911")
check("fix:clean_section122_invoice_is_tube_only", "Section 122 Tariff Rate" in inv and "7412" not in inv and "7411" in inv)
check("fix:ambiguous_fittings_invoice_exists", "7412" in tx("SUP-GPC-GPC-INV-26-1912") and "needs_review" in "".join(by_id.get("SUP-GPC-GPC-INV-26-1912", {}).get("roles", [])))
tr3 = yaml.safe_load(open(ROOT / "corpus" / "triggers" / "TR-03-adcvd-copper-pipe-mexico" / "meta.yaml"))
mex = [i for i, t in texts.items() if re.search(r"(?i)country of origin:?\s*mexico|mexican[- ]origin|made in mexico", t)]
check("fix:tr03_declared_control_with_no_mexican_origin_goods", tr3.get("role") == "control" and not mex, mex)
scope = (ROOT / "corpus" / "triggers" / "TR-01-copper-section-232")
check("fix:machine_readable_scope_notes_present", (scope / "2025-07-30_proclamation-10962_ANNEX-SCOPE-derived.txt").exists() and (scope / "2026-06-01_proclamations-11021-11032_ANNEX-SCOPE-derived-ocr-partial.txt").exists())

# ---- outputs: manifest, SOURCES, INDEX, report
keep = ["doc_id", "path", "area", "cluster", "doc_type", "parent_id", "counterparty", "effective_date", "roles", "source_class", "source_ref",
        "version_label", "published_url", "year_shift", "planted_features", "filled_fields", "chars",
        "term_start", "expiry_date", "renewal", "term_note", "version_family", "fixed_status", "status_at_as_of"]
with open(ROOT / "corpus" / "manifest.jsonl", "w") as f:
    for m in sorted(metas, key=lambda m: m["path"]): f.write(json.dumps({k: m.get(k) for k in keep if m.get(k) not in (None, [], "")}) + "\n")
src_lines = ["# Sources and attribution", "",
             "Real-derived documents were adapted into the fictional Meridian Mechanical Group corpus. Party names, people, addresses and contact details were replaced;",
             "dates were shifted where noted; some were adapted by an LLM to the plumbing/HVAC context. CUAD contracts are used under CC BY 4.0 (The Atticus Project).",
             "Copyrighted web terms were rewritten (not copied) under fictional supplier names; the originals are not included.", "",
             "| doc_id | source class | original source | year shift |", "|---|---|---|---|"]
for m in sorted(metas, key=lambda m: m["doc_id"]):
    if m.get("source_class", "").startswith(("edgar", "cuad", "public_agency", "court", "web")) or m.get("source_ref"):
        src_lines.append(f"| {m['doc_id']} | {m.get('source_class')} | {m.get('source_ref')} | {m.get('year_shift') or ''} |")
(ROOT / "corpus" / "SOURCES.md").write_text("\n".join(src_lines) + "\n")
idx = ["# Corpus index", "", f"As-of date: {AS_OF}. Documents: {len(metas)}. Folders under an area are clusters (documents that only make sense together).", ""]
for m in sorted(metas, key=lambda m: m["path"]):
    idx.append(f"- `{m['path'][len('documents/'):]}` - {m['doc_type']}, {m.get('effective_date')}, {m.get('source_class')}")
(ROOT / "corpus" / "INDEX.md").write_text("\n".join(idx) + "\n")

by_area = collections.Counter(m["area"] for m in metas); by_src = collections.Counter(m.get("source_class", "?").replace("_llm_adapted", "") for m in metas)
summary = {"documents": len(metas), "trigger_files": tr["files"], "clusters": len(clusters), "by_area": dict(by_area), "by_source_class": dict(by_src),
           "checks_total": len(checks), "checks_failed_hard": hard, "checks_failed_soft": [c["check"] for c in checks if not c["ok"] and c["severity"] == "soft"]}
(BUILD / "validate" / "report.json").write_text(json.dumps({"summary": summary, "checks": checks}, indent=1, default=str))
print(json.dumps(summary, indent=1))
for c in checks:
    print(f"{'PASS' if c['ok'] else ('FAIL' if c['severity']=='hard' else 'WARN')}  {c['check']}" + ("" if c["ok"] else f"  -> {str(c['detail'])[:600]}"))
sys.exit(1 if hard else 0)
