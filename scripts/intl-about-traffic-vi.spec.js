const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const HTML=fs.readFileSync(path.join(ROOT,'about/index.html'),'utf8');
for(const width of [390,1440])test('Intl About title 6 white VI matches title 5 and statistics stay dark '+width,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.route('https://countapi.mileshilliard.com/**',route=>{
    const name=new URL(route.request().url()).pathname;
    const headers={'access-control-allow-origin':'*','content-type':'application/json'};
    if(name.includes('/hit/'))return route.fulfill({status:200,headers,body:JSON.stringify({value:143})});
    if(name.includes('pv6h_v1_'))return route.fulfill({status:200,headers,body:JSON.stringify({value:2})});
    return route.fulfill({status:200,headers,body:JSON.stringify({value:143})});
  });
  await page.route('https://qilylean.com/**',route=>{
    const url=new URL(route.request().url());
    let rel=decodeURIComponent(url.pathname).replace(/^\/+/,'');
    if(!rel||rel.endsWith('/'))rel+='index.html';
    const absolute=path.resolve(ROOT,rel);
    if(!absolute.startsWith(ROOT+path.sep))return route.abort();
    if(!fs.existsSync(absolute)||!fs.statSync(absolute).isFile())return route.abort();
    let type='text/plain';
    if(/\.html$/i.test(rel))type='text/html; charset=utf-8';
    else if(/\.css$/i.test(rel))type='text/css; charset=utf-8';
    else if(/\.js$/i.test(rel))type='application/javascript; charset=utf-8';
    else if(/\.svg$/i.test(rel))type='image/svg+xml';
    else if(/\.png$/i.test(rel))type='image/png';
    else if(/\.webp$/i.test(rel))type='image/webp';
    return route.fulfill({status:200,contentType:type,body:fs.readFileSync(absolute)});
  });
  await page.goto('https://qilylean.com/about/',{waitUntil:'domcontentloaded',timeout:45000});
  const first=page.locator('#record'),second=page.locator('#qily-traffic-title');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await expect(second).toHaveText('6. 国际站访问统计');
  await expect(page.locator('#traffic .qily-traffic-grid')).toHaveAttribute('data-qily-traffic-single','true');
  await expect(page.locator('#traffic .qily-traffic-site[hidden]')).toBeHidden();
  await expect(page.locator('#traffic .qily-traffic-kline__svg')).toBeVisible({timeout:18000});
  const info=await page.evaluate(()=>{
    function rect(el){const b=el.getBoundingClientRect();return {x:b.x,left:b.left,top:b.top,bottom:b.bottom,width:b.width};}
    function style(el){const s=getComputedStyle(el);return {color:s.color,fill:s.webkitTextFillColor,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,backgroundImage:s.backgroundImage,backgroundColor:s.backgroundColor,borderTopWidth:s.borderTopWidth};}
    const record=document.querySelector('#record'),title=document.querySelector('#qily-traffic-title'),
      traffic=document.querySelector('#traffic'),head=document.querySelector('#traffic .qily-traffic-heading'),
      body=document.querySelector('#traffic .qily-traffic-body'),grid=document.querySelector('#traffic .qily-traffic-grid'),
      kline=document.querySelector('#traffic .qily-traffic-kline');
    return {
      record:{rect:rect(record),style:style(record)},title:{rect:rect(title),style:style(title)},
      traffic:style(traffic),head:{rect:rect(head),style:style(head)},
      body:{rect:rect(body),style:style(body)},
      gridParent:grid.parentElement.className,klineParent:kline.parentElement.className,
      scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth
    };
  });
  for(const prop of ['color','fill','fontSize','fontWeight','lineHeight'])expect(info.title.style[prop]).toBe(info.record.style[prop]);
  expect(Math.abs(info.title.rect.left-info.record.rect.left)).toBeLessThanOrEqual(2);
  expect(info.traffic.backgroundImage).toBe('none');
  expect(info.traffic.borderTopWidth).toBe('0px');
  expect(info.head.style.backgroundImage).toBe('none');
  expect(info.body.style.backgroundImage).toContain('linear-gradient');
  expect(info.body.rect.top).toBeGreaterThanOrEqual(info.head.rect.bottom);
  expect(info.gridParent).toContain('qily-traffic-body');
  expect(info.klineParent).toContain('qily-traffic-body');
  expect(info.scrollWidth).toBeLessThanOrEqual(info.viewport+2);
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  await page.locator('#traffic').screenshot({path:path.join(ROOT,'test-results','intl-about-traffic-vi-'+width+'.png')});
});