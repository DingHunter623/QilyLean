/* QilyLean 合作边界与友情链接可读性闭环分类器 v3｜2026-08-08
 * 重要：本脚本仅负责视觉分类，不再重写 #boundary 内容。
 * 六类项目合作边界由 cooperation 静态源 + 核心业务闭环脚本维护，避免旧版三类边界覆盖 04 数字化工厂。
 */
(function(d,w){
  'use strict';
  if(w.__qilyBoundaryLinksClosureV3)return;
  w.__qilyBoundaryLinksClosureV3=true;

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function preserveCooperationBoundary(){
    var section=d.getElementById('boundary');
    if(!section)return;

    var heading=section.querySelector('.module-heading');
    if(heading){
      var title=heading.querySelector('h2');
      var lead=heading.querySelector('p');
      if(title&&/三类项目合作边界|四类项目合作边界/.test(title.textContent)){
        title.textContent='六类项目合作边界';
      }
      if(lead&&(/三类|四类/.test(lead.textContent)||lead.textContent.indexOf('数字化工厂')===-1)){
        lead.textContent='新工厂／新产线规划、精益改善、目视化、数字化工厂、APP软件开发与官网建设的输入条件、专业责任和验收口径不同，须按项目类型分别定义范围，不以一套边界概括全部业务。';
      }
    }

    var grid=section.querySelector('.boundary');
    if(!grid)return;
    grid.classList.add('boundary-service-grid');
    grid.setAttribute('data-qily-boundary-visual-classifier','v3-nondestructive');
    /* 禁止使用 innerHTML 重建合作边界；保留 01–06 业务源内容。 */
  }

  function enhanceLinkCards(){
    d.querySelectorAll('#companyGrid .card').forEach(function(card){
      card.classList.add('qily-link-directory-card','qily-interactive-card');
      card.classList.remove('qily-static-card');
    });
  }

  function boot(){
    d.documentElement.classList.add('qily-boundary-links-v3-ready');
    preserveCooperationBoundary();
    enhanceLinkCards();
    setTimeout(preserveCooperationBoundary,180);
    setTimeout(preserveCooperationBoundary,800);
    setTimeout(enhanceLinkCards,180);
    setTimeout(enhanceLinkCards,800);
  }

  ready(boot);
})(document,window);
