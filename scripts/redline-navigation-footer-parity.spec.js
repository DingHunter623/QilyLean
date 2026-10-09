const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const bridgeRoutes=['/global-knowledge/briefs/','/links/cn-public/','/global-knowledge/','/global-knowledge/terminology/','/global-knowledge/library/','/global-knowledge/view/'];

function chinaFooterRoutes(dir=path.join(process.cwd(),'cn-site')){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())return chinaFooterRoutes(file);
    if(!entry.name.endsWith('.html')||!fs.readFileSync(file,'utf8').includes('class="footer-home"'))return [];
    const relative=path.relative(path.join(process.cwd(),'cn-site'),file).replace(/\\/g,'/');
    return ['/'+relative.replace(/index\.html$/,'')];
  }).sort();
}
const chinaRoutes=chinaFooterRoutes();

test('China desktop footer distributes controls and its site name returns home',async({page})=>{
  await page.setViewportSize({width:1600,height:1000});
  await page.goto(cnBase+'/knowledge/',{waitUntil:'domcontentloaded'});
  const home=page.locator('.footer-home');
  await expect(home).toBeVisible();
  await expect(home).toHaveAttribute('href','/');
  const geometry=await page.locator('.footer-inner').evaluate(el=>{
    const shell=el.getBoundingClientRect();
    const items=[...el.querySelectorAll('a,button')].map(e=>e.getBoundingClientRect());
    const actionButtons=[...el.querySelectorAll('.footer-actions>button')].map(e=>e.getBoundingClientRect());
    return {left:items[0].left-shell.left,right:shell.right-items.at(-1).right,gaps:items.slice(1).map((r,i)=>r.left-items[i].right),actionWidths:actionButtons.map(r=>r.width)};
  });
  expect(Math.abs(geometry.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.right)).toBeLessThanOrEqual(1);
  expect(Math.max(...geometry.gaps)-Math.min(...geometry.gaps)).toBeLessThanOrEqual(1);
  expect(Math.min(...geometry.gaps)).toBeGreaterThan(8);
  expect(geometry.actionWidths).toHaveLength(2);
  expect(Math.abs(geometry.actionWidths[0]-geometry.actionWidths[1])).toBeLessThanOrEqual(1);
  await home.click();
  await expect(page).toHaveURL(cnBase+'/');
});

for(const route of bridgeRoutes){
  test(`reference footer is visible, left aligned, top/share-only and filing-free: ${route}`,async({page})=>{
    await page.setViewportSize({width:1600,height:1000});
    await page.goto(intBase+route,{waitUntil:'domcontentloaded'});
    const footer=page.locator('.cn-bridge-footer');
    await expect(footer).toBeVisible();
    await expect(page.locator('#floatDock')).toHaveCount(0);
    const home=page.locator('header a[aria-label="返回国际站"]');
    await expect(home).toHaveCount(1);
    await expect(home).toHaveAttribute('href','https://qilylean.com/');
    await expect(home).toHaveAttribute('title','返回国际站');
    for(const action of ['top','share']){
      await expect(footer.locator(`[data-action="${action}"]`)).toHaveCSS('color','rgb(255, 227, 155)');
      await expect(footer.locator(`[data-action="${action}"]`)).toHaveCSS('border-top-color','rgba(255, 227, 155, 0.52)');
    }
    // Visibility alone passes when another fixed Dock covers the correct footer.
    await footer.locator('[data-action="top"]').click({trial:true});
    await footer.locator('[data-action="share"]').click({trial:true});
    await expect(footer.locator('button')).toHaveText(['顶部','分享当前']);
    await expect(footer.locator('a')).toHaveCount(0);
    await expect(footer.locator('.cn-bridge-footer-brand,.cn-bridge-footer-records')).toHaveCount(0);
    await expect(footer).not.toContainText(/湘ICP备|湘公网安备/);
    const g=await footer.evaluate(el=>{
      const inner=el.querySelector('.cn-bridge-footer-inner').getBoundingClientRect();
      const buttons=[...el.querySelectorAll('button')].map(e=>e.getBoundingClientRect());
      return {left:buttons[0].left-inner.left,blank:inner.right-buttons[1].right,gap:buttons[1].left-buttons[0].right,buttonWidths:buttons.map(r=>r.width),height:el.getBoundingClientRect().height};
    });
    expect(Math.abs(g.left)).toBeLessThanOrEqual(1);
    expect(g.blank).toBeGreaterThan(500);
    expect(g.gap).toBeCloseTo(12,0);
    expect(g.buttonWidths).toHaveLength(2);
    expect(Math.abs(g.buttonWidths[0]-g.buttonWidths[1])).toBeLessThanOrEqual(1);
    expect(g.height).toBeGreaterThanOrEqual(55);
    await page.screenshot({path:require('path').join('test-results',route.includes('briefs')?'briefs-footer-desktop.png':'resources-footer-desktop.png')});
  });
}



for(const viewport of [{width:360,height:640},{width:390,height:664},{width:412,height:780}]){
  test(`resource final CTA clears the fixed footer on mobile ${viewport.width}`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto(intBase+'/links/cn-public/',{waitUntil:'load'});
    const footer=page.locator('.cn-bridge-footer');
    // Simulate an extra bottom safe area; the reservation must follow the real footer height.
    await footer.evaluate(el=>el.style.setProperty('padding-bottom','34px','important'));
    await expect.poll(()=>footer.evaluate(el=>parseFloat(getComputedStyle(document.body).paddingBottom)-el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(0);
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const last=page.locator('.actions .button').last();
    const gap=await last.evaluate(el=>document.querySelector('.cn-bridge-footer').getBoundingClientRect().top-el.getBoundingClientRect().bottom);
    expect(gap).toBeGreaterThanOrEqual(8);
    await expect(last).toHaveAttribute('href','https://qilylean.com/global-knowledge/');
    await page.route('https://qilylean.com/global-knowledge/',route=>route.fulfill({status:200,contentType:'text/html',body:'Global Knowledge destination'}));
    await last.click();
    await expect(page).toHaveURL('https://qilylean.com/global-knowledge/');
  });
}

test('resource collaboration CTAs inherit shared global VI and have visible feedback',async({page})=>{
  await page.setViewportSize({width:1600,height:1000});
  const response=await page.goto(intBase+'/links/cn-public/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const primary=page.locator('.actions .button.primary');
  const secondary=page.locator('.actions .button:not(.primary)');
  await expect(primary).toBeVisible();
  await expect(secondary).toBeVisible();
  const before=await page.evaluate(()=>{
    const p=getComputedStyle(document.querySelector('.actions .button.primary'));
    const s=getComputedStyle(document.querySelector('.actions .button:not(.primary)'));
    return {primaryBg:p.backgroundColor,secondaryBg:s.backgroundColor,primaryRadius:parseFloat(p.borderRadius)||0,secondaryRadius:parseFloat(s.borderRadius)||0};
  });
  expect(Math.abs(before.primaryRadius-before.secondaryRadius)).toBeLessThanOrEqual(0.5);
  expect(before.primaryRadius).toBeLessThanOrEqual(12.5);
  expect(before.secondaryRadius).toBeLessThanOrEqual(12.5);
  await primary.hover();
  await page.waitForTimeout(220);
  const primaryHover=await primary.evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(primaryHover).not.toBe(before.primaryBg);
  await secondary.hover();
  await page.waitForTimeout(220);
  const secondaryHover=await secondary.evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(secondaryHover).not.toBe(before.secondaryBg);
  expect(primaryHover).not.toBe(secondaryHover);
});

async function navState(page,navSelector,activeSelector,footerSelector){
  await page.waitForSelector(navSelector,{state:'visible'});
  await page.waitForSelector(activeSelector,{state:'visible'});
  await page.waitForTimeout(1100);
  return page.evaluate(({navSelector,activeSelector,footerSelector})=>{
    const nav=document.querySelector(navSelector);
    const active=document.querySelector(activeSelector);
    const footer=document.querySelector(footerSelector);
    if(!nav||!active||!footer)return null;
    const nr=nav.getBoundingClientRect(),ar=active.getBoundingClientRect(),fr=footer.getBoundingClientRect();
    return {
      label:(active.textContent||'').trim(),
      current:active.getAttribute('aria-current'),
      navFont:(()=>{const base=parseFloat(getComputedStyle(active).fontSize)||0;const pseudo=parseFloat(getComputedStyle(active,'::before').fontSize)||0;return Math.max(base,pseudo);})(),
      footerFont:parseFloat(getComputedStyle(footer).fontSize)||0,
      recordFont:(()=>{const r=document.querySelector('.footer-records>a');return r?parseFloat(getComputedStyle(r).fontSize)||0:0;})(),
      activeLeft:ar.left,activeRight:ar.right,navLeft:nr.left,navRight:nr.right,
      footerLeft:fr.left,footerRight:fr.right,viewport:document.documentElement.clientWidth,
      scrollLeft:nav.scrollLeft,overflow:nav.scrollWidth-nav.clientWidth
    };
  },{navSelector,activeSelector,footerSelector});
}

test('China-site Resources retains both filings with the shared footer visual',async({page})=>{
  await page.setViewportSize({width:1180,height:850});
  const response=await page.goto(cnBase+'/resources/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'header.site-header nav.nav','header.site-header nav.nav a[href="/resources/"]','.footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.current).toBe('page');
  expect(s.label).toContain('资源协同');
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(18,1);
  expect(s.recordFont).toBeCloseTo(18,1);
});

test('China-site mobile footer keeps canonical readable sizing without overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto(cnBase+'/knowledge/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'header.site-header nav.nav','header.site-header nav.nav a[href="/knowledge/"]','.footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.current).toBe('page');
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(17,1);
  expect(s.recordFont).toBeCloseTo(17,1);
  expect(s.footerLeft).toBeGreaterThanOrEqual(0);
  expect(s.footerRight).toBeLessThanOrEqual(s.viewport+1);
});

test('international CN-bridge current module is visible and footer uses shared 18px sizing',async({page})=>{
  await page.setViewportSize({width:1180,height:850});
  const response=await page.goto(intBase+'/links/cn-public/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'.cn-bridge-nav','.cn-bridge-nav a[aria-current="page"]','.cn-bridge-footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.label).toContain('资源协同');
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(18,1);
});

test('international CN-bridge mobile footer uses shared 17px sizing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto(intBase+'/links/cn-public/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'.cn-bridge-nav','.cn-bridge-nav a[aria-current="page"]','.cn-bridge-footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(17,1);
});

for(const width of [320,360,390,1041,1100,1600]){
  test(`China bridge footer retains readable filings and clear content at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:844});
    for(const route of ['/briefs/','/resources/']){
      await page.goto(cnBase+route,{waitUntil:'domcontentloaded'});
      const footer=page.locator('.footer');
      await expect(footer.locator('.footer-records>a')).toHaveCount(2);
      await expect(footer).toContainText('湘ICP备2026041143号-1');
      await expect(footer).toContainText('湘公网安备43020002000443号');
      await footer.evaluate(el=>el.style.setProperty('padding-bottom','34px','important'));
      await expect.poll(()=>footer.evaluate(el=>parseFloat(getComputedStyle(document.body).paddingBottom)-el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(0);
      const g=await footer.evaluate(el=>{
        const controls=[...el.querySelectorAll('a,button')].map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,overflow:e.scrollWidth-e.clientWidth};});
        const buttons=[...el.querySelectorAll('button')].map(e=>e.getBoundingClientRect());
        return{viewport:innerWidth,controls,buttons:buttons.map(r=>r.width),buttonTops:buttons.map(r=>r.top),homeTop:el.querySelector('.footer-home').getBoundingClientRect().top};
      });
      for(const c of g.controls){
        expect(c.left).toBeGreaterThanOrEqual(0);
        expect(c.right).toBeLessThanOrEqual(g.viewport);
        expect(c.overflow).toBeLessThanOrEqual(1);
      }
      expect(g.buttons).toHaveLength(2);
      if(width<=760){
        // #576 keeps all three controls on the first mobile row. Intrinsic
        // widths fit their 17px labels, so 分享当前 is two glyphs wider than 顶部.
        expect(g.buttons[1]-g.buttons[0]).toBeCloseTo(34,0);
        for(const top of g.buttonTops)expect(Math.abs(top-g.homeTop),'mobile controls share a row, including the 1px hover lift').toBeLessThanOrEqual(1.5);
      }else{
        expect(g.buttons[0]).toBeCloseTo(g.buttons[1],0);
      }
      await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
      const link=page.locator('main a[data-qily-external="international"]');
      await link.click({trial:true});
      const clearance=await link.evaluate(el=>document.querySelector('.footer').getBoundingClientRect().top-el.getBoundingClientRect().bottom);
      expect(clearance).toBeGreaterThanOrEqual(8);
      await footer.locator('[data-qily-footer-action="top"]').click();
      await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    }
  });
}

for(const width of [320,390,412,1180,1600]){
  test(`China public footer typography matches international actions across ${width===390||width===1600?'all public pages':'responsive entries'} at ${width}px`,async({page,context})=>{
    test.setTimeout(180000);
    await page.setViewportSize({width,height:900});
    await page.goto(intBase+'/',{waitUntil:'load'});
    await page.waitForTimeout(1600);
    await page.evaluate(()=>document.fonts.ready);
    const reference=page.locator('#floatDock button').first();
    await expect(reference).toBeVisible();
    const typography=await reference.evaluate(el=>{const s=getComputedStyle(el);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing==='normal'?'0px':s.letterSpacing,smoothing:s.getPropertyValue('-webkit-font-smoothing'),rendering:s.textRendering};});
    const allPages=width===390||width===1600;
    expect(chinaRoutes.length).toBeGreaterThanOrEqual(24);
    const targets=[
      ...(allPages?chinaRoutes:['/resources/']).map(route=>({base:cnBase,route,shell:'.footer',home:'.footer-home',controls:'.footer-home,.footer-actions>button,.footer-records>a,.footer-records>a>span',count:6})),
      ...(allPages?bridgeRoutes:['/links/cn-public/']).map(route=>({base:intBase,route,shell:'.cn-bridge-footer',home:null,controls:'.cn-bridge-footer-actions>button',count:2}))
    ];
    const publicPage=await context.newPage();
    await publicPage.setViewportSize({width,height:900});
    for(const target of targets){
      const label=target.base+target.route;
      const response=await publicPage.goto(label,{waitUntil:'load'});
      expect(response&&response.ok(),label+' must load').toBeTruthy();
      await publicPage.waitForTimeout(1600);
      await publicPage.evaluate(()=>document.fonts.ready);
      const footer=publicPage.locator(target.shell);
      await expect(footer,label+' shared footer').toBeVisible();
      await expect(publicPage.locator('link[href="/site-public-footer-type-v1.css?v=20261005-public-footer-v3"]'),label+' must request the shared versioned type authority').toHaveCount(1);
      const controls=footer.locator(target.controls);
      await expect(controls,label+' visible footer controls').toHaveCount(target.count);
      const actual=await controls.evaluateAll(els=>els.map(el=>{const s=getComputedStyle(el);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing==='normal'?'0px':s.letterSpacing,smoothing:s.getPropertyValue('-webkit-font-smoothing'),rendering:s.textRendering};}));
      for(const item of actual)expect(item,label+' public footer type').toEqual(typography);
      if(target.home){
        const home=footer.locator(target.home);
        await expect(home,label+' normal site label').toHaveCSS('text-decoration-line','none');
        await home.hover();
        await expect(home,label+' hovered site label').toHaveCSS('text-decoration-line','none');
        await home.focus();
        await expect(home,label+' focused site label').toHaveCSS('text-decoration-line','none');
      }else{
        await expect(footer.locator('.cn-bridge-footer-brand,.cn-bridge-footer-records')).toHaveCount(0);
        await expect(footer.locator('.cn-bridge-footer-actions>button[data-action="top"]')).toHaveCount(1);
        await expect(footer.locator('.cn-bridge-footer-actions>button[data-action="share"]')).toHaveCount(1);
      }
      if(target.shell==='.footer'){
        await expect(footer.locator('.footer-records>a'),label+' retains both filing links').toHaveCount(2);
        for(const record of await footer.locator('.footer-records>a').all())await expect(record,label+' filing link retains its underline').toHaveCSS('text-decoration-line','underline');
      }
    }
    await publicPage.close();
  });
}


test('International bridge logo and filing-free footer on China-origin reference routes',async({page})=>{
  for(const route of ['/links/cn-public/','/global-knowledge/briefs/']){
    await page.goto(intBase+route,{waitUntil:'domcontentloaded'});
    const logo=page.locator('.cn-bridge-brand');
    await expect(logo).toHaveAttribute('href','https://qilylean.com/');
    await expect(logo).toHaveAttribute('title','返回国际站');
    await expect(logo).toHaveAttribute('aria-label','返回国际站');
    const footer=page.locator('.cn-bridge-footer');
    await expect(footer.locator('.cn-bridge-footer-brand,.cn-bridge-footer-records')).toHaveCount(0);
    await expect(footer.locator('button[data-action]')).toHaveCount(2);
  }
});
