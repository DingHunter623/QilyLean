#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const { materializeExperienceCareerBaseline } = require('./site-career-baseline-lib');

function file(rel) { return path.join(root, rel); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function write(rel, content) {
  const before = fs.existsSync(file(rel)) ? read(rel) : '';
  if (before === content) return false;
  fs.writeFileSync(file(rel), content, 'utf8');
  process.stdout.write(`self-heal: ${rel}\n`);
  return true;
}

function patchCareerPublisher() {
  const rel = 'scripts/publish-early-career-history.js';
  let src = read(rel);
  if (!src.includes("require('./site-career-baseline-lib')")) {
    src = src.replace(
      "const path = require('path');",
      "const path = require('path');\nconst { materializeExperienceCareerBaseline } = require('./site-career-baseline-lib');\n// QILY-STATIC-CAREER-BASELINE:v1"
    );
  }
  src = src.replace(
    'const nextExperience = injectResources(originalExperience, experiencePath);',
    'const nextExperience = materializeExperienceCareerBaseline(injectResources(originalExperience, experiencePath));'
  );
  write(rel, src);
}

function patchDarkSurfaceContrast() {
  const rel = 'site-dark-surface-contrast-v1.css';
  let css = read(rel);
  const start = '/* QILY-REGRESSION-DARK-SURFACE-GUARD:START */';
  const end = '/* QILY-REGRESSION-DARK-SURFACE-GUARD:END */';
  const block = `${start}\n/* 深色面板防回退：任何后加载的全站文字色阶都不得把文字压回深色。 */\nhtml body :is(.career-chain,.module-hero,.daily-hero,.article-hub,.project-hero,.projects-hero,.cooperation-hero,.capability-hero,.capabilities-hero,.experience-hero,.improvement-hero,.improvements-hero,.knowledge-hero,.trust-hero,.qily-forest-bg,.qily-olive-bg,.olive-bg,.forest-bg,.dark-bg,.qily-dark,.qily-olive,[data-qily-dark-surface=\"true\"]){color:#fff!important;-webkit-text-fill-color:#fff!important}\nhtml body :is(.career-chain,.module-hero,.daily-hero,.article-hub,.project-hero,.projects-hero,.cooperation-hero,.capability-hero,.capabilities-hero,.experience-hero,.improvement-hero,.improvements-hero,.knowledge-hero,.trust-hero,.qily-forest-bg,.qily-olive-bg,.olive-bg,.forest-bg,.dark-bg,.qily-dark,.qily-olive,[data-qily-dark-surface=\"true\"]) :is(p,li,span,small,h1,h2,h3,h4,h5,h6){color:inherit!important;-webkit-text-fill-color:inherit!important;opacity:1!important}\nhtml body :is(.career-chain,[data-qily-dark-surface=\"true\"]) :is(strong,b){color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;opacity:1!important}\n@media(max-width:760px){html body .career-chain{color:#fff!important;-webkit-text-fill-color:#fff!important}html body .career-chain strong{color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important}}\n${end}`;
  const re = /\/\* QILY-REGRESSION-DARK-SURFACE-GUARD:START \*\/[\s\S]*?\/\* QILY-REGRESSION-DARK-SURFACE-GUARD:END \*\//;
  if (re.test(css)) css = css.replace(re, block);
  else css = css.replace(/\s*$/, '\n\n' + block + '\n');
  write(rel, css);
}

const softNavigationSource = `/* QilyLean same-document soft navigation v3 | 2026-08-11\n * 音乐播放期间使用同文档站内导航，保留同一个 audio 元素；不兼容时自动回退原生导航。\n */\n(function(window,document){\n'use strict';\nif(window.top!==window.self||window.__qilySoftNavigationV3)return;\nwindow.__qilySoftNavigationV3=true;\nvar cache=new Map(),busy=false;\nvar blocked=/\\.(?:pdf|xlsx?|docx?|pptx?|zip|rar|7z|apk|aab|mp3|mp4|webm|mov|jpe?g|png|gif|webp|svg)(?:$|\\?)/i;\nvar globals=/(?:homepage-music-v5|site-music-persistent-navigation-v1|site-navigation(?:-legacy)?|site-parent-navigation|site-core-service-dock-closure|site-footer-standard|site-brand-trust|site-information-architecture|site-visual-closure|site-trust-conversion|site-text-contrast-audit)/i;\nfunction audioPlaying(){var a=document.getElementById('siteBackgroundMusic');return !!(a&&!a.paused&&!a.ended)}\nfunction urlOf(h){try{return new URL(h,location.href)}catch(e){return null}}\nfunction allowed(url,a){if(!url||url.origin!==location.origin||!/^https?:$/.test(url.protocol)||blocked.test(url.pathname+url.search))return false;if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return false;if(a&&(a.hasAttribute('download')||(a.getAttribute('target')||'').toLowerCase()==='_blank'||a.closest('[data-qily-native-navigation=\"true\"]')))return false;return true}\nfunction fetchPage(url){if(cache.has(url.href))return Promise.resolve(cache.get(url.href));return fetch(url.href,{credentials:'same-origin',headers:{'X-Qily-Soft-Navigation':'1'}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);if(!/text\\/html/i.test(r.headers.get('content-type')||''))throw new Error('not html');return r.text()}).then(function(t){cache.set(url.href,t);if(cache.size>10)cache.delete(cache.keys().next().value);return t})}\nfunction syncHead(next){document.title=next.title||document.title;var d=next.head.querySelector('meta[name=\"description\"]'),cur=document.head.querySelector('meta[name=\"description\"]');if(d){if(!cur){cur=document.createElement('meta');cur.name='description';document.head.appendChild(cur)}cur.content=d.content||''}var can=next.head.querySelector('link[rel=\"canonical\"]'),cc=document.head.querySelector('link[rel=\"canonical\"]');if(can){if(!cc){cc=document.createElement('link');cc.rel='canonical';document.head.appendChild(cc)}cc.href=can.href}var known=new Set(Array.from(document.head.querySelectorAll('link[rel=\"stylesheet\"]')).map(function(n){return n.href}));next.head.querySelectorAll('link[rel=\"stylesheet\"]').forEach(function(n){if(known.has(n.href))return;var c=n.cloneNode(true);c.setAttribute('data-qily-soft-nav-asset','true');document.head.appendChild(c);known.add(n.href)});next.head.querySelectorAll('style[id]').forEach(function(n){if(document.getElementById(n.id))return;document.head.appendChild(n.cloneNode(true))})}\nfunction scripts(next){var known=new Set(Array.from(document.querySelectorAll('script[src]')).map(function(n){return urlOf(n.src).pathname}));next.querySelectorAll('script[src]').forEach(function(n){var src=n.getAttribute('src')||'';if(!src||globals.test(src))return;var u=urlOf(src),key=u?u.pathname:src;if(known.has(key))return;var s=document.createElement('script');s.src=u?u.href:src;s.defer=true;s.setAttribute('data-qily-soft-nav-asset','true');document.body.appendChild(s);known.add(key)})}\nfunction swap(url,text,push){var next=new DOMParser().parseFromString(text,'text/html'),main=next.querySelector('main'),old=document.querySelector('main');if(!main||!old)throw new Error('shell');syncHead(next);var nh=next.querySelector('header.qily-site-header,header.topbar,header.top'),oh=document.querySelector('header.qily-site-header,header.topbar,header.top');if(nh&&oh)oh.replaceWith(document.importNode(nh,true));old.replaceWith(document.importNode(main,true));var keep=document.body.classList.contains('qily-tail-compact');document.body.className=next.body.className||'';if(keep)document.body.classList.add('qily-tail-compact');scripts(next);if(push)history.pushState({qilySoftNavigation:true},'',url.href);else history.replaceState({qilySoftNavigation:true},'',url.href);document.documentElement.dataset.qilySoftNavigation='v3';document.dispatchEvent(new CustomEvent('qily:softnavigate',{detail:{url:url.href}}));requestAnimationFrame(function(){if(url.hash){var t=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(t){t.scrollIntoView({block:'start'});return}}scrollTo({top:0,left:0,behavior:'auto'})})}\nfunction nativeNav(url){try{if(window.__qilyLeanMusicWriteState)window.__qilyLeanMusicWriteState()}catch(e){}location.assign(url.href)}\nfunction go(h,opt){var url=urlOf(h),o=opt||{};if(!allowed(url,o.anchor)||busy){if(url)nativeNav(url);return Promise.resolve(false)}busy=true;document.documentElement.setAttribute('aria-busy','true');return fetchPage(url).then(function(t){swap(url,t,o.push!==false);busy=false;document.documentElement.removeAttribute('aria-busy');return true}).catch(function(){busy=false;document.documentElement.removeAttribute('aria-busy');nativeNav(url);return false})}\ndocument.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||!audioPlaying())return;var a=e.target.closest&&e.target.closest('a[href]'),u=a&&urlOf(a.href);if(!allowed(u,a))return;e.preventDefault();go(u.href,{anchor:a,push:true})},true);\ndocument.addEventListener('pointerover',function(e){if(!audioPlaying())return;var a=e.target.closest&&e.target.closest('a[href]'),u=a&&urlOf(a.href);if(allowed(u,a))fetchPage(u).catch(function(){})},{capture:true,passive:true});\nwindow.addEventListener('popstate',function(){var u=urlOf(location.href);if(!u)return;if(!audioPlaying()){location.reload();return}go(u.href,{push:false})});\nwindow.__qilyPersistentNavigate=function(h){var u=urlOf(h||'/');if(!u)return;if(audioPlaying()&&allowed(u,null))go(u.href,{push:true});else nativeNav(u)};\n})(window,document);\n`;

function patchSoftNavigation() {
  write('site-music-persistent-navigation-v1.js', softNavigationSource);
}

function patchMusicPublisher() {
  const rel = 'scripts/publish-primary-contrast-music-continuity.js';
  let src = read(rel);
  src = src.replace("const MUSIC_VERSION = '20260810-gesture-music-v27';", "const MUSIC_VERSION = '20260811-gesture-music-v28';\nconst NAV_VERSION = '20260811-soft-navigation-v3';");
  if (!src.includes('const NAV_SRC =')) src = src.replace('const MUSIC_SRC = `/homepage-music-v5.js?v=${MUSIC_VERSION}`;', 'const MUSIC_SRC = `/homepage-music-v5.js?v=${MUSIC_VERSION}`;\nconst NAV_SRC = `/site-music-persistent-navigation-v1.js?v=${NAV_VERSION}`;');
  src = src.replace('data-qily-background-music="v27"', 'data-qily-background-music="v28"');
  if (!src.includes('const navTag =')) src = src.replace('const musicTag = `  <script defer id="qilyBackgroundMusicScript" data-qily-background-music="v28" src="${MUSIC_SRC}"></script>`;', 'const musicTag = `  <script defer id="qilyBackgroundMusicScript" data-qily-background-music="v28" src="${MUSIC_SRC}"></script>`;\nconst navTag = `  <script defer id="qilyPersistentMusicNavigationScript" data-qily-persistent-music-navigation="v3" src="${NAV_SRC}"></script>`;');
  src = src.replace('const managedBlock = [BLOCK_START, cssTag, musicTag, BLOCK_END].join(\'\\n\');', 'const managedBlock = [BLOCK_START, cssTag, musicTag, navTag, BLOCK_END].join(\'\\n\');');
  src = src.replace("['window.__qilyNativeNavigationFallbackV2', 'window.location.assign', 'window.__qilyPersistentNavigate'].forEach((marker) => {\n    if (!navigation.includes(marker)) throw new Error(`Native-navigation marker missing: ${marker}`);\n  });", "['window.__qilySoftNavigationV3', 'siteBackgroundMusic', 'fetch(url.href', 'history.pushState', \"new CustomEvent('qily:softnavigate'\", 'window.__qilyPersistentNavigate'].forEach((marker) => {\n    if (!navigation.includes(marker)) throw new Error(`soft-navigation marker missing: ${marker}`);\n  });");
  src = src.replace('data-qily-background-music="v27"', 'data-qily-background-music="v28"');
  src = src.replace("if (/site-music-persistent-navigation-v1\\.js/i.test(html)) throw new Error(`${relative} still loads iframe navigation.`);", "if (!html.includes(NAV_SRC) || !html.includes('data-qily-persistent-music-navigation=\"v3\"')) throw new Error(`${relative} missing soft-navigation asset.`);");
  src = src.replace('V27 sitewide gesture music', 'V28 sitewide gesture music + soft navigation');
  write(rel, src);
}

function runNode(rel, args) {
  cp.execFileSync(process.execPath, [file(rel)].concat(args || []), { cwd: root, stdio: 'inherit' });
}

function main() {
  write('experience/index.html', materializeExperienceCareerBaseline(read('experience/index.html')));
  patchCareerPublisher();
  patchDarkSurfaceContrast();
  patchSoftNavigation();
  patchMusicPublisher();

  // 让两个现有发布器在当前提交上重新物化，后续它们自身也会保留防回退契约。
  runNode('scripts/publish-early-career-history.js');
  runNode('scripts/publish-primary-contrast-music-continuity.js');
  process.stdout.write('QilyLean site poka-yoke self-heal applied.\n');
}

main();
