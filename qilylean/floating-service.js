(function () {
  'use strict';

  var ASSET_BASE = window.__qilyLeanFloatingAssetBase || '';

  function load(src, id) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = ASSET_BASE && src.charAt(0) !== '/' && !/^[a-z][a-z0-9+.-]*:/i.test(src)
      ? ASSET_BASE + src
      : src;
    document.body.appendChild(script);
  }

  function isHomePage() {
    return /(?:home|home-live)\.html$|digital_human\/?$/i.test(location.pathname);
  }

  function normalizeLegacyBrand() {
    if (!/\/qilylean\/gbt2828\.html$/i.test(location.pathname)) return;
    var brand = document.querySelector('header.top .brand, header.topbar .brand, header.qily-site-header .qily-brand');
    if (!brand) return;
    brand.textContent = 'QilyLean | 启力精益';
    if (brand.tagName === 'A') brand.setAttribute('href', '/');
  }

  function mergeStandardTime() {
    var section = document.getElementById('standard-time');
    if (!section) return;
    var paragraphs = [].slice.call(section.querySelectorAll('p'));
    for (var i = 0; i < paragraphs.length - 1; i += 1) {
      var first = paragraphs[i].textContent.trim();
      var second = paragraphs[i + 1].textContent.trim();
      if (
        first.indexOf('第一，用于产能测算') > -1 &&
        first.indexOf('第三，用于线平衡改善') > -1 &&
        second.indexOf('第四，用于ERP/MES基础数据') > -1 &&
        second.indexOf('第五，用于经营改善分析') > -1
      ) {
        paragraphs[i].textContent = (first + ' ' + second).replace(/\s+/g, ' ');
        paragraphs[i + 1].remove();
        break;
      }
    }
  }

  function mergeVisualPrinciples() {
    var section = document.getElementById('visual');
    if (!section || section.dataset.visualPrinciplesMerged === '1') return;
    var paragraphs = [].slice.call(section.querySelectorAll('p'));
    for (var i = 0; i < paragraphs.length - 1; i += 1) {
      var first = (paragraphs[i].textContent || '').trim();
      var second = (paragraphs[i + 1].textContent || '').trim();
      if (
        first.indexOf('第一，少而准') === 0 &&
        first.indexOf('第二，统一') > -1 &&
        second.indexOf('第三，可维护') === 0 &&
        second.indexOf('第四，能闭环') > -1
      ) {
        paragraphs[i].textContent = (first + ' ' + second).replace(/\s+/g, ' ').trim();
        paragraphs[i + 1].remove();
        section.dataset.visualPrinciplesMerged = '1';
        break;
      }
    }
  }

  function ensurePlatformPositioning() {
    if (!isHomePage() || document.getElementById('platformPositioning')) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var heading = hero.querySelector('h1');
    if (!heading) return;
    var paragraph = document.createElement('p');
    paragraph.id = 'platformPositioning';
    paragraph.className = 'platform-positioning';
    paragraph.textContent = '制造改善实践交流平台｜项目案例｜知识分享｜方法工具';
    heading.insertAdjacentElement('afterend', paragraph);
    var style = document.createElement('style');
    style.id = 'platformPositioningStyle';
    style.textContent = '.platform-positioning{display:inline-flex;max-width:100%;margin:2px 0 12px;padding:7px 13px;border:1px solid rgba(255,227,155,.58);color:#fff3df;background:rgba(255,255,255,.08);font-size:16px!important;line-height:1.55!important;font-weight:850;letter-spacing:.02em}@media(max-width:760px){.platform-positioning{display:block;font-size:15px!important;padding:7px 10px}}';
    document.head.appendChild(style);
  }

  function addProjectMediaStyle() {
    if (document.getElementById('projectMediaStyle')) return;
    var style = document.createElement('style');
    style.id = 'projectMediaStyle';
    style.textContent = '.project-media{margin:-22px -22px 18px;overflow:hidden;border-bottom:1px solid var(--line);background:#eef3f5}.project-media img{display:block;width:100%;height:auto;max-height:none;object-fit:contain;background:#eef3f5}.project-media figcaption{padding:10px 14px;color:var(--muted);background:#f8fbfa;font-size:14px;line-height:1.55;font-weight:750}.fuse-photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;align-items:start;background:var(--line)}.fuse-photo-grid>div{position:relative;overflow:hidden;background:#eef3f5}.fuse-photo-grid img{width:100%;height:auto;object-fit:contain;background:#eef3f5}.fuse-photo-grid span{position:absolute;left:10px;bottom:10px;padding:4px 9px;color:#fff;background:rgba(15,75,90,.88);font-size:13px;font-weight:900}@media(max-width:760px){.fuse-photo-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function addMoldWarehouseProjectImage() {
    if (!isHomePage() || document.getElementById('moldWarehouseProjectImage')) return;
    var cards = [].slice.call(document.querySelectorAll('#projects .project'));
    var card = cards.find(function (item) {
      var heading = item.querySelector('h3');
      return heading && heading.textContent.indexOf('智能模具库与可追溯管理') > -1;
    });
    if (!card) return;
    addProjectMediaStyle();
    var figure = document.createElement('figure');
    figure.id = 'moldWarehouseProjectImage';
    figure.className = 'project-media';
    figure.innerHTML = '<img src="/media/projects/mold-before.webp?v=20260721-speed-v1" alt="1200+副模具标准化与二维码追溯智能模具立体库" width="1400" height="1008" loading="eager" decoding="async"><figcaption>1200+副模具标准化与二维码追溯｜智能模具立体库现场</figcaption>';
    card.insertBefore(figure, card.firstChild);
  }

  function addFuseCuttingProjectImages() {
    if (!isHomePage() || document.getElementById('fuseCuttingProjectImages')) return;
    var cards = [].slice.call(document.querySelectorAll('#projects .project'));
    var card = cards.find(function (item) {
      var heading = item.querySelector('h3');
      return heading && (
        heading.textContent.indexOf('切口工艺改良') > -1 ||
        heading.textContent.indexOf('玻璃管保险丝切口断裂率改善') > -1
      );
    });
    if (!card) return;
    addProjectMediaStyle();
    var heading = card.querySelector('h3');
    if (heading) heading.textContent = '玻璃管保险丝切口断裂率改善';
    var gallery = document.createElement('figure');
    gallery.id = 'fuseCuttingProjectImages';
    gallery.className = 'project-media fuse-project-media';
    gallery.innerHTML = '<div class="fuse-photo-grid"><div><img src="/media/projects/fuse-after.webp?v=20260721-speed-v1" alt="玻璃管保险丝改善后成品" width="816" height="1200" loading="eager" decoding="async"><span>改善后成品</span></div><div><img src="/media/projects/fuse-before.webp?v=20260721-speed-v2" alt="玻璃管保险丝改善后半成品" width="900" height="494" loading="eager" decoding="async"><span>改善后半成品</span></div></div><figcaption>玻璃管保险丝切口断裂率改善｜改善后成品与半成品实物</figcaption>';
    card.insertBefore(gallery, card.firstChild);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var field = document.createElement('textarea');
    field.value = text;
    field.style.position = 'fixed';
    field.style.left = '-9999px';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
    return Promise.resolve();
  }

  function shortShareUrl(hashOverride) {
    var map = {
      'home.html': '',
      'home-live.html': '',
      'daily-insights.html': 'daily-insights.html',
      'papers.html': 'papers.html',
      'lean-tools.html': 'tools.html',
      'lean-knowledge.html': 'knowledge.html',
      'execution-loop.html': 'execution.html',
      'gbt2828.html': 'gbt2828.html'
    };
    var name = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
    var shortPath = Object.prototype.hasOwnProperty.call(map, name) ? map[name] : name;
    var hash = typeof hashOverride === 'string' ? hashOverride : (location.hash || '');
    return 'https://qilylean.com' + shortPath + (location.search || '') + hash;
  }

  function forceArticleShortShare() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('.share');
      if (!button) return;
      var article = button.closest('.post');
      if (!article || !article.id) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var title = button.dataset.title || document.title || 'QilyLean';
      var url = shortShareUrl('#' + article.id);
      var status = article.querySelector('.status');
      var done = function () {
        if (status) status.textContent = '短链接已复制';
        setTimeout(function () { if (status) status.textContent = ''; }, 2200);
      };
      if (navigator.share) {
        navigator.share({ title: title, text: title, url: url }).catch(function () {
          copyText(title + '\n' + url).then(done);
        });
      } else {
        copyText(title + '\n' + url).then(done);
      }
    }, true);
  }

  function boot() {
    load('site-meta.js?v=1', 'qilySiteMetaScript');
    load('terminology-v2.js?v=5', 'terminologyV2Script');
    load('wechat-qr-official.js?v=4', 'wechatQrOfficialScript');
    load('execution-loop-entry.js?v=1', 'executionLoopEntryScript');
    load('lean-tools-entry.js?v=1', 'leanToolsEntryScript');
    load('daily-2026-07-15.js?v=1', 'daily20260715Script');
    load('daily-2026-07-16.js?v=1', 'daily20260716Script');
    load('daily-2026-07-17.js?v=1', 'daily20260717Script');
    load('project-mold-video.js?v=20260721-speed-v1', 'projectMoldVideoScript');
    mergeStandardTime();
    mergeVisualPrinciples();
    ensurePlatformPositioning();
    addMoldWarehouseProjectImage();
    addFuseCuttingProjectImages();
    forceArticleShortShare();
    normalizeLegacyBrand();
    var navigationScript = document.querySelector('script[src*="/site-navigation.js"]');
    if (!window.__qilyLeanSiteNavigationPublicV8 && !navigationScript) {
      load('/site-navigation.js?v=20260812-native-navigation-stable-v20', 'qilySiteNavigationScript');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
