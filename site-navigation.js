(function () {
  'use strict';

  if (window.__qilyLeanSiteNavigationLoaderV2) return;
  window.__qilyLeanSiteNavigationLoaderV2 = true;

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
    if (title) title.textContent = '官网公开价格参考';
    if (lead) lead.textContent = '公开价格用于帮助企业快速判断合作层级；正式报价仍以项目范围、工艺复杂度、数据基础、现场投入、交付深度和实施周期为准。';

    if (ladder.dataset.qilyPublicPricing !== '1') {
      ladder.dataset.qilyPublicPricing = '1';
      ladder.classList.add('qily-public-pricing');
      ladder.innerHTML = [
        '<article class="price-card"><small>ENTRY｜需求筛选</small><h3>60分钟项目问题初筛</h3><div class="price">免费</div><p>确认企业现状、核心问题、决策目标与合作匹配度；不包含完整方案、图纸或数据模型输出。</p></article>',
        '<article class="price-card"><small>DIAGNOSIS｜建立基线</small><h3>现场诊断与规划建议</h3><div class="price">¥6,800起 <span>＋差旅</span></div><p>现场Gemba勘查、关键访谈、数据核对、问题分级、改善优先级及管理层诊断纪要。</p></article>',
        '<article class="price-card"><small>LAYOUT｜车间规划</small><h3>车间布局优化规划</h3><div class="price">¥18,000起</div><p>围绕设备、工位、产能、人流、物流、仓储、WIP与安全通道形成布局优化方案。</p></article>',
        '<article class="price-card"><small>CONCEPT｜总体方案</small><h3>新工厂概念规划</h3><div class="price">¥68,000起</div><p>完成需求分析、功能分区、工艺流向、物流主通道、仓储办公及多方案比选。</p></article>',
        '<article class="price-card featured"><small>DEEPENING｜深化设计</small><h3>新工厂深化规划</h3><div class="price">¥128,000起</div><p>深化产能、设备、人力、面积、仓储、物流、公辅接口、详细Layout及实施路线。</p></article>',
        '<article class="price-card"><small>DELIVERY｜整体落地</small><h3>智能工厂整体规划与落地</h3><div class="price">按范围评估</div><p>根据工艺复杂度、自动化与数字化范围、驻场投入、交付物和验收标准形成正式报价。</p></article>'
      ].join('');
    }

    note.innerHTML = '<strong>价格说明：</strong>最终费用依据工厂面积、产品工艺、设备数量、数据基础、交付深度、现场投入及实施周期综合评估，不以单一建筑面积作为报价依据。上述价格为咨询与规划服务起步价；制作、施工、设备、软件、检测、报审、设计院及其他第三方费用不包含在内。';

    if (!document.getElementById('qilyPublicPricingStyle')) {
      var style = document.createElement('style');
      style.id = 'qilyPublicPricingStyle';
      style.textContent = [
        '#entry .qily-public-pricing{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}',
        '#entry .qily-public-pricing .price-card{display:flex;flex-direction:column;min-height:260px}',
        '#entry .qily-public-pricing .price-card p{margin-top:auto;padding-top:12px}',
        '#entry .fine-print{padding:16px 18px;border-left:4px solid #caa15f;background:#eef8f6;color:#315f64;font-size:15px}',
        '@media(max-width:1080px){#entry .qily-public-pricing{grid-template-columns:repeat(2,minmax(0,1fr))}}',
        '@media(max-width:680px){#entry .qily-public-pricing{grid-template-columns:1fr}#entry .qily-public-pricing .price-card{min-height:auto}}'
      ].join('');
      document.head.appendChild(style);
    }
  }

  function applyFixes() {
    ensureFriendLinksNavigation();
    repairOnboardingLink();
    publishCooperationPricing();
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