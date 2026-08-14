#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const self = path.basename(__filename);
const OLD_WECHAT = '\u5fae\u4fe1\u53f7';
const NEW_WECHAT = '\u5fae\u4fe1';
const OLD_OFFICIAL_URL = '\u5b98\u7f51\u7f51\u5740';
const NEW_OFFICIAL_URL = '\u5b98\u65b9\u7f51\u5740';
const PROMPT = '微信号Qily259已复制，是否开启微信主程序';
const allowedExt = new Set(['.html','.js','.css','.json','.md','.py','.txt','.xml','.kt','.kts','.java']);
const skipDirs = new Set(['.git','.github','node_modules','docs','build','.gradle']);

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (allowedExt.has(path.extname(entry.name).toLowerCase()) && entry.name !== self) out.push(full);
  }
  return out;
}

function writeIfChanged(file, before, after) {
  if (before === after) return false;
  fs.writeFileSync(file, after, 'utf8');
  return true;
}

// 1) Public/source naming migration. Historical docs and workflow definitions are intentionally excluded.
let changed = 0;
for (const file of walk(root)) {
  let before;
  try { before = fs.readFileSync(file, 'utf8'); } catch { continue; }
  let after = before.split(OLD_OFFICIAL_URL).join(NEW_OFFICIAL_URL);
  after = after.split(OLD_WECHAT).join(NEW_WECHAT);
  if (writeIfChanged(file, before, after)) changed += 1;
}

// 2) Global floating contact: remove dedicated copy row; make the WeChat module itself clickable.
const navPath = path.join(root, 'site-navigation-core.js');
let nav = fs.readFileSync(navPath, 'utf8');
nav = nav.replace(
  '<p class=\\"qily-wechat\\"><span>微信</span><strong>Qily259</strong></p><button class=\\"qily-copy-wechat\\" type=\\"button\\">复制微信</button>',
  '<div class=\\"qily-wechat-row\\"><button class=\\"qily-wechat-action\\" type=\\"button\\" data-qily-wechat-copy=\\"Qily259\\" aria-label=\\"复制微信 Qily259\\"><span>微信</span><strong>Qily259</strong></button></div>'
);
nav = nav.replace(
  "    contactMask.querySelector('.qily-copy-wechat').addEventListener('click', function () {\n      copyText('Qily259').then(function () { showToast('微信已复制'); });\n    });\n",
  ''
);

const helperMarker = '/* QILY-WECHAT-COPY-PROMPT-V12 */';
if (!nav.includes(helperMarker)) {
  const helper = `\n  ${helperMarker}\n  function ensureWechatCopyPrompt() {\n    var prompt = document.getElementById('qilyWechatCopyPrompt');\n    if (prompt) return prompt;\n    prompt = document.createElement('div');\n    prompt.id = 'qilyWechatCopyPrompt';\n    prompt.className = 'qily-wechat-copy-prompt';\n    prompt.setAttribute('role', 'status');\n    prompt.setAttribute('aria-live', 'polite');\n    prompt.innerHTML = '<span>${PROMPT}</span><button type="button" data-qily-open-wechat>开启微信</button>';\n    document.body.appendChild(prompt);\n    prompt.querySelector('[data-qily-open-wechat]').addEventListener('click', function () {\n      prompt.classList.remove('show');\n      try { window.location.href = 'weixin://'; } catch (error) {}\n      window.setTimeout(function () {\n        if (document.visibilityState === 'visible') showToast('如未自动打开微信，请手动打开微信并粘贴Qily259');\n      }, 1400);\n    });\n    return prompt;\n  }\n\n  function positionWechatCopyPrompt(anchor, prompt) {\n    var rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : {right:window.innerWidth/2,top:window.innerHeight/2,left:window.innerWidth/2,bottom:window.innerHeight/2};\n    prompt.style.left = '12px';\n    prompt.style.top = '12px';\n    window.requestAnimationFrame(function () {\n      var box = prompt.getBoundingClientRect();\n      var x = rect.right + 10;\n      if (x + box.width > window.innerWidth - 12) x = Math.max(12, rect.left - box.width - 10);\n      var y = Math.max(12, Math.min(rect.top, window.innerHeight - box.height - 12));\n      prompt.style.left = Math.round(x) + 'px';\n      prompt.style.top = Math.round(y) + 'px';\n    });\n  }\n\n  function copyWechatAndPrompt(anchor) {\n    return copyText('Qily259').then(function () {\n      var prompt = ensureWechatCopyPrompt();\n      prompt.querySelector('span').textContent = '${PROMPT}';\n      positionWechatCopyPrompt(anchor, prompt);\n      prompt.classList.add('show');\n      clearTimeout(copyWechatAndPrompt.timer);\n      copyWechatAndPrompt.timer = setTimeout(function () { prompt.classList.remove('show'); }, 9000);\n    });\n  }\n  window.__qilyCopyWechatAndPrompt = copyWechatAndPrompt;\n  document.addEventListener('click', function (event) {\n    var target = event.target.closest && event.target.closest('[data-qily-wechat-copy]');\n    if (!target) return;\n    event.preventDefault();\n    copyWechatAndPrompt(target);\n  });\n\n`;
  if (!nav.includes('  function shareUrl(')) throw new Error('site-navigation-core shareUrl anchor missing');
  nav = nav.replace('  function shareUrl(', helper + '  function shareUrl(');
}
if (!nav.includes('data-qily-wechat-copy=\\"Qily259\\"')) throw new Error('global WeChat module not upgraded');
if (nav.includes('qily-copy-wechat')) throw new Error('dedicated copy-WeChat button still exists in global modal');
if (!nav.includes(PROMPT)) throw new Error('WeChat copy prompt missing');
fs.writeFileSync(navPath, nav, 'utf8');

// 3) Contact modal visual V12: one row removed, so enlarge typography while keeping single-screen priority.
const shellPath = path.join(root, 'site-shell.css');
let shell = fs.readFileSync(shellPath, 'utf8');
const cssStart = '/* QILY-CONTACT-INTERACTION-V12:START */';
const cssEnd = '/* QILY-CONTACT-INTERACTION-V12:END */';
const cssBlock = `${cssStart}\n.qily-contact-panel{width:min(94vw,520px)!important;padding:22px 25px 24px!important}\n.qily-contact-panel h3{margin:5px 0 8px!important;font-size:27px!important;line-height:1.15!important}\n.qily-contact-panel .qily-contact-qr{width:min(54vw,220px)!important;max-width:220px!important;margin:7px auto 9px!important}\n.qily-wechat-row{display:flex!important;justify-content:center!important;margin:7px 0 11px!important}\n.qily-wechat-action{display:flex!important;width:min(100%,390px)!important;min-height:48px!important;align-items:center!important;justify-content:center!important;gap:12px!important;padding:9px 14px!important;border:1px solid #b8d9d4!important;border-radius:11px!important;color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;background:#f6fbfa!important;cursor:pointer!important;font:inherit!important;font-size:18px!important;font-weight:850!important;box-shadow:none!important}\n.qily-wechat-action strong{color:#073c47!important;-webkit-text-fill-color:#073c47!important;font-size:22px!important;font-weight:950!important;text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:4px!important;text-decoration-skip-ink:none!important}\n.qily-wechat-action:hover,.qily-wechat-action:focus-visible{border-color:#caa15f!important;background:#fff8e8!important;outline:3px solid rgba(202,161,95,.2)!important;outline-offset:2px!important}\n.qily-contact-panel .qily-phone-list{gap:9px!important;margin:13px 0 2px!important;padding-top:13px!important}\n.qily-contact-panel .qily-phone-list>div,.qily-contact-panel .qily-email-list>div{font-size:17px!important;font-weight:900!important;line-height:1.35!important}\n.qily-contact-panel .qily-phone-list a{min-height:48px!important;padding:9px 13px!important;font-size:19px!important;line-height:1.3!important}\n.qily-contact-panel .qily-phone-city{font-size:17px!important}\n.qily-contact-panel .qily-phone-number{font-size:21px!important}\n.qily-contact-panel .qily-email-list{padding-top:13px!important;margin-top:13px!important}\n.qily-contact-panel .qily-contact-email{font-size:19px!important;line-height:1.35!important}\n.qily-contact-panel .qily-email-actions{margin-top:9px!important}\n.qily-contact-panel .qily-email-actions button,.qily-contact-panel .qily-email-actions a{min-height:44px!important;font-size:17px!important}\n.qily-wechat-copy-prompt{position:fixed;z-index:12050;display:flex;max-width:min(430px,calc(100vw - 24px));align-items:center;gap:9px;padding:10px 12px;border:1px solid #caa15f;border-radius:12px;color:#17322d;background:#fff8e8;box-shadow:0 14px 34px rgba(7,60,71,.22);font-size:14px;font-weight:850;line-height:1.45;opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .16s ease,transform .16s ease,visibility .16s ease}\n.qily-wechat-copy-prompt.show{opacity:1;visibility:visible;transform:translateY(0)}\n.qily-wechat-copy-prompt button{flex:0 0 auto;min-height:36px;padding:6px 10px;border:0;border-radius:8px;color:#fff;background:#0f4b5a;cursor:pointer;font:inherit;font-weight:900}\n@media(max-width:620px){.qily-contact-panel{width:min(96vw,460px)!important;padding:20px 18px!important}.qily-contact-panel h3{font-size:25px!important}.qily-contact-panel .qily-contact-qr{width:min(58vw,210px)!important}.qily-wechat-action{font-size:17px!important}.qily-wechat-action strong{font-size:20px!important}.qily-wechat-copy-prompt{left:12px!important;right:12px!important;top:auto!important;bottom:18px!important;max-width:none!important;justify-content:space-between}}\n${cssEnd}`;
const cssRegex = new RegExp(cssStart.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '[\\s\\S]*?' + cssEnd.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
shell = shell.match(cssRegex) ? shell.replace(cssRegex, cssBlock) : shell + '\n\n' + cssBlock + '\n';
fs.writeFileSync(shellPath, shell, 'utf8');

// 4) Cooperation: entire WeChat row is one full-width button frame; no status line below the form.
const coopPath = path.join(root, 'cooperation', 'index.html');
let coop = fs.readFileSync(coopPath, 'utf8');
coop = coop.replace(
  '<button type="button" id="copyWechat">微信：Qily259</button>',
  '<button type="button" id="copyWechat" class="wechat-contact-action" data-qily-wechat-copy="Qily259" aria-label="复制微信 Qily259"><span>微信：</span><strong>Qily259</strong></button>'
);
coop = coop.replace(/\s*wechatButton\.addEventListener\('click',function\(\)\{copyText\('Qily259'\)\.then\(function\(\)\{setStatus\('[^']*','success'\);\}\);\}\);/g, '');
if (!coop.includes('class="wechat-contact-action" data-qily-wechat-copy="Qily259"')) throw new Error('cooperation whole-row WeChat button missing');
fs.writeFileSync(coopPath, coop, 'utf8');

// 5) OPL/terminology: label is “微信”; clicking the value copies and uses the global prompt.
const termPath = path.join(root, 'knowledge', 'terminology.html');
let term = fs.readFileSync(termPath, 'utf8');
term = term.replace('data-opl-copy-wechat="Qily259"', 'data-opl-copy-wechat="Qily259" data-qily-wechat-copy="Qily259"');
term = term.replace(
  /if\(wechatCopy\)\{\s*event\.preventDefault\(\);\s*copyText\([\s\S]*?return;\s*\}/,
  `if(wechatCopy){\n    event.preventDefault();\n    event.stopPropagation();\n    if(window.__qilyCopyWechatAndPrompt){window.__qilyCopyWechatAndPrompt(wechatCopy);}\n    else{copyText(wechatCopy.getAttribute('data-opl-copy-wechat')||wechatCopy.textContent||'Qily259').then(function(){toast('${PROMPT}');}).catch(function(){toast('复制失败，请手动复制微信');});}\n    return;\n  }`
);
if (!term.includes('微信：<a href="#copy-wechat"')) throw new Error('OPL WeChat label not normalized');
if (!term.includes('data-qily-wechat-copy="Qily259"')) throw new Error('OPL global copy hook missing');
fs.writeFileSync(termPath, term, 'utf8');

// 6) Legacy WeChat panel: no automatic open; same “copy first, ask before opening” behavior.
const legacyPath = path.join(root, 'qilylean', 'contact-wechat-open.js');
if (fs.existsSync(legacyPath)) {
  let legacy = fs.readFileSync(legacyPath, 'utf8');
  legacy = legacy.replace("oldTip.textContent='点击下方按钮后，将自动复制微信 Qily259，并尝试直接打开微信。进入微信后粘贴微信即可添加。';", "oldTip.textContent='点击“微信”即可复制 Qily259；复制后可选择是否开启微信主程序。';");
  legacy = legacy.replace("oldCopy.textContent='复制微信并打开微信';", "oldCopy.textContent='微信：Qily259';");
  legacy = legacy.replace(/oldCopy\.onclick=function\(e\)\{[\s\S]*?\n      \};/, `oldCopy.onclick=function(e){\n        e.preventDefault();\n        e.stopPropagation();\n        if(window.__qilyCopyWechatAndPrompt){window.__qilyCopyWechatAndPrompt(oldCopy);return;}\n        copyText(WECHAT_ID).then(function(){var toast=document.getElementById('floatToast');if(toast){toast.textContent='${PROMPT}';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},3000);}});\n      };`);
  fs.writeFileSync(legacyPath, legacy, 'utf8');
}

// 7) Final product-source QA. The required confirmation intentionally contains “微信号”.
const publicRoots = ['index.html','cooperation','knowledge','qilylean','links','share','app-support','legal','scripts'];
let violations = [];
for (const item of publicRoots) {
  const full = path.join(root, item);
  if (!fs.existsSync(full)) continue;
  const files = fs.statSync(full).isDirectory() ? walk(full) : [full];
  for (const file of files) {
    let text; try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const check = text.split(PROMPT).join('');
    if (check.includes(OLD_OFFICIAL_URL)) violations.push(path.relative(root,file)+':官网网址');
    if (check.includes(OLD_WECHAT)) violations.push(path.relative(root,file)+':微信号');
  }
}
if (violations.length) throw new Error('Naming migration violations: '+violations.slice(0,25).join(', '));

console.log(`V12 PASS: naming migration touched ${changed} text sources; contact modal, cooperation and OPL use unified WeChat interaction.`);
