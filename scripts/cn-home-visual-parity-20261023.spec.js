const {test,expect}=require('@playwright/test');
const fs=require('fs');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const hero='.qily-home-conversion-hero';
async function snapshot(page){
 return page.evaluate(()=>{
   const hero=document.querySelector('.qily-home-conversion-hero');
   const kicker=hero.querySelector('.qily-home-conversion-hero__kicker');
   const h1=hero.querySelector('h1');
   const lead=hero.querySelector('.qily-home-conversion-hero__lead');
   const chips=[...hero.querySelectorAll('.qily-home-conversion-hero__chips>span')];
   const media=hero.querySelector('.qily-home-project-visual');
   const action=hero.querySelector('.qily-home-conversion-actions>a');
   const rect=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   const type=e=>{const s=getComputedStyle(e);return {size:s.fontSize,weight:s.fontWeight,color:s.color,font:s.fontFamily,line:s.lineHeight};};
   return {kicker:{text:kicker.textContent.trim(),rect:rect(kicker),type:type(kicker)},
     h1:{text:h1.textContent.trim(),rect:rect(h1),type:type(h1)},
     lead:{text:lead.textContent.trim(),type:type(lead)},
     chips:chips.map(e=>({text:e.textContent.trim(),rect:rect(e),type:type(e),
       background:getComputedStyle(e).backgroundColor})),
     media:rect(media), action:action?{text:action.textContent.trim(),href:action.getAttribute('href'),
       color:getComputedStyle(action).color,background:getComputedStyle(action).backgroundColor}:null,
     scrollWidth:document.documentElement.scrollWidth,width:innerWidth};
 });
}
test('China homepage desktop hero follows international typography and 3-chip row',async({page})=>{
 test.setTimeout(180000);
 fs.mkdirSync('test-results',{recursive:true});
 for(const width of [1440,1588,1920]){
   await page.setViewportSize({width,height:960});
   await page.goto(intBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>document.body?.dataset.qilyHomeConversion==='v1');
   await page.evaluate(()=>document.fonts.ready);
   const intl=await snapshot(page);
   await page.goto(cnBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
   await page.evaluate(()=>document.fonts.ready);
   const cn=await snapshot(page);
   await page.screenshot({path:'test-results/cn-home-'+width+'.png',fullPage:false});
   expect(cn.width).toBe(width);
   expect(cn.scrollWidth,'no China viewport overflow '+width).toBeLessThanOrEqual(width+1);
   for(const part of ['kicker','h1','lead']){
     expect(cn[part].text,'content parity '+part).toBe(intl[part].text);
     expect(cn[part].type.size,'type size '+part).toBe(intl[part].type.size);
     expect(cn[part].type.color,'type color '+part).toBe(intl[part].type.color);
   }
   expect(cn.chips.map(c=>c.text)).toEqual(intl.chips.map(c=>c.text));
   expect(cn.chips).toHaveLength(3);
   expect(Math.max(...cn.chips.map(c=>c.rect.y))-Math.min(...cn.chips.map(c=>c.rect.y)),'desktop business capsules must share one row').toBeLessThanOrEqual(2);
   expect(cn.chips[2].rect.right,'third capsule must not overlap project visual').toBeLessThanOrEqual(cn.media.x-5);
   for(let i=0;i<3;i++){
     expect(cn.chips[i].type.size).toBe(intl.chips[i].type.size);
     expect(cn.chips[i].background).toBe(intl.chips[i].background);
   }
   expect(cn.action.text).toBe('查看代表案例');
   expect(cn.action.href).toBe('/notes/');
   expect(cn.action.background).toBe(intl.action.background);
   expect(await page.locator('a[href="/cooperation/#diagnosis"]').count()).toBe(0);
   expect(await page.getByText('免费60分钟沟通诊断').count()).toBe(0);
 }
});
test('China responsive home and public modules keep four-button footer and filings',async({page})=>{
 test.setTimeout(180000);
 fs.mkdirSync('test-results',{recursive:true});
 for(const width of [390,430,820]){
   await page.setViewportSize({width,height:850});
   await page.goto(cnBase+'/',{waitUntil:'domcontentloaded',timeout:45000});
   await page.evaluate(()=>document.fonts.ready);
   const cn=await snapshot(page);
   await page.screenshot({path:'test-results/cn-mobile-'+width+'.png',fullPage:false});
   expect(cn.scrollWidth,'mobile horizontal overflow').toBeLessThanOrEqual(width+1);
   expect(cn.chips).toHaveLength(3);
   expect(cn.action.href).toBe('/notes/');
 }
 for(const route of ['/','/lean/','/notes/','/trust/','/knowledge/','/resources/','/briefs/','/archive/profile/capabilities/']){
   await page.setViewportSize({width:1588,height:900});
   await page.goto(cnBase+route,{waitUntil:'domcontentloaded',timeout:45000});
   expect(await page.locator('footer.footer #floatDock button[data-action]').count(),route).toBe(4);
   expect(await page.locator('footer.footer .footer-records>a').count(),route).toBe(2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth),route).toBeLessThanOrEqual(1589);
 }
});
