const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function main() {
  const requests = [];
  const status = {textContent: ''}, select = {value: 'zh-CN'};
  const control = {setAttribute() {}, removeAttribute() {}};
  const html = {lang: 'zh-CN', setAttribute() {}, removeAttribute() {}};
  const window = {setTimeout, clearTimeout};
  const source = fs.readFileSync('cn-site/assets/cn-translate-baidu-v1.js', 'utf8');
  vm.runInNewContext(source.replace('function closePanel()',
    'w.test={apply:apply,bind:function(list,s,c,v){records=list;status=s;control=c;select=v}};function closePanel()'), {
    document: {readyState: 'loading', addEventListener() {}, documentElement: html},
    window, AbortController,
    // Deliberately allow old replies after abort to verify generation isolation too.
    fetch: (url, options) => new Promise(resolve => requests.push({resolve, options})),
  });
  const record = (core) => ({core, original: core, prefix: '', suffix: '', node: {isConnected: true, nodeValue: core}});
  const tick = () => new Promise(resolve => setImmediate(resolve));
  const answer = (index, translations, ok = true) => requests[index].resolve({ok, status: ok ? 200 : 503, json: async () => ({ok, translations})});
  let records = [record('现场制造')];
  window.test.bind(records, status, control, select);
  const english = window.test.apply('en');
  const traditional = window.test.apply('zh-TW');
  assert.ok(requests[0].options.signal.aborted);
  answer(0, ['Manufacturing']);await english;
  assert.equal(records[0].node.nodeValue, '现场制造');
  answer(1, ['現場製造']);await traditional;
  assert.equal(records[0].node.nodeValue, '現場製造');
  assert.equal(html.lang, 'zh-TW');
  const pending = window.test.apply('en');
  await window.test.apply('zh-CN');
  assert.ok(requests[2].options.signal.aborted);
  answer(2, ['Late reply']);await pending;
  assert.equal(records[0].node.nodeValue, '现场制造');
  assert.equal(html.lang, 'zh-CN');assert.equal(status.textContent, '原文');

  records = [record('中'.repeat(5000)), record('质量')];
  window.test.bind(records, status, control, select);
  const failing = window.test.apply('en');
  answer(3, ['First part']);await tick();
  assert.equal(records[0].node.nodeValue, records[0].original, 'partial results must not alter the page');
  answer(4, [], false);await failing;
  assert.ok(records.every(r => r.node.nodeValue === r.original));
  assert.equal(status.textContent, '翻译暂不可用');assert.equal(select.value, 'zh-CN');
  console.log('PASS: rapid language changes, stale replies, immediate original restoration, atomic failure fallback');
}
main().catch(error => {console.error(error);process.exitCode = 1;});
