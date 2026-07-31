(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationLoaderV3) return;
  window.__qilyLeanSiteNavigationLoaderV3 = true;

  var CORE_SRC = '/site-navigation-core.js?v=20260731-global-links-v1';
  var LINKS_PATH = '/links/';
  var ONBOARDING_PATH = '/links/onboarding/';

  function normalizedPath(path) {
    var value = (path || '/').replace(/\/index\.html$/, '/');
    return value.length > 1 ? value.replace(/\/+$/, '/') : '/';
  }

  function repairOnboardingLink() {
    document.querySelectorAll('#industryResourceService .resource-action, a[href="/cooperation/"][class~="resource-action"]').forEach(function (link) {
      link.href = ONBOARDING_PATH;
      link.textContent = '提交入驻与合作资料';
      link.setAttribute('aria-label', '进入行业资源入驻申请专属页面');
      link.setAttribute('title', '行业资源入驻申请');
    });
  }

  function ensureFriendLinksNavigation() {
    var nav = document.querySelector('.qily-global-nav, nav.site-nav, nav.nav');
    if (!nav) return;

    var link = nav.querySelector('a[href="/links/"], a[href="/links/index.html"]');
    if (!link) {
      link = document.createElement('a');
      link.href = LINKS_PATH;
      link.textContent = '友情链接';
      link.setAttribute('aria-label', '全球科技企业友情链接与行业资源');
    }

    var cooperation = nav.querySelector('a[href="/cooperation/"], a[href="/cooperation/index.html"]');
    if (cooperation && link.nextElementSibling !== cooperation) nav.insertBefore(link, cooperation);
    else if (!link.parentNode) nav.appendChild(link);

    var path = normalizedPath(location.pathname);
    if (path.indexOf(LINKS_PATH) === 0) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  function pricingCard(item) {
    return [
      '<article class="price-card', item.featured ? ' featured' : '', '">',
      '<small>', item.code, '</small>',
      '<h3>', item.title, '</h3>',
      '<div class="price">', item.price, item.unit ? ' <span>' + item.unit + '</span>' : '', '</div>',
      '<p>', item.description, '</p>',
      item.basis ? '<div class="qily-price-basis">' + item.basis + '</div>' : '',
      '</article>'
    ].join('');
  }

  var factoryPricing = [
    { code: 'DIAGNOSIS｜建立基线', title: '现场诊断与规划建议', price: '¥6,800起', unit: '＋差旅', description: '现场Gemba勘查、关键访谈、资料核对、约束识别和管理层诊断纪要。' },
    { code: 'LAYOUT｜车间规划', title: '车间布局优化规划', price: '¥38,000起', description: '围绕设备、工位、产能、人流、物流、仓储、WIP及安全通道形成可落地布局方案。', basis: '常规参考：约18～30元/㎡；最低启动价与面积核价取高值。' },
    { code: 'CONCEPT｜总体方案', title: '新工厂概念规划', price: '¥128,000起', description: '完成需求分析、功能分区、工艺流向、物流主通道、仓储办公、面积测算及方案比选。', basis: '2026面积参考：约1.2～1.8万元/亩。' },
    { code: 'DEEPENING｜深化规划', title: '新工厂深化规划', price: '¥268,000起', description: '深化产能、设备、人力、面积、仓储、物流、公辅接口、详细Layout和实施路线。', basis: '2026面积参考：约2.0～3.0万元/亩。', featured: true },
    { code: 'DELIVERY｜整体落地', title: '智能工厂整体规划与落地', price: '¥480,000起', description: '覆盖规划深化、多专业协同、供应商接口、搬迁建设、投产爬坡、现场验证和阶段验收。', basis: '2026面积参考：约3.0～5.0万元/亩；复杂项目按范围评估。' }
  ];

  var leanPricing = [
    { code: 'DIAGNOSIS｜建立基线', title: '精益现场诊断与路线图', price: '¥6,800起', unit: '＋差旅', description: '核对PQCD、交付瓶颈、基线数据和改善优先级，形成管理层诊断纪要。' },
    { code: 'SPECIAL｜专项改善', title: '精益专项改善项目', price: '¥68,000起', description: '适用于VSM、SMED、OEE、线平衡、标准工时、防错或单一瓶颈专项，按成果验收。' },
    { code: 'SYSTEM｜体系改善', title: '精益生产系统改善', price: '¥168,000起', description: '覆盖基线、未来态、Pilot试点、数据验证、标准固化、培训稽核与横向复制。', featured: true },
    { code: 'MONTHLY｜持续辅导', title: '月度驻场／运营顾问', price: '¥38,000起', unit: '／月', description: '依据驻场天数、项目数量、跨部门协同、数据治理和管理节奏确定月度服务范围。' },
    { code: 'ANNUAL｜年度运营', title: '年度精益运营项目', price: '¥368,000起', unit: '／年', description: '面向多模块持续改善，建立年度路线图、项目池、人才培养、稽核机制和经营成果复盘。' }
  ];

  var visualPricing = [
    { code: 'DIAGNOSIS｜现场勘查', title: '目视化诊断与规划建议', price: '¥6,800起', unit: '＋差旅', description: '完成区域勘查、问题分级、标准缺口、实施优先级和初步预算建议。' },
    { code: 'WORKSHOP｜单车间设计', title: '单车间目视化系统设计', price: '¥68,000起', description: '覆盖区域、设备、工位、质量、安全、物流、仓储和DMS的标准化设计与图纸清单。' },
    { code: 'FACTORY｜全厂设计', title: '全厂目视化标准设计', price: '¥128,000起', description: '统一VI、颜色语义、版式、尺寸、材料、安装定位、清单预算和分区实施标准。', featured: true },
    { code: 'DELIVERY｜设计交付', title: '全厂目视化项目设计与交付', price: '¥250,000起', description: '包含诊断、设计、打样、供应商协同、施工校核、整改验收及维护标准；制作材料按清单核价。' },
    { code: 'MAINTENANCE｜持续维护', title: '年度目视化维护与迭代', price: '¥68,000起', unit: '／年', description: '依据现场变化、更新频次、区域数量和稽核辅导范围形成年度维护计划。' }
  ];

  function pricingGrid(items) {
    return '<div class="qily-pricing-grid">' + items.map(pricingCard).join('') + '</div>';
  }

  function ensurePricingStyles() {
    if (document.getElementById('qilyPublicPricingStyleV3')) return;
    var style = document.createElement('style');
    style.id = 'qilyPublicPricingStyleV3';
    style.textContent = [
      '#entry .qily-pricing-overview{display:block!important}',
      '.qily-pricing-group{margin-top:22px;padding:22px;border:1px solid #d5e4e3;background:#f7fbfa}',
      '.qily-pricing-group:first-child{margin-top:0}',
      '.qily-pricing-group-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:16px}',
      '.qily-pricing-group-head h3{margin:0;color:#0f4b5a;font-size:clamp(24px,2.4vw,34px)}',
      '.qily-pricing-group-head p{max-width:760px;margin:0;color:#5f7474;font-size:15px;text-align:right}',
      '.qily-pricing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}',
      '.qily-pricing-grid .price-card{display:flex;flex-direction:column;min-height:286px}',
      '.qily-pricing-grid .price-card p{margin-bottom:0}',
      '.qily-price-basis{margin-top:auto;padding-top:13px;color:#8d6a32;font-size:13.5px;font-weight:850;line-height:1.65}',
      '#entry .fine-print,.qily-pricing-note{margin-top:18px;padding:16px 18px;border-left:4px solid #caa15f;background:#eef8f6;color:#315f64;font-size:15px;line-height:1.75}',
      '.core-business-pricing{margin:26px 0;padding:clamp(20px,3vw,30px);border:1px solid #c8dad8;border-top:4px solid #caa15f;background:#f7fbfa}',
      '.core-business-pricing h2{margin:0;color:#0f4b5a;font-size:clamp(27px,3vw,40px)}',
      '.core-business-pricing>.qily-pricing-lead{margin:8px 0 18px;color:#5f7474}',
      '.core-business-pricing .qily-pricing-grid{grid-template-columns:repeat(3,minmax(0,1fr))}',
      '@media(max-width:1080px){.qily-pricing-grid,.core-business-pricing .qily-pricing-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:720px){.qily-pricing-group{padding:16px}.qily-pricing-group-head{align-items:flex-start;flex-direction:column}.qily-pricing-group-head p{text-align:left}.qily-pricing-grid,.core-business-pricing .qily-pricing-grid{grid-template-columns:1fr}.qily-pricing-grid .price-card{min-height:auto}}'
    ].join('');
    document.head.appendChild(style);
  }

  function publishCooperationPricing() {
    if (normalizedPath(location.pathname) !== '/cooperation/') return;
    var entry = document.getElementById('entry');
    if (!entry) return;

    var heading = entry.querySelector('.module-heading');
    var ladder = entry.querySelector('.price-ladder');
    var note = entry.querySelector('.fine-print');
    if (!heading || !ladder || !note) return;

    var title = heading.querySelector('h2');
    var lead = heading.querySelector('p');
    if (title) title.textContent = '三大核心业务公开价格参考';
    if (lead) lead.textContent = '保留低门槛现场诊断，正式项目按成果范围、工艺复杂度、现场投入、实施周期和验收责任核价，避免把专业规划降格为低价绘图。';

    if (ladder.dataset.qilyPublicPricingV3 !== '1') {
      ladder.dataset.qilyPublicPricingV3 = '1';
      ladder.className = 'price-ladder qily-pricing-overview';
      ladder.innerHTML = [
        '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>新工厂／车间布局规划</h3><p>以2023年实战成交基准为基础，2026年按规划深度与责任边界分层核价。</p></div>', pricingGrid(factoryPricing), '</section>',
        '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>精益生产项目交付</h3><p>不按培训天数售卖，以基线、Pilot、实绩验证、标准固化和复制成果定义项目。</p></div>', pricingGrid(leanPricing), '</section>',
        '<section class="qily-pricing-group"><div class="qily-pricing-group-head"><h3>目视化项目设计与交付</h3><p>区分咨询设计费与制作施工费，按区域、图纸、材料清单、施工协同和验收责任核价。</p></div>', pricingGrid(visualPricing), '</section>'
      ].join('');
    }

    note.innerHTML = '<strong>统一价格说明：</strong>现场诊断与规划建议保持¥6,800起＋差旅。新工厂项目以最低启动价和面积核价取高值；概念规划参考1.2～1.8万元/亩，深化规划参考2.0～3.0万元/亩，整体规划与落地参考3.0～5.0万元/亩。最终费用依据产品工艺、设备数量、自动化与数字化范围、数据基础、现场投入、交付深度、修改次数及实施周期综合评估。制作、施工、设备、软件、检测、报审、设计院和第三方费用按合同边界另计。';
    ensurePricingStyles();
  }

  function publishDetailPricing() {
    var path = normalizedPath(location.pathname);
    var config = null;
    if (path === '/cooperation/factory-planning/') {
      config = { title: '新工厂／车间布局公开价格参考', lead: '以最低启动价和面积核价取高值，规划深度越高，承担的实施与验收责任越大。', items: factoryPricing, note: '面积口径：1亩≈666.7㎡。概念规划约1.2～1.8万元/亩，深化规划约2.0～3.0万元/亩，整体规划与落地约3.0～5.0万元/亩。' };
    } else if (path === '/cooperation/lean-improvement/') {
      config = { title: '精益生产项目公开价格参考', lead: '以项目基线、改善范围、Pilot数量、驻场投入、数据验证和标准固化责任综合核价。', items: leanPricing, note: '专项价格不等同于培训费。客户增加产品族、产线、区域、驻场天数或验收指标时，应按需求变更追加费用。' };
    } else if (path === '/cooperation/visual-management/') {
      config = { title: '目视化项目公开价格参考', lead: '咨询设计费与制作施工费分开核算；全厂项目依据区域数量、图纸清单、材料工艺和施工协同责任报价。', items: visualPricing, note: '公开价为设计与项目管理起步口径。标识制作、材料、运输、安装、高空作业、地坪施工及第三方费用依据工程量清单另计。' };
    }
    if (!config || document.getElementById('qilyCoreBusinessPricing')) return;

    var viewer = document.getElementById('coreContractViewer');
    if (!viewer || !viewer.parentNode) return;
    var section = document.createElement('section');
    section.id = 'qilyCoreBusinessPricing';
    section.className = 'core-business-pricing';
    section.innerHTML = '<h2>' + config.title + '</h2><p class="qily-pricing-lead">' + config.lead + '</p>' + pricingGrid(config.items) + '<div class="qily-pricing-note"><strong>核价说明：</strong>' + config.note + '</div>';
    viewer.parentNode.insertBefore(section, viewer);
    ensurePricingStyles();
  }

  function applyFixes() {
    ensureFriendLinksNavigation();
    repairOnboardingLink();
    publishCooperationPricing();
    publishDetailPricing();
  }

  function observeShell() {
    var timer = 0;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(applyFixes, 20);
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(applyFixes, 120);
    setTimeout(applyFixes, 500);
  }

  repairOnboardingLink();
  publishCooperationPricing();
  publishDetailPricing();

  var existing = document.getElementById('qilySiteNavigationCoreScript');
  if (existing) {
    existing.addEventListener('load', function () { applyFixes(); observeShell(); }, { once: true });
    return;
  }

  var core = document.createElement('script');
  core.id = 'qilySiteNavigationCoreScript';
  core.src = CORE_SRC;
  core.async = false;
  core.addEventListener('load', function () {
    applyFixes();
    observeShell();
  }, { once: true });
  core.addEventListener('error', function () {
    applyFixes();
    observeShell();
    if (typeof window.__qilyLeanRevealCurrentShell === 'function') window.__qilyLeanRevealCurrentShell();
  }, { once: true });
  document.head.appendChild(core);
})();