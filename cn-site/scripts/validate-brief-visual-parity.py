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
    def test_filtered_void_controls_never_consume_later_content(self):
        parser=visual.VisualSanitizer()
        parser.feed('<input type="search"><p>正文保留</p><embed src="bad"><section id="tail">后续章节</section>')
        self.assertEqual(''.join(parser.parts),'<p>正文保留</p><section id="tail">后续章节</section>')
        self.assertFalse(parser.skip_stack)

    def test_approved_controls_keep_semantics_without_active_attributes(self):
        parser=visual.VisualSanitizer('knowledge/terminology.html',public_controls=True)
        parser.feed('<label for="termSearch">查找</label><input id="termSearch" type="search" placeholder="搜索术语" onfocus="bad()"><button data-plan-preview hidden onclick="bad()">预览</button><button onclick="window.print()">打印</button><script>bad()</script><section id="engineering">保留</section>')
        result=''.join(parser.parts)
        self.assertIn('for="termSearch"',result)
        self.assertIn('type="search" placeholder="搜索术语"',result)
        self.assertIn('data-plan-preview="" hidden=""',result)
        self.assertIn('data-public-print=""',result)
        self.assertIn('id="engineering"',result)
        self.assertNotIn('bad()',result)
        self.assertFalse(parser.skip_stack)

    def test_cn_aircraft_mapping_is_site_specific(self):
        original='/assets/qilylean-aircraft-hero-approved-20260826.png'
        china='/assets/qilylean-aircraft-hero-cn-v2-20260919.png'
        for url in [original,original+'?v=source','https://qilylean.com'+original]:
            self.assertEqual(visual.local_media(url),china)
        self.assertEqual(visual.rewrite_brief_href(original+'?view=full'),china+'?view=full')
        self.assertEqual(visual.local_media('https://untrusted.test'+original),'')
        home=Page((visual.CN/'index.html').read_text(encoding='utf-8'))
        self.assertIn(china,[urlparse(attrs.get('src','')).path for tag,attrs in home.nodes if tag=='img'])
        self.assertNotEqual((visual.CN/china.lstrip('/')).read_bytes(),(visual.ROOT/original.lstrip('/')).read_bytes())
        international=(visual.ROOT/'qilylean/daily/2026-10-11.html').read_text(encoding='utf-8')
        self.assertIn('<img src="'+original+'"',international)
        self.assertIn('https://qilylean.com'+original,international)
        self.assertNotIn(china,international)

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
        translation_css=[attrs for tag,attrs in page.nodes if tag=='link' and urlparse(attrs.get('href','')).path=='/assets/cn-translate-baidu-v1.css']
        translation_js=[attrs for tag,attrs in page.nodes if tag=='script' and urlparse(attrs.get('src','')).path=='/assets/cn-translate-baidu-v1.js']
        assert len(translation_css)==len(translation_js)==1,(src.path,'public translator dependencies missing or duplicated')
        assert translation_css[0].get('id')=='qilyCnDomesticTranslateV1Stylesheet',src.path
        assert 'defer' in translation_js[0],src.path
        assert generated.index(visual.source.TRANSLATION_STYLESHEET)<generated.index('/assets/qilylean-vi-v2.css'),src.path
        assert generated.index(visual.source.TRANSLATION_SCRIPT)<generated.index('/assets/cn-nav-rail-v1.js'),src.path
        assert any(tag=='header' and 'site-header' in attrs.get('class','').split() for tag,attrs in page.nodes),src.path
        assert any('header-inner' in attrs.get('class','').split() for tag,attrs in page.nodes),src.path
        main=[attrs for tag,attrs in page.nodes if tag=='main']
        assert len(main)==1 and main[0].get('data-qily-brief-content')=='v2',src.path
        assert '/assets/brief-visual-parity.css?v=20261013-brief-tag-contrast-v12' in generated,(src.path,'stale brief CSS version')
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
        if src.path.as_posix()=='qilylean/daily/2026-10-11.html':
            assert '/assets/qilylean-aircraft-hero-cn-v2-20260919.png' in actual_images,(src.path,'China brand image missing')
            assert not any('qilylean-aircraft-hero-approved-20260826.png' in url for url in actual_images),src.path
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
    # Screenshot-led 2026-10-12 VI regression: these guards must apply to the
    # entire generated archive, not to one locally patched issue.
    cn_guard=(visual.CN/'assets/brief-visual-parity.css').read_text(encoding='utf-8')
    global_guard=(visual.ROOT/'site-daily-brief-layout-guard-v1.css').read_text(encoding='utf-8')
    mirrored_guard=(visual.CN/'assets/brief-visual-source/site-daily-brief-layout-guard-v1.css').read_text(encoding='utf-8')
    for selector in ('.brief-topic-statement','.brief-role-shift strong',
                     '.knowledge-brief-hero .knowledge-breadcrumbs','.w8 .scene-flow'):
        assert selector in cn_guard,(selector,'CN contrast/role/flow guard missing')
    for marker in ('QILY-SELECTED-BRIEF-VISUAL-PARITY-V6',
                   '.knowledge-brief-section .module-heading>.module-eyebrow',
                   '.knowledge-brief-hero .knowledge-breadcrumbs',
                   '.scene-flow>.scene-arrow'):
        assert marker in global_guard,(marker,'international VI guard missing')
    assert '.scene-flow>.scene-arrow' in mirrored_guard,'CN source brief flow guard missing'
    for date in ('2026-09-04','2026-08-25'):
        international=(visual.ROOT/'qilylean/daily'/f'{date}.html').read_text(encoding='utf-8')
        assert 'site-daily-brief-layout-guard-v1.css?v=20261013-legacy-tag-contrast-v10' in international, (date,'stale international visual CSS')
    # Regression: two-column key/evidence tables must never return to a 50/50
    # fixed layout. This explicitly covers section 8 of the 2026-09-13 issue,
    # and shares selectors for every cloned Selected Brief archive page.
    for path,marker in ((visual.CN/'assets/brief-visual-parity.css','QILY-CN-BRIEF-TWO-COLUMN-READABILITY-V7'),
                        (visual.ROOT/'site-daily-brief-layout-guard-v1.css','QILY-BRIEF-TWO-COLUMN-READABILITY-V7')):
        sheet=path.read_text(encoding='utf-8')
        assert marker in sheet,(str(path),'comparison column contract missing')
        assert 'table-layout:auto!important' in sheet,(str(path),'two-column auto layout missing')
        assert 'white-space:nowrap!important' in sheet,(str(path),'short label no-wrap missing')
        assert ':nth-child(2):last-child' in sheet,(str(path),'must target only two-column tables')
    example=(visual.ROOT/'qilylean/daily/2026-09-13.html').read_text(encoding='utf-8')
    assert '<th>成果类别</th>' in example and '<th>评价重点</th>' in example,'screenshot example lost'
    assert 'site-daily-brief-layout-guard-v1.css?v=20261013-legacy-tag-contrast-v10' in example,'source CSS refresh missing'
    # Same issue also contains a 3-column comparison table. Short labels
    # must not consume a full third of the content axis on the CN mirror.
    tri_marker='QILY-CN-BRIEF-THREE-COLUMN-CONTENT-FIT-V8'
    assert tri_marker in cn_guard,'CN three-column comparison layout guard missing'
    assert ':nth-child(3):last-child' in cn_guard,'three-column guard must not affect 4+ column data tables'
    assert 'white-space:nowrap!important' in cn_guard,'short three-column labels must remain on one line'
    assert '<th>核心工作</th>' in example and '<th>需要建立的内容</th>' in example and '<th>应当回答的问题</th>' in example, 'three-column screenshot comparison table lost'
    # Entire cloned issue corpus must retain the international comparison
    # visual hierarchy (deep-teal headers, compact cells and scrollable mobile
    # tables) with the final archive asset version, not a locally patched page.
    assert 'QILY-CN-BRIEF-INTL-COMPARISON-SURFACE-V10' in cn_guard, 'international-style comparison surface missing'
    assert 'min-width:860px!important' in cn_guard, 'mobile three-column reading width missing'
    # A custom checklist and adjacent navigation must keep the canonical readable scale.
    typography=(visual.CN/'assets/brief-visual-parity.css').read_text(encoding='utf-8')
    for class_name in ('.tripod-checklist>div>span','.brief-adjacent>a','.tripod-closing>span'):
        assert class_name in typography,(class_name,'missing body/font parity guard')
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
