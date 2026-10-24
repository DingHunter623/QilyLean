const {test,expect}=require('@playwright/test');
const intl=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const widths=[390,430,820,1440,1920];
function canonicalWidth(width){
 const gutter=width<=620?15:Math.min(56,Math.max(18,width*.022));
 return Math.min(1180,width-2*gutter);
}
async function readNativeFrame(page,route,width){
 await page.setViewportSize({width,height:900});
 await page.goto(cn+route,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(100);
 return page.evaluate(()=>{
  const main=document.querySelector('main:not([data-cn-source-content])');
  if(!main)throw Error('Native CN page expected');
  const hero=main.querySelector(':scope > :is(section.page-hero,section.hero) > :is(.content,.hero-inner)');
  const body=main.querySelector(':scope > section.section > .content.article-shell');
  const section=body?.parentElement;
  if(!hero||!body)throw Error('Native Hero/reading section missing');
  const heading=body.querySelector('.article-body h2');
  const para=body.querySelector('.article-body p');
  const header=document.querySelector('.site-header .header-inner');
  const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,width:r.width,right:r.right,top:r.top,bottom:r.bottom}};
  const font=e=>{if(!e)return null;const s=getComputedStyle(e);return {size:s.fontSize,lineHeight:s.lineHeight,weight:s.fontWeight,color:s.color};};
  return {scrollWidth:document.documentElement.scrollWidth,hero:rect(hero),body:rect(body),
   header:rect(header),section:rect(section),heading:rect(heading),paragraph:rect(para),
   headingFont:font(heading),paragraphFont:font(para)};
 });
}
async function sourceFont(page,width){
 await page.setViewportSize({width,height:900});
 await page.goto(intl+'/about/',{waitUntil:'domcontentloaded'});
 return page.evaluate(()=>{
  const frame=document.querySelector('main>section.section>.content.article-shell');
  if(!frame)throw Error('International About reading frame missing');
  const font=e=>{const s=getComputedStyle(e);return {size:s.fontSize,lineHeight:s.lineHeight,weight:s.fontWeight,color:s.color};};
  return {heading:font(frame.querySelector('.article-body h2')),paragraph:font(frame.querySelector('.article-body p'))};
 });
}
function verifyFrame(frame,route,width){
 const target=canonicalWidth(width);
 expect(frame.scrollWidth,route+' no horizontal overflow '+width).toBeLessThanOrEqual(width+1);
 for(const [name,rect] of [['hero',frame.hero],['body',frame.body]]){
  expect(rect,route+' '+name+' exists '+width).toBeTruthy();
  expect(Math.abs(rect.width-target),route+' '+name+' shared canonical frame '+width).toBeLessThanOrEqual(2);
  expect(Math.abs(rect.x-(width-target)/2),route+' '+name+' centered '+width).toBeLessThanOrEqual(2);
 }
 expect(Math.abs(frame.hero.x-frame.body.x),route+' Hero/reading aligned '+width).toBeLessThanOrEqual(1);
 expect(Math.abs(frame.hero.width-frame.body.width),route+' Hero/reading equal width '+width).toBeLessThanOrEqual(1);
 expect(frame.heading.x,route+' heading left aligned '+width).toBeGreaterThanOrEqual(frame.body.x-1);
 expect(Math.abs(frame.heading.x-frame.body.x),route+' heading axis '+width).toBeLessThanOrEqual(1);
 expect(Math.abs(frame.paragraph.x-frame.body.x),route+' paragraph axis '+width).toBeLessThanOrEqual(1);
 if(width<=900){
  expect(frame.heading.top-frame.section.top,route+' no excess blank band after Hero '+width).toBeLessThanOrEqual(45);
 }
}
test('About Hero, every content module and typography have one compact unified VI axis',async({page})=>{
 test.setTimeout(120000);
 for(const width of widths){
  const reference=await sourceFont(page,width);
  const frame=await readNativeFrame(page,'/about/',width);
  verifyFrame(frame,'/about/',width);
  expect(frame.headingFont,'source heading type '+width).toEqual(reference.heading);
  expect(frame.paragraphFont,'source paragraph type '+width).toEqual(reference.paragraph);
 }
});
test('All native engineering and knowledge routes use the same responsive public frame',async({page})=>{
 test.setTimeout(180000);
 const routes=['/ie/','/factory/','/digital/','/methods/','/standardization/',
  '/knowledge/vsm-time-structure/','/knowledge/standard-time-capacity/','/app-support/'];
 for(const width of [390,430,820,1440]){
  for(const route of routes)verifyFrame(await readNativeFrame(page,route,width),route,width);
 }
});
