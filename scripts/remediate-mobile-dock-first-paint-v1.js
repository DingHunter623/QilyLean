#!/usr/bin/env node
'use strict';

/* QilyLean mobile Dock + primary-navigation first-paint closure｜2026-09-06
 * Goals:
 * 1) Mobile Dock is a fixed seven-column bottom navigation, matching the top-nav module language.
 * 2) Mobile labels shorten only 回首页/回顶部 to 首页/顶部; all seven actions remain available.
 * 3) No clipped left border/focus outline: mobile focus uses an internal ring and no translate.
 * 4) Primary navigation is authoritative in static HTML at first paint: 精益生产 is materialized;
 *    /links/ is displayed as 资源协同 from source, never 友情链接 -> 资源协同 after JavaScript.
 * 5) Cache-bust the navigation and Dock runtimes without breaking historical validator substrings.
 */
const fs=require('fs');
const path=require('path');
const cp=require('child_process');

const ROOT=path.resolve(__dirname,'..');
const APPLY=process.argv.includes('--apply');
const DOCK_PATCH='20260906-mobile-compact-fixed-r1';
const NAV_PATCH='20260906-primary-first-paint-v1';
const CORE_VERSION='20260906-primary-first-paint-core-v31';
const LEGACY_VERSION='20260906-primary-first-paint-legacy-v24';
const CANONICAL_ROUTES=[
  ['首页','/'],
  ['履历主线','/experience/'],
  ['能力体系','/capabilities/'],
  ['改善方法','/improvements/'],
  ['精益生产','/lean-production/'],
  ['代表项目','/projects/'],
  ['信任中心','/trust/'],
  ['项目合作','/cooperation/'],
  ['知识资产','/knowledge/'],
  ['资源协同','/links/']
];

function abs(rel){return path.join(ROOT,rel);}
function read(rel){return fs.readFileSync(abs(rel),'utf8');}
function write(rel,content){
  const file=abs(rel); const out=content.endsWith('\n')?content:content+'\n';
  const before=fs.readFileSync(file,'utf8');
  if(before===out)return false;
  if(APPLY)fs.writeFileSync(file,out,'utf8');
  return true;
}
function assert(ok,msg){if(!ok)throw new Error(msg);}
function trackedHtml(){
  return cp.execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024})
    .split(/\r?\n/).filter(Boolean);
}
function anchorHref(anchor){
  const m=anchor.match(/\bhref=["']([^"']+)["']/i); return m?m[1]:'';
}
function normalizeHref(href){
  if(!href)return href;
  return href.replace(/\/index\.html(?:[?#].*)?$/,'/').replace(/[?#].*$/,'');
}
function canonicalAnchor(existing,label,href){
  if(existing){
    let out=existing.replace(/\bhref=["'][^"']*["']/i,`href="${href}"`);
    out=out.replace(/>[^<>]*(?:<[^>]+>[^<>]*<\/[^>]+>[^<>]*)*<\/a>$/i,`>${label}</a>`);
    if(!/>[^<]*<\/a>$/i.test(out))out=out.replace(/>[\s\S]*<\/a>$/i,`>${label}</a>`);
    return out;
  }
  return `<a href="${href}">${label}</a>`;
}
function patchPrimaryNavBlock(block){
  const anchors=block.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi)||[];
  const hrefs=anchors.map(a=>normalizeHref(anchorHref(a)));
  const primaryHits=CANONICAL_ROUTES.filter(([,href])=>hrefs.includes(href)).length;
  if(primaryHits<5)return block;
  const open=(block.match(/^<nav\b[^>]*>/i)||[])[0];
  if(!open)return block;
  const byHref=new Map();
  anchors.forEach(anchor=>{const href=normalizeHref(anchorHref(anchor));if(href&&!byHref.has(href))byHref.set(href,anchor.trim());});
  const indent=(block.match(/\n([ \t]+)<a\b/i)||[])[1]||'      ';
  const closeIndent=indent.slice(0,Math.max(0,indent.length-2));
  const body=CANONICAL_ROUTES.map(([label,href])=>`${indent}${canonicalAnchor(byHref.get(href),label,href)}`).join('\n');
  return `${open}\n${body}\n${closeIndent}</nav>`;
}
function patchHtml(rel){
  let html=read(rel); const before=html;
  html=html.replace(/<header\b[\s\S]*?<\/header>/gi,header=>
    header.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi,patchPrimaryNavBlock)
  );
  html=html.replace(/\/site-navigation\.js\?v=([^"'&\s>]+)(?:&patch=[^"'\s>]*)?/g,`/site-navigation.js?v=$1&patch=${NAV_PATCH}`);
  html=html.replace(/\/site-dock-share-runtime-v1\.js\?v=([^"'&\s>]+)(?:&patch=[^"'\s>]*)?/g,`/site-dock-share-runtime-v1.js?v=$1&patch=${DOCK_PATCH}`);
  if(html!==before)return write(rel,html);
  return false;
}

function patchNavigationCore(){
  const rel='site-navigation-core.js'; let src=read(rel),before=src;
  src=src.replace("['友情链接', '/links/']","['资源协同', '/links/']");
  if(!src.includes("['精益生产', '/lean-production/']")){
    src=src.replace("    ['改善方法', '/improvements/'],","    ['改善方法', '/improvements/'],\n    ['精益生产', '/lean-production/'],");
  }
  if(src!==before)return write(rel,src); return false;
}
function patchNavigationWrapper(){
  const rel='site-navigation.js'; let src=read(rel),before=src;
  src=src.replace(/var CORE_SRC='\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC='/site-navigation-core.js?v=${CORE_VERSION}';`);
  src=src.replace(/var LEGACY_SRC='\/site-navigation-legacy-20260802\.js\?v=[^']+';/,`var LEGACY_SRC='/site-navigation-legacy-20260802.js?v=${LEGACY_VERSION}';`);
  if(src!==before)return write(rel,src); return false;
}
function patchLegacyNavigation(){
  const rel='site-navigation-legacy-20260802.js'; let src=read(rel),before=src;
  src=src.replace(/link\.textContent = '友情链接';/g,"link.textContent = '资源协同';");
  src=src.replace(/link\.setAttribute\('aria-label', '全球科技企业友情链接与行业资源'\);/g,"link.setAttribute('aria-label', '资源协同');");
  if(src!==before)return write(rel,src); return false;
}
function patchPrimaryMaterializer(){
  const rel='scripts/align-primary-nav-operating-axis.js'; let src=read(rel),before=src;
  if(!src.includes("['精益生产', '/lean-production/']")){
    src=src.replace("  ['改善方法', '/improvements/'],","  ['改善方法', '/improvements/'],\n  ['精益生产', '/lean-production/'],");
  }
  src=src.replace('首页 → 履历主线 → 能力体系 → 改善方法 → 代表项目','首页 → 履历主线 → 能力体系 → 改善方法 → 精益生产 → 代表项目');
  if(src!==before)return write(rel,src); return false;
}
function patchRetiredRegressionWriter(){
  const rel='scripts/enforce-six-core-navigation.js'; let src=read(rel),before=src;
  src=src.replace(/\['友情链接', '\/links\/'\]/g,"['资源协同', '/links/']");
  src=src.replace(/>友情链接<\/a>/g,'>资源协同</a>');
  src=src.replace(/>\\s\*友情链接\\s\*</g,'>\\s*(?:友情链接|资源协同)\\s*<');
  if(src!==before)return write(rel,src); return false;
}

function replaceRange(text,startNeedle,endNeedle,replacement,fromIndex=0){
  const s=text.indexOf(startNeedle,fromIndex); assert(s>=0,`missing marker: ${startNeedle.slice(0,80)}`);
  const e=text.indexOf(endNeedle,s+startNeedle.length); assert(e>=0,`missing marker: ${endNeedle.slice(0,80)}`);
  return text.slice(0,s)+replacement+text.slice(e);
}
function patchDockRuntime(){
  const rel='site-dock-share-runtime-v1.js'; let src=read(rel),before=src;
  if(!src.includes('MOBILE_LABELS')){
    src=src.replace(
      "  var handledClickAt=0;",
      "  var MOBILE_LABELS={home:['首页'],top:['顶部'],back:['回上一','层级'],previous:['回上一','网页'],search:['本站','搜索'],current:['分享','当前页'],contact:['联系','我们']};\n  var handledClickAt=0;"
    );
  }
  src=src.replace(
    "    var lines=LABELS[action]||[action],label=d.createElement('span');label.className='qily-dock-label';label.setAttribute('aria-hidden','true');",
    "    var mobile=w.matchMedia&&w.matchMedia('(max-width:820px)').matches;var lines=(mobile?MOBILE_LABELS:LABELS)[action]||[action],label=d.createElement('span');label.className='qily-dock-label';label.setAttribute('aria-hidden','true');"
  );
  const cssStart="      '@media(max-width:820px){";
  const cssEnd="      '@media print{";
  const cssReplacement=[
    "      '@media(max-width:820px){:root{--qily-dock-gap:4px}html:root:root body #floatDock.qily-page-action-nav{left:0!important;right:0!important;bottom:0!important;width:100%!important;max-width:none!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;align-items:stretch!important;gap:var(--qily-dock-gap)!important;padding:5px 6px calc(5px + env(safe-area-inset-bottom))!important;border-width:1px 0 0!important;border-radius:0!important;box-shadow:0 -6px 22px rgba(15,75,90,.18)!important;overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important;scroll-snap-type:none!important;scroll-padding-inline:0!important;overscroll-behavior-inline:auto!important;scrollbar-width:none!important;transform:none!important;touch-action:pan-y pinch-zoom!important}html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{display:flex!important;flex:none!important;width:100%!important;min-width:0!important;max-width:none!important;min-height:54px!important;padding:6px 2px!important;border:1px solid var(--qily-dock-line)!important;border-radius:7px!important;font-size:11.5px!important;line-height:1.12!important;scroll-snap-align:none!important;touch-action:manipulation!important;transform:none!important;outline:none!important}html:root:root body #floatDock .qily-dock-label>span{display:block!important}html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus-visible{outline:none!important;outline-offset:0!important;transform:none!important;box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important}html:root:root body #floatDock .qily-float-btn:active,html:root:root body #floatDock .qily-float-btn[data-qily-pressed=\"true\"]{transform:none!important}html:root:root body #qilyDockBottomSpacerV58{height:calc(78px + env(safe-area-inset-bottom))!important}}',\n",
    "      '@media(max-width:390px){html:root:root body #floatDock.qily-page-action-nav{gap:3px!important;padding-left:4px!important;padding-right:4px!important}html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{padding-left:1px!important;padding-right:1px!important;font-size:11px!important}}',\n"
  ].join('');
  src=replaceRange(src,cssStart,cssEnd,cssReplacement);

  const geomFn=src.indexOf('  function applyInlineGeometry(dock){'); assert(geomFn>=0,'applyInlineGeometry missing');
  const mobileStart=src.indexOf('    if(mobile){',geomFn); const mobileElse=src.indexOf('    }else{',mobileStart); assert(mobileStart>=0&&mobileElse>=0,'mobile geometry branch missing');
  const newMobileGeom=[
    "    if(mobile){\n",
    "      setImportant(dock,'display','grid');setImportant(dock,'grid-template-columns','repeat(7,minmax(0,1fr))');setImportant(dock,'align-items','stretch');setImportant(dock,'left','0');setImportant(dock,'right','0');setImportant(dock,'bottom','0');setImportant(dock,'width','100%');setImportant(dock,'max-width','none');setImportant(dock,'gap',w.innerWidth<=390?'3px':'4px');setImportant(dock,'padding',w.innerWidth<=390?'5px 4px calc(5px + env(safe-area-inset-bottom))':'5px 6px calc(5px + env(safe-area-inset-bottom))');setImportant(dock,'border-radius','0');setImportant(dock,'overflow','visible');setImportant(dock,'overflow-x','visible');setImportant(dock,'overflow-y','visible');setImportant(dock,'scroll-snap-type','none');setImportant(dock,'scroll-padding-inline','0');setImportant(dock,'overscroll-behavior-inline','auto');setImportant(dock,'scrollbar-width','none');setImportant(dock,'touch-action','pan-y pinch-zoom');setImportant(dock,'transform','none');dock.dataset.qilyDockLayout='mobile-fixed-bottom-compact-navigation';\n"
  ].join('');
  src=src.slice(0,mobileStart)+newMobileGeom+src.slice(mobileElse);

  const buttonsStart=src.indexOf("    dock.querySelectorAll('.qily-float-btn').forEach(function(button){",geomFn); assert(buttonsStart>=0,'dock button geometry missing');
  const buttonMobile=src.indexOf('      if(mobile){',buttonsStart); const buttonElse=src.indexOf('      }else{',buttonMobile); assert(buttonMobile>=0&&buttonElse>=0,'mobile button branch missing');
  const newButtonMobile=[
    "      if(mobile){\n",
    "        setImportant(button,'flex','none');setImportant(button,'width','100%');setImportant(button,'min-width','0');setImportant(button,'max-width','none');setImportant(button,'min-height','54px');setImportant(button,'padding',w.innerWidth<=390?'6px 1px':'6px 2px');setImportant(button,'border-radius','7px');setImportant(button,'font-size',w.innerWidth<=390?'11px':'11.5px');setImportant(button,'scroll-snap-align','none');setImportant(button,'touch-action','manipulation');setImportant(button,'transform','none');setImportant(button,'outline','none');\n"
  ].join('');
  src=src.slice(0,buttonMobile)+newButtonMobile+src.slice(buttonElse);

  if(!src.includes('mobile-fixed-bottom-compact-navigation'))throw new Error('Dock compact mobile layout not materialized');
  if(src!==before)return write(rel,src); return false;
}

function patchPersistentDockReferences(){
  const files=['scripts/materialize-global-language-v3.js','scripts/materialize-contact-route-v6.js','scripts/migrate-dock-v56-cache.js','scripts/validate-sitewide-visual-closure-v27.js'];
  let changed=0;
  for(const rel of files){
    if(!fs.existsSync(abs(rel)))continue;
    let src=read(rel),before=src;
    src=src.replace(/\/site-dock-share-runtime-v1\.js\?v=20260906-authority-v58-mobile-swipe-fixed-bottom(?:&patch=[^'"\s]*)?/g,`/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=${DOCK_PATCH}`);
    if(src!==before&&write(rel,src))changed++;
  }
  return changed;
}

function validate(){
  const dock=read('site-dock-share-runtime-v1.js');
  assert(dock.includes('MOBILE_LABELS'), 'mobile short labels missing');
  assert(dock.includes("home:['首页'],top:['顶部']"), '首页/顶部 mobile labels missing');
  assert(dock.includes("grid-template-columns','repeat(7,minmax(0,1fr))"), 'mobile seven-column Dock missing');
  assert(dock.includes("mobile-fixed-bottom-compact-navigation"), 'mobile fixed compact layout marker missing');
  assert(!dock.includes("dock.dataset.qilyDockLayout='mobile-fixed-bottom-swipe-navigation'"), 'retired mobile swipe geometry still active');
  const core=read('site-navigation-core.js');
  assert(core.includes("['精益生产', '/lean-production/']"), 'static 精益生产 route missing in navigation core');
  assert(core.includes("['资源协同', '/links/']"), '资源协同 missing in navigation core');
  assert(!core.includes("['友情链接', '/links/']"), '友情链接 still used as primary core label');
  const wrapper=read('site-navigation.js');
  assert(wrapper.includes(CORE_VERSION), 'navigation core cache not busted');
  assert(wrapper.includes(LEGACY_VERSION), 'legacy navigation cache not busted');
  let checked=0;
  for(const rel of trackedHtml()){
    const html=read(rel);
    const headers=html.match(/<header\b[\s\S]*?<\/header>/gi)||[];
    for(const header of headers){
      const navs=header.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)||[];
      for(const nav of navs){
        const hits=CANONICAL_ROUTES.filter(([,href])=>new RegExp(`href=["']${href.replace(/\//g,'\\/').replace(/\./g,'\\.')}(?:index\\.html)?["']`,'i').test(nav)).length;
        if(hits<5)continue;
        checked++;
        assert(!/>\s*友情链接\s*<\/a>/i.test(nav), `${rel}: first-paint 友情链接 primary label remains`);
        assert(/href=["']\/links\/(?:index\.html)?["'][^>]*>\s*资源协同\s*<\/a>/i.test(nav), `${rel}: first-paint 资源协同 missing`);
        assert(/href=["']\/lean-production\/["'][^>]*>\s*精益生产\s*<\/a>/i.test(nav), `${rel}: first-paint 精益生产 missing`);
      }
    }
  }
  assert(checked>0,'no public primary navigation blocks validated');
  return checked;
}

let changed=0;
changed+=patchDockRuntime()?1:0;
changed+=patchNavigationCore()?1:0;
changed+=patchNavigationWrapper()?1:0;
changed+=patchLegacyNavigation()?1:0;
changed+=patchPrimaryMaterializer()?1:0;
changed+=patchRetiredRegressionWriter()?1:0;
changed+=patchPersistentDockReferences();
for(const rel of trackedHtml())if(patchHtml(rel))changed++;
const checked=validate();
console.log(`${APPLY?'APPLY':'CHECK'} PASS: mobile Dock + first-paint navigation closure; changed=${changed}; primaryNavBlocks=${checked}.`);
