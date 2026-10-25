const {test,expect}=require('@playwright/test');
const com=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const pages=[
 {site:'international',url:com+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'China',url:cn+'/',selector:'main > section.qily-home-conversion-hero > .qily-home-conversion-hero__inner'},
 {site:'international',url:com+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'},
 {site:'China',url:cn+'/about/',selector:'main > section.page-hero > .content',second:'main > section.section > .content.article-shell'}
];
test('Four screenshot pages preserve one 15px effective mobile reading gutter',async({page})=>{
 test.setTimeout(180000);
 for(const width of [390,430,620]){
  await page.setViewportSize({width,height:900});
  for(const contract of pages){
   await page.goto(contract.url,{waitUntil:'domcontentloaded'});
   if(contract.site==='international')await page.waitForTimeout(1600);
   const rects=await page.evaluate(({selector,second})=>{
    const get=(s)=>{if(!s)return null;const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
    return {primary:get(selector),secondary:get(second),documentWidth:document.documentElement.scrollWidth,layoutWidth:Math.min(document.documentElement.clientWidth,document.documentElement.scrollWidth)};
   },contract);
   console.log('DUAL_SITE_GUTTER',JSON.stringify({site:contract.site,url:contract.url,width,...rects}));
   expect(rects.primary,contract.url+' expected principal reading content').toBeTruthy();
   expect(rects.documentWidth,contract.url+' no page overflow '+width).toBeLessThanOrEqual(width+1);
   expect.soft(Math.abs(rects.primary.left-15),contract.url+' left reading edge '+width).toBeLessThanOrEqual(1.5);
   expect.soft(Math.abs(rects.layoutWidth-rects.primary.right-15),contract.url+' right edge within layout viewport '+width).toBeLessThanOrEqual(1.5);
   if(rects.secondary){
    expect.soft(Math.abs(rects.primary.left-rects.secondary.left),contract.url+' hero-to-body axis '+width).toBeLessThanOrEqual(1);
    expect.soft(Math.abs(rects.primary.right-rects.secondary.right),contract.url+' hero-to-body right axis '+width).toBeLessThanOrEqual(1);
   }
  }
 }
});
test('Selected international and China public routes retain no mobile overflow',async({page})=>{
 test.setTimeout(150000);
 const routes=[
  [com+'/capabilities/',cn+'/archive/profile/capabilities/'],
  [com+'/knowledge/',cn+'/knowledge/'],
  [com+'/trust/',cn+'/trust/'],
  [com+'/links/',cn+'/resources/']
 ];
 for(const width of [390,430]){
  await page.setViewportSize({width,height:900});
  for(const pair of routes)for(const url of pair){
   await page.goto(url,{waitUntil:'domcontentloaded'});
   const stats=await page.evaluate(()=>{
    const main=document.querySelector('main');
    const section=main?.querySelector(':scope > section');
    const r=section?.getBoundingClientRect();
    return {documentWidth:document.documentElement.scrollWidth,
      firstSection:r?{left:r.left,right:r.right,width:r.width}:null};
   });
   console.log('SAMPLED_SITE_CONTAINMENT',JSON.stringify({url,width,...stats}));
   expect(stats.documentWidth,url+' horizontal containment').toBeLessThanOrEqual(width+1);
  }
 }
});

test('W43 governance table keeps balanced mobile columns on both domains',async({page})=>{
 test.setTimeout(120000);
 const routes=[
  {site:'international',url:com+'/qilylean/daily/2026-10-25.html'},
  {site:'China',url:cn+'/briefs/archive/2026-10-25/'}
 ];
 for(const width of [390,430]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   await page.goto(route.url,{waitUntil:'domcontentloaded'});
   const metrics=await page.evaluate(()=>{
    const table=document.querySelector('.w43-table');
    if(!table)return null;
    const cells=[...table.querySelectorAll('thead th')].map(el=>{
      const r=el.getBoundingClientRect();
      return {width:r.width,left:r.left,right:r.right};
    });
    const tr=table.querySelector('tbody tr');
    const row=[...(tr?.children||[])].map(el=>el.getBoundingClientRect().width);
    const overflow=[...table.querySelectorAll('th,td')].map(el=>{
      const cell=el.getBoundingClientRect();
      const range=document.createRange();
      range.selectNodeContents(el);
      const text=range.getBoundingClientRect();
      return {
        cellLeft:cell.left,cellRight:cell.right,
        textLeft:text.left,textRight:text.right,
        scrollWidth:el.scrollWidth,clientWidth:el.clientWidth
      };
    });
    const firstCell=table.querySelector('tbody tr td:first-child');
    let firstPhrase=null;
    if(firstCell?.firstChild?.nodeType===Node.TEXT_NODE){
      const node=firstCell.firstChild;
      const phrase=document.createRange();
      phrase.setStart(node,0);
      phrase.setEnd(node,Math.min(5,node.length));
      const phraseRects=[...phrase.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}));
      const rest=document.createRange();
      rest.setStart(node,Math.min(5,node.length));
      rest.setEnd(node,node.length);
      const restRects=[...rest.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}));
      firstPhrase={phraseRects,restRects,text:node.textContent};
    }
    return {
      tableWidth:table.getBoundingClientRect().width,
      cells,row,overflow,firstPhrase,
      documentWidth:document.documentElement.scrollWidth
    };
   });
   console.log('W43_MOBILE_TABLE',JSON.stringify({site:route.site,width,...metrics}));
   expect(metrics,route.url+' governance table exists').toBeTruthy();
   expect(metrics.cells).toHaveLength(3);
   expect(metrics.documentWidth,route.url+' no horizontal overflow').toBeLessThanOrEqual(width+1);
   const ratios=metrics.cells.map(c=>c.width/metrics.tableWidth);
   expect.soft(ratios[0],route.url+' first column ratio').toBeGreaterThanOrEqual(.29);
   expect.soft(ratios[0],route.url+' first column ratio').toBeLessThanOrEqual(.31);
   expect.soft(ratios[1],route.url+' second column ratio').toBeGreaterThanOrEqual(.35);
   expect.soft(ratios[1],route.url+' second column ratio').toBeLessThanOrEqual(.37);
   expect.soft(ratios[2],route.url+' third column ratio').toBeGreaterThanOrEqual(.33);
   expect.soft(ratios[2],route.url+' third column ratio').toBeLessThanOrEqual(.35);
   expect(ratios[0],route.url+' first column must remain the narrowest').toBeLessThan(ratios[2]);
   expect(ratios[0],route.url+' first column must remain narrower than common-expression column').toBeLessThan(ratios[1]);
   expect.soft(Math.abs(metrics.row[0]-metrics.cells[0].width),route.url+' body/header first-column alignment').toBeLessThanOrEqual(1);
   expect.soft(metrics.firstPhrase?.text.startsWith('只有制度，'),route.url+' first semantic phrase source').toBeTruthy();
   expect.soft(metrics.firstPhrase?.phraseRects.length,route.url+' “只有制度，” stays on one line').toBe(1);
   if(metrics.firstPhrase?.phraseRects.length && metrics.firstPhrase?.restRects.length){
    expect.soft(metrics.firstPhrase.restRects[0].top,route.url+' line break occurs after “只有制度，”').toBeGreaterThan(metrics.firstPhrase.phraseRects[0].top+1);
   }
   for(const [i,item] of metrics.overflow.entries()){
    expect.soft(item.textLeft,route.url+' cell '+i+' text left containment').toBeGreaterThanOrEqual(item.cellLeft-0.5);
    expect.soft(item.textRight,route.url+' cell '+i+' text right containment').toBeLessThanOrEqual(item.cellRight+0.5);
    expect.soft(item.scrollWidth,route.url+' cell '+i+' internal scroll containment').toBeLessThanOrEqual(item.clientWidth+1);
   }
  }
 }
});
