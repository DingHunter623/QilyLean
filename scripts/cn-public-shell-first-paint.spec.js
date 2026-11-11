const {test,expect}=require('@playwright/test');
const base=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const pages=[
  ['home','/'],
  ['briefs','/briefs/'],
  ['knowledge','/knowledge/'],
  ['about','/about/']
];
const viewports=[
  ['desktop',{width:1600,height:950}],
  ['mobile',{width:390,height:844}]
];

async function shellState(page){
  return page.evaluate(()=>{
    const header=document.querySelector('header.site-header');
    const nav=header&&header.querySelector('nav.nav');
    const shell=header&&header.querySelector('.qily-cn-nav-shell');
    const rail=shell&&shell.querySelector('.qily-primary-nav-scroll-rail');
    const translator=header&&header.querySelector('#qilyCnTranslateV3');
    const footer=document.querySelector('footer.footer');
    const dock=footer&&footer.querySelector('#floatDock');
    const visible=element=>{
      if(!element)return false;
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
    };
    const fr=footer&&footer.getBoundingClientRect();
    return {
      header:visible(header),
      headerTop:header?header.getBoundingClientRect().top:null,
      navBeforeMain:!!(header&&document.querySelector('main')&&header.compareDocumentPosition(document.querySelector('main'))&Node.DOCUMENT_POSITION_FOLLOWING),
      navCount:nav?nav.querySelectorAll('a[href]').length:0,
      navShell:!!shell,
      rail:visible(rail),
      railInsideShell:!!(rail&&rail.parentElement===shell),
      translatorRequired:!!document.querySelector('script[src*="cn-translate-baidu-v1.js"]'),
      translator:visible(translator),
      footer:visible(footer),
      footerPosition:footer?getComputedStyle(footer).position:null,
      footerBottom:fr?fr.bottom:null,
      dockCount:document.querySelectorAll('#floatDock').length,
      actions:dock?[...dock.querySelectorAll('[data-action]')].map(b=>b.getAttribute('data-action')):[],
      filingText:footer?(footer.innerText||''):''
    };
  });
}

for(const [name,url] of pages){
  for(const [device,viewport] of viewports){
    test('CN '+name+' '+device+' paints header, translation, rail and footer before JavaScript',async({browser})=>{
      const context=await browser.newContext({viewport,javaScriptEnabled:false});
      try{
        const page=await context.newPage();
        const response=await page.goto(base+url,{waitUntil:'load'});
        expect(response&&response.ok(),name+' page response').toBeTruthy();
        const state=await shellState(page);
        expect(state.header,'static CN header is visible').toBe(true);
        expect(state.navBeforeMain,'public header precedes正文').toBe(true);
        expect(state.navCount).toBe(9);
        expect(state.navShell).toBe(true);
        expect(state.rail,'horizontal navigation rail is visible before JS').toBe(true);
        expect(state.railInsideShell).toBe(true);
        if(state.translatorRequired)expect(state.translator,'translation control is visible before JS').toBe(true);
        expect(state.footer,'public footer is visible before JS').toBe(true);
        expect(state.footerPosition).toBe('fixed');
        expect(Math.abs(state.footerBottom-viewport.height)).toBeLessThanOrEqual(2);
        expect(state.dockCount).toBe(1);
        expect(state.actions).toEqual(['top','previous','search','current']);
        expect(state.filingText).toContain('湘ICP备2026041143号-1');
        expect(state.filingText).toContain('湘公网安备43020002000443号');
      }finally{await context.close();}
    });

    test('CN '+name+' '+device+' hydrates public controls in place',async({browser})=>{
      const context=await browser.newContext({viewport});
      try{
        await context.addInitScript(()=>{
          const probe=window.__qilyCnStaticShellProbe={header:null,nav:null,rail:null,translator:null,footer:null,dock:null};
          function capture(){
            const header=document.querySelector('header.site-header');
            const nav=header&&header.querySelector('nav.nav');
            const rail=header&&header.querySelector('.qily-primary-nav-scroll-rail');
            const translator=header&&header.querySelector('#qilyCnTranslateV3');
            const footer=document.querySelector('footer.footer');
            const dock=footer&&footer.querySelector('#floatDock');
            if(header&&!probe.header)probe.header=header;
            if(nav&&!probe.nav)probe.nav=nav;
            if(rail&&!probe.rail)probe.rail=rail;
            if(translator&&!probe.translator)probe.translator=translator;
            if(footer&&!probe.footer)probe.footer=footer;
            if(dock&&!probe.dock)probe.dock=dock;
          }
          new MutationObserver(capture).observe(document,{childList:true,subtree:true});
          document.addEventListener('DOMContentLoaded',capture,{once:true});
        });
        const page=await context.newPage();
        const response=await page.goto(base+url,{waitUntil:'domcontentloaded'});
        expect(response&&response.ok()).toBeTruthy();
        await page.waitForFunction(()=>window.__qilyCnNavRailV7===true||document.querySelector('nav.nav')?.dataset.qilyCnNavRail==='v7',{timeout:12000}).catch(()=>{});
        await page.waitForFunction(()=>window.__qilyCnTranslateV3===true||!document.querySelector('script[src*="cn-translate-baidu-v1.js"]'),{timeout:12000});
        const identity=await page.evaluate(()=>{
          const p=window.__qilyCnStaticShellProbe;
          return {
            header:p.header===document.querySelector('header.site-header'),
            nav:p.nav===document.querySelector('header.site-header nav.nav'),
            rail:p.rail===document.querySelector('header.site-header .qily-primary-nav-scroll-rail'),
            translator:p.translator? p.translator===document.querySelector('#qilyCnTranslateV3'):!document.querySelector('script[src*="cn-translate-baidu-v1.js"]'),
            footer:p.footer===document.querySelector('footer.footer'),
            dock:p.dock===document.querySelector('footer.footer #floatDock'),
            duplicates:document.querySelectorAll('#floatDock').length
          };
        });
        expect(identity).toEqual({header:true,nav:true,rail:true,translator:true,footer:true,dock:true,duplicates:1});
        const state=await shellState(page);
        expect(state.actions).toEqual(['top','previous','search','current']);
        expect(state.footerPosition).toBe('fixed');
      }finally{await context.close();}
    });
  }
}
