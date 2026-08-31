const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const BASE=process.env.QILY_VISUAL_BASE||'http://127.0.0.1:4173';
const OUT=path.resolve(process.cwd(),'.visual-r8-artifacts');
const routes=[
  ['home','/'],
  ['capabilities','/capabilities/'],
  ['projects','/projects/'],
  ['improvements','/improvements/'],
  ['knowledge','/knowledge/'],
  ['daily-index','/daily-insights.html'],
  ['cooperation','/cooperation/'],
  ['trust','/trust/'],
  ['contact','/contact/'],
  ['north','/north/']
];
const viewports=[
  {name:'desktop',width:1440,height:1000},
  {name:'tablet',width:1024,height:900},
  {name:'tablet-narrow',width:768,height:900},
  {name:'mobile',width:390,height:844}
];

fs.mkdirSync(OUT,{recursive:true});

test.use({reducedMotion:'reduce'});
test.setTimeout(180000);

test('R8 representative visual geometry and screenshot audit',async({browser})=>{
  const report=[];
  const failures=[];

  for(const vp of viewports){
    const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,reducedMotion:'reduce'});
    const page=await context.newPage();

    for(const [name,route] of routes){
      const url=BASE+route;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      if(!response||response.status()>=400){
        failures.push(`${vp.name}/${name}: HTTP ${response?response.status():'no-response'}`);
        continue;
      }
      await page.waitForTimeout(650);

      const data=await page.evaluate(()=>{
        const q=(s)=>document.querySelector(s);
        const qa=(s)=>Array.from(document.querySelectorAll(s));
        const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0;};
        const rect=(el)=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
        const width=document.documentElement.clientWidth;
        const header=q('header.qily-site-header,header.qily-global-header,header.topbar.qily-site-header,header.top.qily-site-header');
        const headerRect=header&&visible(header)?rect(header):null;
        const headerChildren=header?Array.from(header.children).filter(visible).map(el=>({tag:el.tagName,className:el.className||'',...rect(el)})):[];
        const translator=q('.qily-web-translate');
        const rail=q('.qily-primary-nav-scroll-rail');
        const dock=q('#floatDock');
        const tableSelector='.qily-table-scroll,.table-wrap,.table-scroll,.table-responsive,.data-table-wrap,.data-table-scroll,.matrix-wrap,.matrix-scroll,.comparison-wrap,.comparison-table-wrap,.opl-table-wrap';
        const unwrappedTables=qa('main table').filter(t=>!t.closest(tableSelector)).length;
        const mediaOverflow=qa('main img,main svg,main canvas,main video').filter(visible).filter(el=>{
          const r=el.getBoundingClientRect();
          const owner=el.closest('section,.module-inner,.section-inner,.page-inner,.content-inner,.qily-diagram-frame,.qily-flow-frame')||el.parentElement;
          if(!owner)return false;
          const o=owner.getBoundingClientRect();
          return r.left<o.left-4||r.right>o.right+4;
        }).slice(0,10).map(el=>({tag:el.tagName,className:el.className&&String(el.className.baseVal||el.className)||'',...rect(el)}));
        const badArrows=qa('svg [data-qily-unified-arrow="v4"]').filter(el=>{
          try{const b=el.getBBox();return !b||b.width<=0||b.height<=0;}catch(e){return true;}
        }).length;
        const cards=qa('main .module-card,main .paper-card,main .project-card,main .project-list-card,main .career-full-card,main .service-card,main .resource-card,main .knowledge-card,main .trust-card,main .qily-value-card,main .qily-ia-card').filter(visible);
        const blankCardWarnings=cards.map(el=>{
          const r=el.getBoundingClientRect();
          const kids=Array.from(el.children).filter(visible);
          if(!kids.length)return null;
          let bottom=Math.max(...kids.map(k=>k.getBoundingClientRect().bottom));
          const blank=Math.max(0,r.bottom-bottom);
          return blank>120&&blank>r.height*.28?{className:el.className,height:r.height,blank}:null;
        }).filter(Boolean).slice(0,8);
        const live=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--qily-header-live-height'))||0;
        return {
          viewportWidth:width,
          docScrollWidth:document.documentElement.scrollWidth,
          bodyScrollWidth:document.body?document.body.scrollWidth:0,
          overflowState:document.documentElement.getAttribute('data-qily-r8-overflow')||'',
          headerRect,
          headerChildren,
          translator:translator&&visible(translator)?rect(translator):null,
          rail:rail&&visible(rail)?rect(rail):null,
          dock:dock&&visible(dock)?rect(dock):null,
          liveHeaderHeight:live,
          unwrappedTables,
          mediaOverflow,
          badArrows,
          blankCardWarnings
        };
      });

      const issues=[];
      if(data.docScrollWidth>vp.width+3||data.bodyScrollWidth>vp.width+3)issues.push(`page overflow doc=${data.docScrollWidth} body=${data.bodyScrollWidth} viewport=${vp.width}`);
      if(data.unwrappedTables)issues.push(`unwrapped tables=${data.unwrappedTables}`);
      if(data.mediaOverflow.length)issues.push(`media outside owner=${data.mediaOverflow.length}`);
      if(data.badArrows)issues.push(`invalid unified arrows=${data.badArrows}`);
      if(data.headerRect){
        if(data.liveHeaderHeight<=0||Math.abs(data.liveHeaderHeight-data.headerRect.height)>4)issues.push(`header live height mismatch css=${data.liveHeaderHeight} rect=${data.headerRect.height.toFixed(1)}`);
        for(const child of data.headerChildren){
          if(child.left<data.headerRect.left-4||child.right>data.headerRect.right+4)issues.push(`header child outside frame ${child.tag}.${child.className}`);
        }
        if(data.translator&&(data.translator.left<data.headerRect.left-4||data.translator.right>data.headerRect.right+4))issues.push('translator outside header frame');
        if(data.rail&&(data.rail.left<data.headerRect.left-6||data.rail.right>data.headerRect.right+6))issues.push('navigation rail outside header frame');
      }
      if(data.dock&&(data.dock.left<-2||data.dock.right>vp.width+2||data.dock.top<-2||data.dock.bottom>vp.height+2))issues.push('Dock outside viewport safe area');

      report.push({viewport:vp,name,route,...data,issues});
      if(issues.length)failures.push(`${vp.name}/${name}: ${issues.join('; ')}`);

      await page.screenshot({path:path.join(OUT,`${vp.name}__${name}.png`),fullPage:true,animations:'disabled'});
    }
    await context.close();
  }

  fs.writeFileSync(path.join(OUT,'visual-r8-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),routes,viewports,failures,report},null,2));
  expect(failures,failures.join('\n')).toEqual([]);
});
