'use strict';
const fs=require('fs');
const {chromium}=require('@playwright/test');
const targets=[
  ['CN','https://qilylean.cn','/'],
  ['CN','https://qilylean.cn','/archive/profile/capabilities/'],
  ['CN','https://qilylean.cn','/about/'],
  ['INT','https://qilylean.com','/'],
  ['INT','https://qilylean.com','/about/']
];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  for(const width of [1600,390]){
   for(const [site,base,route] of targets){
    const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
    const page=await context.newPage(),failures=[],bad=[];
    page.on('requestfailed',r=>failures.push([r.url().slice(0,120),r.failure()]));
    page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url().slice(0,120)]);});
    const t0=Date.now();let error='',httpStatus=null,data={};
    try{
     const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
     httpStatus=response?.status()||null;
     await page.waitForTimeout(1500);
     data=await page.evaluate(()=>{
      const measure=el=>{if(!el)return null;const r=el.getBoundingClientRect(),s=getComputedStyle(el);
       return {left:r.left,right:r.right,width:r.width,top:r.top,height:r.height,
         position:s.position,justify:s.justifyContent,display:s.display,marginLeft:s.marginLeft,
         fontSize:s.fontSize,border:s.borderTopWidth,background:s.backgroundColor};};
      const inner=document.querySelector('footer.footer .footer-inner'),dock=document.querySelector('#floatDock');
      const records=document.querySelector('footer.footer .footer-records');
      const nav=performance.getEntriesByType('navigation')[0];
      const res=performance.getEntriesByType('resource');
      const paint=performance.getEntriesByType('paint').find(e=>e.name==='first-contentful-paint');
      const css=[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href);
      return {viewport:innerWidth,docWidth:document.documentElement.scrollWidth,
       ttfb:nav&&Math.round(nav.responseStart),domReady:nav&&Math.round(nav.domContentLoadedEventEnd),
       load:nav&&Math.round(nav.loadEventEnd),fcp:paint&&Math.round(paint.startTime),
       cssCount:css.length,duplicateCss:css.filter((x,i)=>css.indexOf(x)!==i).length,
       scripts:document.querySelectorAll('script[src]').length,resourceCount:res.length,
       slowest:res.sort((a,b)=>b.duration-a.duration).slice(0,8).map(x=>({ms:Math.round(x.duration),url:x.name.slice(0,130),bytes:x.transferSize})),
       inner:measure(inner),dock:measure(dock),records:measure(records),
       buttons:[...document.querySelectorAll('#floatDock button')].map(measure),
       filings:[...document.querySelectorAll('footer.footer .footer-records>a')].map(measure),
       runtime:window.__qilyFloatingDockUnifiedV58===true};
     });
    }catch(e){error=String(e).slice(0,220)}
    const row={site,route,width,status:httpStatus,elapsed:Date.now()-t0,error,failures:failures.slice(0,8),bad:bad.slice(0,8),...data};
    results.push(row);
    console.log('QILY_AUDIT '+JSON.stringify({site,route,width,status:httpStatus,error,elapsed:row.elapsed,
      ttfb:row.ttfb,domReady:row.domReady,load:row.load,fcp:row.fcp,
      css:row.cssCount,duplicates:row.duplicateCss,scripts:row.scripts,resourceCount:row.resourceCount,
      inner:row.inner,dock:row.dock,records:row.records,buttons:row.buttons&&row.buttons.map(x=>({left:x.left,right:x.right,width:x.width})),
      filings:row.filings&&row.filings.map(x=>({left:x.left,right:x.right,border:x.border})),
      errors:row.bad,failures:row.failures,slowest:row.slowest}));
    await context.close();
   }
  }
 }finally{await browser.close()}
 fs.mkdirSync('audit-qily-live',{recursive:true});
 fs.writeFileSync('audit-qily-live/report.json',JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});