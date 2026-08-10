(function (d, w) {
  'use strict';
  if (w.__qilyFooterStandardV26) return;
  w.__qilyFooterStandardV26 = true;

  var VERSION = '20260810-footer-global-v26';
  var CONTACT_ID = 'qilyGlobalContactFooter';
  var STYLE_ID = 'qilyFooterStandardV26Style';
  var CONTACT_EMAIL = 'admin@qilylean.com';
  var HOME_URL = 'https://qilylean.com/';

  function clean(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function ensureStyle() {
    if (d.getElementById(STYLE_ID)) return;
    var style = d.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute('data-qily-footer-standard', 'v26');
    style.textContent = [
      'html:root:root:root body .qily-footer-v26-legacy-row{display:none!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:min(100%,1500px)!important;max-width:1500px!important;margin:0 auto!important;padding:8px clamp(18px,2.8vw,42px)!important;border-top:0!important;background:transparent!important;color:#dbe8e4!important;font-size:clamp(10.5px,.72vw,13.25px)!important;font-weight:780!important;line-height:1.2!important;letter-spacing:0!important;text-align:center!important;white-space:nowrap!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-slogan{color:#edf4f1!important;font-weight:800!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-title{color:#fff!important;font-weight:900!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-sep{margin:0 2px!important;color:rgba(255,227,155,.82)!important;font-weight:750!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-label{color:#dbe8e4!important;font-weight:800!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>a{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:26px!important;padding:2px 7px!important;border:1px solid rgba(255,227,155,.52)!important;border-radius:7px!important;background:rgba(255,255,255,.035)!important;color:#ffe39b!important;-webkit-text-fill-color:#ffe39b!important;font:inherit!important;font-weight:900!important;line-height:1.15!important;text-decoration:none!important;white-space:nowrap!important}',
      'html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>a:is(:hover,:focus-visible){background:#ffe39b!important;color:#17322d!important;-webkit-text-fill-color:#17322d!important;border-color:#ffe39b!important;outline:2px solid rgba(255,227,155,.28)!important;outline-offset:2px!important}',
      '@media(max-width:1180px) and (min-width:821px){html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26{gap:3px!important;padding-left:10px!important;padding-right:10px!important;font-size:clamp(9.5px,.78vw,11.5px)!important}html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>a{padding-left:5px!important;padding-right:5px!important}}',
      '@media(max-width:820px){html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26{display:flex!important;flex-wrap:wrap!important;gap:5px 7px!important;width:100%!important;padding:9px 12px!important;font-size:12.5px!important;line-height:1.35!important;white-space:normal!important}html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-slogan{flex:1 0 100%!important}html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>a{min-height:28px!important;padding:3px 7px!important}}',
      '@media(max-width:520px){html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26{gap:5px!important;padding:8px 9px!important;font-size:11.5px!important}html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-title{flex:1 0 100%!important}html:root:root:root body #'+CONTACT_ID+'.qily-footer-standard-v26>.qily-footer-v26-sep.qily-footer-v26-sep-title{display:none!important}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function footerFor(contact) {
    var footer = contact && contact.closest ? contact.closest('footer,.module-footer,.footer') : null;
    if (footer) return footer;
    var footers = d.querySelectorAll('footer,.module-footer,.footer');
    return footers.length ? footers[footers.length - 1] : null;
  }

  function ensureFooterShell() {
    var trust = d.getElementById('qtc-global-trust-footer');
    var footer = footerFor(null);
    if (footer) return footer;
    footer = d.createElement('footer');
    footer.className = 'module-footer qily-footer-v26-shell';
    if (trust && trust.parentNode) trust.parentNode.insertBefore(footer, trust);
    else (d.body || d.documentElement).appendChild(footer);
    return footer;
  }

  function ensureContact() {
    var contact = d.getElementById(CONTACT_ID);
    if (contact) return contact;
    contact = d.createElement('div');
    contact.id = CONTACT_ID;
    contact.className = 'qily-global-contact-footer';
    ensureFooterShell().appendChild(contact);
    return contact;
  }

  function markLegacyRows(footer, contact) {
    if (!footer) return;
    Array.from(footer.children).forEach(function (node) {
      if (node === contact || (node.contains && node.contains(contact))) return;
      var text = clean(node.textContent);
      if (!text) return;
      var hasControl = !!node.querySelector('a[href],button,input,select,textarea');
      if (hasControl) return;
      var legacy = /让改善形成体系|让精益产生力量|Lean\s*[·•|｜]\s*IE\s*[·•|｜]\s*Smart Factory|丁启利\s*[｜|·]|QilyLean\s*[｜|]\s*启力精益\s*[·•]\s*丁启利|制造改善能力画像|制造改善诊断与项目交付/i.test(text);
      if (legacy) node.classList.add('qily-footer-v26-legacy-row');
    });
  }

  function renderContact(contact) {
    contact.className = 'qily-global-contact-footer qily-footer-standard-v26';
    contact.setAttribute('data-qily-footer-standard', 'v26');
    contact.setAttribute('data-qily-footer-standard-version', VERSION);
    contact.innerHTML = [
      '<span class="qily-footer-v26-slogan">让改善形成体系，让精益产生力量。</span>',
      '<span class="qily-footer-v26-sep">｜</span>',
      '<span class="qily-footer-v26-title">QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span>',
      '<span class="qily-footer-v26-sep qily-footer-v26-sep-title">｜</span>',
      '<span class="qily-footer-v26-label">官网网址：</span>',
      '<a href="'+HOME_URL+'">'+HOME_URL+'</a>',
      '<span class="qily-footer-v26-sep">｜</span>',
      '<span class="qily-footer-v26-label">企业邮箱：</span>',
      '<a href="mailto:'+CONTACT_EMAIL+'">'+CONTACT_EMAIL+'</a>'
    ].join('');
  }

  function normalize() {
    if (!d.body) return;
    ensureStyle();
    var contact = ensureContact();
    var footer = footerFor(contact) || ensureFooterShell();
    if (contact.parentNode !== footer) footer.appendChild(contact);
    footer.setAttribute('data-qily-footer-standard', 'v26');
    markLegacyRows(footer, contact);
    renderContact(contact);
  }

  function boot() {
    normalize();
    [100,350,900,1800].forEach(function (delay) { w.setTimeout(normalize, delay); });
    if (w.MutationObserver) {
      var observer = new MutationObserver(function (records) {
        var relevant = records.some(function (record) {
          return Array.from(record.addedNodes || []).some(function (node) {
            return node && node.nodeType === 1 && (node.id === CONTACT_ID || node.matches && node.matches('footer,.module-footer,.footer,#qtc-global-trust-footer'));
          });
        });
        if (relevant) normalize();
      });
      observer.observe(d.body, { childList:true, subtree:true });
      w.setTimeout(function () { observer.disconnect(); }, 3500);
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})(document, window);
