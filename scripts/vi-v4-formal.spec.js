const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_VI_V4_BASE||'http://127.0.0.1:4173';
const pages=[
  ['home','/'],
  ['en','/en/'],
  ['daily-20260825','/qilylean/daily/2026-08-25.html'],
  ['daily-20260904','/qilylean/daily/2026-09-04.html'],
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

test.describe.configure({mode:'serial'});
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
        const rails=[...document.querySelectorAll('.qily-primary-nav-scroll-rail,.qily-primary-nav-scroll-thumb')].filter(visible);
        const translators=[...document.querySelectorAll('.qily-web-translate')].filter(visible);
        const heroes=[...document.querySelectorAll(heroSelector)].filter(el=>visible(el)&&!el.classList.contains('qily-aircraft-brand-hero'));
        return {
          rootStatus:document.documentElement.getAttribute('data-qily-vi-status'),
          overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth,
          headers:headers.length,
          headerFormal:headers[0]&&headers[0].classList.contains('qily-site-header'),
          docks:docks.length,
          dockPositions:docks.map(el=>getComputedStyle(el).position),
          rails:rails.length,
          translatorOutsideHeader:translators.filter(el=>!el.closest('header.qily-site-header')).length,
          heroes:heroes.length,
          badHero:heroes.filter(el=>!getComputedStyle(el).backgroundImage.includes('118deg')).map(el=>el.className),
          heroMarkers:heroes.filter(el=>el.getAttribute('data-qily-vi-v4-hero')==='118deg').length
        };
      },heroSelector);

      expect(result.rootStatus).toBe('formal');
      expect(result.overflow,`${url} ${device} page-level overflow`).toBeLessThanOrEqual(1);
      expect(result.headers,`${url} ${device} visible Header count`).toBe(1);
      expect(result.headerFormal).toBeTruthy();
      expect(result.docks,`${url} ${device} visible Dock count`).toBeLessThanOrEqual(1);
      expect(result.dockPositions.every(p=>p!=='fixed'&&p!=='absolute'),`${url} ${device} Dock must not overlay content`).toBeTruthy();
      expect(result.rails,`${url} ${device} legacy navigation slider`).toBe(0);
      expect(result.translatorOutsideHeader,`${url} ${device} translator must live in Header`).toBe(0);
      expect(result.badHero,`${url} ${device} non-118deg Hero: ${result.badHero.join(' | ')}`).toEqual([]);
      expect(result.heroMarkers,`${url} ${device} Hero formal markers`).toBe(result.heroes);

      await page.screenshot({path:path.join('visual-vi-v4-artifacts',`${name}-${device}.png`),fullPage:true});
    });
  }
}
