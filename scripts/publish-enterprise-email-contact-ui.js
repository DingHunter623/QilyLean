'use strict';

const fs = require('fs');
const path = require('path');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const EMAIL = 'admin@qilylean.com';
const VERSION = '20260807-enterprise-email-contact-v1';

// 1) Global floating “交流” modal source of truth.
{
  const file = 'site-navigation-core.js';
  let text = read(file);

  if (!text.includes(`var CONTACT_EMAIL = '${EMAIL}';`)) {
    const anchor = "  var PHONE_NUMBERS = ['13450014003', '15168120722', '17681788259'];\n";
    assert(text.includes(anchor), 'PHONE_NUMBERS anchor not found');
    text = text.replace(anchor, anchor + `  var CONTACT_EMAIL = '${EMAIL}';\n`);
  }

  const oldModal = `    contactMask.innerHTML = '<div class="qily-modal-panel" role="dialog" aria-modal="true" aria-labelledby="qilyContactTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><h3 id="qilyContactTitle">交流</h3><img class="wx-qr-image qily-contact-qr" alt="微信二维码"><p class="qily-wechat"><span>微信号</span><strong>Qily259</strong></p><button class="qily-copy-wechat" type="button">复制微信号</button><div class="qily-phone-list"><div>手机号码</div>' + PHONE_NUMBERS.map(function (phone) { return '<a href="tel:' + phone + '">' + phone + '</a>'; }).join('') + '</div></div>';`;
  const newModal = `    contactMask.innerHTML = '<div class="qily-modal-panel qily-contact-panel" role="dialog" aria-modal="true" aria-labelledby="qilyContactTitle"><button class="qily-modal-close" type="button" aria-label="关闭">×</button><h3 id="qilyContactTitle">交流</h3><img class="wx-qr-image qily-contact-qr" alt="微信二维码"><p class="qily-wechat"><span>微信号</span><strong>Qily259</strong></p><button class="qily-copy-wechat" type="button">复制微信号</button><div class="qily-phone-list"><div>手机号码</div>' + PHONE_NUMBERS.map(function (phone) { return '<a href="tel:' + phone + '">' + phone + '</a>'; }).join('') + '</div><div class="qily-email-list"><div>企业邮箱</div><a class="qily-contact-email" href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a><div class="qily-email-actions"><button class="qily-copy-email" type="button">复制邮箱</button><a class="qily-send-email" href="mailto:' + CONTACT_EMAIL + '">发送邮件</a></div></div></div>';`;
  if (text.includes(oldModal)) text = text.replace(oldModal, newModal);
  assert(text.includes('qily-email-list'), 'Enterprise email modal markup was not materialized');

  const oldEvent = `    contactMask.querySelector('.qily-copy-wechat').addEventListener('click', function () {\n      copyText('Qily259').then(function () { showToast('微信号已复制'); });\n    });`;
  const newEvent = `${oldEvent}\n    contactMask.querySelector('.qily-copy-email').addEventListener('click', function () {\n      copyText(CONTACT_EMAIL).then(function () { showToast('企业邮箱已复制'); });\n    });`;
  if (!text.includes("querySelector('.qily-copy-email')")) {
    assert(text.includes(oldEvent), 'WeChat copy event anchor not found');
    text = text.replace(oldEvent, newEvent);
  }

  text = text.replace(/var SHARED_ASSET_VERSION = '[^']+';/, `var SHARED_ASSET_VERSION = '${VERSION}';`);
  write(file, text);
}

// 2) Global visual standard for desktop + mobile.
{
  const file = 'site-shell.css';
  let text = read(file);
  if (!text.includes('QILY-ENTERPRISE-EMAIL-CONTACT:START')) {
    text += `\n\n/* QILY-ENTERPRISE-EMAIL-CONTACT:START */\n.qily-contact-panel{width:min(92vw,480px)}\n.qily-email-list{display:grid;gap:8px;margin:18px 0 2px;padding-top:16px;border-top:1px solid var(--qily-line)}\n.qily-email-list>div:first-child{color:var(--qily-muted);font-size:14px;font-weight:800}\n.qily-contact-email{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:42px;padding:8px 12px;border:1px solid var(--qily-line);border-radius:10px;color:var(--qily-forest)!important;background:#f6fbfa;font-weight:900;letter-spacing:.01em;text-decoration:none!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.qily-email-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}\n.qily-copy-email,.qily-send-email{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:42px;padding:9px 12px;border:0;border-radius:10px;color:#fff!important;background:var(--qily-forest);cursor:pointer;font:inherit;font-weight:850;line-height:1.2;text-decoration:none!important;white-space:nowrap}\n.qily-copy-email:hover,.qily-copy-email:focus-visible,.qily-send-email:hover,.qily-send-email:focus-visible{background:var(--qily-deep);outline:3px solid rgba(23,139,148,.2);outline-offset:2px}\n@media(max-width:420px){.qily-modal-panel.qily-contact-panel{width:min(94vw,380px);padding:22px 18px}.qily-email-actions{grid-template-columns:1fr}.qily-contact-email{font-size:14px}}\n/* QILY-ENTERPRISE-EMAIL-CONTACT:END */\n`;
  }
  write(file, text);
}

// 3) Bust loader caches through the global chain.
{
  const file = 'site-navigation-legacy-20260802.js';
  let text = read(file);
  text = text.replace(/var CORE_SRC = '\/site-navigation-core\.js\?v=[^']+';/, `var CORE_SRC = '/site-navigation-core.js?v=${VERSION}';`);
  assert(text.includes(`/site-navigation-core.js?v=${VERSION}`), 'CORE_SRC version bump failed');
  write(file, text);
}
{
  const file = 'site-navigation.js';
  let text = read(file);
  text = text.replace(/legacy\.src = '\/site-navigation-legacy-20260802\.js\?v=[^']+';/, `legacy.src = '/site-navigation-legacy-20260802.js?v=${VERSION}';`);
  assert(text.includes(`/site-navigation-legacy-20260802.js?v=${VERSION}`), 'Legacy loader version bump failed');
  write(file, text);
}

// 4) Bust the outer loader on every HTML page that already uses global navigation.
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      let text;
      try { text = read(full); } catch { continue; }
      if (!text.includes('/site-navigation.js?v=')) continue;
      const next = text.replace(/\/site-navigation\.js\?v=[^"'<>\s]+/g, `/site-navigation.js?v=${VERSION}`);
      if (next !== text) write(full, next);
    }
  }
}
walk('.');

// 5) Targeted public-contact audit.
const core = read('site-navigation-core.js');
assert(core.includes(`var CONTACT_EMAIL = '${EMAIL}';`), 'Global email constant missing');
assert(core.includes('企业邮箱') && core.includes('复制邮箱') && core.includes('发送邮件'), 'Global contact UI incomplete');
assert(core.includes("href=\"mailto:' + CONTACT_EMAIL"), 'Global mailto action missing');
assert(read('cooperation/index.html').includes(EMAIL), 'Cooperation page is not using enterprise email');
assert(read('app-support/index.html').includes(`mailto:${EMAIL}`), 'App support mailto is not using enterprise email');
assert(read('trust/index.html').includes(EMAIL), 'Trust center is not using enterprise email');
assert(read('cloudflare-worker/worker.js').includes(EMAIL), 'Worker contact/notification target is not using enterprise email');

console.log('Enterprise email contact UI publication patch completed.');
