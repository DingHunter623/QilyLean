const {test,expect}=require('@playwright/test');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4175';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const blocks=['qilyChinaKnowledgeBridge','electricalRecommendations','navigationPartnerLinks'];
const INTL_ORDER=['home','top','back','previous','search','current'];
const CN_ORDER=['top','back','previous','search','current'];
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
