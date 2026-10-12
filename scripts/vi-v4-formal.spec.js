const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_VI_V4_BASE||'http://127.0.0.1:4173';
const pages=[
  ['home','/'],
  ['en','/en/'],
  ['daily-20260825','/qilylean/daily/2026-08-25.html'],
  ['daily-20260904','/qilylean/daily/2026-09-04.html'],
  ['daily-20260913','/qilylean/daily/2026-09-13.html'],
  ['times26001','/tools/times26001/'],
  ['gbt2828','/gbt2828.html'],
  ['ai','/ai.html'],
  ['cooperation','/cooperation/']
];
const viewports=[
  ['desktop',{width:1440,height:1000}],
  ['tablet',{width:1024,height:900}],
  ['mobile',{width:390,height:844}]
];
const heroSelector='.hero,.module-hero,.daily-hero,.article-hub,.document-hero,.project-hero,.projects-hero,.cooperation-hero,.capability-hero,.experience-hero,.improvement-hero,.knowledge-hero,.trust-hero,[data-qily-hero]';

fs.mkdirSync(path.join(process.cwd(),'visual-vi-v4-artifacts'),{recursive:true});

test('curated brief contents remain separate usable buttons at every breakpoint',async({browser})=>{
  test.setTimeout(120000);
  const issues=[['2026-09-13',10],['2026-09-20',8],['2026-09-23',8],['2026-09-28',7],['2026-10-11',7]];
  for(const width of [1680,1024,390,320]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
    const page=await context.newPage();
    for(const [date,count] of issues){
      await page.goto(`${base}/qilylean/daily/${date}.html`,{waitUntil:'load'});
      const nav=page.locator('nav.lean-brief-toc');
      await expect(nav.locator('a[href]')).toHaveCount(count);
      const buttons=await nav.locator('a[href]').evaluateAll(links=>links.map(a=>{
        const r=a.getBoundingClientRect(),s=getComputedStyle(a),target=document.querySelector(a.getAttribute('href'));
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height,border:parseFloat(s.borderTopWidth),decoration:s.textDecorationLine,targetVisible:!!target&&target.getBoundingClientRect().height>0};
      }));
      for(let i=0;i<buttons.length;i++){
        const button=buttons[i];
        expect(button.height,`${date}/${width}: usable target height`).toBeGreaterThanOrEqual(44);
        expect(button.border,`${date}/${width}: separate button border`).toBeGreaterThan(0);
        expect(button.decoration).toBe('none');
        expect(button.targetVisible,`${date}: existing visible chapter target`).toBeTruthy();
        expect(button.left).toBeGreaterThanOrEqual(0);
        expect(button.right).toBeLessThanOrEqual(width);
        if(i){
          const previous=buttons[i-1];
          if(Math.abs(button.top-previous.top)<1)expect(button.left-previous.right).toBeCloseTo(10,0);
          else expect(button.top-previous.bottom).toBeGreaterThanOrEqual(9);
        }
      }
      if(width>=1280&&count===7)expect(new Set(buttons.map(b=>Math.round(b.top))).size).toBe(1);
      if(width<=390)expect(new Set(buttons.map(b=>Math.round(b.top))).size).toBeGreaterThan(1);
      if(date==='2026-10-11'){
        for(let i=0;i<count;i++){
          const link=nav.locator('a[href]').nth(i),href=await link.getAttribute('href');
          await link.click();
          await expect(page).toHaveURL(new RegExp(`${href}$`));
          await expect.poll(()=>page.locator(href).evaluate(el=>{const r=el.getBoundingClientRect(),header=document.querySelector('header.qily-site-header');return r.top>=(header?header.getBoundingClientRect().bottom:0)-1&&r.top<innerHeight-100;}),{message:`${width}: chapter should scroll below the fixed header`}).toBeTruthy();
        }
      }
    }
    await context.close();
  }
});

for(const [name,url] of pages){
  for(const [device,viewport] of viewports){
    test(`${name} ${device} formal VI v4`,async({page})=>{
      await page.setViewportSize(viewport);
      const response=await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});
      expect(response&&response.ok(),`${url} should resolve`).toBeTruthy();
      await page.waitForFunction(()=>document.documentElement.getAttribute('data-qily-vi-status')==='formal',{timeout:8000});

      const result=await page.evaluate((heroSelector)=>{
        const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)!==0&&r.width>0&&r.height>0;};
        const headers=[...document.querySelectorAll('header.qily-site-header,header.qily-global-header,header.topbar,header.top')].filter(visible);
        const docks=[...document.querySelectorAll('#floatDock.qily-float-dock,.qily-float-dock')].filter(visible);
        const primaryNav=document.querySelector('header.qily-site-header nav.site-nav,header.qily-site-header nav.qily-global-nav,header.qily-global-header nav.site-nav,header.qily-global-header nav.qily-global-nav');
        const navOverflow=!!primaryNav&&primaryNav.scrollWidth>primaryNav.clientWidth+1;
        const rails=[...document.querySelectorAll('input.qily-primary-nav-scroll-rail[type="range"]')].filter(visible);
        const syntheticThumbs=[...document.querySelectorAll('.qily-primary-nav-scroll-thumb')].filter(visible);
        const translators=[...document.querySelectorAll('.qily-web-translate')].filter(visible);
        const heroes=[...document.querySelectorAll(heroSelector)].filter(el=>visible(el)&&!el.classList.contains('qily-aircraft-brand-hero')&&el.getAttribute('data-qily-vi-v4-surface')!=='secondary-content');
        const secondaryBrief=document.querySelector('body.qily-knowledge-brief-page main[data-qily-knowledge-brief] > .knowledge-brief-hero.module-hero');
        const secondaryBriefStyle=secondaryBrief&&getComputedStyle(secondaryBrief);
        return {
          rootStatus:document.documentElement.getAttribute('data-qily-vi-status'),
          overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth,
          headers:headers.length,
          headerFormal:headers[0]&&headers[0].classList.contains('qily-site-header'),
          docks:docks.length,
          dockPositions:docks.map(el=>getComputedStyle(el).position),
          dockHeights:docks.map(el=>el.getBoundingClientRect().height),
          bodyPaddingBottom:parseFloat(getComputedStyle(document.body).paddingBottom)||0,
          dockSpacerHeight:(()=>{const el=document.getElementById('qilyDockBottomSpacerV58');if(!el||el.parentElement!==document.body)return 0;const style=getComputedStyle(el);return style.display!=='none'&&!['fixed','absolute'].includes(style.position)?el.getBoundingClientRect().height:0;})(),
          navOverflow,
          rails:rails.length,
          syntheticThumbs:syntheticThumbs.length,
          translatorOutsideHeader:translators.filter(el=>!el.closest('header.qily-site-header')).length,
          heroes:heroes.length,
          badHero:heroes.filter(el=>!getComputedStyle(el).backgroundImage.includes('118deg')).map(el=>el.className),
          heroMarkers:heroes.filter(el=>el.getAttribute('data-qily-vi-v4-hero')==='118deg').length,
          secondaryBriefPresent:!!secondaryBrief,
          secondaryBriefGradient:secondaryBriefStyle?secondaryBriefStyle.backgroundImage:'none',
          secondaryBriefSurface:secondaryBrief&&secondaryBrief.getAttribute('data-qily-vi-v4-surface')
        };
      },heroSelector);

      expect(result.rootStatus).toBe('formal');
      expect(result.overflow,`${url} ${device} page-level overflow`).toBeLessThanOrEqual(1);
      expect(result.headers,`${url} ${device} visible Header count`).toBe(1);
      expect(result.headerFormal).toBeTruthy();
      expect(result.docks,`${url} ${device} visible Dock count`).toBeLessThanOrEqual(1);
      const dockReserved=result.dockPositions.every((p,i)=>p!=='fixed'&&p!=='absolute'||result.bodyPaddingBottom+result.dockSpacerHeight+1>=result.dockHeights[i]);
      expect(dockReserved,`${url} ${device} fixed Dock must reserve equivalent bottom content space`).toBeTruthy();
      expect(result.syntheticThumbs,`${url} ${device} synthetic legacy navigation thumb`).toBe(0);
      expect(result.rails,`${url} ${device} overflow navigation rail parity`).toBe(result.navOverflow?1:0);
      expect(result.translatorOutsideHeader,`${url} ${device} translator must live in Header`).toBe(0);
      expect(result.badHero,`${url} ${device} non-118deg Hero: ${result.badHero.join(' | ')}`).toEqual([]);
      expect(result.heroMarkers,`${url} ${device} Hero formal markers`).toBe(result.heroes);
      if(name==='daily-20260904'||name==='daily-20260913'){
        expect(result.secondaryBriefPresent,'AI/IE Selected Brief content card should exist').toBeTruthy();
        expect(result.secondaryBriefSurface,'AI/IE Selected Brief content card must be classified as secondary content').toBe('secondary-content');
        expect(result.secondaryBriefGradient,'AI/IE Selected Brief outer surface must not render a teal/brand gradient').toBe('none');
      }

      if(name==='daily-20260913'){
        await expect(page.locator('article.post')).toHaveAttribute('data-brief-title','招聘一名精益负责人，企业究竟需要他建立什么？');
        await expect(page.locator('article.post section[id]')).toHaveCount(10);
        const diagrams=page.locator('.lean-brief-diagram img');
        await expect(diagrams).toHaveCount(4);
        for(let i=0;i<4;i++){
          await diagrams.nth(i).scrollIntoViewIfNeeded();
          await expect.poll(()=>diagrams.nth(i).evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
          await page.screenshot({path:path.join('visual-vi-v4-artifacts',`${name}-${device}-diagram-${i+1}.png`)});
        }
        const banner=await page.locator('.knowledge-brief-top-nav').evaluate(el=>getComputedStyle(el,'::before').content);
        expect(banner).toContain('2026-09-13');
        expect(banner).toContain('制造运营体系与精益价值');
      }

      await page.screenshot({path:path.join('visual-vi-v4-artifacts',`${name}-${device}.png`),fullPage:true});
    });
  }
}
