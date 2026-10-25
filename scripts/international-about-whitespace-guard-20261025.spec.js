const {test,expect}=require('@playwright/test');
const base=process.env.QILY_VISUAL_BASE||'http://127.0.0.1:4173';
const predeployLive=process.env.QILY_ABOUT_PREDEPLOY_LIVE==='1'&&/^https:/.test(base);
test('International About: 15px mobile gutters, preserved desktop axis and vertical rhythm',async({page})=>{
 test.setTimeout(120000);
 for(const width of [390,430,620,820,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/about/',{waitUntil:'domcontentloaded'});
  const frame=await page.evaluate(()=>{
   const main=document.querySelector('main#main');
   const hero=main?.querySelector(':scope>section.page-hero>.content');
   const body=main?.querySelector(':scope>section.section>.content.article-shell');
   const section=main?.querySelector(':scope>section.section');
   const h=body?.querySelector('.article-body>h2');
   const heroSection=main?.querySelector(':scope>section.page-hero');
   if(!hero||!body||!h||!section||!heroSection)throw Error('International About hierarchy changed');
   const rect=e=>{const a=e.getBoundingClientRect();return {left:a.left,right:a.right,width:a.width,top:a.top,bottom:a.bottom}};
   return {hero:rect(hero),article:rect(body),heading:rect(h),heroSection:rect(heroSection),
     section:rect(section),documentWidth:document.documentElement.scrollWidth,
     stylesheet:document.querySelector('link[href*="/about/about-intl-parity-v1.css"]')?.getAttribute('href')||''};
  });
  console.log('INTL_ABOUT_GUTTER_GEOMETRY',JSON.stringify({width,predeployLive,...frame}));
  expect(frame.documentWidth,'no horizontal page overflow '+width).toBeLessThanOrEqual(width+1);
  expect(Math.abs(frame.hero.left-frame.article.left),'Hero/article common left axis '+width).toBeLessThanOrEqual(1);
  expect(Math.abs(frame.hero.right-frame.article.right),'Hero/article common right axis '+width).toBeLessThanOrEqual(1);
  expect(Math.abs(frame.heading.top-frame.heroSection.bottom-52),'preserve 52px Hero-to-heading vertical whitespace '+width).toBeLessThanOrEqual(2);
  const deployedV3=frame.stylesheet.includes('20261025-dual-site-mobile-axis-15px-v3');
  const deployedV2=frame.stylesheet.includes('20261025-mobile-double-gutter-closure-v2');
  const expectedLeft=width<=620?(predeployLive&&!deployedV3?(deployedV2?18:Math.min(33,Math.round(width*0.077))):15)
   :(width===820?42.59375:156);
  expect(Math.abs(frame.hero.left-expectedLeft),'left inset '+width).toBeLessThanOrEqual(1.8);
  expect(Math.abs(width-frame.hero.right-expectedLeft),'right inset '+width).toBeLessThanOrEqual(1.8);
  if(!predeployLive)expect(frame.stylesheet,'live/source cache version '+width).toContain('20261025-dual-site-mobile-axis-15px-v3');
 }
});
