"""Reference implementation of contracts/normalize/SPEC.md (v0.1.0)."""
import re
import sys
import unicodedata
from pathlib import Path


def normalize(raw: bytes | str) -> str:
    text = raw.decode("utf-8") if isinstance(raw, bytes) else raw
    if text.startswith("﻿"):
        text = text[1:]
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return unicodedata.normalize("NFC", text)


def norm_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def read_normalized(path: str | Path) -> str:
    return normalize(Path(path).read_bytes())


def span_text(path: str | Path, start: int, end: int) -> str:
    return read_normalized(path)[start:end]


def quote_in_span(path: str | Path, start: int, end: int, quote: str) -> bool:
    return norm_ws(quote) in norm_ws(span_text(path, start, end))


if __name__ == "__main__":
    import json
    vectors = json.loads((Path(__file__).parent / "test_vectors.json").read_text())
    failed = 0
    for v in vectors:
        got = normalize(v["raw"])
        ok = got == v["normalized"] and got[v["start"]:v["end"]] == v["slice"]
        failed += not ok
        print(("PASS" if ok else "FAIL"), v["name"])
    sys.exit(1 if failed else 0)
