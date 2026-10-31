'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const base=process.env.QILY_TEA_URL||'https://qilylean.com/links/anxi-tea/';
const cache='20261031-tea-vi-axis-gallery-contrast-v12';
const out=path.resolve(process.env.QA_OUTPUT||'qa-output/tea-culture-v4');
fs.mkdirSync(out,{recursive:true});
const navExpected=['/','/capabilities/','/improvements/','/lean-production/','/projects/','/trust/','/cooperation/','/knowledge/','/links/','/about/'];
const assert=(ok,msg)=>{if(!ok)throw new Error('[Tea V5 QA] '+msg);};
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
      const wechat=document.querySelector('.tea-wechat__id');
      const wechatLabel=document.querySelector('.tea-wechat__label');
      const qrLabel=document.querySelector('.tea-contact__qr span');
      return !!link&&link.href.includes(token)&&!!contact&&getComputedStyle(contact).backgroundColor==='rgb(238, 247, 245)'
       &&!document.querySelector('.tea-facts')&&!document.querySelector('.tea-copy-btn')
       &&!!wechat&&wechat.textContent.trim()==='Qily259'
       &&!!wechatLabel&&wechatLabel.tagName==='SPAN'&&wechatLabel.textContent.trim()==='微信：'
       &&getComputedStyle(wechat).textDecorationLine.includes('underline')
       &&!qrLabel;
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
   const tagline=await page.locator('.tea-contact__tagline').textContent();
   assert(tagline.trim()==='让一杯茶，成为彼此认识与交流的开始。',name+': tagline line missing');
   const flowOrder=await page.evaluate(()=>{
    const names=selector=>[...document.querySelectorAll(selector)].map(img=>new URL(img.src).pathname.split('/').pop());
    return {
     origin:names('.tea-origin-grid img'),
     craft:names('.tea-craft-grid img'),
     teaRange:names('.tea-range-grid .tea-product-card__image img'),
     tasting:names('#tasting .tea-ritual-grid img'),
     originTitles:[...document.querySelectorAll('.tea-origin-grid figcaption strong')].map(x=>x.textContent.trim()),
     craftTitles:[...document.querySelectorAll('.tea-craft-grid figcaption strong')].map(x=>x.textContent.trim()),
     productLabels:[...document.querySelectorAll('.tea-range-grid .tea-product-card__copy small')].map(x=>x.textContent.trim()),
     productTitles:[...document.querySelectorAll('.tea-range-grid .tea-product-card__copy h3')].map(x=>x.textContent.trim()),
     headings:[...document.querySelectorAll('.tea-section__head .en')].map(x=>x.textContent.trim()),
     productNumbers:[...document.querySelectorAll('.tea-product-card__copy small')].map(x=>x.textContent.trim().slice(0,2))
    };
   });
   assert(flowOrder.origin.join('|')==='11-anxi-tea-garden.jpg|13-tea-processing.jpg',name+': origin must show garden then basket of fresh leaves '+JSON.stringify(flowOrder.origin));
   assert(flowOrder.craft.join('|')==='12-tea-picking-shoot.jpg|14-fresh-leaves-basket.jpg|15-tea-processing-shape.jpg|16-finished-tea-tray.jpg|17-dry-tea-detail.jpg',name+': craft photos must follow the actual processing sequence '+JSON.stringify(flowOrder.craft));
   assert(flowOrder.originTitles.join('|')==='梯田茶园|鲜叶入篮',name+': origin captions must match garden and basket '+JSON.stringify(flowOrder.originTitles));
   assert(flowOrder.craftTitles.join('|')==='包揉作业|包揉成形|茶叶摊展|干茶呈现|干茶细节',name+': craft captions must match the real photo scenes '+JSON.stringify(flowOrder.craftTitles));
   assert(flowOrder.teaRange.join('|')==='04-tieguanyin-dry-leaf.jpg|02-2026-spring-tea.jpg|10-osmanthus-blossoms.jpg|08-osmanthus-black-tea.jpg',name+': osmanthus blossoms must appear before osmanthus black tea '+JSON.stringify(flowOrder.teaRange));
   assert(flowOrder.productLabels.join('|')==='01 · SIGNATURE TEA|02 · SPRING TEA|03 · OSMANTHUS|04 · FLORAL TEA',name+': product labels must follow the image order '+JSON.stringify(flowOrder.productLabels));
   assert(flowOrder.productTitles.join('|')==='臻品铁观音|2026 春茶图鉴|桂花花枝|桂花红茶',name+': product titles must follow the image order '+JSON.stringify(flowOrder.productTitles));
   assert(flowOrder.tasting.slice(-2).join('|')==='06-brew-osmanthus-tea.jpg|18-tea-brewing.jpg',name+': brewing photo must precede the finished tea soup '+JSON.stringify(flowOrder.tasting));
   assert(flowOrder.headings.join('|')==='一、ORIGIN / 茶源|二、CRAFT / 制茶|三、TEA COLLECTION / 茶品|四、TEA RITUAL / 品鉴',name+': chapter headings must use Chinese sequence numbers');
   assert(flowOrder.productNumbers.join('|')==='01|02|03|04',name+': tea product numbering must remain 01–04');
   assert(await page.locator('.tea-facts,.tea-fact').count()===0,name+': repeated origin/tea summary tiles remain');
   assert(await page.locator('.tea-copy-btn').count()===0&&await page.locator('.tea-contact__qr span').count()===0,name+': redundant QR caption or copy control remains');
   assert((await page.locator('.tea-wechat__label').textContent()).trim()==='微信：'&&await page.locator('.tea-wechat__label').evaluate(el=>el.tagName)==='SPAN',name+': WeChat label must be static text, not part of the action.');
   assert((await page.locator('.tea-wechat__id').textContent()).trim()==='Qily259',name+': clickable WeChat ID must contain only Qily259.');
   assert(await page.locator('.tea-wechat__id').evaluate(el=>getComputedStyle(el).textDecorationLine.includes('underline')),name+': WeChat ID underline must remain visible without hover.');
   await page.waitForFunction(()=>window.__qilyTeaImageLightboxV1===true&&!!document.querySelector('#qilyTeaImageLightbox'),null,{timeout:15000});
   const allPageImages=page.locator('main.tea-page img');
   assert(await allPageImages.count()===19,name+': every content and contact image must participate in lightbox');
   for(let imageIndex=0;imageIndex<await allPageImages.count();imageIndex++){
    const target=allPageImages.nth(imageIndex);
    await target.scrollIntoViewIfNeeded();
    const expected=await target.evaluate(img=>({src:img.currentSrc||img.src,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight}));
    const scrollBefore=await page.evaluate(()=>window.scrollY);
    await target.click();
    const lightbox=page.locator('#qilyTeaImageLightbox');
    await lightbox.waitFor({state:'visible',timeout:7000});
    const shown=await lightbox.locator('.qily-tea-lightbox__image').evaluate(img=>({src:img.currentSrc||img.src,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight}));
    assert(shown.src===expected.src&&shown.width===expected.width&&shown.height===expected.height,name+': image '+imageIndex+' did not show its original source dimensions');
    const closeRect=await lightbox.locator('.qily-tea-lightbox__close').boundingBox();
    assert(closeRect&&closeRect.y<80&&closeRect.x+closeRect.width>width-80,name+': close × must remain at the top-right corner');
    if(imageIndex===0)await page.keyboard.press('Escape');else await lightbox.locator('.qily-tea-lightbox__close').click();
    await lightbox.waitFor({state:'hidden',timeout:5000});
    const scrollAfter=await page.evaluate(()=>window.scrollY);
    assert(Math.abs(scrollAfter-scrollBefore)<=2,name+': closing image '+imageIndex+' changed the original page scroll position');
   }
   await page.context().grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(base).origin});
   await page.waitForFunction(()=>typeof window.__qilyCopyWechatAndPrompt==='function',null,{timeout:30000});
   for(const selector of ['.tea-wechat__id']){
    const action=page.locator(selector);
    assert(await action.count()===1,name+': missing or duplicate WeChat action '+selector);
    await action.click();
    await page.waitForFunction(()=>{
     const prompt=document.getElementById('qilyWechatCopyPrompt');
     return !!prompt&&prompt.classList.contains('show')&&prompt.textContent.includes('微信号Qily259已复制，是否开启微信主程序')&&!!prompt.querySelector('[data-qily-open-wechat]');
    },null,{timeout:10000});
    const copied=await page.evaluate(()=>navigator.clipboard.readText());
    assert(copied==='Qily259',name+': '+selector+' did not copy Qily259');
    const promptLayer=await page.evaluate(()=>{
     const p=document.getElementById('qilyWechatCopyPrompt'),dock=document.getElementById('floatDock');
     const pr=p.getBoundingClientRect(),dr=dock.getBoundingClientRect();
     return {promptZ:+getComputedStyle(p).zIndex,dockZ:+getComputedStyle(dock).zIndex,promptBottom:pr.bottom,dockTop:dr.top};
    });
    assert(promptLayer.promptZ>promptLayer.dockZ,name+': WeChat prompt must render above the fixed bottom dock '+JSON.stringify(promptLayer));
    if(name==='mobile')assert(promptLayer.promptBottom<promptLayer.dockTop-4,name+': mobile WeChat prompt must sit above, not overlap, the bottom dock '+JSON.stringify(promptLayer));
    await page.locator('#qilyWechatCopyPrompt').evaluate(el=>el.classList.remove('show'));
   }
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
    const contactGrid=el('.tea-contact__inner'),contactCopy=el('.tea-contact__copy').getBoundingClientRect(),contactQr=el('.tea-contact__qr').getBoundingClientRect();
    const contactNote=el('.tea-note'),noteStyle=getComputedStyle(contactNote);
    const contactLayout={columns:getComputedStyle(contactGrid).gridTemplateColumns.split(/\s+/).length,template:getComputedStyle(contactGrid).gridTemplateColumns,copyWidth:contactCopy.width,qrWidth:contactQr.width,noteWhiteSpace:noteStyle.whiteSpace,noteHeight:contactNote.getBoundingClientRect().height,noteLineHeight:parseFloat(noteStyle.lineHeight)};
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
     summaryCards:document.querySelectorAll('.tea-facts,.tea-fact').length,
     contactActions:{copyButtons:document.querySelectorAll('.tea-copy-btn').length,qrCaptions:document.querySelectorAll('.tea-contact__qr span').length,qrCaption:el('.tea-contact__qr span')?.textContent.trim()||'',wechatLabel:el('.tea-wechat__label')?.textContent.trim()||'',wechatLabelTag:el('.tea-wechat__label')?.tagName||'',wechatText:el('.tea-wechat__id').textContent.trim(),wechatUnderline:st('.tea-wechat__id').textDecorationLine},
     contactLayout,
     dark:document.querySelectorAll('[data-qily-dark-surface="true"]').length,
     body:getComputedStyle(document.body).backgroundColor,
     contact:st('.tea-contact').backgroundColor,contactCard:st('.tea-contact__inner').backgroundColor,
     returnBg:st('.tea-directory-return__link').backgroundColor,returnFg:st('.tea-directory-return__link').color,
     fonts:[st('.tea-contact__copy p').fontSize,st('.tea-section__head p').fontSize,st('.tea-photo figcaption span').fontSize,st('.tea-page-heading h1').fontSize],
     large,pairs,grids,axis,media1179,teaStylesheet:{loaded:!!(teaLink&&teaLink.sheet),href:teaLink&&teaLink.href,sheetRuleCount,servedCss,ritualRules,allSheetErrors,gridInlineStyle:ritualGrid.getAttribute('style'),gridMatches:ritualGrid.matches('main.tea-page #tasting .tea-ritual-grid')},
     fits:[st('.tea-hero img').objectFit,st('.tea-photo img').objectFit,st('.tea-product-card__image img').objectFit,st('.tea-lifestyle img').objectFit],
     overflow:document.documentElement.scrollWidth>innerWidth+1,
     viewport:{width:innerWidth,clientWidth:document.documentElement.clientWidth,bodyClientWidth:document.body.clientWidth,height:innerHeight}
    };
   });
   assert(m.header,name+': shared global header missing');
   assert(m.nav.length===10&&m.nav.every((a,i)=>a.href===navExpected[i]),name+': global navigation differs from canonical order');
   assert(m.nav[8].current==='page',name+': Resource Collaboration active state missing');
   assert(m.sections===8&&m.images===19&&m.captions===12,name+': page structure/image count changed');
   assert(m.summaryCards===0,name+': duplicate summary cards must be absent');
   assert(m.contactActions.copyButtons===0&&m.contactActions.qrCaptions===0&&m.contactActions.qrCaption===''&&m.contactActions.wechatLabel==='微信：'&&m.contactActions.wechatLabelTag==='SPAN'&&m.contactActions.wechatText==='Qily259'&&m.contactActions.wechatUnderline.includes('underline'),name+': static WeChat label, underlined ID and QR caption state must be correct');
   if(name==='mobile')assert(m.contactLayout.columns===1,name+': contact modules must stack on mobile');
   else assert(m.contactLayout.columns===2&&m.contactLayout.copyWidth>m.contactLayout.qrWidth*1.4,name+': contact copy panel must be wider than the QR panel '+JSON.stringify(m.contactLayout));
   if(name==='desktop')assert(m.contactLayout.noteWhiteSpace==='nowrap'&&m.contactLayout.noteHeight<=m.contactLayout.noteLineHeight*1.2,name+': desktop contact note must remain on one line '+JSON.stringify(m.contactLayout));
   const expectedTracks=name==='desktop'?{origin:2,craft:6,range:2,ritual:6}:name==='tablet'?{origin:2,craft:2,range:2,ritual:2}:{origin:1,craft:1,range:1,ritual:1};
   Object.keys(expectedTracks).forEach(key=>assert(m.grids[key].tracks===expectedTracks[key],name+': '+key+' grid track count mismatch '+m.grids[key].tracks+'; viewport='+m.viewport.width+'; template='+m.grids[key].template+'; media1179='+m.media1179+'; stylesheet='+JSON.stringify(m.teaStylesheet)));
   const expectedRows={
    desktop:{origin:[2],craft:[3,2],range:[2,2],ritual:[3,2]},
    tablet:{origin:[2],craft:[2,2,1],range:[2,2],ritual:[2,2,1]},
    mobile:{origin:[1,1],craft:[1,1,1,1,1],range:[1,1,1,1],ritual:[1,1,1,1,1]}
   }[name];
   Object.keys(expectedRows).forEach(key=>{
    assert(JSON.stringify(rowsFor(m.grids[key]))===JSON.stringify(expectedRows[key]),name+': '+key+' row distribution mismatch '+JSON.stringify(rowsFor(m.grids[key])));
    assert(m.grids[key].rows.every(r=>r.imageTopDelta<=1.5&&r.captionBottomDelta<=1.5),name+': '+key+' images must align at top and captions at bottom');
    assert(m.grids[key].cards.every(c=>c.imageFit==='contain'),name+': '+key+' image must preserve full source content');
    if(key!=='range')assert(m.grids[key].cards.every(c=>Math.abs(c.imageRatio-c.naturalRatio)<0.03),name+': '+key+' source image aspect ratio changed');
   });
   if(name==='desktop')assert(Math.abs(m.grids.ritual.rows[1].centerDelta)<2,name+': last two tasting images must be centered as a pair');
   if(name==='desktop')assert(Math.abs(m.grids.craft.rows[1].centerDelta)<2,name+': last two craft images must be centered as a pair');
   if(name==='tablet')assert(Math.abs(m.grids.ritual.rows[2].centerDelta)<2,name+': final tablet tasting image must be centered');
   if(name==='tablet')assert(Math.abs(m.grids.craft.rows[2].centerDelta)<2,name+': final tablet craft image must be centered');
   const expectedAxis=Math.min(1180,m.viewport.bodyClientWidth-36);
   assert(m.axis.every(x=>Math.abs(x.width-expectedAxis)<=1.5),name+': content blocks do not share the 1180px public axis; expected='+expectedAxis+'; viewport='+JSON.stringify(m.viewport)+'; axis='+JSON.stringify(m.axis));
   assert(m.dark===0,name+': legacy dark-surface marker remains');
   assert(m.body==='rgb(255, 255, 255)'&&m.contact==='rgb(238, 247, 245)'&&m.contactCard==='rgb(255, 255, 255)',name+': page/contact surface palette mismatch');
   assert(m.returnBg==='rgb(15, 75, 90)'&&m.returnFg==='rgb(255, 255, 255)',name+': return button contrast mismatch');
   assert(m.fonts[0]===(name==='mobile'?'20px':'22px')&&m.fonts[1]==='20px'&&m.fonts[2]==='20px'&&parseFloat(m.fonts[3])>=30,name+': text-size floor mismatch '+m.fonts.join(','));
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
