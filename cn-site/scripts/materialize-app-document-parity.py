#!/usr/bin/env python3
"""Mirror the accepted APP document DOM and CSS; retain China's local shell.

The international legal pages place their hero before main.wrap.  Keep both
inside the CN content boundary, mapping that source main to an inner div
with the same selector specificity, rather than restyling the documents by hand.
"""
from __future__ import annotations

import hashlib
import html
import importlib
import json
from pathlib import Path
import re
import shutil
import sys
from urllib.parse import quote, unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / 'cn-site'
sys.path.insert(0, str(CN / 'scripts'))
parity = importlib.import_module('materialize-source-content-parity')
visual = parity.visual
BASE_INHERITED_ROOT_DECLARATIONS = parity.inherited_root_declarations
VERSION = '20261105-app-document-source-parity-v1'
PAGE_SOURCES = {
    'legal/times26001/privacy/index.html': 'legal/times26001/privacy/index.html',
    'legal/times26001/terms/index.html': 'legal/times26001/terms/index.html',
    'app-support/index.html': 'app-support/index.html',
    # Existing installed CN Home APKs open this stable support URL.
    'app-support/qilylean-cn-home/index.html': 'app-support/index.html',
    'legal/qilylean-cn-home/privacy/index.html': 'legal/qilylean-home/privacy/index.html',
    'legal/qilylean-cn-home/terms/index.html': 'legal/qilylean-home/terms/index.html',
}
PAGES = tuple(PAGE_SOURCES)
SUPPORT_ADJUSTMENTS = (
    ('当前国际站正式签名验收版', '当前双站官网正式签名验收版'),
    ('当前官网安装包 / 最新构建 v2.3.3 / versionCode 11 / targetSdk 36；腾讯应用宝首发候选版 v2.3.3 / versionCode 11 / targetSdk 36。',
     '中国站桌面现有可安装包 v1.0.0 / versionCode 1 / Android API 36（包名 cn.qilylean.home）；用户确认三星手机已安装并在使用。中国站与国际站 QilyLean Home 各自独立管理版本。'),
    ('/legal/qilylean-home/privacy/', '/legal/qilylean-cn-home/privacy/'),
    ('/legal/qilylean-home/terms/', '/legal/qilylean-cn-home/terms/'),
    ('<span class="pill">QilyLean Home</span>', '<span class="pill">QilyLean Home · 中国站桌面</span>'),
    ('设为桌面：按Home键后选择QilyLean Home并选择“始终”。', '设为桌面：按Home键后选择“精益制造经验分享”并选择“始终”。'),
    ('当前官网安装包、最新构建与应用市场候选状态以统一发布清单为准。', '当前中国站安装包与应用市场候选状态以各自真实发布记录为准。'),
)
STYLES = {}
STYLE_CACHE = {}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_sections(raw, name):
    hero = re.search(r'<section class="hero">[\s\S]*?</section>', raw)
    main = re.search(r'<main class="wrap">([\s\S]*?)</main>', raw)
    if not hero or not main:
        raise RuntimeError('APP document source structure changed: ' + name)
    hero, content = hero.group(0), main.group(1)
    if name.startswith('app-support/'):
        for old, new in SUPPORT_ADJUSTMENTS:
            if content.count(old) != 1:
                raise RuntimeError('APP support localization source drifted: ' + old[:70])
            content = content.replace(old, new, 1)
    if name.startswith('legal/qilylean-cn-home/'):
        # Existing CN legal pages have no historical effective date.  Do not
        # assign the independent international package's date to this product.
        content = content.replace('<strong>生效日期：</strong>2026年8月6日　', '')
        content = content.replace('V1.0', 'v1.0.0（versionCode 1 / API 36；包名 cn.qilylean.home）')
        hero = hero.replace('QilyLean Home', '精益制造经验分享')
        content = content.replace('QilyLean Home', '精益制造经验分享')
    return hero.replace('https://qilylean.com/', 'https://qilylean.cn/'), content.replace('https://qilylean.com/', 'https://qilylean.cn/')


def document_selector(selector):
    # The inner div is the original main.  div contributes the same
    # type specificity; :where() adds no specificity of its own.  Do not touch
    # .main/#main identifiers or attribute strings containing the word main.
    output = []
    index, brackets, quoted = 0, 0, ''
    while index < len(selector):
        char = selector[index]
        if quoted:
            output.append(char)
            if char == '\\' and index + 1 < len(selector):
                index += 1
                output.append(selector[index])
            elif char == quoted:
                quoted = ''
        elif char in {'"', "'"}:
            quoted = char
            output.append(char)
        elif char == '[':
            brackets += 1
            output.append(char)
        elif char == ']':
            brackets = max(0, brackets - 1)
            output.append(char)
        elif (not brackets and selector.startswith('main', index)
              and (index == 0 or selector[index - 1] in ' \t\r\n>+~,(|')
              and (index + 4 == len(selector) or not re.match(r'[\w-]', selector[index + 4]))):
            output.append('div:where(.qily-app-document-wrap)')
            index += 3
        else:
            output.append(char)
        index += 1
    return ''.join(output)


def document_rules(value):
    parts = []
    for prelude, body in visual.css_rules(value):
        if body is not None and prelude.startswith('@'):
            kind = re.match(r'@([\w-]+)', prelude)
            if kind and kind.group(1).lower() in visual.CSS_GROUPS:
                parts.append(prelude + '{' + document_rules(body) + '}')
            else:
                parts.append(prelude + '{' + body + '}')
        elif body is not None:
            parts.append(','.join(document_selector(s) for s in visual.split_css(prelude, ',')) + '{' + body + '}')
        else:
            parts.append(prelude + ';')
    return '\n'.join(parts)


def document_root_declarations(value):
    # Font rasterization is inherited from the source body.  The generic
    # content mirror's inheritance list predates these vendor properties.
    inherited = BASE_INHERITED_ROOT_DECLARATIONS(value)
    rasterization = [item for item in visual.split_css(value, ';')
                     if item.partition(':')[0].strip().lower() in {
                         '-webkit-font-smoothing', '-moz-osx-font-smoothing',
                         '-webkit-text-size-adjust', 'text-size-adjust'}]
    return ';'.join([inherited] + rasterization)


def document_css(value, source):
    original = parity.inherited_root_declarations
    parity.inherited_root_declarations = document_root_declarations
    try:
        return parity.scope_css(document_rules(value), source)
    finally:
        parity.inherited_root_declarations = original


def copy_css(value):
    parsed = urlsplit(value)
    if parsed.hostname and parsed.hostname not in {'qilylean.com', 'www.qilylean.com'}:
        return ''
    relative = unquote(parsed.path).lstrip('/')
    original = ROOT / relative
    if '..' in Path(relative).parts or relative not in parity.TRACKED or not original.is_file() or original.suffix != '.css':
        return ''
    if relative in STYLE_CACHE:
        return STYLE_CACHE[relative]
    STYLE_CACHE[relative] = ''
    target = CN / 'assets/app-document-source' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(document_css(original.read_text(), relative), encoding='utf-8')
    url = '/assets/app-document-source/' + quote(relative, safe='/') + '?v=' + digest(target)[:12]
    STYLE_CACHE[relative] = url
    STYLES[relative] = {'source': relative, 'url': url, 'source_sha256': digest(original), 'sha256': digest(target)}
    return url


def materialize():
    STYLES.clear()
    STYLE_CACHE.clear()
    parity.MEDIA.clear()
    records = []
    # @import must recurse through this document-aware compiler as well.
    original_copy = parity.copy_css
    parity.copy_css = copy_css
    parity.BODY_CLASSES.update({'qily-pro-v24', 'qily-times-release-page'})
    try:
        for name in PAGES:
            source_name = PAGE_SOURCES[name]
            source, target = ROOT / source_name, CN / name
            raw, old = source.read_text(), target.read_text()
            protected = parity.protected_dom(old)
            hero, content = source_sections(raw, name)
            body = re.search(r'<body\b[^>]*class="([^"]*)"', raw).group(1)
            main = ('<main id="main" data-cn-source-content="' + name + '" data-cn-source-from-body="true" '
                    'data-cn-source-scrollbar-gutter="' + ('stable' if '/site-closure-bundle-v24.css' in raw else 'auto') + '" '
                    'data-cn-source-body-class="' + html.escape(body, quote=True) + '" '
                    'data-cn-source-body-data-qily-vi-shell="v4-formal" data-cn-app-document="' + VERSION + '">'
                    + hero + '<div class="wrap qily-app-document-wrap' + (' times-support-mirror' if name.startswith('app-support/') else '')
                    + '">' + content + '</div></main>')
            updated = re.sub(r'<main\b[^>]*>[\s\S]*?</main>', lambda _: main, old, count=1)
            if name.startswith('app-support/'):
                updated = re.sub(r'<title>[\s\S]*?</title>', '<title>QilyLean APP技术支持中心｜精益制造经验分享</title>', updated, count=1)
            updated = re.sub(r'<style\b[^>]*id="qilyCn(?:TimesReleaseDocsViV115|DualAppSupportParityV116)"[^>]*>[\s\S]*?</style>', '', updated)
            updated = re.sub(r'<link\b[^>]*data-cn-app-document-css[^>]*>', '', updated)
            updated = re.sub(r'<style\b[^>]*data-cn-app-document-css[^>]*>[\s\S]*?</style>', '', updated)
            updated = parity.destination_shell_styles(updated)
            tags = []
            head = re.search(r'<head\b[^>]*>([\s\S]*?)</head>', raw).group(1)
            for kind, attrs, css in parity.SourceStyles(head).items:
                if kind == 'link':
                    local = copy_css(urljoin('/' + name, attrs.get('href', '')))
                    if local:
                        tags.append('<link rel="stylesheet" data-cn-app-document-css="v1" data-cn-source-css="v1" href="' + local + '">')
                elif not any(token in attrs.get('id', '') for token in ('Critical', 'FirstPaint', 'Dock')):
                    tags.append('<style data-cn-app-document-css="v1" data-cn-source-css="v1">' + document_css(css, name) + '</style>')
            settled = ['site-interaction-continuity-v1.css', 'site-visual-governance-v2.css',
                       'site-content-axis-v1.css', 'site-header-axis-v1.css', 'site-floating-dock-standard-v1.css']
            for css in settled:
                local = copy_css('/' + css)
                if local and not any('href="' + local + '"' in tag for tag in tags):
                    tags.append('<link rel="stylesheet" data-cn-app-document-css="v1" data-cn-source-css="v1" href="' + local + '">')
            tags.append('<link rel="stylesheet" data-cn-app-document-css="v1" data-cn-source-css="v1" href="' + copy_css('/site-visual-authority-r8.css') + '">')
            tags = parity.remove_duplicate_source_css_links(tags)
            updated = updated.replace('</head>', ''.join(tags) + '</head>', 1)
            if protected != parity.protected_dom(updated):
                raise RuntimeError('CN APP document shell changed: ' + name)
            target.write_text(updated, encoding='utf-8')
            records.append({'source': source_name, 'target': name, 'url': '/' + name.removesuffix('index.html'),
                            'source_sha256': digest(source), 'main_sha256': hashlib.sha256(main.encode()).hexdigest(),
                            'style_urls': re.findall(r'href="([^"]+)"', ''.join(tags)),
                            'inline_css_sha256': hashlib.sha256('\n'.join(re.findall(r'<style[^>]*>([\s\S]*?)</style>', ''.join(tags))).encode()).hexdigest(),
                            'protected': protected})
    finally:
        parity.copy_css = original_copy
    media = []
    for encoded in sorted(parity.MEDIA):
        original = ROOT / unquote(encoded)
        target = CN / 'assets/public-media' / unquote(encoded)
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.is_file() or digest(target) != digest(original):
            shutil.copyfile(original, target)
        media.append({'source': unquote(encoded), 'sha256': digest(original)})
    manifest = CN / 'archive/app-document-parity.json'
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps({'version': VERSION, 'pages': records, 'styles': list(STYLES.values()), 'media': media}, ensure_ascii=False, indent=2) + '\n')
    print('APP document source parity: ' + str(len(records)) + ' documents; ' + str(len(STYLES)) + ' source styles; CN shell preserved.')


if __name__ == '__main__':
    materialize()
