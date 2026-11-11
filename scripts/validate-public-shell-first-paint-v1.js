#!/usr/bin/env node
'use strict';

// Paint prerequisites are checked independently of the runtime's DOM markers.
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const {
  ROOT,FORMAL_CSS_HREF,DOCK_RUNTIME_SRC,dockRuntimeSrc,ORDER,LABELS,DOCK_STYLE_ID,
  DOCK_SPACER_ID,HEADER_STYLE_ID,HEADER_CSS,HEADER_ROUTES,TRANSLATION_CSS_HREF,criticalDockCss,isEligible,materialize,NAV_RAIL_REV,FIRST_PAINT_REV,NAVIGATION_INPUT_REV
}=require('./materialize-public-shell-first-paint-v1.js');
const assert=(ok,message)=>{if(!ok)throw new Error(`Public first paint: ${message}`);};
const cnShell=require('./materialize-cn-footer-actions-v2.js');
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const countId=(source,id)=>(source.match(new RegExp(`\\bid=["']${id}["']`,'g'))||[]).length;
const files=execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).trim().split(/\r?\n/).filter(Boolean);
let eligible=0,cacheCovered=0,cnEligible=0,cnPages=0;

for(const relative of files){
  const source=read(relative);
  if(relative.startsWith('cn-site/')){
    assert(cnShell.materialize(source)===source,relative+': CN public shell materializer has drifted');
    const cnHeader=source.match(/<header\b[^>]*\bclass=["'][^"']*\bsite-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>/i);
    if(cnHeader){
      const nav=cnHeader[0].match(/<nav\b[^>]*\bclass=["'][^"']*\bnav\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
      assert(nav,relative+': CN static header primary nav missing');
      assert(/class=["'][^"']*\bqily-cn-nav-shell\b/i.test(cnHeader[0]),relative+': CN nav shell must be static');
      assert(/id=["']qilyCnPrimaryNavigation["']/.test(nav[0]),relative+': CN static nav id missing');
      assert(/data-qily-cn-nav-rail=["']static-v1["']/.test(nav[0]),relative+': CN static nav rail hydration marker missing');
      assert(/class=["'][^"']*\bqily-primary-nav-scroll-rail\b/.test(cnHeader[0]),relative+': CN scroll rail must paint with header');
      const mainIndex=source.indexOf('<main');
      assert(mainIndex<0||source.indexOf(cnHeader[0])<mainIndex,relative+': CN header must precede page content');
      if(/cn-translate-baidu-v1\.js/.test(source)){
        assert(/id=["']qilyCnTranslateV3["'][^>]*data-qily-static-first-paint=["']v1["']/.test(cnHeader[0]),relative+': CN translation utility must be static');
        assert(/cn-translate-baidu-v1\.css/.test(source),relative+': CN translation utility CSS missing');
      }
      cnPages++;
    }
    const cnFooter=source.match(/<footer\b[^>]*\bclass=["']footer["'][^>]*>[\s\S]*?<\/footer>/i);
    if(cnFooter){
      const dock=cnFooter[0].match(/<nav\b[^>]*\bid=["']floatDock["'][^>]*>([\s\S]*?)<\/nav>/i);
      assert(dock,relative+': CN static footer dock missing');
      const actions=[...dock[1].matchAll(/<button\b[^>]*\bdata-action=["']([^"']+)["']/gi)].map(m=>m[1]);
      assert(actions.join(',')===cnShell.ACTIONS.join(','),relative+': CN footer must contain four canonical static actions');
      const records=cnShell.filings(cnFooter[0]);
      assert(records.includes('湘ICP备2026041143号-1')&&records.includes('湘公网安备43020002000443号'),relative+': CN footer filing records missing');
    }
    cnEligible++;
    continue;
  }
  if(!isEligible(relative,source)){
    if(source.includes('<footer class="cn-bridge-footer">')){assert(source.includes('data-qily-stable-order="top,previous,search,current"'),`${relative}: shared four-action footer missing`);}else assert(!source.includes('data-qily-first-paint-dock="v1"'),`${relative}: independent shell received international menu`);
    continue;
  }
  eligible++;
  assert(materialize(source,relative)===source,`${relative}: generator first-paint contract has drifted`);
  const head=source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const body=source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  assert(head&&body,`${relative}: complete head/body required`);
  const formal=head[1].match(/<link\b[^>]*\bid=["']qilyViV4Formal["'][^>]*>/i);
  assert(formal&&formal[0].includes(FORMAL_CSS_HREF),`${relative}: current formal CSS must be present in head`);
  assert(/\brel=["']stylesheet["']/i.test(formal[0])&&!/\b(?:disabled|onload|media)\s*(?:=|>)/i.test(formal[0]),`${relative}: formal CSS must block the first paint`);
  assert(countId(source,'qilyViV4Formal')===1,`${relative}: duplicate formal CSS owner`);
  assert(countId(source,DOCK_STYLE_ID)===1,`${relative}: duplicate/missing critical menu style`);
  assert(countId(source,HEADER_STYLE_ID)===1,`${relative}: duplicate/missing critical header style`);
  const headerStyle=head[1].match(new RegExp(`<style\\b[^>]*\\bid=["']${HEADER_STYLE_ID}["'][^>]*>([\\s\\S]*?)<\\/style>`,'i'));
  assert(headerStyle&&headerStyle[1]===HEADER_CSS,`${relative}: critical header CSS must match the canonical first-paint owner`);

  const critical=head[1].match(new RegExp(`<style\\b[^>]*\\bid=["']${DOCK_STYLE_ID}["'][^>]*>([\\s\\S]*?)<\\/style>`,'i'));
  assert(critical&&critical[1]===criticalDockCss,`${relative}: critical menu CSS must match its canonical runtime owner`);
  assert(countId(source,'floatDock')===1,`${relative}: duplicate/missing menu`);
  const dock=body[1].match(/^\s*(<nav\b[^>]*\bid=["']floatDock["'][^>]*>[\s\S]*?<\/nav>)/i);
  assert(dock,`${relative}: menu must parse before page content`);
  const afterDock=body[1].slice(dock[0].length);
  const header=afterDock.match(/^\s*(<header\b[^>]*>[\s\S]*?<\/header>)/i);
  assert(header,relative+': static public header must immediately follow the Dock before page content');
  assert(/class=["'][^"']*\bqily-site-header\b[^"']*\bqily-global-header\b/i.test(header[1]),relative+': public header must use the governed global shell classes');
  assert(/data-qily-public-shell-first-paint=["']v2["']/i.test(header[1]),relative+': static header first-paint marker missing');
  const nav=header[1].match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
  const brand=header[1].match(/<a\b[^>]*\bclass=["'][^"']*\bqily-brand\b[^"']*["'][^>]*>/i);
  assert(nav&&brand,relative+': static header must contain its brand and primary navigation');
  const hrefs=[...nav[1].matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m=>m[1]);
  assert(hrefs.length===HEADER_ROUTES.length&&HEADER_ROUTES.every((route,i)=>hrefs[i]===route[1]),relative+': static primary navigation must match the canonical route order');
  const mainIndex=source.indexOf('<main');
  assert(mainIndex<0||source.indexOf(header[1])<mainIndex,relative+': global navigation must precede page content');


  if(/site-translation-safe-runtime-v1\.js|site-global-language-v3\.js/.test(source)){
    assert(header[1].includes('id="qilyGlobalTranslationDualRouteV2"'),\`\${relative}: international translation utility must be static\`);
    assert(header[1].includes('data-qily-static-first-paint="v1"'),\`\${relative}: international translation utility first-paint marker missing\`);
    assert(head[1].includes(TRANSLATION_CSS_HREF),\`\${relative}: translation utility stylesheet must load before paint\`);
  }

  const actions=[...dock[1].matchAll(/<button\b[^>]*\bdata-action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/button>/gi)];
  assert(actions.length===ORDER.length&&actions.map(match=>match[1]).join(',')===ORDER.join(','),`${relative}: canonical four menu actions required`);
  for(const match of actions){
    const text=match[2].replace(/<[^>]*>/g,'').replace(/\s+/g,'').trim();
    const label=LABELS[ORDER.indexOf(match[1])];
    assert(text===label,`${relative}: ${match[1]} visible label changed`);
    assert(/\btype=["']button["']/i.test(match[0]),`${relative}: ${match[1]} must not submit a page form`);
  }
  assert(countId(source,DOCK_SPACER_ID)===1,`${relative}: duplicate/missing bottom-content reserve`);
  assert(new RegExp(`<div\\b[^>]*\\bid=["']${DOCK_SPACER_ID}["'][^>]*>\\s*<\\/div>\\s*$`,'i').test(body[1]),`${relative}: bottom-content reserve must be the final body element`);
  const dockRuntime=[...source.matchAll(/<script\b[^>]*\bsrc=["']([^"']*site-dock-share-runtime-v1\.js[^"']*)["'][^>]*>\s*<\/script>/gi)];
  assert(dockRuntime.length===1&&dockRuntime[0][1]===dockRuntimeSrc(relative),`${relative}: one direct current menu runtime required`);
  assert(/\bdefer\b/i.test(dockRuntime[0][0]),`${relative}: menu runtime must not delay parsing`);
  for(const tag of source.match(/<(?:script|link)\b[^>]*(?:site-interaction-semantics-v1\.js|site-visual-authority-r8\.css)[^>]*>/gi)||[]){
    assert(tag.includes(`rail=${NAV_RAIL_REV}`),`${relative}: changed navigation source has stale cache URL`);
    if(tag.includes('/site-interaction-semantics-v1.js?'))assert(tag.includes(`input=${NAVIGATION_INPUT_REV}`),`${relative}: rail input guard has stale cache URL`);
    cacheCovered++;
  }
  for(const tag of source.match(/<script\b[^>]*(?:site-navigation\.js|site-brand-home-feedback-v1\.js|site-contact-route-v1\.js)[^>]*>/gi)||[]){
    assert(tag.includes(`firstpaint=${FIRST_PAINT_REV}`),`${relative}: shared shell bootstrap has stale cache URL`);
    if(tag.includes('/site-navigation.js?'))assert(tag.includes(`input=${NAVIGATION_INPUT_REV}`),`${relative}: navigation input guard has stale cache URL`);
  }
}

assert(eligible>450,`unexpected international shell coverage: ${eligible}`);
assert(cacheCovered>=eligible,`unexpected navigation cache coverage: ${cacheCovered}/${eligible}`);
assert(cnEligible>50,`unexpected China-site shell coverage: ${cnEligible}`);
assert(cnPages>50,`unexpected China-site header coverage: ${cnPages}`);
const dailyIndex=read('qilylean/daily-insights.html');
for(const date of ['2026-11-08','2026-10-25']){
  assert(dailyIndex.includes('data-date="'+date+'" data-qily-lecture="available"'),`daily brief ${date} must be marked as having a real lecture`);
  assert(dailyIndex.includes('/qilylean/daily/'+date+'.html#qily-lecture'),`daily brief ${date} needs a one-click lecture destination`);
}
assert(read('improvements/index.html').includes('/improvements/visual/#qily-lecture'), 'visual-management paper needs a one-click lecture destination');
for(const path of ['qilylean/daily/2026-11-08.html','qilylean/daily/2026-10-25.html','improvements/visual/index.html']){
  assert(read(path).includes('class="qily-lecture-icon"'),path+': visible headset icon missing from lecture entry');
}
assert(!dailyIndex.includes('data-date="2026-11-10" data-qily-lecture="available"'),'brief without a lecture must not receive the lecture badge');
const vi=read('site-vi-standard-v4.css');
const dockTransition=vi.split('::view-transition-group(qily-public-dock)')[1]?.split('/* 10 |')[0]||'';
assert(dockTransition&&!/transform\\s*:\\s*none/i.test(dockTransition),'native view-transition group must preserve browser-computed Dock geometry');
const semanticContract=vi.split('QILY-FULL-SITE-HERO-LABEL-VI-V1')[1].split('/* 04 | Typography hierarchy. */')[0];
assert(semanticContract&&!/html\[data-qily-vi-version|body\[data-qily-vi-shell/.test(semanticContract),'semantic label paint must not wait for JavaScript shell markers');
for(const token of ['var(--qily-vi-gold-light)!important','font-weight:400!important','border:0!important','border-radius:0!important','padding:0!important','background:transparent!important']){
  assert(semanticContract.includes(token),`semantic label first-paint contract missing ${token}`);
}
console.log(`PASS: ${eligible} international pages and ${cnEligible} China pages have static first-paint public shells; ${cnPages} China headers, audio module badges and Dock transition geometry verified; navigation cache references=${cacheCovered}.`);
