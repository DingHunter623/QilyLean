#!/usr/bin/env python3
"""Regression gate for the CN curated-brief renderer and generated corpus.

Run after materialize-brief-visual-parity.py. Uses only the Python standard
library, matching the production materialization environment.
"""
from __future__ import annotations

import importlib.util
import re
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

SCRIPT=Path(__file__).with_name("materialize-brief-visual-parity.py")
sys.dont_write_bytecode=True
SPEC=importlib.util.spec_from_file_location("cn_brief_visuals",SCRIPT)
visual=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(visual)


class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.nodes=[];self.feed(text)

    def handle_starttag(self,tag,attrs):
        self.nodes.append((tag,dict(attrs)))

    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)


def assert_scoped_css(css):
    """Every selector must contain a top-level main anchor, not just :has(main)."""
    count=0
    for prelude,body in visual.css_rules(css):
        if prelude.startswith("@"):
            if body is not None:
                count+=assert_scoped_css(body)
            else:
                assert prelude.startswith('@import url("/assets/brief-visual-source/'),prelude
            continue
        for selector in visual.split_css(prelude,","):
            compounds=visual.selector_compounds(selector)
            anchored=[x for x in compounds if x[2].startswith(visual.CONTENT_SCOPE)]
            assert anchored,f"Unscoped source CSS: {selector}"
            # A sibling after main could reach a footer outside the content tree.
            after=selector[anchored[0][1]:]
            assert not re.search(r"^[\s]*[+~]",after),selector
            count+=1
    return count


class RendererRegression(unittest.TestCase):
    def test_dense_tables_get_keyboard_scroll_regions(self):
        source='<section><table class="rule-table"><tr><td>CT</td></tr></table></section>'
        result=visual.contain_brief_tables(source)
        self.assertIn('role="region" tabindex="0"',result)
        self.assertIn('aria-label="表格，可左右滚动"',result)
        self.assertIn('<table class="rule-table"><tr><td>CT</td></tr></table></div>',result)
        self.assertEqual(result.count('qily-brief-table-scroll'),1)

    def test_body_main_and_function_selectors(self):
        scope=visual.CONTENT_SCOPE
        cases={
            ':root':scope,
            'html body.qily-knowledge-brief-page .module-card':
                'html body.qily-knowledge-brief-page '+scope+' .module-card',
            'body.daily-single-page[data-qily-daily-layout="rich"] main.page-shell':
                'body.daily-single-page[data-qily-daily-layout="rich"] '+scope+'.page-shell',
            '.daily-single-page main:has(> article[id="2026-08-25"])':
                '.daily-single-page '+scope+':has(> article[id="2026-08-25"])',
            'body:has(main) .diagram:is(.a,.b)':
                'body:has(main) '+scope+' .diagram:is(.a,.b)',
        }
        for original,expected in cases.items():
            with self.subTest(selector=original):
                self.assertEqual(visual.scope_selector(original),expected)
        self.assertEqual(visual.scope_selector('main + footer'),"")
        self.assertEqual(visual.scope_selector('body ~ .footer'),"")

    def test_nested_css_and_custom_properties(self):
        original='''/* source layout */
          :root{--ink:#173f49}
          @media(max-width:700px){
            .w8 .loop:is(.a,.b){grid-template-columns:1fr;gap:12px}
            .w8 .arrow::after{content:"};,→"}
          }
          @supports(display:grid){body.daily-single-page main.page-shell{display:grid}}
        '''
        result=visual.scope_stylesheet(original)
        self.assertIn('grid-template-columns:1fr;gap:12px',result)
        self.assertIn('content:"};,→"',result)
        self.assertIn('--ink:#173f49',result)
        self.assertEqual(assert_scoped_css(result),4)

    def test_safe_visual_inline_styles_and_html5_date_ids(self):
        parser=visual.VisualSanitizer('qilylean/daily/2026-10-11.html')
        parser.feed('<article id="2026-08-25"><div style="display:grid;grid-template-columns:1fr 2fr;--ink:#123;overflow-x:auto;-webkit-overflow-scrolling:touch" aria-labelledby="heading">Layout</div></article>')
        result="".join(parser.parts)
        self.assertIn('id="2026-08-25"',result)
        self.assertIn('grid-template-columns:1fr 2fr',result)
        self.assertIn('-webkit-overflow-scrolling:touch',result)
        self.assertIn('aria-labelledby="heading"',result)

    def test_active_css_and_html_are_rejected(self):
        result=visual.safe_declarations('color:red;behavior:url(evil.htc);-moz-binding:url(evil.xml);width:expression(alert(1));background:url(https://evil.test/track.png);border:1px solid blue')
        self.assertEqual(result,'color:red;border:1px solid blue')
        result=visual.scope_stylesheet('@import url("https://evil.test/a.css");@font-face{font-family:evil;src:url(https://evil.test/a.woff)}.box{color:red}')
        self.assertNotIn('evil',result)
        self.assertEqual(assert_scoped_css(result),1)
        parser=visual.VisualSanitizer()
        parser.feed('<script>alert(1)</script><iframe src="https://evil.test"></iframe><form>private</form><p onclick="alert(1)"><a href="javascript:alert(1)">Read</a></p>')
        result="".join(parser.parts)
        self.assertEqual(result,'<p><a>Read</a></p>')
        with self.assertRaises(RuntimeError):
            visual.sanitize_main('<svg><script>alert(1)</script></svg>')

    def test_local_navigation_preserves_context(self):
        base='qilylean/daily/2026-09-28.html'
        self.assertEqual(visual.rewrite_brief_href('/qilylean/daily-insights.html'),'/briefs/')
        self.assertEqual(visual.rewrite_brief_href('https://qilylean.com/qilylean/daily-insights.html?theme=plan#recent'),'/briefs/?theme=plan#recent')
        self.assertEqual(visual.rewrite_brief_href('2026-09-23.html?mode=read#section-2',base),'/briefs/archive/2026-09-23/?mode=read#section-2')
        self.assertEqual(visual.rewrite_brief_href('#section-2',base),'#section-2')
        self.assertEqual(visual.rewrite_brief_href('/qilylean/assets/daily-2023-03-24.svg'),'/mirror-media/qilylean/assets/daily-2023-03-24.svg')

    def test_source_pseudo_banner_has_no_fixed_issue_date(self):
        result=visual.scope_stylesheet((visual.ROOT/'qilylean/knowledge-brief.css').read_text(encoding='utf-8'),'qilylean/knowledge-brief.css')
        self.assertNotIn('2026-09-04',result)
        self.assertNotIn('padding-top:184px',result)
        self.assertNotRegex(result,r'main[^{}]*\[data-qily-knowledge-brief\]::(?:before|after)')
        self.assertIn('.knowledge-brief-hero',result)

    def test_css_only_source_banner_gets_real_heading(self):
        content='<article class="post w8"><div class="date">2026-08-25｜精益改善与八大浪费</div><h2>八大浪费</h2></article>'
        result=visual.ensure_brief_heading(content,Path('qilylean/daily/2026-08-25.html'))
        self.assertIn('<h1>精选简报</h1>',result)
        self.assertIn('<p>2026-08-25｜精益改善与八大浪费</p>',result)
        self.assertTrue(result.endswith(content))
        self.assertEqual(visual.ensure_brief_heading('<h1>已有标题</h1>',Path('2026-09-28.html')),'<h1>已有标题</h1>')

    def test_standalone_brief_has_no_second_css_banner(self):
        base='qilylean/daily-brief-unified-layout-v2.css'
        css=visual.scope_stylesheet((visual.ROOT/base).read_text(encoding='utf-8'),base)
        self.assertNotIn('height:184px',css)
        self.assertNotIn('top:112px',css)
        self.assertNotIn('top:98px',css)
        self.assertNotRegex(css,r'main[^{}]*:has\(>article\[id="2026-08-25"\]\)::(?:before|after)')
        self.assertNotRegex(css,r'article\[id="2026-08-25"\]>.date\s*\{')
        self.assertIn('article[id="2026-08-25"]>.hero',css)

    def test_shared_nonbrief_sanitizer_keeps_three_value_api(self):
        text='<article><h2>制造工程方法</h2><p>'+('现场事实、工程标准、改善验证。'*15)+'</p></article>'
        content,svg_count,visual_nodes=visual.sanitize_main(text)
        self.assertIn('制造工程方法',content)
        self.assertEqual(svg_count,0)


def validate_generated_corpus():
    briefs=[s for s in visual.source.SOURCES if visual.source.is_date_brief(s.path)]
    assert len(briefs)>=350,"Incomplete curated-brief source set"
    routes={s.url for s in briefs}
    counts={"pages":0,"svg":0,"images":0,"stylesheets":0,"scoped_selectors":0,"inline_styles":0}
    css_root=visual.CN/'assets/brief-visual-source'
    for path in css_root.rglob('*.css'):
        css=path.read_text(encoding='utf-8')
        counts['scoped_selectors']+=assert_scoped_css(css)
        counts['stylesheets']+=1
        assert 'url("https://' not in css and 'url(https://' not in css,path
    assert counts['stylesheets']>=len(visual.CSS_SET)
    for src in briefs:
        original=(visual.ROOT/src.path).read_text(encoding='utf-8')
        generated=src.out.read_text(encoding='utf-8')
        source_main=re.search(r'<main\b[^>]*>([\s\S]*?)</main\s*>',original,re.I).group(1)
        rendered_main=re.search(r'<main\b[^>]*>([\s\S]*?)</main\s*>',generated,re.I).group(1)
        original_page=Page(source_main);page=Page(generated);main_page=Page(rendered_main)
        main=[attrs for tag,attrs in page.nodes if tag=='main']
        assert len(main)==1 and main[0].get('data-qily-brief-content')=='v2',src.path
        assert sum(tag=='h1' for tag,attrs in main_page.nodes)==1,(src.path,'brief must have one real h1')
        table_count=sum(tag=='table' for tag,attrs in main_page.nodes)
        scroll_count=sum(tag=='div' and attrs.get('class')=='qily-brief-table-scroll' for tag,attrs in main_page.nodes)
        assert table_count==scroll_count,(src.path,'table scroll containment missing')
        # Legacy issue IDs drive special layouts via :has() and must survive.
        original_ids={attrs['id'] for tag,attrs in original_page.nodes if tag=='article' and attrs.get('id')}
        generated_ids={attrs['id'] for tag,attrs in main_page.nodes if tag=='article' and attrs.get('id')}
        assert original_ids<=generated_ids,(src.path,original_ids-generated_ids)
        expected_svg=len(re.findall(r'<svg\b',source_main,re.I))
        actual_svg=len(re.findall(r'<svg\b',rendered_main,re.I))
        assert expected_svg==actual_svg,(src.path,'inline diagram lost')
        counts['svg']+=actual_svg
        expected_images=[visual.local_media(attrs.get('src','')) for tag,attrs in original_page.nodes if tag=='img']
        expected_images=[url for url in expected_images if url]
        actual_images=[attrs.get('src','') for tag,attrs in main_page.nodes if tag=='img']
        assert expected_images==actual_images,(src.path,'source diagram/image changed')
        counts['images']+=len(actual_images)
        original_times=[attrs['datetime'] for tag,attrs in original_page.nodes if tag=='time' and attrs.get('datetime')]
        generated_times=[attrs['datetime'] for tag,attrs in main_page.nodes if tag=='time' and attrs.get('datetime')]
        assert original_times==generated_times,(src.path,'issue metadata changed')
        canonicals=[attrs.get('href') for tag,attrs in page.nodes if tag=='link' and attrs.get('rel')=='canonical']
        assert canonicals==['https://qilylean.cn'+src.url],src.path
        for tag,attrs in main_page.nodes:
            href=attrs.get('href','');parsed=urlparse(href)
            assert not re.match(r'/qilylean/daily(?:/|-insights)',parsed.path),(src.path,href)
            if parsed.path.startswith('/briefs/archive/'):
                assert parsed.path in routes,(src.path,'missing issue route',href)
            assert not tag in visual.VisualSanitizer.skip_tags,(src.path,tag)
            assert not any(key.lower().startswith('on') for key in attrs),(src.path,attrs)
            if 'style' in attrs:counts['inline_styles']+=1
        for block in re.findall(r'<style\b[^>]*data-qily-brief-source-style="v2"[^>]*>([\s\S]*?)</style>',generated,re.I):
            counts['scoped_selectors']+=assert_scoped_css(block)
        counts['pages']+=1
    # These issues previously lost all of their authored layout styles.
    for date,selector in [('2026-08-14','.brief-highlight-grid'),('2026-08-19','.lean-delivery-brief .mindmap'),('2026-08-25','.w8 .loop')]:
        path=visual.CN/'briefs/archive'/date/'index.html'
        text=path.read_text(encoding='utf-8')
        blocks=''.join(re.findall(r'<style\b[^>]*data-qily-brief-source-style="v2"[^>]*>([\s\S]*?)</style>',text,re.I))
        assert visual.CONTENT_SCOPE+' '+selector in blocks,(date,'authored visual stylesheet missing')
    text=(visual.CN/'briefs/archive/2026-10-11/index.html').read_text(encoding='utf-8')
    assert 'overflow-x:auto;-webkit-overflow-scrolling:touch' in text,'latest issue table scroll lost'
    assert counts['inline_styles']>=3,'latest issue visual inline declarations lost'
    print('CN brief visual regression passed: '+', '.join(f'{value} {key}' for key,value in counts.items()))


if __name__=='__main__':
    suite=unittest.defaultTestLoader.loadTestsFromTestCase(RendererRegression)
    result=unittest.TextTestRunner(verbosity=1).run(suite)
    if not result.wasSuccessful():raise SystemExit(1)
    validate_generated_corpus()
