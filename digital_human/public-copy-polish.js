(function(){
  'use strict';
  function setHead(section, title, text){
    if(!section)return;
    const head=section.querySelector('.head,.section-head');
    if(!head)return;
    const h=head.querySelector('h2');
    const p=head.querySelector('p');
    if(h&&title)h.textContent=title;
    if(p)p.textContent=text;
  }
  function apply(){
    setHead(document.getElementById('projects'),'代表项目矩阵','围绕典型制造场景，呈现问题识别、关键动作、方法应用、阶段成果与机制固化，体现从现场改善到经营支撑的完整实践链路。');
    setHead(document.getElementById('papers')||document.getElementById('paper-list'),'改善经验','围绕VSM、标准工时、SMED、ERP/MES协同、IE数据底座与目视化管理，沉淀可理解、可借鉴、可落地的制造改善方法。');
    setHead(document.getElementById('knowledge'),'精益知识分享','按照“理念—工具—体系—案例”整理精益生产、IE方法、现场改善工具、IATF16949核心工具、数智化工厂与项目交付经验，服务专业交流与知识复用。');
    const experience=document.getElementById('experience');
    if(experience){
      const head=experience.querySelector('.head,.section-head');
      if(head){
        const h=head.querySelector('h2');
        const p=head.querySelector('p');
        if(h)h.textContent='履历主线（加密）';
        if(p)p.textContent='履历内容按职业阶段、职责范围、关键成果与能力递进完整呈现，仅在授权访问后展示。';
      }
      const lockText=experience.querySelector('.experience-lock-card p');
      if(lockText)lockText.textContent='详细履历已设置访问口令，仅供授权交流使用。';
    }
    const capabilities=document.getElementById('capabilities');
    if(capabilities){
      const head=capabilities.querySelector('.head,.section-head');
      if(head){
        const h=head.querySelector('h2');
        const p=head.querySelector('p');
        if(h)h.textContent='制造改善方法体系图谱';
        if(p)p.textContent='从现场诊断、IE数据与流程改善，到系统协同、机制固化和经营复盘，形成贯穿制造运营全过程的方法体系。';
      }
    }
    const metricSec=Array.from(document.querySelectorAll('section')).find(sec=>{
      const h=sec.querySelector('h2');
      return h&&h.textContent.includes('制造改善能力总览');
    });
    if(metricSec){
      const p=metricSec.querySelector('.head p,.section-head p');
      if(p)p.textContent='以现场诊断、数据建模、试运行验证、跨部门协同、标准化固化与经营复盘为主线，构建可执行、可验证、可复制的制造改善能力。';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  setTimeout(apply,500);
  setTimeout(apply,1500);
})();