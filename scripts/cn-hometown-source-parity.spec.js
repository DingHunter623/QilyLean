const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

const globalBase=process.env.QILY_GLOBAL_BASE||'http://127.0.0.1:4173';
const cnBase=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const origins=[new URL(globalBase).origin,new URL(cnBase).origin];
const output=path.join(process.cwd(),'hometown-source-parity-artifacts');
fs.mkdirSync(output,{recursive:true});
const widths=[1920,1440,1024,768,430,390,375];
const properties=[
  'display','position','boxSizing','fontFamily','fontSize','fontWeight','fontStyle',
  'lineHeight','letterSpacing','textAlign','textTransform','textDecorationLine',
  'color','webkitTextFillColor','backgroundColor','backgroundImage',
  'borderTopWidth','borderTopStyle','borderTopColor','borderRightWidth',
  'borderBottomWidth','borderLeftWidth','borderRadius','boxShadow',
  'paddingTop','paddingBottom','paddingLeft','paddingRight',
  'marginTop','marginBottom','marginLeft','marginRight','gap',
  'gridTemplateColumns','tableLayout','overflowX','overflowY','verticalAlign',
  'fill','stroke','strokeWidth','textAnchor','dominantBaseline','opacity','stopColor','stopOpacity'
];

test.setTimeout(180000);
test.describe.configure({mode:'parallel'});
async function open(context,base,route){
  const page=await context.newPage();
  await page.route('**/*',r=>{
    const u=r.request().url();
    return origins.some(o=>u.startsWith(o+'/'))||u.startsWith('data:')||u.startsWith('blob:')?r.continue():r.abort();
  });
  const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});
  expect(response&&response.status()).toBe(200);
  await page.evaluate(()=>document.fonts.ready);
  // International R8 settles its final stylesheet ownership at 1400ms.
  await page.waitForTimeout(2500);
  return page;
}

async function snapshot(page,identity){
  return page.evaluate(({identity,properties})=>{
    const root=document.getElementById(identity);
    if(!root)throw Error('Module missing: '+identity);
    const anchor=root.getBoundingClientRect();
    const nodes=[root,...root.querySelectorAll('*')].filter(e=>!['title','desc'].includes(e.tagName.toLowerCase()));
    return {viewport:{width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth},root:{left:anchor.left,right:anchor.right,width:anchor.width},nodes:nodes.map(el=>{
      const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
      return {
        tag:el.tagName.toLowerCase(),
        text:el.children.length?'':el.textContent.trim().slice(0,60),
        style:Object.fromEntries(properties.map(p=>[p,style[p]])),
        rect:{x:rect.x-anchor.x,y:rect.y-anchor.y,width:rect.width,height:rect.height},
      };
    })};
  },{identity,properties});
}

for(const width of widths){
  for(const module of [
    {name:'paper',identity:'qilyHometownManufacturingPaper',source:'/links/hometown-manufacturing/',cn:'/links/hometown-manufacturing/'},
    {name:'resource-card',identity:'qilyHometownManufacturingKnowledge',source:'/links/',cn:'/resources/'},
  ]){
    test(`Hometown source parity ${module.name} ${width}px`,async({browser})=>{
      const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1});
      try{
        const [source,cn]=await Promise.all([open(context,globalBase,module.source),open(context,cnBase,module.cn)]);
        const [sourceSnapshot,cnSnapshot]=await Promise.all([snapshot(source,module.identity),snapshot(cn,module.identity)]);
        const expected=sourceSnapshot.nodes,actual=cnSnapshot.nodes;
        const differences=[];
        for(const [site,snapshot] of [['source',sourceSnapshot],['cn',cnSnapshot]]){
          if(snapshot.viewport.scrollWidth>snapshot.viewport.width+1)differences.push({kind:'document-overflow',site,...snapshot.viewport});
          if(snapshot.root.left<-1||snapshot.root.right>snapshot.viewport.width+1)differences.push({kind:'module-outside-viewport',site,...snapshot.root});
        }
        for(const property of ['left','right','width']){
          if(Math.abs(sourceSnapshot.root[property]-cnSnapshot.root[property])>1)differences.push({kind:'module-position',property,source:sourceSnapshot.root[property],cn:cnSnapshot.root[property]});
        }
        if(expected.length!==actual.length)differences.push({kind:'node-count',source:expected.length,cn:actual.length});
        for(let i=0;i<Math.min(expected.length,actual.length);i++){
          const a=expected[i],b=actual[i];
          if(a.tag!==b.tag||a.text!==b.text)differences.push({index:i,kind:'content',source:[a.tag,a.text],cn:[b.tag,b.text]});
          for(const property of properties){
            if(a.style[property]!==b.style[property])differences.push({index:i,tag:a.tag,text:a.text,property,source:a.style[property],cn:b.style[property]});
          }
          // SVG definitions/gradient stops have no painted rectangle. Their
          // zero viewport box must not inherit the site's header offset.
          for(const property of (a.rect.width||a.rect.height||b.rect.width||b.rect.height)?['x','y','width','height']:[]){
            if(Math.abs(a.rect[property]-b.rect[property])>1)differences.push({index:i,tag:a.tag,text:a.text,property:'rect.'+property,source:a.rect[property],cn:b.rect[property]});
          }
        }
        const prefix=`${module.name}-${width}`;
        fs.writeFileSync(path.join(output,prefix+'.json'),JSON.stringify({width,module:module.name,source:sourceSnapshot,cn:cnSnapshot,differences},null,2));
        if(differences.length){
          await Promise.all([source.screenshot({path:path.join(output,prefix+'-source.png')}),cn.screenshot({path:path.join(output,prefix+'-cn.png')})]);
        }
        expect(differences.slice(0,30),`${differences.length} actual style/geometry/content differences; full report ${prefix}.json`).toEqual([]);
        if(module.name==='paper'){
          await expect(cn.locator('#'+module.identity+' svg')).toHaveCount(4);
          await expect(cn.locator('#'+module.identity+' [data-qily-unified-arrow="v4"]')).toHaveCount(12);
        }else{
          await expect(cn.locator('#'+module.identity+' a').first()).toHaveAttribute('href','/links/hometown-manufacturing/');
        }
      }finally{
        await context.close();
      }
    });
  }
}
