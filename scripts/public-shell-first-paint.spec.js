const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const base=process.env.QILY_VI_V4_BASE||'http://127.0.0.1:4173';
const pages=[['home','/','.qily-home-conversion-hero__kicker'],['lean-production','/lean-production/','.hero .eyebrow'],['daily-index','/qilylean/daily-insights.html','h1'],['daily-brief','/qilylean/daily/2026-11-08.html','h1'],['improvements','/improvements/','h1']];
const viewports=[
  ['desktop',{width:1680,height:1000}],
  ['tablet',{width:1024,height:900}],
  ['compact',{width:820,height:900}],
  ['mobile',{width:390,height:844}]
];
const artifacts=path.join(process.cwd(),'visual-vi-v4-artifacts');
fs.mkdirSync(artifacts,{recursive:true});

for(const width of [1440,1024,820,390,320]){
  test(`resource directory contains its navigation rail before delayed shell runtimes at ${width}px`,async({browser})=>{
    const context=await browser.newContext({viewport:{width,height:1000}});
    let releaseShell;
    const shellGate=new Promise(resolve=>{releaseShell=resolve;});
    let r8Requested=false;
    try{
      await context.addInitScript(()=>{
        window.__qilyResourceRailProbe={samples:0,escapes:[]};
        const sample=()=>{
          document.querySelectorAll('header .qily-primary-nav-scroll-rail').forEach(rail=>{
            const box=rail.getBoundingClientRect(),header=rail.closest('header').getBoundingClientRect();
            const style=getComputedStyle(rail);
            if(style.display==='none'||style.visibility==='hidden'||!box.width||!box.height)return;
            window.__qilyResourceRailProbe.samples++;
            if(box.top<header.top-1||box.bottom>header.bottom+1){
              window.__qilyResourceRailProbe.escapes.push({time:performance.now(),railTop:box.top,railBottom:box.bottom,headerTop:header.top,headerBottom:header.bottom});
            }
          });
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.origin!==new URL(base).origin)return route.abort();
        if(['/site-visual-runtime-r8.js','/site-navigation-core.js'].includes(url.pathname)){
          if(url.pathname==='/site-visual-runtime-r8.js')r8Requested=true;
          await shellGate;
        }
        return route.continue();
      });
      const page=await context.newPage();
      const response=await page.goto(base+'/links/',{waitUntil:'commit'});
      expect(response&&response.ok()).toBeTruthy();
      await expect.poll(()=>r8Requested).toBe(true);
      await page.waitForFunction(()=>window.__qilyResourceRailProbe.samples>=12);
      expect(await page.evaluate(()=>window.__qilyResourceRailProbe.escapes),'the rail must never paint over page content while R8/core are delayed').toEqual([]);
      await page.locator('#electricalRecommendations').scrollIntoViewIfNeeded();
      // Capture the actual delayed frame without waiting for fonts.ready:
      // blocking deferred scripts deliberately keeps that promise pending.
      const capture=await context.newCDPSession(page);
      const delayedFrame=await capture.send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(artifacts,`resource-rail-${width}-delayed.png`),Buffer.from(delayedFrame.data,'base64'));
      await capture.detach();
      releaseShell();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForFunction(()=>window.__qilyVisualRuntimeR84===true&&window.__qilyLeanSiteNavigationPublicV8===true);
      // Include all bounded R8 cascade/header checkpoints (last is 1400 ms).
      await page.waitForTimeout(1600);
      expect(await page.evaluate(()=>window.__qilyResourceRailProbe.escapes),'rail remains inside the header throughout hydration and scrolling').toEqual([]);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),'no horizontal page overflow').toBeLessThanOrEqual(1);
      await expect(page.locator('#companyGrid > .card')).toHaveCount(100);
      await expect(page.locator('#electricalRecommendations [data-company-reference]')).toHaveCount(4);
      if(width>820)await expectNavigationRail(page);
      await page.screenshot({path:path.join(artifacts,`resource-rail-${width}-settled.png`)});
    }finally{
      releaseShell();
      await context.close().catch(()=>{});
    }
  });
}

async function observeStaticMenu(context){
  await context.addInitScript(()=>{
    // This observer is only a regression probe. Production keeps one Dock owner.
    const probe={initial:null,replaced:false,initialHeader:null,headerReplaced:false,invalidMenus:[],coreReady:false,navMovements:[]};
    window.__qilyStaticMenuProbe=probe;
    const movement=(nav,reason,stack)=>{
      if(!nav.matches('header nav'))return;
      probe.navMovements.push({reason,left:nav.scrollLeft,max:nav.scrollWidth-nav.clientWidth,width:nav.clientWidth,classes:nav.className,stack});
      if(probe.navMovements.length>40)probe.navMovements.shift();
    };
    const scrollLeft=Object.getOwnPropertyDescriptor(Element.prototype,'scrollLeft');
    Object.defineProperty(Element.prototype,'scrollLeft',{...scrollLeft,set(value){scrollLeft.set.call(this,value);movement(this,'set '+value,new Error().stack);}});
    document.addEventListener('scroll',event=>{if(event.target instanceof Element)movement(event.target,'scroll');},true);
    const actions=node=>[...node.querySelectorAll('[data-action]')].map(button=>button.getAttribute('data-action'));
    const inspect=records=>{
      const current=document.getElementById('floatDock');
      const header=document.querySelector('header.qily-site-header.qily-global-header');
      if(!probe.initialHeader&&header)probe.initialHeader=header;
      if(probe.initialHeader&&header!==probe.initialHeader)probe.headerReplaced=true;
      if(!probe.initial&&current&&current.getAttribute('data-qily-first-paint-dock')==='v1'&&actions(current).length===4)probe.initial=current;
      if(!probe.initial)return;
      if(current!==probe.initial)probe.replaced=true;
      if(current&&actions(current).length!==4)probe.invalidMenus.push(actions(current));
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType!==1)continue;
          const menus=node.id==='floatDock'?[node]:[...node.querySelectorAll('#floatDock')];
          for(const menu of menus){
            if(menu!==probe.initial&&actions(menu).length!==4)probe.invalidMenus.push(actions(menu));
          }
        }
      }
    };
    new MutationObserver(inspect).observe(document,{childList:true,subtree:true});
    document.addEventListener('DOMContentLoaded',()=>inspect([]),{once:true});
    document.addEventListener('qily:shell-ready',()=>{
      // The navigation core announces readiness after buildDock(), rather than
      // at its entry guard. A failed core boot must not satisfy this test.
      if(window.__qilyLeanSiteNavigationPublicV8===true)probe.coreReady=true;
    });
  });
}

async function expectStaticMenuPreserved(page){
  const probe=await page.evaluate(()=>{
    const state=window.__qilyStaticMenuProbe;
    return state&&{captured:!!state.initial,sameNode:state.initial===document.getElementById('floatDock'),replaced:state.replaced,headerCaptured:!!state.initialHeader,headerSameNode:state.initialHeader===document.querySelector('header.qily-site-header.qily-global-header'),headerReplaced:state.headerReplaced,invalidMenus:state.invalidMenus};
  });
  expect(probe&&probe.captured,'the parser supplied the initial static menu').toBeTruthy();
  expect(probe.sameNode,'the original static menu survives shared runtime/core loading').toBeTruthy();
  expect(probe.replaced,'the static menu must never be replaced').toBe(false);
  expect(probe.headerCaptured,'the parser supplied the initial static global header').toBeTruthy();
  expect(probe.headerSameNode,'the original static header survives shared runtime/core loading').toBeTruthy();
  expect(probe.headerReplaced,'the static header must never be replaced').toBe(false);
  expect(probe.invalidMenus,'loading must never introduce a menu with missing actions').toEqual([]);
  await expect(page.locator('script[src*="/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20261022-four-actions-v1&share=20261031-copy-first-v1"]'),'pending first-paint runtime must suppress the legacy fallback loader').toHaveCount(1);
}

async function expectNavigationRail(page){
  const rail=page.locator('input.qily-primary-nav-scroll-rail[type="range"]').first();
  const state=await rail.evaluate(element=>{
    const nav=document.getElementById(element.getAttribute('aria-controls'));
    const rect=element.getBoundingClientRect();
    const style=getComputedStyle(element);
    const visible=style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
    const rowBottom=Math.max(...[...nav.querySelectorAll('a[href]')].map(link=>link.getBoundingClientRect().bottom));
    return {visible,gap:rect.top-rowBottom,maxScroll:nav.scrollWidth-nav.clientWidth};
  });
  if(!state.visible){
    expect(state.maxScroll,'nonoverflowing navigation may hide its auxiliary rail').toBeLessThanOrEqual(1);
    return;
  }
  expect(state.gap,'rail sits 8px below the rendered navigation row').toBeCloseTo(8,0);
  await expect(rail).toBeEnabled();
  await rail.press('Home');
  await expect.poll(()=>rail.evaluate(element=>document.getElementById(element.getAttribute('aria-controls')).scrollLeft)).toBeLessThanOrEqual(1);
  await rail.press('End');
  await expect.poll(()=>rail.evaluate(element=>{
    const nav=document.getElementById(element.getAttribute('aria-controls'));
    return Math.abs(nav.scrollWidth-nav.clientWidth-nav.scrollLeft);
  })).toBeLessThanOrEqual(1);
}

async function paintState(page,labelSelector){
  return page.evaluate(selector=>{
    const label=document.querySelector(selector);
    const labelStyle=label&&getComputedStyle(label);
    const header=document.querySelector('header.qily-site-header.qily-global-header');
    const headerStyle=header&&getComputedStyle(header);
    const headerRect=header&&header.getBoundingClientRect();
    const primaryNav=header&&header.querySelector('nav.qily-global-nav,nav.site-nav');
    const dock=document.querySelector('#floatDock');
    const dockStyle=dock&&getComputedStyle(dock);
    const rect=dock&&dock.getBoundingClientRect();
    const spacer=document.getElementById('qilyDockBottomSpacerV58');
    const visible=element=>{const style=getComputedStyle(element),box=element.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&box.width>0&&box.height>0;};
    return {
      label:labelStyle&&{color:labelStyle.color,fill:labelStyle.getPropertyValue('-webkit-text-fill-color'),weight:labelStyle.fontWeight,borders:[labelStyle.borderTopWidth,labelStyle.borderRightWidth,labelStyle.borderBottomWidth,labelStyle.borderLeftWidth],radius:labelStyle.borderRadius},
      decorativeOrbits:[...document.querySelectorAll('.hero,.qily-home-conversion-hero,.daily-hero')].flatMap(hero=>['::before','::after'].flatMap(pseudo=>{
        const style=getComputedStyle(hero,pseudo);
        const drawn=style.content!=='none'&&style.content!=='normal'&&style.display!=='none';
        const circle=parseFloat(style.width)>=180&&parseFloat(style.height)>=180&&style.borderRadius==='50%';
        const outlined=parseFloat(style.borderTopWidth)>0&&style.borderTopStyle!=='none';
        return drawn&&circle&&outlined?[hero.className+pseudo]:[];
      })),
      header:headerStyle&&{position:headerStyle.position,top:headerRect.top,height:headerRect.height,visible:visible(header),navLinks:primaryNav?primaryNav.querySelectorAll('a[href]').length:0,brand:!!header.querySelector('.qily-brand')},
      dock:dockStyle&&{position:dockStyle.position,color:dockStyle.backgroundColor,border:dockStyle.borderTopWidth,borderColor:dockStyle.borderTopColor,x:rect.x,width:rect.width,height:rect.height,bottom:rect.bottom,visible:visible(dock),padding:dockStyle.padding,gap:dockStyle.gap,display:dockStyle.display,pseudoHeight:getComputedStyle(dock,'::after').height,buttonHeight:dock.querySelector('button').getBoundingClientRect().height,buttonPadding:getComputedStyle(dock.querySelector('button')).padding,buttonFont:getComputedStyle(dock.querySelector('button')).font},
      docks:document.querySelectorAll('#floatDock').length,
      styles:document.querySelectorAll('#qilyDockUnifiedV58Style').length,
      spacers:document.querySelectorAll('#qilyDockBottomSpacerV58').length,
      actions:dock?[...dock.querySelectorAll('[data-action]')].filter(visible).map(element=>element.getAttribute('data-action')):[],
      spacerHeight:spacer?spacer.getBoundingClientRect().height:0,
      bodyPadding:parseFloat(getComputedStyle(document.body).paddingBottom)||0,
      viewport:{width:window.innerWidth,contentWidth:Math.min(document.documentElement.clientWidth,document.body.clientWidth),height:window.innerHeight},
      pageOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth
    };
  },labelSelector);
}

function expectPaint(state,name){
  expect(state.label,`${name}: semantic label exists`).toBeTruthy();
  expect(state.label.color).toBe('rgb(255, 227, 155)');
  expect(state.label.fill).toBe('rgb(255, 227, 155)');
  expect(state.label.weight).toBe('400');
  expect(state.label.borders).toEqual(['0px','0px','0px','0px']);
  expect(state.label.radius).toBe('0px');
  expect(state.decorativeOrbits,`${name}: no decorative circle appears before a runtime hides it`).toEqual([]);
  expect(state.header,'global header is visible before JavaScript').toBeTruthy();
  expect(state.header.visible).toBeTruthy();
  expect(state.header.position).toBe('sticky');
  expect(state.header.top).toBeCloseTo(0,0);
  expect(state.header.navLinks).toBe(10);
  expect(state.header.brand).toBe(true);
  expect(state.docks).toBe(1);
  expect(state.styles).toBe(1);
  expect(state.spacers).toBe(1);
  expect(state.actions).toEqual(['top','previous','search','current']);
  expect(state.dock.visible).toBeTruthy();
  expect(state.dock.position).toBe('fixed');
  expect(state.dock.color).toBe('rgb(15, 75, 90)');
  expect(state.dock.border).toBe('3px');
  expect(state.dock.borderColor).toBe('rgb(200, 162, 90)');
  expect(state.dock.x).toBeCloseTo(0,0);
  expect(state.dock.width,'menu fills the content viewport including pages with a reserved scrollbar gutter').toBeCloseTo(state.viewport.contentWidth,0);
  expect(state.dock.bottom).toBeCloseTo(state.viewport.height,0);
  expect(state.spacerHeight+state.bodyPadding+1,`${name}: fixed menu reserves bottom content space`).toBeGreaterThanOrEqual(state.dock.height);
  expect(state.pageOverflow,`${name}: no page-level horizontal overflow`).toBeLessThanOrEqual(1);
}

for(const [name,url,labelSelector] of pages){
  for(const [device,viewport] of viewports){
    test(`${name} ${device} paints its shared shell before JavaScript`,async({browser})=>{
      const staticContext=await browser.newContext({viewport,javaScriptEnabled:false});
      const staticPage=await staticContext.newPage();
      try{
        const response=await staticPage.goto(base+url,{waitUntil:'load'});
        expect(response&&response.ok()).toBeTruthy();
        const first=await paintState(staticPage,labelSelector);
        expectPaint(first,`${name} ${device} JavaScript disabled`);
        await staticPage.screenshot({path:path.join(artifacts,`first-paint-${name}-${device}-without-js.png`)});
        const liveContext=await browser.newContext({viewport});
        let releaseCore;
        const coreGate=new Promise(resolve=>{releaseCore=resolve;});
        let coreRequested=false;
        try{
          await observeStaticMenu(liveContext);
          // External translation services cannot affect this shared-shell contract.
          await liveContext.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.origin!==new URL(base).origin)return route.abort();
            if(url.pathname==='/site-navigation-core.js'){
              coreRequested=true;
              await coreGate;
            }
            return route.continue();
          });
          const page=await liveContext.newPage();
          await page.goto(base+url,{waitUntil:'domcontentloaded'});
          await page.waitForFunction(()=>document.documentElement.getAttribute('data-qily-vi-status')==='formal');
          await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
          await expect.poll(()=>coreRequested).toBe(true);
          await expectStaticMenuPreserved(page);
          const hydrated=await paintState(page,labelSelector);
          expectPaint(hydrated,`${name} ${device} JavaScript enabled`);
          if(name==='lean-production')console.log('QILY-DOCK-DIAG',JSON.stringify({device,first:first.dock,hydrated:hydrated.dock}));
          expect(hydrated.dock.height,`${name} ${device}: loading runtime must not resize the menu`).toBeCloseTo(first.dock.height,0);
          // A visitor may use the rail before a slow core finishes loading.
          // Subsequent active-link reveal timers must retain that choice.
          await expectNavigationRail(page);
          const focusedAction=page.locator('#floatDock [data-action="top"]');
          await focusedAction.focus();
          releaseCore();
          await page.waitForFunction(()=>window.__qilyStaticMenuProbe&&window.__qilyStaticMenuProbe.coreReady===true);
          await expect(page.locator('header'),'published navigation adopts the complete shared header in either loading order').toHaveClass(/qily-global-header/);
          await expectStaticMenuPreserved(page);
          await expect(focusedAction,'delayed initialization keeps the existing keyboard focus').toBeFocused();
          await expect(focusedAction).toHaveCSS('background-color','rgb(255, 227, 155)');
          const afterCore=await paintState(page,labelSelector);
          expectPaint(afterCore,`${name} ${device} delayed navigation core`);
          expect(afterCore.dock.height,`${name} ${device}: delayed navigation core must not resize the menu`).toBeCloseTo(first.dock.height,0);
          await page.waitForTimeout(800); // Includes the last 700ms reveal timer.
          try{
            await expect.poll(()=>page.locator('input.qily-primary-nav-scroll-rail').first().evaluate(element=>{
              const nav=document.getElementById(element.getAttribute('aria-controls'));
              return Math.abs(nav.scrollWidth-nav.clientWidth-nav.scrollLeft);
            }),{message:'late core initialization retains the visitor navigation position'}).toBeLessThanOrEqual(1);
          }catch(error){
            console.log('Navigation movement evidence:',JSON.stringify(await page.evaluate(()=>window.__qilyStaticMenuProbe.navMovements)));
            throw error;
          }
          await expectNavigationRail(page);
          await page.screenshot({path:path.join(artifacts,`first-paint-${name}-${device}-with-js.png`)});
          await page.evaluate(()=>window.scrollTo(0,600));
          await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(200);
          await page.locator('#floatDock [data-action="top"]').click();
          await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeLessThanOrEqual(1);
          await page.locator('#floatDock [data-action="search"]').click();
          await expect(page.getByRole('dialog',{name:'本站搜索'})).toBeVisible();
          await page.getByRole('button',{name:'关闭本站搜索'}).click();
          await expect(page.getByRole('dialog',{name:'本站搜索'})).toBeHidden();
          await expectStaticMenuPreserved(page);
        }finally{releaseCore();await liveContext.close();}
      }finally{await staticContext.close();}
    });
  }
}

test('navigation core adopts published navigation before presentation runtimes load',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1680,height:1000}});
  let releaseCore,releasePresentation;
  const coreGate=new Promise(resolve=>{releaseCore=resolve;});
  const presentationGate=new Promise(resolve=>{releasePresentation=resolve;});
  try{
    await observeStaticMenu(context);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==new URL(base).origin)return route.abort();
      if(url.pathname==='/site-navigation-core.js')await coreGate;
      // The parser-deferred R8 script must not hold DOMContentLoaded while the
      // independently loaded VI/core requests are deliberately delayed.
      if(url.pathname==='/site-visual-runtime-r8.js')return route.abort();
      if(url.pathname==='/site-vi-runtime-v4.js')await presentationGate;
      return route.continue();
    });
    const page=await context.newPage();
    await page.goto(base+'/lean-production/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__qilyInteractionSemanticsV17===true);
    await expect(page.locator('header.topbar')).toHaveClass(/qily-site-header/);
    await page.evaluate(()=>{
      window.__qilyPublishedNavigation=document.querySelector('header nav');
      window.__qilyPublishedRail=document.querySelector('input.qily-primary-nav-scroll-rail');
      window.__qilyPublishedBrand=document.querySelector('header a.brand');
    });
    const focusedLink=page.locator('header nav a[href="/links/"]');
    await focusedLink.focus();
    releaseCore();
    await page.waitForFunction(()=>window.__qilyStaticMenuProbe.coreReady===true);
    expect(await page.evaluate(()=>({
      nav:window.__qilyPublishedNavigation===document.querySelector('header nav'),
      rail:window.__qilyPublishedRail===document.querySelector('input.qily-primary-nav-scroll-rail'),
      brand:window.__qilyPublishedBrand===document.querySelector('header a.qily-brand')
    }))).toEqual({nav:true,rail:true,brand:true});
    await expect(focusedLink).toBeFocused();
    await expect(page.locator('header nav a[href]')).toHaveCount(10);
    releasePresentation();
    await page.waitForFunction(()=>document.documentElement.getAttribute('data-qily-vi-status')==='formal');
    await expectNavigationRail(page);
    await expectStaticMenuPreserved(page);
  }finally{releaseCore();releasePresentation();await context.close();}
});

test('navigation core preserves the static menu while its action runtime is delayed',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1680,height:1000}});
  let releaseDock;
  const dockGate=new Promise(resolve=>{releaseDock=resolve;});
  try{
    await observeStaticMenu(context);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==new URL(base).origin)return route.abort();
      if(path.posix.basename(url.pathname)==='site-dock-share-runtime-v1.js')await dockGate;
      return route.continue();
    });
    const page=await context.newPage();
    await page.goto(base+'/lean-production/',{waitUntil:'commit'});
    await page.waitForFunction(()=>window.__qilyStaticMenuProbe&&window.__qilyStaticMenuProbe.coreReady===true);
    expect(await page.evaluate(()=>!!window.__qilyFloatingDockUnifiedV58),'the delayed Dock runtime has not executed').toBe(false);
    await expectStaticMenuPreserved(page);
    expectPaint(await paintState(page,'.hero .eyebrow'),'navigation core before Dock runtime');
    releaseDock();
    await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
    await page.waitForFunction(()=>document.documentElement.getAttribute('data-qily-vi-status')==='formal');
    await expectStaticMenuPreserved(page);
    expectPaint(await paintState(page,'.hero .eyebrow'),'Dock runtime adopts core-preserved menu');
  }finally{releaseDock();await context.close();}
});

/* 2026-11-10 regression: sample actual animation frames, not just the settled page.
 * Reference 2026-11-08 is already accepted, and the index supplies each new
 * newest edition. Deliberately delay the Dock runtime to simulate cold loading.
 * One frame floating above the bottom is a failing release.
 */
const newestBriefDate=JSON.parse(fs.readFileSync(path.join(process.cwd(),'qilylean/daily/index.json'),'utf8'))[0].date;
const firstFrameBriefs=[
  ['accepted-2026-11-08','/qilylean/daily/2026-11-08.html'],
  ['latest-'+newestBriefDate,'/qilylean/daily/'+newestBriefDate+'.html']
];
for(const [name,url] of firstFrameBriefs){
  for(const width of [1600,820,390]){
    test('curated brief never flashes its Dock away from bottom: '+name+' at '+width+'px',async({browser})=>{
      const context=await browser.newContext({viewport:{width,height:900}});
      let releaseDock;
      const dockGate=new Promise(resolve=>{releaseDock=resolve;});
      try{
        await context.addInitScript(()=>{
          window.__qilyBriefDockFrameProbe={samples:0,violations:[],firstPaintAt:null,baseline:null};
          let frames=0;
          function sample(){
            const state=window.__qilyBriefDockFrameProbe;
            const all=document.querySelectorAll('#floatDock');
            const dock=all[0];
            if(dock){
              const style=getComputedStyle(dock);
              const rect=dock.getBoundingClientRect();
              if(style.display!=='none'&&style.visibility!=='hidden'&&rect.height>0){
                state.samples++;
                if(state.firstPaintAt===null)state.firstPaintAt=performance.now();
                // CSS fixed-position geometry may exclude classic scrollbar tracks.
                const expectedBottom=document.documentElement.clientHeight;
                const expectedRight=document.documentElement.clientWidth;
                const gap=Math.min(Math.abs(window.innerHeight-rect.bottom),Math.abs(expectedBottom-rect.bottom));
                const sideGap=Math.min(Math.abs(window.innerWidth-rect.right),Math.abs(expectedRight-rect.right));
                const buttonRects=[...dock.querySelectorAll('.qily-float-btn[data-action]')].map(b=>b.getBoundingClientRect());
                const oneRow=buttonRects.length===4&&buttonRects.every((r,i)=>i===0||(Math.abs(r.top-buttonRects[0].top)<=3&&r.left>=buttonRects[i-1].right-3));
                if(!state.baseline)state.baseline={top:rect.top,height:rect.height};
                const shifting=Math.abs(state.baseline.top-rect.top)>2||Math.abs(state.baseline.height-rect.height)>2;
                const invalid=all.length!==1||style.position!=='fixed'||style.flexDirection!=='row'||style.flexWrap!=='nowrap'||!oneRow||shifting||gap>2||Math.abs(rect.left)>2||sideGap>2;
                if(invalid&&state.violations.length<15)state.violations.push({
                  frame:frames,position:style.position,count:all.length,bottomGap:gap,
                  left:rect.left,right:rect.right,screen:window.innerWidth
                });
              }
            }
            frames++;
            if(frames<1200&&state.samples<90)requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        });
        await context.route('**/*',async route=>{
          const requestUrl=new URL(route.request().url());
          if(requestUrl.origin!==new URL(base).origin)return route.abort();
          if(requestUrl.pathname==='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20261022-four-actions-v1&share=20261031-copy-first-v1')await dockGate;
          return route.continue();
        });
        const page=await context.newPage();
        await page.goto(base+url,{waitUntil:'commit'});
        await expect.poll(()=>page.evaluate(()=>window.__qilyBriefDockFrameProbe?.samples||0),{
          message:'global static Dock must paint before loading any JavaScript'
        }).toBeGreaterThanOrEqual(6);
        expect(await page.locator('#floatDock').getAttribute('data-qily-brief-dock-pending')).toBeNull();
        const preRuntime=await page.locator('#floatDock').evaluate(dock=>{
          const box=dock.getBoundingClientRect(),style=getComputedStyle(dock);
          return {top:box.top,height:box.height,left:box.left,right:box.right,visible:style.visibility,opacity:style.opacity};
        });
        expect(preRuntime.visible).toBe('visible');
        expect(preRuntime.opacity).toBe('1');
        releaseDock();
        await page.waitForLoadState('load');
        const postRuntime=await page.locator('#floatDock').evaluate(dock=>{
          const box=dock.getBoundingClientRect(),style=getComputedStyle(dock);
          return {top:box.top,height:box.height,left:box.left,right:box.right,visible:style.visibility,opacity:style.opacity};
        });
        expect(postRuntime.visible).toBe('visible');
        expect(postRuntime.opacity).toBe('1');
        for(const key of ['top','height','left','right']){
          expect(Math.abs(postRuntime[key]-preRuntime[key]),name+' '+width+'px: Dock '+key+' may not jump when JS loads').toBeLessThanOrEqual(2);
        }
        await page.waitForTimeout(750);
        const state=await page.evaluate(()=>window.__qilyBriefDockFrameProbe);
        expect(state.samples,name+' at '+width+': sample actual first frames').toBeGreaterThanOrEqual(10);
        expect(state.violations,name+' at '+width+': Dock must have zero displaced/duplicate frames').toEqual([]);
        await expect(page.locator('#floatDock [data-action]')).toHaveCount(4);
      }finally{
        releaseDock();
        await context.close();
      }
    });
  }
}

test('newest curated Dock survives stale legacy centered flow cascade',async({browser})=>{
  const newest=JSON.parse(fs.readFileSync(path.join(process.cwd(),'qilylean/daily/index.json'),'utf8'))[0].date;
  const context=await browser.newContext({viewport:{width:1600,height:920}});
  try{
    const page=await context.newPage();
    await page.goto(base+'/qilylean/daily/'+newest+'.html',{waitUntil:'domcontentloaded'});
    await page.addStyleTag({content:
      'html body #floatDock.qily-float-dock{position:relative!important;'+
      'inset:auto!important;margin:24px auto!important;justify-content:center!important;'+
      'width:min(1180px,calc(100% - 36px))!important}'
    });
    const state=await page.locator('#floatDock').evaluate(dock=>{
      const s=getComputedStyle(dock),r=dock.getBoundingClientRect();
      return {position:s.position,bottom:r.bottom,left:r.left,right:r.right,
        viewportW:innerWidth,viewportH:innerHeight,domDockCount:document.querySelectorAll('#floatDock').length};
    });
    expect(state.domDockCount,'exactly one Dock').toBe(1);
    expect(state.position,'cached old stylesheet must not put Dock in flow').toBe('fixed');
    expect(Math.abs(state.bottom-state.viewportH),'Dock remains at actual viewport bottom').toBeLessThanOrEqual(2);
    expect(Math.abs(state.left),'Dock remains full-width from x=0').toBeLessThanOrEqual(2);
    expect(Math.abs(state.right-state.viewportW),'Dock remains full-width').toBeLessThanOrEqual(18);
  }finally{await context.close();}
});

for(const width of [1600,390]){
  test('public Dock does not animate during native brief-to-brief navigation at '+width+'px',async({browser})=>{
    const context=await browser.newContext({viewport:{width,height:900}});
    try{
      await context.addInitScript(()=>{
        window.__qilyShellFirstFrames={visible:0,hidden:0,stacked:0};
        let count=0;
        function sample(){
          const dock=document.getElementById('floatDock');
          if(dock){
            const s=getComputedStyle(dock);
            if(s.display!=='none'&&s.visibility==='visible'&&s.opacity!=='0'){
              window.__qilyShellFirstFrames.visible++;
              const buttons=[...dock.querySelectorAll('.qily-float-btn[data-action]')].map(b=>b.getBoundingClientRect());
              if(buttons.length!==4||buttons.some((r,i)=>i>0&&Math.abs(r.top-buttons[0].top)>3)){
                window.__qilyShellFirstFrames.stacked++;
              }
            } else window.__qilyShellFirstFrames.hidden++;
          }
          if(++count<180)requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      const page=await context.newPage();
      await page.goto(base+'/qilylean/daily/2026-11-08.html',{waitUntil:'load'});
      const before=await page.locator('#floatDock').evaluate(dock=>{
        const r=dock.getBoundingClientRect(),s=getComputedStyle(dock);
        return {top:r.top,height:r.height,left:r.left,width:r.width,visibility:s.visibility,transition:s.viewTransitionName};
      });
      expect(before.visibility).toBe('visible');
      expect(before.transition,'native same-origin navigation should preserve shared Dock identity').toBe('qily-public-dock');
      await Promise.all([
        page.waitForURL('**/qilylean/daily/2026-11-10.html'),
        page.locator('a[href="/qilylean/daily/2026-11-10.html"]').first().click()
      ]);
      await page.waitForLoadState('load');
      const after=await page.locator('#floatDock').evaluate(dock=>{
        const r=dock.getBoundingClientRect(),s=getComputedStyle(dock);
        return {top:r.top,height:r.height,left:r.left,width:r.width,visibility:s.visibility,transition:s.viewTransitionName};
      });
      const state=await page.evaluate(()=>window.__qilyShellFirstFrames);
      expect(after.visibility).toBe('visible');
      expect(after.transition).toBe('qily-public-dock');
      for(const key of ['top','height','left','width'])
        expect(Math.abs(before[key]-after[key]),'shared Dock geometry must remain unchanged across pages: '+key).toBeLessThanOrEqual(2);
      expect(state.visible,'new document paints its public Dock immediately').toBeGreaterThan(0);
      expect(state.hidden,'new document never hides its public Dock').toBe(0);
      expect(state.stacked,'public Dock never stacks four action buttons').toBe(0);
      await expect(page.locator('#floatDock .qily-float-btn')).toHaveCount(4);
    }finally{await context.close();}
  });
}
