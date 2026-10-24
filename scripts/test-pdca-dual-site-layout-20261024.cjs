const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sites=[
  {id:'international',base:'http://127.0.0.1:4173',route:'/capabilities/'},
  {id:'China',base:'http://127.0.0.1:4174',route:'/archive/profile/capabilities/'}
];
const arrows={p:'→',d:'↓',c:'←',a:'↑'};
const round=n=>Math.round(n*10)/10;
async function sample(page){
 return page.evaluate(()=>{
  const root=document.querySelector('#mechanism .qily-pdca-loop');
  if(!root)return {missing:true};
  const ge=el=>{let r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:r.width,h:r.height}};
  const cards={};
  for(const key of ['p','d','c','a']){
   const card=root.querySelector('[data-qily-pdca="'+key+'"]');
   if(!card)return {missingCard:key};
   const after=getComputedStyle(card,'::after'),before=getComputedStyle(card,'::before');
   cards[key]={rect:ge(card),text:card.textContent.trim(),pseudo:after.content,
     arrowColor:after.color,arrowDisplay:after.display,lineColor:before.backgroundColor,
     bg:getComputedStyle(card).backgroundColor,
     headingSize:parseFloat(getComputedStyle(card.querySelector('h3')).fontSize),
     textSize:parseFloat(getComputedStyle(card.querySelector('p')).fontSize)};
  }
  const style=getComputedStyle(root);
  const links=[...document.styleSheets].map(x=>x.href).filter(Boolean).filter(x=>x.includes('capability-pdca-loop-v1.css'));
  return {cards,grid:style.gridTemplateColumns,display:style.display,
    width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
    gap:style.columnGap,links,root:ge(root)};
 });
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,430,768,1440,1588]){
   for(const {id,base,route} of sites){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});
    await page.evaluate(()=>document.fonts.ready);
    const z=await sample(page);
    assert.ok(!z.missing&&!z.missingCard,id+' lacks PDCA module/card: '+JSON.stringify(z));
    assert.equal(z.display,'grid',id+' PDCA display');
    assert.equal(z.links.length,1,id+' has no mirrored dedicated PDCA CSS');
    assert.ok(z.scroll<=width+2,id+' horizontal overflow '+width+': '+z.scroll);
    const {p,d,c,a}=z.cards,tolerance=2;
    assert.ok(p.rect.left<d.rect.left&&a.rect.left<c.rect.left,id+' wrong left-to-right');
    assert.ok(p.rect.top<a.rect.top&&d.rect.top<c.rect.top,id+' wrong top-to-bottom');
    assert.ok(Math.abs(p.rect.top-d.rect.top)<tolerance,id+' P,D not top aligned');
    assert.ok(Math.abs(a.rect.top-c.rect.top)<tolerance,id+' A,C not bottom aligned');
    assert.ok(Math.abs(p.rect.left-a.rect.left)<tolerance,id+' P,A not left aligned');
    assert.ok(Math.abs(d.rect.left-c.rect.left)<tolerance,id+' D,C not right aligned');
    assert.ok(p.rect.right<d.rect.left&&a.rect.right<c.rect.left,id+' cards collide horizontally');
    assert.ok(p.rect.bottom<a.rect.top&&d.rect.bottom<c.rect.top,id+' cards collide vertically');
    for(const [key,arrow] of Object.entries(arrows)){
      assert.equal(z.cards[key].pseudo,'"'+arrow+'"',id+' no '+key+' arrow');
      assert.ok(z.cards[key].rect.w>90,id+' '+key+' insufficient card width');
    }
    if(width<=430){
      for(const key of ['p','d','c','a']){
        assert.ok(z.cards[key].textSize>=16,id+' mobile card body text too small');
        assert.ok(z.cards[key].headingSize>=18,id+' mobile card heading text too small');
      }
    }
    if([390,1588].includes(width)){
      fs.mkdirSync('pdca-visual-evidence',{recursive:true});
      await page.locator('#mechanism').screenshot({path:'pdca-visual-evidence/'+id+'-'+width+'.png',timeout:20000});
    }
    console.log('PDCA_VISUAL_PASS '+JSON.stringify({site:id,viewport:width,
       grid:z.grid,gap:z.gap,positions:Object.fromEntries(Object.entries(z.cards).map(([k,v])=>[k,{x:round(v.rect.left),y:round(v.rect.top),w:round(v.rect.w),h:round(v.rect.h)}])),
       arrows:Object.fromEntries(Object.entries(z.cards).map(([k,v])=>[k,v.pseudo])),css:z.links}));
    await page.close();
   }
  }
 }finally{await browser.close();}
})().catch(e=>{console.error('PDCA_VISUAL_FAIL',e);process.exit(1)});
