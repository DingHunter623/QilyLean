(function (d, w) {
  'use strict';
  if (w.__qilyFooterStandardV34) return;
  w.__qilyFooterStandardV34 = true;

  var FOOTER_ID = 'qilyGlobalFooter';
  var REVIEW_DATE = '2026-08-07';
  var HOME_URL = 'https://qilylean.com/';
  var CONTACT_EMAIL = 'admin@qilylean.com';

  function pathName() {
    return (location.pathname || '/').replace(/\/{2,}/g, '/');
  }

  function cleanLabel(value) {
    var text = String(value || '')
      .replace(/\s+/g, ' ')
      .replace(/^QilyLean\s*[｜|]\s*/i, '')
      .replace(/\s*[｜|]\s*QilyLean(?:\s*[｜|].*)?$/i, '')
      .trim();
    if (!text || /^QilyLean$/i.test(text)) return '';
    if (text.length > 42) text = text.slice(0, 41).replace(/[，、：:；;\s]+$/g, '') + '…';
    return text;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function childRouteLabel(path) {
    var rules = [
      [/\/cooperation\/factory-planning(?:\/|\/index\.html|$)/i, '新工厂 / 新产线规划：布局、物流、产能与人机协同。'],
      [/\/cooperation\/lean-improvement(?:\/|\/index\.html|$)/i, '精益改善：诊断、Pilot、验证、固化与验收。'],
      [/\/cooperation\/visual-management(?:\/|\/index\.html|$)/i, '目视化项目：信息分层、现场标准与视觉交付。'],
      [/\/improvements\/vsm(?:\/|\/index\.html|$)/i, 'VSM价值流：识别等待、库存、信息流与交付周期。'],
      [/\/improvements\/standard-time(?:\/|\/index\.html|$)/i, '标准工时：测时、宽放、标准化与产能核定。'],
      [/\/improvements\/smed(?:\/|\/index\.html|$)/i, 'SMED快速换型：外部化准备、并行作业与停机压缩。'],
      [/\/improvements\/erp-mes(?:\/|\/index\.html|$)/i, 'ERP / MES：业务流程、数据口径与制造执行闭环。'],
      [/\/improvements\/ie-data(?:\/|\/index\.html|$)/i, 'IE数据：标准工时、产能、效率与制造决策。'],
      [/\/improvements\/visual(?:\/|\/index\.html|$)/i, '目视化改善：异常可见、标准清晰、状态即时识别。'],
      [/\/projects\/qilylean-commercial-deliveries(?:\/|\/index\.html|$)/i, '商业交付档案：仅披露可核验的QilyLean品牌交付记录。'],
      [/\/tools\/times26001(?:\/|\/index\.html|$)/i, 'Times26001：IE测时、倒计时与现场时间研究工具。'],
      [/\/legal\/qilylean-home\/privacy(?:\/|\/index\.html|$)/i, 'QilyLean Home 隐私说明：数据收集、使用与保护边界。'],
      [/\/legal\/qilylean-home\/terms(?:\/|\/index\.html|$)/i, 'QilyLean Home 使用条款：软件使用与责任边界。'],
      [/\/legal\/times26001\/privacy(?:\/|\/index\.html|$)/i, 'Times26001 隐私说明：数据处理与保护边界。'],
      [/\/legal\/times26001\/terms(?:\/|\/index\.html|$)/i, 'Times26001 使用条款：软件使用与责任边界。'],
      [/\/knowledge\/terminology(?:\.html|\/|$)/i, '制造工程术语：统一定义、口径与应用边界。']
    ];
    for (var i = 0; i < rules.length; i += 1) {
      if (rules[i][0].test(path)) return rules[i][1];
    }
    return '';
  }

  function isNestedContentPath(path) {
    if (/\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i.test(path)) return false;
    var normalized = path.replace(/\/index\.html$/i, '/').replace(/\/+$/g, '');
    var segments = normalized.split('/').filter(Boolean);
    if (segments.length < 2) return false;
    return /^(cooperation|improvements|projects|knowledge|tools|legal|certificates|app-support|trust|moments|experience|capabilities|links|papers|standards)$/i.test(segments[0]);
  }

  function pageContextLabel(path) {
    if (!isNestedContentPath(path)) return '';

    var explicit = d.querySelector('[data-qily-footer-topic]');
    if (explicit) {
      var explicitValue = cleanLabel(explicit.getAttribute('data-qily-footer-topic') || explicit.textContent);
      if (explicitValue) return explicitValue;
    }

    var meta = d.querySelector('meta[name="qily-footer-topic"]');
    if (meta) {
      var metaValue = cleanLabel(meta.getAttribute('content'));
      if (metaValue) return metaValue;
    }

    var selectors = [
      '.article-hub .hub-lead',
      'main .hero .lead',
      'main .hero h1',
      'main article > h1',
      'main article > h2',
      'main h1',
      'h1'
    ];
    for (var i = 0; i < selectors.length; i += 1) {
      var node = d.querySelector(selectors[i]);
      if (!node) continue;
      var value = cleanLabel(node.textContent);
      if (value) return value;
    }

    return cleanLabel(d.title);
  }

  function moduleLabel() {
    var path = pathName();
    var child = childRouteLabel(path);
    if (child) return child;

    var context = pageContextLabel(path);
    if (context) return context;

    var rules = [
      [/^\/$|^\/index\.html$/i, '让改善形成体系，让精益产生力量。'],
      [/\/ai(?:\/|\.html|$)|qilylean-ai/i, 'AI对答用于快速了解能力、项目与知识内容。'],
      [/\/capabilities(?:\/|\.html|$)|\/capability(?:\/|\.html|$)/i, '公开方法体系、代表项目与数字工具能力边界。'],
      [/\/experience(?:\/|\.html|$)|\/resume(?:\/|\.html|$)/i, '按任职阶段展示岗位职责、项目经历与成长主线。'],
      [/\/improvements(?:\/|\.html|$)/i, '制造工程、精益改善、新工厂规划、数智化推进。'],
      [/\/projects(?:\/|\.html|$)|\/delivery(?:\/|\.html|$)/i, '诊断 · 方案 · Pilot · 验证 · 固化 · 验收。'],
      [/\/qilylean\/daily|\/daily(?:\/|\.html|$)/i, '以工程简报沉淀制造改善方法、术语与实践认知。'],
      [/\/knowledge(?:\/|\.html|$)|\/papers(?:\/|\.html|$)|\/standards(?:\/|\.html|$)/i, '简报 · 工具 · 专题 · 资料。'],
      [/\/moments(?:\/|\.html|$)|\/journey(?:\/|\.html|$)/i, '丁启利｜工作与生活影像记录 · 活在途中……'],
      [/\/links(?:\/|\.html|$)/i, '连接可信产业资源、专业入口与协同服务。'],
      [/\/cooperation(?:\/|\.html|$)/i, '诊断 · 方案 · Pilot · 验证 · 固化 · 验收。'],
      [/\/trust(?:\/|\.html|$)/i, '主体 · 合同 · 数据 · 证据 · AI边界。'],
      [/\/tools(?:\/|\.html|$)/i, '将工业工程场景需求转化为可直接使用的数字工具。'],
      [/\/app-support(?:\/|\.html|$)/i, '统一提供QilyLean数字工具的安装、使用与技术支持。'],
      [/\/legal(?:\/|\.html|$)|privacy|terms/i, '公开隐私、协议、安装与使用边界。']
    ];
    for (var i = 0; i < rules.length; i += 1) {
      if (rules[i][0].test(path)) return rules[i][1];
    }
    return '制造改善诊断、方法沉淀与项目交付。';
  }

  function isGlobalFooter(node) {
    return !!(node && (node.id === FOOTER_ID || (node.closest && node.closest('#' + FOOTER_ID))));
  }

  function removeLegacyFooters() {
    var selectors = [
      'body footer:not(#' + FOOTER_ID + ')',
      'body > .footer:not(#' + FOOTER_ID + ')',
      'body > .site-footer:not(#' + FOOTER_ID + ')',
      'body > .page-footer:not(#' + FOOTER_ID + ')',
      '.module-footer:not(#' + FOOTER_ID + ')',
      '#qilyGlobalContactFooter',
      '.qily-global-contact-footer',
      '.qily-global-contact-footer-shell',
      '#qtc-global-trust-footer',
      '.qtc-global-trust-footer'
    ].join(',');

    d.querySelectorAll(selectors).forEach(function (node) {
      if (!node || isGlobalFooter(node)) return;
      node.remove();
    });
  }

  function mainlineMarkup() {
    return [
      '<div class="qily-footer-v31-mainline">',
      '  <div class="qily-footer-v31-module">' + escapeHtml(moduleLabel()) + '</div>',
      '  <div class="qily-footer-v31-contact">',
      '    <span class="qily-footer-v31-contact-title">QilyLean｜技术与项目联系 / Technical &amp; Project Contact</span>',
      '    <span class="qily-footer-v31-contact-sep">｜</span>',
      '    <span class="qily-footer-v31-field">官网网址：<br class="qily-footer-v34-mobile-break"><a href="' + HOME_URL + '">' + HOME_URL + '</a></span>',
      '    <span class="qily-footer-v31-contact-sep">｜</span>',
      '    <span class="qily-footer-v31-field">企业邮箱：<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a></span>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function footerMarkup() {
    return [
      '<div class="qily-footer-v31-inner">',
      mainlineMarkup(),
      '  <div class="qily-footer-v31-bottomline">',
      '    <div class="qily-footer-v31-trust">',
      '      <strong>可信度口径：</strong>个人专业品牌',
      '      <span>｜</span>默认责任主体丁启利',
      '      <span>｜</span>品牌商业交付公开记录0项',
      '      <span>｜</span>历史项目、个人作品与品牌订单分轨披露',
      '      <span>｜</span>核验日期 ' + REVIEW_DATE,
      '    </div>',
      '    <nav class="qily-footer-v31-actions" aria-label="QilyLean可信度与项目入口">',
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
      d.body.appendChild(footer);
    }
    footer.className = 'qily-global-footer-v31 qily-global-footer-v32 qily-global-footer-v33 qily-global-footer-v34';
    footer.setAttribute('data-qily-footer-standard', 'v34');
    footer.setAttribute('aria-label', 'QilyLean全站统一页尾');
    footer.innerHTML = footerMarkup();
    return footer;
  }

  function normalize() {
    if (!d.body) return;
    removeLegacyFooters();
    var footer = ensureFooter();
    removeLegacyFooters();
    if (footer && footer.parentNode === d.body && footer !== d.body.lastElementChild) {
      d.body.appendChild(footer);
    }
  }

  function boot() {
    normalize();
    [80, 220, 520, 1000, 1800, 3000].forEach(function (delay) { w.setTimeout(normalize, delay); });

    if (w.MutationObserver) {
      var scheduled = false;
      var legacySelector = 'footer,.module-footer,.footer,.site-footer,.page-footer,#qilyGlobalContactFooter,.qily-global-contact-footer,.qily-global-contact-footer-shell,#qtc-global-trust-footer,.qtc-global-trust-footer';
      var observer = new MutationObserver(function (records) {
        var relevant = records.some(function (record) {
          return Array.from(record.addedNodes || []).some(function (node) {
            if (!node || node.nodeType !== 1 || isGlobalFooter(node)) return false;
            return (node.matches && node.matches(legacySelector)) ||
              (node.querySelector && node.querySelector(legacySelector));
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
