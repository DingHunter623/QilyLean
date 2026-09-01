#!/usr/bin/env node
'use strict';

/* Google Translate single-runtime / reload-free mobile gate | V32 | 2026-09-01 */
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fail=message=>{throw new Error(`Translation single-runtime validation failed: ${message}`);};
const must=(source,token,label)=>{if(!source.includes(token))fail(`${label}: missing ${token}`);};
const forbid=(source,token,label)=>{if(source.includes(token))fail(`${label}: forbidden ${token}`);};
const count=(source,pattern)=>(source.match(pattern)||[]).length;

const safe=read('site-translation-safe-runtime-v1.js');
const publicCss=read('site-translation-public-ui-v1.css');
must(safe,'Google Translate Header Runtime V1.3','authoritative runtime');
must(safe,'reload-free mobile closure','performance closure');
must(safe,'This file is the only public translation lifecycle owner','ownership contract');
must(safe,"includedLanguages:'zh-CN,zh-TW,en'",'public languages');
must(safe,"+'&hl=en'",'Google-owned English label locale');
must(safe,'__qilyGoogleTranslateElementInitialized','page-lifecycle initialization guard');
must(safe,'function existingGoogleScript()','single script lookup');
must(safe,'function recoverRetainedControlOnce()','bounded retained-node recovery');
must(safe,'function loadGoogleAfterPage()','post-load Google scheduling');
must(safe,"d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true})",'one-shot shell recovery');
must(safe,"w.addEventListener('load',loadGoogleScriptOnce,{once:true})",'non-blocking page-load boundary');

if(count(safe,/new\s+w\.google\.translate\.TranslateElement\s*\(/g)!==1)fail('TranslateElement must be constructed at exactly one source location');
if(count(safe,/translate\.google\.com\/translate_a\/element\.js/g)!==1)fail('official Google element URL must appear exactly once');
if(count(safe,/w\.location\.reload\s*\(\s*\)/g)!==0)fail('translation runtime must not reload the page');
if(/\bsetTimeout\s*\(/.test(safe))fail('authoritative runtime must not use timing guesses');
if(/new\s+MutationObserver\s*\(/.test(safe))fail('authoritative runtime must not install MutationObserver');
if(/\bsetInterval\s*\(/.test(safe))fail('authoritative runtime must not poll');
if(/\b(?:pageshow|qily:softnavigate)\b/.test(safe))fail('page lifecycle events must not reinitialize translation');
if(/(?:createTreeWalker|replaceChildren|location\.(?:replace|assign|reload)\s*\()/.test(safe))fail('page scan, DOM replacement, redirect or reload is forbidden');
if(/qily_translate_debug|qilyTranslationDebug|DEBUG_ENABLED/.test(safe))fail('temporary diagnostics must not ship');
if(/(?:stabilizeMobileNav|matchMedia|touch-action|overflow-x|qily-primary-nav-scroll-rail)/.test(safe))fail('translation runtime must not own navigation behavior');
if(/(?:\.options\b|option\.(?:textContent|label)|decorateGoogleControl)/.test(safe))fail('Google-owned native options must not be rewritten');

must(publicCss,'select.goog-te-combo','eventual native Google select selector');
must(publicCss,'body > iframe.goog-te-banner-frame','legacy Google top banner suppression');
must(publicCss,'body > iframe.VIpgJd-ZVi9od-ORHb-OEVmcd','current Google top banner suppression');
must(publicCss,'body > iframe.VIpgJd-ZVi9od-xl07Ob-OEVmcd','new Google top banner suppression');
must(publicCss,'html.translated-ltr body','translated LTR body offset reset');
must(publicCss,'html.translated-rtl body','translated RTL body offset reset');
must(publicCss,'min-height:38px!important','complete native select height');
must(publicCss,'height:auto!important','non-clipping native select height');
must(publicCss,'font-size:13px!important','slightly smaller native select font');
must(publicCss,'line-height:20px!important','native select descender-safe line height');
must(publicCss,'margin-top:0!important','translated body margin reset');
must(publicCss,'20260901-google-attribution-nowrap-v2','single-line attribution cache');
if(/nav\.|qily-global-nav|site-nav|touch-action:\s*pan-x/.test(publicCss))fail('translation stylesheet must not own navigation layout or swipe behavior');

const attributionCss=read('site-translation-attribution-v1.css');
must(attributionCss,'white-space:nowrap!important','single-line Google attribution');
must(attributionCss,'font-size:10px!important','compact readable Google attribution');
must(attributionCss,'line-height:1.4!important','complete Google attribution line box');

const redline=read('site-public-redline-closure-v2.js');
must(redline,'Public Redline Closure V2.3','translation-neutral redline runtime');
must(redline,'Translation lifecycle and Google-owned DOM are intentionally outside this runtime','redline ownership boundary');
for(const token of ['qilyGlobalTranslationDualRouteV2','google_translate_element','goog-te-','PUBLIC_LANGS','prunePublicLanguages','cleanControl','qily:language-change'])forbid(redline,token,'public redline translation isolation');
if(/\.observe\s*\(\s*(?:d\.)?(?:documentElement|body)\b/.test(redline))fail('public redline must not observe the page-wide DOM');
if(/new\s+MutationObserver\s*\(/.test(redline)&&!redline.includes('searchObserver.observe(results,{childList:true,subtree:false})'))fail('only the bounded search-results observer may remain');

const retiredFiles=['site-global-language-v1.js','site-global-language-v1.css','site-global-language-v3.js','site-translation-progress-v1.js','site-translation-progress-v1.css','site-translation-public-ui-v1.js'];
for(const file of retiredFiles)if(fs.existsSync(path.join(root,file)))fail(`retired translation runtime still exists: ${file}`);

const siteRuntimeFiles=execFileSync('git',['ls-files','site-*.js'],{cwd:root,encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
for(const file of siteRuntimeFiles){
  if(file==='site-translation-safe-runtime-v1.js'||!fs.existsSync(path.join(root,file)))continue;
  const source=read(file);
  if(/TranslateElement|googleTranslateElementInit|translate\.google\.com\/translate_a\/element\.js/.test(source))fail(`second Google translation lifecycle owner: ${file}`);
  if(/qilyGlobalTranslationDualRouteV2|google_translate_element|goog-te-/.test(source)||/(?:getElementById|querySelector(?:All)?)\s*\([^)]*qily-web-translate/.test(source))fail(`second translator DOM owner: ${file}`);
}

const htmlFiles=execFileSync('git',['ls-files','*.html'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
const ownership=file=>/^(?:baidu_verify_|google[^/]*\.html$|zohoverify\/)/i.test(file);
let audited=0;
for(const file of htmlFiles){
  const html=read(file);
  if(ownership(file)||!/<\/head>/i.test(html))continue;
  audited++;
  const safeRefs=count(html,/site-translation-safe-runtime-v1\.js/g);
  if(safeRefs!==1)fail(`${file}: expected one authoritative runtime reference, found ${safeRefs}`);
  if(!html.includes('/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'))fail(`${file}: authoritative runtime cache is stale`);
  if(!html.includes('/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'))fail(`${file}: native Google UI cache is stale`);
  if(/(?:[?&]rev=|stable-diagnostic|qily_translate_debug)/.test(html))fail(`${file}: temporary translation diagnostics or stacked cache revision remains`);
  if(!html.includes('/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23'))fail(`${file}: translation-neutral public redline cache is stale`);
  for(const retired of retiredFiles)if(html.includes(retired))fail(`${file}: retired runtime reference ${retired}`);
  if(html.includes('translate.google.com/translate_a/element.js'))fail(`${file}: official Google script must be loaded only by the authoritative runtime`);
}
if(audited<460)fail(`public-page coverage too low: ${audited}`);

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'materializer baseline');
must(materializer,"const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260901-google-translate-single-runtime-v16'",'materializer runtime cache');
must(materializer,"const TRANSLATION_PUBLIC_CSS='/site-translation-public-ui-v1.css?v=20260901-google-translate-mobile-ui-v16'",'materializer native UI cache');
must(materializer,"const PUBLIC_REDLINE_V2_JS='/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23'",'materializer redline cache');

console.log(`PASS: ${audited} public pages use one reload-free post-load Google Translate V1.3 runtime; Google assets remain single-shot, native options stay Google-owned and translation never owns navigation.`);
