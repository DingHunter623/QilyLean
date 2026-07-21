(function () {
  'use strict';

  var STYLE_ID = 'projectMediaStableStyle';
  var queued = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.project-media-stable{margin:-22px -22px 18px;border-bottom:1px solid var(--line);background:#eef3f5;overflow:hidden}' +
      '.project-media-stable img{display:block;width:100%;height:auto;object-fit:contain;background:#eef3f5}' +
      '.project-media-stable figcaption{padding:10px 14px;color:var(--muted);background:#f8fbfa;font-size:14px;line-height:1.55;font-weight:750}' +
      '.project-media-grid-2,.project-media-grid-3{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line)}' +
      '.project-media-grid-3 .main{grid-column:1/-1}' +
      '.project-media-grid-2>div,.project-media-grid-3>div{position:relative;background:#eef3f5}' +
      '.project-media-stable span{position:absolute;left:10px;bottom:10px;padding:4px 9px;color:#fff;background:rgba(15,75,90,.88);font-size:13px;font-weight:900}' +
      '@media(max-width:760px){.project-media-grid-2,.project-media-grid-3{grid-template-columns:1fr}.project-media-grid-3 .main{grid-column:auto}}';
    document.head.appendChild(style);
  }

  function findCard(words) {
    return Array.prototype.slice.call(document.querySelectorAll('#projects .project')).find(function (card) {
      var heading = card.querySelector('h3');
      if (!heading) return false;
      return words.some(function (word) { return heading.textContent.indexOf(word) > -1; });
    });
  }

  function mountFigure(card, id, html) {
    if (!card || card.querySelector('#' + id)) return;
    var figure = document.createElement('figure');
    figure.id = id;
    figure.className = 'project-media-stable';
    figure.innerHTML = html;
    card.insertBefore(figure, card.firstChild);
  }

  function apply() {
    var projects = document.getElementById('projects');
    if (!projects) return;
    ensureStyle();

    mountFigure(
      findCard(['精益体系、VSM、单件流与SMED标准化', '第一阶段精益体系', 'VSM、单件流与SMED']),
      'automotiveLeanProjectImageStable',
      '<img src="/VSM%26SMED.png?v=20260719-r1" alt="汽车电子企业第一阶段精益体系建设" loading="lazy">' +
      '<figcaption>汽车电子｜第一阶段精益体系建设｜精益体系、VSM、单件流与SMED标准化</figcaption>'
    );

    mountFigure(
      findCard(['300T冲压机3.5T大型模具换模改善', '300T冲压机SMED快速换模改善', '3.5T大型模具SMED快速换模']),
      'smed300TProjectImageStable',
      '<img src="/300T.png?v=20260720-r3" alt="300T冲压机3.5T大型模具SMED快速换模改善项目" loading="lazy">'
    );

    mountFigure(
      findCard(['智能模具库与可追溯管理', '1200+副模具标准化与二维码追溯', '1200副模具立体库']),
      'moldProjectImagesStable',
      '<div class="project-media-grid-3">' +
      '<div class="main"><img src="/mold-before.jpg?v=20260718-r4" alt="立体库Layout规划设计" loading="lazy"><span>立体库Layout规划设计</span></div>' +
      '<div><img src="/mold-after1.png?v=20260718-r4" alt="立体库雏形" loading="lazy"><span>立体库雏形</span></div>' +
      '<div><img src="/mold-after2.jpg?v=20260718-r4" alt="智能立体库操作系统" loading="lazy"><span>智能立体库操作系统</span></div>' +
      '</div><figcaption>智能模具库｜库位与追溯管理｜1200+副模具标准化与二维码追溯</figcaption>'
    );

    mountFigure(
      findCard(['玻璃管保险丝切口断裂率改善', '保险丝制程', '切口工艺改良']),
      'fuseProjectImagesStable',
      '<div class="project-media-grid-2">' +
      '<div><img src="/fuse-cutting-before.jpg?v=20260718-r3" alt="玻璃管保险丝改善后半成品" loading="lazy"><span>改善后半成品</span></div>' +
      '<div><img src="/fuse-cutting-after.jpg?v=20260718-r3" alt="玻璃管保险丝改善后成品" loading="lazy"><span>改善后成品</span></div>' +
      '</div><figcaption>保险丝制程｜质量与工艺改善｜改善后半成品与成品实物对比</figcaption>'
    );

    mountFigure(
      findCard(['Factory Layout、精益物流与扩展边界规划', '新工厂/新产线', '设计规划']),
      'factoryLayoutProjectImageStable',
      '<img src="/factory-layout.png?v=20260718-r2" alt="Factory Layout新工厂新产线设计规划" loading="lazy">' +
      '<figcaption>新工厂/新产线｜Factory Layout、精益物流与扩展边界规划</figcaption>'
    );

    mountFigure(
      findCard(['ERP/MES/APS协同与IE基础数据治理', '数智化工厂｜数据地基']),
      'digitalFactoryProjectImageStable',
      '<img src="/shuzhihua.png?v=20260718-r2" alt="数智化工厂数据地基与制造运营协同" loading="lazy">' +
      '<figcaption>数智化工厂｜数据地基：ERP、MES、APS与IE基础数据协同</figcaption>'
    );
  }

  function scheduleApply() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      apply();
    });
  }

  function boot() {
    apply();
    [250, 650, 1300, 2400].forEach(function (delay) { setTimeout(apply, delay); });
    if ('MutationObserver' in window) {
      var observer = new MutationObserver(scheduleApply);
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { observer.disconnect(); apply(); }, 6000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
