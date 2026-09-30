#!/usr/bin/env python3
"""Deterministically enforce the party-facts sheet (formation state/type and address) in LLM-adapted real documents, then verify.
Writes build/validate/facts_report.json; failing documents are listed (not auto-regenerated)."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from common import ROOT, BUILD, all_meta

FACTS = {
 "Meridian Mechanical Group, Inc.": ("a Delaware corporation", "2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833"),
 "Meridian Home Services Holdings, LLC": ("a Delaware limited liability company", "2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833"),
 "Meridian Mechanical of Washington, LLC": ("a Washington limited liability company", "3310 South Pine Street, Tacoma, WA 98409"),
 "Meridian Mechanical of Illinois, LLC": ("an Illinois limited liability company", "1455 Busse Road, Elk Grove Village, IL 60007"),
 "Meridian Mechanical of Texas, LLC": ("a Texas limited liability company", "10850 West Little York Road, Houston, TX 77041"),
 "Great Plains Copper Tube, Inc.": ("an Oklahoma corporation", "4400 Foundry Road, Tulsa, OK 74107"),
 "Northaire Comfort Systems Corporation": ("a Florida corporation", "7700 Innovation Way, Palm Beach Gardens, FL 33418"),
 "Kessler Comfort Services, Inc.": ("an Illinois corporation", "2200 East Higgins Road, Elk Grove Village, IL 60007"),
}
FORM = r"an? (?:[A-Z][a-z]+ ){1,2}(?:corporation|limited liability company|limited partnership|company)"
ADDR = r"\d{2,6} [A-Z0-9][^,\n]{2,60}(?:, (?:Suite|Ste\.|Floor|Unit) [^,\n]{1,12})?, [A-Z][A-Za-z .]{2,30}, (?:[A-Z]{2}|[A-Z][a-z]+) \d{5}"


def fix(t):
    n = 0
    for name, (form, addr) in FACTS.items():
        e = re.escape(name)
        t, k = re.subn(rf"({e},?\s+){FORM}", lambda m: m.group(1) + form, t); n += k
        t, k = re.subn(rf"({e}[^\n]{{0,160}}?(?:place of business at|principal office at|located at|offices at|headquarters at|address is)\s+){ADDR}",
                       lambda m: m.group(1) + addr, t); n += k
    return t, n


def violations(t):
    v = []
    for name, (form, addr) in FACTS.items():
        for m in re.finditer(rf"{re.escape(name)},?\s+({FORM})", t):
            if m.group(1) != form: v.append(f"{name}: '{m.group(1)}'")
    return v


if __name__ == "__main__":
    report = {}
    for m in all_meta():
        if not str(m.get("source_class", "")).endswith("_llm_adapted") and m.get("source_class") not in ("edgar", "cuad", "court", "public_agency"): continue
        p = ROOT / "corpus" / m["path"]; t = p.read_text()
        t2, n = fix(t)
        if n: p.write_text(t2)
        report[m["doc_id"]] = {"fixes": n, "violations": violations(t2)}
    bad = {k: v for k, v in report.items() if v["violations"]}
    (BUILD / "validate" / "facts_report.json").write_text(json.dumps(report, indent=1))
    print(f"facts: {sum(v['fixes'] for v in report.values())} fixes across {sum(1 for v in report.values() if v['fixes'])} docs; violations remaining in {len(bad)} docs")
    for k, v in bad.items(): print("  ", k, v["violations"][:3])
