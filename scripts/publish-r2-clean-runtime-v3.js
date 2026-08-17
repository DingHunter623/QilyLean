#!/usr/bin/env node
'use strict';

/*
 * QilyLean atomic first-paint materializer v7｜2026-08-17
 * 目的：
 * 1) 静态 HTML 立即可见，不等待 window.load；
 * 2) 普通页面仅加载轻量 core，合作/资源页面才按需加载 legacy；
 * 3) 原生整页导航，不预取HTML，避免部署切换期命中旧文档缓存；
 * 4) 七个全站基础 CSS 在构建期按原顺序合并，减少阻塞请求且不改变级联顺序；
 * 5) 首张图片保持首屏策略，其余图片默认 lazy + async decoding；
 * 6) 移除页面直接加载的 parent-navigation，统一由轻量 consistency 处理返回上一层；
 * 7) CSS bundle 已存在时清除后续历史发布器重新注入的重复基础CSS，保证自愈流程幂等；
 * 8) head 内原子守卫在正文解析前拦截旧BFCache/旧构建文档，禁止旧内容先绘制再刷新。
 * 9) 全站静态安装统一交互反馈；八个一级页面静态安装同一条制造运营资产闭环轴。
 */

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const VERSION = '20260813-r2-clean-v4';
const HTML_BUILD_VERSION = '20260817-atomic-first-paint-v3';
const NAV_VERSION = '20260817-atomic-first-paint-v22';
const NAV_RUNTIME_VERSION = '20260817-atomic-first-paint-v18';
const CONSISTENCY_VERSION = '20260817-atomic-first-paint-v8';
const CORE_CSS_VERSION = '20260815-core-visual-v1';
const R2_CSS = `/site-r2-stability-fixes-v1.css?v=${VERSION}`;
const NAV_JS = `/site-navigation.js?v=${NAV_VERSION}`;
const LEGACY_JS = `/site-navigation-legacy-20260802.js?v=${NAV_RUNTIME_VERSION}`;
const CORE_JS = `/site-navigation-core.js?v=${NAV_RUNTIME_VERSION}`;
const CONSISTENCY_JS = `/site-ui-consistency-v1.js?v=${CONSISTENCY_VERSION}`;
const FAST_NATIVE_JS = '/site-music-persistent-navigation-v1.js?v=20260817-native-only-v7';
const CORE_CSS_BUNDLE = `/site-core-visual-bundle-v1.css?v=${CORE_CSS_VERSION}`;
const INTERACTION_CSS_VERSION = '20260817-continuity-v1';
const INTERACTION_CSS = `/site-interaction-continuity-v1.css?v=${INTERACTION_CSS_VERSION}`;
const DIRECT_NAV_JS = '/direct-navigation.js?v=20260817-static-only-v2';
const FLOATING_SERVICE_JS = '/qilylean/floating-service.js?v=20260817-behavior-only-v2';
const CORE_CSS_FILES = [
  'site-shell.css',
  'site-visual-scale-v1.css',
  'site-wide-layout-v1.css',
  'site-typography-v1.css',
  'site-vi-standard-v1.css',
  'site-vi-contrast-restoration-v1.css',
  'site-r2-stability-fixes-v1.css'
];
const FIRST_START = '<!-- QILY-R2-FIRST-PAINT:START -->';
const FIRST_END = '<!-- QILY-R2-FIRST-PAINT:END -->';
const AXIS_START = '<!-- QILY-SYSTEM-AXIS:START -->';
const AXIS_END = '<!-- QILY-SYSTEM-AXIS:END -->';
const PRIMARY_ROUTES = new Set([
  'index.html',
  'capabilities/index.html',
  'projects/index.html',
  'improvements/index.html',
  'knowledge/index.html',
  'experience/index.html',
  'cooperation/index.html',
  'trust/index.html'
]);
const PRIMARY_NAV = [
  ['/', '首页'],
  ['/capabilities/', '能力体系'],
  ['/projects/', '代表项目'],
  ['/improvements/', '改善方法'],
  ['/knowledge/', '知识资产'],
  ['/experience/', '履历主线'],
  ['/cooperation/', '项目合作'],
  ['/trust/', '信任中心']
];
const OPERATING_AXIS = `${AXIS_START}
    <section class="qily-system-axis" aria-label="QilyLean制造运营资产闭环" data-qily-operating-axis="static-v1">
      <div class="qily-system-axis__inner">
        <p class="qily-system-axis__title">QILYLEAN OPERATING LOGIC｜制造运营资产闭环</p>
        <div class="qily-system-axis__steps">
          <a class="qily-system-axis__step" href="/projects/"><strong>01｜现场事实</strong><span>Gemba／问题／约束</span></a>
          <a class="qily-system-axis__step" href="/capabilities/#data"><strong>02｜工程数据</strong><span>CT／TT／WIP／产能</span></a>
          <a class="qily-system-axis__step" href="/improvements/"><strong>03｜精益改善</strong><span>流动／节拍／损失</span></a>
          <a class="qily-system-axis__step" href="/capabilities/#quality"><strong>04｜质量保证</strong><span>标准／防错／闭环</span></a>
          <a class="qily-system-axis__step" href="/capabilities/#digital"><strong>05｜数智固化</strong><span>ERP／MES／APS／看板</span></a>
          <a class="qily-system-axis__step" href="/knowledge/"><strong>06｜知识资产</strong><span>SOP／模板／证据／复制</span></a>
        </div>
      </div>
    </section>
${AXIS_END}`;
const KNOWLEDGE_TOC_START = '<!-- QILY-LEAN-KNOWLEDGE-TOC:START -->';
const KNOWLEDGE_TOC_END = '<!-- QILY-LEAN-KNOWLEDGE-TOC:END -->';
const KNOWLEDGE_FEATURE_START = '<!-- QILY-LEAN-KNOWLEDGE-FEATURES:START -->';
const KNOWLEDGE_FEATURE_END = '<!-- QILY-LEAN-KNOWLEDGE-FEATURES:END -->';
const KNOWLEDGE_TOC = `${KNOWLEDGE_TOC_START}<a href="#management-execution-entry">管理与执行｜制造改善执行闭环</a><a href="#lean-tools-feature">精益生产管理十大核心工具</a>${KNOWLEDGE_TOC_END}`;
const KNOWLEDGE_FEATURES = `${KNOWLEDGE_FEATURE_START}
      <article class="article" id="management-execution-entry"><small>管理与执行</small><h2>制造改善执行闭环：从目标管理到知识沉淀</h2><ul class="tag-row"><li>目标管理</li><li>标准化</li><li>PDCA</li><li>知识沉淀</li></ul><p>让每一次改善都形成标准、数据与可复制的方法，将目标、计划、标准、执行、检查、改善和知识沉淀连接成持续循环。</p><h3>闭环要点</h3><ul class="list"><li>把目标转换为责任、节奏、交付物与验收口径。</li><li>用标准和现场数据检查执行偏差，避免只汇报动作。</li><li>把验证有效的方案固化为SOP、模板、看板与复盘资产。</li></ul><div class="actions"><a class="button" href="execution-loop.html">查看完整内容</a><a class="button secondary" href="#top">返回顶部</a></div></article>
      <article class="article" id="lean-tools-feature"><small>精益生产专题</small><h2>精益生产管理十大核心工具</h2><ul class="tag-row"><li>VSM</li><li>标准工时</li><li>SMED</li><li>TPM</li><li>数字化精益</li></ul><p>系统介绍价值流分析、标准工时、标准作业、快速换型、单件流、ECRS、5W2H+PDCA、TPM、目视化管理与数字化精益的工具定位、应用场景和改善价值。</p><h3>专题重点</h3><ul class="list"><li>理解十大工具分别解决什么制造问题。</li><li>识别不同工具的适用场景和实施边界。</li><li>建立从客户需求、流程诊断到数字化闭环的协同逻辑。</li></ul><div class="actions"><a class="button" href="lean-tools.html">查看专题</a><a class="button secondary" href="#top">返回顶部</a></div></article>
${KNOWLEDGE_FEATURE_END}`;
const firstPaint = `${FIRST_START}\n<style id="qilyR2CriticalFirstPaintGuard">html.qily-stale-document{min-height:100%;background:#eef7f5}html.qily-stale-document body{visibility:hidden!important}@media print{html.qily-stale-document body{visibility:visible!important}}</style><script data-qily-r2-first-paint>(function(d,w){'use strict';var BUILD='${HTML_BUILD_VERSION}',KEY='qily_site_html_build_v2',ATTEMPT='qily_site_refresh_attempt_v1',PARAM='qily-refresh',STAMP='qily-ts',e=d.documentElement,active='',requested='';try{active=w.localStorage.getItem(KEY)||''}catch(error){}try{requested=new URL(w.location.href).searchParams.get(PARAM)||''}catch(error){}function tried(){try{return w.sessionStorage.getItem(ATTEMPT)===BUILD}catch(error){return false}}function mark(){try{w.sessionStorage.setItem(ATTEMPT,BUILD)}catch(error){}}function clear(){try{w.sessionStorage.removeItem(ATTEMPT)}catch(error){}}function remember(){try{w.localStorage.setItem(KEY,BUILD)}catch(error){}}function clean(){if(!requested)return;try{var u=new URL(w.location.href);u.searchParams.delete(PARAM);u.searchParams.delete(STAMP);w.history.replaceState(null,'',u.pathname+u.search+u.hash)}catch(error){}}function reveal(){e.setAttribute('data-qily-html-build',BUILD);e.classList.remove('qily-shell-pending','qily-r2-first-paint-pending','qily-stale-document');clean()}function fresh(){remember();clear();reveal()}function fallback(){reveal()}function refresh(){if(requested||tried()){fallback();return}mark();e.classList.add('qily-stale-document');try{var u=new URL(w.location.href);u.searchParams.set(PARAM,BUILD);u.searchParams.set(STAMP,Date.now().toString(36));w.location.replace(u.href)}catch(error){fallback()}}if(!active||active===BUILD)fresh();else refresh();w.addEventListener('pageshow',function(event){if(!event.persisted)return;var latest='';try{latest=w.localStorage.getItem(KEY)||''}catch(error){}if(latest&&latest!==BUILD)refresh();else fresh()})})(document,window);</script>\n${FIRST_END}`;
const PAGE_CURRENT_SCRIPT = `<script data-qily-page-current-failsafe="v9">(function(d,w){'use strict';function clean(path){path=String(path||'/').split('?')[0].split('#')[0].replace(/\\/index\\.html$/i,'/').replace(/\\/{2,}/g,'/');if(path.charAt(0)!=='/')path='/'+path;if(path!=='/'&&path.charAt(path.length-1)!=='/')path+='/';return path}var page=clean(w.location.pathname);var current=page==='/'?'/':page.indexOf('/projects/')===0?'/projects/':'';if(!current)return;function sync(){var links=d.querySelectorAll('header.qily-site-header nav.site-nav>a[href],header.qily-global-header nav.qily-global-nav>a[href]');for(var i=0;i<links.length;i++){var link=links[i],route='';try{route=clean(new URL(link.getAttribute('href'),w.location.origin).pathname)}catch(error){}var on=route===current;if(on){link.setAttribute('aria-current','page');link.setAttribute('data-qily-page-current','true');link.setAttribute('data-qily-primary-current','true')}else{link.removeAttribute('aria-current');link.removeAttribute('data-qily-page-current');link.removeAttribute('data-qily-primary-current')}}}sync();if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',sync,{once:true});d.addEventListener('qily:shell-ready',sync);w.addEventListener('pageshow',sync)})(document,window);</script>`;

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function write(rel,content){
  const file=path.join(root,rel);
  const out=content.endsWith('\n')?content:`${content}\n`;
  if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===out)return false;
  fs.writeFileSync(file,out,'utf8');
  return true;
}
function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git','node_modules','.cache'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn); else fn(full);
  }
}
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function escapeRe(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function isPublicHtml(html) {
  return /<html\b/i.test(html) && /<body\b/i.test(html) && /(?:site-navigation\.js|qily-global-nav|site-nav|site-parent-navigation-v3\.js)/i.test(html);
}
function removeFooterAssets(html) {
  return html
    .replace(/^[ \t]*<link\b[^>]*(?:id=["']qilyFooterStandardV28Stylesheet["']|href=["'][^"']*\/site-footer-standard-v28\.css(?:\?v=[^"']*)?["'])[^>]*>\s*/gmi, '')
    .replace(/^[ \t]*<script\b[^>]*(?:id=["']qilyFooterStandardV28Script["']|data-qily-footer-standard=["'][^"']+["']|src=["'][^"']*\/site-footer-standard-v28\.js(?:\?v=[^"']*)?["'])[^>]*>\s*<\/script>\s*/gmi, '')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>\s*/gi, '')
    .replace(/<div\b[^>]*(?:id=["']qilyGlobalContactFooter["']|class=["'][^"']*(?:qily-global-contact-footer|qily-global-contact-footer-shell|qtc-global-trust-footer)[^"']*["'])[^>]*>[\s\S]*?<\/div>\s*/gi, '');
}
function removeDynamicContentShapers(html) {
  return html.replace(/<script\b[^>]*\bsrc=["'][^"']*\/(?:brand-identity|site-early-career-history-v1|site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '');
}
function removeParentNavigationScript(html){
  return html.replace(/\s*<script\b[^>]*\bsrc=["'][^"']*\/site-parent-navigation-v3\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi,'\n');
}
function installFirstPaint(html) {
  let out = html
    .replace(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->\s*/gi, '')
    .replace(/\s*<script\b[^>]*data-qily-r2-first-paint[^>]*>[\s\S]*?<\/script>\s*/gi, '\n')
    .replace(/\s*<style\b[^>]*id=["']qilyR2CriticalFirstPaintGuard["'][^>]*>[\s\S]*?<\/style>\s*/gi, '\n');
  return out.replace(/<head>\s*/i, `<head>\n${firstPaint}\n  `);
}
function ensureFastNative(html) {
  let out = html.replace(/\s*<script\b[^>]*\bsrc=["'][^"']*\/site-music-persistent-navigation-v1\.js(?:\?v=[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '\n');
  const tag = `  <script defer id="qilyFastNativeNavigationV7" data-qily-fast-native-navigation="v7" src="${FAST_NATIVE_JS}"></script>`;
  const primaryContrastEnd='<!-- QILY-R2-PRIMARY-CONTRAST-NAV:END -->';
  if(out.includes(primaryContrastEnd))return out.replace(primaryContrastEnd,`${primaryContrastEnd}\n${tag}`);
  if(/<style\b[^>]*id=["']qilyDockCriticalV6["']/i.test(out)){
    return out.replace(/<style\b[^>]*id=["']qilyDockCriticalV6["']/i,`${tag}\n$&`);
  }
  return out.replace(/<\/head>/i, `${tag}\n</head>`);
}
function stabilizePageCurrentFallback(html){
  return html.replace(/<script\b[^>]*data-qily-page-current-failsafe=["'][^"']+["'][^>]*>[\s\S]*?<\/script>/gi,PAGE_CURRENT_SCRIPT);
}
function materializeCoreCssBundle(){
  const parts=CORE_CSS_FILES.map((file)=>{
    assert(fs.existsSync(path.join(root,file)),`core CSS source missing: ${file}`);
    const body=read(file).replace(/^\uFEFF/,'').replace(/^\s*@charset\s+[^;]+;\s*/i,'');
    return `/* QILY-CORE-CSS:${file} */\n${body.trim()}\n`;
  });
  write('site-core-visual-bundle-v1.css',`/* QilyLean core visual bundle v1｜${CORE_CSS_VERSION}\n * 构建期按既有顺序合并，不改任何选择器与声明。\n */\n${parts.join('\n')}`);
}
function stripIndividualCoreCss(html){
  let out=html;
  for(const file of CORE_CSS_FILES){
    const re=new RegExp(`\\s*<link\\b[^>]*href=["'][^"']*\\/${escapeRe(file)}(?:\\?[^"']*)?["'][^>]*>\\s*`,'gi');
    out=out.replace(re,'\n');
  }
  return out;
}
function installCoreCssBundle(html){
  if(html.includes('/site-core-visual-bundle-v1.css')){
    let out=html.replace(/\/site-core-visual-bundle-v1\.css\?v=[^"'\s<]+/g,CORE_CSS_BUNDLE);
    out=stripIndividualCoreCss(out);
    return out;
  }
  const matches=[];
  for(const file of CORE_CSS_FILES){
    const re=new RegExp(`<link\\b[^>]*href=["'][^"']*\\/${escapeRe(file)}(?:\\?[^"']*)?["'][^>]*>`,'i');
    const m=re.exec(html);
    if(!m)return html;
    matches.push({start:m.index,end:m.index+m[0].length});
  }
  for(let i=1;i<matches.length;i++){
    if(matches[i].start<matches[i-1].end)return html;
    if(!/^\s*$/.test(html.slice(matches[i-1].end,matches[i].start)))return html;
  }
  const tag=`<link id="qilyCoreVisualBundleV1" rel="stylesheet" href="${CORE_CSS_BUNDLE}">`;
  return html.slice(0,matches[0].start)+tag+html.slice(matches[matches.length-1].end);
}
function installInteractionCss(html){
  let out=html.replace(/\s*<link\b[^>]*href=["'][^"']*\/site-interaction-continuity-v1\.css(?:\?[^"']*)?["'][^>]*>\s*/gi,'\n');
  const tag=`<link id="qilyInteractionContinuityV1" rel="stylesheet" href="${INTERACTION_CSS}">`;
  return out.replace(/<\/head>/i,`${tag}\n</head>`);
}
function installOperatingAxis(html,rel){
  if(!PRIMARY_ROUTES.has(rel))return html;
  let out=html
    .replace(/<!-- QILY-SYSTEM-AXIS:START -->[\s\S]*?<!-- QILY-SYSTEM-AXIS:END -->\s*/gi,'')
    .replace(/\s*<section\b[^>]*class=["'][^"']*\bqily-system-axis\b[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/i,'\n');
  const hero=/<section\b[^>]*class=["'][^"']*(?:qily-home-hero|module-hero|\bhero\b)[^"']*["'][^>]*>[\s\S]*?<\/section>/i;
  assert(hero.test(out),`${rel}: primary hero not found for operating axis`);
  return out.replace(hero,(match)=>`${match}\n\n${OPERATING_AXIS}`);
}
function materializeHomeLinkedCards(html,rel){
  if(rel!=='index.html')return html;
  return html.replace(/<article class="qily-value-card">([\s\S]*?)<strong><a href="([^"]+)">([^<]+)<\/a><\/strong><\/article>/g,
    '<a class="qily-value-card qily-value-card-link" href="$2">$1<strong>$3</strong></a>');
}
function materializeLeanKnowledge(html,rel){
  if(rel!=='qilylean/lean-knowledge.html')return html;
  let out=html
    .replace(/<!-- QILY-LEAN-KNOWLEDGE-TOC:START -->[\s\S]*?<!-- QILY-LEAN-KNOWLEDGE-TOC:END -->/gi,'')
    .replace(/<!-- QILY-LEAN-KNOWLEDGE-FEATURES:START -->[\s\S]*?<!-- QILY-LEAN-KNOWLEDGE-FEATURES:END -->\s*/gi,'');
  assert(/<div class="toc">/.test(out),`${rel}: knowledge TOC host missing`);
  assert(/<section class="section"><div class="inner">\s*/.test(out),`${rel}: knowledge article host missing`);
  out=out.replace(/<div class="toc">/,`<div class="toc">${KNOWLEDGE_TOC}`);
  return out.replace(/<section class="section"><div class="inner">\s*/,match=>`${match}${KNOWLEDGE_FEATURES}\n`);
}
function optimizeImages(html){
  let index=0;
  return html.replace(/<img\b[^>]*>/gi,function(tag){
    index+=1;
    let out=tag;
    const high=/fetchpriority=["']high["']/i.test(out)||/loading=["']eager["']/i.test(out);
    if(!/\bdecoding=/i.test(out))out=out.replace(/\s*\/?>(?=$)/,function(end){return ` decoding="async"${end}`;});
    if(index>1&&!high&&!/\bloading=/i.test(out))out=out.replace(/\s*\/?>(?=$)/,function(end){return ` loading="lazy"${end}`;});
    return out;
  });
}
function normalizeVersions(html) {
  return html
    .replace(/\/site-navigation\.js\?v=[^"'\s<]+/g, NAV_JS)
    .replace(/\/site-ui-consistency-v1\.js\?v=[^"'\s<]+/g, CONSISTENCY_JS)
    .replace(/data-qily-ui-consistency=["'][^"']+["']/g, 'data-qily-ui-consistency="atomic-first-paint-v8"')
    .replace(/\/site-r2-stability-fixes-v1\.css\?v=[^"'\s<]+/g, R2_CSS)
    .replace(/\/direct-navigation\.js(?:\?v=[^"'\s<]+)?/g,DIRECT_NAV_JS)
    .replace(/\/qilylean\/floating-service\.js(?:\?v=[^"'\s<]+)?/g,FLOATING_SERVICE_JS);
}
function normalize(html,rel) {
  let out = removeFooterAssets(html);
  out = removeDynamicContentShapers(out);
  out = removeParentNavigationScript(out);
  out = installFirstPaint(out);
  out = ensureFastNative(out);
  out = stabilizePageCurrentFallback(out);
  out = normalizeVersions(out);
  out = installCoreCssBundle(out);
  out = installInteractionCss(out);
  out = materializeHomeLinkedCards(out,rel);
  out = materializeLeanKnowledge(out,rel);
  out = installOperatingAxis(out,rel);
  out = optimizeImages(out);
  return out;
}
function patchRuntimeSources(){
  let wrapper=read('site-navigation.js');
  wrapper=wrapper.replace(/\/site-navigation-legacy-20260802\.js\?v=[^'"\s]+/g,LEGACY_JS);
  wrapper=wrapper.replace(/\/site-navigation-core\.js\?v=[^'"\s]+/g,CORE_JS);
  wrapper=wrapper.replace(/\/site-ui-consistency-v1\.js\?v=[^'"\s]+/g,CONSISTENCY_JS);
  write('site-navigation.js',wrapper);

  let legacy=read('site-navigation-legacy-20260802.js');
  legacy=legacy.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/,`var CORE_SRC = '${CORE_JS}';`);
  write('site-navigation-legacy-20260802.js',legacy);
}
function verify(rel, html) {
  assert(html.includes(FIRST_START), `${rel}: first-paint compatibility marker missing`);
  const first=(html.match(/<!-- QILY-R2-FIRST-PAINT:START -->[\s\S]*?<!-- QILY-R2-FIRST-PAINT:END -->/)||[])[0]||'';
  assert(first.includes(`BUILD='${HTML_BUILD_VERSION}'`) && first.includes('html.qily-stale-document body{visibility:hidden!important}'), `${rel}: atomic stale-document guard missing`);
  assert(first.includes("ATTEMPT='qily_site_refresh_attempt_v1'")&&first.includes('w.sessionStorage.getItem(ATTEMPT)===BUILD')&&first.includes('if(requested||tried()){fallback();return}')&&first.includes('if(!active||active===BUILD)fresh();else refresh()'),`${rel}: bounded stale-document retry contract missing`);
  assert(first.includes('u.searchParams.set(PARAM,BUILD)')&&!/active>BUILD|latest>BUILD|location\.reload\(\)/.test(first),`${rel}: stale-document refresh can loop or follow an untrusted build`);
  assert(!/qily-r2-first-paint-pending body\{visibility:hidden|window\.load|setTimeout\([^,]+,\s*2400/.test(first), `${rel}: normal first paint is blocked`);
  assert(html.includes(FAST_NATIVE_JS), `${rel}: Native Navigation V7 missing`);
  assert(html.includes(INTERACTION_CSS), `${rel}: interaction continuity stylesheet missing`);
  assert(!/site-parent-navigation-v3\.js/i.test(html), `${rel}: redundant parent-navigation request returned`);
  assert(!/site-footer-standard-v28\.(?:css|js)/i.test(html), `${rel}: footer standard asset still referenced`);
  assert(!/<footer\b/i.test(html), `${rel}: visible footer remains`);
  assert(!/(?:brand-identity|site-early-career-history-v1|site-information-architecture-v1|site-brand-trust-v1|site-trust-conversion-v2|site-visual-closure-v1|site-visual-closure-v2|site-text-contrast-audit-v1)\.js/i.test(html), `${rel}: dynamic content shaper still referenced`);
  assert(!/qilyBackgroundMusicPreload/i.test(html), `${rel}: retired background-audio preload remains`);
  if (/site-navigation\.js\?v=/i.test(html)) assert(html.includes(NAV_JS), `${rel}: atomic-first-paint navigation version missing`);
  const localCurrent=(html.match(/<script\b[^>]*data-qily-page-current-failsafe[\s\S]*?<\/script>/i)||[])[0]||'';
  if(localCurrent)assert(!/setTimeout|addEventListener\(['"]load['"]/.test(localCurrent),`${rel}: delayed page-current rewrite returned`);
  if(PRIMARY_ROUTES.has(rel)){
    assert((html.match(/<!-- QILY-SYSTEM-AXIS:START -->/g)||[]).length===1,`${rel}: operating axis must be present once`);
    assert((html.match(/<a class="qily-system-axis__step"/g)||[]).length===6,`${rel}: operating axis must expose six linked steps`);
    const header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
    let cursor=-1;
    for(const [href,label] of PRIMARY_NAV){
      const pattern=new RegExp(`<a\\b[^>]*href=["']${escapeRe(href)}["'][^>]*>\\s*${label}\\s*<\\/a>`,'i');
      const match=pattern.exec(header);
      assert(match&&match.index>cursor,`${rel}: primary navigation order/label drifted at ${label}`);
      cursor=match.index;
    }
    assert(!/>\s*友情链接\s*</.test(header),`${rel}: friend link returned to primary navigation`);
  }
  if(rel==='index.html')assert((html.match(/<a class="qily-value-card qily-value-card-link"/g)||[]).length===3,`${rel}: trust cards must be whole-card links`);
  if(rel==='qilylean/lean-knowledge.html'){
    assert((html.match(/QILY-LEAN-KNOWLEDGE-TOC:START/g)||[]).length===1,`${rel}: maintained knowledge TOC not materialized`);
    assert((html.match(/QILY-LEAN-KNOWLEDGE-FEATURES:START/g)||[]).length===1,`${rel}: maintained knowledge entries not materialized`);
    assert(html.includes('id="management-execution-entry"')&&html.includes('id="lean-tools-feature"'),`${rel}: maintained knowledge entries missing`);
    assert(html.includes('href="#management-execution-entry"')&&html.includes('href="#lean-tools-feature"'),`${rel}: maintained knowledge TOC links missing`);
  }
}

materializeCoreCssBundle();
const fastNativeSource = read('site-music-persistent-navigation-v1.js');
assert(fastNativeSource.includes("mode: 'native-only-v7'"),'Native Navigation V7 runtime contract missing');
assert(fastNativeSource.includes('documentPrefetch: false'),'Native Navigation V7 document-prefetch boundary missing');
assert(!/\bfetch\s*\(/.test(fastNativeSource),'Fast Native V6 must not issue duplicate fetch requests');
assert(fastNativeSource.includes('domSwap: false'),'Native Navigation V7 must forbid DOM swap');
assert(!/rel\s*=\s*['"]prefetch|requestIdleCallback|warmPrimaryNav/.test(fastNativeSource),'Native Navigation V7 must not prefetch HTML documents');
assert(!/DOMParser|history\.pushState|document\.body\.innerHTML/i.test(fastNativeSource),'Fast Native V6 contains retired soft-navigation logic');

patchRuntimeSources();
let checked = 0, changed = 0, bundled = 0, lazyImages = 0;
walk(root, (file) => {
  if (!file.endsWith('.html')) return;
  const before = fs.readFileSync(file, 'utf8');
  if (!isPublicHtml(before)) return;
  const rel = path.relative(root, file).split(path.sep).join('/');
  checked += 1;
  const beforeLazy=(before.match(/loading=["']lazy["']/gi)||[]).length;
  const after = normalize(before,rel);
  if(after.includes('/site-core-visual-bundle-v1.css'))bundled+=1;
  lazyImages += Math.max(0,(after.match(/loading=["']lazy["']/gi)||[]).length-beforeLazy);
  verify(rel, after);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith('\n') ? after : `${after}\n`, 'utf8');
    changed += 1;
  }
});

assert(read('site-navigation.js').includes(LEGACY_JS),'site-navigation.js atomic-first-paint legacy cache version missing');
assert(read('site-navigation.js').includes(CORE_JS),'site-navigation.js atomic-first-paint direct-core cache version missing');
assert(read('site-navigation.js').includes(CONSISTENCY_JS),'site-navigation.js atomic-first-paint consistency cache version missing');
assert(read('site-navigation.js').includes('needsLegacyRuntime'),'site-navigation.js route-scoped legacy selector missing');
assert(read('site-navigation-legacy-20260802.js').includes(`var CORE_SRC = '${CORE_JS}';`),'legacy runtime navigation-current V17 core cache version missing');
process.stdout.write(`Atomic first-paint v8 checked ${checked} public HTML pages; refreshed ${changed}; bundled core CSS on ${bundled}; added ${lazyImages} lazy image hints; bounded stale-document recovery and static knowledge entries enforced; stale-document guard=${HTML_BUILD_VERSION}.\n`);
