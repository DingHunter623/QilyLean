const {test,expect}=require('@playwright/test');

const intBase=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';

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

test('China-site current Resources module is visible and footer type matches 20px nav',async({page})=>{
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
  expect(s.footerFont).toBeCloseTo(s.navFont,1);
  expect(s.recordFont).toBeCloseTo(s.navFont,1);
});

test('China-site mobile footer preserves the same 20px navigation font',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto(cnBase+'/knowledge/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'header.site-header nav.nav','header.site-header nav.nav a[href="/knowledge/"]','.footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.current).toBe('page');
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(20,1);
  expect(s.recordFont).toBeCloseTo(20,1);
  expect(s.footerLeft).toBeGreaterThanOrEqual(0);
  expect(s.footerRight).toBeLessThanOrEqual(s.viewport+1);
});

test('international CN-bridge current module is visible and footer type follows bridge nav',async({page})=>{
  await page.setViewportSize({width:1180,height:850});
  const response=await page.goto(intBase+'/links/cn-public/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'.cn-bridge-nav','.cn-bridge-nav a[aria-current="page"]','.cn-bridge-footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.label).toContain('资源协同');
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(20,1);
  expect(s.footerFont).toBeCloseTo(s.navFont,1);
});

test('international CN-bridge mobile footer follows the 18px bridge nav scale',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto(intBase+'/links/cn-public/',{waitUntil:'domcontentloaded',timeout:30000});
  expect(response&&response.ok()).toBeTruthy();
  const s=await navState(page,'.cn-bridge-nav','.cn-bridge-nav a[aria-current="page"]','.cn-bridge-footer-actions>button');
  expect(s).not.toBeNull();
  expect(s.activeLeft).toBeGreaterThanOrEqual(s.navLeft-2);
  expect(s.activeRight).toBeLessThanOrEqual(s.navRight+2);
  expect(s.navFont).toBeCloseTo(18,1);
  expect(s.footerFont).toBeCloseTo(s.navFont,1);
});
