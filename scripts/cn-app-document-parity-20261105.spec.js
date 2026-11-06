const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const intl = process.env.QILY_INT_BASE || 'http://127.0.0.1:4173';
const cn = process.env.QILY_CN_BASE || 'http://127.0.0.1:4174';
const widths = [1440, 820, 390, 320];
const docs = [
  ['times-privacy', '/legal/times26001/privacy/', '/legal/times26001/privacy/'],
  ['times-terms', '/legal/times26001/terms/', '/legal/times26001/terms/'],
  ['app-support', '/app-support/', '/app-support/'],
  ['app-support-home-alias', '/app-support/', '/app-support/qilylean-cn-home/'],
  ['home-privacy', '/legal/qilylean-home/privacy/', '/legal/qilylean-cn-home/privacy/'],
  ['home-terms', '/legal/qilylean-home/terms/', '/legal/qilylean-cn-home/terms/'],
];
const clean = value => value.replace(/\s+/gu, ' ').trim();
function expectedText(text, name) {
  let result = text.replaceAll('https://qilylean.com/', 'https://qilylean.cn/');
  if (name.startsWith('app-support')) {
    result = result
      .replace('当前国际站正式签名验收版', '当前双站官网正式签名验收版')
      .replace('当前官网安装包 / 最新构建 v2.3.3 / versionCode 11 / targetSdk 36；腾讯应用宝首发候选版 v2.3.3 / versionCode 11 / targetSdk 36。', '中国站桌面现有可安装包 v1.0.0 / versionCode 1 / Android API 36（包名 cn.qilylean.home）；用户确认三星手机已安装并在使用。中国站与国际站 QilyLean Home 各自独立管理版本。')
      .replace(/QilyLean Home\s+官网通用桌面/u, 'QilyLean Home · 中国站桌面 官网通用桌面')
      .replace('设为桌面：按Home键后选择QilyLean Home并选择“始终”。', '设为桌面：按Home键后选择“精益制造经验分享”并选择“始终”。')
      .replace('当前官网安装包、最新构建与应用市场候选状态以统一发布清单为准。', '当前中国站安装包与应用市场候选状态以各自真实发布记录为准。');
  }
  if (name.startsWith('home-')) {
    result = result
      .replace(/生效日期：\s*2026年8月6日\s*/u, '')
      .replaceAll('V1.0', 'v1.0.0（versionCode 1 / API 36；包名 cn.qilylean.home）')
      .replaceAll('QilyLean Home', '精益制造经验分享');
  }
  return clean(result);
}
async function ready(page, base, route, width) {
  await page.setViewportSize({ width, height: 980 });
  // Keep third-party translation/tracking independent of layout acceptance.
  await page.route('**/*', request => {
    const url = new URL(request.request().url());
    return url.origin === new URL(base).origin || url.protocol === 'data:'
      ? request.continue() : request.abort();
  });
  const url = new URL(base + route);
  if (base === cn && process.env.GITHUB_SHA) url.searchParams.set('release', process.env.GITHUB_SHA);
  const response = await page.goto(url.href, { waitUntil: 'networkidle' });
  expect(response.status(), route + ' HTTP success').toBe(200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  // The accepted source runtime makes its final R8 cascade pass at 1400ms.
  if (base === intl) {
    await page.waitForTimeout(1600);
    await page.waitForFunction(() => !document.getElementById('qilyVisualAuthorityR8') ||
      [...document.head.querySelectorAll('link[rel="stylesheet"]')].filter(el =>
        new URL(el.href, location.href).origin === location.origin).at(-1)?.id === 'qilyVisualAuthorityR8');
  }
}
async function documentMetrics(page, isCn) {
  return page.evaluate(isCn => {
    const hero = document.querySelector(isCn ? 'main[data-cn-app-document] > .hero' : 'body > .hero');
    const wrap = document.querySelector(isCn ? '.qily-app-document-wrap' : 'main.wrap');
    if (!hero || !wrap) throw Error('Accepted product-document structure is missing');
    const keys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'webkitFontSmoothing', 'textAlign', 'marginTop', 'marginBottom', 'color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderTopWidth', 'borderLeftColor', 'borderLeftWidth', 'borderRadius', 'boxShadow', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'boxSizing', 'display', 'gridTemplateColumns'];
    const metric = node => {
      const r = node.getBoundingClientRect(), s = getComputedStyle(node);
      return { x: r.x, width: r.width, height: r.height, top: r.top - hero.getBoundingClientRect().top, style: Object.fromEntries(keys.map(key => [key, s[key]])) };
    };
    const nodes = [hero, hero.querySelector('.top-inner'), ...hero.querySelectorAll('.eyebrow,h1,p'), wrap,
      ...wrap.querySelectorAll('.meta,.notice,.card,.grid,h2,h3,p,li')];
    return {
      heroText: hero.innerText, bodyText: wrap.innerText,
      metrics: nodes.filter(n => n && getComputedStyle(n).display !== 'none').map(metric),
      scrollWidth: document.documentElement.scrollWidth,
      links: [...wrap.querySelectorAll('a[href]')].map(a => ({ text: a.innerText, href: a.getAttribute('href') })),
      cardCount: wrap.querySelectorAll('.card').length,
      overflow: [...wrap.querySelectorAll('h1,h2,h3,p,li,.meta,.notice')].filter(node => {
        const r = node.getBoundingClientRect();
        return r.width && (r.left < -1 || r.right > innerWidth + 1);
      }).map(node => ({ tag: node.tagName, text: node.textContent.slice(0, 60) })),
    };
  }, isCn);
}
async function evidence(page, testInfo, filename) {
  if (!process.env.QILY_APP_EVIDENCE_DIR) return;
  fs.mkdirSync(process.env.QILY_APP_EVIDENCE_DIR, { recursive: true });
  const target = path.join(process.env.QILY_APP_EVIDENCE_DIR, filename);
  await page.screenshot({ path: target, fullPage: false });
  await testInfo.attach(filename, { path: target, contentType: 'image/png' });
}
function compareMetrics(reference, actual, context) {
  expect(actual.length, context + ' semantic element count').toBe(reference.length);
  for (let index = 0; index < reference.length; index++) {
    const a = actual[index], b = reference[index];
    // CN's outer shell may change vertical position; its content axis must match.
    expect(Math.abs(a.x - b.x), `${context} element ${index} horizontal axis`).toBeLessThanOrEqual(1.5);
    expect(Math.abs(a.width - b.width), `${context} element ${index} content width`).toBeLessThanOrEqual(1.5);
    expect(a.style, `${context} element ${index} typography and surfaces`).toEqual(b.style);
  }
}
for (const [name, sourceRoute, targetRoute] of docs) {
  for (const width of widths) {
    test(`${name}: accepted international content and VI at ${width}px`, async ({ browser }, testInfo) => {
      const source = await browser.newPage(), target = await browser.newPage();
      try {
        await Promise.all([ready(source, intl, sourceRoute, width), ready(target, cn, targetRoute, width)]);
        const [a, b] = await Promise.all([documentMetrics(source, false), documentMetrics(target, true)]);
        expect(clean(b.heroText), name + ' complete hero text').toBe(expectedText(a.heroText, name));
        expect(clean(b.bodyText), name + ' complete document text').toBe(expectedText(a.bodyText, name));
        expect(b.cardCount).toBe(a.cardCount);
        expect(b.scrollWidth, name + ' document overflow').toBeLessThanOrEqual(width + 1);
        expect(b.overflow, name + ' reading content stays within viewport').toEqual([]);
        compareMetrics(a.metrics, b.metrics, name + ' ' + width);
        if (name.startsWith('times-')) for (let i = 0; i < a.metrics.length; i++) {
          expect(Math.abs(a.metrics[i].height - b.metrics[i].height), name + ' element ' + i + ' exact text flow height').toBeLessThanOrEqual(1.5);
          expect(Math.abs(a.metrics[i].top - b.metrics[i].top), name + ' element ' + i + ' exact vertical spacing').toBeLessThanOrEqual(1.5);
        }
        for (const link of b.links) {
          expect(link.href, name + ' no international product link').not.toMatch(/^https?:\/\/(?:www\.)?qilylean\.com(?:\/|$)/);
          if (/^https?:/i.test(link.href)) expect(new URL(link.href).hostname).toBe('qilylean.cn');
        }
        if ([1440, 390].includes(width)) {
          await evidence(source, testInfo, `${name}-${width}-international.png`);
          await evidence(target, testInfo, `${name}-${width}-china.png`);
        }
      } finally { await source.close(); await target.close(); }
    });
  }
}
for (const width of widths) {
  test(`APP capability cards preserve source layout and local CN installer at ${width}px`, async ({ browser }, testInfo) => {
    const source = await browser.newPage(), target = await browser.newPage();
    try {
      await Promise.all([ready(source, intl, '/capabilities/', width), ready(target, cn, '/archive/profile/capabilities/', width)]);
      const collect = page => page.locator('#times26001').evaluate(card => {
        const keys = ['fontSize', 'fontWeight', 'lineHeight', 'color', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderRadius', 'display', 'gridTemplateColumns'];
        return { text: card.innerText, items: [card, ...card.querySelectorAll('figure,.capability-digital-content,h3,p,.module-actions,a')].map(node => {
          const r = node.getBoundingClientRect(), s = getComputedStyle(node);
          return { width: r.width, x: r.x, style: Object.fromEntries(keys.map(p => [p,s[p]])) };
        }) };
      });
      const [a,b] = await Promise.all([collect(source), collect(target)]);
      expect(clean(b.text)).toBe(clean(a.text));
      compareMetrics(a.items,b.items,'Times card '+width);
      const home = target.locator('#qilylean-home');
      await expect(home).toContainText('v1.0.0');
      await expect(home).toContainText('versionCode 1');
      await expect(home).toContainText('cn.qilylean.home');
      await expect(home).not.toContainText('v2.3.3');
      await expect(home.getByRole('link', { name: '下载 Android APK', exact: true })).toHaveAttribute('href', /QilyLean_CN_Home_v1\.0\.0_API36_INSTALL\.apk/);
      await expect(home.getByRole('link', { name: '隐私政策', exact: true })).toHaveAttribute('href', '/legal/qilylean-cn-home/privacy/');
      await expect(home.getByRole('link', { name: '用户协议', exact: true })).toHaveAttribute('href', '/legal/qilylean-cn-home/terms/');
      expect(await target.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      await target.locator('#times26001').scrollIntoViewIfNeeded();
      if ([1440,390].includes(width)) await evidence(target,testInfo,`app-cards-${width}-china.png`);
    } finally { await source.close(); await target.close(); }
  });
}

for (const width of [1440, 390]) {
  for (const product of [
    { id: 'times26001', url: 'https://qilylean.cn/archive/tools/times26001/#android-download', qr: '/assets/times26001-v1115-cn-qr.svg', file: 'Times26001_v1.1.15_API36_website_release.apk' },
    { id: 'qilylean-home', url: 'https://qilylean.cn/archive/profile/capabilities/#qilylean-home', qr: '/assets/qilylean-cn-home-download-qr.svg', file: 'QilyLean_CN_Home_v1.0.0_API36_INSTALL.apk' },
  ]) {
    test(`${product.id}: QR, clipboard fallback and real APK download at ${width}px`, async ({ browser }, testInfo) => {
      const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
      const page = await context.newPage();
      await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }));
      try {
        await ready(page, cn, '/archive/profile/capabilities/', width);
        const card = page.locator('#' + product.id);
        await card.locator('.module-actions a').filter({ hasText: /^扫码下载$/ }).click();
        const dialog = page.locator('#qilyAppShareDialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('#qilyAppShareUrl')).toHaveText(product.url);
        await expect(dialog.locator('#qilyAppShareQr')).toHaveAttribute('src', product.qr);
        await expect.poll(() => dialog.locator('#qilyAppShareQr').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
        expect(await dialog.evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })).toBe(true);
        await dialog.getByRole('button', { name: '复制下载页链接', exact: true }).click();
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(product.url);
        await dialog.getByRole('button', { name: '分享下载页', exact: true }).click();
        await expect(page.locator('.app-share-toast')).toHaveText('下载页链接已复制');
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(product.url);
        await evidence(page, testInfo, `${product.id}-qr-${width}-china.png`);
        const downloaded = page.waitForEvent('download');
        await dialog.getByRole('button', { name: '直接下载 APK', exact: true }).click();
        const download = await downloaded;
        expect(download.suggestedFilename()).toBe(product.file);
        const actual = crypto.createHash('sha256').update(fs.readFileSync(await download.path())).digest('hex');
        const expected = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', product.file))).digest('hex');
        expect(actual, 'browser download preserves accepted package bytes').toBe(expected);
        if (product.id === 'qilylean-home') expect(actual).toBe('9067a6afad39912c45ce820a09ccfa2ed14ea98af78232ffbc6f46ec4a58a36f');
        await dialog.getByRole('button', { name: '关闭', exact: true }).click();
        await expect(dialog).not.toBeVisible();
        await card.locator('.module-actions a').filter({ hasText: /^分享下载页$/ }).click();
        await expect(page.locator('.app-share-toast')).toHaveText('下载页链接已复制');
        await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(product.url);
      } finally { await context.close(); }
    });
  }
}
