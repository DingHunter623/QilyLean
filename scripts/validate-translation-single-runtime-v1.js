#!/usr/bin/env node
'use strict';

/* Google Translate single-runtime / no-callback-storm gate | V32 | 2026-08-31 */
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
must(safe,'Google Translate Header Runtime V1.3','authoritative runtime');
must(safe,'This file is the only public translation lifecycle owner','ownership contract');
must(safe,"includedLanguages:'zh-CN,zh-TW,en'",'public languages');
must(safe,"'zh-CN':'中文简体'",'Simplified Chinese label');
must(safe,"'zh-TW':'中文繁体'",'Traditional Chinese label');
must(safe,"'en':'English'",'English label');
must(safe,'__qilyGoogleTranslateElementInitialized','page-lifecycle initialization guard');
must(safe,'function existingGoogleScript()','single script lookup');
must(safe,'function recoverRetainedControlOnce()','bounded retained-node recovery');
must(safe,"d.addEventListener('qily:shell-ready',recoverRetainedControlOnce,{once:true})",'one-shot shell recovery');
if(count(safe,/new\s+w\.google\.translate\.TranslateElement\s*\(/g)!==1)fail('TranslateElement must be constructed at exactly one source location');
if(count(safe,/translate\.google\.com\/translate_a\/element\.js/g)!==1)fail('official Google element URL must appear exactly once');
if(count(safe,/w\.setTimeout\s*\(/g)!==1)fail('only the single post-initialization label decoration delay is allowed');
if(/new\s+MutationObserver\s*\(/.test(safe))fail('authoritative runtime must not install MutationObserver');
if(/\bsetInterval\s*\(/.test(safe))fail('authoritative runtime must not poll');
if(/\b(?:pageshow|qily:softnavigate)\b/.test(safe))fail('page lifecycle events must not reinitialize translation');
if(/(?:createTreeWalker|replaceChildren|location\.(?:reload|replace|assign)\s*\()/.test(safe))fail('page scan, DOM replacement, reload or redirect is forbidden');

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
  if(!html.includes('/site-translation-safe-runtime-v1.js?v=20260831-google-translate-single-runtime-v13'))fail(`${file}: authoritative runtime cache is stale`);
  if(!html.includes('/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23'))fail(`${file}: translation-neutral public redline cache is stale`);
  for(const retired of retiredFiles)if(html.includes(retired))fail(`${file}: retired runtime reference ${retired}`);
  if(html.includes('translate.google.com/translate_a/element.js'))fail(`${file}: official Google script must be loaded only by the authoritative runtime`);
}
if(audited<460)fail(`public-page coverage too low: ${audited}`);

const materializer=read('scripts/materialize-global-language-v3.js');
must(materializer,"const BASELINE_VERSION='20260831-google-translate-single-runtime-v32'",'materializer baseline');
must(materializer,"const TRANSLATION_SAFE_JS='/site-translation-safe-runtime-v1.js?v=20260831-google-translate-single-runtime-v13'",'materializer runtime cache');
must(materializer,"const PUBLIC_REDLINE_V2_JS='/site-public-redline-closure-v2.js?v=20260831-redline-no-translation-v23'",'materializer redline cache');

console.log(`PASS: ${audited} public pages use one Google Translate V1.3 runtime; TranslateElement/script/recovery are single-shot and no page-wide translation observer remains.`);
