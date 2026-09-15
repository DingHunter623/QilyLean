(() => {
  'use strict';
  if(window.__qilyDdzFreeChoiceV175)return;
  window.__qilyDdzFreeChoiceV175=true;

  const VERSION='1.7.5';
  let hintActive=false;
  let hintIds=new Set();
  let internal=false;

  const cards=()=>[...document.querySelectorAll('#hand .card[data-id]')];
  const selectedIds=()=>new Set(cards().filter(card=>card.getAttribute('aria-pressed')==='true').map(card=>String(card.dataset.id)));

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
  function resetHint(){hintActive=false;hintIds.clear();}
  function captureHint(){hintIds=selectedIds();hintActive=hintIds.size>0;}

  /*
   * V175｜玩家最终决定权
   * - 启力提示只是一个可直接采用的默认方案，不是锁牌。
   * - 单牌提示（例：默认 K）后，玩家点 2 / 大王：一键替换 K。
   * - 多牌提示（例：飞机主体+带牌）后，玩家点新的 K：把 K 加入现有选择，不把原组合清空。
   * - 玩家点击已经抬起的牌：按普通斗地主交互取消该牌；之后继续自由增删。
   * - “不要”立即清空所有抬起牌。
   *
   * 这里用 document 委托监听，避免 V168 cloneNode 替换 #hint 后丢失监听器。
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

    const targetId=String(card.dataset.id||'');
    if(!targetId)return;
    const originalHint=new Set(hintIds);
    const targetWasHint=originalHint.has(targetId);
    resetHint();

    if(targetWasHint){
      /* 原生 click 已经完成“选中/取消”，完全尊重玩家刚才的动作。 */
      return;
    }

    setTimeout(()=>{
      if(originalHint.size<=1){
        /* 单牌提示最符合长辈直觉：点新的牌就是换牌。 */
        syncSelection(new Set([targetId]));
      }else{
        /* 多牌组合允许继续加牌，例如 777888999 + 3 + 6 后再加 K。 */
        originalHint.add(targetId);
        syncSelection(originalHint);
      }
    },0);
  },false);

  const timer=setInterval(()=>{
    try{
      const state=window.PureDDZTest?.getState?.();
      if(!state||state.phase!=='playing'||state.current!==0)resetHint();
    }catch(_error){}
  },250);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

  window.QilyLeanDdzFreeChoiceV175=Object.freeze({version:VERSION,captureHint,syncSelection,clearSelection,resetHint});
})();
