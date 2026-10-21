const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');
const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const labels=['回到顶部','上一层级','上一网页','本站搜索','分享当前'];
const actions=['top','back','previous','search','current'];
const bridges=['/global-knowledge/briefs/','/links/cn-public/','/global-knowledge/','/global-knowledge/terminology/','/global-knowledge/library/','/global-knowledge/view/'];
for(const width of [320,390,820,1180,1600]){
 test(`both sites share five readable footer actions at ${width}px`,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height:900});let reference;
  for(const [base,route] of [[intBase,'/'],[intBase,'/about/'],...bridges.map(r=>[intBase,r]),[cnBase,'/'],[cnBase,'/resources/'],[cnBase,'/about/']]){
   await page.goto(base+route,{waitUntil:'load'});await page.waitForFunction(()=>window.__qilyDockV58CaptureBound===true);
   const dock=page.locator('#floatDock');await expect(dock.locator('button')).toHaveText(labels);
   expect(await dock.locator('button').evaluateAll(nodes=>nodes.map(n=>n.dataset.action))).toEqual(actions);
   const g=await dock.evaluate(el=>{const s=getComputedStyle(el);return {width:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth-innerWidth,gap:s.gap,buttons:[...el.querySelectorAll('button')].map(b=>{const s=getComputedStyle(b),r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,width:r.width,height:r.height,overflow:b.scrollWidth-b.clientWidth,font:s.fontSize,weight:s.fontWeight,family:s.fontFamily,radius:s.borderRadius};})};});
   expect(g.overflow,base+route+' horizontal overflow').toBeLessThanOrEqual(1);
   expect(Math.max(...g.buttons.map(b=>b.width))-Math.min(...g.buttons.map(b=>b.width))).toBeLessThanOrEqual(1);
   for(const b of g.buttons){expect(b.left).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(g.width+1);expect(b.height).toBeGreaterThanOrEqual(36);expect(b.overflow).toBeLessThanOrEqual(1);}
   const typography=g.buttons.map(({font,weight,family,radius})=>({font,weight,family,radius}));
   if(!reference)reference={gap:g.gap,typography};else expect({gap:g.gap,typography},base+route+' shared action styling').toEqual(reference);
   if(width<=820){expect(g.buttons[2].top).toBeCloseTo(g.buttons[0].top,1);expect(g.buttons[3].top).toBeGreaterThan(g.buttons[0].top+20);}else expect(g.buttons.every(b=>Math.abs(b.top-g.buttons[0].top)<1),JSON.stringify({base,route,g})).toBeTruthy();
   if(base===cnBase&&width<=620){
    const records=await page.locator('footer .footer-records>a').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const c=range.getBoundingClientRect(),s=getComputedStyle(el),a=getComputedStyle(el,'::after');const spacing=[s.paddingLeft,s.paddingRight,s.borderLeftWidth,s.borderRightWidth,s.columnGap,a.width,a.marginLeft,a.marginRight].reduce((sum,n)=>sum+(parseFloat(n)||0),0);return {width:r.width,content:c.width,spacing,center:r.x+r.width/2,viewport:document.documentElement.clientWidth,overflow:el.scrollWidth-el.clientWidth};}));
    for(const r of records){expect(Math.abs(r.center-r.viewport/2)).toBeLessThanOrEqual(1);expect(Math.abs(r.width-r.content-r.spacing)).toBeLessThanOrEqual(1);expect(r.overflow).toBeLessThanOrEqual(1);}
   }
   if(base===cnBase){await expect(page.locator('footer .footer-records>a')).toHaveCount(2);await expect(page.locator('footer')).toContainText('湘ICP备2026041143号-1');await expect(page.locator('footer')).toContainText('湘公网安备43020002000443号');}else await expect(page.locator('body')).not.toContainText(/湘ICP备|湘公网安备/);
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await dock.locator('[data-action="top"]').click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  }
 });
}
test('China About retains shared contacts, career and map navigation',async({page})=>{
 await page.goto(cnBase+'/about/');await expect(page.locator('.qily-unified-qr-card')).toHaveCount(3);
 expect(await page.locator('a[href^="tel:"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).sort())).toEqual(['tel:13450014003','tel:15168120722','tel:17681788259']);
 await expect(page.locator('.qily-unified-email a')).toHaveAttribute('href','mailto:admin@qilylean.com');await expect(page.locator('.qily-about-career a')).toHaveAttribute('href','/archive/profile/experience/');
 expect(await page.locator('header nav a').allTextContents()).not.toContain('履历主线');
 for(const provider of ['amap','baidu','tencent','google','apple'])expect(await page.locator(`[data-qily-map-provider="${provider}"]`).count()).toBeGreaterThan(0);
});
test('China footer searches locally, shares current URL and follows real history',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__footerCopy=text;}}});});
 await page.goto(cnBase+'/about/');await page.locator('#floatDock [data-action="search"]').click();await expect(page.locator('#qilyCnFooterSearch')).toBeVisible();
 await page.locator('#qilyCnFooterSearchInput').fill('SMED');await expect(page.locator('#qilyCnFooterSearch li a').first()).toBeVisible();await expect(page.locator('#qilyCnFooterSearch [role="status"]')).toContainText('找到');
 for(const href of await page.locator('#qilyCnFooterSearch li a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))expect(href.startsWith('/')).toBeTruthy();
 await page.locator('[data-cn-search-close]').click();await page.locator('#floatDock [data-action="current"]').click();await expect.poll(()=>page.evaluate(()=>window.__footerCopy)).toContain(cnBase+'/about/');
 await page.goto(cnBase+'/knowledge/');await page.locator('#floatDock [data-action="previous"]').click();await expect(page).toHaveURL(cnBase+'/about/');
 await page.goto(cnBase+'/archive/practice/factory-layout/');await page.locator('#floatDock [data-action="back"]').click();await expect(page).toHaveURL(cnBase+'/notes/');
});
test('all China generated pages receive final VI and five-action first paint',async()=>{
 let checked=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html')){const s=fs.readFileSync(f,'utf8');if(!s.includes('/assets/site.css'))continue;checked++;expect(s).toContain('cn-sitewide-visual-parity-v1.css?v=20261021-sitewide-vi-v2');expect(s).toContain('data-qily-footer-contract="top,back,previous,search,current"');}}}walk(path.join(process.cwd(),'cn-site'));expect(checked).toBeGreaterThanOrEqual(28);
});
