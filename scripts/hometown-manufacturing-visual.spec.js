const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

const base=process.env.QILY_HOMETOWN_BASE||'http://127.0.0.1:4173';
const origin=new URL(base).origin;
const output=path.join(process.cwd(),'hometown-article-visual-artifacts');
const viewports=[
  {name:'desktop-1920',width:1920,height:1080},
  {name:'desktop-1440',width:1440,height:1000},
  {name:'tablet-1024',width:1024,height:900},
  {name:'tablet-768',width:768,height:900},
  {name:'mobile-430',width:430,height:900},
  {name:'mobile-390',width:390,height:844},
  {name:'mobile-375',width:375,height:812}
];
const expectedArrows=[2,3,2,4];
fs.mkdirSync(output,{recursive:true});
test.setTimeout(180000);

for(const viewport of viewports){
  test('Hometown article visual acceptance: '+viewport.name,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    const pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await page.route('**/*',async route=>{
      const url=route.request().url();
      if(url.startsWith(origin)||url.startsWith('data:')||url.startsWith('blob:'))return route.continue();
      return route.abort();
    });

    const response=await page.goto(base+'/links/hometown-manufacturing/',{waitUntil:'domcontentloaded',timeout:30000});
    expect(response&&response.status()).toBe(200);
    await expect(page.locator('#qilyHometownManufacturingPaper h1')).toBeVisible();
    await expect(page.locator('#qilyHometownManufacturingPaper svg')).toHaveCount(4);
    await page.evaluate(()=>document.fonts.ready);

    const report=await page.evaluate(()=>{
      const root=document.querySelector('#qilyHometownManufacturingPaper');
      const rectOf=el=>{
        const r=el.getBoundingClientRect();
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
      };
      const overlaps=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
      const diagrams=[...root.querySelectorAll('svg')].map(svg=>{
        const svgRect=rectOf(svg);
        const scale=svgRect.width/1080;
        const texts=[...svg.querySelectorAll('text')].map(el=>{
          const r=rectOf(el);
          return {text:el.textContent.trim(),fontSize:parseFloat(getComputedStyle(el).fontSize),renderedFontSize:parseFloat(getComputedStyle(el).fontSize)*scale,rect:r};
        });
        const textOverlaps=[];
        for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
          if(overlaps(texts[i].rect,texts[j].rect))textOverlaps.push([texts[i].text,texts[j].text]);
        }
        const nodes=[...svg.querySelectorAll('rect,circle')].map(rectOf);
        const arrows=[...svg.querySelectorAll('[data-qily-unified-arrow="v4"]')].map(el=>{
          const style=getComputedStyle(el),rect=rectOf(el);
          return {fill:style.fill,stroke:style.stroke,rect,overlapsNode:nodes.some(node=>overlaps(rect,node))};
        });
        const textOutside=texts.some(t=>t.rect.left<svgRect.left-1||t.rect.right>svgRect.right+1||t.rect.top<svgRect.top-1||t.rect.bottom>svgRect.bottom+1);
        const wrapper=svg.closest('.paper-hero-figure,.paper-figure');
        return {
          svgRect,
          wrapperClientWidth:wrapper.clientWidth,
          wrapperScrollWidth:wrapper.scrollWidth,
          textCount:texts.length,
          minRenderedFontSize:Math.min(...texts.map(t=>t.renderedFontSize)),
          textOutside,
          textOverlaps,
          arrows
        };
      });
      return {
        clientWidth:document.documentElement.clientWidth,
        scrollWidth:document.documentElement.scrollWidth,
        diagrams
      };
    });

    expect(report.scrollWidth).toBeLessThanOrEqual(report.clientWidth+1);
    expect(report.diagrams).toHaveLength(4);
    for(let i=0;i<report.diagrams.length;i++){
      const diagram=report.diagrams[i];
      expect(diagram.svgRect.width).toBeGreaterThan(0);
      expect(diagram.svgRect.width).toBeLessThanOrEqual(diagram.wrapperScrollWidth+1);
      expect(diagram.minRenderedFontSize).toBeGreaterThanOrEqual(14.5);
      expect(diagram.textCount).toBeGreaterThan(0);
      expect(diagram.textOutside).toBe(false);
      expect(diagram.textOverlaps).toEqual([]);
      expect(diagram.arrows).toHaveLength(expectedArrows[i]);
      for(const arrow of diagram.arrows){
        expect(arrow.fill).toBe('rgb(15, 75, 90)');
        expect(arrow.stroke).toBe('none');
        expect(arrow.overlapsNode).toBe(false);
      }
      if(viewport.width<=1100){
        expect(diagram.svgRect.width).toBeGreaterThanOrEqual(1080);
        expect(diagram.wrapperScrollWidth).toBeGreaterThan(diagram.wrapperClientWidth+1);
      }else{
        expect(diagram.svgRect.width).toBeLessThanOrEqual(diagram.wrapperClientWidth+1);
      }
    }
    expect(pageErrors).toEqual([]);
    await page.screenshot({path:path.join(output,viewport.name+'.png'),fullPage:true});
  });
}
