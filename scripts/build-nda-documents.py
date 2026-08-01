#!/usr/bin/env python3
"""Build the canonical QilyLean NDA DOCX from versioned compressed source parts."""
from pathlib import Path
import base64
import gzip

ROOT = Path(__file__).resolve().parents[1]
PARTS = sorted((ROOT / "scripts" / "nda-source").glob("part-*.b64"))
if not PARTS:
    raise SystemExit("NDA source parts are missing")

payload = "".join(part.read_text(encoding="utf-8").strip() for part in PARTS)
source = gzip.decompress(base64.b64decode(payload)).decode("utf-8")
namespace = {"__name__": "__main__", "__file__": str(Path(__file__).resolve())}
exec(compile(source, "<qilylean-nda-generator>", "exec"), namespace)
