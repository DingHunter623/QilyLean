'use strict';
/* Read-only production check. Never mutates website content. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const OUT=path.resolve(process.cwd(),'underline-production-evidence');
fs.mkdirSync(OUT,{recursive:true});
const pairs=[
 ['home','/','/'],
 ['about','/about/','/about/'],
 ['trust','/trust/','/trust/'],
 ['knowledge','/knowledge/','/knowledge/'],
 ['resources','/links/','/resources/']
];
const bases=[
 {name:'international',origin:'https://qilylean.com',idx:1},
 {name:'china',origin:'https://qilylean.cn',idx:2}
];
const marker='QILY-CONTINUOUS-LINK-UNDERLINE-20261024';
const diagnostic=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url) {
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),30000);
 try {return await fetch(url,{signal:controller.signal,redirect:'follow',headers:{'cache-control':'no-cache'}});}
 finally {clearTimeout(timer);}
}
async function proveCssLive(){
 for(let attempt=1;attempt<=15;attempt++){
  const checks=await Promise.all(bases.map(async base=>{
    const u=base.origin+'/site-content-axis-v1.css?underline_verify='+Date.now();
    try {const r=await get(u);const body=await r.text();return {site:base.name,status:r.status,ready:r.ok&&body.includes(marker)&&body.includes('text-decoration-skip-ink:none!important')};}
    catch(e){return {site:base.name,error:String(e),ready:false};}
  }));
  console.log('Live CSS attempt '+attempt+': '+JSON.stringify(checks));
  if(checks.every(x=>x.ready))return checks;
  if(attempt<15)await sleep(15000);
 }
 throw Error('Production CSS still lacks the continuous-underline rule on one or both domains.');
}
(async()=>{
 await proveCssLive();
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const failures=[];
 try{
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
   for(const base of bases){
    for(const [label,intRoute,cnRoute] of pairs){
     const route=base.idx===1?intRoute:cnRoute;
     const page=await context.newPage();
     try{
      const url=base.origin+route;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:55000});
      if(!response||response.status()>=400)throw Error('Page HTTP '+(response?.status()||'no response'));
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(250);
      const result=await page.evaluate(()=>{
       const visible=el=>{const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;};
       const nodes=[...document.querySelectorAll('main *,footer *,header *')].filter(visible);
       const underlined=nodes.filter(el=>getComputedStyle(el).textDecorationLine.includes('underline'));
       const failing=underlined.filter(el=>getComputedStyle(el).textDecorationSkipInk!=='none');
       const semantic=nodes.filter(el=>/qilylean\.(?:com|cn)|@qilylean\.com|湘ICP备|湘公网安备|微信|联系电话/.test((el.textContent||'').trim())&&el.children.length===0).slice(0,12).map(el=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,65),underlined:getComputedStyle(el).textDecorationLine,skipInk:getComputedStyle(el).textDecorationSkipInk}));
       return {underlined:underlined.length,failing:failing.slice(0,10).map(el=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,90),skipInk:getComputedStyle(el).textDecorationSkipInk,className:String(el.className||'').slice(0,100)})),semantic,scrollOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,brandDomain:getComputedStyle(document.querySelector('main .trust-box .brand-domain a')||document.body).textDecorationSkipInk};
      });
      if(result.failing.length)failures.push(base.name+' '+width+' '+route+' interrupted underline CSS: '+JSON.stringify(result.failing));
      if(label==='about' && result.brandDomain!=='none')failures.push(base.name+' '+width+' about brand domain skip-ink '+result.brandDomain);
      diagnostic.push({site:base.name,width,route,...result});
      if(label==='about'){
       const target=page.locator('main .trust').last();
       if(await target.count()){await target.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,base.name+'-about-'+width+'.png')});}
      }
     }catch(e){failures.push(base.name+' '+width+' '+route+' '+e.message);}
     finally{await page.close();}
    }
   }
   await context.close();
  }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({source:marker,diagnostic,failures},null,2));
 console.log('Production underline report: '+diagnostic.length+' route/width checks, '+failures.length+' failures; see report.json');
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
