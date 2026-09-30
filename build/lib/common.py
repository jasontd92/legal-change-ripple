"""Shared helpers: paths, cached Haiku calls, fictional-name pools, per-document metadata sidecars."""
import hashlib, json, os, random, re, subprocess, threading, time
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / "build"; RAW = BUILD / "raw"; META = BUILD / "meta"; CACHE = BUILD / "cache"
DOCS = ROOT / "corpus" / "documents"
PROFILE = yaml.safe_load(open(ROOT / "corpus" / "company" / "profile.yaml"))
for d in (META, CACHE, DOCS): d.mkdir(parents=True, exist_ok=True)

SYSTEM_DIR = BUILD / "specs" / "prompts"
_llm_lock = threading.Lock()
LLM_LOG = BUILD / "validate" / "llm_calls.jsonl"


def llm(prompt: str, system: str = "You are a careful legal document drafter.", model: str = "haiku",
        expect_json: bool = False, tag: str = "", retries: int = 2) -> str:
    """Call `claude -p` headless with no tools; cached by sha256(model+system+prompt)."""
    key = hashlib.sha256(f"{model}\n{system}\n{prompt}".encode()).hexdigest()[:24]
    cp = CACHE / f"{key}.json"
    if cp.exists():
        out = json.loads(cp.read_text())["result"]
        return _parse_json(out) if expect_json else out
    sp = CACHE / f"{key}.sys"; sp.write_text(system)
    last = None; attempt = 0; limit_waits = 0
    while attempt <= retries:
        t0 = time.time()
        try:
            p = subprocess.run(["claude", "-p", "--model", model, "--output-format", "json", "--system-prompt-file", str(sp),
                                "--tools", "", "--no-session-persistence", "--strict-mcp-config", "--setting-sources", ""],
                               input=prompt, capture_output=True, text=True, timeout=900)
            d = json.loads(p.stdout)
            if d.get("is_error"):
                msg = d.get("result", "")[:300]
                if "limit" in msg.lower() and limit_waits < 18:   # usage window: wait it out (up to ~3h) instead of failing
                    limit_waits += 1; time.sleep(600); continue
                raise RuntimeError(msg)
            out = d["result"]
            if expect_json: _parse_json(out)  # validate parse before caching
            cp.write_text(json.dumps({"result": out, "tag": tag, "usage": d.get("usage", {}), "cost": d.get("total_cost_usd")}))
            with _llm_lock, open(LLM_LOG, "a") as f:
                f.write(json.dumps({"tag": tag, "key": key, "secs": round(time.time() - t0, 1), "cost": d.get("total_cost_usd"),
                                    "out_tokens": d.get("usage", {}).get("output_tokens"), "stop": d.get("stop_reason")}) + "\n")
            return _parse_json(out) if expect_json else out
        except Exception as e:
            last = e; attempt += 1; time.sleep(3 * attempt)
    raise RuntimeError(f"llm failed [{tag}]: {last}")


def _parse_json(s: str):
    s = s.strip()
    m = re.search(r"```(?:json)?\s*(.*?)```", s, re.S)
    if m: s = m.group(1).strip()
    i = min([x for x in (s.find("{"), s.find("[")) if x >= 0], default=0)
    return json.loads(s[i:])


def strip_fences(s: str) -> str:
    s = s.strip()
    m = re.match(r"^```[a-z]*\n(.*)\n```$", s, re.S)
    return m.group(1) if m else s


# ---------------- fictional pools (deterministic by seed) ----------------
FIRST = ["Aaron","Adrienne","Alan","Alicia","Andre","Beatrice","Bennett","Brianna","Caleb","Camila","Carter","Celeste","Colin","Dana","Darius",
         "Delia","Derek","Elise","Emmett","Farah","Felix","Gavin","Gemma","Grady","Hana","Hector","Imani","Isaac","Jada","Jonah","Kara","Keegan",
         "Lena","Lionel","Malia","Mason","Mira","Nadia","Nolan","Odessa","Omar","Paige","Quentin","Rafael","Renee","Rhys","Sabrina","Silas",
         "Talia","Theo","Uma","Vance","Willa","Wesley","Xavier","Yara","Zane","Corinne","Dmitri","Esther","Fiona","Gideon","Ingrid","Joaquin"]
LAST = ["Abernathy","Ashby","Bancroft","Bellweather","Brandt","Carrow","Castellano","Dunmore","Ellison","Falkner","Fairbanks","Garnett","Halvorsen",
        "Hargrove","Iverson","Jessup","Kilgore","Lachance","Lindqvist","Marchetti","McAlister","Nakamura","Northcott","Oyelaran","Pemberton","Quill",
        "Radcliffe","Ruiz-Montoya","Sandoval","Stroud","Thornbury","Underhill","Vasquez-Reid","Whitcombe","Yardley","Zamora","Okonkwo","Petrakis",
        "Sorenson","Tallis","Voss","Wilder","Kowalczyk","Delacroix","Haverford","Ingersoll","Mbeki","Rosales","Strickland","Tanaka"]
ORG_A = ["Arbor","Beacon","Bluestem","Cedar","Copperline","Driftwood","Ember","Fairhaven","Granite","Harbor","Ironwood","Juniper","Keel","Larkspur",
         "Meadowbrook","Northfield","Oakhurst","Pinnacle","Quarry","Redwing","Silverleaf","Timberline","Upland","Vantage","Westbrook","Yellowstone"]
ORG_B = ["Industries","Holdings","Partners","Group","Services","Capital","Solutions","Enterprises","Systems","Associates","Resources","Technologies"]
SUFFIX = ["Inc.","LLC","L.P.","Corporation","Co."]
STREETS = ["Commerce Way","Industrial Parkway","Market Street","Riverside Drive","Enterprise Boulevard","Lakeview Road","Old Mill Road","Harbor Lane",
           "Summit Avenue","Park Center Drive","Foundry Street","Canal Road"]
CITIES = [("Sacramento","CA","95815"),("San Jose","CA","95131"),("Fresno","CA","93727"),("Tacoma","WA","98421"),("Spokane","WA","99202"),
          ("Elk Grove Village","IL","60007"),("Naperville","IL","60563"),("Houston","TX","77041"),("San Antonio","TX","78218"),("Dallas","TX","75247")]


def rng_for(*parts):
    return random.Random(hashlib.sha256("|".join(map(str, parts)).encode()).hexdigest())


# Names hand-written into prose specs (generate/specs_gen.py); generated people must not collide with them.
RESERVED_PEOPLE = {"Rafael Underhill", "Darius Kilgore", "Gemma Northcott", "Hector Bancroft", "Talia Ruiz-Montoya"}


def fake_person(seed):
    r = rng_for("person", seed); name = f"{r.choice(FIRST)} {r.choice(LAST)}"
    if name in RESERVED_PEOPLE:
        r = rng_for("person", seed, "alt"); name = f"{r.choice(FIRST)} {r.choice(LAST)}"
    return name


def fake_org(seed, suffix=None):
    r = rng_for("org", seed); return f"{r.choice(ORG_A)} {r.choice(ORG_B)}, {suffix or r.choice(SUFFIX)}"


def fake_address(seed, state=None):
    r = rng_for("addr", seed)
    opts = [c for c in CITIES if not state or c[1] == state] or CITIES
    city, st, z = r.choice(opts)
    return f"{r.randint(100, 9899)} {r.choice(STREETS)}, {city}, {st} {z}"


# ---------------- metadata sidecars ----------------
def write_doc(doc_id: str, relpath: str, text: str, meta: dict):
    out = DOCS / relpath; out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text.rstrip() + "\n")
    meta = {"doc_id": doc_id, "path": f"documents/{relpath}", "chars": len(text), **meta}
    (META / f"{doc_id}.json").write_text(json.dumps(meta, indent=1, default=str))
    return out


def all_meta():
    return [json.loads(p.read_text()) for p in sorted(META.glob("*.json")) if not p.name.endswith(".map.json")]
