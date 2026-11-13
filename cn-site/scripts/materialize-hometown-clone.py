#!/usr/bin/env python3
"""Materialize the approved article and its complete source presentation locally.

The international cascade, including responsive rules and its final R8 ordering,
is isolated to the article/card. China navigation and filings keep their owners.
"""
from pathlib import Path
import ast
import hashlib
import html
import importlib
import re
import shutil
import sys
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / 'cn-site'
sys.dont_write_bytecode = True
sys.path.insert(0, str(CN / 'scripts'))
parity = importlib.import_module('materialize-source-content-parity')
css = parity.visual
PAPER = 'qilyHometownManufacturingPaper'
CARD = 'qilyHometownManufacturingKnowledge'
GENERATED = 'qilyCnHometownSourceCascade'
CLASSES = set()
IDS = set()
TAGS = set()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.is_file() or path.read_text() != value:
        path.write_text(value)


def media(value, source):
    if value.startswith(('#', 'data:')):
        return value
    parsed = urlsplit(urljoin('/' + source, value))
    if parsed.hostname and parsed.hostname not in {'qilylean.com', 'www.qilylean.com'}:
        raise ValueError('External presentation dependency: ' + value)
    relative = unquote(parsed.path).lstrip('/')
    original = ROOT / relative
    if '..' in Path(relative).parts or not original.is_file():
        raise ValueError('Missing source presentation asset: ' + relative)
    target = CN / 'assets/hometown-source-media' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.is_file() or target.read_bytes() != original.read_bytes():
        shutil.copyfile(original, target)
    return '/' + target.relative_to(CN).as_posix() + '?v=' + digest(original.read_bytes())[:16]


def declarations(body, source, important):
    output = []
    for item in css.split_css(body, ';'):
        key, sep, value = item.partition(':')
        if not sep:
            continue
        priority = bool(re.search(r'!important\s*$', value, re.I))
        if priority != important:
            continue
        value = re.sub(r'!important\s*$', '', value, flags=re.I).strip()
        value = re.sub(r'url\(\s*([^)]*)\)', lambda m: 'url("' + media(m.group(1).strip().strip('"\''), source) + '")', value)
        output.append(key.strip() + ':' + value + '!important')
    return ';'.join(output)


def bounded(selector, identity, important):
    """Keep original specificity/cascade while excluding destination CSS.

    A zero-specificity boundary is attached to the subject, so html/body/main
    ancestor predicates keep their original meaning. Original important rules
    receive a separate higher band; normal source rules retain their ordering.
    """
    boundary = ':where(#' + identity + ',#' + identity + ' *)'
    boost = ':not(' + '#qhi' * (32 if important else 16) + ')'
    parts = css.selector_compounds(selector)
    if not parts:
        return ''
    start, end, compound = parts[-1]
    pseudo = re.search(r'::[\w-]+|:(?:before|after|first-line|first-letter)(?![\w-])', compound)
    offset = start + pseudo.start() if pseudo else end
    return selector[:offset] + boundary + boost + selector[offset:]


def relevant(selector):
    """Remove impossible vocabulary, retaining states, pseudo-elements and media.

    :not() exclusions do not require their excluded nodes to exist. Alternatives
    are considered independently, including :has(), :is() and :where().
    """
    function = re.search(r':(is|where|has|not)\(', selector)
    if function:
        depth, end = 1, function.end()
        while end < len(selector) and depth:
            if selector[end] == '(':
                depth += 1
            elif selector[end] == ')':
                depth -= 1
            end += 1
        if depth:
            return False
        alternatives = [''] if function.group(1) == 'not' else css.split_css(selector[function.end():end-1], ',')
        return any(relevant(selector[:function.start()] + part + selector[end:]) for part in alternatives)
    selector = re.sub(r'\[[^\]]*\]', '', selector)
    if set(re.findall(r'\.([a-zA-Z_][\w-]*)', selector)) - CLASSES:
        return False
    if set(re.findall(r'#([\w-]+)', selector)) - IDS:
        return False
    for _, _, compound in css.selector_compounds(selector):
        tag = re.match(r'([a-zA-Z][\w-]*)', compound)
        if tag and tag.group(1).lower() not in TAGS:
            return False
    return True


def isolate(content, source, identity, important, stack=()):
    output = []
    for prelude, body in css.css_rules(content):
        if prelude.startswith('@'):
            name = re.match(r'@([\w-]+)', prelude)
            kind = name.group(1).lower() if name else ''
            if body is not None and kind in css.CSS_GROUPS:
                nested = isolate(body, source, identity, important, stack)
                if nested:
                    output.append(prelude + '{' + nested + '}')
            elif body is None and kind == 'import':
                match = re.search(r'url\(\s*["\']?([^"\')\s]+)|["\']([^"\']+)', prelude)
                if not match:
                    raise ValueError('Unsupported source import: ' + prelude)
                relative = urlsplit(urljoin('/' + source, match.group(1) or match.group(2))).path.lstrip('/')
                if relative not in stack:
                    output.append(isolate((ROOT / relative).read_text(), relative, identity, important, stack + (relative,)))
            elif body is not None and kind == 'font-face' and not important:
                # Font faces contain descriptors rather than CSS declarations.
                value = re.sub(r'url\(\s*([^)]*)\)', lambda m: 'url("' + media(m.group(1).strip().strip('"\''), source) + '")', body)
                output.append('@font-face{' + value + '}')
            continue
        if body is None:
            continue
        groups = {}
        for selector in css.split_css(prelude, ','):
            if not relevant(selector):
                continue
            parts = css.selector_compounds(selector)
            if not parts:
                continue
            root_only = bool(re.match(r'(?:html|body|:root)(?:[^\w-]|$)', parts[-1][2]))
            # A nested directory module also inherits the source main defaults.
            root_only = root_only or (identity == CARD and bool(re.match(r'main(?:[^\w-]|$)', parts[-1][2])))
            values = parity.inherited_root_declarations(body) if root_only else body
            if root_only:
                # A body's painted background is not inherited by its main or
                # a nested card. Only its variables and type defaults cross.
                values = ';'.join(item for item in css.split_css(values, ';') if not item.partition(':')[0].strip().startswith('background'))
            value = declarations(values, source, important)
            if not value:
                continue
            if root_only:
                selector += ' :where(#' + identity + ')'
            scoped = bounded(selector, identity, important)
            if scoped:
                groups.setdefault(value, []).append(scoped)
        for value, selectors in groups.items():
            output.append(','.join(selectors) + '{' + value + '}')
    return '\n'.join(output)


def runtime_style(source, marker):
    runtime = (ROOT / source).read_text()
    start = runtime.index(marker)
    found = re.search(r'style\.textContent\s*=\s*(\[[\s\S]*?\])\.join\(["\']["\']\)', runtime[start:])
    if not found:
        raise ValueError('Source runtime style changed: ' + marker)
    return ''.join(ast.literal_eval(found.group(1)))


def source_cascade(source):
    raw = (ROOT / source).read_text()
    head = re.search(r'<head\b[^>]*>([\s\S]*?)</head>', raw, re.I).group(1)
    blocks = []
    final = []
    for kind, attrs, value in parity.SourceStyles(head).items:
        if kind == 'link':
            relative = urlsplit(urljoin('/' + source, html.unescape(attrs['href']))).path.lstrip('/')
            row = (relative, (ROOT / relative).read_text())
            if attrs.get('id') in {'qilyViV4Formal', 'qilyVisualAuthorityR8'}:
                final.append(row)
            else:
                blocks.append(row)
        elif not any(token in attrs.get('id', '') for token in ('FirstPaint', 'Critical', 'Dock', 'GlobalHeader')):
            blocks.append((source, value))
    # These source runtimes append public main/table rules after the document.
    blocks.append(('site-visual-geometry-v1.js', runtime_style('site-visual-geometry-v1.js', "style.id = 'qilyVisualDensityClosureV4'")))
    blocks.append(('site-contact-route-v1.js', runtime_style('site-contact-route-v1.js', "style.id='qilySiteShellRecoveryV134Style'")))
    # Source shell settles formal VI first, then the authoritative R8 sheet.
    final.sort(key=lambda row: row[0] == 'site-visual-authority-r8.css')
    return raw, blocks + final


def materialize(source, target, identity, asset):
    raw, blocks = source_cascade(source)
    CLASSES.clear(); IDS.clear(); TAGS.clear()
    content = re.search(r'<main\b[\s\S]*?</main>', raw, re.I).group(0)
    if identity == CARD:
        content = re.search(r'<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START -->([\s\S]*?)<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:END -->', raw).group(1)
    for names in re.findall(r'class="([^"]+)"', content):
        CLASSES.update(names.split())
    source_body = re.search(r'<body\b[^>]*>', raw).group(0)
    for names in re.findall(r'class="([^"]+)"', source_body):
        CLASSES.update(names.split())
    CLASSES.update({'qily-pro-v24', 'qily-flow-frame', 'qily-diagram-frame', 'qily-table-scroll', 'qily-route-action'})
    if identity == CARD:
        # The card inherits rules whose selectors mention its source section
        # and inner wrapper, even though those ancestors are outside the card.
        CLASSES.update({'section', 'inner'})
    IDS.update(re.findall(r'id="([^"]+)"', content))
    IDS.update({'main', 'qilyResourcePublicDirectory'})
    if 'qhi' in IDS:
        raise ValueError('The dedicated specificity sentinel became a source ID')
    TAGS.update(re.findall(r'<([a-zA-Z][\w-]*)', content))
    TAGS.update({'html', 'body', 'main'})
    old = target.read_text()
    boundary = ':where(#' + identity + ',#' + identity + ' *)'
    # SVG presentation attributes are authored data, not destination CSS.
    # Reverting their author origin would erase fill/stroke/font attributes.
    reset = boundary + ':not(:where(svg,svg *)):not(' + '#qhi' * 8 + '){all:revert!important}\n'
    generated = '/* Approved hometown source cascade; generated, module scoped. */\n' + reset
    for important in (False, True):
        for name, content in blocks:
            generated += isolate(content, name, identity, important) + '\n'
    generated += 'html:has(#' + identity + '){scrollbar-gutter:stable!important;overflow-x:clip}\n'
    write(asset, generated)
    old = re.sub(r'<style\b[^>]*id="qilyCnHometownViParity"[^>]*>[\s\S]*?</style>', '', old)
    old = re.sub(r'<link\b[^>]*id="' + GENERATED + r'"[^>]*>\s*', '', old)
    tag = '<link id="' + GENERATED + '" rel="stylesheet" href="/' + asset.relative_to(CN).as_posix() + '?v=' + digest(generated.encode())[:16] + '">\n'
    old = old.replace('</head>', tag + '</head>', 1)
    runtime = CN / 'assets/cn-hometown-content-runtime.js'
    runtime_url = '/assets/' + runtime.name + '?v=' + digest(runtime.read_bytes())[:16]
    old = re.sub(r'<script\b[^>]*data-cn-hometown-content-runtime[^>]*>[\s\S]*?</script>\s*', '', old)
    old = old.replace('</body>', '<script defer data-cn-hometown-content-runtime="v1" src="' + runtime_url + '"></script>\n</body>', 1)
    # Preserve the source selector environment without importing its shell JS.
    body = re.search(r'<body\b([^>]*)>', raw).group(1)
    source_class = re.search(r'class="([^"]+)"', body)
    if source_class:
        classes = source_class.group(1)
        tag = re.search(r'<body\b[^>]*>', old).group(0)
        attributes = parity.Tree(tag).root.children[0].attrs
        attributes['class'] = classes
        attributes['data-qily-vi-shell'] = 'v4-formal'
        replacement = '<body' + ''.join(' ' + key + ('' if value is None else '="' + html.escape(value, quote=True) + '"') for key, value in attributes.items()) + '>'
        old = old.replace(tag, replacement, 1)
    if identity == PAPER:
        main = re.search(r'<main\b[\s\S]*?</main>', raw, re.I).group(0).replace('href="/links/"', 'href="/resources/"')
        old = re.sub(r'<main\b[\s\S]*?</main>', lambda _: main, old, count=1, flags=re.I)
    else:
        pattern = r'<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START -->[\s\S]*?<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:END -->'
        approved = re.search(pattern, raw).group(0)
        old, count = re.subn(pattern, lambda _: approved, old, count=1)
        if count != 1:
            raise ValueError('Approved hometown card is missing from the CN directory')
    write(target, old)
    print('Cloned source cascade:', identity, len(generated), 'bytes')


def main():
    runtime = (ROOT / 'site-visual-runtime-r8.js').read_text()
    functions = []
    for name in ('tableCellCount', 'tableTextLength', 'isTableWrapped', 'wrapTables', 'annotateCardGrids', 'annotateFrames'):
        match = re.search(r'\n  (function ' + name + r'\([^)]*\)\{[\s\S]*?)(?=\n  function |\n  if\()', runtime)
        if not match:
            raise ValueError('Source content runtime changed: ' + name)
        function = match.group(1)
        function = function.replace("d.querySelectorAll('main '+selector.replace(/,/g,',main '))", 'root.querySelectorAll(selector)')
        function = function.replace("d.querySelectorAll('main ", "root.querySelectorAll('").replace(',main ', ',')
        functions.append(function)
    adapter = '(function(d,w){"use strict";var root=d.getElementById("' + PAPER + '")||d.getElementById("' + CARD + '");if(!root)return;\n'
    adapter += '\n'.join(functions) + '\nwrapTables();annotateCardGrids();annotateFrames();\n'
    adapter += 'root.querySelectorAll("a[href]").forEach(function(a){if(a.getAttribute("href").charAt(0)!=="#"){a.classList.add("qily-route-action");a.setAttribute("data-qily-interaction","route");}});\n})(document,window);\n'
    write(CN / 'assets/cn-hometown-content-runtime.js', adapter)
    materialize('links/hometown-manufacturing/index.html', CN / 'links/hometown-manufacturing/index.html', PAPER, CN / 'assets/cn-hometown-paper-source.css')
    materialize('links/index.html', CN / 'resources/index.html', CARD, CN / 'assets/cn-hometown-card-source.css')


if __name__ == '__main__':
    main()
