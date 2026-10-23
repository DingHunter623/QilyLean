#!/usr/bin/env python3
"""Final public-content pass: source layouts and media, destination-owned shell.

Commercial routes/panels are excluded. Contact, translation, filings and the
independently restored interactive knowledge viewers remain China-owned.
"""
from __future__ import annotations
import ast
import hashlib
import html
from html.parser import HTMLParser
import importlib
import json
from pathlib import Path
import re
import subprocess
import shutil
import sys
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[2]
CN = ROOT / 'cn-site'
sys.path.insert(0, str(CN / 'scripts'))
mirror = importlib.import_module('materialize-public-content-mirror')
visual = importlib.import_module('materialize-brief-visual-parity')
TRACKED = set(filter(None, subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT, text=True).split('\0')))
VERSION = '20261023-source-content-parity-v5-settled-home'
PRIMARY = {
    'index.html': ('/', 'home'),
    'experience/index.html': ('/archive/profile/experience/', 'contact'),
    'capabilities/index.html': ('/archive/profile/capabilities/', 'capabilities'),
    'improvements/index.html': ('/archive/profile/tools/', 'tools'),
    'lean-production/index.html': ('/lean/', 'lean'),
    'projects/index.html': ('/notes/', 'projects'),
    'trust/index.html': ('/trust/', 'trust'),
    'knowledge/index.html': ('/knowledge/', 'knowledge'),
    'qilylean/daily-insights.html': ('/briefs/', 'knowledge'),
    'links/index.html': ('/resources/', 'resources'),
}
ROUTES = dict(mirror.SOURCE_TO_URL)
ROUTES.update({name: item[0] for name, item in PRIMARY.items()})
ROUTES.update({'links/index.html': '/resources/', 'qilylean/daily-insights.html': '/briefs/', 'moments/index.html': '/archive/records/'})
BLOCK_IDS = {'identity', 'contract', 'contact', 'project-cooperation', 'qily-commercial-deliveries',
             'qily-north', 'qily-core-services', 'qily-digital-enablers', 'nda-template', 'diagnosis',
             'qily-home-launch', 'floatDock', 'qilyDockBottomSpacerV58'}
BLOCK_CLASSES = {'contact-panel', 'brief-feedback', 'brief-inline-message', 'resource-service',
                 'qily-resource-network', 'qily-contact-modal', 'commercial-panel'}
COMMERCIAL_ROUTES = ('/cooperation/', '/contact/', '/projects/qilylean-commercial-deliveries/',
                     '/north/diagnosis/', '/links/network/', '/links/onboarding/')
# Procurement history and engineering terms such as "施工合同" and "信息合同"
# remain source facts. Exclude explicit conversion copy, never arbitrary spans.
COMMERCIAL_COPY = re.compile(
    r'商务合作|业务承接|项目承接|咨询预约|预约咨询|立即咨询|服务套餐|代理加盟|资源撮合|'
    r'商业交付|咨询转化|销售线索|客户招揽|业务转化|商业签约|默认签约主体|'
    r'独立核价|三大核心业务|签约主体|商业合作|费用、税费|'
    r'免费\s*60\s*分钟|预约.{0,12}(?:诊断|初筛)|正式.{0,20}(?:报价|付款|发票)|'
    r'(?:费用|税费|付款|收款|发票).{0,35}(?:合同|签约|账户)|'
    r'(?:以|按).{0,20}(?:正式合同|书面方案与合同|签约主体)'
)
COMMERCIAL_LINK_COPY = re.compile(
    r'项目合作|商务合作|业务合作|商业合作|合作洽谈|合作申请|申请合作|项目承接|业务承接|'
    r'立即咨询|咨询预约|预约咨询|获取方案|服务套餐|报价|签约|付款|收费|招商|代理加盟|'
    r'资源撮合|销售线索|客户招揽|提交需求|分层能力|交付边界|服务范围|服务能力|'
    r'联系我们|联系方式|联系我|联系顾问|联系销售|联系团队|扫码|微信|电话|邮箱'
)
MEDIA = set()
MEDIA_HASHES = {}
EXCLUDED = []
LINK_ADAPTATIONS = []
STYLE_RECORDS = {}
MEDIA_EXT = visual.MEDIA_EXT | {'.pdf', '.qly', '.woff', '.woff2', '.ttf', '.vtt'}
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

def media_url(value, source):
    if value.startswith('#'):
        return value
    if re.match(r'data:image/(?:png|jpeg|gif|webp|svg\+xml)[;,]', value, re.I):
        return value
    parsed = urlsplit(urljoin('/' + source, value))
    if parsed.scheme not in {'', 'http', 'https'} or (parsed.netloc and parsed.hostname not in {'qilylean.com', 'www.qilylean.com', 'qilylean.cn', 'www.qilylean.cn'}):
        return ''
    relative = unquote(parsed.path).lstrip('/')
    for prefix in ('mirror-media/', 'assets/public-media/'):
        if relative.startswith(prefix):
            relative = relative[len(prefix):]
            break
    if relative not in TRACKED or '..' in Path(relative).parts:
        return ''
    if re.search(r'(?:^|[-_/])(?:qr|qrcode|wechat|weixin|contact)(?:[-_./]|$)', relative, re.I):
        return ''
    if relative in visual.CN_BRAND_MEDIA:
        return visual.CN_BRAND_MEDIA[relative]
    if Path(relative).suffix.lower() not in MEDIA_EXT:
        return ''
    encoded = quote(relative, safe='/')
    MEDIA.add(encoded)
    return versioned_media_url(encoded, media_digest(relative))

def link_url(value, source):
    if value.startswith('#'):
        return value
    parsed = urlsplit(urljoin('/' + source, value))
    if parsed.scheme not in {'', 'http', 'https'}:
        return ''
    if parsed.netloc and parsed.hostname not in {'qilylean.com', 'www.qilylean.com', 'qilylean.cn', 'www.qilylean.cn'}:
        return value
    path = parsed.path
    if path.startswith(COMMERCIAL_ROUTES) or parsed.fragment in BLOCK_IDS:
        return ''
    if Path(path).suffix.lower() in visual.MEDIA_EXT | {'.pdf', '.qly'}:
        return media_url(value, source)
    original = mirror.source_file_for_url(path)
    target = ROUTES.get(original or '')
    if path in {'/moments.html', '/moments/'}:
        target = '/archive/records/'
    if not target and parsed.hostname in {'qilylean.cn', 'www.qilylean.cn'}:
        target = path
    if not target and (CN / path.lstrip('/') / 'index.html').is_file():
        target = path
    if not target:
        return ''
    return urlunsplit(('', '', target, parsed.query, parsed.fragment))

def noncommercial_link_fallback(path, label):
    """Map the public operating-axis topic away from its retired commercial route."""
    normalized = re.sub(r'\s+', '', label)
    if path.startswith('/cooperation/') and re.search(r'数智固化', normalized) and re.search(r'(?:ERP|MES|APS|看板)', normalized, re.I):
        return '/archive/profile/capabilities/#digital'
    return ''


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def text(self):
        return ''.join(child.text() if isinstance(child, Node) else html.unescape(child) for child in self.children)

class Tree(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=False)
        self.root = Node(); self.stack = [self.root]; self.feed(value)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]; break
    def handle_data(self, data): self.stack[-1].children.append(data)
    def handle_entityref(self, name): self.handle_data('&' + name + ';')
    def handle_charref(self, name): self.handle_data('&#' + name + ';')


# COM's homepage is structurally settled by these two runtimes. Reading only
# index.html silently drops the actual industry/case/method/deliverable modules.
# Extract authored literal HTML without executing, copying or shipping source JS.
HOME_RUNTIMES = ('site-home-conversion-v1.js', 'site-home-owner-profile-v1.js')
JS_STRING = r"(?:'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\")"


def literal_template(body, prefix, suffix=';'):
    pattern = prefix + r'\s*(?P<literal>' + JS_STRING + r'(?:\s*\+\s*' + JS_STRING + r')*)\s*' + suffix
    matches = list(re.finditer(pattern, body))
    if len(matches) != 1:
        raise RuntimeError('Canonical homepage literal template changed: ' + prefix)
    expression = matches[0].group('literal')
    return ''.join(ast.literal_eval(token.group()) for token in re.finditer(JS_STRING, expression))


def runtime_function(runtime, name):
    match = re.search(r'\n  function ' + re.escape(name) + r'\([^)]*\)\{([\s\S]*?)(?=\n  function |\n  if\(d\.readyState)', runtime)
    if not match:
        raise RuntimeError('Canonical homepage function missing: ' + name)
    return match.group(1)


def source_runtime_records(raw, name):
    if name != 'index.html' or '/site-home-conversion-v1.js' not in raw:
        return []
    return [{'source': relative, 'sha256': file_hash(ROOT / relative), 'bytes': (ROOT / relative).stat().st_size}
            for relative in HOME_RUNTIMES if '/' + relative in raw]


def source_fragment(raw, name):
    """The source's final authored content DOM, before CN commercial filtering.

    The adapter deliberately supports the canonical runtime's literal builders
    and explicit move operations only. A changed runtime fails closed instead
    of approving a China homepage based on an obsolete raw-source snapshot.
    """
    match = re.search(r'<main\b[^>]*>([\s\S]*?)</main\s*>', raw, re.I)
    fragment = match.group(1) if match else mirror.extract_fragment(raw, name)
    if name != 'index.html' or '/site-home-conversion-v1.js' not in raw:
        return fragment
    runtime = (ROOT / HOME_RUNTIMES[0]).read_text()
    root = Tree(fragment).root

    def find(node, predicate):
        if not isinstance(node, Node):
            return None
        if predicate(node):
            return node
        for child in node.children:
            found = find(child, predicate)
            if found is not None:
                return found
        return None

    def by_id(identifier):
        return find(root, lambda node: node.attrs.get('id') == identifier)

    def by_class(node, classname):
        return find(node, lambda item: classname in item.attrs.get('class', '').split())

    def parent(node, target):
        for child in node.children:
            if child is target:
                return node
            if isinstance(child, Node):
                found = parent(child, target)
                if found is not None:
                    return found
        return None

    def detach(node):
        owner = parent(root, node)
        if owner is not None:
            owner.children.remove(node)

    def after(anchor, node):
        detach(node)
        owner = parent(root, anchor)
        if owner is None:
            raise RuntimeError('Canonical homepage anchor is detached')
        owner.children.insert(owner.children.index(anchor) + 1, node)

    def children(value):
        return Tree(value).root.children

    def builder(function, prefix=r'return node\('):
        result = [item for item in children(literal_template(runtime_function(runtime, function), prefix, r'\)\s*;'))
                  if isinstance(item, Node)]
        if len(result) != 1:
            raise RuntimeError('Canonical homepage builder must return one element: ' + function)
        return result[0]

    def attributes(node, body, variable):
        for attribute in ('className', 'id'):
            if re.search(re.escape(variable) + r'\.' + attribute + r'\s*=', body):
                node.attrs['class' if attribute == 'className' else attribute] = literal_template(
                    body, re.escape(variable) + r'\.' + attribute + r'\s*=')
        setter = re.escape(variable) + r'\.setAttribute\('
        pairs = re.findall(setter + r'\s*(' + JS_STRING + r')\s*,\s*(' + JS_STRING + r')\s*\)', body)
        if len(pairs) != len(re.findall(setter, body)):
            raise RuntimeError('Canonical homepage attribute is no longer a literal: ' + variable)
        for key, value in pairs:
            node.attrs[ast.literal_eval(key)] = ast.literal_eval(value)

    hero = next((node for node in root.children if isinstance(node, Node) and 'hero' in node.attrs.get('class', '').split()), None)
    core, method = by_id('qily-core-services'), by_id('qily-competitive-value')
    aircraft = by_class(root, 'qily-aircraft-brand-hero')
    if hero is None or core is None or method is None:
        raise RuntimeError('Canonical homepage boot prerequisites changed')
    hero_body = runtime_function(runtime, 'transformHero')
    attributes(hero, hero_body, 'hero')
    hero.children = children(literal_template(hero_body, r'hero\.innerHTML\s*='))
    core_body = runtime_function(runtime, 'setCoreCopy')
    attributes(core, core_body, 'core')
    heading = by_class(core, 'qily-ia-heading')
    for variable, target in (('kicker', by_class(core, 'qily-ia-kicker')),
                             ('title', find(heading, lambda node: node.tag == 'h2')),
                             ('lead', find(heading, lambda node: node.tag == 'p'))):
        if target is not None:
            target.children = [literal_template(core_body, variable + r'\.textContent\s*=')]
    actions = by_class(core, 'qily-ia-actions')
    if actions is not None:
        actions.children = children(literal_template(core_body, r'actions\.innerHTML\s*='))
    method_body = runtime_function(runtime, 'transformMethod')
    attributes(method, method_body, 'section')
    method.children = children(literal_template(method_body, r'section\.innerHTML\s*='))

    boot = runtime_function(runtime, 'boot')
    moves = re.findall(r'\b(\w+)\.after\((\w+)\);', boot)
    expected_moves = [('hero', 'core'), ('core', 'industry'), ('industry', 'cases'),
                      ('cases', 'method'), ('method', 'capabilityBuilding'),
                      ('capabilityBuilding', 'deliverables'), ('deliverables', 'collaboration'),
                      ('collaboration', 'launch'), ('launch', 'extended'), ('extended', 'brandExtension')]
    if moves != expected_moves:
        raise RuntimeError('Canonical homepage module order changed; update the settled-source adapter')
    nodes = {'hero': hero, 'core': core, 'method': method}
    for variable, function in re.findall(r'var (\w+)=(build\w+)\(\);', boot):
        nodes[variable] = builder(function)
    # Match main.insertBefore(hero, main.firstElementChild), retaining any new
    # unowned source modules in their original relative order.
    detach(hero)
    first = next((index for index, child in enumerate(root.children) if isinstance(child, Node)), len(root.children))
    root.children.insert(first, hero)
    for anchor, variable in expected_moves[:-2]:
        after(nodes[anchor], nodes[variable])

    extended_body = runtime_function(runtime, 'buildExtended')
    extended = builder('buildExtended', r'var wrap=node\(')
    extended_content = by_class(extended, 'qily-home-extended__content')
    selector_list = re.search(r'\[([\s\S]*?)\]\.forEach', extended_body)
    if extended_content is None or selector_list is None:
        raise RuntimeError('Canonical extended-content container changed')
    selectors = re.findall(r"(?:main\.(querySelector)|d\.(getElementById))\('([^']+)'\)", selector_list.group(1))
    remainder = re.sub(r"(?:main\.querySelector|d\.getElementById)\('[^']+'\)", '', selector_list.group(1))
    if not selectors or re.sub(r'[\s,]', '', remainder):
        raise RuntimeError('Canonical extended-content selector list changed')
    for query, identifier, value in selectors:
        if query and not re.fullmatch(r'\.[\w-]+', value):
            raise RuntimeError('Unsupported canonical extended-content selector: ' + value)
        selected = by_class(root, value[1:]) if query and value.startswith('.') else by_id(value) if identifier else None
        if selected is not None:
            detach(selected)
            extended_content.children.append(selected)
    after(nodes['launch'], extended)
    if aircraft is not None:
        brand_body = runtime_function(runtime, 'buildBrandExtension')
        attributes(aircraft, brand_body, 'aircraft')
        image = find(aircraft, lambda node: node.tag == 'img')
        if image is not None:
            image.attrs['loading'] = literal_template(brand_body, r'img\.loading\s*=')
            image.attrs['fetchpriority'] = literal_template(brand_body, r'img\.fetchPriority\s*=')
        brand = builder('buildBrandExtension', r'var wrap=node\(')
        inner = by_class(brand, 'qily-home-brand-extension__inner')
        if inner is None:
            raise RuntimeError('Canonical brand-extension container changed')
        detach(aircraft)
        inner.children.append(aircraft)
        after(extended, brand)
    if '/' + HOME_RUNTIMES[1] in raw:
        profile_body = runtime_function((ROOT / HOME_RUNTIMES[1]).read_text(), 'apply')
        role = by_class(nodes['collaboration'], 'qily-home-role')
        if role is None:
            raise RuntimeError('Canonical public owner-profile container missing')
        profile = Node('div')
        attributes(profile, profile_body, 'profile')
        profile.children = children(literal_template(profile_body, r'profile\.innerHTML\s*='))
        role.children.append(profile)

    def serialize(node):
        if not isinstance(node, Node):
            return node
        attrs = ''.join(' ' + key + ('' if value is None else '="' + html.escape(value, quote=True) + '"')
                        for key, value in node.attrs.items())
        value = ''.join(serialize(child) for child in node.children)
        return '<' + node.tag + attrs + '>' + ('' if node.tag in VOID else value + '</' + node.tag + '>') if node.tag else value

    return serialize(root)

def render(node, source):
    if not isinstance(node, Node): return node
    if not node.tag: return ''.join(render(child, source) for child in node.children)
    attrs = node.attrs.copy(); tag = node.tag
    public_search = tag == 'input' and attrs.get('id') == 'briefSearch' and attrs.get('type') == 'search'
    if tag in {'script','style','noscript','iframe','object','embed','form','textarea','select'} or (tag == 'input' and not public_search):
        return ''
    identifier = attrs.get('id', '')
    classes = set(attrs.get('class', '').split())
    hero_classes = {'hero','module-hero','daily-hero','article-hub','document-hero','project-hero',
                    'projects-hero','cooperation-hero','capability-hero','experience-hero',
                    'improvement-hero','knowledge-hero','trust-hero'}
    if 'knowledge-brief-hero' in classes:
        attrs.pop('data-qily-vi-v4-hero', None)
        attrs['data-qily-vi-v4-surface'] = 'secondary-content'
    elif classes & hero_classes and 'qily-aircraft-brand-hero' not in classes:
        attrs['data-qily-vi-v4-hero'] = '118deg'
    if identifier in BLOCK_IDS or classes & BLOCK_CLASSES:
        EXCLUDED.append({'source': source, 'panel': identifier or 'contact-panel', 'reason': 'explicit-blocklist'})
        return ''
    # Remove conversion copy at its smallest authored prose block, retaining
    # surrounding project facts, original cards, diagrams, photos and layout.
    prose = tag in {'p','li','figcaption','small','h2','h3','dd','dt'}
    commercial_card = tag == 'article' and any(isinstance(child, Node) and child.tag == 'strong' and child.text().strip() in {'交易机制', '责任边界'} for child in node.children)
    procurement_card = tag == 'article' and 'qily-home-role' in classes and any(
        isinstance(child, Node) and child.tag == 'h3' and child.text().strip() == '专家／供应商协同'
        for child in node.children)
    commercial_note = bool(classes & {'qily-asset-note', 'qily-ia-result'})
    if procurement_card or (prose or commercial_card or commercial_note) and COMMERCIAL_COPY.search(node.text()):
        EXCLUDED.append({'source': source, 'panel': identifier or tag, 'reason': 'commercial-copy'})
        return ''
    if tag == 'a':
        original_href = attrs.get('href', '')
        original_url = urlsplit(urljoin('/' + source, original_href))
        commercial_destination = original_url.path.startswith(COMMERCIAL_ROUTES) or original_url.fragment in BLOCK_IDS
        if commercial_destination:
            label = re.sub(r'\s+', ' ', node.text()).strip()
            fallback = noncommercial_link_fallback(original_url.path, label)
            if fallback and original_url.fragment not in BLOCK_IDS:
                attrs['href'] = fallback
                attrs.pop('target', None); attrs.pop('rel', None)
                LINK_ADAPTATIONS.append({'source': source, 'label': label, 'from': original_href,
                    'to': fallback, 'action': 'localized-noncommercial-topic'})
            elif original_url.fragment in BLOCK_IDS or COMMERCIAL_COPY.search(label) or COMMERCIAL_LINK_COPY.search(label):
                EXCLUDED.append({'source': source, 'panel': identifier or 'a', 'reason': 'commercial-link'})
                return ''
            else:
                # The target is commercial, but the visible label is public engineering content.
                # Keep the original layout and content while removing the commercial destination.
                attrs.pop('href', None); attrs.pop('target', None); attrs.pop('rel', None)
                attrs['data-cn-link-sanitized'] = 'commercial-destination'
                LINK_ADAPTATIONS.append({'source': source, 'label': label, 'from': original_href,
                    'to': None, 'action': 'preserved-unlinked-content'})
        elif original_url.scheme in {'tel', 'mailto', 'weixin', 'whatsapp'}:
            EXCLUDED.append({'source': source, 'panel': identifier or 'a', 'reason': 'commercial-link'})
            return ''
        else:
            href = link_url(original_href, source)
            if not href:
                # An unavailable destination must not erase its public image/text.
                return ''.join(render(child, source) for child in node.children)
            attrs['href'] = href
            attrs.pop('target', None); attrs.pop('rel', None)
            if href.startswith(('http:', 'https:')):
                attrs.update(target='_blank', rel='noopener noreferrer')
        # The international primary action is a commercial consultation link,
        # intentionally excluded on China's filed personal knowledge site.
        # Preserve the public case route as its single noncommercial primary
        # action, without recreating any diagnosis/booking sales CTA.
        if source == 'index.html' and re.sub(r'\s+', '', node.text()) == '查看代表案例' and attrs.get('href') == '/notes/':
            attrs['class'] = ' '.join(dict.fromkeys((attrs.get('class', '') + ' primary').split()))
        if attrs.get('href', '').startswith('/notes/#practice-'):
            return ''
    if tag == 'button':
        if re.fullmatch(r'(?:window\.)?print\(\);?', attrs.get('onclick', '').strip()):
            attrs['data-public-print'] = ''
        elif classes & {'share', 'share-button'}:
            attrs['data-public-share'] = ''
        elif 'data-plan-preview' in attrs or 'preview-open' in classes:
            pass  # Destination-owned public-content-interactions handles these.
        else:
            # Audited interactive viewers are retained as complete DOMs below.
            # Unknown source JS is not copied; do not emit a dead active button.
            tag = 'span'
            attrs.pop('type', None)
    if tag in {'img','source','video','track'}:
        for name in ('src', 'poster'):
            if attrs.get(name):
                mapped = media_url(attrs[name], source)
                if not mapped and name == 'src' and tag in {'img','source','track'}: return ''
                if mapped: attrs[name] = mapped
                else: attrs.pop(name, None)
        if attrs.get('srcset'):
            candidates = []
            for candidate in attrs['srcset'].split(','):
                pieces = candidate.strip().split()
                mapped = media_url(pieces[0], source) if pieces else ''
                if mapped: candidates.append(' '.join([mapped] + pieces[1:]))
            if candidates: attrs['srcset'] = ', '.join(candidates)
            else: attrs.pop('srcset', None)
    for name in ('data-src', 'data-original-src', 'data-plan-source', 'data-full-src'):
        if attrs.get(name):
            mapped = media_url(attrs[name], source)
            if mapped: attrs[name] = mapped
            else: attrs.pop(name, None)
    if tag in {'image', 'use'}:
        for name in ('href', 'xlink:href'):
            if attrs.get(name):
                mapped = media_url(attrs[name], source)
                if mapped: attrs[name] = mapped
                else: attrs.pop(name, None)
    if attrs.get('style'):
        attrs['style'] = declarations(attrs['style'], source)
        if not attrs['style']: attrs.pop('style')
    attrs = {key:value for key,value in attrs.items() if not key.lower().startswith('on')}
    text = ''.join(render(child, source) for child in node.children)
    if tag in {'a','nav'} and not text.strip(): return ''
    attributes = ''.join(' ' + key + ('' if value is None else '="' + html.escape(value, quote=True) + '"') for key,value in attrs.items())
    return '<' + tag + attributes + '>' + ('' if tag in VOID else text + '</' + tag + '>')

STYLE_CACHE = {}
KEYFRAMES = set()
SCOPE = ':where(main[data-cn-source-content])'
SHELL_EXCLUSION = ':not(:where(main[data-cn-source-content],main[data-cn-source-content] *))'
SHELL_STYLE_CACHE = {}
BODY_CLASSES = set()

def file_hash(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''): digest.update(block)
    return digest.hexdigest()

def media_digest(relative):
    if relative not in MEDIA_HASHES:
        MEDIA_HASHES[relative] = file_hash(ROOT / relative)
    return MEDIA_HASHES[relative]

def versioned_media_url(encoded, digest):
    """Serve the exact release-owned file from China with a content-hash cache key."""
    return '/assets/public-media/' + encoded + '?v=' + digest[:16]

def localize_media_references(value):
    """Migrate retained viewer media from the live proxy to this static release."""
    def local(match):
        relative = unquote(urlsplit('/' + html.unescape(match.group(1))).path).lstrip('/')
        if relative not in TRACKED or '..' in Path(relative).parts:
            raise RuntimeError('Untracked retained media: ' + relative)
        encoded = quote(relative, safe='/')
        MEDIA.add(encoded)
        return versioned_media_url(encoded, media_digest(relative))
    return re.sub(r'/(?:mirror-media|assets/public-media)/([^\s\x22\x27<>)]*)', local, value)

def main_markup(value):
    match = re.search(r'<main\b[^>]*>[\s\S]*?</main\s*>', value, re.I)
    if not match: raise RuntimeError('Page has no content main')
    return match.group(0)

def preserve_generated_page_heading(content, existing):
    """Keep the destination's public title when the source H1 lives outside <main>."""
    if re.search(r'<h1\b', content, re.I):
        return content
    old_main = main_markup(existing)
    hero = re.search(r'<section\b[^>]*class=[\x22\x27][^\x22\x27]*\bpage-hero\b[^\x22\x27]*[\x22\x27][^>]*>[\s\S]*?</section\s*>', old_main, re.I)
    return hero.group(0) + content if hero else content

def protected_dom(value):
    """Destination-owned shell remains byte-identical through this pass."""
    return {
        'header_sha256': hashlib.sha256(re.search(r'<header\b[\s\S]*?</header>', value, re.I).group(0).encode()).hexdigest(),
        'footer_sha256': hashlib.sha256(re.search(r'<footer\b[\s\S]*?</footer>', value, re.I).group(0).encode()).hexdigest(),
        'translator_resources': re.findall(r'<(?:script|link)\b[^>]*(?:cn-translate-baidu-v1\.(?:js|css))[^>]*>', value, re.I),
    }

def declarations(value, source, important=False):
    output = []
    for item in visual.split_css(value, ';'):
        prop, sep, content = item.partition(':')
        if not sep or not re.fullmatch(r'(?:--|-)?[A-Za-z][\w-]*', prop.strip()) or prop.strip().lower() in {'behavior','-moz-binding'} or re.search(r'javascript:|vbscript:|expression\s*\(', content, re.I): continue
        failed = False
        def replace(match):
            nonlocal failed
            url = media_url(match.group(1).strip().strip('\x22\x27'), source)
            if not url: failed = True
            return 'url("' + url + '")'
        content = re.sub(r'url\(\s*([^)]*)\)', replace, content, flags=re.I)
        if failed: continue
        # Source normal/important priority must survive. Destination rules are
        # excluded from this content, rather than promoting every source rule.
        if prop.strip().lower() in {'animation', 'animation-name'}:
            content = re.sub(r'(?<![\w-])([A-Za-z_][\w-]*)(?![\w-])', lambda match: 'cn-source-' + match.group(1) if match.group(1) in KEYFRAMES else match.group(1), content)
        if important and not prop.strip().startswith('--') and '!important' not in content.lower():
            content += '!important'
        output.append(prop.strip() + ':' + content)
    return ';'.join(output)

def body_conditions(compound):
    tail = compound[4:]
    # Only body-owned simple conditions are rewritten. Classes inside :has()
    # still describe actual descendants, rather than the original body.
    parts = re.match(r'((?:\.[\w-]+|\[[^\]]+\])*)([\s\S]*)', tail)
    direct, rest = parts.groups()
    direct = re.sub(r'\[(data-[\w-]+)(?=[\s~|^$*!=\]])', r'[data-cn-source-body-\1', direct)
    direct = re.sub(r'\.([A-Za-z_][\w-]*)', lambda match: '[data-cn-source-body-class~="' + match.group(1) + '"]', direct)
    return direct + rest + ':is(body,main)'

def source_selector(selector):
    """Keep source specificity; emulate source body state on its content root."""
    selector = selector.strip()
    # Current-module presentation depends on the real destination header.
    # A header cannot be a descendant of the cloned main; keep that condition
    # on body and localize both the header and content-link route selectors.
    header_state = re.fullmatch(r'html\s+body:has\(header a\[href="([^"]+)"\]\[aria-current="page"\]\)\s+(.+)', selector)
    if header_state:
        original, rest = header_state.groups()
        destination = link_url(original, 'index.html')
        if not destination:
            return ''
        def local_selector(match):
            mapped = link_url(match.group(1), 'index.html')
            return '[href="' + (mapped or match.group(1)) + '"]'
        rest = re.sub(r'\[href="([^"]+)"\]', local_selector, rest)
        return 'html body:has(header a[href="' + destination + '"][aria-current="page"]) ' + SCOPE + ' ' + rest
    compounds = visual.selector_compounds(selector)
    body = next((part for part in compounds if re.match(r'body(?:[^\w-]|$)', part[2])), None)
    # Shared reading-floor selectors group main with footer alternatives in
    # :is(). Attach that compound to the cloned root instead of looking for a
    # second main inside it; preserve the original :is() specificity.
    grouped_main = next((part for part in compounds
                         if part[2].startswith(':is(') and part[2].endswith(')')
                         and 'main' in [item.strip() for item in visual.split_css(part[2][4:-1], ',')]), None)
    if body and grouped_main and body[0] < grouped_main[0]:
        start, end, compound = grouped_main
        if not selector[body[1]:start].strip(' \t\r\n>'):
            return selector[:body[0]] + SCOPE + body_conditions(body[2]) + compound + selector[end:]
    main = next((part for part in compounds if re.match(r'main(?:[^\w-]|$)', part[2])), None)
    if main:
        start, end, compound = main
        if selector[end:].lstrip().startswith(('+', '~')): return ''
        root = 'main:where([data-cn-source-content])' + compound[4:]
        prefix = selector[:start]
        if body and body[0] < start and not selector[body[1]:start].strip(' \t\r\n>'):
            prefix = selector[:body[0]]
            pseudo = re.search(r'::[\w-]+|:(?:before|after|first-line|first-letter)(?![\w-])', root)
            offset = pseudo.start() if pseudo else len(root)
            root = root[:offset] + body_conditions(body[2]) + root[offset:]
        return prefix + root + selector[end:]
    if body:
        start, end, compound = body
        rest = selector[end:]
        if rest.lstrip().startswith(('+', '~')): return ''
        return selector[:start] + SCOPE + body_conditions(compound) + rest
    if compounds and re.match(r'(?:html|:root)(?:[^\w-]|$)', compounds[0][2]):
        start, end, compound = compounds[0]
        rest = selector[end:]
        if rest.lstrip().startswith(('+', '~')): return ''
        return SCOPE + rest
    if compounds:
        start, end, compound = compounds[0]
        first_class = re.match(r'\.([\w-]+)', compound)
        if first_class and first_class.group(1) in BODY_CLASSES:
            environment = body_conditions('body' + compound).removesuffix(':is(body,main)')
            return SCOPE + environment + selector[end:] + ',' + SCOPE + ' ' + selector
    return SCOPE + ' ' + selector if selector else ''

def inherited_root_declarations(value):
    # Body layout belongs to the destination shell. Carry its reading surface
    # and inherited type defaults into main, never viewport height/flex/padding.
    inherited = {'color','line-height','letter-spacing','word-spacing','direction','text-align',
                 'text-indent','text-transform','text-rendering','white-space','word-break',
                 'overflow-wrap','visibility','-webkit-text-fill-color'}
    return ';'.join(item for item in visual.split_css(value, ';')
                    if item.partition(':')[0].strip().startswith(('--','font','background'))
                    or item.partition(':')[0].strip().lower() in inherited)

def scope_css(content, source):
    output = []
    KEYFRAMES.update(re.findall(r'@(?:-webkit-)?keyframes\s+([\w-]+)', content))
    for prelude, body in visual.css_rules(content):
            if prelude.startswith('@'):
                name = re.match(r'@([\w-]+)', prelude)
                if body is not None and name and name.group(1).lower() in visual.CSS_GROUPS:
                    output.append(prelude + '{' + scope_css(body, source) + '}')
                elif body is not None and name and name.group(1).lower() == 'font-face':
                    output.append('@font-face{' + declarations(body, source, important=False) + '}')
                elif body is not None and name and name.group(1).lower() in {'keyframes', '-webkit-keyframes'}:
                    key = prelude.split()[-1]
                    frames = ''.join(frame + '{' + declarations(values, source, important=False) + '}' for frame, values in visual.css_rules(body) if values is not None)
                    output.append('@' + name.group(1) + ' cn-source-' + key + '{' + frames + '}')
                elif body is None and prelude.startswith('@import'):
                    match = re.search(r'url\(\s*[\x22\x27]?([^\x22\x27)\s]+)|[\x22\x27]([^\x22\x27]+)', prelude)
                    if match:
                        imported = copy_css(urljoin('/' + source, match.group(1) or match.group(2)))
                        if imported: output.append('@import url("' + imported + '");')
                continue
            if body is None: continue
            groups = {}
            for selector in visual.split_css(prelude, ','):
                compounds = visual.selector_compounds(selector)
                root_only = bool(compounds and (re.match(r'(?:html|body|:root)(?:[^\w-]|$)', compounds[-1][2]) or
                    (len(compounds) == 1 and re.match(r'\.([\w-]+)', compounds[0][2]) and re.match(r'\.([\w-]+)', compounds[0][2]).group(1) in BODY_CLASSES)))
                scoped = source_selector(selector)
                if scoped:
                    value = inherited_root_declarations(body) if root_only else body
                    groups.setdefault(declarations(value, source), []).append(scoped)
            for value, selectors in groups.items():
                if value: output.append(','.join(selectors) + '{' + value + '}')
    return '\n'.join(output)

def shell_selector(selector):
    if SHELL_EXCLUSION in selector: return selector
    compounds = visual.selector_compounds(selector)
    if not compounds: return ''
    start, end, compound = compounds[-1]
    pseudo = re.search(r'::[\w-]+|:(?:before|after|first-line|first-letter)(?![\w-])', compound)
    offset = start + pseudo.start() if pseudo else end
    return selector[:offset] + SHELL_EXCLUSION + selector[offset:]

def destination_css(content, source):
    output = []
    def rebase(match):
        value = match.group(1).strip().strip('\x22\x27')
        if value.startswith(('#','data:','/')) or urlsplit(value).scheme: return match.group(0)
        return 'url("' + urljoin('/' + source, value) + '")'
    for prelude, body in visual.css_rules(content):
        if prelude.startswith('@'):
            name = re.match(r'@([\w-]+)', prelude)
            kind = name.group(1).lower() if name else ''
            if body is not None and kind in visual.CSS_GROUPS:
                output.append(prelude + '{' + destination_css(body, source) + '}')
            elif body is None and kind == 'import':
                match = re.search(r'url\(\s*[\x22\x27]?([^\x22\x27)\s]+)[\x22\x27]?\s*\)|[\x22\x27]([^\x22\x27]+)[\x22\x27]', prelude)
                if match:
                    href = copy_destination_css(urljoin('/' + source, match.group(1) or match.group(2)))
                    if href: output.append(prelude[:match.start()] + 'url("' + href + '")' + prelude[match.end():] + ';')
            elif body is not None:
                output.append(prelude + '{' + re.sub(r'url\(\s*([^)]*)\)', rebase, body, flags=re.I) + '}')
            elif kind: output.append(prelude + ';')
            continue
        if body is None: continue
        selectors = [shell_selector(selector) for selector in visual.split_css(prelude, ',')]
        selectors = [selector for selector in selectors if selector]
        if selectors: output.append(','.join(selectors) + '{' + re.sub(r'url\(\s*([^)]*)\)', rebase, body, flags=re.I) + '}')
    return '\n'.join(output)

def copy_destination_css(value):
    parsed = urlsplit(value)
    if parsed.hostname and parsed.hostname not in {'qilylean.cn','www.qilylean.cn'}: return ''
    relative = unquote(parsed.path).lstrip('/')
    if '..' in Path(relative).parts: return ''
    if relative in SHELL_STYLE_CACHE: return SHELL_STYLE_CACHE[relative]
    original = CN / relative
    if not original.is_file() or original.suffix != '.css': return ''
    SHELL_STYLE_CACHE[relative] = ''
    target = CN / 'assets/destination-shell' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(destination_css(original.read_text(), relative), encoding='utf-8')
    digest = file_hash(target)
    href = '/assets/destination-shell/' + quote(relative, safe='/') + '?v=' + digest[:12]
    SHELL_STYLE_CACHE[relative] = href
    key = 'cn-site/' + relative
    STYLE_RECORDS['destination:' + key] = {'source': key, 'url': href, 'source_sha256': file_hash(original), 'sha256': digest, 'bytes': target.stat().st_size}
    return href

def destination_shell_styles(value, preserve_adapter=False):
    if preserve_adapter: return value
    def link(match):
        tag = match.group(0)
        if 'data-cn-source-css' in tag or 'cn-translate-baidu-v1.css' in tag or 'cn-sitewide-visual-parity-v1.css' in tag: return tag
        if not re.search(r'\brel=[\x22\x27]stylesheet', tag, re.I): return tag
        saved = re.search(r'\bdata-cn-destination-origin=[\x22\x27]([^\x22\x27]+)', tag)
        href = re.search(r'\bhref=[\x22\x27]([^\x22\x27]+)', tag)
        origin = html.unescape(saved.group(1) if saved else href.group(1)) if saved or href else ''
        # Sitewide China footer is shared shell CSS, not a cloned page stylesheet.
        if '/assets/cn-footer-actions-v1.css' in origin:
            tag = re.sub(r'\bhref=([\x22\x27])[^\x22\x27]+[\x22\x27]',
                         'href="/assets/cn-footer-actions-v1.css?v=20261023-cn-public-footer-source-v1"', tag, count=1)
            return re.sub(r'\s+data-cn-destination-origin=[\x22\x27][^\x22\x27]+[\x22\x27]', '', tag)
        mapped = copy_destination_css(origin)
        if not mapped: return tag
        tag = re.sub(r'\bhref=([\x22\x27])[^\x22\x27]+[\x22\x27]', 'href="' + html.escape(mapped, quote=True) + '"', tag, count=1)
        if not saved: tag = tag[:-1] + ' data-cn-destination-origin="' + html.escape(origin, quote=True) + '">'
        return tag
    value = re.sub(r'<link\b[^>]*>', link, value, flags=re.I)
    def inline(match):
        attrs, css = match.groups()
        if 'data-cn-source-css' in attrs: return match.group(0)
        return '<style' + attrs + '>' + destination_css(css, 'index.html') + '</style>'
    return re.sub(r'<style\b([^>]*)>([\s\S]*?)</style>', inline, value, flags=re.I)


def remove_duplicate_source_css_links(styles):
    """Keep the final copy of identical mirrored styles (same cascade end-state)."""
    seen = set()
    result = []
    for tag in reversed(styles):
        matched = re.search(r'<link\b[^>]*href=[\x22\x27]([^\x22\x27]+)', tag, re.I)
        if matched and 'data-cn-source-css' in tag:
            href = matched.group(1)
            if href in seen:
                continue
            seen.add(href)
        result.append(tag)
    return list(reversed(result))

class SourceStyles(HTMLParser):
    def __init__(self, value):
        super().__init__(convert_charrefs=False)
        self.items = []; self.style = None; self.skip = 0; self.feed(value)
    def handle_starttag(self, tag, attrs):
        if tag in {'script','noscript'}: self.skip += 1
        if self.skip: return
        attrs = dict(attrs)
        if tag == 'link' and 'stylesheet' in (attrs.get('rel') or '').split():
            self.items.append(('link', attrs, ''))
        elif tag == 'style': self.style = [attrs, []]
    def handle_endtag(self, tag):
        if tag in {'script','noscript'} and self.skip: self.skip -= 1
        if tag == 'style' and self.style:
            attrs, css = self.style; self.items.append(('style', attrs, ''.join(css))); self.style = None
    def handle_data(self, data):
        if self.style: self.style[1].append(data)

def copy_css(value):
    parsed = urlsplit(value)
    if parsed.hostname and parsed.hostname not in {'qilylean.com', 'www.qilylean.com', 'qilylean.cn', 'www.qilylean.cn'}: return ''
    relative = unquote(parsed.path).lstrip('/')
    if '..' in Path(relative).parts or relative not in TRACKED: return ''
    if relative in STYLE_CACHE: return STYLE_CACHE[relative]
    original = ROOT / relative
    if not original.is_file() or original.suffix != '.css': return ''
    href = '/assets/source-content/' + quote(relative, safe='/')
    STYLE_CACHE[relative] = ''  # Ignore circular @imports, as browsers do.
    target = CN / 'assets/source-content' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(scope_css(original.read_text(), relative), encoding='utf-8')
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    STYLE_CACHE[relative] = href + '?v=' + digest[:12]
    STYLE_RECORDS[relative] = {'source': relative, 'url': STYLE_CACHE[relative], 'source_sha256': file_hash(original), 'sha256': digest, 'bytes': target.stat().st_size}
    return STYLE_CACHE[relative]

def copy_daily_knowledge_runtime():
    """Copy only the existing public teaching enhancement, without its form/API."""
    source = ROOT / 'qilylean/daily-feedback.js'
    original = source.read_text()
    content = '(function(){\n\x27use strict\x27;\n' + original[original.index('/* QILY-KNOWLEDGE-ASSET-2.0'):]
    content = re.sub(r"^.*links\.push\([^\n]*/cooperation/[^\n]*\n", '', content, flags=re.M)
    content = content.replace('/knowledge/terminology.html?opl=', '/archive/knowledge/terminology/?opl=')
    content = content.replace('href="/projects/"', 'href="/notes/"').replace('href="/improvements/"', 'href="/archive/profile/tools/"')
    if re.search(r'fetch\s*\(|XMLHttpRequest|sendBeacon|/cooperation/|formsubmit|workers\.dev', content):
        raise RuntimeError('Public daily teaching adapter contains a conversion/API hook')
    target = CN / 'assets/source-content/daily-knowledge-enhancement.js'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    url = '/assets/source-content/' + target.name + '?v=' + file_hash(target)[:12]
    STYLE_RECORDS['daily-knowledge-runtime'] = {'source': 'qilylean/daily-feedback.js', 'url': url,
        'source_sha256': file_hash(source), 'sha256': file_hash(target), 'bytes': target.stat().st_size}
    return url

def main():
    MEDIA.clear(); MEDIA_HASHES.clear(); EXCLUDED.clear(); LINK_ADAPTATIONS.clear(); STYLE_CACHE.clear(); STYLE_RECORDS.clear(); KEYFRAMES.clear(); SHELL_STYLE_CACHE.clear()
    localized_adapters = {}
    for basename in ('public-terminology-interactions.css', 'public-terminology-interactions.js'):
        asset = CN / 'assets' / basename
        if not asset.is_file(): continue
        original = asset.read_text()
        localized = localize_media_references(original)
        if localized == original: continue
        asset.write_text(localized)
        href = '/assets/' + basename + '?v=' + file_hash(asset)[:12]
        localized_adapters[basename] = href
        STYLE_RECORDS['cn-site/assets/' + basename] = {'source': 'cn-site/assets/' + basename,
            'url': href, 'source_sha256': file_hash(asset), 'sha256': file_hash(asset), 'bytes': asset.stat().st_size}
    candidates = {item.path.as_posix(): (item.url, None) for item in mirror.SOURCES if item.out.is_file()}
    candidates.update(PRIMARY)
    candidates['moments/index.html'] = ('/archive/records/', 'trust')
    BODY_CLASSES.clear()
    for name in candidates:
        source_path = ROOT / name
        if source_path.is_file():
            body = re.search(r'<body\b[^>]*\bclass=[\x22\x27]([^\x22\x27]+)', source_path.read_text())
            if body: BODY_CLASSES.update(body.group(1).split())
    records = []
    about = CN / 'about/index.html'
    contact_sha = hashlib.sha256(main_markup(about.read_text()).encode()).hexdigest()
    for name, (url, current) in candidates.items():
        source_path = ROOT / name
        target = CN / url.lstrip('/') / 'index.html' if url.endswith('/') else CN / url.lstrip('/')
        if not source_path.is_file() or not target.is_file(): continue
        old = target.read_text()
        for basename, href in localized_adapters.items():
            old = re.sub(r'/assets/' + re.escape(basename) + r'(?:\?[^\s\x22\x27<>]*)?', href, old)
        # These source-backed interactive viewers have explicit audited adapters;
        # keep their working DOM/runtime rather than flattening them to HTML.
        adapter = re.search(r'data-cn-public-kind="([^"]+)"', old)
        preserve_directory = name == 'links/index.html' and 'data-qily-public-tech-directory="v2"' in old
        preserve_adapter = preserve_directory or bool(adapter and (adapter.group(1) in {'terminology', 'reference-viewer', 'pdf', 'knowledge-entry', 'brief-index'} or name.startswith('qilylean/reference-')))
        raw = source_path.read_text()
        match = re.search(r'<main\b([^>]*)>([\s\S]*?)</main\s*>', raw, re.I)
        fragment = source_fragment(raw, name)
        content = render(Tree(fragment).root, name) if not preserve_adapter else None
        if content is not None:
            content = preserve_generated_page_heading(content, old)
            if name == 'projects/index.html':
                # Preserve existing China project bookmarks on the shared cards.
                project_ids = iter(('automotive-lean', 'smed-300t', 'mold-warehouse',
                                    'fuse-improvement', 'factory-layout', 'digital-factory',
                                    'visual-management', 'evidence'))
                content = re.sub(r'<article class="module-card project-list-card',
                                 lambda _: '<article id="practice-' + next(project_ids) + '" class="module-card project-list-card',
                                 content)
        style_tags = []
        head = re.search(r'<head\b[^>]*>([\s\S]*?)</head>', raw, re.I)
        for kind, style_attrs, css in SourceStyles(head.group(1) if head else '').items:
            if kind == 'link':
                local = copy_css(urljoin('/' + name, style_attrs.get('href', '')))
                if local: style_tags.append('<link rel="stylesheet" data-cn-source-css="v1" href="' + local + '">')
            elif not any(token in style_attrs.get('id', '') for token in ('Critical', 'FirstPaint', 'Dock')):
                style_tags.append('<style data-cn-source-css="v1">' + scope_css(css, name) + '</style>')
        # The source navigation wrapper supplies these public content styles
        # after loading. Materialize them, without running its navigation code.
        if '/site-navigation.js' in raw:
            settled = ['site-interaction-continuity-v1.css', 'site-visual-governance-v2.css',
                       'site-content-axis-v1.css', 'site-header-axis-v1.css', 'site-floating-dock-standard-v1.css']
            if name == 'index.html': settled.append('site-home-hero-tune-v1.css')
            if name == 'capabilities/index.html': settled.append('pure-ddz-capability-visual-v2.css')
            for relative in settled:
                local = copy_css('/' + relative)
                # The source runtime reuses existing stylesheet nodes. Moving
                # governance after readability changes equal-specificity type
                # rules (for example a 20px body paragraph becomes 19.5px).
                if local and not any('href="' + local + '"' in tag for tag in style_tags):
                    style_tags.append('<link rel="stylesheet" data-cn-source-css="v1" href="' + local + '">')
        # R8's presentation runtime settles this exact stylesheet last on COM.
        # Materialize that final cascade without importing its shell runtime.
        if 'qilyVisualAuthorityR8' in raw:
            authority = copy_css('/site-visual-authority-r8.css')
            if authority: style_tags.append('<link rel="stylesheet" data-cn-source-css="v1" href="' + authority + '">')
        attrs = Tree('<main' + (match.group(1) if match else '') + '></main>').root.children[0].attrs
        attrs = {key: value for key, value in attrs.items() if key != 'id' and not key.lower().startswith('on')}
        original_body = re.search(r'<body\b([^>]*)>', raw)
        source_body = Tree('<body' + (original_body.group(1) if original_body else '') + '></body>').root.children[0].attrs
        if name == 'index.html' and 'qily-home-conversion-hero' in fragment:
            source_body['data-qily-home-conversion'] = 'v1'
        attrs['data-cn-source-body-class'] = source_body.get('class', '')
        attrs['data-cn-source-scrollbar-gutter'] = 'stable' if '/site-closure-bundle-v24.css' in raw else 'auto'
        if 'qilyViV4Formal' in raw:
            attrs['data-cn-source-body-data-qily-vi-shell'] = 'v4-formal'
        old_body = re.search(r'<body\b([^>]*)>', old)
        layout = re.search(r'data-qily-daily-layout=[\x22\x27]([^\x22\x27]+)', old_body.group(1) if old_body else '')
        if layout: attrs['data-cn-source-body-data-qily-daily-layout'] = layout.group(1)
        for key, value in source_body.items():
            if key.startswith('data-'): attrs['data-cn-source-body-' + key] = value
        if attrs.get('style'): attrs['style'] = declarations(attrs['style'], name)
        main_attrs = ''.join(' ' + key + ('' if value is None else '="' + html.escape(value, quote=True) + '"') for key, value in attrs.items())
        replacement = '<main id="main" data-cn-source-content="' + html.escape(name, quote=True) + '"' + main_attrs + '>' + content + '</main>' if content is not None else main_markup(old)
        replacement = localize_media_references(replacement)
        replacement = '\n'.join(line.rstrip() for line in replacement.split('\n'))
        # Audited interactive adapters retain their DOM, including image/PDF/Qly
        # references. Their actual media must enter the same strict byte ledger.
        for encoded in re.findall(r'/(?:mirror-media|assets/public-media)/([^\s\x22\x27<>)]*)', replacement):
            path = quote(unquote(urlsplit('/' + html.unescape(encoded)).path.lstrip('/')), safe='/')
            if path: MEDIA.add(path)
        updated = re.sub(r'<main\b[^>]*>[\s\S]*?</main\s*>', lambda _: replacement, old, count=1, flags=re.I)
        # Repeated materialization replaces its own assets rather than stacking
        # duplicate styles, handlers or body attributes on every deployment.
        updated = re.sub(r'<link\b[^>]*data-cn-source-css=[\x22\x27][^\x22\x27]*[\x22\x27][^>]*>', '', updated, flags=re.I)
        updated = re.sub(r'<style\b[^>]*data-cn-source-css=[\x22\x27][^\x22\x27]*[\x22\x27][^>]*>[\s\S]*?</style>', '', updated, flags=re.I)
        updated = re.sub(r'<script\b[^>]*data-cn-source-actions=[\x22\x27][^\x22\x27]*[\x22\x27][^>]*>[\s\S]*?</script>', '', updated, flags=re.I)
        updated = destination_shell_styles(updated, preserve_adapter)
        # A legacy 2026-10-15 CN link points to a file never published on this
        # domain. The live server returns 404; removing this unused reference
        # avoids a render-blocking network failure without changing pixel styles.
        # The international site retains its own V5 stylesheet unchanged.
        if name == 'index.html' and not (CN / 'site-visual-readability-v5.css').is_file():
            updated = re.sub(r'<link\b(?=[^>]*\bid=[\x22\x27]qilyVisualReadabilityV5Stylesheet[\x22\x27])[^>]*>', '', updated, flags=re.I)
        # Preserve the destination's audited preview/print/share implementation,
        # refreshing its digest after the generator has materialized the runtime.
        runtime_tags = []
        if '/qilylean/daily-feedback.js' in raw:
            runtime_tags.append('<script defer data-cn-source-actions="v1" src="' + copy_daily_knowledge_runtime() + '"></script>')
        for extension in ('css', 'js'):
            asset = CN / ('assets/public-content-interactions.' + extension)
            if not asset.is_file(): raise RuntimeError('Missing public interaction adapter: ' + str(asset))
            url_asset = '/assets/' + asset.name + '?v=' + file_hash(asset)[:12]
            updated = re.sub(r'<link\b[^>]*href=[\x22\x27]/assets/public-content-interactions\.css[^>]*>', '', updated, flags=re.I)
            updated = re.sub(r'<script\b[^>]*src=[\x22\x27]/assets/public-content-interactions\.js[^>]*>[\s\S]*?</script>', '', updated, flags=re.I)
            if extension == 'css': style_tags.append('<link rel="stylesheet" data-cn-source-css="v1" href="' + url_asset + '">')
            else: runtime_tags.append('<script defer data-cn-source-runtime="v1" src="' + url_asset + '"></script>')
            STYLE_RECORDS['cn-site/assets/' + asset.name] = {'source': 'cn-site/assets/' + asset.name, 'url': url_asset, 'source_sha256': file_hash(asset), 'sha256': file_hash(asset), 'bytes': asset.stat().st_size}
        style_tags = remove_duplicate_source_css_links(style_tags)
        updated = updated.replace('</head>', ''.join(style_tags) + '</head>', 1)
        updated = updated.replace('</body>', ''.join(runtime_tags) + '</body>', 1)
        updated = re.sub(r'\sdata-cn-source-parity=[\x22\x27][^\x22\x27]*[\x22\x27]', '', updated)
        updated = updated.replace('<body', '<body data-cn-source-parity="v1"', 1)
        if 'qilyViV4Formal' in raw:
            updated = re.sub(r'\sdata-qily-vi-version=[\x22\x27][^\x22\x27]*[\x22\x27]', '', updated, count=1)
            updated = updated.replace('<html', '<html data-qily-vi-version="4.0"', 1)
        updated = '\n'.join(line.rstrip() for line in updated.split('\n'))
        assert protected_dom(old) == protected_dom(updated), 'Destination shell changed: ' + name
        target.write_text(updated)
        records.append({'source': name, 'url': url, 'source_html_sha256': file_hash(source_path),
                        'source_runtime_sha256': {row['source']: row['sha256'] for row in source_runtime_records(raw, name)},
                        'main_sha256': hashlib.sha256(replacement.encode()).hexdigest(),
                        'inline_css_sha256': hashlib.sha256('\n'.join(re.findall(r'<style\b[^>]*data-cn-source-css=[\x22\x27][^\x22\x27]*[\x22\x27][^>]*>([\s\S]*?)</style>', updated, re.I)).encode()).hexdigest(),
                        'mode': 'audited-interactive-adapter' if preserve_adapter else 'source-main',
                        'adapter': 'public-tech-directory' if preserve_directory else adapter.group(1) if preserve_adapter else None,
                        'protected': protected_dom(updated),
                        'images': len(re.findall(r'<img\b', replacement)), 'videos': len(re.findall(r'<video\b', replacement))})
    manifest = CN / 'archive/media-manifest.txt'
    original_media = set(manifest.read_text().splitlines()) if manifest.is_file() else set()
    manifest.write_text('\n'.join(sorted(MEDIA | original_media)) + '\n')
    media_records = []
    missing = [encoded for encoded in sorted(MEDIA) if not (ROOT / unquote(encoded)).is_file()]
    if missing: raise RuntimeError('Missing original public assets (' + str(len(missing)) + '): ' + ', '.join(missing))
    for encoded in sorted(MEDIA):
        relative = unquote(encoded)
        original = ROOT / relative
        digest = media_digest(relative)
        delivery = CN / 'assets/public-media' / relative
        delivery.parent.mkdir(parents=True, exist_ok=True)
        if not delivery.is_file() or delivery.stat().st_size != original.stat().st_size or file_hash(delivery) != digest:
            shutil.copyfile(original, delivery)
        assert file_hash(delivery) == digest, 'Static China media differs: ' + relative
        media_records.append({'source': relative, 'url': versioned_media_url(encoded, digest), 'sha256': digest, 'bytes': original.stat().st_size})
    assert hashlib.sha256(main_markup(about.read_text()).encode()).hexdigest() == contact_sha, 'About/contact DOM changed'
    destination_assets = []
    about_html = about.read_text()
    for basename in ('cn-translate-baidu-v1.js', 'cn-translate-baidu-v1.css', 'cn-footer-actions-v1.js', 'cn-footer-actions-v1.css', 'cn-nav-rail-v1.js', 'qilylean-vi-v2.css', 'cn-sitewide-visual-parity-v1.css', 'mps-beian.png', 'site-native-prefetch-v1.js'):
        asset = CN / 'assets' / basename
        match_asset = re.search(r'(?:src|href)=[\x22\x27](/assets/' + re.escape(basename) + r'[^\x22\x27]*)', about_html)
        if not asset.is_file() or not match_asset: raise RuntimeError('Protected destination asset missing: ' + basename)
        destination_assets.append({'source': 'cn-site/assets/' + basename, 'url': html.unescape(match_asset.group(1)), 'sha256': file_hash(asset), 'bytes': asset.stat().st_size})
    for url_asset in sorted(set(visual.CN_BRAND_MEDIA.values())):
        asset = CN / unquote(urlsplit(url_asset).path).lstrip('/')
        if not asset.is_file(): raise RuntimeError('China aircraft asset missing: ' + url_asset)
        destination_assets.append({'source': asset.relative_to(ROOT).as_posix(), 'url': url_asset, 'sha256': file_hash(asset), 'bytes': asset.stat().st_size})
    (CN / 'archive/source-content-parity.json').write_text(json.dumps({'version': VERSION, 'pages': records, 'styles': list(STYLE_RECORDS.values()), 'excluded_panels': EXCLUDED, 'link_adaptations': LINK_ADAPTATIONS, 'media_files': media_records,
        'source_runtimes': source_runtime_records((ROOT / 'index.html').read_text(), 'index.html'),
        'destination_assets': destination_assets, 'protected': {'about_main_sha256': contact_sha, 'about_shell': protected_dom(about_html)}, 'media': sorted(MEDIA)}, ensure_ascii=False, indent=2))
    print(f'Source content parity: {len(records)} pages; {len(MEDIA)} original media paths; {len(EXCLUDED)} commercial panels excluded; {len(LINK_ADAPTATIONS)} commercial-target links safely localized or preserved as non-clickable content')

if __name__ == '__main__': main()
