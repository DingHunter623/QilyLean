(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const assetUrl=file=>new URL(`assets/pure-ddz/${file}`,runtimeRoot).href;
  const runtimeUrl=file=>new URL(file,runtimeRoot).href;
  const RANK_THEME=Object.freeze({3:{code:'现场',title:'现场事实',subtitle:'Gemba Facts',skill:'现场观察'},4:{code:'数据',title:'工程数据',subtitle:'Engineering Data',skill:'数据采集'},5:{code:'精益',title:'精益改善',subtitle:'Lean Kaizen',skill:'消除浪费'},6:{code:'质量',title:'质量保证',subtitle:'Quality Assurance',skill:'过程质量'},7:{code:'数智',title:'数智固化',subtitle:'Digitalization',skill:'数字工厂'},8:{code:'知识',title:'知识资产',subtitle:'Knowledge Assets',skill:'知识沉淀'},9:{code:'IE',title:'工业工程',subtitle:'Industrial Engineering',skill:'IE七大手法'},10:{code:'ECRS',title:'流程改善',subtitle:'ECRS',skill:'取消·合并·重排·简化'},11:{code:'SMED',title:'快速换型',subtitle:'SMED',skill:'换线换模改善'},12:{code:'VSM',title:'价值流',subtitle:'Value Stream Mapping',skill:'端到端分析'},13:{code:'TPM',title:'设备效率',subtitle:'TPM',skill:'全员生产维护'},14:{code:'OEE',title:'综合效率',subtitle:'OEE',skill:'效率损失分析'},15:{code:'FLOW',title:'单件流',subtitle:'One Piece Flow',skill:'连续流制造'}});
  const SUIT_THEME=Object.freeze({'♠':{code:'ENGINEERING',title:'工程能力',icon:'⚙'},'♥':{code:'KAIZEN',title:'改善方法',icon:'◆'},'♣':{code:'PROJECT',title:'项目交付',icon:'▣'},'♦':{code:'DIGITAL',title:'数智赋能',icon:'◇'}});
  const JOKER_THEME=Object.freeze({16:{type:'small-joker',title:'小王',image:assetUrl('avatar-king.webp')},17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}});
  const RULE_RANK=Object.freeze({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});
  function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function ruleRankText(card){return RULE_RANK[card.rank]||String(card.rank)}
  function getTheme(card){if(!card)return null;if(card.rank>=16)return {...JOKER_THEME[card.rank],rank:card.rank,joker:true};return {...RANK_THEME[card.rank],suit:SUIT_THEME[card.suit],rank:card.rank,joker:false}}
  function renderJoker(card){const theme=getTheme(card);return `<span class="qily-card qily-card--joker ${theme.type}"><span class="qily-card-corner"><b>${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}" draggable="false"></span></span>`}
  function renderNormalCard(card){const theme=getTheme(card),red=card.suit==='♥'||card.suit==='♦';return `<span class="qily-card qily-card--normal${red?' qily-rule-red':''}"><span class="qily-card-corner qily-rank-suit-line"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b></span><span class="qily-card-theme"><small>${escapeHtml(theme.suit.code)}</small><strong>${escapeHtml(theme.code)}</strong><b>${escapeHtml(theme.title)}</b><em>${escapeHtml(theme.skill)}</em></span></span>`}
  function renderCard(card){return card.rank>=16?renderJoker(card):renderNormalCard(card)}
  function renderMiniCard(card){const theme=getTheme(card);if(card.rank>=16)return `<span class="mini-card qily-mini-joker ${theme.type}"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}"><b>${escapeHtml(theme.title)}</b></span>`;return `<span class="mini-card qily-mini-business${card.suit==='♥'||card.suit==='♦'?' red':''}"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b><small>${escapeHtml(theme.code)}</small></span>`}
  function installUiStandards(){
    if(!document.getElementById('qily-ddz-card-layout-standards')){
      const style=document.createElement('style');style.id='qily-ddz-card-layout-standards';style.textContent=`
        .qily-card--normal .qily-rank-suit-line{display:flex!important;flex-direction:row!important;align-items:center!important;gap:0!important;white-space:nowrap!important;width:auto!important}
        .qily-card--normal .qily-rank-suit-line b{display:block!important;white-space:nowrap!important;letter-spacing:-.06em!important;line-height:1!important}
        .qily-card--joker .qily-joker-visual{top:35%!important;width:78%!important;height:58%!important}
        .qily-card--joker .qily-joker-visual img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
        .qily-card--joker .qily-card-main{display:none!important}
        html body .game-shell .bottom-zone{transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards{min-height:138px!important;transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards>.mini-card{flex:0 0 98px!important;min-width:98px!important;width:98px!important;max-width:98px!important;height:128px!important;min-height:128px!important;max-height:128px!important;margin:4px!important;padding:8px 10px!important;border-radius:13px!important;border-width:2px!important;transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards>.qily-mini-business b{font-size:23px!important;line-height:1!important}
        html body .game-shell .bottom-cards>.qily-mini-business small{font-size:12px!important;line-height:1.15!important}
        html body .game-shell .bottom-cards>.qily-mini-joker img{width:62px!important;height:54px!important;object-fit:contain!important}
        html body .game-shell .bottom-cards>.qily-mini-joker b{font-size:13px!important;line-height:1.1!important}
        .v120-scroll-cue{width:56px!important;min-height:174px!important;padding:12px 6px!important;border:2px solid #ffe39b!important;background:rgba(3,47,48,.96)!important;box-shadow:0 10px 28px rgba(0,0,0,.42)!important}
        .v120-scroll-cue>span{font-size:25px!important;color:#ffe39b!important;line-height:1!important}
        .v120-scroll-cue>b{display:flex!important;flex-direction:column!important;align-items:center!important;gap:5px!important;writing-mode:initial!important;letter-spacing:0!important;color:#fff!important;font-size:12px!important;line-height:1.15!important;text-align:center!important}
        .v120-scroll-cue>b em{font-style:normal!important;color:#ffe39b!important;font-size:11px!important;line-height:1.15!important;writing-mode:vertical-rl!important}
        @media(max-width:680px){.v120-scroll-cue{right:5px!important;width:52px!important;min-height:166px!important}}
      `;document.head.appendChild(style)
    }
    const apply=()=>{
      const cue=document.getElementById('v120-scroll-cue');if(cue&&cue.dataset.qilyDetail!=='1'){cue.dataset.qilyDetail='1';cue.setAttribute('aria-label','页面可上下滑动查看更多内容');cue.innerHTML='<span>↑</span><b><span>上滑</span><em>滑动查看更多</em><span>下滑</span></b><span>↓</span>'}
      document.querySelectorAll('.official-info a span').forEach(span=>{if((span.textContent||'').trim()==='企业邮箱')span.textContent='官网邮箱'});
    };
    apply();
    if(window.MutationObserver){const observer=new MutationObserver(apply);observer.observe(document.documentElement,{childList:true,subtree:true})}
  }
  function loadV120(){if(window.__PURE_DDZ_MANAGED_LOADER__)return;if(!document.getElementById('qily-visual-v120-css')){const link=document.createElement('link');link.id='qily-visual-v120-css';link.rel='stylesheet';link.href=runtimeUrl('css/visual-v120.css?v=20260828-elder-v124');document.head.appendChild(link)}if(!document.querySelector('script[data-qily-visual-v120]')){const script=document.createElement('script');script.dataset.qilyVisualV120='1';script.src=runtimeUrl('js/visual-v120.js?v=20260828-elder-v124');script.async=true;document.body.appendChild(script)}}
  window.QilyLeanCardTheme=Object.freeze({getTheme,renderCard,renderMiniCard,ruleRankText,rankThemes:RANK_THEME,suitThemes:SUIT_THEME,jokerThemes:JOKER_THEME,runtimeRoot:runtimeRoot.href});installUiStandards();loadV120();
})();
