const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');
const base=process.env.QILY_VI_V4_BASE||'http://127.0.0.1:4173';
const pages=[['home','/','.qily-home-conversion-hero__kicker'],['lean-production','/lean-production/','.hero .eyebrow']];
const viewports=[
  ['desktop',{width:1680,height:1000}],
  ['tablet',{width:1024,height:900}],
  ['compact',{width:820,height:900}],
  ['mobile',{width:390,height:844}]
];
const artifacts=path.join(process.cwd(),'visual-vi-v4-artifacts');
fs.mkdirSync(artifacts,{recursive:true});

async function observeStaticMenu(context){
  await context.addInitScript(()=>{
    // This observer is only a regression probe. Production keeps one Dock owner.
    const probe={initial:null,replaced:false,invalidMenus:[],coreReady:false};
    window.__qilyStaticMenuProbe=probe;
    const actions=node=>[...node.querySelectorAll('[data-action]')].map(button=>button.getAttribute('data-action'));
    const inspect=records=>{
      const current=document.getElementById('floatDock');
      if(!probe.initial&&current&&current.getAttribute('data-qily-first-paint-dock')==='v1'&&actions(current).length===7)probe.initial=current;
      if(!probe.initial)return;
      if(current!==probe.initial)probe.replaced=true;
      if(current&&actions(current).length!==7)probe.invalidMenus.push(actions(current));
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType!==1)continue;
          const menus=node.id==='floatDock'?[node]:[...node.querySelectorAll('#floatDock')];
          for(const menu of menus){
            if(menu!==probe.initial&&actions(menu).length!==7)probe.invalidMenus.push(actions(menu));
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
    return state&&{captured:!!state.initial,sameNode:state.initial===document.getElementById('floatDock'),replaced:state.replaced,invalidMenus:state.invalidMenus};
  });
  expect(probe&&probe.captured,'the parser supplied the initial static menu').toBeTruthy();
  expect(probe.sameNode,'the original static menu survives shared runtime/core loading').toBeTruthy();
  expect(probe.replaced,'the static menu must never be replaced').toBe(false);
  expect(probe.invalidMenus,'loading must never introduce a menu with missing actions').toEqual([]);
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
    const dock=document.querySelector('#floatDock');
    const dockStyle=dock&&getComputedStyle(dock);
    const rect=dock&&dock.getBoundingClientRect();
    const spacer=document.getElementById('qilyDockBottomSpacerV58');
    const visible=element=>{const style=getComputedStyle(element),box=element.getBoundingClientRect();return style.display!=='none'&&style.visibility!=='hidden'&&box.width>0&&box.height>0;};
    return {
      label:labelStyle&&{color:labelStyle.color,fill:labelStyle.getPropertyValue('-webkit-text-fill-color'),weight:labelStyle.fontWeight,borders:[labelStyle.borderTopWidth,labelStyle.borderRightWidth,labelStyle.borderBottomWidth,labelStyle.borderLeftWidth],radius:labelStyle.borderRadius},
      dock:dockStyle&&{position:dockStyle.position,color:dockStyle.backgroundColor,border:dockStyle.borderTopWidth,borderColor:dockStyle.borderTopColor,x:rect.x,width:rect.width,height:rect.height,bottom:rect.bottom,visible:visible(dock)},
      docks:document.querySelectorAll('#floatDock').length,
      styles:document.querySelectorAll('#qilyDockUnifiedV58Style').length,
      spacers:document.querySelectorAll('#qilyDockBottomSpacerV58').length,
      actions:dock?[...dock.querySelectorAll('[data-action]')].filter(visible).map(element=>element.getAttribute('data-action')):[],
      spacerHeight:spacer?spacer.getBoundingClientRect().height:0,
      bodyPadding:parseFloat(getComputedStyle(document.body).paddingBottom)||0,
      viewport:{width:window.innerWidth,contentWidth:document.documentElement.clientWidth,height:window.innerHeight},
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
  expect(state.docks).toBe(1);
  expect(state.styles).toBe(1);
  expect(state.spacers).toBe(1);
  expect(state.actions).toEqual(['home','top','back','previous','search','current','contact']);
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
          expect(hydrated.dock.height,`${name} ${device}: loading runtime must not resize the menu`).toBeCloseTo(first.dock.height,0);
          releaseCore();
          await page.waitForFunction(()=>window.__qilyStaticMenuProbe&&window.__qilyStaticMenuProbe.coreReady===true);
          await expectStaticMenuPreserved(page);
          const afterCore=await paintState(page,labelSelector);
          expectPaint(afterCore,`${name} ${device} delayed navigation core`);
          expect(afterCore.dock.height,`${name} ${device}: delayed navigation core must not resize the menu`).toBeCloseTo(first.dock.height,0);
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

test('navigation core preserves the static menu while its action runtime is delayed',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1680,height:1000}});
  let releaseDock;
  const dockGate=new Promise(resolve=>{releaseDock=resolve;});
  try{
    await observeStaticMenu(context);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==new URL(base).origin)return route.abort();
      if(url.pathname==='/site-dock-share-runtime-v1.js')await dockGate;
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
