'use strict';
// Full-corpus source visual audit for QilyLean / 启力精益 Selected Briefs.
// Uses actual Chromium layout, not CSS-presence assertions or a single dated page.
const fs=require('fs');
const path=require('path');
const {test,expect}=require('@playwright/test');
const BASE=process.env.QILY_GLOBAL_BASE||'http://127.0.0.1:4175';
const DAILY=path.join(process.cwd(),'qilylean','daily');
const files=fs.readdirSync(DAILY).filter(name=>/^\d{4}-\d{2}-\d{2}\.html$/.test(name)).sort();
test.setTimeout(Math.max(180000,files.length*3000));

test('International Selected Brief corpus: short-column width and text clipping',async ({browser})=>{
  expect(files.length,'full international source corpus').toBeGreaterThanOrEqual(350);
  const defects=[];
  const totals={pages:0,tables:0,comparisonTables:0,examined:0};
  for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
    const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name==='mobile'});
    for(const file of files){
      const route='/qilylean/daily/'+file;
      let response;
      try{response=await page.goto(BASE+route,{waitUntil:'domcontentloaded',timeout:15000});}
      catch(error){defects.push(viewport.name+' '+route+' failed to load: '+String(error).slice(0,120));continue;}
      if(!response||!response.ok()){defects.push(viewport.name+' '+route+' returned '+(response?response.status():'no response'));continue;}
      totals.pages++;
      const measures=await page.evaluate(()=>{
        const all=[...document.querySelectorAll('main table')];
        const findings=[];
        for(let i=0;i<all.length;i++){
          const table=all[i],head=table.querySelector('thead tr:first-child');
          if(!head)continue;
          const th=[...head.children].filter(x=>x.tagName==='TH'||x.tagName==='TD');
          if(th.length!==2&&th.length!==3)continue;
          if(th.some(x=>x.colSpan>1||x.rowSpan>1))continue;
          const rows=[...table.querySelectorAll('tbody tr')].filter(x=>x.querySelectorAll(':scope>td').length===th.length);
          if(rows.length<2)continue;
          const keyTexts=rows.map(x=>(x.querySelector(':scope>td:first-child')?.textContent||'').replace(/\s+/g,'').trim());
          const headText=(th[0].textContent||'').replace(/\s+/g,'').trim();
          if(!keyTexts.length||keyTexts.some(x=>!x||x.length>16)||headText.length>16)continue;
          const first=rows[0].querySelector(':scope>td:first-child');
          if(!first)continue;
          const tdStyle=getComputedStyle(first),rect=table.getBoundingClientRect(),cell=first.getBoundingClientRect();
          if(rect.width<600)continue;
          const charWidth=parseFloat(tdStyle.fontSize)||20;
          const pad=(parseFloat(tdStyle.paddingLeft)||0)+(parseFloat(tdStyle.paddingRight)||0);
          const estimate=Math.max(headText.length,...keyTexts.map(x=>x.length))*charWidth+pad+12;
          const wasted=Math.max(0,cell.width-estimate);
          const hiddenOverflow=[...table.querySelectorAll('th,td')].filter(el=>{
            const st=getComputedStyle(el);
            return (st.overflowX==='hidden'||st.overflowX==='clip')&&el.scrollWidth>el.clientWidth+5;
          }).length;
          findings.push({index:i,columns:th.length,header:headText,width:rect.width,keyWidth:cell.width,wasted,hiddenOverflow});
        }
        return {tables:all.length,findings};
      });
      totals.tables+=measures.tables;
      totals.comparisonTables+=measures.findings.length;
      for(const item of measures.findings){
        totals.examined++;
        const detail=viewport.name+' '+route+' table#'+item.index+' ('+item.columns+' cols, key='+item.header+')';
        // No categorical exception for a source page: every dated issue participates.
        // On a 1440px reading axis, large unused key-column width is visually wasteful.
        if(viewport.name==='desktop'&&item.wasted>Math.max(85,item.width*0.085)){
          defects.push(detail+' short column waste '+Math.round(item.wasted)+'px / '+Math.round(item.keyWidth)+'px');
        }
        if(item.hiddenOverflow>0){
          defects.push(detail+' has '+item.hiddenOverflow+' clipped cells');
        }
      }
    }
    await page.close();
  }
  console.log('International Selected Brief visual coverage:',JSON.stringify(totals));
  if(defects.length)console.error('Layout exceptions:\n'+defects.slice(0,80).join('\n'));
  expect(defects,'all international dated briefs must pass visible comparison checks').toEqual([]);
});
