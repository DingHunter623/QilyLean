#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const NAV='/site-navigation.js?v=20260827-translation-dock-resource-v46';
const GOV='/site-visual-governance-v2.css?v=20260824-readable-floor-plus2-v7';
/* R7 compatibility marker only: the first-paint runtime may record this build token, but must not hide or reload the page. */
const BUILD="BUILD='20260824-readable-floor-plus2-v4'";

function read(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
function assert(ok,message){if(!ok)throw new Error(message)}
function count(source,needle){return source.split(needle).length-1}
function htmlFiles(dir=root,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','.cache'].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())htmlFiles(full,out);
    else if(/\.html?$/i.test(entry.name))out.push(full);
  }
  return out;
}

const core=read('site-navigation-core.js');
[
  'qily-contact-channel-grid',
  'aria-label="官方网址与官网邮箱"',
  'data-qily-contact-copy="https://qilylean.com"',
  'data-qily-contact-label="官方网址"',
  'data-qily-contact-label="官网邮箱"',
  'QILY-CONTACT-LINK-ACTION-V12.5:START',
  "label+'已复制，是否打开'",
  "label==='官网邮箱'?'打开邮件':'立即打开'"
].forEach(marker=>assert(core.includes(marker),'交流双列复制/打开契约缺失：'+marker));
assert(core.includes("navigator.clipboard.writeText(text).catch(function () { return legacyCopyText(text); })"),'交流复制缺少剪贴板拒绝后的兼容回退');
assert(core.includes("p.classList.remove('show');p.style.pointerEvents='none'"),'交流提示关闭后未解除点击拦截');

const governance=read('site-visual-governance-v2.css');
[
  '--qily-readable-floor:20px',
  '--qily-readable-small:20px',
  '--qily-readable-body-note:21px',
  'grid-template-columns:repeat(2,minmax(0,1fr))!important',
  '.qily-contact-panel .qily-contact-channel',
  'html body main :is(p,li,dd,dt)'
].forEach(marker=>assert(governance.includes(marker),'全站可读性契约缺失：'+marker));

let navPages=0,governancePages=0,buildPages=0;
const navFiles=[];
const governanceFiles=[];
for(const file of htmlFiles()){
  const rel=path.relative(root,file).replace(/\\/g,'/');
  const html=fs.readFileSync(file,'utf8');
  if(/site-navigation\.js\?v=/.test(html)){
    navPages+=1;
    navFiles.push(rel);
    assert(count(html,NAV)===1,rel+'：全站导航缓存版本未唯一升级');
  }
  if(/site-visual-governance-v2\.css\?v=/.test(html)){
    governancePages+=1;
    governanceFiles.push(rel);
    assert(count(html,GOV)===1,rel+'：全站可读性缓存版本未唯一升级');
  }
  if(html.includes('qilyR2CriticalFirstPaintGuard')){
    buildPages+=1;
    assert(count(html,BUILD)===1,rel+'：首屏构建版本未唯一升级');
  }
}
const governanceSet=new Set(governanceFiles);
const navSet=new Set(navFiles);
const missingGovernance=navFiles.filter(rel=>!governanceSet.has(rel));
const extraGovernance=governanceFiles.filter(rel=>!navSet.has(rel));
assert(navPages>=470,'导航覆盖页数量异常：'+navPages);
assert(governancePages===navPages,'导航/可读性覆盖不一致：'+navPages+'/'+governancePages+'；缺少可读性='+missingGovernance.slice(0,10).join(',')+'；多余可读性='+extraGovernance.slice(0,10).join(','));
assert(buildPages>=460,'首屏缓存覆盖页数量异常：'+buildPages);

const ddz=read('tools/pure-ddz/index.html');
[
  "const version='20260824-mobile-landscape-card-comfort-v122'",
  "loadStyle('css/card-comfort-v122.css')",
  'name="screen-orientation" content="landscape"',
  'name="x5-orientation" content="landscape"',
  'MicroMessenger',
  '__PURE_DDZ_WECHAT_WEBVIEW__',
  '__PURE_DDZ_MOBILE_DEVICE__',
  '__PURE_DDZ_MANAGED_LOADER__',
  'pure-ddz-classic-share-1200x630.png'
].forEach(marker=>assert(ddz.includes(marker),'斗地主微信/舒适牌面契约缺失：'+marker));
assert(ddz.indexOf("loadStyle('css/visual-v120.css')")<ddz.indexOf("loadStyle('css/card-comfort-v122.css')"),'舒适牌面 CSS 必须在视觉基础层之后加载');

const visual=read('tools/pure-ddz/game/js/visual-v120.js');
['IS_WECHAT_WEBVIEW','IS_MOBILE_DEVICE','wechatWebView:IS_WECHAT_WEBVIEW','mobileDevice:IS_MOBILE_DEVICE',"screen.orientation.lock('landscape')","['welcome-start','start','again']",'手机默认横屏牌桌'].forEach(marker=>assert(visual.includes(marker),'斗地主手机横屏运行契约缺失：'+marker));
assert(!visual.includes('if(IS_WECHAT_WEBVIEW||!isTouchMobile())return false'),'斗地主不得再禁止微信内的横屏请求');
const theme=read('tools/pure-ddz/game/js/card-theme.js');
assert(theme.includes('if(window.__PURE_DDZ_MANAGED_LOADER__)return'),'斗地主重复加载保护缺失');
const game=read('tools/pure-ddz/game/js/game.js');
assert(!game.includes("serviceWorker?.register('./sw.js')"),'斗地主不得请求不存在的 Service Worker');
