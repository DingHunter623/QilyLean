const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_GK_BASE||'http://127.0.0.1:4173';
const out=path.join(process.cwd(),'global-knowledge-visual-artifacts');
fs.mkdirSync(out,{recursive:true});

test('Sep 28 China-bridge reader preserves the governed curated-brief VI',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/briefs/?date=2026-09-28',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();

  const title=page.locator('#readerHead h1');
  await expect(title).toBeVisible();
  const titleSize=await title.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(titleSize).toBeGreaterThanOrEqual(30);
  expect(titleSize).toBeLessThanOrEqual(36.5);

  await expect(page.locator('body')).toHaveClass(/plan-closure-brief/);
  await expect(page.locator('link[data-qily-imported-brief-css="2026-09-28"]')).toHaveCount(1);

  const article=page.locator('#article');
  await expect(article).toHaveClass(/knowledge-brief-article/);
  const shell=await article.evaluate(el=>({
    border:parseFloat(getComputedStyle(el).borderTopWidth),
    padding:parseFloat(getComputedStyle(el).paddingTop)
  }));
  expect(shell.border).toBe(0);
  expect(shell.padding).toBe(0);

  const result=article.locator('.net-demand-visual > .plan-result');
  await expect(result).toBeVisible();
  const resultVi=await result.evaluate(el=>{
    const label=el.querySelector('small');
    const value=el.querySelector('strong');
    const cs=n=>getComputedStyle(n);
    return {
      bg:cs(el).backgroundColor,
      label:cs(label).color,
      labelFill:cs(label).webkitTextFillColor,
      value:cs(value).color,
      valueFill:cs(value).webkitTextFillColor
    };
  });
  expect(resultVi.bg).toBe('rgb(15, 75, 90)');
  expect(resultVi.label).toBe('rgb(255, 224, 164)');
  expect(resultVi.labelFill).toBe('rgb(255, 224, 164)');
  expect(resultVi.value).toBe('rgb(255, 255, 255)');
  expect(resultVi.valueFill).toBe('rgb(255, 255, 255)');

  const formula=article.locator('.formula-grid').first();
  await expect(formula).toBeVisible();
  const formulaCols=await formula.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  expect(formulaCols).toBe(2);

  const constraints=article.locator('.constraint-grid');
  await expect(constraints).toBeVisible();
  const rows=await constraints.evaluate(el=>{
    const ys=[...el.children].map(card=>Math.round(card.getBoundingClientRect().top));
    return new Set(ys).size;
  });
  expect(rows).toBe(1);

  await result.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'brief-2026-09-28-cn-bridge-vi.png'),fullPage:false});
});

test('Sep 20 brief SVG is normalized to readable QilyLean VI',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/briefs/?date=2026-09-20',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const svg=page.locator('#article svg[data-qily-imported-visual="normalized-v1"]').first();
  await expect(svg).toBeVisible();
  const visual=await svg.evaluate(el=>{
    const firstRect=el.querySelector('.svg-flow rect');
    const flow=el.querySelector('.vi-flow-arrow');
    const rail=el.querySelector('.vi-feedback-return');
    const arrow=el.querySelector('.vi-feedback-arrow');
    const label=el.querySelector('.feedback-label-bg');
    const cs=n=>n?getComputedStyle(n):null;
    return {
      firstRect:firstRect?{fill:cs(firstRect).fill,stroke:cs(firstRect).stroke}:null,
      flow:flow?{fill:cs(flow).fill,stroke:cs(flow).stroke}:null,
      rail:rail?{fill:cs(rail).fill,stroke:cs(rail).stroke,width:cs(rail).strokeWidth}:null,
      arrow:arrow?{fill:cs(arrow).fill}:null,
      label:label?{fill:cs(label).fill,stroke:cs(label).stroke}:null
    };
  });
  expect(visual.firstRect).toBeTruthy();
  expect(visual.firstRect.fill).not.toBe('rgb(0, 0, 0)');
  expect(visual.firstRect.fill).toBe('rgb(241, 248, 246)');
  expect(visual.flow.fill).toBe('rgb(15, 75, 90)');
  expect(visual.rail.fill).toBe('none');
  expect(visual.rail.stroke).toBe('rgb(202, 161, 95)');
  expect(parseFloat(visual.rail.width)).toBeGreaterThanOrEqual(6);
  expect(visual.arrow.fill).toBe('rgb(202, 161, 95)');
  expect(visual.label.fill).toBe('rgb(255, 250, 240)');
  await svg.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'brief-2026-09-20-normalized.png'),fullPage:false});
});

test('Sep 23 desktop reader uses 4 plus 3 5M2E matrix with no clipping',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/briefs/?date=2026-09-23',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();

  const article=page.locator('#article');
  await expect(article).toBeVisible();

  const pairedDesktop=article.locator('figure[data-qily-mobile-pair="true"] > svg[data-qily-imported-visual="normalized-v1"]');
  await expect(pairedDesktop).toHaveCount(4);
  for(let i=0;i<4;i+=1) await expect(pairedDesktop.nth(i)).toBeHidden();

  const cause=article.locator('[data-mobile-visual="causeTitle"]');
  await expect(cause).toBeVisible();
  const factors=cause.locator(':scope > div:nth-child(2) > div');
  await expect(factors).toHaveCount(7);

  const layout=await cause.evaluate(el=>{
    const grid=el.querySelector(':scope > div:nth-child(2)');
    const cards=[...grid.children].filter(n=>n.tagName==='DIV');
    const rows=new Map();
    cards.forEach((card,index)=>{
      const r=card.getBoundingClientRect();
      const y=Math.round(r.top);
      if(!rows.has(y))rows.set(y,[]);
      rows.get(y).push(index+1);
    });
    const overflow=cards.map(card=>({
      card:card.scrollWidth-card.clientWidth,
      title:(()=>{const b=card.querySelector('b');return b?b.scrollWidth-b.clientWidth:0})()
    }));
    const r=el.getBoundingClientRect();
    const article=el.closest('#article');
    return {
      rows:[...rows.values()],
      overflow,
      width:r.width,
      articleWidth:article?article.getBoundingClientRect().width:0,
      selfOverflow:el.scrollWidth-el.clientWidth
    };
  });

  expect(layout.rows).toEqual([[1,2,3,4],[5,6,7]]);
  expect(layout.width).toBeLessThanOrEqual(layout.articleWidth+1);
  expect(layout.selfOverflow).toBeLessThanOrEqual(1);
  for(const item of layout.overflow){
    expect(item.card).toBeLessThanOrEqual(1);
    expect(item.title).toBeLessThanOrEqual(1);
  }

  for(const id of ['tripodTitle','responseTitle','closureTitle']){
    await expect(article.locator('[data-mobile-visual="'+id+'"]')).toBeVisible();
  }

  await cause.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'brief-2026-09-23-desktop-reader-vi.png'),fullPage:false});
});

test('Sep 23 brief uses mobile-native VI instead of compressed desktop SVGs',async({page})=>{
  await page.setViewportSize({width:412,height:915});
  const response=await page.goto(base+'/global-knowledge/briefs/?date=2026-09-23',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();

  const article=page.locator('#article');
  await expect(article).toBeVisible();
  const mobileVisuals=article.locator('[data-mobile-visual]');
  await expect(mobileVisuals).toHaveCount(4);

  const tripod=article.locator('[data-mobile-visual="tripodTitle"]');
  await expect(tripod).toBeVisible();
  const roleCards=tripod.locator(':scope > div:nth-child(2) > div');
  await expect(roleCards).toHaveCount(3);

  const pairedDesktop=article.locator('figure[data-qily-mobile-pair="true"] > svg[data-qily-imported-visual="normalized-v1"]');
  await expect(pairedDesktop).toHaveCount(4);
  for(let i=0;i<4;i+=1){
    await expect(pairedDesktop.nth(i)).toBeHidden();
  }

  const visual=await tripod.evaluate(el=>{
    const cs=n=>getComputedStyle(n);
    const header=el.querySelector(':scope > div:first-child');
    const roles=el.querySelectorAll(':scope > div:nth-child(2) > div');
    const prodBadge=roles[0]&&roles[0].querySelector('b');
    const eng=roles[1];
    const rect=el.getBoundingClientRect();
    const article=el.closest('#article');
    return {
      display:cs(el).display,
      width:rect.width,
      articleWidth:article?article.getBoundingClientRect().width:0,
      overflow:el.scrollWidth-el.clientWidth,
      headerBg:header?cs(header).backgroundColor:'',
      prodBadgeBg:prodBadge?cs(prodBadge).backgroundColor:'',
      prodBadgeColor:prodBadge?cs(prodBadge).color:'',
      engBg:eng?cs(eng).backgroundColor:'',
      roleFont:roles[0]?parseFloat(cs(roles[0].querySelector('strong')).fontSize):0
    };
  });
  expect(visual.display).not.toBe('none');
  expect(visual.width).toBeLessThanOrEqual(visual.articleWidth+1);
  expect(visual.overflow).toBeLessThanOrEqual(1);
  expect(visual.headerBg).toBe('rgb(15, 75, 90)');
  expect(visual.prodBadgeBg).toBe('rgb(15, 75, 90)');
  expect(visual.prodBadgeColor).toBe('rgb(255, 255, 255)');
  expect(visual.engBg).toBe('rgb(255, 249, 233)');
  expect(visual.roleFont).toBeGreaterThanOrEqual(16);

  for(const id of ['causeTitle','responseTitle','closureTitle']){
    await expect(article.locator('[data-mobile-visual="'+id+'"]')).toBeVisible();
  }

  await tripod.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'brief-2026-09-23-mobile-vi.png'),fullPage:false});
});

test('Lean knowledge reader preserves visible Weibo source entry',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/view/?src=%2Fqilylean%2Flean-knowledge.html%23lean-01',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const link=page.locator('#content a[data-qily-reader-source="weibo"]').first();
  await expect(link).toBeVisible();
  await expect(link).toContainText('查看微博原文');
  const href=await link.getAttribute('href');
  expect(href).toMatch(/^https:\/\/weibo\.com\//);
  await expect(link).toHaveAttribute('target','_blank');
  await expect(link).toHaveAttribute('rel',/noopener/);
  await link.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'weibo-source-entry.png'),fullPage:false});
});

for(const route of ['/global-knowledge/','/global-knowledge/terminology/','/global-knowledge/library/','/global-knowledge/view/']){
  test(`Global Knowledge uses the selected-briefs mobile footer: ${route}`,async({page})=>{
    await page.setViewportSize({width:390,height:664});
    await page.addInitScript(()=>{
      Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__footerCopy=text;}}});
      Object.defineProperty(navigator,'share',{value:undefined});
    });
    await page.goto(base+route,{waitUntil:'load'});
    const footer=page.locator('.cn-bridge-footer');
    await expect(footer.locator('a,.cn-bridge-footer-brand')).toHaveCount(0);
    await expect(footer.locator('.cn-bridge-footer-actions')).toHaveAttribute('data-qily-cn-bridge-footer-contract','top,share,no-filing');
    await expect(footer.locator('button')).toHaveText(['顶部','分享当前']);
    await expect(page.locator('#floatDock,.cn-bridge-footer-records')).toHaveCount(0);
    await expect.poll(()=>footer.evaluate(el=>parseFloat(getComputedStyle(document.body).paddingBottom)-el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(0);
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await footer.locator('[data-action="top"]').click();
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    await footer.locator('[data-action="share"]').click();
    await expect.poll(()=>page.evaluate(()=>window.__footerCopy)).toBe((await page.title())+'\n'+base+route);
  });
}

test('Lean reader shows ten tools and clear Weibo module boundaries',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/view/?src=%2Fqilylean%2Flean-knowledge.html%23lean-tools-feature',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const tools=page.locator('#content #lean-tools-feature > ul').first().locator('li');
  await expect(tools).toHaveCount(10);
  await expect(tools.nth(0)).toContainText('VSM');
  await expect(tools.nth(9)).toContainText('数字化精益');
  const weibo=page.locator('#content article#lean-01');
  await expect(weibo).toBeVisible();
  const badge=weibo.locator(':scope > small');
  await expect(badge).toContainText('微博精选 01');
  const visual=await weibo.evaluate(el=>{
    const badge=el.querySelector(':scope > small');
    const ec=getComputedStyle(el),bc=getComputedStyle(badge);
    return {articleBorderTop:parseFloat(ec.borderTopWidth),articleBg:ec.backgroundColor,badgeFont:parseFloat(bc.fontSize),badgeBg:bc.backgroundColor};
  });
  expect(visual.articleBorderTop).toBeGreaterThanOrEqual(4);
  expect(visual.articleBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(visual.badgeFont).toBeGreaterThanOrEqual(18);
  expect(visual.badgeBg).not.toBe('rgba(0, 0, 0, 0)');
  await weibo.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'lean-weibo-module-boundary.png'),fullPage:false});
});
