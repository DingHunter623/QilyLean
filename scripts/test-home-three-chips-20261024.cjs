const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const intl=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const cn=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
async function inspect(page,url){
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.evaluate(()=>document.fonts.ready);
 return page.evaluate(()=>{
  const root=document.querySelector('.qily-home-conversion-hero__chips'),
   elements=[...root.querySelectorAll(':scope > span')],
   media=document.querySelector('.qily-home-project-visual'),
   actions=document.querySelector('.qily-home-conversion-actions'),
   route=document.querySelector('.qily-home-conversion-hero__route');
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const cs=e=>{const s=getComputedStyle(e);return {wrap:s.flexWrap,font:s.fontSize,weight:s.fontWeight,color:s.color,bg:s.backgroundColor}};
  return {chips:elements.map(x=>({text:x.textContent.trim(),rect:rect(x),style:cs(x)})),
   wrap:cs(root).wrap,root:rect(root),media:rect(media),
   actions:[...actions.querySelectorAll('a')].map(x=>({text:x.textContent.trim(),href:x.getAttribute('href'),
     rect:rect(x),color:getComputedStyle(x).color,background:getComputedStyle(x).backgroundColor})),
   supplier:[...document.querySelectorAll('#qily-home-collaboration .qily-home-role')]
     .filter(x=>x.querySelector('h3')?.textContent.includes('专家／供应商协同'))
     .map(x=>x.textContent.trim()),
   route:route?.textContent.trim(),scroll:document.documentElement.scrollWidth,
   documentWidth:document.documentElement.clientWidth
  };
 });
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,430,1180,1280,1440,1588,1920]){
   const state={};
   for(const [name,base] of [['intl',intl],['cn',cn]]){
    const page=await browser.newPage({viewport:{width,height:950}});
    if(name==='intl') await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    if(name==='intl')await page.waitForFunction(()=>document.body.dataset.qilyHomeConversion==='v1');
    state[name]=await inspect(page,base+'/');
    if(width===1588||width===390){
      fs.mkdirSync('vi-hero-single-row-evidence',{recursive:true});
      await page.locator('.qily-home-conversion-hero').screenshot({path:'vi-hero-single-row-evidence/'+name+'-'+width+'.png',timeout:20000});
    }
    await page.close();
   }
   for(const name of ['intl','cn']){
    const s=state[name];
    assert.equal(s.chips.length,3,name+' expected 3 business-category pills');
    assert.deepEqual(s.chips.map(x=>x.text),['新工厂／新产线规划','精益改善项目交付','目视化设计与交付'],name+' labels changed');
    assert.ok(s.scroll<=width+2,name+' horizontal page overflow at '+width+': '+s.scroll);
    if(width>=1280){
     assert.equal(s.wrap,'nowrap',name+' pills should not wrap on desktop '+width);
     assert.ok(Math.max(...s.chips.map(x=>x.rect.top))-Math.min(...s.chips.map(x=>x.rect.top))<=2,name+' pills are not aligned at '+width);
     assert.ok(s.chips[0].rect.right<s.chips[1].rect.left&&s.chips[1].rect.right<s.chips[2].rect.left,name+' pills collide');
     assert.ok(s.chips[2].rect.right<=s.media.left-5,name+' chips overlap right media at '+width);
    }
   }
   if(width>=1180 && width<1280){
      assert.equal(state.intl.wrap,'wrap','narrow desktop must retain natural wrapping');
      assert.ok(state.intl.chips[2].rect.right<=state.intl.media.left-5,
         'narrow international desktop third chip overlaps media at '+width);
   }
   assert.equal(state.intl.actions[0].text,'查看代表案例','international case action must lead, aligned with CN');
   assert.equal(state.intl.actions[1].text,'免费60分钟沟通诊断','international commercial CTA must follow case action');
   assert.equal(state.cn.actions[0].text,'查看代表案例','China representative-case action must retain first position');
   if(width>=1280){
      assert.ok(Math.abs(state.intl.actions[0].rect.left-state.cn.actions[0].rect.left)<=10,
        'Representative-case button left axis differs from China reference');
      assert.equal(state.intl.actions[0].background,state.cn.actions[0].background,
        'Representative-case button primary VI differs from China reference');
   }
   assert.equal(state.intl.supplier.length,1,'International owner/supplier coordination missing');
   assert.equal(state.cn.supplier.length,1,'CN public owner/supplier engineering card over-filtered');
   assert.ok(state.intl.supplier[0].includes('接口、责任、费用、交付与验收通过书面边界管理'),
     'International expert/supplier governance wording lost');
   assert.ok(state.cn.supplier[0].includes('接口、责任、交付与验收通过书面边界管理'),
     'CN public supplier wording or legal boundary regressed');

   assert.ok(state.intl.route.includes('标准启动路径：免费60分钟沟通诊断'),'international sales route lost');
   assert.ok(state.cn.actions.some(x=>x.text==='查看代表案例'),'CN public action missing');
   assert.ok(!state.cn.actions.some(x=>x.text.includes('60分钟')),'China accidentally gained commercial CTA');
   if(width>=1280){
    for(let i=0;i<3;i++){
      assert.equal(state.intl.chips[i].style.font,state.cn.chips[i].style.font,'chip font size changed');
      assert.equal(state.intl.chips[i].style.bg,state.cn.chips[i].style.bg,'chip background changed');
    }
   }
   console.log('HERO_SINGLE_ROW_PASS '+JSON.stringify({width,
    intl:state.intl.chips.map(x=>({x:Math.round(x.rect.left),y:Math.round(x.rect.top),r:Math.round(x.rect.right)})),
    cn:state.cn.chips.map(x=>({x:Math.round(x.rect.left),y:Math.round(x.rect.top),r:Math.round(x.rect.right)})),
    mediaX:state.intl.media.left,intlActions:state.intl.actions.map(x=>x.text)}));
  }
 }finally{await browser.close()}
})().catch(e=>{console.error('HERO_SINGLE_ROW_FAIL',e);process.exit(1)});
