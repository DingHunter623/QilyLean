const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_DOCK_V56_BASE||'http://127.0.0.1:4173';
const cases=[
  ['home-desktop','/',{width:1440,height:1000},false],
  ['home-mobile','/',{width:390,height:844},true],
  ['daily-desktop','/qilylean/daily/2026-09-04.html',{width:1440,height:1000},false],
  ['daily-mobile','/qilylean/daily/2026-09-04.html',{width:390,height:844},true]
];
const expected=['回首页','回顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'];
const out=path.join(process.cwd(),'dock-v56-artifacts');
fs.mkdirSync(out,{recursive:true});

for(const [name,url,viewport,mobile] of cases){
  test(`${name} Dock V5.6 flow navigation`,async({page})=>{
    await page.setViewportSize(viewport);
    const response=await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
    expect(response&&response.ok(),`${url} should resolve`).toBeTruthy();
    await page.waitForSelector('#floatDock[data-qily-unified-public-module="v5.6-flow-navigation"]',{state:'visible',timeout:10000});

    const result=await page.evaluate(()=>{
      const dock=document.querySelector('#floatDock[data-qily-unified-public-module="v5.6-flow-navigation"]');
      const buttons=[...dock.querySelectorAll('.qily-float-btn[data-action]')];
      const ds=getComputedStyle(dock),dr=dock.getBoundingClientRect(),main=document.querySelector('main'),mr=main&&main.getBoundingClientRect();
      return {
        position:ds.position,
        display:ds.display,
        gridColumns:ds.gridTemplateColumns,
        overflowX:ds.overflowX,
        marginTop:parseFloat(ds.marginTop)||0,
        marginBottom:parseFloat(ds.marginBottom)||0,
        scrollWidth:dock.scrollWidth,
        clientWidth:dock.clientWidth,
        mainGap:mr?Math.round(dr.top-mr.bottom):null,
        labels:buttons.map(b=>b.getAttribute('aria-label')),
        actions:buttons.map(b=>b.getAttribute('data-action')),
        buttons:buttons.map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {w:r.width,h:r.height,radius:parseFloat(s.borderTopLeftRadius)||0,position:s.position};})
      };
    });

    expect(result.position).not.toBe('fixed');
    expect(result.position).not.toBe('absolute');
    expect(result.labels).toEqual(expected);
    expect(result.actions).toEqual(['home','top','back','previous','search','current','contact']);
    expect(result.marginTop).toBeCloseTo(result.marginBottom,0);
    expect(result.buttons).toHaveLength(7);
    for(const item of result.buttons){
      expect(item.radius,'buttons must not be circular').toBeLessThanOrEqual(12);
      expect(item.w,'navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);
    }
    if(mobile){
      expect(['auto','scroll']).toContain(result.overflowX);
      expect(result.scrollWidth,'mobile action row should horizontally overflow').toBeGreaterThan(result.clientWidth+20);
      const moved=await page.evaluate(()=>{const d=document.querySelector('#floatDock');d.scrollTo({left:d.scrollWidth,behavior:'instant'});return d.scrollLeft;});
      expect(moved,'mobile action row should be user-scrollable').toBeGreaterThan(20);
    }else{
      expect(result.display).toBe('grid');
      expect(result.gridColumns.split(' ').length).toBe(7);
      if(result.mainGap!==null)expect(result.mainGap,'main-to-action-module gap').toBeGreaterThanOrEqual(16);
    }

    await page.screenshot({path:path.join(out,`${name}.png`),fullPage:true});
  });
}
