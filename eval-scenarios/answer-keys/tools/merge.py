#!/usr/bin/env python3
"""WP6: merge index-parts/*.yaml into INDEX.yaml, resolve gold refs, assign the held-out split,
and report totals by eval id and slice. Run from anywhere:
  python3 eval-scenarios/answer-keys/tools/merge.py [--write]
Without --write it only prints the report and problems.

Split (HANDOFF §7): ~30 % holdout among selected gold rows (status done, not merged), stratified by
(trigger, primary slice), fixed SEED. Sentinel rows are stratified on their own so they split in
proportion. The unit is the scenario id; e2e files hold both dev and holdout findings (the scorer
reports each split on the findings it owns). Metamorphic rows inherit their base item's split to avoid
leakage; invariant fixtures are synthetic and always dev. T3a/T3b share scenario ids, so a finding is
in the same split at both dates.
"""
import collections
import hashlib
import random
import sys
from pathlib import Path

import yaml

AK = Path(__file__).resolve().parents[1]
SEED = 20260929
HOLDOUT = 0.30
REQUIRED_EVAL_IDS = (["S0", "S1a", "S1b", "S3", "S4", "S5-link", "S5-R1", "S5-R2", "S5-R3", "I6"]
                     + [f"LBL-{x}" for x in ("urgency", "materiality", "direction", "legal_status", "finding_type", "response_type")]
                     + [f"V{i}" for i in range(1, 15)] + [f"M{i}" for i in range(1, 8)])
REQUIRED_SLICES = ["hop-complete", "decoy", "absence", "version", "template-instance", "superseded",
                   "expired-surviving", "abstention", "control"]


def load_rows():
    rows = []
    for p in sorted((AK / "index-parts").glob("WP*.yaml")):
        for r in yaml.safe_load(p.read_text()) or []:
            r["_wp"] = p.stem
            rows.append(r)
    return rows


def gold_lookup():
    """scenario id -> list of (gold_file, finding id or section) found in gold files."""
    found = collections.defaultdict(list)
    files = {}
    for d in ("e2e", "unit"):
        for p in sorted((AK / d).glob("*.yaml")):
            rel = f"{d}/{p.name}"
            data = yaml.safe_load(p.read_text()) or {}
            files[rel] = data
            for sid in data.get("scenario_ids") or []:
                found[sid].append((rel, "file"))
            for fd in data.get("findings") or []:
                for sid in [fd.get("scenario_id")] + list(fd.get("aliases") or []):
                    if sid:
                        found[sid].append((rel, fd.get("id")))
    return found, files


def listify(x):
    return x if isinstance(x, list) else [x] if x else []


def main(write):
    rows = load_rows()
    found, files = gold_lookup()
    problems = []
    by_id = collections.defaultdict(list)
    for r in rows:
        by_id[r["id"]].append(r)
    for i, rs in by_id.items():
        if len(rs) > 1:
            wps = sorted({r["_wp"] for r in rs})
            problems.append(f"duplicate id {i} in {wps}")
    for r in rows:
        st = r.get("status")
        if st == "done":
            gf = r.get("gold_file")
            if not gf or gf not in files:
                problems.append(f"{r['id']}: gold_file {gf!r} missing")
            elif r["id"] not in found and not any(a in found for a in listify(r.get("aliases"))):
                ref = r.get("gold_ref")
                if ref not in ("change_record", "company_gate", "relevant_stacks", "file") and \
                        not any(fd.get("id") == ref for fd in files[gf].get("findings") or []):
                    problems.append(f"{r['id']}: not found in {gf} (gold_ref {ref!r}; no scenario_id/alias match)")
            if r.get("confidence") not in ("high", "abstain_only"):
                problems.append(f"{r['id']}: done but confidence {r.get('confidence')!r}")
        elif st == "merged" and not r.get("canonical"):
            problems.append(f"{r['id']}: merged without canonical")
        elif st == "excluded" and not r.get("exclusion_reason"):
            problems.append(f"{r['id']}: excluded without reason")
        elif st not in ("done", "merged", "excluded", "backlog"):
            problems.append(f"{r['id']}: status {st!r}")

    done = [r for r in rows if r.get("status") == "done"]
    # split
    rng = random.Random(SEED)
    strata = collections.defaultdict(list)
    for r in done:
        if r.get("set") in ("invariant-fixture", "metamorphic"):
            continue
        key = (r.get("set") == "sentinel", str(r.get("trigger")), (listify(r.get("slice")) or ["none"])[0])
        strata[key].append(r)
    for key in sorted(strata, key=str):
        grp = sorted(strata[key], key=lambda r: hashlib.sha1(r["id"].encode()).hexdigest())
        rng.shuffle(grp)
        n = round(len(grp) * HOLDOUT)
        for j, r in enumerate(grp):
            r["split"] = "holdout" if j < n else "dev"
    # stragglers: tiny strata round to 0 -> top up globally toward 30 %
    ranked = [r for r in done if "split" in r]
    target = round(len(ranked) * HOLDOUT)
    have = sum(r["split"] == "holdout" for r in ranked)
    pool = sorted([r for r in ranked if r["split"] == "dev" and r.get("set") != "sentinel"],
                  key=lambda r: hashlib.sha1(f"{SEED}{r['id']}".encode()).hexdigest())
    for r in pool[:max(0, target - have)]:
        r["split"] = "holdout"
    split_of = {r["id"]: r["split"] for r in ranked}
    for r in done:
        if r.get("set") == "invariant-fixture":
            r["split"] = "dev"
        elif r.get("set") == "metamorphic":
            base = None
            gf = files.get(r.get("gold_file") or "", {})
            b = gf.get("base") or {}
            base = b.get("scenario_id") if isinstance(b, dict) else None
            r["split"] = split_of.get(base, "dev")
            r.setdefault("notes", None)
            if base:
                r["split_inherited_from"] = base
    # totals
    by_eval, by_slice, by_set = collections.Counter(), collections.Counter(), collections.Counter()
    for r in done:
        for e in listify(r.get("eval_ids")):
            by_eval[e] += 1
            if e.startswith("LBL") and e not in REQUIRED_EVAL_IDS:
                pass
        for s in listify(r.get("slice")):
            by_slice[s] += 1
        by_set[r.get("set")] += 1
    # every positive finding with labels counts toward each LBL set; S4 findings count to S4
    thin_eval = {e: by_eval.get(e, 0) for e in REQUIRED_EVAL_IDS if by_eval.get(e, 0) < 2}
    thin_slice = {s: by_slice.get(s, 0) for s in REQUIRED_SLICES if by_slice.get(s, 0) < 2}
    status_counts = collections.Counter(r.get("status") for r in rows)
    report = {
        "total_rows": len(rows), "status": dict(status_counts), "gold_items_done": len(done),
        "abstain_only": sum(r.get("confidence") == "abstain_only" for r in done),
        "split": dict(collections.Counter(r.get("split") for r in done)),
        "by_set": dict(by_set), "by_eval_id": dict(sorted(by_eval.items())), "by_slice": dict(sorted(by_slice.items())),
        "thin_eval_ids": thin_eval, "thin_slices": thin_slice,
    }
    print(yaml.safe_dump(report, sort_keys=False))
    for p in problems:
        print("PROBLEM:", p)
    if write:
        out = {
            "contract_version": (AK.parents[1] / "contracts/VERSION").read_text().strip(),
            "generated_by": "tools/merge.py",
            "split": {"seed": SEED, "holdout_fraction": HOLDOUT, "method": __doc__.split("Split (HANDOFF §7): ")[1].strip()},
            "totals": report,
            "items": [{k: v for k, v in r.items() if k != "_wp"} | {"package": r["_wp"]} for r in
                      sorted(rows, key=lambda r: (r.get("status") != "done", r["_wp"], r["id"]))],
        }
        (AK / "INDEX.yaml").write_text(yaml.safe_dump(out, sort_keys=False, allow_unicode=True, width=10_000))
        print("wrote INDEX.yaml")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main("--write" in sys.argv))
