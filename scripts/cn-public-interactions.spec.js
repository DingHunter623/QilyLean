const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const ROOT=fs.realpathSync(process.cwd());
const CN=path.join(ROOT,'cn-site');
const BASE=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const ORIGIN=new URL(BASE).origin;
const TERM='/archive/knowledge/terminology/';
const INDEX='/archive/global-knowledge/briefs/';
const PUBLIC=JSON.parse(fs.readFileSync(path.join(CN,'archive/public-interactions.json'),'utf8'));
const LESSONS=PUBLIC.terminology_lessons;
const BRIEF_COUNT=fs.readdirSync(path.join(CN,'briefs/archive')).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).length;
const failures=new WeakMap();
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.qly':'application/octet-stream','.mp4':'video/mp4','.webm':'video/webm'};

// Production /mirror-media/ proxies an explicitly resolved repository asset.
// Serve those same real bytes in CI; missing files fail rather than becoming
// synthetic images or a tolerant mock response.
function repositoryAsset(url){
  const pathname=decodeURIComponent(new URL(url).pathname);
  const relative=pathname.slice('/mirror-media/'.length);
  if(!relative||relative.split('/').includes('..')||relative.includes('\0'))throw new Error('Unsafe mirror asset '+pathname);
  const resolved=fs.realpathSync(path.resolve(ROOT,relative));
  if(!resolved.startsWith(ROOT+path.sep)||!fs.statSync(resolved).isFile()||!mime[path.extname(resolved).toLowerCase()])throw new Error('Unapproved mirror asset '+pathname);
  return resolved;
}

test.setTimeout(60_000);
test.beforeEach(async({page})=>{
  const missing=[];
  failures.set(page,missing);
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==ORIGIN)return route.abort('blockedbyclient');
    if(!url.pathname.startsWith('/mirror-media/'))return route.continue();
    try{
      const file=repositoryAsset(url.href);
      await route.fulfill({status:200,contentType:mime[path.extname(file).toLowerCase()],body:fs.readFileSync(file)});
    }catch(error){
      missing.push(String(error));
      await route.fulfill({status:404,contentType:'text/plain',body:'Required repository mirror asset is missing'});
    }
  });
  await page.addInitScript(()=>{
    window.__qilyPublicPrintCalls=0;
    window.print=()=>{window.__qilyPublicPrintCalls++;};
  });
});
test.afterEach(async({page})=>{
  expect(failures.get(page)||[],'every requested mirror asset exists in the repository').toEqual([]);
});

async function open(page,route){
  const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
  expect(response&&response.ok(),route+' loads from the generated CN root').toBeTruthy();
}

for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  test.describe(device.name,()=>{
    test.use({viewport:{width:device.width,height:device.height},isMobile:device.name==='mobile'});

    test('terminology search handles a match, no results and clearing',async({page})=>{
      await open(page,TERM);
      const search=page.locator('#termSearch');
      const results=page.locator('#termSearchGrid .term-search-hit');
      await expect(search).toBeVisible();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
      await search.fill('ＳＭＥＤ');
      await expect.poll(()=>results.count()).toBeGreaterThan(0);
      await expect(results.first().locator('.term-code')).toHaveText('SMED');
      await expect(page.locator('#termCount')).toContainText('找到');
      await search.fill('__CN_NO_SUCH_TERM_20261012__');
      await expect(page.locator('#termEmpty')).toBeVisible();
      await expect(results).toHaveCount(0);
      await expect(page.locator('#termCount')).toHaveText('未找到相关术语');
      await search.fill('');
      await expect(page.locator('#termEmpty')).toBeHidden();
      await expect(page.locator('.term-search-results')).toBeHidden();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
      await expect(page.locator('#engineering')).toBeVisible();
    });

    test('SMED deep link opens its lesson and returns to the full list',async({page})=>{
      await open(page,TERM+'?opl=SMED#engineering');
      const modal=page.locator('#termOplModal');
      await expect(modal).toBeVisible();
      await expect(page.locator('#termOplTitle')).toContainText('SMED｜');
      await expect(page.locator('#termOplPage')).toContainText('／'+LESSONS);
      await expect(page.locator('#termOplContent')).toContainText('制造现场案例');
      await expect(page.locator('header.site-header')).toBeVisible();
      await expect(modal.locator('a[href^="mailto:"],a[href^="tel:"],.term-opl-contact-card')).toHaveCount(0);
      await modal.locator('[data-opl-print]').click();
      await expect.poll(()=>page.evaluate(()=>window.__qilyPublicPrintCalls)).toBe(1);
      await modal.locator('[data-opl-close].term-opl-close').click();
      await expect(page).toHaveURL(BASE+TERM);
      await expect(page.locator('#termSearch')).toBeVisible();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
    });

    for(const entry of [
      {name:'factory plans',route:'/archive/practice/factory-layout/',selector:'button[data-plan-preview]',count:9},
      {name:'organization previews',route:'/archive/reference/production-operations-organization/',selector:'button.preview-open',count:29},
    ]){
      test(entry.name+' switch, close and restore keyboard focus',async({page})=>{
        await open(page,entry.route);
        const triggers=page.locator('.mirror-article-fidelity '+entry.selector);
        await expect(triggers).toHaveCount(entry.count);
        const trigger=triggers.first();
        await trigger.click();
        const viewer=page.locator('.qily-public-preview');
        await expect(viewer).toBeVisible();
        await expect.poll(()=>viewer.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
        const firstTitle=await viewer.locator('h2').textContent();
        await viewer.locator('[data-preview-action="previous"]').click();
        await expect(viewer.locator('h2')).not.toHaveText(firstTitle);
        await expect.poll(()=>viewer.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
        await expect(viewer.locator('[role="status"]')).toContainText('第 '+entry.count+' / '+entry.count+' 张');
        await viewer.locator('[data-preview-action="close"]').click();
        await expect(viewer).toBeHidden();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.keyboard.press('Escape');
        await expect(viewer).toBeHidden();
        await expect(trigger).toBeFocused();
      });
    }

    test('historical lesson print controls call the browser print action',async({page})=>{
      for(const route of ['/archive/knowledge/pdca-gantt-milestone-opl/','/archive/knowledge/terminology/mtbf/','/archive/knowledge/terminology/mttr/']){
        await open(page,route);
        const button=page.locator('.mirror-article-fidelity button[data-public-print]');
        await expect(button).toHaveCount(1);
        await expect(button).toBeVisible();
        await button.click();
        await expect.poll(()=>page.evaluate(()=>window.__qilyPublicPrintCalls)).toBe(1);
      }
    });

    test('local brief index restores q filtering and date navigation',async({page})=>{
      await open(page,INDEX+'?q=SMED');
      await expect(page.locator('#cnPublicBriefSearch')).toHaveValue('SMED');
      const visible=page.locator('[data-brief-date]:visible');
      await expect.poll(()=>visible.count()).toBeGreaterThan(0);
      expect(await visible.count()).toBeLessThan(BRIEF_COUNT);
      await expect(page.locator('#cnPublicBriefCount')).toContainText('相关简报');
      await page.locator('#cnPublicBriefSearch').fill('');
      await expect(visible).toHaveCount(BRIEF_COUNT);
      await open(page,INDEX+'?date=2026-08-25');
      await expect(page).toHaveURL(BASE+'/briefs/archive/2026-08-25/');
      await expect(page.locator('main#main[data-qily-brief-content="v2"]')).toBeVisible();
    });
  });
}

test('all 44 reference canvases have real assets and each collection draws its first page',async({page})=>{
  const collections=[
    {route:'/archive/reference/reference-audit-documents/',count:11,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-iatf16949-core-tools/',count:6,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-materials/',count:13,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-one-piece-flow/',count:14,key:'QilyLeanFlowPreview2026'},
  ];
  let checked=0;
  for(const collection of collections){
    await open(page,collection.route);
    const canvases=page.locator('.mirror-article-fidelity canvas[data-src]');
    await expect(canvases).toHaveCount(collection.count);
    const assets=await canvases.evaluateAll(nodes=>nodes.map(n=>({src:n.getAttribute('data-src'),key:n.getAttribute('data-preview-key')})));
    for(const asset of assets){
      expect(asset.src).toMatch(/^\/mirror-media\/qilylean\/reference\/[^?#]+\.qly$/);
      expect(asset.key).toBe(collection.key);
      const bytes=fs.readFileSync(repositoryAsset(new URL(asset.src,BASE).href));
      expect(bytes.length).toBeGreaterThan(1000);
      expect(bytes[0]^asset.key.charCodeAt(0),'reference asset decodes to JPEG').toBe(0xff);
      expect(bytes[1]^asset.key.charCodeAt(1),'reference asset decodes to JPEG').toBe(0xd8);
      checked++;
    }
    const first=canvases.first();
    await first.scrollIntoViewIfNeeded();
    await expect(first).toHaveAttribute('data-loaded','1',{timeout:15000});
    const drawn=await first.evaluate(canvas=>({width:canvas.width,height:canvas.height,alpha:canvas.getContext('2d').getImageData(0,0,1,1).data[3]}));
    expect(drawn.width).toBeGreaterThan(500);
    expect(drawn.height).toBeGreaterThan(500);
    expect(drawn.alpha).toBe(255);
  }
  expect(checked).toBe(44);
});
