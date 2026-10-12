const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const CN=path.resolve(process.cwd(),'cn-site');
const BASE=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const INDEX=path.join(CN,'archive/nonbrief-visual-parity.json');

function luminance(rgb){
  const a=(String(rgb).match(/[\d.]+/g)||[]).slice(0,3).map(Number);
  if(a.length!==3)return NaN;
  const n=a.map(v=>{const x=v/255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;});
  return .2126*n[0]+.7152*n[1]+.0722*n[2];
}
function contrast(a,b){
  let x=luminance(a),y=luminance(b);
  if(!Number.isFinite(x)||!Number.isFinite(y))return 0;
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}

test.setTimeout(12*60*1000);
test('all CN cloned non-brief knowledge pages have readable teal hero text and category pills',async({browser})=>{
  const inventory=JSON.parse(fs.readFileSync(INDEX,'utf8'));
  const pages=inventory.items.filter(x=>x.url&&x.visual_mode==='source-structure');
  expect(pages.length,'non-brief mirror coverage').toBeGreaterThanOrEqual(35);
  const violations=[];
  let pagesChecked=0, samples=0,buttons=0,terminologyFound=false;
  for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
    const page=await browser.newPage({viewport:{width:device.width,height:device.height},isMobile:device.name==='mobile'});
    for(const item of pages){
      let response;
      try{response=await page.goto(BASE+item.url,{waitUntil:'domcontentloaded',timeout:15000});}
      catch(e){violations.push(device.name+' '+item.url+' cannot load '+String(e).slice(0,85));continue;}
      if(!response||!response.ok()){violations.push(device.name+' '+item.url+' unexpected HTTP status');continue;}
      pagesChecked++;
      const els=await page.evaluate(()=>{
        let out=[],heroCount=0;
        const visible=(el)=>{const r=el.getBoundingClientRect(),st=getComputedStyle(el);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none'};
        const note=(el,kind,expectedBg)=>{
          if(!visible(el)||!(el.textContent||'').trim())return;
          const st=getComputedStyle(el);
          const fill=st.webkitTextFillColor&&st.webkitTextFillColor!=='currentcolor'?st.webkitTextFillColor:st.color;
          out.push({kind,text:(el.textContent||'').trim().slice(0,45),fill,background:st.backgroundColor,expectedBg});
        };
        for(const hero of document.querySelectorAll('main .mirror-article-fidelity :is(.module-hero,.tool-hero,.hero)')){
          if(!visible(hero))continue;
          heroCount++;
          for(const el of hero.querySelectorAll('h1,h2,h3,.module-lead,.tool-lead,p:not([data-qily-light-surface])')){
            if(el.closest('[data-qily-light-surface],.module-card,.tool-card,.note,.check,.quote'))continue;
            note(el,'hero-text','rgb(23, 127, 135)');
          }
          for(const el of hero.querySelectorAll('.module-eyebrow,.tool-eyebrow,.eyebrow'))note(el,'gold-label','rgb(23, 127, 135)');
          for(const el of hero.querySelectorAll('.module-subnav a,.module-actions a,.tool-actions a'))note(el,'light-pill','rgb(255, 255, 255)');
          for(const el of hero.querySelectorAll('[data-qily-light-surface]'))note(el,'light-count','rgb(237, 248, 246)');
        }
        return {out,heroCount};
      });
      for(const el of els.out){
        const ratio=contrast(el.fill,el.expectedBg);
        const floor=el.kind==='gold-label'?3:4.5;
        if(ratio+0.03<floor){
          violations.push(device.name+' '+item.url+' '+el.kind+' '+el.text+' contrast '+ratio.toFixed(2)+':1 '+el.fill);
        }
        if(el.kind==='light-pill'){
          buttons++;
          if(el.background!=='rgb(255, 255, 255)')violations.push(device.name+' '+item.url+' light pill background not white: '+el.background);
        }
        samples++;
      }
      if(item.url==='/archive/knowledge/terminology/'){
        terminologyFound=true;
        if(!els.out.some(x=>x.kind==='hero-text'))violations.push(device.name+' terminology heading/lead missing');
        if(els.out.filter(x=>x.kind==='light-pill').length<8)violations.push(device.name+' terminology eight category labels missing');
        const hero=page.locator('main .mirror-article-fidelity .module-hero').first();
        if(await hero.count()){
          fs.mkdirSync('visual-cn-knowledge-contrast',{recursive:true});
          await hero.screenshot({path:'visual-cn-knowledge-contrast/terminology-'+device.name+'.png',timeout:20000});
        }
      }
    }
    await page.close();
  }
  console.log(JSON.stringify({pagesChecked,samples,buttons,terminologyFound,violations:violations.length}));
  if(violations.length)console.error(violations.slice(0,60).join('\n'));
  expect(terminologyFound,'screenshot terminology page is in the corpus').toBe(true);
  expect(buttons,'category pills are actually inspected').toBeGreaterThanOrEqual(8);
  expect(violations,'all cloned knowledge hero surfaces must remain readable').toEqual([]);
});
