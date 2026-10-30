const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MAIN=fs.readFileSync(path.join(ROOT,'cn-site/assets/site-traffic-stats-v1.js'),'utf8');
const KLINE=fs.readFileSync(path.join(ROOT,'cn-site/assets/site-traffic-daily-kline-v1.js'),'utf8');
const CSS=fs.readFileSync(path.join(ROOT,'cn-site/assets/site-traffic-stats-v1.css'),'utf8');
const html=[
'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/site-traffic-stats-v1.css"></head><body><main>',
'<section id="traffic" class="qily-traffic-section" data-qily-traffic-stats="v1" aria-labelledby="qily-traffic-title">',
'<div class="qily-traffic-heading"><span class="qily-traffic-kicker">SITE ANALYTICS</span><h2 id="qily-traffic-title">6. 中国站访问统计</h2><p class="qily-traffic-intro">中国站展示计数</p></div>',
'<div class="qily-traffic-grid" data-qily-traffic-single="true">',
'<article class="qily-traffic-site" aria-labelledby="intl-heading" hidden aria-hidden="true"><h3 id="intl-heading">QilyLean.com</h3><div><span data-qily-traffic-count="intl-total">读取中…</span></div></article>',
'<article class="qily-traffic-site" aria-labelledby="cn-heading"><div class="qily-traffic-site-header"><div><span class="qily-traffic-site-label">中国站</span><h3 id="cn-heading">QilyLean.cn</h3></div><span class="qily-traffic-live qily-traffic-scope">全站累计</span></div>',
'<div class="qily-traffic-metrics" data-qily-traffic-single-metric="true"><div class="qily-traffic-metric"><span class="qily-traffic-number" data-qily-traffic-count="cn-total" data-qily-traffic-state="loading">读取中…</span><span class="qily-traffic-label">累计展示计数 · 含初始基数</span></div>',
'<div class="qily-traffic-metric" hidden aria-hidden="true"><span data-qily-traffic-count="cn-active">读取中…</span></div></div></article>',
'</div><p class="qily-traffic-note">起始展示基数10,000次（非历史实测）</p></section></main>',
'<script defer src="/assets/site-traffic-stats-v1.js"></script></body></html>'
].join('');
for(const width of [390,1440])test('QilyLean.cn count and independent real-PV candlestick '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  const requests=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://qilylean.cn/**',route=>{
    const name=new URL(route.request().url()).pathname;
    if(name==='/about/')return route.fulfill({status:200,contentType:'text/html',body:html});
    if(name==='/assets/site-traffic-stats-v1.css')return route.fulfill({status:200,contentType:'text/css',body:CSS});
    if(name==='/assets/site-traffic-stats-v1.js')return route.fulfill({status:200,contentType:'application/javascript',body:MAIN});
    if(name==='/assets/site-traffic-daily-kline-v1.js')return route.fulfill({status:200,contentType:'application/javascript',body:KLINE});
    return route.fulfill({status:404,body:'Not found'});
  });
  await page.route('https://countapi.mileshilliard.com/**',route=>{
    const url=new URL(route.request().url()),pathname=url.pathname;
    requests.push(pathname);
    const headers={'access-control-allow-origin':'*','content-type':'application/json'};
    const bucket=pathname.includes('qilylean_cn_pv6h_v1_');
    const isHit=pathname.includes('/hit/');
    if(bucket){
      if(isHit)return route.fulfill({status:200,headers,body:JSON.stringify({value:2})});
      const slot=Number(pathname.match(/_s([0-3])$/)?.[1]);
      const current=Math.floor(new Date(Date.now()+8*3600000).getUTCHours()/6);
      if(slot===current)return route.fulfill({status:200,headers,body:JSON.stringify({value:2})});
      return route.fulfill({status:404,headers,body:JSON.stringify({error:'Counter not found'})});
    }
    return route.fulfill({status:200,headers,body:JSON.stringify({value:143})});
  });
  await page.goto('https://qilylean.cn/about/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-qily-traffic-count="cn-total"]')).toHaveText('10,143',{timeout:20000});
  await expect(page.locator('.qily-traffic-kline__svg')).toBeVisible({timeout:20000});
  await expect(page.locator('.qily-traffic-kline__status')).toHaveCount(0);
  await expect(page.locator('.qily-traffic-note')).toBeHidden();
  await expect(page.locator('.qily-traffic-intro')).toBeHidden();
  await expect(page.locator('.qily-traffic-kline__foot')).toHaveCount(0);
  await expect(page.locator('.qily-traffic-kline__info')).toHaveCount(0);
  await expect(page.locator('.qily-traffic-kline')).toHaveCSS('background-color','rgb(244, 249, 247)');
  await expect(page.locator('.qily-traffic-site:not([hidden]) .qily-traffic-label')).toHaveText('累计展示量');
  await expect(page.locator('.qily-traffic-site:not([hidden]) .qily-traffic-label')).toHaveCSS('font-size','20px');
  await expect(page.locator('.qily-traffic-kline__legend')).toHaveCSS('font-size','20px');
  await expect(page.locator('.qily-traffic-kline__actions button').first()).toHaveCSS('font-size','20px');
  await expect(page.locator('[data-qily-kline-label="high-pv"]').first()).toHaveAttribute('font-size','18');
  await expect(page.locator('[data-qily-kline-label="daily-pv"]').first()).toHaveAttribute('font-size','18');
  await expect(page.locator('[data-qily-traffic-count="cn-total"]')).toHaveAttribute('data-qily-traffic-recorded-pv','143');
  await expect(page.locator('[data-qily-traffic-count="intl-total"]').locator('xpath=ancestor::article')).toBeHidden();
  await expect(page.locator('.qily-traffic-kline__scroll svg g title').last()).toContainText('日PV 2');
  await page.getByRole('button',{name:'近14日'}).click();
  await expect(page.getByRole('button',{name:'近14日'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.qily-traffic-kline__status')).toHaveCount(0);
  const vi=await page.locator('#traffic .qily-traffic-kline__head h3').evaluate(el=>getComputedStyle(el).color);
  expect(vi).toBe('rgb(15, 75, 90)');
  const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport+2);
  expect(errors).toEqual([]);
  expect(requests.some(p=>p.includes('/hit/qilylean_cn_sitewide_pageviews_20261029'))).toBe(true);
  expect(requests.some(p=>p.includes('/hit/qilylean_cn_pv6h_v1_'))).toBe(true);
  expect(requests.some(p=>p.includes('qilylean_com_'))).toBe(false);
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  await page.locator('#traffic').screenshot({path:path.join(ROOT,'test-results','cn-kline-'+width+'.png')});
});