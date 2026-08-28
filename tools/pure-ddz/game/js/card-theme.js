(() => {
  'use strict';

  const scriptUrl=document.currentScript?.src||'';
  const runtimeRoot=scriptUrl?new URL('../',scriptUrl):new URL('./',window.location.href);
  const assetUrl=file=>new URL(`assets/pure-ddz/${file}`,runtimeRoot).href;
  const siteAssetUrl=file=>new URL(`/assets/${file}`,window.location.origin).href;
  const runtimeUrl=file=>new URL(file,runtimeRoot).href;
  const RANK_THEME=Object.freeze({3:{code:'现场',title:'现场事实',subtitle:'Gemba Facts',skill:'现场观察'},4:{code:'数据',title:'工程数据',subtitle:'Engineering Data',skill:'数据采集'},5:{code:'精益',title:'精益改善',subtitle:'Lean Kaizen',skill:'消除浪费'},6:{code:'质量',title:'质量保证',subtitle:'Quality Assurance',skill:'过程质量'},7:{code:'数智',title:'数智固化',subtitle:'Digitalization',skill:'数字工厂'},8:{code:'知识',title:'知识资产',subtitle:'Knowledge Assets',skill:'知识沉淀'},9:{code:'IE',title:'工业工程',subtitle:'Industrial Engineering',skill:'IE七大手法'},10:{code:'ECRS',title:'流程改善',subtitle:'ECRS',skill:'取消·合并·重排·简化'},11:{code:'SMED',title:'快速换型',subtitle:'SMED',skill:'换线换模改善'},12:{code:'VSM',title:'价值流',subtitle:'Value Stream Mapping',skill:'端到端分析'},13:{code:'TPM',title:'设备效率',subtitle:'TPM',skill:'全员生产维护'},14:{code:'OEE',title:'综合效率',subtitle:'OEE',skill:'效率损失分析'},15:{code:'FLOW',title:'单件流',subtitle:'One Piece Flow',skill:'连续流制造'}});
  const SUIT_THEME=Object.freeze({'♠':{code:'ENGINEERING',title:'工程能力',icon:'⚙'},'♥':{code:'KAIZEN',title:'改善方法',icon:'◆'},'♣':{code:'PROJECT',title:'项目交付',icon:'▣'},'♦':{code:'DIGITAL',title:'数智赋能',icon:'◇'}});
  const HOME_AIRCRAFT=siteAssetUrl('qilylean-aircraft-hero-latest-q98.webp');
  const JOKER_THEME=Object.freeze({16:{type:'small-joker',title:'小王',image:assetUrl('avatar-king.webp'),aircraft:HOME_AIRCRAFT},17:{type:'big-joker',title:'大王',image:assetUrl('avatar-king.webp')}});
  const RULE_RANK=Object.freeze({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'});
  function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
  function ruleRankText(card){return RULE_RANK[card.rank]||String(card.rank)}
  function getTheme(card){if(!card)return null;if(card.rank>=16)return {...JOKER_THEME[card.rank],rank:card.rank,joker:true};return {...RANK_THEME[card.rank],suit:SUIT_THEME[card.suit],rank:card.rank,joker:false}}
  function renderJoker(card){
    const theme=getTheme(card);
    const aircraft=card.rank===16?`<span class="qily-joker-aircraft" aria-label="QilyLean官网首图飞机模型"><img src="${escapeHtml(theme.aircraft)}" alt="QilyLean官网首图飞机模型" draggable="false"></span>`:'';
    return `<span class="qily-card qily-card--joker ${theme.type}"><span class="qily-card-corner"><b>${escapeHtml(theme.title)}</b><i>JOKER</i></span><span class="qily-joker-visual"><img class="qily-joker-person" src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}" draggable="false">${aircraft}</span></span>`
  }
  function renderNormalCard(card){const theme=getTheme(card),red=card.suit==='♥'||card.suit==='♦';return `<span class="qily-card qily-card--normal${red?' qily-rule-red':''}"><span class="qily-card-corner qily-rank-suit-line"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b></span><span class="qily-card-theme"><small>${escapeHtml(theme.suit.code)}</small><strong>${escapeHtml(theme.code)}</strong><b>${escapeHtml(theme.title)}</b><em>${escapeHtml(theme.skill)}</em></span></span>`}
  function renderCard(card){return card.rank>=16?renderJoker(card):renderNormalCard(card)}
  function renderMiniCard(card){
    const theme=getTheme(card);
    if(card.rank>=16){
      const aircraft=card.rank===16?`<span class="qily-mini-joker-aircraft"><img src="${escapeHtml(theme.aircraft)}" alt="" aria-hidden="true"></span>`:'';
      return `<span class="mini-card qily-mini-joker ${theme.type}"><span class="qily-mini-joker-person"><img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme.title)}"></span>${aircraft}<b>${escapeHtml(theme.title)}</b></span>`;
    }
    return `<span class="mini-card qily-mini-business${card.suit==='♥'||card.suit==='♦'?' red':''}"><b>${escapeHtml(ruleRankText(card))}${escapeHtml(card.suit)}</b><small>${escapeHtml(theme.code)}</small></span>`
  }
  function installUiStandards(){
    if(!document.getElementById('qily-ddz-card-layout-standards')){
      const style=document.createElement('style');style.id='qily-ddz-card-layout-standards';style.textContent=`
        .qily-card--normal .qily-rank-suit-line{display:flex!important;flex-direction:row!important;align-items:center!important;gap:0!important;white-space:nowrap!important;width:auto!important}
        .qily-card--normal .qily-rank-suit-line b{display:block!important;white-space:nowrap!important;letter-spacing:-.06em!important;line-height:1!important}
        .qily-card--joker .qily-joker-visual{top:35%!important;width:78%!important;height:58%!important}
        .qily-card--joker .qily-joker-visual>.qily-joker-person{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
        .qily-card--joker .qily-card-main{display:none!important}

        /* 小王：人物 + 官网首页首图飞机模型。牌面不叠加型号、项目名或其它额外文字。 */
        .qily-card--joker.small-joker .qily-joker-visual{top:31%!important;width:86%!important;height:66%!important;display:grid!important;grid-template-rows:minmax(0,1fr) 42%!important;gap:3px!important;align-items:center!important;overflow:hidden!important}
        .qily-card--joker.small-joker .qily-joker-person{width:72%!important;height:100%!important;justify-self:center!important;object-fit:contain!important;object-position:center!important}
        .qily-card--joker.small-joker .qily-joker-aircraft{display:block!important;position:relative!important;width:100%!important;height:100%!important;overflow:hidden!important;border-radius:8px!important;background:#dceeed!important;border:1px solid rgba(7,60,71,.18)!important}
        .qily-card--joker.small-joker .qily-joker-aircraft>img{position:absolute!important;left:50%!important;top:50%!important;width:170%!important;height:170%!important;max-width:none!important;object-fit:cover!important;object-position:50% 50%!important;transform:translate(-50%,-50%)!important}
        .qily-mini-joker.small-joker{display:grid!important;grid-template-rows:42% 38% auto!important;align-items:center!important;justify-items:center!important;gap:2px!important;overflow:hidden!important}
        .qily-mini-joker.small-joker .qily-mini-joker-person{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:100%!important}
        .qily-mini-joker.small-joker .qily-mini-joker-person>img{width:68%!important;height:100%!important;object-fit:contain!important}
        .qily-mini-joker.small-joker .qily-mini-joker-aircraft{display:block!important;position:relative!important;width:92%!important;height:100%!important;overflow:hidden!important;border-radius:6px!important;background:#dceeed!important}
        .qily-mini-joker.small-joker .qily-mini-joker-aircraft>img{position:absolute!important;left:50%!important;top:50%!important;width:175%!important;height:175%!important;max-width:none!important;object-fit:cover!important;object-position:50% 50%!important;transform:translate(-50%,-50%)!important}
        .qily-mini-joker.small-joker>b{font-size:13px!important;line-height:1!important;color:#073c47!important;-webkit-text-fill-color:#073c47!important}

        html body .game-shell .bottom-zone{transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards{min-height:138px!important;transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards>.mini-card{flex:0 0 98px!important;min-width:98px!important;width:98px!important;max-width:98px!important;height:128px!important;min-height:128px!important;max-height:128px!important;margin:4px!important;padding:8px 10px!important;border-radius:13px!important;border-width:2px!important;transform:none!important;zoom:1!important}
        html body .game-shell .bottom-cards>.qily-mini-business b{font-size:23px!important;line-height:1!important}
        html body .game-shell .bottom-cards>.qily-mini-business small{font-size:12px!important;line-height:1.15!important}
        html body .game-shell .bottom-cards>.qily-mini-joker:not(.small-joker)>img{width:62px!important;height:54px!important;object-fit:contain!important}
        html body .game-shell .bottom-cards>.qily-mini-joker>b{font-size:13px!important;line-height:1.1!important}

        /* 所有终端的底部操作提示统一为高对比白字，避免长辈在浅/深背景切换时看不清。 */
        html body .game-shell #hint-message.hint-message{color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important;font-weight:950!important;line-height:1.45!important;text-shadow:0 2px 5px rgba(0,0,0,.55)!important;background:rgba(4,55,65,.52)!important;border-radius:999px!important;padding:4px 14px!important}

        /* 长辈手牌：17张与地主20张分别压缩牌宽、扩大实际露出间距，保证点数+花色完整可见。 */
        @media(min-width:1181px){
          html body .game-shell{width:80vw!important;max-width:80vw!important;min-width:0!important;margin-left:auto!important;margin-right:auto!important;overflow:visible!important}
          html body .game-shell #me-panel.me-player{width:calc(100% - 12px)!important;max-width:none!important;left:6px!important;right:6px!important}
          html body .game-shell #hand.hand{width:100%!important;max-width:100%!important;padding-left:6px!important;padding-right:6px!important;justify-content:center!important;overflow:hidden!important}
          html body .game-shell #hand.hand .card{margin-left:-46px!important;flex-basis:120px!important;width:120px!important;max-width:120px!important}
          html body .game-shell #hand.hand .card:first-child{margin-left:0!important}
          html body .game-shell #hand.hand:has(.card:nth-child(15)) .card{flex-basis:112px!important;width:112px!important;max-width:112px!important;margin-left:-48px!important}
          html body .game-shell #hand.hand:has(.card:nth-child(15)):not(:has(.card:nth-child(18))) .qily-card-corner b{font-size:31px!important;letter-spacing:-.08em!important}
          html body .game-shell #hand.hand:has(.card:nth-child(18)) .card{flex-basis:104px!important;width:104px!important;max-width:104px!important;height:182px!important;margin-left:-50px!important}
          html body .game-shell #hand.hand:has(.card:nth-child(18)) .qily-card-corner b{font-size:28px!important;letter-spacing:-.10em!important}
          html body .game-shell #hint-message.hint-message{font-size:calc(18px * var(--font-scale))!important}
          html body #floatDock.qily-float-dock.qily-float-dock{right:max(28px,2.4vw,env(safe-area-inset-right))!important}
        }

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
  function loadV120(){if(window.__PURE_DDZ_MANAGED_LOADER__)return;if(!document.getElementById('qily-visual-v120-css')){const link=document.createElement('link');link.id='qily-visual-v120-css';link.rel='stylesheet';link.href=runtimeUrl('css/visual-v120.css?v=20260828-elder-v126');document.head.appendChild(link)}if(!document.querySelector('script[data-qily-visual-v120]')){const script=document.createElement('script');script.dataset.qilyVisualV120='1';script.src=runtimeUrl('js/visual-v120.js?v=20260828-elder-v126');script.async=true;document.body.appendChild(script)}}
  window.QilyLeanCardTheme=Object.freeze({getTheme,renderCard,renderMiniCard,ruleRankText,rankThemes:RANK_THEME,suitThemes:SUIT_THEME,jokerThemes:JOKER_THEME,homeAircraft:HOME_AIRCRAFT,runtimeRoot:runtimeRoot.href});installUiStandards();loadV120();
})();
