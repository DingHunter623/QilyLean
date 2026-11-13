#!/usr/bin/env python3
"""Verify the approved hometown article on the actual China production host."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import time
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.styles = []
        self.scripts = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            href = attrs.get('href', '')
            if '/assets/cn-hometown-' in href:
                self.styles.append(href)
        if tag == 'script' and '/assets/cn-hometown-' in attrs.get('src', ''):
            self.scripts.append(attrs['src'])


def extract(text, pattern):
    matches = re.findall(pattern, text, re.I)
    assert len(matches) == 1, ('Expected one content block', pattern, len(matches))
    return matches[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='https://qilylean.cn')
    parser.add_argument('--source-base', default='https://qilylean.com')
    parser.add_argument('--expected-sha', default=os.environ.get('GITHUB_SHA'), required=not os.environ.get('GITHUB_SHA'))
    parser.add_argument('--output', default='hometown-production-evidence/http.json')
    args = parser.parse_args()
    evidence = {'expectedSourceCommit': args.expected_sha, 'responses': [], 'passed': False}

    def fetch(base, route):
        url = urljoin(base.rstrip('/') + '/', route.lstrip('/'))
        last = None
        for attempt in range(3):
            try:
                request = Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'QilyLean-Hometown-Production-Acceptance/1.0'})
                with urlopen(request, timeout=30) as response:
                    assert response.status == 200 and urlsplit(response.url).netloc == urlsplit(base).netloc, ('Unexpected response', url, response.status, response.url)
                    data = response.read()
                    evidence['responses'].append({'url': url, 'status': response.status, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'cacheControl': response.headers.get('Cache-Control')})
                    return data
            except Exception as error:
                last = error
                if attempt < 2:
                    time.sleep(2)
        raise RuntimeError('Production fetch failed: ' + url) from last

    def release():
        data = json.loads(fetch(args.base, '/meta/cn-content-release.json?acceptance=' + args.expected_sha))
        assert data['sourceCommit'] == args.expected_sha, ('Unexpected production commit', data)
        return data

    try:
        evidence['releaseBefore'] = release()
        route = '/links/hometown-manufacturing/'
        expected = (ROOT / 'cn-site/links/hometown-manufacturing/index.html').read_text()
        source = (ROOT / 'links/hometown-manufacturing/index.html').read_text()
        actual = fetch(args.base, route).decode('utf-8')
        international = fetch(args.source_base, route).decode('utf-8')
        main_pattern = r'(<main\b[\s\S]*?</main>)'
        assert extract(actual, main_pattern) == extract(expected, main_pattern), 'Production article differs from the candidate'
        assert extract(actual, main_pattern).replace('href="/resources/"', 'href="/links/"') == extract(international, main_pattern) == extract(source, main_pattern), 'Published international article is not the exact China content source'
        for identity in ('qilyHometownManufacturingPaperStyles', 'qilyHometownManufacturingRefinementV1'):
            pattern = r'(<style\b[^>]*id="' + identity + r'"[^>]*>[\s\S]*?</style>)'
            assert extract(actual, pattern) == extract(expected, pattern) == extract(international, pattern), identity
        assert '<link rel="canonical" href="https://qilylean.cn' + route + '">' in actual, 'China canonical missing'
        assert '湘ICP备2026041143号-1' in actual and '湘公网安备43020002000443号' in actual, 'China filings missing'
        styles = Links(expected).styles
        assert styles and Links(actual).styles == styles, 'Dedicated source stylesheet URLs differ'
        scripts = Links(expected).scripts
        assert Links(actual).scripts == scripts, 'Dedicated source runtime URLs differ'
        for src in scripts:
            assert fetch(args.base, src) == (ROOT / 'cn-site' / urlsplit(src).path.lstrip('/')).read_bytes(), ('Production source runtime bytes differ', src)
        checked_media = set()
        for href in styles:
            content = fetch(args.base, href)
            assert content == (ROOT / 'cn-site' / urlsplit(href).path.lstrip('/')).read_bytes(), ('Production stylesheet bytes differ', href)
            for media in re.findall(r'url\([\s\"\']*(/assets/hometown-source-media/[^)\s\"\']+)', content.decode('utf-8')):
                if media not in checked_media:
                    checked_media.add(media)
                    assert fetch(args.base, media) == (ROOT / 'cn-site' / urlsplit(media).path.lstrip('/')).read_bytes(), ('Source media bytes differ', media)
        directory = fetch(args.base, '/resources/').decode('utf-8')
        local_directory = (ROOT / 'cn-site/resources/index.html').read_text()
        directory_styles = Links(local_directory).styles
        assert directory_styles and Links(directory).styles == directory_styles, 'Resource card source stylesheet URLs differ'
        for href in directory_styles:
            assert fetch(args.base, href) == (ROOT / 'cn-site' / urlsplit(href).path.lstrip('/')).read_bytes(), ('Production resource stylesheet bytes differ', href)
        card_pattern = r'(<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START -->[\s\S]*?<!-- QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:END -->)'
        assert extract(directory, card_pattern) == extract(local_directory, card_pattern), 'Production resource entry differs'
        assert directory.count('href="/links/hometown-manufacturing/"') == 1, 'Article entry missing or duplicated'
        assert directory.index('QILY-CHINA-KNOWLEDGE-BRIDGE:END') < directory.index('QILY-HOMETOWN-MANUFACTURING-KNOWLEDGE:START') < directory.index('QILY-ELECTRICAL-REFERENCES:START'), 'Resource module order differs'
        assert fetch(args.base, '/sitemap.xml').decode('utf-8').count('https://qilylean.cn' + route) == 1, 'Production sitemap entry missing or duplicated'
        evidence['releaseAfter'] = release()
        evidence['passed'] = True
        print('PASS: production article, original SVGs, source CSS/media bytes, resource entry, filings, sitemap and release SHA')
    except Exception as error:
        evidence['error'] = repr(error)
        raise
    finally:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
