(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const assetUrl=file=>new URL(`assets/pure-ddz/${file}`,runtimeRoot).href;
  const siteAssetUrl=file=>new URL(`/assets/${file}`,window.location.origin).href;

  const RANK_THEME=Object.freeze({
    3:{code:'现场',title:'现场事实',subtitle:'Gemba Facts',skill:'现场观察'},
    4:{code:'数据',title:'工程数据',subtitle:'Engineering Data',skill:'数据采集'},
    5:{code:'精益',title:'精益改善',subtitle:'Lean Kaizen',skill:'消除浪费'},
    6:{code:'质量',title:'质量保证',subtitle:'Quality Assurance',skill:'过程质量'},
    7:{code:'数智',title:'数智固化',subtitle:'Digitalization',skill:'数字工厂'},
    8:{code:'知识',title:'知识资产',subtitle:'Knowledge Assets',skill:'知识沉淀'},
    9:{code:'IE',title:'工业工程',subtitle:'Industrial Engineering',skill:'IE七大手法'},
    10:{code:'ECRS',title:'流程改善',subtitle:'ECRS',skill:'取消·合并·重排·简化'},
    11:{code:'SMED',title:'快速换型',subtitle:'SMED',skill:'换线换模改善'},
    12:{code:'VSM',title:'价值流',subtitle:'Value Stream Mapping',skill:'端到端分析'},
    13:{code:'TPM',title:'设备效率',subtitle:'TPM',skill:'全员生产维护'},
    14:{code:'OEE',title:'综合效率',subtitle:'OEE',skill:'效率损失分析'},
    15:{code:'FLOW',title:'单件流',subtitle:'One Piece Flow',skill:'连续流制造'}
  });
  const SUIT_THEME=Object.freeze({
    '♠':{code:'ENGINEERING',title:'工程能力',icon:'⚙'},
    '♥':{code:'KAIZEN',title:'改善方法',icon:'◆'},
    '♣':{code:'PROJECT',title:'项目交付',icon:'▣'},
    '♦':{code:'DIGITAL',title:'数智赋能',icon:'◇'}
  });
  const HOME_AIRCRAFT=siteAssetUrl('qilylean-aircraft-hero-latest-q98.webp');
  const JOKER_THEME=Object.freeze({
    16:{type:'small-joker',title:'小王',image:HOME_AIRCRAFT},
    17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}
  });
  const RULE_RANK=Object.freeze({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});

  function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function ruleRankText(card){return RULE_RANK[card.rank]||String(card.rank)}
  function getTheme(card){
    if(!card)return null;
    if(card.rank>=16)return {...JOKER_THEME[card.rank],rank:card.rank,joker:true};
    return {...RANK_THEME[card.rank],suit:SUIT_THEME[card.suit],rank:card.rank,joker:false};
  }
  function renderJoker(card){
    const theme=getTheme(card);
    return `<span class="qily-card qily-card--joker ${theme.type}"><span class="qily-card-corner"><b>${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img class="qily-joker-person" src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}" draggable="false"></span></span>`;
  }
  function renderNormalCard(card){
    const theme=getTheme(card),red=card.suit==='♥'||card.suit==='♦';
    return `<span class="qily-card qily-card--normal${red?' qily-rule-red':''}"><span class="qily-card-corner qily-rank-suit-line"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b></span><span class="qily-card-theme"><small>${escapeHtml(theme.suit.code)}</small><strong>${escapeHtml(theme.code)}</strong><b>${escapeHtml(theme.title)}</b><em>${escapeHtml(theme.skill)}</em></span></span>`;
  }
  function renderCard(card){return card.rank>=16?renderJoker(card):renderNormalCard(card)}
  function renderMiniCard(card){
    const theme=getTheme(card);
    if(card.rank>=16){
      return `<span class="mini-card qily-mini-joker ${theme.type}"><span class="qily-mini-joker-person"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}"></span><b>${escapeHtml(theme.title)}</b></span>`;
    }
    return `<span class="mini-card qily-mini-business${card.suit==='♥'||card.suit==='♦'?' red':''}"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b><small>${escapeHtml(theme.code)}</small></span>`;
  }

  /* Card renderer owns card internals only. It must never resize the page, hand container, site header or Dock. */
  function installCardStandards(){
    if(document.getElementById('qily-ddz-card-internal-v150'))return;
    const style=document.createElement('style');
    style.id='qily-ddz-card-internal-v150';
    style.textContent=`
      .qily-card{position:absolute;inset:0;display:block;width:100%;height:100%;box-sizing:border-box}
      .qily-card--normal .qily-rank-suit-line{display:flex!important;flex-direction:row!important;align-items:center!important;width:auto!important;white-space:nowrap!important}
      .qily-card--normal .qily-rank-suit-line b{display:block!important;white-space:nowrap!important;letter-spacing:-.06em!important;line-height:1!important}
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
    rankThemes:RANK_THEME,suitThemes:SUIT_THEME,jokerThemes:JOKER_THEME,
    homeAircraft:HOME_AIRCRAFT,runtimeRoot:runtimeRoot.href
  });
  installCardStandards();
})();