const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const preview=process.env.QILY_CN_PREVIEW==='1';
const cn=process.env.QILY_CN_BASE||'https://qilylean.cn';
const intl=process.env.QILY_INT_BASE||'https://qilylean.com';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
test.skip(process.env.QILY_CN_PRODUCTION!=='1','Explicit CN production/preview acceptance only');

async function previewRoutes(page){
  for(const [origin,root] of [[cn,path.join(ROOT,'cn-site')],[intl,ROOT]]){
    await page.route(origin+'/**',route=>{
      let rel=decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, '');
      if(!rel||rel.endsWith('/'))rel+='index.html';
      const file=path.resolve(root,rel);
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.abort();
      const type=rel.endsWith('.html')?'text/html':rel.endsWith('.css')?'text/css':rel.endsWith('.js')?'application/javascript':rel.endsWith('.svg')?'image/svg+xml':rel.endsWith('.png')?'image/png':rel.endsWith('.webp')?'image/webp':rel.endsWith('.woff2')?'font/woff2':'application/octet-stream';
      return route.fulfill({status:200,contentType:type,body:fs.readFileSync(file)});
    });
  }
  await page.route('https://countapi.mileshilliard.com/**',route=>{
    const bucket=route.request().url().includes('_pv6h_v1_');
    return route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify({value:bucket?2:143})});
  });
}
async function ready(page,origin,site){
  const response=await page.goto(origin+'/about/',{waitUntil:'domcontentloaded',timeout:45000});
  await expect(page.locator('[data-qily-traffic-count="'+site+'-total"]')).toHaveAttribute('data-qily-traffic-state','ready',{timeout:30000});
  await expect(page.locator('#traffic .qily-traffic-kline__svg')).toBeVisible({timeout:30000});
  await page.waitForTimeout(1700); // The approved international final R8 cascade settles within 1400ms.
  return response;
}
async function measure(page){
  return page.evaluate(()=>{
    const props=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','webkitTextFillColor','backgroundColor','backgroundImage','borderTopWidth','borderTopColor','borderRadius','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom','display','boxShadow'];
    const selectors=['#qily-traffic-title','.qily-traffic-heading .qily-traffic-kicker','#traffic','.qily-traffic-body','.qily-traffic-grid','.qily-traffic-site:not([hidden])','.qily-traffic-site:not([hidden]) .qily-traffic-site-header','.qily-traffic-site:not([hidden]) .qily-traffic-site-label','.qily-traffic-site:not([hidden]) h3','.qily-traffic-site:not([hidden]) .qily-traffic-number','.qily-traffic-site:not([hidden]) .qily-traffic-label','.qily-traffic-kline','.qily-traffic-kline__head h3','.qily-traffic-kline__actions button','.qily-traffic-kline__legend'];
    const root=document.querySelector('#traffic').getBoundingClientRect();
    return {left:root.left,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,items:selectors.map(selector=>{
      const el=document.querySelector('#traffic '+selector)||document.querySelector(selector),s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {selector,style:Object.fromEntries(props.map(p=>[p,s[p]])),left:r.left-root.left,width:r.width};
    }),chart:(()=>{const s=document.querySelector('#traffic svg'),box=s.parentElement.getBoundingClientRect(),r=s.getBoundingClientRect();return {height:s.viewBox.baseVal.height,width:s.viewBox.baseVal.width,scrollLeft:r.left-box.left,headingLeft:document.querySelector('.qily-traffic-kline__head h3').getBoundingClientRect().left-box.left};})()};
  });
}
for(const width of (process.env.QILY_CN_TRAFFIC_WIDTHS||'320,390,820,1440').split(',').map(Number))test('CN production statistics match approved international VI and independent PV '+width,async({page,context,request},testInfo)=>{
  test.setTimeout(150000);
  await page.setViewportSize({width,height:980});
  if(preview)await previewRoutes(page);
  const calls=[],payloads=[],pending=[],loadedResources=new Map();
  page.on('request',req=>{if(req.url().includes('countapi.mileshilliard.com'))calls.push(req.url());});
  page.on('response',res=>{
    if(res.url().startsWith(cn+'/assets/site-traffic-'))loadedResources.set(res.url(),res);
    if(!res.url().includes('countapi.mileshilliard.com'))return;
    pending.push(res.json().then(data=>payloads.push({url:res.url(),status:res.status(),value:data.value})).catch(()=>{}));
  });
  const documentResponse=await ready(page,cn,'cn');
  await expect(page.locator('#qily-traffic-title')).toHaveText('6. 中国站访问统计');
  await expect(page.locator('#traffic .qily-traffic-site:not([hidden])')).toHaveCount(1);
  const total=page.locator('[data-qily-traffic-count="cn-total"]');
  const recorded=Number(await total.getAttribute('data-qily-traffic-recorded-pv'));
  expect(await total.getAttribute('data-qily-traffic-starting-base')).toBe('10000');
  expect(Number((await total.innerText()).replace(/,/g,''))).toBe(10000+recorded);
  const first=await measure(page);
  expect(first.scrollWidth).toBeLessThanOrEqual(first.width+1);
  expect(first.chart.height).toBe(460);
  expect(Math.abs(first.chart.scrollLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(first.chart.headingLeft)).toBeLessThanOrEqual(1);
  const reference=await context.newPage();
  await reference.setViewportSize({width,height:980});
  if(preview)await previewRoutes(reference);
  await ready(reference,intl,'intl');
  const approved=await measure(reference);
  fs.mkdirSync(testInfo.outputDir,{recursive:true});
  fs.writeFileSync(testInfo.outputPath('comparison.json'),JSON.stringify({first,approved},null,2));
  for(let i=0;i<first.items.length;i++){
    const a=first.items[i],b=approved.items[i];
    expect(a.style,a.selector+' computed VI').toEqual(b.style);
    expect(Math.abs(a.left-b.left),a.selector+' left axis').toBeLessThanOrEqual(1);
    // Labels and site names have different text; compare the structural containers.
    if(['#traffic','.qily-traffic-body','.qily-traffic-grid','.qily-traffic-site:not([hidden])','.qily-traffic-kline'].includes(a.selector))expect(Math.abs(a.width-b.width),a.selector+' width').toBeLessThanOrEqual(1);
  }
  expect(Math.abs(first.left-approved.left),'production module left axis').toBeLessThanOrEqual(1);
  expect(first.chart.width).toBe(approved.chart.width);
  await reference.close();
  for(const days of [14,7]){
    await page.getByRole('button',{name:'近'+days+'日',exact:true}).click();
    await expect(page.getByRole('button',{name:'近'+days+'日',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('#traffic svg')).toHaveAttribute('aria-label',new RegExp('近'+days+'日中国站'));
  }
  await Promise.all(pending);
  expect(calls.some(url=>url.includes('/hit/qilylean_cn_sitewide_pageviews_20261029'))).toBe(true);
  expect(calls.some(url=>url.includes('/get/qilylean_cn_pv6h_v1_'))).toBe(true);
  expect(calls.some(url=>url.includes('qilylean_com_'))).toBe(false);
  expect(payloads.some(p=>p.url.includes('qilylean_cn_sitewide_pageviews_20261029')&&p.status===200&&Number(p.value)===recorded)).toBe(true);
  const buckets=new Map();
  for(const p of payloads){const m=p.url.match(/qilylean_cn_pv6h_v1_(\d{8})_s([0-3])/);if(m&&p.status===200)buckets.set(m[1]+'_'+m[2],Math.max(buckets.get(m[1]+'_'+m[2])||0,Number(p.value)));}
  const labels=await page.locator('[data-qily-kline-label="daily-pv"]').evaluateAll(nodes=>nodes.map(el=>({day:el.getAttribute('data-qily-kline-day').replace(/-/g,''),value:Number(el.textContent)})));
  expect(labels.length).toBeGreaterThan(0);
  for(const label of labels){let sum=0;for(let slot=0;slot<4;slot++)sum+=buckets.get(label.day+'_'+slot)||0;expect(label.value,'daily PV is the sum of actual CN buckets without 10000').toBe(sum);}
  await expect(page.locator('.qily-traffic-kline__legend')).toContainText('柱形：每日总访问量');
  if(!preview&&width===1440){
    const resources=await page.locator('script[src],link[rel="stylesheet"][href]').evaluateAll(nodes=>nodes.map(el=>el.src||el.href).filter(url=>/\/assets\/site-traffic-(?:stats|daily-kline)-v1\.(?:css|js)/.test(url)));
    expect(resources).toHaveLength(3);
    // Immutable static caching is safe only at the exact committed revision URL.
    // The HTML must revalidate so returning browsers discover new revision URLs.
    expect(documentResponse.headers()['cache-control']||'','About HTML discovers current resource versions').toMatch(/no-cache|no-store|must-revalidate/);
    const sources=fs.readFileSync(path.join(ROOT,'cn-site/about/index.html'),'utf8')+'\n'+fs.readFileSync(path.join(ROOT,'cn-site/assets/site-traffic-stats-v1.js'),'utf8');
    const expected=[...sources.matchAll(/\/assets\/site-traffic-(?:stats|daily-kline)-v1\.(?:css|js)\?v=[^"'\s]+/g)].map(m=>new URL(m[0],cn).href);
    expect(expected).toHaveLength(3);
    expect([...resources].sort(),'HTML and loader use the exact committed cache revisions').toEqual(expected.sort());
    const cacheEvidence=[];
    for(const url of resources){
      expect(new URL(url).searchParams.get('v'),'nonempty unique resource revision').toBeTruthy();
      const file=path.join(ROOT,'cn-site',new URL(url).pathname),sourceHash=digest(fs.readFileSync(file));
      const browserResponse=loadedResources.get(url);
      expect(browserResponse,'browser loaded the current version '+url).toBeTruthy();
      expect(browserResponse.status()).toBe(200);
      const browserHash=digest(await browserResponse.body());
      expect(browserHash,url+' browser-used exact source bytes').toBe(sourceHash);
      const res=await request.get(url,{headers:{'Cache-Control':'no-cache'},timeout:45000});
      expect(res.status()).toBe(200);
      const freshHash=digest(await res.body());
      expect(freshHash,url+' independent fresh exact source bytes').toBe(sourceHash);
      cacheEvidence.push({url,cacheControl:res.headers()['cache-control'],sourceHash,browserHash,freshHash});
    }
    fs.writeFileSync(testInfo.outputPath('resource-cache.json'),JSON.stringify({htmlCache:documentResponse.headers()['cache-control'],resources:cacheEvidence},null,2));
    if(process.env.VERIFY_SHA){const release=await request.get(cn+'/meta/cn-content-release.json');expect((await release.json()).sourceCommit).toBe(process.env.VERIFY_SHA);}
  }
  // Keep the fixed site navigation/footer outside the component evidence image.
  const traffic=page.locator('#traffic');
  const moduleHeight=Math.ceil(await traffic.evaluate(el=>el.getBoundingClientRect().height));
  await page.setViewportSize({width,height:Math.max(980,moduleHeight+360)});
  await page.evaluate(()=>window.scrollTo(0,window.scrollY+document.querySelector('#traffic').getBoundingClientRect().top-200));
  await traffic.screenshot({path:testInfo.outputPath('cn-statistics-'+width+'.png')});
  if(width===390){const before=calls.length;await page.reload({waitUntil:'domcontentloaded'});await expect(total).toHaveAttribute('data-qily-traffic-state','ready',{timeout:30000});await expect(page.locator('#traffic svg')).toBeVisible({timeout:30000});expect(calls.length).toBeGreaterThan(before);}
  console.log('CN_TRAFFIC_ACCEPTANCE',JSON.stringify({width,preview,recorded,display:10000+recorded,realDays:labels,geometry:{left:first.left,documentWidth:first.scrollWidth,chart:first.chart}}));
});
