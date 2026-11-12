#!/usr/bin/env python3
"""Materialize the approved international voice-lecture modules and exact audio bytes on CN."""
from __future__ import annotations

import hashlib
import html
import importlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"
sys.path.insert(0, str(CN / "scripts"))
mirror = importlib.import_module("materialize-public-content-mirror")
parity = importlib.import_module("materialize-source-content-parity")

MANIFEST = CN / "archive" / "source-content-parity.json"
MEDIA_MANIFEST = CN / "archive" / "media-manifest.txt"
START = "<!-- QILY-CN-LECTURE-MODULE:START -->"
END = "<!-- QILY-CN-LECTURE-MODULE:END -->"

EXPECTED = {
    "qilylean/daily/2026-11-08.html": ("/briefs/archive/2026-11-08/", 10),
    "qilylean/daily/2026-10-25.html": ("/briefs/archive/2026-10-25/", 12),
    "improvements/visual/index.html": ("/archive/improvements/visual/", 9),
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def extract_lecture(raw: str, source: str) -> tuple[str, str, str]:
    styles = list(re.finditer(
        r'<style\b(?=[^>]*\bid=["\']qilyLectureStyle["\'])[^>]*>([\s\S]*?)</style\s*>',
        raw, re.I,
    ))
    require(len(styles) == 1, "Expected exactly one qilyLectureStyle: " + source)
    style = styles[0].group(1)

    section = re.search(
        r'<section\b(?=[^>]*\bid=["\']qily-lecture["\'])[^>]*>',
        raw, re.I,
    )
    require(section is not None, "Lecture section missing: " + source)
    audio = re.search(
        r'<audio\b(?=[^>]*\bid=["\']qilyLecAudio["\'])[^>]*>',
        raw[section.start():], re.I,
    )
    require(audio is not None, "Lecture audio element missing: " + source)
    audio_end = section.start() + audio.end()
    script_open = re.search(r"<script\b[^>]*>", raw[audio_end:], re.I)
    require(script_open is not None, "Lecture runtime missing after audio element: " + source)
    script_start = audio_end + script_open.start()
    runtime_start = audio_end + script_open.end()
    script_close = re.search(r"</script\s*>", raw[runtime_start:], re.I)
    require(script_close is not None, "Lecture runtime is not closed: " + source)
    runtime_end = runtime_start + script_close.start()

    markup = raw[section.start():script_start].strip()
    runtime = raw[runtime_start:runtime_end]
    for required_id in ("qilyLecChapters", "qilyLecPlayer", "qilyLecMini", "qilyLecAudio"):
        require(re.search(r'\bid=["\']' + re.escape(required_id) + r'["\']', markup, re.I) is not None,
                "Lecture player element missing " + required_id + ": " + source)
    require("qilyLecPlayBtn" in markup and "qilyLecCollapseBtn" in markup,
            "Lecture player controls missing: " + source)
    return style, markup, runtime


def main() -> None:
    require(MANIFEST.is_file(), "Source-content manifest missing; run materialize-source-content-parity.py first")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    media_rows = {row["source"]: row for row in manifest.get("media_files", [])}
    media_paths = set(manifest.get("media", []))
    media_lines = set(MEDIA_MANIFEST.read_text(encoding="utf-8").splitlines()) if MEDIA_MANIFEST.is_file() else set()

    modules = []
    discovered = set()
    for item in mirror.SOURCES:
        source = item.path.as_posix()
        source_path = ROOT / source
        if not source_path.is_file():
            continue
        raw = source_path.read_text(encoding="utf-8", errors="ignore")
        has_section = re.search(r'\bid=["\']qily-lecture["\']', raw, re.I) is not None
        has_player = re.search(r'\bid=["\']qilyLecPlayer["\']', raw, re.I) is not None
        if not has_section and not has_player:
            continue
        require(has_section and has_player, "Incomplete source lecture module; refusing partial clone: " + source)

        route = item.url
        target = item.out
        require(target.is_file(), "Generated CN lecture page missing: " + str(target))
        source_main = re.search(r"<main\b[^>]*>[\s\S]*?</main\s*>", raw, re.I)
        require(source_main is not None and re.search(r'href=["\'][^"\']*#qily-lecture["\']', source_main.group(0), re.I),
                "Source page has no one-click lecture entry: " + source)

        style, markup, runtime = extract_lecture(raw, source)
        audio_records = {}

        audio_path_pattern = re.compile(
            r'(?P<quote>["\'])(?P<path>(?:\./)?assets/audio/[^"\']+?\.mp3\.b64)(?P=quote)'
        )

        def localize_audio(match: re.Match[str]) -> str:
            relative = unquote(urlsplit(urljoin("/" + source, match.group("path"))).path).lstrip("/")
            if source.startswith("qilylean/daily/"):
                require(relative.startswith("qilylean/daily/assets/audio/"),
                        "Daily lecture audio escaped its approved source directory: " + relative)
            elif source.startswith("improvements/visual/"):
                require(relative.startswith("improvements/visual/assets/audio/"),
                        "Visual lecture audio escaped its approved source directory: " + relative)
            else:
                raise SystemExit("Unapproved lecture source: " + source)

            original = ROOT / relative
            require(original.is_file() and original.stat().st_size > 0,
                    "Original lecture audio asset missing: " + relative)
            digest = sha_file(original)
            encoded = quote(relative, safe="/")
            local_url = "/assets/public-media/" + encoded + "?v=" + digest[:16]

            delivery = CN / "assets" / "public-media" / relative
            delivery.parent.mkdir(parents=True, exist_ok=True)
            if not delivery.is_file() or delivery.stat().st_size != original.stat().st_size or sha_file(delivery) != digest:
                delivery.write_bytes(original.read_bytes())
            require(sha_file(delivery) == digest, "CN lecture audio differs from source bytes: " + relative)

            audio_records[relative] = {
                "source": relative,
                "url": local_url,
                "sha256": digest,
                "bytes": original.stat().st_size,
            }
            media_paths.add(encoded)
            media_lines.add(encoded)
            media_rows[relative] = {
                "source": relative,
                "url": local_url,
                "sha256": digest,
                "bytes": original.stat().st_size,
            }
            return match.group("quote") + local_url + match.group("quote")

        runtime, replacements = audio_path_pattern.subn(localize_audio, runtime)
        require(replacements > 0 and audio_records,
                "No localizable MP3 base64 chapter paths found in lecture runtime: " + source)
        require(audio_path_pattern.search(runtime) is None,
                "International-relative audio path remains in CN lecture runtime: " + source)
        require("qilylean.com" not in runtime and "qilylean.cn" not in runtime,
                "Lecture runtime must not depend on cross-domain fetches: " + source)

        updated = target.read_text(encoding="utf-8")
        updated = re.sub(
            r'<style\b(?=[^>]*\bdata-cn-lecture-css=["\']v1["\'])[^>]*>[\s\S]*?</style\s*>',
            "",
            updated,
            flags=re.I,
        )
        updated = re.sub(
            r'<script\b(?=[^>]*\bdata-cn-lecture-runtime=["\']v1["\'])[^>]*>[\s\S]*?</script\s*>',
            "",
            updated,
            flags=re.I,
        )

        module_block = START + "\n" + markup + "\n" + END
        main_match = re.search(r"<main\b[^>]*>[\s\S]*?</main\s*>", updated, re.I)
        require(main_match is not None, "CN lecture target has no main content: " + route)
        main_html = main_match.group(0)
        marker_match = re.search(re.escape(START) + r"[\s\S]*?" + re.escape(END), main_html, re.I)
        if marker_match:
            new_main = main_html[:marker_match.start()] + module_block + main_html[marker_match.end():]
        else:
            section = re.search(r'<section\b(?=[^>]*\bid=["\']qily-lecture["\'])[^>]*>', main_html, re.I)
            require(section is not None, "Sanitized CN lecture section is missing: " + route)
            audio = re.search(
                r'<audio\b(?=[^>]*\bid=["\']qilyLecAudio["\'])[^>]*>',
                main_html[section.start():],
                re.I,
            )
            require(audio is not None, "Sanitized CN lecture audio element is missing: " + route)
            audio_start = section.start() + audio.start()
            audio_after_open = audio_start + audio.end()
            audio_close = re.search(r"</audio\s*>", main_html[audio_after_open:], re.I)
            # The generic content sanitizer serializes audio as a void-like placeholder.
            # Replace through the opening tag when its closing tag was intentionally omitted.
            block_end = audio_after_open + audio_close.end() if audio_close else audio_after_open
            new_main = main_html[:section.start()] + module_block + main_html[block_end:]
        updated = updated[:main_match.start()] + new_main + updated[main_match.end():]
        source_attr = html.escape(source, quote=True)
        style_tag = '<style data-cn-lecture-css="v1" data-cn-lecture-source="' + source_attr + '">' + style + "</style>"
        runtime_tag = '<script data-cn-lecture-runtime="v1" data-cn-lecture-source="' + source_attr + '">' + runtime + "</script>"
        updated, head_count = re.subn(
            r"</head\s*>",
            lambda match: style_tag + match.group(0),
            updated,
            count=1,
            flags=re.I,
        )
        require(head_count == 1, "Could not install local lecture stylesheet: " + route)
        updated, body_count = re.subn(
            r"</body\s*>",
            lambda match: runtime_tag + match.group(0),
            updated,
            count=1,
            flags=re.I,
        )
        require(body_count == 1, "Could not install local lecture runtime: " + route)

        for element_id in ("qily-lecture", "qilyLecChapters", "qilyLecPlayer", "qilyLecMini", "qilyLecAudio"):
            require(len(re.findall(r'\bid=["\']' + re.escape(element_id) + r'["\']', updated, re.I)) == 1,
                    "CN lecture page has a missing or duplicate element ID " + element_id + ": " + route)
        updated_main = re.search(r"<main\b[^>]*>[\s\S]*?</main\s*>", updated, re.I)
        require(updated_main is not None and re.search(r'href=["\'][^"\']*#qily-lecture["\']', updated_main.group(0), re.I) is not None,
                "CN lecture page lost its one-click content entry: " + route)

        target.write_text(updated, encoding="utf-8")
        page_row = next((row for row in manifest.get("pages", []) if row.get("source") == source), None)
        require(page_row is not None, "Source-content manifest page record missing: " + source)
        page_row["main_sha256"] = sha_bytes(parity.main_markup(updated).encode("utf-8"))
        audio_list = sorted(audio_records.values(), key=lambda row: row["source"])
        modules.append({
            "source": source,
            "url": route,
            "style_sha256": sha_bytes(style.encode("utf-8")),
            "markup_sha256": sha_bytes(markup.encode("utf-8")),
            "runtime_sha256": sha_bytes(runtime.encode("utf-8")),
            "audio": audio_list,
        })
        discovered.add(source)

    require(set(EXPECTED) <= discovered,
            "Approved lecture sources were not materialized: " + ", ".join(sorted(set(EXPECTED) - discovered)))
    for source, (route, chapter_count) in EXPECTED.items():
        row = next(item for item in modules if item["source"] == source)
        require(row["url"] == route, "Lecture route changed without review: " + source)
        require(len(row["audio"]) == chapter_count,
                "Lecture chapter count changed without review: " + source)

    manifest["media_files"] = sorted(media_rows.values(), key=lambda row: row["source"])
    manifest["media"] = sorted(media_paths)
    manifest["lecture_modules"] = sorted(modules, key=lambda row: row["source"])
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MEDIA_MANIFEST.write_text("\n".join(sorted(media_lines)) + ("\n" if media_lines else ""), encoding="utf-8")

    total_bytes = sum(row["bytes"] for module in modules for row in module["audio"])
    total_chapters = sum(len(module["audio"]) for module in modules)
    print(json.dumps({
        "ok": True,
        "lecture_pages": len(modules),
        "audio_chapters": total_chapters,
        "audio_bytes": total_bytes,
        "routes": [row["url"] for row in modules],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
