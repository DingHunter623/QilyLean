#!/usr/bin/env python3
"""Strict local/source and production-byte verification of the CN public clone."""
# QILY-CN-COPY-20261027-RELEASE-TRIGGER: content-only dual-site public copy accepted.
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

    target_main = parity.main_markup(target_value)
    if source_name == 'index.html':
        # CI unit fixtures use an unmodified source render and carry no CN
        # marker; only real materialized CN releases contain this audited
        # noncommercial module. Compare the rest against exact source order.
        owner = re.search(r'<!-- QILY-CN-OWNER-COLLABORATION-V1:START[^>]*-->[\s\S]*?<!-- QILY-CN-OWNER-COLLABORATION-V1:END -->', target_main)
        if owner is not None:
            owner_html = owner.group(0)
            require(owner_html.count('class="qily-home-role"') == 2 and 'grid-template-columns:minmax(0,1fr)!important' in owner_html, 'CN owner stack regression')
            target_main = target_main.replace(owner_html, '', 1)
            source_owner = re.compile(r'<section\b(?=[^>]*\bid="qily-home-collaboration")[^>]*>[\s\S]*?</section\s*>', re.I)
            expected, count = source_owner.subn('', expected)
            require(count == 1, 'Canonical owner source changed')
    source_modules = signatures(expected)
    target_modules = signatures(target_main)
    require(source_modules == target_modules,
            'CN noncommercial module order differs from international source: ' + url
            + ' source=' + repr(source_modules[:15]) + ' target=' + repr(target_modules[:15]))
    # Class/ID signatures alone cannot detect reordered anonymous sections or
    # dropped paragraphs. Compare the complete retained public text in order.
    public_text = lambda value: re.sub(r'\s+', '', parity.Tree(value).root.text())
    require(public_text(expected) == public_text(target_main),
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
    # Sitewide public-copy poka-yoke: catch backend planning expressions
    # accidentally placed in visitor-facing content on any CN public page.
    internal_only = (
        '辅助资产降级', '不抢主线', '争夺一级认知位置',
        '放回各自正确的位置', '争夺首页主视觉',
        '个人信息与知识资产各归其位',
        '不再让个人标签、工具和知识数量遮挡',
        '专业标签已归入',
    )
    for phrase in internal_only:
        require(phrase not in html.unescape(main),
                'Internal planning language leaked into CN public content: ' + url + ': ' + phrase)
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

    if row['source'] == 'experience/index.html':
        require(url == '/archive/profile/experience/', 'Career mirror must use its approved China-local route')
        consulting = re.search(r"<article\b(?=[^>]*\bid=[\"']career-2019-2025[\"'])[\s\S]*?</article>", main, re.I)
        require(consulting is not None, 'CN career mirror: 2019-2025 consulting card missing')
        company_lines = re.findall(r'<div class="career-company-line">([\s\S]*?)</div>', consulting.group(0))
        require(any('广东精工智能系统有限公司' in line and '2022.04—2025.08' in line for line in company_lines),
                'CN career mirror: JINGGON employment period must be 2022.04—2025.08')
        require(any('广东高胜互联科技有限公司' in line and '2019.07—2022.04' in line for line in company_lines),
                'CN career mirror: GO-think employment period must be 2019.07—2022.04')
        consulting_links = {attrs.get('href') for tag, attrs in Nodes(consulting.group(0)).nodes if tag == 'a'}
        require('https://www.jinggon.com/' in consulting_links and 'https://www.gdgaosheng.cn/' in consulting_links,
                'CN career mirror: consulting-company official links missing')

        early = re.search(r"<article\b(?=[^>]*\bid=[\"']career-2006-2015[\"'])[\s\S]*?</article>", main, re.I)
        require(early is not None, 'CN career mirror: early engineering card missing')
        early_lines = re.findall(r'<div class="career-company-line">([\s\S]*?)</div>', early.group(0))
        require(any('东莞库柏电子' in line and '2009.05—2015.06' in line for line in early_lines),
                'CN career mirror: Cooper Bussmann dates must be 2009.05—2015.06')
        require(any('珠海伟创力制造' in line and '2006.07—2009.04' in line for line in early_lines),
                'CN career mirror: Flextronics dates must be 2006.07—2009.04')
        early_tags = re.findall(r'<a\b(?=[^>]*\bclass=["\'][^"\']*\bcareer-related-link\b[^"\']*["\'])[^>]*>([\s\S]*?)</a>', early.group(0), re.I)
        tag_labels = [html.unescape(re.sub(r'<[^>]+>', '', item)).strip() for item in early_tags]
        require(len(tag_labels) == 6, 'CN career mirror: early engineering card must retain six related-result tags')
        require('DAP真空熔炉编程优化' in tag_labels, 'CN career mirror: DAP vacuum-furnace programming improvement tag missing')
        related_links = [attrs for tag, attrs in Nodes(early.group(0)).nodes
                         if tag == 'a' and 'career-related-link' in (attrs.get('class') or '').split()]
        dap_index = tag_labels.index('DAP真空熔炉编程优化')
        require(len(related_links) == len(tag_labels) == 6
                and related_links[dap_index].get('href') == url + '#dap-vacuum-furnace',
                'CN DAP project tag must target its local career achievement anchor')
        require(re.search(r'<li\b(?=[^>]*\bid=["\']dap-vacuum-furnace["\'])[^>]*>[\s\S]*?亲自完成DAP真空熔炉程序编程与优化', early.group(0), re.I),
                'CN DAP anchor must remain on the exact achievement bullet')
        dap_runtime_tags = [attrs for tag, attrs in nodes
                            if tag == 'script' and attrs.get('data-cn-dap-evidence-runtime') == 'v1']
        require(len(dap_runtime_tags) == 1
                and dap_runtime_tags[0].get('src', '').startswith('/assets/source-content/dap-evidence-jump.js?v='),
                'CN career page must load exactly one local DAP evidence interaction runtime')
        require(not any('IATF 16949' in label for label in tag_labels),
                'CN career mirror: removed IATF 16949 tag must not return')

        current = re.search(r"<article\b(?=[^>]*\bid=[\"']career-2025-current[\"'])[\s\S]*?</article>", main, re.I)
        require(current is not None, 'CN career mirror: current Tianxing career card missing')
        current_links = {attrs.get('href') for tag, attrs in Nodes(current.group(0)).nodes if tag == 'a'}
        require('http://www.china-tianx.com/' in current_links,
                'CN career mirror: Tianxing official website link missing')

        resume = re.search(r"<section\b(?=[^>]*\bid=[\"']career-resume-20261102[\"'])[\s\S]*?</section>", main, re.I)
        require(resume is not None, 'CN career mirror: latest November 2026 PDF résumé module missing')
        resume_nodes = Nodes(resume.group(0)).nodes
        pdf_hrefs = [attrs.get('href', '') for tag, attrs in resume_nodes
                     if tag == 'a' and 'ding-qili-resume-2026-11.pdf' in attrs.get('href', '')]
        require(len(pdf_hrefs) == 3, 'CN career mirror: PDF cover, preview and download links must all be present')
        pdf_paths = {href.split('?', 1)[0] for href in pdf_hrefs}
        require(len(pdf_paths) == 1 and next(iter(pdf_paths)).startswith('/assets/public-media/assets/resume/'),
                'CN career mirror: all résumé PDF actions must use one local China-hosted original')

        # The international source opens both PDF preview entry points in a
        # separate tab. Preserve that behavior on CN; closing the PDF must not
        # replace the visitor's original résumé page.
        preview_link = re.search(
            r"""<a\b(?=[^>]*\bclass=["'][^"']*\bresume-pdf-action\b[^"']*["'])[^>]*>\s*在线预览 PDF 原件\s*</a>""",
            resume.group(0), re.I)
        cover_link = re.search(
            r"""<a\b(?=[^>]*\bclass=["'][^"']*\bresume-pdf-cover\b[^"']*["'])[^>]*>""",
            resume.group(0), re.I)
        require(preview_link is not None, 'CN career mirror: PDF preview action missing')
        require(cover_link is not None, 'CN career mirror: PDF cover preview action missing')
        for match, label in ((preview_link, 'preview button'), (cover_link, 'cover preview')):
            attrs = Nodes(match.group(0)).nodes[0][1]
            require(attrs.get('target') == '_blank',
                    'CN career mirror: ' + label + ' must open in a new tab')
            rel = set((attrs.get('rel') or '').split())
            require({'noopener', 'noreferrer'} <= rel,
                    'CN career mirror: ' + label + ' must use noopener noreferrer')

        downloads = [attrs.get('download') for tag, attrs in resume_nodes if tag == 'a' and attrs.get('download') is not None]
        require(downloads == ['丁启利_精益经理工程部经理简历_20261102.pdf'],
                'CN career mirror: original PDF download/save filename or action is missing')
        covers = [attrs.get('src', '') for tag, attrs in resume_nodes
                  if tag == 'img' and 'ding-qili-resume-2026-11-cover.png' in attrs.get('src', '')]
        require(len(covers) == 1 and covers[0].startswith('/assets/public-media/assets/resume/'),
                'CN career mirror: full-quality résumé cover thumbnail must be locally mirrored')

    if row['source'] == 'capabilities/index.html':
        # Product actions must stay interactive after commercial-only filtering.
        # Never replace a download with plain text or drop privacy/support links.
        panel = re.search(r'<article\b(?=[^>]*\bid="times26001")([\s\S]*?)</article>', main)
        require(panel is not None, 'CN Times26001 product card missing')
        action_box = re.search(r'<div\b[^>]*class="[^"]*\bmodule-actions\b[^"]*"[^>]*>([\s\S]*?)</div>', panel.group(0))
        require(action_box is not None, 'CN Times26001 action bar missing')
        actions = re.findall(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>([^<]+)</a>', action_box.group(1))
        expected = ['下载 Android APK', '下载说明', '扫码下载', '分享下载页', '隐私政策', '用户协议', '技术支持']
        require([html.unescape(label).strip() for _, label in actions] == expected,
                'CN Times26001 seven-button contract differs from COM: ' + repr(actions))
        require(actions[0][0].split('?', 1)[0].endswith('/Times26001_v1.1.15_API36_website_release.apk'),
                'CN Times26001 APK download must point to the approved exact release')
        require(actions[-1][0] == '/app-support/', 'CN Times26001 technical-support route must stay local')

        # The COM QilyLean Home reference has seven clickable actions.
        # A missing CN link map formerly unwrapped the two legal anchors.
        home_panel = re.search(r'<article\b(?=[^>]*\bid="qilylean-home")[\s\S]*?</article>', main)
        require(home_panel is not None, 'CN QilyLean Home product card missing')
        home_box = re.search(r'<div\b[^>]*class="[^"]*\bmodule-actions\b[^"]*"[^>]*>([\s\S]*?)</div>', home_panel.group(0))
        require(home_box is not None, 'CN QilyLean Home action bar missing')
        home_links = re.findall(r'<a\b[^>]*\bhref="([^"]+)"[^>]*>([^<]+)</a>', home_box.group(1))
        require([html.unescape(label).strip() for _, label in home_links] == expected,
                'CN QilyLean Home seven-button contract differs from COM: ' + repr(home_links))
        require(home_links[0][0].split('?', 1)[0].endswith('/QilyLean_CN_Home_v1.0.0_API36_INSTALL.apk'),
                'CN Home must distribute the existing China package')
        require('v1.0.0' in home_panel.group(0) and 'versionCode 1' in home_panel.group(0) and
                'cn.qilylean.home' in home_panel.group(0) and 'v2.3.3' not in home_panel.group(0),
                'CN Home product card package/version identity mismatch')
        require(home_links[4][0] == '/legal/qilylean-cn-home/privacy/' and
                home_links[5][0] == '/legal/qilylean-cn-home/terms/',
                'CN Home must use the China package privacy and terms')
        require(home_links[-1][0] == '/app-support/', 'CN QilyLean Home technical support must stay local')

    if row['source'] == 'tools/times26001/index.html':
        require('times26001-five-rows-list' in main, 'CN Times26001 approved workflow missing')
        require(main.count('class="times26001-step-number"') == 5, 'CN Times26001 five horizontal-readable rows missing')
        require('data-qily-times-visual="v3"' in main, 'CN Times26001 visual guard missing')
        require('style="color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;' in main,
                'CN Times26001 dark-title visual contrast fix missing')
        require('v1.1.15' in main and 'versionCode 18' in main, 'CN Times26001 latest identity differs from COM')
        require('/assets/public-media/Times26001_v1.1.15_API36_website_release.apk' in main,
                'CN Times26001 local signed APK link missing')
        require('/assets/public-media/Times26001_v1.1.15_API36_website_release.sha256.txt' in main,
                'CN Times26001 SHA-256 verification link missing')
        require('href="/legal/times26001/privacy/"' in main and 'href="/legal/times26001/terms/"' in main and
                'href="/app-support/"' in main, 'CN Times26001 local legal/support routes missing')
        require('统一开发者支持：' in main and 'https://qilylean.cn/' in main,
                'CN Times26001 displayed website must be the China official site')
        require('https://qilylean.com/' not in main and 'mailto:admin@qilylean.com' not in main,
                'CN Times26001 product page must not expose COM-only website/email information')
        require('官网邮箱 <span class="notranslate" translate="no">admin@qilylean.com</span>' in main and 'href="/app-support/"' in main,
                'CN Times26001 developer contact must use the retained local support page')
        require('官网邮箱 。' not in main,
                'CN Times26001 developer email label must not be left orphaned')


    if url == '/':
        # First hero gold kicker must inherit the approved COM regular VI,
        # even when the mirrored legacy CSS is cached or reasserted.
        hero_kickers = [
            attrs for tag, attrs in Nodes(main).nodes
            if tag == 'span' and 'qily-home-conversion-hero__kicker' in attrs.get('class', '').split()
        ]
        require(len(hero_kickers) == 1 and
                'font-weight:400!important' in hero_kickers[0].get('style', '').replace(' ', '') and
                '-webkit-font-smoothing:antialiased!important' in hero_kickers[0].get('style', '').replace(' ', ''),
                'China homepage gold hero kicker must render at international regular weight')
        for section in ('qily-core-services', 'qily-digital-enablers'):
            require('id="' + section + '"' in main, 'Public engineering capability section was over-filtered: ' + section)
        require('三类项目' in main and '数智化增强' in main,
                'China homepage must retain engineering and digital capability summaries')
        require('免费60分钟沟通诊断' not in main and '咨询转化' not in main,
                'China public homepage must not expose commercial conversion copy')
        # China may exclude commerce, never the owner's public CV or biography.
        owner = re.search(r'<section\b[^>]*id="qily-home-collaboration"[^>]*>[\s\S]*?</section>', main)
        require(owner is not None, 'CN owner section missing')
        # Poka-yoke: the owner module is a standalone, immediately visible
        # homepage section. Never nest it in the "展开" extended <details>.
        extended = re.search(r'<section\b(?=[^>]*\bid="qily-home-extended")[^>]*>', main, re.I)
        require(extended is not None and owner.start() < extended.start(),
                'CN owner must appear before the collapsed extended section')
        owner_html = owner.group(0)
        require('ding-qili-ai-avatar-560.webp' in owner_html,
                'CN owner portrait must use the restored professional image')
        require('ding-qili-anime-20261028.webp' not in owner_html,
                'Retired anime portrait remains in CN owner module')
        require(owner_html.count('class="qily-home-role"') == 2 and
                'grid-template-columns:minmax(0,1fr)!important' in owner_html,
                'CN owner card layout regressed')
        for token in ('QilyLean主理', '丁启利｜20年制造业工程技术与精益改善履历',
                      '9年任职欧美企业', '4年担任上市公司工程部长',
                      '累计6年多从事咨询交付', 'qily-home-owner-profile',
                      'class="qily-home-owner-profile__experience"',
                      'href="/archive/profile/experience/"', '查看履历主线 →',
                      '专家／供应商协同'):
            require(token in owner_html, 'CN owner lost approved COM content: ' + token)
        source_profile = parity.runtime_function((ROOT / parity.HOME_RUNTIMES[1]).read_text(), 'apply')
        source_bio = parity.Tree(parity.literal_template(source_profile, r'profile\.innerHTML\s*=')).root.text()
        require(re.sub(r'\s+', '', source_bio) in re.sub(r'\s+', '', parity.Tree(owner_html).root.text()),
                'CN owner public profile differs from international SSOT')
        require(not re.search(r'费用|报价|付费|签约|预约|交易邀约', owner_html),
                'Commercial owner transaction statement leaked into China homepage')
        # Regression gate for China-only filtered home modules. Shared VI may
        # change but must never restore 3/4-column empty slots or remove titles.
        trust_section = re.search(r'<section\b[^>]*id="qily-trust-center"[^>]*>[\s\S]*?</section>', main)
        proof_section = re.search(r'<section\b[^>]*id="qily-home-proof"[^>]*>[\s\S]*?</section>', main)
        require(trust_section is not None and proof_section is not None,
                'China home evidence/trust section missing')
        trust_html, proof_html = trust_section.group(0), proof_section.group(0)
        require('专业能力有依据，项目成果可核验' in trust_html
                and '资料来源、成果核验口径及AI辅助使用方式' in trust_html,
                'China homepage trust title/lead missing or reverted')
        require(trust_html.count('qily-value-card-link') == 1
                and 'grid-template-columns:minmax(0,1fr)!important' in trust_html,
                'China trust evidence card must use entire module width')
        require(len(re.findall(r'<article\b', proof_html)) == 2
                and 'grid-template-columns:repeat(auto-fit' not in proof_html
                and 'display:grid!important' in proof_html,
                'China home two evidence cards must occupy equal responsive columns')

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
            # A public, non-commercial APK is a downloadable product artifact, not
            # an international business route. Preserve the exact source release
            # when its bytes have not yet been mirrored on the CN server.
            approved_apk = (row['source'] == 'capabilities/index.html'
                            and parsed.hostname == 'qilylean.com'
                            and parsed.path in parity.CAPABILITY_PUBLIC_APKS)
            approved_home_legal = (row['source'] == 'capabilities/index.html'
                                   and parsed.hostname == 'qilylean.com'
                                   and parsed.path in parity.CAPABILITY_HOME_OFFICIAL_LEGAL
                                   and not parsed.query and not parsed.fragment)
            require(parsed.hostname not in {'qilylean.com', 'www.qilylean.com'} or approved_bridge or approved_apk or approved_home_legal,
                    'International internal route was not localized: ' + url)
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
        if date == '2026-11-08':
            for marker in ('从梦想蓝图到改善成果', '没有想象力', '没有执行力', 'qv-flow', 'qv-cards', 'qv-table'):
                require(marker in main, 'Latest special-content issue lost source structure: ' + marker)
            require('https://qilylean.cn/briefs/archive/2026-11-08/' in value,
                    'Latest issue lost China-local canonical')
        if date == '2026-11-10':
            for marker in (
                '改善没有终点，协同创造价值', '从单点改善到组织共创的工程闭环',
                'continuous-collaboration-20261110', 'hc-thesis', 'hc-loop',
                'hc-cards', 'hc-table', 'hc-flow', 'hc-roadmap',
                '90天落地路线', '教学推演',
            ):
                require(marker in main, '2026-11-10 cloned brief lost original knowledge/visual structure: ' + marker)
            require('https://qilylean.cn/briefs/archive/2026-11-10/' in value,
                    '2026-11-10 issue lost China-local canonical')
            require('2026-11-10-brief.css' in value,
                    '2026-11-10 original scoped source CSS was not mirrored')
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
    # Reproduce the former release-blocking unbound card_count regression.
    only_one = parity.render(parity.Tree('<div class="qily-six-grid"><a href="/trust/#evidence-levels">证据分级</a></div>').root, 'index.html')
    require('grid-template-columns:minmax(0,1fr)!important' in only_one, 'Single trust card grid regression')
    exactly_two = parity.render(parity.Tree('<div class="qily-ia-delivery-summary"><article>专业基础</article><article>项目证据</article></div>').root, 'index.html')
    require('display:grid!important' in exactly_two and 'grid-template-columns:repeat(auto-fit' not in exactly_two, 'Double proof grid responsive authority regression')
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
    career_assets = {item.get('source') for item in media}
    require({'assets/resume/ding-qili-resume-2026-11.pdf',
             'assets/resume/ding-qili-resume-2026-11-cover.png'} <= career_assets,
            'Career PDF original and cover must be included in the full-quality media hash ledger')
    require(any(item.get('source') == 'site-early-career-history-v1.css' for item in styles),
            'Career timeline source stylesheet must be mirrored and hash-verified')
    career_runtime = next((item for item in styles if item.get('source') == 'qilylean/career-resume-full.js'), None)
    require(career_runtime is not None
            and career_runtime.get('url', '').startswith('/assets/source-content/dap-evidence-jump.js?v='),
            'Career DAP interaction runtime is not mirrored as a hash-verified China-local asset')
    runtime_content = local_path(career_runtime['url']).read_text(encoding='utf-8')
    require('function bindDapEvidenceJump()' in runtime_content
            and 'window.__qilyDapEvidenceJumpV1' in runtime_content
            and 'header.site-header' in runtime_content
            and '.qily-cn-nav-rail' in runtime_content
            and 'candidateRect.bottom' in runtime_content
            and not re.search(r'(?m)^\s*#', runtime_content)
            and 'function render()' not in runtime_content
            and not any(token in runtime_content for token in ('fetch(', 'XMLHttpRequest', 'sendBeacon', 'qilylean.com', '/cooperation/')),
            'China DAP runtime must contain only the isolated same-origin evidence interaction')
    career_css_record = next((item for item in styles if item.get('source') == 'site-early-career-history-v1.css'), None)
    career_css_content = local_path(career_css_record['url']).read_text(encoding='utf-8') if career_css_record else ''
    require('@keyframes cn-source-qilyDapEvidenceFlash' in career_css_content
            and 'cn-source-qilyDapEvidenceFlash' in career_css_content
            and '[data-qily-dap-highlight="true"]' in career_css_content
            and 'prefers-reduced-motion' in career_css_content,
            'China career CSS must retain the international three-pulse and reduced-motion feedback rules')
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

    lecture_modules = manifest.get('lecture_modules', [])
    expected_lectures = {
        'qilylean/daily/2026-11-08.html': '/briefs/archive/2026-11-08/',
        'qilylean/daily/2026-10-25.html': '/briefs/archive/2026-10-25/',
        'improvements/visual/index.html': '/archive/improvements/visual/',
    }
    require({row.get('source') for row in lecture_modules} >= set(expected_lectures),
            'CN release is missing one or more approved voice-lecture modules')
    for lecture in lecture_modules:
        page_value = local_path(lecture['url']).read_text(encoding='utf-8')
        style_match = re.search(r'<style\b(?=[^>]*\bdata-cn-lecture-css=["\']v1["\'])[^>]*>([\s\S]*?)</style\s*>', page_value, re.I)
        markup_match = re.search(r'<!-- QILY-CN-LECTURE-MODULE:START -->([\s\S]*?)<!-- QILY-CN-LECTURE-MODULE:END -->', parity.main_markup(page_value), re.I)
        runtime_match = re.search(r'<script\b(?=[^>]*\bdata-cn-lecture-runtime=["\']v1["\'])[^>]*>([\s\S]*?)</script\s*>', page_value, re.I)
        require(style_match and markup_match and runtime_match, 'CN lecture module is incomplete: ' + lecture['url'])
        require(sha(style_match.group(1).encode('utf-8')) == lecture['style_sha256'],
                'CN lecture stylesheet hash differs: ' + lecture['url'])
        require(sha(markup_match.group(1).strip().encode('utf-8')) == lecture['markup_sha256'],
                'CN lecture markup hash differs: ' + lecture['url'])
        runtime = runtime_match.group(1)
        require(sha(runtime.encode('utf-8')) == lecture['runtime_sha256'],
                'CN lecture runtime hash differs: ' + lecture['url'])
        for element_id in ('qily-lecture', 'qilyLecChapters', 'qilyLecPlayer', 'qilyLecMini', 'qilyLecAudio'):
            require(len(re.findall(r'\bid=["\']' + re.escape(element_id) + r'["\']', page_value, re.I)) == 1,
                    'CN lecture page has a missing or duplicate ID ' + element_id + ': ' + lecture['url'])
        require(re.search(r'href=["\'][^"\']*#qily-lecture["\']', parity.main_markup(page_value), re.I) is not None,
                'CN lecture page has no one-click entry from its content: ' + lecture['url'])
        require(lecture['audio'], 'CN lecture module has no audio chapters: ' + lecture['url'])
        for audio in lecture['audio']:
            require(audio['url'] in runtime, 'CN lecture runtime does not reference local audio: ' + audio['source'])
            encoded = quote(audio['source'], safe='/')
            referenced_media.add(encoded)
            require(encoded in manifest['media'], 'CN lecture audio is missing from the media ledger: ' + audio['source'])

    briefs_index = (CN / 'briefs/index.html').read_text(encoding='utf-8')
    require('data-qily-cn-lecture-badge="v1"' in briefs_index,
            'CN curated brief index is missing the approved lecture badge VI')
    for date in ('2026-11-08', '2026-10-25'):
        card = re.search(r'<article\b[^>]*data-date="' + date + r'"[^>]*>[\s\S]*?</article>', briefs_index, re.I)
        require(card is not None and 'data-qily-lecture="available"' in card.group(0)
                and 'qily-lecture-directory-badge' in card.group(0)
                and 'qily-lecture-icon' in card.group(0)
                and f'href="/briefs/archive/{date}/#qily-lecture"' in card.group(0),
                'CN brief index is missing its one-click lecture badge: ' + date)
    latest_card = re.search(r'<article\b[^>]*data-date="2026-11-10"[^>]*>[\s\S]*?</article>', briefs_index, re.I)
    require(latest_card is not None and 'qily-lecture-directory-badge' not in latest_card.group(0),
            'CN brief index must not advertise a lecture for the 2026-11-10 brief without an audio module')
    improvement_index = local_path('/archive/improvements/').read_text(encoding='utf-8')
    require('qily-lecture-directory-badge' in improvement_index
            and 'qily-lecture-icon' in improvement_index
            and 'href="/archive/improvements/visual/#qily-lecture"' in improvement_index,
            'CN improvement index is missing the visual-management lecture entry')
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

        def verify_remote_lecture(lecture):
            remote_value = read_page(lecture['url']).decode()
            style_match = re.search(r'<style\b(?=[^>]*\bdata-cn-lecture-css=["\']v1["\'])[^>]*>([\s\S]*?)</style\s*>', remote_value, re.I)
            markup_match = re.search(r'<!-- QILY-CN-LECTURE-MODULE:START -->([\s\S]*?)<!-- QILY-CN-LECTURE-MODULE:END -->', parity.main_markup(remote_value), re.I)
            runtime_match = re.search(r'<script\b(?=[^>]*\bdata-cn-lecture-runtime=["\']v1["\'])[^>]*>([\s\S]*?)</script\s*>', remote_value, re.I)
            require(style_match and markup_match and runtime_match,
                    'Production CN lecture module is incomplete: ' + lecture['url'])
            require(sha(style_match.group(1).encode('utf-8')) == lecture['style_sha256']
                    and sha(markup_match.group(1).strip().encode('utf-8')) == lecture['markup_sha256']
                    and sha(runtime_match.group(1).encode('utf-8')) == lecture['runtime_sha256'],
                    'Production CN lecture module differs from approved source: ' + lecture['url'])
            require(re.search(r'href=["\'][^"\']*#qily-lecture["\']', parity.main_markup(remote_value), re.I) is not None,
                    'Production CN lecture page lost its one-click entry: ' + lecture['url'])

        run_parallel(lecture_modules, verify_remote_lecture, args.workers)
        remote_briefs = read_page('/briefs/').decode()
        for date in ('2026-11-08', '2026-10-25'):
            card = re.search(r'<article\b[^>]*data-date="' + date + r'"[^>]*>[\s\S]*?</article>', remote_briefs, re.I)
            require(card is not None and 'qily-lecture-directory-badge' in card.group(0)
                    and f'href="/briefs/archive/{date}/#qily-lecture"' in card.group(0),
                    'Production CN brief directory is missing its lecture entry: ' + date)
        remote_improvements = read_page('/archive/improvements/').decode()
        require('qily-lecture-directory-badge' in remote_improvements
                and 'href="/archive/improvements/visual/#qily-lecture"' in remote_improvements,
                'Production CN improvement directory is missing the visual lecture entry')

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
