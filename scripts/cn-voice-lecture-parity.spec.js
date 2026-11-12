const { test, expect } = require('@playwright/test');

const cases = [
  { source: '/qilylean/daily/2026-11-08.html', china: '/briefs/archive/2026-11-08/', chapters: 10 },
  { source: '/qilylean/daily/2026-10-25.html', china: '/briefs/archive/2026-10-25/', chapters: 12 },
  { source: '/improvements/visual/index.html', china: '/archive/improvements/visual/', chapters: 9 },
];

const computedProperties = [
  'backgroundColor', 'color', 'borderColor', 'borderTopColor', 'borderTopWidth',
  'borderRadius', 'boxShadow', 'fontFamily', 'fontSize', 'fontWeight',
  'lineHeight', 'padding', 'gap', 'display', 'position', 'zIndex', 'bottom',
];
const computedSelectors = [
  '#qilyLecPlayer',
  '#qilyLecPlayer .player-inner',
  '#qilyLecPlayer .p-btn.main',
  '#qilyLecPlayer .p-sub',
  '#qilyLecMini',
];

async function playerSnapshot(page) {
  return page.evaluate(({ selectors, properties }) => {
    const snapshot = {};
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) {
        snapshot[selector] = null;
        continue;
      }
      const style = getComputedStyle(element);
      snapshot[selector] = Object.fromEntries(properties.map(property => [property, style[property]]));
    }
    return snapshot;
  }, { selectors: computedSelectors, properties: computedProperties });
}

function normalizeAudioPaths(runtime) {
  return runtime.replace(
    /src\s*:\s*["'][^"']+\.mp3\.b64(?:\?v=[0-9a-f]+)?["']/g,
    'src:"__LOCAL_CHAPTER_AUDIO__"',
  );
}

function normalizeMarkup(markup) {
  // CN's shared interaction-semantics runtime adds this nonvisual marker to controls.
  return markup.replace(/\sdata-qily-(?:interaction|arrow-closure)=["'][^"']*["']/g, '');
}

test('China voice lectures use the latest international player and play local audio', async ({ browser }) => {
  const internationalBase = process.env.QILY_INT_BASE;
  const chinaBase = process.env.QILY_CN_BASE;
  expect(internationalBase).toBeTruthy();
  expect(chinaBase).toBeTruthy();

  for (const item of cases) {
    const international = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const china = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const localAudioFailures = [];
    china.on('requestfailed', request => {
      if (request.url().includes('/assets/public-media/')) localAudioFailures.push(request.url());
    });

    await Promise.all([
      international.goto(internationalBase + item.source, { waitUntil: 'domcontentloaded' }),
      china.goto(chinaBase + item.china, { waitUntil: 'domcontentloaded' }),
    ]);

    await expect(international.locator('#qilyLecPlayer')).toBeAttached();
    await expect(china.locator('#qilyLecPlayer')).toBeAttached();

    const internationalCss = await international.locator('#qilyLectureStyle').textContent();
    const chinaCss = await china.locator('style[data-cn-lecture-css="v1"]').textContent();
    expect(chinaCss).toBe(internationalCss);

    for (const selector of ['#qily-lecture', '#qilyLecPlayer', '#qilyLecMini', '#qilyLecAudio']) {
      const sourceMarkup = await international.locator(selector).evaluate(element => element.outerHTML);
      const chinaMarkup = await china.locator(selector).evaluate(element => element.outerHTML);
      expect(normalizeMarkup(chinaMarkup), selector + ' visual markup must match the international source exactly')
        .toBe(normalizeMarkup(sourceMarkup));
    }

    const internationalRuntime = await international.evaluate(() =>
      Array.from(document.scripts).find(script => script.textContent.includes('function fetchChapterData'))?.textContent || '',
    );
    const chinaRuntime = await china.evaluate(() =>
      Array.from(document.scripts).find(script => script.getAttribute('data-cn-lecture-runtime') === 'v1')?.textContent || '',
    );
    expect(internationalRuntime).toContain('v2.6.1');
    expect(chinaRuntime).toContain('v2.6.1');
    expect(normalizeAudioPaths(chinaRuntime)).toBe(normalizeAudioPaths(internationalRuntime));

    const chapterSources = await china.evaluate(() => window.CHAPTERS.map(chapter => chapter.src));
    expect(chapterSources).toHaveLength(item.chapters);
    expect(chapterSources.every(source => source.startsWith('/assets/public-media/') && source.includes('.mp3.b64?v='))).toBe(true);

    const internationalSnapshot = await playerSnapshot(international);
    const chinaSnapshot = await playerSnapshot(china);
    expect(chinaSnapshot, 'player computed styles must match the international page').toEqual(internationalSnapshot);

    const audioResponsePromise = china.waitForResponse(response =>
      response.url().includes('/assets/public-media/') && response.url().includes('.mp3.b64?'),
    );
    await china.locator('#qilyLecPlayBtn').click();
    const audioResponse = await audioResponsePromise;
    expect(audioResponse.status()).toBe(200);
    const audioPackage = await audioResponse.body();
    expect(audioPackage.toString('utf8').trim().slice(0, 3)).toBe('SUQ');

    await china.waitForFunction(() => {
      const audio = document.querySelector('#qilyLecAudio');
      const status = document.querySelector('#qilyLecNowStep')?.textContent || '';
      return audio && audio.readyState >= 2 && !audio.paused && audio.currentTime > 0.05 && !status.includes('加载失败');
    }, null, { timeout: 20000 });

    expect(localAudioFailures).toEqual([]);
    await china.evaluate(() => document.querySelector('#qilyLecAudio')?.pause());
    await international.close();
    await china.close();
  }
});
