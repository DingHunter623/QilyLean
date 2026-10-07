const {test,expect}=require('@playwright/test');
const base=process.env.QILY_GK_BASE||'http://127.0.0.1:4173';
for(const width of [360,390,412,768,1440]){
  for(const route of ['/qilylean/daily-insights.html','/qilylean/daily/2026-09-28.html','/knowledge/']){
    test(`public logo visible ${width} ${route}`,async({page})=>{
      await page.setViewportSize({width,height:915});
      await page.goto(base+route,{waitUntil:'networkidle'});
      const brand=page.locator('header>a.qily-brand').first();
      await expect(brand).toBeVisible();
      const box=await brand.evaluate(el=>{
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return {width:r.width,height:r.height,left:r.left,right:r.right,image:cs.backgroundImage,opacity:cs.opacity,visibility:cs.visibility};
      });
      expect(box.width).toBeGreaterThanOrEqual(110);
      expect(box.height).toBeGreaterThanOrEqual(23);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
      expect(box.image).toContain('/assets/brand/qilylean-logo.svg');
      expect(box.opacity).toBe('1');
      expect(box.visibility).toBe('visible');
    });
  }
}
