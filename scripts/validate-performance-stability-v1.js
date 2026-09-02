#!/usr/bin/env node
'use strict';

/* QilyLean performance + translation stability gate V1 | 2026-09-02 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const materialized=process.argv.includes('--materialized');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{throw new Error(`Performance/stability validation failed: ${message}`);};
const must=(source,token,label)=>{if(!source.includes(token))fail(`${label}: missing ${token}`);};
const forbid=(source,token,label)=>{if(source.includes(token))fail(`${label}: forbidden ${token}`);};

const translation=read('site-translation-safe-runtime-v1.js');
for(const [token,label] of [
  [`Google Translate Header Runtime V1.4`,`single Google runtime`],
  [`stable fast-path`,`stable translation fast-path`],
  [`data-qily-translation-layout','stable-fast-path-v1`,`stable translator geometry marker`],
  [`grid-template-rows','38px 13px`,`reserved translator rows`],
  [`min-height','60px`,`reserved translator height`],
  [`function warmGoogleConnections()`,`Google connection warm-up`],
  [`preconnect','https://translate.google.com`,`Google element preconnect`],
  [`preconnect','https://translate.googleapis.com`,`Google static preconnect`],
  [`function stabilizeTranslationReflow()`,`translation reflow guard`],
  [`overflow-anchor','none`,`scroll anchoring guard`],
  [`scroll-behavior','auto`,`translation scroll stability`],
  [`loadGoogleAfterPage`,`fast translation start`]
])must(translation,token,label);
for(const token of [`setTimeout(`,`setInterval(`,`new MutationObserver`,`location.reload`,`location.assign(`,`location.replace(`,`createTreeWalker`])forbid(translation,token,'translation runtime');

const prefetch=read('site-native-prefetch-v1.js');
for(const [token,label] of [
  [`R7 intent navigation prefetch V2`,`intent-prefetch runtime`],
  [`mode: 'native-navigation-plus-intent-prefetch'`,`intent-only contract`],
  [`backgroundWarm: false`,`no background warm`],
  [`competesWithFirstPaint: false`,`first-paint bandwidth contract`],
  [`d.addEventListener('pointerover'`,`desktop intent prefetch`],
  [`d.addEventListener('touchstart'`,`touch intent prefetch`],
  [`d.addEventListener('focusin'`,`keyboard intent prefetch`]
])must(prefetch,token,label);
for(const token of [`requestIdleCallback`,`setTimeout(`,`function warmPrimary`,`qily-r6-prefetch`])forbid(prefetch,token,'intent-prefetch runtime');

const nativeNav=read('site-music-persistent-navigation-v1.js');
must(nativeNav,`mode: 'native-only-v7'`,'native navigation contract');
must(nativeNav,'domSwap: false','no DOM swap');
must(nativeNav,'staleDocumentCacheRisk: false','stale-document reuse guard');

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,`const NATIVE_PREFETCH='/site-native-prefetch-v1.js?v=20260902-intent-prefetch-v2'`,'intent-prefetch cache owner');
must(materializer,`const TRANSLATION_FAST_REV='20260902-stable-fast-path-v2'`,'translation fast-path cache revision');
must(materializer,`next=next.replace(/\/site-native-prefetch-v1\.js`,'sitewide intent-prefetch materialization');

const home=read('index.html');
must(home,'qilyR2CriticalFirstPaintGuard','first-paint guard');
must(home,'visibility:visible!important','first paint stays visible');
forbid(home,'visibility:hidden!important','first-paint hiding');

if(materialized){
  const files=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  const ownership=file=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(file);
  let audited=0;
  for(const file of files){
    const html=read(file);
    if(ownership(file)||!/<\/head>/i.test(html))continue;
    audited++;
    if(html.includes('/site-native-prefetch-v1.js')&&!html.includes('/site-native-prefetch-v1.js?v=20260902-intent-prefetch-v2'))fail(`${file}: stale native-prefetch cache token`);
    must(html,'/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16&fast=20260902-stable-fast-path-v2',`${file} stable translation revision`);
  }
  if(audited<460)fail(`public-page coverage too low: ${audited}`);
}

console.log(`PASS: QilyLean keeps first paint visible, Google translation uses reserved geometry + connection warm-up, and module navigation uses native full-page routing with intent-only prefetch${materialized?' across the materialized public site':''}.`);
