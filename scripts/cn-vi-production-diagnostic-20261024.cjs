const { chromium } = require('@playwright/test');
const routes=[
 {route:'/archive/profile/capabilities/',intl:'/capabilities/',key:'价值流与单件流',width:1440},
 {route:'/archive/profile/capabilities/',intl:'/capabilities/',key:'启力精益斗地主',width:390},
 {route:'/trust/',intl:'/trust/',key:'区分核定值与估算值',width:1440},
 {route:'/',intl:'/',key:'查看代表案例',width:1600}
];
async function inspect(page,origin,path,needle){
 await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:45000});
 await page.evaluate(()=>document.fonts.ready);
 return page.evaluate(needle=>{
  const norm=s=>(s||'').replace(/\s+/g,' ').trim();
  const els=[...document.querySelectorAll('main h1,main h2,main h3,main a')];
  const node=els.find(x=>norm(x.textContent)===needle);
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height}};
  const style=e=>{const c=getComputedStyle(e);return {display:c.display,position:c.position,
   gridTemplateColumns:c.gridTemplateColumns,gridTemplateRows:c.gridTemplateRows,
   width:c.width,maxWidth:c.maxWidth,minWidth:c.minWidth,overflow:c.overflow,boxSizing:c.boxSizing,
   gap:c.gap,padding:c.padding,margin:c.margin,fontSize:c.fontSize,letterSpacing:c.letterSpacing,transform:c.transform}};
  const ancestors=[];if(node)for(let p=node,steps=0;p&&steps<8;p=p.parentElement,steps++)ancestors.push({tag:p.tagName,id:p.id,class:p.className,rect:rect(p),style:style(p)});
  const root=document.documentElement,first=document.querySelector('#floatDock button[data-action="top"]');
  const footer=document.querySelector('.footer-inner');
  return {needle,found:!!node,viewport:{innerWidth,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth},
    ancestors,footer:footer?rect(footer):null,first: first?rect(first):null};
 },needle);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const row of routes){
  const page=await browser.newPage({viewport:{width:row.width,height:1000}});
  const intl=await inspect(page,'http://127.0.0.1:4173',row.intl,row.key);
  const cn=await inspect(page,'http://127.0.0.1:4174',row.route,row.key);
  console.log('QILY_DIAGNOSTIC '+JSON.stringify({route:row.route,needle:row.key,width:row.width,intl,cn}));
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
