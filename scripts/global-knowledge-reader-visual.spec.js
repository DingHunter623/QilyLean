const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const base=process.env.QILY_GK_BASE||'http://127.0.0.1:4173';
const out=path.join(process.cwd(),'global-knowledge-visual-artifacts');
fs.mkdirSync(out,{recursive:true});

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

test('Global Knowledge dock opens the shared international site search',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  const response=await page.goto(base+'/global-knowledge/',{waitUntil:'networkidle',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const button=page.locator('#floatDock button[data-action="search"]');
  await expect(button).toBeVisible();
  await button.click();
  const panel=page.locator('.qily-search-panel');
  await expect(panel).toBeVisible({timeout:10000});
  await expect(panel.locator('#qilySearchTitle')).toHaveText('本站搜索');
  await expect(panel.locator('.qily-search-lead')).toContainText('搜索全站网页');
  const input=panel.locator('.qily-search-input');
  await input.fill('VSM');
  await panel.locator('.qily-search-submit').click();
  await expect(panel.locator('.qily-search-result').first()).toBeVisible({timeout:10000});
  await page.screenshot({path:path.join(out,'global-knowledge-shared-site-search.png'),fullPage:false});
});

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
