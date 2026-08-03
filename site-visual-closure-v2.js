/* QilyLean 合作边界与友情链接可读性闭环分类器 v2｜2026-08-03 */
(function(d,w){
  'use strict';
  if(w.__qilyBoundaryLinksClosureV2)return;
  w.__qilyBoundaryLinksClosureV2=true;

  var boundaryCards=''+
    '<article class="boundary-service-card qily-static-card">'+
      '<span class="boundary-type">01｜新工厂／新产线规划</span><h3>规划输入与专业边界</h3>'+
      '<div class="boundary-split"><div><strong>适合启动</strong><ul>'+
        '<li>产品组合、工艺路线、产能需求及分期目标已有初步依据。</li>'+
        '<li>可提供场地／厂房约束、设备、公辅、物流、仓储、品质、安全和扩展输入。</li>'+
        '<li>决策团队能够评审规划假设，并书面确认输入变化与阶段结论。</li>'+
      '</ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul>'+
        '<li>只要求漂亮Layout或渲染图，却不提供产品、工艺和产能输入。</li>'+
        '<li>场地、预算、建设阶段尚未明确，却要求直接给出最终面积与投资结论。</li>'+
        '<li>要求规划咨询替代建筑、消防、环保、安全、结构或机电等法定设计与审批。</li>'+
      '</ul></div></div>'+
      '<p class="boundary-note"><strong>专业边界：</strong>交付设计输入、产能模型、功能分区、Layout、物流与实施路线；不替代具备相应资质单位出具的施工图、专项设计及法定审查。</p>'+
    '</article>'+
    '<article class="boundary-service-card qily-static-card">'+
      '<span class="boundary-type">02｜精益改善项目</span><h3>基线、试点与收益边界</h3>'+
      '<div class="boundary-split"><div><strong>适合启动</strong><ul>'+
        '<li>存在明确的效率、质量、交付、成本、换型、设备或数据治理问题。</li>'+
        '<li>允许基于真实现场和数据建立基线，并配置内部项目负责人。</li>'+
        '<li>具备Pilot试点资源，管理层可参与阶段评审与验收。</li>'+
      '</ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul>'+
        '<li>只希望免费取得完整方案、测算模型或可直接复制的项目文件。</li>'+
        '<li>无数据权限、无内部负责人，也不具备试点与复核条件。</li>'+
        '<li>尚未建立事实基线，却要求预先承诺绝对收益或固定改善比例。</li>'+
      '</ul></div></div>'+
      '<p class="boundary-note"><strong>专业边界：</strong>改善结果须通过基线、Pilot、过程记录和验收数据验证；历史案例不构成新项目的必然收益承诺。</p>'+
    '</article>'+
    '<article class="boundary-service-card qily-static-card">'+
      '<span class="boundary-type">03｜目视化项目</span><h3>标准、内容与实施边界</h3>'+
      '<div class="boundary-split"><div><strong>适合启动</strong><ul>'+
        '<li>区域、状态、责任、标准、异常和管理节奏已有明确需求。</li>'+
        '<li>支持现场勘查、内容校对、样板确认、制作施工协同与效果验收。</li>'+
        '<li>企业内部能够指定内容责任人，并持续维护数据与执行标准。</li>'+
      '</ul></div><div class="boundary-hold"><strong>暂缓启动</strong><ul>'+
        '<li>仅追求装饰效果，却没有管理标准、责任机制和实际应用场景。</li>'+
        '<li>内容未经责任部门确认，就要求直接制作或大批量安装。</li>'+
        '<li>希望仅靠看板、标识和颜色替代现场管理、稽核与问题闭环。</li>'+
      '</ul></div></div>'+
      '<p class="boundary-note"><strong>专业边界：</strong>交付现场诊断、视觉标准、图纸尺寸、材料清单、样板和实施协同；目视化工具不替代企业日常管理责任。</p>'+
    '</article>';

  function ready(fn){
    if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function refineCooperationBoundary(){
    var section=d.getElementById('boundary');
    if(!section)return;
    var heading=section.querySelector('.module-heading');
    if(heading){
      var title=heading.querySelector('h2');
      var lead=heading.querySelector('p');
      if(title)title.textContent='三类项目合作边界';
      if(lead)lead.textContent='新工厂／新产线规划、精益改善与目视化项目的输入条件、专业责任和验收口径不同，须分别判断，不以一套边界概括全部业务。';
    }
    var grid=section.querySelector('.boundary');
    if(!grid)return;
    grid.className='boundary boundary-service-grid';
    grid.setAttribute('data-qily-boundary-version','v2');
    grid.innerHTML=boundaryCards;
  }

  function enhanceLinkCards(){
    d.querySelectorAll('#companyGrid .card').forEach(function(card){
      card.classList.add('qily-link-directory-card','qily-interactive-card');
      card.classList.remove('qily-static-card');
    });
  }

  function boot(){
    d.documentElement.classList.add('qily-boundary-links-v2-ready');
    refineCooperationBoundary();
    enhanceLinkCards();
    setTimeout(enhanceLinkCards,180);
    setTimeout(enhanceLinkCards,800);
  }

  ready(boot);
})(document,window);
