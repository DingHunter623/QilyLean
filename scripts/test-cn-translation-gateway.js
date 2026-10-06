const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function main() {
  const requests = [];
  const timers = [];
  let reply = { ok: true, translations: ['Lean production'], provider: 'youdao' };
  let status = 200;
  const window = {
    setTimeout(callback, delay) { timers.push(delay); return 1; },
    clearTimeout() {},
  };
  const source = fs.readFileSync('cn-site/assets/cn-translate-baidu-v1.js', 'utf8');
  // Expose the real transport only inside the isolated test context.
  vm.runInNewContext(source.replace('function label(target)',
    'w.testTransport=translateBatch;w.testBatches=batches;function label(target)'), {
    document: { readyState: 'loading', addEventListener() {} },
    window,
    AbortController,
    fetch: async (url, options) => {
      assert.equal(url, '/translate', 'translation must stay on the page origin');
      requests.push({ url, options });
      return { ok: status === 200, status, json: async () => reply };
    },
  });
  const result = await window.testTransport('en', [{ core: '精益生产' }]);
  assert.equal(result.provider, 'youdao');
  assert.equal(requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    source_language: 'zh-CN', target_language: 'en', texts: ['精益生产'],
  });
  assert.ok(timers[0] > 60000, 'browser must outlast the server upstream timeout');
  reply = { ok: true, translations: [] };
  await assert.rejects(window.testTransport('en', [{ core: '精益生产' }]));
  reply = { ok: false, error: 'Translation unavailable' };
  status = 503;
  await assert.rejects(window.testTransport('en', [{ core: '精益生产' }]));
  assert.equal(requests.length, 3, 'failed requests must not retry overseas domains');
  const long = '🙂制造' .repeat(2500);
  const groups = window.testBatches([{core:long}]);
  assert.ok(groups.length > 1);
  assert.equal(groups.flat().map(part => part.core).join(''), long);
  assert.ok(groups.every(group => group.length <= 20 && group.reduce((sum, part) => sum + Array.from(part.core).length, 0) <= 4600));
  reply = {ok:true,translations:[null]};status=200;
  await assert.rejects(window.testTransport('en', [{core:'质量'}]));
  console.log('PASS: same-origin requests, JSON contract, timeout, malformed result and failure handling');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
