(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const assetUrl=file=>new URL(`assets/pure-ddz/${file}`,runtimeRoot).href;
  const siteAssetUrl=file=>new URL(`/assets/${file}`,window.location.origin).href;

  /*
   * V155 knowledge-card contract
   * - Every one of the 52 normal cards owns one QilyLean manufacturing / lean / engineering term.
   * - Rank + suit remains the first-reading gameplay information.
   * - English/code, Chinese name and one concise application cue are all visible on-card.
   * - Jokers intentionally retain their existing visual content.
   */
  const CARD_KNOWLEDGE=Object.freeze({
    '♠':Object.freeze({
      3:{code:'IE 7 Tools',title:'IE七大手法',subtitle:'Industrial Engineering',skill:'防错·动改·流程·五五｜人机·双手·抽查'},
      4:{code:'ECRS',title:'改善四原则',subtitle:'Eliminate Combine Rearrange Simplify',skill:'取消·合并·重排·简化'},
      5:{code:'VSM',title:'价值流图分析',subtitle:'Value Stream Mapping',skill:'识别LT·WIP·等待·增值'},
      6:{code:'Standard Work',title:'标准作业',subtitle:'Standardized Work',skill:'人·机·方法·时序标准化'},
      7:{code:'Time Study',title:'时间研究',subtitle:'Work Measurement',skill:'测定标准工时与标准产能'},
      8:{code:'Line Balance',title:'线平衡',subtitle:'Line Balancing',skill:'平衡CT·工位·人力负荷'},
      9:{code:'Takt Time',title:'节拍时间',subtitle:'Customer Takt',skill:'客户需求驱动生产节奏'},
      10:{code:'FLOW',title:'单件流',subtitle:'One Piece Flow',skill:'连续流动·减少在制品'},
      11:{code:'UPPH',title:'人均时产',subtitle:'Units Per Person Hour',skill:'单位人时产出效率'},
      12:{code:'SMED',title:'快速换型',subtitle:'Single-Minute Exchange of Die',skill:'缩短换线·换模时间'},
      13:{code:'OEE',title:'设备综合效率',subtitle:'Overall Equipment Effectiveness',skill:'开动率·性能·良率'},
      14:{code:'TPM',title:'全员生产维护',subtitle:'Total Productive Maintenance',skill:'预防保全·自主维护'},
      15:{code:'Bottleneck',title:'瓶颈管理',subtitle:'Constraint Management',skill:'识别约束·释放产能'}
    }),
    '♥':Object.freeze({
      3:{code:'Kaizen',title:'持续改善',subtitle:'Continuous Improvement',skill:'小步快跑·持续消除浪费'},
      4:{code:'PDCA',title:'改善闭环',subtitle:'Plan Do Check Act',skill:'计划·执行·检查·改进'},
      5:{code:'5M2E',title:'要因分析',subtitle:'Cause Analysis',skill:'人·机·料·法·测·能·环'},
      6:{code:'5 Why',title:'五问法',subtitle:'Root Cause Analysis',skill:'连续追问·追溯问题根因'},
      7:{code:'Poka-Yoke',title:'防错',subtitle:'Mistake Proofing',skill:'预防错误·异常即识别'},
      8:{code:'FMEA',title:'失效模式与影响分析',subtitle:'Failure Mode and Effects Analysis',skill:'风险识别·预防优先'},
      9:{code:'SPC',title:'统计过程控制',subtitle:'Statistical Process Control',skill:'监控波动·稳定过程'},
      10:{code:'CPK',title:'过程能力指数',subtitle:'Process Capability Index',skill:'评价过程满足规格能力'},
      11:{code:'MSA',title:'测量系统分析',subtitle:'Measurement System Analysis',skill:'评价测量系统可靠性'},
      12:{code:'Control Plan',title:'控制计划',subtitle:'Process Control Plan',skill:'明确过程控制点与方法'},
      13:{code:'8D',title:'8D问题解决',subtitle:'Eight Disciplines',skill:'团队化异常闭环'},
      14:{code:'DOE',title:'试验设计',subtitle:'Design of Experiments',skill:'多因素优化与验证'},
      15:{code:'PQCD',title:'经营四指标',subtitle:'Productivity Quality Cost Delivery',skill:'效率·质量·成本·交付'}
    }),
    '♣':Object.freeze({
      3:{code:'6S',title:'现场6S管理',subtitle:'Workplace Management',skill:'整理·整顿·清扫｜清洁·素养·安全'},
      4:{code:'TPS',title:'丰田生产方式',subtitle:'Toyota Production System',skill:'准时化·自働化'},
      5:{code:'Heijunka',title:'生产均衡化',subtitle:'Production Leveling',skill:'平准品种·数量·负荷'},
      6:{code:'Kanban',title:'看板拉动',subtitle:'Pull System',skill:'按实际需求补充与拉动'},
      7:{code:'JIT',title:'准时化生产',subtitle:'Just In Time',skill:'必要时间·必要数量'},
      8:{code:'Gemba',title:'现场主义',subtitle:'Go and See',skill:'到现场·看现物·抓现实'},
      9:{code:'Gantt',title:'甘特图',subtitle:'Gantt Chart',skill:'里程碑·进度目视化'},
      10:{code:'RACI',title:'权责矩阵',subtitle:'Responsibility Matrix',skill:'负责·审批·协作·知会'},
      11:{code:'Owner',title:'责任人机制',subtitle:'Accountability',skill:'结果负责·资源协调'},
      12:{code:'PMC',title:'生产物料控制',subtitle:'Production & Material Control',skill:'计划·物料·交付协同'},
      13:{code:'BOM',title:'物料清单',subtitle:'Bill of Materials',skill:'产品结构·物料用量基准'},
      14:{code:'SOP',title:'标准作业指导书',subtitle:'Standard Operating Procedure',skill:'固化方法·质量要求'},
      15:{code:'OPL',title:'单点课程',subtitle:'One Point Lesson',skill:'一页一主题·快速训练'}
    }),
    '♦':Object.freeze({
      3:{code:'ERP',title:'企业资源计划',subtitle:'Enterprise Resource Planning',skill:'订单·物料·财务一体化'},
      4:{code:'MES',title:'制造执行系统',subtitle:'Manufacturing Execution System',skill:'现场执行·追溯·报工'},
      5:{code:'APS',title:'高级计划与排程',subtitle:'Advanced Planning & Scheduling',skill:'约束条件下优化排程'},
      6:{code:'MRP',title:'物料需求计划',subtitle:'Material Requirements Planning',skill:'由需求推算物料供给'},
      7:{code:'WMS',title:'仓储管理系统',subtitle:'Warehouse Management System',skill:'库位·库存·收发追溯'},
      8:{code:'QMS',title:'质量管理系统',subtitle:'Quality Management System',skill:'检验·异常·质量闭环'},
      9:{code:'Andon',title:'安灯系统',subtitle:'Visual Alert System',skill:'异常可视·快速响应'},
      10:{code:'Traceability',title:'全程追溯',subtitle:'Manufacturing Traceability',skill:'人·机·料·法·测关联'},
      11:{code:'IoT',title:'物联网',subtitle:'Internet of Things',skill:'设备与现场数据连接'},
      12:{code:'BI',title:'商业智能',subtitle:'Business Intelligence',skill:'数据看板·分析决策'},
      13:{code:'Automation',title:'自动化',subtitle:'Industrial Automation',skill:'人机协同·减少重复作业'},
      14:{code:'Digital Twin',title:'数字孪生',subtitle:'Digital Twin',skill:'虚实映射·仿真验证'},
      15:{code:'Smart Factory',title:'数智工厂',subtitle:'Smart Factory',skill:'数据驱动·系统协同'}
    })
  });

  const SUIT_THEME=Object.freeze({
    '♠':{code:'IE · FLOW',title:'工业工程与流动',icon:'⚙'},
    '♥':{code:'KAIZEN · QA',title:'改善与质量',icon:'◆'},
    '♣':{code:'OPS · PM',title:'运营与项目',icon:'▣'},
    '♦':{code:'DIGITAL · IT',title:'数智工厂',icon:'◇'}
  });
  const HOME_AIRCRAFT=siteAssetUrl('qilylean-aircraft-hero-latest-q98.webp');
  const JOKER_THEME=Object.freeze({
    16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT},
    17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}
  });
  const RULE_RANK=Object.freeze({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});
  const RANK_THEME=Object.freeze(Object.fromEntries(Object.keys(CARD_KNOWLEDGE['♠']).map(rank=>[rank,CARD_KNOWLEDGE['♠'][rank]])));

  function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function ruleRankText(card){return RULE_RANK[card.rank]||String(card.rank)}
  function getTheme(card){
    if(!card)return null;
    if(card.rank>=16)return {...JOKER_THEME[card.rank],rank:card.rank,joker:true};
    const knowledge=CARD_KNOWLEDGE[card.suit]?.[card.rank]||RANK_THEME[card.rank]||CARD_KNOWLEDGE['♠'][3];
    return {...knowledge,suit:SUIT_THEME[card.suit],rank:card.rank,joker:false};
  }
  function renderJoker(card){
    const theme=getTheme(card);
    return `<span class="qily-card qily-card--joker ${theme.type}"><span class="qily-card-corner"><b>${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img class="qily-joker-person" src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}" draggable="false"></span></span>`;
  }
  function renderNormalCard(card){
    const theme=getTheme(card),red=card.suit==='♥'||card.suit==='♦';
    return `<span class="qily-card qily-card--normal${red?' qily-rule-red':''}" title="${escapeHtml(theme.code+'｜'+theme.title+'｜'+theme.skill)}"><span class="qily-card-corner qily-rank-suit-line"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b></span><span class="qily-card-theme"><small>${escapeHtml(theme.suit.code)}</small><strong>${escapeHtml(theme.code)}</strong><b>${escapeHtml(theme.title)}</b><em>${escapeHtml(theme.skill)}</em></span></span>`;
  }
  function renderCard(card){return card.rank>=16?renderJoker(card):renderNormalCard(card)}
  function renderMiniCard(card){
    const theme=getTheme(card);
    if(card.rank>=16){
      return `<span class="mini-card qily-mini-joker ${theme.type}"><span class="qily-mini-joker-person"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}"></span><b>${escapeHtml(theme.title)}</b></span>`;
    }
    return `<span class="mini-card qily-mini-business${card.suit==='♥'||card.suit==='♦'?' red':''}" title="${escapeHtml(theme.code+'｜'+theme.title)}"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b><small>${escapeHtml(theme.code)}</small></span>`;
  }

  /* Card renderer owns card internals only. It must never resize the page, hand container, site header or Dock. */
  function installCardStandards(){
    if(document.getElementById('qily-ddz-card-internal-v155'))return;
    document.getElementById('qily-ddz-card-internal-v150')?.remove();
    const style=document.createElement('style');
    style.id='qily-ddz-card-internal-v155';
    style.textContent=`
      .qily-card{position:absolute;inset:0;display:block;width:100%;height:100%;box-sizing:border-box}
      .qily-card--normal .qily-rank-suit-line{display:flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;white-space:nowrap!important}
      .qily-card--normal .qily-rank-suit-line b{display:block!important;white-space:nowrap!important;letter-spacing:-.06em!important;line-height:1!important}
      .qily-card-theme>small,.qily-card-theme>strong,.qily-card-theme>b,.qily-card-theme>em{display:block!important;max-width:100%!important;text-align:center!important}
      .qily-card-theme>strong,.qily-card-theme>b{white-space:normal!important;overflow-wrap:anywhere!important}
      .qily-card-theme>em{font-style:normal!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:keep-all!important}
      .qily-card--joker .qily-joker-visual{position:absolute;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}
      .qily-card--joker .qily-joker-person{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
      .qily-mini-joker{display:grid!important;grid-template-rows:minmax(0,1fr) auto!important;align-items:center!important;justify-items:center!important;overflow:hidden!important}
      .qily-mini-joker .qily-mini-joker-person{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important;overflow:hidden!important}
      .qily-mini-joker .qily-mini-joker-person>img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
      .qily-mini-joker>b{font-size:10px!important;line-height:1!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important}
    `;
    document.head.appendChild(style);
  }

  window.QilyLeanCardTheme=Object.freeze({
    getTheme,renderCard,renderMiniCard,ruleRankText,
    cardKnowledge:CARD_KNOWLEDGE,rankThemes:RANK_THEME,suitThemes:SUIT_THEME,jokerThemes:JOKER_THEME,
    homeAircraft:HOME_AIRCRAFT,runtimeRoot:runtimeRoot.href,version:'1.5.5-knowledge-52'
  });
  installCardStandards();
})();
