import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("discovery", Path(__file__).with_name("cn-search-discovery.py"))
discovery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(discovery)


class SearchDiscoveryTests(unittest.TestCase):
    def test_rejects_international_and_duplicate_urls(self):
        for urls in (["https://qilylean.com/"], ["https://qilylean.cn/", "https://qilylean.cn/"]):
            xml = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(
                f'<url><loc>{url}</loc></url>' for url in urls) + '</urlset>'
            with self.assertRaises(ValueError):
                discovery.sitemap_urls(xml)

    def test_rejects_soft_404_and_cross_domain_canonical(self):
        for canonical in ("", '<link rel="canonical" href="https://qilylean.com/">'):
            html = f'<title>Page</title>{canonical}<h1>Page</h1>'
            self.assertFalse(discovery.page_result("https://qilylean.cn/", (200, "https://qilylean.cn/", {}, html))["passed"])

    def test_detects_noindex_header_even_with_valid_canonical(self):
        html = '<title>Page</title><link rel="canonical" href="https://qilylean.cn/"><h1>Page</h1>'
        self.assertFalse(discovery.page_result("https://qilylean.cn/", (200, "https://qilylean.cn/", {"X-Robots-Tag": "noindex"}, html))["passed"])

    def test_http_200_does_not_imply_baidu_acceptance(self):
        for payload in ({"error": 401}, {"success": 0}, {"success": 1, "not_same_site": ["x"]}, []):
            self.assertEqual(discovery.baidu_receipt(200, json.dumps(payload))["state"], "error")

    def test_stops_at_quota_and_retains_pending_urls(self):
        urls = ["https://qilylean.cn/", "https://qilylean.cn/ie/"]
        with patch.object(discovery, "request", return_value=(200, "", {}, '{"success":1,"remain":0}')) as call:
            receipt = discovery.submit_baidu(urls, "test-token")
        self.assertEqual(call.call_count, 1)
        self.assertEqual(receipt["received_urls"], urls[:1])
        self.assertEqual(receipt["pending_urls"], urls[1:])
        self.assertEqual(receipt["state"], "quota_exhausted")

    def test_missing_token_sends_nothing(self):
        with patch.object(discovery, "request") as call:
            self.assertEqual(discovery.submit_baidu(["https://qilylean.cn/"], "")["state"], "not_configured")
            call.assert_not_called()

    def test_uncertain_post_is_not_retried_and_does_not_leak_token(self):
        with patch.object(discovery, "request", side_effect=RuntimeError("test-token")) as call:
            receipt = discovery.submit_baidu(["https://qilylean.cn/"], "test-token")
        self.assertEqual(call.call_count, 1)
        self.assertEqual(receipt["state"], "uncertain")
        self.assertNotIn("test-token", json.dumps(receipt))


if __name__ == "__main__":
    unittest.main()
