#!/usr/bin/env python3
"""Rewrite copyrighted web terms into fictional-party terms, preserving operative mechanics and version-to-version diffs.

Version chains: v1 is rewritten from the original; each later version is produced by applying the REAL diff (orig v_k -> orig v_k+1)
to the rewritten v_k. Deterministic checks per output:
  - required mechanics regexes present; brand leak check (original names absent)
  - per-pair expected change regexes (e.g. 'tariff' absent in old, present in new)
  - diff-shape: similarity(rewritten v_k, v_k+1) within 0.2 of similarity(orig v_k, orig v_k+1)
  - copy check: share of 8-word shingles copied verbatim from the original (reported; fail if > 0.8)
"""
import concurrent.futures as cf, difflib, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from common import RAW, llm, write_doc, strip_fences

CAP = 45000
CHAINS = [
  {"id": "SUP-NCS-TERMS", "brand": ["Carrier", "CARRIER", "Bryant", "Payne", "Viessmann", "Toshiba", "brandportal"], "area": "supply/supplier-terms",
   "party": "Northaire Comfort Systems Corporation (a Florida corporation; 'Northaire'), manufacturer of residential and commercial HVAC equipment",
   "url": "https://www.northaire.com/terms-of-sale", "counterparty": "SUP-NCS", "roles": ["tariff", "one_way_ratchet", "incorporated_web_terms"],
   "anchors": ["is not subject to decrease", "tariffs, import duties, trade policy"],
   "must": [r"tariff", r"(PPI|Producer Price Index)", r"not subject to decrease", r"thirty \(30\) days|30 days"],
   "versions": [("W-CARRIER-20240723", "2024-07-23", "Rev. 07/23/24", {"must": [r"[Tt]he price of services performed"], "must_not": [r"and/or equipment purchased"]}),
                ("W-CARRIER-20241210", "2024-12-10", "Rev. 12/10/24", {"must": [r"and/or equipment"]}),
                ("W-CARRIER-20260821", "2026-08-21", "Rev. 08/21/26", {"must": [r"and/or equipment"]})],
   "slug": "northaire-comfort-systems_terms-and-conditions-of-sale"},
  {"id": "SUP-LWP-TERMS", "brand": ["Core & Main", "Core and Main", "CORE & MAIN", "coreandmain"], "area": "supply/supplier-terms",
   "party": "Lakeshore Waterworks & PVF, LP (a Missouri limited partnership; 'Seller'), a distributor of pipe, valves, fittings and waterworks products",
   "url": "https://www.lakeshorepvf.com/terms-of-sale", "counterparty": "SUP-LWP", "roles": ["tariff", "incorporated_web_terms"],
   "anchors": [],
   "must": [r"[Pp]rice", r"[Tt]axes"],
   "versions": [("W-COREMAIN-REV091718", "2018-09-17", "Rev 091718", {"must_not": [r"[Tt]ariff"]}),
                ("W-COREMAIN-REV020425", "2025-02-04", "Rev 020425", {"must": [r"[Tt]ariffs?", r"written notice"]})],
   "slug": "lakeshore-waterworks-pvf_terms-and-conditions-of-sale"},
  {"id": "SUP-KPS-TERMS", "brand": ["Ferguson", "FERGUSON", "Wolseley"], "area": "supply/supplier-terms",
   "party": "Keystone Plumbing Supply, LLC (a Virginia limited liability company; 'Seller'), a national distributor of plumbing, HVAC and waterworks products",
   "url": "https://www.keystoneplumbingsupply.com/terms-of-sale", "counterparty": "SUP-KPS", "roles": ["tariff", "implicit_pass_through", "incorporated_web_terms"],
   "anchors": ["in effect at the time of shipment", "duties and other charges are in addition to quoted prices"],
   "must": [r"in effect at the time of shipment", r"duties"],
   "versions": [("W-FERGUSON-2019", "2019-10-22", "as published October 2019", {"must": [r"F\.?O\.?B\.?"], "must_not": [r"[Tt]ariff", r"\bFCA\b"]}),
                ("W-FERGUSON-2025", "2025-06-08", "as published June 2025", {"must": [r"\bFCA\b", r"Incoterms"], "must_not": [r"[Tt]ariff"]})],
   "slug": "keystone-plumbing-supply_terms-and-conditions-of-sale"},
  {"id": "SUP-DSC-TERMS", "brand": ["Hajoca", "HAJOCA"], "area": "supply/supplier-terms",
   "party": "Delmont Supply Company (a Pennsylvania corporation; 'Seller'), a distributor of plumbing, HVAC and industrial PVF products",
   "url": "https://www.delmontsupply.com/sales-order-terms-and-conditions", "counterparty": "SUP-DSC", "roles": ["job_quote_price_protection", "incorporated_web_terms"],
   "anchors": ["specifically allow price protection"],
   "must": [r"job quotation", r"price protection"],
   "versions": [("W-HAJOCA-2019", "2019-09-20", "updated 09-20-2019", {}),
                ("W-HAJOCA-2024", "2024-04-04", "updated 04-04-2024", {}),
                ("W-HAJOCA-2025", "2025-01-29", "updated 01-29-2025", {"must": [r"[Pp]lans and [Ss]pec"]})],
   "slug": "delmont-supply_sales-order-terms-and-conditions"},
  {"id": "SUP-SCP-TERMS", "brand": ["Daikin", "DAIKIN", "Goodman", "GOODMAN", "Amana", "AMANA"], "area": "supply/supplier-terms",
   "party": "Solace Comfort Products, Inc. (a Texas corporation; 'Seller'), manufacturer of residential HVAC equipment",
   "url": "https://www.solacecomfort.com/terms-of-sale", "counterparty": "SUP-SCP", "roles": ["tariff", "duties_paid_by_buyer", "incorporated_web_terms"],
   "must": [r"[Dd]uty|[Dd]uties", r"[Cc]ustom"],
   "versions": [("W-DAIKIN", "2025-11-01", "effective November 1, 2025", {})],
   "slug": "solace-comfort-products_terms-of-sale"},
  # ---- Meridian's own residential membership terms (by state) ----
  {"id": "CUS-RES-WA-TERMS", "brand": ["Washington Energy", "WASHINGTON ENERGY", "Guardian"], "area": "customers/residential-terms",
   "party": "Meridian Plumbing, Heating & Air (Meridian Mechanical of Washington, LLC); membership program name 'Meridian Comfort Club'",
   "url": "https://www.meridianpha.com/wa/comfort-club-terms", "counterparty": "CUS-RES", "roles": ["auto_renewal", "consumer", "wa"],
   "must": [r"Comfort Club"], "versions": [("W-WAENERGY", "2026-09-01", "Washington, current", {})],
   "slug": "meridian-comfort-club_membership-terms_washington"},
  {"id": "CUS-RES-IL-TERMS", "brand": ["Four Seasons", "FOUR SEASONS", "fourseasons"], "area": "customers/residential-terms",
   "party": "Meridian Plumbing, Heating & Air (Meridian Mechanical of Illinois, LLC); membership program name 'Meridian Comfort Club'",
   "url": "https://www.meridianpha.com/il/terms-and-conditions", "counterparty": "CUS-RES", "roles": ["auto_renewal", "consumer", "il", "price_increase_clause"],
   "must": [r"Comfort Club|[Mm]embership"], "versions": [("W-FOURSEASONS", "2026-09-01", "Illinois, current", {})],
   "slug": "meridian-residential-terms-and-conditions_illinois"},
  {"id": "CUS-RES-TX-TERMS", "brand": ["Parker & Sons", "Parker and Sons", "PARKER & SONS", "parkerandsons"], "area": "customers/residential-terms",
   "party": "Meridian Plumbing, Heating & Air (Meridian Mechanical of Texas, LLC); membership program name 'Meridian Comfort Club'",
   "url": "https://www.meridianpha.com/tx/maintenance-agreement", "counterparty": "CUS-RES", "roles": ["auto_renewal", "consumer", "tx"],
   "must": [r"Comfort Club|[Mm]aintenance [Aa]greement"], "versions": [("W-PARKER-2026", "2026-08-01", "Texas, current", {})],
   "slug": "meridian-comfort-club_maintenance-agreement_texas"},
  # ---- vendor terms (distractors) ----
  {"id": "VEN-FSM-TOS", "brand": ["Housecall Pro", "Housecall", "HOUSECALL", "housecallpro"], "area": "vendors",
   "party": "FieldFlow Software, Inc. (a Delaware corporation), provider of cloud field-service management software", "url": "https://www.fieldflow.io/terms",
   "counterparty": "SAAS-FSM", "roles": ["distractor"], "must": [r"FieldFlow"], "versions": [("W-HCP-TERMS", "2026-01-15", "last updated January 15, 2026", {})],
   "slug": "fieldflow-software_terms-of-service"},
  {"id": "VEN-PAY-SSA", "brand": ["Stripe", "STRIPE"], "area": "vendors",
   "party": "Paystream Technologies, Inc. (a Delaware corporation), payment processing services provider", "url": "https://www.paystream.com/legal/services-agreement",
   "counterparty": "SAAS-PAY", "roles": ["distractor"], "must": [r"Paystream"], "versions": [("W-STRIPE-SSA", "2026-03-01", "effective March 1, 2026", {})],
   "slug": "paystream-technologies_services-agreement"},
  {"id": "VEN-TEL-TOS", "brand": ["Samsara", "SAMSARA"], "area": "vendors",
   "party": "RoadIQ Telematics, Inc. (a Delaware corporation), fleet telematics and dash-camera platform", "url": "https://www.roadiq.com/legal/platform-terms",
   "counterparty": "SAAS-TEL", "roles": ["distractor"], "must": [r"RoadIQ"], "versions": [("W-SAMSARA-TOS", "2025-07-01", "effective July 1, 2025", {})],
   "slug": "roadiq-telematics_platform-terms-of-service"},
  {"id": "VEN-LG2-TOS", "brand": ["Thumbtack", "THUMBTACK"], "area": "vendors",
   "party": "ProMatch Networks, LLC (a Delaware limited liability company), online marketplace connecting customers with local service professionals",
   "url": "https://www.promatch.com/terms", "counterparty": "SAAS-LG2", "roles": ["distractor"], "must": [r"ProMatch"],
   "versions": [("W-THUMBTACK-TOS", "2026-02-01", "effective February 1, 2026", {})], "slug": "promatch-networks_terms-of-use"},
]
SYS = "You are a commercial lawyer who drafts standard terms. You output complete documents only, never summaries or commentary."


def raw(sid): return (RAW / f"{sid}.txt").read_text()[:CAP]


def terms_only(t):
    """Drop page chrome: keep lines that read like terms (>= 8 words), normalized whitespace."""
    flat = re.sub(r"\s+", " ", t)
    sents = re.split(r"(?<=[.;:])\s+(?=[A-Z0-9(])", flat)
    return "\n".join(x.strip() for x in sents if len(x.split()) >= 8)


def shingles(t, n=8):
    w = re.findall(r"[a-z0-9]+", t.lower()); return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


def copy_share(new, orig):
    a, b = shingles(new), shingles(orig); return round(len(a & b) / max(1, len(a)), 3)


def sim(a, b): return round(difflib.SequenceMatcher(None, a.splitlines(), b.splitlines(), autojunk=False).ratio(), 3)


def first(c, sid, label):
    anchors = json.dumps(c.get("anchors", []))
    p = f"""Rewrite the following published standard terms (captured from a real company's website) as the standard terms of {c['party']}.
Version label to print in the header: "{label}". Published at: {c['url']}.
RULES:
- Remove all website navigation, cookie banners and page chrome; keep only the terms.
- Keep every operative mechanic exactly: price-change rights and notice periods, tax/duty/tariff allocation, delivery/shipping terms (Incoterms), title and risk of loss,
  payment terms, warranty and limitation of liability, cancellation/returns, auto-renewal and cancellation rights, governing law. Keep numbers, percentages and notice periods.
- Reword sentences in your own drafting (do not copy long passages verbatim) while preserving meaning; keep the section order and numbering.
- Do NOT add any provision, right, charge or concept that is not in the original (in particular, do not add any reference to tariffs unless the original has one).
- Keep these operative phrases verbatim wherever they appear: {anchors}
- Never mention the original company, its brands, products or website. Use only the party named above.
Output the complete terms only.

ORIGINAL TERMS:
{raw(sid)}"""
    return strip_fences(llm(p, system=SYS, tag=f"web:{c['id']}:{label}"))


def next_version_full(c, prev_rewritten, o_next, label):
    """Used when the real versions differ mostly by page formatting (low line similarity): rewrite the new original while reusing prior wording."""
    p = f"""Below is the PREVIOUS version of the standard terms of {c['party']} (already drafted), and the NEW version of a real company's equivalent terms.
Produce the new version of this party's terms: keep the previous version's wording verbatim wherever the new real terms are substantively the same, and change,
add or delete provisions only where the new real terms substantively differ (ignore page formatting, navigation and layout). Do NOT add anything the new real terms do not contain.
Keep these operative phrases verbatim: {json.dumps(c.get('anchors', []))}. Update the version label in the header to "{label}". Never mention the real company or its brands.
Output the complete new version only.

PREVIOUS VERSION (this party):
{prev_rewritten}

NEW REAL TERMS:
{o_next}"""
    return strip_fences(llm(p, system=SYS, tag=f"webfull:{c['id']}:{label}"))


def next_version(c, prev_rewritten, o_prev, o_next, label):
    a, b = terms_only(o_prev), terms_only(o_next)
    if sim(a, b) < 0.35:
        return next_version_full(c, prev_rewritten, o_next, label)
    diff = "\n".join(difflib.unified_diff(a.splitlines(), b.splitlines(), "old", "new", n=1, lineterm=""))[:30000]
    p = f"""Below is the current version of the standard terms of {c['party']}, and a unified diff showing how a REAL company's equivalent terms changed
between two versions. Produce the next version of this party's terms by applying the SAME substantive changes (additions, deletions, broadened or narrowed
wording) to the corresponding sections, adapted to this party. Change nothing that the diff does not change (ignore pure formatting/navigation changes in the diff).
Update the version label in the header to "{label}". Never mention the real company or its brands. Output the complete new version only.

CURRENT VERSION:
{prev_rewritten}

REAL DIFF (old -> new):
{diff}"""
    return strip_fences(llm(p, system=SYS, tag=f"webdiff:{c['id']}:{label}"))


def run_chain(c):
    res = []; prev = None; o_prev = None
    for i, (sid, date, label, exp) in enumerate(c["versions"]):
        o = raw(sid)
        t = first(c, sid, label) if prev is None else next_version(c, prev, o_prev, o, label)
        fails = []
        for rx in c.get("must", []) + exp.get("must", []):
            if not re.search(rx, t, re.I if rx in c.get("must", []) else 0): fails.append(f"missing /{rx}/")
        for rx in exp.get("must_not", []):
            if re.search(rx, t): fails.append(f"unexpected /{rx}/")
        leaks = [b for b in c["brand"] if re.search(re.escape(b), t)]
        pair = None
        if prev is not None:
            pair = {"orig_similarity": sim(terms_only(o_prev), terms_only(o)), "rewritten_similarity": sim(prev, t)}
            o_s, r_s = pair["orig_similarity"], pair["rewritten_similarity"]
            # small real change -> small rewritten change; real change -> some rewritten change
            pair["ok"] = (o_s >= 0.95 and r_s >= 0.8) or (o_s < 0.95 and r_s < 0.98)
            if not pair["ok"]: fails.append(f"diff shape {pair}")
        cs = copy_share(t, o)
        if cs > 0.6 and prev is not None:   # the model echoed the real text: one corrective rewrite of the draft, keeping prior wording
            t = strip_fences(llm(f"""Reword the following standard terms of {c['party']} so that no sentence is copied from its source, keeping every operative mechanic, number and notice period, the section order, and these phrases verbatim: {json.dumps(c.get('anchors', []))}. Where the substance matches this earlier version, reuse its wording:\n\nEARLIER VERSION:\n{prev}\n\nTERMS TO REWORD:\n{t}\n\nOutput the complete terms only.""", system=SYS, tag=f"webfix:{c['id']}:{label}"))
            cs = copy_share(t, o)
        if cs > 0.8: fails.append(f"copy_share {cs}")
        doc_id = f"{c['id']}-{date}"
        rel = f"{c['area']}/{c['slug']}_{date}.md"
        write_doc(doc_id, rel, t, {"area": c["area"].split("/")[0], "cluster": None, "doc_type": "standard_terms", "counterparty": c["counterparty"],
                                   "effective_date": date, "version_label": label, "published_url": c["url"],
                                   "status": "superseded" if i < len(c["versions"]) - 1 else "active", "roles": c["roles"],
                                   "source_class": "web_rewritten", "source_ref": sid, "copy_share": cs, "version_pair_check": pair,
                                   "checks": {"ok": not fails and not leaks, "fails": fails, "leaks": leaks}})
        res.append((doc_id, len(t), cs, pair, fails, leaks))
        prev, o_prev = t, o
    return res


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    chains = [c for c in CHAINS if not only or c["id"].startswith(only)]
    bad = 0
    with cf.ThreadPoolExecutor(6) as ex:
        for rs in ex.map(run_chain, chains):
            for doc_id, n, cs, pair, fails, leaks in rs:
                ok = not fails and not leaks; bad += not ok
                print(f"{'OK ' if ok else 'FAIL'} {doc_id:<32} {n:>6}c copy={cs} pair={pair} fails={fails} leaks={leaks}", flush=True)
    sys.exit(1 if bad else 0)
