const {chromium}=require('@playwright/test');
const pairs=[
['/','/'],['/capabilities/','/archive/profile/capabilities/'],
['/improvements/','/archive/profile/tools/'],['/lean-production/','/lean/'],
['/projects/','/notes/'],['/trust/','/trust/'],
['/knowledge/','/knowledge/'],['/links/','/resources/'],
['/about/','/about/']
];
const sel='main :is(.qily-home-conversion-hero__kicker,.qily-home-conversion-kicker,.qily-ia-kicker,.module-eyebrow,.eyebrow,.hero-eyebrow,.section-kicker,.module-kicker,.kicker,.resource-kicker,.qily-resource-network__kicker,.engineering-kicker,.qily-home-capability-building__kicker,.qily-home-brand-extension__kicker,.qily-asset-kicker,.qily-system-axis__title,.qily-home-conversion-heading>small,.qily-ia-heading>small)';
async function snapshot(page,url) {
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:65000});
 await page.evaluate(()=>document.fonts.ready);
 return page.evaluate(sel=>{
  const nodes=[...document.querySelectorAll(sel)].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&r.width>0});
  return nodes.map((el,index)=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {
   idx:index,t:el.textContent.replace(/\s+/g,' ').trim().slice(0,100),
   cls:el.className,tag:el.tagName,id:el.id,
   section:(el.closest('section')?.id||el.closest('section')?.className||'').toString().slice(0,85),
   css:[s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.letterSpacing,s.color,s.webkitTextFillColor,s.textTransform],
   geo:[Math.round(r.left*10)/10,Math.round(r.width*10)/10,Math.round(r.height*10)/10]
  }});
 },sel);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [1440,1588,390]){
  for(const [int,cn] of pairs){
    if(width===390 && !['/','/capabilities/','/trust/','/knowledge/'].includes(int))continue;
    const page=await browser.newPage({viewport:{width,height:900}});
    const [a,b]=[await snapshot(page,(process.env.QILY_KICKER_INT_BASE||'https://qilylean.com')+int),await snapshot(page,(process.env.QILY_KICKER_CN_BASE||'https://qilylean.cn')+cn)];
    const map=new Map();for(const item of a){let list=map.get(item.t)||[];list.push(item);map.set(item.t,list)}
    const matched=b.map(x=>{let y=(map.get(x.t)||[]).shift();return {t:x.t,cls:x.cls,section:x.section,intl:y?.css,cn:x.css,intl_geo:y?.geo,cn_geo:x.geo,match:!!y&&JSON.stringify(y.css)===JSON.stringify(x.css)}}).filter(x=>x.intl);
    console.log('KICKER_PARITY '+JSON.stringify({width,int,cn,countIntl:a.length,countCN:b.length,matched:matched.length,diffs:matched.filter(x=>!x.match),equal:matched.filter(x=>x.match).length,cnOnly:b.filter(x=>!a.some(y=>y.t===x.t)).slice(0,10).map(x=>x.t)}));
    if(process.env.QILY_KICKER_STRICT==='1'&&matched.some(x=>!x.match))throw Error('VI gold label mismatch: '+cn+' at '+width+'px');
    await page.close();
  }
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
