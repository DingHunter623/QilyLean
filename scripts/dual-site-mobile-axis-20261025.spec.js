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
    return {primary:get(selector),secondary:get(second),documentWidth:document.documentElement.scrollWidth};
   },contract);
   console.log('DUAL_SITE_GUTTER',JSON.stringify({site:contract.site,url:contract.url,width,...rects}));
   expect(rects.primary,contract.url+' expected principal reading content').toBeTruthy();
   expect(rects.documentWidth,contract.url+' no page overflow '+width).toBeLessThanOrEqual(width+1);
   expect.soft(Math.abs(rects.primary.left-15),contract.url+' left reading edge '+width).toBeLessThanOrEqual(1.5);
   expect.soft(Math.abs(width-rects.primary.right-15),contract.url+' right reading edge '+width).toBeLessThanOrEqual(1.5);
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
