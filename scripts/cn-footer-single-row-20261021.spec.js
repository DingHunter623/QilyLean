const { test, expect } = require('@playwright/test');
const CN='http://127.0.0.1:4174';
const INTL='http://127.0.0.1:4173';
async function measure(page){
 return page.evaluate(()=>{
  const footer=document.querySelector('footer.footer');
  const buttons=[...footer.querySelectorAll('#floatDock button[data-action]')];
  const records=[...footer.querySelectorAll('.footer-records>a')];
  const all=buttons.concat(records);
  const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,font:parseFloat(getComputedStyle(el).fontSize)};};
  return {actions:buttons.map(b=>b.dataset.action),labels:buttons.map(b=>b.textContent.trim()),filings:records.map(a=>a.textContent.trim()),links:records.map(a=>a.href),boxes:all.map(rect),footer:rect(footer),overflow:footer.scrollWidth>footer.clientWidth+2,viewport:innerWidth,nav:footer.querySelector('#floatDock').getAttribute('data-qily-footer-contract')};
 });
}
test('China desktop footer: exactly five actions plus two filing links, evenly spaced in a single row',async({browser})=>{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(CN+'/about/',{waitUntil:'load'});await page.waitForTimeout(200);
 const x=await measure(page);
 expect(x.actions).toEqual(['top','back','previous','search','current']);
 expect(x.labels).toEqual(['回到顶部','上一层级','上一网页','本站搜索','分享当前']);
 expect(x.filings[0]).toContain('湘ICP备2026041143号-1');
 expect(x.filings[1]).toContain('湘公网安备43020002000443号');
 expect(x.links[0]).toContain('beian.miit.gov.cn');
 expect(x.links[1]).toContain('beian.mps.gov.cn');
 expect(x.nav).toBe('top,back,previous,search,current');
 expect(x.boxes).toHaveLength(7);
 const top=x.boxes[0].y;
 for(const b of x.boxes){expect(Math.abs(b.y-top)).toBeLessThanOrEqual(2);expect(b.height).toBeGreaterThanOrEqual(34);}
 const gaps=x.boxes.slice(1).map((b,i)=>b.x-x.boxes[i].right);
 for(const gap of gaps)expect(Math.abs(gap-6)).toBeLessThanOrEqual(3);
 expect(x.boxes[0].font).toBeLessThanOrEqual(16);
 expect(x.boxes[5].font).toBeLessThanOrEqual(13);
 expect(x.footer.height).toBeLessThanOrEqual(62);
 expect(x.overflow).toBeFalsy();
 await page.close();
});
test('China tablet and mobile footer: no clipped controls or lost filing links',async({browser})=>{
 for(const width of [900,390,320]){
  const page=await browser.newPage({viewport:{width,height:850}});
  await page.goto(CN+'/',{waitUntil:'load'});await page.waitForTimeout(150);
  const x=await measure(page);
  expect(x.actions).toEqual(['top','back','previous','search','current']);
  expect(x.boxes).toHaveLength(7);
  expect(x.overflow).toBeFalsy();
  for(const b of x.boxes){expect(b.x).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(width+2);expect(b.height).toBeGreaterThanOrEqual(34);}
  expect(x.filings).toHaveLength(2);
  expect(x.footer.bottom).toBeLessThanOrEqual(852);
  await page.close();
 }
});
test('International dock remains unchanged with original seven actions',async({browser})=>{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(INTL+'/',{waitUntil:'load'});await page.waitForTimeout(150);
 const actions=await page.locator('#floatDock button[data-action]').evaluateAll(items=>items.map(b=>b.dataset.action));
 expect(actions).toEqual(['home','top','back','previous','search','current','contact']);
 await page.close();
});
