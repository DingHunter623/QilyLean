#!/usr/bin/env node
'use strict';

/* QilyLean mobile Dock + primary-navigation closure｜2026-09-06 R2
 * Goals:
 * 1) Seven fixed-bottom actions use concise approved names: 首页 / 顶部 / 上一层级 / 上一网页 / 本站搜索 / 分享当前 / 联系我们.
 * 2) Phone layout keeps all seven actions visible; four-character labels render as two rows of two characters.
 * 3) The first and last button borders remain fully visible in normal, hover, focus and active states.
 * 4) Mobile Dock owns the real viewport width and is not reduced by legacy visual-system 50/52px rules.
 * 5) Primary navigation remains authoritative at first paint: 精益生产 and 资源协同 are static source labels.
 */
const fs=require('fs');
const path=require('path');
const cp=require('child_process');

const ROOT=path.resolve(__dirname,'..');
const APPLY=process.argv.includes('--apply');
const DOCK_PATCH='20260924-footer-like-fixed-r1';
const NAV_PATCH='20260906-primary-first-paint-v1';
const CORE_VERSION='20260906-primary-first-paint-core-v31';
const LEGACY_VERSION='20260906-primary-first-paint-legacy-v24';
const CANONICAL_ROUTES=[
  ['首页','/'],['履历主线','/experience/'],['能力体系','/capabilities/'],['改善工具','/improvements/'],
  ['精益生产','/lean-production/'],['代表项目','/projects/'],['信任中心','/trust/'],['项目合作','/cooperation/'],
  ['知识资产','/knowledge/'],['资源协同','/links/']
];

function abs(rel){return path.join(ROOT,rel);}
function read(rel){return fs.readFileSync(abs(rel),'utf8');}
function write(rel,content){
  const file=abs(rel),out=content.endsWith('\n')?content:content+'\n';
  const before=fs.readFileSync(file,'utf8');
  if(before===out)return false;
  if(APPLY)fs.writeFileSync(file,out,'utf8');
  return true;
}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function trackedHtml(){return cp.execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);}
function replaceRange(text,startNeedle,endNeedle,replacement,fromIndex=0){
  const s=text.indexOf(startNeedle,fromIndex);assert(s>=0,'missing marker: '+startNeedle.slice(0,80));
  const e=text.indexOf(endNeedle,s+startNeedle.length);assert(e>=0,'missing marker: '+endNeedle.slice(0,80));
  return text.slice(0,s)+replacement+text.slice(e);
}
function patchFile(rel,mutator){const before=read(rel),after=mutator(before);return after!==before?write(rel,after):false;}

function patchDockRuntime(){
  /* Dock geometry is owned directly by site-dock-share-runtime-v1.js.
   * Do not regenerate the footer layout from this historical remediation workflow.
   */
  return false;
}

function patchVisualSystem(){
  /* site-visual-system-v2.css carries a narrow R3 compatibility bridge only. */
  return false;
}

function patchValidator(){
  /* The dedicated Dock validator is authoritative and must not be rewritten here. */
  return false;
}

function patchBrowserSpec(){
  /* Playwright regression is maintained directly with the footer-style contract. */
  return false;
}

function patchNormalizer(){
  /* Cache normalizer owns its own footer-style contract. */
  return false;
}

function patchPersistentDockReferences(){
  const files=['scripts/materialize-global-language-v3.js','scripts/materialize-contact-route-v6.js','scripts/migrate-dock-v56-cache.js','scripts/validate-sitewide-visual-closure-v27.js'];
  let changed=0;
  for(const rel of files){if(!fs.existsSync(abs(rel)))continue;if(patchFile(rel,src=>src.replace(/\/site-dock-share-runtime-v1\.js\?v=20260906-authority-v58-mobile-swipe-fixed-bottom(?:&patch=[^'"\s]*)?/g,`/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=${DOCK_PATCH}`)))changed++;}
  return changed;
}
function patchHtmlCacheRefs(){
  let changed=0;for(const rel of trackedHtml())if(patchFile(rel,html=>html.replace(/\/site-dock-share-runtime-v1\.js\?v=([^"'&\s>]+)(?:&patch=[^"'\s>]*)?/g,`/site-dock-share-runtime-v1.js?v=$1&patch=${DOCK_PATCH}`).replace(/\/site-navigation\.js\?v=([^"'&\s>]+)(?:&patch=[^"'\s>]*)?/g,`/site-navigation.js?v=$1&patch=${NAV_PATCH}`)))changed++;return changed;
}

function validatePrimaryNavigation(){
  const core=read('site-navigation-core.js');assert(core.includes("['精益生产', '/lean-production/']"),'精益生产 missing in navigation core');assert(core.includes("['资源协同', '/links/']"),'资源协同 missing in navigation core');assert(!core.includes("['友情链接', '/links/']"),'友情链接 returned to navigation core');
  const wrapper=read('site-navigation.js');assert(wrapper.includes(CORE_VERSION),'navigation core cache mismatch');assert(wrapper.includes(LEGACY_VERSION),'legacy navigation cache mismatch');
  let checked=0;for(const rel of trackedHtml()){const html=read(rel),headers=html.match(/<header\b[\s\S]*?<\/header>/gi)||[];for(const header of headers){const navs=header.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)||[];for(const nav of navs){const hits=CANONICAL_ROUTES.filter(([,href])=>nav.includes(`href=\"${href}\"`)||nav.includes(`href='${href}'`)).length;if(hits<5)continue;checked++;assert(!/>\s*友情链接\s*<\/a>/i.test(nav),rel+': first-paint 友情链接 remains');assert(/href=["']\/links\/["'][^>]*>\s*资源协同\s*<\/a>/i.test(nav),rel+': first-paint 资源协同 missing');}}}return checked;
}
function validateDock(){
  const dock=read('site-dock-share-runtime-v1.js');
  for(const token of [
    "home:['首页']","top:['顶部']","back:['上一层级']","previous:['上一网页']","search:['本站搜索']","current:['分享当前']","contact:['联系我们']",
    'border-top:3px solid #c8a25a!important','background:#0f4b5a!important',
    'mobile-fixed-bottom-footer-navigation','v5.8-fixed-bottom-footer-navigation',
    "setImportant(dock,'display','flex')","setImportant(dock,'flex-wrap','wrap')",
    "setImportant(button,'flex','0 0 calc((100% - 12px)/4)'",
    'box-shadow:inset 0 0 0 2px rgba(255,227,155,.24)!important'
  ])assert(dock.includes(token),'Dock footer R1 missing '+token);
  assert(!dock.includes('mobile-fixed-bottom-compact-navigation'),'retired compact mobile Dock returned');
  assert(!dock.includes('mobile-fixed-bottom-swipe-navigation'),'retired swipe Dock returned');
  const visual=read('site-visual-system-v2.css');
  assert(visual.includes('QilyLean Dock V5.8 footer-style authority bridge R3'),'visual-system footer Dock bridge missing');
  assert(visual.includes('flex-wrap:wrap!important'),'visual-system mobile footer wrap bridge missing');
}

let changed=0;
changed+=patchDockRuntime()?1:0;
changed+=patchVisualSystem()?1:0;
changed+=patchValidator()?1:0;
changed+=patchBrowserSpec()?1:0;
changed+=patchNormalizer()?1:0;
changed+=patchPersistentDockReferences();
changed+=patchHtmlCacheRefs();
validateDock();
const checked=validatePrimaryNavigation();
console.log(`${APPLY?'APPLY':'CHECK'} PASS: footer-style Dock + first-paint navigation closure; changed=${changed}; primaryNavBlocks=${checked}.`);
