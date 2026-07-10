(function(){
  var css = document.createElement('style');
  css.id = 'font-plus-one-patch';
  css.textContent = `
    body{font-size:19px!important;line-height:1.78!important;}
    .lead{font-size:clamp(21px,1.65vw,25px)!important;line-height:1.78!important;}
    .head p,.section-head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.article p,.contact p,.credential,.list,.answer,textarea{font-size:19.5px!important;line-height:1.82!important;}
    .answer{font-size:21px!important;}
    textarea{font-size:20px!important;}
    .metric span{font-size:17.5px!important;line-height:1.68!important;}
    .metric em{font-size:16px!important;line-height:1.6!important;}
    .tags li,.pill,.topic-control,.nav{font-size:16px!important;}
    .paper-card .button,.button{font-size:16.5px!important;}
    .portrait-badge span{font-size:14px!important;}
    .career-scope{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:22px 0 0;}
    .career-scope .scope-card{padding:16px;border:1px solid var(--line,#d5e4e3);background:#fff;border-top:4px solid var(--teal,#178b94);box-shadow:0 12px 30px rgba(15,75,90,.08);}
    .career-scope .scope-card:nth-child(2n){border-top-color:var(--copper,#caa15f)}
    .career-scope .scope-card:nth-child(3n){border-top-color:var(--plum,#6e3f5f)}
    .career-scope strong{display:block;color:var(--forest,#0f4b5a);font-size:19px;margin-bottom:6px;}
    .career-scope span{display:block;color:var(--muted,#5f7474);font-size:17px;line-height:1.68;}
    .career-detail-list{margin:10px 0 0;padding-left:1.15em;color:var(--muted,#5f7474);font-size:18.5px;line-height:1.78;}
    .career-detail-list li{margin:5px 0;}
    .career-note{margin-top:18px;padding:14px 16px;border-left:4px solid var(--copper,#caa15f);background:#eef8f6;color:#17443b;font-size:18px;font-weight:850;line-height:1.76;}
    @media(max-width:900px){.career-scope{grid-template-columns:repeat(2,minmax(0,1fr));}}
    @media(max-width:760px){body{font-size:18.5px!important}.answer{font-size:20px!important}.head p,.card p,.timeline p,.project p,.paper-card p,.method-card p,.contact p,textarea{font-size:19px!important}.career-scope{grid-template-columns:1fr}.career-detail-list{font-size:18.5px!important;}}
  `;
  document.head.appendChild(css);

  var PWD = '259';
  function richExperienceHtml(){
    return `
      <div class="inner">
        <div class="head">
          <h2>履历主线（加密）</h2>
          <p>这里不做年份流水账，而是按“制造技术基础 → 工程管理 → 精益咨询交付 → 数智化与经营改善”展开，体现能力递进、方法沉淀和代表场景。</p>
        </div>
        <div class="career-scope">
          <div class="scope-card"><strong>技术底层</strong><span>IE/TE/PE基础、标准工时、动作分析、工艺参数、制程窗口、治具改善与测试验证。</span></div>
          <div class="scope-card"><strong>工程管理</strong><span>PE/IE/ME/TE/NPI协同、ECN/ECR、阶段门评审、工程团队建设与量产稳定。</span></div>
          <div class="scope-card"><strong>改善交付</strong><span>Gemba诊断、VSM、OEE、SMED、5M2E、PDCA、Pilot验证、横向复制与机制固化。</span></div>
          <div class="scope-card"><strong>数智化规划</strong><span>IE基础数据、ERP/MES/APS协同、Factory Layout、目视化、精益物流与经营改善表达。</span></div>
        </div>
        <div class="grid-2" style="margin-top:18px">
          <article class="timeline"><small>2025.11-2026.07｜汽车电子制造企业</small><h3>精益顾问 / 数智化工厂第一阶段推进</h3><p>服务汽车座椅开关、线束、注塑、装配、SMT/波峰焊等制造场景，围绕“精益体系搭建 + 主流产品族改善验证 + ERP基础数据协同”展开第一阶段导入。</p><ul class="career-detail-list"><li>建立公司级精益推进总纲、组织职责、DMS日常管理系统、6S稽查机制、红线管控与改善表单。</li><li>以汽车座椅开关总成主流产品族为切入，开展VSM现状图、LT结构、WIP与等待识别，输出未来态改善路径。</li><li>推进标准工时、标准产能、人机配置、UPPH、工序节拍与线平衡数据建设，支撑PMC排程和ERP/MES数据口径。</li><li>编制单件流/小批流试运行程序、装配总成快速换型程序、注塑件快速换模SMED程序文件，明确节拍、WIP、异常响应、品质确认与角色分工。</li><li>推动公司级目视化、验厂整改、安全防呆、通道/库位/线体标识、精益桌、铆压防呆、注塑抛料防护等现场项目落地。</li></ul><div class="highlight">阶段沉淀：精益运行框架、VSM改善路径、IE基础数据、SMED程序文件、6S运行机制、现场目视化与安全防呆第一阶段导入。短期改善按试运行和问题暴露处理，不作为KPI压现场。</div></article>
          <article class="timeline"><small>2019.07-2025.08｜制造改善咨询项目</small><h3>精益管理咨询顾问 / Lean项目交付负责人</h3><p>面向汽车电子、电气、新能源、半导体、小家电等制造企业，承担从诊断、方案、Pilot、交付、复盘到标准化沉淀的项目型工作。</p><ul class="career-detail-list"><li>以Gemba现场诊断、VSM/5M2E分析、改善蓝图、5W2H/PDCA推进、周度复盘和项目例会机制推动改善闭环。</li><li>覆盖500+亩新工厂/新产线布局规划与既有车间布局优化，参与人流物流动线、库位策略、目视化系统和分阶段实施计划。</li><li>推进OEE、DLT、SMED、线平衡、标准工时、工装治具、设备稼动、品质良率和物流效率改善。</li><li>开展300T冲压机3.5T大型模具SMED项目，识别吊装、工具、接口、参数、首件确认和等待损失，建立快速换模流程。</li><li>规划智能模具库与可追溯管理机制，建立模具编号、库位编码、模具本体/库位二维码、领用归还、保养维修和盘点流程。</li></ul><div class="highlight">代表结果：OEE提升至较高水平、Delivery Lead Time缩短约30%、SMED后单线产能提升15%-25%、1200+副模具标准化管理、累计改善收益超千万元。</div></article>
          <article class="timeline"><small>2015.07-2019.06｜LED/光电制造企业</small><h3>工程部部长 / 工程体系与NPI管理</h3><p>管理PE/IE/ME/TE工程团队，覆盖NPI导入、工艺工程、设备工装、测试工程、ECN/ECR、阶段门评审和工程团队建设。</p><ul class="career-detail-list"><li>建立EVT/DVT/PVT/MP阶段门和跨部门评审机制，推动工程问题从经验处理转向节点化、数据化、责任化管理。</li><li>围绕Light Bar事业部推进关键工序效率、工艺稳定性、工装治具、测试验证和量产异常闭环。</li><li>强化工程与生产、品质、PMC、设备、采购之间的协同，支撑新产品导入、量产爬坡和制造成本优化。</li><li>培养10+名工程骨干，形成PE/IE/ME/TE/NPI协同机制，提升工程团队对现场问题的支撑能力。</li></ul><div class="highlight">代表结果：关键工序效率提升约30%，综合制造成本下降10%+，工程团队与阶段门机制得到固化。</div></article>
          <article class="timeline"><small>2009.10-2015.06｜电子制造工程技术岗位</small><h3>IE / TE工程师：从现场数据到制程改善</h3><p>从一线工程技术岗位沉淀标准工时、动作分析、线平衡、产能评估、制程窗口、工艺参数优化、治具改善与不良闭环能力。</p><ul class="career-detail-list"><li>建立标准工时、动作分解、工序节拍、产能测算和线平衡基础方法，服务生产效率与排线改善。</li><li>围绕玻璃管保险丝切口断裂问题，建立数据采集口径与Pareto分析，识别刀具、速度、压力、夹持、定位和首件确认等关键要因。</li><li>针对真空熔炉、沾银陶瓷管、镀铜等工艺，结合5M2E分析设备程序、材料状态、作业方法、检测标准与环境因素，优化Process Window。</li><li>将改善结果沉淀为SOP/SWI、首件确认、巡检频次、参数基准与异常反馈机制。</li></ul><div class="highlight">代表结果：切口断裂率由约12%降至＜1%；关键工艺直通率提升至96%+；多项改善形成年度创效。</div></article>
          <article class="timeline"><small>2006.07-2009.09｜制造技术基础阶段</small><h3>测试/工艺/现场工程基础能力形成</h3><p>在电子制造现场形成设备、工艺、品质、测试、产线节拍和异常处理的基础认知，为后续IE/精益/工程管理转型奠定底层能力。</p><ul class="career-detail-list"><li>熟悉电子制造现场的工艺路线、作业标准、测试验证、异常反馈和生产组织方式。</li><li>从现场问题出发理解品质、效率、成本、交付之间的联动关系，逐步形成以数据和过程为依据的改善习惯。</li><li>完成从单点技术支持到流程改善、数据分析、工程协同的职业能力转型。</li></ul><div class="highlight">能力沉淀：制造现场基础、工程问题意识、数据化改善思维和跨部门协同雏形。</div></article>
          <article class="timeline"><small>长期能力链路｜贯穿2009年以来</small><h3>VSM → 5M2E → PDCA → 标准化固化</h3><p>履历主线的核心不是岗位名称堆叠，而是持续把现场问题转化为体系能力。</p><ul class="career-detail-list"><li>VSM价值流分析：识别信息流、物料流、WIP、等待、LT、VAT、PCE和交付断点。</li><li>5M2E要因分析：从人、机、料、法、测、能/源、环区分主因，避免简单归因现场执行。</li><li>PDCA/5W2H闭环：把问题变成计划、责任、验证、复盘和横向复制。</li><li>机制固化：通过SOP/SWI、标准工时、看板、点检、表单、程序文件和系统数据口径形成长期资产。</li></ul><div class="highlight">核心定位：端到端制造改善交付能力——调研诊断、方案设计、Pilot验证、跨部门推进、结果复盘、标准固化与经验复制。</div></article>
        </div>
        <div class="career-note">公开页面保持低调表达，详细履历主线放在加密区；但加密后必须体现真实能力厚度、项目链路和方法沉淀，而不是压缩成几张浅层卡片。</div>
      </div>`;
  }
  function lockHtml(){return `<div class="inner"><div class="experience-lock-card"><h2>履历主线（加密）</h2><p>详细履历主线包含完整职业阶段、代表项目、能力递进和改善方法沉淀。公开页面只保留概要，输入口令后查看完整版本。</p><div class="experience-lock-form"><input class="experience-lock-input" id="experiencePasswordInput" type="password" inputmode="numeric" placeholder="请输入访问密码"><button class="experience-lock-btn" id="experienceUnlockBtn" type="button">查看完整履历主线</button></div><div class="experience-lock-msg" id="experienceLockMsg"></div></div></div>`;}
  function renderExperience(){
    var sec=document.getElementById('experience');
    if(!sec)return;
    var unlocked=false;
    try{unlocked=sessionStorage.getItem('experienceUnlocked')==='1';}catch(e){}
    if(unlocked){sec.innerHTML=richExperienceHtml();return;}
    sec.innerHTML=lockHtml();
    var input=document.getElementById('experiencePasswordInput');
    var btn=document.getElementById('experienceUnlockBtn');
    var msg=document.getElementById('experienceLockMsg');
    if(!btn||!input)return;
    var unlock=function(){
      if((input.value||'').trim()===PWD){try{sessionStorage.setItem('experienceUnlocked','1');}catch(e){}sec.innerHTML=richExperienceHtml();}
      else{if(msg)msg.textContent='密码不正确，请重新输入。';input.select();}
    };
    btn.addEventListener('click',unlock);
    input.addEventListener('keydown',function(e){if(e.key==='Enter')unlock();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderExperience);else renderExperience();
  setTimeout(renderExperience,350);
})();