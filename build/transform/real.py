#!/usr/bin/env python3
"""Adapt real source documents (public agency, EDGAR, CUAD, court exhibits) into the Meridian corpus.

Pipeline per document (all deterministic except the two marked LLM):
  load -> trim (pages/slice) -> strip boilerplate -> [LLM] entity extraction -> name mapping (explicit + role + generated)
  -> year shift -> governing-law remap -> literal replacements -> [LLM, optional] domain adaptation / redaction fill
  -> leak check (every original private name must be absent) -> write + metadata sidecar.
Usage: real.py [--only ID] [--workers N]
"""
import argparse, concurrent.futures as cf, json, re, sys
from pathlib import Path
import yaml
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from common import RAW, BUILD, PROFILE, llm, fake_person, fake_org, fake_address, write_doc, strip_fences

PLAN = yaml.safe_load(open(BUILD / "specs" / "plan_real.yaml"))["docs"]
BYID = {d["id"]: d for d in PLAN}
CUAD = None
MAPS = {}  # doc id -> final mapping (for map_from)
REDACT = re.compile(r"\[\s*\*+\s*\]|(?<![A-Za-z*])\*{3}(?![*A-Za-z])|\[REDACTED\]|\[Redacted\]")
MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
STATE_NAMES = ["Alabama","Arizona","California","Colorado","Delaware","Florida","Georgia","Illinois","Indiana","Massachusetts","Michigan",
               "Minnesota","Missouri","Nevada","New Jersey","New York","North Carolina","Ohio","Oklahoma","Pennsylvania","Tennessee","Texas",
               "Utah","Virginia","Washington","Wisconsin"]
GENERIC = {"company","executive","employee","employer","seller","sellers","buyer","purchaser","borrower","lender","lenders","agent","parties","party",
           "contractor","subcontractor","owner","customer","supplier","vendor","consultant","licensor","licensee","landlord","tenant","lessor","lessee",
           "bank","administrative agent","guarantor","guarantors","holder","maker","trust","board","corporation","franchisor","franchisee","provider",
           "dealer","distributor","manufacturer","city","county","state","director","officer","president","recipient","participant","grantee",
           "associate","shareholder","shareholders","member","members","parent","merger sub","surviving corporation","investor","issuer","payee",
           "you","we","us","our","your","the company","the executive","the employee","service provider","principal","secured party","loan parties"}
KEEP_ALWAYS = {"State of Washington", "Department of Enterprise Services", "Internal Revenue Service", "United States", "U.S. Customs and Border Protection"}


def load_src(d):
    global CUAD
    s = d["src"]
    if s.startswith("cuad:"):
        if CUAD is None:
            CUAD = {x["title"]: x["paragraphs"][0]["context"] for x in json.load(open(RAW / "CUAD-JSON.json"))["data"]}
        key = s[5:]
        hits = [t for t in CUAD if t.startswith(key) or key in t]
        if not hits: raise KeyError(f"CUAD title not found: {key}")
        return CUAD[sorted(hits, key=len)[0]], f"CUAD v1: {sorted(hits, key=len)[0]}"
    txt = (RAW / f"{s}.txt").read_text()
    log = {json.loads(l)["id"]: json.loads(l) for l in open(RAW / "_fetch_log.jsonl")}
    return txt, log[s].get("url")


def trim(d, t):
    if d.get("pages"):
        a, b = map(int, d["pages"].split("-"))
        parts = re.split(r"\[\[page (\d+)\]\]", t)
        t = "\n".join(parts[i + 1] for i in range(1, len(parts), 2) if a <= int(parts[i]) <= b)
    if d.get("slice"):
        st, en = d["slice"]; off = d.get("slice_from", 0)
        body = t[off:]
        m = re.search(st, body, re.M) if st != "^" else None
        body = body[m.start():] if m else body
        e = re.search(en, body[200:], re.M) if en != "$" else None
        t = body[: e.start() + 200] if e else body
    return t


def clean(d, t):
    t = re.sub(r"\[\[page \d+\]\]", "\n", t)
    t = re.sub(r"Source: [A-Z0-9 ,.&'()-]+, (?:S-1|S-1/A|10-K|10-K/A|10-Q|8-K|8-K/A|F-1|20-F|10-12G|DRS|S-4|485BPOS|10-KA|1-A)[^\n]{0,40}\d{1,2}/\d{1,2}/\d{4}", " ", t)
    for p in d.get("strip", []): t = re.sub(p, " ", t)
    t = re.sub(r"(?im)^\s*(EX-\d+\.\d+|EX-\d+|\d+\s+\S+\.htm|Document|Exhibit\s+\d+(\.\d+)?|EXHIBIT\s+\d+(\.\d+)?)\s*$", "", t)
    t = re.sub(r"[ \t]+", " ", t); t = re.sub(r"\n[ \t]+", "\n", t); t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


ORG_RX = re.compile(r"\b([A-Z][A-Za-z0-9&'.,\- ]{2,60}?(?:Inc\.|Incorporated|LLC|L\.L\.C\.|Corp\.|Corporation|Company|Co\.|L\.P\.|LP|LLP|Ltd\.|Limited|N\.A\.|Trust|Bank))")


def extract_entities(d, t):
    cands = sorted({m.group(1).strip(" ,") for m in ORG_RX.finditer(t)}, key=len)[:200]
    head, tail = t[:28000], t[-12000:] if len(t) > 40000 else ""
    roles = d.get("map_roles") or {}
    role_q = ""
    if roles or d.get("person_to"):
        keys = list(roles) + (["primary_individual"] if d.get("person_to") else [])
        role_q = ("\nAlso return \"roles\": an object mapping each of these role keys to the ORIGINAL name in the document that fills it "
                  f"(or null): {keys}. 'primary_individual' = the main individual party (employee, executive, award recipient, consultant, seller).")
    prompt = f"""Below are excerpts from a real legal document plus a list of candidate organization names found anywhere in it.
List every PRIVATE party identity that must be anonymized: private companies (including banks, law firms, brokers, affiliates, parents, dbas),
private individuals (signatories, officers, employees, attorneys, notaries, spouses, witnesses), street addresses, email addresses,
phone/fax numbers, and company website domains.
Do NOT list: government bodies, agencies, courts, public schools/cities/counties, statutes, standards bodies (ASTM, ASHRAE, UL), exchanges (COMEX, LME, NYSE),
arbitral institutions (AAA, JAMS), or generic terms.
For each identity give every surface variant used in the document (e.g., full legal name, short name, ALL CAPS form, 'Mr. Surname', surname alone).
Return JSON only: {{"entities": [{{"name": "...", "type": "org|person|address|email|phone|website", "variants": ["..."]}}]{', "roles": {...}' if role_q else ''}}}{role_q}

CANDIDATE ORG NAMES:
{json.dumps(cands)}

EXCERPT (start):
{head}

EXCERPT (end):
{tail}"""
    return llm(prompt, system="You extract named entities from legal documents with high recall. Output strict JSON.", expect_json=True, tag=f"ent:{d['id']}")


def build_map(d, t, ents):
    m = {}
    if d.get("map_from"): m.update(MAPS.get(d["map_from"], {}))
    m.update(d.get("map") or {})
    roles = (ents.get("roles") or {}) if isinstance(ents, dict) else {}
    target_roles = dict(d.get("map_roles") or {})
    if d.get("person_to"): target_roles["primary_individual"] = d["person_to"]
    for rk, orig in roles.items():
        if orig and rk in target_roles and orig not in m: m[orig] = target_roles[rk]
    state = d.get("gov", {}).get("to", "California")
    st2 = {"California": "CA", "Washington": "WA", "Illinois": "IL", "Texas": "TX"}.get(state)
    for e in (ents.get("entities", []) if isinstance(ents, dict) else []):
        name = (e.get("name") or "").strip(); typ = e.get("type", "org")
        if not name or name in KEEP_ALWAYS or len(name) < 3: continue
        variants = [v for v in {name, *(e.get("variants") or [])}
                    if v and len(v) >= 3 and re.sub(r"^(the|The|THE) ", "", v).strip().lower() not in GENERIC]
        if name.lower() in GENERIC: continue
        base = next((m[v] for v in variants if v in m), None)
        if base is None:
            if typ == "person": base = fake_person(name)
            elif typ == "address": base = fake_address(name, st2)
            elif typ == "email": base = re.sub(r"[^a-z]", ".", fake_person(name).lower()) + "@meridianmech.com"
            elif typ == "phone": base = "(916) 555-01" + str(abs(hash(name)) % 90 + 10)
            elif typ == "website": base = "www.meridianmech.com"
            else: base = fake_org(name)
        for v in variants:
            if v in m: continue
            if typ == "person" and " " not in v.strip() and v.strip() != name:   # surname-only / first-name-only variants
                parts_o, parts_f = name.split(), base.split()
                if v == parts_o[-1] or v.upper() == parts_o[-1].upper(): m[v] = parts_f[-1] if v != v.upper() else parts_f[-1].upper(); continue
                if v == parts_o[0]: m[v] = parts_f[0]; continue
            if typ == "person" and v.startswith(("Mr. ", "Ms. ", "Mrs. ", "Dr. ")):
                m[v] = v.split()[0] + " " + base.split()[-1]; continue
            m[v] = base.upper() if v.isupper() and len(v) > 3 else base
    # uppercase variants of explicit/org maps
    for k, v in list(m.items()):
        if not k.isupper() and len(k) > 4 and k.upper() not in m: m[k.upper()] = v.upper()
    return {k: v for k, v in m.items() if k != v}


def apply_map(t, m):
    for k in sorted(m, key=len, reverse=True):
        pat = (r"(?<![A-Za-z0-9])" if k[0].isalnum() else "") + re.escape(k) + (r"(?![A-Za-z0-9])" if k[-1].isalnum() else "")
        t = re.sub(pat, lambda _m, v=m[k]: v, t)
    return t


def shift_years(t, n):
    if not n: return t
    def yy(y): y = int(y); return str(y + n) if 1985 <= y <= 2026 else str(y)
    t = re.sub(rf"\b((?:{MONTHS})\.?\s+\d{{1,2}}(?:st|nd|rd|th)?,?\s+)(\d{{4}})\b", lambda m: m.group(1) + yy(m.group(2)), t)
    t = re.sub(rf"\b(day of (?:{MONTHS}),?\s+)(\d{{4}})\b", lambda m: m.group(1) + yy(m.group(2)), t)
    t = re.sub(rf"\b((?:{MONTHS})\s+)(\d{{4}})\b", lambda m: m.group(1) + yy(m.group(2)), t)
    t = re.sub(r"\b(\d{1,2}/\d{1,2}/)(\d{4})\b", lambda m: m.group(1) + yy(m.group(2)), t)
    t = re.sub(r"\b(\d{4})(-\d{2}-\d{2})\b", lambda m: yy(m.group(1)) + m.group(2), t)
    t = re.sub(r"\b((?:fiscal|calendar) year\s+|FY\s?)(\d{4})\b", lambda m: m.group(1) + yy(m.group(2)), t, flags=re.I)
    t = re.sub(r"\b(,\s*)(20[0-2]\d|19[89]\d)(\s*\(the)", lambda m: m.group(1) + yy(m.group(2)) + m.group(3), t)
    return t


def remap_gov(t, g):
    if not g: return t
    to = g["to"]
    for fr in g.get("from", []):
        if fr == to: continue
        for pat, rep in [(rf"laws of the State of {fr}", f"laws of the State of {to}"), (rf"laws of {fr}", f"laws of {to}"),
                         (rf"State of {fr}", f"State of {to}"), (rf"{fr} law", f"{to} law"), (rf"courts? (located )?in {fr}", f"courts located in {to}"),
                         (rf"(County|Counties), {fr}", rf"\1, {to}"), (rf"a {fr} (corporation|limited liability company)", rf"a {to} \1"),
                         (rf"under the laws of {fr}", f"under the laws of {to}")]:
            t = re.sub(pat, rep, t)
    return t


FACTS = """- Meridian Mechanical Group, Inc.: Delaware corporation, 2150 Harbor Point Drive, Suite 400, Sacramento, CA 95833 (d/b/a Meridian Plumbing, Heating & Air)
- Meridian Home Services Holdings, LLC: Delaware limited liability company (parent holding company), same address
- Meridian Mechanical of Washington, LLC: Washington LLC, 3310 South Pine Street, Tacoma, WA 98409
- Meridian Mechanical of Illinois, LLC: Illinois LLC, 1455 Busse Road, Elk Grove Village, IL 60007
- Meridian Mechanical of Texas, LLC: Texas LLC, 10850 West Little York Road, Houston, TX 77041
- Great Plains Copper Tube, Inc.: Oklahoma corporation, 4400 Foundry Road, Tulsa, OK 74107
- Northaire Comfort Systems Corporation: Florida corporation, 7700 Innovation Way, Palm Beach Gardens, FL 33418
- Hai Phong Precision Brass Co., Ltd.: Vietnam company, Lot C4 Trang Due Industrial Park, An Duong District, Hai Phong, Vietnam
- First Harbor Bank, N.A.: national banking association, 400 Capitol Mall, Sacramento, CA 95814
- FieldFlow Software, Inc.: Delaware corporation, 575 Market Street, San Francisco, CA 94105
- HomeHero Leads, Inc.: Delaware corporation, 1100 Congress Avenue, Austin, TX 78701
- Kessler Comfort Services, Inc.: Illinois corporation, 2200 East Higgins Road, Elk Grove Village, IL 60007; sole shareholder Karl Kessler
- Key officers of Meridian: Daniel R. Okafor (CEO), Priya Ramaswamy (CFO), Lauren M. Whitfield (General Counsel), Marcus T. Delgado (VP Operations)"""


def adapt(d, t, mapping):
    """LLM pass: adapt industry/product specifics (and fill redactions) while preserving structure and legal language."""
    prof = PROFILE["company"]
    fill = ""
    if d.get("fill") and REDACT.search(t):
        fill = ("\nThe source contains confidential-treatment redaction markers such as [***] or [*]. Replace EVERY marker with a specific, realistic value "
                "(prices, percentages, quantities, dates, product names) consistent with the context. After the document, output a line '=====FILLS=====' "
                "followed by a JSON list of {\"context\": \"<10 words around the marker>\", \"value\": \"<value you inserted>\"}.")
    prompt = f"""Adapt the following real contract into a document in the files of {prof['legal_name']} ({prof['dba']}), a {prof['employees']}-employee
plumbing and HVAC contractor operating in California, Washington, Illinois and Texas (HQ: {prof['hq']}).

ADAPTATION INSTRUCTIONS:
{d.get('adapt_note', 'Adapt industry-specific facts to the plumbing/HVAC context.')}

PARTY FACTS (use exactly; never invent other formation states or addresses for these parties):
{FACTS}

RULES:
- Preserve the document's structure, section numbering, defined terms, and legal drafting language as closely as possible; change only what the instructions require
  plus any remaining industry/product specifics that would be implausible for these parties.
- Use only the party names given in the instructions or already present in the text (they have already been anonymized). Never reintroduce any other company or person name.
- Do not summarize, abridge or add commentary. Output the complete document text only (no markdown fences, no preface).{fill}

DOCUMENT:
{t}"""
    out = llm(prompt, system="You are an experienced transactional lawyer adapting precedent documents. You output complete documents, never summaries.",
              tag=f"adapt:{d['id']}")
    out = strip_fences(out); fills = []
    if "=====FILLS=====" in out:
        out, fj = out.split("=====FILLS=====", 1)
        try: fills = json.loads(re.search(r"\[.*\]", fj, re.S).group(0))
        except Exception: fills = [{"context": "unparsed", "value": fj[:200]}]
    return out.strip(), fills


def leak_check(t, mapping, d):
    leaks = []
    for k, v in mapping.items():
        if len(k) < 4 or k.lower() in v.lower() or k in KEEP_ALWAYS: continue
        if k in STATE_NAMES or k in {"Ohio", "Texas", "California", "Washington", "Illinois"}: continue
        if re.search((r"(?<![A-Za-z0-9])" if k[0].isalnum() else "") + re.escape(k) + (r"(?![A-Za-z0-9])" if k[-1].isalnum() else ""), t):
            leaks.append(k)
    for k in d.get("must_absent", []):
        if re.search(re.escape(k), t, re.I): leaks.append(k)
    return sorted(set(leaks))


def process(d):
    t, src_ref = load_src(d)
    t = clean(d, trim(d, t))
    if d.get("keep_only_rows_with"):
        keys = d["keep_only_rows_with"]
        t = "\n".join(l for l in t.splitlines() if l.startswith("##") or any(k.lower() in l.lower() for k in keys))
    if d.get("drop_other_contractors"):
        t = "\n".join(l for l in t.splitlines() if not re.search(r"(Apollo|Elite|West ?Coast|TRS|Western Mech|JH ?Kelly|mailto)", l, re.I))
    ents = extract_entities(d, t)
    mapping = build_map(d, t, ents); MAPS[d["id"]] = mapping
    from common import META
    (META / f"{d['id']}.map.json").write_text(json.dumps(mapping, indent=0))
    t = apply_map(t, mapping)
    t = shift_years(t, d.get("year_shift", 0))
    t = remap_gov(t, d.get("gov"))
    for a, b in d.get("replace", []): t = t.replace(a, b)
    fills = []; pre_len = len(t)
    if d.get("adapt"):
        t, fills = adapt(d, t, mapping)
        t = apply_map(t, mapping)  # re-apply in case the model echoed an original
    residual = len(REDACT.findall(t))
    leaks = leak_check(t, mapping, d)
    rel = f"{d['area']}/{d['cluster']}/{d['file']}" if d.get("cluster") else f"{d['area']}/{d['file']}"
    src_class = {"cuad": "cuad", "E": "edgar", "A": "public_agency", "C": "court"}["cuad" if d["src"].startswith("cuad:") else d["src"][0]]
    meta = {"area": d["area"], "cluster": d.get("cluster"), "doc_type": d["doc_type"], "parent_id": d.get("parent"),
            "counterparty": d.get("counterparty"), "effective_date": str(d.get("effective")), "status": d.get("status", "active"),
            "roles": d.get("roles", []), "source_class": src_class + ("_llm_adapted" if d.get("adapt") else ""), "source_ref": src_ref,
            "year_shift": d.get("year_shift", 0), "governing_law_remap": d.get("gov"), "name_map_size": len(mapping),
            "filled_fields": fills, "adapt_length_ratio": round(len(t) / max(pre_len, 1), 2) if d.get("adapt") else None, "residual_redaction_markers": residual, "leak_check": {"ok": not leaks, "leaks": leaks}}
    write_doc(d["id"], rel, t, meta)
    return d["id"], len(t), len(mapping), residual, leaks


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only"); ap.add_argument("--workers", type=int, default=4); ap.add_argument("--missing", action="store_true")
    a = ap.parse_args()
    from common import META
    todo = [d for d in PLAN if (not a.only or d["id"].startswith(a.only)) and (not a.missing or not (META / f"{d['id']}.json").exists())]
    # map_from parents needed by missing docs are reloaded from their sidecar name maps
    for d in PLAN:
        mp = META / f"{d['id']}.map.json"
        if mp.exists(): MAPS[d["id"]] = json.loads(mp.read_text())
    # docs referenced by map_from must run first
    first = [d for d in todo if any(x.get("map_from") == d["id"] for x in PLAN)]
    rest = [d for d in todo if d not in first]
    fails = 0
    for batch in (first, rest):
        with cf.ThreadPoolExecutor(a.workers) as ex:
            futs = {ex.submit(process, d): d["id"] for d in batch}
            for f in cf.as_completed(futs):
                try:
                    i, n, nm, res, leaks = f.result()
                    print(f"{'OK ' if not leaks and not res else 'WARN'} {i:<22} {n:>7}c map={nm:<3} redactions_left={res} leaks={leaks[:5]}", flush=True)
                    fails += bool(leaks)
                except Exception as e:
                    print(f"ERR  {futs[f]:<22} {e}", flush=True); fails += 1
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
