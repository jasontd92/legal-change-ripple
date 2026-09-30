#!/usr/bin/env python3
"""Generate clause-heavy documents with Haiku. Planted clauses are inserted verbatim by the script (never model-written).

Deterministic validation per document: each {{PLANT:ID}} marker appears exactly once and is substituted; required section headings
present; template placeholders present; length within [0.55, 1.8] x target words; no stray bracket placeholders. One retry with the
validator errors appended; failures are recorded in the sidecar.
Usage: prose.py [--only ID_PREFIX] [--workers N]
"""
import argparse, concurrent.futures as cf, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib")); sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import RAW, PROFILE, llm, write_doc, strip_fences
from specs_gen import PROSE, PLANTS

SYS = ("You are an experienced in-house and transactional lawyer drafting realistic, complete legal documents for a U.S. plumbing and HVAC "
       "contractor's contract files. Your drafting reads like real executed documents: numbered sections, defined terms, specific facts, "
       "signature blocks. You never add commentary, notes, or markdown code fences.")


def exemplar(src, start, n=2200):
    try:
        t = re.sub(r"\[\[page \d+\]\]", " ", (RAW / f"{src}.txt").read_text())
    except FileNotFoundError:
        return ""
    t = re.sub(r"\s+", " ", t[start:start + n * 2])
    return t[:n]


def build_prompt(s, errors=None):
    plant_lines = "\n".join(f'- {{{{PLANT:{p}}}}} = the clause "{PLANTS[p].split(".")[0]}" (the script inserts the exact text)' for p in s.get("plants", []))
    ph = s.get("placeholders", [])
    p = f"""Draft the complete text of the following document.

DOCUMENT TYPE: {s['doc_type'].replace('_', ' ')}
DATE / EFFECTIVE DATE: {s['effective']}
PARTIES: {s['parties']}
DESCRIPTION AND KEY TERMS: {s['brief']}
REQUIRED SECTIONS (use these as section headings, in a sensible order, plus any others a real document of this type would have): {', '.join(s['sections'])}
TARGET LENGTH: about {s['words']} words.
"""
    if plant_lines:
        p += f"""
PLANTED CLAUSES: For each item below, put the marker on its own line, exactly as written, at the place in the document where that clause belongs
(under an appropriate numbered section heading). Do NOT draft that clause's text yourself and do not paraphrase it anywhere else.
{plant_lines}
"""
    if ph:
        p += f"""
THIS IS A FORM/TEMPLATE. Use these exact placeholder tokens (double square brackets) wherever the corresponding value belongs, each at least once: {', '.join(ph)}.
Do not use any other bracketed blanks.
"""
    else:
        p += "\nUse concrete names, dates, amounts and addresses (no blanks or bracketed placeholders). Invent realistic details consistent with the description.\n"
    ex = exemplar(*s["exemplar"]) if s.get("exemplar") else ""
    if ex:
        p += f"\nSTYLE REFERENCE (an excerpt of a real document; imitate its register and drafting conventions, not its facts or parties):\n{ex}\n"
    if errors:
        p += "\nYOUR PREVIOUS DRAFT FAILED THESE CHECKS; FIX THEM:\n- " + "\n- ".join(errors) + "\n"
    p += "\nOutput the complete document text only."
    return p


def validate(s, t):
    errs = []
    for pid in s.get("plants", []):
        n = t.count(f"{{{{PLANT:{pid}}}}}")
        if n != 1: errs.append(f"marker {{{{PLANT:{pid}}}}} must appear exactly once (found {n})")
    low = t.lower()
    for sec in s["sections"]:
        key = sec.lower().split(" and ")[0].split(" - ")[0]
        if key not in low: errs.append(f"missing section heading '{sec}'")
    for ph in s.get("placeholders", []):
        if ph not in t: errs.append(f"missing placeholder {ph}")
    words = len(t.split())
    if words < 0.55 * s["words"]: errs.append(f"too short ({words} words; target {s['words']})")
    if words > 1.8 * s["words"]: errs.append(f"too long ({words} words; target {s['words']})")
    stray = [m for m in re.findall(r"\[[A-Z][A-Za-z _/]{2,40}\]", t) if not m.startswith("[[")]
    if not s.get("placeholders") and stray: errs.append(f"stray bracket placeholders: {stray[:5]}")
    if re.search(r"(?i)\bas an ai\b|\bnote to drafter\b|\bI have drafted\b", t): errs.append("contains commentary")
    return errs


def substitute(t, s):
    for pid in s.get("plants", []):
        t = re.sub(r"[^\n]*\{\{PLANT:" + re.escape(pid) + r"\}\}[^\n]*", lambda m, v=PLANTS[pid]: v, t, count=1)
    return t


def gen(s):
    t = strip_fences(llm(build_prompt(s), system=SYS, tag=f"prose:{s['id']}"))
    errs = validate(s, t)
    if errs:
        t2 = strip_fences(llm(build_prompt(s, errs), system=SYS, tag=f"prose-retry:{s['id']}"))
        errs2 = validate(s, t2)
        if len(errs2) <= len(errs): t, errs = t2, errs2
    t = substitute(t, s)
    plant_ok = all(PLANTS[p] in t for p in s.get("plants", []))
    if "{{PLANT:" in t: errs.append("unsubstituted plant marker")
    area = s["rel"].split("/")[0]
    cluster = s["rel"].split("/")[1] if s.get("cluster") else None
    write_doc(s["id"], s["rel"], t, {"area": area, "cluster": cluster, "doc_type": s["doc_type"], "parent_id": s.get("parent"),
                                     "counterparty": s.get("counterparty"), "effective_date": s["effective"], "status": s.get("status", "active"),
                                     "roles": s.get("roles", []), "source_class": "generated_llm", "template": bool(s.get("template")),
                                     "placeholders": s.get("placeholders", []), "planted_features": s.get("plants", []),
                                     "checks": {"ok": not errs and plant_ok, "errors": errs, "plants_verbatim": plant_ok}})
    return s["id"], len(t.split()), errs, plant_ok


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only"); ap.add_argument("--workers", type=int, default=3); a = ap.parse_args()
    specs = [s for s in PROSE if not a.only or s["id"].startswith(a.only)]
    bad = 0
    with cf.ThreadPoolExecutor(a.workers) as ex:
        futs = {ex.submit(gen, s): s["id"] for s in specs}
        for f in cf.as_completed(futs):
            try:
                i, w, errs, pok = f.result(); ok = not errs and pok; bad += not ok
                print(f"{'OK ' if ok else 'WARN'} {i:<22} {w:>5}w plants_ok={pok} {errs[:3]}", flush=True)
            except Exception as e:
                bad += 1; print(f"ERR  {futs[f]:<22} {e}", flush=True)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
