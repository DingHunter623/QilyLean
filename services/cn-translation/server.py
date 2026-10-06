#!/usr/bin/env python3
"""Loopback-only mainland translation endpoint. Uses Python standard library."""
import collections
import hashlib
import json
import os
from pathlib import Path
import threading
import time
import urllib.parse
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LANGUAGES = {code: code for code in 'en ja ko fr de es ru pt it ar th vi id ms tr pl nl'.split()}
LANGUAGES.update({'zh-CN': 'zh-CHS', 'zh-TW': 'zh-CHT'})
TOKENS = sorted(json.loads(Path(__file__).with_name('protected-tokens.json').read_text()), key=len, reverse=True)
URL = 'https://openapi.youdao.com/v2/api'


class TranslationError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


def credentials():
    directory = os.environ.get('CREDENTIALS_DIRECTORY')
    if directory:
        data = json.loads((Path(directory) / 'youdao').read_text())
    else:
        data = {name: os.environ.get(name, '') for name in ('YOUDAO_APP_KEY', 'YOUDAO_APP_SECRET')}
    if not all(isinstance(data.get(key), str) and data[key].strip() for key in ('YOUDAO_APP_KEY', 'YOUDAO_APP_SECRET')):
        raise TranslationError('Youdao credentials are not configured', 503)
    return data


def youdao(texts, target, keys, timeout=18):
    joined = ''.join(texts)
    value = joined if len(joined) <= 20 else joined[:10] + str(len(joined)) + joined[-10:]
    salt, stamp = uuid.uuid4().hex, str(int(time.time()))
    sign = hashlib.sha256((keys['YOUDAO_APP_KEY'] + value + salt + stamp + keys['YOUDAO_APP_SECRET']).encode()).hexdigest()
    fields = [('q', text) for text in texts] + [
        ('from', 'auto'), ('to', LANGUAGES[target]), ('appKey', keys['YOUDAO_APP_KEY']),
        ('salt', salt), ('curtime', stamp), ('sign', sign), ('signType', 'v3'),
        ('detectLevel', '1'), ('detectFilter', 'false'),
    ]
    request = urllib.request.Request(URL, data=urllib.parse.urlencode(fields).encode(), headers={
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json',
    })
    with urllib.request.urlopen(request, timeout=timeout) as response:
        data = json.loads(response.read(262144))
    results = data.get('translateResults', [])
    if str(data.get('errorCode')) != '0' or len(results) != len(texts) or any(not isinstance(item.get('translation'), str) or not item['translation'].strip() for item in results):
        raise TranslationError('Youdao translation failed or returned an invalid result')
    return [item['translation'] for item in results]


class Translator:
    def __init__(self, keys, upstream=youdao):
        self.keys, self.upstream = keys, upstream
        self.cache, self.rates = collections.OrderedDict(), collections.OrderedDict()
        self.lock = threading.Lock()

    def translate(self, payload, client):
        if not isinstance(payload, dict):
            raise TranslationError('Invalid translation request', 400)
        target, texts = payload.get('target_language'), payload.get('texts')
        if not isinstance(target, str) or target not in LANGUAGES or not isinstance(texts, list) or not 1 <= len(texts) <= 24 or any(not isinstance(text, str) or not text.strip() for text in texts):
            raise TranslationError('Invalid target language or text batch', 400)
        if sum(len(text) for text in texts) > 5000:
            raise TranslationError('Translation batch is too large', 413)
        if target == 'zh-CN':
            return {'ok': True, 'provider': 'source', 'cached': True, 'translations': texts}
        now = time.time()
        output, missing = [], []
        with self.lock:
            for text in texts:
                stored = self.cache.get((target, text))
                result = text if text in TOKENS else stored[1] if stored and now - stored[0] < 86400 else None
                output.append(result)
                if result is None and text not in missing:
                    missing.append(text)
            if missing:
                day = time.strftime('%Y-%m-%d', time.gmtime(now))
                rate_day, count = self.rates.get(client, (day, 0))
                count = count if rate_day == day else 0
                if count >= 600:
                    raise TranslationError('Daily translation limit reached', 429)
                self.rates[client] = (day, count + 1)
                self.rates.move_to_end(client)
                while len(self.rates) > 2048:
                    self.rates.popitem(last=False)
        if missing:
            prepared, replacements = [], []
            for index, text in enumerate(missing):
                masked, pairs = text, []
                for token_index, token in enumerate(TOKENS):
                    if token in masked:
                        placeholder = f'__QILY_TOKEN_{index}_{token_index}__'
                        masked = masked.replace(token, placeholder)
                        pairs.append((placeholder, token))
                prepared.append(masked)
                replacements.append(pairs)
            # Placeholders may expand the batch beyond Youdao's 5000-char limit.
            groups, group, size = [], [], 0
            for index, text in enumerate(prepared):
                if len(text) > 5000:
                    raise TranslationError('Protected translation text is too large', 413)
                if group and size + len(text) > 5000:
                    groups.append(group)
                    group, size = [], 0
                group.append(index)
                size += len(text)
            if group:
                groups.append(group)
            translated = []
            deadline = time.monotonic() + 55
            for group in groups:
                remaining = deadline - time.monotonic()
                if remaining < 1:
                    raise TranslationError('Translation timed out', 504)
                translated.extend(self.upstream([prepared[index] for index in group], target, self.keys, timeout=min(18, remaining)))
            if len(translated) != len(missing):
                raise TranslationError('Translation count mismatch')
            restored = {}
            for source, text, pairs in zip(missing, translated, replacements):
                for placeholder, token in pairs:
                    if placeholder not in text:
                        raise TranslationError('Protected translation token changed')
                    text = text.replace(placeholder, token)
                restored[source] = text
            with self.lock:
                for source, text in restored.items():
                    self.cache[(target, source)] = (time.time(), text)
                    self.cache.move_to_end((target, source))
                while len(self.cache) > 1000:
                    self.cache.popitem(last=False)
            output = [text if text is not None else restored[source] for source, text in zip(texts, output)]
        return {'ok': True, 'provider': 'youdao', 'cached': not missing, 'translations': output,
                'cache': {'hits': sum(text not in missing for text in texts), 'misses': len(missing)}}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # Never log submitted text, upstream URLs or credentials.

    def answer(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json;charset=UTF-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/health':
            self.answer({'ok': True, 'translation_provider': 'youdao', 'youdao_available': True})
        else:
            self.answer({'ok': False, 'error': 'Not found'}, 404)

    def do_POST(self):
        if self.path != '/translate':
            self.answer({'ok': False, 'error': 'Not found'}, 404)
            return
        try:
            self.connection.settimeout(10)
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 65536:
                raise TranslationError('Invalid request size', 413)
            if self.headers.get_content_type() != 'application/json':
                raise TranslationError('JSON content type required', 415)
            body = json.loads(self.rfile.read(length))
            result = self.server.translator.translate(body, self.headers.get('X-Real-IP', self.client_address[0]))
            self.answer(result)
        except TranslationError as error:
            self.answer({'ok': False, 'error': str(error)}, error.status)
        except (ValueError, UnicodeError):
            self.answer({'ok': False, 'error': 'Invalid request or upstream response'}, 400)
        except Exception:
            self.answer({'ok': False, 'error': 'Translation temporarily unavailable'}, 502)


class Server(ThreadingHTTPServer):
    slots = threading.BoundedSemaphore(8)

    def process_request(self, request, client_address):
        if not self.slots.acquire(blocking=False):
            try:
                request.sendall(b'HTTP/1.0 503 Service Unavailable\r\nContent-Length: 0\r\n\r\n')
            finally:
                self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except Exception:
            self.slots.release()
            raise

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self.slots.release()


if __name__ == '__main__':
    keys = credentials()  # Fail closed before opening a listener without credentials.
    import sys
    if '--verify' in sys.argv:
        source = '制造现场验收 ' + uuid.uuid4().hex
        result = Translator(keys).translate({'target_language': 'en', 'texts': [source, 'QilyLean｜启力精益']}, 'verification')
        assert result['provider'] == 'youdao' and result['cached'] is False
        assert result['translations'][0] != source and result['translations'][1] == 'QilyLean｜启力精益'
        print('PASS: mainland direct Youdao, non-cached translation, protected brand')
        sys.exit(0)
    server = Server(('127.0.0.1', 8081), Handler)
    server.translator = Translator(keys)
    server.serve_forever()
