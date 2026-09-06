const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_DOCK_V58_BASE||'http://127.0.0.1:4173';
const cases=[
  ['home-desktop','/',{width:1440,height:1000},false],
  ['home-mobile','/',{width:390,height:844},true],
  ['daily-desktop','/qilylean/daily/2026-09-04.html',{width:1440,height:1000},false],
  ['daily-mobile','/qilylean/daily/2026-09-04.html',{width:390,height:844},true]
];
const expected=['回首页','回顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'];
const out=path.join(process.cwd(),'dock-v58-artifacts');
fs.mkdirSync(out,{recursive:true});

for(const [name,url,viewport,mobile] of cases){
  test(`${name} Dock V5.8 fixed bottom swipe navigation`,async({page})=>{
    await page.setViewportSize(viewport);
    const response=await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
    expect(response&&response.ok(),`${url} should resolve`).toBeTruthy();
    await page.waitForSelector('#floatDock[data-qily-unified-public-module="v5.8-fixed-bottom-swipe-navigation"]',{state:'visible',timeout:10000});

    const result=await page.evaluate(()=>{
      const dock=document.querySelector('#floatDock[data-qily-unified-public-module="v5.8-fixed-bottom-swipe-navigation"]');
      const buttons=[...dock.querySelectorAll('.qily-float-btn[data-action]')];
      const ds=getComputedStyle(dock),dr=dock.getBoundingClientRect();
      const spacer=document.getElementById('qilyDockBottomSpacerV58');
      return {
        position:ds.position,
        display:ds.display,
        gridColumns:ds.gridTemplateColumns,
        overflowX:ds.overflowX,
        overflowY:ds.overflowY,
        scrollSnapType:ds.scrollSnapType,
        bottomGap:Math.round(innerHeight-dr.bottom),
        dockLeft:Math.round(dr.left),
        dockRightGap:Math.round(innerWidth-dr.right),
        dockWidth:Math.round(dr.width),
        viewportWidth:Math.round(innerWidth),
        scrollWidth:dock.scrollWidth,
        clientWidth:dock.clientWidth,
        scrollLeft:dock.scrollLeft,
        layout:dock.getAttribute('data-qily-dock-layout'),
        labels:buttons.map(b=>b.getAttribute('aria-label')),
        actions:buttons.map(b=>b.getAttribute('data-action')),
        spacerHeight:spacer?Math.round(spacer.getBoundingClientRect().height):0,
        buttons:buttons.map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {w:r.width,h:r.height,radius:parseFloat(s.borderTopLeftRadius)||0,left:r.left,right:r.right};})
      };
    });

    expect(result.position).toBe('fixed');
    expect(result.labels).toEqual(expected);
    expect(result.actions).toEqual(['home','top','back','previous','search','current','contact']);
    expect(result.buttons).toHaveLength(7);
    expect(result.spacerHeight,'fixed navigation must reserve scroll clearance').toBeGreaterThanOrEqual(70);
    for(const item of result.buttons){
      expect(item.radius,'buttons must remain rectangular').toBeLessThanOrEqual(12);
      expect(item.w,'each navigation control must preserve a readable tap width').toBeGreaterThanOrEqual(mobile?78:30);
      expect(item.h,'tap target height').toBeGreaterThanOrEqual(48);
    }

    if(mobile){
      expect(result.display).toBe('flex');
      expect(['auto','scroll']).toContain(result.overflowX);
      expect(result.overflowY).toBe('hidden');
      expect(result.scrollSnapType).toContain('x');
      expect(result.bottomGap,'mobile dock must touch viewport bottom').toBeLessThanOrEqual(1);
      expect(result.layout).toBe('mobile-fixed-bottom-swipe-navigation');
      expect(result.scrollWidth,'mobile dock must expose horizontal swipe overflow').toBeGreaterThan(result.clientWidth+80);
      expect(result.dockWidth/result.viewportWidth,'mobile dock should cover essentially the full viewport width').toBeGreaterThanOrEqual(.95);
      expect(result.dockLeft,'mobile dock left gutter should remain narrow').toBeGreaterThanOrEqual(-1);
      expect(result.dockLeft,'mobile dock left gutter should remain narrow').toBeLessThanOrEqual(8);
      expect(result.dockRightGap,'mobile dock right gutter should remain no wider than a browser scrollbar').toBeLessThanOrEqual(16);

      const swipeResult=await page.evaluate(()=>{
        const dock=document.querySelector('#floatDock');
        const last=dock.querySelector('.qily-float-btn[data-action="contact"]');
        const max=Math.max(0,dock.scrollWidth-dock.clientWidth);
        dock.scrollTo({left:max,behavior:'instant'});
        const r=last.getBoundingClientRect();
        return {scrollLeft:dock.scrollLeft,max,lastLeft:r.left,lastRight:r.right,viewportWidth:innerWidth};
      });
      expect(swipeResult.max,'mobile swipe rail must have real travel').toBeGreaterThan(80);
      expect(swipeResult.scrollLeft,'programmatic horizontal movement must succeed').toBeGreaterThan(40);
      expect(swipeResult.lastRight,'last action must become visible after swiping').toBeLessThanOrEqual(swipeResult.viewportWidth+1);
      expect(swipeResult.lastLeft,'last action must become visible after swiping').toBeGreaterThanOrEqual(-1);
    }else{
      expect(result.display).toBe('grid');
      expect(result.gridColumns.split(' ').length).toBe(7);
      expect(result.bottomGap,'desktop dock should remain pinned near viewport bottom').toBeGreaterThanOrEqual(8);
      expect(result.bottomGap).toBeLessThanOrEqual(16);
      expect(result.layout).toBe('fixed-bottom-navigation');
      for(const item of result.buttons)expect(item.w,'desktop navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);
    }

    await page.screenshot({path:path.join(out,`${name}.png`),fullPage:true});
  });
}