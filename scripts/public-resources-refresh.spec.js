const {test,expect}=require('@playwright/test');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4175';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const order=['qilyChinaKnowledgeBridge','electricalRecommendations','navigationPartnerLinks'];
for(const width of [1440,1024,820,760,390,320]){
 test(`shared footer and resource order at ${width}px`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height:1000}});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const measurements=[];
  for(const [base,route,cn] of [[intBase,'/links/',false],[cnBase,'/resources/',true]]){
   const page=await context.newPage();
   await page.goto(base+route,{waitUntil:'networkidle'});
   await expect(page.locator('#floatDock button')).toHaveCount(7);
   expect(await page.locator('#qilyChinaKnowledgeBridge,#electricalRecommendations,#navigationPartnerLinks').evaluateAll(nodes=>nodes.map(n=>n.id))).toEqual(order);
   await expect(page.locator('#electricalRecommendations [data-company-reference]')).toHaveCount(4);
   await expect(page.locator('#companyGrid .card')).toHaveCount(100);
   expect(await page.locator('#qilyChinaKnowledgeBridge a').getAttribute('href')).toBe(cn?'https://qilylean.com/links/cn-public/':'https://qilylean.cn/');
   const measurement=await page.evaluate(cn=>{
    const dock=document.querySelector('#floatDock'),shell=cn?document.querySelector('footer.footer'):dock;
    const box=shell.getBoundingClientRect();
    return {height:box.height,bg:getComputedStyle(shell).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth+1,
      buttons:[...dock.querySelectorAll('button')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left,width:r.width,top:r.top-box.top,overflow:n.scrollWidth>n.clientWidth+1};})};
   },cn);
   expect(measurement.overflow).toBe(false);
   expect(measurement.buttons.some(n=>n.overflow)).toBe(false);
   if(cn){
    await expect(page.locator('#qilyCnPrimaryNavigation a')).toHaveCount(10);
    await expect(page.locator('#qilyCnPrimaryNavigation a[href="/about/#contact"]')).toHaveText('联系我们');
    await expect(page.locator('script[src*="/assets/cn-nav-rail-v1.js"]')).toHaveAttribute('src',/20261021-nav-rail-v22-contact-preserved/);
    await expect(page.locator('footer .footer-records>a')).toHaveCount(2);
    await expect(page.locator('.footer-home')).toHaveCount(0);
    await page.locator('#floatDock [data-action="search"]').click();
    await page.locator('#qilyCnFooterSearchInput').fill('SMED');
    await expect(page.locator('#qilyCnFooterSearch li').first()).toBeVisible();
    await page.locator('[data-cn-search-close]').click();
   }else await expect(page.locator('a[href*="beian."]')).toHaveCount(0);
   measurements.push(measurement);await page.close();
  }
  expect(Math.abs(measurements[0].height-measurements[1].height)).toBeLessThanOrEqual(1);
  expect(measurements[0].bg).toBe(measurements[1].bg);
  for(let i=0;i<7;i++){
   expect(Math.abs(measurements[0].buttons[i].top-measurements[1].buttons[i].top)).toBeLessThanOrEqual(1);
   expect(Math.abs(measurements[0].buttons[i].left-measurements[1].buttons[i].left)).toBeLessThanOrEqual(1);
   expect(Math.abs(measurements[0].buttons[i].width-measurements[1].buttons[i].width)).toBeLessThanOrEqual(1);
  }
  await context.close();
 });
}
