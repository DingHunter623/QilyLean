'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const base=process.env.QILY_TEA_URL||'https://qilylean.com/links/anxi-tea/';
const cache='20261031-tea-vi-axis-gallery-contrast-v5';
const out=path.resolve(process.env.QA_OUTPUT||'qa-output/tea-culture-v4');
fs.mkdirSync(out,{recursive:true});
const navExpected=['/','/capabilities/','/improvements/','/lean-production/','/projects/','/trust/','/cooperation/','/knowledge/','/links/','/about/'];
const assert=(ok,msg)=>{if(!ok)throw new Error('[Tea V4 QA] '+msg);};
const rgb=v=>{const m=String(v||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);if(!m)throw new Error('Bad color '+v);return m.slice(1,4).map(n=>+n/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));};
const lum=v=>{const c=rgb(v);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const rowsFor=(grid)=>grid.rows.map(r=>r.count);
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   let ready=false;
   for(let attempt=0;attempt<18&&!ready;attempt++){
    await page.goto(base+'?tea-visual-qa='+Date.now()+'-'+attempt,{waitUntil:'domcontentloaded',timeout:90000});
    try{
     await page.waitForFunction(token=>{
      const link=document.querySelector('#qilyTeaResourceVisualClosureV3');
      const contact=document.querySelector('.tea-contact');
      return !!link&&link.href.includes(token)&&!!contact&&getComputedStyle(contact).backgroundColor==='rgb(238, 247, 245)';
     },cache,{timeout:9000});
     ready=true;
    }catch(_){await page.waitForTimeout(5000);}
   }
   assert(ready,'V4 production stylesheet not available after deployment polling');
   await page.waitForSelector('header.qily-site-header.qily-global-header nav.qily-global-nav a',{state:'visible'});
   const imgs=await page.evaluate(async()=>{
    const a=[...document.querySelectorAll('main.tea-page img')];
    a.forEach(x=>x.loading='eager');
    await Promise.all(a.map(x=>x.decode().catch(()=>null)));
    return a.map(x=>({complete:x.complete,w:x.naturalWidth,h:x.naturalHeight,src:new URL(x.src).pathname}));
   });
   assert(imgs.length===19&&imgs.every(x=>x.complete&&x.w>0&&x.h>0),name+': original image load failed '+JSON.stringify(imgs.filter(x=>!x.w)));
   const m=await page.evaluate(async()=>{
    const el=s=>document.querySelector(s),st=s=>getComputedStyle(el(s));
    const nav=[...document.querySelectorAll('header.qily-site-header nav.qily-global-nav>a')];
    const sections=[...document.querySelectorAll('main.tea-page section')];
    const photoCaptions=[...document.querySelectorAll('.tea-photo figcaption')];
    const gridReport=(selector,cardSelector,imageSelector,captionSelector)=>{
     const grid=el(selector),cards=[...grid.querySelectorAll(':scope > '+cardSelector)],rows=[];
     cards.forEach(card=>{
      const r=card.getBoundingClientRect();
      let row=rows.find(x=>Math.abs(x.top-r.top)<2);
      if(!row){row={top:r.top,cards:[]};rows.push(row);}
      row.cards.push(card);
     });
     return {
      tracks:getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length,template:getComputedStyle(grid).gridTemplateColumns,
      cards:cards.map(card=>{
       const image=card.querySelector(imageSelector),caption=card.querySelector(captionSelector);
       const ir=image.getBoundingClientRect(),cr=caption.getBoundingClientRect(),r=card.getBoundingClientRect();
       return {gridColumnStart:getComputedStyle(card).gridColumnStart,cardTop:r.top,cardBottom:r.bottom,imageTop:ir.top,imageRatio:ir.width/ir.height,naturalRatio:image.naturalWidth/image.naturalHeight,imageFit:getComputedStyle(image).objectFit,captionBottom:cr.bottom};
      }),
      rows:rows.map(row=>{
       const tops=row.cards.map(card=>card.querySelector(imageSelector).getBoundingClientRect().top);
       const bottoms=row.cards.map(card=>card.querySelector(captionSelector).getBoundingClientRect().bottom);
       const centers=row.cards.map(card=>{const r=card.getBoundingClientRect();return r.left+r.width/2;});
       return {count:row.cards.length,imageTopDelta:Math.max(...tops)-Math.min(...tops),captionBottomDelta:Math.max(...bottoms)-Math.min(...bottoms),centerDelta:centers.reduce((a,b)=>a+b,0)/centers.length-(grid.getBoundingClientRect().left+grid.getBoundingClientRect().width/2)};
      })
     };
    };
    const grids={
     origin:gridReport('.tea-origin-grid','.tea-photo','img','figcaption'),
     craft:gridReport('.tea-craft-grid','.tea-photo','img','figcaption'),
     range:gridReport('.tea-range-grid','.tea-product-card','.tea-product-card__image img','.tea-product-card__copy'),
     ritual:gridReport('#tasting .tea-ritual-grid','.tea-photo','img','figcaption')
    };
    const teaLink=el('#qilyTeaResourceVisualClosureV3'),ritualRules=[];
    const ritualGrid=el('#tasting .tea-ritual-grid');
    const collectRules=(rules,source,media=[])=>{for(const rule of Array.from(rules||[])){
     if(rule.selectorText&&rule.style&&(rule.style.getPropertyValue('grid-template-columns')||rule.style.getPropertyValue('grid-template'))){
      let matches=false;try{matches=ritualGrid.matches(rule.selectorText);}catch(_){}
      if(matches||rule.selectorText.includes('tea-ritual-grid'))ritualRules.push({source,media,selector:rule.selectorText,columns:rule.style.getPropertyValue('grid-template-columns'),template:rule.style.getPropertyValue('grid-template'),priority:rule.style.getPropertyPriority('grid-template-columns'),matches});
     }
     if(rule.cssRules&&rule.cssRules.length){
      const nextMedia=rule.conditionText?[...media,{condition:rule.conditionText,active:matchMedia(rule.conditionText).matches}]:media;
      collectRules(rule.cssRules,source,nextMedia);
     }
    }};
    let sheetRuleCount=0,servedCss={ok:false,status:0,v4:false,media:false},allSheetErrors=[];
    for(const sheet of Array.from(document.styleSheets)){try{const rules=sheet.cssRules;if(sheet===teaLink.sheet)sheetRuleCount=rules.length;collectRules(rules,sheet.href||'inline');}catch(error){allSheetErrors.push({href:sheet.href,error:String(error)});}}
    try{const response=await fetch(teaLink.href,{cache:'no-store'});const text=await response.text();servedCss={ok:response.ok,status:response.status,v4:text.includes('QilyLean Tea Culture Visual Governance V4'),media:text.includes('@media(max-width:1179px)')};}catch(error){servedCss={ok:false,error:String(error)};}
    const media1179=matchMedia('(max-width:1179px)').matches;
    const axisSelectors=['.tea-breadcrumb','.tea-page-heading','.tea-hero','.tea-intro','.tea-section__inner','.tea-contact__inner'];
    const axis=axisSelectors.map(selector=>({selector,width:el(selector).getBoundingClientRect().width,left:el(selector).getBoundingClientRect().left}));
    const large=[getComputedStyle(document.body).backgroundColor,st('.tea-hero').backgroundColor,st('.tea-intro').backgroundColor,st('.tea-lifestyle').backgroundColor,st('.tea-contact').backgroundColor,st('.tea-directory-return').backgroundColor,...[...document.querySelectorAll('.tea-section')].map(x=>getComputedStyle(x).backgroundColor)];
    const pairs=[
     ['contact-copy',st('.tea-contact__copy p').color,st('.tea-contact__inner').backgroundColor],
     ['contact-kicker',st('.tea-contact__kicker').color,st('.tea-contact__inner').backgroundColor],
     ['photo-caption',st('.tea-photo figcaption span').color,st('.tea-photo figcaption').backgroundColor],
     ['return-button',st('.tea-directory-return__link').color,st('.tea-directory-return__link').backgroundColor],
     ['section-copy',st('.tea-section__head p').color,getComputedStyle(el('.tea-section')).backgroundColor],
     ['breadcrumb',st('.tea-breadcrumb').color,'rgb(255, 255, 255)']
    ];
    return {
     nav:nav.map(a=>({href:a.getAttribute('href'),current:a.getAttribute('aria-current')})),
     header:!!el('header.qily-site-header.qily-global-header'),
     sections:sections.length,images:document.querySelectorAll('main.tea-page img').length,captions:photoCaptions.length,
     dark:document.querySelectorAll('[data-qily-dark-surface="true"]').length,
     body:getComputedStyle(document.body).backgroundColor,
     contact:st('.tea-contact').backgroundColor,contactCard:st('.tea-contact__inner').backgroundColor,
     returnBg:st('.tea-directory-return__link').backgroundColor,returnFg:st('.tea-directory-return__link').color,
     fonts:[st('.tea-contact__copy p').fontSize,st('.tea-section__head p').fontSize,st('.tea-photo figcaption span').fontSize,st('.tea-page-heading h1').fontSize],
     large,pairs,grids,axis,media1179,teaStylesheet:{loaded:!!(teaLink&&teaLink.sheet),href:teaLink&&teaLink.href,sheetRuleCount,servedCss,ritualRules,allSheetErrors,gridInlineStyle:ritualGrid.getAttribute('style'),gridMatches:ritualGrid.matches('main.tea-page #tasting .tea-ritual-grid')},
     fits:[st('.tea-hero img').objectFit,st('.tea-photo img').objectFit,st('.tea-product-card__image img').objectFit,st('.tea-lifestyle img').objectFit,st('.tea-flower-note img').objectFit],
     overflow:document.documentElement.scrollWidth>innerWidth+1,
     viewport:{width:innerWidth,height:innerHeight}
    };
   });
   assert(m.header,name+': shared global header missing');
   assert(m.nav.length===10&&m.nav.every((a,i)=>a.href===navExpected[i]),name+': global navigation differs from canonical order');
   assert(m.nav[8].current==='page',name+': Resource Collaboration active state missing');
   assert(m.sections===8&&m.images===19&&m.captions===12,name+': page structure/image count changed');
   const expectedTracks=name==='desktop'?{origin:3,craft:2,range:3,ritual:6}:name==='tablet'?{origin:2,craft:2,range:2,ritual:2}:{origin:1,craft:1,range:1,ritual:1};
   Object.keys(expectedTracks).forEach(key=>assert(m.grids[key].tracks===expectedTracks[key],name+': '+key+' grid track count mismatch '+m.grids[key].tracks+'; viewport='+m.viewport.width+'; template='+m.grids[key].template+'; media1179='+m.media1179+'; stylesheet='+JSON.stringify(m.teaStylesheet)));
   const expectedRows={
    desktop:{origin:[3],craft:[2,2],range:[3],ritual:[3,2]},
    tablet:{origin:[2,1],craft:[2,2],range:[2,1],ritual:[2,2,1]},
    mobile:{origin:[1,1,1],craft:[1,1,1,1],range:[1,1,1],ritual:[1,1,1,1,1]}
   }[name];
   Object.keys(expectedRows).forEach(key=>{
    assert(JSON.stringify(rowsFor(m.grids[key]))===JSON.stringify(expectedRows[key]),name+': '+key+' row distribution mismatch '+JSON.stringify(rowsFor(m.grids[key])));
    assert(m.grids[key].rows.every(r=>r.imageTopDelta<=1.5&&r.captionBottomDelta<=1.5),name+': '+key+' images must align at top and captions at bottom');
    assert(m.grids[key].cards.every(c=>c.imageFit==='contain'),name+': '+key+' image must preserve full source content');
    if(key!=='range')assert(m.grids[key].cards.every(c=>Math.abs(c.imageRatio-c.naturalRatio)<0.03),name+': '+key+' source image aspect ratio changed');
   });
   if(name==='desktop')assert(Math.abs(m.grids.ritual.rows[1].centerDelta)<2,name+': last two tasting images must be centered as a pair');
   if(name==='tablet')assert(Math.abs(m.grids.ritual.rows[2].centerDelta)<2,name+': final tablet tasting image must be centered');
   const expectedAxis=Math.min(1180,width-36);
   assert(m.axis.every(x=>Math.abs(x.width-expectedAxis)<=1.5),name+': content blocks do not share the 1180px public axis '+JSON.stringify(m.axis));
   assert(m.dark===0,name+': legacy dark-surface marker remains');
   assert(m.body==='rgb(255, 255, 255)'&&m.contact==='rgb(238, 247, 245)'&&m.contactCard==='rgb(255, 255, 255)',name+': page/contact surface palette mismatch');
   assert(m.returnBg==='rgb(15, 75, 90)'&&m.returnFg==='rgb(255, 255, 255)',name+': return button contrast mismatch');
   assert(m.fonts[0]==='20px'&&m.fonts[1]==='20px'&&m.fonts[2]==='20px'&&parseFloat(m.fonts[3])>=30,name+': text-size floor mismatch '+m.fonts.join(','));
   const approved=['rgb(255, 255, 255)','rgb(238, 247, 245)','rgb(247, 251, 250)'];
   assert(m.large.every(c=>approved.includes(c)),name+': non-standard large-area background '+JSON.stringify(m.large));
   assert(m.fits.every(v=>v==='contain'),name+': image cropping detected '+m.fits.join(','));
   assert(!m.overflow,name+': horizontal overflow');
   const ratios=m.pairs.map(([label,fg,bg])=>({label,ratio:+ratio(fg,bg).toFixed(2),fg,bg}));
   assert(ratios.every(x=>x.ratio>=4.5),name+': WCAG AA contrast failure '+JSON.stringify(ratios));
   const dir=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const directoryUrl=new URL('/links/',base).href+'?tea-directory-qa='+Date.now();
   await dir.goto(directoryUrl,{waitUntil:'domcontentloaded',timeout:90000});
   await dir.waitForFunction(token=>{
    const link=document.querySelector('#qilyTeaResourceVisualClosureV3');
    const card=document.querySelector('.resource-feature');
    const meta=card&&card.querySelector('.resource-feature__meta');
    return !!link&&link.href.includes(token)&&!!meta&&getComputedStyle(meta.querySelector('span')).color==='rgb(49, 95, 100)';
   },cache,{timeout:30000});
   const dm=await dir.evaluate(()=>{
    const card=document.querySelector('.resource-feature'),meta=card.querySelector('.resource-feature__meta');
    return {
     lightSurface:card.getAttribute('data-qily-light-surface'),
     darkSurface:card.hasAttribute('data-qily-dark-surface'),
     background:getComputedStyle(card).backgroundColor,
     text:meta.textContent.trim(),
     spans:[...meta.querySelectorAll('span')].map(x=>({color:getComputedStyle(x).color,fill:getComputedStyle(x).getPropertyValue('-webkit-text-fill-color'),opacity:getComputedStyle(x).opacity,filter:getComputedStyle(x).filter,mix:getComputedStyle(x).mixBlendMode})),
     overflow:document.documentElement.scrollWidth>innerWidth+1
    };
   });
   assert(dm.lightSurface==='true'&&!dm.darkSurface,name+': resource directory card must be registered as a light surface');
   assert(dm.background==='rgb(255, 255, 255)'&&dm.text.length>0,name+': resource directory card surface or metadata missing');
   assert(dm.spans.length===2&&dm.spans.every(x=>x.color==='rgb(49, 95, 100)'&&x.fill==='rgb(49, 95, 100)'&&x.opacity==='1'&&x.filter==='none'&&x.mix==='normal'),name+': directory metadata color was overridden or faded '+JSON.stringify(dm.spans));
   const directoryContrast=dm.spans.map(x=>+ratio(x.fill,dm.background).toFixed(2));
   assert(directoryContrast.every(x=>x>=4.5),name+': directory metadata WCAG AA contrast failure '+directoryContrast.join(','));
   assert(!dm.overflow,name+': resource directory horizontal overflow');
   m.contrastRatios=ratios;m.imageLoad=imgs;m.axisExpected=expectedAxis;
   fs.writeFileSync(path.join(out,name+'-computed.json'),JSON.stringify(m,null,2));
   fs.writeFileSync(path.join(out,name+'-directory-computed.json'),JSON.stringify({...dm,contrast:directoryContrast},null,2));
   await page.screenshot({path:path.join(out,name+'-tea-full-page.png'),fullPage:true,animations:'disabled'});
   await dir.screenshot({path:path.join(out,name+'-directory-full-page.png'),fullPage:true,animations:'disabled'});
   results.push({viewport:name,pass:true,sections:m.sections,images:imgs.length,axis:m.axis.map(x=>Math.round(x.width)),grids:Object.fromEntries(Object.keys(m.grids).map(k=>[k,rowsFor(m.grids[k])])),overflow:m.overflow,contrast:ratios.map(x=>x.ratio),directoryContrast});
   await page.close();await dir.close();
  }
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({status:'passed',url:base,cache,results},null,2));
  console.log(JSON.stringify({status:'passed',cache,results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
