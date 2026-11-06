const {test,expect}=require('@playwright/test');
const com=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const pages=[
 {site:'international',url:com+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'China',url:cn+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'international',url:com+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'},
 {site:'China',url:cn+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'}
];
test('Four screenshot pages preserve one 15px effective mobile reading gutter',async({page})=>{
 test.setTimeout(180000);
 for(const width of [390,430,620]){
  await page.setViewportSize({width,height:900});
  for(const contract of pages){
   await page.goto(contract.url,{waitUntil:'domcontentloaded'});
   if(contract.site==='international')await page.waitForTimeout(1600);
   const rects=await page.evaluate(({selector,second})=>{
    const get=(s)=>{if(!s)return null;const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
    return {primary:get(selector),secondary:get(second),documentWidth:document.documentElement.scrollWidth,layoutWidth:Math.min(document.documentElement.clientWidth,document.documentElement.scrollWidth)};
   },contract);
   console.log('DUAL_SITE_GUTTER',JSON.stringify({site:contract.site,url:contract.url,width,...rects}));
   expect(rects.primary,contract.url+' expected principal reading content').toBeTruthy();
   expect(rects.documentWidth,contract.url+' no page overflow '+width).toBeLessThanOrEqual(width+1);
   expect.soft(Math.abs(rects.primary.left-15),contract.url+' left reading edge '+width).toBeLessThanOrEqual(1.5);
   expect.soft(Math.abs(rects.layoutWidth-rects.primary.right-15),contract.url+' right edge within layout viewport '+width).toBeLessThanOrEqual(1.5);
   if(rects.secondary){
    expect.soft(Math.abs(rects.primary.left-rects.secondary.left),contract.url+' hero-to-body axis '+width).toBeLessThanOrEqual(1);
    expect.soft(Math.abs(rects.primary.right-rects.secondary.right),contract.url+' hero-to-body right axis '+width).toBeLessThanOrEqual(1);
   }
  }
 }
});
test('Selected international and China public routes retain no mobile overflow',async({page})=>{
 test.setTimeout(150000);
 const routes=[
  [com+'/capabilities/',cn+'/archive/profile/capabilities/'],
  [com+'/knowledge/',cn+'/knowledge/'],
  [com+'/trust/',cn+'/trust/'],
  [com+'/links/',cn+'/resources/']
 ];
 for(const width of [390,430]){
  await page.setViewportSize({width,height:900});
  for(const pair of routes)for(const url of pair){
   await page.goto(url,{waitUntil:'domcontentloaded'});
   const stats=await page.evaluate(()=>{
    const main=document.querySelector('main');
    const section=main?.querySelector(':scope > section');
    const r=section?.getBoundingClientRect();
    return {documentWidth:document.documentElement.scrollWidth,
      firstSection:r?{left:r.left,right:r.right,width:r.width}:null};
   });
   console.log('SAMPLED_SITE_CONTAINMENT',JSON.stringify({url,width,...stats}));
   expect(stats.documentWidth,url+' horizontal containment').toBeLessThanOrEqual(width+1);
  }
 }
});

test('W43 governance table uses efficient desktop columns and semantic mobile wrapping on both domains',async({page})=>{
 test.setTimeout(150000);
 const routes=[
  {site:'international',url:com+'/qilylean/daily/2026-10-25.html'},
  {site:'China',url:cn+'/briefs/archive/2026-10-25/'}
 ];
 for(const width of [390,430,1440]){
  await page.setViewportSize({width,height:1000});
  for(const route of routes){
   await page.goto(route.url,{waitUntil:'domcontentloaded'});
   const metrics=await page.evaluate(()=>{
    const table=document.querySelector('.w43-table');
    if(!table)return null;
    const heads=[...table.querySelectorAll('thead th')].map(el=>el.getBoundingClientRect().width);
    const first=table.querySelector('tbody tr td:first-child');
    const marker=first?.querySelector('.w43-mobile-break');
    const markerRect=marker?.getBoundingClientRect();
    let phraseTop=0;
    if(first?.firstChild?.nodeType===Node.TEXT_NODE){
      const range=document.createRange();
      range.selectNodeContents(first.firstChild);
      phraseTop=range.getBoundingClientRect().top;
    }
    return {
      tableWidth:table.getBoundingClientRect().width,
      ratios:heads.map(v=>v/table.getBoundingClientRect().width),
      firstText:first?.innerText||'',
      markerDisplay:marker?getComputedStyle(marker).display:null,
      phraseTop,
      markerTop:markerRect?.top||0,
      documentWidth:document.documentElement.scrollWidth
    };
   });
   console.log('W43_RESPONSIVE_TABLE',JSON.stringify({site:route.site,width,...metrics}));
   expect(metrics,route.url+' governance table exists').toBeTruthy();
   expect(metrics.documentWidth,route.url+' no horizontal overflow').toBeLessThanOrEqual(width+1);
   if(width<=430){
    expect.soft(metrics.ratios[0],route.url+' mobile first column').toBeGreaterThanOrEqual(.35);
    expect.soft(metrics.ratios[0],route.url+' mobile first column').toBeLessThanOrEqual(.37);
    expect.soft(metrics.markerDisplay,route.url+' mobile semantic break').toBe('block');
    expect.soft(metrics.markerTop,route.url+' mobile second phrase next line').toBeGreaterThan(metrics.phraseTop+1);
   }else{
    expect.soft(metrics.ratios[0],route.url+' desktop first column').toBeGreaterThanOrEqual(.23);
    expect.soft(metrics.ratios[0],route.url+' desktop first column').toBeLessThanOrEqual(.25);
    expect.soft(metrics.ratios[1],route.url+' desktop second column').toBeGreaterThanOrEqual(.39);
    expect.soft(metrics.ratios[1],route.url+' desktop second column').toBeLessThanOrEqual(.41);
    expect.soft(metrics.ratios[2],route.url+' desktop third column').toBeGreaterThanOrEqual(.35);
    expect.soft(metrics.ratios[2],route.url+' desktop third column').toBeLessThanOrEqual(.37);
    expect.soft(metrics.markerDisplay,route.url+' desktop no forced semantic break').toBe('inline');
    expect.soft(Math.abs(metrics.markerTop-metrics.phraseTop),route.url+' desktop phrase remains same line').toBeLessThanOrEqual(1);
   }
  }
 }
});


test('DAP evidence jump and gold feedback match on international and China career pages',async({browser})=>{
 test.setTimeout(180000);
 const sites=[
  {name:'international',url:com+'/experience/'},
  {name:'China',url:cn+'/archive/profile/experience/'}
 ];
 for(const width of [1440,390]){
  for(const site of sites){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});
   try{
    const page=await context.newPage();
    await page.goto(site.url,{waitUntil:'domcontentloaded'});
    const early=page.locator('#career-2006-2015');
    const tag=early.locator('.career-related-link').filter({hasText:'DAP真空熔炉编程优化'});
    const target=early.locator('#dap-vacuum-furnace');
    await expect(tag).toBeVisible();
    await expect(target).toContainText('亲自完成DAP真空熔炉程序编程与优化');
    await expect.poll(()=>page.evaluate(()=>Boolean(window.__qilyDapEvidenceJumpV1)),{timeout:10000}).toBe(true);
    if(site.name==='international'){
     // The DAP handler is ready before the navigation's final shell. A live
     // 390px probe saw that shell add qily-global-header and grow from 138px
     // to 140px after an early click, moving the target under the header.
     // Compare the accepted, settled reference, as the other parity tests do;
     // retain the strict clearance assertions below for the resulting jump.
     await expect(page.locator('header.qily-global-header[data-qily-r8-header-shell="normalized"][data-qily-r8-measured="true"]')).toBeVisible({timeout:20000});
     await page.evaluate(()=>document.fonts.ready);
     await page.waitForTimeout(1600); // R8 reasserts its cascade at 120/700/1400ms.
     await page.waitForFunction(()=>{
      const authority=document.getElementById('qilyVisualAuthorityR8');
      const local=[...document.head.querySelectorAll('link[rel="stylesheet"]')].filter(link=>new URL(link.href,location.href).origin===location.origin);
      return !authority||local.at(-1)===authority;
     });
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    }
    await tag.click();
    await expect(page).toHaveURL(site.url+'#dap-vacuum-furnace');
    await expect.poll(()=>target.getAttribute('data-qily-dap-highlight'),{timeout:5000}).toBe('true');
    const animation=await target.evaluate(element=>{
     const style=getComputedStyle(element);
     return {name:style.animationName,duration:style.animationDuration,iterations:style.animationIterationCount};
    });
    expect(animation.name,site.name+' '+width+' animation').toBe(site.name==='China'?'cn-source-qilyDapEvidenceFlash':'qilyDapEvidenceFlash');
    expect(animation.duration,site.name+' '+width+' duration').toBe('2.4s');
    expect(animation.iterations,site.name+' '+width+' pulse count').toBe('1');
    const headerGap=()=>page.evaluate(()=>{
     const target=document.getElementById('dap-vacuum-furnace');
     const candidates=[...document.querySelectorAll('header,nav,[role="banner"],.qily-cn-nav-shell,.qily-cn-nav-rail,#qilyCnNavRail,.qily-cn-header,[data-qily-sticky-header]')];
     let bottom=0;
     for(const element of candidates){
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      if((style.position==='fixed'||style.position==='sticky')&&rect.top<=12&&rect.bottom>0)bottom=Math.max(bottom,rect.bottom);
     }
     return target.getBoundingClientRect().top-bottom;
    });
    const headerState=await page.evaluate(()=>{
     const target=document.getElementById('dap-vacuum-furnace');
     const candidates=[...document.querySelectorAll('header,nav,[role="banner"],.qily-cn-nav-shell,.qily-cn-nav-rail,#qilyCnNavRail,.qily-cn-header,[data-qily-sticky-header]')];
     return {gap:(()=>{let bottom=0;for(const element of candidates){const style=getComputedStyle(element),rect=element.getBoundingClientRect();if((style.position==='fixed'||style.position==='sticky')&&rect.top<=12&&rect.bottom>0)bottom=Math.max(bottom,rect.bottom);}return target.getBoundingClientRect().top-bottom;})(),headers:candidates.map(element=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return {tag:element.tagName,className:element.className,position:style.position,top:Math.round(rect.top*1000)/1000,bottom:Math.round(rect.bottom*1000)/1000};}).filter(item=>item.position==='fixed'||item.position==='sticky')};
    });
    console.log('DAP_HEADER_GAP',JSON.stringify({site:site.name,width,gap:headerState.gap,headers:headerState.headers}));
    await expect.poll(headerGap,{timeout:5000,message:site.name+' '+width+'px DAP evidence target must clear the visible sticky header'}).toBeGreaterThan(4);
    await expect.poll(headerGap,{timeout:5000}).toBeLessThan(160);
    await expect.poll(()=>target.getAttribute('data-qily-dap-highlight'),{timeout:3500}).toBeNull();
    await tag.click();
    await expect.poll(()=>target.getAttribute('data-qily-dap-highlight'),{timeout:3000}).toBe('true');
   }finally{await context.close();}
  }
 }
 const reduced=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
 try{
  const page=await reduced.newPage();
  await page.goto(cn+'/archive/profile/experience/',{waitUntil:'domcontentloaded'});
  const tag=page.locator('#career-2006-2015 .career-related-link').filter({hasText:'DAP真空熔炉编程优化'});
  const target=page.locator('#career-2006-2015 #dap-vacuum-furnace');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__qilyDapEvidenceJumpV1)),{timeout:10000}).toBe(true);
  await tag.click();
  await expect.poll(()=>target.getAttribute('data-qily-dap-highlight'),{timeout:3000}).toBe('true');
  const reducedStyle=await target.evaluate(element=>{
   const style=getComputedStyle(element);
   return {name:style.animationName,background:style.backgroundColor};
  });
  expect(reducedStyle.name).toBe('none');
  expect(reducedStyle.background).toBe('rgb(255, 242, 207)');
 }finally{await reduced.close();}
});
