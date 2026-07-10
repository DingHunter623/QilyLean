(function(){
  const PAPER_CARDS=[
    ['01','汽车电子装配行业VSM价值流分析的落地方法','从订单信息流、物料流、WIP、等待和交付周期结构出发，把VSM从图形工具转化为跨部门改善路径。',['VSM','汽车电子','交付周期'],'papers.html#vsm'],
    ['02','标准工时不是考核工具，而是制造运营数据底座','说明标准工时如何支撑标准产能、UPPH、PMC排程、ERP/MES基础数据和经营改善分析。',['IE','标准工时','产能模型'],'papers.html#standard-time'],
    ['03','SMED快速换模在注塑车间的实施路径','从真实换模测时、内外部作业分离、角色分工、工具接口标准化到程序文件固化。',['SMED','注塑','换模程序'],'papers.html#smed'],
    ['04','精益改善如何与ERP/MES系统协同','把精益现场改善成果转化为系统可使用的数据、规则、参数和经营反馈闭环。',['ERP','MES','数据闭环'],'papers.html#erp-mes'],
    ['05','数智化工厂第一阶段为什么必须先做IE基础数据','阐明标准工时、工艺路线、资源能力和现场实绩规则为何是数智化工厂的地基工程。',['数智化工厂','IE数据','数据治理'],'papers.html#ie-data'],
    ['06','目视化不是贴标识，而是现场管理语言的统一','从6S标识、看板、通道、安全警示、库位和工位管理，说明目视化如何成为现场协同语言。',['目视化','6S','现场管理'],'papers.html#visual']
  ];
  const KNOW=[
    ['lean-01','微博精选 01','精益理念与现场改善思考','围绕精益生产理念、Gemba现地现物、问题意识、改善文化和管理机制的公开分享，适合用于现场管理认知对齐与个人知识沉淀。',['Lean Thinking','Gemba','PDCA'],'https://weibo.com/3193549852/5314903351231023'],
    ['lean-02','微博精选 02','精益工具应用与项目落地','围绕VSM、SMED、OEE、标准工时、线平衡、5M2E/5W2H等工具应用，强调工具必须回到现场数据、节拍、物料、质量与交付问题。',['VSM','SMED/OEE','标准工时'],'https://weibo.com/3193549852/5314922569535570'],
    ['lean-03','微博精选 03','质量体系与制造管理沉淀','围绕IATF16949、APQP、PPAP、FMEA、MSA、SPC、控制计划等方向，把质量体系工具与现场改善、NPI、过程控制结合起来。',['IATF16949','六大工具','过程控制'],'https://weibo.com/3193549852/5314900730846811'],
    ['lean-04','微博精选 04','IE基础数据与改善方法延展','围绕IE方法、标准工时、动作分析、产能评估、线平衡和现场数据口径，沉淀制造改善从经验判断走向数据管理的基础逻辑。',['IE','标准工时','线平衡'],'https://weibo.com/3193549852/4965279383683094'],
    ['lean-05','微博精选 05','质量工具与现场过程控制','围绕制造过程质量、问题分析、过程窗口、检验标准、异常闭环和持续改善，把质量工具转化为现场可执行的管理动作。',['质量工具','5M2E','闭环改善'],'https://weibo.com/3193549852/4965283820209009'],
    ['lean-06','微博精选 06','现场管理与改善意识沉淀','围绕制造现场的管理认知、改善意识、标准执行和问题暴露，强调改善不是临时活动，而是把现场问题持续转化为标准、机制和能力。',['现场管理','改善意识','标准执行'],'https://weibo.com/3193549852/4768704128617384'],
    ['lean-07','微博精选 07','精益基础工具与执行闭环','围绕精益基础工具、异常响应、执行闭环和团队协同，强调工具应用必须落到责任、节拍、数据、复盘和横向复制。',['精益基础','执行闭环','团队协同'],'https://weibo.com/3193549852/4768335785626778']
  ];
  function css(){
    if(document.getElementById('content-restore-style'))return;
    const s=document.createElement('style');s.id='content-restore-style';s.textContent=`
      .knowledge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.knowledge-card{display:flex;flex-direction:column;min-height:286px;padding:22px;border:1px solid var(--line,#d5e4e3);background:#fff;border-top:4px solid var(--teal,#178b94);box-shadow:0 12px 32px rgba(15,75,90,.08)}.knowledge-card:nth-child(2n){border-top-color:var(--copper,#caa15f)}.knowledge-card:nth-child(3n){border-top-color:var(--plum,#6e3f5f)}.knowledge-card small{display:block;margin-bottom:8px;color:var(--copper,#caa15f);font-weight:900}.knowledge-card h3{margin:0 0 12px;color:var(--forest,#0f4b5a);font-size:21px;line-height:1.35}.knowledge-card p{margin:0 0 12px;color:var(--muted,#5f7474);font-size:18.5px;line-height:1.78}.knowledge-tags{display:flex;flex-wrap:wrap;gap:7px;margin:4px 0 16px;padding:0;list-style:none}.knowledge-tags li{border:1px solid var(--line,#d5e4e3);background:#eef8f6;color:var(--forest,#0f4b5a);padding:4px 8px;font-size:13px;font-weight:850}.knowledge-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto}.knowledge-actions .button{width:max-content!important;background:var(--forest,#0f4b5a)!important;border-color:var(--forest,#0f4b5a)!important}.knowledge-actions .button.secondary{background:#fff!important;color:var(--forest,#0f4b5a)!important;border-color:var(--line,#d5e4e3)!important}.knowledge-note{margin-top:16px;padding:14px 16px;border-left:4px solid var(--copper,#caa15f);background:#eef8f6;color:#17443b;font-size:17px;font-weight:850;line-height:1.72}.paper-card .tags{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:8px!important;max-width:none!important}.paper-card .tag{display:inline-flex;padding:4px 9px;border:1px solid var(--line,#d5e4e3);background:#f7fbf7;color:#46615f;font-size:13px}.paper-card .tag:empty{display:none}.paper-card li:empty,.tags li:empty{display:none!important}
      @media(max-width:980px){.knowledge-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.knowledge-grid{grid-template-columns:1fr}.knowledge-actions .button{width:100%!important}}
    `;document.head.appendChild(s);
  }
  function buttonText(){return '查看详情';}
  function paperCard(c){return `<article class="paper-card"><small>${c[0]}</small><h3>${c[1]}</h3><p>${c[2]}</p><div class="tags">${c[3].map(t=>`<span class="tag">${t}</span>`).join('')}</div><a class="button" href="${c[4]}">${buttonText()}</a></article>`;}
  function restorePapers(){
    const sec=document.getElementById('papers')||document.getElementById('paper-list');
    if(!sec)return;
    const head=sec.querySelector('.head,.section-head');
    if(head)head.innerHTML='<h2>改善经验</h2><p>保持原有六篇经验文章入口，按VSM、标准工时、SMED、ERP/MES、IE数据底座和目视化语言六个方向沉淀制造改善方法，低调但不削弱专业厚度。</p>';
    const grid=sec.querySelector('.paper-grid,.grid-3');
    if(grid)grid.innerHTML=PAPER_CARDS.map(paperCard).join('');
  }
  function knowledgeCard(k){return `<article class="knowledge-card"><small>${k[1]}</small><h3>${k[2]}</h3><p>${k[3]}</p><ul class="knowledge-tags">${k[4].map(t=>`<li>${t}</li>`).join('')}</ul><div class="knowledge-actions"><a class="button" href="lean-knowledge.html#${k[0]}">查看整理页</a><a class="button secondary" href="${k[5]}" target="_blank" rel="noopener">微博原文</a></div></article>`;}
  function restoreKnowledge(){
    let sec=document.getElementById('knowledge');
    if(!sec){sec=document.createElement('section');sec.className='section';sec.id='knowledge';const papers=document.getElementById('papers')||document.getElementById('paper-list');if(papers&&papers.parentNode)papers.parentNode.insertBefore(sec,papers.nextSibling);else document.querySelector('main')&&document.querySelector('main').appendChild(sec);}
    sec.innerHTML=`<div class="inner"><div class="head"><h2>精益知识分享</h2><p>恢复微博知识分享入口。这里按“理念—工具—体系—案例”整理精益生产、IE方法、现场改善工具、IATF16949核心工具、数智化工厂与项目交付经验，服务制造改善实践交流与长期知识资产建设。</p></div><div class="knowledge-grid">${KNOW.map(knowledgeCard).join('')}</div><div class="knowledge-note">当前保留7条微博精选入口；后续新增内容继续按主题、适用场景、核心观点、可落地动作和原文链接沉淀。</div></div>`;
    const nav=document.querySelector('.nav');if(nav&&!nav.querySelector('a[href="#knowledge"]')){const a=document.createElement('a');a.href='#knowledge';a.textContent='知识分享';nav.appendChild(a);}
  }
  function removeBadTags(){document.querySelectorAll('.tag,.tags li,li,span').forEach(el=>{if((el.textContent||'').trim()==='退役军人')el.remove();});}
  function apply(){css();restorePapers();restoreKnowledge();removeBadTags();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,400);setTimeout(apply,1200);
})();