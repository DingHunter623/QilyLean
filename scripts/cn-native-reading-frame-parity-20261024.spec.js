const {test,expect}=require('@playwright/test');
const intl=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
async function snap(page,url,width){
 await page.setViewportSize({width,height:900});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(300);
 return page.evaluate(()=>{
  const frame=document.querySelector('main#main>section.section>.content.article-shell');
  if(!frame)throw Error('About reading frame missing');
  const h=frame.querySelector('.article-body h2'),p=frame.querySelector('.article-body p');
  if(!h||!p)throw Error('About heading or paragraph missing');
  const r=frame.getBoundingClientRect(),hr=h.getBoundingClientRect(),pr=p.getBoundingClientRect();
  const font=e=>{const s=getComputedStyle(e);return {size:s.fontSize,lineHeight:s.lineHeight,weight:s.fontWeight,color:s.color};};
  return {scrollWidth:document.documentElement.scrollWidth,x:r.left,right:r.right,width:r.width,
   headingX:hr.left,paragraphX:pr.left,heading:font(h),paragraph:font(p)};
 });
}
test('CN native About matches international reading frame and type',async({page})=>{
 test.setTimeout(120000);
 for(const width of [390,430,820,1440]){
  const source=await snap(page,intl+'/about/',width);
  const target=await snap(page,cn+'/about/',width);
  expect(target.scrollWidth,'CN scroll overflow '+width).toBeLessThanOrEqual(width+1);
  expect(target.x,'CN left gutter '+width).toBeGreaterThanOrEqual(width<=620?24:16);
  expect(width-target.right,'CN right gutter '+width).toBeGreaterThanOrEqual(width<=620?24:16);
  expect(Math.abs(target.x-source.x),'horizontal source axis at '+width).toBeLessThanOrEqual(3);
  expect(Math.abs(target.width-source.width),'reading width source parity at '+width).toBeLessThanOrEqual(6);
  expect(Math.abs(target.headingX-target.x),'heading containment '+width).toBeLessThanOrEqual(1);
  expect(Math.abs(target.paragraphX-target.x),'paragraph containment '+width).toBeLessThanOrEqual(1);
  expect.soft(target.heading,'heading typography '+width).toEqual(source.heading);
  expect.soft(target.paragraph,'body typography '+width).toEqual(source.paragraph);
 }
});


test('CN original knowledge, engineering and support routes retain readable safe gutters',async({page})=>{
 test.setTimeout(180000);
 const routes=[
  '/ie/','/factory/','/digital/','/methods/','/standardization/',
  '/knowledge/vsm-time-structure/','/knowledge/standard-time-capacity/',
  '/app-support/'
 ];
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto(cn+route,{waitUntil:'domcontentloaded',timeout:30000});
   const frame=await page.evaluate(()=>{
    const main=document.querySelector('main:not([data-cn-source-content])');
    if(!main)return {missingMain:true};
    const node=main.querySelector(':scope > section.section > .content.article-shell, :scope > section.hero > .hero-inner');
    if(!node)return {missingFrame:true};
    const r=node.getBoundingClientRect();
    return {x:r.left,right:r.right,scrollWidth:document.documentElement.scrollWidth};
   });
   expect(frame.missingMain,route+' native main').not.toBe(true);
   expect(frame.missingFrame,route+' native reading frame').not.toBe(true);
   expect(frame.scrollWidth,route+' no overflow at '+width).toBeLessThanOrEqual(width+1);
   expect(frame.x,route+' left frame at '+width).toBeGreaterThanOrEqual(width<=620?24:16);
   expect(width-frame.right,route+' right frame at '+width).toBeGreaterThanOrEqual(width<=620?24:16);
  }
 }
});
