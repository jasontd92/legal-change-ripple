#!/usr/bin/env python3
"""Copy trigger sources into corpus/triggers/<group>/ with meta.yaml, and verify deterministic expectations."""
import json, re, shutil, sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "build" / "raw"; OUT = ROOT / "corpus" / "triggers"
log = {json.loads(l)["id"]: json.loads(l) for l in open(RAW / "_fetch_log.jsonl")}
spec = yaml.safe_load(open(ROOT / "build" / "specs" / "triggers.yaml"))
srcs = {s["id"]: s for s in yaml.safe_load(open(ROOT / "build" / "specs" / "sources.yaml"))}

def norm(t): return re.sub(r"\s+", " ", re.sub(r"\[\[page \d+\]\]", " ", t))

if OUT.exists(): shutil.rmtree(OUT)
results = []; n = 0
for g in spec:
    gd = OUT / g["group"]; gd.mkdir(parents=True)
    meta = {"group": g["group"], "domain": g["domain"], "summary": g["summary"], "versions": []}
    for k in ("role", "expected_relevance"):
        if g.get(k): meta[k] = g[k]
    for v in g["versions"]:
        if v["src"].startswith("derived:"):
            rec = {"url": None, "sha256": None}; txt = (ROOT / "build" / "specs" / "derived" / v["src"][8:]).read_text()
        else:
            rec = log[v["src"]]; txt = (RAW / f"{v['src']}.txt").read_text()
        (gd / f"{v['id']}.txt").write_text(txt); n += 1
        t = norm(txt); fails = []
        for p in v.get("expect", {}).get("must", []):
            if not re.search(p, t): fails.append(f"missing /{p}/")
        for p in v.get("expect", {}).get("must_not", []):
            if re.search(p, t): fails.append(f"unexpected /{p}/")
        src = srcs.get(v["src"], {"title": "Derived machine-readable scope note (see file header)"})
        meta["versions"].append({k: v.get(k) for k in ("id", "status", "effective", "expires", "distractor", "note") if v.get(k) is not None}
                                | {"file": f"{v['id']}.txt", "source_url": src.get("url") or rec.get("url"), "fetched_url": rec.get("url"),
                                   "sha256_16": rec.get("sha256"), "chars": len(t), "title": src.get("title")})
        results.append({"check": "trigger_expectations", "item": f"{g['group']}/{v['id']}", "ok": not fails, "detail": fails})
    (gd / "meta.yaml").write_text(yaml.safe_dump(meta, sort_keys=False, allow_unicode=True, width=120))

bad = [r for r in results if not r["ok"]]
(ROOT / "build" / "validate").mkdir(exist_ok=True)
(ROOT / "build" / "validate" / "triggers_report.json").write_text(json.dumps({"files": n, "checks": len(results), "failed": bad}, indent=1))
print(f"trigger files: {n}; expectation checks: {len(results)}; failed: {len(bad)}")
for b in bad: print("  FAIL", b["item"], b["detail"])
sys.exit(1 if bad else 0)
