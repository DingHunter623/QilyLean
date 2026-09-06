const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_DOCK_V58_BASE||'http://127.0.0.1:4173';
const cases=[
  ['home-desktop','/',{width:1440,height:1000},false],
  ['home-mobile','/',{width:390,height:844},true],
  ['contact-mobile','/contact/',{width:390,height:844},true],
  ['daily-desktop','/qilylean/daily/2026-09-04.html',{width:1440,height:1000},false],
  ['daily-mobile','/qilylean/daily/2026-09-04.html',{width:390,height:844},true]
];
const desktopExpected=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];
const mobileExpected=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];
const out=path.join(process.cwd(),'dock-v58-artifacts');
fs.mkdirSync(out,{recursive:true});

for(const [name,url,viewport,mobile] of cases){
  test(`${name} Dock V5.8 compact fixed-bottom navigation`,async({page})=>{
    await page.setViewportSize(viewport);
    const response=await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
    expect(response&&response.ok(),`${url} should resolve`).toBeTruthy();
    await page.waitForSelector('#floatDock',{state:'visible',timeout:10000});

    const result=await page.evaluate(()=>{
      const dock=document.querySelector('#floatDock');
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
        dockLeft:dr.left,
        dockRight:dr.right,
        dockWidth:dr.width,
        viewportWidth:innerWidth,
        scrollWidth:dock.scrollWidth,
        clientWidth:dock.clientWidth,
        layout:dock.getAttribute('data-qily-dock-layout'),
        unified:dock.getAttribute('data-qily-unified-public-module'),
        labels:buttons.map(b=>b.getAttribute('aria-label')),
        lineCounts:buttons.map(b=>b.querySelectorAll('.qily-dock-label>span').length),
        actions:buttons.map(b=>b.getAttribute('data-action')),
        spacerHeight:spacer?spacer.getBoundingClientRect().height:0,
        buttons:buttons.map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {
          action:b.getAttribute('data-action'),w:r.width,h:r.height,left:r.left,right:r.right,
          borderLeft:parseFloat(s.borderLeftWidth)||0,borderRight:parseFloat(s.borderRightWidth)||0,
          radius:parseFloat(s.borderTopLeftRadius)||0
        };})
      };
    });

    expect(result.position).toBe('fixed');
    expect(result.labels).toEqual(mobile?mobileExpected:desktopExpected);
    expect(result.actions).toEqual(['home','top','back','previous','search','current','contact']);
    expect(result.buttons).toHaveLength(7);
    expect(result.spacerHeight,'fixed navigation must reserve scroll clearance').toBeGreaterThanOrEqual(70);
    for(const item of result.buttons){
      expect(item.radius,'buttons must remain rectangular').toBeLessThanOrEqual(12);
      expect(item.h,'tap target height').toBeGreaterThanOrEqual(48);
      expect(item.borderLeft,'left border must render').toBeGreaterThanOrEqual(1);
      expect(item.borderRight,'right border must render').toBeGreaterThanOrEqual(1);
    }

    if(mobile){
      expect(result.display).toBe('grid');
      expect(result.gridColumns.split(' ').length).toBe(7);
      expect(result.bottomGap,'mobile dock must touch viewport bottom').toBeLessThanOrEqual(1);
      expect(result.layout).toBe('mobile-fixed-bottom-compact-navigation');
      expect(result.lineCounts).toEqual([1,1,2,2,2,2,2]);
      expect(result.scrollWidth,'mobile dock must not need horizontal scrolling').toBeLessThanOrEqual(result.clientWidth+1);
      expect(result.dockWidth/result.viewportWidth,'mobile dock should cover the viewport width').toBeGreaterThanOrEqual(.99);
      expect(result.dockLeft,'mobile dock must start at viewport left edge').toBeGreaterThanOrEqual(-1);
      expect(result.dockLeft,'mobile dock must start at viewport left edge').toBeLessThanOrEqual(1);
      expect(result.dockRight,'mobile dock must end at viewport right edge').toBeGreaterThanOrEqual(result.viewportWidth-1);
      expect(result.dockRight,'mobile dock must not overflow viewport').toBeLessThanOrEqual(result.viewportWidth+1);
      for(const item of result.buttons){
        expect(item.w,'compact mobile control must retain minimum touch width').toBeGreaterThanOrEqual(44);
        expect(item.left,'no mobile button may clip past the left viewport edge').toBeGreaterThanOrEqual(0);
        expect(item.right,'no mobile button may clip past the right viewport edge').toBeLessThanOrEqual(result.viewportWidth);
      }

      await page.locator('#floatDock .qily-float-btn[data-action="home"]').focus();
      const focus=await page.evaluate(()=>{
        const b=document.querySelector('#floatDock .qily-float-btn[data-action="home"]');
        const s=getComputedStyle(b),r=b.getBoundingClientRect();
        return {outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow,left:r.left,borderLeft:parseFloat(s.borderLeftWidth)||0};
      });
      expect(focus.left,'focused first button must remain fully inside the viewport').toBeGreaterThanOrEqual(0);
      expect(focus.borderLeft,'focused first button left border must remain complete').toBeGreaterThanOrEqual(1);
      expect(focus.outline==='none'||focus.outlineWidth==='0px','mobile focus must not use a clipped outer outline').toBeTruthy();
      expect(focus.boxShadow,'mobile focus must use an internal visible ring').toContain('inset');
    }else{
      expect(result.display).toBe('grid');
      expect(result.gridColumns.split(' ').length).toBe(7);
      expect(result.bottomGap,'desktop dock should remain pinned near viewport bottom').toBeGreaterThanOrEqual(8);
      expect(result.bottomGap).toBeLessThanOrEqual(16);
      expect(result.layout).toBe('fixed-bottom-navigation');
      for(const item of result.buttons)expect(item.w,'desktop navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);
      await page.locator('#floatDock .qily-float-btn[data-action="home"]').focus();
      const focus=await page.evaluate(()=>{const b=document.querySelector('#floatDock .qily-float-btn[data-action="home"]');const s=getComputedStyle(b),r=b.getBoundingClientRect();return {boxShadow:s.boxShadow,left:r.left,borderLeft:parseFloat(s.borderLeftWidth)||0};});
      expect(focus.borderLeft,'desktop first button left border must remain complete').toBeGreaterThanOrEqual(1);
      expect(focus.boxShadow,'desktop first button focus must stay internal').toContain('inset');
    }

    await page.screenshot({path:path.join(out,`${name}.png`),fullPage:true});
  });
}
