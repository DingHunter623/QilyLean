const { test, expect } = require('@playwright/test');

async function visibleNav(page,kind){
  const sel=kind==='int'
    ? 'header.qily-site-header nav.qily-global-nav a[href],header.qily-global-header nav.qily-global-nav a[href]'
    : 'header nav a[href],nav[aria-label="主导航"] a[href],.nav a[href]';
  const all=page.locator(sel);
  const n=await all.count();
  for(let i=0;i<n;i++){
    const a=all.nth(i);
    const ok=await a.evaluate(el=>{
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
      return !!(el.textContent||'').trim() && r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden' && parseFloat(cs.fontSize)>0;
    });
    if(ok)return a;
  }
  throw new Error(kind+' visible nav link missing');
}

async function inspect(page,url,kind){
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  console.log('LIVE_PAGE_'+kind.toUpperCase()+'='+JSON.stringify({status:response&&response.status(),url:page.url(),title:await page.title()}));
  await page.waitForTimeout(1800);
  const link=await visibleNav(page,kind);
  const text=await link.textContent();
  const css=await link.evaluate(el=>{
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    return {
      text:(el.textContent||'').trim(),
      fontFamily:cs.fontFamily,
      fontSize:cs.fontSize,
      fontWeight:cs.fontWeight,
      lineHeight:cs.lineHeight,
      letterSpacing:cs.letterSpacing,
      webkitTextFillColor:cs.webkitTextFillColor,
      textRendering:getComputedStyle(document.body).textRendering,
      webkitFontSmoothing:getComputedStyle(document.body).webkitFontSmoothing||'',
      classHtml:document.documentElement.className,
      classBody:document.body.className,
      rect:{w:r.width,h:r.height}
    };
  });
  const handle=await link.elementHandle();
  const client=await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const obj=await handle.evaluateHandle(el=>el);
  const remote=obj._remoteObject;
  let platformFonts=[];
  try{
    const {node}=await client.send('DOM.describeNode',{objectId:remote.objectId});
    const res=await client.send('CSS.getPlatformFontsForNode',{nodeId:node.nodeId});
    platformFonts=res.fonts||[];
  }catch(e){
    platformFonts=[{error:String(e)}];
  }
  await obj.dispose();
  return {url,text:(text||'').trim(),css,platformFonts};
}

test('live international navigation renders with CN-equivalent typography',async({browser})=>{
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  const intl=await inspect(page,'https://qilylean.com/?fontdiag=20260924-v47','int');
  const runtime=await page.evaluate(()=>({
    navScript:[...document.scripts].map(s=>s.src).find(x=>x.includes('/site-navigation.js'))||'',
    coreScript:[...document.scripts].map(s=>s.src).find(x=>x.includes('/site-navigation-core.js'))||'',
    coreStyle:!!document.getElementById('qilyGlobalHeaderStandard')
  }));
  console.log('LIVE_FONT_INT='+JSON.stringify(intl));
  console.log('LIVE_RUNTIME_INT='+JSON.stringify(runtime));
  expect(runtime.navScript).toContain('20260924-r7-navigation-v48');
  expect(runtime.coreScript).toContain('20260924-primary-nav-render-parity-core-v34');
  expect(runtime.coreStyle).toBeTruthy();
  expect(intl.css.fontSize).toBe('20px');
  expect(intl.css.fontWeight).toBe('900');
  expect(intl.css.lineHeight).toBe('24.4px');
  expect(intl.css.fontFamily).toBe('-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif');
  expect(intl.css.webkitFontSmoothing.toLowerCase()).toBe('auto');
  expect(intl.css.textRendering.toLowerCase()).toBe('auto');

  try{
    const cn=await inspect(page,'https://qilylean.cn/lean/?fontdiag=20260924-v47','cn');
    console.log('LIVE_FONT_CN='+JSON.stringify(cn));
  }catch(e){
    console.log('LIVE_FONT_CN_DIAGNOSTIC_UNAVAILABLE='+String(e));
  }
  await page.close();
});
