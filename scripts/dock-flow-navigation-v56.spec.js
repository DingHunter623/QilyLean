const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_DOCK_V57_BASE||'http://127.0.0.1:4173';
const cases=[
  ['home-desktop','/',{width:1440,height:1000},false],
  ['home-mobile','/',{width:390,height:844},true],
  ['daily-desktop','/qilylean/daily/2026-09-04.html',{width:1440,height:1000},false],
  ['daily-mobile','/qilylean/daily/2026-09-04.html',{width:390,height:844},true]
];
const expected=['回首页','回顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'];
const out=path.join(process.cwd(),'dock-v57-artifacts');
fs.mkdirSync(out,{recursive:true});

for(const [name,url,viewport,mobile] of cases){
  test(`${name} Dock V5.7 fixed bottom navigation`,async({page})=>{
    await page.setViewportSize(viewport);
    const response=await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
    expect(response&&response.ok(),`${url} should resolve`).toBeTruthy();
    await page.waitForSelector('#floatDock[data-qily-unified-public-module="v5.7-fixed-bottom-navigation"]',{state:'visible',timeout:10000});

    const result=await page.evaluate(()=>{
      const dock=document.querySelector('#floatDock[data-qily-unified-public-module="v5.7-fixed-bottom-navigation"]');
      const buttons=[...dock.querySelectorAll('.qily-float-btn[data-action]')];
      const ds=getComputedStyle(dock),dr=dock.getBoundingClientRect();
      const spacer=document.getElementById('qilyDockBottomSpacerV57');
      return {
        position:ds.position,
        display:ds.display,
        gridColumns:ds.gridTemplateColumns,
        overflowX:ds.overflowX,
        overflowY:ds.overflowY,
        bottomGap:Math.round(innerHeight-dr.bottom),
        dockWidth:Math.round(dr.width),
        rootWidth:Math.round(document.documentElement.clientWidth),
        scrollWidth:dock.scrollWidth,
        clientWidth:dock.clientWidth,
        scrollLeft:dock.scrollLeft,
        layout:dock.getAttribute('data-qily-dock-layout'),
        labels:buttons.map(b=>b.getAttribute('aria-label')),
        actions:buttons.map(b=>b.getAttribute('data-action')),
        spacerHeight:spacer?Math.round(spacer.getBoundingClientRect().height):0,
        buttons:buttons.map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {w:r.width,h:r.height,radius:parseFloat(s.borderTopLeftRadius)||0};})
      };
    });

    expect(result.position).toBe('fixed');
    expect(result.display).toBe('grid');
    expect(result.gridColumns.split(' ').length).toBe(7);
    expect(result.labels).toEqual(expected);
    expect(result.actions).toEqual(['home','top','back','previous','search','current','contact']);
    expect(result.buttons).toHaveLength(7);
    expect(result.spacerHeight,'fixed navigation must reserve scroll clearance').toBeGreaterThanOrEqual(70);
    for(const item of result.buttons){
      expect(item.radius,'buttons must remain rectangular').toBeLessThanOrEqual(12);
      expect(item.w,'each fixed navigation column must remain visible').toBeGreaterThan(30);
      expect(item.h,'tap target height').toBeGreaterThanOrEqual(48);
    }

    if(mobile){
      expect(result.bottomGap,'mobile dock must touch viewport bottom').toBeLessThanOrEqual(1);
      expect(result.overflowX).toBe('hidden');
      expect(result.scrollWidth,'mobile dock must not horizontally overflow').toBeLessThanOrEqual(result.clientWidth+2);
      expect(result.layout).toBe('mobile-fixed-bottom-navigation');
      const moved=await page.evaluate(()=>{const d=document.querySelector('#floatDock');d.scrollTo({left:500,behavior:'instant'});return d.scrollLeft;});
      expect(moved,'mobile dock must not horizontally scroll').toBe(0);
      expect(result.dockWidth,'mobile dock should span the actual layout viewport').toBeGreaterThanOrEqual(result.rootWidth-2);
      expect(result.dockWidth,'mobile dock should not exceed the actual layout viewport').toBeLessThanOrEqual(result.rootWidth+2);
    }else{
      expect(result.bottomGap,'desktop dock should remain pinned near viewport bottom').toBeGreaterThanOrEqual(8);
      expect(result.bottomGap).toBeLessThanOrEqual(16);
      expect(result.layout).toBe('fixed-bottom-navigation');
      for(const item of result.buttons)expect(item.w,'desktop navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);
    }

    await page.screenshot({path:path.join(out,`${name}.png`),fullPage:true});
  });
}