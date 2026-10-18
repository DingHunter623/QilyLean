#!/usr/bin/env node
// CI browser reaches the public site through an ephemeral SSH mainland egress.
// All offsite page requests are blocked. No credentials are passed to this script.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const origin = 'https://qilylean.cn';
const destination = process.env.BROWSER_EVIDENCE_DIR;
assert(destination && process.env.MAINLAND_BROWSER_PROXY, 'CI mainland test transport required');
const cases = process.env.BROWSER_INSPECT_ONLY === 'true' ? [
  ['home-en', '/', 'en', 1440, 1000],
  ['home-ja-mobile', '/', 'ja', 390, 844],
] : [
  ['home-en', '/', 'en', 1440, 1000],
  ['home-traditional', '/', 'zh-TW', 1440, 1000],
  ['detail-en', '/knowledge/standard-work-three-elements/', 'en', 1440, 1000],
  ['home-ja-mobile', '/', 'ja', 390, 844],
  ['detail-traditional-mobile', '/knowledge/standard-work-three-elements/', 'zh-TW', 390, 844],
  ['brief-ja-mobile', '/briefs/archive/2026-10-11/', 'ja', 390, 844],
];

(async () => {
  await fs.mkdir(destination, { recursive: true });
  const evidence = { transport: 'CI Chromium via SSH SOCKS5 mainland egress',
    allowed_page_origin: origin, offsite_requests: 'blocked', tests: [] };
  const browser = await chromium.launch({ headless: true,
    proxy: { server: process.env.MAINLAND_BROWSER_PROXY },
    args: ['--disable-quic', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'],
  });
  let failed = false;
  try {
    for (const [name, route, target, width, height] of cases) {
      const result = { name, url: origin + route, target, viewport: { width, height }, calls: [], blocked_origins: [] };
      const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
      const pending = [];
      await context.route('**/*', request => {
        const url = new URL(request.request().url());
        if (['data:', 'blob:'].includes(url.protocol) || url.origin === origin) return request.continue();
        if (!result.blocked_origins.includes(url.origin)) result.blocked_origins.push(url.origin);
        return request.abort('blockedbyclient');
      });
      const page = await context.newPage();
      page.on('response', response => {
        if (new URL(response.url()).pathname !== '/translate') return;
        pending.push((async () => {
          const body = await response.json().catch(() => ({}));
          result.calls.push({ url: response.url(), status: response.status(), ok: body.ok,
            provider: body.provider, cached: body.cached, error: body.error });
        })());
      });
      page.on('requestfailed', request => {
        if (new URL(request.url()).pathname === '/translate') result.calls.push({ url: request.url(), failure: request.failure()?.errorText });
      });
      try {
        const response = await page.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        assert.equal(response.status(), 200);
        const widget = page.locator('#qilyCnTranslateV3');
        await widget.waitFor({ state: 'visible', timeout: 30000 });
        const original = await page.locator('h1').first().innerText();
        const before = await widget.boundingBox();
        result.translator_scripts = await page.locator('script[src*="cn-translate-baidu-v1.js"]').evaluateAll(nodes => nodes.map(node => node.src));
        assert(result.translator_scripts.length === 1 && result.translator_scripts[0].includes('20261017-cn-mainland-nmt-v2'));
        if (target === 'ja') {
          await widget.locator('select').selectOption('__more__');
          await page.getByRole('button', { name: '日本語 / Japanese', exact: true }).click();
        } else {
          await widget.locator('select').selectOption(target);
        }
        await page.waitForFunction(() => {
          const widget = document.querySelector('#qilyCnTranslateV3');
          return widget && !widget.hasAttribute('data-qily-translating');
        }, null, { timeout: 240000 });
        result.status = await widget.locator('.qily-cn-translate__provider').innerText();
        result.language = await page.locator('html').getAttribute('lang');
        result.heading = await page.locator('h1').first().innerText();
        await Promise.all(pending);
        assert.equal(result.language, target, result.status);
        assert.notEqual(result.heading, original, 'Real heading must change');
        assert(result.calls.length > 0 && result.calls.every(call => call.url === origin + '/translate' && call.status === 200 && call.ok && call.provider === 'youdao'), 'All translation requests must use mainland Youdao');
        assert(!await page.locator('body').innerText().then(text => text.includes('__QILY_TOKEN_')), 'No marker residue');
        const after = await widget.boundingBox();
        assert(Math.abs(after.width - before.width) < 1 && Math.abs(after.height - before.height) < 1, 'Translator geometry changed');
        result.widget = { width: after.width, height: after.height };
        await page.screenshot({ path: path.join(destination, name + '.png'), fullPage: false });
        await widget.locator('select').selectOption('zh-CN');
        assert.equal(await page.locator('h1').first().innerText(), original);
        result.restore_original = true;
        result.ok = true;
      } catch (error) {
        failed = true;
        await Promise.all(pending);
        result.ok = false;
        result.error = String(error.message);
      } finally {
        evidence.tests.push(result);
        console.log(JSON.stringify({ browser_test: result }));
        await context.close();
      }
    }
  } finally {
    await browser.close();
    evidence.ok = !failed;
    await fs.writeFile(path.join(destination, 'browser-evidence.json'), JSON.stringify(evidence, null, 2));
  }
  assert(!failed, 'Mainland browser verification failed; see public evidence');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
