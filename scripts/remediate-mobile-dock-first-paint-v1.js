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
const DOCK_PATCH='20260906-mobile-compact-fixed-r2';
const NAV_PATCH='20260906-primary-first-paint-v1';
const CORE_VERSION='20260906-primary-first-paint-core-v31';
const LEGACY_VERSION='20260906-primary-first-paint-legacy-v24';
const CANONICAL_ROUTES=[
  ['首页','/'],['履历主线','/experience/'],['能力体系','/capabilities/'],['改善方法','/improvements/'],
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
  return patchFile('site-dock-share-runtime-v1.js',src=>{
    src=src.replace('Canonical actions: 回首页 / 回顶部 / 回上一层级 / 回上一网页 / 本站搜索 / 分享当前页 / 联系我们.','Canonical actions: 首页 / 顶部 / 上一层级 / 上一网页 / 本站搜索 / 分享当前 / 联系我们.');
    src=src.replace(/  var LABELS=\{[\s\S]*?\n  \};\n  var MOBILE_LABELS=\{[^\n]*\};/,
`  var LABELS={
    home:['首页'],
    top:['顶部'],
    back:['上一层级'],
    previous:['上一网页'],
    search:['本站搜索'],
    current:['分享当前'],
    contact:['联系我们']
  };
  var MOBILE_LABELS={home:['首页'],top:['顶部'],back:['上一','层级'],previous:['上一','网页'],search:['本站','搜索'],current:['分享','当前'],contact:['联系','我们']};`);

    src=src.replace(
      "      'html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-hover)!important;border-color:var(--qily-dock-line-strong)!important;box-shadow:0 6px 16px rgba(15,75,90,.12)!important;outline:2px solid rgba(202,161,95,.25)!important;outline-offset:1px!important;transform:translateY(-1px)!important}',",
      "      'html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus,html:root:root body #floatDock .qily-float-btn:focus-visible{color:#fff!important;-webkit-text-fill-color:#fff!important;background:var(--qily-dock-hover)!important;border-color:var(--qily-dock-line-strong)!important;box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important;outline:none!important;outline-offset:0!important;transform:none!important}',"
    );

    const cssStart="      '@media(max-width:820px){";
    const cssEnd="      '@media print{";
    const cssReplacement=[
      "      '@media(max-width:820px){:root{--qily-dock-gap:4px}html:root:root body #floatDock.qily-page-action-nav{left:0!important;right:auto!important;bottom:0!important;width:100vw!important;max-width:100vw!important;box-sizing:border-box!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;align-items:stretch!important;gap:var(--qily-dock-gap)!important;padding:5px 6px calc(5px + env(safe-area-inset-bottom))!important;border-width:1px 0 0!important;border-radius:0!important;box-shadow:0 -6px 22px rgba(15,75,90,.18)!important;overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important;scroll-snap-type:none!important;scroll-padding-inline:0!important;overscroll-behavior-inline:auto!important;scrollbar-width:none!important;transform:none!important;touch-action:pan-y pinch-zoom!important}html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{display:flex!important;flex:none!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:54px!important;max-height:none!important;flex-basis:auto!important;padding:6px 2px!important;border:1px solid var(--qily-dock-line)!important;border-radius:7px!important;font-size:11.5px!important;line-height:1.12!important;scroll-snap-align:none!important;touch-action:manipulation!important;transform:none!important;outline:none!important}html:root:root body #floatDock .qily-float-btn:first-child{border-left:1px solid var(--qily-dock-line)!important}html:root:root body #floatDock .qily-float-btn:last-child{border-right:1px solid var(--qily-dock-line)!important}html:root:root body #floatDock .qily-dock-label>span{display:block!important}html:root:root body #floatDock .qily-float-btn:hover,html:root:root body #floatDock .qily-float-btn:focus,html:root:root body #floatDock .qily-float-btn:focus-visible{outline:none!important;outline-offset:0!important;transform:none!important;box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important}html:root:root body #floatDock .qily-float-btn:active,html:root:root body #floatDock .qily-float-btn[data-qily-pressed=\"true\"]{transform:none!important}html:root:root body #qilyDockBottomSpacerV58{height:calc(78px + env(safe-area-inset-bottom))!important}}',\n",
      "      '@media(max-width:390px){html:root:root body #floatDock.qily-page-action-nav{gap:3px!important;padding-left:4px!important;padding-right:4px!important}html:root:root body #floatDock.qily-page-action-nav .qily-float-btn.qily-float-btn{padding-left:1px!important;padding-right:1px!important;font-size:11px!important}}',\n"
    ].join('');
    src=replaceRange(src,cssStart,cssEnd,cssReplacement);

    const geomFn=src.indexOf('  function applyInlineGeometry(dock){');assert(geomFn>=0,'applyInlineGeometry missing');
    src=src.replace(
      "    setImportant(dock,'position','fixed');setImportant(dock,'top','auto');setImportant(dock,'z-index','2147482000');setImportant(dock,'height','auto');setImportant(dock,'margin','0');",
      "    setImportant(dock,'position','fixed');setImportant(dock,'top','auto');setImportant(dock,'z-index','2147482000');setImportant(dock,'height','auto');setImportant(dock,'margin','0');setImportant(dock,'box-sizing','border-box');"
    );
    const mobileStart=src.indexOf('    if(mobile){',geomFn),mobileElse=src.indexOf('    }else{',mobileStart);assert(mobileStart>=0&&mobileElse>=0,'mobile geometry branch missing');
    const newMobileGeom="    if(mobile){\n      setImportant(dock,'display','grid');setImportant(dock,'grid-template-columns','repeat(7,minmax(0,1fr))');setImportant(dock,'align-items','stretch');setImportant(dock,'left','0');setImportant(dock,'right','auto');setImportant(dock,'bottom','0');setImportant(dock,'width','100vw');setImportant(dock,'max-width','100vw');setImportant(dock,'gap',w.innerWidth<=390?'3px':'4px');setImportant(dock,'padding',w.innerWidth<=390?'5px 4px calc(5px + env(safe-area-inset-bottom))':'5px 6px calc(5px + env(safe-area-inset-bottom))');setImportant(dock,'border-radius','0');setImportant(dock,'overflow','visible');setImportant(dock,'overflow-x','visible');setImportant(dock,'overflow-y','visible');setImportant(dock,'scroll-snap-type','none');setImportant(dock,'scroll-padding-inline','0');setImportant(dock,'overscroll-behavior-inline','auto');setImportant(dock,'scrollbar-width','none');setImportant(dock,'touch-action','pan-y pinch-zoom');setImportant(dock,'transform','none');dock.dataset.qilyDockLayout='mobile-fixed-bottom-compact-navigation';\n";
    src=src.slice(0,mobileStart)+newMobileGeom+src.slice(mobileElse);

    const buttonsStart=src.indexOf("    dock.querySelectorAll('.qily-float-btn').forEach(function(button){",geomFn);assert(buttonsStart>=0,'dock button geometry missing');
    src=src.replace(
      "      setImportant(button,'display','flex');setImportant(button,'align-items','center');setImportant(button,'justify-content','center');setImportant(button,'box-sizing','border-box');setImportant(button,'height','auto');setImportant(button,'max-height','none');setImportant(button,'aspect-ratio','auto');setImportant(button,'margin','0');",
      "      setImportant(button,'display','flex');setImportant(button,'align-items','center');setImportant(button,'justify-content','center');setImportant(button,'box-sizing','border-box');setImportant(button,'height','auto');setImportant(button,'max-height','none');setImportant(button,'aspect-ratio','auto');setImportant(button,'margin','0');setImportant(button,'border-width','1px');setImportant(button,'border-style','solid');"
    );
    const buttonMobile=src.indexOf('      if(mobile){',buttonsStart),buttonElse=src.indexOf('      }else{',buttonMobile);assert(buttonMobile>=0&&buttonElse>=0,'mobile button branch missing');
    const newButtonMobile="      if(mobile){\n        setImportant(button,'flex','none');setImportant(button,'width','100%');setImportant(button,'min-width','0');setImportant(button,'max-width','none');setImportant(button,'height','auto');setImportant(button,'min-height','54px');setImportant(button,'max-height','none');setImportant(button,'flex-basis','auto');setImportant(button,'padding',w.innerWidth<=390?'6px 1px':'6px 2px');setImportant(button,'border-radius','7px');setImportant(button,'font-size',w.innerWidth<=390?'11px':'11.5px');setImportant(button,'scroll-snap-align','none');setImportant(button,'touch-action','manipulation');setImportant(button,'transform','none');setImportant(button,'outline','none');\n";
    src=src.slice(0,buttonMobile)+newButtonMobile+src.slice(buttonElse);
    return src;
  });
}

function patchVisualSystem(){
  return patchFile('site-visual-system-v2.css',src=>{
    const marker='/* QilyLean Dock V5.8 compact authority bridge R2 */';
    const idx=src.indexOf(marker);if(idx>=0)src=src.slice(0,idx).trimEnd()+'\n';
    const bridge=`
${marker}
/* The authoritative Dock runtime owns geometry. This bridge neutralizes historical 50/52/60px circular Dock rules. */
html:root:root:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn:first-child{border-left:1px solid #d5e4e3!important}
html:root:root:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn:last-child{border-right:1px solid #d5e4e3!important}
html:root:root:root:root body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn:is(:hover,:focus,:focus-visible){outline:none!important;outline-offset:0!important;transform:none!important;box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important}
@media (max-width:820px){
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav{
    left:0!important;right:auto!important;bottom:0!important;width:100vw!important;max-width:100vw!important;height:auto!important;
    box-sizing:border-box!important;display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;align-items:stretch!important;
    gap:4px!important;padding:5px 6px calc(5px + env(safe-area-inset-bottom))!important;border-width:1px 0 0!important;border-radius:0!important;
    overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important;scroll-snap-type:none!important;transform:none!important;
  }
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav .qily-float-btn.qily-float-btn{
    width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:54px!important;max-height:none!important;flex-basis:auto!important;
    padding:6px 2px!important;border-width:1px!important;border-style:solid!important;border-radius:7px!important;font-size:11.5px!important;line-height:1.12!important;
    box-shadow:none!important;transform:none!important;outline:none!important;
  }
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav .qily-dock-label>span{display:block!important}
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav .qily-float-btn.qily-float-btn:is(:hover,:focus,:focus-visible){box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important}
}
@media (max-width:390px){
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav{gap:3px!important;padding-left:4px!important;padding-right:4px!important}
  html:root:root:root:root body #floatDock.qily-float-dock.qily-page-action-nav .qily-float-btn.qily-float-btn{padding-left:1px!important;padding-right:1px!important;font-size:11px!important}
}
`;
    return src.trimEnd()+'\n'+bridge;
  });
}

function patchValidator(){
  return patchFile('scripts/validate-dock-flow-navigation-v56.js',src=>{
    src=src.replace(/for\(const label of \[[^\n]*\]\)must\(label,`desktop label fragment \$\{label\}`\);/,
      "for(const label of ['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'])must(label,`approved label ${label}`);");
    src=src.replace(/must\("MOBILE_LABELS=\{home:\['首页'\],top:\['顶部'\][^\n]*\n/,
      "must(\"MOBILE_LABELS={home:['首页'],top:['顶部'],back:['上一','层级'],previous:['上一','网页'],search:['本站','搜索'],current:['分享','当前'],contact:['联系','我们']}\",'two-character mobile line contract');\n");
    if(!src.includes("must('width:100vw!important','true mobile viewport width');"))src=src.replace("must('bottom:0!important','mobile viewport-bottom pin');","must('bottom:0!important','mobile viewport-bottom pin');\nmust('width:100vw!important','true mobile viewport width');");
    if(!src.includes("must('.qily-float-btn:focus,','plain focus ownership');"))src=src.replace("must('box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important','internal focus ring prevents edge clipping');","must('box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important','internal focus ring prevents edge clipping');\nmust('.qily-float-btn:focus,','plain focus ownership');");
    return src;
  });
}

function patchBrowserSpec(){
  return patchFile('scripts/dock-flow-navigation-v56.spec.js',src=>{
    src=src.replace("const desktopExpected=['回首页','回顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'];","const desktopExpected=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];");
    src=src.replace("const mobileExpected=['首页','顶部','回上一层级','回上一网页','本站搜索','分享当前页','联系我们'];","const mobileExpected=['首页','顶部','上一层级','上一网页','本站搜索','分享当前','联系我们'];");
    if(!src.includes('lineCounts:buttons.map'))src=src.replace("        labels:buttons.map(b=>b.getAttribute('aria-label')),","        labels:buttons.map(b=>b.getAttribute('aria-label')),\n        lineCounts:buttons.map(b=>b.querySelectorAll('.qily-dock-label>span').length),");
    if(!src.includes("expect(result.lineCounts).toEqual([1,1,2,2,2,2,2]);"))src=src.replace("      expect(result.layout).toBe('mobile-fixed-bottom-compact-navigation');","      expect(result.layout).toBe('mobile-fixed-bottom-compact-navigation');\n      expect(result.lineCounts).toEqual([1,1,2,2,2,2,2]);");
    if(!src.includes("expect(focus.boxShadow,'desktop first button focus must stay internal').toContain('inset');"))src=src.replace(
      "      for(const item of result.buttons)expect(item.w,'desktop navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);",
      "      for(const item of result.buttons)expect(item.w,'desktop navigation modules should be wider than tall').toBeGreaterThan(item.h*1.35);\n      await page.locator('#floatDock .qily-float-btn[data-action=\"home\"]').focus();\n      const focus=await page.evaluate(()=>{const b=document.querySelector('#floatDock .qily-float-btn[data-action=\"home\"]');const s=getComputedStyle(b),r=b.getBoundingClientRect();return {boxShadow:s.boxShadow,left:r.left,borderLeft:parseFloat(s.borderLeftWidth)||0};});\n      expect(focus.borderLeft,'desktop first button left border must remain complete').toBeGreaterThanOrEqual(1);\n      expect(focus.boxShadow,'desktop first button focus must stay internal').toContain('inset');"
    );
    return src;
  });
}

function patchNormalizer(){
  return patchFile('scripts/normalize-dock-compact-contract-v1.js',src=>src.replaceAll('20260906-mobile-compact-fixed-r1',DOCK_PATCH));
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
  for(const token of ["home:['首页']","top:['顶部']","back:['上一','层级']","previous:['上一','网页']","search:['本站','搜索']","current:['分享','当前']","contact:['联系','我们']","width:100vw!important","mobile-fixed-bottom-compact-navigation",".qily-float-btn:focus,","box-shadow:inset 0 0 0 2px rgba(202,161,95,.55)!important"])assert(dock.includes(token),'Dock R2 missing '+token);
  assert(!dock.includes("back:['回上一','层级']"),'old 回上一层级 mobile label remains');
  assert(!dock.includes('分享当前页'),'old 分享当前页 label remains');
  const visual=read('site-visual-system-v2.css');assert(visual.includes('QilyLean Dock V5.8 compact authority bridge R2'),'visual-system Dock bridge missing');assert(visual.includes('width:100vw!important'),'visual-system viewport-width bridge missing');
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
console.log(`${APPLY?'APPLY':'CHECK'} PASS: concise Dock labels + full edge-border closure; changed=${changed}; primaryNavBlocks=${checked}.`);
