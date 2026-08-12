#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXT = {'.js','.mjs','.cjs','.ts','.py','.html','.htm','.css','.json','.xml','.md','.yml','.yaml'}
LAYOUT_OLD = '20260810-stable-layout-v19'
LAYOUT_NEW = '20260812-runtime-stability-v20'
NAV_OLD = '20260810-native-navigation-stable-v19'
NAV_NEW = '20260812-native-navigation-stable-v20'
FOOTER_VERSION = '20260812-footer-runtime-stable-v34'
MUSIC_VERSION = '20260812-gesture-music-v29'
SOFT_NAV_VERSION = '20260812-soft-navigation-v4'


def p(rel): return ROOT / rel

def read(rel): return p(rel).read_text(encoding='utf-8')

def write(rel, text):
    path = p(rel)
    if not text.endswith('\n'): text += '\n'
    before = path.read_text(encoding='utf-8') if path.exists() else ''
    if before == text: return False
    path.write_text(text, encoding='utf-8')
    return True


def replace_exact_versions():
    changed=[]
    for path in ROOT.rglob('*'):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXT: continue
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith('.git/') or rel.startswith('node_modules/') or rel.startswith('.cache/') or rel.startswith('.github/workflows/'):
            continue
        before = path.read_text(encoding='utf-8', errors='ignore')
        after = before.replace(LAYOUT_OLD, LAYOUT_NEW).replace(NAV_OLD, NAV_NEW)
        if after != before:
            path.write_text(after, encoding='utf-8')
            changed.append(rel)
    return changed


STABILITY_BLOCK = r'''/* QILY-RUNTIME-STABILITY-V20:START
 * 2026-08-12｜静态首屏稳定、页尾稳定、跨模块软导航防抖。
 * 目的：DOM增强尚未完成时也保持同一内容轴和页尾流式布局，避免JS延迟造成瞬时乱版。
 */
html{
  overflow-x:clip!important;
}
html body{
  box-sizing:border-box!important;
  min-width:0!important;
  min-height:100vh!important;
  min-height:100dvh!important;
  display:flex!important;
  flex-direction:column!important;
  overflow-x:clip!important;
}
html body > main{
  box-sizing:border-box!important;
  min-width:0!important;
  width:100%!important;
  flex:1 0 auto!important;
}
html body > :is(header,.topbar,.qily-site-header,#qilyGlobalFooter,footer){
  min-width:0!important;
  flex:0 0 auto!important;
}
html body #qilyGlobalFooter{
  width:100%!important;
  margin-top:0!important;
  margin-bottom:0!important;
  clear:both!important;
}
html body :is(section,article,aside,nav,header,footer,main,div){
  min-inline-size:0;
}
html body :is(img,video,canvas,svg){
  max-width:100%;
}
html body :is(#floatDock,#shareMask,#wxMask,#qilySearchMask,#qilyDockToast,#siteMusicMute,#siteBackgroundMusic,#qilyPersistentNavigationFrame,#qilyPersistentNavigationLoader){
  flex:none!important;
}
html[aria-busy="true"] body{
  cursor:progress;
}
@media(max-width:820px){
  html body{width:100%!important}
  html body > main{width:100%!important}
}
/* QILY-RUNTIME-STABILITY-V20:END */'''


def patch_layout_css():
    rel='site-layout-footer-closure-v1.css'
    src=read(rel)
    src=re.sub(r'/\* QILY-RUNTIME-STABILITY-V20:START[\s\S]*?/\* QILY-RUNTIME-STABILITY-V20:END \*/', STABILITY_BLOCK, src)
    if 'QILY-RUNTIME-STABILITY-V20:START' not in src:
        src=src.rstrip()+"\n\n"+STABILITY_BLOCK+"\n"
    return write(rel,src)


def patch_navigation_loader():
    rel='site-navigation.js'
    src=read(rel)
    # 禁止公共CSS在首屏后再次搬家；静态HTML/生成器已负责顺序，运行时只补缺失资产。
    src, n = re.subn(
        r'  function promoteVi\(\) \{[\s\S]*?\n  \}\n\n  ensureGlobalAssets\(\);',
        "  function promoteVi() {\n    removeMicrosoftOverrides();\n  }\n\n  ensureGlobalAssets();",
        src, count=1)
    if n != 1: raise RuntimeError('site-navigation.js promoteVi block not found')
    src=src.replace("  promoteVi();\n  [120,600].forEach(function (delay) { setTimeout(promoteVi, delay); });", "  promoteVi();")
    # 页尾压缩只执行一次，不再250/900/1800ms反复移动DOM。
    src, n = re.subn(
        r'  function boot\(\) \{\n    compactTail\(\);\n    \[250,900,1800\]\.forEach\(function \(delay\) \{ w\.setTimeout\(compactTail, delay\); \}\);\n  \}',
        "  function boot() {\n    compactTail();\n  }",
        src, count=1)
    if n != 1: raise RuntimeError('site-navigation.js tail boot block not found')
    return write(rel,src)


def patch_footer_runtime():
    rel='site-footer-standard-v28.js'
    src=read(rel)
    old=r'''  function ensureFooter() {
    if (!d.body) return null;
    var footer = d.getElementById(FOOTER_ID);
    if (!footer) {
      footer = d.createElement('footer');
      footer.id = FOOTER_ID;
      d.body.appendChild(footer);
    }
    footer.className = 'qily-global-footer-v31 qily-global-footer-v32 qily-global-footer-v33 qily-global-footer-v34';
    footer.setAttribute('data-qily-footer-standard', 'v34');
    footer.setAttribute('aria-label', 'QilyLean全站统一页尾');
    footer.innerHTML = footerMarkup();
    return footer;
  }'''
    new=r'''  function ensureFooter() {
    if (!d.body) return null;
    var footer = d.getElementById(FOOTER_ID);
    var created = false;
    if (!footer) {
      footer = d.createElement('footer');
      footer.id = FOOTER_ID;
      d.body.appendChild(footer);
      created = true;
    }
    footer.className = 'qily-global-footer-v31 qily-global-footer-v32 qily-global-footer-v33 qily-global-footer-v34';
    footer.setAttribute('data-qily-footer-standard', 'v34');
    footer.setAttribute('aria-label', 'QilyLean全站统一页尾');
    var label = moduleLabel();
    var moduleNode = footer.querySelector('.qily-footer-v31-module');
    if (created || !moduleNode || footer.getAttribute('data-qily-footer-rendered') !== 'v34') {
      footer.innerHTML = footerMarkup();
      footer.setAttribute('data-qily-footer-rendered', 'v34');
      footer.setAttribute('data-qily-footer-module', label);
    } else if (footer.getAttribute('data-qily-footer-module') !== label) {
      moduleNode.textContent = label;
      footer.setAttribute('data-qily-footer-module', label);
    }
    return footer;
  }'''
    if old not in src: raise RuntimeError('footer ensureFooter block not found')
    src=src.replace(old,new)
    src=src.replace("    [80, 220, 520, 1000, 1800, 3000].forEach(function (delay) { w.setTimeout(normalize, delay); });\n\n", "")
    hook="""\n  d.addEventListener('qily:softnavigate', function () {\n    w.requestAnimationFrame(normalize);\n  });\n  w.addEventListener('pageshow', function (event) {\n    if (event.persisted) w.requestAnimationFrame(normalize);\n  });\n\n"""
    marker="  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });"
    if hook.strip() not in src:
        if marker not in src: raise RuntimeError('footer boot marker not found')
        src=src.replace(marker,hook+marker)
    return write(rel,src)


def patch_footer_materializer():
    rel='scripts/materialize-footer-standard-v28.js'
    src=read(rel)
    src=re.sub(r"const CSS_VERSION = '[^']+';", f"const CSS_VERSION = '{FOOTER_VERSION}';", src, count=1)
    src=re.sub(r"const SCRIPT_VERSION = '[^']+';", f"const SCRIPT_VERSION = '{FOOTER_VERSION}';", src, count=1)
    src=src.replace('data-qily-footer-standard=\"v33\"','data-qily-footer-standard=\"v34\"')
    src=src.replace('V33 nested-page footer standard','V34 stable footer standard')
    src=src.replace('V33 nested-page footer contract','V34 stable footer contract')
    return write(rel,src)


def patch_footer_bridge():
    rel='site-footer-standard-v26.js'
    src=read(rel)
    src=re.sub(r"var CSS_HREF = '[^']+';", f"var CSS_HREF = '/site-footer-standard-v28.css?v={FOOTER_VERSION}';", src, count=1)
    src=re.sub(r"var SCRIPT_SRC = '[^']+';", f"var SCRIPT_SRC = '/site-footer-standard-v28.js?v={FOOTER_VERSION}';", src, count=1)
    return write(rel,src)


def patch_music():
    rel='homepage-music-v5.js'
    src=read(rel)
    src=src.replace('var TRANSIT_COMPENSATION_CAP = 0.25;', 'var TRANSIT_COMPENSATION_CAP = 1.2;')
    if 'var resumeExpected' not in src:
        needle="""  var manualPaused = savedState
    ? Boolean(savedState.manualPaused !== undefined ? savedState.manualPaused : savedState.muted)
    : false;
"""
        repl=needle+"  var resumeExpected = Boolean(savedState && savedState.playing && !manualPaused);\n"
        if needle not in src: raise RuntimeError('music manualPaused block not found')
        src=src.replace(needle,repl,1)
    src=src.replace("  audio.preload = 'none';", "  audio.preload = resumeExpected ? 'auto' : 'metadata';")
    src=src.replace("    audio.preload = 'metadata';", "    audio.preload = resumeExpected ? 'auto' : 'metadata';")
    src=src.replace("  audio.addEventListener('timeupdate', writeState, { passive: true });\n", "")
    src=src.replace('  }, 5000);', '  }, 3500);')
    if 'function resumeFromSavedState()' not in src:
        marker="  function clamp(value, min, max) {"
        block=r'''  function resumeFromSavedState() {
    if (!resumeExpected || manualPaused) return;
    ensureAudioSource();
    startPlayback(false);
  }

  if (resumeExpected) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resumeFromSavedState, { once: true });
    else window.setTimeout(resumeFromSavedState, 0);
  }
  window.addEventListener('pageshow', resumeFromSavedState);

'''
        if marker not in src: raise RuntimeError('music clamp marker not found')
        src=src.replace(marker,block+marker,1)
    return write(rel,src)


SOFT_NAV_SOURCE = r'''/* QilyLean same-document soft navigation v4 | 2026-08-12
 * 同源HTML在音乐播放时使用同文档导航保留同一audio；页面级CSS采用“先加载新页→再清旧页→再换main”的事务式交接。
 * 非音乐状态也对高概率站内链接进行低优先级预取；异常自动回退原生导航。
 */
(function(window,document){
'use strict';
if(window.top!==window.self||window.__qilySoftNavigationV4)return;
window.__qilySoftNavigationV4=true;
var cache=new Map(),busy=false,MAX_CACHE=12;
var blocked=/\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg)(?:$|\?)/i;
var globals=/(?:homepage-music-v5|site-music-persistent-navigation-v1|site-navigation(?:-legacy)?|site-parent-navigation|site-core-service-dock-closure|site-footer-standard|site-brand-trust|site-information-architecture|site-visual-closure|site-trust-conversion|site-text-contrast-audit|site-wide-layout|site-typography|site-vi-|site-dark-surface|site-link-standard|site-layout-footer-closure|site-hero-primary-contrast|site-interactive-hover-contrast|site-number-badge)/i;
var globalStyleIds=/^(?:qilyCriticalFirstPaintGuard|siteMusicStyle|qily.*(?:Global|Navigation|Footer|Music|Dock|Contrast|Closure|Typography|Visual|Trust|Information|Link|Layout))/i;
function audioPlaying(){var a=document.getElementById('siteBackgroundMusic');return !!(a&&!a.paused&&!a.ended)}
function urlOf(h){try{return new URL(h,location.href)}catch(e){return null}}
function assetPath(h){var u=urlOf(h);return u?u.pathname:String(h||'')}
function isGlobalHref(h){return globals.test(assetPath(h))}
function networkAllowsPrefetch(){var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(!c)return true;if(c.saveData)return false;return !/(?:^|-)2g$/.test(c.effectiveType||'')}
function allowed(url,a){if(!url||url.origin!==location.origin||!/^https?:$/.test(url.protocol)||blocked.test(url.pathname+url.search))return false;if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return false;if(a&&(a.hasAttribute('download')||(a.getAttribute('target')||'').toLowerCase()==='_blank'||a.closest('[data-qily-native-navigation="true"]')))return false;return true}
function markInitialAssets(){
  document.head.querySelectorAll('link[rel="stylesheet"]').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=isGlobalHref(n.href)?'global':'page'});
  document.head.querySelectorAll('style').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=(n.id&&globalStyleIds.test(n.id))?'global':'page'});
  document.querySelectorAll('script[src]').forEach(function(n){if(!n.dataset.qilySoftNavScope)n.dataset.qilySoftNavScope=isGlobalHref(n.src)?'global':'page'});
}
function fetchPage(url){if(cache.has(url.href))return Promise.resolve(cache.get(url.href));return fetch(url.href,{credentials:'same-origin',cache:'force-cache',headers:{'X-Qily-Soft-Navigation':'1'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);if(!/text\/html/i.test(r.headers.get('content-type')||''))throw new Error('not html');return r.text()}).then(function(t){cache.set(url.href,t);if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);return t})}
function syncMetadata(next){document.title=next.title||document.title;[['meta[name="description"]','content'],['meta[property="og:title"]','content'],['meta[property="og:description"]','content'],['meta[property="og:url"]','content']].forEach(function(pair){var n=next.head.querySelector(pair[0]),c=document.head.querySelector(pair[0]);if(!n)return;if(!c){c=n.cloneNode(true);document.head.appendChild(c)}else c.setAttribute(pair[1],n.getAttribute(pair[1])||'')});var can=next.head.querySelector('link[rel="canonical"]'),cc=document.head.querySelector('link[rel="canonical"]');if(can){if(!cc){cc=document.createElement('link');cc.rel='canonical';document.head.appendChild(cc)}cc.href=can.href}}
function waitStyles(nodes){return Promise.all(nodes.map(function(node){return new Promise(function(resolve){var done=false;function finish(){if(done)return;done=true;resolve()}node.addEventListener('load',finish,{once:true});node.addEventListener('error',finish,{once:true});window.setTimeout(finish,900)})}))}
function reconcileHeadAssets(next){
  markInitialAssets();
  var targetLinks=Array.from(next.head.querySelectorAll('link[rel="stylesheet"]'));
  var pageTargets=targetLinks.filter(function(n){return !isGlobalHref(n.href)});
  var targetKeys=new Set(pageTargets.map(function(n){return n.href}));
  var existingExact=new Set(Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(function(n){return n.href}));
  var added=[];
  pageTargets.forEach(function(n){if(existingExact.has(n.href))return;var c=n.cloneNode(true);c.dataset.qilySoftNavScope='page';c.dataset.qilySoftNavIncoming='true';document.head.appendChild(c);added.push(c);existingExact.add(n.href)});
  return waitStyles(added).then(function(){
    document.head.querySelectorAll('link[rel="stylesheet"][data-qily-soft-nav-scope="page"]').forEach(function(n){if(!targetKeys.has(n.href))n.remove();else n.removeAttribute('data-qily-soft-nav-incoming')});
    var nextStyles=Array.from(next.head.querySelectorAll('style'));
    document.head.querySelectorAll('style[data-qily-soft-nav-scope="page"]').forEach(function(n){n.remove()});
    nextStyles.forEach(function(n){if(n.id&&globalStyleIds.test(n.id)){if(!document.getElementById(n.id)){var g=n.cloneNode(true);g.dataset.qilySoftNavScope='global';document.head.appendChild(g)}return}var c=n.cloneNode(true);c.dataset.qilySoftNavScope='page';document.head.appendChild(c)});
  })
}
function preparePageAssets(next){syncMetadata(next);return reconcileHeadAssets(next)}
function scripts(next){
  document.querySelectorAll('script[src][data-qily-soft-nav-scope="page"]').forEach(function(n){n.remove()});
  var knownGlobal=new Set(Array.from(document.querySelectorAll('script[src][data-qily-soft-nav-scope="global"]')).map(function(n){return assetPath(n.src)}));
  next.querySelectorAll('script[src]').forEach(function(n){var src=n.getAttribute('src')||'';if(!src)return;var global=isGlobalHref(src),key=assetPath(src);if(global){if(knownGlobal.has(key))return;var gs=n.cloneNode(false);gs.src=urlOf(src)?urlOf(src).href:src;gs.defer=true;gs.dataset.qilySoftNavScope='global';document.body.appendChild(gs);knownGlobal.add(key);return}var s=n.cloneNode(false);s.src=urlOf(src)?urlOf(src).href:src;s.defer=true;s.dataset.qilySoftNavScope='page';document.body.appendChild(s)})
}
function cleanIncomingMain(main){main.querySelectorAll('#qilyGlobalFooter,#floatDock,#shareMask,#wxMask,#qilySearchMask,#qilyDockToast,#siteMusicMute,#siteBackgroundMusic').forEach(function(n){n.remove()})}
function swap(url,text,push){
  var next=new DOMParser().parseFromString(text,'text/html'),main=next.querySelector('main'),old=document.querySelector('main');
  if(!main||!old)throw new Error('shell');
  cleanIncomingMain(main);
  return preparePageAssets(next).then(function(){
    var nh=next.querySelector('header.qily-site-header,header.topbar,header.top'),oh=document.querySelector('header.qily-site-header,header.topbar,header.top');
    if(nh&&oh)oh.replaceWith(document.importNode(nh,true));
    old.replaceWith(document.importNode(main,true));
    var keep=document.body.classList.contains('qily-tail-compact');document.body.className=next.body.className||'';if(keep)document.body.classList.add('qily-tail-compact');
    scripts(next);
    if(push)history.pushState({qilySoftNavigation:true},'',url.href);else history.replaceState({qilySoftNavigation:true},'',url.href);
    document.documentElement.dataset.qilySoftNavigation='v4';
    document.dispatchEvent(new CustomEvent('qily:softnavigate',{detail:{url:url.href}}));
    window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(function(){if(url.hash){var t=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(t){t.scrollIntoView({block:'start'});return}}scrollTo({top:0,left:0,behavior:'auto'})});
    return true
  })
}
function nativeNav(url){try{if(window.__qilyLeanMusicWriteState)window.__qilyLeanMusicWriteState()}catch(e){}location.assign(url.href)}
function go(h,opt){var url=urlOf(h),o=opt||{};if(!allowed(url,o.anchor)||busy){if(url)nativeNav(url);return Promise.resolve(false)}busy=true;document.documentElement.setAttribute('aria-busy','true');return fetchPage(url).then(function(t){return swap(url,t,o.push!==false)}).then(function(){busy=false;document.documentElement.removeAttribute('aria-busy');return true}).catch(function(){busy=false;document.documentElement.removeAttribute('aria-busy');nativeNav(url);return false})}
function prefetchAnchor(a){if(!networkAllowsPrefetch()||!a)return;var u=urlOf(a.href);if(allowed(u,a))fetchPage(u).catch(function(){})}
markInitialAssets();
document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!audioPlaying())return;var a=e.target.closest&&e.target.closest('a[href]'),u=a&&urlOf(a.href);if(!allowed(u,a))return;e.preventDefault();go(u.href,{anchor:a,push:true})},true);
document.addEventListener('pointerover',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},{capture:true,passive:true});
document.addEventListener('focusin',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},true);
document.addEventListener('touchstart',function(e){var a=e.target.closest&&e.target.closest('a[href]');prefetchAnchor(a)},{capture:true,passive:true});
function warmPrimaryNav(){if(!networkAllowsPrefetch())return;Array.from(document.querySelectorAll('header a[href],.topbar a[href],#floatDock a[href]')).slice(0,8).forEach(prefetchAnchor)}
if('requestIdleCallback'in window)window.requestIdleCallback(warmPrimaryNav,{timeout:1600});else window.setTimeout(warmPrimaryNav,700);
window.addEventListener('popstate',function(){var u=urlOf(location.href);if(!u)return;if(!audioPlaying()){location.reload();return}go(u.href,{push:false})});
window.__qilyPersistentNavigate=function(h){var u=urlOf(h||'/');if(!u)return;if(audioPlaying()&&allowed(u,null))go(u.href,{push:true});else nativeNav(u)};
})(window,document);
'''


def write_soft_nav():
    return write('site-music-persistent-navigation-v1.js',SOFT_NAV_SOURCE)


def patch_publisher():
    rel='scripts/publish-primary-contrast-music-continuity.js'
    src=read(rel)
    src=re.sub(r"const MUSIC_VERSION = '[^']+';", f"const MUSIC_VERSION = '{MUSIC_VERSION}';", src, count=1)
    src=re.sub(r"const NAV_VERSION = '[^']+';", f"const NAV_VERSION = '{SOFT_NAV_VERSION}';", src, count=1)
    src=src.replace('data-qily-background-music=\"v28\"','data-qily-background-music=\"v29\"')
    src=src.replace('data-qily-persistent-music-navigation=\"v3\"','data-qily-persistent-music-navigation=\"v4\"')
    src=src.replace("'window.__qilySoftNavigationV3'", "'window.__qilySoftNavigationV4'")
    src=src.replace("\"audio.preload = 'none'\"", "\"audio.preload = resumeExpected ? 'auto' : 'metadata'\"")
    src=src.replace("\"audio.addEventListener('timeupdate', writeState\"", "\"window.addEventListener('pageshow', resumeFromSavedState)\"")
    if "'reconcileHeadAssets'" not in src:
        src=src.replace("'window.__qilyPersistentNavigate'].forEach", "'reconcileHeadAssets', 'data-qily-soft-nav-scope', 'window.__qilyPersistentNavigate'].forEach")
    src=src.replace('V28 sitewide gesture music + soft navigation','V29 sitewide gesture music + soft navigation V4')
    return write(rel,src)


def patch_self_heal():
    rel='scripts/apply-site-poka-yoke-v1.js'
    src=read(rel)
    escaped=SOFT_NAV_SOURCE.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
    src, n = re.subn(r'const softNavigationSource = `[\s\S]*?`;\n\nfunction patchSoftNavigation', 'const softNavigationSource = `'+escaped+'`;\n\nfunction patchSoftNavigation', src, count=1)
    if n != 1: raise RuntimeError('poka-yoke softNavigationSource block not found')
    # 让自愈逻辑知道当前正式版本，防止未来旧基线复写。
    fn_pattern=r"function patchMusicPublisher\(\) \{[\s\S]*?\n\}\n\nfunction runNode"
    fn_repl=r'''function patchMusicPublisher() {
  const rel = 'scripts/publish-primary-contrast-music-continuity.js';
  let src = read(rel);
  src = src.replace(/const MUSIC_VERSION = '[^']+';/, "const MUSIC_VERSION = '20260812-gesture-music-v29';");
  src = src.replace(/const NAV_VERSION = '[^']+';/, "const NAV_VERSION = '20260812-soft-navigation-v4';");
  src = src.replace(/data-qily-background-music=\"v\d+\"/g, 'data-qily-background-music=\"v29\"');
  src = src.replace(/data-qily-persistent-music-navigation=\"v\d+\"/g, 'data-qily-persistent-music-navigation=\"v4\"');
  src = src.replace(/window\.__qilySoftNavigationV\d+/g, 'window.__qilySoftNavigationV4');
  src = src.replace("\"audio.preload = 'none'\"", "\"audio.preload = resumeExpected ? 'auto' : 'metadata'\"");
  src = src.replace("\"audio.addEventListener('timeupdate', writeState\"", "\"window.addEventListener('pageshow', resumeFromSavedState)\"");
  write(rel, src);
}

function runNode'''
    src, n = re.subn(fn_pattern, fn_repl, src, count=1)
    if n != 1: raise RuntimeError('poka-yoke patchMusicPublisher block not found')
    return write(rel,src)


def patch_regression_guard():
    rel='scripts/site-regression-guard.js'
    src=read(rel)
    src=src.replace('window.__qilySoftNavigationV3','window.__qilySoftNavigationV4')
    src=src.replace("const NAV_VERSION = '20260811-soft-navigation-v3'", "const NAV_VERSION = '20260812-soft-navigation-v4'")
    src=src.replace("'window.__qilyPersistentNavigate'\n], 'soft navigation');", "'reconcileHeadAssets',\n  'data-qily-soft-nav-scope',\n  'preparePageAssets',\n  'window.__qilyPersistentNavigate'\n], 'soft navigation');")
    if "timeupdate storage writes must stay removed" not in src:
        insert="""\nassert(!music.includes(\"audio.addEventListener('timeupdate', writeState\"), 'music: timeupdate storage writes must stay removed');\nincludesAll(music, ['resumeExpected', \"audio.preload = resumeExpected ? 'auto' : 'metadata'\", \"window.addEventListener('pageshow', resumeFromSavedState)\"], 'music native-navigation resume');\nassert(!read('site-footer-standard-v28.js').includes('[80, 220, 520, 1000, 1800, 3000]'), 'footer: delayed rewrite loop returned');\nassert(!read('site-navigation.js').includes('[120,600]'), 'navigation: delayed stylesheet reorder returned');\nassert(!read('site-navigation.js').includes('[250,900,1800]'), 'navigation: delayed tail compaction loop returned');\n"""
        marker='// 4) 防呆工作流本身必须存在，形成 push + 定时复检双保险。'
        if marker not in src: raise RuntimeError('regression guard marker not found')
        src=src.replace(marker,insert+'\n'+marker)
    src=src.replace('music continuity and self-heal workflow are intact.','music continuity V4, runtime layout stability and self-heal workflow are intact.')
    return write(rel,src)


def validate_sources():
    nav=read('site-music-persistent-navigation-v1.js')
    music=read('homepage-music-v5.js')
    footer=read('site-footer-standard-v28.js')
    loader=read('site-navigation.js')
    layout=read('site-layout-footer-closure-v1.css')
    required_nav=['window.__qilySoftNavigationV4','reconcileHeadAssets','preparePageAssets','data-qily-soft-nav-scope','waitStyles','requestIdleCallback']
    for m in required_nav:
        if m not in nav: raise RuntimeError('soft nav V4 marker missing: '+m)
    if "audio.addEventListener('timeupdate', writeState" in music: raise RuntimeError('music timeupdate storage writer still present')
    for m in ['resumeExpected',"audio.preload = resumeExpected ? 'auto' : 'metadata'","window.addEventListener('pageshow', resumeFromSavedState)"]:
        if m not in music: raise RuntimeError('music resume marker missing: '+m)
    if '[80, 220, 520, 1000, 1800, 3000]' in footer: raise RuntimeError('footer delayed normalize loop still present')
    if '[120,600]' in loader or '[250,900,1800]' in loader: raise RuntimeError('navigation delayed reorder loop still present')
    if 'QILY-RUNTIME-STABILITY-V20:START' not in layout: raise RuntimeError('layout stability block missing')


def main():
    changed=[]
    changed += replace_exact_versions()
    for name, fn in [
        ('site-layout-footer-closure-v1.css',patch_layout_css),
        ('site-navigation.js',patch_navigation_loader),
        ('site-footer-standard-v28.js',patch_footer_runtime),
        ('scripts/materialize-footer-standard-v28.js',patch_footer_materializer),
        ('site-footer-standard-v26.js',patch_footer_bridge),
        ('homepage-music-v5.js',patch_music),
        ('site-music-persistent-navigation-v1.js',write_soft_nav),
        ('scripts/publish-primary-contrast-music-continuity.js',patch_publisher),
        ('scripts/apply-site-poka-yoke-v1.js',patch_self_heal),
        ('scripts/site-regression-guard.js',patch_regression_guard),
    ]:
        if fn(): changed.append(name)
    validate_sources()
    print('Runtime stability source patch complete; changed',len(set(changed)),'files before materialization.')

if __name__=='__main__':
    main()
