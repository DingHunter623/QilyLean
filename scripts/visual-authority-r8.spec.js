const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const BASE=process.env.QILY_VISUAL_BASE||'http://127.0.0.1:4173';
const BASE_ORIGIN=new URL(BASE).origin;
const OUT=path.resolve(process.cwd(),'visual-r8-artifacts');
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
// QilyLean permanent responsive acceptance matrix.
const viewports=[
  {name:'w1920',width:1920,height:1080},
  {name:'w1600',width:1600,height:1000},
  {name:'w1440',width:1440,height:1000},
  {name:'w1366',width:1366,height:900},
  {name:'w1024',width:1024,height:900},
  {name:'w768',width:768,height:900},
  {name:'w430',width:430,height:900},
  {name:'w390',width:390,height:844},
  {name:'w375',width:375,height:812}
];

fs.mkdirSync(OUT,{recursive:true});

test.use({reducedMotion:'reduce'});
test.setTimeout(600000);

test('R8 nine-width visual geometry and screenshot audit',async({browser})=>{
  const report=[];
  const failures=[];
  const flush=()=>fs.writeFileSync(path.join(OUT,'visual-r8-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),routes,viewports,failures,report},null,2));

  for(const vp of viewports){
    const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,reducedMotion:'reduce'});
    // Keep CI deterministic: the public shell and every audited visual asset are local; third-party translation/analytics must not block rendering evidence.
    await context.route('**/*',async route=>{
      const url=route.request().url();
      if(url.startsWith(BASE_ORIGIN)||url.startsWith('data:')||url.startsWith('blob:'))return route.continue();
      return route.abort();
    });
    const page=await context.newPage();
    const startupErrors=[];
    page.on('pageerror',error=>startupErrors.push(error.message));
    page.on('requestfailed',request=>{if(request.url().includes('site-visual-runtime-r8.js'))startupErrors.push(request.url()+': '+request.failure()?.errorText);});
    const cdp=await context.newCDPSession(page);

    for(const [name,route] of routes){
      const url=BASE+route;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
      if(!response||response.status()>=400){
        failures.push(`${vp.name}/${name}: HTTP ${response?response.status():'no-response'}`);
        flush();
        continue;
      }
      // The legacy index uses both meta refresh and location.replace. Its DCL
      // belongs to the redirect document, not the canonical page's defer scripts.
      if(name==='daily-index'){
        await page.waitForURL(url=>url.pathname==='/qilylean/daily-insights.html',{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForLoadState('domcontentloaded');
        try{
          // The canonical redirect can settle its deferred header after CI contention.
          // Keep the exact measured-header and downstream geometry assertions.
          await page.locator('header[data-qily-r8-measured="true"]').waitFor({state:'attached',timeout:15000});
        }catch(error){
          console.error('Canonical index startup',JSON.stringify({viewport:vp.name,errors:startupErrors.slice(-8),state:await page.evaluate(()=>({url:location.href,ready:document.readyState,runtime:window.__qilyVisualRuntimeR84,header:document.querySelector('header')?.outerHTML.slice(0,300)}))}));
          throw error;
        }
      }
      await page.waitForTimeout(260);

      // Header ResizeObserver updates the CSS height on the next animation frame.
      // Wait for two stable samples instead of comparing a new layout with the
      // previous frame's measurement. Persistent drift keeps the existing 4px gate.
      let previousHeaderHeight=null;
      let stableHeaderSamples=0;
      await expect.poll(async()=>{
        const header=await page.evaluate(()=>{
          const el=document.querySelector('header.qily-site-header,header.qily-global-header,header.topbar.qily-site-header,header.top.qily-site-header');
          if(!el)return null;
          const rect=el.getBoundingClientRect();
          const style=getComputedStyle(el);
          if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||rect.width<=0||rect.height<=0)return null;
          return {height:rect.height,live:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--qily-header-live-height'))||0};
        });
        if(!header)return true;
        const measured=header.live>0&&Math.abs(header.live-header.height)<=4;
        stableHeaderSamples=measured&&previousHeaderHeight!==null&&Math.abs(header.height-previousHeaderHeight)<=1?stableHeaderSamples+1:measured?1:0;
        previousHeaderHeight=header.height;
        return stableHeaderSamples>=2;
      },{timeout:5000,intervals:[50,100,200],message:`${vp.name}/${name}: header measurement must settle before geometry capture`}).toBe(true);

      const data=await page.evaluate(()=>{
        const q=(s)=>document.querySelector(s);
        const qa=(s)=>Array.from(document.querySelectorAll(s));
        const visible=(el)=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0;};
        const rect=(el)=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
        const width=document.documentElement.clientWidth;
        const header=q('header.qily-site-header,header.qily-global-header,header.topbar.qily-site-header,header.top.qily-site-header');
        const headerRect=header&&visible(header)?rect(header):null;
        const headerChildren=header?Array.from(header.children).filter(visible).filter(el=>!el.classList.contains('qily-primary-nav-scroll-rail')).map(el=>({tag:el.tagName,className:el.className||'',...rect(el)})):[];
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
          const bottom=Math.max(...kids.map(k=>k.getBoundingClientRect().bottom));
          const blank=Math.max(0,r.bottom-bottom);
          return blank>120&&blank>r.height*.28?{className:el.className,height:r.height,blank}:null;
        }).filter(Boolean).slice(0,8);
        const live=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--qily-header-live-height'))||0;
        return {
          viewportWidth:width,
          docScrollWidth:document.documentElement.scrollWidth,
          bodyScrollWidth:document.body?document.body.scrollWidth:0,
          overflowElements:qa('main *').filter(visible).filter(el=>{const r=el.getBoundingClientRect();return r.right>width+3||r.left<-3;}).slice(0,12).map(el=>({tag:el.tagName,id:el.id,className:String(el.className.baseVal||el.className),...rect(el)})),
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
      if(data.docScrollWidth>vp.width+3||data.bodyScrollWidth>vp.width+3)issues.push(`page overflow doc=${data.docScrollWidth} body=${data.bodyScrollWidth} viewport=${vp.width}; elements=${JSON.stringify(data.overflowElements)}`);
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
      flush();

      // CDP capture does not wait indefinitely for web-font readiness; geometry has already been measured from the rendered viewport above.
      try{
        const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
        fs.writeFileSync(path.join(OUT,`${vp.name}__${name}.png`),Buffer.from(shot.data,'base64'));
      }catch(error){
        failures.push(`${vp.name}/${name}: screenshot evidence failed: ${error.message}`);
        flush();
      }
    }
    await context.close();
  }

  flush();
  expect(failures,failures.join('\n')).toEqual([]);
});

/* QILY-NAV-SURFACE-NO-UNDERLINE-V1 | public VI regression.
 * Cover both navigation components, several shared pages, desktop and phone.
 * Do not test ordinary article/footnote link decorations here. */
/* QILY-PRIMARY-NAV-NO-UNDERLINE-RUNTIME-V1
 * The trust screenshot demonstrates that legacy CSS could recolour a gold
 * underline in the current tab. Assert the computed style of top-level
 * navigation itself, not just the subnav or operating-axis cards. */
test('primary navigation current text has no underline even with legacy styles',async({browser})=>{
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',route=>{
      const url=route.request().url();
      return url.startsWith(BASE_ORIGIN)||url.startsWith('data:')||url.startsWith('blob:')?route.continue():route.abort();
    });
    const page=await context.newPage();
    for(const route of ['/','/trust/','/projects/','/capabilities/']){
      const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:30000});
      expect(response&&response.status(),`primary nav HTTP ${route}`).toBe(200);
      const active=page.locator('header.qily-site-header :is(nav.site-nav,nav.qily-global-nav,nav.nav) > a[aria-current="page"]').first();
      await expect(active).toBeVisible();
      await expect.poll(()=>active.evaluate(el=>getComputedStyle(el).textDecorationLine),{timeout:10000}).toBe('none');
      const before=await active.evaluate(el=>({decoration:getComputedStyle(el).textDecorationLine,style:el.style.getPropertyValue('text-decoration-line')}));
      expect(before.decoration,`${width} ${route} current item`).toBe('none');
      // VI v1 and its bundled copy used a GOLD ::after bar, not text-decoration.
      // This is the pixel-visible line reported on /trust/: detect the actual cause.
      const pseudoGone=()=>active.evaluate(el=>{
        const pseudo=getComputedStyle(el,'::after');
        return pseudo.content==='none'||pseudo.display==='none';
      });
      await expect.poll(pseudoGone,{timeout:10000,message:`${width} ${route} gold pseudo underline must not render`}).toBe(true);
      await active.hover();
      expect(await active.evaluate(el=>getComputedStyle(el).textDecorationLine)).toBe('none');
      expect(await pseudoGone(),`${width} ${route} hover pseudo`).toBe(true);
      await active.focus();
      expect(await active.evaluate(el=>getComputedStyle(el).textDecorationLine)).toBe('none');
      expect(await pseudoGone(),`${width} ${route} focus pseudo`).toBe(true);
    }
    await context.close();
  }
});

test('navigation surface links retain background feedback without underlines',async({browser})=>{
  const routes=['/trust/','/experience/','/capabilities/','/cooperation/'];
  const selectors=['main .module-subnav > a[href]','main a.qily-system-axis__step[href]'];
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    await context.route('**/*',route=>{
      const url=route.request().url();
      return url.startsWith(BASE_ORIGIN)||url.startsWith('data:')||url.startsWith('blob:')?route.continue():route.abort();
    });
    const page=await context.newPage();
    for(const route of routes){
      const response=await page.goto(BASE+route,{waitUntil:'load',timeout:30000});
      expect(response&&response.status(),`HTTP ${route}`).toBe(200);
      for(const selector of selectors){
        const target=page.locator(selector).first();
        if(await target.count()===0){
          // Not every module has jump pills; the trust & capabilities pages do.
          if(selector.includes('module-subnav')&&(route==='/trust/'||route==='/capabilities/'))throw Error(`Missing module pills on ${route}`);
          if(selector.includes('qily-system-axis'))throw Error(`Missing operating-axis links on ${route}`);
          continue;
        }
        await expect(target,`${width} ${route} ${selector} visible`).toBeVisible();
        const decoration=()=>target.evaluate(el=>getComputedStyle(el).textDecorationLine);
        expect(await decoration(),`${width} ${route} ${selector} default`).toBe('none');
        await target.hover();
        expect(await decoration(),`${width} ${route} ${selector} hover`).toBe('none');
        await target.focus();
        expect(await decoration(),`${width} ${route} ${selector} focus`).toBe('none');
      }
    }
    await context.close();
  }
});


/* The resume is a full-width chronological article, NOT a desktop card gallery.
 * Prevent global R8 card-count layout rules from returning it to two columns.
 */
test('career four-stage single-column article geometry',async({browser})=>{
  const cases=[
    {width:1600,height:950},{width:1366,height:900},
    {width:1024,height:900},{width:768,height:900},{width:390,height:844}
  ];
  const order=['2025.11—至今','2019.07—2025.08','2015.07—2019.06','2006.07—2015.06'];
  for(const vp of cases){
    const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'});
    await context.route('**/*',route=>{
      const url=route.request().url();
      return url.startsWith(BASE_ORIGIN)||url.startsWith('data:')||url.startsWith('blob:')?route.continue():route.abort();
    });
    try{
      const page=await context.newPage();
      const response=await page.goto(BASE+'/experience/',{waitUntil:'domcontentloaded',timeout:30000});
      expect(response&&response.ok(),'career article page must load').toBeTruthy();
      await expect(page.locator('#experience .career-full-card')).toHaveCount(4);

      const earlyCareer=page.locator('#career-2006-2015');
      await expect(earlyCareer.locator('.career-company-tenure')).toHaveCount(2);
      await expect(earlyCareer.locator('.career-company-line').filter({hasText:'东莞库柏电子'})).toContainText('2009.07—2015.06');
      await expect(earlyCareer.locator('.career-company-line').filter({hasText:'珠海伟创力制造'})).toContainText('2006.07—2009.06');
      await expect(earlyCareer.locator('.career-related-link')).toHaveCount(5);
      await expect(earlyCareer).not.toContainText('IATF 16949核心工具');
      await expect(page.locator('#career-2025-current .career-company-official')).toHaveAttribute('href','http://www.china-tianx.com/');
      const tagLayout=await earlyCareer.locator('.career-related-links').evaluate(root=>{
        const box=root.getBoundingClientRect();
        const items=[...root.querySelectorAll('a')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,center:(r.left+r.right)/2}});
        const rows=[];
        for(const item of items.sort((a,b)=>a.top-b.top||a.left-b.left)){
          let row=rows.find(x=>Math.abs(x.top-item.top)<3);
          if(!row){row={top:item.top,items:[]};rows.push(row);}
          row.items.push(item);
        }
        return {center:box.left+box.width/2,gridTemplateColumns:getComputedStyle(root).gridTemplateColumns,rows:rows.map(r=>r.items)};
      });
      if(vp.width<=760){
        expect(tagLayout.rows.map(r=>r.length),`mobile five-tag layout: ${JSON.stringify(tagLayout)}`).toEqual([2,2,1]);
        expect(Math.abs(tagLayout.rows[2][0].center-tagLayout.center)).toBeLessThan(5);
      }else{
        expect(tagLayout.rows.map(r=>r.length),`desktop five-tag layout: ${JSON.stringify(tagLayout)}`).toEqual([3,2]);
        const lastRowCenter=tagLayout.rows[1].reduce((sum,item)=>sum+item.center,0)/tagLayout.rows[1].length;
        expect(Math.abs(lastRowCenter-tagLayout.center)).toBeLessThan(5);
      }

      // Latest four-page PDF: thumbnail must load and both original-file actions must remain usable.
      const resumeSection=page.locator('#career-resume-20261102');
      await expect(resumeSection).toBeVisible();
      await expect(resumeSection).not.toContainText('文档预览与直接下载需待公开托管资源完成发布验收');
      await expect(resumeSection.locator('.resume-pdf-viewer')).toHaveCount(0);
      const cover=resumeSection.locator('.resume-pdf-cover img');
      await cover.scrollIntoViewIfNeeded();
      await expect(cover).toBeVisible();
      await expect.poll(()=>cover.evaluate(img=>img.complete&&img.naturalWidth===900&&img.naturalHeight>1200),
        {timeout:15000,message:`resume cover must load at full 900px source width on ${vp.width}px viewport`}).toBe(true);
      const resumeActions=resumeSection.locator('.resume-pdf-action');
      await expect(resumeActions).toHaveCount(2);
      const resumeActionState=await resumeActions.evaluateAll(nodes=>nodes.map(el=>{
        const r=el.getBoundingClientRect();
        return {href:el.getAttribute('href'),target:el.getAttribute('target'),download:el.getAttribute('download'),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width};
      }));
      expect(resumeActionState[0].href).toBe('/assets/resume/ding-qili-resume-2026-11.pdf');
      expect(resumeActionState[0].target).toBe('_blank');
      expect(resumeActionState[1].href).toBe('/assets/resume/ding-qili-resume-2026-11.pdf');
      expect(resumeActionState[1].download).toBe('丁启利_精益经理工程部经理简历_20261102.pdf');
      const resumeCard=await resumeSection.locator('.resume-pdf-card').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth}));
      expect(resumeCard.scrollWidth-resumeCard.width, `resume PDF card ${vp.width}px horizontal overflow`).toBeLessThanOrEqual(2);
      for(const action of resumeActionState){
        expect(action.left, `resume action left edge ${vp.width}px`).toBeGreaterThanOrEqual(-1);
        expect(action.right, `resume action right edge ${vp.width}px`).toBeLessThanOrEqual(vp.width+1);
      }
      if(vp.width<=760)expect(resumeActionState[0].top).toBeLessThan(resumeActionState[1].top);
      await resumeSection.locator('.resume-pdf-card').screenshot({path:path.join(OUT,`resume-pdf-card-${vp.width}.png`)});
      await expect.poll(()=>page.locator('#experience .career-full-grid').evaluate(el=>getComputedStyle(el).display),
        {timeout:10000,message:`career ${vp.width}px must be an article stream`}).toBe('block');
      const state=await page.locator('#experience .career-full-grid').evaluate(grid=>{
        const root=grid.getBoundingClientRect();
        const cards=[...grid.querySelectorAll(':scope>article.career-full-card')].map(el=>{
          const r=el.getBoundingClientRect();
          return {left:r.left,top:r.top,bottom:r.bottom,width:r.width,height:r.height,
            period:(el.querySelector('small')?.textContent||'').trim()};
        });
        return {root:{left:root.left,width:root.width},cards,overflow:grid.scrollWidth-grid.clientWidth};
      });
      expect(state.cards.length).toBe(4);
      expect(state.overflow,`career ${vp.width}px horizontal overflow`).toBeLessThanOrEqual(2);
      for(let i=0;i<4;i++){
        const item=state.cards[i];
        expect(item.period,`career stage ${i} chronology`).toContain(order[i]);
        expect(Math.abs(item.left-state.root.left),`career stage ${i} common left axis`).toBeLessThan(3);
        expect(item.width/state.root.width,`career stage ${i} full-width layout`).toBeGreaterThan(.97);
        expect(item.height,`career stage ${i} original details`).toBeGreaterThan(180);
        if(i>0)expect(item.top-state.cards[i-1].bottom,`stage ${i} cannot share a row`).toBeGreaterThanOrEqual(-2);
      }
      await page.locator('#experience .career-full-card').first().screenshot({
        path:path.join(OUT,`career-article-${vp.width}.png`)
      });
    }finally{await context.close();}
  }
});
