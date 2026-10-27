const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
// Production verifies an immutable release identity rather than a CDN's
// potentially cached previous homepage. The source-manifest gate uses this
// same release query, so visual acceptance checks the actual candidate.
function freshCnUrl(url){
 if(!process.env.GITHUB_SHA || !url.startsWith(cnBase))return url;
 const next=new URL(url);
 next.searchParams.set('release',process.env.GITHUB_SHA);
 return next.toString();
}
const parity=JSON.parse(fs.readFileSync(path.join(__dirname,'../cn-site/archive/source-content-parity.json'),'utf8'));
const publicModules=[
 {source:'index.html',selectors:['#qily-home-industry-scenes','#qily-home-representative-cases','#qily-home-six-step-method','#qily-home-capability-building','#qily-home-standard-deliverables','#qily-evidence-value','#qily-knowledge-assets','#qily-trust-center']},
 {source:'capabilities/index.html',selectors:['#flow','#data','#equipment','#quality','#layout','#management','#digital','#mechanism','#project-evidence','#digital-tools']},
 {source:'improvements/index.html',selectors:['#paper-list']},
 {source:'lean-production/index.html',selectors:['#method','#topics','section.section.dark']},
 {source:'projects/index.html',selectors:['#project-reading-rule','#public-verification-structure']},
 {source:'trust/index.html',selectors:['#data','#evidence','#evidence-levels','#publication','#ai','#journey']},
 {source:'knowledge/index.html',selectors:['#knowledge-stats','#ai-manufacturing-knowledge','#terminology','#daily','#tools','#lean-series','#documents']},
 {source:'links/index.html',selectors:['#electricalRecommendations']}
].map(contract=>{
 const record=parity.pages.find(item=>item.source===contract.source);
 if(!record)throw new Error('Public visual contract has no route ledger entry: '+contract.source);
 return {...contract,url:record.url,intUrl:contract.source==='index.html'?'/':'/'+contract.source.replace(/index\.html$/,'')};
});
async function visit(page,url,{home=false,expand=false}={}){
 await page.goto(freshCnUrl(url),{waitUntil:'domcontentloaded',timeout:45000});
 await expect(page.locator('main')).toBeVisible();
 if(home)await page.waitForFunction(()=>document.body?.dataset.qilyHomeConversion==='v1'||document.querySelector('main[data-cn-source-content="index.html"] .qily-home-conversion-hero'));
 await page.evaluate(async({expand})=>{
   await document.fonts.ready;
   if(expand)document.querySelectorAll('main details').forEach(details=>{details.open=true;});
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 },{expand});
 // COM's existing R8 owner reasserts its final cascade at 120/700/1400ms.
 // Compare settled presentation with CN's statically materialized cascade.
 if(await page.evaluate(()=>document.body?.dataset.qilySite!=='cn')){
   await page.waitForTimeout(1600);
   await page.waitForFunction(()=>!document.getElementById('qilyVisualAuthorityR8')||[...document.head.querySelectorAll('link[rel="stylesheet"]')].filter(el=>{try{return new URL(el.href,location.href).origin===location.origin}catch{return false}}).at(-1)?.id==='qilyVisualAuthorityR8');
 }
}
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
   await visit(page,intBase+'/',{home:true});
   const intl=await snapshot(page);
   await visit(page,cnBase+'/',{home:true});
   const cn=await snapshot(page);
   await page.screenshot({path:'test-results/cn-home-'+width+'.png',fullPage:false});
   expect(cn.width).toBe(width);
   expect(cn.scrollWidth,'no China viewport overflow '+width).toBeLessThanOrEqual(width+1);
   for(const part of ['kicker','h1','lead']){
     expect(cn[part].text,'content parity '+part).toBe(intl[part].text);
     expect(cn[part].type,'shared font family, size, weight, line height and color: '+part).toEqual(intl[part].type);
   }
   expect(cn.chips.map(c=>c.text)).toEqual(intl.chips.map(c=>c.text));
   expect(cn.chips).toHaveLength(3);
   expect(Math.max(...cn.chips.map(c=>c.rect.y))-Math.min(...cn.chips.map(c=>c.rect.y)),'desktop business capsules must share one row').toBeLessThanOrEqual(2);
   expect(cn.chips[2].rect.right,'third capsule must not overlap project visual').toBeLessThanOrEqual(cn.media.x-5);
   for(let i=0;i<3;i++){
     expect(cn.chips[i].type).toEqual(intl.chips[i].type);
     expect(cn.chips[i].background).toBe(intl.chips[i].background);
   }
   expect(await page.locator('.qily-home-conversion-actions>a').count()).toBe(1);
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
   await visit(page,cnBase+'/',{home:true});
   const cn=await snapshot(page);
   await page.screenshot({path:'test-results/cn-mobile-'+width+'.png',fullPage:false});
   expect(cn.scrollWidth,'mobile horizontal overflow').toBeLessThanOrEqual(width+1);
   expect(cn.chips).toHaveLength(3);
   expect(cn.action.href).toBe('/notes/');
 }
 for(const route of ['/','/lean/','/notes/','/trust/','/knowledge/','/resources/','/briefs/','/archive/profile/capabilities/']){
   await page.setViewportSize({width:1588,height:900});
   await page.goto(freshCnUrl(cnBase+route),{waitUntil:'domcontentloaded',timeout:45000});
   expect(await page.locator('footer.footer #floatDock button[data-action]').count(),route).toBe(4);
   expect(await page.locator('footer.footer .footer-records>a').count(),route).toBe(2);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth),route).toBeLessThanOrEqual(1589);
 }
});

// Inspect settled public modules, including the international homepage runtime.
// Compare the same retained IDs/text rather than whole-page text: commercial
// paragraphs and CN-owned navigation, translation and filings are intentional
// differences. Opening details on both sites exposes the shared extended axis.
async function moduleSnapshot(page,selectors){
 return page.evaluate(selectors=>{
   const main=document.querySelector('main');
   const normalize=value=>String(value||'').replace(/\s+/g,' ').trim();
   const rect=element=>{const r=element.getBoundingClientRect();return {x:r.x,width:r.width,height:r.height,right:r.right};};
   const typography=element=>{
     const s=getComputedStyle(element);
     return {fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,letterSpacing:s.letterSpacing};
   };
   const layoutAncestors=element=>{
     const result=[];
     for(let parent=element.parentElement;parent&&parent!==main;parent=parent.parentElement){
       const display=getComputedStyle(parent).display;
       if(/^(?:inline-)?(?:grid|flex)$/.test(display)){
         const children=[...parent.children].filter(child=>getComputedStyle(child).display!=='none');
         const item=children.findIndex(child=>child.contains(element));
         result.push({display,children:children.length,item});
       }
       if(parent.matches('section'))break;
     }
     return result;
   };
   const textSnapshot=element=>({text:normalize(element.textContent),rect:rect(element),type:typography(element),layoutAncestors:layoutAncestors(element)});
   const elements=selectors.map(selector=>({selector,element:main.querySelector(selector)}));
   const order=elements.filter(item=>item.element).sort((a,b)=>a.element.compareDocumentPosition(b.element)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1).map(item=>item.selector);
   return {
     width:innerWidth,scrollWidth:document.documentElement.scrollWidth,order,
     hero:main.querySelector('h1')?textSnapshot(main.querySelector('h1')):null,
     modules:elements.map(({selector,element})=>{
       if(!element)return {selector,missing:true};
       const inner=element.querySelector(':scope > :is(.inner,.module-inner,.section-inner,.hero-inner,.qily-home-conversion-inner,.qily-asset-inner,.qily-ia-inner)')||element;
       return {selector,inner:rect(inner),
         headings:[...element.querySelectorAll('h2,h3')].map(textSnapshot),
         paragraphs:[...element.querySelectorAll('p')].map(textSnapshot).filter(item=>item.text),
         background:getComputedStyle(element).backgroundColor};
     })
   };
 },selectors);
}
function expectHorizontalParity(actual,expected,label){
 for(const key of ['x','width'])expect(Math.abs(actual[key]-expected[key]),label+' '+key).toBeLessThanOrEqual(2);
}
function expectRetainedTextLayout(actual,expected,inner,label){
 // Removing commercial grid/flex siblings legitimately moves the retained card
 // into a different column. Its type and module bounds still match the source;
 // exact text bounds apply when all layout-ancestor sibling counts/indices do.
 // This contract is structural and applies equally to every public route.
 expect(actual.layoutAncestors.map(item=>item.display),label+' shared grid/flex layout').toEqual(expected.layoutAncestors.map(item=>item.display));
 expect(actual.rect.x,label+' module left containment').toBeGreaterThanOrEqual(inner.x-2);
 expect(actual.rect.right,label+' module right containment').toBeLessThanOrEqual(inner.right+2);
 if(JSON.stringify(actual.layoutAncestors)===JSON.stringify(expected.layoutAncestors)){
   expectHorizontalParity(actual.rect,expected.rect,label);
 }
}
for(const contract of publicModules){
 for(const width of [1440,390]){
   test('Public module content, order and VI: '+contract.url+' at '+width,async({page})=>{
     test.setTimeout(120000);
     await page.setViewportSize({width,height:900});
     await visit(page,intBase+contract.intUrl,{home:contract.source==='index.html',expand:true});
     const intl=await moduleSnapshot(page,contract.selectors);
     await visit(page,cnBase+contract.url,{home:contract.source==='index.html',expand:true});
     const cn=await moduleSnapshot(page,contract.selectors);
     expect(cn.scrollWidth,contract.url+' viewport containment').toBeLessThanOrEqual(width+1);
     expect(cn.order,'retained public module order').toEqual(intl.order);
     expect(cn.order,'all contracted public modules must be present').toHaveLength(contract.selectors.length);
     expect(cn.hero,'public page title').not.toBeNull();
     expect(cn.hero.text,'public page title content').toBe(intl.hero.text);
     expect(cn.hero.type,'public page title VI').toEqual(intl.hero.type);
     expectHorizontalParity(cn.hero.rect,intl.hero.rect,contract.url+' title bounds');
     for(let index=0;index<contract.selectors.length;index++){
       const actual=cn.modules[index],expected=intl.modules[index],label=contract.url+' '+actual.selector;
       expect(actual.missing,label+' present on China').not.toBe(true);
       expect(expected.missing,label+' present on international').not.toBe(true);
       expectHorizontalParity(actual.inner,expected.inner,label+' content bounds');
       expect(actual.inner.width,label+' 1180px content maximum').toBeLessThanOrEqual(1182);
       expect(actual.inner.x,label+' left containment').toBeGreaterThanOrEqual(-1);
       expect(actual.inner.right,label+' right containment').toBeLessThanOrEqual(width+1);
       expect(actual.background,label+' section background').toBe(expected.background);
       expect(actual.headings.length,label+' public heading coverage').toBeGreaterThan(0);
       // h3 statistics may be domain-specific live totals; the shared h2 and
       // nonnumeric public card headings must remain in the source sequence.
       const stableHeadings=actual.headings.filter(item=>!/^\d[\d\s,.]*\s*(?:项|篇|大模块)$/.test(item.text));
       // Explicitly authorize the ONE filed-China noncommercial rewrite.
       // All other headings remain exact COM text; the rewrite must also
       // preserve source typography and normal section geometry.
       const cnLegalHeadings=new Map([
         ['把“能力展示、职业成果、项目证据、AI辅助”放回各自正确的位置',
          '把“能力展示、职业成果、商业合作、AI辅助”放回各自正确的位置']
       ]);
       if(contract.source==='index.html'&&actual.selector==='#qily-trust-center'){
         expect(actual.headings.some(h=>h.text===Array.from(cnLegalHeadings.keys())[0]),
          'Approved China trust heading must not disappear').toBe(true);
       }
       let headingIndex=-1;
       for(const heading of stableHeadings){
         const counterpart=cnLegalHeadings.get(heading.text)||heading.text;
         const next=expected.headings.findIndex((item,i)=>i>headingIndex&&item.text===counterpart);
         expect(next,label+' retained heading: '+heading.text).toBeGreaterThan(headingIndex);
         const reference=expected.headings[next];
         expect(heading.type,label+' heading VI: '+heading.text).toEqual(reference.type);
         expectRetainedTextLayout(heading,reference,actual.inner,label+' heading bounds: '+heading.text);
         headingIndex=next;
       }
       const body=actual.paragraphs.find(item=>expected.paragraphs.some(reference=>reference.text===item.text));
       // The strict source validator checks all retained text. A section's
       // only paragraph can be commercial copy; compare typography whenever
       // a public paragraph survives that independently verified filter.
       if(body){
         const reference=expected.paragraphs.find(item=>item.text===body.text);
         expect(body.type,label+' body VI').toEqual(reference.type);
         expectRetainedTextLayout(body,reference,actual.inner,label+' body bounds');
       }
     }
   });
 }
}
test('All six public operating-axis topics retain the international 6/3/2 grid',async({page})=>{
 test.setTimeout(180000);
 const contract=publicModules.find(item=>item.source==='capabilities/index.html');
 for(const [width,columns] of [[1440,6],[820,3],[390,2]]){
   await page.setViewportSize({width,height:900});
   const readAxis=()=>page.locator('main .qily-system-axis__steps').evaluate(element=>{
     const style=getComputedStyle(element),rect=element.getBoundingClientRect();
     return {columns:style.gridTemplateColumns.split(/\s+/).length,gap:style.gap,
       x:rect.x,width:rect.width,right:rect.right,
       topics:[...element.children].map(child=>({text:child.textContent.replace(/\s+/g,' ').trim(),width:child.getBoundingClientRect().width}))};
   });
   await visit(page,intBase+contract.intUrl);
   const intl=await readAxis();
   await visit(page,cnBase+contract.url);
   const cn=await readAxis();
   expect(cn.topics.map(item=>item.text),'all six engineering topics at '+width).toEqual(intl.topics.map(item=>item.text));
   expect(cn.topics).toHaveLength(6);
   expect(cn.columns,'international responsive grid at '+width).toBe(columns);
   expect(cn.columns).toBe(intl.columns);
   expect(cn.gap).toBe(intl.gap);
   expectHorizontalParity(cn,intl,'operating-axis '+width);
   expect(cn.right).toBeLessThanOrEqual(width+1);
 }
});

test('Times26001 seven functional buttons and responsive VI match international',async({page})=>{
 test.setTimeout(120000);
 const labels=['下载 Android APK','下载说明','扫码下载','分享下载页','隐私政策','用户协议','技术支持'];
 async function read(){
  return page.locator('#times26001 .module-actions').evaluate(element=>{
   const actions=[...element.querySelectorAll('a')];
   const base=actions.length?actions[0].getBoundingClientRect().top:0;
   return actions.map(anchor=>{
    const style=getComputedStyle(anchor),box=anchor.getBoundingClientRect();
    return {text:anchor.textContent.trim(),href:anchor.getAttribute('href'),
      row:Math.round((box.top-base)/Math.max(1,box.height+8)),
      top:Math.round(box.top),height:Math.round(box.height),
      color:style.color,background:style.backgroundColor,
      fontSize:style.fontSize,fontWeight:style.fontWeight,
      radius:style.borderRadius,padding:style.padding,display:style.display};
   });
  });
 }
 for(const width of [1588,390]){
  await page.setViewportSize({width,height:960});
  await visit(page,intBase+'/capabilities/');
  const intl=await read();
  await visit(page,cnBase+'/archive/profile/capabilities/');
  const cn=await read();
  expect(intl.map(x=>x.text),'international Times26001 button contract').toEqual(labels);
  expect(cn.map(x=>x.text),'China Times26001 buttons must all be links').toEqual(labels);
  expect(cn.every(x=>x.href&&x.href!=='#'),'no inert buttons').toBe(true);
  expect(cn[0].href).toContain('Times26001-Android-v1.1.14-Standard-Website-Logo.apk');
  expect(cn[6].href).toBe('/app-support/');
  for(let i=0;i<labels.length;i++){
   for(const key of ['height','color','background','fontSize','fontWeight','radius','padding','display']){
    expect(cn[i][key],'Times26001 button '+labels[i]+' '+key+' at '+width).toBe(intl[i][key]);
   }
  }
  // Compare row groupings only after actual computed browser layout settles.
  function rows(data){
   const positions=[];
   for(const button of data){
    if(!positions.some(y=>Math.abs(y-button.top)<=2))positions.push(button.top);
   }
   return positions.map(y=>data.filter(x=>Math.abs(x.top-y)<=2).length);
  }
  expect(rows(cn),'matching seven-button row grouping at '+width).toEqual(rows(intl));
  if(width===1588)expect(rows(cn),'desktop grouping per approved screenshot').toEqual([3,4]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
 }
});

/* QILY-HISTORICAL-VI-20261026: screenshot redlines across both domains.
 * Full-width single card, equal-width pairs, vertically stacked owner panels.
 */
test('QilyLean CN homepage one/two-card rows occupy the entire content axis',async({page})=>{
 test.setTimeout(120000);
 for(const width of [1588,1024,820,390]){
  await page.setViewportSize({width,height:960});
  await page.goto(freshCnUrl(cnBase+'/'),{waitUntil:'networkidle'});
  const grids=await page.evaluate(()=>{
   function metric(selector){
    const grid=document.querySelector(selector);
    if(!grid)return null;
    const parent=grid.parentElement;
    const rr=x=>{const z=x.getBoundingClientRect();return {x:z.x,right:z.right,width:z.width,height:z.height,top:z.top};};
    return {grid:rr(grid),parent:rr(parent),children:[...grid.children].filter(x=>getComputedStyle(x).display!=='none').map(rr),columns:getComputedStyle(grid).gridTemplateColumns};
   }
   return {single:metric('#qily-trust-center .qily-six-grid'),paired:metric('main .qily-ia-delivery-summary'),scroll:document.documentElement.scrollWidth};
  });
  expect(grids.single,'single proof card').not.toBeNull();
  expect(grids.paired,'two evidence cards').not.toBeNull();
  expect(grids.single.children).toHaveLength(1);
  expect(grids.paired.children).toHaveLength(2);
  expect(grids.single.grid.width-grids.single.children[0].width).toBeLessThanOrEqual(2);
  expect(grids.paired.grid.width-grids.paired.parent.width).toBeLessThanOrEqual(2);
  if(width>=720){
   const [a,b]=grids.paired.children;
   expect(Math.abs(a.width-b.width),'two evenly divided columns').toBeLessThanOrEqual(3);
   expect(Math.abs(a.top-b.top),'same row not staggered').toBeLessThanOrEqual(3);
   expect(Math.abs(b.right-grids.paired.grid.right),'pair reaches reading right edge').toBeLessThanOrEqual(3);
  }else{
   expect(Math.abs(grids.paired.children[0].width-grids.paired.grid.width)).toBeLessThanOrEqual(3);
  }
  expect(grids.scroll).toBeLessThanOrEqual(width+1);
 }
});

test('Both homepages present full-width stacked owner roles beside uncropped portrait',async({page})=>{
 test.setTimeout(120000);
 for(const url of [intBase+'/',cnBase+'/']){
  await page.setViewportSize({width:1588,height:1000});
  await page.goto(freshCnUrl(url),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.querySelectorAll('main details').forEach(d=>d.open=true));
  if(url.startsWith(intBase))await page.waitForTimeout(1650);
  const p=await page.evaluate(()=>{
   const root=document.querySelector('#qily-home-collaboration .qily-home-collaboration');
   if(!root)return null;
   const columns=root.querySelector('.qily-home-collaboration__roles');
   const figure=root.querySelector('.qily-home-collaboration__portrait');
   const photo=figure.querySelector('img');
   const cards=[...columns.querySelectorAll(':scope > .qily-home-role')];
   const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   return {root:rect(root),columns:rect(columns),figure:rect(figure),photo:rect(photo),fit:getComputedStyle(photo).objectFit,cards:cards.map(rect),overflow:document.documentElement.scrollWidth};
  });
  expect(p,url+' owner section exists').toBeTruthy();
  expect(p.cards).toHaveLength(2);
  expect(Math.abs(p.cards[0].left-p.cards[1].left),url+' vertically aligned roles').toBeLessThanOrEqual(3);
  expect(Math.abs(p.cards[0].width-p.columns.width),url+' full-width top role').toBeLessThanOrEqual(3);
  expect(Math.abs(p.cards[1].width-p.columns.width),url+' full-width lower role').toBeLessThanOrEqual(3);
  expect(p.cards[1].top,url+' role cards do not overlap').toBeGreaterThanOrEqual(p.cards[0].bottom-2);
  expect(Math.abs(p.figure.height-p.columns.height),url+' portrait scales to paired roles').toBeLessThanOrEqual(6);
  expect(p.fit).toBe('cover');
  expect(p.overflow).toBeLessThanOrEqual(1589);
  if(url.startsWith(cnBase)){
   const bio=page.locator('#qily-home-collaboration .qily-home-owner-profile');
   await expect(bio,'CN owner full public biography must remain visible').toBeVisible();
   await expect(bio).toContainText('丁启利｜20年制造业工程技术与精益改善履历');
   await expect(bio).toContainText('累计6年多从事咨询交付');
   const cta=bio.locator('a.qily-home-owner-profile__experience');
   await expect(cta).toHaveAttribute('href','/archive/profile/experience/');
   await expect(cta).toBeVisible();
   const b=await cta.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {display:s.display,color:s.color,background:s.backgroundColor,width:r.width,height:r.height}});
   expect(b.display,'CN resume CTA is a styled button, not hidden prose').toBe('inline-flex');
   expect(b.color).toBe('rgb(255, 255, 255)');
   expect(b.background).toBe('rgb(15, 75, 90)');
   expect(b.height).toBeGreaterThanOrEqual(43);
   await page.screenshot({path:'test-results/cn-owner-public-bio-visual-parity.png'});
  }
 }
});

test('About semantic labels preserve the approved 21px dual-site VI on desktop and mobile',async({page})=>{
 for(const width of [1588,390]){
  await page.setViewportSize({width,height:900});
  for(const url of [intBase+'/about/',cnBase+'/about/']){
   await page.goto(freshCnUrl(url),{waitUntil:'networkidle'});
   if(url.startsWith(intBase))await page.waitForTimeout(1650);
   const type=await page.locator('main .page-hero .hero-eyebrow').evaluate(el=>{const s=getComputedStyle(el);return {size:parseFloat(s.fontSize),weight:parseInt(s.fontWeight,10),color:s.color,fill:s.webkitTextFillColor};});
   expect(type.size,url+' '+width+'px public VI label size').toBeGreaterThanOrEqual(20.5);
   expect(type.size,url+' '+width+'px public VI label size').toBeLessThanOrEqual(21.5);
   expect(type.weight,url+' eyebrow regular weight').toBeLessThanOrEqual(500);
   expect(type.color,url+' light-gold text color').toBe('rgb(255, 227, 155)');
   expect(type.fill,url+' light-gold text fill').toBe('rgb(255, 227, 155)');
  }
 }
});

// Only first-party, site-controlled styles belong in the R8 ordering contract.
// Third-party translation UI styles may load afterwards independently.
test('International resource directory uses final R8 cascade at first paint without a delayed bar',async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width:1588,height:960});
 await page.goto(intBase+'/links/',{waitUntil:'domcontentloaded'});
 const initial=await page.evaluate(()=>({
   owner:[...document.head.querySelectorAll('link[rel="stylesheet"]')].filter(el=>{try{return new URL(el.href,location.href).origin===location.origin}catch{return false}}).at(-1)?.id, lastStyle:[...document.head.querySelectorAll('link[rel="stylesheet"]')].at(-1)?.outerHTML, recentStyles:[...document.head.querySelectorAll('link[rel="stylesheet"]')].slice(-4).map(el=>el.outerHTML),
   r8:!!document.getElementById('qilyVisualAuthorityR8'),
   bridge:!!document.querySelector('#qilyChinaKnowledgeBridge'),
   recommendations:!!document.querySelector('#electricalRecommendations')
 }));
 expect(initial.r8).toBe(true);
 await page.screenshot({path:'test-results/resource-firstpaint-international.png'});
 expect(initial.owner,'R8 must be the final stylesheet: '+JSON.stringify(initial.recentStyles)).toBe('qilyVisualAuthorityR8');
 expect(initial.bridge&&initial.recommendations).toBe(true);
 fs.mkdirSync('test-results',{recursive:true});
 await page.screenshot({path:'test-results/resource-firstpaint-international.png'});
 await page.waitForTimeout(1900);
 const last=await page.evaluate(()=>[...document.head.querySelectorAll('link[rel="stylesheet"]')].filter(el=>{try{return new URL(el.href,location.href).origin===location.origin}catch{return false}}).at(-1)?.id);
 expect(last,'R8 remains last after delayed shell checkpoints').toBe('qilyVisualAuthorityR8');
 await page.screenshot({path:'test-results/resource-settled-international.png'});
});

/* 20261026 figure containment: same portrait must not escape the reading frame
 * at 375/390/430px, independently of browser's default <figure> margins. */
test('Owner portrait keeps mobile reading gutters on both homepages',async({page})=>{
 test.setTimeout(150000);
 for(const width of [375,390,430]){
  await page.setViewportSize({width,height:900});
  for(const url of [intBase+'/',cnBase+'/']){
   await page.goto(freshCnUrl(url),{waitUntil:'networkidle'});
   await page.evaluate(()=>document.querySelectorAll('main details').forEach(x=>x.open=true));
   if(url.startsWith(intBase))await page.waitForTimeout(1600);
   const metrics=await page.locator('#qily-home-collaboration .qily-home-collaboration__portrait').evaluate(el=>{
    const frame=el.getBoundingClientRect(),img=el.querySelector('img').getBoundingClientRect();
    const owner=el.closest('section').getBoundingClientRect();
    const style=getComputedStyle(el);
    return {figure:{left:frame.left,right:frame.right,width:frame.width},
      image:{left:img.left,right:img.right,width:img.width},
      owner:{left:owner.left,right:owner.right},
      marginLeft:parseFloat(style.marginLeft),marginRight:parseFloat(style.marginRight),
      viewport:document.documentElement.clientWidth};
   });
   expect(metrics.marginLeft,url+' no default figure margin-left').toBe(0);
   expect(metrics.marginRight,url+' no default figure margin-right').toBe(0);
   expect(metrics.figure.left,url+' photo respects section left').toBeGreaterThanOrEqual(metrics.owner.left-3);
   expect(metrics.figure.right,url+' photo respects section right').toBeLessThanOrEqual(metrics.owner.right+3);
   expect(metrics.image.right,url+' image stays inside frame').toBeLessThanOrEqual(metrics.figure.right+2);
   expect(metrics.figure.right,url+' no horizontal viewport overflow').toBeLessThanOrEqual(metrics.viewport+1);
  }
 }
});
