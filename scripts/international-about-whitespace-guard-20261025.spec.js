const {test, expect}=require('@playwright/test');
const base=process.env.QILY_VISUAL_BASE||'http://127.0.0.1:4173';
test('International About preserves its approved, intentionally spacious layout',async({page})=>{
 test.setTimeout(120000);
 for(const width of [390,430,820,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/about/',{waitUntil:'domcontentloaded'});
  const frame=await page.evaluate(()=>{
   const main=document.querySelector('main#main');
   const hero=main?.querySelector(':scope>section.page-hero>.content');
   const body=main?.querySelector(':scope>section.section>.content.article-shell');
   const section=main?.querySelector(':scope>section.section');
   const h=body?.querySelector('.article-body>h2');
   const r=e=>{const a=e.getBoundingClientRect();return {left:a.left,right:a.right,width:a.width,top:a.top,bottom:a.bottom}};
   if(!hero||!body||!h||!section)throw new Error('International About content hierarchy changed');
   const a=r(hero),b=r(body),s=r(section),v=r(h),he=r(main.querySelector(':scope>section.page-hero'));
   return {hero:a,body:b,section:s,heading:v,heroSection:he,
    documentWidth:document.documentElement.scrollWidth};
  });
  console.log('INTL_ABOUT_VI_BASELINE',JSON.stringify({width,...frame}));
  expect(frame.documentWidth,'No international horizontal overflow '+width).toBeLessThanOrEqual(width+1);
  expect(frame.hero.left,'Hero original horizontal whitespace '+width).toBeGreaterThanOrEqual(width<=620?20:32);
  expect(frame.body.left,'Article original horizontal whitespace '+width).toBeGreaterThanOrEqual(width<=620?20:32);
  expect(width-frame.hero.right,'Hero right whitespace '+width).toBeGreaterThanOrEqual(width<=620?20:32);
  expect(width-frame.body.right,'Article right whitespace '+width).toBeGreaterThanOrEqual(width<=620?20:32);
  expect(frame.heading.top-frame.heroSection.bottom,'Original transition white space '+width).toBeGreaterThanOrEqual(width<=620?18:24);
  // This verifies the accepted mobile screenshot without imposing China
  // compact spacing or rewriting the international component typography.
  if(width<=620)
   expect(Math.abs(frame.hero.left-frame.body.left),'International mobile Hero/article axes '+width).toBeLessThanOrEqual(5);
 }
});
