"""Precision/recall against answer-key pass rules. No model calls."""
import json
import re
import sys
from pathlib import Path

from yaml import safe_load

REPO = Path(__file__).resolve().parents[1]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip().lower()


def same_file(a: str | None, b: str) -> bool:
    if not a:
        return False
    return a == b or a.endswith(b) or b.endswith(a)


def overlaps(cited: str, gold: str) -> bool:
    c, g = norm(cited), norm(gold)
    if len(c) < 24 or len(g) < 24:
        return len(c) > 0 and (g in c or c in g)
    return g in c or c in g


def quotes_of(finding: dict) -> list[dict]:
    out = []
    cit = finding.get("citations") or {}
    for key in ("trigger", "clause"):
        span = cit.get(key) or {}
        if span.get("quote"):
            out.append(span)
    for hop in finding.get("hop_chain") or []:
        span = (hop or {}).get("span") or {}
        if span.get("quote"):
            out.append(span)
    return out


def span_hit(preds: list[dict], span: dict) -> bool:
    for finding in preds:
        for quote in quotes_of(finding):
            if same_file(quote.get("file"), span["file"]) and overlaps(quote.get("quote") or "", span["quote"]):
                return True
    return False


def decoy_hit(preds: list[dict], span: dict) -> bool:
    for finding in preds:
        clause = (finding.get("citations") or {}).get("clause") or {}
        if not clause.get("quote") or not same_file(clause.get("file"), span["file"]):
            continue
        if not overlaps(clause["quote"], span["quote"]):
            continue
        if (finding.get("labels") or {}).get("materiality") == "not_material":
            continue
        return True
    return False


def load_gold(path: Path) -> dict:
    return safe_load(path.read_text())


def findings_by_stack(run: Path) -> dict[str, dict]:
    folder = run / "findings"
    if not folder.exists():
        return {}
    out = {}
    for file in folder.glob("*.json"):
        doc = json.loads(file.read_text())
        out[doc["stack_id"]] = doc
    return out


def cost_of(run: Path) -> float:
    file = run / "run.json"
    if not file.exists():
        return 0.0
    rec = json.loads(file.read_text())
    return sum((agent.get("cost_usd") or 0) for agent in rec.get("agents") or [])


def passed(gold: dict, doc: dict | None, in_scope: bool | None) -> bool:
    rule = gold.get("pass_rule")
    if doc is None:
        if rule == "not_affected" and in_scope is False:
            return True
        return False
    preds = doc.get("findings") or []
    determination = doc.get("determination")
    required = [span for span in (gold.get("required_spans") or []) if "/triggers/" not in span["file"]]
    missing = [span for span in required if not span_hit(preds, span)]
    decoys = [span for span in (gold.get("decoy_spans") or []) if decoy_hit(preds, span)]
    spans_ok = not missing
    if rule == "not_affected":
        return determination == "not_affected" or (determination is None and in_scope is False)
    if rule == "abstain_only":
        undeterminable = any((p.get("labels") or {}).get("urgency") == "undeterminable" or (p.get("labels") or {}).get("materiality") == "undeterminable" for p in preds)
        return determination == "needs_review" or undeterminable
    if rule == "affected_or_needs_review":
        return determination in ("affected", "needs_review") and not decoys and (spans_ok or determination == "needs_review")
    if rule == "affected":
        return determination == "affected" and spans_ok and not decoys
    return False


def score_run(run: Path, gold: dict, present_only: bool = False) -> dict:
    by = findings_by_stack(run)
    scope = {}
    scope_file = run / "scope_trace.json"
    if scope_file.exists():
        for row in json.loads(scope_file.read_text()).get("stacks") or []:
            scope[row["stack_id"]] = bool(row.get("in_scope"))
    rows = []
    tp = fp = fn = tn = 0
    for item in gold.get("findings") or []:
        sid = item["stack_id"]
        if present_only and sid not in by:
            continue
        doc = by.get(sid)
        in_scope = scope.get(sid)
        ok = passed(item, doc, in_scope)
        positive = item.get("pass_rule") != "not_affected"
        predicted = False
        if doc is not None:
            predicted = doc.get("determination") in ("affected", "needs_review")
        elif in_scope:
            predicted = False
        if positive and ok:
            tp += 1
        elif positive and not ok:
            fn += 1
        elif not positive and predicted:
            fp += 1
        else:
            tn += 1
        rows.append({"id": item["id"], "rule": item.get("pass_rule"), "ok": ok, "det": None if doc is None else doc.get("determination"), "in_scope": in_scope})
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn, "precision": precision, "recall": recall, "cost": cost_of(run), "rows": rows, "n": len(gold.get("findings") or [])}


def pct(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"{100 * value:.0f}%"


def aggregate(scores: list[dict]) -> dict:
    tp = sum(s["tp"] for s in scores)
    fp = sum(s["fp"] for s in scores)
    fn = sum(s["fn"] for s in scores)
    tn = sum(s["tn"] for s in scores)
    return {
        "n": len(scores),
        "precision": tp / (tp + fp) if tp + fp else None,
        "recall": tp / (tp + fn) if tp + fn else None,
        "cost": sum(s["cost"] for s in scores),
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "tn": tn,
    }


def main() -> None:
    if len(sys.argv) < 3:
        print("usage: score-baselines.py GOLD.yaml RUN [RUN...]")
        return
    gold = load_gold(Path(sys.argv[1]))
    present_only = "--present-only" in sys.argv
    runs = [p for p in sys.argv[2:] if p != "--present-only"]
    scores = [score_run(Path(p), gold, present_only) for p in runs]
    total = aggregate(scores)
    print(f"runs={total['n']} P={pct(total['precision'])} R={pct(total['recall'])} tp={total['tp']} fp={total['fp']} fn={total['fn']} tn={total['tn']} cost=${total['cost']:.3f}")
    if len(scores) == 1:
        for row in scores[0]["rows"]:
            print(f"  {row['id']} {row['rule']} ok={row['ok']} det={row['det']} in_scope={row['in_scope']}")


if __name__ == "__main__":
    main()
