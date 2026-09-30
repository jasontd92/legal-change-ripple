#!/usr/bin/env python3
"""Fetch every source in build/specs/sources.yaml into build/raw/, extract text, and log results.

Deterministic checks recorded per item: HTTP status, bytes, content type, extracted chars,
pages, chars/page (text-density filter for scans), and a sha256 of the raw bytes.
Usage: fetch.py [--only ID_PREFIX] [--kind KIND] [--force]
"""
import argparse, concurrent.futures as cf, hashlib, io, json, re, sys, time, threading
from pathlib import Path
import requests, yaml

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
LOG = RAW / "_fetch_log.jsonl"
UA_BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
UA_SEC = "gc-ai-takehome-corpus research-bot/1.0 (contact: research@example.com)"
MIN_CHARS_PER_PAGE = 500
_sec_lock = threading.Lock(); _sec_last = [0.0]


def url_for(s):
    m = s.get("method", "http")
    if m == "fr":
        return f"https://www.federalregister.gov/documents/full_text/text/{s['fr']}.txt"
    if s.get("chicago"):
        return ("https://ecm.chicago.gov/eSMARTContracts/service/DPSWebDocumentViewer?id="
                f"{s['chicago']}&osName=eContentContracts&el=0&image=image")
    if m == "wb":
        return f"https://web.archive.org/web/{s['ts']}id_/{s['url']}"
    if m == "cdx":
        r = requests.get("http://archive.org/wayback/available",
                         params={"url": s["url"], "timestamp": s["date"]}, timeout=60)
        snap = r.json().get("archived_snapshots", {}).get("closest")
        if not snap:
            raise RuntimeError("no wayback snapshot")
        ts = snap["timestamp"]; s["resolved_ts"] = ts
        return f"https://web.archive.org/web/{ts}id_/{s['url']}"
    return s["url"]


def get(url, sec=False):
    headers = {"User-Agent": UA_SEC if sec else UA_BROWSER, "Accept": "*/*"}
    if sec:
        with _sec_lock:  # SEC fair-access: <= ~1 request/sec
            wait = 1.1 - (time.time() - _sec_last[0])
            if wait > 0: time.sleep(wait)
            _sec_last[0] = time.time()
    last = None
    for attempt in range(4):
        try:
            r = requests.get(url, headers=headers, timeout=180, allow_redirects=True)
            if r.status_code == 200 and r.content:
                return r
            last = f"HTTP {r.status_code}"
            if r.status_code in (403, 404): break
        except Exception as e:
            last = repr(e)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(last)


def html_to_text(b):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(b, "html.parser")
    for t in soup(["script", "style", "noscript", "svg", "header", "footer", "nav"]):
        t.decompose()
    # keep block structure
    for br in soup.find_all(["br"]): br.replace_with("\n")
    for blk in soup.find_all(["p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "table"]):
        blk.insert_after("\n")
    txt = soup.get_text()
    txt = re.sub(r"[ \t\xa0]+", " ", txt)
    txt = re.sub(r"\n\s*\n\s*\n+", "\n\n", txt)
    return txt.strip()


def pdf_to_text(b):
    import pypdf
    r = pypdf.PdfReader(io.BytesIO(b))
    pages = []
    for p in r.pages:
        try: pages.append(p.extract_text() or "")
        except Exception: pages.append("")
    return "\n\n".join(f"[[page {i+1}]]\n{t}" for i, t in enumerate(pages)), len(pages)


def xlsx_to_text(b):
    import zipfile
    z = zipfile.ZipFile(io.BytesIO(b))
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        shared = re.findall(r"<t[^>]*>(.*?)</t>", z.read("xl/sharedStrings.xml").decode("utf8", "ignore"), re.S)
    out = []
    for n in sorted(x for x in z.namelist() if x.startswith("xl/worksheets/sheet")):
        xml = z.read(n).decode("utf8", "ignore"); out.append(f"## {n}")
        for row in re.findall(r"<row[^>]*>(.*?)</row>", xml, re.S):
            cells = []
            for c in re.finditer(r'<c ([^>]*?)(?:/>|>(.*?)</c>)', row, re.S):
                attrs, inner = c.group(1), c.group(2) or ""
                vm = re.search(r"<v>(.*?)</v>", inner, re.S); v = vm.group(1) if vm else re.sub(r"<[^>]+>", "", inner)
                if 't="s"' in attrs and v.isdigit() and int(v) < len(shared): v = shared[int(v)]
                cells.append(re.sub("<[^>]+>", "", v))
            if any(cells): out.append(" | ".join(cells))
    return "\n".join(out)


def docx_to_text(b):
    import zipfile
    xml = zipfile.ZipFile(io.BytesIO(b)).read("word/document.xml").decode("utf8", "ignore")
    xml = re.sub(r"</w:p>", "\n", xml)
    return re.sub(r"<[^>]+>", "", xml)


def extract(s, r):
    b = r.content; ct = r.headers.get("content-type", "")
    fmt = s.get("fmt") or ("pdf" if b[:4] == b"%PDF" else "txt" if s.get("method") == "fr" else "html")
    if b[:4] == b"%PDF": fmt = "pdf"
    pages = None
    if fmt == "pdf": text, pages = pdf_to_text(b)
    elif fmt == "xlsx": text = xlsx_to_text(b)
    elif fmt == "docx": text = docx_to_text(b)
    elif fmt in ("json", "csv"): text = None
    elif s.get("method") == "fr" or fmt == "txt":
        t = b.decode("utf8", "ignore")
        text = html_to_text(t) if "<html" in t[:500].lower() else t
    else: text = html_to_text(b)
    return fmt, text, pages


def fetch_one(s, force=False):
    sid = s["id"]
    done = sorted(RAW.glob(f"{sid}.*"))
    if done and not force:
        return None
    rec = {"id": sid, "kind": s["kind"], "t": time.strftime("%Y-%m-%dT%H:%M:%S")}
    try:
        url = url_for(s); rec["url"] = url
        r = get(url, sec="sec.gov" in url)
        fmt, text, pages = extract(s, r)
        (RAW / f"{sid}.{fmt}").write_bytes(r.content)
        rec.update(status=r.status_code, bytes=len(r.content), fmt=fmt, sha256=hashlib.sha256(r.content).hexdigest()[:16],
                   content_type=r.headers.get("content-type", ""), resolved_ts=s.get("resolved_ts"))
        if text is not None:
            (RAW / f"{sid}.txt").write_text(text) if fmt != "txt" else None
            body = re.sub(r"\[\[page \d+\]\]", "", text)
            n = len(re.sub(r"\s+", " ", body))
            rec.update(chars=n, pages=pages, chars_per_page=(n // pages if pages else None),
                       scanned=bool(pages and n / pages < MIN_CHARS_PER_PAGE))
        rec["ok"] = True
    except Exception as e:
        rec.update(ok=False, error=str(e)[:300])
    with open(LOG, "a") as f: f.write(json.dumps(rec) + "\n")
    return rec


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only"); ap.add_argument("--kind"); ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    srcs = yaml.safe_load(open(ROOT / "specs" / "sources.yaml"))
    srcs = [s for s in srcs if (not a.only or s["id"].startswith(a.only)) and (not a.kind or s["kind"] == a.kind)]
    with cf.ThreadPoolExecutor(8) as ex:
        for rec in ex.map(lambda s: fetch_one(s, a.force), srcs):
            if rec:
                flag = "OK " if rec["ok"] else "ERR"
                extra = f"{rec.get('fmt','')} {rec.get('chars','-')}c {rec.get('pages') or ''}p{' SCANNED' if rec.get('scanned') else ''}" if rec["ok"] else rec.get("error")
                print(f"{flag} {rec['id']:<32} {extra}", flush=True)


if __name__ == "__main__":
    main()
