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
const expected=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];
const out=path.join(process.cwd(),'dock-v58-artifacts');
fs.mkdirSync(out,{recursive:true});

for(const [name,url,viewport,mobile] of cases){
  test(`${name} Dock V5.8 China-style footer navigation`,async({page})=>{
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
        flexWrap:ds.flexWrap,
        justifyContent:ds.justifyContent,
        gridColumns:ds.gridTemplateColumns,
        overflowX:ds.overflowX,
        bottomGap:Math.round(innerHeight-dr.bottom),
        dockLeft:Math.round(dr.left),
        dockRight:Math.round(dr.right),
        dockWidth:dr.width,
        viewportWidth:document.documentElement.clientWidth,
        scrollWidth:dock.scrollWidth,
        clientWidth:dock.clientWidth,
        borderTop:parseFloat(ds.borderTopWidth)||0,
        background:ds.backgroundColor,
        layout:dock.getAttribute('data-qily-dock-layout'),
        unified:dock.getAttribute('data-qily-unified-public-module'),
        labels:buttons.map(b=>b.getAttribute('aria-label')),
        lineCounts:buttons.map(b=>b.querySelectorAll('.qily-dock-label>span').length),
        actions:buttons.map(b=>b.getAttribute('data-action')),
        spacerHeight:spacer?spacer.getBoundingClientRect().height:0,
        buttons:buttons.map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {
          action:b.getAttribute('data-action'),w:r.width,h:r.height,left:r.left,right:r.right,top:r.top,
          borderLeft:parseFloat(s.borderLeftWidth)||0,borderRight:parseFloat(s.borderRightWidth)||0,
          radius:parseFloat(s.borderTopLeftRadius)||0,color:s.color,background:s.backgroundColor
        };})
      };
    });

    expect(result.position).toBe('fixed');
    expect(result.labels).toEqual(expected);
    expect(result.actions).toEqual(['home','top','back','previous','search','current','contact']);
    expect(result.buttons).toHaveLength(7);
    expect(result.bottomGap,'footer must touch viewport bottom').toBeLessThanOrEqual(1);
    expect(result.dockWidth/result.viewportWidth,'footer must span the layout viewport').toBeGreaterThanOrEqual(.995);
    expect(result.dockLeft,'footer must start at viewport left').toBeGreaterThanOrEqual(-1);
    expect(result.dockLeft,'footer must start at viewport left').toBeLessThanOrEqual(1);
    expect(result.dockRight,'footer must end at viewport right').toBeGreaterThanOrEqual(result.viewportWidth-1);
    expect(result.dockRight,'footer must not overflow viewport').toBeLessThanOrEqual(result.viewportWidth+1);
    expect(result.borderTop,'China-style gold footer rule').toBeGreaterThanOrEqual(3);
    expect(result.background,'deep-teal footer fill').toMatch(/rgb\(15, 75, 90\)|rgba\(15, 75, 90/);
    expect(result.scrollWidth,'footer must not need horizontal scrolling').toBeLessThanOrEqual(result.clientWidth+1);
    expect(result.lineCounts).toEqual([1,1,1,1,1,1,1]);

    for(const item of result.buttons){
      expect(item.radius,'controls must remain compact rectangles').toBeLessThanOrEqual(10);
      expect(item.radius).toBeGreaterThanOrEqual(6);
      expect(item.borderLeft,'left border must render').toBeGreaterThanOrEqual(1);
      expect(item.borderRight,'right border must render').toBeGreaterThanOrEqual(1);
    }

    if(mobile){
      expect(result.display).toBe('flex');
      expect(result.flexWrap).toBe('wrap');
      expect(result.justifyContent).toBe('center');
      expect(result.layout).toBe('mobile-fixed-bottom-footer-navigation');
      expect(result.unified).toBe('v5.8-fixed-bottom-footer-navigation');
      expect(result.spacerHeight,'mobile fixed footer must reserve two-row clearance').toBeGreaterThanOrEqual(90);
      for(const item of result.buttons){
        expect(item.h,'mobile tap target height').toBeGreaterThanOrEqual(38);
        expect(item.w,'mobile control remains tappable').toBeGreaterThanOrEqual(80);
        expect(item.left,'mobile button must not clip left').toBeGreaterThanOrEqual(0);
        expect(item.right,'mobile button must not clip right').toBeLessThanOrEqual(result.viewportWidth+1);
      }
      const firstRowTop=result.buttons[0].top;
      expect(result.buttons[3].top,'four controls should occupy first row').toBeCloseTo(firstRowTop,1);
      expect(result.buttons[4].top,'fifth control should begin centered second row').toBeGreaterThan(firstRowTop+20);
      expect(result.buttons[4].left,'second row should be centered rather than left-packed').toBeGreaterThan(20);
      expect(result.buttons[6].right,'second row should be centered rather than right-packed').toBeLessThan(result.viewportWidth-20);
    }else{
      expect(result.display).toBe('grid');
      expect(result.gridColumns.split(' ').length).toBe(7);
      expect(result.layout).toBe('fixed-bottom-footer-navigation');
      expect(result.unified).toBe('v5.8-fixed-bottom-footer-navigation');
      expect(result.spacerHeight,'desktop fixed footer must reserve clearance').toBeGreaterThanOrEqual(56);
      for(const item of result.buttons){
        expect(item.h,'desktop compact control height').toBeGreaterThanOrEqual(40);
        expect(item.w,'desktop module should be much wider than tall').toBeGreaterThan(item.h*2);
      }
    }

    await page.locator('#floatDock .qily-float-btn[data-action="home"]').focus();
    const focus=await page.evaluate(()=>{
      const b=document.querySelector('#floatDock .qily-float-btn[data-action="home"]');
      const s=getComputedStyle(b),r=b.getBoundingClientRect();
      return {boxShadow:s.boxShadow,color:s.color,background:s.backgroundColor,left:r.left};
    });
    expect(focus.boxShadow,'focus feedback must remain internal and visible').toContain('inset');
    expect(focus.background,'focus should use gold fill').toMatch(/rgb\(255, 227, 155\)|rgba\(255, 227, 155/);
    expect(focus.color,'focus text should switch to deep teal').toMatch(/rgb\(15, 75, 90\)|rgba\(15, 75, 90/);
    expect(focus.left,'focused control must remain on-screen').toBeGreaterThanOrEqual(0);

    await page.screenshot({path:path.join(out,`${name}.png`),fullPage:true});
  });
}
