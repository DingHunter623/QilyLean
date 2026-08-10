(function (d, w) {
  'use strict';
  if (w.__qilyFooterStandardV28) return;
  w.__qilyFooterStandardV28 = true;

  var FOOTER_ID = 'qilyGlobalFooter';
  var REVIEW_DATE = '2026-08-07';
  var HOME_URL = 'https://qilylean.com/';
  var CONTACT_EMAIL = 'admin@qilylean.com';

  function pathName() {
    return (location.pathname || '/').replace(/\/{2,}/g, '/');
  }

  function moduleLabel() {
    var path = pathName();
    var rules = [
      [/^\/$|^\/index\.html$/i, '让改善形成体系，让精益产生力量。'],
      [/\/ai(?:\/|\.html|$)|qilylean-ai/i, 'AI对答用于快速了解能力、项目与知识内容。'],
      [/\/capabilities(?:\/|\.html|$)|\/capability(?:\/|\.html|$)/i, '公开方法体系、代表项目与数字工具能力边界。'],
      [/\/experience(?:\/|\.html|$)|\/resume(?:\/|\.html|$)/i, '按任职阶段展示岗位职责、项目经历与成长主线。'],
      [/\/projects(?:\/|\.html|$)|\/delivery(?:\/|\.html|$)/i, '以项目证据呈现制造改善方法路径与交付结果。'],
      [/\/qilylean\/daily|\/daily(?:\/|\.html|$)/i, '以工程简报沉淀制造改善方法、术语与实践认知。'],
      [/\/knowledge(?:\/|\.html|$)|\/papers(?:\/|\.html|$)|\/standards(?:\/|\.html|$)/i, '持续沉淀制造工程、精益改善与数智化知识资产。'],
      [/\/moments(?:\/|\.html|$)|\/journey(?:\/|\.html|$)/i, '记录工作现场、团队同行与阶段性实践足迹。'],
      [/\/links(?:\/|\.html|$)/i, '连接可信产业资源、专业入口与协同服务。'],
      [/\/cooperation(?:\/|\.html|$)/i, '围绕诊断、方案、Pilot、验证、固化与验收推进合作。'],
      [/\/trust(?:\/|\.html|$)/i, '主体、合同、数据、证据与AI边界公开核验。'],
      [/\/tools(?:\/|\.html|$)/i, '将工业工程场景需求转化为可直接使用的数字工具。'],
      [/\/app-support(?:\/|\.html|$)/i, '统一提供QilyLean数字工具的安装、使用与技术支持。'],
      [/\/legal(?:\/|\.html|$)|privacy|terms/i, '公开隐私、协议、安装与使用边界。']
    ];
    for (var i = 0; i < rules.length; i += 1) {
      if (rules[i][0].test(path)) return rules[i][1];
    }
    return '制造改善诊断、方法沉淀与项目交付。';
  }

  function markLegacy() {
    var selectors = [
      'footer',
      '.module-footer',
      '#qilyGlobalContactFooter',
      '.qily-global-contact-footer',
      '#qtc-global-trust-footer',
      '.qtc-global-trust-footer'
    ].join(',');
    d.querySelectorAll(selectors).forEach(function (node) {
      if (!node || node.id === FOOTER_ID) return;
      node.classList.add('qily-footer-v28-legacy-hidden');
      node.setAttribute('aria-hidden', 'true');
    });
  }

  function footerMarkup() {
    return [
      '<div class="qily-footer-v28-inner">',
      '  <div class="qily-footer-v28-mainline">',
      '    <span class="qily-footer-v28-module-label">' + moduleLabel() + '</span>',
      '    <span class="qily-footer-v28-sep">｜</span>',
      '    <span class="qily-footer-v28-contact-title">QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span>',
      '    <span class="qily-footer-v28-sep">｜</span>',
      '    <span class="qily-footer-v28-field">官网网址：<a href="' + HOME_URL + '">' + HOME_URL + '</a></span>',
      '    <span class="qily-footer-v28-sep">｜</span>',
      '    <span class="qily-footer-v28-field">企业邮箱：<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a></span>',
      '  </div>',
      '  <div class="qily-footer-v28-bottomline">',
      '    <div class="qily-footer-v28-trust">',
      '      <strong>可信度口径：</strong>个人专业品牌',
      '      <span class="qily-footer-v28-trust-sep">｜</span>默认责任主体丁启利',
      '      <span class="qily-footer-v28-trust-sep">｜</span>品牌商业交付公开记录0项',
      '      <span class="qily-footer-v28-trust-sep">｜</span>历史项目、个人作品与品牌订单分轨披露',
      '      <span class="qily-footer-v28-trust-sep">｜</span>核验日期 ' + REVIEW_DATE,
      '    </div>',
      '    <nav class="qily-footer-v28-actions" aria-label="QilyLean可信度与项目入口">',
      '      <a href="/trust/">信任中心</a>',
      '      <a href="/projects/qilylean-commercial-deliveries/">商业记录</a>',
      '      <a href="/cooperation/">项目合作</a>',
      '    </nav>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function ensureFooter() {
    if (!d.body) return null;
    var footer = d.getElementById(FOOTER_ID);
    if (!footer) {
      footer = d.createElement('footer');
      footer.id = FOOTER_ID;
      footer.className = 'qily-global-footer-v28';
      footer.setAttribute('data-qily-footer-standard', 'v28');
      footer.setAttribute('aria-label', 'QilyLean全站统一页尾');
      d.body.appendChild(footer);
    }
    footer.className = 'qily-global-footer-v28';
    footer.setAttribute('data-qily-footer-standard', 'v28');
    footer.innerHTML = footerMarkup();
    return footer;
  }

  function normalize() {
    if (!d.body) return;
    markLegacy();
    var footer = ensureFooter();
    markLegacy();
    if (footer && footer.parentNode === d.body && footer !== d.body.lastElementChild) {
      d.body.appendChild(footer);
    }
  }

  function boot() {
    normalize();
    [120, 420, 950, 1800].forEach(function (delay) {
      w.setTimeout(normalize, delay);
    });
    if (w.MutationObserver) {
      var scheduled = false;
      var observer = new MutationObserver(function (records) {
        var relevant = records.some(function (record) {
          return Array.from(record.addedNodes || []).some(function (node) {
            if (!node || node.nodeType !== 1) return false;
            if (node.id === FOOTER_ID) return false;
            return node.matches && node.matches('footer,.module-footer,#qilyGlobalContactFooter,.qily-global-contact-footer,#qtc-global-trust-footer,.qtc-global-trust-footer');
          });
        });
        if (!relevant || scheduled) return;
        scheduled = true;
        w.requestAnimationFrame(function () {
          scheduled = false;
          normalize();
        });
      });
      observer.observe(d.body, { childList: true, subtree: true });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
