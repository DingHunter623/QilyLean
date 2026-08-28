#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

function file(rel){return path.join(root,rel)}
function read(rel){return fs.readFileSync(file(rel),'utf8')}
function write(rel,text){fs.writeFileSync(file(rel),text.endsWith('\n')?text:text+'\n')}
function replaceRequired(text,from,to,label){
  if(!text.includes(from)) throw new Error('Missing expected source for '+label);
  return text.replace(from,to);
}
function replaceAll(text,from,to){return text.split(from).join(to)}
function replaceRegexRequired(text,re,to,label){
  if(!re.test(text)) throw new Error('Missing expected pattern for '+label);
  return text.replace(re,to);
}
function upsertBlock(text,start,end,block,anchor){
  const re=new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\\s\\S]*?'+end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\n?','m');
  text=text.replace(re,'');
  if(anchor && text.includes(anchor)) return text.replace(anchor,block+'\n\n'+anchor);
  return text.trimEnd()+'\n\n'+block+'\n';
}

// 1) Final sitewide visual closure: dark-surface contrast, OPL content axis, Dock six-button visual equality.
{
  const rel='site-stability-recovery-v1.css';
  let text=read(rel);
  const start='/* QILY-REDLINE-CLOSURE-20260828:START */';
  const end='/* QILY-REDLINE-CLOSURE-20260828:END */';
  const block=`${start}
/* Screenshot redline closure: one final authority for contrast, width and six-button Dock visuals. */
:root{--qily-redline-axis:1560px;--qily-redline-gutter:40px;--qily-redline-dock-bg:#0f4b5a;--qily-redline-dock-border:#caa15f;--qily-redline-dock-text:#ffe39b}

/* GB/T 2828 and equivalent dark preview headers: filename/meta copy must never fall back to muted dark ink. */
html:root body .preview-head .file-meta,
html:root body .preview-head [class*="file-meta"],
html:root body .preview-head>p:not(.eyebrow):not(.kicker):not(.meta):not(.fine){
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  opacity:1!important;
  text-shadow:none!important;
}

/* OPL is a public knowledge asset and must use the same 1560px desktop content axis as the main site. */
html:root body .opl-shell{
  width:min(var(--qily-redline-axis),calc(100% - (var(--qily-redline-gutter) * 2)))!important;
  max-width:var(--qily-redline-axis)!important;
  min-width:0!important;
  margin-left:auto!important;
  margin-right:auto!important;
  box-sizing:border-box!important;
}

/* Every Dock action uses one shared visual template. Share/contact may not introduce separate fills. */
html:root body #floatDock.qily-float-dock .qily-float-btn,
html:root body #floatDock.qily-floating-dock .qily-float-btn,
html:root body #floatDock :is(a,button).qily-float-btn{
  color:var(--qily-redline-dock-text)!important;
  -webkit-text-fill-color:var(--qily-redline-dock-text)!important;
  background:var(--qily-redline-dock-bg)!important;
  background-color:var(--qily-redline-dock-bg)!important;
  background-image:none!important;
  border-color:var(--qily-redline-dock-border)!important;
  box-shadow:0 8px 20px rgba(7,60,71,.22)!important;
  opacity:1!important;
  filter:none!important;
  mix-blend-mode:normal!important;
}
html:root body #floatDock .qily-float-btn *,
html:root body #floatDock .qily-float-btn:is(:link,:visited,:hover,:focus-visible,:active){
  color:var(--qily-redline-dock-text)!important;
  -webkit-text-fill-color:var(--qily-redline-dock-text)!important;
}
html:root body #floatDock .qily-float-btn:is(:hover,:focus-visible){
  background:#12606f!important;
  background-color:#12606f!important;
  background-image:none!important;
  border-color:#ffe39b!important;
}
@media(max-width:900px){
  :root{--qily-redline-gutter:15px}
  html:root body .opl-shell{width:calc(100% - 30px)!important;max-width:100%!important}
}
${end}`;
  text=upsertBlock(text,start,end,block,'/* Print/PDF is non-interactive.');
  write(rel,text);
}

// 2) Keep the canonical content-axis stylesheet aware of OPL shells as a permanent contract.
{
  const rel='site-content-axis-v1.css';
  let text=read(rel);
  const start='/* QILY-OPL-AXIS-CLOSURE-20260828:START */';
  const end='/* QILY-OPL-AXIS-CLOSURE-20260828:END */';
  const block=`${start}
html body .opl-shell{
  width:min(var(--qily-content-axis),calc(100% - (var(--qily-content-axis-gutter) * 2)))!important;
  max-width:var(--qily-content-axis)!important;
  min-width:0!important;
  margin-left:auto!important;
  margin-right:auto!important;
  box-sizing:border-box!important;
}
@media(max-width:900px){html body .opl-shell{width:100%!important;max-width:100%!important}}
${end}`;
  text=upsertBlock(text,start,end,block,null);
  write(rel,text);
}

// 3) The late-loaded gold guard must govern the whole Dock visual, not text only.
{
  const rel='site-floating-dock-gold-v1.css';
  let text=read(rel);
  const start='/* QILY-DOCK-ONE-TEMPLATE-20260828:START */';
  const end='/* QILY-DOCK-ONE-TEMPLATE-20260828:END */';
  const block=`${start}
html body #floatDock.qily-float-dock .qily-float-btn.qily-float-btn,
html body #floatDock.qily-floating-dock .qily-float-btn.qily-float-btn,
html body #floatDock :is(a,button).qily-float-btn.qily-float-btn{
  color:#ffe39b!important;
  -webkit-text-fill-color:#ffe39b!important;
  background:#0f4b5a!important;
  background-color:#0f4b5a!important;
  background-image:none!important;
  border-color:#caa15f!important;
  opacity:1!important;
  filter:none!important;
  mix-blend-mode:normal!important;
}
html body #floatDock .qily-float-btn.qily-float-btn *{color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important}
html body #floatDock .qily-float-btn.qily-float-btn:is(:hover,:focus-visible){background:#12606f!important;background-image:none!important;border-color:#ffe39b!important}
${end}`;
  text=upsertBlock(text,start,end,block,null);
  write(rel,text);
}

// 4) Capability preview: big joker = owner portrait; small joker = current homepage six-business-wing aircraft only.
{
  const rel='capabilities/index.html';
  let text=read(rel);
  text=replaceRegexRequired(
    text,
    /<div class="capability-ddz-joker small"><img src="\/qilylean\/c919-strategy-hero-v14\.png" alt="[^"]*"><b>小王 · C919<\/b><\/div>/,
    '<div class="capability-ddz-joker small"><img src="/assets/qilylean-aircraft-hero-latest-q98.webp" alt="小王：QilyLean官网首图六大业务为主翼飞机模型"><b>小王</b></div>',
    'capability small joker aircraft'
  );
  text=replaceRequired(text,'大王为个人头像 | 小王为C919六大业务飞机模型','大王为本人图像 | 小王为官网首图“六大业务为主翼”飞机模型','capability joker copy');
  write(rel,text);
}

// 5) Pure DDZ card contract: big joker portrait only; small joker homepage aircraft only; identical card frame.
{
  const rel='tools/pure-ddz/game/js/card-theme.js';
  let text=read(rel);
  text=replaceRequired(
    text,
    "const JOKER_THEME=Object.freeze({16:{type:'small-joker',title:'小王',image:assetUrl('avatar-king.webp'),aircraft:HOME_AIRCRAFT},17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}});",
    "const JOKER_THEME=Object.freeze({16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT},17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}});",
    'joker theme split'
  );
  text=replaceRegexRequired(
    text,
    /function renderJoker\(card\)\{[\s\S]*?\n  \}\n  function renderNormalCard/,
    `function renderJoker(card){\n    const theme=getTheme(card);\n    return \`<span class="qily-card qily-card--joker \${theme.type}"><span class="qily-card-corner"><b>\${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img class="qily-joker-person" src="\${escapeHtml(theme.image)}" alt="\${escapeHtml(theme.title)}" draggable="false"></span></span>\`\n  }\n  function renderNormalCard`,
    'joker renderer'
  );
  text=replaceRegexRequired(
    text,
    /if\(card\.rank>=16\)\{[\s\S]*?return `<span class="mini-card qily-mini-joker \$\{theme\.type\}">[\s\S]*?<\/span>`;\n    \}/,
    `if(card.rank>=16){\n      return \`<span class="mini-card qily-mini-joker \${theme.type}"><span class="qily-mini-joker-person"><img src="\${escapeHtml(theme.image)}" alt="\${escapeHtml(theme.title)}"></span><b>\${escapeHtml(theme.title)}</b></span>\`;\n    }`,
    'mini joker renderer'
  );
  text=replaceRegexRequired(
    text,
    /\/\* 小王：人物 \+ 官网首页首图飞机模型。[\s\S]*?\.qily-mini-joker\.small-joker>b\{font-size:13px!important;line-height:1!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important\}\n/,
    `/* 小王：仅使用官网首图“六大业务为主翼”飞机模型；大王仅使用本人头像；二者保持同一扑克牌框。 */\n        .qily-card--joker.small-joker .qily-joker-visual{top:35%!important;width:86%!important;height:58%!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}\n        .qily-card--joker.small-joker .qily-joker-person{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}\n        .qily-mini-joker.small-joker{display:grid!important;grid-template-rows:minmax(0,1fr) auto!important;align-items:center!important;justify-items:center!important;gap:3px!important;overflow:hidden!important}\n        .qily-mini-joker.small-joker .qily-mini-joker-person{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important}\n        .qily-mini-joker.small-joker .qily-mini-joker-person>img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}\n        .qily-mini-joker.small-joker>b{font-size:13px!important;line-height:1!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important}\n`,
    'small joker aircraft-only CSS'
  );
  write(rel,text);
}

// 6) DDZ first paint: never hide the entire table while scripts are loading; bump cache key and add delayed reveal fallback.
{
  const rel='tools/pure-ddz/index.html';
  let text=read(rel);
  text=replaceRequired(text,'html:not(.ddz-ready) .game-shell{visibility:hidden!important;opacity:0!important}','html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}','DDZ first paint visibility');
  text=replaceAll(text,'20260828-elder-ux-v126','20260828-elder-ux-v127');
  if(!text.includes('qilyDdzSlowLoadRevealV127')){
    text=replaceRequired(
      text,
      '      loadAt(0);',
      `      window.qilyDdzSlowLoadRevealV127=window.setTimeout(()=>{\n        if(!document.documentElement.classList.contains('ddz-ready')){\n          document.documentElement.classList.add('ddz-ready');\n          status.textContent='牌桌加载较慢，界面已先显示；脚本仍在继续加载…';\n          status.className='';\n        }\n      },3500);\n      loadAt(0);`,
      'DDZ slow-load reveal fallback'
    );
  }
  write(rel,text);
}

// 7) Materializer must preserve the v1.2.7 cache key instead of writing v1.2.6 back.
{
  const rel='scripts/materialize-ddz-public-ui-20260824.js';
  let text=read(rel);
  text=replaceAll(text,'20260828-elder-ux-v126','20260828-elder-ux-v127');
  text=replaceAll(text,'v1.2.6','v1.2.7');
  write(rel,text);
}

// 8) Regression validator: lock the clarified Joker contract and v1.2.7 first-paint contract.
{
  const rel='scripts/validate-contact-readability-ddz-20260824.js';
  let text=read(rel);
  text=replaceAll(text,'20260828-elder-ux-v126','20260828-elder-ux-v127');
  text=replaceRequired(
    text,
    "assert(theme.includes(\"16:{type:'small-joker',title:'小王',image:assetUrl('avatar-king.webp'),aircraft:HOME_AIRCRAFT}\")&&theme.includes(\"17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}\"),'大小王人物/小王飞机组合视觉契约缺失');",
    "assert(theme.includes(\"16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}\")&&theme.includes(\"17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}\"),'大小王视觉契约缺失：大王本人图像，小王官网首图飞机模型');",
    'validator joker split'
  );
  text=replaceRequired(
    text,
    "assert(theme.includes('qily-joker-aircraft')&&theme.includes('qily-mini-joker-aircraft'),'小王飞机模型主牌/底牌渲染契约缺失');",
    "assert(!theme.includes('qily-joker-aircraft')&&!theme.includes('qily-mini-joker-aircraft'),'小王不得叠加第二层飞机图；应直接以官网首图飞机模型作为牌面主体');",
    'validator no layered small-joker aircraft'
  );
  if(!text.includes("html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}")){
    text=text.replace(
      "assert(ddz.indexOf(\"loadStyle('css/visual-v120.css')\")<ddz.indexOf(\"loadStyle('css/card-comfort-v122.css')\"),'舒适牌面 CSS 必须在视觉基础层之后加载');",
      "assert(ddz.indexOf(\"loadStyle('css/visual-v120.css')\")<ddz.indexOf(\"loadStyle('css/card-comfort-v122.css')\"),'舒适牌面 CSS 必须在视觉基础层之后加载');\nassert(ddz.includes('html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}'),'斗地主首屏不得因脚本加载而隐藏整张牌桌');\nassert(ddz.includes('qilyDdzSlowLoadRevealV127'),'斗地主缺少手机/微信慢加载可见性回退');"
    );
  }
  write(rel,text);
}

// 9) Existing CI/workflows must stop reasserting the old layered Joker or v1.2.6 cache key.
for(const rel of [
  '.github/workflows/verify-pure-ddz-live.yml',
  '.github/workflows/fix-capabilities-visuals-20260824.yml',
  '.github/workflows/verify-pure-ddz-public-startfix.yml'
]){
  let text=read(rel);
  text=replaceAll(text,'20260828-elder-ux-v126','20260828-elder-ux-v127');
  text=replaceAll(text,'20260828-elder-v126','20260828-elder-v127');
  text=replaceAll(text,'20260828-v126','20260828-v127');
  text=replaceAll(text,'V126','V127');
  text=replaceAll(text,'v1.2.6','v1.2.7');
  text=replaceAll(text,"grep -Fq 'qily-joker-aircraft' tools/pure-ddz/game/js/card-theme.js","grep -Fq \"16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}\" tools/pure-ddz/game/js/card-theme.js");
  text=replaceAll(text,"grep -Fq 'qily-joker-aircraft' /tmp/card-theme.js","grep -Fq \"16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}\" /tmp/card-theme.js");
  text=replaceAll(text,"!geometry.jokerHtml.includes('avatar-king.webp')||!geometry.jokerHtml.includes('qilylean-aircraft-hero-latest-q98.webp')||!geometry.jokerHtml.includes('qily-joker-aircraft')","geometry.jokerHtml.includes('avatar-king.webp')||!geometry.jokerHtml.includes('qilylean-aircraft-hero-latest-q98.webp')");
  write(rel,text);
}

// PR showcase contract: use the current homepage aircraft and current managed-loader cache key.
{
  const rel='.github/workflows/verify-pure-ddz-capability-showcase.yml';
  let text=read(rel);
  text=replaceAll(text,'c919-strategy-hero-v14.png','qilylean-aircraft-hero-latest-q98.webp');
  text=replaceRegexRequired(text,/const version='20260824-mobile-landscape-card-comfort-v122';/,"const version='20260828-elder-ux-v127';",'showcase cache key');
  write(rel,text);
}

// Legacy product-copy workflow may mention the old C919 label; retain the aircraft but remove the forbidden visible model label.
{
  const rel='.github/workflows/sync-pure-ddz-product-overview.yml';
  let text=read(rel);
  text=replaceAll(text,'小王使用六大业务 C919 飞机模型','小王使用官网首图“六大业务为主翼”飞机模型');
  write(rel,text);
}

// 10) Sanity checks for the four screenshot defect families.
const stability=read('site-stability-recovery-v1.css');
const gold=read('site-floating-dock-gold-v1.css');
const cap=read('capabilities/index.html');
const ddz=read('tools/pure-ddz/index.html');
const theme=read('tools/pure-ddz/game/js/card-theme.js');
if(!stability.includes('.preview-head .file-meta')||!stability.includes('color:#fff!important')) throw new Error('GB/T dark filename contrast closure missing');
if(!stability.includes('html:root body .opl-shell')||!stability.includes('--qily-redline-axis:1560px')) throw new Error('OPL 1560px axis closure missing');
if(!gold.includes('background:#0f4b5a!important')||!stability.includes('#floatDock')) throw new Error('Dock one-template closure missing');
if(!cap.includes('/assets/qilylean-aircraft-hero-latest-q98.webp')||cap.includes('小王 · C919')) throw new Error('Capability small joker is not the homepage aircraft-only presentation');
if(!theme.includes("16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT}")||!theme.includes("17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}")) throw new Error('DDZ Joker contract is incorrect');
if(theme.includes('qily-joker-aircraft')||theme.includes('qily-mini-joker-aircraft')) throw new Error('Layered small-joker aircraft markup/CSS still present');
if(!ddz.includes('20260828-elder-ux-v127')||!ddz.includes('qilyDdzSlowLoadRevealV127')||!ddz.includes('html:not(.ddz-ready) .game-shell{visibility:visible!important;opacity:1!important}')) throw new Error('DDZ visible-first loading closure missing');

console.log('QILY_REDLINE_CLOSURE_20260828_OK');
