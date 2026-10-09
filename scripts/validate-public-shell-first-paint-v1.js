#!/usr/bin/env node
'use strict';

// Paint prerequisites are checked independently of the runtime's DOM markers.
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const {
  ROOT,FORMAL_CSS_HREF,DOCK_RUNTIME_SRC,ORDER,LABELS,DOCK_STYLE_ID,
  DOCK_SPACER_ID,criticalDockCss,isEligible,materialize,NAV_RAIL_REV,FIRST_PAINT_REV,NAVIGATION_INPUT_REV
}=require('./materialize-public-shell-first-paint-v1.js');
const assert=(ok,message)=>{if(!ok)throw new Error(`Public first paint: ${message}`);};
const read=relative=>fs.readFileSync(path.join(ROOT,relative),'utf8');
const countId=(source,id)=>(source.match(new RegExp(`\\bid=["']${id}["']`,'g'))||[]).length;
const files=execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).trim().split(/\r?\n/).filter(Boolean);
let eligible=0,cacheCovered=0;

for(const relative of files){
  const source=read(relative);
  if(!isEligible(relative,source)){
    assert(!source.includes('data-qily-first-paint-dock="v1"'),`${relative}: independent shell received international menu`);
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
  const critical=head[1].match(new RegExp(`<style\\b[^>]*\\bid=["']${DOCK_STYLE_ID}["'][^>]*>([\\s\\S]*?)<\\/style>`,'i'));
  assert(critical&&critical[1]===criticalDockCss,`${relative}: critical menu CSS must match its canonical runtime owner`);
  assert(countId(source,'floatDock')===1,`${relative}: duplicate/missing menu`);
  const dock=body[1].match(/^\s*(<nav\b[^>]*\bid=["']floatDock["'][^>]*>[\s\S]*?<\/nav>)/i);
  assert(dock,`${relative}: menu must parse before page content`);
  const actions=[...dock[1].matchAll(/<button\b[^>]*\bdata-action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/button>/gi)];
  assert(actions.length===7&&actions.map(match=>match[1]).join(',')===ORDER.join(','),`${relative}: canonical seven menu actions required`);
  for(const match of actions){
    const text=match[2].replace(/<[^>]*>/g,'').replace(/\s+/g,'').trim();
    const label=LABELS[ORDER.indexOf(match[1])];
    assert(text===label,`${relative}: ${match[1]} visible label changed`);
    assert(/\btype=["']button["']/i.test(match[0]),`${relative}: ${match[1]} must not submit a page form`);
  }
  assert(countId(source,DOCK_SPACER_ID)===1,`${relative}: duplicate/missing bottom-content reserve`);
  assert(new RegExp(`<div\\b[^>]*\\bid=["']${DOCK_SPACER_ID}["'][^>]*>\\s*<\\/div>\\s*$`,'i').test(body[1]),`${relative}: bottom-content reserve must be the final body element`);
  const dockRuntime=[...source.matchAll(/<script\b[^>]*\bsrc=["']([^"']*site-dock-share-runtime-v1\.js[^"']*)["'][^>]*>\s*<\/script>/gi)];
  assert(dockRuntime.length===1&&dockRuntime[0][1]===DOCK_RUNTIME_SRC,`${relative}: one direct current menu runtime required`);
  assert(/\bdefer\b/i.test(dockRuntime[0][0]),`${relative}: menu runtime must not delay parsing`);
  for(const tag of source.match(/<(?:script|link)\b[^>]*(?:site-interaction-semantics-v1\.js|site-visual-authority-r8\.css)[^>]*>/gi)||[]){
    assert(tag.includes(`rail=${NAV_RAIL_REV}`),`${relative}: changed navigation source has stale cache URL`);
    cacheCovered++;
  }
  for(const tag of source.match(/<script\b[^>]*(?:site-navigation\.js|site-brand-home-feedback-v1\.js|site-contact-route-v1\.js)[^>]*>/gi)||[]){
    assert(tag.includes(`firstpaint=${FIRST_PAINT_REV}`),`${relative}: shared shell bootstrap has stale cache URL`);
    if(tag.includes('/site-navigation.js?'))assert(tag.includes(`input=${NAVIGATION_INPUT_REV}`),`${relative}: navigation input guard has stale cache URL`);
  }
}

assert(eligible>450,`unexpected international shell coverage: ${eligible}`);
assert(cacheCovered>=eligible,`unexpected navigation cache coverage: ${cacheCovered}/${eligible}`);
const vi=read('site-vi-standard-v4.css');
const semanticContract=vi.split('QILY-FULL-SITE-HERO-LABEL-VI-V1')[1].split('/* 04 | Typography hierarchy. */')[0];
assert(semanticContract&&!/html\[data-qily-vi-version|body\[data-qily-vi-shell/.test(semanticContract),'semantic label paint must not wait for JavaScript shell markers');
for(const token of ['var(--qily-vi-gold-light)!important','font-weight:400!important','border:0!important','border-radius:0!important','padding:0!important','background:transparent!important']){
  assert(semanticContract.includes(token),`semantic label first-paint contract missing ${token}`);
}
console.log(`PASS: ${eligible} international pages have blocking formal VI, canonical menu CSS, seven static actions before content, one bottom reserve and one deferred runtime; navigation cache references=${cacheCovered}; labels paint without JavaScript markers.`);
