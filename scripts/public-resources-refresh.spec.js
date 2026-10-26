const {test,expect}=require('@playwright/test');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4175';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const blocks=['qilyChinaKnowledgeBridge','electricalRecommendations','navigationPartnerLinks'];
const INTL_ORDER=['top','previous','search','current'];
const CN_ORDER=['top','previous','search','current'];

/* QILY-SHARED-LATIN-READABILITY-20261026
 * Test rendered names on the COM SSOT and the generated CN mirror, not merely
 * presence of stylesheet text. The Chinese directory label must be unchanged.
 */
for(const width of [1588,820,390,320]){
 test('calm Latin directory titles with unchanged Chinese labels on both sites at '+width,async({browser})=>{
   test.setTimeout(120000);
   const context=await browser.newContext({viewport:{width,height:960}});
   await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   for(const [base,route] of [[intBase,'/links/'],[cnBase,'/resources/']]){
     const page=await context.newPage();
     const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:45000});
     expect(response.status()).toBeLessThan(400);
     await page.evaluate(()=>document.fonts.ready);
     const sample=await page.locator('#companyGrid').evaluate(grid=>{
       const cards=[...grid.querySelectorAll(':scope > a.card')];
       const labels=cards.slice(0,9).map(el=>{
         const h=el.querySelector('h2'),mark=el.querySelector('.mark'),cn=el.querySelector('.cn');
         const s=getComputedStyle(h),ms=getComputedStyle(mark),cs=getComputedStyle(cn);
         const rect=h.getBoundingClientRect(),box=el.getBoundingClientRect();
         return {name:h.textContent.trim(),font:parseFloat(s.fontSize),weight:parseInt(s.fontWeight,10),
           lineHeight:parseFloat(s.lineHeight),tracking:s.letterSpacing,
           monogramFont:parseFloat(ms.fontSize),monogramWeight:parseInt(ms.fontWeight,10),
           chinese:cn.textContent.trim(),chineseSize:parseFloat(cs.fontSize),
           left:rect.left,right:rect.right,cardRight:box.right,
           overflow:el.scrollWidth-el.clientWidth};
       });
       return {total:cards.length,labels,documentWidth:document.documentElement.scrollWidth};
     });
     expect(sample.total,'company count / '+base).toBe(100);
     expect(sample.documentWidth,'document overflow '+base+' '+width).toBeLessThanOrEqual(width+1);
     for(const v of sample.labels){
       expect(v.font,v.name+' English title too large').toBeGreaterThanOrEqual(17);
       expect(v.font,v.name+' English title too large').toBeLessThanOrEqual(19.1);
       expect(v.weight,v.name+' heavy Latin glyph').toBeLessThanOrEqual(700);
       expect(v.monogramFont,v.name+' logo abbreviation').toBe(14);
       expect(v.monogramWeight,v.name+' logo abbreviation weight').toBeLessThanOrEqual(700);
       expect(v.lineHeight/v.font,v.name+' readable line height').toBeGreaterThanOrEqual(1.4);
       expect(v.overflow,v.name+' card overflow').toBeLessThanOrEqual(1);
       expect(v.left).toBeGreaterThanOrEqual(-1);
       expect(v.right).toBeLessThanOrEqual(v.cardRight+1);
     }
     expect(sample.labels[0].name).toBe('Google / Alphabet');
     expect(sample.labels[0].chinese).toContain('谷歌');
     // Chinese captions continue to use the approved large-label hierarchy.
     expect(sample.labels[0].chineseSize,'Chinese type must not be scaled down').toBeGreaterThanOrEqual(18);
     await page.locator('#companyGrid > a.card').first().screenshot({path:'test-results/latin-directory-'+(base===intBase?'com':'cn')+'-'+width+'.png'});
     await page.close();
   }
   await context.close();
 });
}

for(const width of [1440,1024,820,760,390,320]){
 test(`shared public resources, dual-site footer and About navigation at ${width}px`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height:1000}});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  for(const [base,route,cn] of [[intBase,'/links/',false],[cnBase,'/resources/',true]]){
   const page=await context.newPage();
   await page.goto(base+route,{waitUntil:'networkidle'});
   const expected=cn?CN_ORDER:INTL_ORDER;
   await expect(page.locator('#floatDock button')).toHaveCount(expected.length);
   expect(await page.locator('#floatDock button[data-action]').evaluateAll(nodes=>nodes.map(n=>n.dataset.action))).toEqual(expected);
   expect(await page.locator('#qilyChinaKnowledgeBridge,#electricalRecommendations,#navigationPartnerLinks').evaluateAll(nodes=>nodes.map(n=>n.id))).toEqual(blocks);
   await expect(page.locator('#electricalRecommendations [data-company-reference]')).toHaveCount(4);
   await expect(page.locator('#companyGrid .card')).toHaveCount(100);
   expect(await page.locator('#qilyChinaKnowledgeBridge a').getAttribute('href')).toBe(cn?'https://qilylean.com/links/cn-public/':'https://qilylean.cn/');
   const layout=await page.evaluate(cn=>{
    const dock=document.querySelector('#floatDock'),shell=cn?document.querySelector('footer.footer'):dock;
    return {width:document.documentElement.scrollWidth,viewport:innerWidth,
      bg:getComputedStyle(shell).backgroundColor,buttons:[...dock.querySelectorAll('button')].map(el=>({action:el.dataset.action,text:el.textContent.trim(),clipped:el.scrollWidth>el.clientWidth+1,scroll:el.scrollWidth,client:el.clientWidth,font:getComputedStyle(el).fontSize}))};
   },cn);
   expect(layout.width).toBeLessThanOrEqual(layout.viewport+1);
   expect(layout.buttons.filter(n=>n.clipped),JSON.stringify({cn,width,layout})).toEqual([]);
   if(cn){
    await expect(page.locator('header nav[aria-label="主导航"] a[data-qily-nav-key]')).toHaveCount(9);
    await expect(page.locator('header nav a[data-qily-nav-key="experience"]')).toHaveCount(0);
    await expect(page.locator('header nav a[data-qily-nav-key="contact"]')).toHaveText('关于我们');
    await expect(page.locator('footer .footer-records>a')).toHaveCount(2);
    await expect(page.locator('.footer-home')).toHaveCount(0);
    await page.locator('#floatDock [data-action="search"]').click();
    await page.locator('#qilyCnFooterSearchInput').fill('SMED');
    await expect(page.locator('#qilyCnFooterSearch li').first()).toBeVisible();
    await page.locator('[data-cn-search-close]').click();
   }else{
    await expect(page.locator('#floatDock [data-action="contact"]')).toHaveCount(0);
    await expect(page.locator('a[href*="beian."]')).toHaveCount(0);
   }
   await page.close();
  }
  await context.close();
 });
}
