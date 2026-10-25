const {test,expect}=require('@playwright/test');
const com=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const pages=[
 {site:'international',url:com+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'China',url:cn+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'international',url:com+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'},
 {site:'China',url:cn+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'}
];
test('Four screenshot pages preserve one 15px effective mobile reading gutter',async({page})=>{
 test.setTimeout(180000);
 for(const width of [390,430,620]){
  await page.setViewportSize({width,height:900});
  for(const contract of pages){
   await page.goto(contract.url,{waitUntil:'domcontentloaded'});
   if(contract.site==='international')await page.waitForTimeout(1600);
   const rects=await page.evaluate(({selector,second})=>{
    const get=(s)=>{if(!s)return null;const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
    return {primary:get(selector),secondary:get(second),documentWidth:document.documentElement.scrollWidth,layoutWidth:Math.min(document.documentElement.clientWidth,document.documentElement.scrollWidth)};
   },contract);
   console.log('DUAL_SITE_GUTTER',JSON.stringify({site:contract.site,url:contract.url,width,...rects}));
   expect(rects.primary,contract.url+' expected principal reading content').toBeTruthy();
   expect(rects.documentWidth,contract.url+' no page overflow '+width).toBeLessThanOrEqual(width+1);
   expect.soft(Math.abs(rects.primary.left-15),contract.url+' left reading edge '+width).toBeLessThanOrEqual(1.5);
   expect.soft(Math.abs(rects.layoutWidth-rects.primary.right-15),contract.url+' right edge within layout viewport '+width).toBeLessThanOrEqual(1.5);
   if(rects.secondary){
    expect.soft(Math.abs(rects.primary.left-rects.secondary.left),contract.url+' hero-to-body axis '+width).toBeLessThanOrEqual(1);
    expect.soft(Math.abs(rects.primary.right-rects.secondary.right),contract.url+' hero-to-body right axis '+width).toBeLessThanOrEqual(1);
   }
  }
 }
});
test('Selected international and China public routes retain no mobile overflow',async({page})=>{
 test.setTimeout(150000);
 const routes=[
  [com+'/capabilities/',cn+'/archive/profile/capabilities/'],
  [com+'/knowledge/',cn+'/knowledge/'],
  [com+'/trust/',cn+'/trust/'],
  [com+'/links/',cn+'/resources/']
 ];
 for(const width of [390,430]){
  await page.setViewportSize({width,height:900});
  for(const pair of routes)for(const url of pair){
   await page.goto(url,{waitUntil:'domcontentloaded'});
   const stats=await page.evaluate(()=>{
    const main=document.querySelector('main');
    const section=main?.querySelector(':scope > section');
    const r=section?.getBoundingClientRect();
    return {documentWidth:document.documentElement.scrollWidth,
      firstSection:r?{left:r.left,right:r.right,width:r.width}:null};
   });
   console.log('SAMPLED_SITE_CONTAINMENT',JSON.stringify({url,width,...stats}));
   expect(stats.documentWidth,url+' horizontal containment').toBeLessThanOrEqual(width+1);
  }
 }
});

test('W43 governance table uses efficient desktop columns and semantic mobile wrapping on both domains',async({page})=>{
 test.setTimeout(150000);
 const routes=[
  {site:'international',url:com+'/qilylean/daily/2026-10-25.html'},
  {site:'China',url:cn+'/briefs/archive/2026-10-25/'}
 ];
 for(const width of [390,430,1440]){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
   await page.goto(route.url,{waitUntil:'domcontentloaded'});
   const metrics=await page.evaluate(()=>{
    const table=document.querySelector('.w43-table');
    if(!table)return null;
    const heads=[...table.querySelectorAll('thead th')].map(el=>el.getBoundingClientRect().width);
    const first=table.querySelector('tbody tr td:first-child');
    const marker=first?.querySelector('.w43-mobile-break');
    const firstRect=first?.getBoundingClientRect();
    const markerRect=marker?.getBoundingClientRect();
    return {
      tableWidth:table.getBoundingClientRect().width,
      ratios:heads.map(v=>v/table.getBoundingClientRect().width),
      firstText:first?.innerText||'',
      markerDisplay:marker?getComputedStyle(marker).display:null,
      firstTop:firstRect?.top||0,
      markerTop:markerRect?.top||0,
      documentWidth:document.documentElement.scrollWidth
    };
   });
   console.log('W43_RESPONSIVE_TABLE',JSON.stringify({site:route.site,width,...metrics}));
   expect(metrics,route.url+' governance table exists').toBeTruthy();
   expect(metrics.documentWidth,route.url+' no horizontal overflow').toBeLessThanOrEqual(width+1);
   if(width<=430){
    expect.soft(metrics.ratios[0],route.url+' mobile first column').toBeGreaterThanOrEqual(.35);
    expect.soft(metrics.ratios[0],route.url+' mobile first column').toBeLessThanOrEqual(.37);
    expect.soft(metrics.markerDisplay,route.url+' mobile semantic break').toBe('block');
    expect.soft(metrics.markerTop,route.url+' mobile second phrase next line').toBeGreaterThan(metrics.firstTop+1);
   }else{
    expect.soft(metrics.ratios[0],route.url+' desktop first column').toBeGreaterThanOrEqual(.23);
    expect.soft(metrics.ratios[0],route.url+' desktop first column').toBeLessThanOrEqual(.25);
    expect.soft(metrics.ratios[1],route.url+' desktop second column').toBeGreaterThanOrEqual(.39);
    expect.soft(metrics.ratios[1],route.url+' desktop second column').toBeLessThanOrEqual(.41);
    expect.soft(metrics.ratios[2],route.url+' desktop third column').toBeGreaterThanOrEqual(.35);
    expect.soft(metrics.ratios[2],route.url+' desktop third column').toBeLessThanOrEqual(.37);
    expect.soft(metrics.markerDisplay,route.url+' desktop no forced semantic break').toBe('inline');
    expect.soft(metrics.markerTop,route.url+' desktop phrase remains same line').toBeLessThanOrEqual(metrics.firstTop+2);
   }
  }
 }
});
