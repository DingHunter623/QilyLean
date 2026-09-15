(() => {
  'use strict';
  if(window.__qilyDdzFreeChoiceV176)return;
  window.__qilyDdzFreeChoiceV176=true;

  const VERSION='1.7.6';
  let hintActive=false;
  let hintIds=new Set();
  let hintTurnKey='';
  let internal=false;

  const cards=()=>[...document.querySelectorAll('#hand .card[data-id]')];
  const selectedIds=()=>new Set(cards().filter(card=>card.getAttribute('aria-pressed')==='true').map(card=>String(card.dataset.id)));

  function currentTurnKey(){
    try{
      const s=window.PureDDZTest?.getState?.();
      if(!s)return'';
      const hand=(s.hands?.[0]||[]).map(card=>card.id).join(',');
      const last=(s.lastPlay?.cards||[]).map(card=>card.id).join(',');
      return [s.phase,s.current,s.trickNumber,s.passCount,hand,s.lastPlay?.player??'',last].join('|');
    }catch(_error){return'';}
  }

  function syncSelection(desiredInput){
    const desired=new Set([...desiredInput].map(String));
    internal=true;
    try{
      let guard=96;
      while(guard-->0){
        const live=cards();
        const mismatch=live.find(card=>{
          const id=String(card.dataset.id||'');
          const selected=card.getAttribute('aria-pressed')==='true';
          return Boolean(id)&&selected!==desired.has(id);
        });
        if(!mismatch)break;
        mismatch.click();
      }
    }finally{internal=false;}
  }

  function clearSelection(){syncSelection(new Set());}
  function resetHint(){hintActive=false;hintIds.clear();hintTurnKey='';}
  function captureHint(){
    hintIds=selectedIds();
    hintActive=hintIds.size>0;
    hintTurnKey=currentTurnKey();
  }

  /*
   * V176｜玩家最终决定权（不再用定时器抢状态）
   * 1. 启力提示只是默认建议，绝不锁定手牌。
   * 2. 默认单牌 K：玩家点 2 或大王，一次点击直接换成玩家选择。
   * 3. 多牌提示：玩家点新的 K，只追加 K，不清空原组合；因此 777888999 + 3 + 6 + K 可完整选择。
   * 4. 玩家点已抬起的牌，按原生规则取消；之后继续自由增删。
   * 5. “不要”立即清空全部抬起牌。
   * 6. 用牌局 turn-key 判断提示是否仍属于当前回合，避免跨回合残留；不用轮询定时器，防止在玩家点击前误清状态。
   */
  document.addEventListener('click',event=>{
    if(internal)return;

    if(event.target.closest?.('#hint')){
      setTimeout(captureHint,0);
      return;
    }
    if(event.target.closest?.('#pass')){
      setTimeout(clearSelection,0);
      resetHint();
      return;
    }
    if(event.target.closest?.('#play,#start,#again,#welcome-start')){
      resetHint();
      return;
    }

    if(!hintActive)return;
    const card=event.target.closest?.('#hand .card[data-id]');
    if(!card)return;

    const nowKey=currentTurnKey();
    if(hintTurnKey&&nowKey&&hintTurnKey!==nowKey){
      resetHint();
      return;
    }

    const targetId=String(card.dataset.id||'');
    if(!targetId)return;
    const originalHint=new Set(hintIds);
    const targetWasHint=originalHint.has(targetId);
    resetHint();

    if(targetWasHint)return;

    setTimeout(()=>{
      if(originalHint.size<=1){
        syncSelection(new Set([targetId]));
      }else{
        originalHint.add(targetId);
        syncSelection(originalHint);
      }
    },0);
  },false);

  window.QilyLeanDdzFreeChoiceV176=Object.freeze({version:VERSION,captureHint,syncSelection,clearSelection,resetHint,currentTurnKey});
})();
