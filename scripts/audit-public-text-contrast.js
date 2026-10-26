#!/usr/bin/env node
'use strict';
/**
 * QILY-SITEWIDE-CONTRAST-AUDIT-20261026
 *
 * Non-mutating visual acceptance inventory over EVERY static HTML route of the
 * international site and the generated mainland mirror. Two viewport widths.
 * Detect contrast errors using COMPUTED rendered colors, not authored CSS
 * declarations. Solid surfaces only: gradients/images are flagged for manual
 * follow-up instead of being mis-scored. Do not modify browser DOM or production.
 *
 * Run after: bash cn-site/scripts/materialize-practice-assets.sh
 *             npm install --no-save @playwright/test
 *             npx playwright install chromium
 *             python3 -m http.server 4175 --directory . &
 *             python3 -m http.server 4174 --directory cn-site &
 */
const fs=require('fs'),path=require('path'),{chromium}=require('@playwright/test');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'test-results');
const BASES=[
  {dir:ROOT,base:process.env.QILY_INT_BASE||'http://127.0.0.1:4175',site:'COM'},
  {dir:path.join(ROOT,'cn-site'),base:process.env.QILY_CN_BASE||'http://127.0.0.1:4174',site:'CN'}
];
const concurrency=Math.max(1,Math.min(8,Number(process.env.QILY_CONTRAST_WORKERS||4)));
const widths=[1588,390];
function walk(base,folder,out){
  for(const d of fs.readdirSync(folder,{withFileTypes:true})){
    if(d.name.startsWith('.')||['node_modules','vendor','.git','test-results'].includes(d.name))continue;
    const f=path.join(folder,d.name);
    if(d.isDirectory())walk(base,f,out);
    else if(d.isFile()&&/\.html?$/i.test(d.name)){
      const rel=path.relative(base,f).split(path.sep).join('/');
      // International scanner must not treat the CN mirror as its own route.
      if(base===ROOT&&rel.startsWith('cn-site/'))continue;
      if(/(^|\/)(?:404|500|baidu_verify[^/]*|google[^/]*)\.html?$/i.test(rel))continue;
      const route='/'+rel.replace(/\/index\.html?$/,'/').replace(/^index\.html?$/,'');
      out.push({route:encodeURI(route).replace(/#/g,'%23'),file:rel});
    }
  }
}
function getRoutes(){
 const all=[];
 for(const {dir,base,site} of BASES){
   const list=[];walk(dir,dir,list);
   for(const x of list)all.push({...x,site,base});
 }
 return all;
}
async function auditPage(page,entry,width){
  const result={site:entry.site,route:entry.route,width};
  try{
    const response=await page.goto(entry.base+entry.route,{waitUntil:'domcontentloaded',timeout:16000});
    if(!response||response.status()>=400){
      result.error='HTTP '+(response?response.status():'no response');
      return result;
    }
    await page.waitForTimeout(60);
    const data=await page.evaluate(()=>{
      const rgb=color=>{
        const m=String(color||'').match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
        return m?[Number(m[1]),Number(m[2]),Number(m[3]),m[4]===undefined?1:Number(m[4])]:null;
      };
      const lum=a=>{
        const s=a.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
        return .2126*s[0]+.7152*s[1]+.0722*s[2];
      };
      const contrast=(a,b)=>{
        const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
      };
      const tags='h1,h2,h3,h4,h5,h6,p,li,span,small,strong,b,a,button,label,td,th,figcaption,dt,dd';
      const nodes=[...document.querySelectorAll(tags)], violations=[],manual=[];
      let checked=0;
      for(const el of nodes){
        const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
        if(!own)continue;
        const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        if(r.width<4||r.height<4||s.display==='none'||s.visibility!=='visible'||Number(s.opacity)<.95)continue;
        const fs=parseFloat(s.fontSize);if(!Number.isFinite(fs)||fs<11)continue;
        let ancestor=el,background=null,gradient=false,steps=0;
        while(ancestor&&steps++<25){
          const cs=getComputedStyle(ancestor),paint=rgb(cs.backgroundColor);
          if(cs.backgroundImage&&cs.backgroundImage!=='none')gradient=true;
          if(paint&&paint[3]>=.99){background=paint;break;}
          ancestor=ancestor.parentElement;
        }
        if(!background||gradient){
          if(manual.length<8)manual.push({kind:'gradient/unknown background',text:el.textContent.trim().slice(0,70)});
          continue;
        }
        const f=rgb(s.webkitTextFillColor)&&s.webkitTextFillColor!=='currentcolor'
          ?rgb(s.webkitTextFillColor):rgb(s.color);
        if(!f||f[3]<.95)continue;
        const ratio=contrast(f,background),large=fs>=24||(fs>=18.67&&Number(s.fontWeight)>=700);
        const minRatio=large?3:4.5;checked++;
        if(ratio<minRatio-.05&&violations.length<45){
          const desc=el.textContent.trim().replace(/\s+/g,' ').slice(0,90);
          violations.push({ratio:Number(ratio.toFixed(2)),required:minRatio,text:desc,
            selector:el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):''),
            foreground:s.color,paint:s.webkitTextFillColor,background:getComputedStyle(ancestor).backgroundColor,
            sampleX:Math.round(r.x),sampleY:Math.round(r.y)});
        }
      }

      // Whole-site INFORMATION CARD grid visual-acceptance redline.
      // Flows/carousels/metric strips are excluded; their geometry is semantic.
      const layoutIssues=[],layoutSamples=[];
      const candidate='main .matrix,main .trust-grid,main [data-qily-card-count],'+
        'main .module-grid.three,main .module-grid.four,'+
        'main .paper-grid,main .project-grid,main .service-grid,main .knowledge-grid';
      for(const grid of new Set(document.querySelectorAll(candidate))){
        const parentStyle=getComputedStyle(grid);
        if(parentStyle.display!=='grid')continue;
        const visible=[...grid.children].filter(el=>{
          const q=getComputedStyle(el);
          return q.display!=='none'&&q.visibility!=='hidden'&&el.getBoundingClientRect().width>0;
        });
        const n=visible.length,isMatrix=grid.classList.contains('matrix')&&n===2&&
          visible.every(x=>x.classList.contains('panel'));
        if(!isMatrix&&![3,4].includes(n))continue;
        if(n===4&&grid.classList.contains('knowledge-stat-grid')&&innerWidth<720)continue;
        const rects=visible.map(el=>{
          const r=el.getBoundingClientRect(),last=el.lastElementChild?.getBoundingClientRect();
          return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,
            blank:last?Math.max(0,r.bottom-last.bottom):0};
        });
        layoutSamples.push({kind:isMatrix?'two':n,className:String(grid.className).slice(0,100)});
        const bad=(message)=>{
          if(layoutIssues.length<24)layoutIssues.push({kind:isMatrix?'two':n,
            className:String(grid.className).slice(0,100),issue:message,coords:rects});
        };
        const near=(a,b)=>Math.abs(a-b)<=2;
        if(innerWidth>=900){
          if(isMatrix){
            if(!near(rects[0].y,rects[1].y)||!near(rects[0].w,rects[1].w)||
              rects.some(x=>x.blank>55))bad('two unequal columns or forced giant blank');
          }else if(n===3){
            if(!near(rects[0].y,rects[1].y)||!near(rects[1].y,rects[2].y)||
              !near(rects[0].w,rects[2].w))bad('three cards not one balanced row');
          }else if(n===4){
            if(!near(rects[0].y,rects[1].y)||!near(rects[2].y,rects[3].y)||
              !near(rects[0].x,rects[2].x)||!near(rects[1].x,rects[3].x)||
              !near(rects[0].w,rects[1].w))bad('four cards not two by two');
          }
        }else if(innerWidth<720){
          if(rects.some((r,i)=>i>0&&!near(r.x,rects[0].x))){
            bad('mobile information cards not one column');
          }
        }
      }
      return {checked,violations,manual:manual.length,manualSamples:manual,
        layoutsAudited:layoutSamples.length,layoutIssues,
        horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
    });
    result.checked=data.checked;result.violations=data.violations;
    result.layoutsAudited=data.layoutsAudited;result.layoutIssues=data.layoutIssues;
    result.reviewNeeded=data.manual;result.manualSamples=data.manualSamples;
    result.horizontalOverflow=data.horizontalOverflow;
  }catch(err){result.error=String(err).slice(0,250)}
  return result;
}
async function main(){
 fs.mkdirSync(OUT,{recursive:true});
 const targets=getRoutes(),results=[],browser=await chromium.launch({headless:true});
 console.log('Contrast audit: '+targets.length+' HTML routes × '+widths.length+' viewports.');
 let next=0;
 await Promise.all(Array.from({length:concurrency},async()=>{
   const context=await browser.newContext({viewport:{width:1588,height:1000}});
   await context.route('**/*',route=>{
     const u=route.request().url();
     if(!/^https?:\/\/127\.0\.0\.1:(4174|4175)\//.test(u))return route.abort();
     if(['image','font','media'].includes(route.request().resourceType()))return route.abort();
     return route.continue();
   });
   const page=await context.newPage();
   while(next<targets.length*widths.length){
     const idx=next++,entry=targets[Math.floor(idx/widths.length)],width=widths[idx%widths.length];
     await page.setViewportSize({width,height:1000});
     const r=await auditPage(page,entry,width);
     results.push(r);
     if(results.length%100===0)console.log('Audited '+results.length+'/'+(targets.length*widths.length));
   }
   await context.close();
 }));
 await browser.close();
 const violations=results.flatMap(r=>(r.violations||[]).map(v=>({site:r.site,route:r.route,width:r.width,...v})));
 const unreachable=results.filter(r=>r.error),review=results.reduce((n,r)=>n+(r.reviewNeeded||0),0);
 const gridFailures=results.flatMap(r=>(r.layoutIssues||[]).map(v=>({site:r.site,route:r.route,width:r.width,...v})));
 const summary={totalRoutes:targets.length,screens:results.length,checkedTextNodes:results.reduce((n,r)=>n+(r.checked||0),0),
  belowContrastThreshold:violations.length,unreachable:unreachable.length,gradientOrUnknownCandidates:review,
  informationGridsAudited:results.reduce((n,r)=>n+(r.layoutsAudited||0),0),cardGridViolations:gridFailures.length};
 fs.writeFileSync(path.join(OUT,'qily-sitewide-contrast-audit.json'),JSON.stringify({summary,violations,cardGridViolations:gridFailures,unreachable,results},null,2));
 console.log(JSON.stringify(summary));
 console.log(JSON.stringify(violations.slice(0,30),null,2));
 // Do not mark images/gradients as passed: they require visual review.
 if(violations.length||unreachable.length||gridFailures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
