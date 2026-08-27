(function () {
  'use strict';

  var VERSION = '20260828-knowledge-asset-2-0-v1';
  var TERMINOLOGY_PATH = /\/knowledge\/terminology(?:\.html)?\/?$/i;
  if (!TERMINOLOGY_PATH.test(location.pathname || '')) return;

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function updateCount() {
    var total = document.querySelectorAll('[data-term-card]').length;
    var count = document.getElementById('termCount');
    if (count && total > 0) count.textContent = '共收录 ' + total + ' 项术语 · ' + total + ' 份单点培训课件';
    var meta = document.querySelector('meta[name="description"]');
    if (meta && total > 0) meta.setAttribute('content', String(meta.getAttribute('content') || '').replace(/\d+项中文诠释/, total + '项中文诠释'));
  }

  function ensureSponsorCard() {
    var exists = Array.prototype.some.call(document.querySelectorAll('[data-term-card]'), function (card) {
      var code = card.querySelector('.term-code');
      return clean(code && code.textContent).toLowerCase() === 'sponsor';
    });
    if (exists) { updateCount(); return; }

    var grid = document.querySelector('.term-grid');
    if (!grid) return;

    var card = document.createElement('article');
    card.className = 'term-card';
    card.id = 'term-sponsor';
    card.setAttribute('data-term-card', '');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-keywords', 'Sponsor Project Sponsor 项目发起人 项目主责高层 项目赞助人 高层支持 资源授权 里程碑评审 风险升级 跨部门协调 收益确认 项目池');
    card.innerHTML = [
      '<div class="term-code">Sponsor</div>',
      '<div class="term-en">Project Sponsor</div>',
      '<h3>项目发起人／项目主责高层</h3>',
      '<p class="term-formula"><strong>核心口径：</strong>Sponsor代表组织层面对项目进行授权与背书，负责确认项目价值、保障关键资源、主持或参与重大里程碑评审，并在跨部门障碍或重大风险超出项目经理权限时推动升级解决。</p>',
      '<p><strong>应用场景：</strong>用于A类客户交付、重大质量／安全、量产爬坡、自动化、降本、工厂规划及数智化项目。Sponsor不替代项目经理做日常计划，也不等同于“出资赞助人”；在制造企业中更适合解释为“项目发起人”或“项目主责高层”。</p>',
      '<p class="term-case-mini"><strong>应用案例：</strong>某自动化项目在SAT后出现跨部门安全与节拍争议，项目经理无法单独调配资源；Sponsor组织里程碑评审，明确安全红线、责任人、资源和再验证条件，证据齐套后再批准进入Pilot。</p>',
      '<div class="term-opl-actions"><a class="term-opl-open" href="/knowledge/terminology/sponsor.html">查看单点培训课件</a></div>'
    ].join('');
    grid.appendChild(card);
    updateCount();

    var params = new URLSearchParams(location.search || '');
    if (clean(params.get('term')).toLowerCase() === 'sponsor' || location.hash === '#term-sponsor') {
      setTimeout(function () {
        card.classList.add('term-focus');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }

  var SPECIFIC_CASES = {
    'VSM':'某装配产品实际增值加工约35分钟，而从领料到完工LT达到2.4天。团队用VSM把WIP、等待、搬运和信息触发点放在同一张图上，先对两处批量等待实施Pilot，再用同口径LT、WIP与PCE验证是否真正缩短交付周期。',
    'ECRS':'某人工工位CT为38秒，录像分解发现重复取放、转身和二次确认。先取消无必要动作、合并取放、重排物料位置，Pilot后CT降至32秒；连续多班复测后才更新标准作业。',
    'SMED':'某设备换型原需90分钟。团队录像拆分内外部作业，将备料、治具预调和参数准备外部化，并把可并行动作同步执行，Pilot换型降至55分钟；同时确认首件质量与安全，避免“只快不稳”。',
    'OEE':'某自动化线可动率88%、性能效率92%、质量率98%，OEE约79.3%。团队不把“OEE低”当根因，而是继续按停机、短停、降速和不良分层，用柏拉图锁定最大损失并逐项验证。',
    'UPPH':'某线8名直接人员生产7.5小时，合格产出480件，UPPH＝8件/人·小时。若另有支援工时、返工或停线，必须按统一口径纳入或单独披露，不能用隐藏投入制造虚假提升。',
    'UPH':'某线7.5小时合格产出600件，UPH＝80件/小时。改善后即使UPH提升，也需同时查看投入人数、FPY和WIP，避免用增加人力或堆积在制换取表面产出。',
    'TT':'某班可用生产时间420分钟、客户需求840件，TT＝30秒/件。若瓶颈CT持续34秒，团队必须通过ECRS、线平衡、并行或资源调整解决能力缺口，而不是修改TT迎合现状。',
    'CT':'某工位连续完成20件用时600秒，观察CT为30秒/件；客户TT为27秒/件。团队进一步分离正常循环与异常停机，确认3秒/件能力缺口来自固定作业还是波动损失。',
    'LT':'某产品实际加工只有20分钟，但从领料到入库经历2.5天。改善时优先调查排队、批量、等待和信息触发，而不是只在20分钟加工时间里继续压缩几秒动作。',
    'PCE':'某流程增值时间30分钟、总LT 600分钟，PCE为5%。团队先处理等待和WIP，使总LT下降，再评估是否值得继续压缩单工序动作。',
    'FPY':'投入1000件，首次通过960件，返工后又合格35件；FPY仍为96%，最终合格率可为99.5%。该案例用于提醒：返工后合格不能回填一次合格率。',
    'PDCA':'某工序不良率连续三周约3.2%。P阶段完成缺陷层别和根因验证，D阶段只在一条线试行参数与防错，C阶段连续多班复测至约1.4%，A阶段再更新控制文件并横向展开。',
    '5WHY':'某端子压接不良反复发生，最初被归因“员工操作”。逐层追问并核对点检、校验与参数记录后发现控制缺口，措施由人员提醒转为量具校验、参数锁定与首件确认。',
    'PFMEA':'某新产品试产存在连接器错插风险。团队把失效模式、后果、原因、现有预防和探测控制逐项核对，按适用FMEA规则确定优先级，新增结构防错和验证证据后再评价风险。',
    'RACI':'某跨部门试运行项目曾出现“都参与但没人最终拍板”。团队按交付包设置唯一A、明确R/C/I，并把安全、节拍、质量、文件等验收证据绑定里程碑后，异常升级与放行责任可追溯。',
    'PILOT':'某线体改善方案只先在一个班次、一个产品族运行，预设CT、FPY、WIP和安全红线；连续达到目标且无副作用后才扩大范围，未达标则回退并修正。',
    'GANTT':'某自动化项目把“设备跟进”拆成设计冻结、FAT、到厂、SAT、Pilot、验收等里程碑，每个节点绑定责任人、前置条件和证据，周会只聚焦偏差、风险和决策。',
    'SPONSOR':'某自动化项目在SAT后出现安全、节拍与资源冲突，项目经理权限不足。Sponsor组织重大里程碑评审，明确风险红线、资源与再验证条件，证据齐套后再批准进入Pilot。'
  };

  var RELATIONS = {
    'VSM':[['/qilylean/daily/2026-08-19.html','精选简报｜精益交付与工程闭环'],['/projects/','代表项目｜价值流与交付改善'],['/improvements/','改善方法｜精益与IE']],
    'ECRS':[['/qilylean/daily/2026-08-19.html','精选简报｜精益交付与工程闭环'],['/improvements/','改善方法｜ECRS与现场改善'],['/projects/','代表项目｜工程改善证据']],
    'SMED':[['/qilylean/daily/2026-08-25.html','精选简报｜八大浪费与改善闭环'],['/knowledge/smed-injection-mold-change.html','专题｜注塑快速换模'],['/projects/','代表项目｜换型改善']],
    'OEE':[['/qilylean/daily/2026-08-25.html','精选简报｜八大浪费与改善闭环'],['/improvements/','改善方法｜设备效率'],['/projects/','代表项目｜改善验证']],
    'PDCA':[['/knowledge/pdca-gantt-milestone-opl.html','专题｜PDCA × 甘特图里程碑'],['/qilylean/daily/2026-08-19.html','精选简报｜工程闭环'],['/projects/','代表项目｜闭环证据']],
    'RACI':[['/knowledge/pdca-gantt-milestone-opl.html','专题｜项目里程碑管理'],['/qilylean/daily/2026-08-19.html','精选简报｜精益交付'],['/cooperation/','相关项目能力']],
    'PILOT':[['/qilylean/daily/2026-08-25.html','精选简报｜从问题到标准固化'],['/qilylean/daily/2026-08-19.html','精选简报｜工程交付闭环'],['/projects/','代表项目｜试点验证']],
    'SPONSOR':[['/knowledge/pdca-gantt-milestone-opl.html','专题｜项目里程碑管理'],['/qilylean/daily/2026-08-19.html','精选简报｜工程交付闭环'],['/cooperation/','相关项目能力']]
  };

  function ensureStyles(){
    if(document.getElementById('qilyOplKnowledgeAssetV2Styles'))return;
    var style=document.createElement('style');
    style.id='qilyOplKnowledgeAssetV2Styles';
    style.textContent=[
      '.term-case-mini{margin-top:10px;padding:11px 12px;border-left:4px solid #0f6f73;background:#f1f8f6;color:#365753;line-height:1.65}',
      '.qily-opl-relations{margin:18px 0;padding:18px;border:1px solid #cbdeda;border-radius:16px;background:linear-gradient(180deg,#fff,#f2f8f6)}',
      '.qily-opl-relations h3{margin:0 0 7px;color:#0f4b5a!important}',
      '.qily-opl-relations p{margin:0 0 12px;color:#55706d!important;line-height:1.65}',
      '.qily-opl-relation-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}',
      '.qily-opl-relation-grid a{padding:11px 12px;border:1px solid #d5e4e1;border-radius:11px;background:#fff;color:#0f5965!important;text-decoration:none;font-weight:800;line-height:1.45}',
      '.term-opl-case{border-left:5px solid #0f6f73!important;background:linear-gradient(135deg,#f7fbfa,#eef7f4)!important}',
      '@media(max-width:760px){.qily-opl-relation-grid{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  function currentCode(){
    var title=document.getElementById('termOplTitle');
    var text=clean(title&&title.textContent);
    if(!text)return '';
    return text.split('｜')[0].split('|')[0].trim().toUpperCase();
  }

  function findBlock(content,label){
    return Array.prototype.find.call(content.querySelectorAll('.term-opl-block'),function(block){
      var h=block.querySelector('h3');
      return clean(h&&h.textContent).indexOf(label)>=0;
    });
  }

  function enrichCurrentOpl(){
    var modal=document.getElementById('termOplModal');
    var content=document.getElementById('termOplContent');
    if(!modal||!content||modal.hidden)return;
    var code=currentCode();
    if(!code)return;

    var caseBlock=findBlock(content,'制造现场案例');
    if(caseBlock&&SPECIFIC_CASES[code]&&caseBlock.getAttribute('data-qily-specific-case')!==VERSION){
      var heading=caseBlock.querySelector('h3');
      caseBlock.innerHTML=(heading?heading.outerHTML:'<h3>制造现场案例</h3>')+'<p class="term-opl-case"><strong>案例性质：教学推演。</strong> '+SPECIFIC_CASES[code]+'</p>';
      caseBlock.setAttribute('data-qily-specific-case',VERSION);
    }

    if(!content.querySelector('.qily-opl-relations')){
      var links=RELATIONS[code]||[
        ['/qilylean/daily-insights.html','精选简报｜相关工程判断'],
        ['/projects/','代表项目｜项目证据'],
        ['/cooperation/','相关项目能力']
      ];
      var relation=document.createElement('section');
      relation.className='qily-opl-relations';
      relation.setAttribute('data-qily-opl-relations',VERSION);
      relation.innerHTML='<h3>关联学习与交付｜Related Knowledge</h3><p>术语必须回到真实场景：统一口径 → 选择方法 → 案例验证 → 标准固化。以下入口与本课件同步关联。</p><div class="qily-opl-relation-grid">'+links.map(function(item){return '<a href="'+item[0]+'">'+item[1]+'</a>';}).join('')+'</div>';
      var contact=content.querySelector('.term-opl-contact-card');
      content.insertBefore(relation,contact||null);
    }
  }

  function ensureKnownCardCases(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-term-card]'),function(card){
      if(card.querySelector('.term-case-mini'))return;
      var code=clean((card.querySelector('.term-code')||{}).textContent).toUpperCase();
      if(!SPECIFIC_CASES[code])return;
      var application=Array.prototype.find.call(card.querySelectorAll('p'),function(p){return clean(p.textContent).indexOf('应用场景')>=0;});
      if(!application)return;
      var caseLine=document.createElement('p');
      caseLine.className='term-case-mini';
      caseLine.innerHTML='<strong>应用案例：</strong>'+SPECIFIC_CASES[code];
      application.insertAdjacentElement('afterend',caseLine);
    });
  }

  function initialize(){
    ensureStyles();
    ensureSponsorCard();
    ensureKnownCardCases();
    enrichCurrentOpl();
    var modal=document.getElementById('termOplModal');
    if(modal&&window.MutationObserver){
      new MutationObserver(function(){
        requestAnimationFrame(function(){enrichCurrentOpl();});
      }).observe(modal,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
