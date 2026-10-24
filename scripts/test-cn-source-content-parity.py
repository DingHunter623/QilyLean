#!/usr/bin/env python3
"""Regression checks for source-derived CN content acceptance, without a build."""
import importlib
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'cn-site/scripts'))
validator = importlib.import_module('validate-source-content-parity')
parity = validator.parity


class SourceContentAcceptanceTests(unittest.TestCase):
    def test_grouped_main_reading_floor_targets_clone_root(self):
        result = parity.source_selector('html:root:root body :is(main,footer,.site-footer,.qily-site-footer) :is(p,span)')
        self.assertIn('main[data-cn-source-content]', result)
        self.assertIn(':is(main,footer,.site-footer,.qily-site-footer)', result)
        self.assertNotIn(') :is(main,', result)

    def test_current_module_style_keeps_real_header_and_local_routes(self):
        selector = 'html body:has(header a[href="/capabilities/"][aria-current="page"]) .qily-system-axis__step[href="/capabilities/"] :is(strong,span)'
        result = parity.source_selector(selector)
        self.assertIn('body:has(header a[href="/archive/profile/capabilities/"]', result)
        self.assertIn('.qily-system-axis__step[href="/archive/profile/capabilities/"]', result)
        self.assertNotIn('main:has(header', result)

    def check_page(self, source, target, name='lean-production/index.html'):
        validator.verify_noncommercial_module_order(source, target, name, '/fixture/')

    def test_reordered_named_sections_are_rejected(self):
        source = '<main><section id="a">甲</section><section id="b">乙</section></main>'
        target = '<main><section id="b">乙</section><section id="a">甲</section></main>'
        with self.assertRaisesRegex(AssertionError, 'module order differs'):
            self.check_page(source, target)

    def test_reordered_anonymous_sections_are_rejected(self):
        source = '<main><section class="lesson">甲</section><section class="lesson">乙</section></main>'
        target = '<main><section class="lesson">乙</section><section class="lesson">甲</section></main>'
        with self.assertRaisesRegex(AssertionError, 'content differs'):
            self.check_page(source, target)

    def test_secondary_page_lost_paragraph_is_rejected(self):
        source = '<main><article><h1>标准作业</h1><p>节拍计算</p><p>异常闭环</p></article></main>'
        target = '<main><article><h1>标准作业</h1><p>节拍计算</p></article></main>'
        with self.assertRaisesRegex(AssertionError, 'content differs'):
            self.check_page(source, target, 'qilylean/daily/2026-10-23.html')

    def test_source_main_excludes_shell_and_commercial_section(self):
        source = '<header><section>国际导航</section></header><main><section id="a"><h1>工程数据</h1><p>CT／TT／WIP</p></section><section id="contract"><p>付款与发票</p></section></main>'
        target = '<header>中国导航</header><main><section id="a"><h1>工程数据</h1><p> CT／TT／WIP </p></section></main>'
        self.check_page(source, target)

    def test_audited_interactive_adapter_uses_its_own_acceptance(self):
        validator.verify_noncommercial_module_order('<main>源阅读器</main>', '<main>本地阅读器</main>',
                                                   'knowledge/terminology.html', '/fixture/',
                                                   'audited-interactive-adapter')

    def test_case_action_keeps_primary_style_with_source_whitespace(self):
        result = parity.render(parity.Tree('<a href="/projects/"> 查看代表案例\n</a>').root, 'index.html')
        self.assertIn('href="/notes/"', result)
        self.assertIn('primary', parity.Tree(result).root.children[0].attrs['class'].split())
        self.assertIn('qily-route-action', parity.Tree(result).root.children[0].attrs['class'].split())

    def test_footer_reference_is_refreshed_without_destination_fork(self):
        source = '<link rel="stylesheet" href="/assets/destination-shell/assets/cn-footer-actions-v1.css?v=old" data-cn-destination-origin="/assets/cn-footer-actions-v1.css?v=old">'
        result = parity.destination_shell_styles(source)
        self.assertIn('href="/assets/cn-footer-actions-v1.css?v=20261023-cn-public-footer-source-v1"', result)
        self.assertNotIn('destination-shell', result)
        self.assertNotIn('data-cn-destination-origin', result)

    def settled_home(self):
        raw = (parity.ROOT / 'index.html').read_text()
        return raw, parity.source_fragment(raw, 'index.html')

    def test_actual_home_has_canonical_runtime_modules_in_order(self):
        _, fragment = self.settled_home()
        identifiers = [attrs.get('id') for tag, attrs in validator.Nodes(fragment).nodes if tag == 'section']
        expected = ['qily-core-services', 'qily-home-industry-scenes', 'qily-home-representative-cases',
                    'qily-home-six-step-method', 'qily-home-capability-building',
                    'qily-home-standard-deliverables', 'qily-home-collaboration', 'qily-home-launch',
                    'qily-home-extended', 'qily-north', 'qily-digital-enablers', 'qily-home-proof',
                    'qily-evidence-value', 'qily-knowledge-assets', 'qily-trust-center',
                    'qily-secondary-assets', 'qily-home-brand-extension']
        self.assertEqual([item for item in identifiers if item], expected)
        self.assertIn('丁启利｜20年制造业工程技术与精益改善履历', fragment)
        self.assertEqual(fragment.count('class="qily-home-method-step"'), 6)
        root = parity.Tree(fragment).root
        extended = next(node for node in root.children if isinstance(node, parity.Node)
                        and node.attrs.get('id') == 'qily-home-extended')
        self.assertEqual(len(validator.operating_axis_steps(parity.render(extended, 'index.html'))), 6)

    def test_actual_home_public_clone_filters_launch_and_keeps_all_public_modules(self):
        raw, fragment = self.settled_home()
        content = parity.render(parity.Tree(fragment).root, 'index.html')
        target = '<main>' + content + '</main>'
        self.check_page(raw, target, 'index.html')
        ids = [attrs.get('id') for tag, attrs in validator.Nodes(content).nodes if tag == 'section']
        self.assertEqual([item for item in ids if item and item.startswith('qily-home-')], [
            'qily-home-industry-scenes', 'qily-home-representative-cases', 'qily-home-six-step-method',
            'qily-home-capability-building', 'qily-home-standard-deliverables', 'qily-home-collaboration',
            'qily-home-extended', 'qily-home-proof', 'qily-home-brand-extension'])
        self.assertNotIn('qily-home-launch', content)
        self.assertNotIn('免费60分钟', content)
        self.assertNotIn('专家／供应商协同', content)
        self.assertIn('丁启利｜20年制造业工程技术与精益改善履历', content)
        self.assertEqual(len(validator.operating_axis_steps(content)), 6)

    def test_raw_home_copy_no_longer_passes_settled_module_acceptance(self):
        raw, _ = self.settled_home()
        raw_main = parity.main_markup(raw)
        target = '<main>' + parity.render(parity.Tree(raw_main).root, 'index.html') + '</main>'
        with self.assertRaisesRegex(AssertionError, 'module order differs'):
            self.check_page(raw, target, 'index.html')

    def test_changed_runtime_order_fails_closed(self):
        raw = (parity.ROOT / 'index.html').read_text()
        original_read = Path.read_text

        def changed(path, *args, **kwargs):
            value = original_read(path, *args, **kwargs)
            return value.replace('industry.after(cases);', 'industry.after(method);') if path.name == parity.HOME_RUNTIMES[0] else value

        with patch.object(Path, 'read_text', changed), self.assertRaisesRegex(RuntimeError, 'module order changed'):
            parity.source_fragment(raw, 'index.html')

    def test_dynamic_runtime_template_fails_closed(self):
        with self.assertRaisesRegex(RuntimeError, 'literal template changed'):
            parity.literal_template("hero.innerHTML='<p>公开内容</p>'+window.dynamicContent;", r'hero\.innerHTML\s*=')

    def test_home_runtime_provenance_covers_conversion_and_owner_profile(self):
        raw = (parity.ROOT / 'index.html').read_text()
        records = parity.source_runtime_records(raw, 'index.html')
        self.assertEqual([item['source'] for item in records], list(parity.HOME_RUNTIMES) + ['site-interaction-semantics-v1.js'])
        self.assertTrue(all(len(item['sha256']) == 64 and item['bytes'] > 0 for item in records))
        self.assertEqual(parity.source_runtime_records('<main>静态课件</main>', 'index.html'), [])

    def test_public_project_grades_follow_settled_source(self):
        name = 'projects/index.html'
        fragment = parity.source_fragment((parity.ROOT / name).read_text(), name)
        self.assertEqual(fragment.count('data-qily-project-evidence='), 7)
        self.assertIn('证据等级：已验证', fragment)

    def test_public_trust_evidence_links_are_retained_and_local(self):
        name = 'trust/index.html'
        fragment = parity.source_fragment((parity.ROOT / name).read_text(), name)
        public = parity.render(parity.Tree(fragment).root, name)
        self.assertIn('当前公开归属：具备改善前后数据或过程验证的历史项目。', public)
        self.assertIn('/archive/practice/smed-300t/', public)
        self.assertNotIn('/projects/qilylean-commercial-deliveries/', public)

    def test_executable_interaction_metadata_is_rejected(self):
        with self.assertRaises(RuntimeError):
            parity.javascript_data_literal('{note: window.dynamic()}')


if __name__ == '__main__':
    unittest.main()
