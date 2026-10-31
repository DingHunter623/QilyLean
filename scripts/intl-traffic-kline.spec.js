const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MAIN=fs.readFileSync(path.join(ROOT,'site-traffic-stats-v1.js'),'utf8');
const KLINE=fs.readFileSync(path.join(ROOT,'site-traffic-daily-kline-v1.js'),'utf8');
const CSS=fs.readFileSync(path.join(ROOT,'site-traffic-stats-v1.css'),'utf8');
const html=[
  '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans CJK SC","PingFang SC","Microsoft YaHei",Arial,sans-serif;font-size:18px;line-height:1.72}</style><link rel="stylesheet" href="/site-traffic-stats-v1.css"></head><body><main>',
  '<section id="traffic" class="qily-traffic-section" data-qily-traffic-stats="v1" aria-labelledby="qily-traffic-title">',
  '<div class="qily-traffic-heading"><span class="qily-traffic-kicker">SITE ANALYTICS</span><h2 id="qily-traffic-title">6. 网站访问统计</h2><p class="qily-traffic-intro">原始说明</p></div>',
  '<div class="qily-traffic-grid"><article class="qily-traffic-site">',
  '<div class="qily-traffic-site-header"><div><span class="qily-traffic-site-label">国际站</span><h3>QilyLean.com</h3></div><span class="qily-traffic-live">近实时</span></div>',
  '<div class="qily-traffic-metrics"><div class="qily-traffic-metric"><span class="qily-traffic-number" data-qily-traffic-count="intl-total">读取中…</span><span class="qily-traffic-label">累计页面浏览量</span></div>',
  '<div class="qily-traffic-metric"><span data-qily-traffic-count="intl-active">读取中…</span><span class="qily-traffic-label">独立访客</span></div></div></article>',
  '<article class="qily-traffic-site"><h3>QilyLean.cn</h3><span data-qily-traffic-count="cn-total">读取中…</span></article></div>',
  '<p class="qily-traffic-note"></p></section></main><script defer src="/site-traffic-stats-v1.js"></script></body></html>'
].join('');

for(const width of [390,1440])test('International daily traffic trend chart uses real PV at '+width+'px',async({page})=>{
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
  await expect(page.locator('.qily-traffic-kline__scroll svg g title').last()).toContainText('每日总访问量 2');
  await expect(page.locator('#traffic [data-qily-kline-label="high-pv"]').first()).toHaveText('2');
  await expect(page.locator('#traffic [data-qily-kline-label="daily-pv"]').first()).toHaveText('2');
  const axisClearance=await page.locator('.qily-traffic-kline__svg').evaluate(svg=>{const axis=svg.querySelector('[data-qily-kline-axis="daily-total"]');const label=svg.querySelector('[data-qily-kline-label="daily-pv"]');const a=axis.getBBox(),b=label.getBBox();return {axisRight:a.x+a.width,labelLeft:b.x};});
  const alignment=await page.locator('.qily-traffic-kline__svg').evaluate(svg=>{
    const card=svg.closest('.qily-traffic-kline');
    const heading=card.querySelector('.qily-traffic-kline__head h3').getBoundingClientRect();
    const scroll=svg.parentElement.getBoundingClientRect(),chart=svg.getBoundingClientRect();
    const six=svg.querySelector('[data-qily-kline-axis="six-hour"]');
    const daily=svg.querySelector('[data-qily-kline-axis="daily-total"]');
    return {headingLeft:heading.left,scrollLeft:scroll.left,chartLeft:chart.left,
      sixX:six.getAttribute('x'),dailyX:daily.getAttribute('x'),dailyY:daily.getAttribute('y'),
      titleGap:Number(daily.getAttribute('y'))-Number(six.getAttribute('y')),height:svg.viewBox.baseVal.height};
  });
  const spacing=await page.locator('.qily-traffic-kline__svg').evaluate(svg=>{
    const six=svg.querySelector('[data-qily-kline-axis="six-hour"]').getBBox();
    const sixTop=svg.querySelector('[data-qily-kline-tick="top"]').getBBox();
    const daily=svg.querySelector('[data-qily-kline-axis="daily-total"]').getBBox();
    const dailyPV=svg.querySelector('[data-qily-kline-label="daily-pv"]').getBBox();
    return {sixHourGap:sixTop.y-(six.y+six.height),dailyGap:dailyPV.y-(daily.y+daily.height)};
  });
  expect(spacing.sixHourGap).toBeGreaterThanOrEqual(32);
  expect(spacing.dailyGap).toBeGreaterThanOrEqual(24);
  expect(Math.abs(alignment.headingLeft-alignment.scrollLeft)).toBeLessThan(1.5);
  expect(Math.abs(alignment.scrollLeft-alignment.chartLeft)).toBeLessThan(1.5);
  expect(alignment.sixX).toBe('0');
  expect(alignment.dailyX).toBe('0');
  expect(alignment.dailyY).toBe('290');
  expect(alignment.titleGap).toBeGreaterThanOrEqual(260);
  expect(alignment.height).toBe(460);
  expect(axisClearance.axisRight).toBeLessThan(axisClearance.labelLeft);
  await expect(page.locator('#traffic .qily-traffic-kline__info')).toHaveCount(0);
  await expect(page.locator('#traffic .qily-traffic-kline')).toHaveCSS('background-color','rgb(244, 249, 247)');
  await expect(page.locator('#traffic .qily-traffic-site:not([hidden]) .qily-traffic-label').first()).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic .qily-traffic-kline__legend')).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic .qily-traffic-kline__legend')).toHaveCSS('line-height','35px');
  await expect(page.locator('#traffic .qily-traffic-kline__legend')).not.toContainText('开盘');
  await expect(page.locator('#traffic .qily-traffic-kline__legend')).not.toContainText('收盘');
  await expect(page.locator('#traffic .qily-traffic-kline__head h3')).toHaveText('DAILY PV · 每日访问量趋势');
  await expect(page.locator('#traffic .qily-traffic-kline__actions button').first()).toHaveCSS('font-size','20px');
  await expect(page.locator('#traffic [data-qily-kline-label="high-pv"]').first()).toHaveAttribute('font-size','20');
  await expect(page.locator('#traffic [data-qily-kline-label="daily-pv"]').first()).toHaveAttribute('font-size','20');
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

for(const width of [390,1440])test('International six-hour bars share the zero baseline at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:1100});
  await page.clock.setFixedTime(new Date('2026-10-31T15:30:00Z'));
  const slots={'20261029':[30,80,50,90],'20261030':[140,100,70,20],'20261031':[60,120,90,60]};
  await page.route('https://qilylean.com/**',route=>{
    const name=new URL(route.request().url()).pathname;
    const resource={'/about/':['text/html',html],'/site-traffic-stats-v1.css':['text/css',CSS],'/site-traffic-stats-v1.js':['application/javascript',MAIN],'/site-traffic-daily-kline-v1.js':['application/javascript',KLINE]}[name];
    return resource?route.fulfill({status:200,contentType:resource[0],body:resource[1]}):route.fulfill({status:404,body:'Not found'});
  });
  await page.route('https://countapi.mileshilliard.com/**',route=>{
    const match=route.request().url().match(/qilylean_com_pv6h_v1_(\d{8})_s([0-3])/);
    return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({value:match?slots[match[1]][Number(match[2])]:143})});
  });
  await page.goto('https://qilylean.com/about/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#traffic svg')).toBeVisible();
  let originalDaily;
  for(const days of [7,14,7]){
    await page.getByRole('button',{name:'近'+days+'日',exact:true}).click();
    await expect(page.getByRole('button',{name:'近'+days+'日',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#traffic svg')).toHaveAttribute('aria-label',new RegExp('近'+days+'日国际站'));
    const chart=await page.locator('#traffic svg').evaluate(root=>{
      const baseline=Number(root.querySelector('[data-qily-kline-tick="0"]').getAttribute('y'))-4;
      const groups=[...root.querySelectorAll(':scope > g')].filter(g=>g.querySelector('[data-qily-kline-label="high-pv"]'));
      return {baseline,bars:groups.map(g=>{
        const rect=g.querySelector('rect');return {top:Number(rect.getAttribute('y')),bottom:Number(rect.getAttribute('y'))+Number(rect.getAttribute('height')),color:rect.getAttribute('fill'),label:g.querySelector('[data-qily-kline-label="high-pv"]').textContent};
      }),daily:groups.map(g=>({rect:g.querySelectorAll('rect')[1].outerHTML,label:g.querySelector('[data-qily-kline-label="daily-pv"]').outerHTML})),dailyLabels:groups.map(g=>g.querySelector('[data-qily-kline-label="daily-pv"]').textContent)};
    });
    expect(chart.bars).toHaveLength(3);
    expect(chart.baseline).toBe(250);
    for(const bar of chart.bars)expect(bar.bottom,'every six-hour body ends exactly at y(0)').toBeCloseTo(chart.baseline,8);
    expect(chart.bars.map(bar=>bar.top),'existing upper edges remain unchanged').toEqual([159.2,109.2,189.2]);
    expect(chart.bars.map(bar=>bar.color)).toEqual(['#c49a4e','#178b94','#c49a4e']);
    expect(chart.bars.map(bar=>bar.label)).toEqual(['90','140','120']);
    expect(chart.dailyLabels).toEqual(['250','330','330']);
    if(originalDaily)expect(chart.daily,'range switches retain the existing daily PV rendering').toEqual(originalDaily);
    else originalDaily=chart.daily;
  }
});
