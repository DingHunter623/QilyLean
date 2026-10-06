import hashlib
import io
import json
import threading
import unittest
import urllib.error
import urllib.parse
import urllib.request
from unittest.mock import patch
import server

KEYS = {'YOUDAO_APP_KEY': 'test-app', 'YOUDAO_APP_SECRET': 'test-secret'}


class TranslationTests(unittest.TestCase):
    def test_signed_batch_contract(self):
        def upstream(request, timeout):
            self.assertEqual(request.full_url, 'https://openapi.youdao.com/v2/api')
            form = urllib.parse.parse_qs(request.data.decode())
            self.assertEqual(form['q'], ['现场问题', '工程改善'])
            self.assertEqual(form['to'], ['en'])
            signed = 'test-app' + '现场问题工程改善' + form['salt'][0] + form['curtime'][0] + 'test-secret'
            self.assertEqual(form['sign'][0], hashlib.sha256(signed.encode()).hexdigest())
            return io.BytesIO(json.dumps({'errorCode': '0', 'translateResults': [
                {'translation': 'Site issue'}, {'translation': 'Engineering improvement'},
            ]}).encode())
        with patch.object(server.urllib.request, 'urlopen', upstream):
            self.assertEqual(server.youdao(['现场问题', '工程改善'], 'en', KEYS), ['Site issue', 'Engineering improvement'])

    def test_order_deduplication_protection_and_cache(self):
        calls = []
        def upstream(texts, target, keys, **kwargs):
            calls.append(texts)
            return [text.replace('现场改善', 'Site improvement') for text in texts]
        adapter = server.Translator(KEYS, upstream)
        texts = ['现场改善 QilyLean', '现场改善 QilyLean', 'QilyLean｜启力精益']
        first = adapter.translate({'target_language': 'en', 'texts': texts}, 'ip-a')
        self.assertEqual(first['translations'], ['Site improvement QilyLean', 'Site improvement QilyLean', texts[2]])
        self.assertFalse(first['cached'])
        self.assertEqual(len(calls[0]), 1)
        second = adapter.translate({'target_language': 'en', 'texts': texts}, 'ip-a')
        self.assertTrue(second['cached'])
        self.assertEqual(len(calls), 1)
        adapter.translate({'target_language': 'fr', 'texts': texts}, 'ip-a')
        self.assertEqual(len(calls), 2)

    def test_corrupt_protected_token_is_not_cached(self):
        adapter = server.Translator(KEYS, lambda *args, **kwargs: ['Token removed'])
        with self.assertRaises(server.TranslationError):
            adapter.translate({'target_language': 'en', 'texts': ['改善 QilyLean']}, 'ip-a')
        self.assertEqual(len(adapter.cache), 0)

    def test_input_limits_and_per_client_rate(self):
        adapter = server.Translator(KEYS, lambda texts, *args, **kwargs: texts)
        for body in [[], {'target_language': [], 'texts': ['a']}, {'target_language': 'en', 'texts': []},
                     {'target_language': 'en', 'texts': ['a'] * 25}, {'target_language': 'en', 'texts': [1]}]:
            with self.assertRaises(server.TranslationError):
                adapter.translate(body, 'ip-a')
        with self.assertRaises(server.TranslationError) as caught:
            adapter.translate({'target_language': 'en', 'texts': ['a' * 5001]}, 'ip-a')
        self.assertEqual(caught.exception.status, 413)
        day = server.time.strftime('%Y-%m-%d', server.time.gmtime())
        adapter.rates['ip-a'] = (day, 600)
        with self.assertRaises(server.TranslationError) as caught:
            adapter.translate({'target_language': 'en', 'texts': ['现场问题']}, 'ip-a')
        self.assertEqual(caught.exception.status, 429)
        self.assertTrue(adapter.translate({'target_language': 'en', 'texts': ['现场问题']}, 'ip-b')['ok'])

    def test_missing_credentials(self):
        with patch.dict(server.os.environ, {}, clear=True):
            with self.assertRaises(server.TranslationError):
                server.credentials()

    def test_real_loopback_http_contract(self):
        http = server.Server(('127.0.0.1', 0), server.Handler)
        http.translator = server.Translator(KEYS, lambda texts, *args, **kwargs: ['Site improvement' for text in texts])
        thread = threading.Thread(target=http.serve_forever, daemon=True)
        thread.start()
        try:
            url = f'http://127.0.0.1:{http.server_port}/translate'
            request = urllib.request.Request(url, data=json.dumps({'target_language': 'en', 'texts': ['现场改善']}).encode(), headers={'Content-Type': 'application/json', 'X-Real-IP': '127.0.0.2'})
            with urllib.request.urlopen(request) as response:
                result = json.load(response)
                self.assertEqual(response.headers['Cache-Control'], 'no-store')
                self.assertEqual(result['provider'], 'youdao')
                self.assertFalse(result['cached'])
                self.assertEqual(result['translations'], ['Site improvement'])
            with self.assertRaises(urllib.error.HTTPError) as caught:
                urllib.request.urlopen(urllib.request.Request(url, data=b'not-json', headers={'Content-Type': 'application/json'}))
            self.assertEqual(caught.exception.code, 400)
            caught.exception.close()
        finally:
            http.shutdown()
            http.server_close()
            thread.join()


if __name__ == '__main__':
    unittest.main()
