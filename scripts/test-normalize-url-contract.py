"""Regression checks for URL normalization without corrupting executable code."""
import importlib.util
from pathlib import Path
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('url_contract', Path(__file__).with_name('normalize-url-contract.py'))
contract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(contract)


class UrlContractTests(unittest.TestCase):
    def setUp(self):
        self.routes = {'/', '/improvements/', '/archive/improvements/', '/projects/'}
        self.pattern = contract.build_root_relative_re(self.routes)

    def test_navigation_regex_remains_executable_and_matches_routes(self):
        source = r"const route = /^\/(?:archive\/profile\/tools|archive\/improvements)(?:\/|$)/; if(!route.test('/archive/improvements/') || route.test('/projects/')) throw Error('route changed');"
        output, count = contract.normalize_root_relative(source, self.pattern)
        self.assertEqual(output, source)
        self.assertEqual(count, 0)
        subprocess.run(['node', '-e', output], check=True, capture_output=True)

    def test_only_complete_quoted_directory_values_are_normalized(self):
        source = '''<a href="/projects">Projects</a><a href='/improvements?view=all#plan'>Tools</a> const route = `/archive/improvements`; const file = '/projects/photo.png'; const longer = '/projects-extra';'''
        expected = '''<a href="/projects/">Projects</a><a href='/improvements/?view=all#plan'>Tools</a> const route = `/archive/improvements/`; const file = '/projects/photo.png'; const longer = '/projects-extra';'''
        output, count = contract.normalize_root_relative(source, self.pattern)
        self.assertEqual(output, expected)
        self.assertEqual(count, 3)
        self.assertEqual(contract.normalize_root_relative(output, self.pattern), (output, 0))

    def test_absolute_urls_keep_origin_and_file_semantics(self):
        source = 'https://qilylean.com https://qilylean.com/projects?view=all https://qilylean.com/projects/photo.png'
        self.assertEqual(contract.normalize_absolute(source, self.routes)[0], 'https://qilylean.com https://qilylean.com/projects/?view=all https://qilylean.com/projects/photo.png')


if __name__ == '__main__':
    unittest.main()
