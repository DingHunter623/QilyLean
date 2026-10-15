#!/usr/bin/env python3
"""Clone public directory markup, styles and search from the international SSOT."""
from __future__ import annotations
import hashlib, importlib, re, sys, subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / "cn-site"
SOURCE = ROOT / "links/index.html"
PAGE = CN / "resources/index.html"
RUNTIME = CN / "assets/cn-public-tech-directory-v1.js"
STYLE = CN / "assets/cn-public-tech-directory-v1.css"
SCOPE = 'main:is(#main,#qilyResourcePublicDirectory)[data-qily-public-tech-directory="v2"]'
PUBLIC_STYLE = ROOT / "site-public-tech-directory-v1.css"
EXCLUDE_SERVICES = ':not(:where(.resource-service,.resource-service *,.qily-resource-network,.qily-resource-network *))'
sys.dont_write_bytecode = True
sys.path.insert(0, str(CN / "scripts"))
css = importlib.import_module("materialize-brief-visual-parity")
css.CONTENT_SCOPE = SCOPE
source = importlib.import_module("materialize-public-content-mirror")
PUBLIC_CLASSES = set()
PUBLIC_IDS = set()
PUBLIC_TAGS = set()

def relevant_selector(selector: str) -> bool:
    # Consider alternatives independently; classes inside :not() are exclusions,
    # not required DOM nodes. Keep original selectors in emitted CSS so their
    # specificity remains the same as the international cascade.
    function = re.search(r":(is|where|has|not)\(", selector)
    if function:
        depth = 1
        end = function.end()
        while end < len(selector) and depth:
            if selector[end] == "(": depth += 1
            elif selector[end] == ")": depth -= 1
            end += 1
        if depth: return False
        parts = [""] if function.group(1) == "not" else css.split_css(selector[function.end():end-1], ",")
        return any(relevant_selector(selector[:function.start()] + part + selector[end:]) for part in parts)
    selector = re.sub(r"\[[^\]]*\]", "", selector)
    if set(re.findall(r"\.([a-zA-Z_][\w-]*)", selector)) - PUBLIC_CLASSES: return False
    if set(re.findall(r"#([\w-]+)", selector)) - PUBLIC_IDS: return False
    for _, _, compound in css.selector_compounds(selector):
        tag = re.match(r"([a-zA-Z][\w-]*)", compound)
        if tag and tag.group(1).lower() not in PUBLIC_TAGS: return False
    return True

class HeadStyles(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = self.in_style = False
        self.blocks = []
        self.current = ""
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head": self.in_head = True
        if not self.in_head: return
        if tag == "style": self.in_style = True; self.current = ""
        if tag == "link" and attrs.get("rel") == "stylesheet":
            if attrs.get("id") == "qilyPublicTechDirectoryStyles": return
            rel = attrs.get("href", "").split("?", 1)[0].lstrip("/")
            path = ROOT / rel
            if Path(rel).suffix != ".css" or ".." in Path(rel).parts or not path.is_file():
                raise ValueError("Unresolved international stylesheet: " + rel)
            self.blocks.append((rel, path.read_text(encoding="utf-8")))
    def handle_endtag(self, tag):
        if tag == "style" and self.in_style:
            self.blocks.append(("links/index.html", self.current)); self.in_style = False
        if tag == "head": self.in_head = False
    def handle_data(self, data):
        if self.in_style: self.current += data

def public_styles(content: str, base: str, important: bool, imports=()) -> str:
    """Scope the original cascade; keep source-important declarations last.

    The reset prevents destination-only padding or typography from leaking in.
    Rules stay inside the content main, never the China header or footer.
    """
    output = []
    for prelude, body in css.css_rules(content):
        if prelude.startswith("@"):
            if re.match(r"@import\b", prelude):
                match = re.search(r"url\([\"']?([^\"')]+)", prelude)
                if not match: raise ValueError("Unsupported source CSS import")
                rel = match.group(1).split("?", 1)[0].lstrip("/")
                target = ROOT / rel
                if rel in imports or Path(rel).suffix != ".css" or ".." in Path(rel).parts or not target.is_file():
                    raise ValueError("Invalid source CSS import: " + rel)
                output.append(public_styles(target.read_text(encoding="utf-8"), rel, important, imports + (rel,)))
                continue
            if re.match(r"@(?:media|supports|container|layer)\b", prelude):
                nested = public_styles(body, base, important, imports)
                if nested: output.append(prelude + "{" + nested + "}")
            continue
        if body is None: continue
        selectors = []
        for selector in css.split_css(prelude, ","):
            if re.search(r"data-qily-site=[\"']cn", selector, re.I):
                continue
            if not relevant_selector(selector): continue
            scoped = css.scope_selector(selector)
            if scoped:
                if "::" in scoped:
                    left, right = scoped.split("::", 1)
                    scoped = left + EXCLUDE_SERVICES + "::" + right
                else: scoped += EXCLUDE_SERVICES
                selectors.append(scoped)
        if not selectors: continue
        declarations = []
        root_rule = all(s.removesuffix(EXCLUDE_SERVICES).endswith(css.CONTENT_SCOPE) for s in selectors)
        for item in css.split_css(css.safe_declarations(body, base), ";"):
            prop, sep, value = item.partition(":")
            if not sep: continue
            priority = bool(re.search(r"!important\s*$", value, re.I))
            if priority != important: continue
            if root_rule and not (prop.startswith("--") or prop.startswith("font") or prop in {"color", "background", "background-color", "line-height", "-webkit-text-fill-color"}):
                continue
            if source.FORBIDDEN.search(value):
                raise ValueError("Commercial text in directory style: " + prop)
            declarations.append(prop + ":" + re.sub(r"\s*!important\s*$", "", value, flags=re.I) + "!important")
        if declarations: output.append(",".join(selectors) + "{" + ";".join(declarations) + "}")
    return "\n".join(output)

def write(path: Path, content: str) -> None:
    content = content.rstrip() + "\n"
    if not path.is_file() or path.read_text(encoding="utf-8") != content:
        path.write_text(content, encoding="utf-8")

def main() -> None:
    original = SOURCE.read_text(encoding="utf-8")
    found = re.findall(r"var rows=\x60([\s\S]*?)\x60;", original)
    if len(found) != 1: raise ValueError("Expected one international directory dataset")
    rows = [line.split("|") for line in found[0].strip().splitlines()]
    for row in rows:
        if len(row) != 5 or not all(row): raise ValueError("Invalid directory record")
        parsed = urlparse(row[4])
        if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
            raise ValueError("Invalid official website")
    if len(rows) != 100 or len({row[4] for row in rows}) != 100 or len({row[2] for row in rows}) != 5:
        raise ValueError("Expected 100 unique enterprises and five categories")
    if any(row[2] == "网址导航" or row[0].lower() == "hao123" for row in rows):
        raise ValueError("hao123 must remain outside the enterprise directory")

    main_match = re.search(r"<main\b[^>]*>\s*([\s\S]*?)</main>", original)
    boundary = "<!-- QILY-RESOURCE-NETWORK:LINKS:START -->"
    if not main_match or main_match.group(1).count(boundary) != 1:
        raise ValueError("Public/commercial source boundary missing")
    fragment = main_match.group(1).split(boundary)[0] + "</div></section>"
    bridge = ('<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:START -->\n'
        '<div class="notice" id="qilyChinaKnowledgeBridge"><strong>QilyLean | 启力精益国际站：</strong> '
        '<a class="resource-action qily-cross-site-primary" href="https://qilylean.com/links/cn-public/" '
        'target="_blank" rel="noopener noreferrer" aria-label="进入国际站" '
        'data-qily-approved-international-resource="true">进入国际站 ↗</a> '
        '<span>国际站公开知识入口，提供制造技术与产业资料介绍；该入口属于知识体系关联，'
        '不作为“全球科技企业100强”的企业收录项或排名依据。</span></div>\n'
        '<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:END -->')
    fragment, count = re.subn(r"<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:START -->[\s\S]*?<!-- QILY-CHINA-KNOWLEDGE-BRIDGE:END -->", lambda _: bridge, fragment)
    if count != 1: raise ValueError("Reciprocal bridge source missing")
    if source.FORBIDDEN.search(fragment) or re.search(r"<\s*(?:script|form|iframe)\b|industryResourceService|links/(?:network|onboarding)|/cooperation/", fragment):
        raise ValueError("Unexpected non-public directory content")
    fragment = '<main id="main" data-qily-public-tech-directory="v2">\n' + fragment.strip() + '\n</main>'
    for names in re.findall(r'class="([^"]+)"', fragment): PUBLIC_CLASSES.update(names.split())
    PUBLIC_CLASSES.update({"card", "card-head", "mark", "external", "cn", "meta", "tag", "filter", "active", "qily-visual-card"})
    PUBLIC_IDS.update(re.findall(r'id="([^"]+)"', fragment))
    # The destination wrapper owns #main; the source <main> has no ID. Do not
    # activate unrelated legacy rules that never match the international page.
    PUBLIC_IDS.discard("main")
    PUBLIC_TAGS.update(re.findall(r"<([a-zA-Z][\w-]*)", fragment))
    PUBLIC_TAGS.update({"html", "body", "a", "h2", "button"})

    runtime = re.findall(r"<script>\s*((?:\(function\(\)\{)[\s\S]*?var rows=\x60[\s\S]*?)</script>", original)
    if len(runtime) != 1: raise ValueError("Expected one directory search runtime")
    rendered_js = "/* QILY-CN-PUBLIC-TECH-DIRECTORY-V2 | international SSOT */\n" + runtime[0].strip()
    # Local scoped declarations are protected from destination CSS. Retain the
    # original runtime visibility state with the corresponding inline priority.
    empty_display = "empty.style.display=list.length?'none':'block';"
    protected_display = "empty.style.setProperty('display',list.length?'none':'block','important');"
    if rendered_js.count(empty_display) == 1:
        rendered_js = rendered_js.replace(empty_display, protected_display)
    elif rendered_js.count(protected_display) != 1:
        raise ValueError("Empty-state visibility owner changed")
    head = HeadStyles(); head.feed(original)
    rendered_css = "/* QILY-CN-PUBLIC-TECH-DIRECTORY-V2 | scoped international source cascade */\n"
    rendered_css += SCOPE + " *" + EXCLUDE_SERVICES + "{all:revert!important;box-sizing:border-box!important}\n"
    for priority in [False, True]:
        # Original !important rules must outrank normal source rules regardless
        # of selector specificity, even after both are isolated from CN styles.
        css.CONTENT_SCOPE = SCOPE.replace("#main", "#main" * 8) if priority else SCOPE
        for base, block in head.blocks:
            rendered_css += public_styles(block, base, priority) + "\n"
    css.CONTENT_SCOPE = SCOPE
    # Freeze the source's settled semantic label and mobile R8 composition.
    # Shell runtimes reorder global authorities; the cloned content has no
    # shell runtime, so these source contracts are materialized explicitly.
    final_scope = SCOPE.replace("#main", "#main" * 12)
    rendered_css += final_scope + " .eyebrow{line-height:1.45!important}\n"
    rendered_css += final_scope + ">.section{padding-top:var(--qily-r8-section-y)!important;padding-bottom:var(--qily-r8-section-y)!important}\n"
    rendered_css += final_scope + " h1" + EXCLUDE_SERVICES + "{font-weight:950!important}\n"
    rendered_css += ",".join(final_scope + " " + token + EXCLUDE_SERVICES for token in [".cn",".tag",".meta",".result"]) + "{font-size:20px!important;line-height:1.62!important}\n"
    version = hashlib.sha256((fragment + rendered_js + rendered_css).encode()).hexdigest()[:12]
    page = PAGE.read_text(encoding="utf-8")
    page, count = re.subn(r"<main\b[\s\S]*?</main>", lambda _: fragment, page)
    if count != 1: raise ValueError("China content main missing or duplicated")
    page = re.sub(r'<style id="qilyCnTechResearchDirectoryV1">[\s\S]*?</style>\s*', "", page)
    page = re.sub(r'<link id="qilyCnTechDirectorySourceStyles"[^>]*>\s*', "", page)
    page = page.replace("</head>", '<link id="qilyCnTechDirectorySourceStyles" rel="stylesheet" href="/assets/cn-public-tech-directory-v1.css?v=' + version + '">\n</head>', 1)
    page, count = re.subn(r"(/assets/cn-public-tech-directory-v1\.js\?v=)[^\s\"']+", lambda match: match.group(1) + version, page)
    if count != 1: raise ValueError("China search runtime reference missing")
    page = re.sub(r'(<meta name="description" content=")[^"]*(">)', r'\g<1>全球100家科技企业官网目录、五类产业资料检索与公开知识入口。\2', page)
    write(RUNTIME, rendered_js); write(STYLE, rendered_css); write(PAGE, page)
    # Both public directories use the exact same scoped layer. Service modules
    # are excluded by every selector and never copied into the China document.
    write(PUBLIC_STYLE, rendered_css)
    international = re.sub(r'<main\b[^>]*>', '<main id="qilyResourcePublicDirectory" data-qily-public-tech-directory="v2">', original, count=1)
    international = re.sub(r'<link id="qilyPublicTechDirectoryStyles"[^>]*>\s*', "", international)
    international = international.replace("</head>", '<link id="qilyPublicTechDirectoryStyles" rel="stylesheet" href="/site-public-tech-directory-v1.css?v=' + version + '">\n</head>', 1)
    international = international.replace(empty_display, protected_display)
    write(SOURCE, international)
    # Keep the existing public header/Dock first-paint owner's exact ordering.
    subprocess.run(["node", "-e",
        "const fs=require('fs'),m=require('./scripts/materialize-public-shell-first-paint-v1.js');"
        "const p='links/index.html';fs.writeFileSync(p,m.materialize(fs.readFileSync(p,'utf8'),p));"],
        cwd=ROOT, check=True)
    print(f"CN directory cloned: 100 enterprises / 5 categories; markup + styles + search; public bridge only; rev={version}")

if __name__ == "__main__": main()
