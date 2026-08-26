/* QilyLean public integrity hotfix v2 | 2026-08-26
 * Purpose:
 * 1) keep terminology counts aligned with /qilylean/site-data.json even when legacy HTML is cached;
 * 2) keep exactly one terminology count strip and preserve readable foreground on its light surface;
 * 3) make certificate verification boundaries explicit wherever certificate material is displayed;
 * 4) prevent learning/practice records from being mistaken for official endorsements.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyPublicIntegrityHotfixV1) return;
  w.__qilyPublicIntegrityHotfixV1 = true;

  var BUILD = '20260826-public-integrity-v2';
  var DATA_URL = '/qilylean/site-data.json?v=' + BUILD;
  var path = (w.location.pathname || '/').replace(/\/index\.html$/, '/');

  function ensureStyle() {
    if (d.getElementById('qilyPublicIntegrityHotfixV1Style')) return;
    var style = d.createElement('style');
    style.id = 'qilyPublicIntegrityHotfixV1Style';
    style.textContent = [
      '.qily-live-data-note,#qilyTerminologyStaticCount{margin:14px 0 0;padding:12px 15px;border-left:4px solid #178b94;background:#edf8f6!important;color:#315f64!important;-webkit-text-fill-color:#315f64!important;font-size:14px;line-height:1.7}',
      '.qily-live-data-note *,#qilyTerminologyStaticCount *{color:inherit!important;-webkit-text-fill-color:inherit!important}',
      '.qily-live-data-note strong,#qilyTerminologyStaticCount strong{color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important}',
      '.qily-cert-verification{margin-top:18px;padding:20px;border:1px solid #d5e4e3;border-top:4px solid #caa15f;background:#fff;box-shadow:0 12px 30px rgba(15,75,90,.07)}',
      '.qily-cert-verification h3{margin:0 0 8px;color:#0f4b5a}',
      '.qily-cert-verification>p{margin:0 0 15px;color:#526b69;line-height:1.75}',
      '.qily-cert-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
      '.qily-cert-grid div{padding:12px 14px;border:1px solid #d5e4e3;background:#f7fbfa}',
      '.qily-cert-grid strong{display:block;margin-bottom:4px;color:#0f4b5a;font-size:13px}',
      '.qily-cert-grid span{display:block;color:#526b69;line-height:1.6}',
      '.qily-cert-boundary{margin-top:14px;padding:13px 15px;border-left:4px solid #caa15f;background:#fff8e8;color:#5f543e;line-height:1.72}',
      '.qily-cert-status{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:999px;background:#fff0c9;color:#765416;font-size:12px;font-weight:900;vertical-align:middle}',
      '@media(max-width:720px){.qily-cert-grid{grid-template-columns:1fr}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function replaceText(root, expression, replacement) {
    if (!root || !w.NodeFilter) return;
    var walker = d.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !expression.test(node.nodeValue)) continue;
      expression.lastIndex = 0;
      node.nodeValue = node.nodeValue.replace(expression, replacement);
    }
  }

  function normalizeTerminology(total) {
    if (!Number.isInteger(total) || total < 1) return;
    var count = d.getElementById('termCount');
    if (count) {
      count.textContent = '共收录 ' + total + ' 项术语 · ' + total + ' 份单点培训课件';
      count.setAttribute('data-site-metadata-source', '/qilylean/site-data.json');
    }

    var scope = d.querySelector('main') || d.body;
    replaceText(scope, /收录\s*\d+\s*个核心术语/g, '当前收录 ' + total + ' 项核心术语');
    replaceText(scope, /收录\s*\d+\s*项核心术语/g, '当前收录 ' + total + ' 项核心术语');

    var hero = d.querySelector('.module-hero .module-inner');
    if (!hero) return;
    var staticNote = d.getElementById('qilyTerminologyStaticCount');
    var liveNote = d.getElementById('qilyTerminologyLiveDataNote');
    var copy = '<strong>当前术语库：</strong>' + total + ' 项术语 · ' + total + ' 份单点培训课件。数量由统一站点数据源自动核算，页面不再维护硬编码数量。';

    if (staticNote) {
      staticNote.innerHTML = copy;
      staticNote.setAttribute('data-site-metadata-source', '/qilylean/site-data.json');
      staticNote.setAttribute('data-qily-light-surface', 'true');
      if (liveNote && liveNote !== staticNote) liveNote.remove();
      return;
    }

    if (!liveNote) {
      liveNote = d.createElement('p');
      liveNote.id = 'qilyTerminologyLiveDataNote';
      liveNote.className = 'qily-live-data-note';
      var subnav = hero.querySelector('.module-subnav');
      hero.insertBefore(liveNote, subnav || null);
    }
    liveNote.innerHTML = copy;
    liveNote.setAttribute('data-site-metadata-source', '/qilylean/site-data.json');
    liveNote.setAttribute('data-qily-light-surface', 'true');
  }

  function buildVerificationPanel() {
    var panel = d.createElement('section');
    panel.className = 'qily-cert-verification';
    panel.setAttribute('data-qily-certificate-verification', 'v1');
    panel.innerHTML = '' +
      '<h3>证书核验信息 <span class="qily-cert-status">核验信息待补全</span></h3>' +
      '<p>该图片可作为个人学习与AI应用经历的辅助材料。对外作为“资质/认证”引用前，应能够独立核验颁发主体、证书编号、颁发日期和官方核验入口。</p>' +
      '<div class="qily-cert-grid">' +
        '<div><strong>展示名称</strong><span>大模型应用工程师</span></div>' +
        '<div><strong>证书原图</strong><span>官网已公开展示</span></div>' +
        '<div><strong>颁发机构</strong><span>当前官网未提供可独立核验的信息</span></div>' +
        '<div><strong>证书编号</strong><span>当前官网未公开</span></div>' +
        '<div><strong>颁发日期</strong><span>当前官网未公开</span></div>' +
        '<div><strong>官方核验入口</strong><span>当前官网未提供</span></div>' +
      '</div>' +
      '<div class="qily-cert-boundary"><strong>公开边界：</strong>在上述核验信息补全前，本项仅按“专项技能证书图片／学习与应用经历佐证”展示，不表述为政府资质、行业权威认证、OpenAI官方认证或授权，也不作为客户背书。</div>';
    return panel;
  }

  function normalizeCapabilityCertificate() {
    var section = d.getElementById('ai-certificate');
    if (!section) return;

    var title = section.querySelector('h2');
    if (title) title.textContent = 'AI应用专项证书展示';
    var lead = section.querySelector('.module-lead');
    if (lead) {
      lead.textContent = '证书图片作为AI学习与应用经历的辅助材料；真实性与资质效力以颁发机构、证书编号、颁发日期和官方核验入口为准。信息未公开或无法独立核验时，不作为官方认证、授权或客户背书。';
    }

    var card = section.querySelector('.evidence-card');
    if (card) {
      var heading = card.querySelector('h3');
      if (heading) heading.textContent = '大模型应用工程师｜专项技能证书图片';
      var meta = card.querySelector('.evidence-meta');
      if (meta) meta.textContent = '能力边界 | AI用于辅助信息处理、方案生成、代码与自动化；制造结论仍须以现场数据、工程标准、过程验证和人工复核为准。证书核验信息未补全前，不将该图片作为官方资质证明。';
    }

    var grid = section.querySelector('.capability-certificate');
    if (grid && !section.querySelector('[data-qily-certificate-verification]')) {
      grid.insertAdjacentElement('afterend', buildVerificationPanel());
    }
  }

  function normalizeChatgptMemorialCertificate() {
    if (path.indexOf('/certificates/chatgpt-lean') !== 0) return;
    var hero = d.querySelector('.module-hero .module-inner');
    if (!hero || d.getElementById('qilyChatgptCertificateBoundary')) return;
    var note = d.createElement('p');
    note.id = 'qilyChatgptCertificateBoundary';
    note.className = 'qily-cert-boundary';
    note.innerHTML = '<strong>性质说明：</strong>本页记录个人AI工具学习与制造实践成果，属于学习纪念与能力佐证材料，不构成OpenAI官方认证、授权、政府资质、行业认证或客户背书。';
    var subnav = hero.querySelector('.module-subnav');
    hero.insertBefore(note, subnav || null);
  }

  function strengthenTrustRule() {
    if (path.indexOf('/trust') !== 0) return;
    var section = d.getElementById('ai');
    if (!section || section.querySelector('[data-qily-cert-rule="v1"]')) return;
    var note = d.createElement('div');
    note.className = 'qily-cert-boundary';
    note.setAttribute('data-qily-cert-rule', 'v1');
    note.innerHTML = '<strong>证书公开规则：</strong>凡以“证书、认证、资质”对外展示的材料，优先公开颁发主体、证书编号、颁发日期与官方核验入口；信息不完整时仅作学习／专项技能材料展示，不升级表述为官方背书。';
    var inner = section.querySelector('.module-inner') || section;
    inner.appendChild(note);
  }

  function applyStaticBoundaries() {
    ensureStyle();
    normalizeCapabilityCertificate();
    normalizeChatgptMemorialCertificate();
    strengthenTrustRule();
  }

  function loadLiveData() {
    if (path.indexOf('/knowledge/terminology') !== 0) return;
    if (!w.fetch) return;
    w.fetch(DATA_URL, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (response) { if (!response.ok) throw new Error('site-data ' + response.status); return response.json(); })
      .then(function (data) {
        var total = data && data.terminology && Number(data.terminology.total);
        if (Number.isInteger(total) && total > 0) normalizeTerminology(total);
      })
      .catch(function () {
        var count = d.getElementById('termCount');
        var match = count && (count.textContent || '').match(/(\d+)\s*项术语/);
        if (match) normalizeTerminology(Number(match[1]));
      });
  }

  function run() {
    applyStaticBoundaries();
    loadLiveData();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  w.addEventListener('pageshow', function () {
    applyStaticBoundaries();
    loadLiveData();
  }, { passive: true });
})(document, window);