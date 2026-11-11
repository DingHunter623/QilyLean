#!/usr/bin/env node
'use strict';

/* Shared international shell first paint, 2026-10-08.
 * The published HTML supplies the current Dock owner's exact CSS, menu and
 * clearance. The existing runtime adopts those nodes and owns all actions.
 * Independent China/knowledge bridge shells retain their existing footer.
 */
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const FORMAL_CSS_HREF='/site-vi-standard-v4.css?v=20261006-vi-v4-hero-label-regular-gold-v4&hero=20261007-plain-label-v3&firstpaint=20261008-shell-v1';
const DOCK_RUNTIME_SRC='/site-dock-share-runtime-v1.js?v=20260906-authority-v58-mobile-swipe-fixed-bottom&patch=20261022-four-actions-v1&share=20261031-copy-first-v1';
const BRIEF_DOCK_RUNTIME_REV='20261110-static-shell-v2';
function dockRuntimeSrc(relative){
 const issue=/^qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html$/.exec(relative);
 return issue&&issue[1]>='2026-11-10'?DOCK_RUNTIME_SRC+'&brief='+BRIEF_DOCK_RUNTIME_REV:DOCK_RUNTIME_SRC;
}
const NAV_RAIL_REV='20261008-nav-gap-v1';
const FIRST_PAINT_REV='20261009-shell-v2';
const NAVIGATION_INPUT_REV='20261010-user-nav-v5';
const MOMENTS_NAVIGATION_REV='20261018-trust-v1';
const MOMENTS_PARENT_ROUTE='/trust/#journey';
const ORDER=['top','previous','search','current'];
const LABELS=['回到顶部','上一网页','本站搜索','分享当前'];
const DOCK_STYLE_ID='qilyDockUnifiedV58Style';
const DOCK_SPACER_ID='qilyDockBottomSpacerV58';

const HEADER_STYLE_ID='qilyGlobalHeaderFirstPaintV1';
const HEADER_ROUTES=[
 ['首页','/'],['能力体系','/capabilities/'],['改善工具','/improvements/'],
 ['精益生产','/lean-production/'],['代表项目','/projects/'],['信任中心','/trust/'],
 ['项目合作','/cooperation/'],['知识资产','/knowledge/'],['资源协同','/links/'],['关于我们','/about/']
];
const HEADER_CSS=String.raw\`
.qily-site-header.qily-global-header{position:sticky!important;top:0!important;z-index:8000!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:20px!important;min-height:70px!important;padding:10px clamp(18px,3.8vw,54px) 10px max(70px,env(safe-area-inset-left))!important;color:#182420!important;background:rgba(255,255,255,.98)!important;border-bottom:1px solid #d5e4e3!important;box-shadow:0 6px 20px rgba(15,75,90,.06)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}
.qily-global-header>.qily-brand{display:block!important;flex:0 0 auto!important;width:clamp(168px,14vw,226px)!important;height:34px!important;margin:0!important;padding:0!important;overflow:hidden!important;color:transparent!important;background:url("/assets/brand/qilylean-logo.svg?v=20260724-logo-red-dot-v5") left center/contain no-repeat!important;text-indent:-9999px!important;white-space:nowrap!important;text-decoration:none!important}
.qily-global-header>.qily-global-nav{display:flex!important;flex:0 1 auto!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;max-width:calc(100vw - 330px)!important;margin-left:auto!important;padding:0!important;overflow-x:auto!important;overflow-y:hidden!important;color:#182420!important;white-space:nowrap!important;scrollbar-width:thin!important;-webkit-overflow-scrolling:touch!important}
.qily-global-header>.qily-global-nav a{display:inline-flex!important;flex:0 0 auto!important;align-items:center!important;justify-content:center!important;min-height:42px!important;padding:7px 10px!important;border:1px solid transparent!important;border-radius:10px!important;color:#182420!important;background:transparent!important;box-shadow:none!important;font-size:18px!important;font-weight:900!important;line-height:1.2!important;text-decoration:none!important;transition:color .18s ease,background-color .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease!important}
.qily-global-header>.qily-global-nav a:hover,.qily-global-header>.qily-global-nav a:focus-visible{color:#fff!important;background:#0f4b5a!important;border-color:#0f4b5a!important;box-shadow:0 8px 18px rgba(15,75,90,.22)!important;outline:none!important;transform:translateY(-2px)!important}
.qily-global-header>.qily-global-nav a[aria-current="page"]{color:#fff!important;-webkit-text-fill-color:#fff!important;background:#0f4b5a!important;border-color:#ffe39b!important;text-decoration-color:#ffe39b!important;box-shadow:0 7px 18px rgba(15,75,90,.24)!important}
@media(max-width:900px){.qily-site-header.qily-global-header{flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:5px!important;min-height:auto!important;padding:7px 9px 8px!important}.qily-global-header>.qily-brand{width:142px!important;height:27px!important;margin-left:42px!important}.qily-global-header>.qily-global-nav{width:100%!important;max-width:100%!important;margin:0!important;justify-content:flex-start!important;gap:5px!important;overflow-x:auto!important}.qily-global-header>.qily-global-nav a{min-height:34px!important;padding:5px 9px!important;font-size:17.5px!important;border-radius:9px!important}}
@media(max-width:620px){.qily-global-header>.qily-brand{width:126px!important;height:23px!important}.qily-global-header>.qily-global-nav a{font-size:17.5px!important;padding:5px 7px!important}}
@media(min-width:901px){html:root body header.qily-site-header.qily-global-header>.qily-global-nav>a[href]{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;font-size:20px!important;font-weight:900!important;line-height:1.22!important;letter-spacing:0!important;-webkit-font-smoothing:auto!important;text-rendering:auto!important}}
@media(max-width:900px){html:root body header.qily-site-header.qily-global-header>.qily-global-nav>a[href]{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;font-weight:900!important;letter-spacing:0!important;-webkit-font-smoothing:auto!important;text-rendering:auto!important}}
\`;
const HEADER_STYLE_TAG='<style id="'+HEADER_STYLE_ID+'" data-qily-first-paint-header="v2">'+HEADER_CSS+'</style>';
function modulePathForRelative(relative){
 const p='/'+relative.replace(/\\/g,'/');
 if(p==='/index.html'||p==='/')return '/';
 if(p.startsWith('/capabilities/'))return '/capabilities/';
 if(p.startsWith('/projects/'))return '/projects/';
 if(p.startsWith('/experience/'))return '/about/';
 if(p.startsWith('/improvements/')||/\/(?:execution|papers)\.html$/.test(p)||/\/qilylean\/papers\.html$/.test(p))return '/improvements/';
 if(p.startsWith('/knowledge/')||p.startsWith('/qilylean/daily/')||/^\/(?:knowledge|daily|daily-insights|gbt2828)\.html$/.test(p)||/\/qilylean\/(?:lean-knowledge|daily-insights|lean-tools|execution-loop|reference-|gbt2828)/.test(p))return '/knowledge/';
 if(p.startsWith('/moments/')||/\/moments\.html$/.test(p))return '/trust/';
 if(p.startsWith('/links/'))return '/links/';
 if(p.startsWith('/about/'))return '/about/';
 if(p.startsWith('/cooperation/'))return '/cooperation/';
 if(p.startsWith('/trust/')||p.startsWith('/certificates/')||p.startsWith('/legal/'))return '/trust/';
 if(p.startsWith('/lean-production/'))return '/lean-production/';
 return '';
}
function addClassesToTag(tag,classes){
 return tag.replace(/^<(\w+)\b([^>]*)>/i,function(full,name,attrs){
  const m=/\bclass=(["'])(.*?)\1/i.exec(attrs);
  const merged=[...new Set(((m?m[2]:'')+' '+classes.join(' ')).trim().split(/\s+/).filter(Boolean))].join(' ');
  const next=m?attrs.replace(m[0],'class="'+merged+'"'):attrs+' class="'+merged+'"';
  return '<'+name+next+'>';
 });
}
function addAttributeToTag(tag,name,value){
 if(new RegExp('\\b'+name+'\\s*=', 'i').test(tag))return tag;
 return tag.replace(/>$/,' '+name+'="'+value+'">');
}
function canonicalHeader(relative){
 const active=modulePathForRelative(relative);
 const links=HEADER_ROUTES.map(([label,href])=>'<a href="'+href+'"'+(active===href?' aria-current="page"':'')+'>'+label+'</a>').join('');
 return '<header class="qily-site-header qily-global-header" data-qily-public-shell-first-paint="v2"><a class="qily-brand" href="/" aria-label="返回QilyLean首页" title="返回首页">QilyLean｜启力精益</a><nav class="site-nav qily-global-nav" aria-label="QilyLean核心导视">'+links+'</nav></header>';
}
function materializeHeader(source,relative){
 const match=/<header\b[\s\S]*?<\/header>/i.exec(source);
 if(!match)return canonicalHeader(relative);
 let header=match[0];
 const navMatch=/<nav\b([^>]*)>([\s\S]*?)<\/nav>/i.exec(header);
 const brandMatch=/<a\b[^>]*\bclass=["'][^"']*\b(?:qily-brand|brand)\b[^"']*["'][^>]*>/i.exec(header);
 const hrefs=navMatch?[...navMatch[2].matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m=>m[1]):[];
 const complete=!!navMatch&&!!brandMatch&&hrefs.length===HEADER_ROUTES.length&&HEADER_ROUTES.every((route,i)=>hrefs[i]===route[1]);
 if(!complete)return canonicalHeader(relative);
 header=addClassesToTag(header,['qily-site-header','qily-global-header']);
 header=header.replace(/<header\b([^>]*)>/i,tag=>addAttributeToTag(tag,'data-qily-public-shell-first-paint','v2'));
 header=header.replace(/<nav\b([^>]*)>/i,tag=>addAttributeToTag(addClassesToTag(tag,['site-nav','qily-global-nav']),'aria-label','QilyLean核心导视'));
 header=header.replace(brandMatch[0],addClassesToTag(brandMatch[0],['qily-brand']));
 return header;
}

const runtime=fs.readFileSync(path.join(ROOT,'site-dock-share-runtime-v1.js'),'utf8');
const cssArray=runtime.match(/style\.textContent=(\[[\s\S]*?\])\.join\(''\);/);
if(!cssArray)throw new Error('The authoritative Dock CSS array is unavailable.');
const criticalDockCss=vm.runInNewContext(cssArray[1],Object.create(null),{timeout:1000}).join('');
if(!criticalDockCss.includes('#'+DOCK_SPACER_ID)||!criticalDockCss.includes('position:fixed!important'))throw new Error('The authoritative Dock first-paint contract is incomplete.');
const formalTag=`<link id="qilyViV4Formal" data-qily-vi="v4-formal" rel="stylesheet" href="${FORMAL_CSS_HREF}">`;
const styleTag=`<style id="${DOCK_STYLE_ID}" data-qily-first-paint-dock="v1">${criticalDockCss}</style>`;
const runtimeTag=`<script defer data-qily-dock-share-runtime="v1" src="${DOCK_RUNTIME_SRC}"></script>`;
const dockTag=[
  '<nav id="floatDock" class="qily-float-dock qily-page-action-nav" aria-label="页面快捷导航" data-qily-first-paint-dock="v1" data-qily-standalone-dock="v5.8" data-qily-dock-layout="fixed-bottom-footer-navigation" data-qily-stable-order="'+ORDER.join(',')+'" data-qily-unified-public-module="v5.8-fixed-bottom-footer-navigation">',
  ...ORDER.map((action,i)=>`  <button type="button" class="qily-float-btn qily-float-${action}" data-action="${action}" aria-label="${LABELS[i]}" title="${LABELS[i]}" data-qily-label-owner="dock-v5.8-footer"><span class="qily-dock-label" aria-hidden="true"><span>${LABELS[i]}</span></span></button>`),
  '</nav>'
].join('\n');
const spacerTag=`<div id="${DOCK_SPACER_ID}" aria-hidden="true"></div>`;
// The fixed footer is physically positioned by its own HTML on 2026-11-10+
// briefs. This survives an early legacy stylesheet and requires no JS handoff.
// Do not lock responsive padding/gap: V5.8 media queries own those values.
const BRIEF_INLINE_FIXED='position:fixed!important;left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%!important;max-width:none!important;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;justify-content:flex-start!important;align-items:center!important;margin:0!important;box-sizing:border-box!important;transform:none!important;z-index:2147482000!important;background:#0f4b5a!important;border-top:3px solid #c8a25a!important';
function briefDockMarkup(relative){
  const date=/^qilylean\/daily\/(\d{4}-\d{2}-\d{2})\.html$/.exec(relative);
  if(!date||date[1]<'2026-11-10')return dockTag;
  return dockTag.replace('data-qily-standalone-dock="v5.8"',
    'style="'+BRIEF_INLINE_FIXED+'" data-qily-standalone-dock="v5.8"');
}


function isEligible(relative,source){
  if(relative.startsWith('cn-site/')||relative.startsWith('global-knowledge/')||relative==='links/cn-public/index.html'||relative==='tools/pure-ddz/index.html')return false;
  if(/(?:class=["'][^"']*\bcn-bridge-footer\b|data-cn-bridge-fallback)/i.test(source))return false;
  return /(?:site-navigation\.js|site-contact-route-v1\.js|site-dock-share-runtime-v1\.js)/.test(source)&&/<\/head\s*>/i.test(source)&&/<body\b[^>]*>/i.test(source)&&/<\/body\s*>/i.test(source);
}

function materialize(source,relative){
  if(!isEligible(relative,source))return source;
  const staticHeader=materializeHeader(source,relative);
  let next=source;
  const isMoments=relative.startsWith('moments/')||relative==='moments.html';
  next=next.replace(/\/site-navigation\.js\?[^"'\s<>]*/g,url=>{
    let base=url.replace(/&(?:firstpaint|input)=[^&"'\s<>]*/g,'');
    if(isMoments)base=base.replace(/&journey=[^&"'\s<>]*/g,'')+'&journey='+MOMENTS_NAVIGATION_REV;
    return base+'&firstpaint='+FIRST_PAINT_REV+'&input='+NAVIGATION_INPUT_REV;
  });
  if(isMoments){
    // The canonical Dock and parent-navigation runtimes both honor rel=up.
    // Keep the photo archive inside Trust Center even before navigation loads.
    next=next.replace(/\n?<link\b[^>]*\brel=["']up["'][^>]*>\n?/gi,'\n');
    next=next.replace(/<\/head\s*>/i,'<link rel="up" href="'+MOMENTS_PARENT_ROUTE+'">\n</head>');
    next=next.replace(/<header\b[\s\S]*?<\/header>/gi,header=>header.replace(/<a\b[^>]*>/gi,tag=>{
      tag=tag.replace(/\s(?:aria-current|data-qily-page-current|data-qily-primary-current)=["'][^"']*["']/gi,'');
      return /\bhref=["']\/trust\/["']/i.test(tag)?tag.replace(/>$/,' aria-current="page" data-qily-page-current="true" data-qily-primary-current="true">'):tag;
    }));
  }
  next=next.replace(/\/site-(?:interaction-semantics-v1\.js|visual-authority-r8\.css)\?[^"'\s<>]*/g,url=>url.replace(/&rail=[^&"'\s<>]*/g,'')+'&rail='+NAV_RAIL_REV);
  next=next.replace(/\/site-interaction-semantics-v1\.js\?[^"'\s<>]*/g,url=>url.replace(/&input=[^&"'\s<>]*/g,'')+'&input='+NAVIGATION_INPUT_REV);
  next=next.replace(/\/site-brand-home-feedback-v1\.js\?[^"'\s<>]*/g,url=>url.replace(/&firstpaint=[^&"'\s<>]*/g,'')+'&firstpaint='+FIRST_PAINT_REV);
  next=next.replace(/\/site-contact-route-v1\.js\?[^"'\s<>]*/g,url=>url.replace(/&firstpaint=[^&"'\s<>]*/g,'')+'&firstpaint='+FIRST_PAINT_REV);
  const routeDockRuntime=dockRuntimeSrc(relative);
  next=next.replace(/\/site-dock-share-runtime-v1\.js(?:\?[^\"'\s<>]*)?/g,routeDockRuntime);
  // Replace only the nodes owned by this shared first-paint contract.
  next=next.replace(/\n?<link\b[^>]*id=["']qilyViV4Formal["'][^>]*>\n?/gi,'\n');
  next=next.replace(/\n?<style\b[^>]*id=["']qilyDockUnifiedV58Style["'][^>]*>[\s\S]*?<\/style>\n?/gi,'\n');
  next=next.replace(/\n?<nav\b[^>]*id=["']floatDock["'][^>]*data-qily-first-paint-dock=["']v1["'][^>]*>[\s\S]*?<\/nav>\n?/gi,'\n');
  next=next.replace(/\n?<div\b[^>]*id=["']qilyDockBottomSpacerV58["'][^>]*>\s*<\/div>\n?/gi,'\n');
  if(/\bid=["']floatDock["']/.test(next))throw new Error(relative+': a non-materialized Dock already exists.');
  // Regional generators can introduce this owned runtime on their first pass.
  // Reinsert it at the same head position when another materializer rebuilds its tags.
  next=next.replace(/\s*<script\b[^>]*data-qily-dock-share-runtime=["']v1["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
  const extraRuntime=/<script\b[^>]*\bsrc=["'][^"']*\/site-dock-share-runtime-v1\.js(?:\?[^"']*)?["'][^>]*>/i.test(next)?'':runtimeTag.replace(DOCK_RUNTIME_SRC,routeDockRuntime)+'\n';
  next=next.replace(/\s*<style\b[^>]*id=["']qilyGlobalHeaderFirstPaintV1["'][^>]*>[\s\S]*?<\/style>\s*/gi,'\n');
  next=next.replace(/<\/head\s*>/i,extraRuntime+formalTag+'\n'+styleTag+'\n'+HEADER_STYLE_TAG+'\n'+'</head>');
  // Resource directory: establish the rail's containing block before any
  // runtime inserts it. R8 stylesheet order alone cannot anchor an absolute
  // rail while the legacy .topbar still lacks the runtime header classes.
  // Keep the existing final authority order and other routes unchanged.
  if(relative==='links/index.html'){
    if(!next.includes('.topbar{'))throw new Error('Resource directory lost its initial header styles');
    if(!next.includes('.topbar{position:relative;'))next=next.replace('.topbar{','.topbar{position:relative;');
    const r8=next.match(/\n?<link\b[^>]*\bid=["']qilyVisualAuthorityR8["'][^>]*>\n?/i);
    if(!r8)throw new Error('Resource directory lost its R8 style authority');
    const authorityLink=r8[0].trim();
    next=next.replace(r8[0],'\n');
    next=next.replace(/<\/head\s*>/i,authorityLink+'\n</head>');
  }

  next=next.replace(/<header\b[\s\S]*?<\/header>/i,'');
  next=next.replace(/(<body\b[^>]*>)\n?/i,'$1\n'+briefDockMarkup(relative)+'\n'+staticHeader+'\n');
  next=next.replace(/\s*<\/body\s*>/i,'\n'+spacerTag+'\n</body>');
  return next;
}

function main(){
  const check=process.argv.includes('--check');
  const files=execFileSync('git',['ls-files','*.html'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  let eligible=0,changed=0,directAdded=0;
  for(const relative of files){
    const file=path.join(ROOT,relative);if(!fs.existsSync(file))continue;
    const source=fs.readFileSync(file,'utf8');
    const bridge=!relative.startsWith('cn-site/')&&source.includes('<footer class="cn-bridge-footer">');
    if(!isEligible(relative,source)&&!bridge)continue;
    eligible++;
    const next=bridge?materializeBridge(source):materialize(source,relative);
    if(next!==source){changed++;if(!/site-dock-share-runtime-v1\.js/.test(source))directAdded++;if(!check)fs.writeFileSync(file,next);}
  }
  if(check&&changed)throw new Error('Shared international first-paint shell is stale on '+changed+'/'+eligible+' eligible HTML pages.');
  console.log(`${check?'CHECK':'APPLY'} PASS: shared international first-paint shell; eligible=${eligible}; changed=${changed}; directRuntimeAdded=${directAdded}; canonicalDockCssBytes=${Buffer.byteLength(criticalDockCss)}.`);
}

function materializeBridge(source){
  // The isolated knowledge pages keep their own header/content/translation.
  // Only the public footer adopts the canonical four-action owner.
  let next=source.replace(/<footer class="cn-bridge-footer">[\s\S]*?<\/footer>/,
    '<footer class="cn-bridge-footer">'+dockTag+'</footer>');
  next=next.replace(/\n?<style\b[^>]*id=["']qilyDockUnifiedV58Style["'][^>]*>[\s\S]*?<\/style>\n?/gi,'\n');
  next=next.replace(/\n?<style\b[^>]*id=["']qilyBridgeFooterOwnerV1["'][^>]*>[\s\S]*?<\/style>\n?/gi,'\n');
  next=next.replace(/\n?<div\b[^>]*id=["']qilyDockBottomSpacerV58["'][^>]*>\s*<\/div>\n?/gi,'\n');
  next=next.replace(/\s*<script\b[^>]*data-qily-dock-share-runtime=["']v1["'][^>]*>[\s\S]*?<\/script>\s*/gi,'\n');
  next=next.replace(/<\/head\s*>/i,runtimeTag+'\n'+styleTag+'\n'+
    '<style id="qilyBridgeFooterOwnerV1">html:root:root:root body .cn-bridge-footer{position:static!important;padding:0!important;margin:0!important;border:0!important;min-height:0!important}html:root:root:root body:has(.cn-bridge-footer #floatDock){padding-bottom:0!important}</style>\n</head>');
  next=next.replace(/(\/global-knowledge\/cn-bridge-shell-v1\.js\?[^"'\s<>]*)/g,url=>url.replace(/&footer=[^&"'\s<>]*/g,'')+'&footer=20261022-four-actions-v1');
  next=next.replace(/\s*<\/body\s*>/i,'\n'+spacerTag+'\n</body>');
  return next;
}

module.exports={ROOT,FORMAL_CSS_HREF,DOCK_RUNTIME_SRC,dockRuntimeSrc,NAV_RAIL_REV,FIRST_PAINT_REV,NAVIGATION_INPUT_REV,MOMENTS_NAVIGATION_REV,MOMENTS_PARENT_ROUTE,ORDER,LABELS,DOCK_STYLE_ID,DOCK_SPACER_ID,HEADER_STYLE_ID,HEADER_CSS,HEADER_ROUTES,criticalDockCss,isEligible,materialize,materializeHeader};
if(require.main===module)main();
