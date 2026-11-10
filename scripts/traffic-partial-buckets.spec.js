const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');

for(const config of [
  {name:'CN',origin:'https://qilylean.cn',asset:'/assets/site-traffic-daily-kline-v1.js',source:'cn-site/assets/site-traffic-daily-kline-v1.js',prefix:'qilylean_cn_pv6h_v1_'},
  {name:'International',origin:'https://qilylean.com',asset:'/site-traffic-daily-kline-v1.js',source:'site-traffic-daily-kline-v1.js',prefix:'qilylean_com_pv6h_v1_'}
]){
  test(config.name+' trend retains verified partial PV without inventing missing data',async({page})=>{
    // Beijing 2026-11-10 16:00: only slots 0, 1, 2 are eligible to be read.
    await page.clock.install();
    await page.clock.setFixedTime(new Date('2026-11-10T08:00:00Z'));
    const script=fs.readFileSync(path.join(ROOT,config.source),'utf8');
    const html='<html><head><meta charset="utf-8"></head><body><section id="traffic" data-qily-traffic-stats="v1"><div class="qily-traffic-grid"></div></section><script src="'+config.asset+'"></script></body></html>';
    await page.route(config.origin+'/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/about/')return route.fulfill({status:200,contentType:'text/html',body:html});
      if(url.pathname===config.asset)return route.fulfill({status:200,contentType:'application/javascript',body:script});
      return route.fulfill({status:404,body:'missing'});
    });
    const requested=[];
    await page.route('https://countapi.mileshilliard.com/**',route=>{
      const url=new URL(route.request().url());
      const key=decodeURIComponent(url.pathname.split('/').pop());
      requested.push(key);
      const headers={'access-control-allow-origin':'*','content-type':'application/json'};
      if(key===config.prefix+'20261110_s0')return route.fulfill({status:200,headers,body:JSON.stringify({value:8})});
      if(key===config.prefix+'20261110_s1')return route.fulfill({status:503,headers,body:'{"error":"temporary"}'});
      if(key===config.prefix+'20261110_s2')return route.fulfill({status:200,headers,body:JSON.stringify({value:12})});
      if(key===config.prefix+'20261109_s0')return route.fulfill({status:503,headers,body:'{"error":"temporary"}'});
      return route.fulfill({status:404,headers,body:'{"error":"not found"}'});
    });
    await page.goto(config.origin+'/about/',{waitUntil:'domcontentloaded'});
    await expect(page.locator('.qily-traffic-kline__svg')).toBeVisible();
    // One failed slot must not hide the two confirmed slots. ≥ signals lower bound.
    await expect(page.locator('[data-qily-kline-label="daily-pv"][data-qily-kline-day="2026-11-10"]')).toHaveText('≥20');
    await expect(page.locator('[data-qily-kline-label="high-pv"][data-qily-kline-day="2026-11-10"]')).toHaveText('≥12');
    await expect(page.locator('.qily-traffic-kline__scroll svg g title').filter({hasText:'2026-11-10'})).toContainText('已确认PV至少 20');
    // Missing past-day slot cannot be fabricated; future slot must not be requested.
    await expect(page.locator('[data-qily-kline-label="daily-pv"][data-qily-kline-day="2026-11-09"]')).toHaveCount(0);
    expect(requested).not.toContain(config.prefix+'20261110_s3');
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    expect(errors).toEqual([]);
  });
}
