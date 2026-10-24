const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
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
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
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
   await page.waitForFunction(()=>!document.getElementById('qilyVisualAuthorityR8')||document.head.lastElementChild?.id==='qilyVisualAuthorityR8');
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
   await page.goto(cnBase+route,{waitUntil:'domcontentloaded',timeout:45000});
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
       let headingIndex=-1;
       for(const heading of stableHeadings){
         const next=expected.headings.findIndex((item,i)=>i>headingIndex&&item.text===heading.text);
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
