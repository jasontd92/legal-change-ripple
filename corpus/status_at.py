#!/usr/bin/env python3
"""Compute each document's status at an as-of date (default: profile as_of). Usage: python3 status_at.py [YYYY-MM-DD] [--counts]
Rules: not_yet_effective if effective > as_of; superseded if a later version of the same standard terms is effective by as_of;
expired if the term ended before as_of and renewal is none/option; transactional records (POs, invoices, orders, notices) are 'record';
otherwise active. Fixed statuses (terminated_on_acquisition, superseded legacy documents) are kept."""
import collections, datetime as dt, json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
RECORD = {"purchase_order", "supplier_invoice", "work_order", "change_order", "customs_entry", "supplier_notice", "outgoing_notice",
          "claim_notice", "customer_notice", "lease_schedule", "certificate_of_insurance", "compliance_certificate"}


def status_at(m, as_of, versions):
    eff = dt.date.fromisoformat(m["effective_date"]) if m.get("effective_date") else None
    fixed = m.get("fixed_status")
    if eff and eff > as_of: return "not_yet_effective"
    if fixed: return fixed
    fam = m.get("version_family")
    if fam and any(v["doc_id"] != m["doc_id"] and eff < dt.date.fromisoformat(v["effective_date"]) <= as_of for v in versions[fam]): return "superseded"
    if m["doc_type"] in RECORD: return "record"
    exp = m.get("expiry_date")
    if exp and dt.date.fromisoformat(exp) < as_of and m.get("renewal") in ("none", "option", None): return "expired"
    return "active"


def load(as_of=None):
    import yaml
    as_of = as_of or dt.date.fromisoformat(str(yaml.safe_load(open(HERE / "company" / "profile.yaml"))["as_of"]))
    ms = [json.loads(l) for l in open(HERE / "manifest.jsonl")]
    versions = collections.defaultdict(list)
    for m in ms:
        if m.get("version_family"): versions[m["version_family"]].append(m)
    return {m["doc_id"]: status_at(m, as_of, versions) for m in ms}, as_of


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    st, as_of = load(dt.date.fromisoformat(a[0]) if a else None)
    if "--counts" in sys.argv: print(as_of, dict(collections.Counter(st.values())))
    else:
        for k, v in sorted(st.items()): print(f"{v:<18} {k}")
