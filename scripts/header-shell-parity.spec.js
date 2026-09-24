const { test, expect } = require('@playwright/test');

const INT_BASE=process.env.QILY_INT_BASE||'http://127.0.0.1:4173';
const CN_BASE=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';

async function measure(page,url,kind){
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1000);
  return page.evaluate((kind)=>{
    const header=kind==='int'
      ? document.querySelector('header.qily-site-header,header.qily-global-header,header.topbar')
      : document.querySelector('header.site-header');
    if(!header) throw new Error('header missing');
    const brand=header.querySelector('.brand,.qily-brand');
    const nav=header.querySelector('nav');
    const first=nav&&[...nav.querySelectorAll('a[href]')].find(a=>{
      const cs=getComputedStyle(a),r=a.getBoundingClientRect();
      return (a.textContent||'').trim() && r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden' && parseFloat(cs.fontSize)>0;
    });
    const rail=header.querySelector('.qily-primary-nav-scroll-rail');
    const translator=header.querySelector('.qily-web-translate,.qily-cn-translate');
    const hr=header.getBoundingClientRect();
    const rr=x=>x?x.getBoundingClientRect():null;
    const br=rr(brand),nr=rr(first),railr=rr(rail),tr=rr(translator);
    const hero=document.querySelector('main>section,.hero,.module-hero,.page-hero');
    const heror=rr(hero);
    return {
      viewport:{w:innerWidth,h:innerHeight},
      header:{top:hr.top,bottom:hr.bottom,height:hr.height},
      brand:br&&{top:br.top,bottom:br.bottom,height:br.height,topGap:br.top-hr.top,bottomGap:hr.bottom-br.bottom},
      nav:nr&&{top:nr.top,bottom:nr.bottom,height:nr.height,topGap:nr.top-hr.top,bottomGap:hr.bottom-nr.bottom},
      rail:railr&&{top:railr.top,bottom:railr.bottom,height:railr.height,topGap:railr.top-hr.top,bottomGap:hr.bottom-railr.bottom},
      translator:tr&&{top:tr.top,bottom:tr.bottom,height:tr.height,topGap:tr.top-hr.top,bottomGap:hr.bottom-tr.bottom},
      heroTop:heror&&heror.top,
      css:{
        headerPaddingTop:getComputedStyle(header).paddingTop,
        headerPaddingBottom:getComputedStyle(header).paddingBottom,
        navPaddingTop:nav?getComputedStyle(nav).paddingTop:null,
        navPaddingBottom:nav?getComputedStyle(nav).paddingBottom:null,
        navFontFamily:first?getComputedStyle(first).fontFamily:null,
        navFontSize:first?getComputedStyle(first).fontSize:null,
        navFontWeight:first?getComputedStyle(first).fontWeight:null,
        navLineHeight:first?getComputedStyle(first).lineHeight:null
      }
    };
  },kind);
}

test('international and CN desktop header geometry probe',async({browser})=>{
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  const intl=await measure(page,INT_BASE+'/?parity=probe','int');
  const cn=await measure(page,CN_BASE+'/?parity=probe','cn');
  console.log('HEADER_PARITY_INT='+JSON.stringify(intl));
  console.log('HEADER_PARITY_CN='+JSON.stringify(cn));
  expect(intl.header.height).toBeGreaterThan(60);
  expect(cn.header.height).toBeGreaterThan(60);
  const near=(a,b,t,label)=>expect(Math.abs(a-b),label+' delta').toBeLessThanOrEqual(t);
  near(intl.header.height,cn.header.height,1.5,'header height');
  near(intl.brand.topGap,cn.brand.topGap,2,'brand top gap');
  near(intl.nav.topGap,cn.nav.topGap,1.5,'nav top gap');
  near(intl.translator.topGap,cn.translator.topGap,2,'translator top gap');
  expect(cn.rail.bottomGap,'CN rail bottom breathing room').toBeGreaterThanOrEqual(8);
  expect(cn.rail.bottomGap,'CN rail bottom breathing room').toBeLessThanOrEqual(14);
  expect(intl.css.navFontWeight,'international primary nav weight').toBe('900');
  expect(cn.css.navFontWeight,'CN primary nav weight').toBe('900');
  expect(intl.css.navFontWeight,'primary nav weight parity').toBe(cn.css.navFontWeight);
  near(parseFloat(intl.css.navFontSize),parseFloat(cn.css.navFontSize),0.5,'primary nav font size');
  near(parseFloat(intl.css.navLineHeight),parseFloat(cn.css.navLineHeight),0.5,'primary nav line height');
  await page.close();
});
