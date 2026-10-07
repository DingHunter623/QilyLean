const {test,expect}=require('@playwright/test');
const base=process.env.QILY_GK_BASE||'http://127.0.0.1:4173';

// Measure rendered geometry, including async imported articles. An inline 1180px
// declaration alone did not catch the later R8 1560px override.
for(const width of [390,1440,2048]){
  for(const route of [
    '/global-knowledge/briefs/',
    '/global-knowledge/briefs/?date=2026-09-28',
    '/global-knowledge/briefs/?date=2026-08-09',
    '/links/cn-public/'
  ]){
    test(`shared content axis ${width} ${route}`,async({page})=>{
      await page.setViewportSize({width,height:1000});
      await page.goto(base+route,{waitUntil:'networkidle'});
      if(route.includes('?date='))await expect(page.locator('#article')).not.toBeEmpty();
      else if(route.includes('/briefs/'))await expect(page.locator('#grid .brief').first()).toBeVisible();
      const geometry=await page.evaluate(()=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,width:r.width,right:r.right};};
        const header=document.querySelector('.cn-bridge-header-inner');
        const frames=[...document.querySelectorAll('.hero>.wrap,main>section>.wrap,.cn-bridge-footer-inner,#readerHead,#article,#reader[data-source-vi="true"] #article .knowledge-brief-section>.module-inner')]
          .filter(e=>e.getBoundingClientRect().width>0).map(rect);
        return {header:rect(header),frames,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
      });
      expect(geometry.header.width).toBeLessThanOrEqual(1181);
      if(width>=1440)expect(geometry.header.width).toBeCloseTo(1180,0);
      expect(geometry.frames.length).toBeGreaterThanOrEqual(2);
      for(const frame of geometry.frames){
        expect(Math.abs(frame.width-geometry.header.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.left-geometry.header.left)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.right-geometry.header.right)).toBeLessThanOrEqual(1);
      }
      expect(geometry.overflow).toBeLessThanOrEqual(1);
    });
  }
}
