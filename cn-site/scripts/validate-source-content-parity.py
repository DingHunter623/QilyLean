#!/usr/bin/env python3
"""Strict local/source and production-byte verification of the CN public clone."""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html
from html.parser import HTMLParser
import importlib
import json
from pathlib import Path
import re
import sys
import urllib.request
import urllib.error
import http.client
from urllib.parse import quote, unquote, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / 'cn-site'
sys.dont_write_bytecode = True
sys.path.insert(0, str(CN / 'scripts'))
parity = importlib.import_module('materialize-source-content-parity')
MANIFEST = CN / 'archive/source-content-parity.json'
NAV = [
    ('home', '/', '首页'),
    ('capabilities', '/archive/profile/capabilities/', '能力体系'),
    ('tools', '/archive/profile/tools/', '改善工具'),
    ('lean', '/lean/', '精益生产'),
    ('projects', '/notes/', '代表项目'),
    ('trust', '/trust/', '信任中心'),
    ('knowledge', '/knowledge/', '知识资产'),
    ('resources', '/resources/', '资源协同'),
    ('contact', '/about/', '关于我们'),
]


def require(value, message):
    if not value:
        raise AssertionError(message)


def sha(value):
    return hashlib.sha256(value).hexdigest()


class Nodes(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=True)
        self.nodes = []
        self.feed(value)

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

    handle_startendtag = handle_starttag


def local_path(url):
    path = unquote(urlsplit(url).path).lstrip('/')
    require('..' not in Path(path).parts, 'Unsafe destination path: ' + url)
    return CN / path / 'index.html' if not path or urlsplit(url).path.endswith('/') else CN / path


def inline_hash(value):
    styles = re.findall(r'<style\b[^>]*data-cn-source-css=[\x22\x27][^\x22\x27]*[\x22\x27][^>]*>([\s\S]*?)</style>', value, re.I)
    return sha('\n'.join(styles).encode())


def verify_navigation(value, url):
    match = re.search(r'<header\b[\s\S]*?</header>', value, re.I)
    require(match, 'CN header missing: ' + url)
    header = parity.Tree(match.group(0)).root
    links = []

    def visit(node):
        if not isinstance(node, parity.Node):
            return
        if node.tag == 'a' and 'data-qily-nav-key' in node.attrs:
            links.append((node.attrs['data-qily-nav-key'], html.unescape(node.attrs.get('href', '')), node.text().strip()))
        for child in node.children:
            visit(child)

    visit(header)
    require(links == NAV, 'Expected nine public navigation entries plus About page: ' + url + ' ' + str(links))


def operating_axis_steps(value):
    """Read visible labels from the canonical six-step manufacturing operating axis."""
    root = parity.Tree(value).root

    def find_axis(node):
        if not isinstance(node, parity.Node):
            return None
        if node.tag == 'section' and node.attrs.get('data-qily-operating-axis') == 'static-v1':
            return node
        for child in node.children:
            found = find_axis(child)
            if found is not None:
                return found
        return None

    def first_descendant(node, tag):
        if not isinstance(node, parity.Node):
            return None
        for child in node.children:
            if not isinstance(child, parity.Node):
                continue
            if child.tag == tag:
                return child
            found = first_descendant(child, tag)
            if found is not None:
                return found
        return None

    def normalized(node):
        return re.sub(r'\s+', ' ', node.text()).strip() if node else ''

    axis = find_axis(root)
    if axis is None:
        return None
    steps = []

    def collect(node):
        if not isinstance(node, parity.Node):
            return
        if node.tag in {'a', 'div'} and 'qily-system-axis__step' in node.attrs.get('class', '').split():
            heading = first_descendant(node, 'strong')
            detail = first_descendant(node, 'span')
            if heading and detail:
                steps.append((normalized(heading), normalized(detail)))
            return
        for child in node.children:
            collect(child)

    collect(axis)
    return steps



def verify_noncommercial_module_order(source_value, target_value, source_name, url, mode='source-main'):
    """Original noncommercial sections must retain their exact source order.

    Commercial sections can be removed, but source modules cannot be reordered,
    dropped or replaced with unrelated China-only content.
    """
    # Audited viewers have a purpose-built local DOM and independent acceptance
    # checks. Every directly cloned source main must retain its source modules,
    # including dated briefs and secondary pages, not just the primary routes.
    if mode != 'source-main':
        return
    fragment = parity.source_fragment(source_value, source_name)
    if source_name == 'index.html':
        fragment = parity.public_home_copy(fragment)
    expected = parity.render(parity.Tree(fragment).root, source_name)
    expected = parity.preserve_generated_page_heading(expected, target_value)

    def signatures(value):
        rows = []
        for tag, attrs in Nodes(value).nodes:
            if tag == 'section':
                rows.append((attrs.get('id', ''), ' '.join(attrs.get('class', '').split())))
        return rows

    source_modules = signatures(expected)
    target_modules = signatures(parity.main_markup(target_value))
    require(source_modules == target_modules,
            'CN noncommercial module order differs from international source: ' + url
            + ' source=' + repr(source_modules[:15]) + ' target=' + repr(target_modules[:15]))
    # Class/ID signatures alone cannot detect reordered anonymous sections or
    # dropped paragraphs. Compare the complete retained public text in order.
    public_text = lambda value: re.sub(r'\s+', '', parity.Tree(value).root.text())
    require(public_text(expected) == public_text(parity.main_markup(target_value)),
            'CN noncommercial content differs from international source: ' + url)
    if source_name == 'index.html':
        main = parity.main_markup(target_value)
        require(main.count('目视化设计与交付') >= 1, 'China home lost the third public service capsule')
        require('href="/notes/"' in main and '查看代表案例' in main,
                'China home lost the localized public case action')
        require('免费60分钟沟通诊断' not in main and '/cooperation/#diagnosis' not in main,
                'China personal site must not restore the international commercial booking CTA')


def verify_operating_axis(source_value, target_value, url):
    source_steps = operating_axis_steps(source_value)
    if source_steps is None:
        return
    target_steps = operating_axis_steps(target_value)
    require(source_steps, 'Source operating axis has no steps: ' + url)
    require(any(label.startswith('05｜数智固化') and all(token in detail for token in ('ERP', 'MES', 'APS', '看板'))
                for label, detail in source_steps),
            'Source operating axis missing noncommercial step 05: ' + url)
    require(target_steps == source_steps,
            'Noncommercial operating-axis content was dropped or changed: ' + url
            + ' source=' + repr(source_steps) + ' target=' + repr(target_steps))


def verify_semantics(value, row):
    url = row['url']
    main = parity.main_markup(value)
    source_style = re.search(r'<(?:link|style)\b[^>]*\bdata-cn-source-css=', value, re.I)
    axis_style = re.search(r'<link\b[^>]*\bid="qilyContentAxisV1"', value, re.I)
    require(not source_style or axis_style and axis_style.start() < source_style.start(),
            'Destination axis must precede the canonical source cascade: ' + url)
    require(sha(main.encode()) == row['main_sha256'], 'Content DOM SHA mismatch: ' + url)
    require(inline_hash(value) == row['inline_css_sha256'], 'Inline source CSS SHA mismatch: ' + url)
    require(len(re.findall(r'<img\b', main, re.I)) == row['images'], 'Image count differs: ' + url)
    require(len(re.findall(r'<video\b', main, re.I)) == row['videos'], 'Video count differs: ' + url)
    require(parity.protected_dom(value) == row['protected'], 'Destination shell or translator references changed: ' + url)
    verify_navigation(value, url)
    footer = re.search(r'<footer\b[\s\S]*?</footer>', value, re.I)
    require(footer and 'class="footer-home"' not in footer.group(0), 'Retired China footer returned: ' + url)
    actions = [attrs['data-action'] for tag, attrs in Nodes(footer.group(0)).nodes if tag == 'button' and 'data-action' in attrs]
    require(actions == ['top', 'previous', 'search', 'current'], 'Four-action China footer contract changed: ' + url)
    require('/mirror-media/' not in main, 'Proxy-dependent content media returned: ' + url)
    nodes = Nodes(value).nodes
    canonical = [attrs.get('href') for tag, attrs in nodes if tag == 'link' and attrs.get('rel') == 'canonical']
    require(canonical == ['https://qilylean.cn' + url], 'CN canonical mismatch: ' + url)
    require('湘ICP备2026041143号-1' in value and '湘公网安备43020002000443号' in value, 'Protected filings missing: ' + url)

    if url == '/':
        for section in ('qily-core-services', 'qily-digital-enablers'):
            require('id="' + section + '"' in main, 'Public engineering capability section was over-filtered: ' + section)
        require('三类项目' in main and '数智化增强' in main,
                'China homepage must retain engineering and digital capability summaries')
        require('免费60分钟沟通诊断' not in main and '咨询转化' not in main,
                'China public homepage must not expose commercial conversion copy')

    resources = row['protected']['translator_resources']
    require(len(resources) == 2 and any('.js?' in item for item in resources) and any('.css?' in item for item in resources), 'Translator assets missing: ' + url)
    for tag, attrs in Nodes(main).nodes:
        classes = set(attrs.get('class', '').split())
        require(attrs.get('id') not in parity.BLOCK_IDS and not classes & parity.BLOCK_CLASSES, 'Excluded commercial block present: ' + url)
        require(not any(name.lower().startswith('on') for name in attrs), 'Source executable handler remains: ' + url)
        if tag == 'a':
            parsed = urlsplit(attrs.get('href', ''))
            require(not parsed.path.startswith(parity.COMMERCIAL_ROUTES) and parsed.fragment not in parity.BLOCK_IDS, 'Commercial CTA remains: ' + url)
            require(parsed.scheme not in {'javascript', 'tel', 'mailto', 'weixin', 'whatsapp'}, 'Conversion/contact action outside preserved About: ' + url)
            approved_bridge = attrs.get('href') == 'https://qilylean.com/links/cn-public/' and attrs.get('data-qily-approved-international-resource') == 'true'
            require(parsed.hostname not in {'qilylean.com', 'www.qilylean.com'} or approved_bridge, 'International internal route was not localized: ' + url)
        if tag in {'img', 'source', 'video', 'track', 'image', 'use'}:
            for key in ('src', 'poster', 'href', 'xlink:href'):
                if attrs.get(key):
                    require(not urlsplit(attrs[key]).netloc and not attrs[key].lower().startswith('javascript:'), 'External/active media remains: ' + url)
        if tag == 'form':
            require(False, 'Unadapted source form remains: ' + url)
        if tag == 'input':
            require(attrs.get('type', 'text') in {'search', 'hidden'}, 'Unadapted source API/contact input remains: ' + url)
    if re.fullmatch(r'qilylean/daily/\d{4}-\d{2}-\d{2}\.html', row['source']):
        date = Path(row['source']).stem
        require(url == '/briefs/archive/' + date + '/', 'Brief is assigned outside the knowledge brief archive: ' + url)
    if row['source'] == 'index.html':
        plain = html.unescape(re.sub(r'<[^>]+>', ' ', main))
        require(not parity.COMMERCIAL_COPY.search(plain), 'Commercial transaction copy remains in the cloned homepage')


def fixture_checks():
    css = parity.scope_css('.card h3{color:red}h3{color:blue!important}', 'index.html')
    require('color:red!important' not in css and 'color:red' in css and 'color:blue!important' in css,
            'Source normal/important cascade was flattened')
    selector = parity.source_selector('html body.qily-knowledge-brief-page main[data-qily-knowledge-brief]::before')
    require(selector.endswith('::before') and '[data-cn-source-body-class~="qily-knowledge-brief-page"]' in selector,
            'Source body environment must precede the pseudo element')
    tokens = parity.SourceStyles('<link rel="stylesheet" href="a.css"><style>p{color:red}</style><link rel="stylesheet" href="b.css">').items
    require([item[0] for item in tokens] == ['link', 'style', 'link'], 'Source head cascade order changed')
    isolated = parity.destination_css('main p::before{content:"x"}', 'assets/site.css')
    require(parity.SHELL_EXCLUSION + '::before' in isolated, 'Destination styles can reach cloned content')
    facts = '<span>1个月内完成供应商寻源与施工合同签订。</span><span>信息合同、状态词典与异常升级。</span>'
    rendered = parity.render(parity.Tree(facts).root, 'projects/index.html')
    require('施工合同签订' in rendered and '信息合同' in rendered, 'Public project facts were filtered by a generic commercial keyword')
    commercial = '<section id="contract"><p>付款与发票</p></section><a href="/cooperation/">商务合作</a>'
    require(not parity.render(parity.Tree(commercial).root, 'projects/index.html').strip(), 'Explicit commercial blocks/actions were not excluded')
    operating_axis = '<section data-qily-operating-axis="static-v1"><a class="qily-system-axis__step" href="/cooperation/"><strong>05｜数智固化</strong><span>ERP／MES／APS／看板</span></a></section>'
    localized_axis = parity.render(parity.Tree(operating_axis).root, 'knowledge/index.html')
    require('href="/archive/profile/capabilities/#digital"' in localized_axis
            and '05｜数智固化' in localized_axis and 'ERP／MES／APS／看板' in localized_axis,
            'Noncommercial operating-axis step must map to the local digital capability section')
    commercial_cta = parity.render(parity.Tree('<a href="/cooperation/">进入项目合作</a>').root, 'knowledge/index.html')
    require(not commercial_cta.strip(), 'Explicit project-cooperation CTA must remain excluded')
    require('url("#diagram")' in parity.declarations('fill:url(#diagram)', 'index.html'), 'Inline SVG paint reference was lost')
    require(parity.versioned_media_url('assets/example.svg', '0123456789abcdef0123456789abcdef') == '/assets/public-media/assets/example.svg?v=0123456789abcdef', 'Mirrored media URLs must include a content-hash cache key')
    require('<h1>工作现场</h1>' in parity.preserve_generated_page_heading('<section><h2>工作现场</h2></section>', '<main><section class="page-hero"><h1>工作现场</h1></section><section>内容</section></main>'), 'Source pages whose H1 is outside main must retain the generated page heading')
    styled = parity.render(parity.Tree('<p style="background:url(https://example.invalid/private.jpg)" onclick="run()">公开内容</p>').root, 'index.html')
    require('example.invalid' not in styled and 'onclick' not in styled and '公开内容' in styled, 'Unsafe source style/handler handling failed')


def verify_asset_local(row, kind):
    source = ROOT / row['source']
    require(source.is_file(), 'Missing ' + kind + ' source: ' + row['source'])
    if 'source_sha256' in row:
        require(parity.file_hash(source) == row['source_sha256'], 'Source CSS changed after materialization: ' + row['source'])
    path = local_path(row['url'])
    if kind == 'media':
        require(source.stat().st_size == row['bytes'] and parity.file_hash(source) == row['sha256'], 'Original source media changed: ' + row['source'])
    require(path.is_file(), 'Missing generated/protected asset: ' + row['url'])
    require(path.stat().st_size == row['bytes'] and parity.file_hash(path) == row['sha256'], 'Asset byte SHA mismatch: ' + row['url'])


def run_parallel(items, function, workers):
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(function, item): item for item in items}
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as error:
                item = futures[future]
                label = item.get('url', item.get('source', '')) if isinstance(item, dict) else str(item)
                failures.append(label + ': ' + str(error))
    require(not failures, '\n'.join(failures[:30]) + (f'\n... {len(failures)} failures total' if len(failures) > 30 else ''))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--production', action='store_true')
    parser.add_argument('--origin', default='https://qilylean.cn')
    parser.add_argument('--workers', type=int, default=6)
    args = parser.parse_args()
    require(1 <= args.workers <= 12, 'workers must be between 1 and 12')
    fixture_checks()
    require(MANIFEST.is_file(), 'Missing source clone manifest; materialization has not completed')
    raw_manifest = MANIFEST.read_bytes()
    manifest = json.loads(raw_manifest)
    require(manifest.get('version') == parity.VERSION, 'Unexpected source parity version')
    require(manifest.get('source_runtimes') == parity.source_runtime_records((ROOT / 'index.html').read_text(), 'index.html'),
            'Canonical homepage runtime changed after materialization')
    pages, styles, media = (manifest.get(key, []) for key in ('pages', 'styles', 'media_files'))
    destination = manifest.get('destination_assets', [])
    link_adaptations = manifest.get('link_adaptations', [])
    require(pages and styles and media and destination, 'Empty source content/CSS/media/protected-assets inventory')
    require(any(row.get('source') == 'knowledge/index.html'
                    and row.get('action') == 'localized-noncommercial-topic'
                    and row.get('to') == '/archive/profile/capabilities/#digital'
                    and '05｜数智固化' in row.get('label', '')
                for row in link_adaptations),
            'Missing audit record for the localized noncommercial operating-axis step')
    urls = [row['url'] for row in pages]
    require(len(set(urls)) == len(urls), 'Duplicate target routes in clone manifest')
    require({'/', '/notes/', '/trust/', '/knowledge/', '/briefs/', '/resources/'} <= set(urls), 'A primary clone/discovery route is missing')
    expected = {item.path.as_posix() for item in parity.mirror.SOURCES if item.out.is_file()}
    expected.update(name for name in parity.PRIMARY if (ROOT / name).is_file())
    expected.add('moments/index.html')
    actual = {row['source'] for row in pages}
    require(expected <= actual, 'Public source pages missing from clone manifest: ' + ', '.join(sorted(expected - actual)))
    photos = {'moments/work/index.html': 8, 'moments/team/index.html': 5,
              'moments/business/index.html': 9, 'moments/life/index.html': 5}
    for source, count in photos.items():
        row = next((row for row in pages if row['source'] == source), None)
        require(row and row['images'] == count, 'Original photo gallery is incomplete: ' + source)
    require(next(row for row in pages if row['source'] == 'projects/mold-warehouse/index.html')['videos'] == 1,
            'The original mold-warehouse project video is missing')
    def verify_local_page(row):
        source = ROOT / row['source']
        require(source.is_file() and parity.file_hash(source) == row['source_html_sha256'], 'Source HTML changed after materialization: ' + row['source'])
        require(row.get('source_runtime_sha256') == {
                    item['source']: item['sha256'] for item in parity.source_runtime_records(source.read_text(), row['source'])},
                'Source runtime provenance differs: ' + row['source'])
        local_value = local_path(row['url']).read_text()
        verify_semantics(local_value, row)
        verify_operating_axis(source.read_text(), local_value, row['url'])
        verify_noncommercial_module_order(source.read_text(), local_value, row['source'], row['url'], row['mode'])
    run_parallel(pages, verify_local_page, args.workers)
    for key, rows in [('style', styles), ('media', media), ('destination', destination)]:
        run_parallel(rows, lambda row: verify_asset_local(row, key), args.workers)
    require({quote(unquote(urlsplit(row['url']).path).removeprefix('/assets/public-media/'), safe='/') for row in media} == set(manifest['media']), 'Media inventory differs from its byte-hash ledger')
    # Verify the reverse direction too: a retained viewer must not reference
    # unaccounted media merely because it bypasses the source HTML renderer.
    referenced_media = set()
    for row in pages:
        text = parity.main_markup(local_path(row['url']).read_text())
        for encoded in re.findall(r'/assets/public-media/([^\s\x22\x27<>)]*)', text):
            referenced_media.add(quote(unquote(urlsplit('/' + html.unescape(encoded)).path.lstrip('/')), safe='/'))
    for row in styles:
        text = local_path(row['url']).read_text()
        require('/mirror-media/' not in text, 'Proxy-dependent source stylesheet returned: ' + row['url'])
        for encoded in re.findall(r'/assets/public-media/([^\s\x22\x27<>)]*)', text):
            referenced_media.add(quote(unquote(urlsplit('/' + html.unescape(encoded)).path.lstrip('/')), safe='/'))
    require(referenced_media <= set(manifest['media']), 'Actual content media missing from ledger: ' + ', '.join(sorted(referenced_media - set(manifest['media']))))
    about = (CN / 'about/index.html').read_text()
    require(sha(parity.main_markup(about).encode()) == manifest['protected']['about_main_sha256'], 'Preserved About/contact content changed')
    require(parity.protected_dom(about) == manifest['protected']['about_shell'], 'Preserved About/contact shell changed')
    verify_navigation(about, '/about/')
    require('id="contact"' in about or "id='contact'" in about, 'Preserved Contact navigation target missing')
    robots = (CN / 'robots.txt').read_text()
    require(re.search(r'^Allow:\s*/\s*$', robots, re.M) and 'Sitemap: https://qilylean.cn/sitemap.xml' in robots, 'CN crawl/sitemap contract changed')
    require('/trust/' in (CN / 'sitemap.xml').read_text(), 'Trust page missing from CN sitemap')

    if args.production:
        origin = args.origin.rstrip('/')
        parsed_origin = urlsplit(origin)
        require(parsed_origin.scheme == 'https' and parsed_origin.netloc and not parsed_origin.path, 'Production origin must be an HTTPS origin')
        nonce = sha(raw_manifest)[:16]

        def open_url(path):
            parsed = urlsplit(origin + path)
            encoded = urlunsplit((parsed.scheme, parsed.netloc, quote(parsed.path, safe='/%'), parsed.query, ''))
            request = urllib.request.Request(encoded, headers={'User-Agent': 'QilyLean-Source-Parity/1.0', 'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity'})
            response = urllib.request.build_opener(urllib.request.ProxyHandler({})).open(request, timeout=90)
            require(urlsplit(response.geturl()).netloc == parsed_origin.netloc, 'Unexpected cross-origin redirect: ' + path)
            return response

        def read_page(path):
            separator = '&' if '?' in path else '?'
            with open_url(path + separator + 'source_verify=' + nonce) as response:
                return response.read(16 * 1024 * 1024)

        require(read_page('/archive/source-content-parity.json') == raw_manifest, 'Production manifest bytes differ from this release')
        def verify_remote_page(row):
            remote_value = read_page(row['url']).decode()
            verify_semantics(remote_value, row)
            verify_operating_axis((ROOT / row['source']).read_text(), remote_value, row['url'])
            verify_noncommercial_module_order((ROOT / row['source']).read_text(), remote_value, row['source'], row['url'], row['mode'])

        run_parallel(pages, verify_remote_page, args.workers)
        # Also check the canonical homepage URL without a cache-busting parameter.
        with open_url('/') as response:
            home_value = response.read(16 * 1024 * 1024).decode()
        home_row = next(row for row in pages if row['url'] == '/')
        verify_semantics(home_value, home_row)
        verify_operating_axis((ROOT / 'index.html').read_text(), home_value, '/')

        def verify_remote_asset(row):
            for attempt in range(2):
                digest, size = hashlib.sha256(), 0
                try:
                    with open_url(row['url']) as response:
                        while True:
                            block = response.read(1024 * 1024)
                            if not block:
                                break
                            size += len(block)
                            require(size <= row['bytes'], 'Production asset larger than approved source: ' + row['url'])
                            digest.update(block)
                except urllib.error.HTTPError as error:
                    if attempt == 0 and error.code in {408, 429, 500, 502, 503, 504}:
                        continue
                    raise
                except (urllib.error.URLError, TimeoutError, ConnectionError, http.client.IncompleteRead):
                    if attempt == 0:
                        continue
                    raise
                if size < row['bytes'] and attempt == 0:
                    continue
                require(size == row['bytes'] and digest.hexdigest() == row['sha256'],
                        'Production asset bytes differ: ' + row['url'] + ' received=' + str(size) + ' expected=' + str(row['bytes']))
                return

        run_parallel(styles + media + destination, verify_remote_asset, args.workers)
        remote_about = read_page('/about/').decode()
        require(sha(parity.main_markup(remote_about).encode()) == manifest['protected']['about_main_sha256'] and parity.protected_dom(remote_about) == manifest['protected']['about_shell'], 'Production Contact DOM/shell differs')
        verify_navigation(remote_about, '/about/')
        require(read_page('/robots.txt') == (CN / 'robots.txt').read_bytes(), 'Production robots bytes differ')
        require(read_page('/sitemap.xml') == (CN / 'sitemap.xml').read_bytes(), 'Production sitemap bytes differ')
    print(json.dumps({'ok': True, 'mode': 'production' if args.production else 'local', 'pages': len(pages), 'source_module_content_checks': sum(row['mode'] == 'source-main' for row in pages), 'styles': len(styles), 'media_files': len(media), 'protected_assets': len(destination), 'navigation': len(NAV)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
