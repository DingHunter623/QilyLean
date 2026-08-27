(function () {
  'use strict';

  /*
   * Keep this compatibility entry for page-specific enhancements, but delegate
   * playback to the demand-loaded V5 controller. The retired V4 core eagerly
   * fetched audio/documents and wrote storage every 500ms on every brief page.
   */
  var PLAYER_SRC = '/homepage-music-v5.js?v=20260810-demand-music-v6';
  if (!document.querySelector('script[data-qily-demand-music="v5"]')) {
    var player = document.createElement('script');
    player.src = PLAYER_SRC;
    player.async = false;
    player.setAttribute('data-qily-demand-music', 'v5');
    (document.head || document.documentElement).appendChild(player);
  }

  function normalizedPath(path) {
    var value = (path || '/').replace(/\/index\.html$/, '/');
    return value.length > 1 ? value.replace(/\/+$/, '/') : '/';
  }

  function ensureStyles() {
    if (document.getElementById('qilyClientConfidentialityStyle')) return;
    var style = document.createElement('style');
    style.id = 'qilyClientConfidentialityStyle';
    style.textContent = [
      '.qily-client-confidentiality-note{margin:18px 0 0;padding:18px;border:1px solid #c8dad8;border-left:4px solid #caa15f;background:#f7fbfa;color:#496565;font-size:16.5px;line-height:1.8}',
      '.qily-client-confidentiality-note strong{color:#0f4b5a}',
      '@media(max-width:620px){.qily-client-confidentiality-note{padding:16px;font-size:15.5px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function insertNotice(target, id, html) {
    if (!target || document.getElementById(id)) return;
    ensureStyles();
    var note = document.createElement('div');
    note.id = id;
    note.className = 'qily-client-confidentiality-note';
    note.setAttribute('role', 'note');
    note.innerHTML = html;
    target.insertAdjacentElement('afterend', note);
  }

  function enableProjectPresentation() {
    if (!/^\/projects(?:\/|$)/.test(location.pathname || '')) return;
    var version = '20260728-project-media-cards-v6';
    var stylesheet = document.querySelector('link[href*="/projects/project-pages.css"]');
    if (stylesheet) stylesheet.href = '/projects/project-pages.css?v=' + version;
    else {
      stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/projects/project-pages.css?v=' + version;
      document.head.appendChild(stylesheet);
    }
    if (!document.querySelector('script[src*="/projects/project-image-viewer.js"]')) {
      var viewer = document.createElement('script');
      viewer.id = 'qilyProjectImageViewerScript';
      viewer.src = '/projects/project-image-viewer.js?v=' + version;
      document.body.appendChild(viewer);
    }
  }

  function applyClientConfidentialityPolicy() {
    var path = normalizedPath(location.pathname);
    var common = '<strong>客户及企业主保密说明：</strong>制造业咨询与改善项目通常涉及客户工艺、产能、成本、设备、布局、经营数据及管理人员信息。基于客户保密要求和职业操守，本站不公开客户企业名称、Logo、企业主及相关人员身份，也不展示可反向识别企业的信息。公开案例统一以行业、规模、项目场景、改善方法、量化结果和脱敏证据呈现。';
    var verification = '<br><strong>正式洽谈核验：</strong>进入正式洽谈并确认合作意向后，可在签署NDA或双方约定的保密条件下，通过现场投屏方式展示与客户需求相匹配的案例资料、改善前后基线、实施过程、结案绩效及验收记录。投屏资料仅用于能力核验，不提供未授权复制、拍摄或外传。';

    if (path === '/projects/lean-improvement-evidence/') {
      insertNotice(document.querySelector('.evidence-note'), 'qilyEvidenceClientConfidentiality', common + verification);
      return;
    }
    if (path === '/capabilities/') {
      insertNotice(document.querySelector('#project-evidence .evidence-note'), 'qilyCapabilityClientConfidentiality', common + verification);
      return;
    }
    if (path === '/cooperation/') {
      insertNotice(document.querySelector('#evidence .module-heading'), 'qilyCooperationClientConfidentiality', common + verification + '<br><strong>合作基线：</strong>正式合作仍须依据企业现状重新建立事实基线，不照搬既有案例结论或收益数据。');
    }
  }

  function loadProjectDeliveryTerminologySync() {
    if (!/\/knowledge\/terminology(?:\.html)?\/?$/i.test(location.pathname || '')) return;
    if (document.querySelector('script[data-qily-terminology-project-delivery]')) return;

    var script = document.createElement('script');
    script.src = '/knowledge/terminology-project-delivery-v1.js?v=20260801-raci-project-delivery-v1';
    script.async = false;
    script.setAttribute('data-qily-terminology-project-delivery', 'v1');
    (document.body || document.head || document.documentElement).appendChild(script);
  }

  function loadKnowledgeAssetV2() {
    var p = location.pathname || '/';
    var applicable = /^\/qilylean\/daily\/\d{4}-\d{2}-\d{2}\.html$/i.test(p) || /\/knowledge\/terminology(?:\.html)?\/?$/i.test(p);
    if (!applicable || document.querySelector('script[data-qily-knowledge-asset-v2]')) return;
    var script = document.createElement('script');
    script.src = '/knowledge/knowledge-asset-v2.js?v=20260828-knowledge-asset-v2';
    script.async = false;
    script.setAttribute('data-qily-knowledge-asset-v2', 'v2');
    (document.body || document.head || document.documentElement).appendChild(script);
  }

  function initializePageEnhancements() {
    enableProjectPresentation();
    applyClientConfidentialityPolicy();
    loadProjectDeliveryTerminologySync();
    loadKnowledgeAssetV2();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageEnhancements, { once: true });
  } else {
    initializePageEnhancements();
  }
})();
