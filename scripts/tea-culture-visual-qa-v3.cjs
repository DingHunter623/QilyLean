'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const base=process.env.QILY_TEA_URL||'https://qilylean.com/links/anxi-tea/';
const out=path.resolve(process.env.QA_OUTPUT||'qa-output/tea-culture-v3');
fs.mkdirSync(out,{recursive:true});
const navExpected=['/','/capabilities/','/improvements/','/lean-production/','/projects/','/trust/','/cooperation/','/knowledge/','/links/','/about/'];
const assert=(ok,msg)=>{if(!ok)throw new Error('[Tea V3 QA] '+msg);};
const rgb=v=>{const m=v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);if(!m)throw new Error('Bad color '+v);return m.slice(1,4).map(n=>+n/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));};
const lum=v=>{const c=rgb(v);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   let ready=false;
   for(let attempt=0;attempt<18&&!ready;attempt++){
    await page.goto(base+'?tea-visual-qa='+Date.now()+'-'+attempt,{waitUntil:'domcontentloaded',timeout:90000});
    try{await page.waitForFunction(()=>{const l=document.querySelector('#qilyTeaResourceVisualClosureV3'),c=document.querySelector('.tea-contact');return !!l&&l.href.includes('20261031-vi-unification-v3')&&!!c&&getComputedStyle(c).backgroundColor==='rgb(238, 247, 245)'},null,{timeout:9000});ready=true;}
    catch(_){await page.waitForTimeout(7000);}
   }
   assert(ready,'V3 production page not available after deployment polling');
   await page.waitForSelector('header.qily-site-header.qily-global-header nav.qily-global-nav a',{state:'visible'});
   const imgs=await page.evaluate(async()=>{const a=[...document.querySelectorAll('main.tea-page img')];a.forEach(x=>x.loading='eager');await Promise.all(a.map(x=>x.decode().catch(()=>null)));return a.map(x=>({complete:x.complete,w:x.naturalWidth,h:x.naturalHeight}));});
   assert(imgs.length===19&&imgs.every(x=>x.complete&&x.w>0&&x.h>0),name+': original image load failed '+JSON.stringify(imgs.filter(x=>!x.w)));
   const m=await page.evaluate(()=>{
    const el=s=>document.querySelector(s),st=s=>getComputedStyle(el(s));
    const nav=[...document.querySelectorAll('header.qily-site-header nav.qily-global-nav>a')];
    const sections=[...document.querySelectorAll('main.tea-page section')];
    const photoCaptions=[...document.querySelectorAll('.tea-photo figcaption')];
    const large=[getComputedStyle(document.body).backgroundColor,st('.tea-hero').backgroundColor,st('.tea-intro').backgroundColor,st('.tea-lifestyle').backgroundColor,st('.tea-contact').backgroundColor,st('.tea-directory-return').backgroundColor,...[...document.querySelectorAll('.tea-section')].map(x=>getComputedStyle(x).backgroundColor)];
    const pairs=[
     ['contact-copy',st('.tea-contact__copy p').color,st('.tea-contact__inner').backgroundColor],
     ['contact-kicker',st('.tea-contact__kicker').color,st('.tea-contact__inner').backgroundColor],
     ['photo-caption',st('.tea-photo figcaption span').color,st('.tea-photo figcaption').backgroundColor],
     ['return-button',st('.tea-directory-return__link').color,st('.tea-directory-return__link').backgroundColor],
     ['section-copy',st('.tea-section__head p').color,getComputedStyle(el('.tea-section')).backgroundColor],
     ['breadcrumb',st('.tea-breadcrumb').color,'rgb(255, 255, 255)']
    ];
    return {
     nav:nav.map(a=>({href:a.getAttribute('href'),current:a.getAttribute('aria-current')})),
     header:!!el('header.qily-site-header.qily-global-header'),
     sections:sections.length,images:document.querySelectorAll('main.tea-page img').length,captions:photoCaptions.length,
     dark:document.querySelectorAll('[data-qily-dark-surface="true"]').length,
     body: getComputedStyle(document.body).backgroundColor,
     contact:st('.tea-contact').backgroundColor,contactCard:st('.tea-contact__inner').backgroundColor,
     returnBg:st('.tea-directory-return__link').backgroundColor,returnFg:st('.tea-directory-return__link').color,
     fonts:[st('.tea-contact__copy p').fontSize,st('.tea-section__head p').fontSize,st('.tea-photo figcaption span').fontSize,st('.tea-page-heading h1').fontSize],
     large, pairs,
     fits:[st('.tea-hero img').objectFit,st('.tea-photo img').objectFit,st('.tea-product-card__image img').objectFit,st('.tea-lifestyle img').objectFit,st('.tea-flower-note img').objectFit],
     overflow:document.documentElement.scrollWidth>innerWidth+1,
     viewport:{width:innerWidth,height:innerHeight}
    };
   });
   assert(m.header,name+': global shared header missing');
   assert(m.nav.length===10&&m.nav.every((a,i)=>a.href===navExpected[i]),name+': global navigation differs from canonical order');
   assert(m.nav[8].current==='page',name+': Resource Collaboration active state missing');
   assert(m.sections===8&&m.images===19&&m.captions===12,name+': page structure/image count changed');
   assert(m.dark===0,name+': legacy dark-surface marker remains');
   assert(m.body==='rgb(255, 255, 255)'&&m.contact==='rgb(238, 247, 245)'&&m.contactCard==='rgb(255, 255, 255)',name+': page/contact surface palette mismatch');
   assert(m.returnBg==='rgb(15, 75, 90)'&&m.returnFg==='rgb(255, 255, 255)',name+': return button contrast mismatch');
   assert(m.fonts[0]==='20px'&&m.fonts[1]==='20px'&&m.fonts[2]==='20px'&&parseFloat(m.fonts[3])>=30,name+': text-size floor mismatch '+m.fonts.join(','));
   const approved=['rgb(255, 255, 255)','rgb(238, 247, 245)','rgb(247, 251, 250)'];
   assert(m.large.every(c=>approved.includes(c)),name+': non-standard large-area background '+JSON.stringify(m.large));
   assert(m.fits.every(v=>v==='contain'),name+': image cropping detected '+m.fits.join(','));
   assert(!m.overflow,name+': horizontal overflow');
   const ratios=m.pairs.map(([label,fg,bg])=>({label,ratio:+ratio(fg,bg).toFixed(2),fg,bg}));
   assert(ratios.every(x=>x.ratio>=4.5),name+': WCAG AA contrast failure '+JSON.stringify(ratios));
   m.contrastRatios=ratios;m.imageLoad=imgs;
   fs.writeFileSync(path.join(out,name+'-computed.json'),JSON.stringify(m,null,2));
   await page.screenshot({path:path.join(out,name+'-full-page.png'),fullPage:true,animations:'disabled'});
   results.push({viewport:name,pass:true,sections:m.sections,images:imgs.length,navLinks:m.nav.length,overflow:m.overflow,contrast:ratios.map(x=>x.ratio)});
   await page.close();
  }
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({status:'passed',url:base,results},null,2));
  console.log(JSON.stringify({status:'passed',results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});