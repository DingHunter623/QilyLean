const {test,expect}=require('@playwright/test');
const base=process.env.QILY_GK_BASE||'http://127.0.0.1:4173';
const routes=[
  '/global-knowledge/briefs/',
  '/global-knowledge/briefs/?date=2026-09-28',
  '/global-knowledge/briefs/?date=2026-08-09',
  '/links/cn-public/',
  '/knowledge/',
  '/'
];
for(const width of [320,360,375,390,393,412,428,480,768,900,901,1440]){
  for(const route of routes){
    test(`public header has no logo obstruction ${width} ${route}`,async({page})=>{
      await page.setViewportSize({width,height:915});
      await page.goto(base+route,{waitUntil:'networkidle'});
      const control=page.locator('.qily-web-translate').first();
      await expect(control).toBeVisible();
      const geometry=await page.evaluate(()=>{
        const control=document.querySelector('.qily-web-translate');
        const header=control.closest('header');
        const brand=header.querySelector('.cn-bridge-brand,a.qily-brand,a.brand');
        const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
        const a=rect(brand),b=rect(control);
        const overlap=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
        const points=[.15,.5,.85].map(f=>document.elementFromPoint(a.left+a.width*f,a.top+a.height/2));
        // Native Google select is intentionally clipped. Measure visible attribution
        // text rather than scrollWidth, which includes that hidden native widget.
        const attribution=[];
        const google=control.querySelector('.qily-web-translate__google');
        if(google){
          for(const image of google.querySelectorAll("img")){
            const r=image.getBoundingClientRect();
            if(r.width&&r.height)attribution.push({left:r.left,right:r.right});
          }
          const walker=document.createTreeWalker(google,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()){
            const node=walker.currentNode;
            if(!node.textContent.trim()||node.parentElement.closest('select'))continue;
            const range=document.createRange();range.selectNodeContents(node);
            for(const r of range.getClientRects())if(r.width&&r.height)attribution.push({left:r.left,right:r.right});
          }
        }
        return {brand:a,control:b,select:rect(control.querySelector('select.qily-web-translate__select')),attribution,overlap,unobscured:points.every(el=>el&&(el===brand||brand.contains(el))),imageLoaded:brand.querySelector("img")?brand.querySelector("img").naturalWidth>0:getComputedStyle(brand).backgroundImage.includes("/assets/brand/qilylean-logo.svg")};
      });
      expect(geometry.overlap).toBe(0);
      expect(geometry.unobscured).toBe(true);
      expect(geometry.brand.width).toBeGreaterThanOrEqual(110);
      for(const box of [geometry.brand,geometry.control,geometry.select,...geometry.attribution]){
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width+1);
      }
      expect(geometry.imageLoaded).toBe(true);
      await expect(control.locator('select.qily-web-translate__select')).toBeEnabled();
    });
  }
}
