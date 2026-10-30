const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MAIN=fs.readFileSync(path.join(ROOT,'site-traffic-stats-v1.js'),'utf8');
const KLINE=fs.readFileSync(path.join(ROOT,'site-traffic-daily-kline-v1.js'),'utf8');
const CSS=fs.readFileSync(path.join(ROOT,'site-traffic-stats-v1.css'),'utf8');
const html=[
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/site-traffic-stats-v1.css"></head><body><main>',
  '<section id="traffic" class="qily-traffic-section" data-qily-traffic-stats="v1" aria-labelledby="qily-traffic-title">',
  '<div class="qily-traffic-heading"><span class="qily-traffic-kicker">SITE ANALYTICS</span><h2 id="qily-traffic-title">6. 网站访问统计</h2><p class="qily-traffic-intro">原始说明</p></div>',
  '<div class="qily-traffic-grid"><article class="qily-traffic-site">',
  '<div class="qily-traffic-site-header"><div><span class="qily-traffic-site-label">国际站</span><h3>QilyLean.com</h3></div><span class="qily-traffic-live">近实时</span></div>',
  '<div class="qily-traffic-metrics"><div class="qily-traffic-metric"><span class="qily-traffic-number" data-qily-traffic-count="intl-total">读取中…</span><span class="qily-traffic-label">累计页面浏览量</span></div>',
  '<div class="qily-traffic-metric"><span data-qily-traffic-count="intl-active">读取中…</span><span class="qily-traffic-label">独立访客</span></div></div></article>',
  '<article class="qily-traffic-site"><h3>QilyLean.cn</h3><span data-qily-traffic-count="cn-total">读取中…</span></article></div>',
  '<p class="qily-traffic-note"></p></section></main><script defer src="/site-traffic-stats-v1.js"></script></body></html>'
].join('');

for(const width of [390,1440])test('International daily Kline chart uses real PV at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:900});
  const requests=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://qilylean.com/**',route=>{
    const pathname=new URL(route.request().url()).pathname;
    if(pathname==='/about/')return route.fulfill({status:200,contentType:'text/html',body:html});
    if(pathname==='/site-traffic-stats-v1.css')return route.fulfill({status:200,contentType:'text/css',body:CSS});
    if(pathname==='/site-traffic-stats-v1.js')return route.fulfill({status:200,contentType:'application/javascript',body:MAIN});
    if(pathname==='/site-traffic-daily-kline-v1.js')return route.fulfill({status:200,contentType:'application/javascript',body:KLINE});
    return route.fulfill({status:404,body:'Not found'});
  });
  await page.route('https://countapi.mileshilliard.com/**',route=>{
    const pathname=new URL(route.request().url()).pathname;
    requests.push(pathname);
    const headers={'access-control-allow-origin':'*','content-type':'application/json'};
    const isBucket=pathname.includes('qilylean_com_pv6h_v1_');
    const isHit=pathname.includes('/hit/');
    if(isBucket){
      if(isHit)return route.fulfill({status:200,headers,body:JSON.stringify({value:2})});
      const slot=Number(pathname.match(/_s([0-3])$/)?.[1]);
      const nowSlot=Math.floor(new Date(Date.now()+8*3600000).getUTCHours()/6);
      if(slot===nowSlot)return route.fulfill({status:200,headers,body:JSON.stringify({value:2})});
      return route.fulfill({status:404,headers,body:JSON.stringify({error:'Counter not found'})});
    }
    return route.fulfill({status:200,headers,body:JSON.stringify({value:143})});
  });
  await page.goto('https://qilylean.com/about/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-qily-traffic-count="intl-total"]')).toHaveText('15,143',{timeout:20000});
  await expect(page.locator('.qily-traffic-kline__svg')).toBeVisible({timeout:20000});
  await expect(page.locator('.qily-traffic-kline__status')).toHaveCount(0);
  await expect(page.locator('#traffic .qily-traffic-grid')).toHaveAttribute('data-qily-traffic-single','true');
  await expect(page.locator('[data-qily-traffic-count="cn-total"]').locator('xpath=ancestor::article')).toBeHidden();
  await expect(page.locator('.qily-traffic-note')).toBeHidden();
  await expect(page.locator('.qily-traffic-intro')).toBeHidden();
  await expect(page.locator('.qily-traffic-kline__foot')).toHaveCount(0);
  await expect(page.locator('.qily-traffic-kline__info')).toHaveCount(0);
  await expect(page.locator('[data-qily-traffic-count="intl-total"]')).toHaveAttribute('data-qily-traffic-recorded-pv','143');
  await expect(page.locator('.qily-traffic-kline__scroll svg g title').last()).toContainText('日PV 2');
  await expect(page.locator('#traffic [data-qily-kline-label="high-pv"]').first()).toHaveText('2');
  await expect(page.locator('#traffic [data-qily-kline-label="daily-pv"]').first()).toHaveText('2');
  await expect(page.locator('#traffic .qily-traffic-kline__info')).toHaveCount(0);
  await expect(page.locator('#traffic .qily-traffic-kline')).toHaveCSS('background-color','rgb(244, 249, 247)');
  await expect(page.locator('#traffic .qily-traffic-site:not([hidden]) .qily-traffic-label').first()).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic .qily-traffic-kline__legend')).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic .qily-traffic-kline__actions button').first()).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic [data-qily-kline-label="high-pv"]').first()).toHaveAttribute('font-size','18');
  await expect(page.locator('#traffic [data-qily-kline-label="daily-pv"]').first()).toHaveAttribute('font-size','18');
  await page.getByRole('button',{name:'近14日'}).click();
  await expect(page.getByRole('button',{name:'近14日'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.qily-traffic-kline__status')).toHaveCount(0);
  const computed=await page.locator('#traffic .qily-traffic-kline__head h3').evaluate(el=>({
    color:getComputedStyle(el).color,fill:getComputedStyle(el).webkitTextFillColor
  }));
  expect(computed.color).toBe('rgb(15, 75, 90)');
  const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+2);
  expect(errors).toEqual([]);
  expect(requests.some(p=>p.includes('qilylean_com_pv6h_v1_')&&p.includes('/hit/'))).toBe(true);
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  await page.locator('#traffic').screenshot({path:path.join(ROOT,'test-results','intl-kline-'+width+'.png')});
});