(() => {
  'use strict';
  if(window.__qilyDdzParentFriendlyV171)return;
  window.__qilyDdzParentFriendlyV171=true;

  const VERSION='1.7.2';
  const STYLE_ID='qilyDdzParentFriendlyV171Style';
  const ROOT=document.documentElement;
  const $=id=>document.getElementById(id);
  let hintSelectionActive=false;
  let internalSelectionChange=false;
  let boardObserver=null;
  let observedBoard=null;

  function escapeHtml(value){
    return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }
  function rankText(rank){return({11:'J',12:'Q',13:'K',14:'A',15:'2',16:'小王',17:'大王'}[rank]||String(rank??''));}
  function selectedHandCards(){return[...document.querySelectorAll('#hand .card[aria-pressed="true"]')];}
  function clearSelectedHand(){
    const selected=selectedHandCards();
    if(!selected.length)return;
    internalSelectionChange=true;
    try{selected.forEach(item=>item.click());}finally{internalSelectionChange=false;}
  }

  /*
   * Parent-first selection contract:
   * 启力提示只能“建议并预选”，绝不能锁定用户的出牌选择。
   * 用户在提示后第一次手动点/拖另一张牌时，立即清掉提示预选，控制权完整交还用户。
   * 用户点击“不要”即代表本轮放弃出牌，任何已抬起的牌必须立即回到原牌位，不能残留到下一轮。
   */
  function bindFreeSelection(){
    const hint=$('hint');
    if(hint&&!hint.dataset.qilyParentV171){
      hint.dataset.qilyParentV171='1';
      hint.addEventListener('click',()=>{
        setTimeout(()=>{hintSelectionActive=selectedHandCards().length>0;},0);
      });
    }

    if(!document.documentElement.dataset.qilyParentSelectionV171){
      document.documentElement.dataset.qilyParentSelectionV171='1';
      document.addEventListener('pointerdown',event=>{
        if(internalSelectionChange||!event.isTrusted||!hintSelectionActive)return;
        const card=event.target.closest?.('#hand .card');
        if(!card)return;
        const targetWasSelected=card.getAttribute('aria-pressed')==='true';
        hintSelectionActive=false;
        if(targetWasSelected)return;
        const others=selectedHandCards().filter(item=>item!==card);
        if(!others.length)return;
        internalSelectionChange=true;
        try{others.forEach(item=>item.click());}finally{internalSelectionChange=false;}
      },true);
    }

    ['play','pass','start','again','welcome-start'].forEach(id=>{
      const node=$(id);if(!node||node.dataset.qilyParentResetV171)return;
      node.dataset.qilyParentResetV171='1';
      node.addEventListener('click',()=>{
        if(id==='pass')clearSelectedHand();
        hintSelectionActive=false;
      },true);
    });
  }

  function cardByIdMap(){
    const map=new Map();
    try{
      const state=window.PureDDZTest?.getState?.();
      (state?.tablePlays||[]).forEach(play=>(play?.cards||[]).forEach(card=>map.set(String(card.id),card)));
    }catch(_error){}
    return map;
  }

  function normalKnowledgeMarkup(card,theme){
    const red=card.suit==='♥'||card.suit==='♦';
    const suitCode=theme?.suit?.code||'';
    return `<span class="ddz-play-knowledge${red?' is-red':''}">
      <b class="ddz-play-rank">${escapeHtml(rankText(card.rank))}${escapeHtml(card.suit)}</b>
      <small>${escapeHtml(suitCode)}</small>
      <strong>${escapeHtml(theme?.code||'')}</strong>
      <em>${escapeHtml(theme?.title||'')}</em>
      <i>${escapeHtml(theme?.skill||'')}</i>
    </span>`;
  }

  function jokerKnowledgeMarkup(card,theme){
    return `<span class="ddz-play-joker ${card.rank===17?'is-big':'is-small'}">
      <b>${escapeHtml(theme?.title||rankText(card.rank))}</b>
      <span class="ddz-play-joker-visual">${theme?.image?`<img src="${escapeHtml(theme.image)}" alt="${escapeHtml(theme?.title||rankText(card.rank))}" draggable="false">`:'★'}</span>
      <small>JOKER</small>
    </span>`;
  }

  function enhancePlayedCards(){
    const board=$('ddz-played-table');
    if(!board||board.hidden)return;
    const themeApi=window.QilyLeanCardTheme;
    if(!themeApi?.getTheme)return;
    const cards=cardByIdMap();
    board.querySelectorAll('.ddz-play-card[data-card-id]').forEach(node=>{
      if(node.dataset.qilyKnowledge==='v171')return;
      const card=cards.get(String(node.dataset.cardId));
      if(!card)return;
      const theme=themeApi.getTheme(card);
      node.innerHTML=card.rank>=16?jokerKnowledgeMarkup(card,theme):normalKnowledgeMarkup(card,theme);
      node.dataset.qilyKnowledge='v171';
      node.setAttribute('aria-label',card.rank>=16?`${rankText(card.rank)}，${theme?.title||'JOKER'}`:`${rankText(card.rank)}${card.suit}，${theme?.code||''}，${theme?.title||''}`);
    });
  }

  function observePlayedBoard(){
    const board=$('ddz-played-table');
    if(!board||board===observedBoard)return;
    boardObserver?.disconnect();
    observedBoard=board;
    if('MutationObserver'in window){
      boardObserver=new MutationObserver(()=>requestAnimationFrame(enhancePlayedCards));
      boardObserver.observe(board,{childList:true,subtree:true});
    }
    enhancePlayedCards();
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* V171｜打出的牌继续使用 QilyLean 官方知识卡数据，不再退化成纯点数白牌。 */
      html body.ddz-site-page #ddz-played-table .ddz-play-card{
        position:relative!important;padding:0!important;align-items:stretch!important;justify-content:stretch!important;
        isolation:isolate!important;overflow:hidden!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge{
        position:absolute;inset:0;display:grid;grid-template-rows:auto auto auto auto minmax(0,1fr);
        align-content:start;justify-items:center;gap:1px;padding:4px 3px 3px;box-sizing:border-box;
        color:#163f47!important;-webkit-text-fill-color:#163f47!important;text-align:center!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge .ddz-play-rank{
        justify-self:start;font-size:var(--played-rank,26px)!important;line-height:.92!important;font-weight:950!important;
        letter-spacing:-.055em!important;white-space:nowrap!important;color:#172f32!important;-webkit-text-fill-color:#172f32!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge.is-red .ddz-play-rank{
        color:#c92533!important;-webkit-text-fill-color:#c92533!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge small{
        font-size:clamp(5px,calc(var(--played-rank,26px) * .26),8px)!important;line-height:1!important;
        color:#71858a!important;-webkit-text-fill-color:#71858a!important;white-space:nowrap!important;overflow:hidden!important;max-width:100%!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge strong{
        font-size:clamp(7px,calc(var(--played-rank,26px) * .42),12px)!important;line-height:1.05!important;font-weight:950!important;
        color:#0f4b5a!important;-webkit-text-fill-color:#0f4b5a!important;max-width:100%!important;overflow-wrap:anywhere!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge em{
        font-style:normal!important;font-size:clamp(6px,calc(var(--played-rank,26px) * .31),9px)!important;line-height:1.05!important;font-weight:850!important;
        color:#173c45!important;-webkit-text-fill-color:#173c45!important;max-width:100%!important;overflow-wrap:anywhere!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-knowledge i{
        align-self:end;font-style:normal!important;font-size:clamp(5px,calc(var(--played-rank,26px) * .22),7px)!important;line-height:1.08!important;
        color:#5e7478!important;-webkit-text-fill-color:#5e7478!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-joker{
        position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;justify-items:center;align-items:center;
        padding:4px 3px;box-sizing:border-box;color:#173c45!important;-webkit-text-fill-color:#173c45!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-joker>b{
        writing-mode:horizontal-tb!important;font-size:clamp(8px,calc(var(--played-rank,26px) * .48),13px)!important;line-height:1!important;
        color:#173c45!important;-webkit-text-fill-color:#173c45!important;letter-spacing:0!important;
      }
      html body.ddz-site-page #ddz-played-table .ddz-play-joker.is-big>b{color:#c92533!important;-webkit-text-fill-color:#c92533!important}
      html body.ddz-site-page #ddz-played-table .ddz-play-joker-visual{display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:0;overflow:hidden}
      html body.ddz-site-page #ddz-played-table .ddz-play-joker-visual>img{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
      html body.ddz-site-page #ddz-played-table .ddz-play-joker>small{font-size:clamp(5px,calc(var(--played-rank,26px) * .23),7px)!important;line-height:1!important;color:#71858a!important;-webkit-text-fill-color:#71858a!important}
      html body.ddz-site-page #ddz-played-table.is-compact .ddz-play-knowledge{padding:2px;gap:0}
      html body.ddz-site-page #ddz-played-table.is-tight .ddz-play-knowledge i,
      html body.ddz-site-page #ddz-played-table.is-tight .ddz-play-knowledge small{display:none!important}
      html body.ddz-site-page #ddz-played-table.is-tight .ddz-play-knowledge{grid-template-rows:auto auto auto;align-content:center}
    `;
    document.head.appendChild(style);
  }

  function install(){
    installStyle();
    bindFreeSelection();
    observePlayedBoard();
    enhancePlayedCards();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  const timer=setInterval(install,260);
  window.addEventListener('pagehide',()=>{clearInterval(timer);boardObserver?.disconnect();},{once:true});

  window.QilyLeanDdzParentFriendlyV171=Object.freeze({version:VERSION,enhancePlayedCards,clearSelectedHand,install});
})();